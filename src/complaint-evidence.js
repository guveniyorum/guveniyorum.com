import { platformStore } from './platform-store.js';

const DIAMOND_STORAGE_KEY = 'guveniyorum-diamond-state-v2';
const BUCKET = 'complaint-evidence';
const MAX_FILES = 5;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm,.mov';

let selectedEvidence = [];
let uploadInProgress = false;
let lastMountedForm = null;

function safeJson(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaKind(mimeType = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

function evidenceTypeLabel(kind) {
  if (kind === 'video') return 'Video kaydı';
  if (kind === 'document') return 'Belge / PDF';
  return 'Ekran görüntüsü';
}

function validateFile(file) {
  if (!(file instanceof File)) return 'Geçersiz dosya.';
  if (!ACCEPTED_TYPES.has(file.type)) return `${file.name}: desteklenmeyen dosya türü.`;
  const limit = file.type.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_DOCUMENT_BYTES;
  if (file.size > limit) {
    return `${file.name}: ${file.type.startsWith('video/') ? 'video 50 MB' : 'dosya 10 MB'} sınırını aşıyor.`;
  }
  return '';
}

function sanitizeFilename(name = 'evidence') {
  const cleaned = String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || `evidence-${Date.now()}`;
}

function toast(message, tone = 'success') {
  document.querySelector('[data-evidence-toast]')?.remove();
  const node = document.createElement('div');
  node.dataset.evidenceToast = '';
  node.className = `evidenceToast ${tone === 'error' ? 'error' : ''}`;
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 4500);
}

function ensureStyles() {
  if (document.getElementById('complaint-evidence-style')) return;
  const style = document.createElement('style');
  style.id = 'complaint-evidence-style';
  style.textContent = `
    .evidenceField{margin:4px 0 14px;padding:14px;border:1px solid rgba(178,204,255,.14);border-radius:18px;background:linear-gradient(145deg,rgba(13,24,41,.82),rgba(7,15,27,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
    .evidenceHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}.evidenceHead b{display:block;color:#eef7ff}.evidenceHead small{display:block;color:#91a4bc;line-height:1.45;margin-top:3px}.evidenceCount{font-size:11px;font-weight:900;color:#bfffd5;border:1px solid rgba(37,240,132,.25);background:rgba(37,240,132,.09);padding:6px 8px;border-radius:999px;white-space:nowrap}
    .evidenceDrop{display:grid;place-items:center;min-height:118px;padding:18px;border:1px dashed rgba(138,255,181,.35);border-radius:16px;background:radial-gradient(circle at 50% 0,rgba(37,240,132,.10),transparent 58%),rgba(255,255,255,.025);text-align:center;cursor:pointer;transition:.2s ease}.evidenceDrop:hover,.evidenceDrop.dragover{transform:translateY(-1px);border-color:rgba(37,240,132,.72);background:radial-gradient(circle at 50% 0,rgba(37,240,132,.18),transparent 62%),rgba(255,255,255,.04)}.evidenceDropIcon{font-size:24px;margin-bottom:7px}.evidenceDrop b{color:#effff5}.evidenceDrop span{display:block;color:#8fa3ba;font-size:12px;margin-top:4px}.evidenceDrop input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
    .evidenceError{margin-top:10px;padding:9px 11px;border:1px solid rgba(255,77,109,.25);border-radius:12px;background:rgba(255,77,109,.08);color:#ffc2cb;font-size:12px;line-height:1.45}
    .evidenceList{display:grid;gap:8px;margin-top:10px}.evidenceItem{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;padding:9px;border:1px solid rgba(178,204,255,.12);border-radius:13px;background:rgba(255,255,255,.035)}.evidencePreview{width:42px;height:42px;border-radius:10px;display:grid;place-items:center;background:#0a1626;color:#bfffd5;overflow:hidden;font-size:18px}.evidencePreview img,.evidencePreview video{width:100%;height:100%;object-fit:cover}.evidenceMeta b{display:block;color:#eaf4ff;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px}.evidenceMeta small{color:#8498b0}.evidenceRemove{border:0;background:transparent;color:#aab8c8;font-size:17px;cursor:pointer;padding:7px}.evidenceRemove:hover{color:#ff8da1}
    .evidenceProgress{height:3px;background:rgba(255,255,255,.07);border-radius:999px;overflow:hidden;margin-top:6px}.evidenceProgress>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#25f084,#22d3ee);transition:width .25s ease}.evidenceItem.uploading .evidenceProgress>i{width:55%}.evidenceItem.uploaded .evidenceProgress>i{width:100%}.evidenceItem.failed .evidenceProgress>i{width:100%;background:#ff4d6d}
    .complaintEvidenceChip{display:inline-flex;align-items:center;gap:5px;margin-left:6px;padding:5px 8px;border-radius:999px;border:1px solid rgba(34,211,238,.24);background:rgba(34,211,238,.08);color:#c9f7ff;font-size:11px;font-weight:900}
    .evidenceToast{position:fixed;right:18px;bottom:18px;z-index:10001;max-width:min(420px,calc(100vw - 36px));padding:12px 15px;border:1px solid rgba(37,240,132,.34);border-radius:14px;background:rgba(8,19,33,.97);color:#d9ffe7;box-shadow:0 18px 60px rgba(0,0,0,.35);font-weight:850}.evidenceToast.error{border-color:rgba(255,77,109,.34);color:#ffc2cb}
    @media(max-width:640px){.evidenceHead{display:block}.evidenceCount{display:inline-block;margin-top:8px}.evidenceMeta b{max-width:170px}}
  `;
  document.head.appendChild(style);
}

function revokePreview(item) {
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function resetSelection() {
  selectedEvidence.forEach(revokePreview);
  selectedEvidence = [];
}

function renderEvidenceList(root) {
  if (!root) return;
  const list = root.querySelector('[data-evidence-list]');
  const count = root.querySelector('[data-evidence-count]');
  const error = root.querySelector('[data-evidence-error]');
  if (count) count.textContent = `${selectedEvidence.length}/${MAX_FILES}`;
  if (error) error.hidden = true;
  if (!list) return;
  list.innerHTML = selectedEvidence.map((item, index) => {
    const kind = mediaKind(item.file.type);
    const preview = kind === 'image'
      ? `<img src="${escapeHtml(item.previewUrl)}" alt="">`
      : kind === 'video'
        ? `<video src="${escapeHtml(item.previewUrl)}" muted playsinline></video>`
        : 'PDF';
    return `
      <div class="evidenceItem ${escapeHtml(item.status || '')}" data-evidence-item="${index}">
        <div class="evidencePreview">${preview}</div>
        <div class="evidenceMeta">
          <b title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</b>
          <small>${evidenceTypeLabel(kind)} · ${formatBytes(item.file.size)}${item.status === 'failed' ? ' · Yüklenemedi' : ''}</small>
          <div class="evidenceProgress"><i></i></div>
        </div>
        <button type="button" class="evidenceRemove" data-remove-evidence="${index}" aria-label="Dosyayı kaldır">×</button>
      </div>`;
  }).join('');
}

function showFieldError(root, message) {
  const error = root?.querySelector('[data-evidence-error]');
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
}

function addFiles(files, root) {
  const incoming = Array.from(files || []);
  if (!incoming.length) return;
  const errors = [];
  for (const file of incoming) {
    if (selectedEvidence.length >= MAX_FILES) {
      errors.push(`En fazla ${MAX_FILES} kanıt ekleyebilirsin.`);
      break;
    }
    const validationError = validateFile(file);
    if (validationError) {
      errors.push(validationError);
      continue;
    }
    const duplicate = selectedEvidence.some((item) => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified);
    if (duplicate) continue;
    selectedEvidence.push({ file, previewUrl: URL.createObjectURL(file), status: 'queued' });
  }
  renderEvidenceList(root);
  if (errors.length) showFieldError(root, errors.join(' '));
}

function uploaderMarkup() {
  return `
    <section class="evidenceField" data-evidence-root>
      <div class="evidenceHead">
        <div><b>Kanıt Ekle</b><small>Ekran görüntüsü, dekont, PDF veya kısa video ekleyebilirsin. Dosyalar yalnızca yetkili taraflara görünür.</small></div>
        <span class="evidenceCount" data-evidence-count>0/${MAX_FILES}</span>
      </div>
      <label class="evidenceDrop" data-evidence-drop>
        <input type="file" data-evidence-input accept="${ACCEPTED_EXTENSIONS}" multiple>
        <span class="evidenceDropIcon">⬆</span>
        <b>Dosyaları sürükle veya seç</b>
        <span>Görsel/PDF 10 MB · Video 50 MB · En fazla ${MAX_FILES} dosya</span>
      </label>
      <div class="evidenceError" data-evidence-error hidden></div>
      <div class="evidenceList" data-evidence-list></div>
    </section>`;
}

function mountUploader() {
  ensureStyles();
  const form = document.querySelector('form[data-complaint-form]');
  if (!form || form === lastMountedForm || form.querySelector('[data-evidence-root]')) return;
  const submit = form.querySelector('button[type="submit"]');
  if (!submit) return;
  submit.insertAdjacentHTML('beforebegin', uploaderMarkup());
  const root = form.querySelector('[data-evidence-root]');
  renderEvidenceList(root);
  lastMountedForm = form;
}

function readDiamondState() {
  return safeJson(localStorage.getItem(DIAMOND_STORAGE_KEY), null);
}

function writeDiamondState(state) {
  localStorage.setItem(DIAMOND_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('gi:state', { detail: state }));
}

function complaintIds(state) {
  return new Set((state?.complaints || []).map((complaint) => complaint.id));
}

function findCreatedComplaint(beforeIds, formSnapshot) {
  const state = readDiamondState();
  const complaints = state?.complaints || [];
  return complaints.find((complaint) => !beforeIds.has(complaint.id))
    || complaints.find((complaint) => complaint.title === formSnapshot.title && complaint.details === formSnapshot.details)
    || complaints[0]
    || null;
}

function persistAttachmentCount(complaintId, uploads) {
  const state = readDiamondState();
  if (!state?.complaints?.length) return;
  const complaint = state.complaints.find((item) => item.id === complaintId);
  if (!complaint) return;
  complaint.evidenceCount = uploads.length;
  complaint.evidence = uploads.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    fileSize: item.fileSize,
    mimeType: item.mimeType,
    mediaKind: item.mediaKind,
    createdAt: item.createdAt,
  }));
  writeDiamondState(state);
}

function decorateComplaintCards() {
  const state = readDiamondState();
  if (!state?.complaints?.length) return;
  document.querySelectorAll('article.complaint').forEach((card) => {
    const meta = card.querySelector('.complaintHead small')?.textContent || '';
    const complaint = state.complaints.find((item) => meta.includes(item.id));
    if (!complaint?.evidenceCount || card.querySelector('[data-evidence-chip]')) return;
    const target = card.querySelector('.complaintFoot span') || card.querySelector('.complaintFoot') || card;
    target.insertAdjacentHTML('beforeend', `<span class="complaintEvidenceChip" data-evidence-chip>📎 ${complaint.evidenceCount} kanıt</span>`);
  });
}

async function uploadOne(item, userId, complaintId) {
  const file = item.file;
  const kind = mediaKind(file.type);
  const unique = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const filePath = `${userId}/${complaintId}/${unique}-${sanitizeFilename(file.name)}`;
  const storage = platformStore.supabase.storage.from(BUCKET);
  const uploaded = await storage.upload(filePath, file, { contentType: file.type, upsert: false, cacheControl: '3600' });
  if (uploaded.error) throw uploaded.error;

  const payload = {
    user_id: userId,
    local_complaint_id: complaintId,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    media_kind: kind,
    evidence_type: kind === 'image' ? 'screenshot' : kind === 'video' ? 'video_record' : 'document',
    upload_status: 'uploaded',
    scan_status: 'pending',
    moderation_status: 'pending',
  };
  const inserted = await platformStore.supabase.from('complaint_attachments').insert(payload).select('id,file_name,file_size,mime_type,media_kind,created_at').single();
  if (inserted.error) {
    await storage.remove([filePath]);
    throw inserted.error;
  }
  return {
    id: inserted.data.id,
    fileName: inserted.data.file_name,
    fileSize: inserted.data.file_size,
    mimeType: inserted.data.mime_type,
    mediaKind: inserted.data.media_kind,
    createdAt: inserted.data.created_at,
  };
}

async function uploadEvidence(files, complaintId) {
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) {
    throw new Error('Kanıt yüklemek için giriş yapmalısın.');
  }
  const successes = [];
  const failures = [];
  for (const item of files) {
    item.status = 'uploading';
    renderEvidenceList(document.querySelector('[data-evidence-root]'));
    try {
      const result = await uploadOne(item, session.user.id, complaintId);
      item.status = 'uploaded';
      successes.push(result);
    } catch (error) {
      item.status = 'failed';
      failures.push({ fileName: item.file.name, error: error?.message || 'Yükleme başarısız.' });
    }
    renderEvidenceList(document.querySelector('[data-evidence-root]'));
  }
  return { successes, failures };
}

async function handleComplaintSubmit(event) {
  const form = event.target.closest?.('form[data-complaint-form]');
  if (!form || uploadInProgress) return;
  const files = [...selectedEvidence];
  if (!files.length) return;

  const before = readDiamondState();
  const beforeIds = complaintIds(before);
  const data = new FormData(form);
  const snapshot = { title: String(data.get('title') || '').trim(), details: String(data.get('details') || '').trim() };

  setTimeout(async () => {
    const complaint = findCreatedComplaint(beforeIds, snapshot);
    if (!complaint) {
      toast('Şikayet oluşturuldu ancak kanıtlar dosyayla eşleştirilemedi.', 'error');
      return;
    }
    uploadInProgress = true;
    try {
      const { successes, failures } = await uploadEvidence(files, complaint.id);
      if (successes.length) persistAttachmentCount(complaint.id, successes);
      if (successes.length && !failures.length) {
        toast(`Şikayet ve ${successes.length} kanıt güvenli biçimde kaydedildi.`);
      } else if (successes.length) {
        toast(`Şikayet kaydedildi. ${successes.length} kanıt yüklendi, ${failures.length} dosya yüklenemedi.`, 'error');
      } else {
        toast(failures[0]?.error || 'Şikayet kaydedildi ancak kanıtlar yüklenemedi.', 'error');
      }
      decorateComplaintCards();
    } catch (error) {
      toast(error?.message || 'Şikayet kaydedildi ancak kanıtlar yüklenemedi.', 'error');
    } finally {
      uploadInProgress = false;
      resetSelection();
      renderEvidenceList(document.querySelector('[data-evidence-root]'));
      mountUploader();
    }
  }, 80);
}

function bindEvents() {
  document.addEventListener('change', (event) => {
    const input = event.target.closest?.('[data-evidence-input]');
    if (!input) return;
    const root = input.closest('[data-evidence-root]');
    addFiles(input.files, root);
    input.value = '';
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-remove-evidence]');
    if (!button) return;
    const index = Number(button.dataset.removeEvidence);
    if (!Number.isInteger(index) || !selectedEvidence[index]) return;
    revokePreview(selectedEvidence[index]);
    selectedEvidence.splice(index, 1);
    renderEvidenceList(button.closest('[data-evidence-root]'));
  });

  document.addEventListener('dragover', (event) => {
    const drop = event.target.closest?.('[data-evidence-drop]');
    if (!drop) return;
    event.preventDefault();
    drop.classList.add('dragover');
  });

  document.addEventListener('dragleave', (event) => {
    event.target.closest?.('[data-evidence-drop]')?.classList.remove('dragover');
  });

  document.addEventListener('drop', (event) => {
    const drop = event.target.closest?.('[data-evidence-drop]');
    if (!drop) return;
    event.preventDefault();
    drop.classList.remove('dragover');
    addFiles(event.dataTransfer?.files, drop.closest('[data-evidence-root]'));
  });

  document.addEventListener('submit', handleComplaintSubmit, true);
}

ensureStyles();
bindEvents();
mountUploader();
decorateComplaintCards();

new MutationObserver(() => {
  requestAnimationFrame(() => {
    mountUploader();
    decorateComplaintCards();
  });
}).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
