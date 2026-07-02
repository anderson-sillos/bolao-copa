import { apiFetch } from '../../lib/api-client';
import type {
  WorldCupGame,
  WorldCupGamePhase,
  WorldCupGroup,
  WorldCupTeam,
} from './world-cup-data-types';

export function listWorldCupGroups(token: string): Promise<WorldCupGroup[]> {
  return apiFetch<WorldCupGroup[]>('/groups', {
    method: 'GET',
    token,
  });
}

export function listWorldCupTeams(token: string): Promise<WorldCupTeam[]> {
  return apiFetch<WorldCupTeam[]>('/teams', {
    method: 'GET',
    token,
  });
}

export function listWorldCupGames(
  token: string,
  phase?: WorldCupGamePhase,
): Promise<WorldCupGame[]> {
  const path = phase ? `/games?phase=${encodeURIComponent(phase)}` : '/games';

  return apiFetch<WorldCupGame[]>(path, {
    method: 'GET',
    token,
  });
}
