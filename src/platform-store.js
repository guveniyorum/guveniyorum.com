const STORAGE_KEY = 'guveniyorum-platform-state-v1';

const initialState = {
  session: {
    isAuthenticated: false,
    activeUserId: 'user-demo-admin'
  },
  profiles: [
    {
      id: 'user-demo-admin',
      email: 'admin@guveniyorum.com',
      displayName: 'Mustafa',
      role: 'admin',
      level: 7,
      xp: 1840,
      points: 425,
      trustScore: 92
    }
  ],
  brands: [
    { id: 'brand-safe', name: 'SafeMark', slug: 'safemark', domain: 'safemark.example', status: 'trusted', trustScore: 98, complaintCount: 12, solvedCount: 10, responseTimeHours: 2 },
    { id: 'brand-guven', name: 'GüvenMark', slug: 'guvenmark', domain: 'guvenmark.example', status: 'under_review', trustScore: 88, complaintCount: 18, solvedCount: 13, responseTimeHours: 5 },
    { id: 'brand-risk', name: 'RiskMark', slug: 'riskmark', domain: 'riskmark.example', status: 'high_risk', trustScore: 52, complaintCount: 89, solvedCount: 31, responseTimeHours: 36 }
  ],
  complaints: [
    {
      id: 'cmp-1',
      publicId: 'GVN-2026-0001',
      userId: 'user-demo-admin',
      brandId: 'brand-guven',
      brandName: 'GüvenMark',
      title: 'İşlem gecikmesi bildirimi',
      category: 'Ödeme gecikmesi',
      description: 'Kullanıcı işleminin geciktiğini bildirdi.',
      status: 'pending_review',
      evidenceLevel: 'medium',
      rewardStatus: 'pending',
      createdAt: new Date().toISOString()
    }
  ],
  pointTransactions: [
    { id: 'pt-1', userId: 'user-demo-admin', sourceType: 'seed', sourceId: 'cmp-1', points: 25, xp: 80, status: 'approved', reason: 'İlk doğrulanmış katkı' }
  ],
  notifications: [
    { id: 'ntf-1', userId: 'user-demo-admin', title: 'Dosyan incelemede', body: 'GVN-2026-0001 moderasyon kuyruğuna alındı.', read: false }
  ],
  psychologyResults: [],
  adminActions: []
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialState);
    return { ...structuredClone(initialState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('gi:state', { detail: state }));
}

function publicId(state) {
  return `GVN-${new Date().getFullYear()}-${String(state.complaints.length + 1).padStart(4, '0')}`;
}

export const platformStore = {
  getState() {
    return loadState();
  },

  reset() {
    const state = structuredClone(initialState);
    saveState(state);
    return state;
  },

  currentUser() {
    const state = loadState();
    return state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0];
  },

  signIn(email = 'admin@guveniyorum.com') {
    const state = loadState();
    let profile = state.profiles.find(item => item.email === email);
    if (!profile) {
      profile = {
        id: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: 'user',
        level: 1,
        xp: 0,
        points: 0,
        trustScore: 70
      };
      state.profiles.push(profile);
    }
    state.session.isAuthenticated = true;
    state.session.activeUserId = profile.id;
    saveState(state);
    return profile;
  },

  createComplaint(payload) {
    const state = loadState();
    const user = state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0];
    const brand = state.brands.find(item => item.id === payload.brandId || item.name === payload.brandName) || null;
    const complaint = {
      id: `cmp-${Date.now()}`,
      publicId: publicId(state),
      userId: user.id,
      brandId: brand?.id || null,
      brandName: brand?.name || payload.brandName || 'Yeni Marka',
      title: payload.title || 'Yeni şikayet bildirimi',
      category: payload.category || 'Genel bildirim',
      description: payload.description || 'Kullanıcı açıklaması bekleniyor.',
      amount: payload.amount || null,
      paymentMethod: payload.paymentMethod || null,
      status: 'pending_review',
      evidenceLevel: payload.evidenceLevel || 'low',
      rewardStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    state.complaints.unshift(complaint);
    state.notifications.unshift({
      id: `ntf-${Date.now()}`,
      userId: user.id,
      title: 'Şikayetin onaya sunuldu',
      body: `${complaint.publicId} dosyası admin moderasyon kuyruğuna alındı.`,
      read: false
    });
    saveState(state);
    return complaint;
  },

  approveComplaint(complaintId) {
    const state = loadState();
    const complaint = state.complaints.find(item => item.id === complaintId || item.publicId === complaintId);
    if (!complaint) return null;
    complaint.status = 'approved';
    complaint.rewardStatus = 'approved';
    const user = state.profiles.find(profile => profile.id === complaint.userId);
    if (user) {
      user.xp += 80;
      user.points += 25;
      user.level = Math.max(1, Math.floor(user.xp / 1000) + 1);
    }
    state.pointTransactions.unshift({
      id: `pt-${Date.now()}`,
      userId: complaint.userId,
      sourceType: 'complaint',
      sourceId: complaint.id,
      points: 25,
      xp: 80,
      status: 'approved',
      reason: `${complaint.publicId} onaylandı`
    });
    state.notifications.unshift({
      id: `ntf-${Date.now()}`,
      userId: complaint.userId,
      title: 'Şikayetin onaylandı',
      body: `${complaint.publicId} onaylandı. +25 puan ve +80 XP profil hesabına işlendi.`,
      read: false
    });
    saveState(state);
    return complaint;
  },

  rejectComplaint(complaintId, note = 'Kanıt seviyesi yetersiz.') {
    const state = loadState();
    const complaint = state.complaints.find(item => item.id === complaintId || item.publicId === complaintId);
    if (!complaint) return null;
    complaint.status = 'rejected';
    complaint.rewardStatus = 'rejected';
    complaint.adminNote = note;
    state.notifications.unshift({
      id: `ntf-${Date.now()}`,
      userId: complaint.userId,
      title: 'Şikayet için ek bilgi gerekli',
      body: `${complaint.publicId}: ${note}`,
      read: false
    });
    saveState(state);
    return complaint;
  },

  submitPsychologyTest(score, answers = {}) {
    const state = loadState();
    const user = state.profiles.find(profile => profile.id === state.session.activeUserId) || state.profiles[0];
    const riskLevel = score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low';
    const result = {
      id: `psy-${Date.now()}`,
      userId: user.id,
      score,
      riskLevel,
      answers,
      recommendations: riskLevel === 'high'
        ? ['Limitleri düşür', '24 saat mola ver', 'Wellness desteği al']
        : ['Haftalık kontrol yap', 'Bütçe sınırını takip et'],
      createdAt: new Date().toISOString()
    };
    state.psychologyResults.unshift(result);
    user.xp += 35;
    user.points += 10;
    saveState(state);
    return result;
  }
};

window.platformStore = platformStore;
