import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  WorldCupGameDto,
  WorldCupGroupDto,
  WorldCupTeamDto,
} from './world-cup-data.dto';
import { WorldCupDataService } from './world-cup-data.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class WorldCupDataController {
  constructor(private readonly worldCupData: WorldCupDataService) {}

  @Get('groups')
  async listGroups(): Promise<WorldCupGroupDto[]> {
    return this.worldCupData.listGroups();
  }

  @Get('teams')
  async listTeams(): Promise<WorldCupTeamDto[]> {
    return this.worldCupData.listTeams();
  }

  @Get('games')
  async listGames(@Query('phase') phase?: string): Promise<WorldCupGameDto[]> {
    return this.worldCupData.listGames(phase);
  }
}
