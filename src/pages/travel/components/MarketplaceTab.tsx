
import { useState, useEffect } from 'react';

interface MarketplaceItem {
  id: string;
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
  category: 'adventure' | 'romantic' | 'family' | 'cultural' | 'business' | 'leisure';
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

  // Novo roteiro para vender
  const [newItem, setNewItem] = useState({
    title: '',
    destination: '',
    country: '',
    days: 1,
    description: '',
    price: 0,
    category: 'leisure' as const,
    highlights: [''],
    includes: [''],
    tags: ['']
  });

  useEffect(() => {
    loadMarketplaceItems();
    loadUserBalance();
  }, []);

  const loadUserBalance = () => {
    const wallet = localStorage.getItem('travel-money-wallet');
    if (wallet) {
      const data = JSON.parse(wallet);
      setUserBalance(data.balance || 0);
    }
  };

  const loadMarketplaceItems = () => {
    const saved = localStorage.getItem('marketplace-items');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      // Items iniciais do marketplace
      const initialItems: MarketplaceItem[] = [
        {
          id: '1',
          title: 'Roteiro Completo Paris Romântica',
          destination: 'Paris',
          country: 'França',
          days: 7,
          description: 'Roteiro detalhado para uma viagem romântica inesquecível em Paris. Inclui os melhores restaurantes, pontos turísticos escondidos e dicas exclusivas de quem mora na cidade.',
          price: 250,
          currency: 'TM',
          coverImage: 'https://readdy.ai/api/search-image?query=romantic%20paris%20eiffel%20tower%20sunset%20beautiful%20cityscape%20with%20warm%20golden%20light%20elegant%20architecture%20dreamy%20atmosphere%20professional%20travel%20photography%20stunning%20view&width=800&height=500&seq=market1&orientation=landscape',
          seller: {
            id: 'seller1',
            name: 'Sophie Laurent',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20french%20woman%20portrait%20smiling%20friendly%20elegant&width=150&height=150&seq=seller1&orientation=squarish',
            rating: 4.9,
            sales: 342,
            verified: true
          },
          category: 'romantic',
          rating: 4.9,
          reviews: 156,
          sales: 342,
          highlights: [
            'Restaurantes românticos com vista para Torre Eiffel',
            'Passeios secretos longe dos turistas',
            'Melhores horários para fotos incríveis',
            'Dicas de economia em atrações',
            'Roteiro otimizado por bairro'
          ],
          includes: [
            'Roteiro dia a dia detalhado',
            'Lista de 30+ restaurantes testados',
            'Mapa interativo com todos os pontos',
            'Dicas de transporte e economia',
            'Suporte por mensagem durante a viagem',
            'Atualizações gratuitas do roteiro'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Chegada e Montmartre',
              description: 'Explore o charmoso bairro de Montmartre',
              places: ['Sacré-Cœur', 'Place du Tertre', 'Moulin Rouge']
            },
            {
              day: 2,
              title: 'Paris Clássica',
              description: 'Os ícones mais famosos da cidade',
              places: ['Torre Eiffel', 'Champs-Élysées', 'Arco do Triunfo']
            },
            {
              day: 3,
              title: 'Arte e Cultura',
              description: 'Mergulhe na cultura parisiense',
              places: ['Louvre', 'Museu d\'Orsay', 'Notre-Dame']
            }
          ],
          tags: ['Paris', 'Romântico', 'Lua de Mel', 'Europa', 'Cultura'],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          featured: true
        },
        {
          id: '2',
          title: 'Aventura Completa em Tóquio',
          destination: 'Tóquio',
          country: 'Japão',
          days: 10,
          description: 'Descubra o Japão autêntico com este roteiro completo. Inclui templos escondidos, melhores restaurantes de ramen, experiências culturais únicas e muito mais.',
          price: 350,
          currency: 'TM',
          coverImage: 'https://readdy.ai/api/search-image?query=tokyo%20japan%20travel%20mount%20fuji%20cherry%20blossoms%20modern%20city%20traditional%20culture%20vibrant%20neon%20lights%20beautiful%20scenery&width=800&height=500&seq=market2&orientation=landscape',
          seller: {
            id: 'seller2',
            name: 'Kenji Tanaka',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20japanese%20man%20portrait%20smiling%20friendly%20modern&width=150&height=150&seq=seller2&orientation=squarish',
            rating: 4.8,
            sales: 289,
            verified: true
          },
          category: 'cultural',
          rating: 4.8,
          reviews: 134,
          sales: 289,
          highlights: [
            'Templos e santuários secretos',
            'Melhores restaurantes locais',
            'Experiências culturais autênticas',
            'Guia de etiqueta japonesa',
            'Dicas de transporte com JR Pass'
          ],
          includes: [
            'Roteiro 10 dias completo',
            'Guia de restaurantes e izakayas',
            'Frases essenciais em japonês',
            'Mapa offline para celular',
            'Lista de experiências imperdíveis',
            'Suporte durante toda viagem'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Chegada em Tóquio',
              description: 'Primeiro contato com a cidade',
              places: ['Shibuya', 'Harajuku', 'Shinjuku']
            },
            {
              day: 2,
              title: 'Tóquio Tradicional',
              description: 'Explore o lado histórico',
              places: ['Asakusa', 'Senso-ji', 'Tokyo Skytree']
            }
          ],
          tags: ['Tóquio', 'Japão', 'Cultura', 'Ásia', 'Aventura'],
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          featured: true
        },
        {
          id: '3',
          title: 'Praias Paradisíacas do Caribe',
          destination: 'Cancún',
          country: 'México',
          days: 5,
          description: 'Roteiro perfeito para aproveitar as melhores praias do Caribe mexicano. Inclui cenotes secretos, melhores beach clubs e dicas de festas.',
          price: 180,
          currency: 'TM',
          coverImage: 'https://readdy.ai/api/search-image?query=caribbean%20beach%20cancun%20turquoise%20water%20white%20sand%20palm%20trees%20paradise%20tropical%20luxury%20resort%20beautiful%20sunset&width=800&height=500&seq=market3&orientation=landscape',
          seller: {
            id: 'seller3',
            name: 'Carlos Rodriguez',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20mexican%20man%20portrait%20smiling%20friendly%20beach&width=150&height=150&seq=seller3&orientation=squarish',
            rating: 4.7,
            sales: 521,
            verified: true
          },
          category: 'leisure',
          rating: 4.7,
          reviews: 243,
          sales: 521,
          highlights: [
            'Praias mais bonitas e menos lotadas',
            'Cenotes escondidos incríveis',
            'Melhores beach clubs',
            'Dicas de festas e vida noturna',
            'Passeios de barco privativos'
          ],
          includes: [
            'Roteiro 5 dias otimizado',
            'Mapa de praias e cenotes',
            'Lista de restaurantes à beira-mar',
            'Dicas de economia',
            'Contatos de guias locais',
            'Suporte via WhatsApp'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Praias de Cancún',
              description: 'Explore as melhores praias',
              places: ['Playa Delfines', 'Playa Tortugas', 'Zona Hotelera']
            }
          ],
          tags: ['Cancún', 'Praia', 'Caribe', 'México', 'Festa'],
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'Mochilão Europa 15 Dias',
          destination: 'Europa',
          country: 'Múltiplos',
          days: 15,
          description: 'Roteiro econômico para conhecer 5 países europeus gastando pouco. Inclui hostels testados, transporte barato e atrações gratuitas.',
          price: 420,
          currency: 'TM',
          coverImage: 'https://readdy.ai/api/search-image?query=european%20cities%20backpacking%20travel%20paris%20rome%20london%20iconic%20landmarks%20cultural%20experience%20adventure%20budget%20travel&width=800&height=500&seq=market4&orientation=landscape',
          seller: {
            id: 'seller4',
            name: 'Ana Silva',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20brazilian%20woman%20portrait%20smiling%20friendly%20backpacker&width=150&height=150&seq=seller4&orientation=squarish',
            rating: 4.9,
            sales: 412,
            verified: true
          },
          category: 'adventure',
          rating: 4.9,
          reviews: 198,
          sales: 412,
          highlights: [
            'Roteiro econômico testado',
            'Hostels com melhor custo-benefício',
            'Transporte barato entre países',
            'Atrações gratuitas imperdíveis',
            'Dicas para economizar em tudo'
          ],
          includes: [
            'Roteiro completo 15 dias',
            'Lista de hostels testados',
            'Guia de transporte econômico',
            'Mapa com atrações gratuitas',
            'Planilha de gastos',
            'Grupo de WhatsApp de mochileiros'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Paris',
              description: 'Chegada e primeiros passos',
              places: ['Torre Eiffel', 'Louvre', 'Montmartre']
            }
          ],
          tags: ['Europa', 'Mochilão', 'Econômico', 'Aventura', 'Múltiplos Países'],
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          featured: true
        },
        {
          id: '5',
          title: 'Dubai Luxo e Compras',
          destination: 'Dubai',
          country: 'Emirados Árabes',
          days: 6,
          description: 'Roteiro VIP para aproveitar o melhor de Dubai. Inclui os melhores shoppings, restaurantes de luxo, experiências exclusivas e dicas de compras.',
          price: 300,
          currency: 'TM',
          coverImage: 'https://readdy.ai/api/search-image?query=dubai%20luxury%20travel%20burj%20khalifa%20modern%20architecture%20golden%20sunset%20futuristic%20skyline%20shopping%20mall%20premium%20experience&width=800&height=500&seq=market5&orientation=landscape',
          seller: {
            id: 'seller5',
            name: 'Ahmed Al-Rashid',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20arab%20man%20portrait%20smiling%20friendly%20luxury&width=150&height=150&seq=seller5&orientation=squarish',
            rating: 4.8,
            sales: 267,
            verified: true
          },
          category: 'business',
          rating: 4.8,
          reviews: 112,
          sales: 267,
          highlights: [
            'Melhores shoppings e outlets',
            'Restaurantes de luxo testados',
            'Experiências VIP exclusivas',
            'Dicas de compras e descontos',
            'Roteiro otimizado para compras'
          ],
          includes: [
            'Roteiro 6 dias completo',
            'Guia de shoppings e outlets',
            'Lista de restaurantes premium',
            'Contatos de personal shoppers',
            'Dicas de tax refund',
            'Suporte VIP durante viagem'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Chegada e Dubai Mall',
              description: 'Primeiro dia de compras',
              places: ['Dubai Mall', 'Burj Khalifa', 'Dubai Fountain']
            }
          ],
          tags: ['Dubai', 'Luxo', 'Compras', 'VIP', 'Emirados'],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          title: 'Machu Picchu e Trilha Inca',
          destination: 'Cusco',
          country: 'Peru',
          days: 8,
          description: 'Roteiro completo para fazer a Trilha Inca e conhecer Machu Picchu. Inclui preparação física, equipamentos necessários e dicas de aclimatação.',
          price: 280,
          currency: 'TM',
          coverImage: 'https://readdy.ai/api/search-image?query=machu%20picchu%20peru%20adventure%20travel%20ancient%20ruins%20mountains%20mystical%20landscape%20inca%20trail%20trekking%20beautiful%20scenery&width=800&height=500&seq=market6&orientation=landscape',
          seller: {
            id: 'seller6',
            name: 'Pedro Quispe',
            avatar: 'https://readdy.ai/api/search-image?query=professional%20peruvian%20man%20portrait%20smiling%20friendly%20mountain%20guide&width=150&height=150&seq=seller6&orientation=squarish',
            rating: 4.9,
            sales: 398,
            verified: true
          },
          category: 'adventure',
          rating: 4.9,
          reviews: 187,
          sales: 398,
          highlights: [
            'Guia completo da Trilha Inca',
            'Preparação física necessária',
            'Lista de equipamentos',
            'Dicas de aclimatação',
            'Melhores agências de turismo'
          ],
          includes: [
            'Roteiro 8 dias detalhado',
            'Guia de preparação física',
            'Lista de equipamentos necessários',
            'Contatos de guias locais',
            'Dicas de aclimatação',
            'Suporte antes e durante viagem'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Chegada em Cusco',
              description: 'Aclimatação à altitude',
              places: ['Plaza de Armas', 'Mercado San Pedro', 'Qorikancha']
            }
          ],
          tags: ['Peru', 'Machu Picchu', 'Trilha', 'Aventura', 'Montanha'],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setItems(initialItems);
      localStorage.setItem('marketplace-items', JSON.stringify(initialItems));
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
      localStorage.setItem('marketplace-items', JSON.stringify(updatedItems));

      alert(`✅ Roteiro comprado com sucesso!\n\n💰 ${item.price} TM debitados\n📍 Roteiro adicionado em "Minhas Viagens"\n\nBoa viagem! 🎉`);
      setShowDetailModal(false);
      
      // Disparar evento para atualizar wallet widget
      window.dispatchEvent(new Event('wallet-updated'));
    }
  };

  const handleSellItem = () => {
    if (!newItem.title || !newItem.destination || !newItem.description || newItem.price <= 0) {
      alert('❌ Preencha todos os campos obrigatórios!');
      return;
    }

    const currentUser = {
      id: 'current-user',
      name: 'Você',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20person%20smiling%20friendly%20confident&width=150&height=150&seq=current-user&orientation=squarish',
      rating: 5.0,
      sales: 0,
      verified: false
    };

    const marketplaceItem: MarketplaceItem = {
      id: Date.now().toString(),
      title: newItem.title,
      destination: newItem.destination,
      country: newItem.country,
      days: newItem.days,
      description: newItem.description,
      price: newItem.price,
      currency: 'TM',
      coverImage: `https://readdy.ai/api/search-image?query=${newItem.destination}%20beautiful%20travel%20destination%20scenic%20view%20professional%20photography&width=800&height=500&seq=user-${Date.now()}&orientation=landscape`,
      seller: currentUser,
      category: newItem.category,
      rating: 5.0,
      reviews: 0,
      sales: 0,
      highlights: newItem.highlights.filter(h => h.trim()),
      includes: newItem.includes.filter(i => i.trim()),
      itinerary: [
        {
          day: 1,
          title: 'Dia 1',
          description: 'Primeiro dia do roteiro',
          places: []
        }
      ],
      tags: newItem.tags.filter(t => t.trim()),
      createdAt: new Date().toISOString()
    };

    const updatedItems = [marketplaceItem, ...items];
    setItems(updatedItems);
    localStorage.setItem('marketplace-items', JSON.stringify(updatedItems));

    alert('✅ Roteiro publicado no Marketplace com sucesso!\n\nAgora outros viajantes podem comprar seu roteiro! 🎉');
    setShowSellModal(false);
    
    // Reset form
    setNewItem({
      title: '',
      destination: '',
      country: '',
      days: 1,
      description: '',
      price: 0,
      category: 'leisure',
      highlights: [''],
      includes: [''],
      tags: ['']
    });
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
            onClick={() => setShowSellModal(true)}
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
      {showDetailModal && selectedItem && (
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
                  <button
                    onClick={() => handlePurchase(selectedItem)}
                    disabled={userBalance < selectedItem.price}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <i className="ri-shopping-cart-line mr-2"></i>
                    {userBalance < selectedItem.price ? 'Saldo Insuficiente' : 'Comprar Roteiro'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="ri-add-line text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Vender Roteiro</h2>
                  <p className="text-white/90 text-sm">Compartilhe sua experiência e ganhe Travel Money</p>
                </div>
              </div>
              <button
                onClick={() => setShowSellModal(false)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título do Roteiro *
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Ex: Roteiro Completo Paris Romântica"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destino *
                  </label>
                  <input
                    type="text"
                    value={newItem.destination}
                    onChange={(e) => setNewItem({ ...newItem, destination: e.target.value })}
                    placeholder="Ex: Paris"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={newItem.country}
                    onChange={(e) => setNewItem({ ...newItem, country: e.target.value })}
                    placeholder="Ex: França"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duração (dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.days}
                    onChange={(e) => setNewItem({ ...newItem, days: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="leisure">Lazer</option>
                    <option value="romantic">Romântico</option>
                    <option value="adventure">Aventura</option>
                    <option value="family">Família</option>
                    <option value="cultural">Cultural</option>
                    <option value="business">Negócios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preço (TM) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 250"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Descreva seu roteiro em detalhes..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destaques (até 5)
                </label>
                {newItem.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => {
                        const updated = [...newItem.highlights];
                        updated[index] = e.target.value;
                        setNewItem({ ...newItem, highlights: updated });
                      }}
                      placeholder={`Destaque ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {index === newItem.highlights.length - 1 && newItem.highlights.length < 5 && (
                      <button
                        onClick={() => setNewItem({ ...newItem, highlights: [...newItem.highlights, ''] })}
                        className="px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  O que está incluído (até 6)
                </label>
                {newItem.includes.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...newItem.includes];
                        updated[index] = e.target.value;
                        setNewItem({ ...newItem, includes: updated });
                      }}
                      placeholder={`Item ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {index === newItem.includes.length - 1 && newItem.includes.length < 6 && (
                      <button
                        onClick={() => setNewItem({ ...newItem, includes: [...newItem.includes, ''] })}
                        className="px-4 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (até 5)
                </label>
                {newItem.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const updated = [...newItem.tags];
                        updated[index] = e.target.value;
                        setNewItem({ ...newItem, tags: updated });
                      }}
                      placeholder={`Tag ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {index === newItem.tags.length - 1 && newItem.tags.length < 5 && (
                      <button
                        onClick={() => setNewItem({ ...newItem, tags: [...newItem.tags, ''] })}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <i className="ri-information-line text-blue-500 text-xl flex-shrink-0"></i>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Dicas para vender mais</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Use um título claro e atrativo</li>
                      <li>• Descreva detalhadamente o que está incluído</li>
                      <li>• Adicione destaques únicos da sua experiência</li>
                      <li>• Defina um preço justo baseado no valor oferecido</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSellItem}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Publicar Roteiro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
