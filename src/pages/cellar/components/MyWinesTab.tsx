import { useState, useEffect } from 'react';
import { cellarService, CellarWine } from '../../../services/supabase';
import WineDetailModal from './WineDetailModal';
import WineCard from './WineCard';

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
  const [drinkSoonViewMode, setDrinkSoonViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleConsumeBottle = async (e: React.MouseEvent, wine: CellarWine) => {
    e.stopPropagation();
    if (!wine.id || !wine.quantity || wine.quantity <= 0) return;

    try {
      await cellarService.updateQuantity(wine.id, wine.quantity - 1);
      await loadWines();
    } catch (error) {
      console.error('Erro ao consumar garrafa:', error);
      alert('Erro ao consumir garrafa. Por favor, tente novamente.');
    }
  };

  const handleAddBottle = async (e: React.MouseEvent, wine: CellarWine) => {
    e.stopPropagation();
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

  // Logic for "Wines to Drink Soon": Wines older than 3 years with good rating, or explicitly short aging potential
  // Logic for "Wines to Drink Soon": Simply the oldest vintages currently in stock
  const drinkSoonWines = wines
    .filter(w => (w.quantity || 0) > 0 && typeof w.vintage === 'number')
    .sort((a, b) => (a.vintage || 0) - (b.vintage || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="ri-wine-glass-fill text-3xl text-white"></i>
          </div>
          <p className="text-gray-600 font-medium">Carregando adega...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Wines */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-red-200 shadow-lg">
              <i className="ri-door-open-fill text-white text-lg lg:text-xl"></i>
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{wines.length}</p>
              <p className="text-[10px] lg:text-xs text-gray-500 font-medium uppercase tracking-wide">Rótulos</p>
            </div>
          </div>
        </div>

        {/* Total Bottles */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-amber-200 shadow-lg">
              <i className="ri-stack-fill text-white text-lg lg:text-xl"></i>
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{wines.reduce((sum, w) => sum + (w.quantity || 0), 0)}</p>
              <p className="text-[10px] lg:text-xs text-gray-500 font-medium uppercase tracking-wide">Garrafas</p>
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-emerald-200 shadow-lg">
              <i className="ri-money-dollar-circle-fill text-white text-lg lg:text-xl"></i>
            </div>
            <div className="min-w-0">
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {wines.reduce((sum, w) => sum + ((w.price || 0) * (w.quantity || 0)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] lg:text-xs text-gray-500 font-medium uppercase tracking-wide">Investido</p>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-purple-200 shadow-lg">
              <i className="ri-star-fill text-white text-lg lg:text-xl"></i>
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {wines.length > 0 ? (wines.reduce((sum, w) => sum + (w.rating || 0), 0) / wines.length).toFixed(1) : '0.0'}
              </p>
              <p className="text-[10px] lg:text-xs text-gray-500 font-medium uppercase tracking-wide">Média</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wines to Drink Soon Carousel */}
      {drinkSoonWines.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 border border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <i className="ri-time-line"></i>
                Prontos para Beber
              </h3>
              <p className="text-sm text-amber-700/80">Sugestões baseadas na safra e avaliação</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrinkSoonViewMode(drinkSoonViewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center justify-center w-8 h-8 bg-white/50 rounded-lg hover:bg-white text-amber-900/60 hover:text-amber-900 transition-colors"
                title={drinkSoonViewMode === 'grid' ? 'Visualizar em Lista' : 'Visualizar em Grade'}
              >
                <i className={drinkSoonViewMode === 'grid' ? 'ri-list-check' : 'ri-function-line'}></i>
              </button>
              <button className="text-sm font-bold text-amber-700 hover:text-amber-900 px-3 py-1 bg-white/50 rounded-lg transition-colors">
                Ver todos
              </button>
            </div>
          </div>

          <div className={`
            ${drinkSoonViewMode === 'grid'
              ? 'flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2'
              : 'space-y-1'
            }
          `}>
            {drinkSoonWines.map(wine => (
              drinkSoonViewMode === 'grid' ? (
                <div key={wine.id} className="min-w-[105px] w-[105px] bg-white rounded-xl p-2 shadow-sm border border-amber-100/50 cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedWine(wine)}>
                  <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-contain p-1"
                      alt={wine.name}
                    />
                    <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm px-1 py-0.5 rounded text-[8px] font-bold shadow-sm">
                      {wine.vintage}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 truncate text-[10px] mb-0.5">{wine.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 truncate max-w-[60px]">{wine.producer}</span>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500">
                      <i className="ri-star-fill"></i> {wine.rating}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={wine.id}
                  onClick={() => setSelectedWine(wine)}
                  className="bg-white rounded-lg p-2 shadow-sm border border-amber-100/50 flex items-center gap-2 cursor-pointer hover:bg-amber-50/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-contain p-0.5"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-xs">{wine.name}</h4>
                    <p className="text-[10px] text-gray-500 truncate">{wine.producer} • {wine.vintage}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    <i className="ri-star-fill"></i> {wine.rating}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )
      }

      {/* Main Collection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Sua Coleção</h3>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-purple-100 shadow-sm sticky top-[70px] z-20 mb-6">
          <div className="flex flex-row items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer min-w-[140px]"
              >
                <option value="all">Todas</option>
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
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer min-w-[140px]"
              >
                <option value="recent">Mais Recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="vintage">Safra</option>
                <option value="rating">Avaliação</option>
                <option value="price">Preço</option>
              </select>
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
            >
              <i className={viewMode === 'grid' ? 'ri-list-check' : 'ri-grid-fill'}></i>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {sortedWines.filter(w => !w.status || w.status === 'in_cellar').length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <i className="ri-goblet-line text-5xl text-purple-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sua adega está vazia</h3>
            <p className="text-gray-500 mb-8 max-w-xs text-center">
              Comece a construir sua coleção adicionando seus vinhos favoritos.
            </p>
            <button
              onClick={onAddWine}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all"
            >
              Adicionar Primeiro Vinho
            </button>
          </div>
        )}

        {/* Grid: Cellar Wines */}
        {sortedWines.filter(w => !w.status || w.status === 'in_cellar').length > 0 && (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 pb-12'
              : 'space-y-1 pb-12'
          }>
            {sortedWines.filter(w => !w.status || w.status === 'in_cellar').map((wine) => (
              viewMode === 'grid' ? (
                <WineCard
                  key={wine.id}
                  wine={wine}
                  compact={true}
                  onClick={() => setSelectedWine(wine)}
                  onConsume={(e) => handleConsumeBottle(e, wine)}
                  onAdd={(e) => handleAddBottle(e, wine)}
                />
              ) : (
                // Simple List Item Fallback (Enhanced)
                <div
                  key={wine.id}
                  onClick={() => setSelectedWine(wine)}
                  className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                    <img
                      src={wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-contain p-1"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-sm">{wine.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{wine.producer} • {wine.vintage}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleConsumeBottle(e, wine)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <i className="ri-subtract-line text-sm"></i>
                    </button>
                    <span className="font-bold w-5 text-center text-sm">{wine.quantity}</span>
                    <button
                      onClick={(e) => handleAddBottle(e, wine)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                    >
                      <i className="ri-add-line text-sm"></i>
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Wishlist Section */}
        {sortedWines.filter(w => w.status === 'wishlist').length > 0 && (
          <div className="pb-24 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-bookmark-3-fill text-purple-500"></i>
                Wishlist
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{sortedWines.filter(w => w.status === 'wishlist').length} vinhos</span>
            </div>

            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4'
                : 'space-y-1'
            }>
              {sortedWines.filter(w => w.status === 'wishlist').map((wine) => (
                <div
                  key={wine.id}
                  onClick={() => setSelectedWine(wine)}
                  className="relative group bg-white rounded-xl border-2 border-dashed border-purple-200 p-2 hover:border-purple-300 transition-all cursor-pointer"
                >
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Desejado</span>
                  </div>
                  <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-gray-50 opacity-80 group-hover:opacity-100 transition-opacity">
                    <img
                      src={wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"}
                      onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"}
                      className="w-full h-full object-contain p-1 grayscale group-hover:grayscale-0 transition-all duration-300"
                      alt={wine.name}
                    />
                  </div>
                  <h4 className="font-bold text-gray-900 truncate text-[10px] mb-0.5">{wine.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 truncate max-w-[60px]">{wine.producer}</span>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-purple-500">
                      <i className="ri-add-line"></i> Adicionar
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {
        selectedWine && (
          <WineDetailModal
            wine={selectedWine}
            onClose={() => setSelectedWine(null)}
            onUpdate={(updates) => selectedWine.id && handleUpdateWine(selectedWine.id, updates)}
            onDelete={() => selectedWine.id && handleDeleteWine(selectedWine.id)}
            onConsumeBottle={() => selectedWine && handleConsumeBottle({ stopPropagation: () => { } } as any, selectedWine)}
            onAddBottle={() => selectedWine && handleAddBottle({ stopPropagation: () => { } } as any, selectedWine)}
          />
        )
      }
    </div >
  );
}
