import React, { useState, useEffect } from 'react';
import Login from './components/LoginLogic';
import HospitalProductsSystem from './components/HospitalProductsSystem';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verifica se há um usuário logado ao carregar a aplicação
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsCheckingAuth(false);
  }, []);

  // Função para fazer login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // Tela de loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostra tela de login
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Se está logado, mostra o sistema
  return (
    <div className="App">
      <HospitalProductsSystem 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;