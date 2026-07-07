import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import { Environment } from '../config/environment';

const swaggerUiInitializer = `
window.addEventListener('load', () => {
  function persistBearerTokenFromAuthResponse(response) {
    const isAuthEndpoint =
      response.url.endsWith('/auth/login') ||
      response.url.endsWith('/auth/register');

    if (!isAuthEndpoint || !response.ok || !response.text) {
      return;
    }

    try {
      const body = JSON.parse(response.text);
      if (body.accessToken) {
        window.ui.preauthorizeApiKey('bearerAuth', body.accessToken);
      }
    } catch {
      // Mantém o comportamento padrão quando a resposta não estiver no formato esperado.
    }
  }

  window.ui = SwaggerUIBundle({
    url: '/docs-json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    persistAuthorization: true,
    responseInterceptor: response => {
      persistBearerTokenFromAuthResponse(response);
      return response;
    }
  });
});
`;

const swaggerUiAssets = new Map<string, string>();

function readSwaggerUiAsset(filename: string): string {
  const cachedAsset = swaggerUiAssets.get(filename);
  if (cachedAsset) {
    return cachedAsset;
  }

  const asset = readFileSync(join(getAbsoluteFSPath(), filename), 'utf8');
  swaggerUiAssets.set(filename, asset);
  return asset;
}

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
    '/groups': {
      get: {
        summary: 'Lista grupos da Copa com suas seleções',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Grupos da Copa',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/WorldCupGroup',
                  },
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
    '/teams': {
      get: {
        summary: 'Lista seleções da Copa',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Seleções da Copa',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/WorldCupTeam',
                  },
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
    '/games': {
      get: {
        summary: 'Lista jogos da Copa',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'phase',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: [
                'fase_de_grupos',
                'segunda_fase',
                'oitavas',
                'quartas',
                'semifinal',
                'terceiro_lugar',
                'final',
              ],
            },
          },
        ],
        responses: {
          200: {
            description: 'Jogos da Copa',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/WorldCupGame',
                  },
                },
              },
            },
          },
          400: {
            description: 'Fase inválida',
          },
          401: {
            description: 'Token ausente, inválido ou expirado',
          },
        },
      },
    },
    '/bets': {
      get: {
        summary: 'Lista os palpites do usuário autenticado',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Palpites do usuário autenticado',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/MatchBet',
                  },
                },
              },
            },
          },
          401: {
            description: 'Token ausente, inválido ou expirado',
          },
        },
      },
      post: {
        summary: 'Cria ou atualiza um palpite do usuário autenticado',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaveMatchBetRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Palpite salvo',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MatchBet',
                },
              },
            },
          },
          400: {
            description: 'Payload inválido ou jogo indisponível para palpites',
          },
          401: {
            description: 'Token ausente, inválido ou expirado',
          },
          404: {
            description: 'Jogo não encontrado',
          },
        },
      },
    },
    '/bets/{gameId}': {
      get: {
        summary: 'Consulta o palpite do usuário autenticado para um jogo',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'gameId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Palpite do usuário para o jogo ou null',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MatchBetLookup',
                },
              },
            },
          },
          401: {
            description: 'Token ausente, inválido ou expirado',
          },
        },
      },
      put: {
        summary: 'Atualiza o palpite do usuário autenticado para um jogo',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'gameId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateMatchBetRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Palpite atualizado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MatchBet',
                },
              },
            },
          },
          400: {
            description: 'Payload inválido ou jogo indisponível para palpites',
          },
          401: {
            description: 'Token ausente, inválido ou expirado',
          },
          404: {
            description: 'Jogo não encontrado',
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
            example: 'Participante',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'participante@example.com',
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
            example: 'participante@example.com',
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
      WorldCupGroupSummary: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            example: 'A',
          },
        },
      },
      WorldCupTeamSummary: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            example: 'Brasil',
          },
          countryCode: {
            type: 'string',
            example: 'BRA',
          },
          flagIconCode: {
            type: 'string',
            example: 'br',
          },
        },
      },
      WorldCupGroup: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            example: 'A',
          },
          teams: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/WorldCupTeamSummary',
            },
          },
        },
      },
      WorldCupTeam: {
        allOf: [
          {
            $ref: '#/components/schemas/WorldCupTeamSummary',
          },
          {
            type: 'object',
            properties: {
              group: {
                nullable: true,
                allOf: [
                  {
                    $ref: '#/components/schemas/WorldCupGroupSummary',
                  },
                ],
              },
            },
          },
        ],
      },
      WorldCupGame: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          phase: {
            type: 'string',
            example: 'fase_de_grupos',
          },
          gameTime: {
            type: 'string',
            format: 'date-time',
          },
          scoreA: {
            type: 'number',
            nullable: true,
          },
          scoreB: {
            type: 'number',
            nullable: true,
          },
          penaltyScoreA: {
            type: 'number',
            nullable: true,
          },
          penaltyScoreB: {
            type: 'number',
            nullable: true,
          },
          matchNumber: {
            type: 'number',
            nullable: true,
          },
          bracketOrder: {
            type: 'number',
            nullable: true,
            example: 1,
          },
          teamASource: {
            type: 'string',
            nullable: true,
            example: 'W89',
          },
          teamBSource: {
            type: 'string',
            nullable: true,
            example: 'W90',
          },
          groupName: {
            type: 'string',
            nullable: true,
            example: 'A',
          },
          teamA: {
            nullable: true,
            allOf: [
              {
                $ref: '#/components/schemas/WorldCupTeamSummary',
              },
            ],
          },
          teamB: {
            nullable: true,
            allOf: [
              {
                $ref: '#/components/schemas/WorldCupTeamSummary',
              },
            ],
          },
        },
      },
      SaveMatchBetRequest: {
        type: 'object',
        required: ['gameId', 'scoreA', 'scoreB'],
        properties: {
          gameId: {
            type: 'string',
            format: 'uuid',
          },
          scoreA: {
            type: 'integer',
            minimum: 0,
            example: 2,
          },
          scoreB: {
            type: 'integer',
            minimum: 0,
            example: 1,
          },
        },
      },
      UpdateMatchBetRequest: {
        type: 'object',
        required: ['scoreA', 'scoreB'],
        properties: {
          scoreA: {
            type: 'integer',
            minimum: 0,
            example: 2,
          },
          scoreB: {
            type: 'integer',
            minimum: 0,
            example: 1,
          },
        },
      },
      MatchBet: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          gameId: {
            type: 'string',
            format: 'uuid',
          },
          scoreA: {
            type: 'integer',
            minimum: 0,
          },
          scoreB: {
            type: 'integer',
            minimum: 0,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          game: {
            $ref: '#/components/schemas/WorldCupGame',
          },
        },
      },
      MatchBetLookup: {
        type: 'object',
        properties: {
          bet: {
            nullable: true,
            allOf: [
              {
                $ref: '#/components/schemas/MatchBet',
              },
            ],
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
    <script src="/docs/swagger-ui-init.js"></script>
  </body>
</html>`;
  }

  @Get('docs/swagger-ui.css')
  @Header('Content-Type', 'text/css; charset=utf-8')
  getSwaggerUiCss(): string {
    this.ensureEnabled();
    return readSwaggerUiAsset('swagger-ui.css');
  }

  @Get('docs/swagger-ui-bundle.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  getSwaggerUiBundle(): string {
    this.ensureEnabled();
    return readSwaggerUiAsset('swagger-ui-bundle.js');
  }

  @Get('docs/swagger-ui-init.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  getSwaggerUiInitializer(): string {
    this.ensureEnabled();
    return swaggerUiInitializer;
  }

  private ensureEnabled(): void {
    if (!this.config.get('API_DOCS_ENABLED', { infer: true })) {
      throw new NotFoundException();
    }
  }
}
