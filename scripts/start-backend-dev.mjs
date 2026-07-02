import { spawn } from 'node:child_process';

const startedAt = Date.now();

function elapsedSeconds() {
  return ((Date.now() - startedAt) / 1000).toFixed(1);
}

function log(message) {
  console.log(`[Backend Dev +${elapsedSeconds()}s] ${message}`);
}

log('Iniciando backend em modo desenvolvimento...');
log(
  'Chamando Nest CLI em modo watch. A primeira compilação pode demorar no WSL, especialmente em /mnt/c.',
);

const child = spawn('nest', ['start', '--watch', '--preserveWatchOutput'], {
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

const heartbeat = setInterval(() => {
  log('Aguardando compilação/watch do Nest ou bootstrap da aplicação...');
}, 15_000);

child.on('spawn', () => {
  log(
    'Nest CLI iniciado; aguardando compilação TypeScript e execução do bootstrap.',
  );
});

child.on('error', error => {
  clearInterval(heartbeat);
  console.error(
    `[Backend Dev +${elapsedSeconds()}s] Falha ao iniciar Nest CLI.`,
  );
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  clearInterval(heartbeat);

  if (signal) {
    log(`Processo finalizado por sinal ${signal}.`);
    process.exit(0);
  }

  log(`Processo finalizado com código ${code ?? 0}.`);
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    log(`Recebido ${signal}; encerrando Nest CLI...`);
    child.kill(signal);
  });
}
