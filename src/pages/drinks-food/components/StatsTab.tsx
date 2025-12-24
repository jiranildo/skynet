export default function StatsTab() {
  const stats = {
    totalRestaurants: 47,
    totalWines: 89,
    totalDishes: 156,
    totalDrinks: 73,
    michelinStars: 12,
    countries: 18,
  };

  const cuisineDistribution = [
    { name: 'Italiana', count: 15, color: 'from-green-400 to-green-600' },
    { name: 'Francesa', count: 12, color: 'from-blue-400 to-blue-600' },
    { name: 'Japonesa', count: 10, color: 'from-red-400 to-red-600' },
    { name: 'Espanhola', count: 8, color: 'from-yellow-400 to-yellow-600' },
    { name: 'Outras', count: 20, color: 'from-purple-400 to-purple-600' },
  ];

  const wineTypes = [
    { name: 'Tinto', count: 45, color: 'from-red-500 to-red-700' },
    { name: 'Branco', count: 25, color: 'from-yellow-300 to-yellow-500' },
    { name: 'Espumante', count: 12, color: 'from-pink-300 to-pink-500' },
    { name: 'Rosé', count: 7, color: 'from-rose-300 to-rose-500' },
  ];

  const topCountries = [
    { name: 'Itália', flag: '🇮🇹', experiences: 28 },
    { name: 'França', flag: '🇫🇷', experiences: 24 },
    { name: 'Espanha', flag: '🇪🇸', experiences: 18 },
    { name: 'Japão', flag: '🇯🇵', experiences: 15 },
    { name: 'EUA', flag: '🇺🇸', experiences: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-restaurant-2-line text-white text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalRestaurants}</p>
          <p className="text-xs text-gray-600">Restaurantes</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-goblet-line text-white text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalWines}</p>
          <p className="text-xs text-gray-600">Vinhos</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-restaurant-line text-white text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalDishes}</p>
          <p className="text-xs text-gray-600">Pratos</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-cup-line text-white text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalDrinks}</p>
          <p className="text-xs text-gray-600">Drinks</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-star-line text-white text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.michelinStars}</p>
          <p className="text-xs text-gray-600">Estrelas Michelin</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-earth-line text-white text-xl"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.countries}</p>
          <p className="text-xs text-gray-600">Países</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cuisine Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Distribuição por Culinária</h3>
          <div className="space-y-4">
            {cuisineDistribution.map((cuisine) => (
              <div key={cuisine.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{cuisine.name}</span>
                  <span className="text-sm font-bold text-gray-900">{cuisine.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${cuisine.color}`}
                    style={{ width: `${(cuisine.count / 65) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wine Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Tipos de Vinho</h3>
          <div className="space-y-4">
            {wineTypes.map((wine) => (
              <div key={wine.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{wine.name}</span>
                  <span className="text-sm font-bold text-gray-900">{wine.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${wine.color}`}
                    style={{ width: `${(wine.count / 89) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Top Países Explorados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topCountries.map((country, index) => (
            <div
              key={country.name}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl"
            >
              <div className="text-4xl mb-2">{country.flag}</div>
              <p className="font-bold text-gray-900 mb-1">{country.name}</p>
              <p className="text-2xl font-bold text-orange-500">{country.experiences}</p>
              <p className="text-xs text-gray-600">experiências</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Atividade Mensal</h3>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = Math.random() * 100 + 20;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '120px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-lg"
                    style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
