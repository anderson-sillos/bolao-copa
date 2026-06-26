export type TokenExpiration = `${number}${'s' | 'm' | 'h' | 'd'}`;

export type Environment = {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  PORT: number;
  CORS_ORIGIN: string;
  API_DOCS_ENABLED: boolean;
  AUTH_JWT_SECRET: string;
  AUTH_TOKEN_EXPIRES_IN: TokenExpiration;
};

function required(input: Record<string, unknown>, name: string): string {
  const value = input[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Variável de ambiente obrigatória inválida: ${name}`);
  }
  return value.trim();
}

function port(
  input: Record<string, unknown>,
  name: string,
  fallback?: number,
): number {
  const raw = input[name];
  if ((raw === undefined || raw === '') && fallback !== undefined) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Porta inválida em ${name}: ${String(raw)}`);
  }
  return value;
}

function boolean(
  input: Record<string, unknown>,
  name: string,
  fallback: boolean,
): boolean {
  const raw = input[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  if (raw === true || raw === 'true') {
    return true;
  }
  if (raw === false || raw === 'false') {
    return false;
  }
  throw new Error(`Booleano inválido em ${name}: ${String(raw)}`);
}

function jwtSecret(input: Record<string, unknown>): string {
  const value = required(input, 'AUTH_JWT_SECRET');
  if (value.length < 32) {
    throw new Error('AUTH_JWT_SECRET deve possuir pelo menos 32 caracteres');
  }
  return value;
}

function tokenExpiration(input: Record<string, unknown>): TokenExpiration {
  const value = required(input, 'AUTH_TOKEN_EXPIRES_IN');
  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error(
      'AUTH_TOKEN_EXPIRES_IN deve usar o formato <número><s|m|h|d>',
    );
  }
  return value as TokenExpiration;
}

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const corsOrigin = required(input, 'CORS_ORIGIN');
  try {
    new URL(corsOrigin);
  } catch {
    throw new Error(`URL inválida em CORS_ORIGIN: ${corsOrigin}`);
  }

  return {
    DB_HOST: required(input, 'DB_HOST'),
    DB_PORT: port(input, 'DB_PORT'),
    DB_USERNAME: required(input, 'DB_USERNAME'),
    DB_PASSWORD: required(input, 'DB_PASSWORD'),
    DB_DATABASE: required(input, 'DB_DATABASE'),
    PORT: port(input, 'PORT', 3000),
    CORS_ORIGIN: corsOrigin,
    API_DOCS_ENABLED: boolean(input, 'API_DOCS_ENABLED', false),
    AUTH_JWT_SECRET: jwtSecret(input),
    AUTH_TOKEN_EXPIRES_IN: tokenExpiration(input),
  };
}
