import { Game, Player, PlayerGameSummary, Round, RoundStatus } from '../types';

export const calculateRoundNet = (round: Round, playerId: string): number => {
  const result = round.results.find((r) => r.playerId === playerId);
  if (!result) return 0;

  const losersCount = round.results.filter((r) => r.status === RoundStatus.LOSE).length;
  const winnersCount = round.results.filter((r) => r.status === RoundStatus.WIN).length;

  // Safety check: if everyone won or everyone lost (should be prevented by UI validation)
  if (winnersCount === 0 || losersCount === 0) return 0;

  const totalPot = losersCount * round.stake;
  
  if (result.status === RoundStatus.LOSE) {
    return -round.stake;
  } else {
    // Winner receives share of the pot
    return totalPot / winnersCount;
  }
};

export const calculateGameSummary = (game: Game, players: Player[]): PlayerGameSummary[] => {
  const summaries: PlayerGameSummary[] = game.players.map((playerId) => {
    const player = players.find((p) => p.id === playerId);
    
    let totalNet = 0;
    let wins = 0;
    let losses = 0;
    const roundDetails: number[] = [];

    game.rounds.forEach((round) => {
      const net = calculateRoundNet(round, playerId);
      totalNet += net;
      roundDetails.push(net);

      const status = round.results.find(r => r.playerId === playerId)?.status;
      if (status === RoundStatus.WIN) wins++;
      else if (status === RoundStatus.LOSE) losses++;
    });

    return {
      playerId,
      playerName: player ? (player.nickname || player.name) : 'Desconhecido',
      totalNet,
      roundDetails,
      wins,
      losses,
    };
  });

  // Sort by highest winnings
  return summaries.sort((a, b) => b.totalNet - a.totalNet);
};

export const validateRound = (results: { status: RoundStatus }[]): { isValid: boolean; error?: string } => {
  const winners = results.filter((r) => r.status === RoundStatus.WIN).length;
  const losers = results.filter((r) => r.status === RoundStatus.LOSE).length;

  if (winners === 0) return { isValid: false, error: 'Pelo menos um jogador deve vencer.' };
  if (losers === 0) return { isValid: false, error: 'Pelo menos um jogador deve perder (quem paga?).' };
  
  return { isValid: true };
};