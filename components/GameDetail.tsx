import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Game, Player, PlayerGameSummary } from '../types';
import { getGames, getPlayers } from '../services/storageService';
import { calculateGameSummary } from '../services/gameLogic';
import { ChevronLeft, Calendar, MapPin, Share2, Download } from 'lucide-react';

export const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [summary, setSummary] = useState<PlayerGameSummary[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const games = getGames();
    const foundGame = games.find(g => g.id === id);
    if (foundGame) {
      const allPlayers = getPlayers();
      setPlayers(allPlayers);
      setGame(foundGame);
      setSummary(calculateGameSummary(foundGame, allPlayers));
    }
  }, [id]);

  const exportCSV = () => {
    if (!game || !summary) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Jogador,Total,Volta 1,Volta 2,Volta 3\n";
    
    summary.forEach(s => {
      const row = [
        s.playerName,
        s.totalNet.toFixed(2),
        ...s.roundDetails.map(r => r.toFixed(2))
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `golf_game_${game.playedAt.slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!game) return <div className="p-8 text-center">Carregando ou jogo não encontrado...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex items-center justify-between">
          <Link to="/games" className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ChevronLeft size={20} /> Voltar
          </Link>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Exportar CSV">
                <Download size={20} />
            </button>
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Compartilhar">
                <Share2 size={20} />
            </button>
          </div>
       </div>

       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detalhes do Jogo</h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(game.playedAt).toLocaleDateString()}</span>
                {game.location && <span className="flex items-center gap-1"><MapPin size={14} /> {game.location}</span>}
              </div>
            </div>
            {game.notes && (
                <div className="bg-yellow-50 text-yellow-800 text-sm px-4 py-2 rounded-lg border border-yellow-100 max-w-xs">
                    {game.notes}
                </div>
            )}
         </div>

         {/* Results Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 font-semibold text-slate-500">Ranking</th>
                  <th className="py-3 font-semibold text-slate-500">Jogador</th>
                  <th className="py-3 text-right font-semibold text-slate-500">Saldo Final</th>
                  <th className="py-3 text-center text-xs font-normal text-slate-400">V1</th>
                  <th className="py-3 text-center text-xs font-normal text-slate-400">V2</th>
                  <th className="py-3 text-center text-xs font-normal text-slate-400">V3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.map((s, idx) => (
                    <tr key={s.playerId} className="hover:bg-slate-50">
                        <td className="py-3 pl-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                {idx + 1}
                            </span>
                        </td>
                        <td className="py-3 font-medium text-slate-900">{s.playerName}</td>
                        <td className={`py-3 text-right font-bold text-lg ${s.totalNet >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {s.totalNet > 0 ? '+' : ''}{s.totalNet.toFixed(2)}
                        </td>
                         {s.roundDetails.map((r, i) => (
                            <td key={i} className={`text-center text-xs ${r >= 0 ? 'text-green-600' : 'text-red-400'}`}>
                                {Math.round(r)}
                            </td>
                         ))}
                    </tr>
                ))}
              </tbody>
            </table>
         </div>
       </div>

       {/* Detailed Rounds Breakdown */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {game.rounds.map((round) => (
                <div key={round.number} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2">Volta {round.number} <span className="text-xs font-normal text-slate-400">(R$ {round.stake})</span></h3>
                    <div className="space-y-1">
                        {round.results.map(r => {
                            const pName = players.find(p => p.id === r.playerId)?.nickname || '???';
                            return (
                                <div key={r.playerId} className="flex justify-between text-xs">
                                    <span className="text-slate-600">{pName}</span>
                                    <span className={`font-bold ${r.status === 'WIN' ? 'text-green-600' : 'text-red-500'}`}>
                                        {r.status === 'WIN' ? 'VENCEU' : 'PERDEU'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
       </div>
    </div>
  );
};