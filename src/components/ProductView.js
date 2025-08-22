import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Trash2, Package, ChevronLeft, ChevronRight, Download, ZoomIn, X, Lock, Camera, Shield, Users, Share2, Copy, Calendar } from 'lucide-react';

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
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Precarregar próximas imagens para navegação mais fluida
  useEffect(() => {
    if (viewingProduct?.fotos && viewingProduct.fotos.length > 1) {
      const preloadImages = () => {
        viewingProduct.fotos.forEach((foto, index) => {
          if (index !== currentImageIndex) {
            const img = new Image();
            img.src = foto.url;
          }
        });
      };
      preloadImages();
    }
  }, [currentImageIndex, viewingProduct]);

  // Navegação por teclado no zoom
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isZoomOpen && viewingProduct?.fotos && viewingProduct.fotos.length > 1) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevImage();
        } else if (e.key === 'Escape') {
          closeZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isZoomOpen, currentImageIndex]);

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
    try {
      setIsImageLoading(true);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName || 'produto-imagem.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Imagem baixada com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao baixar a imagem', 'error');
    } finally {
      setIsImageLoading(false);
    }
  };

  const downloadAllImages = () => {
    if (viewingProduct?.fotos) {
      try {
        viewingProduct.fotos.forEach((foto, index) => {
          setTimeout(() => {
            downloadImage(foto.url, `${viewingProduct.nome}-imagem-${index + 1}.jpg`);
          }, index * 300); // Delay entre downloads
        });
      } catch (error) {
        showNotification('Erro ao baixar as imagens', 'error');
      }
    }
  };

  const copyProductInfo = () => {
    const productInfo = `
Produto: ${viewingProduct.nome}
Código: ${viewingProduct.codigo}
Marca: ${viewingProduct.marca}
${viewingProduct.descricao ? `Descrição: ${viewingProduct.descricao}` : ''}
${viewingProduct.fotos ? `Imagens: ${viewingProduct.fotos.length}` : 'Sem imagens'}
    `.trim();

    navigator.clipboard.writeText(productInfo).then(() => {
      showNotification('Informações copiadas para a área de transferência!', 'success');
    }).catch(() => {
      showNotification('Erro ao copiar as informações', 'error');
    });
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: viewingProduct.nome,
          text: `Produto: ${viewingProduct.nome} (${viewingProduct.codigo}) - Marca: ${viewingProduct.marca}`,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          showNotification('Erro ao compartilhar', 'error');
        }
      }
    } else {
      copyProductInfo();
    }
  };

  const openZoom = () => {
    setIsZoomOpen(true);
    document.body.style.overflow = 'hidden'; // Previne scroll do body
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    document.body.style.overflow = 'unset'; // Restaura scroll do body
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
    
    // Confirmação melhorada
    const isConfirmed = window.confirm(
      `⚠️ ATENÇÃO!\n\nVocê está prestes a excluir permanentemente:\n\n` +
      `• Produto: ${viewingProduct.nome}\n` +
      `• Código: ${viewingProduct.codigo}\n` +
      `• ${viewingProduct.fotos?.length || 0} imagem(ns)\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Deseja realmente continuar?`
    );
    
    if (isConfirmed) {
      onDelete(viewingProduct.id);
    }
  };

  // Função para formatar data de forma mais amigável
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Ontem às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!viewingProduct) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-2">
      <div className="w-full">
        {/* Header Principal */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-xl p-4 md:p-5 mb-4">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
          
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-3 lg:mb-0">
                <button
                  onClick={onBack}
                  className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-opacity-30 transition-all hover:scale-105"
                  title="Voltar à lista"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">{viewingProduct.nome}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-blue-100 text-sm md:text-base">Código: {viewingProduct.codigo}</p>
                    <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-blue-100 text-sm font-medium">
                      {viewingProduct.marca}
                    </span>
                    {viewingProduct.fotos && viewingProduct.fotos.length > 0 && (
                      <span className="bg-green-500 bg-opacity-80 px-2 py-1 rounded-full text-white text-xs font-medium flex items-center space-x-1">
                        <Camera className="w-3 h-3" />
                        <span>{viewingProduct.fotos.length}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {/* Botão Compartilhar/Copiar */}
                <button
                  onClick={shareProduct}
                  className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm font-medium"
                  title="Compartilhar produto"
                >
                  {navigator.share ? <Share2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden md:inline">{navigator.share ? 'Compartilhar' : 'Copiar'}</span>
                </button>

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
                  className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold ${
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
                  className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold ${
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
                <div className="flex items-center space-x-3">
                  {viewingProduct.fotos && viewingProduct.fotos.length > 0 && (
                    <>
                      <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs text-white font-semibold">
                        {viewingProduct.fotos.length} imagem{viewingProduct.fotos.length !== 1 ? 's' : ''}
                      </span>
                      {viewingProduct.fotos.length > 1 && (
                        <button
                          onClick={downloadAllImages}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1.5 rounded-lg transition-all"
                          title="Baixar todas as imagens"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {viewingProduct.fotos && viewingProduct.fotos.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={viewingProduct.fotos[currentImageIndex].url}
                      alt={viewingProduct.nome}
                      className="w-full h-64 object-contain rounded-lg shadow-lg bg-gray-50 cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={openZoom}
                      loading="lazy"
                    />
                    
                    {/* Overlay com controles mais visível */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                        <ZoomIn className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                    
                    {viewingProduct.fotos[currentImageIndex].descricao && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-75 text-white p-2 rounded-lg backdrop-blur-sm">
                        <p className="text-sm">{viewingProduct.fotos[currentImageIndex].descricao}</p>
                      </div>
                    )}
                    
                    {viewingProduct.fotos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all shadow-lg backdrop-blur-sm"
                          title="Imagem anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all shadow-lg backdrop-blur-sm"
                          title="Próxima imagem"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {viewingProduct.fotos.length}
                    </div>
                    
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={openZoom}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-all shadow-lg hover:scale-110"
                        title="Ampliar imagem (Use ← → para navegar)"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadImage(
                          viewingProduct.fotos[currentImageIndex].url,
                          `${viewingProduct.nome}-imagem-${currentImageIndex + 1}.jpg`
                        )}
                        disabled={isImageLoading}
                        className={`bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-all shadow-lg hover:scale-110 ${
                          isImageLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Baixar imagem"
                      >
                        {isImageLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {viewingProduct.fotos.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {viewingProduct.fotos.map((foto, index) => (
                        <button
                          key={foto.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            index === currentImageIndex 
                              ? 'border-purple-500 shadow-lg ring-2 ring-purple-300' 
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                          title={`Imagem ${index + 1}${foto.descricao ? ': ' + foto.descricao : ''}`}
                        >
                          <img
                            src={foto.url}
                            alt={`${viewingProduct.nome} ${index + 1}`}
                            className="w-full h-full object-contain bg-gray-50"
                            loading="lazy"
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
              
              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Código</h4>
                    <p className="text-xl font-bold text-gray-900">{viewingProduct.codigo}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Marca</h4>
                    <p className="text-xl font-bold text-gray-900">{viewingProduct.marca}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Nome do Produto</h4>
                    <p className="text-lg font-semibold text-gray-900">{viewingProduct.nome}</p>
                  </div>

                  {viewingProduct.descricao && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Descrição</h4>
                      <p className="text-gray-700 leading-relaxed">{viewingProduct.descricao}</p>
                    </div>
                  )}

                  {(viewingProduct.createdAt || viewingProduct.updatedAt) && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Informações do Sistema
                      </h4>
                      <div className="space-y-2">
                        {viewingProduct.createdAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Cadastrado:</span>
                            <span className="font-medium text-gray-900" title={new Date(viewingProduct.createdAt).toLocaleString('pt-BR')}>
                              {formatDate(viewingProduct.createdAt)}
                            </span>
                          </div>
                        )}
                        {viewingProduct.updatedAt && viewingProduct.updatedAt !== viewingProduct.createdAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Atualizado:</span>
                            <span className="font-medium text-gray-900" title={new Date(viewingProduct.updatedAt).toLocaleString('pt-BR')}>
                              {formatDate(viewingProduct.updatedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
                        <li>• Compartilhar info</li>
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
          </div>
        </div>
      </div>

      {/* Zoom Modal - Melhorado */}
      {isZoomOpen && viewingProduct && viewingProduct.fotos && viewingProduct.fotos[currentImageIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full overflow-auto">
            {/* Controles superiores */}
            <div className="fixed top-4 left-4 right-4 z-20 flex justify-between items-start">
              <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium">
                  Imagem {currentImageIndex + 1} de {viewingProduct.fotos.length}
                </p>
                <p className="text-xs opacity-80">Use ← → ou clique nas setas para navegar • ESC para fechar</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadImage(
                    viewingProduct.fotos[currentImageIndex].url,
                    `${viewingProduct.nome}-imagem-${currentImageIndex + 1}.jpg`
                  )}
                  className="bg-white bg-opacity-90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                  title="Baixar imagem"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={closeZoom}
                  className="bg-white bg-opacity-90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                  title="Fechar zoom (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-full p-4 pt-20 pb-20">
              <img
                src={viewingProduct.fotos[currentImageIndex].url}
                alt={viewingProduct.nome}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg cursor-pointer"
                onClick={closeZoom}
                loading="eager"
              />
            </div>

            {/* Informações da imagem */}
            <div className="fixed bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white p-4 rounded-lg z-10 backdrop-blur-sm">
              <h4 className="font-semibold text-lg mb-1">{viewingProduct.nome}</h4>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span>Código: {viewingProduct.codigo}</span>
                <span>Marca: {viewingProduct.marca}</span>
                {viewingProduct.fotos[currentImageIndex].descricao && (
                  <span>• {viewingProduct.fotos[currentImageIndex].descricao}</span>
                )}
              </div>
              
              {/* Detalhes técnicos da imagem */}
              {(viewingProduct.fotos[currentImageIndex].peso || 
                viewingProduct.fotos[currentImageIndex].dimensoes || 
                viewingProduct.fotos[currentImageIndex].quantidade) && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs opacity-80">
                  {viewingProduct.fotos[currentImageIndex].peso && (
                    <span>Peso: {viewingProduct.fotos[currentImageIndex].peso}</span>
                  )}
                  {viewingProduct.fotos[currentImageIndex].dimensoes && (
                    <span>Dimensões: {viewingProduct.fotos[currentImageIndex].dimensoes}</span>
                  )}
                  {viewingProduct.fotos[currentImageIndex].quantidade && (
                    <span>Qtd: {viewingProduct.fotos[currentImageIndex].quantidade}</span>
                  )}
                </div>
              )}
            </div>

            {/* Navegação - Melhorada */}
            {viewingProduct.fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="fixed left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-white text-gray-800 p-4 rounded-full shadow-lg transition-all z-10 hover:scale-110"
                  title="Imagem anterior (←)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="fixed right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-white text-gray-800 p-4 rounded-full shadow-lg transition-all z-10 hover:scale-110"
                  title="Próxima imagem (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Indicadores de imagem */}
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                  {viewingProduct.fotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;