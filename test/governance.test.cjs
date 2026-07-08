const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { test } = require('node:test');
const { tmpdir } = require('node:os');
const path = require('node:path');

const rootDir = process.cwd();
const branchValidator = path.join(rootDir, 'scripts/validate-branch-name.cjs');
const workflowsDir = path.join(rootDir, '.github/workflows');
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

function readWorkflow(fileName) {
  return readFileSync(path.join(workflowsDir, fileName), 'utf8');
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
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

test('workflows separam metadados de PR da validação técnica', () => {
  assert.equal(existsSync(path.join(workflowsDir, 'ci.yml')), false);
  assert.equal(existsSync(path.join(workflowsDir, 'metadata.yml')), true);
  assert.equal(existsSync(path.join(workflowsDir, 'validate.yml')), true);

  const metadataWorkflow = readWorkflow('metadata.yml');
  const validateWorkflow = readWorkflow('validate.yml');

  assert.match(metadataWorkflow, /^name: Metadata$/m);
  assert.match(metadataWorkflow, /^\s{2}pull_request:$/m);
  assert.doesNotMatch(metadataWorkflow, /^\s{2}push:$/m);
  assert.match(metadataWorkflow, /^\s{4}name: Metadata$/m);
  assert.match(metadataWorkflow, /npm run validate:branch -- "\$BRANCH_NAME"/);
  assert.match(
    metadataWorkflow,
    /printf '%s\\n' "\$PR_TITLE" \| npm run commitlint/,
  );

  assert.match(validateWorkflow, /^name: Validate$/m);
  assert.match(validateWorkflow, /^\s{2}push:$/m);
  assert.match(validateWorkflow, /^\s{2}pull_request:$/m);
  assert.match(validateWorkflow, /^\s{4}name: Format$/m);
  assert.match(validateWorkflow, /^\s{4}name: Lint$/m);
  assert.match(validateWorkflow, /^\s{4}name: Build$/m);
  assert.match(validateWorkflow, /^\s{4}name: Governance$/m);
  assert.match(validateWorkflow, /^\s{4}name: Coverage$/m);
  assert.match(validateWorkflow, /^\s{4}name: Foundation$/m);
  assert.match(validateWorkflow, /^\s{4}name: Audit$/m);
  assert.equal(countMatches(validateWorkflow, /actions\/checkout@v7/g), 7);
  assert.equal(countMatches(validateWorkflow, /actions\/setup-node@v6/g), 7);
  assert.equal(
    countMatches(validateWorkflow, /node-version-file: \.node-version/g),
    7,
  );
  assert.equal(countMatches(validateWorkflow, /cache: npm/g), 7);
  assert.equal(countMatches(validateWorkflow, /run: npm ci/g), 7);
  assert.match(validateWorkflow, /image: postgres:15/);
  assert.equal(countMatches(validateWorkflow, /image: postgres:15/g), 1);
  assert.match(validateWorkflow, /npm run format:check/);
  assert.match(validateWorkflow, /npm run lint/);
  assert.match(validateWorkflow, /npm run build/);
  assert.match(validateWorkflow, /npm run test:governance/);
  assert.match(validateWorkflow, /npm run test:coverage/);
  assert.match(validateWorkflow, /npm run test:foundation:ci/);
  assert.match(validateWorkflow, /npm run audit/);
  assert.doesNotMatch(validateWorkflow, /npm run ci:runner/);
});
