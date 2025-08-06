import React, { useState, useEffect } from 'react';
import { Plus, Package, Edit3, Camera, ArrowLeft, Save, X, Upload, ImageIcon, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const ProductForm = ({ 
  editingProduct, 
  products, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    marca: '',
    setor: '',
    descricao: '',
    fotos: []
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        codigo: editingProduct.codigo,
        nome: editingProduct.nome,
        marca: editingProduct.marca,
        setor: editingProduct.setor || '',
        descricao: editingProduct.descricao || '',
        fotos: editingProduct.fotos || []
      });
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.codigo.trim()) {
      errors.codigo = 'Código é obrigatório';
    }
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.marca.trim()) {
      errors.marca = 'Marca é obrigatória';
    }
    
    if (!formData.setor.trim()) {
      errors.setor = 'Setor é obrigatório';
    }

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
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo permitido: 5MB');
        return;
      }

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
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.error-input');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const productData = {
      ...formData,
      id: editingProduct ? editingProduct.id : Date.now()
    };

    onSave(productData);
    resetForm();
  };

  const handleCancel = () => {
    if (Object.keys(formData).some(key => formData[key] && formData[key] !== '' && !(Array.isArray(formData[key]) && formData[key].length === 0))) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
        resetForm();
        onCancel();
      }
    } else {
      resetForm();
      onCancel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Principal com largura total */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-4 md:p-5 mb-4 mx-4 mt-2">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-3 lg:mb-0">
              <button
                onClick={handleCancel}
                className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-opacity-30 transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  {editingProduct ? 'Atualize as informações do produto existente' : 'Cadastre um novo item no sistema hospitalar'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal Centralizado */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Informações do Produto - 2 colunas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3.5 border-b">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Informações do Produto</h3>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Linha 1 - Código e Marca */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-1 text-sm font-semibold text-gray-700 mb-1.5">
                      <span>Código</span>
                      <span className="text-red-500">*</span>
                      {formData.codigo && !formErrors.codigo && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all ${
                        formErrors.codigo 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 error-input' 
                          : formData.codigo
                          ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      } focus:outline-none`}
                      placeholder="Ex: HP001"
                    />
                    {formErrors.codigo && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {formErrors.codigo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-1 text-sm font-semibold text-gray-700 mb-1.5">
                      <span>Marca</span>
                      <span className="text-red-500">*</span>
                      {formData.marca && !formErrors.marca && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </label>
                    <select
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all ${
                        formErrors.marca 
                          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 error-input' 
                          : formData.marca
                          ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      } focus:outline-none`}
                    >
                      <option value="">Selecione...</option>
                      <option value="B-Braun">B-Braun</option>
                      <option value="Cremer">Cremer</option>
                      <option value="Mucambo">Mucambo</option>
                      <option value="Nipro">Nipro</option>
                      <option value="Bio Higienic">Bio Higienic</option>
                    </select>
                    {formErrors.marca && (
                      <p className="text-xs text-red-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {formErrors.marca}
                      </p>
                    )}
                  </div>
                </div>

                {/* Linha 2 - Nome completo */}
                <div>
                  <label className="flex items-center space-x-1 text-sm font-semibold text-gray-700 mb-1.5">
                    <span>Nome do Produto</span>
                    <span className="text-red-500">*</span>
                    {formData.nome && !formErrors.nome && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all ${
                      formErrors.nome 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 error-input' 
                        : formData.nome
                        ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    } focus:outline-none`}
                    placeholder="Ex: Monitor Cardíaco Digital"
                  />
                  {formErrors.nome && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {formErrors.nome}
                    </p>
                  )}
                </div>

                {/* Linha 3 - Setor */}
                <div>
                  <label className="flex items-center space-x-1 text-sm font-semibold text-gray-700 mb-1.5">
                    <span>Setor</span>
                    <span className="text-red-500">*</span>
                    {formData.setor && !formErrors.setor && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </label>
                  <select
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all ${
                      formErrors.setor 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100 error-input' 
                        : formData.setor
                        ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    } focus:outline-none`}
                  >
                    <option value="">Selecione o setor...</option>
                    <option value="CAMB">CAMB - Centro de Análises</option>
                    <option value="BMAC">BMAC - Banco de Medula</option>
                    <option value="DOCA">DOCA - Documentação</option>
                    <option value="10° Andar">10° Andar - Internação</option>
                    <option value="13° Andar">13° Andar - Internação</option>
                    <option value="UTI">UTI - Terapia Intensiva</option>
                    <option value="Centro Cirúrgico">Centro Cirúrgico</option>
                    <option value="Emergência">Emergência</option>
                  </select>
                  {formErrors.setor && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {formErrors.setor}
                    </p>
                  )}
                </div>

                {/* Linha 4 - Descrição */}
                <div>
                  <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1.5">
                    <span>Descrição (opcional)</span>
                    <span className="text-gray-400 font-normal text-xs">{formData.descricao.length}/300</span>
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none"
                    placeholder="Características e especificações técnicas..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Galeria de Imagens - 1 coluna */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-fit">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">Imagens</h3>
                  </div>
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs text-white font-semibold">
                    {formData.fotos.length}/5
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {/* Lista Compacta de Imagens */}
                {formData.fotos.length > 0 && (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {formData.fotos.map((foto, index) => (
                      <div key={foto.id} className="bg-gray-50 rounded-lg p-2.5 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start space-x-2.5">
                          {/* Miniatura */}
                          <div className="flex-shrink-0 relative">
                            {foto.url ? (
                              <div className="relative">
                                <img
                                  src={foto.url}
                                  alt={`Img ${index + 1}`}
                                  className="w-14 h-14 object-cover rounded-lg border-2 border-white shadow"
                                />
                                <button
                                  onClick={() => document.getElementById(`file-${foto.id}`).click()}
                                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-opacity"
                                >
                                  <Camera className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => document.getElementById(`file-${foto.id}`).click()}
                                className="w-14 h-14 bg-purple-100 hover:bg-purple-200 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Upload className="w-5 h-5 text-purple-500" />
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

                          {/* Campos Compactos */}
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-700">
                                Imagem {index + 1}
                              </span>
                              <button
                                onClick={() => removeFoto(foto.id)}
                                className="text-red-500 hover:text-red-700 p-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <input
                              value={foto.descricao}
                              onChange={(e) => updateImageField(foto.id, 'descricao', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Descrição da imagem..."
                            />

                            <div className="grid grid-cols-3 gap-1">
                              <input
                                type="text"
                                value={foto.peso}
                                onChange={(e) => updateImageField(foto.id, 'peso', e.target.value)}
                                className="px-1.5 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-purple-500"
                                placeholder="Peso"
                              />
                              <input
                                type="number"
                                value={foto.quantidade}
                                onChange={(e) => updateImageField(foto.id, 'quantidade', e.target.value)}
                                className="px-1.5 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-purple-500"
                                placeholder="Qtd"
                                min="1"
                              />
                              <input
                                type="text"
                                value={foto.dimensoes}
                                onChange={(e) => updateImageField(foto.id, 'dimensoes', e.target.value)}
                                className="px-1.5 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-purple-500"
                                placeholder="Dimensões"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão Adicionar ou Estado Vazio */}
                {formData.fotos.length < 5 ? (
                  <button
                    type="button"
                    onClick={addEmptyImage}
                    className="w-full border-2 border-dashed border-purple-300 hover:border-purple-400 rounded-lg p-3.5 text-center hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        Adicionar Imagem
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="text-center p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">Limite de 5 imagens atingido</p>
                  </div>
                )}

                {/* Estado vazio */}
                {formData.fotos.length === 0 && (
                  <div className="text-center py-6">
                    <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Nenhuma imagem adicionada</p>
                    <p className="text-xs text-gray-400">Adicione fotos do produto</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;