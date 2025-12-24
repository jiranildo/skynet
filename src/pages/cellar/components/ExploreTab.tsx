import { useState } from 'react';

export default function ExploreTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: 'ri-grid-line' },
    { id: 'red', name: 'Tintos', icon: 'ri-wine-glass-line' },
    { id: 'white', name: 'Brancos', icon: 'ri-goblet-line' },
    { id: 'sparkling', name: 'Espumantes', icon: 'ri-champagne-line' },
    { id: 'premium', name: 'Premium', icon: 'ri-vip-crown-line' }
  ];

  const wines = [
    {
      id: 1,
      name: 'Château Lafite Rothschild',
      winery: 'Domaines Barons de Rothschild',
      type: 'Tinto',
      vintage: 2016,
      region: 'Pauillac, Bordeaux',
      country: 'França',
      rating: 4.9,
      reviews: 2847,
      price: '€750',
      image: 'premium french bordeaux wine bottle chateau lafite rothschild elegant classic label pauillac vineyard background sunset sophisticated luxury'
    },
    {
      id: 2,
      name: 'Screaming Eagle Cabernet',
      winery: 'Screaming Eagle Winery',
      type: 'Tinto',
      vintage: 2018,
      region: 'Napa Valley',
      country: 'EUA',
      rating: 4.9,
      reviews: 1523,
      price: '€3,200',
      image: 'premium california napa valley cabernet sauvignon wine bottle screaming eagle luxury elegant label vineyard sunset sophisticated exclusive'
    },
    {
      id: 3,
      name: 'Romanée-Conti Grand Cru',
      winery: 'Domaine de la Romanée-Conti',
      type: 'Tinto',
      vintage: 2015,
      region: 'Borgonha',
      country: 'França',
      rating: 5.0,
      reviews: 3241,
      price: '€18,000',
      image: 'premium burgundy pinot noir wine bottle romanee conti grand cru elegant classic label burgundy vineyard background sophisticated legendary'
    },
    {
      id: 4,
      name: 'Cristal Brut',
      winery: 'Louis Roederer',
      type: 'Espumante',
      vintage: 2013,
      region: 'Champagne',
      country: 'França',
      rating: 4.8,
      reviews: 1876,
      price: '€280',
      image: 'premium champagne bottle cristal louis roederer elegant clear bottle golden label champagne region vineyard luxury celebration sophisticated'
    },
    {
      id: 5,
      name: 'Masseto',
      winery: 'Tenuta dell\'Ornellaia',
      type: 'Tinto',
      vintage: 2017,
      region: 'Toscana',
      country: 'Itália',
      rating: 4.9,
      reviews: 1654,
      price: '€850',
      image: 'premium italian super tuscan merlot wine bottle masseto elegant modern label bolgheri vineyard background mediterranean sophisticated'
    },
    {
      id: 6,
      name: 'Montrachet Grand Cru',
      winery: 'Domaine Leflaive',
      type: 'Branco',
      vintage: 2018,
      region: 'Borgonha',
      country: 'França',
      rating: 4.9,
      reviews: 987,
      price: '€1,200',
      image: 'premium burgundy white wine bottle montrachet grand cru chardonnay elegant classic label burgundy vineyard background sophisticated mineral'
    },
    {
      id: 7,
      name: 'Pingus',
      winery: 'Dominio de Pingus',
      type: 'Tinto',
      vintage: 2016,
      region: 'Ribera del Duero',
      country: 'Espanha',
      rating: 4.9,
      reviews: 1432,
      price: '€950',
      image: 'premium spanish red wine bottle pingus tempranillo elegant modern label ribera del duero vineyard background warm sophisticated'
    },
    {
      id: 8,
      name: 'Krug Grande Cuvée',
      winery: 'Krug',
      type: 'Espumante',
      vintage: 2008,
      region: 'Champagne',
      country: 'França',
      rating: 4.8,
      reviews: 2156,
      price: '€220',
      image: 'premium champagne bottle krug grande cuvee elegant classic label golden foil champagne region vineyard luxury sophisticated'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar vinhos, produtores, regiões..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
            />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
            <i className="ri-search-line mr-2"></i>
            Buscar
          </button>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={cat.icon}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <i className="ri-vip-crown-line text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Vinhos Premium</h2>
            <p className="text-white/80">Descubra os melhores vinhos do mundo</p>
          </div>
        </div>
        <p className="text-white/90 mb-4">
          Explore nossa seleção exclusiva de vinhos raros e premiados de produtores renomados ao redor do mundo.
        </p>
        <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
          <i className="ri-arrow-right-line mr-2"></i>
          Ver Coleção Premium
        </button>
      </div>

      {/* Wines Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Vinhos em Destaque</h3>
          <button className="text-purple-600 font-semibold hover:text-purple-700 whitespace-nowrap">
            Ver todos <i className="ri-arrow-right-line ml-1"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wines.map(wine => (
            <div
              key={wine.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={`https://readdy.ai/api/search-image?query=$%7Bwine.image%7D&width=300&height=400&seq=explore-wine-${wine.id}&orientation=portrait`}
                  alt={wine.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    <span className="text-sm font-bold text-gray-900">{wine.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{wine.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{wine.winery}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    {wine.type}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{wine.vintage}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <i className="ri-map-pin-line"></i>
                    {wine.region}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">{wine.price}</span>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all whitespace-nowrap">
                    <i className="ri-add-line mr-1"></i>
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regions Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Explorar por Região</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Bordeaux', country: 'França', image: 'bordeaux france vineyard landscape rolling hills chateau elegant sunset wine region beautiful' },
            { name: 'Toscana', country: 'Itália', image: 'tuscany italy vineyard landscape cypress trees rolling hills mediterranean sunset wine region beautiful' },
            { name: 'Napa Valley', country: 'EUA', image: 'napa valley california vineyard landscape mountains sunset wine region beautiful american' },
            { name: 'Douro', country: 'Portugal', image: 'douro valley portugal vineyard landscape terraced hills river sunset wine region beautiful' }
          ].map((region, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden h-48 cursor-pointer group"
            >
              <img
                src={`https://readdy.ai/api/search-image?query=$%7Bregion.image%7D&width=300&height=192&seq=region-${index}&orientation=landscape`}
                alt={region.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-bold text-lg">{region.name}</h4>
                <p className="text-sm text-white/80">{region.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
