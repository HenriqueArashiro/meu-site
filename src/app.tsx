import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PlayerList } from './components/PlayerList';
import { GameWizard } from './components/GameWizard';
import { GamesList } from './components/GamesList';
import { GameDetail } from './components/GameDetail';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<PlayerList />} />
          <Route path="/games" element={<GamesList />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/new-game" element={<GameWizard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
