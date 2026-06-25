import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../config/environment';

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Bolão da Copa API',
    description: 'API do Bolão da Copa 2026',
    version: '1.0.0',
  },
  paths: {
    '/': {
      get: {
        summary: 'Confirma que a API está disponível',
        responses: {
          200: {
            description: 'API disponível',
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Verifica a saúde da API e do PostgreSQL',
        responses: {
          200: {
            description: 'Aplicação e banco saudáveis',
          },
          503: {
            description: 'Banco indisponível',
          },
        },
      },
    },
  },
};

@Controller()
export class DocsController {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  @Get('docs-json')
  getOpenApiDocument() {
    this.ensureEnabled();
    return openApiDocument;
  }

  @Get('docs')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getDocumentation(): string {
    this.ensureEnabled();
    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bolão da Copa API</title>
  </head>
  <body>
    <main>
      <h1>Bolão da Copa API</h1>
      <p>A especificação OpenAPI está disponível em <a href="/docs-json">/docs-json</a>.</p>
      <ul>
        <li><code>GET /</code> — disponibilidade da API</li>
        <li><code>GET /health</code> — saúde da aplicação e do PostgreSQL</li>
      </ul>
    </main>
  </body>
</html>`;
  }

  private ensureEnabled(): void {
    if (!this.config.get('API_DOCS_ENABLED', { infer: true })) {
      throw new NotFoundException();
    }
  }
}
