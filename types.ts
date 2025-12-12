export interface Player {
  id: string;
  name: string;
  nickname?: string;
  createdAt: string;
}

export enum RoundStatus {
  WIN = 'WIN',
  LOSE = 'LOSE',
}

export interface RoundResult {
  playerId: string;
  status: RoundStatus;
}

export interface Round {
  number: number;
  stake: number;
  results: RoundResult[];
}

export interface Game {
  id: string;
  playedAt: string;
  location?: string;
  notes?: string;
  players: string[]; // Player IDs
  rounds: Round[];
}

export interface PlayerGameSummary {
  playerId: string;
  playerName: string;
  totalNet: number;
  roundDetails: number[]; // Net amount per round
  wins: number;
  losses: number;
}

export interface GameCalculation {
  gameId: string;
  summaries: PlayerGameSummary[];
  totalPot: number;
}