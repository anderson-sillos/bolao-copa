const authTokenKey = 'bolao-copa:auth-token';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

export function saveAuthToken(token: string): void {
  getLocalStorage()?.setItem(authTokenKey, token);
}

export function getAuthToken(): string | null {
  return getLocalStorage()?.getItem(authTokenKey) ?? null;
}

export function clearAuthToken(): void {
  getLocalStorage()?.removeItem(authTokenKey);
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}
