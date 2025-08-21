import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Edit3, Trash2, Search, Eye, RefreshCw, FileDown, FileUp, LogOut, Shield, Users, Filter, X, Database, HardDrive, Activity, Wifi, WifiOff, CheckCircle, AlertTriangle, Info, Settings } from 'lucide-react';
import ProductForm from './ProductForm';
import ProductView from './ProductView';
import SupabaseStatusPanel from './SupabaseStatusPanel';
import databaseService from '../services/DatabaseService';

const ProductManager = ({ currentUser, onLogout, showNotification, dbConnectionStatus }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStats, setDbStats] = useState(null);
  const [showDbStatus, setShowDbStatus] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [connectionLatency, setConnectionLatency] = useState(null);
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);
  
  const [filters, setFilters] = useState({
    marca: '',
    hasImages: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedProducts = await databaseService.getAllProducts();
      setProducts(loadedProducts);
      console.log(`Carregados ${loadedProducts.length} produtos do Supabase`);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showNotification('Erro ao carregar produtos do banco de dados', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const loadStats = useCallback(async () => {
    try {
      const stats = await databaseService.getStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  const checkStorageInfo = useCallback(async () => {
    try {
      // Simulação das informações de armazenamento (você pode adaptar conforme sua configuração do Supabase)
      const totalImages = products.reduce((sum, p) => sum + (p.fotos ? p.fotos.length : 0), 0);
      const estimatedStoragePerImage = 500; // KB estimado por imagem
      const totalEstimatedStorage = totalImages * estimatedStoragePerImage;
      
      // Limite do plano gratuito do Supabase: 500MB
      const freeLimit = 500 * 1024; // KB
      const usagePercentage = (totalEstimatedStorage / freeLimit) * 100;

      setStorageInfo({
        totalImages,
        estimatedStorage: totalEstimatedStorage,
        freeLimit,
        usagePercentage: Math.min(usagePercentage, 100),
        remainingStorage: Math.max(freeLimit - totalEstimatedStorage, 0)
      });
    } catch (error) {
      console.error('Erro ao calcular informações de armazenamento:', error);
    }
  }, [products]);

  const checkConnectionLatency = useCallback(async () => {
    try {
      const startTime = Date.now();
      await databaseService.testConnection();
      const endTime = Date.now();
      setConnectionLatency(endTime - startTime);
    } catch (error) {
      setConnectionLatency(null);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadStats();
    checkConnectionLatency();
  }, [loadProducts, loadStats, checkConnectionLatency]);

  useEffect(() => {
    if (products.length > 0) {
      checkStorageInfo();
    }
  }, [products, checkStorageInfo]);

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair do sistema?')) {
      onLogout();
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const updatedProduct = await databaseService.updateProduct({
          ...productData,
          id: editingProduct.id
        });
        
        setProducts(prev => prev.map(product => 
          product.id === editingProduct.id ? updatedProduct : product
        ));
      } else {
        const newProduct = await databaseService.addProduct(productData);
        setProducts(prev => [newProduct, ...prev]);
      }
      
      setEditingProduct(null);
      setCurrentPage('list');
      loadStats();
      
      const message = editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
      showNotification(message, 'success');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      showNotification('Erro ao salvar produto no banco de dados', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setCurrentPage('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await databaseService.deleteProduct(id);
        setProducts(prev => prev.filter(product => product.id !== id));
        
        if (currentPage === 'view') {
          setCurrentPage('list');
        }
        
        loadStats();
        showNotification('Produto excluído com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        showNotification('Erro ao excluir produto do banco de dados', 'error');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const jsonData = await databaseService.exportProducts();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos-hospital-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Dados exportados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      showNotification('Erro ao exportar dados', 'error');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const count = await databaseService.importProducts(e.target.result);
        await loadProducts();
        await loadStats();
        showNotification(`${count} produtos importados com sucesso!`, 'success');
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        showNotification('Erro ao importar dados. Verifique o formato do arquivo.', 'error');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  // NOVA FUNÇÃO: Atualizar dados SEM recarregar a página
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadStats(),
        checkConnectionLatency()
      ]);
      showNotification('Dados atualizados!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showNotification('Erro ao atualizar alguns dados', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatus = () => {
    if (dbConnectionStatus === 'connected') {
      if (connectionLatency !== null) {
        if (connectionLatency < 200) return { icon: CheckCircle, color: 'green', text: 'Excelente', detail: `${connectionLatency}ms` };
        if (connectionLatency < 500) return { icon: CheckCircle, color: 'yellow', text: 'Boa', detail: `${connectionLatency}ms` };
        return { icon: AlertTriangle, color: 'orange', text: 'Lenta', detail: `${connectionLatency}ms` };
      }
      return { icon: CheckCircle, color: 'green', text: 'Online', detail: '' };
    }
    return { icon: WifiOff, color: 'red', text: 'Offline', detail: '' };
  };

  const getStorageStatus = () => {
    if (!storageInfo) return { color: 'gray', text: 'Calculando...' };
    
    if (storageInfo.usagePercentage < 50) return { color: 'green', text: 'Baixo uso' };
    if (storageInfo.usagePercentage < 80) return { color: 'yellow', text: 'Uso moderado' };
    if (storageInfo.usagePercentage < 95) return { color: 'orange', text: 'Uso alto' };
    return { color: 'red', text: 'Limite próximo' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarca = !filters.marca || product.marca === filters.marca;
    const matchesImages = !filters.hasImages || 
      (filters.hasImages === 'com' && product.fotos && product.fotos.length > 0) ||
      (filters.hasImages === 'sem' && (!product.fotos || product.fotos.length === 0));

    return matchesSearch && matchesMarca && matchesImages;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      marca: '',
      hasImages: ''
    });
  };

  const hasActiveFilters = searchTerm || filters.marca || filters.hasImages;
  const uniqueBrands = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();

  const viewProduct = (product) => {
    setViewingProduct(product);
    setCurrentPage('view');
  };

  const goToNewProduct = () => {
    setEditingProduct(null);
    setCurrentPage('form');
  };

  const goBackToList = () => {
    setCurrentPage('list');
  };

  const connectionStatus = getConnectionStatus();
  const storageStatus = getStorageStatus();

  if (currentPage === 'form') {
    return (
      <ProductForm
        editingProduct={editingProduct}
        products={products}
        onSave={handleSaveProduct}
        onCancel={goBackToList}
        databaseService={databaseService}
      />
    );
  }

  if (currentPage === 'view' && viewingProduct) {
    return (
      <ProductView
        viewingProduct={viewingProduct}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={goBackToList}
        showNotification={showNotification}
        isAdmin={currentUser.role === 'admin'}
      />
    );
  }

  if (currentPage === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-2">
        <div className="w-full">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-4 md:p-5 mb-4">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
            
            <div className="relative">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="flex items-center space-x-3 mb-3 lg:mb-0">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Sistema de Gestão Hospitalar</h1>
                    <div className="flex items-center space-x-4">
                      <p className="text-blue-100 text-sm md:text-base">Controle inteligente de produtos e equipamentos médicos</p>
                      
                      {/* Status da Conexão */}
                      <div className="flex items-center space-x-2">
                        <connectionStatus.icon className={`w-4 h-4 text-${connectionStatus.color}-400`} />
                        <span className="text-blue-100 text-xs">
                          {connectionStatus.text} {connectionStatus.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      id="user-menu-button"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-2">
                        {currentUser.role === 'admin' ? (
                          <Shield className="w-5 h-5" />
                        ) : (
                          <Users className="w-5 h-5" />
                        )}
                        <span className="hidden md:inline text-sm font-medium">{currentUser.name}</span>
                      </div>
                    </button>
                  </div>
                  
                  {currentUser.role === 'admin' && (
                    <>
                      <button
                        onClick={() => setShowDbStatus(!showDbStatus)}
                        className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        title="Painel Administrativo"
                      >
                        <Database className="w-5 h-5" />
                        {dbStats && (
                          <span className="hidden md:inline text-sm font-medium">
                            {dbStats.totalProducts} produtos
                          </span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowDetailedStatus(true)}
                        className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        title="Status Detalhado do Supabase"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="hidden md:inline text-sm font-medium">Status</span>
                      </button>
                    </>
                  )}
                  
                  {/* BOTÃO ATUALIZAR MODIFICADO */}
                  <button
                    onClick={refreshData}
                    disabled={isLoading}
                    className={`bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Atualizar dados"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden md:inline text-sm font-medium">
                      {isLoading ? 'Atualizando...' : 'Atualizar'}
                    </span>
                  </button>
                  
                  <button
                    onClick={goToNewProduct}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Novo Produto</span>
                  </button>
                </div>
              </div>

              {showDbStatus && dbStats && currentUser.role === 'admin' && (
                <div className="mt-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold text-sm flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Painel Administrativo
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-500 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ADMIN
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        dbConnectionStatus === 'connected' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        SUPABASE
                      </span>
                    </div>
                  </div>
                  
                  {/* Estatísticas Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white mb-4">
                    <div>
                      <p className="text-xs opacity-80">Total de Produtos</p>
                      <p className="text-xl font-bold">{dbStats.totalProducts}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Marcas</p>
                      <p className="text-xl font-bold">{dbStats.totalBrands}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Total de Imagens</p>
                      <p className="text-xl font-bold">{dbStats.totalImages}</p>
                    </div>
                  </div>

                  {/* Informações de Armazenamento */}
                  {storageInfo && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-medium text-sm flex items-center">
                          <HardDrive className="w-4 h-4 mr-2" />
                          Armazenamento
                        </h5>
                        <span className={`text-xs font-medium text-${storageStatus.color}-300`}>
                          {storageStatus.text}
                        </span>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-white mb-1">
                          <span>Usado: {formatBytes(storageInfo.estimatedStorage * 1024)}</span>
                          <span>Limite: {formatBytes(storageInfo.freeLimit * 1024)}</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              storageInfo.usagePercentage < 50 ? 'from-green-400 to-green-500' :
                              storageInfo.usagePercentage < 80 ? 'from-yellow-400 to-yellow-500' :
                              storageInfo.usagePercentage < 95 ? 'from-orange-400 to-orange-500' :
                              'from-red-400 to-red-500'
                            }`}
                            style={{ width: `${storageInfo.usagePercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-white opacity-80 mt-1">
                          {storageInfo.usagePercentage.toFixed(1)}% utilizado
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-white text-xs">
                        <div>
                          <p className="opacity-80">Imagens Armazenadas</p>
                          <p className="font-semibold">{storageInfo.totalImages}</p>
                        </div>
                        <div>
                          <p className="opacity-80">Espaço Restante</p>
                          <p className="font-semibold">{formatBytes(storageInfo.remainingStorage * 1024)}</p>
                        </div>
                      </div>

                      {storageInfo.usagePercentage > 80 && (
                        <div className="mt-3 bg-orange-500 bg-opacity-80 rounded-lg p-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-white" />
                            <p className="text-xs text-white font-medium">
                              Aviso: Você está próximo do limite de armazenamento
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Ações Administrativas */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportData}
                      className="flex-1 min-w-32 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Exportar</span>
                    </button>
                    
                    <label className="flex-1 min-w-32 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm">
                      <FileUp className="w-4 h-4" />
                      <span>Importar</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      onClick={refreshData}
                      disabled={isLoading}
                      className={`bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-all ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Atualizar dados"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total de Produtos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
                  <p className="text-green-600 text-xs mt-1">
                    <span className="inline-flex items-center">
                      <Package className="w-3 h-3 mr-1" />
                      Produtos cadastrados
                    </span>
                  </p>
                </div>
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Marcas Diferentes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(products.map(p => p.marca).filter(Boolean)).size}
                  </p>
                  <p className="text-indigo-600 text-xs mt-1">
                    <span className="inline-flex items-center">
                      <div className="w-3 h-3 mr-1 bg-indigo-600 rounded-full"></div>
                      Fornecedores ativos
                    </span>
                  </p>
                </div>
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                  <div className="w-6 h-6 text-indigo-600 flex items-center justify-center font-bold text-base">🏭</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Armazenamento</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {storageInfo ? `${storageInfo.usagePercentage.toFixed(0)}%` : '...'}
                  </p>
                  <p className={`text-xs mt-1 text-${storageStatus.color}-600`}>
                    <span className="inline-flex items-center">
                      <HardDrive className="w-3 h-3 mr-1" />
                      {storageStatus.text}
                    </span>
                  </p>
                </div>
                <div className={`bg-${storageStatus.color}-100 p-2.5 rounded-xl`}>
                  <HardDrive className={`w-6 h-6 text-${storageStatus.color}-600`} />
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Carregando produtos do Supabase...</p>
                <p className="text-gray-500 text-sm mt-1">
                  {dbConnectionStatus === 'connected' ? 'Conectado ao banco na nuvem' : 'Verificando conexão...'}
                </p>
              </div>
            </div>
          )}

          {/* Lista de Produtos */}
          {!isLoading && products.length > 0 && (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 mr-3 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Lista de Produtos</h3>
                    {filteredProducts.length > 0 && (
                      <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>
                  
                  {/* Barra de Busca na Tabela com Filtro */}
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center space-x-2">
                      {/* Barra de Busca */}
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Buscar produtos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <div className="w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold transition-colors">
                              ✕
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Botão de Filtro */}
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`relative p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                          hasActiveFilters
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                      >
                        <Filter className="w-5 h-5" />
                        {hasActiveFilters && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">!</span>
                          </div>
                        )}
                      </button>
                    </div>
                    
                    {searchTerm && (
                      <div className="mt-2 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                          {filteredProducts.length} resultado(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Painel de Filtros Expansível */}
              {showFilters && (
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros Avançados
                    </h4>
                    {hasActiveFilters && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)} filtros ativos
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Filtro por Marca */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca
                      </label>
                      <select
                        value={filters.marca}
                        onChange={(e) => setFilters(prev => ({ ...prev, marca: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Todas as marcas</option>
                        {uniqueBrands.map(marca => (
                          <option key={marca} value={marca}>{marca}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por Imagens */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagens
                      </label>
                      <select
                        value={filters.hasImages}
                        onChange={(e) => setFilters(prev => ({ ...prev, hasImages: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Todos os produtos</option>
                        <option value="com">Com imagens</option>
                        <option value="sem">Sem imagens</option>
                      </select>
                    </div>

                    {/* Botão Limpar Filtros */}
                    <div className="flex items-end">
                      <button
                        onClick={clearAllFilters}
                        disabled={!hasActiveFilters}
                        className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          hasActiveFilters
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                        }`}
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  </div>

                  {/* Resumo dos Filtros Ativos */}
                  {hasActiveFilters && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-2">Filtros aplicados:</p>
                      <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Busca: "{searchTerm}"
                            <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-600">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {filters.marca && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            Marca: {filters.marca}
                            <button onClick={() => setFilters(prev => ({ ...prev, marca: '' }))} className="ml-1 hover:text-purple-600">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {filters.hasImages && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                            {filters.hasImages === 'com' ? 'Com imagens' : 'Sem imagens'}
                            <button onClick={() => setFilters(prev => ({ ...prev, hasImages: '' }))} className="ml-1 hover:text-orange-600">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estatísticas dos Resultados */}
                  <div className="mt-3 text-sm text-gray-600">
                    Mostrando <span className="font-semibold text-gray-900">{filteredProducts.length}</span> de{' '}
                    <span className="font-semibold text-gray-900">{products.length}</span> produtos
                    {hasActiveFilters && filteredProducts.length === 0 && (
                      <span className="ml-2 text-orange-600 font-medium">• Nenhum produto encontrado</span>
                    )}
                  </div>
                </div>
              )}

              <div className={`overflow-x-auto ${products.length >= 3 ? 'max-h-80 overflow-y-auto' : ''}`}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Imagem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nome do Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.fotos && product.fotos.length > 0 ? (
                              <div className="relative group">
                                <img
                                  src={product.fotos[0].url}
                                  alt={product.nome}
                                  className="h-16 w-16 rounded-xl object-contain cursor-pointer border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200 shadow-sm bg-white"
                                  onClick={() => viewProduct(product)}
                                />
                                {product.fotos.length > 1 && (
                                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                                    {product.fotos.length}
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200 flex items-center justify-center">
                                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                            ) : (
                              <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all duration-200"
                                   onClick={() => viewProduct(product)}>
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200">
                            {product.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200" 
                               onClick={() => viewProduct(product)}>
                            {product.nome}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-700 font-medium">{product.marca}</div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {product.descricao || (
                              <span className="italic text-gray-400">Sem descrição</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewProduct(product)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                              title="Visualizar"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {currentUser.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Editar"
                                >
                                  <Edit3 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && (products.length === 0 || (products.length > 0 && filteredProducts.length === 0)) && (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {products.length === 0 
                    ? 'Bem-vindo ao sistema!' 
                    : hasActiveFilters 
                    ? 'Nenhum produto encontrado'
                    : 'Nenhum produto encontrado'
                  }
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {products.length === 0 
                    ? 'Você ainda não cadastrou nenhum produto. Comece agora mesmo adicionando seus primeiros equipamentos hospitalares.'
                    : hasActiveFilters
                    ? 'Não encontramos produtos que correspondam aos filtros aplicados. Tente ajustar os critérios de busca.'
                    : `Não encontramos produtos com "${searchTerm}". Tente buscar com outros termos ou cadastre um novo produto.`
                  }
                </p>
                
                {products.length === 0 ? (
                  <div className="space-y-3">
                    <button
                      onClick={goToNewProduct}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl inline-flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Cadastrar Primeiro Produto</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                    >
                      {hasActiveFilters ? 'Limpar Filtros' : 'Limpar busca'}
                    </button>
                    <button
                      onClick={goToNewProduct}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl inline-flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Cadastrar Produto</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu do Usuário */}
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            
            <div 
              className="fixed top-20 right-4 w-72 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden"
              style={{
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                    currentUser.role === 'admin' ? 'bg-blue-100 border-2 border-blue-200' : 'bg-green-100 border-2 border-green-200'
                  }`}>
                    {currentUser.role === 'admin' ? (
                      <Shield className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Users className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-gray-900">{currentUser.name}</p>
                    <p className="text-sm text-gray-600">@{currentUser.username}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      currentUser.role === 'admin' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Conexão</p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        dbConnectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <p className="text-sm text-gray-700 font-medium">
                        {dbConnectionStatus === 'connected' ? 'Supabase Online' : 'Supabase Offline'}
                      </p>
                    </div>
                    {connectionLatency && (
                      <p className="text-xs text-gray-500 mt-1">
                        Latência: {connectionLatency}ms
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sessão</p>
                    <p className="text-xs text-gray-600">
                      {new Date(currentUser.loginTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Painel de Status Detalhado do Supabase */}
        {showDetailedStatus && (
          <SupabaseStatusPanel 
            databaseService={databaseService}
            onClose={() => setShowDetailedStatus(false)}
          />
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default ProductManager;