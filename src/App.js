import React, { useState, useEffect } from 'react';
import Login from './components/LoginSystem';
import HospitalProductsSystem from './components/ProductManager';
import databaseService from './services/DatabaseService';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [dbConnectionStatus, setDbConnectionStatus] = useState('checking');

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

  // Verifica conexão com o banco de dados
  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setDbConnectionStatus('checking');
      const isConnected = await databaseService.testConnection();
      setDbConnectionStatus(isConnected ? 'connected' : 'error');
      
      if (!isConnected) {
        console.error('Falha na conexão com o Supabase');
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setDbConnectionStatus('error');
    }
  };

  // Função para fazer login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // Mostra notificação
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-slide-in ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    notification.innerHTML = `
      <span class="font-bold">${icon}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  // Tela de loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Carregando sistema...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${
              dbConnectionStatus === 'connected' ? 'bg-green-500' :
              dbConnectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span>
              {dbConnectionStatus === 'checking' && 'Conectando ao banco...'}
              {dbConnectionStatus === 'connected' && 'Conectado ao Supabase'}
              {dbConnectionStatus === 'error' && 'Erro na conexão'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Erro de conexão crítico
  if (dbConnectionStatus === 'error' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet e as configurações do Supabase.
          </p>
          <div className="space-y-3">
            <button
              onClick={checkDatabaseConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all"
            >
              Tentar Novamente
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-all"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se não está logado, mostra tela de login
  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        
        {/* Indicador de status do banco no login */}
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
            dbConnectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            dbConnectionStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              dbConnectionStatus === 'connected' ? 'bg-green-500' :
              dbConnectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span>
              {dbConnectionStatus === 'checking' && 'Conectando...'}
              {dbConnectionStatus === 'connected' && 'Supabase Online'}
              {dbConnectionStatus === 'error' && 'Banco Offline'}
            </span>
          </div>
        </div>
      </>
    );
  }

  // Se está logado, mostra o sistema
  return (
    <div className="App">
      <HospitalProductsSystem 
        currentUser={currentUser} 
        onLogout={handleLogout}
        showNotification={showNotification}
        dbConnectionStatus={dbConnectionStatus}
      />

      {/* Estilos para animações */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-out {
          animation: slide-out 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;