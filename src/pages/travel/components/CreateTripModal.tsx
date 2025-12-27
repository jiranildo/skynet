import { useState } from 'react';

interface CreateTripModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTripModal({ isOpen, onClose }: CreateTripModalProps) {
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
        onClose();

        // Show success message
        alert('Viagem criada com sucesso! 🎉');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <i className="ri-map-2-line text-lg sm:text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-bold">Criar Nova Viagem</h2>
                            <p className="text-white/90 text-xs sm:text-sm">Planeje sua próxima aventura</p>
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
                    <div className="space-y-4 sm:space-y-6">

                        {/* Trip Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome da Viagem *
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

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Data de Ida *
                                </label>
                                <input
                                    type="date"
                                    value={tripForm.startDate}
                                    onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Data de Volta *
                                </label>
                                <input
                                    type="date"
                                    value={tripForm.endDate}
                                    onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
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
                                Tipo de Viagem
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {tripTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setTripForm({ ...tripForm, tripType: type.id })}
                                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${tripForm.tripType === type.id
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
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${tripForm.budget === budget.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className={`font-semibold ${budget.color} text-sm`}>{budget.name}</h4>
                                                <p className="text-gray-600 text-xs">{budget.range}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 ${tripForm.budget === budget.id
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
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateTrip}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Criar Viagem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
