export const AUTH_SESSION_KEY = 'guveniyorum-auth-session-v1';

export function readAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeAuthSession(session) {
  if (!session) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('guveniyorum-auth-change', { detail: null }));
    return null;
  }

  const normalized = normalizeSession(session);
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('guveniyorum-auth-change', { detail: normalized }));
  return normalized;
}

export function clearAuthSession() {
  return writeAuthSession(null);
}

export function normalizeSession(session) {
  const user = session.user || session;
  const metadata = user.user_metadata || user.identities?.[0]?.identity_data || {};
  const email = user.email || metadata.email || session.email || '';
  const displayName = metadata.full_name || metadata.name || user.displayName || session.displayName || email || 'Yeni Üye';
  return {
    id: user.id || session.id || email || `local-${Date.now()}`,
    email,
    displayName,
    avatarUrl: metadata.avatar_url || user.avatarUrl || session.avatarUrl || '',
    wallet: session.wallet ?? 0,
    xp: session.xp ?? 0,
    level: session.level || 'Yeni Üye',
    provider: session.provider || user.app_metadata?.provider || 'email',
    updatedAt: new Date().toISOString(),
  };
}

export function initSupabaseAuthBridge(supabaseClient) {
  if (!supabaseClient?.auth?.onAuthStateChange) return null;

  const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) writeAuthSession(session);
    else clearAuthSession();
  });

  return data?.subscription || null;
}

export async function signOutAuth(supabaseClient) {
  clearAuthSession();
  if (supabaseClient?.auth?.signOut) await supabaseClient.auth.signOut();
}
