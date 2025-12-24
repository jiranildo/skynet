import { useState } from 'react';
import TripDetailModal from './TripDetailModal';

interface UpcomingEvent {
  id: number;
  type: string;
  title: string;
  date: string;
  image: string;
  icon: string;
  color: string;
  location?: string;
}

interface UpcomingEvent {
  id: number;
  type: string;
  title: string;
  date: string;
  image: string;
  icon: string;
  color: string;
  location?: string;
}

export default function Stories() {
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: 1,
      type: 'trip',
      title: 'Paris, França',
      date: '15 Mar',
      image: 'https://readdy.ai/api/search-image?query=beautiful%20eiffel%20tower%20paris%20france%20iconic%20landmark%20blue%20sky%20romantic%20city%20view%20travel%20destination%20photography%20high%20quality&width=300&height=300&seq=trip-paris-001&orientation=squarish',
      icon: 'ri-plane-line',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      type: 'event',
      title: 'Wine Tasting',
      date: '20 Mar',
      image: 'https://readdy.ai/api/search-image?query=elegant%20wine%20tasting%20event%20vineyard%20setting%20wine%20glasses%20bottles%20sophisticated%20atmosphere%20professional%20photography&width=300&height=300&seq=event-wine-001&orientation=squarish',
      icon: 'ri-goblet-line',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      type: 'trip',
      title: 'Tokyo, Japão',
      date: '05 Abr',
      image: 'https://readdy.ai/api/search-image?query=tokyo%20japan%20cityscape%20modern%20architecture%20neon%20lights%20urban%20landscape%20cherry%20blossoms%20travel%20destination%20vibrant%20city%20photography&width=300&height=300&seq=trip-tokyo-001&orientation=squarish',
      icon: 'ri-plane-line',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 4,
      type: 'event',
      title: 'Jantar Gourmet',
      date: '12 Abr',
      image: 'https://readdy.ai/api/search-image?query=elegant%20gourmet%20dinner%20fine%20dining%20restaurant%20sophisticated%20table%20setting%20delicious%20food%20presentation%20luxury%20atmosphere%20professional%20photography&width=300&height=300&seq=event-dinner-001&orientation=squarish',
      icon: 'ri-restaurant-line',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      id: 5,
      type: 'trip',
      title: 'Santorini, Grécia',
      date: '25 Abr',
      image: 'https://readdy.ai/api/search-image?query=santorini%20greece%20white%20buildings%20blue%20domes%20aegean%20sea%20sunset%20beautiful%20island%20mediterranean%20paradise%20travel%20destination%20photography&width=300&height=300&seq=trip-santorini-001&orientation=squarish',
      icon: 'ri-plane-line',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      id: 6,
      type: 'event',
      title: 'Festival Gastronômico',
      date: '30 Abr',
      image: 'https://readdy.ai/api/search-image?query=food%20festival%20culinary%20event%20outdoor%20market%20gourmet%20street%20food%20diverse%20cuisine%20vibrant%20atmosphere%20people%20enjoying%20food%20photography&width=300&height=300&seq=event-food-fest-001&orientation=squarish',
      icon: 'ri-cake-3-line',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stories = [
    {
      id: 1,
      username: 'Your Story',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20of%20a%20confident%20young%20person%20with%20warm%20smile%20wearing%20casual%20elegant%20clothing%20against%20soft%20neutral%20background%20natural%20lighting%20high%20quality%20photography%20modern%20style&width=200&height=200&seq=user-profile-story-001&orientation=squarish',
      hasStory: false,
      isOwn: true
    },
    {
      id: 2,
      username: 'alex_photo',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20photographer%20with%20camera%20creative%20professional%20urban%20background%20natural%20light%20modern%20photography&width=200&height=200&seq=story-002&orientation=squarish',
      hasStory: true
    },
    {
      id: 3,
      username: 'sarah_j',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20young%20woman%20with%20stylish%20outfit%20fashion%20blogger%20aesthetic%20clean%20background&width=200&height=200&seq=story-003&orientation=squarish',
      hasStory: true
    },
    {
      id: 4,
      username: 'mike_travels',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20traveler%20with%20backpack%20adventure%20enthusiast%20outdoor%20lifestyle%20natural%20setting&width=200&height=200&seq=story-004&orientation=squarish',
      hasStory: true,
      isLive: true
    },
    {
      id: 5,
      username: 'emma_art',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20artist%20creative%20person%20with%20artistic%20vibe%20colorful%20background%20modern%20aesthetic&width=200&height=200&seq=story-005&orientation=squarish',
      hasStory: true
    },
    {
      id: 6,
      username: 'john_fitness',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20fitness%20trainer%20athletic%20person%20gym%20background%20healthy%20lifestyle%20energetic&width=200&height=200&seq=story-006&orientation=squarish',
      hasStory: true
    },
    {
      id: 7,
      username: 'lisa_food',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20chef%20culinary%20expert%20kitchen%20background%20professional%20food%20enthusiast&width=200&height=200&seq=story-007&orientation=squarish',
      hasStory: true
    },
    {
      id: 8,
      username: 'david_tech',
      avatar: 'https://readdy.ai/api/search-image?query=portrait%20of%20tech%20professional%20modern%20workspace%20developer%20programmer%20clean%20background&width=200&height=200&seq=story-008&orientation=squarish',
      hasStory: true
    },
  ];

  const handleTripClick = (event: UpcomingEvent) => {
    setSelectedTrip({
      id: event.id,
      title: event.title,
      location: event.location,
      date: event.date,
      image: event.image,
      type: event.type,
      days: [
        {
          day: 1,
          title: 'Chegada e Check-in',
          activities: [
            { time: '14:00', title: 'Check-in no Hotel', location: 'Hotel Central', icon: 'ri-hotel-line' },
            { time: '16:00', title: 'City Tour', location: 'Centro Histórico', icon: 'ri-map-pin-line' },
            { time: '19:00', title: 'Jantar de Boas-vindas', location: 'Restaurante Gourmet', icon: 'ri-restaurant-line' }
          ]
        },
        {
          day: 2,
          title: 'Explorando a Cidade',
          activities: [
            { time: '09:00', title: 'Café da Manhã', location: 'Hotel', icon: 'ri-cup-line' },
            { time: '10:00', title: 'Visita ao Museu', location: 'Museu de Arte', icon: 'ri-building-line' },
            { time: '14:00', title: 'Almoço Local', location: 'Bistrô da Praça', icon: 'ri-restaurant-2-line' },
            { time: '16:00', title: 'Parque Temático', location: 'Adventure Park', icon: 'ri-riding-line' }
          ]
        },
        {
          day: 3,
          title: 'Último Dia',
          activities: [
            { time: '10:00', title: 'Compras de Souvenirs', location: 'Mercado Local', icon: 'ri-shopping-bag-line' },
            { time: '12:00', title: 'Almoço de Despedida', location: 'Restaurante Vista Mar', icon: 'ri-restaurant-line' },
            { time: '15:00', title: 'Check-out', location: 'Hotel', icon: 'ri-logout-box-line' }
          ]
        }
      ],
      memories: [
        { id: 1, image: 'https://readdy.ai/api/search-image?query=beautiful%20sunset%20over%20ocean%20waves%20golden%20hour%20peaceful%20scenic%20view%20with%20warm%20orange%20and%20pink%20sky%20reflecting%20on%20calm%20water%20surface%20creating%20romantic%20atmosphere%20perfect%20vacation%20moment&width=400&height=300&seq=mem1&orientation=landscape', likes: 234, comments: 45 },
        { id: 2, image: 'https://readdy.ai/api/search-image?query=delicious%20gourmet%20food%20plating%20fine%20dining%20restaurant%20elegant%20presentation%20colorful%20fresh%20ingredients%20artistic%20culinary%20creation%20on%20white%20plate%20professional%20food%20photography&width=400&height=300&seq=mem2&orientation=landscape', likes: 189, comments: 32 },
        { id: 3, image: 'https://readdy.ai/api/search-image?query=historic%20architecture%20building%20facade%20european%20style%20old%20town%20street%20view%20charming%20colorful%20buildings%20cobblestone%20path%20sunny%20day%20travel%20destination%20cultural%20heritage&width=400&height=300&seq=mem3&orientation=landscape', likes: 312, comments: 67 },
        { id: 4, image: 'https://readdy.ai/api/search-image?query=group%20of%20happy%20friends%20laughing%20together%20casual%20outdoor%20setting%20joyful%20moment%20candid%20photography%20warm%20natural%20lighting%20genuine%20smiles%20vacation%20memories&width=400&height=300&seq=mem4&orientation=landscape', likes: 445, comments: 89 }
      ]
    });
    setIsTripModalOpen(true);
  };

  const handleViewAllTrips = () => {
    window.REACT_APP_NAVIGATE('/travel');
  };

  return (
    <>
      {/* Próximas Viagens e Eventos */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">Próximas Viagens & Eventos</h2>
          <button
            onClick={handleViewAllTrips}
            className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
          >
            Ver Todos
          </button>
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {upcomingEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => handleTripClick(event)}
              className="flex-shrink-0 group relative"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className={`absolute top-1.5 right-1.5 w-6 h-6 bg-gradient-to-r ${event.color} rounded-full flex items-center justify-center shadow-lg`}>
                  <i className={`${event.icon} text-white text-xs`}></i>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <p className="text-white text-[10px] sm:text-xs font-bold truncate">{event.title}</p>
                  <p className="text-white/90 text-[8px] sm:text-[10px] font-medium">{event.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 mb-4 md:mb-6 overflow-hidden">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className="relative">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${story.isOwn ? 'bg-gray-200' : 'bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600'} p-[2px] group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <img
                      src={story.avatar}
                      alt={story.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                {story.isOwn && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <i className="ri-add-line text-white text-[10px] sm:text-xs"></i>
                  </div>
                )}
                {story.isLive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full border-2 border-white whitespace-nowrap">
                    LIVE
                  </div>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-700 max-w-[48px] sm:max-w-[56px] truncate">
                {story.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripDetailModal
          isOpen={isTripModalOpen}
          onClose={() => {
            setIsTripModalOpen(false);
            setSelectedTrip(null);
          }}
          trip={selectedTrip}
        />
      )}
    </>
  );
}
