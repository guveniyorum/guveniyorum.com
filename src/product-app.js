const STORAGE_KEY = 'guveniyorum-diamond-state-v2';
const LEGACY_STORAGE_KEY = 'guveniyorum-diamond-state-v1';
const AUTH_STORAGE_KEY = 'guveniyorum-auth-session-v1';
const PROFILE_AVATAR_GLYPHS = {
  'neon-orbit': '◎', 'green-pulse': '◉', 'purple-shield': '◆', 'diamond-cat': '◇',
  'cyber-fox': '✦', 'trust-owl': '◌', 'luna-mask': '◐', 'radar-bot': '⌾',
  'mint-dragon': '△', 'glass-panther': '◈', 'safe-rabbit': '○', 'nova-wolf': '✧',
};

const complaintBaseStats = {
  resolved: 1246,
  reviewed: 86,
  bestResolution: '%98',
};

const initialComplaints = [
  {
    id: 'GVN-2026-0001',
    brand: 'BetSafe',
    category: 'Para çekme',
    title: 'Ödeme gecikmesi çözüldü',
    details: 'Kullanıcı ödeme talebinin tamamlandığını doğruladı.',
    status: 'Çözüldü',
    createdAt: '2026-06-26T09:30:00.000Z',
    updatedAt: '2026-06-26T12:18:00.000Z',
  },
  {
    id: 'GVN-2026-0002',
    brand: 'TürkBahis',
    category: 'KYC / belge',
    title: 'Belge onayı bekliyor',
    details: 'Kullanıcı ek belge talebine yanıt verdi, marka onayı bekleniyor.',
    status: 'Açık',
    createdAt: '2026-06-27T08:20:00.000Z',
    updatedAt: '2026-06-27T08:20:00.000Z',
  },
  {
    id: 'GVN-2026-0003',
    brand: 'KaçınBet',
    category: 'Destek kalitesi',
    title: 'Destekten dönüş alınamadı',
    details: 'Canlı destek görüşmesi sonrası çözüm yanıtı henüz gelmedi.',
    status: 'Açık',
    createdAt: '2026-06-28T17:45:00.000Z',
    updatedAt: '2026-06-28T17:45:00.000Z',
  },
];

const seedBrandDirectory = [
  ['betsafe', 'BetSafe', 'Spor & Casino', 98, 4.8, 98, 2.8, 12, 1, 11, 'Düşük Risk', '+12%', ['Diamond Trust', 'Hızlı Yanıt'], 'Yayında', '₺120K', 'Çözüm performansı güçlü'],
  ['meritroyal', 'MeritRoyal', 'Casino', 96, 4.7, 94, 3.4, 16, 2, 14, 'Düşük Risk', '+9%', ['Premium', 'Stabil'], 'Yayında', '₺95K', 'Kullanıcı deneyimi yükselişte'],
  ['royalwin', 'RoyalWin', 'Spor', 94, 4.6, 92, 4.1, 19, 3, 16, 'İzleniyor', '+7%', ['Hızlı Destek'], 'Yayında', '₺88K', 'Yanıt süresi izleniyor'],
  ['turkbahis', 'TürkBahis', 'Spor & Casino', 95, 4.6, 95, 4, 12, 1, 11, 'Düşük Risk', '+18%', ['KYC Hızlı', 'Canlı Destek'], 'Yayında', '₺70K', 'Çözüm performansı güçlü'],
  ['grandbet', 'GrandBet', 'Spor', 91, 4.4, 88, 5.2, 24, 4, 20, 'İzleniyor', '+4%', ['Takipte'], 'Yayında', '₺64K', 'Yanıt bekleyen dosya var'],
  ['primeplay', 'PrimePlay', 'Casino', 93, 4.5, 90, 3.8, 18, 2, 16, 'Düşük Risk', '+8%', ['Premium'], 'Yayında', '₺76K', 'Stabil görünüm'],
  ['megabahis', 'MegaBahis', 'Spor', 87, 4.1, 82, 7.2, 36, 7, 29, 'İzleniyor', '-2%', ['İzleniyor'], 'Yayında', '₺40K', 'Risk görünürlüğü arttı'],
  ['casinomax', 'CasinoMax', 'Casino', 89, 4.2, 84, 6.4, 31, 5, 26, 'İzleniyor', '+1%', ['Canlı Destek'], 'Yayında', '₺48K', 'Yanıt süresi izleniyor'],
  ['betroyal', 'BetRoyal', 'Spor & Casino', 92, 4.5, 89, 4.5, 21, 3, 18, 'Düşük Risk', '+6%', ['Stabil'], 'Yayında', '₺58K', 'Stabil görünüm'],
  ['winarena', 'WinArena', 'Spor', 86, 4, 80, 8, 42, 8, 34, 'İzleniyor', '-4%', ['Takipte'], 'Yayında', '₺35K', 'Risk görünürlüğü arttı'],
  ['novabet', 'NovaBet', 'Spor', 90, 4.3, 86, 5.8, 27, 4, 23, 'İzleniyor', '+5%', ['Yükselen'], 'Yayında', '₺52K', 'Kullanıcı deneyimi yükselişte'],
  ['goldenplay', 'GoldenPlay', 'Casino', 88, 4.2, 83, 6.1, 29, 5, 24, 'İzleniyor', '+3%', ['Stabil'], 'Yayında', '₺45K', 'Yanıt bekleyen dosya var'],
  ['starbahis', 'StarBahis', 'Spor', 84, 3.9, 78, 8.8, 48, 10, 38, 'Yüksek Risk', '-7%', ['İncelemede'], 'İncelemede', '₺28K', 'Risk görünürlüğü arttı'],
  ['elitebet', 'EliteBet', 'Casino', 91, 4.4, 88, 4.9, 22, 3, 19, 'Düşük Risk', '+6%', ['Premium'], 'Yayında', '₺62K', 'Çözüm performansı güçlü'],
  ['bahisplus', 'BahisPlus', 'Spor', 85, 4, 79, 7.9, 39, 8, 31, 'İzleniyor', '-1%', ['Takipte'], 'Yayında', '₺34K', 'Yanıt süresi izleniyor'],
  ['royalbet', 'RoyalBet', 'Spor & Casino', 89, 4.2, 85, 5.6, 30, 5, 25, 'İzleniyor', '+2%', ['Stabil'], 'Yayında', '₺44K', 'Stabil görünüm'],
  ['jetcasino', 'JetCasino', 'Casino', 90, 4.3, 87, 4.7, 25, 4, 21, 'Düşük Risk', '+5%', ['Hızlı Yanıt'], 'Yayında', '₺50K', 'Kullanıcı deneyimi yükselişte'],
  ['luckyzone', 'LuckyZone', 'Casino', 83, 3.8, 76, 9.5, 52, 12, 40, 'Yüksek Risk', '-8%', ['İncelemede'], 'İncelemede', '₺22K', 'Risk görünürlüğü arttı'],
  ['grandroyal', 'GrandRoyal', 'Spor & Casino', 92, 4.5, 90, 4.2, 20, 3, 17, 'Düşük Risk', '+7%', ['Premium'], 'Yayında', '₺66K', 'Çözüm performansı güçlü'],
  ['apexbet', 'ApexBet', 'Spor', 87, 4.1, 81, 7, 35, 7, 28, 'İzleniyor', '+1%', ['Takipte'], 'Yayında', '₺38K', 'Yanıt bekleyen dosya var'],
  ['betline', 'BetLine', 'Spor', 86, 4, 80, 7.5, 37, 7, 30, 'İzleniyor', '+2%', ['Stabil'], 'Yayında', '₺36K', 'Yanıt süresi izleniyor'],
  ['maxwin', 'MaxWin', 'Casino', 88, 4.2, 84, 5.9, 28, 5, 23, 'İzleniyor', '+3%', ['Canlı Destek'], 'Yayında', '₺42K', 'Stabil görünüm'],
  ['kingarena', 'KingArena', 'Spor', 82, 3.7, 74, 10.2, 56, 14, 42, 'Yüksek Risk', '-9%', ['İncelemede'], 'İncelemede', '₺20K', 'Risk görünürlüğü arttı'],
  ['safeplay', 'SafePlay', 'Spor & Casino', 97, 4.8, 96, 3.1, 14, 1, 13, 'Düşük Risk', '+10%', ['Diamond Trust'], 'Yayında', '₺92K', 'Çözüm performansı güçlü'],
].map(([id, name, category, trustScore, userExperienceScore, resolutionRate, avgResponseHours, complaintCount, openComplaintCount, solvedComplaintCount, riskLevel, trend, badges, status, sponsorPool, shortInsight]) => ({
  id, name, category, trustScore, userExperienceScore, resolutionRate, avgResponseHours, complaintCount, openComplaintCount, solvedComplaintCount, riskLevel, trend, badges, status, sponsorPool, shortInsight,
  adminNote: '', visible: status !== 'Gizli', slug: id, badge: badges[0], score: trustScore, ux: userExperienceScore, users: `${Math.max(12, Math.round(trustScore * 1.2))}K`, complaints: complaintCount,
  resolution: resolutionRate, response: `${avgResponseHours}s`, pool: sponsorPool, kind: riskLevel === 'Yüksek Risk' ? 'risk' : 'safe', tags: badges,
}));

const initialState = {
  route: normalize(location.pathname),
  sidebarOpen: false,
  search: '',
  activeFilter: 'all',
  points: 1247,
  wallet: 920,
  level: 'Uzman',
  contribution: 89,
  riskScore: 25,
  toast: '',
  complaints: initialComplaints.map((complaint) => ({ ...complaint })),
  activityLog: [],
  claimedMissions: {},
  rewardClaims: {},
  complaintRewards: {},
  brandSignals: {},
  brandDirectory: seedBrandDirectory.map((brand) => ({ ...brand, badges: [...brand.badges], tags: [...brand.tags] })),
  adminBrandDraft: {},
  selectedAdminBrand: 'betsafe',
  brandAdminFeed: [],
  feed: [
    'BetSafe ödeme gecikmesi çözüldü · +75 puan',
    'AyşeK çözüm onayı verdi · ödül uygunluğu yükseldi',
    'TürkBahis yanıt süresini 4 saate düşürdü',
  ],
  brandOpsSelection: 'BetSafe',
  brandOpsActionDraft: 'response_posted',
  brandOpsNoteDraft: '',
  brandOpsComplaintDraft: '',
  aiMessages: [
    { role: 'ai', text: 'Kontrol sende. Güven skoru, şikayet çözümü, risk sinyali ve ödül uygunluğunu birlikte okuyabilirim.' },
  ],
};

const saved = readStore();
const state = { ...initialState, ...saved, route: normalize(location.pathname) };
state.complaints = normalizeComplaints(state.complaints);
state.activityLog = Array.isArray(state.activityLog) ? state.activityLog : [];
state.claimedMissions = normalizeMap(state.claimedMissions);
state.rewardClaims = normalizeMap(state.rewardClaims);
state.complaintRewards = normalizeMap(state.complaintRewards);
state.brandSignals = normalizeMap(state.brandSignals);
state.brandDirectory = normalizeBrandDirectory(state.brandDirectory);
state.adminBrandDraft = normalizeMap(state.adminBrandDraft);
state.selectedAdminBrand = state.brandDirectory.some((brand) => brand.id === state.selectedAdminBrand) ? state.selectedAdminBrand : state.brandDirectory[0].id;
state.brandAdminFeed = Array.isArray(state.brandAdminFeed) ? state.brandAdminFeed : [];
state.feed = Array.isArray(state.feed) ? state.feed : initialState.feed;
state.brandOpsSelection = typeof state.brandOpsSelection === 'string' ? state.brandOpsSelection : initialState.brandOpsSelection;
state.brandOpsActionDraft = typeof state.brandOpsActionDraft === 'string' ? state.brandOpsActionDraft : initialState.brandOpsActionDraft;
state.brandOpsNoteDraft = typeof state.brandOpsNoteDraft === 'string' ? state.brandOpsNoteDraft : initialState.brandOpsNoteDraft;
state.brandOpsComplaintDraft = typeof state.brandOpsComplaintDraft === 'string' ? state.brandOpsComplaintDraft : initialState.brandOpsComplaintDraft;

const brands = state.brandDirectory;
refreshBrandSignals();

const missions = [
  { key: 'daily', title: 'Günlük güven kontrolü', desc: '3 site kartını incele, güven sinyallerini karşılaştır.', points: 5 },
  { key: 'review', title: 'Doğrulanmış yorum yaz', desc: 'Gerçek deneyimini kanıt ve tarih bağlamıyla paylaş.', points: 15 },
  { key: 'complaint', title: 'Kanıtlı şikayet oluştur', desc: 'Marka, kategori ve beklenen çözümle dosya aç.', points: 40 },
  { key: 'resolution', title: 'Çözüm onayı ver', desc: 'Sorun çözüldüyse süreci kapat ve marka skoruna katkı ver.', points: 75 },
];

const menu = [
  ['/', '✓', 'Ana Sayfa', ''],
  ['/marka-ligi', '🏆', 'Site Ligi', 'HOT'],
  ['/sikayetler', '⚠', 'Şikayet Ağı', '347'],
  ['/puanlama-motoru', '◆', 'Puanlama Motoru', 'LIVE'],
  ['/firma-rekabeti', '⚔', 'Firma Rekabeti', ''],
  ['/kara-liste', '▲', 'Kara Liste', 'ALARM'],
  ['/sorumlu-kullanim', '♡', 'Sorumlu Oyun', 'ÖNEMLİ'],
  ['/kullanici-psikolojisi', '🧠', 'Oyuncu Psikolojisi', ''],
  ['/wellness-merkezi', '✣', 'Wellness Merkezi', 'PRO'],
  ['/topluluk-merkezi', '✳', 'Topluluk Merkezi', '12K'],
  ['/ai-danisman', '◇', 'AI Danışman', 'AI'],
  ['/sertifikasyon', '♜', 'Sertifikasyon', ''],
  ['/marka-yonetimi', '▤', 'Marka Yönetimi', 'B2B'],
];

function normalize(path) {
  const clean = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  const aliases = {
    '/site-ligi': '/marka-ligi',
    '/profil/puanlarim': '/puanlama-motoru',
    '/puan-merkezi': '/puanlama-motoru',
    '/odul-merkezi': '/puanlama-motoru',
    '/complaints': '/sikayetler',
    '/sikayet-et': '/sikayetler',
    '/responsible-gaming': '/sorumlu-kullanim',
  };
  return aliases[clean] || clean;
}

function readStore() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);
    return JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function readAuthSession() {
  try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null'); } catch { return null; }
}

function saveStore() {
  refreshBrandSignals();
  const snapshot = {
    points: state.points,
    wallet: state.wallet,
    level: state.level,
    contribution: state.contribution,
    riskScore: state.riskScore,
    complaints: state.complaints,
    activityLog: state.activityLog,
    claimedMissions: state.claimedMissions,
    rewardClaims: state.rewardClaims,
    complaintRewards: state.complaintRewards,
    brandSignals: state.brandSignals,
    brandDirectory: state.brandDirectory,
    adminBrandDraft: state.adminBrandDraft,
    selectedAdminBrand: state.selectedAdminBrand,
    brandAdminFeed: state.brandAdminFeed,
    feed: state.feed,
    brandOpsSelection: state.brandOpsSelection,
    brandOpsActionDraft: state.brandOpsActionDraft,
    brandOpsNoteDraft: state.brandOpsNoteDraft,
    brandOpsComplaintDraft: state.brandOpsComplaintDraft,
    aiMessages: state.aiMessages,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function money(value) { return new Intl.NumberFormat('tr-TR').format(value); }
function root() { return document.getElementById('root'); }
function avatarInitial(user) {
  const profile = user?.profile || user || {};
  return escapeHtml(PROFILE_AVATAR_GLYPHS[profile.avatarKey] || (profile.nickname || profile.displayName || profile.email || 'Ü').trim().slice(0, 1).toLocaleUpperCase('tr-TR') || 'Ü');
}
function normalizeMap(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function normalizeComplaints(value) {
  const source = Array.isArray(value) ? value : initialComplaints;
  return source.map((complaint, index) => ({ ...(initialComplaints[index] || {}), ...complaint }));
}
function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function slugify(value) { return String(value || 'brand').toLocaleLowerCase('tr-TR').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `brand-${Date.now()}`; }
function normalizeBadges(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}
function normalizeBrand(brand, fallback = {}) {
  const badges = normalizeBadges(brand.badges || brand.tags || brand.badge || fallback.badges || fallback.tags || fallback.badge || 'Stabil');
  const trustScore = clamp(brand.trustScore ?? brand.score ?? fallback.trustScore ?? fallback.score ?? 80);
  const resolutionRate = clamp(brand.resolutionRate ?? brand.resolution ?? fallback.resolutionRate ?? fallback.resolution ?? 80);
  const avgResponseHours = Math.max(0, Number(brand.avgResponseHours ?? parseFloat(brand.response) ?? fallback.avgResponseHours ?? 6) || 0);
  const riskLevel = brand.riskLevel || fallback.riskLevel || (trustScore < 84 ? 'Yüksek Risk' : trustScore < 90 ? 'İzleniyor' : 'Düşük Risk');
  return {
    ...fallback,
    ...brand,
    id: brand.id || fallback.id || slugify(brand.name || fallback.name),
    name: brand.name || fallback.name || 'Yeni Marka',
    category: brand.category || fallback.category || 'Spor & Casino',
    trustScore,
    userExperienceScore: Number(brand.userExperienceScore ?? brand.ux ?? fallback.userExperienceScore ?? fallback.ux ?? 4.2),
    resolutionRate,
    avgResponseHours,
    complaintCount: Number(brand.complaintCount ?? brand.complaints ?? fallback.complaintCount ?? fallback.complaints ?? 0),
    openComplaintCount: Number(brand.openComplaintCount ?? fallback.openComplaintCount ?? 0),
    solvedComplaintCount: Number(brand.solvedComplaintCount ?? fallback.solvedComplaintCount ?? 0),
    riskLevel,
    trend: brand.trend || fallback.trend || '+0%',
    badges,
    status: brand.status || fallback.status || 'Yayında',
    sponsorPool: brand.sponsorPool || brand.pool || fallback.sponsorPool || fallback.pool || '₺0',
    shortInsight: brand.shortInsight || fallback.shortInsight || 'Stabil görünüm',
    adminNote: brand.adminNote || fallback.adminNote || '',
    websiteUrl: brand.websiteUrl ?? fallback.websiteUrl ?? '',
    trackingUrl: brand.trackingUrl ?? fallback.trackingUrl ?? '',
    redirectLabel: brand.redirectLabel || fallback.redirectLabel || 'Siteyi İncele',
    linkStatus: brand.linkStatus || fallback.linkStatus || 'Pasif',
    visible: brand.visible !== false && brand.status !== 'Gizli',
    slug: brand.slug || fallback.slug || brand.id || fallback.id || slugify(brand.name || fallback.name),
    badge: badges[0] || 'Stabil',
    score: trustScore,
    ux: Number(brand.userExperienceScore ?? brand.ux ?? fallback.userExperienceScore ?? fallback.ux ?? 4.2),
    users: brand.users || fallback.users || `${Math.max(12, Math.round(trustScore * 1.2))}K`,
    complaints: Number(brand.complaintCount ?? brand.complaints ?? fallback.complaintCount ?? fallback.complaints ?? 0),
    resolution: resolutionRate,
    response: `${avgResponseHours}s`,
    pool: brand.sponsorPool || brand.pool || fallback.sponsorPool || fallback.pool || '₺0',
    kind: riskLevel === 'Yüksek Risk' ? 'risk' : riskLevel === 'İzleniyor' ? 'safe watch' : 'safe',
    tags: badges,
  };
}
function normalizeBrandDirectory(value) {
  const source = Array.isArray(value) && value.length ? value : seedBrandDirectory;
  const merged = [...source];
  seedBrandDirectory.forEach((seed) => {
    if (!merged.some((brand) => brand.id === seed.id || brand.name === seed.name)) merged.push(seed);
  });
  return merged.map((brand) => normalizeBrand(brand, seedBrandDirectory.find((seed) => seed.id === brand.id || seed.name === brand.name)));
}
function isSolved(complaint) { return complaint.status === 'Çözüldü'; }
function setLevelFromPoints() {
  if (state.points >= 2000) state.level = 'Diamond';
  else if (state.points >= 1300) state.level = 'Elite';
  else if (state.points >= 1000) state.level = 'Uzman';
  else if (state.points >= 500) state.level = 'Aktif';
  else state.level = 'Yeni Üye';
}
function boostContribution(amount) { state.contribution = Math.min(100, state.contribution + amount); }
function todayKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function activityId(type, refId) { return `ACT-${type}-${refId}-${Date.now()}`; }
function hasActivity(type, refId) { return state.activityLog.some((activity) => activity.type === type && activity.refId === refId); }
function addFeed(text, persist = true) {
  state.feed = [text, ...state.feed].slice(0, 8);
  if (persist) saveStore();
}
function applyEconomyReward({ type, refId, label, points = 0, wallet = 0, contribution = 1, feed }) {
  if (hasActivity(type, refId)) return false;
  state.points += points;
  state.wallet += wallet;
  if (points || wallet) boostContribution(contribution);
  setLevelFromPoints();
  state.activityLog = [{
    id: activityId(type, refId),
    type,
    refId,
    label,
    points,
    wallet,
    createdAt: new Date().toISOString(),
  }, ...state.activityLog].slice(0, 60);
  if (feed) addFeed(feed, false);
  return true;
}
function markComplaintReward(complaintId, key) {
  state.complaintRewards[complaintId] = { ...(state.complaintRewards[complaintId] || {}), [key]: true };
}
function complaintRewarded(complaintId, key, type) {
  return Boolean(state.complaintRewards[complaintId]?.[key]) || hasActivity(type, complaintId);
}

function installStyles() {
  if (document.getElementById('diamond-style')) return;
  const style = document.createElement('style');
  style.id = 'diamond-style';
  style.textContent = `
    :root{--bg:#07111f;--side:#07101d;--panel:#0d1829;--panel2:#111d31;--line:rgba(178,204,255,.14);--text:#eef7ff;--muted:#94a8bd;--green:#25f084;--green2:#8affb5;--purple:#8b3dff;--red:#ff4d6d;--amber:#f8b84e;--radius:20px;--shadow:0 24px 80px rgba(0,0,0,.34)}
    *{box-sizing:border-box}html,body,#root{min-height:100%}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;letter-spacing:-.025em;overflow:hidden}a{color:inherit;text-decoration:none}button,input,select,textarea{font:inherit}button{cursor:pointer}
    .app{height:100vh;display:grid;grid-template-columns:204px minmax(0,1fr);overflow:hidden;background:radial-gradient(900px 540px at 74% 0,rgba(37,240,132,.14),transparent 62%),radial-gradient(760px 500px at 46% 28%,rgba(139,61,255,.13),transparent 60%),linear-gradient(180deg,#07111f,#091424)}
    .sidebar{height:100vh;background:linear-gradient(180deg,#07101d,#081120 58%,#050a13);border-right:1px solid var(--line);padding:16px 10px;overflow:auto;z-index:5}.brand{display:flex;align-items:center;gap:10px;margin:0 0 20px}.logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,var(--green),#14b8a6);box-shadow:0 0 28px rgba(37,240,132,.34);color:#06120b;font-weight:950}.brand b{display:block;font-size:14px}.brand small{color:var(--green2);font-size:10px}.nav{display:grid;gap:4px}.nav a{display:grid;grid-template-columns:20px 1fr auto;gap:8px;align-items:center;min-height:38px;padding:9px 10px;border:1px solid transparent;border-radius:11px;color:#b9c7d9;font-size:12px;line-height:1.25}.nav a.active,.nav a:hover{background:rgba(37,240,132,.11);border-color:rgba(37,240,132,.28);color:#fff}.badge{border-radius:999px;padding:2px 6px;font-size:9px;font-weight:900;background:rgba(37,240,132,.14);color:#86ffb2;border:1px solid rgba(37,240,132,.24)}.badge.red{background:rgba(255,77,109,.17);color:#ffa0ad}.badge.purple{background:rgba(139,61,255,.19);color:#d9c8ff}.sidecard{margin-top:20px;border:1px solid var(--line);background:rgba(255,255,255,.03);border-radius:14px;padding:12px;color:var(--muted);font-size:11px}.sidecard div{display:flex;justify-content:space-between;margin:7px 0}.sidecard strong{color:var(--green2)}
    .main{height:100vh;min-width:0;display:grid;grid-template-rows:56px minmax(0,1fr);overflow:hidden}.topbar{height:56px;background:rgba(7,13,23,.90);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;padding:0 16px}.hamb{display:none}.search{width:min(520px,48vw);height:36px;background:#0d1828;border:1px solid rgba(178,204,255,.18);border-radius:10px;color:#dfeaff;padding:0 14px;outline:none}.topspacer{flex:1}.iconbtn,.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:11px;background:rgba(255,255,255,.045);color:#fff;padding:10px 14px;font-size:12px;font-weight:900;min-height:36px}.iconbtn{width:32px;height:32px;padding:0}.btn.green{background:linear-gradient(135deg,var(--green),#16a34a);color:#04120b;border-color:rgba(37,240,132,.56);box-shadow:0 0 34px rgba(37,240,132,.18)}.btn.purple{background:linear-gradient(135deg,var(--purple),#9333ea);border-color:rgba(147,51,234,.55)}.btn.red{background:linear-gradient(135deg,#be123c,#e11d48);border-color:rgba(255,77,109,.55)}
    .scroll{height:calc(100vh - 56px);overflow:auto;scroll-behavior:smooth;overscroll-behavior:contain}.scroll::-webkit-scrollbar,.sidebar::-webkit-scrollbar{width:10px}.scroll::-webkit-scrollbar-thumb,.sidebar::-webkit-scrollbar-thumb{background:rgba(148,163,184,.22);border-radius:99px}.section{padding:72px 24px}.wrap{max-width:1080px;margin:0 auto}.center{text-align:center}.kicker{display:inline-flex;align-items:center;gap:7px;margin-bottom:14px;border:1px solid rgba(37,240,132,.28);background:rgba(37,240,132,.10);color:#9effbd;border-radius:999px;padding:6px 11px;font-size:11px;font-weight:950;letter-spacing:.02em}.kicker.red{border-color:rgba(255,77,109,.38);background:rgba(255,77,109,.13);color:#ffa1ae}.kicker.purple{border-color:rgba(139,61,255,.35);background:rgba(139,61,255,.15);color:#dac8ff}.kicker.amber{border-color:rgba(248,184,78,.36);background:rgba(248,184,78,.14);color:#ffd48a}h1,h2,h3,p{margin-top:0}h1{font-size:clamp(46px,6vw,82px);line-height:.94;letter-spacing:-.078em;font-weight:950;margin-bottom:16px}h2{font-size:clamp(32px,4vw,50px);line-height:1;letter-spacing:-.06em;font-weight:950;margin-bottom:14px}h3{font-size:19px}.grad{background:linear-gradient(135deg,#fff 8%,#85ffb4 50%,var(--green));-webkit-background-clip:text;background-clip:text;color:transparent}.sub{max-width:760px;margin:0 auto 24px;color:var(--muted);font-size:16px;line-height:1.6}.actions{display:flex;gap:11px;justify-content:center;flex-wrap:wrap;margin-top:18px}.grid{display:grid;gap:16px}.stats{grid-template-columns:repeat(4,1fr);max-width:760px;margin:30px auto 0}.card,.stat,.site,.panel,.form,.row,.live{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.058),rgba(255,255,255,.024));border-radius:var(--radius);box-shadow:var(--shadow)}.stat{padding:18px;text-align:center}.stat b{display:block;font-size:27px}.stat span{display:block;color:var(--muted);font-size:11px;margin-top:5px}.panel,.card,.form{padding:20px}.panel p,.card p,.form p,.site p{color:#a7b8ca;line-height:1.55}.cards2{grid-template-columns:repeat(2,1fr)}.cards3{grid-template-columns:repeat(3,1fr)}.cards4{grid-template-columns:repeat(4,1fr)}.split{grid-template-columns:1.05fr .95fr}.siteList{max-width:850px;margin:24px auto 0;display:grid;gap:16px}.site{padding:20px;text-align:left;position:relative;overflow:hidden}.site.danger{border-color:rgba(255,77,109,.32);background:linear-gradient(120deg,rgba(82,19,34,.58),rgba(255,255,255,.018))}.siteHead{display:flex;align-items:center;gap:12px}.medal{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(37,240,132,.12);font-size:19px}.score{margin-left:auto;color:var(--green2);font-size:32px;font-weight:950}.danger .score{color:#ff7188}.chip{display:inline-flex;border-radius:999px;background:#eafdf0;color:#0c3d23;padding:3px 7px;font-size:10px;font-weight:900;margin:2px}.chip.dark{background:rgba(255,255,255,.07);color:#c9d7e8;border:1px solid var(--line)}.metrics{grid-template-columns:repeat(5,1fr);gap:9px;margin-top:12px}.metric{border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.035);padding:10px;text-align:center}.metric b{display:block}.metric span{font-size:10px;color:#98a9bc}.tabs{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:24px 0}.tab{border:1px solid var(--line);background:rgba(255,255,255,.04);color:#c9d7ea;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:850}.tab.active{background:linear-gradient(135deg,var(--green),#16a34a);border-color:transparent;color:#04120b}.input,.select,.textarea{width:100%;border:1px solid rgba(255,255,255,.15);background:#0b1524;color:#eaf3ff;border-radius:12px;padding:12px;margin:7px 0;outline:none}.textarea{min-height:110px;resize:vertical}.mission{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035);padding:12px;margin:9px 0}.mission small,.muted{color:var(--muted)}.queue{display:grid;gap:10px}.complaint{border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.035);padding:13px}.complaintHead,.complaintFoot{display:flex;align-items:center;justify-content:space-between;gap:12px}.complaint p{font-size:13px;margin:10px 0;color:#a7b8ca}.status{border-radius:999px;border:1px solid rgba(248,184,78,.36);background:rgba(248,184,78,.13);color:#ffd48a;padding:5px 8px;font-size:10px;font-weight:950;white-space:nowrap}.status.solved{border-color:rgba(37,240,132,.32);background:rgba(37,240,132,.13);color:#9effbd}.progress{height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(178,204,255,.12)}.progress i{display:block;height:100%;background:linear-gradient(90deg,var(--green),var(--green2));width:var(--w,50%)}.feed p{border-bottom:1px solid rgba(178,204,255,.10);padding:10px 0;margin:0;color:#cbd8e6}.row{display:grid;grid-template-columns:1.4fr repeat(4,.8fr);gap:10px;align-items:center;padding:14px;text-align:left}.row span{color:#9aacc2;font-size:12px}.chat{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px}.expert{padding:12px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.035);margin-bottom:8px}.expert.active{background:linear-gradient(135deg,var(--purple),#6d5dfc)}.chatbox{border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,.045);overflow:hidden}.chathead{padding:14px 16px;background:linear-gradient(135deg,var(--purple),#9333ea);font-weight:950;display:flex;justify-content:space-between}.msgs{padding:16px;height:260px;overflow:auto}.msg{max-width:78%;border-radius:14px;padding:12px;margin:10px 0;background:#17243a;color:#dce8f7;font-size:13px}.msg.me{margin-left:auto;background:var(--purple)}.chatinput{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}.chatinput input{flex:1}.toast{position:fixed;right:18px;bottom:18px;background:linear-gradient(135deg,#0e1b2d,#10243b);border:1px solid rgba(37,240,132,.33);box-shadow:0 20px 60px rgba(0,0,0,.35);border-radius:14px;padding:12px 14px;color:#dfffee;font-size:12px;z-index:20}.empty{display:none;color:var(--muted);margin-top:20px}.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:30}.modalBox{width:min(560px,92vw);border:1px solid var(--line);background:#0b1524;border-radius:20px;padding:24px;box-shadow:var(--shadow)}
    @media(max-width:980px){.app{grid-template-columns:1fr}.sidebar{position:fixed;left:0;top:0;bottom:0;width:230px;transform:translateX(-105%);transition:.25s;z-index:10}.sidebar.open{transform:none}.hamb{display:inline-flex}.search{width:42vw}.section{padding:56px 16px}.stats,.cards2,.cards3,.cards4,.metrics,.split,.chat{grid-template-columns:1fr}.row{grid-template-columns:1fr 1fr}h1{font-size:44px}.score{font-size:24px}.topbar .hideMobile{display:none}}
  `;
  document.head.appendChild(style);
}

function routeTo(path) {
  const next = normalize(path);
  history.pushState({}, '', next);
  state.route = next;
  state.sidebarOpen = false;
  render();
}

function showToast(text) {
  state.toast = text;
  render();
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { state.toast = ''; render(); }, 2600);
}

function gain(points, label) {
  const refId = `${label}:${todayKey()}`;
  if (!applyEconomyReward({ type: 'manual_gain', refId, label, points, feed: `${label} · +${points} puan` })) {
    showToast('Bu işlem bugün zaten kaydedildi.');
    return false;
  }
  saveStore();
  showToast(`${label}: +${points} puan eklendi.`);
  return true;
}

function sidebar() {
  return `
    <aside class="sidebar ${state.sidebarOpen ? 'open' : ''}">
      <div class="brand"><div class="logo">✓</div><div><b>Güveniyorum</b><small>Trust Starts</small></div></div>
      <nav class="nav">
        ${menu.map(([path, icon, label, badge]) => `
          <a href="${path}" data-route class="${normalize(path) === state.route ? 'active' : ''}">
            <span>${icon}</span><span>${label}</span>${badge ? `<em class="badge ${badge === 'ALARM' || badge === 'ÖNEMLİ' ? 'red' : badge === 'AI' ? 'purple' : ''}">${badge}</em>` : ''}
          </a>
        `).join('')}
      </nav>
      <div class="sidecard">
        <div>Güven Puanı <strong>${money(state.points)}</strong></div>
        <div>Katkı Skoru <strong>${state.contribution}%</strong></div>
        <div>Seviye <strong>${state.level}</strong></div>
        <div>Ödül Cüzdanı <strong>₺${money(state.wallet)}</strong></div>
      </div>
    </aside>
  `;
}

function topbar() {
  const user = readAuthSession();
  const authControls = user ? authenticatedTopbar(user) : guestTopbar();

  return `
    <header class="topbar">
      <button class="iconbtn hamb" data-menu>☰</button>
      <input class="search" data-search value="${escapeHtml(state.search)}" placeholder="Site ara, şikayet bul, kullanıcı incele...">
      <span class="topspacer"></span>
      <button class="iconbtn hideMobile">◌</button>
      <button class="iconbtn hideMobile">⚙</button>
      ${authControls}
    </header>
  `;
}

function guestTopbar() {
  return `<button type="button" class="btn hideMobile" data-action="signin">Giriş Yap</button><button type="button" class="btn green" data-action="signup">Üye Ol</button>`;
}

function authenticatedTopbar(user) {
  const profile = user.profile || user;
  const display = escapeHtml(profile.nickname || user.nickname || user.displayName || user.email || 'Üye');
  const wallet = money(Number(user.wallet || profile.wallet || 0));
  const xp = money(Number(user.xp || profile.xp || 0));

  return `<button type="button" class="authSession" data-action="profile"><span class="authAvatar">${avatarInitial(user)}</span>${display}</button><span class="btn authWallet hideMobile">₺${wallet} · ${xp} XP</span><button type="button" class="authSignout" data-auth-signout>Çıkış</button>`;
}

function stat(value, label) { return `<article class="stat"><b>${value}</b><span>${label}</span></article>`; }
function chip(text, dark = false) { return `<span class="chip ${dark ? 'dark' : ''}">${text}</span>`; }
function isValidBrandUrl(url) {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
function brandRedirectUrl(brand) {
  if (brand.linkStatus !== 'Aktif') return '';
  return [brand.trackingUrl, brand.websiteUrl].find(isValidBrandUrl) || '';
}

function filteredBrands() {
  const q = state.search.trim().toLowerCase();
  return brands.filter((brand) => brand.visible !== false).filter((brand) => {
    const filterOk = state.activeFilter === 'all' || brand.kind.includes(state.activeFilter);
    const searchOk = !q || `${brand.name} ${brand.slug} ${brand.tags.join(' ')}`.toLowerCase().includes(q);
    return filterOk && searchOk;
  });
}

function brandCard(brand) {
  const danger = brand.kind.includes('risk');
  const complaintImpact = getBrandComplaintStats(brand.name);
  const watchBadge = complaintImpact.openComplaints ? chip(complaintImpact.openComplaints > 2 ? 'Yanıt Bekleniyor' : 'İzleniyor', true) : '';
  return `
    <article class="site ${danger ? 'danger' : ''}">
      <div class="siteHead">
        <div class="medal">${danger ? '⚠' : brand.score > 96 ? '💎' : '🏆'}</div>
        <div><h3>${brand.name} ${chip(brand.badge, danger)} ${watchBadge}</h3><small class="muted">${brand.slug}.com · ${complaintImpact.scoreImpactLabel}</small></div>
        <strong class="score">${brand.score}%</strong>
      </div>
      <div style="margin:10px 0">${brand.tags.map((tagName, i) => chip(tagName, i > 1)).join('')}</div>
      ${danger ? '<p style="color:#ffc0ca">Çok sayıda şikayet, düşük çözüm oranı ve zayıf yanıt performansı. Kesin hüküm değil; kullanıcı uyarısıdır.</p>' : ''}
      <div class="grid metrics">
        <div class="metric"><b>${brand.ux}</b><span>UX</span></div>
        <div class="metric"><b>${brand.users}</b><span>Kullanıcı</span></div>
        <div class="metric"><b>${complaintImpact.openComplaints}</b><span>Açık</span></div>
        <div class="metric"><b>${complaintImpact.solvedComplaints}</b><span>Çözülen</span></div>
        <div class="metric"><b>%${complaintImpact.resolutionRate}</b><span>Çözüm</span></div>
      </div>
    </article>
  `;
}

function home() {
  const list = filteredBrands();
  return `
    <section class="section center" id="home">
      <div class="wrap">
        <div class="kicker">Türkiye'nin AI Destekli Güvenlik Platformu</div>
        <h1>Güvenli <span class="grad">Bahis</span><br>Kontrol <span class="grad">Sende</span></h1>
        <p class="sub">Site güven skoru, şikayet çözümü, kullanıcı etkileşimi, firma rekabeti, sorumlu oyun ve psikoloji desteği tek ekosistemde birleşir.</p>
        <div class="actions">
          <a class="btn green" href="/marka-ligi" data-route>Güvenli Siteleri Keşfet →</a>
          <a class="btn" href="/sikayetler" data-route>Şikayet Oluştur</a>
          <a class="btn purple" href="/puanlama-motoru" data-route>Puanlama Sistemini Gör</a>
        </div>
        <div class="grid stats">${stat('150+', 'Güvenli Site')}${stat('50K+', 'Aktif Kullanıcı')}${stat('12K+', 'Çözülen Şikayet')}${stat('%98', 'Güven Skoru')}</div>
      </div>
    </section>
    <section class="section center">
      <div class="wrap">
        <div class="kicker">Türkiye Bahis Siteleri</div>
        <h2>En Güvenilir Bahis Siteleri</h2>
        <p class="sub">Güvenlik, kullanıcı memnuniyeti ve şikayet çözüm performansına göre canlı liste.</p>
        ${tabs()}
        <div class="siteList">${list.map(brandCard).join('')}</div>
        <p class="empty" style="display:${list.length ? 'none' : 'block'}">Bu filtrede gösterilecek marka yok.</p>
      </div>
    </section>
  `;
}

function tabs() {
  const items = [['all', 'Tüm Siteler'], ['safe', 'Güvenli Siteler'], ['new', 'Yeni Siteler'], ['risk', 'Riskli Siteler']];
  return `<div class="tabs">${items.map(([key, label]) => `<button class="tab ${state.activeFilter === key ? 'active' : ''}" data-filter="${key}">${label}</button>`).join('')}</div>`;
}

function leagueCard(item, index) {
  const tone = riskTone(item.impact.riskLevel);
  const redirectUrl = brandRedirectUrl(item);
  return `
    <article class="card">
      <div class="siteHead">
        <div class="medal">#${index + 1}</div>
        <div><h3>${escapeHtml(item.name)} ${item.badges.map((badge) => chip(badge, true)).join('')}</h3><small class="muted">${escapeHtml(item.category)} · ${escapeHtml(item.shortInsight)}</small></div>
        <strong class="score">${Math.round(item.leagueScore)}</strong>
      </div>
      <div class="grid metrics">
        <div class="metric"><b>${item.trustScore}</b><span>Trust</span></div>
        <div class="metric"><b>%${item.impact.resolutionRate}</b><span>Çözüm</span></div>
        <div class="metric"><b>${item.impact.openComplaints}</b><span>Açık</span></div>
        <div class="metric"><b>${item.avgResponseHours}s</b><span>Yanıt</span></div>
        <div class="metric"><b>${trendLabel(item.trend)}</b><span>Trend</span></div>
      </div>
      <div style="margin-top:10px">${chip(item.impact.riskLevel, tone !== '')}${chip(item.status, true)}</div>
      <div class="actions" style="justify-content:flex-start;margin-top:12px">
        <button type="button" class="btn">Detay</button>
        <button type="button" class="btn purple">Karşılaştır</button>
        <a class="btn" href="/sikayetler" data-route>Şikayetleri Gör</a>
        ${redirectUrl ? `<a class="btn" href="${escapeHtml(redirectUrl)}" target="_blank" rel="noopener noreferrer sponsored">${escapeHtml(item.redirectLabel || 'Siteyi İncele')}</a>` : ''}
      </div>
    </article>
  `;
}

function siteLeague() {
  const list = leagueBrands();
  const avgTrust = list.length ? Math.round(list.reduce((sum, brand) => sum + brand.trustScore, 0) / list.length) : 0;
  const fastest = list.length ? Math.min(...list.map((brand) => brand.avgResponseHours)) : 0;
  const inReview = list.filter((brand) => brand.status === 'İncelemede' || brand.impact.riskLevel === 'Yüksek Risk').length;
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker">Public Site Ligi</div>
        <h1>Marka Güven <span class="grad">Ligi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Kullanıcılar için karar destek ekranı: güven skoru, çözüm performansı, açık dosya sağlığı, yanıt kalitesi ve trend sinyalleri birlikte okunur.</p>
        <div class="grid stats" style="max-width:none;margin:22px 0">
          ${stat(list.length, 'Toplam Marka')}${stat(avgTrust, 'Ortalama Güven Skoru')}${stat(`${fastest}s`, 'En Hızlı Yanıt')}${stat(inReview, 'İncelemede Olan Marka')}
        </div>
        <div class="grid cards3">
          ${list.map(leagueCard).join('')}
        </div>
      </div>
    </section>
  `;
}

function complaintStats() {
  return {
    resolved: complaintBaseStats.resolved + state.complaints.filter(isSolved).length,
    reviewed: complaintBaseStats.reviewed + state.complaints.length,
    open: state.complaints.filter((complaint) => !isSolved(complaint)).length,
    bestResolution: complaintBaseStats.bestResolution,
  };
}

function getBrandComplaintStats(brandName) {
  const brand = brands.find((item) => item.name === brandName);
  const complaints = state.complaints.filter((complaint) => complaint.brand === brandName);
  const solvedComplaints = Number(brand?.solvedComplaintCount || 0) + complaints.filter(isSolved).length;
  const openComplaints = Number(brand?.openComplaintCount || 0) + complaints.filter((complaint) => !isSolved(complaint)).length;
  const totalComplaints = Math.max(Number(brand?.complaintCount || 0) + complaints.length, solvedComplaints + openComplaints);
  const resolutionRate = totalComplaints ? Math.round((solvedComplaints / totalComplaints) * 100) : Number(brand?.resolutionRate || 100);
  let riskLevel = brand?.riskLevel || 'Stabil';
  if (openComplaints >= 12) riskLevel = 'Yüksek Risk';
  else if (openComplaints >= 3 && riskLevel !== 'Yüksek Risk') riskLevel = 'İzleniyor';
  if (solvedComplaints > openComplaints * 3 && riskLevel !== 'Yüksek Risk') riskLevel = 'Düşük Risk';
  const scoreImpactLabel = openComplaints >= 8 ? 'Risk görünürlüğü arttı' : openComplaints > 0 ? 'Yanıt bekleyen dosya var' : resolutionRate >= 90 ? 'Çözüm performansı güçlü' : 'Stabil görünüm';
  return { totalComplaints, openComplaints, solvedComplaints, resolutionRate, riskLevel, scoreImpactLabel };
}

function refreshBrandSignals() {
  state.brandSignals = brands.reduce((signals, brand) => {
    signals[brand.name] = getBrandComplaintStats(brand.name);
    return signals;
  }, {});
}

function sortedComplaints() {
  return [...state.complaints].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

function complaintsByBrand(brandName) {
  return state.complaints.filter((complaint) => complaint.brand === brandName);
}

function openComplaintsByBrand(brandName) {
  return complaintsByBrand(brandName).filter((complaint) => !isSolved(complaint));
}

function averageBrandResponseHours(complaints) {
  const values = complaints
    .map((complaint) => {
      const created = new Date(complaint.createdAt).getTime();
      const updated = new Date(complaint.updatedAt || complaint.createdAt).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(updated) || updated < created) return null;
      return (updated - created) / (1000 * 60 * 60);
    })
    .filter((hours) => hours !== null);
  if (!values.length) return 0;
  return Math.max(0, Math.round((values.reduce((sum, item) => sum + item, 0) / values.length) * 10) / 10);
}

function brandOpsMetrics(brandName) {
  const list = complaintsByBrand(brandName);
  const solved = list.filter(isSolved).length;
  const open = list.length - solved;
  const resolution = list.length ? Math.round((solved / list.length) * 100) : 100;
  return {
    total: list.length,
    open,
    solved,
    resolution,
    avgResponseHours: averageBrandResponseHours(list),
  };
}

function riskPenalty(riskLevel) {
  if (riskLevel === 'Yüksek Risk') return 12;
  if (riskLevel === 'İzleniyor') return 5;
  return 0;
}

function leagueBrand(brand) {
  const impact = getBrandComplaintStats(brand.name);
  const avgResponseHours = Number(brand.avgResponseHours || 0);
  const leagueScore = clamp(brand.trustScore + impact.resolutionRate * 0.2 - impact.openComplaints * 2 - avgResponseHours * 0.5 - riskPenalty(impact.riskLevel));
  return { ...brand, impact, avgResponseHours, leagueScore };
}

function leagueBrands() {
  return brands.filter((brand) => brand.visible !== false).map(leagueBrand).sort((a, b) => b.leagueScore - a.leagueScore || b.trustScore - a.trustScore);
}

function trendLabel(trend) {
  return String(trend || '+0%').startsWith('-') ? `↓ ${trend}` : `↑ ${trend}`;
}

function complaintTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'az önce';
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function nextComplaintId() {
  const year = new Date().getFullYear();
  const next = state.complaints.reduce((highest, complaint) => {
    const match = String(complaint.id).match(/^GVN-(\d{4})-(\d+)$/);
    return match && Number(match[1]) === year ? Math.max(highest, Number(match[2])) : highest;
  }, 0) + 1;
  return `GVN-${year}-${String(next).padStart(4, '0')}`;
}

function complaintCard(complaint) {
  const solved = isSolved(complaint);
  return `
    <article class="complaint">
      <div class="complaintHead">
        <div><b>${escapeHtml(complaint.title)}</b><br><small class="muted">${escapeHtml(complaint.id)} · ${escapeHtml(complaint.brand)} · ${escapeHtml(complaint.category)}</small></div>
        <span class="status ${solved ? 'solved' : ''}">${complaint.status}</span>
      </div>
      <p>${escapeHtml(complaint.details)}</p>
      <div class="complaintFoot">
        <small class="muted">${complaintTime(complaint.updatedAt || complaint.createdAt)} güncellendi</small>
        <span>${solved ? '<span class="chip">Onaylandı</span>' : ''}<button type="button" class="btn ${solved ? '' : 'green'}" data-approve-complaint="${escapeHtml(complaint.id)}">Çözüm Onayı</button></span>
      </div>
    </article>
  `;
}

function complaintQueue() {
  const list = sortedComplaints();
  if (!list.length) return '<p class="muted">Henüz canlı şikayet kaydı yok.</p>';
  return `<div class="queue">${list.map(complaintCard).join('')}</div>`;
}

function liveComplaint() {
  const complaint = sortedComplaints()[0];
  if (!complaint) return { title: 'Canlı şikayet kuyruğu hazır', meta: 'Yeni kayıtlar burada görünecek' };
  const icon = isSolved(complaint) ? '✅' : '⚠';
  return {
    title: `${icon} ${complaint.brand}: ${complaint.title}`,
    meta: `${complaint.id} · ${complaint.status} · ${complaintTime(complaint.updatedAt || complaint.createdAt)}`,
  };
}

function createComplaint(formData) {
  const brand = formData.get('brand')?.toString().trim() || 'BetSafe';
  const category = formData.get('category')?.toString().trim() || 'Para çekme';
  const title = formData.get('title')?.toString().trim();
  const details = formData.get('details')?.toString().trim();
  if (!title || !details) {
    showToast('Şikayet başlığı ve detayını doldurun.');
    return;
  }

  const now = new Date().toISOString();
  const complaint = {
    id: nextComplaintId(),
    brand,
    category,
    title,
    details,
    status: 'Açık',
    createdAt: now,
    updatedAt: now,
  };
  state.complaints = [complaint, ...state.complaints];
  const awarded = applyEconomyReward({
    type: 'complaint_create',
    refId: complaint.id,
    label: `${complaint.id} şikayet oluşturuldu`,
    points: 40,
    contribution: 2,
    feed: `${complaint.id} şikayet kuyruğuna eklendi · +40 puan`,
  });
  if (awarded) markComplaintReward(complaint.id, 'created');
  saveStore();
  showToast(awarded ? `${complaint.id} oluşturuldu. +40 puan eklendi.` : 'Bu şikayet için puan daha önce verildi.');
}

function approveComplaint(id) {
  const complaint = state.complaints.find((item) => item.id === id);
  if (!complaint) return;
  if (isSolved(complaint) || complaintRewarded(id, 'resolved', 'complaint_resolution')) {
    showToast('Bu çözüm daha önce onaylandı.');
    return;
  }
  complaint.status = 'Çözüldü';
  complaint.updatedAt = new Date().toISOString();
  const awarded = applyEconomyReward({
    type: 'complaint_resolution',
    refId: complaint.id,
    label: `${complaint.id} çözüm onayı`,
    points: 75,
    wallet: 50,
    contribution: 3,
    feed: `${complaint.id} çözüm onayı verildi · +75 puan · ₺50 ödül uygunluğu`,
  });
  if (!awarded) {
    showToast('Bu çözüm daha önce onaylandı.');
    return;
  }
  markComplaintReward(complaint.id, 'resolved');
  saveStore();
  showToast(`${complaint.id} çözüldü. +75 puan ve ₺50 cüzdan uygunluğu eklendi.`);
}

function submitBrandAction(formData) {
  const brandName = formData.get('brand')?.toString().trim() || state.brandOpsSelection;
  const action = formData.get('action')?.toString().trim() || 'response_posted';
  const note = formData.get('note')?.toString().trim() || '';
  const selectedComplaintId = formData.get('complaintId')?.toString().trim() || '';
  const now = new Date().toISOString();

  let complaint = selectedComplaintId
    ? state.complaints.find((item) => item.id === selectedComplaintId && item.brand === brandName)
    : openComplaintsByBrand(brandName)[0];

  const actionMap = {
    response_posted: { title: 'marka yanıtı paylaşıldı', status: 'Yanıtlandı' },
    resolution_plan: { title: 'çözüm planı yayınlandı', status: 'Çözüm Planlandı' },
    needs_info: { title: 'ek bilgi talep edildi', status: 'Ek Bilgi Bekleniyor' },
    resolved: { title: 'dosya çözüldü', status: 'Çözüldü' },
  };
  const meta = actionMap[action] || actionMap.response_posted;

  if (!complaint && action !== 'needs_info') {
    showToast(`${brandName} için açık şikayet bulunamadı.`);
    return;
  }

  if (complaint) {
    complaint.status = meta.status;
    complaint.updatedAt = now;
    if (note) complaint.brandNote = note;
  }

  const targetLabel = complaint ? `${complaint.id}` : 'genel kayıt';
  const activity = {
    id: activityId('brand_ops', `${brandName}:${targetLabel}`),
    type: 'brand_ops',
    refId: `${brandName}:${targetLabel}:${now}`,
    label: `${brandName} · ${targetLabel} · ${meta.title}`,
    points: 0,
    wallet: 0,
    note,
    createdAt: now,
  };
  state.activityLog = [activity, ...state.activityLog].slice(0, 60);
  addFeed(`${brandName} · ${targetLabel} · ${meta.title}${note ? ` · ${note}` : ''}`, false);
  state.brandOpsSelection = brandName;
  state.brandOpsActionDraft = action;
  state.brandOpsNoteDraft = note;
  state.brandOpsComplaintDraft = complaint?.id || '';
  saveStore();
  render();
  showToast(`${brandName} için işlem kaydedildi: ${meta.title}.`);
}

function selectedAdminBrand() {
  if (state.selectedAdminBrand === '') {
    return {
      id: '',
      name: '',
      category: 'Spor & Casino',
      trustScore: 80,
      userExperienceScore: 4.2,
      resolutionRate: 80,
      avgResponseHours: 6,
      riskLevel: 'İzleniyor',
      status: 'İncelemede',
      sponsorPool: '₺0',
      badges: ['İzleniyor'],
      adminNote: '',
      websiteUrl: '',
      trackingUrl: '',
      redirectLabel: 'Siteyi İncele',
      linkStatus: 'Pasif',
      visible: true,
      ...state.adminBrandDraft,
    };
  }
  return brands.find((brand) => brand.id === state.selectedAdminBrand) || brands[0];
}

function brandFormValue(brand, key, fallback = '') {
  return escapeHtml(state.adminBrandDraft[key] ?? brand?.[key] ?? fallback);
}

function adminFeed(text) {
  state.brandAdminFeed = [{ text, createdAt: new Date().toISOString() }, ...state.brandAdminFeed].slice(0, 20);
}

function submitAdminBrand(formData) {
  const name = formData.get('name')?.toString().trim();
  if (!name) {
    showToast('Marka adı gerekli.');
    return;
  }
  const raw = {
    id: formData.get('id')?.toString().trim() || slugify(name),
    name,
    category: formData.get('category')?.toString().trim(),
    trustScore: formData.get('trustScore'),
    userExperienceScore: formData.get('userExperienceScore'),
    resolutionRate: formData.get('resolutionRate'),
    avgResponseHours: formData.get('avgResponseHours'),
    riskLevel: formData.get('riskLevel')?.toString(),
    status: formData.get('status')?.toString(),
    sponsorPool: formData.get('sponsorPool')?.toString().trim(),
    badges: normalizeBadges(formData.get('badges')?.toString()),
    adminNote: formData.get('adminNote')?.toString().trim(),
    websiteUrl: formData.get('websiteUrl')?.toString().trim(),
    trackingUrl: formData.get('trackingUrl')?.toString().trim(),
    redirectLabel: formData.get('redirectLabel')?.toString().trim() || 'Siteyi İncele',
    linkStatus: formData.get('linkStatus')?.toString() || 'Pasif',
    visible: formData.get('visible') === 'on',
  };
  const brand = normalizeBrand(raw, brands.find((item) => item.id === raw.id));
  const index = state.brandDirectory.findIndex((item) => item.id === brand.id);
  if (index >= 0) state.brandDirectory[index] = brand;
  else state.brandDirectory.unshift(brand);
  state.selectedAdminBrand = brand.id;
  state.adminBrandDraft = {};
  adminFeed(`${brand.name} marka kaydı güncellendi.`);
  saveStore();
  render();
  showToast('Marka kaydı güncellendi.');
}

function setAdminBrandStatus(id, mode) {
  const brand = state.brandDirectory.find((item) => item.id === id);
  if (!brand) return;
  if (mode === 'hide') { brand.visible = false; brand.status = 'Gizli'; }
  if (mode === 'show') { brand.visible = true; brand.status = 'Yayında'; }
  if (mode === 'reviewed') { brand.visible = true; brand.status = 'İncelendi'; }
  if (mode === 'review') { brand.status = 'İncelemede'; }
  adminFeed(`${brand.name} durumu ${brand.status} olarak güncellendi.`);
  saveStore();
  render();
  showToast('Marka kaydı güncellendi.');
}

function adminBrandPanel() {
  const brand = selectedAdminBrand();
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker purple">Admin Brand Directory</div>
        <h1>Admin Marka <span class="grad">Yönetimi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">İç ekip için marka kaydı, görünürlük, risk, rozet, sponsor havuzu ve operasyon notu yönetimi. Public Site Ligi bu kontrolleri göstermez.</p>
        <div class="grid split">
          <div class="panel">
            <div class="mission"><span>Brand directory</span><b>${brands.length}</b></div>
            <div class="queue">
              ${brands.map((item) => `
                <article class="complaint">
                  <div class="complaintHead">
                    <button type="button" class="btn ${item.id === brand.id ? 'purple' : ''}" data-admin-select="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>
                    <span class="status ${item.riskLevel === 'Yüksek Risk' ? 'red' : item.riskLevel === 'İzleniyor' ? '' : 'solved'}">${escapeHtml(item.status)}</span>
                  </div>
                  <p>${escapeHtml(item.category)} · ${escapeHtml(item.riskLevel)} · ${escapeHtml(item.sponsorPool)} · ${item.visible === false ? 'Gizli' : 'Public görünür'}</p>
                  <div class="actions" style="justify-content:flex-start;margin-top:8px">
                    <button class="btn" data-admin-status="show" data-admin-id="${escapeHtml(item.id)}">Show</button>
                    <button class="btn" data-admin-status="hide" data-admin-id="${escapeHtml(item.id)}">Hide</button>
                    <button class="btn purple" data-admin-status="reviewed" data-admin-id="${escapeHtml(item.id)}">Mark as Reviewed</button>
                    <button class="btn" data-admin-status="review" data-admin-id="${escapeHtml(item.id)}">Mark as In Review</button>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
          <form class="form" data-admin-brand-form>
            <div class="kicker purple">Add / Edit Brand</div>
            <input type="hidden" name="id" value="${brandFormValue(brand, 'id')}">
            <input class="input" name="name" placeholder="Brand Name" value="${brandFormValue(brand, 'name')}" required>
            <input class="input" name="category" placeholder="Category" value="${brandFormValue(brand, 'category', 'Spor & Casino')}">
            <div class="grid cards2">
              <input class="input" name="trustScore" type="number" min="0" max="100" placeholder="Trust Score" value="${brandFormValue(brand, 'trustScore')}">
              <input class="input" name="userExperienceScore" type="number" min="0" max="5" step="0.1" placeholder="UX Score" value="${brandFormValue(brand, 'userExperienceScore')}">
              <input class="input" name="resolutionRate" type="number" min="0" max="100" placeholder="Resolution Rate" value="${brandFormValue(brand, 'resolutionRate')}">
              <input class="input" name="avgResponseHours" type="number" min="0" step="0.1" placeholder="Average Response Hours" value="${brandFormValue(brand, 'avgResponseHours')}">
            </div>
            <select class="select" name="riskLevel"><option ${brand.riskLevel === 'Düşük Risk' ? 'selected' : ''}>Düşük Risk</option><option ${brand.riskLevel === 'İzleniyor' ? 'selected' : ''}>İzleniyor</option><option ${brand.riskLevel === 'Yüksek Risk' ? 'selected' : ''}>Yüksek Risk</option></select>
            <select class="select" name="status"><option ${brand.status === 'Yayında' ? 'selected' : ''}>Yayında</option><option ${brand.status === 'İncelemede' ? 'selected' : ''}>İncelemede</option><option ${brand.status === 'İncelendi' ? 'selected' : ''}>İncelendi</option><option ${brand.status === 'Gizli' ? 'selected' : ''}>Gizli</option></select>
            <input class="input" name="sponsorPool" placeholder="Sponsor Pool" value="${brandFormValue(brand, 'sponsorPool')}">
            <input class="input" name="badges" placeholder="Badges comma separated" value="${escapeHtml((brand.badges || []).join(', '))}">
            <h3>Yönlendirme Bağlantıları</h3>
            <input class="input" name="websiteUrl" placeholder="Website URL" value="${brandFormValue(brand, 'websiteUrl')}">
            <input class="input" name="trackingUrl" placeholder="Tracking / yönlendirme URL" value="${brandFormValue(brand, 'trackingUrl')}">
            <div class="grid cards2">
              <input class="input" name="redirectLabel" placeholder="Redirect Button Label" value="${brandFormValue(brand, 'redirectLabel', 'Siteyi İncele')}">
              <select class="select" name="linkStatus"><option ${brand.linkStatus === 'Aktif' ? 'selected' : ''}>Aktif</option><option ${brand.linkStatus === 'Pasif' ? 'selected' : ''}>Pasif</option><option ${brand.linkStatus === 'İncelemede' ? 'selected' : ''}>İncelemede</option></select>
            </div>
            <textarea class="textarea" name="adminNote" placeholder="Admin Note">${brandFormValue(brand, 'adminNote')}</textarea>
            <label class="mission"><span>Visibility</span><input type="checkbox" name="visible" ${brand.visible !== false ? 'checked' : ''}></label>
            <div class="actions" style="justify-content:flex-start"><button class="btn green" type="submit">Update Brand</button><button class="btn purple" type="button" data-admin-new>Add Brand</button></div>
          </form>
        </div>
        <div class="panel" style="margin-top:16px">
          <h3>Admin Feed</h3>
          <div class="feed">${(state.brandAdminFeed.length ? state.brandAdminFeed : [{ text: 'Henüz admin hareketi yok.', createdAt: new Date().toISOString() }]).map((item) => `<p>${escapeHtml(item.text)} · ${complaintTime(item.createdAt)}</p>`).join('')}</div>
        </div>
      </div>
    </section>
  `;
}

function claimMission(missionKey) {
  const mission = missions.find((item) => item.key === missionKey);
  if (!mission) return;
  const today = todayKey();
  if (state.claimedMissions[mission.key] === today) {
    showToast('Bu görev bugün zaten tamamlandı.');
    return;
  }
  const awarded = applyEconomyReward({
    type: 'mission',
    refId: `${mission.key}:${today}`,
    label: mission.title,
    points: mission.points,
    contribution: 1,
    feed: `${mission.title} · +${mission.points} puan`,
  });
  if (!awarded) {
    state.claimedMissions[mission.key] = today;
    saveStore();
    showToast('Bu görev bugün zaten tamamlandı.');
    return;
  }
  state.claimedMissions[mission.key] = today;
  saveStore();
  showToast(`${mission.title}: +${mission.points} puan eklendi.`);
}

function claimRewardEligibility() {
  const today = todayKey();
  if (state.rewardClaims.rewardEligibility === today) {
    showToast('Ödül uygunluğu bugün zaten hesaplandı.');
    return;
  }
  const awarded = applyEconomyReward({
    type: 'reward_eligibility',
    refId: `rewardEligibility:${today}`,
    label: 'Ödül uygunluğu hesaplandı',
    points: 50,
    wallet: 250,
    contribution: 1,
    feed: 'Sponsor havuzundan ₺250 ödül uygunluğu hesaplandı · +50 puan',
  });
  if (!awarded) {
    state.rewardClaims.rewardEligibility = today;
    saveStore();
    showToast('Ödül uygunluğu bugün zaten hesaplandı.');
    return;
  }
  state.rewardClaims.rewardEligibility = today;
  saveStore();
  showToast('Ödül uygunluğu hesaplandı. Cüzdana ₺250 eklendi.');
}

function pointsEngine() {
  const nextPct = Math.min(100, Math.round((state.points % 2000) / 20));
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker purple">Diamond Puanlama Motoru</div>
        <h1>Puan ve Ödül <span class="grad">Merkezi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Katkı ver, güven puanı kazan, ödül uygunluğunu yükselt. Kontrol sende.</p>
        <div class="grid stats" style="max-width:none;margin:22px 0">
          ${stat(money(state.points), 'Güven Puanı')}${stat(`${state.contribution}%`, 'Katkı Skoru')}${stat(`₺${money(state.wallet)}`, 'Ödül Cüzdanı')}${stat(state.level, 'Seviye')}
        </div>
        <div class="grid split">
          <div class="panel">
            <h3>Görevler</h3>
            <p>Her görev kullanıcıya puan kazandırır ve ödül uygunluğunu artırır.</p>
            ${missions.map((mission) => `
              <div class="mission">
                <div><b>${mission.title}</b><br><small>${mission.desc}</small></div>
                <button class="btn purple" data-mission="${mission.key}">+${mission.points}</button>
              </div>
            `).join('')}
          </div>
          <div class="panel">
            <h3>Diamond Cüzdan</h3>
            <p>Katkı puanın sponsor havuzlarından ödül uygunluğuna dönüşür. Ödül dağıtımı admin onaylı ilerler.</p>
            <div class="progress" style="--w:${nextPct}%"><i></i></div>
            <p class="muted" style="margin-top:12px">Diamond seviyeye ilerleme: ${nextPct}%</p>
            <div class="grid cards2" style="margin-top:16px">
              <div class="card"><h3>₺120K</h3><p>BetSafe sadakat havuzu</p></div>
              <div class="card"><h3>₺70K</h3><p>TürkBahis yükselen marka havuzu</p></div>
            </div>
          </div>
        </div>
        <div class="grid split" style="margin-top:16px">
          <div class="panel feed"><h3>Son Hareketler</h3>${state.feed.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>
          <div class="panel"><h3>Ödül Uygunluğu</h3><p>Doğrulanmış katkılar arttıkça rozet ve ödül talep hakkın yükselir.</p><button class="btn green" data-reward>Ödül Uygunluğunu Hesapla</button></div>
        </div>
      </div>
    </section>
  `;
}

function brandOperationsPanel() {
  const selectedBrand = brands.some((brand) => brand.name === state.brandOpsSelection) ? state.brandOpsSelection : brands[0].name;
  const metrics = brandOpsMetrics(selectedBrand);
  const brandOpenComplaints = openComplaintsByBrand(selectedBrand);
  const recentActivity = state.activityLog
    .filter((activity) => activity.type === 'brand_ops' && activity.label.includes(`${selectedBrand} ·`))
    .slice(0, 8);
  const relatedFeed = state.feed.filter((line) => line.includes(selectedBrand)).slice(0, 8);

  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker purple">Brand Operations Panel</div>
        <h1>Marka Operasyon ve <span class="grad">Yanıt Yönetimi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Marka seç, şikayet metriklerini izle, yanıt aksiyonu işle ve tüm hareketleri canlı feed + aktivite akışında takip et.</p>
        <div class="panel">
          <div class="mission" style="margin:0">
            <div>
              <b>Marka Seçici</b><br>
              <small>Panel seçimi local state içinde kalıcıdır.</small>
            </div>
            <select class="select" name="brand" data-brand-ops-brand style="max-width:280px;margin:0">
              ${brands.map((brand) => `<option value="${escapeHtml(brand.name)}" ${brand.name === selectedBrand ? 'selected' : ''}>${escapeHtml(brand.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid stats" style="max-width:none;margin:22px 0">
          ${stat(metrics.total, 'Toplam Şikayet')}
          ${stat(metrics.open, 'Açık Dosya')}
          ${stat(metrics.solved, 'Çözülen')}
          ${stat(`%${metrics.resolution}`, 'Çözüm Oranı')}
        </div>
        <div class="grid split">
          <form class="form" data-brand-action-form>
            <div class="kicker">Response Actions</div>
            <input type="hidden" name="brand" value="${escapeHtml(selectedBrand)}">
            <select class="select" name="action">
              <option value="response_posted" ${state.brandOpsActionDraft === 'response_posted' ? 'selected' : ''}>Yanıt Gönderildi</option>
              <option value="resolution_plan" ${state.brandOpsActionDraft === 'resolution_plan' ? 'selected' : ''}>Çözüm Planı Paylaşıldı</option>
              <option value="needs_info" ${state.brandOpsActionDraft === 'needs_info' ? 'selected' : ''}>Ek Bilgi Talep Edildi</option>
              <option value="resolved" ${state.brandOpsActionDraft === 'resolved' ? 'selected' : ''}>Dosya Çözüldü</option>
            </select>
            <select class="select" name="complaintId">
              <option value="">Otomatik: en güncel açık dosya</option>
              ${brandOpenComplaints.map((complaint) => `<option value="${escapeHtml(complaint.id)}" ${state.brandOpsComplaintDraft === complaint.id ? 'selected' : ''}>${escapeHtml(complaint.id)} · ${escapeHtml(complaint.title)}</option>`).join('')}
            </select>
            <textarea class="textarea" name="note" placeholder="Opsiyonel marka notu">${escapeHtml(state.brandOpsNoteDraft)}</textarea>
            <button class="btn green" type="submit">Aksiyonu Kaydet</button>
            <p class="muted" style="margin:10px 0 0">Ortalama yanıt süresi: <b>${metrics.avgResponseHours} saat</b></p>
          </form>
          <div class="panel">
            <h3>Şikayet Metrikleri ve Akış</h3>
            <div class="mission"><span>Aktif marka</span><b>${escapeHtml(selectedBrand)}</b></div>
            <div class="mission"><span>Açık dosya kuyruğu</span><b>${brandOpenComplaints.length}</b></div>
            <div class="mission"><span>Yanıt / çözüm performansı</span><b>%${metrics.resolution}</b></div>
            <div class="mission"><span>Ortalama yanıt süresi</span><b>${metrics.avgResponseHours} saat</b></div>
            <div class="feed" style="margin-top:10px">
              ${(relatedFeed.length ? relatedFeed : ['Bu marka için henüz feed hareketi yok.']).map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
            </div>
          </div>
        </div>
        <div class="panel" style="margin-top:16px">
          <h3>Activity Updates</h3>
          <div class="queue">
            ${(recentActivity.length ? recentActivity : [{ label: `${selectedBrand} için henüz aksiyon kaydı yok.`, createdAt: new Date().toISOString() }]).map((activity) => `
              <article class="complaint">
                <div class="complaintHead">
                  <b>${escapeHtml(activity.label)}</b>
                  <small class="muted">${complaintTime(activity.createdAt)}</small>
                </div>
                ${activity.note ? `<p>${escapeHtml(activity.note)}</p>` : ''}
              </article>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function complaints() {
  const stats = complaintStats();
  const live = liveComplaint();
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker amber">Şikayet Ağı</div>
        <h1>Şikayet, Çözüm ve <span class="grad">İtibar</span> Akışı</h1>
        <p class="sub" style="margin-left:0;text-align:left">Şikayet sadece kayıt değildir. Firma için açık sınav, kullanıcı için puan ve ekosistem için güven sinyalidir.</p>
        <div class="live panel"><b>${escapeHtml(live.title)}</b><br><span class="muted">${escapeHtml(live.meta)} · canlı kuyruğa yansıdı</span></div>
        <div class="grid stats" style="max-width:none;margin:22px 0">${stat(money(stats.resolved), 'Çözülen Şikayet')}${stat(stats.open, 'Açık Şikayet')}${stat(money(stats.reviewed), 'İncelenen Dosya')}${stat(stats.bestResolution, 'En İyi Çözüm Oranı')}</div>
        <div class="grid split">
          <form class="form" data-complaint-form>
            <div class="kicker red">Kanıtlı Şikayet Oluştur</div>
            <select class="select" name="brand">${brands.map((brand) => `<option>${escapeHtml(brand.name)}</option>`).join('')}</select>
            <select class="select" name="category"><option>Para çekme</option><option>Bonus şartı</option><option>KYC / belge</option><option>Destek kalitesi</option></select>
            <input class="input" name="title" placeholder="Kısa ve net başlık" required>
            <textarea class="textarea" name="details" placeholder="Yaşadığınız sorunu detaylı açıklayın..." required></textarea>
            <button class="btn green" type="submit">Şikayeti Gönder ve +40 Puan Kazan</button>
          </form>
          <div class="panel">
            <h3>Canlı Şikayet Kuyruğu</h3>
            ${complaintQueue()}
          </div>
        </div>
        <div class="panel" style="margin-top:16px">
            <h3>Süreç nasıl çalışır?</h3>
            <div class="mission"><span>1. Kullanıcı kanıtlı şikayet oluşturur</span><b>+40</b></div>
            <div class="mission"><span>2. Marka yanıt verir</span><b>Skor</b></div>
            <div class="mission"><span>3. Kullanıcı çözüm onayı verir</span><b>+75</b></div>
            <div class="mission"><span>4. Site ligi güncellenir</span><b>Live</b></div>
        </div>
      </div>
    </section>
  `;
}

function brandArena() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker amber">Firma Arenası</div>
        <h1>Siteler Arası <span class="grad">Rekabet</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Her çözüm, her kötü deneyim ve her yanıt süresi lig sıralamasını değiştirir.</p>
        <div class="grid" style="gap:12px">
          ${brands.map((brand, i) => `
            <div class="row">
              ${(() => {
                const impact = getBrandComplaintStats(brand.name);
                return `
              <b>${i === 0 ? '💎' : brand.kind.includes('risk') ? '⚠' : '🚀'} ${brand.name}</b>
              <span>Açık Dosya<br><b>${impact.openComplaints}</b></span>
              <span>Çözülen<br><b>${impact.solvedComplaints}</b></span>
              <span>Çözüm Oranı<br><b>%${impact.resolutionRate}</b></span>
              <span>Risk Seviyesi<br><b>${impact.riskLevel}</b></span>
                `;
              })()}
            </div>
          `).join('')}
        </div>
        <div class="actions"><button class="btn red" data-risk>Risk Alarmını Tetikle</button><button class="btn green" data-improve>BetSafe Çözüm Hamlesi</button></div>
      </div>
    </section>
  `;
}

function riskTone(riskLevel) {
  return riskLevel === 'Yüksek Risk' ? 'red' : riskLevel === 'İzleniyor' ? 'amber' : '';
}

function riskSignalCards() {
  const rankedBrands = brands
    .map((brand) => ({ brand, impact: getBrandComplaintStats(brand.name) }))
    .sort((a, b) => b.impact.openComplaints - a.impact.openComplaints || b.impact.totalComplaints - a.impact.totalComplaints);
  return rankedBrands.map(({ brand, impact }) => {
    const tone = riskTone(impact.riskLevel);
    return `
      <div class="card">
        <span class="kicker ${tone}">${impact.riskLevel}</span>
        <h3>${brand.name}</h3>
        <p>${impact.openComplaints} açık dosya, ${impact.solvedComplaints} çözülen dosya ve %${impact.resolutionRate} çözüm oranı. ${impact.scoreImpactLabel}.</p>
        <div>${impact.openComplaints ? chip('Yanıt Bekleniyor', true) : chip('Stabil')}${tone === 'red' ? `${chip('İnceleme Altında', true)}${chip('Kullanıcı Uyarısı', true)}` : ''}</div>
      </div>
    `;
  }).join('');
}

function riskCenter() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker red">Kara Liste Aksiyon Alanı</div>
        <h1>Risk Uyarı <span class="grad">Merkezi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Kesin hüküm yok. Açık dosya, yanıt bekleme ve çözüm oranı sinyalleri kontrollü risk diliyle gösterilir.</p>
        <div class="grid cards3">
          ${riskSignalCards()}
        </div>
      </div>
    </section>
  `;
}

function responsible() {
  return `
    <section class="section"><div class="wrap"><div class="kicker red">Sorumlu Oyun ve Psikoloji</div><h1>Koruma <span class="grad">Katmanı</span></h1><p class="sub" style="margin-left:0;text-align:left">Kullanıcıyı yalnızca siteye yönlendirmiyoruz. Riskli davranışta limit, mola, duygusal kontrol ve destek modülleri öne çıkar.</p><div class="grid cards4"><div class="card"><h3>⏱ Zaman Kontrolü</h3><p>Günlük süre, mola ve aktivite uyarısı.</p></div><div class="card"><h3>💵 Bütçe Yönetimi</h3><p>Bütçe, kayıp limiti ve çekim koruması.</p></div><div class="card"><h3>🧠 Psikoloji Testi</h3><p>Kayıp kovalama ve duygu kontrolü ölçülür.</p></div><div class="card"><h3>👥 Sosyal Destek</h3><p>Destek grupları ve uzman yönlendirme.</p></div></div></div></section>
  `;
}

function aiAdvisor() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker purple">AI Danışman</div>
        <h1>Yapay Zeka Destekli <span class="grad">Rehberlik</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Güvenlik, şikayet, psikoloji ve ödül akışı için kontrollü yönlendirme.</p>
        <div class="chat">
          <aside><div class="expert active">🧠 Dr. Psikoloji<br><small>Oyun kontrolü</small></div><div class="expert">🛡 Güvenlik Uzmanı<br><small>Site analizi</small></div><div class="expert">📊 Analiz Uzmanı<br><small>Veri ve skor</small></div><div class="expert">💡 Ödül Danışmanı<br><small>Puan ve sadakat</small></div></aside>
          <div class="chatbox"><div class="chathead">Dr. Psikoloji <span class="chip">Online</span></div><div class="msgs">${state.aiMessages.map((m) => `<div class="msg ${m.role === 'me' ? 'me' : ''}">${escapeHtml(m.text)}</div>`).join('')}</div><form class="chatinput" data-ai-form><input class="input" name="message" placeholder="Güvenlik, şikayet veya oyun kontrolü hakkında sorunuzu yazın..."><button class="btn purple">➤</button></form></div>
        </div>
      </div>
    </section>
  `;
}

function generic(title, kicker, description, cards) {
  return `<section class="section"><div class="wrap"><div class="kicker">${kicker}</div><h1>${title}</h1><p class="sub" style="margin-left:0;text-align:left">${description}</p><div class="grid cards3">${cards.map((c) => `<div class="card"><h3>${c[0]}</h3><p>${c[1]}</p></div>`).join('')}</div></div></section>`;
}

function view() {
  switch (state.route) {
    case '/': return home();
    case '/puanlama-motoru': return pointsEngine();
    case '/sikayetler': return complaints();
    case '/marka-ligi': return siteLeague();
    case '/firma-rekabeti': return brandArena();
    case '/kara-liste': return riskCenter();
    case '/sorumlu-kullanim':
    case '/kullanici-psikolojisi': return responsible();
    case '/ai-danisman': return aiAdvisor();
    case '/topluluk-merkezi': return generic('Topluluk Merkezi', 'Birlikte İyileşiyoruz', 'Yorum, şikayet desteği, başarı hikayesi, mentorluk ve ödül sistemi tek yerde çalışır.', [['Forum', 'Deneyim paylaşımı ve faydalı cevaplar.'], ['Etkinlikler', 'Haftalık farkındalık buluşmaları.'], ['Mentorluk', 'Deneyimli üyelerden destek.']]);
    case '/wellness-merkezi': return generic('Wellness Merkezi', 'Ruh Sağlığı ve Wellness', 'Sağlıklı oyun alışkanlıkları geliştirin, uzman desteği alın ve toplulukla iyileşin.', [['Mindful Gaming', '4 hafta · 8 seans.'], ['Healthy Limits', 'Kontrollü limit alışkanlığı.'], ['Digital Detox', '7 günlük dijital mola.']]);
    case '/sertifikasyon': return generic('Güvenilirliğinizi Belgeleyin', 'Sertifikasyon', 'Firmalar için doğrulanabilir güven sertifikası, denetim ve raporlama modeli.', [['Temel Güven Sertifikası', 'Lisans kontrolü ve şikayet takibi.'], ['Gelişmiş Sertifika', 'KYC, ödeme ve bonus şartları analizi.'], ['Premium Diamond', 'Risk raporu ve marka yöneticisi paneli.']]);
    case '/marka-yonetimi': return brandOperationsPanel();
    case '/admin-markalar': return adminBrandPanel();
    default: return home();
  }
}

function render() {
  installStyles();
  root().innerHTML = `
    <div class="app">
      ${sidebar()}
      <main class="main">${topbar()}<div class="scroll">${view()}</div></main>
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      routeTo(el.getAttribute('href'));
    });
  });
  document.querySelector('[data-menu]')?.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  });
  document.querySelector('[data-search]')?.addEventListener('input', (event) => {
    state.search = event.target.value;
    render();
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.filter;
      render();
    });
  });
  document.querySelectorAll('[data-mission]').forEach((button) => {
    button.addEventListener('click', () => {
      claimMission(button.dataset.mission);
    });
  });
  document.querySelector('[data-reward]')?.addEventListener('click', () => {
    claimRewardEligibility();
  });
  document.querySelector('[data-brand-ops-brand]')?.addEventListener('change', (event) => {
    state.brandOpsSelection = event.target.value;
    state.brandOpsComplaintDraft = '';
    saveStore();
    render();
  });
  document.querySelector('[data-brand-action-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitBrandAction(new FormData(event.target));
  });
  document.querySelectorAll('[data-admin-select]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedAdminBrand = button.dataset.adminSelect;
      state.adminBrandDraft = {};
      saveStore();
      render();
    });
  });
  document.querySelectorAll('[data-admin-status]').forEach((button) => {
    button.addEventListener('click', () => setAdminBrandStatus(button.dataset.adminId, button.dataset.adminStatus));
  });
  document.querySelector('[data-admin-brand-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAdminBrand(new FormData(event.target));
  });
  document.querySelector('[data-admin-new]')?.addEventListener('click', () => {
    state.selectedAdminBrand = '';
    state.adminBrandDraft = {};
    render();
  });
  document.querySelector('[data-risk]')?.addEventListener('click', () => {
    state.riskScore = 18;
    addFeed('Risk alarmı tetiklendi · marka görünürlüğü düştü');
    saveStore();
    routeTo('/kara-liste');
    setTimeout(() => showToast('Risk alarmı tetiklendi. Marka görünürlüğü düştü.'), 80);
  });
  document.querySelector('[data-improve]')?.addEventListener('click', () => {
    gain(25, 'Çözüm hamlesi kaydedildi');
  });
  document.querySelector('[data-complaint-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    createComplaint(new FormData(event.target));
  });
  document.querySelectorAll('[data-approve-complaint]').forEach((button) => {
    button.addEventListener('click', () => approveComplaint(button.dataset.approveComplaint));
  });
  document.querySelector('[data-ai-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = new FormData(event.target).get('message')?.toString().trim();
    if (!message) return;
    state.aiMessages.push({ role: 'me', text: message });
    state.aiMessages.push({ role: 'ai', text: 'Önce güven skoru, sonra şikayet çözümü, ardından ödül ve firma rekabet etkisi hesaplanır. Kötü deneyim markanın lig konumunu doğrudan düşürür.' });
    saveStore();
    render();
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

window.addEventListener('popstate', () => {
  state.route = normalize(location.pathname);
  render();
});

render();
