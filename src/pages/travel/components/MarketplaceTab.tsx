import { useState, useEffect } from 'react';
import { getMarketplaceTrips, Trip, User, getTrips, updateTrip } from '../../../services/supabase';
import { getMarketplaceExperiences, acquireExperience, checkExperienceAcquisition, getExperienceReviews } from '../../../services/db/experiences';
import { Experience, ExperienceReview } from '../../../services/db/types';
import { UserAvatar } from '../../../components/UserAvatar';
import { useGamification } from '../../../hooks/queries/useGamification';
import { useAddTransaction } from '../../../hooks/queries/useWallet';

interface MarketplaceItem {
  id: string; // Trip ID
  tripId: string; // Keep original trip ID reference
  title: string;
  destination: string;
  country: string;
  days: number;
  description: string;
  price: number;
  currency: 'TM' | 'BRL';
  coverImage: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    sales: number;
    verified: boolean;
  };
  category: 'adventure' | 'romantic' | 'family' | 'cultural' | 'business' | 'leisure' | 'luxury';
  rating: number;
  reviews: number;
  sales: number;
  highlights: string[];
  includes: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    places: string[];
  }[];
  tags: string[];
  createdAt: string;
  featured?: boolean;
  isPurchased?: boolean;
}

export default function MarketplaceTab() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price-low' | 'price-high'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Experience logic
  const [viewMode, setViewMode] = useState<'trips' | 'experiences'>('trips');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showAlreadyOwnedModal, setShowAlreadyOwnedModal] = useState(false);
  const [experienceReviews, setExperienceReviews] = useState<ExperienceReview[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // User state
  const [myTrips, setMyTrips] = useState<Trip[]>([]);

  const { data: gamification } = useGamification();
  const addTransactionMut = useAddTransaction();
  const userBalance = gamification?.tm_balance || 0;

  useEffect(() => {
    loadMarketplaceItems();

    const loadUserAndTrips = async () => {
      const { data: { user } } = await import('../../../services/supabase').then(m => m.supabase.auth.getUser());
      setCurrentUser(user);
      if (user) {
        fetchMyTrips(user.id);
      }
    };
    loadUserAndTrips();

    const handleMarketplaceUpdate = () => {
      loadMarketplaceItems();
    };

    window.addEventListener('marketplace-updated', handleMarketplaceUpdate);

    return () => {
      window.removeEventListener('marketplace-updated', handleMarketplaceUpdate);
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'experiences' && experiences.length === 0) {
      loadExperiences();
    }
  }, [viewMode]);

  const fetchMyTrips = async (userId: string) => {
    try {
      const userTrips = await getTrips(userId);
      setMyTrips(userTrips.filter(t => t.status !== 'completed'));
    } catch (err) {
      console.error(err);
    }
  };

  const loadExperiences = async () => {
    try {
      const exps = await getMarketplaceExperiences();
      setExperiences(exps);
    } catch (error) {
      console.error('Error loading experiences:', error);
    }
  };

  const loadMarketplaceItems = async () => {
    try {
      const trips = await getMarketplaceTrips();

      const marketplaceItems: MarketplaceItem[] = trips.map(trip => {
        // Calculate days
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // Map places to itinerary
        let mappedItinerary = [];
        if (trip.itinerary && Array.isArray(trip.itinerary)) {
          mappedItinerary = trip.itinerary;
        } else if (trip.places && Array.isArray(trip.places)) {
          mappedItinerary = [{
            day: 1,
            title: 'Roteiro Principal',
            description: 'Locais visitados',
            places: trip.places.map(p => p.name)
          }];
        } else {
          mappedItinerary = [{
            day: 1,
            title: 'Visão Geral',
            description: 'Exploração do destino',
            places: [trip.destination]
          }];
        }

        const highlights = mappedItinerary.flatMap(d => d.places).slice(0, 5);

        return {
          id: trip.id,
          tripId: trip.id,
          title: trip.title,
          destination: trip.destination,
          country: trip.destination.split(',').pop()?.trim() || 'Unknown',
          days: diffDays,
          description: trip.marketplaceConfig?.description || trip.description || 'Sem descrição',
          price: trip.marketplaceConfig?.price || 0,
          currency: trip.marketplaceConfig?.currency || 'TM',
          coverImage: trip.cover_image || `https://readdy.ai/api/search-image?query=${trip.destination}&width=800&height=500`,
          seller: {
            id: (trip as any).seller?.id || 'unknown',
            name: (trip as any).seller?.full_name || (trip as any).seller?.username || 'Viajante',
            avatar: (trip as any).seller?.avatar_url || 'https://via.placeholder.com/150',
            rating: 5.0,
            sales: 0,
            verified: true
          },
          category: trip.trip_type || 'leisure',
          rating: 0,
          reviews: 0,
          sales: 0,
          highlights: highlights.length > 0 ? highlights : ['Roteiro Personalizado'],
          includes: ['Roteiro Detalhado', 'Dicas Locais'],
          itinerary: mappedItinerary,
          tags: [trip.trip_type, trip.destination],
          createdAt: trip.created_at || new Date().toISOString(),
          featured: false,
          isPurchased: (trip as any).isPurchased || false
        };
      });

      setItems(marketplaceItems);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      adventure: 'ri-mountain-line',
      romantic: 'ri-heart-line',
      family: 'ri-group-line',
      cultural: 'ri-building-line',
      business: 'ri-briefcase-line',
      leisure: 'ri-sun-line'
    };
    return icons[category] || 'ri-map-pin-line';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      adventure: 'text-green-500',
      romantic: 'text-pink-500',
      family: 'text-purple-500',
      cultural: 'text-amber-500',
      business: 'text-blue-500',
      leisure: 'text-orange-500'
    };
    return colors[category] || 'text-gray-500';
  };

  const getCategoryBg = (category: string) => {
    const colors: Record<string, string> = {
      adventure: 'bg-green-100',
      romantic: 'bg-pink-100',
      family: 'bg-purple-100',
      cultural: 'bg-amber-100',
      business: 'bg-blue-100',
      leisure: 'bg-orange-100'
    };
    return colors[category] || 'bg-gray-100';
  };

  const handlePurchase = async (item: MarketplaceItem) => {
    if (userBalance < item.price) {
      alert('❌ Saldo insuficiente!');
      return;
    }

    try {
      const { supabase } = await import('../../../services/supabase');

      const { error } = await supabase.rpc('purchase_trip_with_tm', {
        p_trip_id: item.id
      });

      if (error) throw error;

      await addTransactionMut.mutateAsync({
        type: 'spend',
        amount: item.price,
        description: `Compra: ${item.title}`,
        category: 'booking'
      });

      alert('🎉 Roteiro adquirido com sucesso! Você agora tem acesso total a ele na aba "Minhas Viagens".');
      setShowDetailModal(false);
      window.dispatchEvent(new Event('marketplace-updated'));

    } catch (err) {
      console.error('Purchase failed', err);
      alert('Erro ao processar a compra: ' + (err as any).message);
    }
  };

  const filteredItems = items
    .filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.destination.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.sales - a.sales;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const featuredItems = items.filter(item => item.featured);

  const fetchExperienceDetails = async (exp: Experience) => {
    setSelectedExperience(exp);
    setShowExperienceModal(true);
    setActiveMediaIndex(0);
    const reviews = await getExperienceReviews(exp.id);
    setExperienceReviews(reviews);
  };

  const handleAcquireExperience = async (exp: Experience) => {
    if (!currentUser) {
      alert('Você precisa estar logado para adquirir experiências.');
      return;
    }

    if (exp.price > 0 && userBalance < exp.price) {
      alert('❌ Saldo insuficiente!');
      return;
    }

    try {
      const isOwned = await checkExperienceAcquisition(currentUser.id, exp.id);
      if (isOwned) {
        setShowExperienceModal(false);
        setShowAlreadyOwnedModal(true);
        return;
      }

      const result = await acquireExperience(currentUser.id, exp.id);

      if (!result) {
        throw new Error("Erro ao salvar experiência adquirida.");
      }

      if (exp.price > 0) {
        await addTransactionMut.mutateAsync({
          type: 'spend',
          amount: exp.price,
          description: `Aquisição: ${exp.title}`,
          category: 'booking'
        });
      }

      alert('🎉 Experiência adquirida com sucesso! Ela está disponível na sua aba "Minhas Viagens > Serviços Adquiridos".');
      setShowExperienceModal(false);
    } catch (err) {
      console.error(err);
      alert('Erro na aquisição.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i className="ri-store-2-line text-purple-600"></i>
            Marketplace
          </h2>
          <p className="text-sm text-gray-500 font-light">
            Explore roteiros, serviços e experiências da comunidade
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="group relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center cursor-help transition-colors hover:bg-blue-100">
              <i className="ri-shopping-bag-3-line text-lg"></i>
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {items.length} Roteiros Disponíveis
            </span>
          </div>

          <div className="group relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center cursor-help transition-colors hover:bg-yellow-100">
              <i className="ri-star-smile-line text-lg"></i>
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {featuredItems.length} em Destaque
            </span>
          </div>

          <div className="group relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-green-50 text-green-500 flex items-center justify-center cursor-help transition-colors hover:bg-green-100">
              <i className="ri-wallet-3-line text-lg"></i>
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              Seu Saldo: {userBalance} TM
            </span>
          </div>

          <div className="group relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center cursor-help transition-colors hover:bg-purple-100">
              <i className="ri-verified-badge-line text-lg"></i>
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {items.filter(i => i.seller.verified).length} Vendedores Verificados
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setViewMode('trips')}
          className={`px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${viewMode === 'trips' ? 'border-purple-600 text-purple-700 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
        >
          Roteiros Prontos
        </button>
        <button
          onClick={() => setViewMode('experiences')}
          className={`px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${viewMode === 'experiences' ? 'border-purple-600 text-purple-700 bg-purple-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
        >
          Serviços e Experiências
        </button>
      </div>

      {viewMode === 'trips' ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar roteiros..."
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">Todas Categorias</option>
                <option value="romantic">Romântico</option>
                <option value="adventure">Aventura</option>
                <option value="family">Família</option>
                <option value="cultural">Cultural</option>
                <option value="business">Negócios</option>
                <option value="leisure">Lazer</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="popular">Mais Populares</option>
                <option value="recent">Mais Recentes</option>
                <option value="price-low">Menor Preço</option>
                <option value="price-high">Maior Preço</option>
              </select>
            </div>
          </div>

          {featuredItems.length > 0 && filterCategory === 'all' && !searchQuery && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-star-fill text-yellow-500"></i>
                Em Destaque
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailModal(true);
                    }}
                    className="group bg-white rounded-2xl shadow-sm border-2 border-yellow-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                          <i className="ri-star-fill"></i>
                          Destaque
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 ${getCategoryBg(item.category)} ${getCategoryColor(item.category)} rounded-full text-xs font-medium capitalize`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <i className="ri-map-pin-line"></i>
                          <span>{item.destination}, {item.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                        <UserAvatar
                          src={item.seller.avatar}
                          name={item.seller.name}
                          size="md"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.seller.name}</h4>
                            {item.seller.verified && (
                              <i className="ri-verified-badge-fill text-blue-500 text-sm"></i>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <i className="ri-star-fill text-yellow-500"></i>
                              {item.seller.rating}
                            </span>
                            <span>•</span>
                            <span>{item.seller.sales} vendas</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          {item.days} dias
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-star-fill text-yellow-500"></i>
                          {item.rating} ({item.reviews})
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-shopping-bag-line"></i>
                          {item.sales}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Preço</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">{item.price}</span>
                            <span className="text-sm font-semibold text-yellow-600">TM</span>
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Roteiros'}
            </h3>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                  <i className="ri-search-line text-4xl text-purple-500"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum roteiro encontrado</h3>
                <p className="text-gray-600 mb-6">Tente ajustar os filtros ou buscar por outros termos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailModal(true);
                    }}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 ${getCategoryBg(item.category)} ${getCategoryColor(item.category)} rounded-full text-xs font-medium capitalize`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <i className="ri-map-pin-line"></i>
                          <span>{item.destination}, {item.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                        <UserAvatar
                          src={item.seller.avatar}
                          name={item.seller.name}
                          size="md"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.seller.name}</h4>
                            {item.seller.verified && (
                              <i className="ri-verified-badge-fill text-blue-500 text-sm"></i>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <i className="ri-star-fill text-yellow-500"></i>
                              {item.seller.rating}
                            </span>
                            <span>•</span>
                            <span>{item.seller.sales} vendas</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          {item.days} dias
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-star-fill text-yellow-500"></i>
                          {item.rating} ({item.reviews})
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-shopping-bag-line"></i>
                          {item.sales}
                        </span>
                      </div>

                      {(currentUser && item.seller.id === currentUser.id) && (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200">
                            <i className="ri-user-star-fill"></i>
                            Seu Roteiro
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Preço</p>
                          {item.price === 0 ? (
                            <span className="text-2xl font-bold text-green-600">Gratuito</span>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">{item.price}</span>
                              <span className="text-sm font-semibold text-yellow-600">TM</span>
                            </div>
                          )}
                        </div>
                        <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <i className="ri-compass-3-line text-purple-500"></i>
            Experiências e Serviços Avulsos
          </h3>

          {experiences.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <i className="ri-compass-line text-4xl text-purple-300 mb-2"></i>
              <h3 className="text-lg font-bold text-gray-900">Nenhum serviço disponível</h3>
              <p className="text-gray-500">Seja o primeiro fornecedor a oferecer um serviço no Marketplace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => { setSelectedExperience(exp); setShowExperienceModal(true); }}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative w-full h-48 overflow-hidden z-0">
                    <img
                      src={exp.cover_image}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        {exp.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col bg-white z-10">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{exp.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <i className="ri-map-pin-line"></i>
                      <span>{exp.location || 'Brasil'}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                      <UserAvatar src={exp.seller?.avatar_url} name={exp.seller?.full_name || exp.seller?.username || 'Anônimo'} size="sm" />
                      <span className="text-xs text-gray-600 flex-1 truncate">{exp.seller?.full_name || exp.seller?.username}</span>
                      <div className="font-bold text-gray-900">
                        {exp.price > 0 ? `${exp.price} ${exp.currency}` : <span className="text-green-600">GRÁTIS</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8">
            <div className="relative h-80 rounded-t-3xl overflow-hidden">
              <img
                src={selectedItem.coverImage}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
              >
                <i className="ri-close-line text-xl text-gray-800"></i>
              </button>

              {selectedItem.featured && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                    <i className="ri-star-fill"></i>
                    Destaque
                  </span>
                </div>
              )}

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 ${getCategoryBg(selectedItem.category)} ${getCategoryColor(selectedItem.category)} rounded-full text-xs font-semibold capitalize`}>
                    {selectedItem.category}
                  </span>
                  <span className="px-3 py-1 bg-white/90 text-gray-800 text-xs font-semibold rounded-full">
                    {selectedItem.days} dias
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {selectedItem.title}
                </h2>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <i className="ri-map-pin-line"></i>
                    <span className="text-sm">{selectedItem.destination}, {selectedItem.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-400"></i>
                    <span className="text-sm font-semibold">{selectedItem.rating}</span>
                    <span className="text-sm">({selectedItem.reviews} avaliações)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-shopping-bag-line"></i>
                    <span className="text-sm">{selectedItem.sales} vendas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <UserAvatar
                  src={selectedItem.seller.avatar}
                  name={selectedItem.seller.name}
                  size="xl"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{selectedItem.seller.name}</h3>
                    {selectedItem.seller.verified && (
                      <i className="ri-verified-badge-fill text-blue-500 text-lg"></i>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-500"></i>
                      {selectedItem.seller.rating} avaliação
                    </span>
                    <span>•</span>
                    <span>{selectedItem.seller.sales} roteiros vendidos</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Sobre este Roteiro</h3>
                <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-star-line text-purple-500"></i>
                  Destaques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedItem.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <i className="ri-checkbox-circle-fill text-purple-500 text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-checkbox-circle-line text-green-500"></i>
                  O que está incluído
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedItem.includes.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <i className="ri-check-line text-green-500 text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedItem.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-4xl font-bold text-gray-900">{selectedItem.price}</span>
                      <span className="text-xl font-semibold text-yellow-600">TM</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Seu saldo: {userBalance} TM
                    </p>
                  </div>
                  {(currentUser && selectedItem.seller.id === currentUser.id) ? (
                    <div className="flex flex-col items-end gap-2">
                      <button
                        disabled
                        className="px-8 py-4 bg-gray-100 text-gray-500 font-semibold rounded-xl cursor-not-allowed whitespace-nowrap border border-gray-200"
                      >
                        <i className="ri-user-settings-line mr-2"></i>
                        Você é o autor
                      </button>
                      <p className="text-xs text-gray-500">Este roteiro é seu.</p>
                    </div>
                  ) : selectedItem.isPurchased ? (
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          alert("Vá para a aba 'Minhas Viagens' para ver o roteiro completo.");
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
                      >
                        <i className="ri-checkbox-circle-line mr-2"></i>
                        Roteiro Adquirido
                      </button>
                      <p className="text-xs text-green-600 font-medium">Você já possui acesso a este roteiro.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <button
                        onClick={() => handlePurchase(selectedItem)}
                        disabled={userBalance < selectedItem.price}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <i className="ri-shopping-cart-line mr-2"></i>
                        {userBalance < selectedItem.price ? 'Saldo Insuficiente' : 'Desbloquear Roteiro'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExperienceModal && selectedExperience && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-slide-up">
            <div className="mb-0 overflow-hidden">
              <div className="relative h-64 md:h-80">
                {[selectedExperience.cover_image, ...(selectedExperience.media_gallery || [])].map((media, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-500 ${activeMediaIndex === idx ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img src={media} alt={`${selectedExperience.title} ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {[selectedExperience.cover_image, ...(selectedExperience.media_gallery || [])].length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex(prev => prev > 0 ? prev - 1 : [selectedExperience.cover_image, ...(selectedExperience.media_gallery || [])].length - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                    >
                      <i className="ri-arrow-left-s-line text-xl"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex(prev => prev < [selectedExperience.cover_image, ...(selectedExperience.media_gallery || [])].length - 1 ? prev + 1 : 0);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                    >
                      <i className="ri-arrow-right-s-line text-xl"></i>
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {[selectedExperience.cover_image, ...(selectedExperience.media_gallery || [])].map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${activeMediaIndex === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={() => setShowExperienceModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg z-10"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase mb-3 inline-block">
                    {selectedExperience.category}
                  </span>
                  <h2 className="text-3xl font-bold mb-1">{selectedExperience.title}</h2>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <i className="ri-map-pin-line"></i> {selectedExperience.location || 'Local a combinar'}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <UserAvatar src={selectedExperience.seller?.avatar_url} name={selectedExperience.seller?.full_name || 'Vendedor'} size="lg" />
                  <div>
                    <p className="text-sm text-gray-500">Oferecido por</p>
                    <p className="font-bold text-gray-900">{selectedExperience.seller?.full_name || selectedExperience.seller?.username}</p>
                  </div>
                </div>

                <div className="space-y-8 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <i className="ri-information-line text-purple-600"></i> Sobre o Serviço
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedExperience.description || 'Nenhuma descrição fornecida.'}</p>
                  </div>

                  {((selectedExperience.video_urls?.length || 0) > 0 || (selectedExperience.files_urls?.length || 0) > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedExperience.video_urls || []).map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-all border border-blue-100"
                        >
                          <i className="ri-video-line text-2xl"></i>
                          <div className="text-sm font-bold truncate">Assistir Vídeo {idx + 1}</div>
                        </a>
                      ))}
                      {(selectedExperience.files_urls || []).map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl transition-all border border-gray-200"
                        >
                          <i className="ri-file-line text-2xl"></i>
                          <div className="text-sm font-bold truncate">Arquivo / Documento {idx + 1}</div>
                        </a>
                      ))}
                    </div>
                  )}

                  {selectedExperience.map_data?.embed_url && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-map-2-line text-purple-600"></i> Localização
                      </h3>
                      <div className="w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                        <iframe
                          title="Map"
                          src={selectedExperience.map_data.embed_url}
                          className="w-full h-full border-0"
                          loading="lazy"
                        ></iframe>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="ri-star-line text-amber-500"></i> Avaliações dos Usuários
                    </h3>
                    {experienceReviews.length > 0 ? (
                      <div className="space-y-4">
                        {experienceReviews.map((review) => (
                          <div key={review.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <UserAvatar src={review.user?.avatar_url} name={review.user?.full_name || 'Usuário'} size="sm" />
                                <span className="text-sm font-bold text-gray-900">{review.user?.full_name}</span>
                              </div>
                              <div className="flex text-amber-500 text-xs">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className={i < review.rating ? "ri-star-fill" : "ri-star-line"}></i>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <i className="ri-chat-voice-line text-3xl text-gray-300 mb-2"></i>
                        <p className="text-sm text-gray-500">Ainda não há avaliações para este serviço.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-[24px] text-white shadow-xl">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Preço Total</p>
                    <p className="text-2xl font-bold">
                      {selectedExperience.price > 0 ? (
                        <>{selectedExperience.price} <span className="text-sm text-purple-400 font-normal">{selectedExperience.currency}</span></>
                      ) : (
                        <span className="text-green-400">GRÁTIS</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcquireExperience(selectedExperience)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    {selectedExperience.price > 0 ? 'Comprar Agora' : 'Adquirir Gratis'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlreadyOwnedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-information-line text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Item já adquirido!</h3>
              <p className="text-gray-500 mb-8">
                Você já possui este item em seu inventário. Você pode encontrá-lo na aba <b>Minhas Viagens {'>'} Serviços</b>.
              </p>
              <button
                onClick={() => setShowAlreadyOwnedModal(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
