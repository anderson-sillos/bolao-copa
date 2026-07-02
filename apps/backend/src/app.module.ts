import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Team } from './entities/team.entity';
import { Game } from './entities/game.entity';
import { Bet } from './entities/bet.entity';
import { Group } from './entities/group.entity';
import { validateEnvironment } from './config/environment';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { RequestContextMiddleware } from './common/request-context.middleware';
import { DocsController } from './docs/docs.controller';
import { AuthModule } from './auth/auth.module';
import { WorldCupDataModule } from './world-cup-data/world-cup-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Team, Game, Bet, Group],
        synchronize: false, // `false` em produção, usaremos migrações
      }),
    }),
    AuthModule,
    WorldCupDataModule,
  ],
  controllers: [AppController, HealthController, DocsController],
  providers: [AppService, HealthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
