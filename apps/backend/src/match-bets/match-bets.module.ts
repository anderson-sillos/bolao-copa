import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Bet } from '../entities/bet.entity';
import { Game } from '../entities/game.entity';
import { MatchBetsController } from './match-bets.controller';
import { MatchBetsService } from './match-bets.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Bet, Game])],
  controllers: [MatchBetsController],
  providers: [MatchBetsService],
})
export class MatchBetsModule {}
