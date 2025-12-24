import { useState, useEffect } from 'react';

interface FavoriteItem {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  distance: string;
  category: string;
  description: string;
  highlights: string[];
}

export default function FavoritesTab() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Recuperar favoritos do localStorage
    const savedFavorites = localStorage.getItem('travel-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(item => item.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('travel-favorites', JSON.stringify(updatedFavorites));
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: 'ri-apps-line' },
    { id: 'hotel', label: 'Hotéis', icon: 'ri-hotel-line' },
    { id: 'restaurant', label: 'Restaurantes', icon: 'ri-restaurant-line' },
    { id: 'attraction', label: 'Atrações', icon: 'ri-map-pin-line' },
    { id: 'activity', label: 'Atividades', icon: 'ri-gamepad-line' },
  ];

  const filteredFavorites = selectedCategory === 'all' 
    ? favorites 
    : favorites.filter(item => item.category === selectedCategory);

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-heart-line text-3xl text-orange-500"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Nenhum favorito ainda</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comece a explorar e adicione seus locais favoritos para encontrá-los facilmente aqui.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium">
            <i className="ri-search-line mr-2"></i>
            Explorar Destinos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Favoritos</h2>
            <p className="text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'local salvo' : 'locais salvos'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-orange-500 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-grid-line text-lg"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-orange-500 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-list-check text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`${category.icon} text-sm`}></i>
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }>
        {filteredFavorites.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {/* Image */}
            <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Remove from Favorites */}
              <button
                onClick={() => removeFavorite(item.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <i className="ri-heart-fill text-sm"></i>
              </button>
              
              {/* Category Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg">
                  {item.category === 'hotel' && 'Hotel'}
                  {item.category === 'restaurant' && 'Restaurante'}
                  {item.category === 'attraction' && 'Atração'}
                  {item.category === 'activity' && 'Atividade'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-sm lg:text-base group-hover:text-orange-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-1 mb-2">
                <i className="ri-map-pin-line text-gray-400 text-sm"></i>
                <span className="text-gray-600 text-sm">{item.location}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    <span className="font-medium text-gray-900 text-sm">{item.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({item.reviews})</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600 text-sm lg:text-base">{item.price}</div>
                  {item.distance && (
                    <div className="text-gray-500 text-xs">{item.distance}</div>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.highlights.slice(0, 2).map((highlight, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
                  Ver Detalhes
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all">
                  <i className="ri-share-line"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredFavorites.length === 0 && selectedCategory !== 'all' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-600">
            Não há favoritos na categoria selecionada. Experimente outro filtro.
          </p>
        </div>
      )}
    </div>
  );
}