import { apiFetch } from '../../lib/api-client';
import type { MatchBet, SaveMatchBetInput } from './match-bets-types';

export function listMatchBets(token: string): Promise<MatchBet[]> {
  return apiFetch<MatchBet[]>('/bets', {
    method: 'GET',
    token,
  });
}

export function getMatchBet(
  token: string,
  gameId: string,
): Promise<MatchBet | null> {
  return apiFetch<{ bet: MatchBet | null }>(
    `/bets/${encodeURIComponent(gameId)}`,
    {
      method: 'GET',
      token,
    },
  ).then(response => response.bet);
}

export function saveMatchBet(
  token: string,
  input: SaveMatchBetInput,
): Promise<MatchBet> {
  return apiFetch<MatchBet>('/bets', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}
