import { useState, useEffect } from 'react';
import WineDetailModal from './WineDetailModal';
import { cellarService, CellarWine } from '../../../services/supabase';

interface MyWinesTabProps {
  searchQuery: string;
  onAddWine: () => void;
}

export default function MyWinesTab({ searchQuery, onAddWine }: MyWinesTabProps) {
  const [selectedWine, setSelectedWine] = useState<CellarWine | null>(null);
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      setLoading(true);
      const data = await cellarService.getAll();
      setWines(data);
    } catch (error) {
      console.error('Erro ao carregar vinhos:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleAddWine = async (wine: CellarWine) => {
  //   try {
  //     await cellarService.create(wine);
  //     await loadWines();
  //   } catch (error) {
  //     console.error('Erro ao adicionar vinho:', error);
  //     alert('Erro ao adicionar vinho. Por favor, tente novamente.');
  //   }
  // };

  const handleUpdateWine = async (id: string, updates: Partial<CellarWine>) => {
    try {
      await cellarService.update(id, updates);
      await loadWines();
    } catch (error) {
      console.error('Erro ao atualizar vinho:', error);
      alert('Erro ao atualizar vinho. Por favor, tente novamente.');
    }
  };

  const handleDeleteWine = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vinho da sua adega?')) return;

    try {
      await cellarService.delete(id);
      await loadWines();
      setSelectedWine(null);
    } catch (error) {
      console.error('Erro ao deletar vinho:', error);
      alert('Erro ao deletar vinho. Por favor, tente novamente.');
    }
  };

  const handleConsumeBottle = async (wine: CellarWine) => {
    if (!wine.id || !wine.quantity || wine.quantity <= 0) return;

    try {
      await cellarService.updateQuantity(wine.id, wine.quantity - 1);
      await loadWines();
    } catch (error) {
      console.error('Erro ao consumir garrafa:', error);
      alert('Erro ao consumir garrafa. Por favor, tente novamente.');
    }
  };

  const handleAddBottle = async (wine: CellarWine) => {
    if (!wine.id) return;

    try {
      await cellarService.updateQuantity(wine.id, (wine.quantity || 0) + 1);
      await loadWines();
    } catch (error) {
      console.error('Erro ao adicionar garrafa:', error);
      alert('Erro ao adicionar garrafa. Por favor, tente novamente.');
    }
  };

  const filteredWines = wines.filter(wine => {
    const matchesSearch = !searchQuery ||
      wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.producer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.region?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' || wine.type === filter;

    return matchesSearch && matchesFilter;
  });

  const sortedWines = [...filteredWines].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'vintage':
        return (b.vintage || 0) - (a.vintage || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="ri-wine-glass-fill text-3xl text-white"></i>
          </div>
          <p className="text-gray-600 font-medium">Carregando sua adega...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-door-open-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{wines.length}</p>
              <p className="text-xs text-gray-600">Vinhos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-stack-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{wines.reduce((sum, w) => sum + (w.quantity || 0), 0)}</p>
              <p className="text-xs text-gray-600">Garrafas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-money-dollar-circle-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {wines.reduce((sum, w) => sum + ((w.price || 0) * (w.quantity || 0)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-600">Valor Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-star-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {wines.length > 0 ? (wines.reduce((sum, w) => sum + (w.rating || 0), 0) / wines.length).toFixed(1) : '0.0'}
              </p>
              <p className="text-xs text-gray-600">Média</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="all">Todos os tipos</option>
              <option value="red">🍷 Tinto</option>
              <option value="white">🥂 Branco</option>
              <option value="rose">🌸 Rosé</option>
              <option value="sparkling">🍾 Espumante</option>
              <option value="fortified">🛡️ Fortificado</option>
              <option value="dessert">🍰 Sobremesa</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="recent">Mais Recentes</option>
              <option value="name">Nome A-Z</option>
              <option value="vintage">Safra</option>
              <option value="rating">Avaliação</option>
              <option value="price">Preço</option>
            </select>

            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <i className="ri-grid-fill"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <i className="ri-list-check"></i>
              </button>
            </div>
          </div>

          <button
            onClick={onAddWine}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Adicionar Vinho
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sortedWines.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-wine-bottle-line text-5xl text-red-600"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? 'Nenhum vinho encontrado' : filter === 'all' ? 'Sua adega está vazia' : 'Nenhum vinho deste tipo'}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchQuery
              ? 'Tente ajustar sua busca ou adicione novos vinhos'
              : filter === 'all'
                ? 'Comece sua coleção adicionando seus vinhos favoritos'
                : 'Adicione vinhos deste tipo à sua coleção'}
          </p>
          <button
            onClick={onAddWine}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap inline-flex items-center gap-2"
          >
            <i className="ri-add-line text-xl"></i>
            Adicionar Primeiro Vinho
          </button>
        </div>
      )}

      {/* Wine Grid/List */}
      {sortedWines.length > 0 && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          : 'space-y-3'
        }>
          {sortedWines.map((wine) => (
            <div
              key={wine.id}
              onClick={() => setSelectedWine(wine)}
              className={`bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-red-300 transition-all cursor-pointer group ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'overflow-hidden'
                }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                    <img
                      src={wine.image_url || 'https://readdy.ai/api/search-image?query=elegant%20wine%20bottle%20on%20white%20background%20minimalist%20product%20photography%20studio%20lighting%20premium&width=300&height=400&seq=wine-default&orientation=portrait'}
                      alt={wine.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                    />
                    {wine.quantity && wine.quantity > 0 ? (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                        {wine.quantity}x
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                        Vazio
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                      <i className="ri-star-fill text-amber-400 text-xs"></i>
                      <span className="text-xs font-bold text-gray-900">{wine.rating || 0}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-red-600 transition-colors">{wine.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-3">{wine.producer}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${wine.type === 'red' ? 'bg-red-100 text-red-700' :
                        wine.type === 'white' ? 'bg-amber-100 text-amber-700' :
                          wine.type === 'rose' ? 'bg-pink-100 text-pink-700' :
                            wine.type === 'sparkling' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                        }`}>
                        {wine.type === 'red' ? 'Tinto' :
                          wine.type === 'white' ? 'Branco' :
                            wine.type === 'rose' ? 'Rosé' :
                              wine.type === 'sparkling' ? 'Espumante' :
                                wine.type === 'fortified' ? 'Fortificado' :
                                  wine.type === 'dessert' ? 'Sobremesa' :
                                    wine.type}
                      </span>
                      {wine.vintage && (
                        <span className="text-sm font-semibold text-gray-900">{wine.vintage}</span>
                      )}
                    </div>

                    {wine.region && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                        <i className="ri-map-pin-line text-red-500"></i>
                        <span className="line-clamp-1">{wine.region}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConsumeBottle(wine);
                        }}
                        disabled={!wine.quantity || wine.quantity <= 0}
                        className="flex-1 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        <i className="ri-wine-glass-line"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBottle(wine);
                        }}
                        className="flex-1 py-2 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-600 rounded-lg transition-colors font-medium text-sm"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-28 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative">
                    <img
                      src={wine.image_url || 'https://readdy.ai/api/search-image?query=elegant%20wine%20bottle%20on%20white%20background%20minimalist%20product%20photography%20studio%20lighting%20premium&width=160&height=224&seq=wine-list-default&orientation=portrait'}
                      alt={wine.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">{wine.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{wine.producer}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${wine.type === 'red' ? 'bg-red-100 text-red-700' :
                        wine.type === 'white' ? 'bg-amber-100 text-amber-700' :
                          wine.type === 'rose' ? 'bg-pink-100 text-pink-700' :
                            wine.type === 'sparkling' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                        }`}>
                        {wine.type === 'red' ? 'Tinto' :
                          wine.type === 'white' ? 'Branco' :
                            wine.type === 'rose' ? 'Rosé' :
                              wine.type === 'sparkling' ? 'Espumante' :
                                wine.type === 'fortified' ? 'Fortificado' :
                                  wine.type === 'dessert' ? 'Sobremesa' :
                                    wine.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {wine.vintage && (
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line text-red-500"></i>
                          {wine.vintage}
                        </span>
                      )}
                      {wine.region && (
                        <span className="flex items-center gap-1 line-clamp-1">
                          <i className="ri-map-pin-line text-red-500"></i>
                          {wine.region}
                        </span>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        <i className="ri-star-fill text-amber-400 text-sm"></i>
                        <span className="font-semibold text-gray-900">{wine.rating || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConsumeBottle(wine);
                          }}
                          disabled={!wine.quantity || wine.quantity <= 0}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <i className="ri-subtract-line"></i>
                        </button>
                        <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                          {wine.quantity || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddBottle(wine);
                          }}
                          className="text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wine Detail Modal */}
      {selectedWine && (
        <WineDetailModal
          wine={selectedWine}
          onClose={() => setSelectedWine(null)}
          onUpdate={(updates) => selectedWine.id && handleUpdateWine(selectedWine.id, updates)}
          onDelete={() => selectedWine.id && handleDeleteWine(selectedWine.id)}
          onConsumeBottle={() => handleConsumeBottle(selectedWine)}
          onAddBottle={() => handleAddBottle(selectedWine)}
        />
      )}
    </div>
  );
}
