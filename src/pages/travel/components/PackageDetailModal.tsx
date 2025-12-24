import { useState } from 'react';

interface PackageDetailModalProps {
  package: {
    id: number;
    destination: string;
    country: string;
    days: number;
    nights: number;
    price: number;
    originalPrice: number;
    image: string;
    rating: number;
    reviews: number;
    includes: string[];
    highlights: string[];
    itinerary: {
      day: number;
      title: string;
      description: string;
      activities: string[];
    }[];
    hotels: {
      name: string;
      stars: number;
      nights: number;
    }[];
    flights: {
      departure: string;
      arrival: string;
      airline: string;
    };
  };
  onClose: () => void;
}

export default function PackageDetailModal({ package: pkg, onClose }: PackageDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'includes'>('overview');
  const [travelers, setTravelers] = useState(2);
  const [selectedDate, setSelectedDate] = useState('');

  const handleBooking = () => {
    alert(`Reserva iniciada para ${pkg.destination}!\n${travelers} viajante(s)\nData: ${selectedDate || 'A definir'}\nTotal: R$ ${(pkg.price * travelers).toLocaleString('pt-BR')}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
        {/* Header com Imagem */}
        <div className="relative h-80 rounded-t-2xl overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <i className="ri-close-line text-xl text-gray-800"></i>
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% OFF
              </span>
              <span className="px-3 py-1 bg-white/90 text-gray-800 text-xs font-semibold rounded-full">
                {pkg.days} dias / {pkg.nights} noites
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {pkg.destination}
            </h2>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <i className="ri-map-pin-line"></i>
                <span className="text-sm">{pkg.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="ri-star-fill text-yellow-400"></i>
                <span className="text-sm font-semibold">{pkg.rating}</span>
                <span className="text-sm">({pkg.reviews} avaliações)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'itinerary'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Roteiro
            </button>
            <button
              onClick={() => setActiveTab('includes')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'includes'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              O que está incluído
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Destaques */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-star-line text-orange-500"></i>
                    Destaques do Pacote
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pkg.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <i className="ri-checkbox-circle-fill text-orange-500 text-xl mt-0.5"></i>
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotéis */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-hotel-line text-orange-500"></i>
                    Hospedagens
                  </h3>
                  <div className="space-y-3">
                    {pkg.hotels.map((hotel, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(hotel.stars)].map((_, i) => (
                              <i key={i} className="ri-star-fill text-yellow-400 text-sm"></i>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{hotel.nights} noites</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voos */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-flight-takeoff-line text-orange-500"></i>
                    Passagens Aéreas
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{pkg.flights.departure}</span>
                      <i className="ri-arrow-right-line text-gray-400"></i>
                      <span className="font-semibold text-gray-900">{pkg.flights.arrival}</span>
                    </div>
                    <p className="text-sm text-gray-600">Companhia: {pkg.flights.airline}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {pkg.itinerary.map((day) => (
                  <div key={day.day} className="border-l-4 border-orange-500 pl-6 pb-6 relative">
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {day.day}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Dia {day.day}: {day.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{day.description}</p>
                    <div className="space-y-2">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <i className="ri-time-line text-orange-500 text-sm mt-1"></i>
                          <span className="text-sm text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'includes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.includes.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <i className="ri-checkbox-circle-fill text-green-500 text-xl mt-0.5"></i>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Número de Viajantes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Viajantes
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
                  >
                    <i className="ri-subtract-line text-gray-700"></i>
                  </button>
                  <span className="text-lg font-semibold text-gray-900 w-12 text-center">
                    {travelers}
                  </span>
                  <button
                    onClick={() => setTravelers(travelers + 1)}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
                  >
                    <i className="ri-add-line text-gray-700"></i>
                  </button>
                </div>
              </div>

              {/* Data de Partida */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Partida
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Preço e Botão */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {(pkg.price * travelers).toLocaleString('pt-BR')}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    R$ {(pkg.originalPrice * travelers).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  R$ {pkg.price.toLocaleString('pt-BR')} por pessoa • {travelers} viajante(s)
                </p>
              </div>
              <button
                onClick={handleBooking}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
              >
                <i className="ri-shopping-cart-line mr-2"></i>
                Reservar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
