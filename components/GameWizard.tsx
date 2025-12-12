import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player, RoundStatus, Game, Round } from '../types';
import { getPlayers, saveGame } from '../services/storageService';
import { validateRound, calculateGameSummary } from '../services/gameLogic';
import { ROUND_STAKES } from '../constants';
import { ChevronRight, ChevronLeft, Check, AlertCircle, X, DollarSign, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const GameWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  
  // Game State
  const [rounds, setRounds] = useState<{ [key: number]: { [playerId: string]: RoundStatus } }>({
    0: {}, 1: {}, 2: {}
  });
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setAllPlayers(getPlayers());
  }, []);

  // --- Step 1: Select Players ---
  const togglePlayer = (id: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // --- Step 2: Record Rounds ---
  const handleResultChange = (roundIdx: number, playerId: string, status: RoundStatus) => {
    setRounds(prev => ({
      ...prev,
      [roundIdx]: {
        ...prev[roundIdx],
        [playerId]: status
      }
    }));
  };

  const getRoundStats = (roundIdx: number) => {
    const currentRound = rounds[roundIdx] || {};
    const results = selectedPlayerIds.map(pid => ({ playerId: pid, status: currentRound[pid] }));
    const winners = results.filter(r => r.status === RoundStatus.WIN).length;
    const losers = results.filter(r => r.status === RoundStatus.LOSE).length;
    const stake = ROUND_STAKES[roundIdx];
    const pot = losers * stake;
    const perWinner = winners > 0 ? pot / winners : 0;
    
    // Auto-fill unknowns as LOSE if we want to be aggressive, but better to leave unset or validate
    const isComplete = results.every(r => r.status);
    const validation = validateRound(results.filter(r => r.status) as any); // Cast for partial check

    return { winners, losers, pot, perWinner, isComplete, validation };
  };

  // --- Final Save ---
  const handleSaveGame = () => {
    const gameRounds: Round[] = [0, 1, 2].map(idx => ({
      number: idx + 1,
      stake: ROUND_STAKES[idx],
      results: selectedPlayerIds.map(pid => ({
        playerId: pid,
        status: rounds[idx][pid]
      }))
    }));

    const newGame: Game = {
      id: uuidv4(),
      playedAt: new Date().toISOString(),
      location: location || undefined,
      notes: notes || undefined,
      players: selectedPlayerIds,
      rounds: gameRounds
    };

    saveGame(newGame);
    navigate(`/games`);
  };

  // --- Render Functions ---

  const renderPlayerSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Quem vai jogar?</h2>
        <p className="text-slate-500">Selecione pelo menos 2 jogadores.</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allPlayers.map(player => {
          const isSelected = selectedPlayerIds.includes(player.id);
          return (
            <div 
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`
                cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 h-32
                ${isSelected ? 'border-golf-500 bg-golf-50 shadow-md ring-2 ring-golf-200 ring-offset-1' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? 'bg-golf-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {player.name.charAt(0)}
              </div>
              <span className={`font-medium ${isSelected ? 'text-golf-800' : 'text-slate-600'}`}>
                {player.nickname || player.name.split(' ')[0]}
              </span>
              {isSelected && <Check size={16} className="text-golf-600" />}
            </div>
          );
        })}
      </div>
      
      {allPlayers.length === 0 && (
        <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4">Nenhum jogador cadastrado.</p>
          <button 
            onClick={() => navigate('/players')} 
            className="text-golf-600 font-medium hover:underline"
          >
            Cadastrar jogadores primeiro
          </button>
        </div>
      )}

      <div className="sticky bottom-4">
        <button
          disabled={selectedPlayerIds.length < 2}
          onClick={() => setStep(2)}
          className="w-full bg-golf-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-golf-200 flex items-center justify-center gap-2 transition-all hover:bg-golf-700"
        >
          Próximo
          <ChevronRight />
        </button>
      </div>
    </div>
  );

  const renderRoundsInput = () => {
    // Current round calculation for validation
    const canProceed = [0, 1, 2].every(idx => {
       const stats = getRoundStats(idx);
       return stats.isComplete && stats.validation.isValid;
    });

    return (
      <div className="space-y-8 pb-24">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ChevronLeft size={20} /> Voltar
          </button>
          <span className="text-sm font-medium text-slate-400">Passo 2 de 3</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center">Resultados das Voltas</h2>

        {[0, 1, 2].map((roundIdx) => {
           const stats = getRoundStats(roundIdx);
           const isError = stats.isComplete && !stats.validation.isValid;

           return (
             <div key={roundIdx} className={`bg-white rounded-2xl border ${isError ? 'border-red-300' : 'border-slate-200'} shadow-sm overflow-hidden`}>
               {/* Round Header */}
               <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2">
                 <div className="flex items-center gap-3">
                   <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                     {roundIdx + 1}
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-900">Volta {roundIdx + 1}</h3>
                     <span className="text-xs text-slate-500 font-mono">Valor: R$ {ROUND_STAKES[roundIdx]},00</span>
                   </div>
                 </div>
                 
                 <div className="flex gap-4 text-xs font-medium">
                   <div className="text-center px-2 py-1 bg-green-50 rounded text-green-700">
                     <div className="font-bold">{stats.winners}</div>
                     Vencedores
                   </div>
                   <div className="text-center px-2 py-1 bg-red-50 rounded text-red-700">
                     <div className="font-bold">{stats.losers}</div>
                     Perdedores
                   </div>
                   <div className="text-center px-2 py-1 bg-slate-100 rounded text-slate-700">
                     <div className="font-bold text-golf-600">R$ {stats.perWinner.toFixed(2)}</div>
                     Prêmio/Vencedor
                   </div>
                 </div>
               </div>

               {/* Error Message */}
               {isError && (
                 <div className="bg-red-50 text-red-600 text-xs px-4 py-2 flex items-center gap-2">
                   <AlertCircle size={14} />
                   {stats.validation.error}
                 </div>
               )}

               {/* Players Grid */}
               <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {selectedPlayerIds.map(pid => {
                   const player = allPlayers.find(p => p.id === pid)!;
                   const status = rounds[roundIdx][pid];
                   
                   return (
                     <div key={pid} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                        <span className="text-sm font-medium truncate max-w-[100px]">{player.nickname || player.name}</span>
                        <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
                          <button
                            onClick={() => handleResultChange(roundIdx, pid, RoundStatus.LOSE)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === RoundStatus.LOSE ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-300/50'}`}
                          >
                            PERDEU
                          </button>
                          <button
                            onClick={() => handleResultChange(roundIdx, pid, RoundStatus.WIN)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === RoundStatus.WIN ? 'bg-golf-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-300/50'}`}
                          >
                            VENCEU
                          </button>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           );
        })}

        <div className="sticky bottom-4 flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-xl">
           <div className="flex-1">
             {!canProceed && (
               <p className="text-xs text-center text-red-500 mb-1 font-medium">Preencha todas as voltas corretamente para continuar.</p>
             )}
             <button
              disabled={!canProceed}
              onClick={() => setStep(3)}
              className="w-full bg-golf-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:bg-golf-700"
            >
              Revisar Jogo
              <ChevronRight />
            </button>
           </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    // Construct temporary game object to use calculation logic
    const tempRounds: Round[] = [0, 1, 2].map(idx => ({
      number: idx + 1,
      stake: ROUND_STAKES[idx],
      results: selectedPlayerIds.map(pid => ({
        playerId: pid,
        status: rounds[idx][pid]
      }))
    }));
    
    const tempGame: Game = {
      id: 'temp',
      playedAt: new Date().toISOString(),
      players: selectedPlayerIds,
      rounds: tempRounds
    };

    const summary = calculateGameSummary(tempGame, allPlayers);

    return (
      <div className="space-y-6 pb-20">
         <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <ChevronLeft size={20} /> Voltar
          </button>
          <span className="text-sm font-medium text-slate-400">Revisão</span>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Resumo do Jogo</h2>
          <p className="text-slate-500">Confira os valores finais antes de salvar.</p>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Local (Opcional)</label>
            <div className="relative">
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Quinta do Golfe"
                className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-golf-500 outline-none"
              />
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                disabled
                value={new Date().toLocaleDateString()}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
              />
            </div>
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Algum comentário sobre o jogo?"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-golf-500 outline-none h-20 resize-none"
            />
        </div>

        {/* Financial Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Jogador</th>
                  <th className="px-4 py-3 text-center">V1</th>
                  <th className="px-4 py-3 text-center">V2</th>
                  <th className="px-4 py-3 text-center">V3</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.map((s) => (
                  <tr key={s.playerId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.playerName}</td>
                    {s.roundDetails.map((net, idx) => (
                      <td key={idx} className={`px-4 py-3 text-center ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {net >= 0 ? '+' : ''}{Math.round(net)}
                      </td>
                    ))}
                    <td className={`px-4 py-3 text-right font-bold text-base ${s.totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.totalNet >= 0 ? '+' : ''}{s.totalNet.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Payout Instructions (Who pays who?) - Simple version: Losers pay into pot, Winners take from pot.
            Real 'who pays who' algorithm is complex (knapsack problem subset), so strictly showing Net Balance here as requested for MVP.
        */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
            <DollarSign size={16} />
            Balanço Final
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.map(s => {
              if (Math.abs(s.totalNet) < 0.01) return null;
              return (
                <span key={s.playerId} className={`text-xs px-2 py-1 rounded-full border ${s.totalNet > 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {s.playerName}: {s.totalNet > 0 ? 'Recebe' : 'Paga'} R$ {Math.abs(s.totalNet).toFixed(2)}
                </span>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSaveGame}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-black transition-all"
        >
          Finalizar e Salvar
        </button>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto">
      {step === 1 && renderPlayerSelection()}
      {step === 2 && renderRoundsInput()}
      {step === 3 && renderSummary()}
    </div>
  );
};