import React from 'react';

interface DestinationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    destination: any;
    onAddToTrip: (place: any) => void;
    onToggleFavorite: (placeId: string, item: any, category: string) => void;
    favorites: Set<string>;
}

export const DestinationDetailModal = ({
    isOpen,
    onClose,
    destination,
    onAddToTrip,
    onToggleFavorite,
    favorites
}: DestinationDetailModalProps) => {
    if (!isOpen || !destination) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-2xl md:max-w-4xl max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <i className="ri-map-pin-line text-lg sm:text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-bold">{destination.name}</h2>
                            <p className="text-white/90 text-xs sm:text-sm">{destination.address || destination.location}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
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
                                        src={destination.image}
                                        alt={destination.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {destination.rating && (
                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                                                <i className="ri-star-fill text-yellow-400"></i>
                                                <span className="font-semibold text-gray-900">{destination.rating}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                const favoriteId = destination.category
                                                    ? `${destination.category}-${destination.name}`
                                                    : `destination-${destination.name}`;
                                                onToggleFavorite(favoriteId, destination, destination.category || 'attraction');
                                            }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${favorites.has(destination.category
                                                ? `${destination.category}-${destination.name}`
                                                : `destination-${destination.name}`)
                                                ? 'bg-red-500 text-white shadow-lg scale-110'
                                                : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                                                }`}
                                        >
                                            <i className={`${favorites.has(destination.category
                                                ? `${destination.category}-${destination.name}`
                                                : `destination-${destination.name}`) ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Price Card */}
                                <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-200">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">A partir de</p>
                                        <p className="text-3xl font-bold text-orange-600 mb-4">{destination.price || 'Consulte'}</p>
                                        <button
                                            onClick={() => {
                                                onAddToTrip(destination);
                                                onClose();
                                            }}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                        >
                                            Adicionar à Viagens
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
                                    {destination.reviews && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Avaliações</span>
                                            <span className="font-semibold text-gray-900">{destination.reviews.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {destination.distance && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Distância</span>
                                            <span className="font-semibold text-emerald-600">{destination.distance}</span>
                                        </div>
                                    )}
                                    {destination.time && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Tempo de viagem</span>
                                            <span className="font-semibold text-pink-600">{destination.time}</span>
                                        </div>
                                    )}
                                    {destination.type && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Região</span>
                                            <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">{destination.type}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre este destino</h3>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                {destination.description}
                            </p>

                            {/* Tags */}
                            {destination.tags && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {destination.tags.map((tag: string, index: number) => (
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
                        {destination.highlights && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Principais atrações</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {destination.highlights.map((highlight: string, index: number) => (
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
                                            src={`https://readdy.ai/api/search-image?query=${encodeURIComponent(destination.name)}%20travel%20scenic&width=300&height=300&seq=gallery-${num}`}
                                            alt={`${destination.name} - Imagem ${num}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = `https://images.unsplash.com/photo-${num === 1 ? '1507525428034-b723cf961d3e' : '1500832304604-997c50271289'}?q=80&w=300&auto=format&fit=crop`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <i className="ri-eye-line text-white text-2xl"></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews Sample - Simplified for now or passed as prop later? Keeping logic here for parity */}
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
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop`;
                                            }}
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
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => {
                                    onAddToTrip(destination);
                                    onClose();
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
    );
};
