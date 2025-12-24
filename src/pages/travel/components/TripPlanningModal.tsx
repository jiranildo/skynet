import { useState, useRef } from 'react';

interface Activity {
  id: string;
  title: string;
  description: string;
  time?: string;
  location?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'Confirmado' | 'Pendente';
  type: 'accommodation' | 'transport' | 'activity' | 'restaurant' | 'document' | 'reservation';
  icon?: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
  price?: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

interface TripPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    destination: string;
    startDate: string;
    endDate: string;
    image: string;
    dates?: string;
  };
}

export default function TripPlanningModal({ isOpen, onClose, trip }: TripPlanningModalProps) {
  const [activePhase, setActivePhase] = useState<'pre' | 'during' | 'post'>('during');
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Calcular número de dias da viagem
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Gerar dias da viagem
  const tripDays: DayPlan[] = Array.from({ length: totalDays }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return {
      day: index + 1,
      date: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      activities: []
    };
  });

  // Dados de exemplo para dias da viagem
  const mockActivities: { [key: number]: any[] } = {
    0: [
      {
        title: 'São Roque',
        description: 'Conheça caves e Terra do Vinho. São Roque oferece vinhedos charmosos e paisagens bucólicas.',
        time: '09:00-13:00',
        location: 'São Roque, SP',
        coordinates: { lat: -23.5225, lng: -47.1364 },
        status: 'confirmed',
        icon: 'ri-goblet-line',
        price: 'R$ 150'
      }
    ],
    1: [
      {
        title: 'City Tour',
        description: 'Explore os principais pontos turísticos',
        time: '10:00-18:00',
        location: 'Centro da cidade',
        coordinates: { lat: -23.5505, lng: -46.6333 },
        status: 'confirmed',
        icon: 'ri-map-pin-line'
      }
    ],
    2: [
      {
        title: 'Parques Temáticos',
        description: 'Dia de diversão nos parques',
        time: '09:00-22:00',
        location: 'Universal Studios',
        coordinates: { lat: -23.5689, lng: -46.6544 },
        status: 'pending',
        icon: 'ri-rocket-line',
        price: 'R$ 450'
      }
    ]
  };

  // Coletar todos os lugares do roteiro
  const allLocations = Object.values(mockActivities)
    .flat()
    .filter(activity => activity.coordinates)
    .map(activity => ({
      name: activity.title,
      location: activity.location,
      lat: activity.coordinates.lat,
      lng: activity.coordinates.lng
    }));

  // Criar URL do Google Maps embed com todos os pontos
  const createMapEmbedUrl = () => {
    if (allLocations.length === 0) return '';

    // Usar o primeiro local como centro
    const center = allLocations[0];
    // const query = allLocations.map(loc => loc.location).join('|');

    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(center.location)}&zoom=11`;
  };

  // Dados de exemplo para Pré-Viagens
  // const preTripActivities: Activity[] = [
  //   {
  //     id: '1',
  //     title: 'Preparação',
  //     description: 'Organize sua lista de itens',
  //     status: 'completed',
  //     type: 'document'
  //   },
  //   {
  //     id: '2',
  //     title: 'Documentos',
  //     description: 'Passaporte, vistos',
  //     status: 'confirmed',
  //     type: 'document'
  //   },
  //   {
  //     id: '3',
  //     title: 'Bagagem',
  //     description: 'O que vai levar',
  //     status: 'pending',
  //     type: 'activity'
  //   },
  //   {
  //     id: '4',
  //     title: 'Reservas',
  //     description: 'Confirme todas',
  //     status: 'confirmed',
  //     type: 'reservation'
  //   }
  // ];

  // Dados de exemplo para Pós-Viagens
  // const postTripActivities: Activity[] = [
  //   {
  //     id: '1',
  //     title: 'Após a Viagens',
  //     description: 'Compartilhe suas memórias',
  //     status: 'pending',
  //     type: 'activity'
  //   },
  //   {
  //     id: '2',
  //     title: 'Posts',
  //     description: 'Compartilhar fotos',
  //     status: 'pending',
  //     type: 'activity'
  //   },
  //   {
  //     id: '3',
  //     title: 'Avaliações',
  //     description: 'Deixar reviews',
  //     status: 'pending',
  //     type: 'activity'
  //   },
  //   {
  //     id: '4',
  //     title: 'Conquistas',
  //     description: 'Ver badges',
  //     status: 'pending',
  //     type: 'activity'
  //   }
  // ];

  /*
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'confirmed':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Confirmado';
      case 'confirmed':
        return 'Confirmado';
      default:
        return 'Pendente';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return 'ri-hotel-line';
      case 'transport':
        return 'ri-plane-line';
      case 'activity':
        return 'ri-map-pin-line';
      case 'restaurant':
        return 'ri-restaurant-line';
      case 'document':
        return 'ri-file-list-3-line';
      case 'reservation':
        return 'ri-bookmark-line';
      default:
        return 'ri-checkbox-circle-line';
    }
  };
  */

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 200;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <i className="ri-map-pin-line text-2xl text-purple-600"></i>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{trip.destination}</h2>
                <p className="text-sm text-gray-500">{trip.dates}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          </div>

          {/* Interactive Map */}
          {allLocations.length > 0 && (
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 relative h-48">
              <iframe
                src={createMapEmbedUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>

              {/* Map Legend */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs font-medium text-gray-700">{allLocations.length} Lugares</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-indigo-500"></div>
                    <span className="text-xs font-medium text-gray-700">Rota</span>
                  </div>
                </div>
              </div>

              {/* Location Markers Info */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-route-line text-indigo-600"></i>
                  <span className="text-xs font-semibold text-gray-900">Roteiro Completo</span>
                </div>
                <div className="space-y-1">
                  {allLocations.slice(0, 3).map((loc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-gray-700 truncate">{loc.name}</span>
                    </div>
                  ))}
                  {allLocations.length > 3 && (
                    <div className="text-xs text-gray-500 pl-6">
                      +{allLocations.length - 3} lugares
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full h-2 mb-2">
            <div className="bg-white/30 rounded-full h-full" style={{ width: '0%' }}></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Jornada</span>
            <span className="font-semibold text-gray-900">0% completo</span>
          </div>
        </div>

        {/* Timeline Carousel */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="ri-calendar-line text-purple-600"></i>
              Timeline
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => scrollTimeline('left')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <i className="ri-arrow-left-s-line text-gray-600"></i>
              </button>
              <button
                onClick={() => scrollTimeline('right')}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <i className="ri-arrow-right-s-line text-gray-600"></i>
              </button>
            </div>
          </div>

          <div
            ref={timelineRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Pre-Trip Card */}
            <button
              onClick={() => setActivePhase('pre')}
              className={`flex-shrink-0 w-32 rounded-xl border-2 transition-all ${activePhase === 'pre'
                ? 'bg-purple-600 border-purple-600 shadow-lg scale-105'
                : 'bg-white border-gray-200 hover:border-purple-300'
                }`}
            >
              <div className="p-4 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${activePhase === 'pre' ? 'bg-white/20' : 'bg-purple-100'
                  }`}>
                  <i className={`ri-luggage-cart-line text-2xl ${activePhase === 'pre' ? 'text-white' : 'text-purple-600'
                    }`}></i>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${activePhase === 'pre' ? 'text-white' : 'text-gray-900'
                    }`}>Pre-Trip</div>
                  <div className={`text-xs ${activePhase === 'pre' ? 'text-white/80' : 'text-gray-500'
                    }`}>Preparação</div>
                  <div className={`text-xs mt-1 ${activePhase === 'pre' ? 'text-white/90' : 'text-gray-600'
                    }`}>3 itens</div>
                </div>
              </div>
            </button>

            {/* Days Cards */}
            {tripDays.map((day, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveDayIndex(index);
                  setActivePhase('during');
                }}
                className={`flex-shrink-0 w-32 rounded-xl border-2 transition-all ${activePhase === 'during' && activeDayIndex === index
                  ? 'bg-gray-900 border-gray-900 shadow-lg scale-105'
                  : 'bg-white border-gray-200 hover:border-gray-400'
                  }`}
              >
                <div className="p-4 flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${activePhase === 'during' && activeDayIndex === index
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                    }`}>
                    <span className={`text-xl font-bold ${activePhase === 'during' && activeDayIndex === index
                      ? 'text-white'
                      : 'text-gray-700'
                      }`}>{index + 1}</span>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${activePhase === 'during' && activeDayIndex === index
                      ? 'text-white'
                      : 'text-gray-900'
                      }`}>Dia {index + 1}</div>
                    <div className={`text-xs ${activePhase === 'during' && activeDayIndex === index
                      ? 'text-white/90'
                      : 'text-gray-600'
                      }`}>{day.activities.length} itens</div>
                  </div>
                </div>
              </button>
            ))}

            {/* Post-Trip Card */}
            <button
              onClick={() => setActivePhase('post')}
              className={`flex-shrink-0 w-32 rounded-xl border-2 transition-all ${activePhase === 'post'
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-pink-500 shadow-lg scale-105'
                : 'bg-white border-gray-200 hover:border-pink-300'
                }`}
            >
              <div className="p-4 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${activePhase === 'post' ? 'bg-white/20' : 'bg-pink-100'
                  }`}>
                  <i className={`ri-heart-line text-2xl ${activePhase === 'post' ? 'text-white' : 'text-pink-600'
                    }`}></i>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${activePhase === 'post' ? 'text-white' : 'text-gray-900'
                    }`}>Post-Trip</div>
                  <div className={`text-xs ${activePhase === 'post' ? 'text-white/80' : 'text-gray-500'
                    }`}>Memórias</div>
                  <div className={`text-xs mt-1 ${activePhase === 'post' ? 'text-white/90' : 'text-gray-600'
                    }`}>4 itens</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activePhase === 'pre' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100">
                  <i className="ri-luggage-cart-line text-2xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Preparação da Viagens</h3>
                  <p className="text-sm text-gray-500">Organize tudo antes de partir</p>
                </div>
              </div>

              {/* Pre-trip checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: 'ri-passport-line', title: 'Documentos', items: ['Passaporte', 'Visto', 'Seguro Viagens', 'Carteira de Motorista'] },
                  { icon: 'ri-shopping-bag-line', title: 'Bagagem', items: ['Fazer mala', 'Itens essenciais', 'Medicamentos', 'Adaptadores'] },
                  { icon: 'ri-bookmark-line', title: 'Reservas', items: ['Hotel confirmado', 'Voos confirmados', 'Transfers', 'Passeios'] },
                  { icon: 'ri-money-dollar-circle-line', title: 'Financeiro', items: ['Moeda local', 'Cartões', 'Orçamento', 'Seguro'] }
                ].map((section, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100">
                        <i className={`${section.icon} text-lg text-purple-600`}></i>
                      </div>
                      <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePhase === 'during' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 text-white text-xl font-bold">
                    {activeDayIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Dia {activeDayIndex + 1}</h3>
                    <p className="text-sm text-gray-500">{tripDays[activeDayIndex].activities.length} atividades planejadas</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
                  <i className="ri-add-line mr-1"></i>
                  Adicionar Atividade
                </button>
              </div>

              {/* Activities list */}
              <div className="space-y-3">
                {tripDays[activeDayIndex].activities.map((activity, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                        <i className={`${activity.icon} text-2xl text-gray-700`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${activity.status === 'Confirmado' || activity.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            activity.status === 'Pendente' || activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                            {activity.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <i className="ri-time-line"></i>
                            {activity.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-map-pin-line"></i>
                            {activity.location}
                          </span>
                        </div>
                        {activity.notes && (
                          <p className="text-sm text-gray-500">{activity.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePhase === 'post' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                  <i className="ri-heart-line text-2xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Memórias da Viagens</h3>
                  <p className="text-sm text-gray-500">Compartilhe suas experiências</p>
                </div>
              </div>

              {/* Post-trip actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: 'ri-camera-line', title: 'Compartilhar Fotos', desc: 'Crie um post com suas melhores fotos', color: 'pink' },
                  { icon: 'ri-star-line', title: 'Avaliar Experiências', desc: 'Avalie hotéis, restaurantes e passeios', color: 'yellow' },
                  { icon: 'ri-article-line', title: 'Escrever Blog', desc: 'Conte sua história de viagem', color: 'blue' },
                  { icon: 'ri-trophy-line', title: 'Conquistas', desc: 'Veja suas conquistas desbloqueadas', color: 'purple' }
                ].map((action, idx) => (
                  <button key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all text-left group">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-${action.color}-100 mb-4 group-hover:scale-110 transition-transform`}>
                      <i className={`${action.icon} text-2xl text-${action.color}-600`}></i>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.desc}</p>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Estatísticas da Viagens</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Fotos', value: '127', icon: 'ri-image-line' },
                    { label: 'Lugares', value: '15', icon: 'ri-map-pin-line' },
                    { label: 'Km Percorridos', value: '51.5', icon: 'ri-road-map-line' },
                    { label: 'Experiências', value: '23', icon: 'ri-star-line' }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white mx-auto mb-2">
                        <i className={`${stat.icon} text-xl text-purple-600`}></i>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
