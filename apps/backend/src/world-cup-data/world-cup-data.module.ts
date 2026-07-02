import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Game } from '../entities/game.entity';
import { Group } from '../entities/group.entity';
import { Team } from '../entities/team.entity';
import { WorldCupDataController } from './world-cup-data.controller';
import { WorldCupDataService } from './world-cup-data.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Group, Team, Game])],
  controllers: [WorldCupDataController],
  providers: [WorldCupDataService],
})
export class WorldCupDataModule {}
