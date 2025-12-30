import React from 'react';

interface SearchResultsListProps {
    isAiLoading: boolean;
    selectedCategory: string | null;
    nearbyResults: any[];
    onAddToTrip: (place: any) => void;
    onViewDetails: (place: any) => void;
    onToggleFavorite: (placeId: string, item: any, category: string) => void;
    favorites: Set<string>;
    handleLoadMore: () => void;
    isLoadingMore: boolean;
}

export const SearchResultsList = ({
    isAiLoading,
    selectedCategory,
    nearbyResults,
    onAddToTrip,
    onViewDetails,
    onToggleFavorite,
    favorites,
    handleLoadMore,
    isLoadingMore
}: SearchResultsListProps) => {

    if (isAiLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-white rounded-3xl p-8">
                <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-compass-3-line text-2xl sm:text-3xl text-purple-600"></i>
                    </div>
                </div>
                <div className="text-center max-w-md px-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Buscando destinos...</h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Encontrando os melhores lugares para você.
                    </p>
                </div>
            </div>
        );
    }

    if (nearbyResults.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 p-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <i className="ri-file-search-line text-3xl sm:text-5xl text-gray-400"></i>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Nenhum local encontrado</h3>
                <p className="max-w-md mx-auto mb-6 text-sm sm:text-base">
                    Nenhum local encontrado para esta busca. <br />
                    Tente outra categoria ou verifique sua conexão.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedCategory || 'Resultados da Busca'}
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                    {nearbyResults.length} locais encontrados
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {nearbyResults.map((result, index) => {
                    const favoriteId = result.id || (selectedCategory ? `${selectedCategory}-${result.name}` : `result-${result.name}`);
                    const isFavorite = favorites.has(favoriteId);

                    return (
                        <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(favoriteId, result, selectedCategory || 'general');
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${isFavorite
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'bg-white/90 text-gray-400 hover:bg-white hover:text-red-500'
                                        }`}
                                >
                                    <i className={`${isFavorite ? 'ri-heart-fill' : 'ri-heart-line'} text-lg`}></i>
                                </button>
                            </div>
                            <div className="p-4 sm:p-6 cursor-pointer" onClick={() => onViewDetails(result)}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">
                                            {result.name}
                                        </h3>
                                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                                            <i className="ri-map-pin-line mr-1 text-purple-500"></i>
                                            {result.address ? result.address.split(',')[0] : 'Localização verificada'}
                                            <span className="mx-2">•</span>
                                            <span className="text-purple-600 font-medium">{result.distance}</span>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wide whitespace-nowrap ml-2">
                                        {result.tags && result.tags[0]}
                                    </div>
                                </div>



                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    {result.tags?.slice(1).map((tag: string, i: number) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToTrip(result);
                                    }}
                                    className="w-full py-3 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-gray-100 hover:border-purple-200"
                                >
                                    <i className="ri-add-circle-line text-lg"></i>
                                    Adicionar ao Roteiro
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-8 pb-12">
                <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 sm:px-8 py-3 bg-white border-2 border-purple-100 text-purple-600 rounded-full font-bold hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center gap-2 shadow-sm"
                >
                    {isLoadingMore ? (
                        <>
                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            Explorando mais...
                        </>
                    ) : (
                        <>
                            <i className="ri-compass-3-line"></i>
                            Carregar Mais Destinos
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
