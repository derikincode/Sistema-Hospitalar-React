import React, { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Package, ChevronLeft, ChevronRight, Download, ZoomIn, X, Lock } from 'lucide-react';

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
      alert('Acesso negado! Apenas administradores podem editar produtos.');
      return;
    }
    onEdit(viewingProduct);
  };

  const handleDelete = () => {
    if (!isAdmin) {
      alert('Acesso negado! Apenas administradores podem excluir produtos.');
      return;
    }
    onDelete(viewingProduct.id);
  };

  if (!viewingProduct) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-2">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
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
              {/* Aviso de modo visualização para usuários não-admin */}
              {!isAdmin && (
                <div className="bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg flex items-center space-x-2 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Modo Visualização</span>
                </div>
              )}
              
              {/* Botões de ação - condicionais baseados no role */}
              {isAdmin ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-gray-300 text-gray-500 px-3 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed text-sm"
                    title="Editar (Requer permissão de administrador)"
                    disabled
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-gray-300 text-gray-500 px-3 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed text-sm"
                    title="Excluir (Requer permissão de administrador)"
                    disabled
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gallery */}
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

          {/* Product Info */}
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

            {/* Aviso de permissões para usuários não-admin */}
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                    <Lock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-amber-800 font-semibold text-sm mb-1">Acesso Limitado</h3>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      Você está visualizando este produto com permissões limitadas. Para editar ou excluir produtos, 
                      é necessário ter privilégios de administrador.
                    </p>
                    <div className="mt-2 text-xs text-amber-600">
                      <p>• ✅ Visualizar produtos e imagens</p>
                      <p>• ✅ Baixar imagens</p>
                      <p>• ❌ Editar informações</p>
                      <p>• ❌ Excluir produtos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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