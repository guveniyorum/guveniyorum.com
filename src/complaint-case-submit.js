import { platformStore } from './platform-store.js';

const DIAMOND_KEY = 'guveniyorum-diamond-state-v2';
const BUCKET = 'complaint-evidence';
const MAX_FILES = 5;
const MAX_DOC_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ACCEPTED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

let files = [];
let busy = false;

function safeJson(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function readState() {
  return safeJson(localStorage.getItem(DIAMOND_KEY), null);
}

function writeState(state) {
  localStorage.setItem(DIAMOND_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('gi:state', { detail: state }));
}

function toast(message, error = false) {
  document.querySelector('[data-case-submit-toast]')?.remove();
  const node = document.createElement('div');
  node.dataset.caseSubmitToast = '';
  node.textContent = message;
  node.style.cssText = `position:fixed;right:18px;bottom:18px;z-index:15000;max-width:min(460px,calc(100vw - 36px));padding:13px 15px;border:1px solid ${error ? 'rgba(255,77,109,.38)' : 'rgba(37,240,132,.36)'};border-radius:14px;background:rgba(8,19,33,.98);color:${error ? '#ffc2cb' : '#d9ffe7'};box-shadow:0 18px 60px rgba(0,0,0,.38);font:850 13px/1.45 Inter,system-ui,sans-serif`;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 5500);
}

function validFile(file) {
  const limit = String(file?.type || '').startsWith('video/') ? MAX_VIDEO_BYTES : MAX_DOC_BYTES;
  return file instanceof File && ACCEPTED.has(file.type) && file.size <= limit;
}

function capture(incoming) {
  for (const file of Array.from(incoming || [])) {
    if (files.length >= MAX_FILES) break;
    if (!validFile(file)) continue;
    const duplicate = files.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified);
    if (!duplicate) files.push(file);
  }
}

function sanitize(name = 'evidence') {
  const cleaned = String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || `evidence-${Date.now()}`;
}

function kind(mime = '') {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
}

function setProgress(index, status) {
  const node = document.querySelector(`[data-evidence-item="${index}"]`);
  if (!node) return;
  node.classList.remove('queued', 'uploading', 'uploaded', 'failed');
  node.classList.add(status);
}

async function getSession() {
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) {
    throw new Error('Şikayet dosyası oluşturmak için giriş yapmalısın.');
  }
  return session;
}

async function resolveBrand(name) {
  const result = await platformStore.supabase
    .from('brands')
    .select('id,name')
    .ilike('name', name)
    .limit(1)
    .maybeSingle();
  return result.error || !result.data ? { id: null, name } : result.data;
}

async function createCase(formData, caseId) {
  const brandName = String(formData.get('brand') || '').trim() || 'Bilinmeyen Marka';
  const category = String(formData.get('category') || '').trim() || 'Genel bildirim';
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('details') || '').trim();
  const requestedSolution = String(formData.get('requestedSolution') || '').trim() || null;
  if (title.length < 4) throw new Error('Başlık en az 4 karakter olmalı.');
  if (description.length < 12) throw new Error('Şikayet detayını en az 12 karakterle açıklamalısın.');

  const brand = await resolveBrand(brandName);
  const result = await platformStore.supabase.rpc('create_complaint_case', {
    p_case_id: caseId,
    p_brand_id: brand.id,
    p_brand_name: brand.name || brandName,
    p_category: category,
    p_title: title,
    p_description: description,
    p_requested_solution: requestedSolution,
  });
  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row?.id || !row?.public_id) throw new Error('Merkezi şikayet dosyası oluşturulamadı.');
  return row;
}

async function uploadFiles(session, complaint) {
  const successes = [];
  const failures = [];
  for (const [index, file] of files.entries()) {
    setProgress(index, 'uploading');
    const unique = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const filePath = `${session.user.id}/${complaint.public_id}/${unique}-${sanitize(file.name)}`;
    const storage = platformStore.supabase.storage.from(BUCKET);
    try {
      const uploaded = await storage.upload(filePath, file, { contentType: file.type, upsert: false, cacheControl: '3600' });
      if (uploaded.error) throw uploaded.error;
      const mediaKind = kind(file.type);
      const inserted = await platformStore.supabase.from('complaint_attachments').insert({
        user_id: session.user.id,
        complaint_id: complaint.id,
        local_complaint_id: complaint.public_id,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        media_kind: mediaKind,
        evidence_type: mediaKind === 'image' ? 'screenshot' : mediaKind === 'video' ? 'video_record' : 'document',
        upload_status: 'uploaded',
        scan_status: 'pending',
        moderation_status: 'pending',
      }).select('id,file_name,file_size,mime_type,media_kind,created_at').single();
      if (inserted.error) {
        await storage.remove([filePath]);
        throw inserted.error;
      }
      successes.push({
        id: inserted.data.id,
        fileName: inserted.data.file_name,
        fileSize: inserted.data.file_size,
        mimeType: inserted.data.mime_type,
        mediaKind: inserted.data.media_kind,
        createdAt: inserted.data.created_at,
      });
      setProgress(index, 'uploaded');
    } catch (uploadError) {
      failures.push({ fileName: file.name, error: uploadError?.message || 'Yükleme başarısız.' });
      setProgress(index, 'failed');
    }
  }
  return { successes, failures };
}

function mirror(complaint, uploads) {
  const state = readState() || {};
  state.complaints = Array.isArray(state.complaints) ? state.complaints : [];
  state.complaintRewards = state.complaintRewards || {};
  state.activityLog = Array.isArray(state.activityLog) ? state.activityLog : [];
  state.feed = Array.isArray(state.feed) ? state.feed : [];
  const local = {
    id: complaint.public_id,
    serverId: complaint.id,
    brandId: complaint.brand_id || null,
    brand: complaint.brand_name || 'Bilinmeyen Marka',
    category: complaint.category || 'Genel bildirim',
    title: complaint.title,
    details: complaint.description,
    status: 'Gönderildi',
    centralStatus: complaint.status,
    priority: complaint.priority || 'normal',
    central: true,
    evidenceCount: uploads.length,
    evidence: uploads,
    createdAt: complaint.created_at,
    updatedAt: complaint.updated_at || complaint.created_at,
  };
  state.complaints = [local, ...state.complaints.filter((item) => item.serverId !== complaint.id && item.id !== complaint.public_id)];
  if (!state.complaintRewards[complaint.public_id]?.created) {
    state.points = Number(state.points || 0) + 40;
    state.contribution = Math.min(100, Number(state.contribution || 0) + 2);
    state.complaintRewards[complaint.public_id] = { ...(state.complaintRewards[complaint.public_id] || {}), created: true };
    state.activityLog.unshift({ id: `complaint_create:${complaint.id}`, type: 'complaint_create', refId: complaint.id, label: `${complaint.public_id} şikayet oluşturuldu`, points: 40, contribution: 2, createdAt: complaint.created_at });
    state.feed.unshift(`${complaint.public_id} merkezi şikayet dosyası açıldı · +40 puan`);
  }
  writeState(state);
}

async function submit(event) {
  const form = event.target.closest?.('form[data-complaint-form]');
  if (!form) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (busy) return;

  const button = form.querySelector('button[type="submit"]');
  const original = button?.textContent || '';
  const caseId = crypto.randomUUID?.();
  if (!caseId) { toast('Güvenli dosya kimliği oluşturulamadı.', true); return; }
  busy = true;
  if (button) { button.disabled = true; button.textContent = 'Merkezi dosya oluşturuluyor…'; }

  try {
    const session = await getSession();
    const complaint = await createCase(new FormData(form), caseId);
    if (button && files.length) button.textContent = `Kanıtlar yükleniyor · ${files.length} dosya`;
    const { successes, failures } = files.length ? await uploadFiles(session, complaint) : { successes: [], failures: [] };
    mirror(complaint, successes);
    form.reset();
    files = [];
    if (successes.length && !failures.length) toast(`${complaint.public_id} oluşturuldu; ${successes.length} kanıt bağlandı.`);
    else if (successes.length) toast(`${complaint.public_id} oluşturuldu. ${successes.length} kanıt yüklendi, ${failures.length} dosya yüklenemedi.`, true);
    else if (failures.length) toast(`${complaint.public_id} oluşturuldu ancak kanıt yüklenemedi: ${failures[0].error}`, true);
    else toast(`${complaint.public_id} numaralı şikayet dosyan oluşturuldu.`);
    setTimeout(() => location.reload(), 900);
  } catch (error) {
    toast(error?.message || 'Şikayet dosyası oluşturulamadı.', true);
  } finally {
    busy = false;
    if (button) { button.disabled = false; button.textContent = original; }
  }
}

document.addEventListener('change', (event) => {
  const input = event.target.closest?.('[data-evidence-input]');
  if (input) capture(input.files);
}, true);

document.addEventListener('drop', (event) => {
  if (event.target.closest?.('[data-evidence-drop]')) capture(event.dataTransfer?.files);
}, true);

document.addEventListener('click', (event) => {
  const remove = event.target.closest?.('[data-remove-evidence]');
  if (!remove) return;
  const index = Number(remove.dataset.removeEvidence);
  if (Number.isInteger(index)) files.splice(index, 1);
}, true);

document.addEventListener('submit', submit, true);