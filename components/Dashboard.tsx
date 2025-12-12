import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGames, getPlayers } from '../services/storageService';
import { calculateGameSummary } from '../services/gameLogic';
import { Game, Player, PlayerGameSummary } from '../types';
import { Trophy, TrendingUp, TrendingDown, Calendar, Plus, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{name: string, net: number}[]>([]);
  const [topWinner, setTopWinner] = useState<{name: string, net: number} | null>(null);

  useEffect(() => {
    const games = getGames();
    const players = getPlayers();
    
    // Recent games
    setRecentGames(games.slice(0, 5));

    // Calculate monthly stats (current month)
    const now = new Date();
    const currentMonthGames = games.filter(g => {
        const d = new Date(g.playedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const playerMap = new Map<string, number>();
    
    currentMonthGames.forEach(game => {
        const summary = calculateGameSummary(game, players);
        summary.forEach(s => {
            const current = playerMap.get(s.playerId) || 0;
            playerMap.set(s.playerId, current + s.totalNet);
        });
    });

    const statsArray = Array.from(playerMap.entries()).map(([pid, net]) => {
        const p = players.find(x => x.id === pid);
        return { name: p?.nickname || p?.name || 'Unknown', net };
    }).sort((a, b) => b.net - a.net); // High to low

    setMonthlyStats(statsArray);
    if (statsArray.length > 0) {
        setTopWinner(statsArray[0]);
    }

  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
           <p className="text-slate-500">Resumo financeiro do mês</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600 flex items-center gap-2">
           <Calendar size={16} />
           {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-golf-600 to-golf-800 rounded-2xl p-6 text-white shadow-xl shadow-golf-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={100} />
            </div>
            <p className="text-golf-100 font-medium mb-1">Maior Vencedor (Mês)</p>
            <h2 className="text-2xl font-bold">{topWinner ? topWinner.name : '-'}</h2>
            <p className="text-3xl font-bold mt-2 text-white">
                {topWinner ? `R$ ${topWinner.net.toFixed(2)}` : 'R$ 0,00'}
            </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 bg-green-100 rounded-lg text-green-700">
                     <TrendingUp size={20} />
                 </div>
                 <span className="font-medium text-slate-600">Total Movimentado</span>
             </div>
             <p className="text-2xl font-bold text-slate-900">
                R$ {monthlyStats.reduce((acc, curr) => acc + (curr.net > 0 ? curr.net : 0), 0).toFixed(2)}
             </p>
             <span className="text-xs text-slate-400">Em prêmios pagos neste mês</span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <Link to="/new-game" className="w-full h-full flex flex-col items-center justify-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-golf-500 group-hover:text-golf-600 transition-colors">
                    <Plus size={24} />
                </div>
                <span className="font-medium text-slate-600 group-hover:text-golf-700">Novo Jogo</span>
            </Link>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Performance Mensal</h3>
        <div className="h-64 w-full">
            {monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: '#f1f5f9'}}
                        />
                        <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                            {monthlyStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    Sem dados para exibir este mês.
                </div>
            )}
        </div>
      </div>

      {/* Recent Games */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Jogos Recentes</h3>
            <Link to="/games" className="text-sm text-golf-600 hover:underline">Ver todos</Link>
        </div>
        <div className="space-y-3">
            {recentGames.length > 0 ? (
                recentGames.map(game => (
                    <Link to={`/games/${game.id}`} key={game.id} className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-golf-300 transition-all shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium text-slate-900 flex items-center gap-2">
                                    Jogo de {new Date(game.playedAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {game.players.length} jogadores • {game.location || 'Sem local'}
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-400" />
                        </div>
                    </Link>
                ))
            ) : (
                <p className="text-slate-500 text-sm">Nenhum jogo registrado ainda.</p>
            )}
        </div>
      </div>
    </div>
  );
};