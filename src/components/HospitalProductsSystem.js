import React, { useState } from 'react';
import { Plus, Package, Edit3, Trash2, Search, Camera, Eye, ChevronLeft, ChevronRight, ArrowLeft, Save } from 'lucide-react';

const HospitalProductsSystem = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list'); // 'list', 'form', 'view'
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    marca: '',
    setor: '',
    descricao: '',
    fotos: []
  });

  // Função para adicionar uma nova imagem vazia
  const addEmptyImage = () => {
    const newImage = {
      id: Date.now() + Math.random(),
      url: null,
      name: '',
      descricao: '',
      dimensoes: '',
      quantidade: '',
      peso: ''
    };
    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, newImage]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, imageId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          fotos: prev.fotos.map(foto => 
            foto.id === imageId 
              ? { ...foto, url: event.target.result, name: file.name }
              : foto
          )
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateImageField = (imageId, field, value) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.map(foto => 
        foto.id === imageId ? { ...foto, [field]: value } : foto
      )
    }));
  };

  const removeFoto = (fotoId) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter(foto => foto.id !== fotoId)
    }));
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      marca: '',
      setor: '',
      descricao: '',
      fotos: []
    });
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    if (!formData.codigo || !formData.nome || !formData.marca || !formData.setor) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingProduct) {
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? { ...formData, id: editingProduct.id }
          : product
      ));
    } else {
      const newProduct = {
        ...formData,
        id: Date.now()
      };
      setProducts(prev => [...prev, newProduct]);
    }

    resetForm();
    setCurrentPage('list');
  };

  const handleEdit = (product) => {
    setFormData({
      codigo: product.codigo,
      nome: product.nome,
      marca: product.marca,
      setor: product.setor || '',
      descricao: product.descricao || '',
      fotos: product.fotos || []
    });
    setEditingProduct(product);
    setCurrentPage('form');
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(product => product.id !== id));
      if (currentPage === 'view') {
        setCurrentPage('list');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.setor && product.setor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    resetForm();
    setCurrentPage('form');
  };

  const goBackToList = () => {
    resetForm();
    setCurrentPage('list');
  };

  // Página de Lista de Produtos
  if (currentPage === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-8xl mx-auto">
          {/* Header Principal */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8 md:p-10 mb-8">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white bg-opacity-5 rounded-full"></div>
            
            <div className="relative">
              {/* Título e Botão */}
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-6 md:mb-0">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Sistema de Gestão Hospitalar</h1>
                    <p className="text-blue-100 text-lg">Controle inteligente de produtos e equipamentos médicos</p>
                  </div>
                </div>
                
                <button
                  onClick={goToNewProduct}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-lg">Novo Produto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total de Produtos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
                  <p className="text-green-600 text-sm mt-1">
                    <span className="inline-flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      Produtos cadastrados
                    </span>
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Setores Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {new Set(products.map(p => p.setor).filter(Boolean)).size}
                  </p>
                  <p className="text-purple-600 text-sm mt-1">
                    <span className="inline-flex items-center">
                      <div className="w-4 h-4 mr-1 bg-purple-600 rounded-full"></div>
                      Setores em uso
                    </span>
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <div className="w-8 h-8 text-purple-600 flex items-center justify-center font-bold text-lg">🏥</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Marcas Diferentes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {new Set(products.map(p => p.marca).filter(Boolean)).size}
                  </p>
                  <p className="text-indigo-600 text-sm mt-1">
                    <span className="inline-flex items-center">
                      <div className="w-4 h-4 mr-1 bg-indigo-600 rounded-full"></div>
                      Fornecedores
                    </span>
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <div className="w-8 h-8 text-indigo-600 flex items-center justify-center font-bold text-lg">🏭</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Produtos Moderna - Só aparece se houver produtos */}
          {products.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
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
                  
                  {/* Barra de Busca na Tabela */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Imagem
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nome do Produto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Setor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.fotos && product.fotos.length > 0 ? (
                              <div className="relative group">
                                <img
                                  src={product.fotos[0].url}
                                  alt={product.nome}
                                  className="h-16 w-16 rounded-xl object-cover cursor-pointer border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-200 shadow-sm"
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200">
                            {product.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200" 
                               onClick={() => viewProduct(product)}>
                            {product.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 font-medium">{product.marca}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200">
                            {product.setor || 'Não informado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {product.descricao || (
                              <span className="italic text-gray-400">Sem descrição</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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

          {/* Mensagem quando não há produtos ou busca sem resultados */}
          {(products.length === 0 || (products.length > 0 && filteredProducts.length === 0)) && (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {products.length === 0 ? 'Bem-vindo ao sistema!' : 'Nenhum produto encontrado'}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {products.length === 0 
                    ? 'Você ainda não cadastrou nenhum produto. Comece agora mesmo adicionando seus primeiros equipamentos hospitalares.'
                    : `Não encontramos produtos com "${searchTerm}". Tente buscar com outros termos ou cadastre um novo produto.`
                  }
                </p>
                
                {products.length === 0 ? (
                  <button
                    onClick={goToNewProduct}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl inline-flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Cadastrar Primeiro Produto</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                    >
                      Limpar busca
                    </button>
                    <button
                      onClick={goToNewProduct}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl inline-flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
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
      </div>
    );
  }

  // Página de Formulário (Novo/Editar Produto)
  if (currentPage === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Moderno */}
          <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-6 md:p-8 mb-8">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <button
                  onClick={goBackToList}
                  className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white p-3 rounded-xl transition-all duration-200 shadow-lg"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {editingProduct ? '✏️ Editar Produto' : '✨ Novo Produto'}
                  </h1>
                  <p className="text-green-100">
                    {editingProduct ? 'Modifique as informações do produto' : 'Cadastre um novo produto no sistema'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                <Save className="w-5 h-5" />
                <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
              </button>
            </div>
          </div>

          {/* Form Melhorado */}
          <div className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Informações do Produto</h3>
                    <p className="text-blue-100 text-sm">Dados principais para identificação</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">🔢</span>
                      Código do Produto *
                    </label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-gray-50 hover:bg-white"
                      placeholder="Ex: HP001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">🏷️</span>
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-gray-50 hover:bg-white"
                      placeholder="Ex: Monitor Cardíaco Digital"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">🏭</span>
                      Marca *
                    </label>
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-gray-50 hover:bg-white"
                      placeholder="Ex: BD Medical"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">🏥</span>
                      Setor *
                    </label>
                    <select
                      name="setor"
                      value={formData.setor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-gray-50 hover:bg-white"
                    >
                      <option value="">Selecione um setor</option>
                      <option value="CAMB">CAMB</option>
                      <option value="BMAC">BMAC</option>
                      <option value="DOCA">DOCA</option>
                      <option value="Maternidade">10° Andar</option>
                      <option value="Pediatria">13° Andar</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">📝</span>
                      Descrição
                    </label>
                    <textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg resize-none bg-gray-50 hover:bg-white"
                      placeholder="Descreva as características e funcionalidades do produto..."
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Galeria de Fotos Moderna */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Galeria de Imagens</h3>
                    <p className="text-emerald-100 text-sm">Adicione até 5 imagens com informações detalhadas</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Lista de Imagens */}
                {formData.fotos.map((foto, index) => (
                  <div key={foto.id} className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">Imagem {index + 1}</h4>
                          <p className="text-gray-600 text-sm">Adicione detalhes sobre esta imagem</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFoto(foto.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Upload de Imagem Melhorado */}
                      <div className="space-y-3">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">📷</span>
                          Selecionar Imagem
                        </label>
                        <div className="border-3 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 bg-white">
                          {foto.url ? (
                            <div className="space-y-4">
                              <img
                                src={foto.url}
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-40 object-cover rounded-xl mx-auto shadow-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById(`file-${foto.id}`).click()}
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition-all duration-200"
                              >
                                Alterar Imagem
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                                <Camera className="w-8 h-8 text-gray-400" />
                              </div>
                              <button
                                type="button"
                                onClick={() => document.getElementById(`file-${foto.id}`).click()}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                              >
                                Escolher Arquivo
                              </button>
                              <p className="text-xs text-gray-500">PNG, JPG até 10MB</p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`file-${foto.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, foto.id)}
                          className="hidden"
                        />
                      </div>

                      {/* Campos de Informação Melhorados */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-semibold text-gray-700">
                            <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">📝</span>
                            Descrição da Imagem
                          </label>
                          <textarea
                            value={foto.descricao}
                            onChange={(e) => updateImageField(foto.id, 'descricao', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-base"
                            placeholder="Ex: Vista frontal do equipamento mostrando o painel de controle"
                            rows="3"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                              <span className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">⚖️</span>
                              Peso (kg)
                            </label>
                            <input
                              type="text"
                              value={foto.peso}
                              onChange={(e) => updateImageField(foto.id, 'peso', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-base"
                              placeholder="0.50"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                              <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">📏</span>
                              Dimensões
                            </label>
                            <input
                              type="text"
                              value={foto.dimensoes}
                              onChange={(e) => updateImageField(foto.id, 'dimensoes', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-base"
                              placeholder="10x20x30 cm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700">
                              <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-lg">🔢</span>
                              Quantidade
                            </label>
                            <input
                              type="number"
                              value={foto.quantidade}
                              onChange={(e) => updateImageField(foto.id, 'quantidade', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-base"
                              placeholder="1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botão Adicionar Imagem Melhorado */}
                {formData.fotos.length < 5 && (
                  <button
                    type="button"
                    onClick={addEmptyImage}
                    className="w-full border-3 border-dashed border-emerald-300 rounded-2xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 bg-white group"
                  >
                    <div className="bg-emerald-100 group-hover:bg-emerald-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                      <Plus className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-xl font-bold text-emerald-700 mb-2">Adicionar Nova Imagem</h4>
                    <p className="text-emerald-600">Clique para adicionar mais uma imagem ao produto</p>
                  </button>
                )}

                {formData.fotos.length === 0 && (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="bg-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Camera className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-600 mb-4">Nenhuma imagem adicionada</h4>
                    <p className="text-gray-500 mb-6">Adicione imagens para melhor visualização do produto</p>
                    <button
                      type="button"
                      onClick={addEmptyImage}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl inline-flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
>
<Plus className="w-6 h-6" />
<span>Adicionar Primeira Imagem</span>
</button>
</div>
)}
</div>
</div>
        {/* Botões de Ação Melhorados */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
          <button
            onClick={goBackToList}
            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {editingProduct ? '💾 Salvar Alterações' : '✨ Cadastrar Produto'}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
// Página de Visualização do Produto
if (currentPage === 'view' && viewingProduct) {
return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
<div className="max-w-6xl mx-auto">
{/* Header */}
<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
<div className="flex items-center justify-between">
<div className="flex items-center space-x-4">
<button
onClick={() => setCurrentPage('list')}
className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
>
<ArrowLeft className="w-5 h-5" />
</button>
<div>
<h1 className="text-2xl font-bold text-gray-800">{viewingProduct.nome}</h1>
<p className="text-gray-600">Código: {viewingProduct.codigo}</p>
</div>
</div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleEdit(viewingProduct)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => handleDelete(viewingProduct.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Galeria de Fotos</h3>
          {viewingProduct.fotos && viewingProduct.fotos.length > 0 ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={viewingProduct.fotos[currentImageIndex].url}
                  alt={viewingProduct.nome}
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
                
                {/* Descrição da foto atual */}
                {viewingProduct.fotos[currentImageIndex].descricao && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
                    <p className="text-sm">{viewingProduct.fotos[currentImageIndex].descricao}</p>
                  </div>
                )}
                
                {viewingProduct.fotos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {viewingProduct.fotos.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Navigation */}
              {viewingProduct.fotos.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {viewingProduct.fotos.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <img
                        src={foto.url}
                        alt={`${viewingProduct.nome} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Detalhes da Imagem Atual */}
              {viewingProduct.fotos[currentImageIndex] && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Detalhes da Imagem {currentImageIndex + 1}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Peso:</span>
                      <p className="font-medium">{viewingProduct.fotos[currentImageIndex].peso || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Dimensões:</span>
                      <p className="font-medium">{viewingProduct.fotos[currentImageIndex].dimensoes || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantidade:</span>
                      <p className="font-medium">{viewingProduct.fotos[currentImageIndex].quantidade || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-100 flex items-center justify-center rounded-lg">
              <Package className="w-20 h-20 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Informações do Produto */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações do Produto</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Código</h4>
                <p className="text-lg font-medium text-gray-800">{viewingProduct.codigo}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nome</h4>
                <p className="text-lg font-medium text-gray-800">{viewingProduct.nome}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Marca</h4>
                <p className="text-lg font-medium text-gray-800">{viewingProduct.marca}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Setor</h4>
                <p className="text-lg font-medium text-gray-800">{viewingProduct.setor || 'Não informado'}</p>
              </div>

              {viewingProduct.descricao && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Descrição Geral</h4>
                  <p className="text-gray-700 leading-relaxed">{viewingProduct.descricao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Descrições das Fotos */}
          {viewingProduct.fotos && viewingProduct.fotos.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Descrições das Fotos</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {viewingProduct.fotos.map((foto, index) => (
                  <div key={foto.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full text-sm flex items-center justify-center font-medium ${
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
  </div>
);
}
return null;
};
export default HospitalProductsSystem;