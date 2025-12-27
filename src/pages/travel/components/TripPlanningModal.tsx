import { useState, useRef, useMemo, useEffect } from 'react';
import { updateTrip, Trip } from '../../../services/supabase';
import { useDestinationInfo } from '../../../hooks/useDestinationInfo';

interface Activity {
  id: string;
  title: string;
  description: string;
  time?: string;
  endTime?: string;
  location?: string;
  status: 'pending' | 'confirmed' | 'not_reserved';
  type: 'accommodation' | 'transport' | 'activity' | 'restaurant' | 'document' | 'reservation' | 'flight' | 'car' | 'ticket' | 'service';
  icon?: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
  price?: string;
}

interface DayPlan {
  day: number;
  date: string;
  fullDate: string; // e.g. "quinta-feira, 06 de nov"
  activities: Activity[];
}

interface TripPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    destination: string;
    start_date: string;
    end_date: string;
    cover_image: string; // Cover image URL
    dates?: string;
    itinerary?: any;
    budget?: number;
    title?: string;
  };
}

// Special indices for Pre and Post trip
const PRE_TRIP_INDEX = -1;
const POST_TRIP_INDEX = 999;

export default function TripPlanningModal({ isOpen, onClose, trip }: TripPlanningModalProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0); // 0 to N are days, -1 is Pre, 999 is Post
  const timelineRef = useRef<HTMLDivElement>(null);

  // Activity Form State
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'activity',
    status: 'confirmed'
  });

  // Itinerary State (initialized from Supabase data)
  const [itinerary, setItinerary] = useState<{ [key: number]: Activity[] }>(trip.itinerary || {});

  // Real Destination Info
  const destinationInfo = useDestinationInfo(trip.destination);

  // Save to Supabase whenever itinerary changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateTrip(trip.id, { itinerary });
    }, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [itinerary, trip.id]);

  if (!isOpen) return null;

  // Calcular número de dias da viagem
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Gerar dias da viagem
  const tripDays: DayPlan[] = Array.from({ length: totalDays }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return {
      day: index + 1,
      date: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
      fullDate: currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
      activities: []
    };
  });

  // Format Dates
  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${e.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  };

  const activityTypes = [
    { id: 'activity', label: 'Atividade', icon: 'ri-camera-line' },
    { id: 'flight', label: 'Voo', icon: 'ri-plane-line' },
    { id: 'accommodation', label: 'Hotel', icon: 'ri-hotel-line' },
    { id: 'car', label: 'Carro', icon: 'ri-car-line' },
    { id: 'restaurant', label: 'Restaurante', icon: 'ri-restaurant-line' },
    { id: 'transport', label: 'Transporte', icon: 'ri-taxi-line' },
    { id: 'ticket', label: 'Ingresso', icon: 'ri-ticket-line' },
    { id: 'service', label: 'Serviço', icon: 'ri-group-line' }
  ];

  const handleAddActivity = async () => {
    // Basic validation: title required. Time is optional for Pre/Post trip.
    if (!newActivity.title) {
      alert('Preencha pelo menos o título da atividade.');
      return;
    }

    let coordinates = undefined;
    if (newActivity.location) {
      try {
        // Try searching with destination context first
        let query = `${newActivity.location}, ${trip.destination}`;
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        let data = await response.json();

        // Fallback: search just the location if context search fails
        if (!data || data.length === 0) {
          response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newActivity.location)}`);
          data = await response.json();
        }
        if (data && data.length > 0) {
          coordinates = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }

    const activity: Activity = {
      id: Date.now().toString(),
      title: newActivity.title,
      description: newActivity.description || '',
      time: newActivity.time,
      endTime: newActivity.endTime,
      location: newActivity.location || '',
      type: newActivity.type as any,
      status: newActivity.status || 'confirmed',
      icon: activityTypes.find(t => t.id === newActivity.type)?.icon || 'ri-map-pin-line',
      price: newActivity.price,
      notes: newActivity.notes,
      coordinates
    };

    setItinerary(prev => ({
      ...prev,
      [activeDayIndex]: [...(prev[activeDayIndex] || []), activity].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    }));

    setIsAddingActivity(false);
    setNewActivity({ type: 'activity', status: 'confirmed' });
  };


  const updateActivityStatus = (dayIndex: number, activityId: string, newStatus: Activity['status']) => {
    setItinerary(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].map(act => act.id === activityId ? { ...act, status: newStatus } : act)
    }));
  };

  const deleteActivity = (dayIndex: number, activityId: string) => {
    setItinerary(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].filter(act => act.id !== activityId)
    }));
  };

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 200;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-500',
          text: 'text-green-700'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-500',
          text: 'text-yellow-700'
        };
      case 'not_reserved':
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          iconBg: 'bg-gray-200',
          text: 'text-gray-700'
        };
    }
  };

  // Global Progress Logic
  const totalSlots = totalDays + 2; // Days + Pre + Post
  let filledSlots = 0;
  if ((itinerary[PRE_TRIP_INDEX] || []).length > 0) filledSlots++;
  if ((itinerary[POST_TRIP_INDEX] || []).length > 0) filledSlots++;
  for (let i = 0; i < totalDays; i++) {
    if ((itinerary[i] || []).length > 0) filledSlots++;
  }
  const progressPercentage = Math.round((filledSlots / totalSlots) * 100);

  // Map Logic
  const allActivities = Object.values(itinerary).flat();
  const allLocations = allActivities
    .filter(activity => activity.coordinates)
    .map(activity => ({
      lat: activity.coordinates!.lat,
      lng: activity.coordinates!.lng,
      title: activity.title,
    }));

  const createMapEmbedUrl = () => {
    if (allLocations.length === 0) return '';
    const loc = allLocations[0];
    const bbox = `${loc.lng - 0.05},${loc.lat - 0.05},${loc.lng + 0.05},${loc.lat + 0.05}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`;
  };

  const dayActivities = itinerary[activeDayIndex] || [];

  const getDayLabel = (index: number) => {
    if (index === PRE_TRIP_INDEX) return 'Pre-Trip';
    if (index === POST_TRIP_INDEX) return 'Post-Trip';
    return `Dia ${index + 1}`;
  };

  const getFullDatelabel = (index: number) => {
    if (index === PRE_TRIP_INDEX) return 'Preparação da Viagem';
    if (index === POST_TRIP_INDEX) return 'Memórias e Review';
    return tripDays[index].fullDate;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-100 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">

        {/* Cover Image Banner */}
        <div className="h-64 relative shrink-0">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80'}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          <div className="absolute bottom-6 left-8 text-white">
            <h2 className="text-4xl font-bold shadow-sm mb-2">{trip.destination}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                <i className="ri-calendar-line"></i>
                {formatDateRange(trip.start_date, trip.end_date)}
              </span>

              {/* Weather */}
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                {destinationInfo.loading ? (
                  <i className="ri-loader-4-line animate-spin"></i>
                ) : destinationInfo.weather ? (
                  <>
                    <i className={`ri-${destinationInfo.weather.isDay ? 'sun' : 'moon'}-line ${destinationInfo.weather.isDay ? 'text-yellow-300' : 'text-blue-300'}`}></i>
                    {destinationInfo.weather.temp}°C
                    <span className="mx-1 opacity-50">•</span>
                    <i className="ri-drop-line text-blue-300"></i> {destinationInfo.weather.humidity}%
                  </>
                ) : (
                  <span className="text-white/50">--°C</span>
                )}
              </span>

              {/* Time */}
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                <i className="ri-time-line"></i>
                {destinationInfo.timezone?.localTime || '--:--'} ({destinationInfo.timezone?.gmt || 'GMT'})
              </span>

              {/* Currency */}
              {(destinationInfo.currency && destinationInfo.currency.code !== 'BRL') && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <i className="ri-money-dollar-circle-line text-green-300"></i>
                  {destinationInfo.currency.symbol}1 = R$ {destinationInfo.currency.rateToBRL?.toFixed(2)}
                </span>
              )}

              {/* Power */}
              {destinationInfo.power && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <i className="ri-plug-line text-gray-300"></i>
                  {destinationInfo.power.voltage} • {destinationInfo.power.plugs.join('/')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Map Integration (Conditionally rendered) */}
          {allLocations.length > 0 && (
            <div className="rounded-2xl overflow-hidden shadow-md h-64 border border-gray-200">
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
            </div>
          )}

          {/* Jornada Card */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="ri-road-map-line text-9xl"></i>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <i className="ri-calendar-event-line"></i>
                    Jornada
                  </h3>
                  <p className="text-sm text-white/80">{formatDateRange(trip.start_date, trip.end_date)}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{progressPercentage}%</div>
                  <div className="text-xs text-white/80">completo</div>
                </div>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-calendar-line text-blue-500"></i>
                Timeline
              </h3>
              <div className="flex gap-2">
                <button onClick={() => scrollTimeline('left')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                <button onClick={() => scrollTimeline('right')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>

            <div ref={timelineRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {/* Pre-Trip */}
              <button
                onClick={() => setActiveDayIndex(PRE_TRIP_INDEX)}
                className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeDayIndex === PRE_TRIP_INDEX ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-200'
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeDayIndex === PRE_TRIP_INDEX ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="ri-luggage-cart-line text-lg"></i>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${activeDayIndex === PRE_TRIP_INDEX ? 'text-purple-700' : 'text-gray-700'}`}>Pre-Trip</div>
                  <div className="text-xs text-gray-500">Preparação</div>
                </div>
              </button>

              {/* Days */}
              {tripDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDayIndex(index)}
                  className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeDayIndex === index
                    ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                    : 'border-gray-100 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${activeDayIndex === index ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {day.day}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold leading-tight ${activeDayIndex === index ? 'text-white' : 'text-gray-900'
                      }`}>{day.date}</div>
                    <div className={`text-xs ${activeDayIndex === index ? 'text-gray-400' : 'text-gray-500'
                      }`}>{itinerary[index]?.length || 0} itens</div>
                  </div>
                </button>
              ))}

              {/* Post-Trip */}
              <button
                onClick={() => setActiveDayIndex(POST_TRIP_INDEX)}
                className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeDayIndex === POST_TRIP_INDEX ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-pink-200'
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeDayIndex === POST_TRIP_INDEX ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                  <i className="ri-heart-line text-lg"></i>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${activeDayIndex === POST_TRIP_INDEX ? 'text-pink-600' : 'text-gray-700'}`}>Post-Trip</div>
                  <div className="text-xs text-gray-500">Memórias</div>
                </div>
              </button>
            </div>
          </div>

          {/* Day Header & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${activeDayIndex === PRE_TRIP_INDEX ? 'bg-purple-600' :
                activeDayIndex === POST_TRIP_INDEX ? 'bg-pink-600' : 'bg-gray-800'
                }`}>
                {activeDayIndex === PRE_TRIP_INDEX ? <i className="ri-luggage-cart-line"></i> :
                  activeDayIndex === POST_TRIP_INDEX ? <i className="ri-heart-line"></i> :
                    activeDayIndex + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{getDayLabel(activeDayIndex)}</h3>
                <p className="text-sm text-gray-500 capitalize">{getFullDatelabel(activeDayIndex)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center" title="Gerar com IA">
                <i className="ri-magic-line text-xl"></i>
              </button>
              <button
                onClick={() => setIsAddingActivity(true)}
                className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                title="Adicionar Item"
              >
                <i className="ri-add-line text-xl"></i>
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-3 pb-20">
            {dayActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-calendar-event-line text-3xl opacity-30"></i>
                </div>
                <p className="font-medium">Nenhuma atividade planejada</p>
                <p className="text-sm text-gray-400 mb-4">Adicione itens ou gere um roteiro com IA</p>
                <button
                  onClick={() => setIsAddingActivity(true)}
                  className="text-blue-600 font-semibold hover:underline text-sm"
                >
                  + Adicionar primeira atividade
                </button>
              </div>
            ) : (
              dayActivities.map((activity) => {
                const styles = getStatusStyles(activity.status);
                return (
                  <div key={activity.id} className={`rounded-xl border ${styles.border} ${styles.bg} p-4 transition-all hover:shadow-md`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                          <i className={`${activity.icon} text-xl`}></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg leading-tight">{activity.title}</h4>
                          {activity.description && <p className="text-sm text-gray-600 mt-1">{activity.description}</p>}

                          <div className="flex flex-wrap gap-2 mt-3">
                            {(activity.time || activity.endTime) && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <i className="ri-time-line text-gray-400"></i>
                                {activity.time} {activity.endTime ? `- ${activity.endTime}` : ''}
                              </span>
                            )}
                            {activity.location && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <i className="ri-map-pin-line text-gray-400"></i>
                                {activity.location}
                              </span>
                            )}
                            {activity.price && (
                              <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <i className="ri-money-dollar-circle-line text-green-500"></i>
                                {activity.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteActivity(activeDayIndex, activity.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>

                    {/* Footer / Status Selector */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200/50">
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, 'not_reserved')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activity.status === 'not_reserved'
                          ? 'bg-gray-200 text-gray-800 shadow-inner'
                          : 'text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <i className={`ri-checkbox-blank-circle-line ${activity.status === 'not_reserved' ? '' : 'opacity-50'}`}></i>
                        Não Reservado
                      </button>
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, 'pending')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 shadow-inner'
                          : 'text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <i className={`ri-time-line ${activity.status === 'pending' ? '' : 'opacity-50'}`}></i>
                        Pendente
                      </button>
                      <button
                        onClick={() => updateActivityStatus(activeDayIndex, activity.id, 'confirmed')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activity.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 shadow-inner'
                          : 'text-gray-500 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <i className={`ri-check-line ${activity.status === 'confirmed' ? '' : 'opacity-50'}`}></i>
                        Confirmado
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddingActivity && (
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Adicionar em {getDayLabel(activeDayIndex)}</h3>
              <button onClick={() => setIsAddingActivity(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tipo</label>
                <div className="relative">
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    value={newActivity.type}
                    onChange={e => setNewActivity({ ...newActivity, type: e.target.value as any })}
                  >
                    {activityTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500">
                    <i className={activityTypes.find(t => t.id === newActivity.type)?.icon}></i>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Título da atividade"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                  value={newActivity.title || ''}
                  onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Localização (ex: Aeroporto, Hotel X...)"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    value={newActivity.location || ''}
                    onChange={e => setNewActivity({ ...newActivity, location: e.target.value })}
                  />
                  <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Início</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    value={newActivity.time || '12:00'}
                    onChange={e => setNewActivity({ ...newActivity, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Fim</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-center"
                    value={newActivity.endTime || '13:00'}
                    onChange={e => setNewActivity({ ...newActivity, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Preço (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  value={newActivity.price || ''}
                  onChange={e => setNewActivity({ ...newActivity, price: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 pt-2 flex gap-3">
              <button
                onClick={() => setIsAddingActivity(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddActivity}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 shadow-lg shadow-purple-200"
              >
                + Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
