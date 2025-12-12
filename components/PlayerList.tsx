import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { getPlayers, savePlayer, deletePlayer } from '../services/storageService';
import { Search, UserPlus, Trash2, Edit2, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const PlayerList: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');

  const loadPlayers = () => {
    setPlayers(getPlayers());
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleOpenModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setName(player.name);
      setNickname(player.nickname || '');
    } else {
      setEditingPlayer(null);
      setName('');
      setNickname('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlayer: Player = {
      id: editingPlayer ? editingPlayer.id : uuidv4(),
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      createdAt: editingPlayer ? editingPlayer.createdAt : new Date().toISOString(),
    };

    savePlayer(newPlayer);
    loadPlayers();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este jogador? O histórico será mantido, mas ele não aparecerá em novos jogos.')) {
      deletePlayer(id);
      loadPlayers();
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jogadores</h1>
          <p className="text-slate-500 text-sm">Gerencie os participantes do clube</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg md:px-4 md:py-2 flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus size={18} />
          <span className="hidden md:inline">Novo Jogador</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou apelido..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-golf-500 focus:border-golf-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-golf-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-golf-50 text-golf-600 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{player.name}</h3>
                {player.nickname && <p className="text-xs text-slate-500 font-medium">{player.nickname}</p>}
              </div>
            </div>
            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(player)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(player.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredPlayers.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">
            Nenhum jogador encontrado.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">{editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-golf-500 outline-none"
                  placeholder="Ex: Tiger Woods"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apelido (Opcional)</label>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-golf-500 outline-none"
                  placeholder="Ex: The GOAT"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-golf-600 text-white rounded-xl font-medium hover:bg-golf-700 shadow-lg shadow-golf-200 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};