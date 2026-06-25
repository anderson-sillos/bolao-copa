const branchName = process.argv[2] || process.env.BRANCH_NAME;

const permanentBranches = /^(main)$/;
const automatedBranches = /^(dependabot|renovate)\//;
const workingBranches =
  /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!branchName) {
  console.error(
    'Informe a branch como argumento ou pela variável BRANCH_NAME.',
  );
  process.exit(2);
}

if (
  permanentBranches.test(branchName) ||
  automatedBranches.test(branchName) ||
  workingBranches.test(branchName)
) {
  console.log(`Nome de branch válido: ${branchName}`);
  process.exit(0);
}

console.error(`Nome de branch inválido: ${branchName}`);
console.error(
  'Use <tipo>/<slug-em-kebab-case>, por exemplo feat/autenticacao-jwt.',
);
process.exit(1);
