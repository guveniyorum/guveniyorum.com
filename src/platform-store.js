import { ENV } from './env.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STORAGE_KEY = 'guveniyorum-platform-state-v1';
const AUTH_STORAGE_KEY = 'guveniyorum-auth-session-v1';
const hasSupabase = Boolean(ENV?.supabaseUrl && ENV?.supabaseAnonKey);
const supabase = hasSupabase ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey) : null;

export const profileAvatarPool = [
  { key: 'neon-orbit', label: 'Neon Orbit', emoji: '◎' },
  { key: 'green-pulse', label: 'Green Pulse', emoji: '◉' },
  { key: 'purple-shield', label: 'Purple Shield', emoji: '◆' },
  { key: 'diamond-cat', label: 'Diamond Cat', emoji: '◇' },
  { key: 'cyber-fox', label: 'Cyber Fox', emoji: '✦' },
  { key: 'trust-owl', label: 'Trust Owl', emoji: '◌' },
  { key: 'luna-mask', label: 'Luna Mask', emoji: '◐' },
  { key: 'radar-bot', label: 'Radar Bot', emoji: '⌾' },
  { key: 'mint-dragon', label: 'Mint Dragon', emoji: '△' },
  { key: 'glass-panther', label: 'Glass Panther', emoji: '◈' },
  { key: 'safe-rabbit', label: 'Safe Rabbit', emoji: '○' },
  { key: 'nova-wolf', label: 'Nova Wolf', emoji: '✧' }
];

const initialState = {
  session: { isAuthenticated: false, activeUserId: 'user-demo-admin' },
  profiles: [{ id: 'user-demo-admin', userId: 'user-demo-admin', email: 'admin@guveniyorum.com', displayName: 'Mustafa', nickname: 'Mustafa', avatarKey: 'neon-orbit', bio: '', role: 'admin', level: 7, xp: 1840, points: 425, trustScore: 92, contributionScore: 425, reviewCount: 0, complaintCount: 0, solvedContributionCount: 0, helpfulVotes: 0, onboardingCompleted: true }],
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
function numberValue(value, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function emailPrefix(email = '') { return String(email).split('@')[0]?.trim() || 'Yeni Kullanıcı'; }
function readAuthFallbackUser() { try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null'); } catch { return null; } }
function safeAvatarKey(value) { return profileAvatarPool.some((avatar) => avatar.key === value) ? value : 'neon-orbit'; }
function displayNameForUser(user = {}, email = '') { return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || emailPrefix(email); }
function normalizeProfile(row = {}, fallbackUser = {}) {
  const email = row.email ?? fallbackUser.email ?? '';
  const nickname = String(row.nickname ?? fallbackUser.nickname ?? '').trim();
  const displayName = row.displayName ?? row.display_name ?? displayNameForUser(fallbackUser, email);
  return {
    id: row.id ?? fallbackUser.profileId ?? fallbackUser.id ?? `user-${Date.now()}`,
    userId: row.userId ?? row.user_id ?? fallbackUser.id ?? null,
    email,
    displayName,
    nickname: nickname || null,
    avatarKey: safeAvatarKey(row.avatarKey ?? row.avatar_key ?? fallbackUser.avatarKey),
    bio: String(row.bio ?? fallbackUser.bio ?? ''),
    role: row.role ?? fallbackUser.role ?? 'user',
    level: numberValue(row.level ?? fallbackUser.level, 1),
    xp: numberValue(row.xp ?? fallbackUser.xp, 0),
    points: numberValue(row.points ?? fallbackUser.points, 0),
    wallet: numberValue(row.wallet ?? fallbackUser.wallet, 0),
    trustScore: numberValue(row.trustScore ?? row.trust_score ?? fallbackUser.trustScore, 70),
    contributionScore: numberValue(row.contributionScore ?? row.contribution_score ?? fallbackUser.contributionScore ?? fallbackUser.points, 0),
    reviewCount: numberValue(row.reviewCount ?? row.review_count ?? fallbackUser.reviewCount, 0),
    complaintCount: numberValue(row.complaintCount ?? row.complaint_count ?? fallbackUser.complaintCount, 0),
    solvedContributionCount: numberValue(row.solvedContributionCount ?? row.solved_contribution_count ?? fallbackUser.solvedContributionCount, 0),
    helpfulVotes: numberValue(row.helpfulVotes ?? row.helpful_votes ?? fallbackUser.helpfulVotes, 0),
    lastSeenAt: row.lastSeenAt ?? row.last_seen_at ?? null,
    onboardingCompleted: Boolean(row.onboardingCompleted ?? row.onboarding_completed ?? false),
    localOnly: Boolean(row.localOnly ?? fallbackUser.localOnly)
  };
}
function mapProfile(row) { return normalizeProfile(row); }
function mapBrand(row) { return { id: row.id, name: row.name, slug: row.slug, domain: row.domain, status: row.status, trustScore: row.trust_score, complaintCount: row.complaint_count, solvedCount: row.solved_count, responseTimeHours: row.response_time_hours }; }
function mapComplaint(row) { return { id: row.id, publicId: row.public_id, userId: row.user_id, brandId: row.brand_id, brandName: row.brand_name, title: row.title, category: row.category, description: row.description, status: row.status, evidenceLevel: row.evidence_level, rewardStatus: row.reward_status, createdAt: row.created_at }; }
function warnSupabaseRead(label, error) { console.warn(`Supabase ${label} read failed; using local fallback.`, error?.message || error); }
function warnSupabaseProfile(label, error) { console.warn(`Supabase profile ${label} failed; using local fallback.`, error?.message || error); }
function profileWriteError(message, error) {
  const next = new Error(message);
  next.code = error?.code || 'PROFILE_WRITE_FAILED';
  next.details = error?.details || error?.message || '';
  next.isProfileWriteError = true;
  return next;
}
function profileWriteMessage(error) {
  if (error?.code === '23505') return 'Bu takma ad alınmış olabilir. Lütfen farklı bir takma ad dene.';
  if (error?.code === '42501') return 'Profil kaydedilemedi. Oturum yetkin bu işlem için doğrulanamadı.';
  if (error?.code === '23514') return 'Takma ad 3-24 karakter aralığında olmalı.';
  return error?.message || 'Profil kaydedilemedi. Lütfen bilgileri kontrol edip tekrar dene.';
}
function localProfileFallback(user = readAuthFallbackUser()) {
  const state = loadState();
  const fallbackUser = user || {};
  const hasIdentity = Boolean(fallbackUser.id || fallbackUser.email);
  const existing = state.profiles.find((profile) => (fallbackUser.id && (profile.userId === fallbackUser.id || profile.id === fallbackUser.id)) || (fallbackUser.email && profile.email === fallbackUser.email)) || (!hasIdentity ? state.profiles.find((profile) => profile.id === state.session.activeUserId) : null) || {};
  return normalizeProfile({
    ...existing,
    id: existing.id || fallbackUser.profileId || fallbackUser.id,
    user_id: existing.userId || fallbackUser.id,
    email: existing.email || fallbackUser.email || '',
    display_name: existing.displayName || displayNameForUser(fallbackUser, fallbackUser.email),
    localOnly: true
  }, fallbackUser);
}
function saveProfileToLocalState(profile) {
  const normalized = normalizeProfile(profile, profile);
  const state = loadState();
  state.session.isAuthenticated = true;
  state.session.activeUserId = normalized.id;
  state.profiles = [normalized, ...state.profiles.filter((item) => item.id !== normalized.id && item.email !== normalized.email)];
  saveState(state);
  return normalized;
}
function profilePatch(fields = {}) {
  const patch = { last_seen_at: new Date().toISOString() };
  if ('nickname' in fields) patch.nickname = String(fields.nickname || '').trim() || null;
  if ('avatarKey' in fields || 'avatar_key' in fields) patch.avatar_key = safeAvatarKey(fields.avatarKey ?? fields.avatar_key);
  if ('bio' in fields) patch.bio = String(fields.bio || '');
  if ('onboardingCompleted' in fields || 'onboarding_completed' in fields) patch.onboarding_completed = Boolean(fields.onboardingCompleted ?? fields.onboarding_completed);
  return patch;
}
async function readSupabaseRows(label, query) {
  if (!supabase) return [];
  try {
    const { data, error } = await query();
    if (error) { warnSupabaseRead(label, error); return []; }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    warnSupabaseRead(label, error);
    return [];
  }
}

export async function getCurrentSession() {
  if (!supabase) {
    const user = readAuthFallbackUser();
    return user ? { user, localOnly: true } : null;
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) { warnSupabaseProfile('session read', error); return null; }
    return data?.session || null;
  } catch (error) {
    warnSupabaseProfile('session read', error);
    return null;
  }
}

export async function getCurrentUser(fallbackUser = null) {
  const session = await getCurrentSession();
  return session?.user || fallbackUser || readAuthFallbackUser();
}

export async function fetchOwnProfile(fallbackUser = null, sessionOverride = null) {
  const session = sessionOverride || await getCurrentSession();
  const authUser = session?.localOnly ? null : session?.user;
  if (!supabase || !authUser?.id) {
    const fallback = fallbackUser || session?.user || readAuthFallbackUser();
    const profile = localProfileFallback(fallback);
    return fallback ? saveProfileToLocalState(profile) : profile;
  }
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', authUser.id).maybeSingle();
    if (error) { warnSupabaseProfile('fetch', error); return saveProfileToLocalState(localProfileFallback(authUser)); }
    return data ? saveProfileToLocalState(mapProfile(data)) : null;
  } catch (error) {
    warnSupabaseProfile('fetch', error);
    return saveProfileToLocalState(localProfileFallback(authUser));
  }
}

export async function ensureOwnProfile(fallbackUser = null, sessionOverride = null) {
  const session = sessionOverride || await getCurrentSession();
  const authUser = session?.localOnly ? null : session?.user;
  const user = authUser || fallbackUser || session?.user || readAuthFallbackUser();
  if (!supabase || !authUser?.id) {
    const profile = localProfileFallback(user);
    return user ? saveProfileToLocalState(profile) : profile;
  }
  const existing = await fetchOwnProfile(authUser, session);
  if (existing && !existing.localOnly) return existing;
  const email = authUser.email || fallbackUser?.email || '';
  const payload = {
    user_id: authUser.id,
    email,
    display_name: displayNameForUser(authUser, email),
    nickname: null,
    avatar_key: 'neon-orbit',
    onboarding_completed: false,
    last_seen_at: new Date().toISOString()
  };
  try {
    const { data, error } = await supabase.from('profiles').insert(payload).select('*').single();
    if (error) {
      const retry = await supabase.from('profiles').select('*').eq('user_id', authUser.id).maybeSingle();
      if (!retry.error && retry.data) return saveProfileToLocalState(mapProfile(retry.data));
      warnSupabaseProfile('create', error);
      return saveProfileToLocalState(localProfileFallback(authUser));
    }
    return saveProfileToLocalState(mapProfile(data));
  } catch (error) {
    warnSupabaseProfile('create', error);
    return saveProfileToLocalState(localProfileFallback(authUser));
  }
}

export async function updateOwnProfileProfileFields(fields = {}, fallbackUser = null) {
  const session = await getCurrentSession();
  const authUser = session?.localOnly ? null : session?.user;
  const patch = profilePatch(fields);
  if (supabase) {
    if (!authUser?.id) throw profileWriteError('Profil kaydedilemedi. Oturum yeniden doğrulanmalı.', { code: 'AUTH_SESSION_MISSING' });
    try {
      const ensured = await ensureOwnProfile(authUser);
      if (ensured?.localOnly) throw profileWriteError('Profil kaydedilemedi. Supabase profil satırı doğrulanamadı.', { code: 'PROFILE_ROW_MISSING' });
      const { data, error } = await supabase.from('profiles').update(patch).eq('user_id', authUser.id).select('*').maybeSingle();
      if (error) throw profileWriteError(profileWriteMessage(error), error);
      if (!data) throw profileWriteError('Profil kaydedilemedi. Profil satırı bulunamadı veya RLS tarafından engellendi.', { code: 'PROFILE_UPDATE_EMPTY' });
      return saveProfileToLocalState(mapProfile(data));
    } catch (error) {
      console.warn('Supabase profile update failed.', error?.message || error);
      throw error?.isProfileWriteError ? error : profileWriteError(profileWriteMessage(error), error);
    }
  }
  const fallback = localProfileFallback(authUser || fallbackUser || session?.user);
  return saveProfileToLocalState({
    ...fallback,
    nickname: patch.nickname ?? fallback.nickname,
    avatarKey: patch.avatar_key ?? fallback.avatarKey,
    bio: patch.bio ?? fallback.bio,
    onboardingCompleted: patch.onboarding_completed ?? fallback.onboardingCompleted,
    lastSeenAt: patch.last_seen_at,
    localOnly: true
  });
}

export async function fetchBrandsFromSupabase() {
  return readSupabaseRows('brands', () => supabase.from('brands').select('id,slug,name,category,trust_score,user_experience_score,resolution_rate,avg_response_hours,complaint_count,open_complaint_count,solved_complaint_count,risk_level,trend,status,sponsor_pool,short_insight,admin_note,visible,created_at,updated_at').eq('visible', true).order('trust_score', { ascending: false }));
}

export async function fetchBrandLinksFromSupabase() {
  return readSupabaseRows('brand_links', () => supabase.from('brand_links').select('id,brand_id,website_url,tracking_url,redirect_label,link_status,created_at,updated_at').eq('link_status', 'Aktif'));
}

export async function fetchBrandScoresFromSupabase() {
  return readSupabaseRows('brand_scores', () => supabase.from('brand_scores').select('id,brand_id,score_type,score_value,source,note,created_at').order('created_at', { ascending: false }));
}

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
  profileAvatarPool,
  getCurrentSession,
  getCurrentUser,
  fetchOwnProfile,
  ensureOwnProfile,
  updateOwnProfileProfileFields,
  fetchBrandsFromSupabase,
  fetchBrandLinksFromSupabase,
  fetchBrandScoresFromSupabase,

  async sync() { return hydrateFromSupabase(); },
  getState() { return loadState(); },
  reset() { const state = clone(initialState); saveState(state); return state; },
  currentUser() { const state = loadState(); return normalizeProfile(state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0]); },

  async signIn(email = 'admin@guveniyorum.com') {
    const state = loadState();
    if (supabase) return ensureOwnProfile({ email });
    let profile = state.profiles.find(item => item.email === email);
    if (!profile) { profile = normalizeProfile({ id: `user-${Date.now()}`, email, display_name: emailPrefix(email), role: email.includes('admin') ? 'admin' : 'user', level: 1, xp: 0, points: 0, trust_score: 70, avatar_key: 'neon-orbit' }); state.profiles.push(profile); }
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
