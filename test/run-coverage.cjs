const { execFileSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { tmpdir } = require('node:os');

const temporaryDirectory = existsSync('/tmp') ? '/tmp' : tmpdir();

execFileSync(
  process.execPath,
  [
    '--test',
    '--experimental-test-coverage',
    '--test-coverage-include=apps/backend/src/config/environment.ts',
    '--test-coverage-lines=90',
    '--test-coverage-functions=90',
    '--test-coverage-branches=80',
    'test/unit/environment.test.cjs',
  ],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      TMPDIR: temporaryDirectory,
      TEMP: temporaryDirectory,
      TMP: temporaryDirectory,
    },
    stdio: 'inherit',
  },
);
