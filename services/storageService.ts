import { Game, Player } from '../types';
import { MOCK_PLAYERS } from '../constants';

const PLAYERS_KEY = 'golf_quebrada_players';
const GAMES_KEY = 'golf_quebrada_games';

// Initialize with seed data if empty
const init = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(PLAYERS_KEY)) {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(MOCK_PLAYERS));
  }
  if (!localStorage.getItem(GAMES_KEY)) {
    localStorage.setItem(GAMES_KEY, JSON.stringify([]));
  }
};

export const getPlayers = (): Player[] => {
  init();
  const data = localStorage.getItem(PLAYERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePlayer = (player: Player): void => {
  const players = getPlayers();
  const existingIndex = players.findIndex(p => p.id === player.id);
  
  if (existingIndex >= 0) {
    players[existingIndex] = player;
  } else {
    players.push(player);
  }
  
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

export const deletePlayer = (id: string): void => {
  const players = getPlayers().filter(p => p.id !== id);
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

export const getGames = (): Game[] => {
  init();
  const data = localStorage.getItem(GAMES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveGame = (game: Game): void => {
  const games = getGames();
  // New games go to top
  const newGames = [game, ...games];
  localStorage.setItem(GAMES_KEY, JSON.stringify(newGames));
};