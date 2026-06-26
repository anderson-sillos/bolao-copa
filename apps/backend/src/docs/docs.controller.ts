import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import { Environment } from '../config/environment';

const swaggerUiPath = getAbsoluteFSPath();
const swaggerUiCss = readFileSync(
  join(swaggerUiPath, 'swagger-ui.css'),
  'utf8',
);
const swaggerUiBundle = readFileSync(
  join(swaggerUiPath, 'swagger-ui-bundle.js'),
  'utf8',
);

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
    '/auth/register': {
      post: {
        summary: 'Cria um usuário e retorna um access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado e autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos ou senha fraca',
          },
          409: {
            description: 'E-mail já cadastrado',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Autentica usuário com e-mail e senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
          },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Retorna o perfil do usuário autenticado',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Perfil do usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PublicUser',
                },
              },
            },
          },
          401: {
            description: 'Token ausente, inválido ou expirado',
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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 120,
            example: 'Anderson Martins',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'anderson@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            example: 'Bolao2026',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'anderson@example.com',
          },
          password: {
            type: 'string',
            example: 'Bolao2026',
          },
        },
      },
      PublicUser: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
          },
          tokenType: {
            type: 'string',
            enum: ['Bearer'],
          },
          expiresIn: {
            type: 'number',
            example: 3600,
          },
          user: {
            $ref: '#/components/schemas/PublicUser',
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
    <link rel="stylesheet" href="/docs/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js"></script>
    <script>
      window.addEventListener('load', () => {
        window.ui = SwaggerUIBundle({
          url: '/docs-json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          persistAuthorization: true
        });
      });
    </script>
  </body>
</html>`;
  }

  @Get('docs/swagger-ui.css')
  @Header('Content-Type', 'text/css; charset=utf-8')
  getSwaggerUiCss(): string {
    this.ensureEnabled();
    return swaggerUiCss;
  }

  @Get('docs/swagger-ui-bundle.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  getSwaggerUiBundle(): string {
    this.ensureEnabled();
    return swaggerUiBundle;
  }

  private ensureEnabled(): void {
    if (!this.config.get('API_DOCS_ENABLED', { infer: true })) {
      throw new NotFoundException();
    }
  }
}
