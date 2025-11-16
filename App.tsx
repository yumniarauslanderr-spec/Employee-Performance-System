
import React, { useState, useCallback } from 'react';
import { UserAccount } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import { useIdleTimeout } from './hooks/useIdleTimeout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  useIdleTimeout(30 * 60 * 1000, handleLogout); // 30 minutes

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return <Layout user={currentUser} onLogout={handleLogout} />;
};

export default App;
