import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, History, PlusCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-golf-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
              GQ
            </div>
            <span className="font-bold text-xl tracking-tight text-golf-900">
              Golf<span className="text-slate-400 font-light">de</span>Quebrada
            </span>
          </div>
          <Link 
            to="/new-game" 
            className="hidden md:flex bg-golf-600 hover:bg-golf-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors items-center gap-2 shadow-lg shadow-golf-200"
          >
            <PlusCircle size={18} />
            Novo Jogo
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 pb-safe z-30 flex justify-around items-center px-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-16 py-1 ${isActive('/') ? 'text-golf-600' : 'text-slate-400'}`}
        >
          <Trophy size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Ranking</span>
        </Link>
        
        <Link 
          to="/new-game" 
          className="flex flex-col items-center justify-center w-16 -mt-8"
        >
          <div className="w-14 h-14 bg-golf-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-golf-300 ring-4 ring-slate-50">
            <PlusCircle size={28} />
          </div>
        </Link>

        <Link 
          to="/games" 
          className={`flex flex-col items-center justify-center w-16 py-1 ${isActive('/games') ? 'text-golf-600' : 'text-slate-400'}`}
        >
          <History size={24} strokeWidth={isActive('/games') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Jogos</span>
        </Link>
        
        <Link 
          to="/players" 
          className={`flex flex-col items-center justify-center w-16 py-1 ${isActive('/players') ? 'text-golf-600' : 'text-slate-400'}`}
        >
          <Users size={24} strokeWidth={isActive('/players') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Players</span>
        </Link>
      </nav>
    </div>
  );
};