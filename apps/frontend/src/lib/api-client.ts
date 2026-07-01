import { createApiError } from './api-errors';

const defaultApiUrl = 'http://localhost:3000';

export type ApiFetchOptions = globalThis.RequestInit & {
  token?: string | null;
};

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;
}

export function createApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  return new URL(
    path,
    baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`,
  ).toString();
}

export async function apiFetch<TResponse>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { token, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type') && requestOptions.body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(createApiUrl(path), {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
