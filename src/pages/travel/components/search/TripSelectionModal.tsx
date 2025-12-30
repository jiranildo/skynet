import React from 'react';


interface TripSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPlace: any;
    onShowCreateTrip: () => void;
    // This could be enhanced to accept existing trips as props for rendering
}

export const TripSelectionModal = ({
    isOpen,
    onClose,
    selectedPlace,
    onShowCreateTrip
}: TripSelectionModalProps) => {
    if (!isOpen || !selectedPlace) return null;

    const handleAddToExistingTrip = (tripName: string) => {
        // In a real app, this would dispatch an action
        console.log(`Adding ${selectedPlace.name} to ${tripName}`);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Adicionar à Viagens</h2>
                    <button
                        onClick={onClose}
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
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1000&auto=format&fit=crop';
                                }}
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
                        onClick={onShowCreateTrip}
                        className="w-full p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <i className="ri-add-line text-lg sm:text-xl"></i>
                        Criar Nova Viagem
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
                        {/* Mock Existing Trips */}
                        <button
                            onClick={() => handleAddToExistingTrip('Paris, França')}
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
                        {/* ... other mock trips can be added here or passed as props */}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};
