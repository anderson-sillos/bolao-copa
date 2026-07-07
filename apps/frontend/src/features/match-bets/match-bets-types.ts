import type { WorldCupGame } from '../world-cup-data/world-cup-data-types';

export type MatchBet = {
  id: string;
  gameId: string;
  scoreA: number;
  scoreB: number;
  createdAt: string;
  updatedAt: string;
  game: WorldCupGame;
};

export type SaveMatchBetInput = {
  gameId: string;
  scoreA: number;
  scoreB: number;
};

export type MatchBetFormState = {
  scoreA: string;
  scoreB: string;
};

export type MatchBetSaveState = 'idle' | 'saving' | 'saved' | 'error';
