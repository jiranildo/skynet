import React, { useState, useEffect } from 'react';
import CreateTripModal from './CreateTripModal';
import { useSmartTravelAgent } from '../hooks/useSmartTravelAgent';
import { SearchResultsList } from './search/SearchResultsList';
import { SearchHeader } from './search/SearchHeader';
import { QuickActions } from './search/QuickActions';
import { CategoryGrid } from './search/CategoryGrid';
import { DestinationDetailModal } from './search/DestinationDetailModal';
import { TripSelectionModal } from './search/TripSelectionModal';

export default function SearchTab() {
  // Smart Travel Agent Hook
  const { userLocation, detectUserLocation, searchState, setSearchState, search } = useSmartTravelAgent();

  // Destructure search state for easier usage
  const { results, isLoading, hasSearched, isLoadingMore, showModal } = searchState;

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [showDestinationDetailModal, setShowDestinationDetailModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [selectedDestinationDetail, setSelectedDestinationDetail] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Effects
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  // Handlers
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSelectedCategory('Resultados da Busca');
      search('Resultados da Busca', searchQuery);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Locais Próximos') {
      setShowCategoryModal(true);
    } else {
      setSelectedCategory(action);
      search(action);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    search(category);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleAddToTrip = (place: any) => {
    setSelectedPlace(place);
    setShowTripModal(true);
  };

  const handleViewDetails = (place: any) => {
    setSelectedDestinationDetail(place);
    setShowDestinationDetailModal(true);
  };

  const handleLoadMore = () => {
    search(selectedCategory || 'Geral', searchQuery, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header & Search */}
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Quick Actions Carousel */}
        <QuickActions onAction={handleQuickAction} />



        {/* Main Content Area */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 min-h-[400px]">
          {hasSearched || isLoading ? (
            <SearchResultsList
              isAiLoading={isLoading}
              selectedCategory={selectedCategory}
              nearbyResults={results}
              onAddToTrip={handleAddToTrip}
              onViewDetails={handleViewDetails}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
              handleLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
            />
          ) : (
            /* Initial State */
            <div className="text-center py-10 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <i className="ri-sparkling-2-line text-3xl sm:text-5xl text-purple-600 animate-pulse"></i>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Descubra lugares incríveis</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm sm:text-base">
                Selecione um ícone acima, use a busca ou clique em <button onClick={() => setShowCategoryModal(true)} className="text-orange-500 font-semibold hover:underline">ver categorias</button> para encontrar destinos reais ao seu redor.
              </p>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-6 py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm"
              >
                Explorar Categorias
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      <CategoryGrid
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={handleCategorySelect}
      />



      <DestinationDetailModal
        isOpen={showDestinationDetailModal}
        onClose={() => setShowDestinationDetailModal(false)}
        destination={selectedDestinationDetail}
        onAddToTrip={handleAddToTrip}
        onToggleFavorite={toggleFavorite}
        favorites={favorites}
      />

      <TripSelectionModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        selectedPlace={selectedPlace}
        onShowCreateTrip={() => {
          setShowTripModal(false);
          setShowCreateTripModal(true);
        }}
      />

      <CreateTripModal
        isOpen={showCreateTripModal}
        onClose={() => setShowCreateTripModal(false)}
      />

    </div>
  );
}
