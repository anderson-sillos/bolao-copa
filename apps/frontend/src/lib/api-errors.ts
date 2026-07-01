const fallbackErrorMessage = 'Não foi possível completar a solicitação.';

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  readonly messages: string[];
  readonly statusCode?: number;
  readonly payload?: unknown;

  constructor(messages: string[], statusCode?: number, payload?: unknown) {
    super(messages.join('\n'));
    this.name = 'ApiError';
    this.messages = messages;
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

export function getErrorMessages(error: unknown): string[] {
  if (error instanceof ApiError) {
    return error.messages;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return [error.message];
  }
  return [fallbackErrorMessage];
}

export function getErrorMessage(error: unknown): string {
  return getErrorMessages(error).join('\n');
}

export async function createApiError(response: Response): Promise<ApiError> {
  const payload = await readErrorPayload(response);
  const messages = extractPayloadMessages(payload);

  return new ApiError(messages, response.status, payload);
}

async function readErrorPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function extractPayloadMessages(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') {
    return [fallbackErrorMessage];
  }

  const { message, error } = payload as ApiErrorPayload;

  if (Array.isArray(message)) {
    const messages = message.filter(isNonEmptyString);
    return messages.length > 0 ? messages : [fallbackErrorMessage];
  }

  if (isNonEmptyString(message)) {
    return [message];
  }

  if (isNonEmptyString(error)) {
    return [error];
  }

  return [fallbackErrorMessage];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}
