import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle, Shield, Users, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Usuários predefinidos
  const users = [
    { username: 'adm', password: '123', role: 'admin', name: 'Administrador' },
    { username: 'user', password: '123', role: 'user', name: 'Usuário' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simula um pequeno delay para parecer mais realista
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verifica as credenciais
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      // Login bem-sucedido
      const userData = {
        username: user.username,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString()
      };
      
      // Salva no localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Chama a função de callback com os dados do usuário
      onLogin(userData);
    } else {
      // Login falhou
      setError('Usuário ou senha incorretos');
      setPassword('');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center px-4 py-8">
      {/* Container Principal */}
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistema Hospitalar
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <LogIn className="w-5 h-5 mr-2" />
              Área de Login
            </h2>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Campo Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite seu usuário"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-[1.02] hover:shadow-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </span>
              )}
            </button>
          </form>

          {/* Área de Demo/Ajuda */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-xs text-gray-600 mb-3 text-center font-medium">
              Acesso Rápido (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin({ username: 'adm', password: '123' })}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Shield className="w-4 h-4 mr-1 text-blue-600" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin({ username: 'user', password: '123' })}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Users className="w-4 h-4 mr-1 text-green-600" />
                Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            Desenvolvido por{' '}
            <a 
              href="https://github.com/derikincode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
            >
              Derik
            </a>{' '}
            © 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;