
import { useState } from 'react';

import { CellarWine } from '../../../services/supabase';

interface WineDetailModalProps {
  wine: CellarWine;
  onClose: () => void;
  onUpdate?: (updates: Partial<CellarWine>) => void;
  onDelete?: () => void;
  onConsumeBottle?: () => void;
  onAddBottle?: () => void;
}

export default function WineDetailModal({ wine, onClose, onConsumeBottle, onAddBottle }: WineDetailModalProps) {
  const [quantity, setQuantity] = useState(wine.quantity || 0);
  const [showEditLocation, setShowEditLocation] = useState(false);

  const handleConsume = () => {
    if (quantity > 0) {
      onConsumeBottle?.();
      setQuantity(q => q - 1);
      alert('🍷 Garrafa consumida! Aproveite!');
    }
  };

  const handleAddBottle = () => {
    onAddBottle?.();
    setQuantity(q => q + 1);
    alert('✅ Garrafa adicionada ao estoque!');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <i className="ri-wine-glass-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Detalhes do Vinho</h2>
                    <p className="text-sm text-white/80">Informações completas</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Wine Image */}
                <div className="w-full md:w-80 flex-shrink-0">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                    <img
                      src={wine.image_url || `https://readdy.ai/api/search-image?query=${wine.name}&width=320&height=427&seq=wine-detail-${wine.id}&orientation=portrait`}
                      alt={wine.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Estoque Atual</span>
                        <span className="text-3xl font-bold text-purple-600">{quantity}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConsume}
                          disabled={quantity === 0}
                          className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                        >
                          <i className="ri-wine-glass-line mr-2"></i>
                          Consumir
                        </button>
                        <button
                          onClick={handleAddBottle}
                          className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all whitespace-nowrap"
                        >
                          <i className="ri-add-line mr-2"></i>
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowEditLocation(!showEditLocation)}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-2"></i>
                      Editar Localização
                    </button>

                    {showEditLocation && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Seção</label>
                          <input
                            type="text"
                            defaultValue={wine.section}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Prateleira</label>
                          <input
                            type="text"
                            defaultValue={wine.shelf}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Posição</label>
                          <input
                            type="text"
                            defaultValue={wine.position}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <button className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all whitespace-nowrap">
                          Salvar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wine Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{wine.name}</h2>
                    <p className="text-lg text-gray-600 mb-3">{wine.producer}</p>

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                        {wine.type}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">
                        Safra {wine.vintage}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`${i < wine.rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'
                              }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1">Região</p>
                      <p className="font-bold text-gray-900">{wine.region}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1">País</p>
                      <p className="font-bold text-gray-900">{wine.country}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1">Preço</p>
                      <p className="font-bold text-gray-900">{wine.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-1">Data de Compra</p>
                      <p className="font-bold text-gray-900">
                        {wine.created_at ? new Date(wine.created_at).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <i className="ri-archive-line text-purple-600"></i>
                      Localização na Adega
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Seção</p>
                        <p className="text-2xl font-bold text-purple-600">{wine.section}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Prateleira</p>
                        <p className="text-2xl font-bold text-purple-600">{wine.shelf}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Posição</p>
                        <p className="text-2xl font-bold text-purple-600">{wine.position}</p>
                      </div>
                    </div>
                  </div>

                  {wine.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <i className="ri-file-text-line text-gray-600"></i>
                        Minhas Notas
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{wine.notes}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-lightbulb-line text-yellow-600"></i>
                      Dicas de Degustação
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <i className="ri-temp-cold-line text-blue-600 mt-0.5"></i>
                        <div>
                          <span className="font-semibold">Temperatura:</span> 16-18°C
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-time-line text-purple-600 mt-0.5"></i>
                        <div>
                          <span className="font-semibold">Decantação:</span> 1-2 horas recomendado
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <i className="ri-restaurant-line text-orange-600 mt-0.5"></i>
                        <div>
                          <span className="font-semibold">Harmonização:</span> Carnes vermelhas, queijos maturados
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
                      <i className="ri-share-line mr-2"></i>
                      Compartilhar
                    </button>
                    <button className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all whitespace-nowrap">
                      <i className="ri-delete-bin-line mr-2"></i>
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
