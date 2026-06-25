const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { existsSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { test } = require('node:test');
const { tmpdir } = require('node:os');
const path = require('node:path');

const rootDir = process.cwd();
const branchValidator = path.join(rootDir, 'scripts/validate-branch-name.cjs');
const commitlintCli = path.join(
  path.dirname(require.resolve('@commitlint/cli')),
  'cli.js',
);

function validateBranch(branchName) {
  return spawnSync(process.execPath, [branchValidator, branchName], {
    cwd: rootDir,
    encoding: 'utf8',
  });
}

function validateCommit(message) {
  const temporaryRoot = existsSync('/tmp') ? '/tmp' : tmpdir();
  const directory = mkdtempSync(path.join(temporaryRoot, 'commitlint-'));
  const messageFile = path.join(directory, 'COMMIT_EDITMSG');
  writeFileSync(messageFile, `${message}\n`);

  try {
    return spawnSync(process.execPath, [commitlintCli, '--edit', messageFile], {
      cwd: rootDir,
      encoding: 'utf8',
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('aceita branches permanentes, de trabalho e automação', () => {
  for (const branch of [
    'main',
    'feat/autenticacao-jwt',
    'fix/health-check',
    'docs/guia-contribuicao',
    'dependabot/npm_and_yarn/next-17',
  ]) {
    assert.equal(validateBranch(branch).status, 0, branch);
  }
});

test('rejeita branches fora do padrão', () => {
  for (const branch of [
    'feature/autenticacao',
    'feat/Autenticacao',
    'feat/autenticacao_jwt',
    'develop',
  ]) {
    assert.equal(validateBranch(branch).status, 1, branch);
  }
});

test('aceita mensagens Conventional Commits', () => {
  for (const message of [
    'feat(auth): adiciona autenticação JWT',
    'fix: corrige health check',
    'docs: documenta estratégia de branches',
  ]) {
    assert.equal(validateCommit(message).status, 0, message);
  }
});

test('rejeita mensagens fora da convenção', () => {
  for (const message of [
    'adiciona autenticação',
    'feature: adiciona autenticação',
    'feat(Auth): adiciona autenticação',
  ]) {
    assert.notEqual(validateCommit(message).status, 0, message);
  }
});
