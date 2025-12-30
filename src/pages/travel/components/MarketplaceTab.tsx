
import { useState, useEffect } from 'react';
import { getMarketplaceTrips, Trip, User } from '../../../services/supabase';

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
}

export default function MarketplaceTab() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price-low' | 'price-high'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  // Novo roteiro para vender (Not used for now as we use My Trips -> Publish)

  const handleStartSelling = () => {
    alert("Para vender um roteiro, vá para a aba 'Minhas Viagens', selecione um roteiro e clique em 'Vender'.");
  };

  useEffect(() => {
    loadMarketplaceItems();
    loadUserBalance();

    const handleMarketplaceUpdate = () => {
      loadMarketplaceItems();
    };

    window.addEventListener('marketplace-updated', handleMarketplaceUpdate);

    return () => {
      window.removeEventListener('marketplace-updated', handleMarketplaceUpdate);
    };
  }, []);

  const loadUserBalance = () => {
    const wallet = localStorage.getItem('travel-money-wallet');
    if (wallet) {
      const data = JSON.parse(wallet);
      setUserBalance(data.balance || 0);
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
        // If itinerary is JSON, use it. If places array (legacy), use that.
        let mappedItinerary = [];
        if (trip.itinerary && Array.isArray(trip.itinerary)) {
          mappedItinerary = trip.itinerary;
        } else if (trip.places && Array.isArray(trip.places)) {
          // Mock itinerary from flat places
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

        // Extract highlights from itinerary
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
            rating: 5.0, // Default for new system
            sales: 0,    // Default for new system
            verified: true // Assume verified for now
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
          featured: false
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

  const handlePurchase = (item: MarketplaceItem) => {
    if (userBalance < item.price) {
      alert('❌ Saldo insuficiente! Você precisa de mais Travel Money para comprar este roteiro.');
      return;
    }

    // Deduzir do saldo
    const wallet = localStorage.getItem('travel-money-wallet');
    if (wallet) {
      const data = JSON.parse(wallet);
      const newBalance = data.balance - item.price;

      // Adicionar transação
      const newTransaction = {
        id: Date.now().toString(),
        type: 'expense' as const,
        amount: item.price,
        description: `Compra: ${item.title}`,
        category: 'booking' as const,
        date: new Date().toISOString()
      };

      data.balance = newBalance;
      data.transactions = [newTransaction, ...(data.transactions || [])];

      localStorage.setItem('travel-money-wallet', JSON.stringify(data));
      setUserBalance(newBalance);

      // Adicionar roteiro às viagens do usuário
      const userTrips = localStorage.getItem('user-trips');
      const trips = userTrips ? JSON.parse(userTrips) : [];

      const newTrip = {
        id: Date.now().toString(),
        name: item.title,
        destination: item.destination,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + (30 + item.days) * 24 * 60 * 60 * 1000).toISOString(),
        travelers: 1,
        tripType: item.category,
        budget: '€€€',
        description: item.description,
        createdAt: new Date().toISOString(),
        status: 'planning',
        places: item.itinerary.map((day, idx) => ({
          id: `place-${idx}`,
          name: day.title,
          description: day.description,
          time: '09:00',
          duration: '8h'
        })),
        coverImage: item.coverImage,
        purchasedFrom: item.seller.name,
        marketplaceItemId: item.id
      };

      trips.push(newTrip);
      localStorage.setItem('user-trips', JSON.stringify(trips));

      // Atualizar vendas do item
      const updatedItems = items.map(i =>
        i.id === item.id ? { ...i, sales: i.sales + 1 } : i
      );
      setItems(updatedItems);


      alert(`✅ Roteiro comprado com sucesso!\n\n💰 ${item.price} TM debitados\n📍 Roteiro adicionado em "Minhas Viagens"\n\nBoa viagem! 🎉`);
      setShowDetailModal(false);

      // Disparar evento para atualizar wallet widget
      window.dispatchEvent(new Event('wallet-updated'));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <i className="ri-store-line text-3xl"></i>
              <h2 className="text-2xl font-bold">Marketplace de Viagens</h2>
            </div>
            <p className="text-white/90">Compre e venda roteiros personalizados com Travel Money</p>
          </div>
          <button
            onClick={handleStartSelling}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line text-xl"></i>
            Vender Roteiro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-shopping-bag-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{items.length}</span>
          </div>
          <p className="text-white/90 text-sm">Roteiros Disponíveis</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-star-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{featuredItems.length}</span>
          </div>
          <p className="text-white/90 text-sm">Em Destaque</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-wallet-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{userBalance}</span>
          </div>
          <p className="text-white/90 text-sm">Seu Saldo (TM)</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-user-star-line text-3xl opacity-80"></i>
            <span className="text-2xl font-bold">{items.filter(i => i.seller.verified).length}</span>
          </div>
          <p className="text-white/90 text-sm">Vendedores Verificados</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
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

          {/* Category Filter */}
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

          {/* Sort */}
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

      {/* Featured Items */}
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
                {/* Cover Image */}
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                      <i className="ri-star-fill"></i>
                      Destaque
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 ${getCategoryBg(item.category)} ${getCategoryColor(item.category)} rounded-full text-xs font-medium capitalize`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <i className="ri-map-pin-line"></i>
                      <span>{item.destination}, {item.country}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Seller */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    <img
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      className="w-10 h-10 rounded-full object-cover"
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

                  {/* Stats */}
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

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  {/* Price and Action */}
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

      {/* All Items */}
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
                {/* Cover Image */}
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 ${getCategoryBg(item.category)} ${getCategoryColor(item.category)} rounded-full text-xs font-medium capitalize`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <i className="ri-map-pin-line"></i>
                      <span>{item.destination}, {item.country}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Seller */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    <img
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      className="w-10 h-10 rounded-full object-cover"
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

                  {/* Stats */}
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

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  {/* Price and Action */}
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
        )}
      </div>

      {/* Detail Modal */}
      {
        showDetailModal && selectedItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8">
              {/* Header com Imagem */}
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
                {/* Seller Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <img
                    src={selectedItem.seller.avatar}
                    alt={selectedItem.seller.name}
                    className="w-16 h-16 rounded-full object-cover"
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

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Sobre este Roteiro</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Highlights */}
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

                {/* Includes */}
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

                {/* Tags */}
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

                {/* Purchase Section */}
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
                    {/* Owner Check: If owner, show distinct UI */}
                    {selectedItem.seller.id === (window as any).supabase?.auth?.currentUser?.id || selectedItem.seller.id === 'current-user' ? ( // 'current-user' is a fallback mock
                      <div className="flex flex-col items-end gap-2">
                        <button
                          disabled
                          className="px-8 py-4 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed whitespace-nowrap"
                        >
                          <i className="ri-user-settings-line mr-2"></i>
                          Você é o autor
                        </button>
                        <p className="text-xs text-gray-500">Este roteiro está publicado e visível para outros usuários.</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(selectedItem)}
                        disabled={userBalance < selectedItem.price}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <i className="ri-shopping-cart-line mr-2"></i>
                        {userBalance < selectedItem.price ? 'Saldo Insuficiente' : 'Comprar Roteiro'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }


    </div >
  );
}
