import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';

export function loadLocalEnvironment(
  environmentFile = resolve(process.cwd(), '.env'),
): void {
  if (existsSync(environmentFile)) {
    loadEnvFile(environmentFile);
  }
}
