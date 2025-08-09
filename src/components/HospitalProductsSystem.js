import React, { useState, useEffect } from 'react';
import { Plus, Package, Edit3, Trash2, Search, Eye, ChevronLeft, ChevronRight, ArrowLeft, Download, ZoomIn, X, Database, RefreshCw, FileDown, FileUp, LogOut, User, Shield, Users, ChevronDown, Filter } from 'lucide-react';
import ProductForm from './ProductForm';
import databaseService from '../services/database';

const HospitalProductsSystem = ({ currentUser, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStats, setDbStats] = useState(null);
  const [showDbStatus, setShowDbStatus] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [filters, setFilters] = useState({
    marca: '',
    setor: '',
    hasImages: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const loadedProducts = await databaseService.getAllProducts();
      setProducts(loadedProducts);
      console.log(`Carregados ${loadedProducts.length} produtos do banco de dados`);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos do banco de dados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await databaseService.getStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair do sistema?')) {
      onLogout();
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const originalProduct = await databaseService.getProduct(editingProduct.id);
        const updatedProduct = await databaseService.updateProduct({
          ...productData,
          createdAt: originalProduct.createdAt
        });
        
        setProducts(prev => prev.map(product => 
          product.id === editingProduct.id ? updatedProduct : product
        ));
      } else {
        const newProduct = await databaseService.addProduct(productData);
        setProducts(prev => [...prev, newProduct]);
      }
      
      setEditingProduct(null);
      setCurrentPage('list');
      loadStats();
      
      const message = editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
      showNotification(message, 'success');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto no banco de dados');
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
        alert('Erro ao excluir produto do banco de dados');
      }
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-slide-in ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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
      alert('Erro ao exportar dados');
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
        alert('Erro ao importar dados. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.setor && product.setor.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMarca = !filters.marca || product.marca === filters.marca;
    const matchesSetor = !filters.setor || product.setor === filters.setor;
    const matchesImages = !filters.hasImages || 
      (filters.hasImages === 'com' && product.fotos && product.fotos.length > 0) ||
      (filters.hasImages === 'sem' && (!product.fotos || product.fotos.length === 0));

    return matchesSearch && matchesMarca && matchesSetor && matchesImages;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      marca: '',
      setor: '',
      hasImages: ''
    });
  };

  const hasActiveFilters = searchTerm || filters.marca || filters.setor || filters.hasImages;
  const uniqueBrands = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();
  const uniqueSectors = [...new Set(products.map(p => p.setor).filter(Boolean))].sort();

  const viewProduct = (product) => {
    setViewingProduct(product);
    setCurrentImageIndex(0);
    setCurrentPage('view');
  };

  const nextImage = () => {
    if (viewingProduct && viewingProduct.fotos) {
      setCurrentImageIndex((prev) => 
        prev < viewingProduct.fotos.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (viewingProduct && viewingProduct.fotos) {
      setCurrentImageIndex((prev) => 
        prev > 0 ? prev - 1 : viewingProduct.fotos.length - 1
      );
    }
  };

  const goToNewProduct = () => {
    setEditingProduct(null);
    setCurrentPage('form');
  };

  const goBackToList = () => {
    setCurrentPage('list');
  };

  const downloadImage = (imageUrl, fileName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || 'produto-imagem.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openZoom = () => {
    setIsZoomOpen(true);
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
  };

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
                    <p className="text-blue-100 text-sm md:text-base">Controle inteligente de produtos e equipamentos médicos</p>
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
                    <button
                      onClick={() => setShowDbStatus(!showDbStatus)}
                      className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                      title="Status do Banco de Dados (Admin Only)"
                    >
                      <Database className="w-5 h-5" />
                      {dbStats && (
                        <span className="hidden md:inline text-sm font-medium">
                          {dbStats.totalProducts} produtos
                        </span>
                      )}
                    </button>
                  )}
                  
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold text-sm flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Painel Administrativo
                    </h4>
                    <span className="bg-red-500 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ADMIN
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white mb-4">
                    <div>
                      <p className="text-xs opacity-80">Total de Produtos</p>
                      <p className="text-xl font-bold">{dbStats.totalProducts}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Marcas</p>
                      <p className="text-xl font-bold">{dbStats.totalBrands}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Setores</p>
                      <p className="text-xl font-bold">{dbStats.totalSectors}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Total de Imagens</p>
                      <p className="text-xl font-bold">{dbStats.totalImages}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleExportData}
                      className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Exportar Dados</span>
                    </button>
                    
                    <label className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm">
                      <FileUp className="w-4 h-4" />
                      <span>Importar Dados</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                    </label>
                    
                    <button
                      onClick={loadProducts}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-all"
                      title="Recarregar dados"
                    >
                      <RefreshCw className="w-4 h-4" />
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
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Setores Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(products.map(p => p.setor).filter(Boolean)).size}
                  </p>
                  <p className="text-purple-600 text-xs mt-1">
                    <span className="inline-flex items-center">
                      <div className="w-3 h-3 mr-1 bg-purple-600 rounded-full"></div>
                      Setores em uso
                    </span>
                  </p>
                </div>
                <div className="bg-purple-100 p-2.5 rounded-xl">
                  <div className="w-6 h-6 text-purple-600 flex items-center justify-center font-bold text-base">🏥</div>
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
                      Fornecedores
                    </span>
                  </p>
                </div>
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                  <div className="w-6 h-6 text-indigo-600 flex items-center justify-center font-bold text-base">🏭</div>
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Carregando produtos do banco de dados...</p>
              </div>
            </div>
          )}

          {/* Tabela de Produtos Moderna - Só aparece se houver produtos e não estiver carregando */}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

                    {/* Filtro por Setor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Setor
                      </label>
                      <select
                        value={filters.setor}
                        onChange={(e) => setFilters(prev => ({ ...prev, setor: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Todos os setores</option>
                        {uniqueSectors.map(setor => (
                          <option key={setor} value={setor}>{setor}</option>
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
                        {filters.setor && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Setor: {filters.setor}
                            <button onClick={() => setFilters(prev => ({ ...prev, setor: '' }))} className="ml-1 hover:text-green-600">
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
                        Setor
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
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200">
                            {product.setor || 'Não informado'}
                          </span>
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
                  <button
                    onClick={goToNewProduct}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl inline-flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Cadastrar Primeiro Produto</span>
                  </button>
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
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sessão Ativa</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {new Date(currentUser.loginTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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

  if (currentPage === 'view' && viewingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2">
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage('list')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{viewingProduct.nome}</h1>
                  <p className="text-gray-600 text-sm">Código: {viewingProduct.codigo}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(viewingProduct)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(viewingProduct.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Galeria de Fotos</h3>
              {viewingProduct.fotos && viewingProduct.fotos.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={viewingProduct.fotos[currentImageIndex].url}
                      alt={viewingProduct.nome}
                      className="w-full h-64 object-contain rounded-lg shadow-lg bg-gray-50"
                    />
                    
                    {viewingProduct.fotos[currentImageIndex].descricao && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-75 text-white p-2 rounded-lg">
                        <p className="text-sm">{viewingProduct.fotos[currentImageIndex].descricao}</p>
                      </div>
                    )}
                    
                    {viewingProduct.fotos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {viewingProduct.fotos.length}
                    </div>
                    
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={openZoom}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-all shadow-lg"
                        title="Ampliar imagem"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadImage(
                          viewingProduct.fotos[currentImageIndex].url,
                          `${viewingProduct.nome}-imagem-${currentImageIndex + 1}.jpg`
                        )}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all shadow-lg"
                        title="Baixar imagem"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {viewingProduct.fotos.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {viewingProduct.fotos.map((foto, index) => (
                        <button
                          key={foto.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          <img
                            src={foto.url}
                            alt={`${viewingProduct.nome} ${index + 1}`}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {viewingProduct.fotos[currentImageIndex] && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Detalhes da Imagem {currentImageIndex + 1}</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">Peso:</span>
                          <p className="font-medium">{viewingProduct.fotos[currentImageIndex].peso || 'Não informado'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Dimensões:</span>
                          <p className="font-medium">{viewingProduct.fotos[currentImageIndex].dimensoes || 'Não informado'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Quantidade:</span>
                          <p className="font-medium">{viewingProduct.fotos[currentImageIndex].quantidade || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações do Produto</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</h4>
                    <p className="text-base font-medium text-gray-800">{viewingProduct.codigo}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</h4>
                    <p className="text-base font-medium text-gray-800">{viewingProduct.nome}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca</h4>
                    <p className="text-base font-medium text-gray-800">{viewingProduct.marca}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Setor</h4>
                    <p className="text-base font-medium text-gray-800">{viewingProduct.setor || 'Não informado'}</p>
                  </div>

                  {viewingProduct.descricao && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Descrição Geral</h4>
                      <p className="text-gray-700 leading-relaxed text-sm">{viewingProduct.descricao}</p>
                    </div>
                  )}

                  {(viewingProduct.createdAt || viewingProduct.updatedAt) && (
                    <div className="pt-3 border-t border-gray-200">
                      {viewingProduct.createdAt && (
                        <div className="text-xs text-gray-500">
                          Cadastrado em: {new Date(viewingProduct.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {viewingProduct.updatedAt && (
                        <div className="text-xs text-gray-500">
                          Última atualização: {new Date(viewingProduct.updatedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {viewingProduct.fotos && viewingProduct.fotos.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Descrições das Fotos</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewingProduct.fotos.map((foto, index) => (
                      <div key={foto.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                          index === currentImageIndex ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700 flex-1">
                          {foto.descricao || 'Sem descrição'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isZoomOpen && viewingProduct && viewingProduct.fotos && viewingProduct.fotos[currentImageIndex] && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full overflow-auto">
              <button
                onClick={closeZoom}
                className="fixed top-4 right-4 bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full shadow-lg z-20 transition-all"
                title="Fechar zoom"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center justify-center min-h-full p-4">
                <img
                  src={viewingProduct.fotos[currentImageIndex].url}
                  alt={viewingProduct.nome}
                  className="block shadow-2xl rounded-lg cursor-pointer"
                  style={{ maxWidth: 'none', height: 'auto' }}
                  onClick={closeZoom}
                />
              </div>

              <div className="fixed bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg z-10">
                <h4 className="font-semibold text-lg mb-1">{viewingProduct.nome}</h4>
                <p className="text-sm opacity-90">
                  Imagem {currentImageIndex + 1} de {viewingProduct.fotos.length} • Tamanho real
                </p>
                {viewingProduct.fotos[currentImageIndex].descricao && (
                  <p className="text-sm mt-1 opacity-80">
                    {viewingProduct.fotos[currentImageIndex].descricao}
                  </p>
                )}
              </div>

              {viewingProduct.fotos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default HospitalProductsSystem;