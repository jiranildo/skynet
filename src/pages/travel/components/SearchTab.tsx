import { useState, useEffect, useRef } from 'react';

export default function SearchTab() {
  const [searchType, setSearchType] = useState<'destination' | 'hotel' | 'activity'>('destination');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nearbyResults, setNearbyResults] = useState<any[]>([]);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [showAllDestinationsModal, setShowAllDestinationsModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('all');

  // Carousel drag state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('travel-favorites-ids');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever favorites state changes
  const saveFavoritesToStorage = (newFavorites: Set<string>) => {
    localStorage.setItem('travel-favorites-ids', JSON.stringify(Array.from(newFavorites)));
  };

  // Save detailed favorite item to localStorage
  const saveFavoriteItem = (item: any, category: string, favoriteId: string) => {
    const favoriteItem = {
      id: favoriteId,
      title: item.name,
      location: item.address || item.location || 'Local',
      image: item.image,
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      price: item.price || 'Consulte',
      distance: item.distance || '',
      category: category.toLowerCase(),
      description: item.description || '',
      highlights: item.highlights || []
    };

    // Get existing favorites from localStorage
    const existingFavorites = localStorage.getItem('travel-favorites');
    const favoritesList = existingFavorites ? JSON.parse(existingFavorites) : [];
    
    // Add or remove favorite
    const existingIndex = favoritesList.findIndex((fav: any) => fav.id === favoriteId);
    
    if (existingIndex >= 0) {
      // Remove from favorites
      favoritesList.splice(existingIndex, 1);
    } else {
      // Add to favorites
      favoritesList.push(favoriteItem);
    }

    // Save back to localStorage
    localStorage.setItem('travel-favorites', JSON.stringify(favoritesList));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { 
      detail: { favorites: favoritesList } 
    }));
  };

  const searchSuggestions = [
    'Paris, França',
    'Tóquio, Japão',
    'Nova York, EUA',
    'Barcelona, Espanha',
    'Dubai, Emirados Árabes',
    'Bali, Indonésia',
  ];

  const popularDestinations = [
    {
      name: 'Paris, França',
      type: 'Europa',
      price: 'A partir de R$ 3.500',
      address: 'Paris, França',
      rating: 4.9,
      reviews: 125678,
      description: 'Cidade do amor com Torre Eiffel e museus mundialmente famosos',
      highlights: ['Torre Eiffel', 'Louvre', 'Champs-Élysées', 'Gastronomia'],
      image: 'https://readdy.ai/api/search-image?query=paris%20eiffel%20tower%20romantic%20city%20view%20beautiful%20architecture%20french%20culture%20iconic%20landmark&width=400&height=300&seq=dest-paris-1&orientation=landscape',
    },
    {
      name: 'Tóquio, Japão',
      type: 'Ásia',
      price: 'A partir de R$ 4.200',
      address: 'Tóquio, Japão',
      rating: 4.8,
      reviews: 98765,
      description: 'Cidade moderna com templos tradicionais e tecnologia avançada',
      highlights: ['Templos', 'Tecnologia', 'Gastronomia', 'Cultura'],
      image: 'https://readdy.ai/api/search-image?query=tokyo%20japan%20modern%20city%20skyline%20neon%20lights%20cherry%20blossoms%20traditional%20temples%20urban%20landscape&width=400&height=300&seq=dest-tokyo-1&orientation=landscape',
    },
    {
      name: 'Nova York, EUA',
      type: 'América do Norte',
      price: 'A partir de R$ 3.800',
      address: 'Nova York, EUA',
      rating: 4.9,
      reviews: 156789,
      description: 'A cidade que nunca dorme com Times Square e Estátua da Liberdade',
      highlights: ['Times Square', 'Central Park', 'Broadway', 'Estátua da Liberdade'],
      image: 'https://readdy.ai/api/search-image?query=new%20york%20city%20manhattan%20skyline%20statue%20of%20liberty%20times%20square%20urban%20architecture&width=400&height=300&seq=dest-ny-1&orientation=landscape',
    },
    {
      name: 'Barcelona, Espanha',
      type: 'Europa',
      price: 'A partir de R$ 3.200',
      address: 'Barcelona, Espanha',
      rating: 4.7,
      reviews: 87654,
      description: 'Arquitetura de Gaudí e praias mediterrâneas',
      highlights: ['Sagrada Família', 'Park Güell', 'Praias', 'Gastronomia'],
      image: 'https://readdy.ai/api/search-image?query=barcelona%20spain%20sagrada%20familia%20gaudi%20architecture%20mediterranean%20beach%20colorful%20vibrant%20city&width=400&height=300&seq=dest-bcn-1&orientation=landscape',
    },
    {
      name: 'Dubai, Emirados Árabes',
      type: 'Oriente Médio',
      price: 'A partir de R$ 4.500',
      address: 'Dubai, Emirados Árabes Unidos',
      rating: 4.8,
      reviews: 76543,
      description: 'Luxo e modernidade no deserto com arranha-céus icônicos',
      highlights: ['Burj Khalifa', 'Dubai Mall', 'Deserto', 'Luxo'],
      image: 'https://readdy.ai/api/search-image?query=dubai%20burj%20khalifa%20luxury%20skyscrapers%20desert%20oasis%20golden%20skyline%20futuristic%20city&width=400&height=300&seq=dest-dubai-1&orientation=landscape',
    },
    {
      name: 'Bali, Indonésia',
      type: 'Ásia',
      price: 'A partir de R$ 3.900',
      address: 'Bali, Indonésia',
      rating: 4.9,
      reviews: 65432,
      description: 'Paraíso tropical com templos, praias e cultura única',
      highlights: ['Templos', 'Praias', 'Cultura', 'Natureza'],
      image: 'https://readdy.ai/api/search-image?query=bali%20indonesia%20tropical%20paradise%20beach%20temples%20rice%20terraces%20turquoise%20water%20peaceful%20nature&width=400&height=300&seq=dest-bali-1&orientation=landscape',
    },
    {
      name: 'Londres, Inglaterra',
      type: 'Europa',
      price: 'A partir de R$ 4.100',
      address: 'Londres, Inglaterra',
      rating: 4.8,
      reviews: 134567,
      description: 'História, cultura e tradição na capital britânica',
      highlights: ['Big Ben', 'Tower Bridge', 'Museus', 'Pubs'],
      image: 'https://readdy.ai/api/search-image?query=london%20england%20big%20ben%20tower%20bridge%20red%20buses%20british%20culture%20historical%20architecture&width=400&height=300&seq=dest-london-1&orientation=landscape',
    },
    {
      name: 'Roma, Itália',
      type: 'Europa',
      price: 'A partir de R$ 3.600',
      address: 'Roma, Itália',
      rating: 4.7,
      reviews: 112345,
      description: 'Cidade eterna com história milenar e gastronomia incomparável',
      highlights: ['Coliseu', 'Vaticano', 'Fontana di Trevi', 'Pasta'],
      image: 'https://readdy.ai/api/search-image?query=rome%20italy%20colosseum%20vatican%20ancient%20ruins%20historical%20architecture%20roman%20culture%20european%20heritage&width=400&height=300&seq=dest-rome-1&orientation=landscape',
    },
    {
      name: 'Santorini, Grécia',
      type: 'Europa',
      price: 'A partir de R$ 5.200',
      address: 'Santorini, Grécia',
      rating: 4.9,
      reviews: 89012,
      description: 'Pôr do sol mágico em casinhas brancas com cúpulas azuis',
      highlights: ['Pôr do Sol', 'Vinícolas', 'Praias Vulcânicas', 'Romance'],
      image: 'https://readdy.ai/api/search-image?query=santorini%20greece%20white%20houses%20blue%20domes%20sunset%20romantic%20island%20mediterranean%20sea%20beautiful%20scenery&width=400&height=300&seq=dest-santorini-1&orientation=landscape',
    },
    {
      name: 'Maldivas',
      type: 'Ásia',
      price: 'A partir de R$ 8.500',
      address: 'Maldivas',
      rating: 5.0,
      reviews: 56789,
      description: 'Bangalôs sobre águas cristalinas em paraíso tropical',
      highlights: ['Bangalôs Privativos', 'Mergulho', 'Spa', 'All Inclusive'],
      image: 'https://readdy.ai/api/search-image?query=maldives%20overwater%20bungalows%20crystal%20clear%20turquoise%20water%20tropical%20paradise%20romantic%20luxury%20resort&width=400&height=300&seq=dest-maldives-1&orientation=landscape',
    },
    {
      name: 'Sydney, Austrália',
      type: 'Oceania',
      price: 'A partir de R$ 6.800',
      address: 'Sydney, Austrália',
      rating: 4.8,
      reviews: 98765,
      description: 'Opera House icônica e praias espetaculares',
      highlights: ['Opera House', 'Harbour Bridge', 'Praias', 'Vida Noturna'],
      image: 'https://readdy.ai/api/search-image?query=sydney%20australia%20opera%20house%20harbor%20bridge%20beautiful%20city%20coastline%20modern%20architecture&width=400&height=300&seq=dest-sydney-1&orientation=landscape',
    },
    {
      name: 'Machu Picchu, Peru',
      type: 'América do Sul',
      price: 'A partir de R$ 3.200',
      address: 'Cusco, Peru',
      rating: 4.9,
      reviews: 76543,
      description: 'Cidade perdida dos Incas nas montanhas dos Andes',
      highlights: ['Ruínas Incas', 'Trilhas', 'História', 'Montanhas'],
      image: 'https://readdy.ai/api/search-image?query=machu%20picchu%20peru%20ancient%20inca%20ruins%20mountains%20mysterious%20archaeological%20site%20historical%20wonder&width=400&height=300&seq=dest-machupicchu-1&orientation=landscape',
    }
  ];

  const nearbyCategories = [
    { id: 'Gastronomia', name: 'Gastronomia', icon: 'ri-restaurant-line', iconColor: 'text-orange-600', iconBg: 'bg-orange-100' },
    { id: 'Hotéis', name: 'Hotéis', icon: 'ri-hotel-line', iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
    { id: 'Museu e Cultura', name: 'Museu e Cultura', icon: 'ri-building-line', iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
    { id: 'Bares', name: 'Bares', icon: 'ri-goblet-line', iconColor: 'text-amber-600', iconBg: 'bg-amber-100' },
    { id: 'Vinho', name: 'Vinho', icon: 'ri-wine-glass-line', iconColor: 'text-rose-600', iconBg: 'bg-rose-100' },
    { id: 'Compras', name: 'Compras', icon: 'ri-shopping-bag-line', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    { id: 'Natureza', name: 'Natureza', icon: 'ri-leaf-line', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { id: 'Aventura', name: 'Aventura', icon: 'ri-rocket-line', iconColor: 'text-red-600', iconBg: 'bg-red-100' },
    { id: 'Praias', name: 'Praias', icon: 'ri-sun-line', iconColor: 'text-cyan-600', iconBg: 'bg-cyan-100' },
    { id: 'Spa & Bem-estar', name: 'Spa & Bem-estar', icon: 'ri-heart-pulse-line', iconColor: 'text-pink-600', iconBg: 'bg-pink-100' },
    { id: 'Esportes', name: 'Esportes', icon: 'ri-football-line', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    { id: 'Vida Noturna', name: 'Vida Noturna', icon: 'ri-music-line', iconColor: 'text-violet-600', iconBg: 'bg-violet-100' },
  ];

  const categoryResults: Record<string, any[]> = {
    'Gastronomia': [
      {
        name: 'Restaurante Terraço Grill',
        category: 'Gastronomia',
        description: 'Churrascaria premium com cortes nobres e vista panorâmica',
        address: 'Av. dos Autonomistas, 1828 - Osasco, SP',
        distance: '2.3 km',
        rating: 4.8,
        reviews: 1247,
        price: 'R$ 120-180',
        time: '15 min',
        image: 'https://readdy.ai/api/search-image?query=elegant%20upscale%20steakhouse%20restaurant%20interior%20with%20panoramic%20city%20view%20warm%20lighting%20premium%20dining%20atmosphere&width=400&height=300&seq=nearby-gastro-1&orientation=landscape',
        highlights: ['Carnes Premium', 'Vista Panorâmica', 'Adega Completa', 'Ambiente Sofisticado'],
        tags: ['Churrascaria', 'Fine Dining', 'Romântico']
      },
      {
        name: 'Sushi House Osasco',
        category: 'Gastronomia',
        description: 'Culinária japonesa autêntica com chef premiado',
        address: 'Rua Antônio Agu, 305 - Osasco, SP',
        distance: '1.8 km',
        rating: 4.9,
        reviews: 892,
        price: 'R$ 90-150',
        time: '10 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20japanese%20sushi%20restaurant%20interior%20minimalist%20design%20fresh%20sashimi%20display%20authentic%20atmosphere&width=400&height=300&seq=nearby-gastro-2&orientation=landscape',
        highlights: ['Rodízio Premium', 'Peixes Frescos', 'Chef Premiado', 'Sake Artesanal'],
        tags: ['Japonês', 'Sushi', 'Contemporâneo']
      },
      {
        name: 'Trattoria Bella Italia',
        category: 'Gastronomia',
        description: 'Massas artesanais e receitas tradicionais italianas',
        address: 'Av. das Nações Unidas, 18001 - Osasco, SP',
        distance: '3.1 km',
        rating: 4.7,
        reviews: 1056,
        price: 'R$ 70-120',
        time: '18 min',
        image: 'https://readdy.ai/api/search-image?query=cozy%20italian%20trattoria%20restaurant%20interior%20rustic%20decor%20fresh%20pasta%20traditional%20atmosphere%20warm%20ambiance&width=400&height=300&seq=nearby-gastro-3&orientation=landscape',
        highlights: ['Massas Frescas', 'Forno a Lenha', 'Vinhos Italianos', 'Ambiente Acolhedor'],
        tags: ['Italiano', 'Massas', 'Familiar']
      }
    ],
    'Hotéis': [
      {
        name: 'Grand Plaza Hotel Osasco',
        category: 'Hotéis',
        description: 'Hotel 5 estrelas com spa completo e gastronomia refinada',
        address: 'Av. dos Autonomistas, 4000 - Osasco, SP',
        distance: '1.5 km',
        rating: 4.9,
        reviews: 2341,
        price: 'R$ 450-800',
        time: '8 min',
        image: 'https://readdy.ai/api/search-image?query=luxury%20five%20star%20hotel%20lobby%20modern%20elegant%20design%20marble%20floors%20chandelier%20sophisticated%20atmosphere&width=400&height=300&seq=nearby-hotel-1&orientation=landscape',
        highlights: ['Spa Completo', 'Piscina Aquecida', 'Restaurante Gourmet', 'Centro de Convenções'],
        tags: ['Luxo', '5 Estrelas', 'Business']
      },
      {
        name: 'Comfort Inn Osasco',
        category: 'Hotéis',
        description: 'Conforto e praticidade para viagens de negócios',
        address: 'Rua Primitiva Vianco, 530 - Osasco, SP',
        distance: '2.7 km',
        rating: 4.5,
        reviews: 1523,
        price: 'R$ 280-420',
        time: '14 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20business%20hotel%20room%20comfortable%20bed%20clean%20design%20work%20desk%20contemporary%20style&width=400&height=300&seq=nearby-hotel-2&orientation=landscape',
        highlights: ['Wi-Fi Grátis', 'Café da Manhã', 'Academia 24h', 'Estacionamento'],
        tags: ['Business', 'Conforto', 'Custo-Benefício']
      }
    ],
    'Museu e Cultura': [
      {
        name: 'Museu de Arte Contemporânea',
        category: 'Museu e Cultura',
        description: 'Acervo diversificado de arte moderna e contemporânea',
        address: 'Av. Franz Voegeli, 300 - Osasco, SP',
        distance: '3.5 km',
        rating: 4.6,
        reviews: 687,
        price: 'R$ 20-40',
        time: '20 min',
        image: 'https://readdy.ai/api/search-image?query=contemporary%20art%20museum%20interior%20white%20walls%20modern%20sculptures%20colorful%20paintings%20gallery%20space%20natural%20light&width=400&height=300&seq=nearby-museum-1&orientation=landscape',
        highlights: ['Exposições Temporárias', 'Acervo Permanente', 'Oficinas de Arte', 'Café Cultural'],
        tags: ['Arte', 'Cultura', 'Educativo']
      },
      {
        name: 'Centro Cultural Osasco',
        category: 'Museu e Cultura',
        description: 'Espaço multicultural com teatro, cinema e exposições',
        address: 'Rua Antônio Agu, 50 - Osasco, SP',
        distance: '2.2 km',
        rating: 4.7,
        reviews: 934,
        price: 'Gratuito',
        time: '12 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20cultural%20center%20building%20architecture%20glass%20facade%20public%20space%20contemporary%20design%20urban%20setting&width=400&height=300&seq=nearby-museum-2&orientation=landscape',
        highlights: ['Teatro 400 Lugares', 'Cinema de Arte', 'Biblioteca', 'Eventos Gratuitos'],
        tags: ['Cultura', 'Teatro', 'Gratuito']
      }
    ],
    'Bares': [
      {
        name: 'The Craft Beer House',
        category: 'Bares',
        description: 'Cervejaria artesanal com 50 torneiras e petiscos gourmet',
        address: 'Av. dos Autonomistas, 2300 - Osasco, SP',
        distance: '1.9 km',
        rating: 4.8,
        reviews: 1456,
        price: 'R$ 40-80',
        time: '11 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20craft%20beer%20bar%20interior%20wooden%20tables%20beer%20taps%20industrial%20design%20cozy%20atmosphere%20warm%20lighting&width=400&height=300&seq=nearby-bar-1&orientation=landscape',
        highlights: ['50 Torneiras', 'Cervejas Artesanais', 'Petiscos Gourmet', 'Happy Hour'],
        tags: ['Cervejaria', 'Artesanal', 'Descontraído']
      },
      {
        name: 'Rooftop Lounge 360',
        category: 'Bares',
        description: 'Bar no terraço com vista 360° e drinks autorais',
        address: 'Av. das Nações Unidas, 20000 - Osasco, SP',
        distance: '2.8 km',
        rating: 4.9,
        reviews: 2103,
        price: 'R$ 60-120',
        time: '16 min',
        image: 'https://readdy.ai/api/search-image?query=elegant%20rooftop%20bar%20terrace%20night%20city%20skyline%20view%20modern%20furniture%20ambient%20lighting%20sophisticated%20atmosphere&width=400&height=300&seq=nearby-bar-2&orientation=landscape',
        highlights: ['Vista Panorâmica', 'Drinks Autorais', 'DJ ao Vivo', 'Ambiente Sofisticado'],
        tags: ['Rooftop', 'Sofisticado', 'Vista']
      },
      {
        name: 'Boteco do Zé',
        category: 'Bares',
        description: 'Boteco tradicional com chopp gelado e petiscos caseiros',
        address: 'Rua Antônio Agu, 180 - Osasco, SP',
        distance: '1.2 km',
        rating: 4.6,
        reviews: 892,
        price: 'R$ 25-50',
        time: '7 min',
        image: 'https://readdy.ai/api/search-image?query=traditional%20brazilian%20boteco%20bar%20interior%20casual%20atmosphere%20beer%20taps%20simple%20decor%20friendly%20environment&width=400&height=300&seq=nearby-bar-3&orientation=landscape',
        highlights: ['Chopp Gelado', 'Petiscos Caseiros', 'Ambiente Familiar', 'Preço Justo'],
        tags: ['Boteco', 'Tradicional', 'Casual']
      }
    ],
    'Vinho': [
      {
        name: 'Enoteca Vino Nobile',
        category: 'Vinho',
        description: 'Adega premium com mais de 500 rótulos e harmonizações',
        address: 'Av. dos Autonomistas, 3200 - Osasco, SP',
        distance: '2.5 km',
        rating: 4.9,
        reviews: 743,
        price: 'R$ 80-200',
        time: '14 min',
        image: 'https://readdy.ai/api/search-image?query=elegant%20wine%20cellar%20enoteca%20interior%20wooden%20shelves%20wine%20bottles%20sophisticated%20lighting%20tasting%20area&width=400&height=300&seq=nearby-wine-1&orientation=landscape',
        highlights: ['500+ Rótulos', 'Degustações', 'Harmonizações', 'Sommelier Especializado'],
        tags: ['Enoteca', 'Premium', 'Degustação']
      },
      {
        name: 'Wine & Cheese Bar',
        category: 'Vinho',
        description: 'Bar de vinhos com tábuas de queijos artesanais',
        address: 'Rua Primitiva Vianco, 420 - Osasco, SP',
        distance: '1.7 km',
        rating: 4.7,
        reviews: 621,
        price: 'R$ 60-140',
        time: '10 min',
        image: 'https://readdy.ai/api/search-image?query=cozy%20wine%20and%20cheese%20bar%20interior%20rustic%20wooden%20tables%20wine%20glasses%20cheese%20boards%20warm%20ambiance&width=400&height=300&seq=nearby-wine-2&orientation=landscape',
        highlights: ['Queijos Artesanais', 'Vinhos Selecionados', 'Ambiente Aconchegante', 'Eventos Temáticos'],
        tags: ['Vinhos', 'Queijos', 'Aconchegante']
      }
    ],
    'Compras': [
      {
        name: 'Shopping Osasco Plaza',
        category: 'Compras',
        description: 'Shopping completo com 200+ lojas e entretenimento',
        address: 'Av. dos Autonomistas, 1828 - Osasco, SP',
        distance: '2.0 km',
        rating: 4.5,
        reviews: 5432,
        price: 'Variado',
        time: '12 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20shopping%20mall%20interior%20bright%20spacious%20multiple%20floors%20stores%20escalators%20contemporary%20design&width=400&height=300&seq=nearby-shop-1&orientation=landscape',
        highlights: ['200+ Lojas', 'Cinema', 'Praça de Alimentação', 'Estacionamento Grátis'],
        tags: ['Shopping', 'Variedade', 'Entretenimento']
      },
      {
        name: 'Mercado Municipal Gourmet',
        category: 'Compras',
        description: 'Mercado com produtos artesanais e gastronomia local',
        address: 'Rua Antônio Agu, 250 - Osasco, SP',
        distance: '1.5 km',
        rating: 4.8,
        reviews: 1234,
        price: 'Variado',
        time: '9 min',
        image: 'https://readdy.ai/api/search-image?query=gourmet%20food%20market%20interior%20fresh%20produce%20artisanal%20products%20colorful%20displays%20traditional%20market%20atmosphere&width=400&height=300&seq=nearby-shop-2&orientation=landscape',
        highlights: ['Produtos Artesanais', 'Gastronomia Local', 'Produtos Orgânicos', 'Ambiente Tradicional'],
        tags: ['Mercado', 'Artesanal', 'Gourmet']
      }
    ],
    'Natureza': [
      {
        name: 'Parque Ecológico do Tietê',
        category: 'Natureza',
        description: 'Área verde com trilhas, lagos e observação de aves',
        address: 'Av. Marginal do Tietê - Osasco, SP',
        distance: '4.2 km',
        rating: 4.6,
        reviews: 1876,
        price: 'Gratuito',
        time: '22 min',
        image: 'https://readdy.ai/api/search-image?query=ecological%20park%20nature%20green%20trees%20walking%20trails%20lake%20birds%20peaceful%20natural%20environment&width=400&height=300&seq=nearby-nature-1&orientation=landscape',
        highlights: ['Trilhas Ecológicas', 'Observação de Aves', 'Piquenique', 'Ciclovia'],
        tags: ['Parque', 'Natureza', 'Gratuito']
      },
      {
        name: 'Jardim Botânico Municipal',
        category: 'Natureza',
        description: 'Jardim com espécies nativas e exóticas da flora brasileira',
        address: 'Rua Marechal Rondon, 1000 - Osasco, SP',
        distance: '3.8 km',
        rating: 4.7,
        reviews: 1432,
        price: 'R$ 10',
        time: '19 min',
        image: 'https://readdy.ai/api/search-image?query=botanical%20garden%20tropical%20plants%20exotic%20flowers%20walking%20paths%20greenhouse%20peaceful%20green%20environment&width=400&height=300&seq=nearby-nature-2&orientation=landscape',
        highlights: ['Flora Brasileira', 'Estufa Tropical', 'Visitas Guiadas', 'Área de Descanso'],
        tags: ['Jardim', 'Botânico', 'Educativo']
      }
    ],
    'Aventura': [
      {
        name: 'Adventure Park Osasco',
        category: 'Aventura',
        description: 'Parque de aventuras com tirolesa, arvorismo e escalada',
        address: 'Av. dos Autonomistas, 5000 - Osasco, SP',
        distance: '5.5 km',
        rating: 4.8,
        reviews: 2134,
        price: 'R$ 80-150',
        time: '28 min',
        image: 'https://readdy.ai/api/search-image?query=adventure%20park%20zipline%20rope%20course%20climbing%20wall%20outdoor%20activities%20forest%20trees%20exciting%20atmosphere&width=400&height=300&seq=nearby-adventure-1&orientation=landscape',
        highlights: ['Tirolesa 300m', 'Arvorismo', 'Escalada', 'Instrutores Certificados'],
        tags: ['Aventura', 'Esportes', 'Adrenalina']
      },
      {
        name: 'Kartódromo Speed Racing',
        category: 'Aventura',
        description: 'Pista de kart profissional com karts de alta performance',
        address: 'Rua da Estação, 800 - Osasco, SP',
        distance: '4.8 km',
        rating: 4.7,
        reviews: 1654,
        price: 'R$ 60-120',
        time: '24 min',
        image: 'https://readdy.ai/api/search-image?query=professional%20go%20kart%20racing%20track%20indoor%20facility%20modern%20karts%20speed%20racing%20atmosphere&width=400&height=300&seq=nearby-adventure-2&orientation=landscape',
        highlights: ['Pista Profissional', 'Karts Modernos', 'Cronometragem', 'Campeonatos'],
        tags: ['Kart', 'Velocidade', 'Competição']
      }
    ],
    'Praias': [
      {
        name: 'Praia Grande',
        category: 'Praias',
        description: 'Praia extensa com infraestrutura completa e calçadão',
        address: 'Praia Grande, SP',
        distance: '85 km',
        rating: 4.4,
        reviews: 8765,
        price: 'Gratuito',
        time: '1h 20min',
        image: 'https://readdy.ai/api/search-image?query=beautiful%20beach%20coastline%20golden%20sand%20blue%20ocean%20waves%20palm%20trees%20sunny%20day%20beachfront%20promenade&width=400&height=300&seq=nearby-beach-1&orientation=landscape',
        highlights: ['Calçadão', 'Quiosques', 'Esportes Aquáticos', 'Ciclovia'],
        tags: ['Praia', 'Família', 'Infraestrutura']
      },
      {
        name: 'Guarujá',
        category: 'Praias',
        description: 'Praias paradisíacas e vida noturna agitada',
        address: 'Guarujá, SP',
        distance: '95 km',
        rating: 4.6,
        reviews: 12543,
        price: 'Gratuito',
        time: '1h 30min',
        image: 'https://readdy.ai/api/search-image?query=tropical%20paradise%20beach%20clear%20turquoise%20water%20white%20sand%20palm%20trees%20luxury%20resort%20coastline&width=400&height=300&seq=nearby-beach-2&orientation=landscape',
        highlights: ['Praias Paradisíacas', 'Vida Noturna', 'Restaurantes', 'Hotéis de Luxo'],
        tags: ['Praia', 'Luxo', 'Noturna']
      }
    ],
    'Spa & Bem-estar': [
      {
        name: 'Zen Spa & Wellness',
        category: 'Spa & Bem-estar',
        description: 'Spa completo com massagens, sauna e tratamentos estéticos',
        address: 'Av. dos Autonomistas, 2800 - Osasco, SP',
        distance: '2.3 km',
        rating: 4.9,
        reviews: 1876,
        price: 'R$ 150-400',
        time: '13 min',
        image: 'https://readdy.ai/api/search-image?query=luxury%20spa%20interior%20relaxation%20room%20massage%20tables%20candles%20peaceful%20atmosphere%20zen%20design%20natural%20elements&width=400&height=300&seq=nearby-spa-1&orientation=landscape',
        highlights: ['Massagens Terapêuticas', 'Sauna Seca', 'Tratamentos Faciais', 'Day Spa'],
        tags: ['Spa', 'Relaxamento', 'Bem-estar']
      },
      {
        name: 'Yoga & Meditation Center',
        category: 'Spa & Bem-estar',
        description: 'Centro de yoga e meditação com aulas diárias',
        address: 'Rua Primitiva Vianco, 350 - Osasco, SP',
        distance: '1.8 km',
        rating: 4.8,
        reviews: 943,
        price: 'R$ 80-150',
        time: '11 min',
        image: 'https://readdy.ai/api/search-image?query=peaceful%20yoga%20meditation%20studio%20natural%20light%20wooden%20floor%20plants%20calm%20atmosphere%20wellness%20space&width=400&height=300&seq=nearby-spa-2&orientation=landscape',
        highlights: ['Aulas de Yoga', 'Meditação Guiada', 'Pilates', 'Workshops'],
        tags: ['Yoga', 'Meditação', 'Saúde']
      }
    ],
    'Esportes': [
      {
        name: 'Arena Sports Complex',
        category: 'Esportes',
        description: 'Complexo esportivo com quadras, piscinas e academia',
        address: 'Av. das Nações Unidas, 15000 - Osasco, SP',
        distance: '3.2 km',
        rating: 4.7,
        reviews: 2341,
        price: 'R$ 50-120',
        time: '17 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20sports%20complex%20indoor%20courts%20swimming%20pool%20gym%20facilities%20professional%20equipment%20athletic%20atmosphere&width=400&height=300&seq=nearby-sports-1&orientation=landscape',
        highlights: ['Quadras Poliesportivas', 'Piscina Olímpica', 'Academia Completa', 'Aulas Coletivas'],
        tags: ['Esportes', 'Academia', 'Natação']
      },
      {
        name: 'Clube de Tênis Osasco',
        category: 'Esportes',
        description: 'Clube de tênis com quadras profissionais e escola',
        address: 'Rua Marechal Rondon, 500 - Osasco, SP',
        distance: '2.9 km',
        rating: 4.6,
        reviews: 876,
        price: 'R$ 80-180',
        time: '15 min',
        image: 'https://readdy.ai/api/search-image?query=professional%20tennis%20club%20courts%20green%20surface%20net%20modern%20facilities%20clubhouse%20sports%20atmosphere&width=400&height=300&seq=nearby-sports-2&orientation=landscape',
        highlights: ['Quadras Profissionais', 'Escola de Tênis', 'Torneios', 'Professores Certificados'],
        tags: ['Tênis', 'Clube', 'Profissional']
      }
    ],
    'Vida Noturna': [
      {
        name: 'Club Euphoria',
        category: 'Vida Noturna',
        description: 'Balada com DJs internacionais e pista de dança ampla',
        address: 'Av. dos Autonomistas, 3500 - Osasco, SP',
        distance: '2.6 km',
        rating: 4.5,
        reviews: 3421,
        price: 'R$ 60-150',
        time: '14 min',
        image: 'https://readdy.ai/api/search-image?query=modern%20nightclub%20interior%20dance%20floor%20colorful%20lights%20dj%20booth%20crowded%20party%20atmosphere%20energetic%20vibe&width=400&height=300&seq=nearby-night-1&orientation=landscape',
        highlights: ['DJs Internacionais', 'Pista Ampla', 'Open Bar', 'Camarotes VIP'],
        tags: ['Balada', 'Música', 'Festa']
      },
      {
        name: 'Jazz & Blues Lounge',
        category: 'Vida Noturna',
        description: 'Casa de shows com música ao vivo e drinks premium',
        address: 'Rua Antônio Agu, 400 - Osasco, SP',
        distance: '1.9 km',
        rating: 4.8,
        reviews: 1543,
        price: 'R$ 50-100',
        time: '11 min',
        image: 'https://readdy.ai/api/search-image?query=elegant%20jazz%20club%20interior%20live%20music%20stage%20intimate%20atmosphere%20dim%20lighting%20sophisticated%20lounge&width=400&height=300&seq=nearby-night-2&orientation=landscape',
        highlights: ['Música ao Vivo', 'Jazz & Blues', 'Drinks Premium', 'Ambiente Intimista'],
        tags: ['Jazz', 'Música ao Vivo', 'Sofisticado']
      }
    ],
    'Explorar seu País': [
      {
        name: 'Rio de Janeiro, RJ',
        category: 'Explorar seu País',
        description: 'Cidade maravilhosa com praias icônicas e Cristo Redentor',
        address: 'Rio de Janeiro, RJ',
        distance: '430 km',
        rating: 4.9,
        reviews: 45678,
        price: 'A partir de R$ 2.500',
        time: '6h de carro',
        image: 'https://readdy.ai/api/search-image?query=rio%20de%20janeiro%20christ%20redeemer%20statue%20sugarloaf%20mountain%20copacabana%20beach%20beautiful%20cityscape%20tropical%20paradise&width=400&height=300&seq=brasil-rio-1&orientation=landscape',
        highlights: ['Cristo Redentor', 'Pão de Açúcar', 'Copacabana', 'Vida Noturna'],
        tags: ['Praia', 'Cultura', 'Turismo']
      },
      {
        name: 'Gramado, RS',
        category: 'Explorar seu País',
        description: 'Charme europeu com arquitetura alemã e chocolate artesanal',
        address: 'Gramado, RS',
        distance: '1.050 km',
        rating: 4.8,
        reviews: 23456,
        price: 'A partir de R$ 1.800',
        time: '2h30 de voo',
        image: 'https://readdy.ai/api/search-image?query=gramado%20brazil%20european%20architecture%20german%20style%20buildings%20chocolate%20shops%20mountain%20scenery%20charming%20town&width=400&height=300&seq=brasil-gramado-1&orientation=landscape',
        highlights: ['Arquitetura Europeia', 'Chocolates Artesanais', 'Natal Luz', 'Serra Gaúcha'],
        tags: ['Romântico', 'Gastronomia', 'Inverno']
      },
      {
        name: 'Fernando de Noronha, PE',
        category: 'Explorar seu País',
        description: 'Paraíso ecológico com praias paradisíacas e vida marinha',
        address: 'Fernando de Noronha, PE',
        distance: '2.800 km',
        rating: 5.0,
        reviews: 18765,
        price: 'A partir de R$ 4.500',
        time: '3h de avião',
        image: 'https://readdy.ai/api/search-image?query=fernando%20de%20noronha%20brazil%20pristine%20beach%20turquoise%20water%20tropical%20island%20paradise%20dolphins%20marine%20life&width=400&height=300&seq=brasil-noronha-1&orientation=landscape',
        highlights: ['Praias Paradisíacas', 'Mergulho', 'Golfinhos', 'Preservação Ambiental'],
        tags: ['Praia', 'Natureza', 'Luxo']
      }
    ],
    'Travel Copilot': [
      {
        name: 'Roteiro Personalizado Paris',
        category: 'Travel Copilot',
        description: 'Planejamento completo de 7 dias em Paris com IA',
        address: 'Paris, França',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 3456,
        price: 'R$ 299',
        time: 'Planejamento instantâneo',
        image: 'https://readdy.ai/api/search-image?query=paris%20travel%20planning%20itinerary%20eiffel%20tower%20louvre%20museum%20romantic%20streets%20artificial%20intelligence%20technology&width=400&height=300&seq=copilot-paris-1&orientation=landscape',
        highlights: ['Roteiro Dia a Dia', 'Restaurantes Selecionados', 'Ingressos Inclusos', 'Dicas Locais'],
        tags: ['IA', 'Personalizado', 'Completo']
      },
      {
        name: 'Assistente de Viagens 24/7',
        category: 'Travel Copilot',
        description: 'Suporte inteligente durante toda sua viagem',
        address: 'Qualquer destino',
        distance: 'Global',
        rating: 4.8,
        reviews: 8765,
        price: 'R$ 149/mês',
        time: 'Disponível 24/7',
        image: 'https://readdy.ai/api/search-image?query=AI%20travel%20assistant%20smartphone%20app%20interface%20chatbot%20support%20technology%20modern%20digital%20travel%20planning&width=400&height=300&seq=copilot-assist-1&orientation=landscape',
        highlights: ['Chat 24/7', 'Tradução Automática', 'Emergências', 'Recomendações'],
        tags: ['IA', 'Suporte', 'Tecnologia']
      },
      {
        name: 'Otimizador de Custos',
        category: 'Travel Copilot',
        description: 'IA que encontra as melhores ofertas para sua viagem',
        address: 'Todos os destinos',
        distance: 'Global',
        rating: 4.7,
        reviews: 5432,
        price: 'Gratuito',
        time: 'Análise em tempo real',
        image: 'https://readdy.ai/api/search-image?query=travel%20cost%20optimization%20AI%20technology%20price%20comparison%20savings%20money%20budget%20planning%20digital%20interface&width=400&height=300&seq=copilot-cost-1&orientation=landscape',
        highlights: ['Comparação de Preços', 'Alertas de Ofertas', 'Economia Garantida', 'Análise Preditiva'],
        tags: ['IA', 'Economia', 'Ofertas']
      }
    ],
    'Destinos Mais Visitados': [
      {
        name: 'Paris, França',
        category: 'Destinos Mais Visitados',
        description: 'Cidade do amor com Torre Eiffel e museus mundialmente famosos',
        address: 'Paris, França',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 125678,
        price: 'A partir de R$ 3.500',
        time: '12h de voo',
        image: 'https://readdy.ai/api/search-image?query=paris%20france%20eiffel%20tower%20seine%20river%20romantic%20city%20view%20beautiful%20architecture%20european%20culture&width=400&height=300&seq=popular-paris-1&orientation=landscape',
        highlights: ['Torre Eiffel', 'Louvre', 'Champs-Élysées', 'Gastronomia'],
        tags: ['Romântico', 'Cultura', 'Arte']
      },
      {
        name: 'Dubai, Emirados Árabes',
        category: 'Destinos Mais Visitados',
        description: 'Luxo e modernidade no deserto com arranha-céus icônicos',
        address: 'Dubai, EAU',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 98765,
        price: 'A partir de R$ 4.500',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=dubai%20burj%20khalifa%20luxury%20skyscrapers%20modern%20architecture%20desert%20oasis%20golden%20skyline%20futuristic%20city&width=400&height=300&seq=popular-dubai-1&orientation=landscape',
        highlights: ['Burj Khalifa', 'Dubai Mall', 'Deserto', 'Luxo'],
        tags: ['Luxo', 'Compras', 'Moderno']
      },
      {
        name: 'Nova York, EUA',
        category: 'Destinos Mais Visitados',
        description: 'A cidade que nunca dorme com Times Square e Estátua da Liberdade',
        address: 'Nova York, EUA',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 156789,
        price: 'A partir de R$ 3.800',
        time: '10h de voo',
        image: 'https://readdy.ai/api/search-image?query=new%20york%20city%20manhattan%20skyline%20statue%20of%20liberty%20times%20square%20central%20park%20urban%20metropolis&width=400&height=300&seq=popular-ny-1&orientation=landscape',
        highlights: ['Times Square', 'Central Park', 'Broadway', 'Estátua da Liberdade'],
        tags: ['Urbano', 'Cultura', 'Entretenimento']
      }
    ],
    'Viagens Românticas': [
      {
        name: 'Santorini, Grécia',
        category: 'Viagens Românticas',
        description: 'Pôr do sol mágico em casinhas brancas com cúpulas azuis',
        address: 'Santorini, Grécia',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 34567,
        price: 'A partir de R$ 5.200',
        time: '16h de voo',
        image: 'https://readdy.ai/api/search-image?query=santorini%20greece%20white%20houses%20blue%20domes%20sunset%20romantic%20island%20mediterranean%20sea%20beautiful%20scenery&width=400&height=300&seq=romantic-santorini-1&orientation=landscape',
        highlights: ['Pôr do Sol', 'Vinícolas', 'Praias Vulcânicas', 'Romance'],
        tags: ['Romântico', 'Luxo', 'Praia']
      },
      {
        name: 'Maldivas',
        category: 'Viagens Românticas',
        description: 'Bangalôs sobre águas cristalinas em paraíso tropical',
        address: 'Maldivas',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 28765,
        price: 'A partir de R$ 8.500',
        time: '18h de voo',
        image: 'https://readdy.ai/api/search-image?query=maldives%20overwater%20bungalows%20crystal%20clear%20turquoise%20water%20tropical%20paradise%20romantic%20luxury%20resort&width=400&height=300&seq=romantic-maldives-1&orientation=landscape',
        highlights: ['Bangalôs Privativos', 'Mergulho', 'Spa', 'All Inclusive'],
        tags: ['Luxo', 'Praia', 'Exclusivo']
      },
      {
        name: 'Veneza, Itália',
        category: 'Viagens Românticas',
        description: 'Passeios de gôndola pelos canais da cidade do amor',
        address: 'Veneza, Itália',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 45678,
        price: 'A partir de R$ 4.200',
        time: '13h de voo',
        image: 'https://readdy.ai/api/search-image?query=venice%20italy%20gondola%20canals%20romantic%20bridges%20historic%20architecture%20italian%20culture%20beautiful%20city&width=400&height=300&seq=romantic-venice-1&orientation=landscape',
        highlights: ['Passeio de Gôndola', 'Praça São Marcos', 'Ponte Rialto', 'Gastronomia'],
        tags: ['Romântico', 'Cultura', 'História']
      }
    ],
    'Walt Disney World': [
      {
        name: 'Magic Kingdom',
        category: 'Walt Disney World',
        description: 'O parque mais mágico do mundo com Castelo da Cinderela',
        address: 'Orlando, FL, EUA',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 234567,
        price: 'A partir de R$ 4.500',
        time: '10h de voo',
        image: 'https://readdy.ai/api/search-image?query=disney%20magic%20kingdom%20cinderella%20castle%20fireworks%20magical%20theme%20park%20family%20entertainment%20orlando&width=400&height=300&seq=disney-magic-1&orientation=landscape',
        highlights: ['Castelo da Cinderela', 'Montanhas-Russas', 'Shows Noturnos', 'Personagens Disney'],
        tags: ['Família', 'Diversão', 'Magia']
      },
      {
        name: 'Epcot',
        category: 'Walt Disney World',
        description: 'Viagens ao redor do mundo e tecnologia futurista',
        address: 'Orlando, FL, EUA',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 187654,
        price: 'A partir de R$ 4.500',
        time: '10h de voo',
        image: 'https://readdy.ai/api/search-image?query=disney%20epcot%20spaceship%20earth%20world%20showcase%20international%20pavilions%20futuristic%20theme%20park%20technology&width=400&height=300&seq=disney-epcot-1&orientation=landscape',
        highlights: ['World Showcase', 'Spaceship Earth', 'Gastronomia Internacional', 'Tecnologia'],
        tags: ['Cultura', 'Gastronomia', 'Tecnologia']
      },
      {
        name: 'Hollywood Studios',
        category: 'Walt Disney World',
        description: 'Mundo do cinema com Star Wars e Toy Story',
        address: 'Orlando, FL, EUA',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 198765,
        price: 'A partir de R$ 4.500',
        time: '10h de voo',
        image: 'https://readdy.ai/api/search-image?query=disney%20hollywood%20studios%20star%20wars%20galaxy%20edge%20toy%20story%20land%20movie%20theme%20park%20entertainment&width=400&height=300&seq=disney-hollywood-1&orientation=landscape',
        highlights: ['Star Wars Land', 'Toy Story Land', 'Shows ao Vivo', 'Atrações Radicais'],
        tags: ['Cinema', 'Aventura', 'Tecnologia']
      }
    ],
    'Aventura Extrema': [
      {
        name: 'Queenstown, Nova Zelândia',
        category: 'Aventura Extrema',
        description: 'Capital mundial da aventura com bungee jump e esqui',
        address: 'Queenstown, Nova Zelândia',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 23456,
        price: 'A partir de R$ 8.500',
        time: '24h de voo',
        image: 'https://readdy.ai/api/search-image?query=queenstown%20new%20zealand%20bungee%20jumping%20extreme%20sports%20mountain%20scenery%20adventure%20activities%20lake&width=400&height=300&seq=extreme-queenstown-1&orientation=landscape',
        highlights: ['Bungee Jump', 'Esqui', 'Rafting', 'Paraquedismo'],
        tags: ['Adrenalina', 'Esportes', 'Natureza']
      },
      {
        name: 'Interlaken, Suíça',
        category: 'Aventura Extrema',
        description: 'Paragliding nos Alpes Suíços com vistas espetaculares',
        address: 'Interlaken, Suíça',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 18765,
        price: 'A partir de R$ 7.200',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=interlaken%20switzerland%20paragliding%20alps%20mountains%20extreme%20sports%20adventure%20snow%20peaks%20beautiful%20scenery&width=400&height=300&seq=extreme-interlaken-1&orientation=landscape',
        highlights: ['Paragliding', 'Escalada', 'Canyoning', 'Esqui'],
        tags: ['Montanha', 'Adrenalina', 'Natureza']
      },
      {
        name: 'Moab, Utah, EUA',
        category: 'Aventura Extrema',
        description: 'Mountain bike e escalada em formações rochosas únicas',
        address: 'Moab, Utah, EUA',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 15432,
        price: 'A partir de R$ 5.500',
        time: '12h de voo',
        image: 'https://readdy.ai/api/search-image?query=moab%20utah%20red%20rock%20formations%20mountain%20biking%20extreme%20sports%20desert%20landscape%20adventure%20activities&width=400&height=300&seq=extreme-moab-1&orientation=landscape',
        highlights: ['Mountain Bike', 'Escalada', 'Off-Road', 'Canyoneering'],
        tags: ['Deserto', 'Esportes', 'Aventura']
      }
    ],
    'Praias Paradisíacas': [
      {
        name: 'Bora Bora, Polinésia Francesa',
        category: 'Praias Paradisíacas',
        description: 'Lagoa turquesa com bangalôs sobre a água',
        address: 'Bora Bora, Polinésia Francesa',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 34567,
        price: 'A partir de R$ 12.000',
        time: '22h de voo',
        image: 'https://readdy.ai/api/search-image?query=bora%20bora%20french%20polynesia%20turquoise%20lagoon%20overwater%20bungalows%20tropical%20paradise%20luxury%20resort&width=400&height=300&seq=beach-borabora-1&orientation=landscape',
        highlights: ['Bangalôs Luxuosos', 'Mergulho', 'Spa', 'Gastronomia'],
        tags: ['Luxo', 'Exclusivo', 'Romântico']
      },
      {
        name: 'Seychelles',
        category: 'Praias Paradisíacas',
        description: 'Praias de areia branca com rochas de granito gigantes',
        address: 'Seychelles',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 28765,
        price: 'A partir de R$ 9.500',
        time: '18h de voo',
        image: 'https://readdy.ai/api/search-image?query=seychelles%20white%20sand%20beach%20granite%20rocks%20turquoise%20water%20tropical%20paradise%20palm%20trees%20pristine%20nature&width=400&height=300&seq=beach-seychelles-1&orientation=landscape',
        highlights: ['Praias Exclusivas', 'Natureza Preservada', 'Mergulho', 'Resorts de Luxo'],
        tags: ['Natureza', 'Luxo', 'Exclusivo']
      },
      {
        name: 'Phi Phi Islands, Tailândia',
        category: 'Praias Paradisíacas',
        description: 'Ilhas paradisíacas com falésias e águas cristalinas',
        address: 'Phi Phi, Tailândia',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 45678,
        price: 'A partir de R$ 4.800',
        time: '20h de voo',
        image: 'https://readdy.ai/api/search-image?query=phi%20phi%20islands%20thailand%20limestone%20cliffs%20crystal%20clear%20water%20tropical%20beach%20paradise%20boats&width=400&height=300&seq=beach-phiphi-1&orientation=landscape',
        highlights: ['Snorkeling', 'Passeios de Barco', 'Vida Noturna', 'Culinária Tailandesa'],
        tags: ['Aventura', 'Praia', 'Cultura']
      }
    ],
    'Roteiro Cultural': [
      {
        name: 'Roma, Itália',
        category: 'Roteiro Cultural',
        description: 'Cidade eterna com Coliseu e Vaticano',
        address: 'Roma, Itália',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 87654,
        price: 'A partir de R$ 3.800',
        time: '12h de voo',
        image: 'https://readdy.ai/api/search-image?query=rome%20italy%20colosseum%20vatican%20ancient%20ruins%20historical%20architecture%20roman%20culture%20european%20heritage&width=400&height=300&seq=culture-rome-1&orientation=landscape',
        highlights: ['Coliseu', 'Vaticano', 'Fontana di Trevi', 'Gastronomia'],
        tags: ['História', 'Arte', 'Cultura']
      },
      {
        name: 'Atenas, Grécia',
        category: 'Roteiro Cultural',
        description: 'Berço da civilização ocidental com Acrópole',
        address: 'Atenas, Grécia',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 56789,
        price: 'A partir de R$ 4.200',
        time: '15h de voo',
        image: 'https://readdy.ai/api/search-image?query=athens%20greece%20acropolis%20parthenon%20ancient%20ruins%20historical%20monuments%20greek%20culture%20mediterranean%20city&width=400&height=300&seq=culture-athens-1&orientation=landscape',
        highlights: ['Acrópole', 'Parthenon', 'Museus', 'Gastronomia Grega'],
        tags: ['História', 'Arqueologia', 'Cultura']
      },
      {
        name: 'Kyoto, Japão',
        category: 'Roteiro Cultural',
        description: 'Templos milenares e tradições japonesas preservadas',
        address: 'Kyoto, Japão',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 67890,
        price: 'A partir de R$ 5.500',
        time: '24h de voo',
        image: 'https://readdy.ai/api/search-image?query=kyoto%20japan%20traditional%20temples%20bamboo%20forest%20geisha%20culture%20cherry%20blossoms%20ancient%20architecture%20zen%20gardens&width=400&height=300&seq=culture-kyoto-1&orientation=landscape',
        highlights: ['Templos Zen', 'Floresta de Bambu', 'Geishas', 'Cerimônia do Chá'],
        tags: ['Tradição', 'Zen', 'Cultura']
      }
    ],
    'Experiências Gastronômicas': [
      {
        name: 'San Sebastián, Espanha',
        category: 'Experiências Gastronômicas',
        description: 'Capital mundial dos pintxos com restaurantes estrelados',
        address: 'San Sebastián, Espanha',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 23456,
        price: 'A partir de R$ 4.500',
        time: '13h de voo',
        image: 'https://readdy.ai/api/search-image?query=san%20sebastian%20spain%20pintxos%20basque%20cuisine%20michelin%20star%20restaurants%20gourmet%20food%20culinary%20experience&width=400&height=300&seq=food-sansebastian-1&orientation=landscape',
        highlights: ['Pintxos', 'Restaurantes Michelin', 'Vinhos', 'Culinária Basca'],
        tags: ['Gastronomia', 'Luxo', 'Cultura']
      },
      {
        name: 'Bangkok, Tailândia',
        category: 'Experiências Gastronômicas',
        description: 'Street food autêntico e mercados noturnos vibrantes',
        address: 'Bangkok, Tailândia',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 34567,
        price: 'A partir de R$ 3.200',
        time: '20h de voo',
        image: 'https://readdy.ai/api/search-image?query=bangkok%20thailand%20street%20food%20night%20markets%20authentic%20thai%20cuisine%20colorful%20dishes%20local%20culture&width=400&height=300&seq=food-bangkok-1&orientation=landscape',
        highlights: ['Street Food', 'Mercados Noturnos', 'Aulas de Culinária', 'Temperos Exóticos'],
        tags: ['Autêntico', 'Aventura', 'Cultura']
      },
      {
        name: 'Lyon, França',
        category: 'Experiências Gastronômicas',
        description: 'Capital gastronômica francesa com bouchons tradicionais',
        address: 'Lyon, França',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 18765,
        price: 'A partir de R$ 4.800',
        time: '12h de voo',
        image: 'https://readdy.ai/api/search-image?query=lyon%20france%20bouchon%20traditional%20restaurant%20french%20cuisine%20gourmet%20food%20wine%20culture%20culinary%20heritage&width=400&height=300&seq=food-lyon-1&orientation=landscape',
        highlights: ['Bouchons', 'Vinhos Franceses', 'Queijos', 'Mercados Locais'],
        tags: ['Tradição', 'Luxo', 'Gastronomia']
      }
    ],
    'Viagens Econômica': [
      {
        name: 'Budapeste, Hungria',
        category: 'Viagens Econômica',
        description: 'Cidade linda com termas e arquitetura por preço acessível',
        address: 'Budapeste, Hungria',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 34567,
        price: 'A partir de R$ 2.200',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=budapest%20hungary%20parliament%20building%20thermal%20baths%20danube%20river%20beautiful%20architecture%20affordable%20travel&width=400&height=300&seq=budget-budapest-1&orientation=landscape',
        highlights: ['Termas', 'Arquitetura', 'Vida Noturna', 'Gastronomia Barata'],
        tags: ['Econômico', 'Cultura', 'Relaxamento']
      },
      {
        name: 'Praga, República Tcheca',
        category: 'Viagens Econômica',
        description: 'Cidade medieval encantadora com cerveja barata',
        address: 'Praga, República Tcheca',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 45678,
        price: 'A partir de R$ 2.500',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=prague%20czech%20republic%20medieval%20architecture%20charles%20bridge%20castle%20beer%20culture%20affordable%20european%20city&width=400&height=300&seq=budget-prague-1&orientation=landscape',
        highlights: ['Castelo', 'Ponte Carlos', 'Cervejarias', 'Centro Histórico'],
        tags: ['História', 'Cerveja', 'Econômico']
      },
      {
        name: 'Cartagena, Colômbia',
        category: 'Viagens Econômica',
        description: 'Cidade colonial caribenha com praias e história',
        address: 'Cartagena, Colômbia',
        distance: 'Internacional',
        rating: 4.7,
        reviews: 28765,
        price: 'A partir de R$ 2.800',
        time: '7h de voo',
        image: 'https://readdy.ai/api/search-image?query=cartagena%20colombia%20colonial%20architecture%20caribbean%20beach%20colorful%20buildings%20affordable%20travel%20latin%20america&width=400&height=300&seq=budget-cartagena-1&orientation=landscape',
        highlights: ['Centro Histórico', 'Praias', 'Gastronomia', 'Vida Noturna'],
        tags: ['Praia', 'História', 'Econômico']
      }
    ],
    'Viagens Luxuosa': [
      {
        name: 'Dubai, Emirados Árabes',
        category: 'Viagens Luxuosa',
        description: 'Luxo extremo com hotéis 7 estrelas e compras exclusivas',
        address: 'Dubai, EAU',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 56789,
        price: 'A partir de R$ 15.000',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=dubai%20luxury%20hotels%20burj%20al%20arab%20seven%20star%20shopping%20malls%20gold%20souk%20opulent%20lifestyle&width=400&height=300&seq=luxury-dubai-1&orientation=landscape',
        highlights: ['Burj Al Arab', 'Compras de Luxo', 'Restaurantes Michelin', 'Deserto VIP'],
        tags: ['Luxo', 'Exclusivo', 'Compras']
      },
      {
        name: 'Mônaco',
        category: 'Viagens Luxuosa',
        description: 'Glamour e sofisticação no principado dos milionários',
        address: 'Mônaco',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 34567,
        price: 'A partir de R$ 18.000',
        time: '13h de voo',
        image: 'https://readdy.ai/api/search-image?query=monaco%20monte%20carlo%20casino%20luxury%20yachts%20french%20riviera%20glamorous%20lifestyle%20expensive%20cars&width=400&height=300&seq=luxury-monaco-1&orientation=landscape',
        highlights: ['Casino Monte Carlo', 'Iates', 'Grand Prix', 'Restaurantes Estrelados'],
        tags: ['Glamour', 'Exclusivo', 'Luxo']
      },
      {
        name: 'St. Barths, Caribe',
        category: 'Viagens Luxuosa',
        description: 'Ilha caribenha exclusiva frequentada por celebridades',
        address: 'St. Barths, Caribe',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 23456,
        price: 'A partir de R$ 20.000',
        time: '12h de voo',
        image: 'https://readdy.ai/api/search-image?query=st%20barths%20caribbean%20luxury%20island%20exclusive%20beach%20resort%20celebrities%20private%20villas%20turquoise%20water&width=400&height=300&seq=luxury-stbarths-1&orientation=landscape',
        highlights: ['Praias Exclusivas', 'Villas Privativas', 'Gastronomia', 'Iates'],
        tags: ['Exclusivo', 'Praia', 'Celebridades']
      }
    ],
    'Viagens em Família': [
      {
        name: 'Orlando, EUA',
        category: 'Viagens em Família',
        description: 'Capital mundial dos parques temáticos',
        address: 'Orlando, FL, EUA',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 123456,
        price: 'A partir de R$ 4.500',
        time: '10h de voo',
        image: 'https://readdy.ai/api/search-image?query=orlando%20florida%20theme%20parks%20disney%20world%20universal%20studios%20family%20vacation%20entertainment%20attractions&width=400&height=300&seq=family-orlando-1&orientation=landscape',
        highlights: ['Disney World', 'Universal Studios', 'SeaWorld', 'Outlets'],
        tags: ['Família', 'Diversão', 'Parques']
      },
      {
        name: 'Costa do Sauípe, Brasil',
        category: 'Viagens em Família',
        description: 'Resort all-inclusive com atividades para todas as idades',
        address: 'Costa do Sauípe, BA',
        distance: '1.800 km',
        rating: 4.7,
        reviews: 23456,
        price: 'A partir de R$ 3.200',
        time: '2h30 de voo',
        image: 'https://readdy.ai/api/search-image?query=costa%20do%20sauipe%20brazil%20all%20inclusive%20resort%20family%20beach%20activities%20pools%20kids%20club%20tropical%20paradise&width=400&height=300&seq=family-sauipe-1&orientation=landscape',
        highlights: ['Resorts All Inclusive', 'Kids Club', 'Piscinas', 'Praia Privativa'],
        tags: ['Resort', 'Praia', 'All Inclusive']
      },
      {
        name: 'Cancún, México',
        category: 'Viagens em Família',
        description: 'Praias caribenhas com resorts familiares e ruínas maias',
        address: 'Cancún, México',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 67890,
        price: 'A partir de R$ 4.200',
        time: '9h de voo',
        image: 'https://readdy.ai/api/search-image?query=cancun%20mexico%20caribbean%20beach%20family%20resort%20mayan%20ruins%20turquoise%20water%20all%20inclusive%20hotels&width=400&height=300&seq=family-cancun-1&orientation=landscape',
        highlights: ['Resorts All Inclusive', 'Ruínas Maias', 'Parques Aquáticos', 'Snorkeling'],
        tags: ['Praia', 'Cultura', 'All Inclusive']
      }
    ],
    'Natal Encantador': [
      {
        name: 'Gramado, Brasil',
        category: 'Natal Encantador',
        description: 'Natal Luz com decoração encantadora e shows temáticos',
        address: 'Gramado, RS',
        distance: '1.050 km',
        rating: 5.0,
        reviews: 45678,
        price: 'A partir de R$ 2.500',
        time: '2h de avião',
        image: 'https://readdy.ai/api/search-image?query=gramado%20brazil%20christmas%20lights%20natal%20luz%20decorations%20european%20architecture%20festive%20atmosphere%20winter&width=400&height=300&seq=christmas-gramado-1&orientation=landscape',
        highlights: ['Natal Luz', 'Shows Temáticos', 'Decoração', 'Gastronomia'],
        tags: ['Natal', 'Família', 'Espetáculo']
      },
      {
        name: 'Lapônia, Finlândia',
        category: 'Natal Encantador',
        description: 'Casa oficial do Papai Noel com neve e aurora boreal',
        address: 'Rovaniemi, Finlândia',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 34567,
        price: 'A partir de R$ 12.000',
        time: '16h de voo',
        image: 'https://readdy.ai/api/search-image?query=lapland%20finland%20santa%20claus%20village%20snow%20northern%20lights%20christmas%20magic%20winter%20wonderland&width=400&height=300&seq=christmas-lapland-1&orientation=landscape',
        highlights: ['Vila do Papai Noel', 'Aurora Boreal', 'Safári de Renas', 'Neve'],
        tags: ['Natal', 'Magia', 'Neve']
      },
      {
        name: 'Nova York, EUA',
        category: 'Natal Encantador',
        description: 'Árvore do Rockefeller Center e vitrines decoradas',
        address: 'Nova York, EUA',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 78901,
        price: 'A partir de R$ 5.500',
        time: '10h de voo',
        image: 'https://readdy.ai/api/search-image?query=new%20york%20city%20rockefeller%20center%20tree%20ice%20skating%20festive%20decorations%20winter%20holiday%20season&width=400&height=300&seq=christmas-ny-1&orientation=landscape',
        highlights: ['Árvore Rockefeller', 'Patinação no Gelo', 'Vitrines', 'Shows'],
        tags: ['Natal', 'Urbano', 'Compras']
      }
    ],
    'Ano Novo Inesquecível': [
      {
        name: 'Copacabana, Rio de Janeiro',
        category: 'Ano Novo Inesquecível',
        description: 'Maior réveillon do mundo com fogos na praia',
        address: 'Rio de Janeiro, RJ',
        distance: '430 km',
        rating: 5.0,
        reviews: 89012,
        price: 'A partir de R$ 3.500',
        time: '6h de carro',
        image: 'https://readdy.ai/api/search-image?query=copacabana%20rio%20de%20janeiro%20new%20year%20fireworks%20beach%20celebration%20white%20party%20millions%20people&width=400&height=300&seq=newyear-rio-1&orientation=landscape',
        highlights: ['Fogos de Artifício', 'Shows ao Vivo', 'Praia', 'Festa até o Amanhecer'],
        tags: ['Réveillon', 'Praia', 'Festa']
      },
      {
        name: 'Dubai, Emirados Árabes',
        category: 'Ano Novo Inesquecível',
        description: 'Fogos espetaculares no Burj Khalifa',
        address: 'Dubai, EAU',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 67890,
        price: 'A partir de R$ 8.500',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=dubai%20burj%20khalifa%20new%20year%20fireworks%20celebration%20luxury%20party%20downtown%20skyline&width=400&height=300&seq=newyear-dubai-1&orientation=landscape',
        highlights: ['Burj Khalifa', 'Fogos Espetaculares', 'Festas Luxuosas', 'Jantares Especiais'],
        tags: ['Luxo', 'Espetáculo', 'Réveillon']
      },
      {
        name: 'Sydney, Austrália',
        category: 'Ano Novo Inesquecível',
        description: 'Primeiro grande réveillon do mundo na Opera House',
        address: 'Sydney, Austrália',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 56789,
        price: 'A partir de R$ 9.500',
        time: '24h de voo',
        image: 'https://readdy.ai/api/search-image?query=sydney%20australia%20opera%20house%20harbor%20bridge%20new%20year%20fireworks%20celebration%20first%20major%20countdown&width=400&height=300&seq=newyear-sydney-1&orientation=landscape',
        highlights: ['Opera House', 'Harbour Bridge', 'Primeiro Réveillon', 'Cruzeiros'],
        tags: ['Icônico', 'Espetáculo', 'Réveillon']
      }
    ],
    'Melhores Cruzeiros': [
      {
        name: 'Cruzeiro Caribe',
        category: 'Melhores Cruzeiros',
        description: 'Ilhas paradisíacas do Caribe em navio de luxo',
        address: 'Caribe',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 34567,
        price: 'A partir de R$ 5.500',
        time: '7 dias',
        image: 'https://readdy.ai/api/search-image?query=caribbean%20cruise%20luxury%20ship%20tropical%20islands%20turquoise%20water%20paradise%20beaches%20vacation%20travel&width=400&height=300&seq=cruise-caribbean-1&orientation=landscape',
        highlights: ['7 Ilhas', 'All Inclusive', 'Entretenimento', 'Gastronomia'],
        tags: ['Cruzeiro', 'Praia', 'Luxo']
      },
      {
        name: 'Cruzeiro Mediterrâneo',
        category: 'Melhores Cruzeiros',
        description: 'Cidades históricas da Europa em um só roteiro',
        address: 'Mediterrâneo',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 45678,
        price: 'A partir de R$ 7.500',
        time: '10 dias',
        image: 'https://readdy.ai/api/search-image?query=mediterranean%20cruise%20ship%20European%20cities%20historical%20ports%20italy%20greece%20spain%20luxury%20travel&width=400&height=300&seq=cruise-mediterranean-1&orientation=landscape',
        highlights: ['10 Cidades', 'História', 'Cultura', 'Gastronomia'],
        tags: ['Cruzeiro', 'Cultura', 'Europa']
      },
      {
        name: 'Cruzeiro Antártica',
        category: 'Melhores Cruzeiros',
        description: 'Expedição única ao continente gelado',
        address: 'Antártica',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 12345,
        price: 'A partir de R$ 25.000',
        time: '14 dias',
        image: 'https://readdy.ai/api/search-image?query=antarctica%20cruise%20expedition%20ship%20icebergs%20penguins%20glaciers%20unique%20adventure%20polar%20landscape&width=400&height=300&seq=cruise-antarctica-1&orientation=landscape',
        highlights: ['Pinguins', 'Icebergs', 'Expedição', 'Exclusivo'],
        tags: ['Aventura', 'Natureza', 'Exclusivo']
      }
    ],
    'O Melhor de cada mês': [
      {
        name: 'Janeiro - Patagônia',
        category: 'O Melhor de cada mês',
        description: 'Verão na Patagônia com trilhas e glaciares',
        address: 'Patagônia, Argentina/Chile',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 23456,
        price: 'A partir de R$ 6.500',
        time: '4h de voo',
        image: 'https://readdy.ai/api/search-image?query=patagonia%20summer%20glaciers%20mountains%20hiking%20trails%20torres%20del%20paine%20beautiful%20landscape%20nature&width=400&height=300&seq=month-jan-1&orientation=landscape',
        highlights: ['Glaciares', 'Trilhas', 'Torres del Paine', 'Natureza'],
        tags: ['Natureza', 'Aventura', 'Verão']
      },
      {
        name: 'Fevereiro - Carnaval no Rio',
        category: 'O Melhor de cada mês',
        description: 'Maior festa do mundo com desfiles e blocos',
        address: 'Rio de Janeiro, RJ',
        distance: '430 km',
        rating: 5.0,
        reviews: 78901,
        price: 'A partir de R$ 2.800',
        time: '6h de carro',
        image: 'https://readdy.ai/api/search-image?query=rio%20de%20janeiro%20carnival%20samba%20parade%20colorful%20costumes%20street%20party%20celebration%20brazilian%20culture&width=400&height=300&seq=month-feb-1&orientation=landscape',
        highlights: ['Desfiles', 'Blocos de Rua', 'Samba', 'Festa'],
        tags: ['Carnaval', 'Festa', 'Cultura']
      },
      {
        name: 'Março - Japão (Cerejeiras)',
        category: 'O Melhor de cada mês',
        description: 'Floração das cerejeiras em Kyoto e Tóquio',
        address: 'Japão',
        distance: 'Internacional',
        rating: 5.0,
        reviews: 56789,
        price: 'A partir de R$ 7.500',
        time: '24h de voo',
        image: 'https://readdy.ai/api/search-image?query=japan%20cherry%20blossoms%20sakura%20kyoto%20tokyo%20spring%20pink%20flowers%20traditional%20temples%20beautiful%20scenery&width=400&height=300&seq=month-mar-1&orientation=landscape',
        highlights: ['Cerejeiras', 'Templos', 'Cultura', 'Hanami'],
        tags: ['Natureza', 'Cultura', 'Primavera']
      }
    ],
    'Datas Festivas Mais Famosas': [
      {
        name: 'Oktoberfest - Munique',
        category: 'Datas Festivas Mais Famosas',
        description: 'Maior festival de cerveja do mundo',
        address: 'Munique, Alemanha',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 67890,
        price: 'A partir de R$ 5.500',
        time: '14h de voo',
        image: 'https://readdy.ai/api/search-image?query=oktoberfest%20munich%20germany%20beer%20festival%20traditional%20tents%20bavarian%20culture%20celebration%20lederhosen&width=400&height=300&seq=festival-oktoberfest-1&orientation=landscape',
        highlights: ['Cerveja Artesanal', 'Gastronomia Alemã', 'Música', 'Tradição'],
        tags: ['Cerveja', 'Festa', 'Cultura']
      },
      {
        name: 'La Tomatina - Espanha',
        category: 'Datas Festivas Mais Famosas',
        description: 'Batalha de tomates mais famosa do mundo',
        address: 'Buñol, Espanha',
        distance: 'Internacional',
        rating: 4.8,
        reviews: 34567,
        price: 'A partir de R$ 4.200',
        time: '13h de voo',
        image: 'https://readdy.ai/api/search-image?query=la%20tomatina%20spain%20tomato%20fight%20festival%20celebration%20people%20covered%20in%20tomatoes%20fun%20party&width=400&height=300&seq=festival-tomatina-1&orientation=landscape',
        highlights: ['Batalha de Tomates', 'Diversão', 'Tradição', 'Festa'],
        tags: ['Festa', 'Diversão', 'Único']
      },
      {
        name: 'Dia dos Mortos - México',
        category: 'Datas Festivas Mais Famosas',
        description: 'Celebração colorida da vida e da morte',
        address: 'Oaxaca, México',
        distance: 'Internacional',
        rating: 4.9,
        reviews: 45678,
        price: 'A partir de R$ 4.800',
        time: '9h de voo',
        image: 'https://readdy.ai/api/search-image?query=day%20of%20the%20dead%20mexico%20colorful%20skulls%20altars%20marigolds%20celebration%20oaxaca%20cultural%20tradition&width=400&height=300&seq=festival-dayofdead-1&orientation=landscape',
        highlights: ['Altares', 'Caveiras Coloridas', 'Tradição', 'Cultura'],
        tags: ['Cultura', 'Tradição', 'Único']
      }
    ]
  };

  const quickActions = [
    {
      icon: 'ri-map-pin-line',
      label: 'Locais Próximos',
      bgColor: 'bg-white',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      icon: 'ri-earth-line',
      label: 'Explorar seu País',
      bgColor: 'bg-white',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      icon: 'ri-robot-2-line',
      label: 'Travel Copilot',
      bgColor: 'bg-white',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      icon: 'ri-map-pin-user-line',
      label: 'Destinos Mais Visitados',
      bgColor: 'bg-white',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
    {
      icon: 'ri-heart-3-line',
      label: 'Viagens Românticas',
      bgColor: 'bg-white',
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-100',
    },
    {
      icon: 'ri-mickey-line',
      label: 'Walt Disney World',
      bgColor: 'bg-white',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
    },
    {
      icon: 'ri-riding-line',
      label: 'Aventura Extrema',
      bgColor: 'bg-white',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    {
      icon: 'ri-sun-line',
      label: 'Praias Paradisíacas',
      bgColor: 'bg-white',
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-100',
    },
    {
      icon: 'ri-ancient-pavilion-line',
      label: 'Roteiro Cultural',
      bgColor: 'bg-white',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    {
      icon: 'ri-restaurant-2-line',
      label: 'Experiências Gastronômicas',
      bgColor: 'bg-white',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
    },
    {
      icon: 'ri-wallet-3-line',
      label: 'Viagens Econômica',
      bgColor: 'bg-white',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      icon: 'ri-vip-diamond-line',
      label: 'Viagens Luxuosa',
      bgColor: 'bg-white',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    {
      icon: 'ri-parent-line',
      label: 'Viagens em Família',
      bgColor: 'bg-white',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
    },
    {
      icon: 'ri-gift-line',
      label: 'Natal Encantador',
      bgColor: 'bg-white',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    {
      icon: 'ri-sparkling-line',
      label: 'Ano Novo Inesquecível',
      bgColor: 'bg-white',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
    {
      icon: 'ri-ship-2-line',
      label: 'Melhores Cruzeiros',
      bgColor: 'bg-white',
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100',
    },
    {
      icon: 'ri-calendar-check-line',
      label: 'O Melhor de cada mês',
      bgColor: 'bg-white',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
    },
    {
      icon: 'ri-cake-3-line',
      label: 'Datas Festivas Mais Famosas',
      bgColor: 'bg-white',
      iconColor: 'text-fuchsia-600',
      iconBg: 'bg-fuchsia-100',
    },
  ];

  // Responsive carousel configuration
  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1; // Mobile
      if (window.innerWidth < 1024) return 2; // Tablet
      return 3; // Desktop
    }
    return 3;
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
  const totalSlides = Math.ceil(quickActions.length / itemsPerSlide);

  // Update items per slide on resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const goToSlide = (index: number) => {
    setCarouselIndex(index);
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setStartX(pageX);
    setScrollLeft(carouselIndex);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const distance = pageX - startX;
    setDragDistance(distance);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50; // Minimum drag distance to change slide
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0 && carouselIndex > 0) {
        // Drag right - go to previous slide
        setCarouselIndex(carouselIndex - 1);
      } else if (dragDistance < 0 && carouselIndex < totalSlides - 1) {
        // Drag left - go to next slide
        setCarouselIndex(carouselIndex + 1);
      }
    }
    
    setDragDistance(0);
  };

  const handleQuickAction = (label: string) => {
    setCurrentAction(label);
    
    if (label === 'Locais Próximos') {
      setShowCategoryModal(true);
    } else if (categoryResults[label]) {
      setNearbyResults(categoryResults[label]);
      setSelectedCategory(label);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setNearbyResults(categoryResults[category] || []);
  };

  const toggleFavorite = (placeId: string, item: any, category: string = 'attraction') => {
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(placeId)) {
      newFavorites.delete(placeId);
    } else {
      newFavorites.add(placeId);
    }
    
    setFavorites(newFavorites);
    saveFavoritesToStorage(newFavorites);
    saveFavoriteItem(item, category, placeId);
  };

  const toggleDestinationFavorite = (destinationName: string) => {
    const favoriteId = `destination-${destinationName}`;
    const destination = popularDestinations.find(d => d.name === destinationName);
    
    if (destination) {
      toggleFavorite(favoriteId, destination, 'attraction');
    }
  };

  const handleDestinationClick = (destination: any) => {
    setSelectedPlace(destination);
    setShowTripModal(true);
  };

  const handleAddToTrip = (place: any) => {
    setSelectedPlace(place);
    setShowTripModal(true);
  };

  const handleCreateNewTrip = () => {
    setShowTripModal(false);
    setShowCreateTripModal(true);
  };

  const handleAddToExistingTrip = (tripName: string, tripDates: string) => {
    if (selectedPlace) {
      // Get existing trip data from localStorage
      const trips = JSON.parse(localStorage.getItem('user-trips') || '[]');
      const tripIndex = trips.findIndex((trip: any) => 
        `${trip.name}` === tripName.split(',')[0] && 
        `${trip.startDate} - ${trip.endDate}` === tripDates
      );

      if (tripIndex >= 0) {
        // Add place to trip's places array
        if (!trips[tripIndex].places) {
          trips[tripIndex].places = [];
        }

        // Check if place already exists in trip
        const placeExists = trips[tripIndex].places.some((place: any) => 
          place.name === selectedPlace.name
        );

        if (!placeExists) {
          trips[tripIndex].places.push({
            id: Date.now().toString(),
            name: selectedPlace.name,
            address: selectedPlace.address || selectedPlace.location,
            image: selectedPlace.image,
            rating: selectedPlace.rating || 0,
            reviews: selectedPlace.reviews || 0,
            price: selectedPlace.price || 'Consulte',
            category: selectedPlace.category || 'attraction',
            addedAt: new Date().toISOString()
          });

          // Save updated trips
          localStorage.setItem('user-trips', JSON.stringify(trips));

          // Show success message
          alert(`${selectedPlace.name} foi adicionado à sua viagem para ${tripName}! 🎉`);
        } else {
          alert('Este local já está na sua viagem! 😊');
        }
      }
    }

    setShowTripModal(false);
    setSelectedPlace(null);
  };

  const handleShowAllDestinations = () => {
    setShowAllDestinationsModal(true);
  };

  // Create Trip Form State
  const [tripForm, setTripForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    tripType: 'leisure',
    budget: 'medium',
    description: ''
  });

  const tripTypes = [
    { id: 'leisure', name: 'Lazer', icon: 'ri-sun-line', color: 'text-orange-500' },
    { id: 'business', name: 'Negócios', icon: 'ri-briefcase-line', color: 'text-blue-500' },
    { id: 'adventure', name: 'Aventura', icon: 'ri-mountain-line', color: 'text-green-500' },
    { id: 'romantic', name: 'Romântica', icon: 'ri-heart-line', color: 'text-pink-500' },
    { id: 'family', name: 'Família', icon: 'ri-group-line', color: 'text-purple-500' },
    { id: 'cultural', name: 'Cultural', icon: 'ri-building-line', color: 'text-amber-500' }
  ];

  const budgetOptions = [
    { id: 'low', name: 'Econômica', range: 'Até R$ 3.000', color: 'text-green-500' },
    { id: 'medium', name: 'Moderada', range: 'R$ 3.000 - R$ 8.000', color: 'text-blue-500' },
    { id: 'high', name: 'Luxo', range: 'Acima de R$ 8.000', color: 'text-purple-500' }
  ];

  const handleCreateTrip = () => {
    // Validate form
    if (!tripForm.name || !tripForm.destination || !tripForm.startDate || !tripForm.endDate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Save trip to localStorage
    const trips = JSON.parse(localStorage.getItem('user-trips') || '[]');
    const newTrip = {
      id: Date.now().toString(),
      ...tripForm,
      createdAt: new Date().toISOString(),
      status: 'planning'
    };
    trips.push(newTrip);
    localStorage.setItem('user-trips', JSON.stringify(trips));

    // Reset form and close modal
    setTripForm({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 2,
      tripType: 'leisure',
      budget: 'medium',
      description: ''
    });
    setShowCreateTripModal(false);

    // Show success message
    alert('Viagens criada com sucesso! 🎉');
  };

  const [showDestinationDetailModal, setShowDestinationDetailModal] = useState(false);
  const [selectedDestinationDetail, setSelectedDestinationDetail] = useState<any>(null);

  const handleDestinationDetailClick = (destination: any) => {
    setSelectedDestinationDetail(destination);
    setShowDestinationDetailModal(true);
  };

  const handleNearbyDetailClick = (result: any) => {
    setSelectedDestinationDetail(result);
    setShowDestinationDetailModal(true);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert('Por favor, digite um destino para buscar');
      return;
    }

    // Filter destinations based on search query
    const filtered = popularDestinations.filter(dest => 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length > 0) {
      setNearbyResults(filtered);
      setSelectedCategory('Resultados da Busca');
      setSearchQuery('');
      setShowSuggestions(false);
    } else {
      alert('Nenhum destino encontrado. Tente outro termo de busca.');
    }
  };

  const filteredDestinations = selectedDestination === 'all' 
    ? popularDestinations 
    : popularDestinations.filter(dest => dest.type === selectedDestination);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Search Section - Responsive */}
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          {/* Title - Responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
              Para onde você quer ir?
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Encontre passagens, hospedagens e experiências incríveis
            </p>
          </div>

          {/* Search Bar - Restored */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setSearchFocus(true)}
                    onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    placeholder="Buscar destinos, hotéis, atividades..."
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="ri-close-line text-lg"></i>
                    </button>
                  )}
                </div>

                {/* Search Suggestions */}
                {showSuggestions && searchFocus && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 overflow-hidden">
                    {searchSuggestions
                      .filter(suggestion => 
                        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                            handleSearch();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                        >
                          <i className="ri-map-pin-line text-orange-500"></i>
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
              >
                <i className="ri-search-line mr-2"></i>
                Buscar
              </button>
            </div>
          </div>

          {/* Quick Actions Carousel - Horizontal Scrollable Menu */}
          <div className="relative">
            {/* Gradient Fade Indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            {/* Scroll Hint - Left Arrow */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center animate-pulse">
                <i className="ri-arrow-left-s-line text-gray-600 text-xl"></i>
              </div>
            </div>
            
            {/* Scroll Hint - Right Arrow */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center animate-pulse">
                <i className="ri-arrow-right-s-line text-gray-600 text-xl"></i>
              </div>
            </div>
            
            {/* Hint Text */}
            <div className="text-center mb-2">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                <i className="ri-arrow-left-right-line"></i>
                Deslize para ver mais opções
                <i className="ri-arrow-left-right-line"></i>
              </p>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 px-4 py-3 min-w-max">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.label)}
                    className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
                  >
                    <i className={`${action.icon} text-lg sm:text-xl ${action.iconColor}`}></i>
                    <span className="text-gray-700 group-hover:text-orange-600 transition-colors whitespace-nowrap">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(Math.ceil(quickActions.length / 3))].map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations / Results Section - Responsive */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {nearbyResults.length > 0 ? selectedCategory : 'Destinos populares'}
          </h2>
          {nearbyResults.length > 0 ? (
            <button 
              onClick={() => {
                setNearbyResults([]);
                setSelectedCategory(null);
                setCurrentAction(null);
              }}
              className="text-xs sm:text-sm font-medium text-pink-500 hover:text-pink-600 flex items-center gap-1"
            >
              <i className="ri-arrow-left-line"></i>
              Voltar
            </button>
          ) : (
            <button 
              onClick={handleShowAllDestinations}
              className="text-xs sm:text-sm font-medium text-pink-500 hover:text-pink-600"
            >
              Ver todos
            </button>
          )}
        </div>

        {nearbyResults.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {nearbyResults.map((result, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image - Responsive */}
                  <div className="relative w-full lg:w-80 h-48 sm:h-56 lg:h-auto flex-shrink-0 overflow-hidden">
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Action Icons - Responsive */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(`${selectedCategory}-${index}`, result, selectedCategory || 'attraction');
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
                          favorites.has(`${selectedCategory}-${index}`)
                            ? 'bg-red-500 text-white shadow-lg scale-110'
                            : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                        }`}
                      >
                        <i className={`${favorites.has(`${selectedCategory}-${index}`) ? 'ri-heart-fill' : 'ri-heart-line'} text-xl sm:text-2xl`}></i>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNearbyDetailClick(result);
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 text-gray-700"
                      >
                        <i className="ri-eye-line text-xl sm:text-2xl"></i>
                      </button>
                    </div>
                  </div>

                  {/* Content - Responsive */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          {result.tags?.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-500 transition-colors">
                          {result.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{result.description}</p>
                      </div>
                    </div>

                    {/* Address and Distance - Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <i className="ri-map-pin-line text-pink-500"></i>
                        <span className="truncate">{result.address}</span>
                      </div>
                      {result.distance && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <i className="ri-road-map-line"></i>
                          <span>{result.distance}</span>
                        </div>
                      )}
                    </div>

                    {/* Highlights - Responsive */}
                    {result.highlights && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mb-3 sm:mb-4">
                        {result.highlights.map((highlight: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <i className="ri-check-line text-emerald-500 text-sm"></i>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer - Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        {result.rating && (
                          <div className="flex items-center gap-1.5">
                            <i className="ri-star-fill text-yellow-400 text-base sm:text-lg"></i>
                            <span className="font-semibold text-gray-900 text-sm">{result.rating}</span>
                            <span className="text-gray-500 text-xs sm:text-sm">({result.reviews})</span>
                          </div>
                        )}
                        {result.time && (
                          <div className="flex items-center gap-1.5 text-pink-600">
                            <i className="ri-time-line"></i>
                            <span className="text-xs text-gray-500">{result.time}</span>
                          </div>
                        )}
                        <div className="flex flex-col items-end gap-1">
                          <div className="font-semibold text-pink-600 text-sm sm:text-base">{result.price}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleNearbyDetailClick(result)}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-medium text-xs sm:text-sm whitespace-nowrap"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {popularDestinations.slice(0, 6).map((destination, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => handleDestinationClick(destination)}
              >
                <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDestinationFavorite(destination.name);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
                        favorites.has(`destination-${destination.name}`)
                          ? 'bg-red-500 text-white shadow-lg scale-110'
                          : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                      }`}
                    >
                      <i className={`${favorites.has(`destination-${destination.name}`) ? 'ri-heart-fill' : 'ri-heart-line'} text-xl sm:text-2xl`}></i>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDestinationDetailClick(destination);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 text-gray-700"
                    >
                      <i className="ri-eye-line text-xl sm:text-2xl"></i>
                    </button>
                  </div>
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                      {destination.type}
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{destination.name}</h3>
                  <p className="text-pink-500 font-medium text-sm mb-2">{destination.price}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDestinationDetailClick(destination);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all text-xs whitespace-nowrap"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destination Detail Modal - Responsive */}
      {showDestinationDetailModal && selectedDestinationDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="ri-map-pin-line text-lg sm:text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">{selectedDestinationDetail.name}</h2>
                  <p className="text-white/90 text-xs sm:text-sm">{selectedDestinationDetail.address || selectedDestinationDetail.location}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDestinationDetailModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-lg sm:text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="space-y-6">
                {/* Main Image and Quick Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden">
                      <img
                        src={selectedDestinationDetail.image}
                        alt={selectedDestinationDetail.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {selectedDestinationDetail.rating && (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                            <i className="ri-star-fill text-yellow-400"></i>
                            <span className="font-semibold text-gray-900">{selectedDestinationDetail.rating}</span>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const favoriteId = selectedDestinationDetail.category 
                              ? `${selectedDestinationDetail.category}-${selectedDestinationDetail.name}`
                              : `destination-${selectedDestinationDetail.name}`;
                            toggleFavorite(favoriteId, selectedDestinationDetail, selectedDestinationDetail.category || 'attraction');
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
                            favorites.has(selectedDestinationDetail.category 
                              ? `${selectedDestinationDetail.category}-${selectedDestinationDetail.name}`
                              : `destination-${selectedDestinationDetail.name}`)
                              ? 'bg-red-500 text-white shadow-lg scale-110'
                              : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                          }`}
                        >
                          <i className={`${favorites.has(selectedDestinationDetail.category 
                            ? `${selectedDestinationDetail.category}-${selectedDestinationDetail.name}`
                            : `destination-${selectedDestinationDetail.name}`) ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Price Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">A partir de</p>
                        <p className="text-3xl font-bold text-orange-600 mb-4">{selectedDestinationDetail.price || 'Consulte'}</p>
                        <button
                          onClick={() => {
                            setSelectedPlace(selectedDestinationDetail);
                            setShowTripModal(true);
                            setShowDestinationDetailModal(false);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Adicionar à Viagens
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
                      {selectedDestinationDetail.reviews && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Avaliações</span>
                          <span className="font-semibold text-gray-900">{selectedDestinationDetail.reviews.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedDestinationDetail.distance && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Distância</span>
                          <span className="font-semibold text-emerald-600">{selectedDestinationDetail.distance}</span>
                        </div>
                      )}
                      {selectedDestinationDetail.time && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Tempo de viagem</span>
                          <span className="font-semibold text-pink-600">{selectedDestinationDetail.time}</span>
                        </div>
                      )}
                      {selectedDestinationDetail.type && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Região</span>
                          <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">{selectedDestinationDetail.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre este destino</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {selectedDestinationDetail.description}
                  </p>

                  {/* Tags */}
                  {selectedDestinationDetail.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedDestinationDetail.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                {selectedDestinationDetail.highlights && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Principais atrações</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedDestinationDetail.highlights.map((highlight: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-star-line text-white text-lg"></i>
                          </div>
                          <span className="font-semibold text-gray-900">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Galeria de imagens</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                        <img
                          src={`https://readdy.ai/api/search-image?query=$%7BselectedDestinationDetail.name.toLowerCase%28%29%7D%20beautiful%20scenic%20view%20travel%20destination%20tourism%20attraction&width=300&height=300&seq=gallery-${num}&orientation=squarish`}
                          alt={`${selectedDestinationDetail.name} - Imagem ${num}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <i className="ri-eye-line text-white text-2xl"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews Sample */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Avaliações recentes</h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Ana Costa',
                        rating: 5,
                        date: '2 dias atrás',
                        comment: 'Experiência incrível! Lugar maravilhoso com paisagens de tirar o fôlego. Recomendo para todos que querem uma viagem inesquecível.',
                        avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20young%20woman%20smiling%20confident%20happy%20person&width=80&height=80&seq=review-1&orientation=squarish'
                      },
                      {
                        name: 'Carlos Santos',
                        rating: 5,
                        date: '1 semana atrás',
                        comment: 'Organização perfeita, guias experientes e momentos únicos. Valeu cada centavo investido na viagem!',
                        avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20young%20man%20friendly%20smile%20business%20casual&width=80&height=80&seq=review-2&orientation=squarish'
                      },
                      {
                        name: 'Marina Oliveira',
                        rating: 4,
                        date: '2 semanas atrás',
                        comment: 'Muito bom! Apenas algumas pequenas questões com o transporte, mas no geral uma experiência fantástica.',
                        avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20woman%20cheerful%20smile%20modern%20look&width=80&height=80&seq=review-3&orientation=squarish'
                      }
                    ].map((review, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`ri-star-fill text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex gap-4">
                  <button
                    onClick={() => setShowDestinationDetailModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlace(selectedDestinationDetail);
                      setShowTripModal(true);
                      setShowDestinationDetailModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Adicionar à Viagens
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Destinations Modal - Responsive */}
      {showAllDestinationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="ri-earth-line text-lg sm:text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Todos os Destinos</h2>
                  <p className="text-white/90 text-xs sm:text-sm">Descubra os destinos mais incríveis do mundo</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllDestinationsModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-lg sm:text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {['Todos', 'Europa', 'Ásia', 'América do Norte', 'América do Sul', 'Oriente Médio', 'Oceania'].map((filter) => (
                  <button
                    key={filter}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 rounded-full text-xs sm:text-sm font-medium hover:from-pink-100 hover:to-purple-100 transition-all border border-pink-200"
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Destinations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {popularDestinations.map((destination, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                    onClick={() => {
                      setShowAllDestinationsModal(false);
                      handleDestinationClick(destination);
                    }}
                  >
                    <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDestinationFavorite(destination.name);
                          }}
                          className={`w-6 h-6 sm:w-8 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
                            favorites.has(`destination-${destination.name}`)
                              ? 'bg-red-500 text-white shadow-lg scale-110'
                              : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                          }`}
                        >
                          <i className={`${favorites.has(`destination-${destination.name}`) ? 'ri-heart-fill' : 'ri-heart-line'} text-sm sm:text-base`}></i>
                        </button>
                      </div>
                      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
                        <span className="px-1.5 sm:px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                          {destination.type}
                        </span>
                      </div>
                      {/* Rating Badge */}
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full">
                          <i className="ri-star-fill text-yellow-400 text-xs"></i>
                          <span className="text-xs font-semibold text-gray-900">{destination.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2 sm:p-3">
                      <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm line-clamp-1">{destination.name}</h3>
                      <p className="text-pink-500 font-medium text-xs mb-1">{destination.price}</p>
                      <div className="flex items-center gap-1 text-gray-500">
                        <i className="ri-chat-3-line text-xs"></i>
                        <span className="text-xs">{destination.reviews.toLocaleString()} avaliações</span>
                      </div>
                      
                      {/* Quick highlights */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {destination.highlights.slice(0, 2).map((highlight, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Travel Tips - Responsive */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-lg sm:text-2xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Dica de viagem</h3>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Reserve seus voos e hotéis com antecedência para garantir os melhores preços. 
              A melhor época para viajar é durante a baixa temporada, quando os destinos estão menos lotados e mais acessíveis.
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection Modal - Responsive */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header - Responsive */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="ri-map-pin-line text-lg sm:text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">O que você procura?</h2>
                  <p className="text-white/90 text-xs sm:text-sm">Selecione uma categoria para encontrar os melhores lugares próximos</p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-lg sm:text-2xl"></i>
              </button>
            </div>

            {/* Modal Content - Responsive */}
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {nearbyCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 border-gray-200 hover-24h flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <i className="ri-arrow-right-line text-lg sm:text-xl text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"></i>
                    <span className="text-gray-700 group-hover:text-orange-600 transition-colors">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Modal - Responsive */}
      {showTripModal && selectedPlace && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setShowTripModal(false)}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Adicionar à Viagens</h2>
              <button
                onClick={() => setShowTripModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <i className="ri-close-line text-lg sm:text-2xl"></i>
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{selectedPlace.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedPlace.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <button 
                onClick={handleCreateNewTrip}
                className="w-full p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <i className="ri-add-line text-lg sm:text-xl"></i>
                Criar Nova Viagens
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-3 sm:px-4 bg-white text-gray-500">ou adicionar a uma existente</span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                <button 
                  onClick={() => handleAddToExistingTrip('Paris, França', '15 - 22 Dez 2024')}
                  className="w-full p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-500 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors">Paris, França</h4>
                      <p className="text-xs sm:text-sm text-gray-600">15 - 22 Dez 2024</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Lazer</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">2 pessoas</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <i className="ri-arrow-right-line text-lg sm:text-xl text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"></i>
                      <span className="text-xs text-gray-500">3 locais</span>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleAddToExistingTrip('Tóquio, Japão', '10 - 20 Jan 2025')}
                  className="w-full p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-500 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors">Tóquio, Japão</h4>
                      <p className="text-xs sm:text-sm text-gray-600">10 - 20 Jan 2025</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">Cultural</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">2 pessoas</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <i className="ri-arrow-right-line text-lg sm:text-xl text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"></i>
                      <span className="text-xs text-gray-500">1 local</span>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleAddToExistingTrip('Dubai, EAU', '05 - 12 Mar 2025')}
                  className="w-full p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-500 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors">Dubai, EAU</h4>
                      <p className="text-xs sm:text-sm text-gray-600">05 - 12 Mar 2025</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium">Luxo</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">4 pessoas</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <i className="ri-arrow-right-line text-lg sm:text-xl text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"></i>
                      <span className="text-xs text-gray-500">5 locais</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowTripModal(false)}
              className="w-full px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Create New Trip Modal - Responsive */}
      {showCreateTripModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="ri-map-2-line text-lg sm:text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Criar Nova Viagens</h2>
                  <p className="text-white/90 text-xs sm:text-sm">Planeje sua próxima aventura</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTripModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-lg sm:text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="space-y-4 sm:space-y-6">
                
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Viagens *
                  </label>
                  <input
                    type="text"
                    value={tripForm.name}
                    onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                    placeholder="Ex: Férias em Paris 2025"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destino *
                  </label>
                  <div className="relative">
                    <i className="ri-map-pin-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      value={tripForm.destination}
                      onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                      placeholder="Para onde você quer ir?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                    />
                  </div>
                </div>

                {/* Travelers */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Número de Viajantes
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTripForm({ ...tripForm, travelers: Math.max(1, tripForm.travelers - 1) })}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      <i className="ri-subtract-line text-lg"></i>
                    </button>
                    <span className="text-xl font-semibold text-gray-900 w-12 text-center">{tripForm.travelers}</span>
                    <button
                      onClick={() => setTripForm({ ...tripForm, travelers: tripForm.travelers + 1 })}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      <i className="ri-add-line text-lg"></i>
                    </button>
                  </div>
                </div>

                {/* Trip Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de Viagens
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tripTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setTripForm({ ...tripForm, tripType: type.id })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                          tripForm.tripType === type.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <i className={`${type.icon} text-2xl ${type.color} mb-2 block`}></i>
                        <h4 className="font-semibold text-gray-900 text-sm">{type.name}</h4>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Orçamento Aproximado
                  </label>
                  <div className="space-y-3">
                    {budgetOptions.map((budget) => (
                      <button
                        key={budget.id}
                        onClick={() => setTripForm({ ...tripForm, budget: budget.id })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          tripForm.budget === budget.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold ${budget.color} text-sm`}>{budget.name}</h4>
                            <p className="text-gray-600 text-xs">{budget.range}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            tripForm.budget === budget.id 
                              ? 'border-orange-500 bg-orange-500' 
                              : 'border-gray-300'
                          }`}>
                            {tripForm.budget === budget.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    value={tripForm.description}
                    onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                    placeholder="Conte-nos mais sobre seus planos para esta viagem..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateTripModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTrip}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Criar Viagens
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
