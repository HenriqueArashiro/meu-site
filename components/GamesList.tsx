import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { getGames, getPlayers } from '../services/storageService';
import { Search, Calendar, MapPin } from 'lucide-react';

export const GamesList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [playerMap, setPlayerMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const allGames = getGames();
    const allPlayers = getPlayers();
    
    // Create map for quick ID -> Name lookup
    const pMap = new Map();
    allPlayers.forEach(p => pMap.set(p.id, p.name));
    setPlayerMap(pMap);

    setGames(allGames);
    setFilteredGames(allGames);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGames(games);
      return;
    }
    
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = games.filter(g => {
        const dateStr = new Date(g.playedAt).toLocaleDateString();
        const locationMatch = g.location?.toLowerCase().includes(lowerTerm);
        // Check if any player in the game matches the search
        const playerMatch = g.players.some(pid => {
            const name = playerMap.get(pid) || '';
            return name.toLowerCase().includes(lowerTerm);
        });
        
        return dateStr.includes(lowerTerm) || locationMatch || playerMatch;
    });
    setFilteredGames(filtered);
  }, [searchTerm, games, playerMap]);

  return (
    <div className="space-y-6 animate-in fade-in">
       <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Jogos</h1>
       </div>

       {/* Search */}
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por data, local ou jogador..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-golf-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

       <div className="grid grid-cols-1 gap-4">
         {filteredGames.length > 0 ? filteredGames.map(game => (
           <Link to={`/games/${game.id}`} key={game.id} className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2 group-hover:text-golf-700 transition-colors">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(game.playedAt).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h3>
                      {game.location && (
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <MapPin size={14} />
                              {game.location}
                          </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                          {game.players.slice(0, 5).map(pid => (
                              <span key={pid} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                  {playerMap.get(pid)?.split(' ')[0]}
                              </span>
                          ))}
                          {game.players.length > 5 && (
                              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md">+{game.players.length - 5}</span>
                          )}
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="block text-2xl font-bold text-slate-200 group-hover:text-golf-200 transition-colors">#{game.rounds.length}V</span>
                  </div>
              </div>
           </Link>
         )) : (
             <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                 Nenhum jogo encontrado.
             </div>
         )}
       </div>
    </div>
  );
};