// src/components/SupabaseStatusPanel.js
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Activity, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Info,
  TrendingUp,
  Clock,
  Server,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';

const SupabaseStatusPanel = ({ databaseService, onClose }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [usageMetrics, setUsageMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [storage, health, metrics] = await Promise.all([
        databaseService.getStorageInfo(),
        databaseService.getSystemHealth(),
        databaseService.getUsageMetrics(7) // Últimos 7 dias
      ]);
      
      setStorageInfo(storage);
      setSystemHealth(health);
      setUsageMetrics(metrics);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar dados do painel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLatencyColor = (latency) => {
    if (latency < 200) return 'text-green-600';
    if (latency < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Carregando Informações</h3>
            <p className="text-gray-600">Obtendo dados do Supabase...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao Carregar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={loadAllData}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Status do Supabase</h2>
                <p className="text-blue-100">Painel de monitoramento completo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAllData}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                title="Atualizar dados"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-3 text-blue-100 text-sm">
              Última atualização: {lastUpdate.toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Status Geral do Sistema */}
          {systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  {getHealthIcon(systemHealth.status)}
                  <div>
                    <h3 className="font-semibold text-gray-800">Status Geral</h3>
                    <p className="text-sm text-gray-600 capitalize">{systemHealth.status}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conexão:</span>
                    <span className={`font-medium ${systemHealth.connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.connectionStatus === 'connected' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Região:</span>
                    <span className="font-medium text-gray-800">{systemHealth.serverRegion}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Performance</h3>
                    <p className="text-sm text-gray-600">Latência da rede</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leitura:</span>
                    <span className={`font-medium ${getLatencyColor(systemHealth.readLatency)}`}>
                      {systemHealth.readLatency ? `${systemHealth.readLatency}ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Escrita:</span>
                    <span className={`font-medium ${systemHealth.writeLatency ? getLatencyColor(systemHealth.writeLatency) : 'text-gray-400'}`}>
                      {systemHealth.writeLatency ? `${systemHealth.writeLatency}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Server className="w-5 h-5 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Funcionalidades</h3>
                    <p className="text-sm text-gray-600">Recursos disponíveis</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leitura:</span>
                    <span className={`font-medium ${systemHealth.features.read ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.features.read ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Escrita:</span>
                    <span className={`font-medium ${systemHealth.features.write ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.features.write ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exclusão:</span>
                    <span className={`font-medium ${systemHealth.features.delete ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.features.delete ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações de Armazenamento */}
          {storageInfo && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <HardDrive className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Armazenamento</h3>
                  <p className="text-gray-600">Análise detalhada do uso de espaço</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumo do Armazenamento */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Resumo Geral</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Plano atual:</span>
                        <span className="font-semibold text-gray-800 bg-blue-100 px-2 py-1 rounded text-sm">
                          {storageInfo.currentPlan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total de produtos:</span>
                        <span className="font-semibold text-gray-800">{storageInfo.totalProducts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total de imagens:</span>
                        <span className="font-semibold text-gray-800">{storageInfo.totalImages}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Espaço usado:</span>
                        <span className="font-semibold text-gray-800">
                          {formatBytes(storageInfo.totalEstimatedStorageKB * 1024)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Espaço disponível:</span>
                        <span className="font-semibold text-gray-800">
                          {formatBytes(storageInfo.remainingStorageKB * 1024)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">Uso do Armazenamento</h4>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        storageInfo.storageStatus.level === 'low' ? 'bg-green-100 text-green-800' :
                        storageInfo.storageStatus.level === 'moderate' ? 'bg-blue-100 text-blue-800' :
                        storageInfo.storageStatus.level === 'high' ? 'bg-yellow-100 text-yellow-800' :
                        storageInfo.storageStatus.level === 'warning' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {storageInfo.storageStatus.text}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className={`h-4 rounded-full transition-all duration-300 ${
                          storageInfo.storageStatus.level === 'low' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          storageInfo.storageStatus.level === 'moderate' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          storageInfo.storageStatus.level === 'high' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          storageInfo.storageStatus.level === 'warning' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${Math.min(storageInfo.usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0%</span>
                      <span className="font-medium">{storageInfo.usagePercentage.toFixed(1)}% usado</span>
                      <span>100%</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">
                      {storageInfo.storageStatus.description}
                    </p>
                  </div>
                </div>

                {/* Análise Detalhada */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Análise de Distribuição</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Produtos com imagens:</span>
                        <span className="font-semibold text-gray-800">
                          {storageInfo.productsWithImages} ({((storageInfo.productsWithImages / storageInfo.totalProducts) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Produtos sem imagens:</span>
                        <span className="font-semibold text-gray-800">
                          {storageInfo.productsWithoutImages} ({((storageInfo.productsWithoutImages / storageInfo.totalProducts) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Média de imagens/produto:</span>
                        <span className="font-semibold text-gray-800">
                          {storageInfo.averageImagesPerProduct.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Produtos por Armazenamento */}
                  {storageInfo.imagesByProduct && storageInfo.imagesByProduct.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Produtos com Mais Imagens</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {storageInfo.imagesByProduct.slice(0, 5).map((product, index) => (
                          <div key={product.id} className="flex justify-between items-center text-sm">
                            <div className="flex-1 truncate">
                              <span className="font-medium text-gray-800">{product.codigo}</span>
                              <span className="text-gray-600 ml-2 truncate">{product.nome}</span>
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-semibold text-gray-800">{product.imageCount} imgs</div>
                              <div className="text-xs text-gray-500">{formatBytes(product.estimatedSizeKB * 1024)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alertas de Armazenamento */}
              {storageInfo.usagePercentage > 75 && (
                <div className={`mt-4 p-4 rounded-lg ${
                  storageInfo.usagePercentage > 90 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      storageInfo.usagePercentage > 90 ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <h5 className={`font-semibold ${
                        storageInfo.usagePercentage > 90 ? 'text-red-800' : 'text-orange-800'
                      }`}>
                        {storageInfo.usagePercentage > 90 ? 'Aviso Crítico' : 'Atenção'}
                      </h5>
                      <p className={`text-sm ${
                        storageInfo.usagePercentage > 90 ? 'text-red-700' : 'text-orange-700'
                      }`}>
                        {storageInfo.usagePercentage > 90 
                          ? 'Você está muito próximo do limite de armazenamento. Considere fazer upgrade do plano ou otimizar as imagens.'
                          : 'O uso de armazenamento está alto. Monitore o crescimento e considere otimizar as imagens.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Métricas de Uso */}
          {usageMetrics && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Métricas de Uso</h3>
                  <p className="text-gray-600">Atividade dos últimos {usageMetrics.period}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Produtos Criados</p>
                      <p className="text-2xl font-bold text-gray-800">{usageMetrics.totalProductsInPeriod}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <PieChart className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Imagens Adicionadas</p>
                      <p className="text-2xl font-bold text-gray-800">{usageMetrics.totalImagesInPeriod}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Média Diária</p>
                      <p className="text-2xl font-bold text-gray-800">{usageMetrics.averageProductsPerDay.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown diário */}
              {Object.keys(usageMetrics.dailyBreakdown).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Atividade Diária</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(usageMetrics.dailyBreakdown).map(([date, data]) => (
                      <div key={date} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{new Date(date).toLocaleDateString('pt-BR')}</span>
                        <div className="flex space-x-4">
                          <span className="text-blue-600 font-medium">{data.productsCreated} produtos</span>
                          <span className="text-green-600 font-medium">{data.imagesAdded} imagens</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Informações Técnicas */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Info className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800">Informações Técnicas</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Configuração</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL do Supabase:</span>
                    <span className="font-mono text-gray-800 text-xs bg-white px-2 py-1 rounded">
                      {process.env.REACT_APP_SUPABASE_URL ? `${process.env.REACT_APP_SUPABASE_URL.substring(0, 20)}...` : 'Não configurado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tabela principal:</span>
                    <span className="font-mono text-gray-800">products</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Região do servidor:</span>
                    <span className="font-mono text-gray-800">{systemHealth?.serverRegion || 'us-east-1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protocolo:</span>
                    <span className="font-mono text-gray-800">HTTPS/REST API</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Estatísticas da Sessão</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última verificação:</span>
                    <span className="text-gray-800">
                      {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo de atividade:</span>
                    <span className="text-gray-800">
                      {systemHealth?.connectionStatus === 'connected' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cálculo de armazenamento:</span>
                    <span className="text-gray-800">
                      {storageInfo ? new Date(storageInfo.lastCalculated).toLocaleTimeString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Dados atualizados automaticamente • Próxima atualização em 5 minutos
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseStatusPanel;