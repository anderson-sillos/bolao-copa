import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { Environment } from './config/environment';

async function runWithProgress<T>(
  logger: Logger,
  startMessage: string,
  waitingMessage: string,
  task: () => Promise<T>,
): Promise<T> {
  logger.log(startMessage);
  const heartbeat = setInterval(() => {
    logger.log(waitingMessage);
  }, 10_000);

  try {
    return await task();
  } finally {
    clearInterval(heartbeat);
  }
}

async function bootstrap() {
  const startedAt = Date.now();
  const logger = new Logger('Bootstrap');

  logger.log('Iniciando API do Bolão da Copa...');
  const { AppModule } = await runWithProgress(
    logger,
    'Carregando AppModule...',
    'Ainda carregando AppModule; no WSL em /mnt/c esta etapa pode demorar.',
    () => import('./app.module.js'),
  );

  const app = await runWithProgress(
    logger,
    'Criando aplicação e inicializando módulos...',
    'Ainda inicializando módulos Nest e provedores...',
    () => NestFactory.create(AppModule),
  );
  logger.log('Módulos inicializados');

  const config = app.get(ConfigService<Environment, true>);
  logger.log('Configuração carregada e validada');

  app.use(helmet());
  logger.log('Helmet configurado');

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  logger.log('ValidationPipe configurado');

  const corsOrigin = config.get('CORS_ORIGIN', { infer: true });
  app.enableCors({
    origin: corsOrigin,
  });
  logger.log(`CORS habilitado para ${corsOrigin}`);

  const port = config.get('PORT', { infer: true });
  const apiDocsEnabled = config.get('API_DOCS_ENABLED', { infer: true });
  logger.log(`Iniciando servidor HTTP na porta ${port}...`);
  await app.listen(port);
  logger.log(`API disponível em http://localhost:${port}`);

  if (apiDocsEnabled) {
    logger.log(`Swagger UI disponível em http://localhost:${port}/docs`);
  }

  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  logger.log(`Inicialização concluída em ${elapsedSeconds}s`);
}

bootstrap().catch(error => {
  const logger = new Logger('Bootstrap');
  logger.error('Falha ao iniciar a API', error);
  process.exit(1);
});
