import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveMatchBetDto, UpdateMatchBetDto } from './dto/save-match-bet.dto';
import { MatchBetDto, MatchBetLookupDto } from './match-bet.dto';
import { MatchBetsService } from './match-bets.service';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class MatchBetsController {
  constructor(private readonly matchBets: MatchBetsService) {}

  @Get()
  async listUserBets(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MatchBetDto[]> {
    return this.matchBets.listUserBets(user.id);
  }

  @Get(':gameId')
  async getUserBetForGame(
    @CurrentUser() user: AuthenticatedUser,
    @Param('gameId') gameId: string,
  ): Promise<MatchBetLookupDto> {
    const bet = await this.matchBets.getUserBetForGame(user.id, gameId);
    return { bet };
  }

  @Post()
  async saveUserBet(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: SaveMatchBetDto,
  ): Promise<MatchBetDto> {
    return this.matchBets.saveUserBet(user.id, input);
  }

  @Put(':gameId')
  @HttpCode(200)
  async updateUserBet(
    @CurrentUser() user: AuthenticatedUser,
    @Param('gameId') gameId: string,
    @Body() input: UpdateMatchBetDto,
  ): Promise<MatchBetDto> {
    return this.matchBets.updateUserBet(user.id, gameId, input);
  }
}
