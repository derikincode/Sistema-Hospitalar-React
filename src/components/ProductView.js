import React, { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Package, ChevronLeft, ChevronRight, Download, ZoomIn, X, Lock, Eye, Camera, Shield, Users } from 'lucide-react';

const ProductView = ({ 
  viewingProduct, 
  onEdit, 
  onDelete, 
  onBack,
  showNotification,
  isAdmin = false // Recebe se o usuário é admin
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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

  const handleEdit = () => {
    if (!isAdmin) {
      showNotification('Acesso negado! Apenas administradores podem editar produtos.', 'error');
      return;
    }
    onEdit(viewingProduct);
  };

  const handleDelete = () => {
    if (!isAdmin) {
      showNotification('Acesso negado! Apenas administradores podem excluir produtos.', 'error');
      return;
    }
    onDelete(viewingProduct.id);
  };

  if (!viewingProduct) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-2">
      <div className="w-full">
        {/* Header Principal - Igual ao ProductManager */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-4 md:p-5 mb-4">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
          
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-3 lg:mb-0">
                <button
                  onClick={onBack}
                  className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-opacity-30 transition-all"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">{viewingProduct.nome}</h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-blue-100 text-sm md:text-base">Código: {viewingProduct.codigo}</p>
                    <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-blue-100 text-sm font-medium">
                      {viewingProduct.marca}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Indicador de Permissão */}
                {!isAdmin ? (
                  <div className="bg-amber-500 bg-opacity-80 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium">
                    <Lock className="w-4 h-4" />
                    <span>Visualização</span>
                  </div>
                ) : (
                  <div className="bg-green-500 bg-opacity-80 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                )}
                
                {/* Botões de Ação */}
                <button
                  onClick={handleEdit}
                  disabled={!isAdmin}
                  className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold ${
                    isAdmin 
                      ? 'bg-white text-blue-600 hover:bg-blue-50' 
                      : 'bg-white bg-opacity-30 text-white cursor-not-allowed opacity-60'
                  }`}
                  title={!isAdmin ? 'Editar (Requer permissão de administrador)' : 'Editar produto'}
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Editar</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={!isAdmin}
                  className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold ${
                    isAdmin 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-white bg-opacity-30 text-white cursor-not-allowed opacity-60'
                  }`}
                  title={!isAdmin ? 'Excluir (Requer permissão de administrador)' : 'Excluir produto'}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gallery */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Galeria de Fotos</h3>
                </div>
                {viewingProduct.fotos && viewingProduct.fotos.length > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs text-white font-semibold">
                    {viewingProduct.fotos.length} imagem{viewingProduct.fotos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              {viewingProduct.fotos && viewingProduct.fotos.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={viewingProduct.fotos[currentImageIndex].url}
                      alt={viewingProduct.nome}
                      className="w-full h-64 object-contain rounded-lg shadow-lg bg-gray-50 cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={openZoom}
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
                            index === currentImageIndex 
                              ? 'border-purple-500 shadow-lg' 
                              : 'border-gray-300 hover:border-purple-300'
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
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Detalhes da Imagem {currentImageIndex + 1}</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs block">Peso:</span>
                          <p className="font-medium text-gray-800">{viewingProduct.fotos[currentImageIndex].peso || 'Não informado'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Dimensões:</span>
                          <p className="font-medium text-gray-800">{viewingProduct.fotos[currentImageIndex].dimensoes || 'Não informado'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Quantidade:</span>
                          <p className="font-medium text-gray-800">{viewingProduct.fotos[currentImageIndex].quantidade || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Nenhuma imagem disponível</p>
                    <p className="text-gray-400 text-sm">Este produto não possui fotos cadastradas</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3.5 border-b">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Informações do Produto</h3>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Código</h4>
                    <p className="text-lg font-bold text-blue-800">{viewingProduct.codigo}</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Marca</h4>
                    <p className="text-lg font-bold text-purple-800">{viewingProduct.marca}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Nome do Produto</h4>
                  <p className="text-base font-semibold text-green-800">{viewingProduct.nome}</p>
                </div>

                {viewingProduct.descricao && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Descrição</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">{viewingProduct.descricao}</p>
                  </div>
                )}

                {(viewingProduct.createdAt || viewingProduct.updatedAt) && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Informações do Sistema</h4>
                    <div className="space-y-1 text-sm">
                      {viewingProduct.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cadastrado em:</span>
                          <span className="font-medium text-indigo-800">
                            {new Date(viewingProduct.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {viewingProduct.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Última atualização:</span>
                          <span className="font-medium text-indigo-800">
                            {new Date(viewingProduct.updatedAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aviso de permissões para usuários não-admin */}
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-5 py-3 border-b border-amber-200">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-amber-800">Acesso Limitado</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-amber-700 text-sm leading-relaxed mb-3">
                    Você está visualizando este produto com permissões limitadas. Para editar ou excluir produtos, 
                    é necessário ter privilégios de administrador.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-2">
                      <p className="text-green-700 font-medium">✅ Permitido</p>
                      <ul className="text-green-600 mt-1 space-y-0.5">
                        <li>• Visualizar produtos</li>
                        <li>• Ver imagens</li>
                        <li>• Baixar fotos</li>
                      </ul>
                    </div>
                    <div className="bg-red-100 border border-red-200 rounded-lg p-2">
                      <p className="text-red-700 font-medium">❌ Restrito</p>
                      <ul className="text-red-600 mt-1 space-y-0.5">
                        <li>• Editar informações</li>
                        <li>• Excluir produtos</li>
                        <li>• Gerenciar sistema</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewingProduct.fotos && viewingProduct.fotos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3.5 border-b">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Descrições das Fotos</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewingProduct.fotos.map((foto, index) => (
                      <div 
                        key={foto.id} 
                        className={`flex items-start space-x-2 p-2 rounded-lg transition-colors cursor-pointer ${
                          index === currentImageIndex 
                            ? 'bg-purple-100 border border-purple-300' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                          index === currentImageIndex 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
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
};

export default ProductView;