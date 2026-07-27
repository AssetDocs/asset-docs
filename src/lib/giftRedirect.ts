const GIFT_REDIRECT_KEY = 'asset_safe_gift_redirect';
const GIFT_REDIRECT_CREATED_AT_KEY = 'asset_safe_gift_redirect_created_at';
const GIFT_REDIRECT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const isGiftRedirectPath = (redirect: string | null | undefined) =>
  !!redirect &&
  redirect.startsWith('/') &&
  !redirect.startsWith('//') &&
  (redirect.startsWith('/gift-claim') || redirect.startsWith('/redeem'));

const readStoredValue = (storage: Storage | undefined, key: string) => {
  try {
    return storage?.getItem(key) || null;
  } catch {
    return null;
  }
};

const removeStoredValue = (storage: Storage | undefined, key: string) => {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore storage availability errors.
  }
};

export const clearStoredGiftRedirect = () => {
  if (typeof window === 'undefined') return;

  removeStoredValue(window.sessionStorage, GIFT_REDIRECT_KEY);
  removeStoredValue(window.sessionStorage, GIFT_REDIRECT_CREATED_AT_KEY);
  removeStoredValue(window.localStorage, GIFT_REDIRECT_KEY);
  removeStoredValue(window.localStorage, GIFT_REDIRECT_CREATED_AT_KEY);
};

export const storeGiftRedirect = (redirect: string | null | undefined) => {
  if (typeof window === 'undefined' || !isGiftRedirectPath(redirect)) return;

  const createdAt = Date.now().toString();
  try {
    window.sessionStorage.setItem(GIFT_REDIRECT_KEY, redirect);
    window.sessionStorage.setItem(GIFT_REDIRECT_CREATED_AT_KEY, createdAt);
  } catch {
    // Ignore storage availability errors.
  }

  try {
    window.localStorage.setItem(GIFT_REDIRECT_KEY, redirect);
    window.localStorage.setItem(GIFT_REDIRECT_CREATED_AT_KEY, createdAt);
  } catch {
    // Ignore storage availability errors.
  }
};

export const getStoredGiftRedirect = () => {
  if (typeof window === 'undefined') return null;

  const redirect =
    readStoredValue(window.sessionStorage, GIFT_REDIRECT_KEY) ||
    readStoredValue(window.localStorage, GIFT_REDIRECT_KEY);

  const createdAtRaw =
    readStoredValue(window.sessionStorage, GIFT_REDIRECT_CREATED_AT_KEY) ||
    readStoredValue(window.localStorage, GIFT_REDIRECT_CREATED_AT_KEY);

  const createdAt = createdAtRaw ? Number(createdAtRaw) : 0;
  const isExpired = !createdAt || Date.now() - createdAt > GIFT_REDIRECT_MAX_AGE_MS;

  if (!isGiftRedirectPath(redirect) || isExpired) {
    clearStoredGiftRedirect();
    return null;
  }

  return redirect;
};
