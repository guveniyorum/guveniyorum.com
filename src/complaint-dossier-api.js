import { platformStore } from './platform-store.js';

export const PRIVATE_BUCKET = 'complaint-evidence';
export const PUBLIC_BUCKET = 'complaint-public-evidence';
export const STAFF_ROLES = new Set(['admin', 'moderator']);
export const CLOSED_STATUSES = new Set(['resolved', 'closed', 'rejected']);
export const AVATARS = {
  'neon-orbit': '◎', 'green-pulse': '◉', 'purple-shield': '◆', 'diamond-cat': '◇',
  'cyber-fox': '✦', 'trust-owl': '◌', 'luna-mask': '◐', 'radar-bot': '⌾',
  'mint-dragon': '△', 'glass-panther': '◈', 'safe-rabbit': '○', 'nova-wolf': '✧',
};
const LABELS = {
  submitted: 'Gönderildi', pending: 'Beklemede', pending_review: 'İncelemede', in_review: 'İncelemede',
  brand_waiting: 'Marka Yanıtı Bekleniyor', user_action: 'Kullanıcı Yanıtı Bekleniyor',
  resolution_offered: 'Çözüm Sunuldu', resolved: 'Çözüldü', closed: 'Kapandı', rejected: 'Reddedildi',
  approved: 'Onaylandı', solved: 'Çözüldü', need_evidence: 'Ek Kanıt Bekleniyor', in_resolution: 'Çözüm Sürecinde',
};

let identityCache = { at: 0, session: null, role: null };
let feedCache = { at: 0, rows: [] };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}
export function statusLabel(value) { return LABELS[value] || value || 'Gönderildi'; }
export function currentPath() { return location.pathname.replace(/\/+$/, '') || '/'; }
export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}
export function formatBytes(value = 0) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function publicUrl(path, bucket = PUBLIC_BUCKET) {
  if (!path || !platformStore.supabase) return '';
  return platformStore.supabase.storage.from(bucket).getPublicUrl(path).data?.publicUrl || '';
}
export function resetDossierCaches() {
  identityCache = { at: 0, session: null, role: null };
  feedCache = { at: 0, rows: [] };
}
export async function identity(force = false) {
  if (!force && Date.now() - identityCache.at < 10000) return identityCache;
  const session = await platformStore.getCurrentSession().catch(() => null);
  let role = null;
  if (session?.user?.id && !session.localOnly && platformStore.supabase) {
    const result = await platformStore.supabase.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle();
    if (!result.error) role = result.data?.role || null;
  }
  identityCache = { at: Date.now(), session, role };
  return identityCache;
}
export async function publicFeed(brandName = null, force = false) {
  if (!brandName && !force && Date.now() - feedCache.at < 15000) return feedCache.rows;
  if (!platformStore.supabase) return [];
  const result = await platformStore.supabase.rpc('get_public_complaint_feed', { p_brand_name: brandName || null, p_limit: 50, p_offset: 0 });
  if (result.error) throw result.error;
  const rows = result.data || [];
  if (!brandName) feedCache = { at: Date.now(), rows };
  return rows;
}
export async function publicStats() {
  if (!platformStore.supabase) return null;
  const result = await platformStore.supabase.rpc('get_public_complaint_stats');
  return result.error ? null : result.data || null;
}
export async function brandCases(brandName) {
  const who = await identity();
  if (who.session?.user?.id && !who.session.localOnly && ['admin', 'moderator', 'brand'].includes(who.role)) {
    let query = platformStore.supabase
      .from('complaints')
      .select('id,public_id,brand_name,category,title,description,status,priority,created_at,updated_at,public_visibility,public_summary,published_at')
      .order('created_at', { ascending: false }).limit(100);
    if (brandName) query = query.ilike('brand_name', brandName);
    const result = await query;
    if (!result.error) return { mode: 'private', rows: result.data || [] };
  }
  return { mode: 'public', rows: await publicFeed(brandName, true) };
}
async function directDossier(publicId) {
  const who = await identity();
  if (!who.session?.user?.id || who.session.localOnly || !platformStore.supabase) return null;
  const complaintResult = await platformStore.supabase
    .from('complaints')
    .select('id,public_id,user_id,brand_id,brand_name,category,title,description,status,priority,requested_solution,created_at,updated_at,closed_at,public_visibility,public_summary,resolution_summary,published_at')
    .eq('public_id', publicId).maybeSingle();
  if (complaintResult.error || !complaintResult.data) return null;
  const complaint = complaintResult.data;
  const [profileResult, attachmentResult, historyResult] = await Promise.all([
    platformStore.supabase.from('profiles').select('nickname,avatar_key,trust_score,contribution_score,complaint_count,created_at').eq('user_id', complaint.user_id).maybeSingle(),
    platformStore.supabase.from('complaint_attachments').select('id,file_path,file_name,file_size,mime_type,media_kind,moderation_status,created_at').eq('complaint_id', complaint.id).order('created_at', { ascending: true }),
    platformStore.supabase.from('complaint_status_history').select('to_status,actor_role,note,created_at').eq('complaint_id', complaint.id).order('created_at', { ascending: true }),
  ]);
  const attachments = await Promise.all((attachmentResult.error ? [] : attachmentResult.data || []).map(async (item) => {
    const signed = await platformStore.supabase.storage.from(PRIVATE_BUCKET).createSignedUrl(item.file_path, 300);
    return { ...item, url: signed.error ? '' : signed.data?.signedUrl || '' };
  }));
  return {
    access: 'private', case: { ...complaint, summary: complaint.description },
    author: profileResult.error || !profileResult.data ? { nickname: 'Takma adlı kullanıcı', avatar_key: 'neon-orbit' } : profileResult.data,
    attachments, history: historyResult.error ? [] : historyResult.data || [],
  };
}
async function publicDossier(publicId) {
  if (!platformStore.supabase) return null;
  const result = await platformStore.supabase.rpc('get_public_complaint_dossier', { p_public_id: publicId });
  if (result.error || !result.data) return null;
  const data = result.data;
  return {
    access: 'public', case: data.case, author: data.author || {}, history: data.history || [],
    attachments: (data.attachments || []).map((item) => ({
      ...item,
      url: publicUrl(item.public_file_path, item.storage_bucket || PRIVATE_BUCKET),
    })),
  };
}
export async function loadDossier(publicId) { return await directDossier(publicId) || await publicDossier(publicId); }
export { platformStore };
