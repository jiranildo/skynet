import { useState } from 'react';

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: number;
    title: string;
    location: string;
    date: string;
    image: string;
  };
}

export default function TripDetailModal({ isOpen, onClose, trip }: TripDetailModalProps) {
  const [activeDay, setActiveDay] = useState(3);

  if (!isOpen) return null;

  const itinerary = [
    {
      id: 1,
      name: 'São Roque',
      type: 'location',
      color: 'red'
    },
    {
      id: 2,
      name: 'City Tour',
      type: 'location',
      color: 'red'
    },
    {
      id: 3,
      name: 'Parques Temáticos',
      type: 'location',
      color: 'red'
    }
  ];

  const days = [
    { day: 1, items: 0 },
    { day: 2, items: 0 },
    { day: 3, items: 0 }
  ];

  const memories = [
    {
      id: 1,
      image: 'https://readdy.ai/api/search-image?query=beautiful%20travel%20memory%20moment%20happy%20people%20enjoying%20vacation%20scenic%20destination&width=400&height=300&seq=memory-1&orientation=landscape',
      likes: 234,
      comments: 45
    },
    {
      id: 2,
      image: 'https://readdy.ai/api/search-image?query=amazing%20travel%20experience%20adventure%20outdoor%20activity%20beautiful%20landscape&width=400&height=300&seq=memory-2&orientation=landscape',
      likes: 189,
      comments: 32
    },
    {
      id: 3,
      image: 'https://readdy.ai/api/search-image?query=delicious%20local%20food%20cuisine%20restaurant%20dining%20experience%20travel%20gastronomy&width=400&height=300&seq=memory-3&orientation=landscape',
      likes: 156,
      comments: 28
    },
    {
      id: 4,
      image: 'https://readdy.ai/api/search-image?query=stunning%20sunset%20view%20travel%20destination%20romantic%20moment%20beautiful%20scenery&width=400&height=300&seq=memory-4&orientation=landscape',
      likes: 298,
      comments: 56
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <i className="ri-map-pin-line text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{trip.location}</h2>
              <p className="text-white/90 text-sm">{trip.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Map Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-map-2-line text-purple-500"></i>
                Roteiro Completo
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap">
                Ver mapa maior
              </button>
            </div>

            {/* Map with Route */}
            <div className="relative w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl overflow-hidden border-2 border-gray-200">
              <img
                src="https://readdy.ai/api/search-image?query=map%20route%20travel%20itinerary%20path%20navigation%20points%20locations%20markers%20clean%20design&width=600&height=400&seq=trip-map-route&orientation=landscape"
                alt="Mapa do roteiro"
                className="w-full h-full object-cover"
              />
              
              {/* Route Legend */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">3 Lugares</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-blue-500"></div>
                    <span className="text-xs font-medium text-gray-700">Rota</span>
                  </div>
                </div>
              </div>

              {/* Itinerary List Overlay */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="ri-route-line text-blue-500"></i>
                  Roteiro Completo
                </h4>
                <div className="space-y-2">
                  {itinerary.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Jornada</span>
                <span className="text-sm font-bold text-purple-600">0% completo</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full" 
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-calendar-line text-purple-500"></i>
              Timeline
            </h3>

            {/* Days Carousel */}
            <div className="flex items-center gap-3 mb-6">
              <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <i className="ri-arrow-left-s-line text-xl text-gray-700"></i>
              </button>

              <div className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide">
                {days.map((dayItem) => (
                  <button
                    key={dayItem.day}
                    onClick={() => setActiveDay(dayItem.day)}
                    className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 transition-all ${
                      activeDay === dayItem.day
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">{dayItem.day}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Dia {dayItem.day}</h4>
                    <p className="text-xs text-gray-500">{dayItem.items} itens</p>
                  </button>
                ))}

                {/* Post-Trip Card */}
                <div className="flex-shrink-0 w-48 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="ri-heart-line text-3xl"></i>
                  </div>
                  <h4 className="font-bold text-center mb-1">Post-Trip</h4>
                  <p className="text-center text-sm opacity-90">Memórias</p>
                  <p className="text-center text-xs mt-2 font-semibold">4 itens</p>
                </div>
              </div>

              <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <i className="ri-arrow-right-s-line text-xl text-gray-700"></i>
              </button>
            </div>

            {/* Day Content */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <i className="ri-calendar-line text-3xl text-gray-400"></i>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Dia {activeDay}</h4>
              <p className="text-sm text-gray-600">Nenhuma atividade planejada ainda</p>
            </div>
          </div>

          {/* Memories Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-heart-line text-pink-500"></i>
                Memórias da Viagens
              </h3>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700 whitespace-nowrap">
                Compartilhe suas experiências
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {memories.map((memory) => (
                <div key={memory.id} className="relative group cursor-pointer">
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <img
                      src={memory.image}
                      alt={`Memória ${memory.id}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Stats Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <i className="ri-heart-fill text-pink-500"></i>
                        <span className="text-xs font-semibold">{memory.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="ri-chat-3-fill text-blue-500"></i>
                        <span className="text-xs font-semibold">{memory.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Memory Button */}
            <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Adicionar Memória
            </button>
          </div>

          {/* Share Section */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-t border-purple-200">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap">
              <i className="ri-share-line text-xl"></i>
              Compartilhar Viagens
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
