// src/components/MigrationPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { Database, Upload, Trash2, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import MigrationUtils from '../utils/migrationUtils';
import databaseService from '../services/DatabaseService';

const MigrationPanel = ({ onClose, showNotification }) => {
  const [migrationUtils] = useState(() => new MigrationUtils(databaseService));
  const [migrationState, setMigrationState] = useState({
    hasOldData: false,
    isChecking: true,
    isMigrating: false,
    isClearing: false,
    migrationResult: null,
    connectionStatus: 'checking'
  });

  const checkInitialState = useCallback(async () => {
    setMigrationState(prev => ({ ...prev, isChecking: true }));

    try {
      // Verifica conexão com Supabase
      const connectionOk = await databaseService.testConnection();
      
      // Verifica se existe dados antigos
      const hasOldData = await migrationUtils.hasOldData();

      setMigrationState(prev => ({
        ...prev,
        hasOldData,
        isChecking: false,
        connectionStatus: connectionOk ? 'connected' : 'error'
      }));

    } catch (error) {
      console.error('Erro ao verificar estado inicial:', error);
      setMigrationState(prev => ({
        ...prev,
        isChecking: false,
        connectionStatus: 'error'
      }));
    }
  }, [migrationUtils]);

  useEffect(() => {
    checkInitialState();
  }, [checkInitialState]);

  const runMigration = async () => {
    setMigrationState(prev => ({ ...prev, isMigrating: true, migrationResult: null }));

    try {
      const result = await migrationUtils.runFullMigration();
      
      setMigrationState(prev => ({
        ...prev,
        isMigrating: false,
        migrationResult: result,
        hasOldData: !result.oldDataCleared
      }));

      if (result.success) {
        showNotification(`Migração concluída! ${result.migrated} produtos migrados.`, 'success');
      } else {
        showNotification(`Erro na migração: ${result.error}`, 'error');
      }

    } catch (error) {
      console.error('Erro durante migração:', error);
      setMigrationState(prev => ({
        ...prev,
        isMigrating: false,
        migrationResult: {
          success: false,
          error: error.message
        }
      }));
      showNotification('Erro durante a migração', 'error');
    }
  };

  const clearOldData = async () => {
    if (!window.confirm('Tem certeza que deseja remover todos os dados antigos do IndexedDB?')) {
      return;
    }

    setMigrationState(prev => ({ ...prev, isClearing: true }));

    try {
      await migrationUtils.clearOldDB();
      
      setMigrationState(prev => ({
        ...prev,
        isClearing: false,
        hasOldData: false
      }));

      showNotification('Dados antigos removidos com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
      setMigrationState(prev => ({ ...prev, isClearing: false }));
      showNotification('Erro ao remover dados antigos', 'error');
    }
  };

  const { hasOldData, isChecking, isMigrating, isClearing, migrationResult, connectionStatus } = migrationState;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Migração de Dados</h2>
                <p className="text-blue-100">IndexedDB → Supabase PostgreSQL</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Status da Conexão */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Status da Conexão
            </h3>
            
            <div className="flex items-center space-x-3">
              {connectionStatus === 'checking' && (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-gray-600">Verificando conexão...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Conectado ao Supabase</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Erro na conexão com Supabase</span>
                </>
              )}
            </div>
          </div>

          {isChecking ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Verificando dados existentes...</p>
            </div>
          ) : (
            <>
              {/* Estado dos Dados */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Estado dos Dados</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">IndexedDB (Local)</span>
                    <div className="flex items-center space-x-2">
                      {hasOldData ? (
                        <>
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-orange-700 font-medium">Dados encontrados</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-600">Vazio</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Supabase (Cloud)</span>
                    <div className="flex items-center space-x-2">
                      {connectionStatus === 'connected' ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-green-700 font-medium">Pronto</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 font-medium">Indisponível</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações de Migração */}
              {hasOldData && connectionStatus === 'connected' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Migração Disponível
                  </h3>
                  
                  <p className="text-blue-700 mb-4">
                    Dados foram encontrados no banco local. Clique abaixo para migrar todos os produtos para o Supabase.
                  </p>

                  <button
                    onClick={runMigration}
                    disabled={isMigrating}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all font-semibold ${
                      isMigrating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isMigrating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Migrando dados...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Iniciar Migração</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Resultado da Migração */}
              {migrationResult && (
                <div className={`rounded-xl p-4 ${
                  migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-3 flex items-center ${
                    migrationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {migrationResult.success ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    Resultado da Migração
                  </h3>

                  {migrationResult.success ? (
                    <div className="space-y-2 text-green-700">
                      <p>✅ Migração concluída com sucesso!</p>
                      <p>📦 {migrationResult.migrated} produtos migrados</p>
                      {migrationResult.total && (
                        <p>📊 {migrationResult.migrated} de {migrationResult.total} produtos processados</p>
                      )}
                      {migrationResult.errors && migrationResult.errors.length > 0 && (
                        <p className="text-orange-600">
                          ⚠️ {migrationResult.errors.length} produtos com erro
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-700">
                      <p>❌ Erro na migração: {migrationResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Limpar Dados Antigos */}
              {hasOldData && !isMigrating && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Limpeza de Dados
                  </h3>
                  
                  <p className="text-orange-700 mb-4">
                    Remover dados antigos do IndexedDB para liberar espaço no navegador.
                  </p>

                  <button
                    onClick={clearOldData}
                    disabled={isClearing}
                    className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all font-semibold ${
                      isClearing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isClearing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Removendo...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Limpar Dados Antigos</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Estado Limpo */}
              {!hasOldData && connectionStatus === 'connected' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Sistema Atualizado
                  </h3>
                  <p className="text-green-700">
                    Todos os dados estão sincronizados com o Supabase. O sistema está pronto para uso!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {migrationResult && migrationResult.success ? (
                <span className="text-green-600 font-medium">
                  ✅ Migração concluída
                </span>
              ) : (
                <span>
                  Migre seus dados do IndexedDB para o Supabase
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationPanel;