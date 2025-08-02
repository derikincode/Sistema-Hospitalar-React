import React, { useState } from 'react';
import { Plus, Package, Edit3, Trash2, Search, Camera, Eye, ChevronLeft, ChevronRight, ArrowLeft, Save, X, Upload, ImageIcon, Info, CheckCircle, AlertCircle } from 'lucide-react';

const HospitalProductsSystem = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list'); // 'list', 'form', 'view'
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    marca: '',
    setor: '',
    descricao: '',
    fotos: []
  });

  // Validação de formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.codigo.trim()) {
      errors.codigo = 'Código é obrigatório';
    } else if (formData.codigo.length < 2) {
      errors.codigo = 'Código deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (!formData.marca.trim()) {
      errors.marca = 'Marca é obrigatória';
    }
    
    if (!formData.setor.trim()) {
      errors.setor = 'Setor é obrigatório';
    }

    // Verificar se código já existe (exceto ao editar)
    const codeExists = products.some(product => 
      product.codigo.toLowerCase() === formData.codigo.toLowerCase() && 
      (!editingProduct || product.id !== editingProduct.id)
    );
    
    if (codeExists) {
      errors.codigo = 'Este código já existe';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para adicionar uma nova imagem vazia
  const addEmptyImage = () => {
    if (formData.fotos.length >= 5) return;
    
    const newImage = {
      id: Date.now() + Math.random(),
      url: null,
      name: '',
      descricao: '',
      dimensoes: '',
      quantidade: '1',
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
    
    // Limpar erro específico quando usuário começar a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e, imageId) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo permitido: 5MB');
        return;
      }

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }

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
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll para o primeiro erro
      const firstErrorElement = document.querySelector('.error-input');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // Simular um delay de processamento para UX
    await new Promise(resolve => setTimeout(resolve, 800));

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
    if (Object.keys(formData).some(key => formData[key] && formData[key] !== '' && !(Array.isArray(formData[key]) && formData[key].length === 0))) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
        resetForm();
        setCurrentPage('list');
      }
    } else {
      resetForm();
      setCurrentPage('list');
    }
  };

  // Página de Lista de Produtos
  if (currentPage === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-2">
        <div className="w-full">
          {/* Header Principal */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-4 md:p-5 mb-4">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
            
            <div className="relative">
              {/* Título e Botão */}
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
                
                <button
                  onClick={goToNewProduct}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Produto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 transform hover:-translate-y-1">
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

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 transform hover:-translate-y-1">
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

            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 transform hover:-translate-y-1">
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
                    {filteredProducts.map((product, index) => (
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

          {/* Mensagem quando não há produtos ou busca sem resultados */}
          {(products.length === 0 || (products.length > 0 && filteredProducts.length === 0)) && (
            <div className="bg-white rounded-xl shadow-xl p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {products.length === 0 ? 'Bem-vindo ao sistema!' : 'Nenhum produto encontrado'}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {products.length === 0 
                    ? 'Você ainda não cadastrou nenhum produto. Comece agora mesmo adicionando seus primeiros equipamentos hospitalares.'
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
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                    >
                      Limpar busca
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
      </div>
    );
  }

  // NOVA PÁGINA DE FORMULÁRIO COMPLETAMENTE REDESENHADA
  if (currentPage === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-4">
        <div className="w-full">
          
          {/* Header Premium com gradiente e glassmorphism */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-2xl mb-6">
            {/* Efeitos visuais de fundo */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white bg-opacity-5 rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white bg-opacity-5 rounded-full transform rotate-45"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={goBackToList}
                    className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="text-white">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                        {editingProduct ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                      </div>
                      <h1 className="text-3xl font-bold">
                        {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                      </h1>
                    </div>
                    <p className="text-emerald-100 text-lg">
                      {editingProduct 
                        ? 'Modifique as informações do produto existente' 
                        : 'Cadastre um novo produto no sistema hospitalar'
                      }
                    </p>
                  </div>
                </div>

                {/* Botões de Ação na Navbar */}
                <div className="flex space-x-4">
                  <button
                    onClick={goBackToList}
                    className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`bg-white text-emerald-600 hover:bg-emerald-50 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
 
          {/* Progress Bar Visual */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Progresso do Cadastro</h3>
                <span className="text-sm text-gray-600">
                  {Object.values(formData).filter(value => 
                    value && value !== '' && !(Array.isArray(value) && value.length === 0)
                  ).length}/6 campos preenchidos
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(Object.values(formData).filter(value => 
                      value && value !== '' && !(Array.isArray(value) && value.length === 0)
                    ).length / 6) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
 
          {/* Layout Principal - Grid Responsivo */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Card de Informações Principais */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-bold">Informações do Produto</h3>
                      <p className="text-blue-100">Dados básicos e identificação</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Grid de Campos Principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Campo Código */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                        <span>Código do Produto</span>
                        <span className="text-red-500">*</span>
                        {formData.codigo && !formErrors.codigo && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </label>
                      <input
                        type="text"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                          formErrors.codigo 
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100 error-input' 
                            : formData.codigo
                            ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                            : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                        placeholder="Ex: HP001, EQ-2024-001"
                      />
                      {formErrors.codigo && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.codigo}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">Identificação única do produto no sistema</p>
                    </div>
 
                    {/* Campo Marca */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                        <span>Marca/Fabricante</span>
                        <span className="text-red-500">*</span>
                        {formData.marca && !formErrors.marca && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </label>
                      <select
                        name="marca"
                        value={formData.marca}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                          formErrors.marca 
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100 error-input' 
                            : formData.marca
                            ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                            : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                      >
                        <option value="">🏭 Selecione a marca/fabricante</option>
                        <option value="B-Braun">B-Braun</option>
                        <option value="Cremer">Cremer</option>
                        <option value="Mucambo">Mucambo</option>
                        <option value="Nipro">Nipro</option>
                        <option value="Bio Higienic">Bio Higienic</option>
                      </select>
                      {formErrors.marca && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.marca}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">Selecione o fabricante do equipamento</p>
                    </div>
                  </div>
 
                  {/* Campo Nome do Produto */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                      <span>Nome do Produto</span>
                      <span className="text-red-500">*</span>
                      {formData.nome && !formErrors.nome && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                        formErrors.nome 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100 error-input' 
                          : formData.nome
                          ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                          : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                      placeholder="Ex: Monitor Cardíaco Digital, Ventilador Pulmonar"
                    />
                    {formErrors.nome && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.nome}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Nome completo e descritivo do produto</p>
                  </div>
 
                  {/* Campo Setor */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                      <span>Setor de Utilização</span>
                      <span className="text-red-500">*</span>
                      {formData.setor && !formErrors.setor && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </label>
                    <select
                      name="setor"
                      value={formData.setor}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                        formErrors.setor 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100 error-input' 
                          : formData.setor
                          ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                          : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                      }`}
                    >
                      <option value="">🏥 Selecione o setor de utilização</option>
                      <option value="CAMB">🧬 CAMB - Centro de Análises Médicas</option>
                      <option value="BMAC">🩸 BMAC - Banco de Medula Óssea</option>
                      <option value="DOCA">📋 DOCA - Documentação e Arquivo</option>
                      <option value="10° Andar">🏢 10° Andar - Internação</option>
                      <option value="13° Andar">🏢 13° Andar - Internação</option>
                      <option value="UTI">🚨 UTI - Unidade de Terapia Intensiva</option>
                      <option value="Centro Cirúrgico">⚕️ Centro Cirúrgico</option>
                      <option value="Emergência">🚑 Emergência</option>
                    </select>
                    {formErrors.setor && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.setor}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Local onde o equipamento será utilizado</p>
                  </div>
 
                  {/* Campo Descrição */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                      <span>Descrição Detalhada</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <textarea
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 resize-none bg-white"
                      placeholder="Descreva as características, funcionalidades, especificações técnicas e qualquer informação relevante sobre o produto..."
                      rows="5"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Informações detalhadas sobre o produto (opcional)</p>
                      <span className="text-xs text-gray-400">{formData.descricao.length}/500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
 
            {/* SEÇÃO 2: GALERIA DE IMAGENS */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-fit">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <Camera className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-bold">Galeria de Imagens</h3>
                        <p className="text-purple-100">Adicione fotos do produto</p>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-sm">{formData.fotos.length}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  
                  {/* Lista de Imagens */}
                  {formData.fotos.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {formData.fotos.map((foto, index) => (
                        <div key={foto.id} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start space-x-4">
                            
                            {/* Miniatura */}
                            <div className="flex-shrink-0 relative group">
                              {foto.url ? (
                                <div className="relative">
                                  <img
                                    src={foto.url}
                                    alt={`Imagem ${index + 1}`}
                                    className="w-20 h-20 object-contain rounded-lg border-3 border-white shadow-lg bg-gray-50"
                                  />
                                  <button
                                    onClick={() => document.getElementById(`file-${foto.id}`).click()}
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center transition-all duration-300"
                                  >
                                    <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </button>
                                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                                    {index + 1}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => document.getElementById(`file-${foto.id}`).click()}
                                  className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center transition-all duration-300 group"
                                >
                                  <Upload className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                              <input
                                id={`file-${foto.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, foto.id)}
                                className="hidden"
                              />
                            </div>
 
                            {/* Campos da Imagem */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700">
                                  Imagem {index + 1}
                                </span>
                                <button
                                  onClick={() => removeFoto(foto.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-lg transition-all duration-200"
                                  title="Remover imagem"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
 
                              <textarea
                                value={foto.descricao}
                                onChange={(e) => updateImageField(foto.id, 'descricao', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                placeholder="Descrição da imagem..."
                                rows="2"
                              />
 
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <input
                                    type="text"
                                    value={foto.peso}
                                    onChange={(e) => updateImageField(foto.id, 'peso', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Peso (kg)"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    value={foto.quantidade}
                                    onChange={(e) => updateImageField(foto.id, 'quantidade', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Qtd"
                                    min="1"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <input
                                  type="text"
                                  value={foto.dimensoes}
                                  onChange={(e) => updateImageField(foto.id, 'dimensoes', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Dimensões (ex: 30x20x15 cm)"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
 
                  {/* Botão Adicionar Imagem */}
                  {formData.fotos.length < 5 ? (
                    <button
                      type="button"
                      onClick={addEmptyImage}
                      className="w-full border-2 border-dashed border-purple-300 hover:border-purple-400 rounded-xl p-6 text-center hover:bg-purple-50 transition-all duration-300 group"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="bg-purple-100 group-hover:bg-purple-200 p-4 rounded-full transition-colors">
                          <Plus className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-purple-700">
                            Adicionar Imagem
                          </span>
                          <p className="text-sm text-purple-600 mt-1">
                            Clique para adicionar uma nova foto
                          </p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-orange-700 font-medium">Limite máximo de 5 imagens atingido</p>
                      <p className="text-orange-600 text-sm">Remova uma imagem para adicionar outra</p>
                    </div>
                  )}
 
                  {/* Estado vazio */}
                  {formData.fotos.length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-600 mb-2">Nenhuma imagem adicionada</h4>
                      <p className="text-gray-500 text-sm mb-4">Adicione fotos para melhor visualização do produto</p>
                      <button
                        type="button"
                        onClick={addEmptyImage}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                      >
                        Adicionar primeira imagem
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  // Página de Visualização do Produto
  if (currentPage === 'view' && viewingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2">
        <div className="w-full">
          {/* Header */}
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
            {/* Image Gallery */}
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
                    
                    {/* Descrição da foto atual */}
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
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
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
 
                  {/* Detalhes da Imagem Atual */}
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
 
            {/* Product Details */}
            <div className="space-y-4">
              {/* Informações do Produto */}
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
               </div>
             </div>

             {/* Lista de Descrições das Fotos */}
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
     </div>
   );
 }

 return null;
};

export default HospitalProductsSystem;