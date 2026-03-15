import { useState, useEffect, useMemo, useCallback } from 'react';
import { cellarService, CellarWine } from '../../../services/supabase';
import WineDetailModal from './WineDetailModal';
import WineCard from './WineCard';
import RatingBottomSheet from './RatingBottomSheet';
import WineMatchBottomSheet from './WineMatchBottomSheet';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Inline Match State
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [matchMoment, setMatchMoment] = useState('');
  const [matchFood, setMatchFood] = useState('');

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

  const handleEditWine = (wine: CellarWine) => {
    setSelectedWine(wine);
    setIsEditMode(true);
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

  const getFilteredAndSorted = useCallback((list: CellarWine[], currentFilter: string, currentSort: string, globalSearch: string, localSearch: string) => {
    const activeSearchQuery = localSearch || globalSearch;

    // Performance improvement: pre-calculate lowercase query to avoid running it in every loop iteration
    const queryLower = activeSearchQuery ? activeSearchQuery.toLowerCase() : '';

    const filtered = list.filter(wine => {
      const matchesSearch = !queryLower ||
        wine.name.toLowerCase().includes(queryLower) ||
        (wine.producer && wine.producer.toLowerCase().includes(queryLower)) ||
        (wine.region && wine.region.toLowerCase().includes(queryLower));

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
  }, []);

  const cellarFilteredAndSorted = useMemo(() => {
    return getFilteredAndSorted(wines.filter(w => !w.status || w.status === 'in_cellar'), filter, sortBy, searchQuery, localSearchQuery);
  }, [wines, filter, sortBy, searchQuery, localSearchQuery, getFilteredAndSorted]);

  const wishlistFilteredAndSorted = useMemo(() => {
    return getFilteredAndSorted(wines.filter(w => w.status === 'wishlist'), wishlistFilter, wishlistSortBy, searchQuery, localSearchQuery);
  }, [wines, wishlistFilter, wishlistSortBy, searchQuery, localSearchQuery, getFilteredAndSorted]);

  // Logic for "Wines to Drink Soon": Simply the oldest vintages currently in stock
  const drinkSoonWines = useMemo(() => {
    return wines
      .filter(w => (w.quantity || 0) > 0 && typeof w.vintage === 'number')
      .sort((a, b) => (a.vintage || 0) - (b.vintage || 0))
      .slice(0, 5);
  }, [wines]);

  // Pre-calculate stats in one pass instead of multiple loops in JSX
  const cellarStats = useMemo(() => {
    let totalBottles = 0;
    let totalValue = 0;
    let totalRating = 0;
    let ratedCount = 0;

    wines.forEach(w => {
      if (!w.status || w.status === 'in_cellar') {
        const qty = w.quantity || 0;
        const price = w.price || 0;
        const rating = w.rating || 0;

        totalBottles += qty;
        totalValue += price * qty;

        if (rating > 0) {
          totalRating += rating;
          ratedCount++;
        }
      }
    });

    return {
      totalBottles,
      totalValue,
      averageRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '0.0',
      ratedCount,
      averagePricePerBottle: totalBottles > 0 ? totalValue / totalBottles : 0
    };
  }, [wines]);


  // Match Logic (Derived data without side effects / redundant setStates)
  const suggestedWines = useMemo(() => {
    if (!matchMoment || !matchFood) return [];

    const matches: { wine: CellarWine; score: number }[] = cellarFilteredAndSorted.map(w => ({ wine: w, score: 0 }));

    // Scoring passes
    for (let i = 0; i < matches.length; i++) {
      let score = matches[i].score;
      const w = matches[i].wine;
      const t = w.type;
      const price = w.price || 0;
      const rating = w.rating || 0;

      // 1. Base Score by Food
      switch (matchFood) {
        case 'red_meat': if (t === 'red') score += 10; break;
        case 'poultry': if (t === 'white' || t === 'red') score += 5; break;
        case 'seafood': if (t === 'white' || t === 'sparkling' || t === 'rose') score += 10; break;
        case 'pasta': if (t === 'red' || t === 'white') score += 5; break;
        case 'cheese': if (t === 'red' || t === 'white' || t === 'fortified') score += 8; break;
        case 'dessert': if (t === 'dessert' || t === 'fortified' || t === 'sparkling') score += 10; break;
        case 'none': if (t === 'sparkling' || t === 'rose' || t === 'white') score += 5; break;
      }

      // 2. Adjust Score by Moment
      switch (matchMoment) {
        case 'casual': if (price < 150) score += 5; break;
        case 'dinner': if (rating >= 4) score += 5; break;
        case 'celebration': if (t === 'sparkling' || price > 200) score += 8; break;
        case 'tasting': if (rating >= 4.5 || price > 300) score += 10; break;
        case 'gift': if (price > 150 && rating >= 4) score += 8; break;
      }

      // 3. Fallback: Include highly rated wines if score is too low
      if (score === 0 && rating >= 4.5) score += 2;

      matches[i].score = score;
    }

    // 4. Sort and return Top 3
    return matches
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(m => m.wine);
  }, [matchMoment, matchFood, cellarFilteredAndSorted]);



  return (
    <div className="space-y-8 relative">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-50/80 via-white to-pink-50/50"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
      <div className="absolute top-40 left-0 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 relative z-10">
        {/* Total Wines (Rótulos) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-4 lg:p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[150px] lg:h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 leading-none">{wines.length}</p>
              <p className="text-[10px] lg:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Rótulos</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-red-50 text-red-500 rounded-[12px] flex items-center justify-center border border-red-100/50 shadow-sm">
              <i className="ri-goblet-fill text-lg"></i>
            </div>
          </div>
          <div className="mt-auto">
            {/* Mock Sparkline */}
            <div className="h-8 lg:h-10 w-full mb-1">
              <svg className="w-full h-full drop-shadow-sm" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,25 C15,20 25,25 35,20 C45,15 50,28 60,25 C75,20 85,0 95,20 L100,5" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex justify-between items-end border-t border-gray-100/60 pt-2">
              <p className="text-[9px] lg:text-[10px] text-gray-500 font-semibold uppercase">{wines.length} RÓTULOS (TOTAL)</p>
              <p className="text-[9px] lg:text-[10px] text-gray-400">Último mês: <span className="text-gray-900 font-bold">+1</span></p>
            </div>
          </div>
        </div>

        {/* Total Bottles (Garrafas) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-4 lg:p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[150px] lg:h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 leading-none">{cellarStats.totalBottles}</p>
              <p className="text-[10px] lg:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Garrafas</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-amber-50 text-amber-500 rounded-[12px] flex items-center justify-center border border-amber-100/50 shadow-sm">
              <i className="ri-stack-fill text-lg"></i>
            </div>
          </div>
          <div className="mt-auto flex items-end gap-3 border-t border-gray-100/60 pt-2 pb-0.5">
            {/* Circular Progress */}
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0 -mb-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-400" strokeWidth="4" strokeDasharray={`${Math.min((cellarStats.totalBottles / 100) * 100, 100)}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[11px] lg:text-xs font-bold text-gray-900">
                {cellarStats.totalBottles}
              </div>
            </div>
            <div>
              <p className="text-[9px] lg:text-[10px] text-gray-900 font-bold uppercase leading-tight">GARRAFAS <span className="text-gray-400 font-medium normal-case">(No Estoque)</span></p>
              <p className="text-[9px] lg:text-[10px] text-gray-400 mt-1">Capacidade: {cellarStats.totalBottles}/100</p>
            </div>
          </div>
        </div>

        {/* Total Value (Investido) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-4 lg:p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[150px] lg:h-[160px]">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 leading-none truncate">
                  {cellarStats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
                <i className="ri-arrow-right-up-line text-emerald-500 text-sm lg:text-base font-bold"></i>
              </div>
              <p className="text-[10px] lg:text-[11px] text-gray-500 font-bold uppercase tracking-wider">Investido</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0 bg-emerald-50 text-emerald-500 rounded-[12px] flex items-center justify-center border border-emerald-100/50 shadow-sm">
              <i className="ri-money-dollar-circle-fill text-lg"></i>
            </div>
          </div>
          <div className="mt-auto border-t border-gray-100/60 pt-2 pb-0.5">
            <div className="flex items-end gap-1 mb-2 h-5 w-full justify-between px-1">
              <div className="w-3 bg-gray-200 rounded-sm h-[40%]"></div>
              <div className="w-3 bg-gray-200 rounded-sm h-[60%]"></div>
              <div className="w-3 bg-gray-200 rounded-sm h-[20%]"></div>
              <div className="w-3 bg-gray-200 rounded-sm h-[80%]"></div>
              <div className="w-3 bg-gray-200 rounded-sm h-[40%]"></div>
              <div className="w-3 bg-emerald-400 rounded-sm h-[100%] shadow-[0_0_8px_rgba(52,211,153,0.5)] z-10"></div>
              <div className="w-3 bg-gray-200 rounded-sm h-[70%]"></div>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-[9px] lg:text-[10px] text-gray-900 font-bold uppercase truncate pr-1">
                {cellarStats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} INVESTIDO
              </p>
              <p className="text-[9px] lg:text-[10px] text-gray-400 whitespace-nowrap">
                Média p/ gar: {cellarStats.averagePricePerBottle.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Average Rating (Média) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-4 lg:p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[150px] lg:h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 leading-none">
                {cellarStats.averageRating}
              </p>
              <p className="text-[10px] lg:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Média</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-violet-50 text-violet-500 rounded-[12px] flex items-center justify-center border border-violet-100/50 shadow-sm">
              <i className="ri-star-fill text-lg"></i>
            </div>
          </div>
          <div className="mt-auto border-t border-gray-100/60 pt-2 flex items-center justify-between pb-0.5">
            <div>
              <p className="text-[10px] lg:text-[11px] text-gray-900 font-bold uppercase leading-tight">
                {cellarStats.averageRating} MÉDIA
              </p>
              <p className="text-[9px] lg:text-[10px] text-gray-500 font-semibold uppercase">RATINGS</p>
            </div>
            {/* Mock Radar Icon */}
            <div className="w-9 h-9 lg:w-10 lg:h-10 text-violet-400/40 flex items-center justify-center -mb-2">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current stroke-[1.5]">
                <polygon points="50,10 88,38 73,81 27,81 12,38" strokeDasharray="2,2" />
                <polygon points="50,30 69,44 62,65 38,65 31,44" />
                <polygon points="50,45 56,52 48,60 40,55 42,48" className="stroke-violet-500 stroke-2" fill="rgba(139, 92, 246, 0.25)" />
                <line x1="50" y1="50" x2="50" y2="10" />
                <line x1="50" y1="50" x2="88" y2="38" />
                <line x1="50" y1="50" x2="73" y2="81" />
                <line x1="50" y1="50" x2="27" y2="81" />
                <line x1="50" y1="50" x2="12" y2="38" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-[8px] lg:text-[9px] text-gray-400 leading-tight">Baseado em <br />{cellarStats.ratedCount} avaliações</p>
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
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Sort Dropdown Pill */}
            <div className="bg-gray-50/80 hover:bg-gray-100 transition-colors text-gray-700 text-[13px] sm:text-sm rounded-[14px] px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 font-bold cursor-pointer relative shadow-sm border border-gray-100">
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
              <i className="ri-arrow-down-s-line text-gray-500 text-base leading-none"></i>
              <span className="truncate max-w-[100px] sm:max-w-none">
                {sortBy === 'recent' ? 'Mais Recentes' : sortBy === 'name' ? 'Nome A-Z' : sortBy === 'vintage' ? 'Safra' : sortBy === 'rating' ? 'Avaliação' : 'Preço'}
              </span>
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 mx-0.5"></div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-50/80 rounded-[14px] shadow-sm border border-gray-100 p-0.5 shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 sm:p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#e85d04]' : 'text-gray-400 hover:text-gray-600'}`}>
                <i className="ri-layout-grid-fill text-[17px] leading-none block"></i>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 sm:p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <i className="ri-list-ul text-[17px] leading-none block font-bold"></i>
              </button>
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors ml-1 shrink-0"
            >
              <i className={`${isSearchOpen ? 'ri-close-line text-2xl' : 'ri-search-line text-[22px]'} font-normal`}></i>
            </button>
          </div>
        </div>

        {/* Search, Filter & Match Panel */}
        {isSearchOpen && (
          <div className="bg-white/80 backdrop-blur-3xl sticky top-[60px] z-20 mb-4 -mx-4 px-4 pt-4 pb-2 border-b border-white/40 animate-slide-down shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {/* 1. Search Bar */}
            <div className="relative mb-4">
              <i className="ri-search-line absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar vinhos, produtores ou regiões..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all font-medium text-gray-900 placeholder:font-normal"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-circle-fill text-xl"></i>
                </button>
              )}
            </div>

            {/* 2. Primary Actions */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100/50 mb-2">
              <button
                onClick={() => setIsMatchOpen(!isMatchOpen)}
                className={`relative flex items-center gap-1.5 font-bold text-[15px] transition-colors pb-1 cursor-pointer ${isMatchOpen ? 'text-purple-800 border-b-2 border-purple-600' : 'text-purple-600 hover:text-purple-800 border-b-2 border-transparent hover:border-purple-200'}`}
              >
                <i className="ri-magic-line text-xl animate-pulse"></i>
                <span className="leading-tight">A Escolha Perfeita</span>
              </button>

              <div className="flex items-center gap-5">
                <button className="relative flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 text-[15px] border-b-2 border-transparent transition-colors pb-1 cursor-pointer">
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
                    <i className="ri-filter-3-line text-xl"></i> <span className="hidden sm:inline">Filtrar</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Quick Filter Chips Row */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide w-full mb-2">
              <button onClick={() => setFilter('all')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${filter === 'all' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>Pronto para beber</button>
              <button onClick={() => setFilter('favorites')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'favorites' ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                <i className={filter === 'favorites' ? 'ri-heart-3-fill' : 'ri-heart-3-line text-gray-400'}></i> Favoritos
              </button>
              <button onClick={() => setFilter('red')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'red' ? 'border-red-200 text-red-700 bg-red-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                <i className="ri-goblet-fill text-gray-400"></i> Tinto
              </button>
              <button onClick={() => setFilter('white')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'white' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                <i className="ri-goblet-fill text-[#f3e5ab]"></i> Branco
              </button>
              <button onClick={() => setFilter('rose')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${filter === 'rose' ? 'border-pink-200 text-pink-700 bg-pink-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                <i className="ri-goblet-fill text-pink-300"></i> Rosé
              </button>
              <button onClick={() => setFilter('sparkling')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${filter === 'sparkling' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>Espumante</button>
              <button className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white`}>Sem preço</button>
            </div>

            {/* 4. Perfect Match Inline Wizard */}
            {isMatchOpen && (
              <div className="mt-2 py-4 px-3 bg-white/60 backdrop-blur-xl rounded-[24px] border border-purple-100/50 animate-slide-down shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-4 ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-200">
                    <i className="ri-magic-fill text-white text-sm"></i>
                  </div>
                  <p className="text-[13px] font-bold text-gray-900 tracking-tight">Encontre o vinho ideal</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                  {/* Occasion Dropdown */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-purple-500/80 group-focus-within:text-purple-600 transition-colors">
                      <i className="ri-calendar-event-fill"></i>
                    </div>
                    <select
                      value={matchMoment}
                      onChange={(e) => setMatchMoment(e.target.value)}
                      className="w-full pl-10 pr-8 py-3.5 bg-white/80 border border-white/60 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white text-sm font-semibold text-gray-800 transition-all"
                    >
                      <option value="" disabled>1. Qual momento?</option>
                      <option value="casual">Dia a dia / Relaxar</option>
                      <option value="dinner">Jantar a dois</option>
                      <option value="celebration">Celebração / Festa</option>
                      <option value="tasting">Degustação Criteriosa</option>
                      <option value="gift">Presentear</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <i className="ri-expand-up-down-line"></i>
                    </div>
                  </div>

                  {/* Food Dropdown */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-red-500/80 group-focus-within:text-red-500 transition-colors">
                      <i className="ri-restaurant-fill"></i>
                    </div>
                    <select
                      value={matchFood}
                      onChange={(e) => setMatchFood(e.target.value)}
                      className="w-full pl-10 pr-8 py-3.5 bg-white/80 border border-white/60 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:bg-white text-sm font-semibold text-gray-800 disabled:opacity-50 transition-all"
                      disabled={!matchMoment}
                    >
                      <option value="" disabled>2. E a refeição?</option>
                      <option value="red_meat">Carne Vermelha</option>
                      <option value="poultry">Aves</option>
                      <option value="seafood">Peixes / Frutos do Mar</option>
                      <option value="pasta">Massas</option>
                      <option value="cheese">Queijos e Frios</option>
                      <option value="dessert">Sobremesas</option>
                      <option value="none">Apenas beber (sem comida)</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <i className="ri-expand-up-down-line"></i>
                    </div>
                  </div>
                </div>

                {/* Match Results Inline */}
                {matchMoment && matchFood && suggestedWines.length > 0 && (
                  <div className="space-y-2 mt-4 bg-white/50 p-2 rounded-2xl shadow-inner border border-purple-50/50">
                    <div className="flex items-center gap-2 mb-2 px-2 pt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Opções Perfeitas</h4>
                    </div>
                    {suggestedWines.map((wine, i) => (
                      <div
                        key={wine.id}
                        onClick={() => setSelectedWine(wine)}
                        className={`flex items-center gap-3 p-2.5 rounded-[16px] border cursor-pointer transition-all ${i === 0 ? 'bg-gradient-to-r from-purple-50/80 to-pink-50/80 border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]' : 'bg-white/80 border-white/60 hover:bg-white hover:shadow-sm'}`}
                      >
                        <div className="w-12 h-14 bg-black/[0.02] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {wine.image_url ? (
                            <img src={wine.image_url} alt={wine.name} className="w-full h-full object-cover" />
                          ) : (
                            <i className="ri-wine-fill text-xl text-gray-300"></i>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h5 className="font-bold text-gray-900 text-sm leading-tight truncate">{wine.name}</h5>
                          {wine.producer && <p className="text-[11px] text-gray-500 truncate">{wine.producer}</p>}
                        </div>
                        {i === 0 && (
                          <div className="shrink-0 bg-white/90 backdrop-blur border border-purple-100/50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm">
                            <i className="ri-star-s-fill text-[#f3e5ab] mr-1 text-sm"></i> Top #1
                          </div>
                        )}
                        <i className="ri-arrow-right-s-line text-gray-400 shrink-0"></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mx-2 mt-4 text-center px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-3xl flex items-center justify-center border border-white shadow-inner mb-6 animate-pulse">
              <i className="ri-wine-glass-fill text-4xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Carregando sua adega...</h3>
            <p className="text-gray-500 max-w-xs text-center">
              Preparando suas taças e buscando seus rótulos favoritos.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && cellarFilteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mx-2 mt-4 text-center px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border border-white shadow-inner mb-6 animate-bounce-slow">
              <i className="ri-goblet-line text-5xl text-purple-400/80"></i>
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

        {/* Cellar Wines */}
        {cellarFilteredAndSorted.length > 0 && (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3 pb-12 mt-2 px-2" : "flex flex-col gap-4 pb-12 mt-2 px-2"}>
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
                  onEdit={(e) => { e.stopPropagation(); handleEditWine(wine); }}
                  onDelete={(e) => { e.stopPropagation(); handleDeleteWine(wine.id!); }}
                  viewMode={viewMode}
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
            <div className="bg-white/80 backdrop-blur-3xl rounded-[24px] pb-2 pt-2 z-20 mb-4 -mx-2 px-4 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              {/* Chips Row */}
              <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
                <button onClick={() => setWishlistFilter('all')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${wishlistFilter === 'all' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>Todos</button>
                <button onClick={() => setWishlistFilter('red')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${wishlistFilter === 'red' ? 'border-red-200 text-red-700 bg-red-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                  <i className="ri-goblet-fill text-gray-400"></i> Tinto
                </button>
                <button onClick={() => setWishlistFilter('white')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${wishlistFilter === 'white' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                  <i className="ri-goblet-fill text-[#f3e5ab]"></i> Branco
                </button>
                <button onClick={() => setWishlistFilter('rose')} className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors ${wishlistFilter === 'rose' ? 'border-pink-200 text-pink-700 bg-pink-50' : 'border-gray-200/60 text-gray-600 bg-white/50 hover:bg-white'}`}>
                  <i className="ri-goblet-fill text-pink-300"></i> Rosé
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "flex flex-col gap-4"}>
              {wishlistFilteredAndSorted.map((wine) => (
                <WineCard
                  key={wine.id}
                  wine={{ ...wine, quantity: 0 }}
                  onClick={() => setSelectedWine(wine)}
                  onConsume={() => { }}
                  onAdd={(e) => handleAddBottle(e, wine)}
                  onEvaluate={(e) => { e.stopPropagation(); setEvaluatingWine(wine); }}
                  onToggleStatus={(e) => handleToggleStatus(e, wine)}
                  onEdit={(e) => { e.stopPropagation(); handleEditWine(wine); }}
                  onDelete={(e) => { e.stopPropagation(); handleDeleteWine(wine.id!); }}
                  viewMode={viewMode}
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
            onClose={() => { setSelectedWine(null); setIsEditMode(false); }}
            initialIsEditing={isEditMode}
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
