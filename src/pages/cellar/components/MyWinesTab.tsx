import { useState, useEffect } from 'react';
import { cellarService, CellarWine } from '../../../services/supabase';
import WineDetailModal from './WineDetailModal';
import WineCard from './WineCard';
import RatingBottomSheet from './RatingBottomSheet';

interface MyWinesTabProps {
  searchQuery: string;
  onAddWine: () => void;
}

export default function MyWinesTab({ searchQuery, onAddWine }: MyWinesTabProps) {
  const [selectedWine, setSelectedWine] = useState<CellarWine | null>(null);
  const [evaluatingWine, setEvaluatingWine] = useState<CellarWine | null>(null);
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [wishlistFilter, setWishlistFilter] = useState('all');
  const [wishlistSortBy, setWishlistSortBy] = useState('recent');

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

  const handleToggleStatus = async (e: React.MouseEvent, wine: CellarWine) => {
    e.stopPropagation();
    if (!wine.id) return;
    const newStatus = wine.status === 'wishlist' ? 'in_cellar' : 'wishlist';
    try {
      await cellarService.update(wine.id, { status: newStatus });
      await loadWines();
    } catch (error) {
      console.error('Erro ao alterar status do vinho:', error);
      alert('Erro ao alterar status. Por favor, tente novamente.');
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, wine: CellarWine) => {
    e.stopPropagation();
    if (!wine.id) return;
    try {
      await cellarService.update(wine.id, { is_favorite: !wine.is_favorite });
      await loadWines();
    } catch (error) {
      console.error('Erro ao favoritar vinho:', error);
      alert('Erro ao alterar favorito. Por favor, tente novamente.');
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

  const getFilteredAndSorted = (list: CellarWine[], currentFilter: string, currentSort: string) => {
    const filtered = list.filter(wine => {
      const matchesSearch = !searchQuery ||
        wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.producer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.region?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = currentFilter === 'all'
        ? true
        : currentFilter === 'favorites'
          ? !!wine.is_favorite
          : wine.type === currentFilter;

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (currentSort) {
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
  };

  const cellarFilteredAndSorted = getFilteredAndSorted(wines.filter(w => !w.status || w.status === 'in_cellar'), filter, sortBy);
  const wishlistFilteredAndSorted = getFilteredAndSorted(wines.filter(w => w.status === 'wishlist'), wishlistFilter, wishlistSortBy);

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

      {/* Main Collection */}
      <div>
        <div className="flex items-center justify-between mb-2 mt-4 px-2">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
              <i className="ri-arrow-left-line text-2xl font-light"></i>
            </button>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Minha adega <span className="text-gray-400 text-sm font-semibold">{wines.length}</span>
            </h3>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <i className="ri-search-line text-2xl font-light"></i>
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white/95 backdrop-blur-md rounded-none pb-2 pt-2 sticky top-[60px] z-20 mb-4 -mx-4 px-4 border-b border-gray-100">

          <div className="flex items-center justify-center gap-6 py-2">
            <button className="relative flex items-center gap-1.5 font-bold text-gray-900 text-[15px] border-b-2 border-transparent hover:border-gray-900 transition-all pb-1 cursor-pointer">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                <option value="recent">Mais Recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="vintage">Safra</option>
                <option value="rating">Avaliação</option>
                <option value="price">Preço</option>
              </select>
              <div className="relative pointer-events-none">
                <i className="ri-sort-desc text-xl font-medium"></i>
                <div className="absolute top-0 -right-1 w-2.5 h-2.5 bg-gray-800 rounded-full border-2 border-white"></div>
              </div>
              Classificar
            </button>
            <button className="relative flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 text-[15px] transition-colors pb-1 cursor-pointer">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                <option value="all">Todos</option>
                <option value="red">Tinto</option>
                <option value="white">Branco</option>
                <option value="rose">Rosé</option>
                <option value="sparkling">Espumante</option>
                <option value="fortified">Fortificado</option>
                <option value="dessert">Sobremesa</option>
              </select>
              <div className="relative pointer-events-none flex items-center gap-1.5">
                <i className="ri-filter-3-line text-xl"></i> Filtrar
              </div>
            </button>
          </div>

          {/* Chips Row */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide -mx-4 px-4 w-screen mt-2">
            <button onClick={() => setFilter('all')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${filter === 'all' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>Pronto para beber</button>
            <button onClick={() => setFilter('favorites')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'favorites' ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
              <i className={filter === 'favorites' ? 'ri-heart-3-fill' : 'ri-heart-3-line text-gray-400'}></i> Favoritos
            </button>
            <button onClick={() => setFilter('red')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'red' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
              <i className="ri-goblet-fill text-gray-400"></i> Tinto
            </button>
            <button onClick={() => setFilter('white')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'white' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
              <i className="ri-goblet-fill text-[#f3e5ab]"></i> Branco
            </button>
            <button onClick={() => setFilter('rose')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'rose' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
              <i className="ri-goblet-fill text-pink-300"></i> Rosé
            </button>
            <button onClick={() => setFilter('sparkling')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${filter === 'sparkling' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>Espumante</button>
            <button className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors border-gray-300 text-gray-700 bg-white hover:bg-gray-50`}>Sem preço</button>
          </div>
        </div>

        {/* Empty State */}
        {cellarFilteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 mx-2">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <i className="ri-goblet-line text-5xl text-purple-300"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Alista de vinhos está vazia</h3>
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

        {/* List: Cellar Wines */}
        {cellarFilteredAndSorted.length > 0 && (
          <div className="flex flex-col gap-4 pb-12 mt-2 px-2">
            {cellarFilteredAndSorted.map((wine) => {
              const isReadyToDrink = drinkSoonWines.some(w => w.id === wine.id);

              return (
                <WineCard
                  key={wine.id}
                  wine={wine}
                  isReadyToDrink={isReadyToDrink}
                  onClick={() => setSelectedWine(wine)}
                  onConsume={(e) => handleConsumeBottle(e, wine)}
                  onAdd={(e) => handleAddBottle(e, wine)}
                  onEvaluate={(e) => { e.stopPropagation(); setEvaluatingWine(wine); }}
                  onToggleStatus={(e) => handleToggleStatus(e, wine)}
                  onToggleFavorite={(e) => handleToggleFavorite(e, wine)}
                  onMoreOptions={(e) => { e.stopPropagation(); setSelectedWine(wine); }}
                />
              );
            })}
          </div>
        )}

        {/* Wishlist Section */}
        {/* Wishlist Section */}
        {wines.filter(w => w.status === 'wishlist').length > 0 && (
          <div className="pb-24 pt-4 mt-8 px-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-bookmark-3-fill text-purple-500"></i>
                Wishlist <span className="text-gray-400 text-sm font-semibold">{wishlistFilteredAndSorted.length}</span>
              </h3>
            </div>

            {/* Wishlist Filters & Actions */}
            <div className="bg-white/95 backdrop-blur-md rounded-none pb-2 pt-2 z-20 mb-4 -mx-6 px-6 border-b border-gray-100">
              {/* Chips Row */}
              <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide -mx-2 px-2 w-screen">
                <button onClick={() => setWishlistFilter('all')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${wishlistFilter === 'all' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>Todos</button>
                <button onClick={() => setWishlistFilter('red')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${wishlistFilter === 'red' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                  <i className="ri-goblet-fill text-gray-400"></i> Tinto
                </button>
                <button onClick={() => setWishlistFilter('white')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${wishlistFilter === 'white' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                  <i className="ri-goblet-fill text-[#f3e5ab]"></i> Branco
                </button>
                <button onClick={() => setWishlistFilter('rose')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${wishlistFilter === 'rose' ? 'border-gray-900 text-gray-900 bg-gray-100/50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                  <i className="ri-goblet-fill text-pink-300"></i> Rosé
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {wishlistFilteredAndSorted.map((wine) => (
                <WineCard
                  key={wine.id}
                  wine={{ ...wine, quantity: 0 }}
                  onClick={() => setSelectedWine(wine)}
                  onConsume={() => { }}
                  onAdd={(e) => handleAddBottle(e, wine)}
                  onEvaluate={(e) => { e.stopPropagation(); setEvaluatingWine(wine); }}
                  onToggleStatus={(e) => handleToggleStatus(e, wine)}
                  onMoreOptions={(e) => { e.stopPropagation(); setSelectedWine(wine); }}
                />
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

      {/* Rating Bottom Sheet */}
      {
        evaluatingWine && (
          <RatingBottomSheet
            wine={evaluatingWine}
            onClose={() => setEvaluatingWine(null)}
            onSubmit={(rating, review) => {
              // Real implementation would save to DB
              console.log('Evaluated:', rating, review);
              if (evaluatingWine.id) {
                handleUpdateWine(evaluatingWine.id, { rating: rating });
              }
              setEvaluatingWine(null);
            }}
          />
        )
      }
    </div >
  );
}
