import { ENV } from './env.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STORAGE_KEY = 'guveniyorum-platform-state-v1';
const hasSupabase = Boolean(ENV?.supabaseUrl && ENV?.supabaseAnonKey);
const supabase = hasSupabase ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey) : null;

const initialState = {
  session: { isAuthenticated: false, activeUserId: 'user-demo-admin' },
  profiles: [{ id: 'user-demo-admin', email: 'admin@guveniyorum.com', displayName: 'Mustafa', role: 'admin', level: 7, xp: 1840, points: 425, trustScore: 92 }],
  brands: [
    { id: 'brand-safe', name: 'SafeMark', slug: 'safemark', domain: 'safemark.example', status: 'trusted', trustScore: 98, complaintCount: 12, solvedCount: 10, responseTimeHours: 2 },
    { id: 'brand-guven', name: 'GüvenMark', slug: 'guvenmark', domain: 'guvenmark.example', status: 'under_review', trustScore: 88, complaintCount: 18, solvedCount: 13, responseTimeHours: 5 },
    { id: 'brand-risk', name: 'RiskMark', slug: 'riskmark', domain: 'riskmark.example', status: 'high_risk', trustScore: 52, complaintCount: 89, solvedCount: 31, responseTimeHours: 36 }
  ],
  complaints: [{ id: 'cmp-1', publicId: 'GVN-2026-0001', userId: 'user-demo-admin', brandId: 'brand-guven', brandName: 'GüvenMark', title: 'İşlem gecikmesi bildirimi', category: 'Ödeme gecikmesi', description: 'Kullanıcı işleminin geciktiğini bildirdi.', status: 'pending_review', evidenceLevel: 'medium', rewardStatus: 'pending', createdAt: new Date().toISOString() }],
  pointTransactions: [{ id: 'pt-1', userId: 'user-demo-admin', sourceType: 'seed', sourceId: 'cmp-1', points: 25, xp: 80, status: 'approved', reason: 'İlk doğrulanmış katkı' }],
  notifications: [{ id: 'ntf-1', userId: 'user-demo-admin', title: 'Dosyan incelemede', body: 'GVN-2026-0001 moderasyon kuyruğuna alındı.', read: false }],
  psychologyResults: [],
  adminActions: []
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...clone(initialState), ...JSON.parse(raw) } : clone(initialState); } catch { return clone(initialState); } }
function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); window.dispatchEvent(new CustomEvent('gi:state', { detail: state })); }
function publicId(state) { return `GVN-${new Date().getFullYear()}-${String(state.complaints.length + 1).padStart(4, '0')}`; }
function mapProfile(row) { return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, level: row.level, xp: row.xp, points: row.points, trustScore: row.trust_score }; }
function mapBrand(row) { return { id: row.id, name: row.name, slug: row.slug, domain: row.domain, status: row.status, trustScore: row.trust_score, complaintCount: row.complaint_count, solvedCount: row.solved_count, responseTimeHours: row.response_time_hours }; }
function mapComplaint(row) { return { id: row.id, publicId: row.public_id, userId: row.user_id, brandId: row.brand_id, brandName: row.brand_name, title: row.title, category: row.category, description: row.description, status: row.status, evidenceLevel: row.evidence_level, rewardStatus: row.reward_status, createdAt: row.created_at }; }

async function hydrateFromSupabase() {
  if (!supabase) return loadState();
  const state = loadState();
  const [profilesRes, brandsRes, complaintsRes, pointsRes, notificationsRes, testsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('brands').select('*').order('trust_score', { ascending: false }).limit(50),
    supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('point_transactions').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('psychology_test_results').select('*').order('created_at', { ascending: false }).limit(50)
  ]);
  if (!profilesRes.error && profilesRes.data?.length) state.profiles = profilesRes.data.map(mapProfile);
  if (!brandsRes.error && brandsRes.data?.length) state.brands = brandsRes.data.map(mapBrand);
  if (!complaintsRes.error && complaintsRes.data?.length) state.complaints = complaintsRes.data.map(mapComplaint);
  if (!pointsRes.error && pointsRes.data) state.pointTransactions = pointsRes.data.map(row => ({ id: row.id, userId: row.user_id, sourceType: row.source_type, sourceId: row.source_id, points: row.points, xp: row.xp, status: row.status, reason: row.reason }));
  if (!notificationsRes.error && notificationsRes.data) state.notifications = notificationsRes.data.map(row => ({ id: row.id, userId: row.user_id, title: row.title, body: row.body, read: Boolean(row.read_at) }));
  if (!testsRes.error && testsRes.data) state.psychologyResults = testsRes.data.map(row => ({ id: row.id, userId: row.user_id, score: row.score, riskLevel: row.risk_level, recommendations: row.recommendations, createdAt: row.created_at }));
  if (!state.session.activeUserId && state.profiles[0]) state.session.activeUserId = state.profiles[0].id;
  saveState(state);
  return state;
}

export const platformStore = {
  supabase,
  hasSupabase,

  async sync() { return hydrateFromSupabase(); },
  getState() { return loadState(); },
  reset() { const state = clone(initialState); saveState(state); return state; },
  currentUser() { const state = loadState(); return state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0]; },

  async signIn(email = 'admin@guveniyorum.com') {
    const state = loadState();
    if (supabase) {
      const existing = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
      let row = existing.data;
      if (!row) {
        const created = await supabase.from('profiles').insert({ email, display_name: email.split('@')[0], role: email.includes('admin') ? 'admin' : 'user' }).select().single();
        row = created.data;
      }
      if (row) {
        const profile = mapProfile(row);
        state.session.isAuthenticated = true;
        state.session.activeUserId = profile.id;
        state.profiles = [profile, ...state.profiles.filter(item => item.id !== profile.id)];
        saveState(state);
        return profile;
      }
    }
    let profile = state.profiles.find(item => item.email === email);
    if (!profile) { profile = { id: `user-${Date.now()}`, email, displayName: email.split('@')[0], role: 'user', level: 1, xp: 0, points: 0, trustScore: 70 }; state.profiles.push(profile); }
    state.session.isAuthenticated = true;
    state.session.activeUserId = profile.id;
    saveState(state);
    return profile;
  },

  async createComplaint(payload = {}) {
    const state = loadState();
    const user = state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0];
    const brand = state.brands.find(item => item.id === payload.brandId || item.name === payload.brandName) || null;
    if (supabase) {
      const created = await supabase.from('complaints').insert({
        public_id: '',
        user_id: user?.id || null,
        brand_id: brand?.id || null,
        brand_name: brand?.name || payload.brandName || 'Yeni Marka',
        title: payload.title || 'Yeni şikayet bildirimi',
        category: payload.category || 'Genel bildirim',
        description: payload.description || 'Kullanıcı açıklaması bekleniyor.',
        amount: payload.amount || null,
        payment_method: payload.paymentMethod || null,
        requested_solution: payload.requestedSolution || null,
        status: 'pending_review',
        evidence_level: payload.evidenceLevel || 'low',
        reward_status: 'pending'
      }).select().single();
      if (!created.error && created.data) {
        const complaint = mapComplaint(created.data);
        state.complaints.unshift(complaint);
        saveState(state);
        return complaint;
      }
      console.warn('Supabase complaint insert failed, falling back local:', created.error);
    }
    const complaint = { id: `cmp-${Date.now()}`, publicId: publicId(state), userId: user.id, brandId: brand?.id || null, brandName: brand?.name || payload.brandName || 'Yeni Marka', title: payload.title || 'Yeni şikayet bildirimi', category: payload.category || 'Genel bildirim', description: payload.description || 'Kullanıcı açıklaması bekleniyor.', amount: payload.amount || null, paymentMethod: payload.paymentMethod || null, status: 'pending_review', evidenceLevel: payload.evidenceLevel || 'low', rewardStatus: 'pending', createdAt: new Date().toISOString() };
    state.complaints.unshift(complaint);
    state.notifications.unshift({ id: `ntf-${Date.now()}`, userId: user.id, title: 'Şikayetin onaya sunuldu', body: `${complaint.publicId} dosyası admin moderasyon kuyruğuna alındı.`, read: false });
    saveState(state);
    return complaint;
  },

  async approveComplaint(complaintId) {
    const state = loadState();
    const complaint = state.complaints.find(item => item.id === complaintId || item.publicId === complaintId);
    if (!complaint) return null;
    if (supabase) {
      await supabase.from('complaints').update({ status: 'approved', reward_status: 'approved' }).eq('id', complaint.id);
      await supabase.from('point_transactions').insert({ user_id: complaint.userId, source_type: 'complaint', source_id: complaint.id, points: 25, xp: 80, status: 'approved', reason: `${complaint.publicId} onaylandı` });
      await supabase.from('notifications').insert({ user_id: complaint.userId, title: 'Şikayetin onaylandı', body: `${complaint.publicId} onaylandı. +25 puan ve +80 XP profil hesabına işlendi.` });
    }
    complaint.status = 'approved';
    complaint.rewardStatus = 'approved';
    const user = state.profiles.find(profile => profile.id === complaint.userId);
    if (user) { user.xp += 80; user.points += 25; user.level = Math.max(1, Math.floor(user.xp / 1000) + 1); }
    state.pointTransactions.unshift({ id: `pt-${Date.now()}`, userId: complaint.userId, sourceType: 'complaint', sourceId: complaint.id, points: 25, xp: 80, status: 'approved', reason: `${complaint.publicId} onaylandı` });
    saveState(state);
    return complaint;
  },

  async rejectComplaint(complaintId, note = 'Kanıt seviyesi yetersiz.') {
    const state = loadState();
    const complaint = state.complaints.find(item => item.id === complaintId || item.publicId === complaintId);
    if (!complaint) return null;
    if (supabase) {
      await supabase.from('complaints').update({ status: 'rejected', reward_status: 'rejected', admin_note: note }).eq('id', complaint.id);
      await supabase.from('notifications').insert({ user_id: complaint.userId, title: 'Şikayet için ek bilgi gerekli', body: `${complaint.publicId}: ${note}` });
    }
    complaint.status = 'rejected';
    complaint.rewardStatus = 'rejected';
    complaint.adminNote = note;
    saveState(state);
    return complaint;
  },

  async submitPsychologyTest(score, answers = {}) {
    const state = loadState();
    const user = state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0];
    const riskLevel = score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low';
    const recommendations = riskLevel === 'high' ? ['Limitleri düşür', '24 saat mola ver', 'Wellness desteği al'] : ['Haftalık kontrol yap', 'Bütçe sınırını takip et'];
    if (supabase) {
      await supabase.from('psychology_test_results').insert({ user_id: user.id, score, risk_level: riskLevel, answers, recommendations });
      await supabase.from('point_transactions').insert({ user_id: user.id, source_type: 'psychology_test', points: 10, xp: 35, status: 'approved', reason: 'Psikoloji testi tamamlandı' });
    }
    const result = { id: `psy-${Date.now()}`, userId: user.id, score, riskLevel, answers, recommendations, createdAt: new Date().toISOString() };
    state.psychologyResults.unshift(result);
    user.xp += 35;
    user.points += 10;
    saveState(state);
    return result;
  }
};

window.platformStore = platformStore;
window.dispatchEvent(new CustomEvent('gi:store-ready', { detail: { hasSupabase } }));
platformStore.sync().catch(error => console.warn('Platform store sync failed:', error));
