import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ensureUserProfile, User as UserType, storyService, Story, getTrips, Trip } from '../../../services/supabase';
import StoryViewer from './StoryViewer';
import CreateStoryModal from './CreateStoryModal';
import TripPlanningModal from '../../travel/components/TripPlanningModal';



export default function Stories() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserStories, setSelectedUserStories] = useState<Story[] | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [uniqueTrips, setUniqueTrips] = useState<Trip[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true);
          const [profile, storiesData] = await Promise.all([
            ensureUserProfile(),
            storyService.getAll()
          ]);
          setUserProfile(profile);
          setUserStories(storiesData);
        } catch (error) {
          console.error("Error loading stories data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();

    // Load Trips from Supabase
    if (user) {
      getTrips(user.id).then(trips => {
        // Filter: Upcoming or Ongoing (end date >= today or, if no end date, start date >= today)
        const relevantTrips = trips.filter(t => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const tripDateStr = t.end_date || t.start_date;
          let tripEnd;

          // Handle 'YYYY-MM-DD' (UTC) vs ISO vs Local
          if (tripDateStr.includes('T')) {
            tripEnd = new Date(tripDateStr);
          } else {
            // Parse YYYY-MM-DD as local midnight to avoid timezone shift
            const [y, m, d] = tripDateStr.split('-').map(Number);
            tripEnd = new Date(y, m - 1, d);
          }

          return tripEnd >= today;
        }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        setUniqueTrips(relevantTrips);
      }).catch(err => console.error("Error fetching trips:", err));
    }
  }, [user]);

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  // Helper for trip type icon
  const getTripTypeIcon = (type: string) => {
    switch (type) {
      case 'business': return 'ri-briefcase-line';
      case 'romantic': return 'ri-heart-line';
      case 'adventure': return 'ri-compass-3-line';
      case 'cultural': return 'ri-museum-line';
      case 'luxury': return 'ri-vip-diamond-line';
      case 'family': return 'ri-team-line';
      default: return 'ri-plane-line';
    }
  };

  const getTripTypeColor = (type: Trip['trip_type']) => {
    switch (type) {
      case 'business': return 'bg-blue-500';
      case 'romantic': return 'bg-pink-500';
      case 'adventure': return 'bg-orange-500';
      case 'cultural': return 'bg-yellow-500';
      default: return 'bg-cyan-500';
    }
  };

  // Group stories by user
  const groupedStories = userStories.reduce((acc, story) => {
    const userId = story.user_id || 'unknown';
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        username: story.users?.username || 'user',
        avatar: story.users?.avatar_url || '',
        stories: []
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {} as Record<string, { userId: string, username: string, avatar: string, stories: Story[] }>);

  const storiesList = Object.values(groupedStories);
  const ownStories = groupedStories[user?.id || '']?.stories || [];
  const otherStories = storiesList.filter(s => s.userId !== user?.id);

  const handleStoryClick = (userStoriesBatch: Story[]) => {
    setSelectedUserStories(userStoriesBatch);
  };

  const handleCreateStoryClick = () => {
    setShowCreateStory(true);
  };

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTripModalOpen(true);
  };

  const handleViewAllTrips = () => {
    window.REACT_APP_NAVIGATE('/travel');
  };

  return (
    <>
      {/* Próximas Viagens e Eventos */}
      {uniqueTrips.length > 0 && (
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
            {uniqueTrips.map((trip) => {
              const day = new Date(trip.start_date).getDate();
              const month = new Date(trip.start_date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

              return (
                <div
                  key={trip.id}
                  onClick={() => handleTripClick(trip)}
                  className="flex-shrink-0 group relative cursor-pointer"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
                    <img
                      src={trip.cover_image || `https://readdy.ai/api/search-image?query=${trip.destination}%20travel&width=400&height=400&seq=upcoming-${trip.id}&orientation=square`}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Icon Badge */}
                    <div className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm ${getTripTypeColor(trip.trip_type)}`}>
                      <i className={`${getTripTypeIcon(trip.trip_type)} text-[10px]`}></i>
                    </div>

                    {/* Text Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5">
                      <p className="text-white text-[10px] sm:text-xs font-bold truncate">
                        {trip.destination.split(',')[0]}
                      </p>
                      <p className="text-white/90 text-[8px] sm:text-[10px] font-medium capitalize">
                        {day} {month}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stories */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 mb-4 md:mb-6 overflow-hidden">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Own Story Button */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={ownStories.length > 0 ? () => handleStoryClick(ownStories) : handleCreateStoryClick}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="relative">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${ownStories.length > 0 ? 'bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600' : 'bg-gray-200'} p-[2px] group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    {!userProfile?.avatar_url ? (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {initials}
                      </div>
                    ) : (
                      <img
                        src={userProfile.avatar_url}
                        alt="Seu Story"
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                {ownStories.length === 0 && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <i className="ri-add-line text-white text-[10px] sm:text-xs"></i>
                  </div>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-700 max-w-[48px] sm:max-w-[56px] truncate">
                Seu Story
              </span>
            </button>
          </div>

          {/* Other Users' Stories */}
          {otherStories.map((group) => (
            <button
              key={group.userId}
              onClick={() => handleStoryClick(group.stories)}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 p-[2px] group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <img
                      src={group.avatar || 'https://via.placeholder.com/150'}
                      alt={group.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-700 max-w-[48px] sm:max-w-[56px] truncate">
                {group.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Overlay */}
      {selectedUserStories && (
        <StoryViewer
          stories={selectedUserStories}
          onClose={() => setSelectedUserStories(null)}
        />
      )}

      {/* Create Story Modal Overlay */}
      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onSuccess={() => {
            setShowCreateStory(false);
            // Reload data
            storyService.getAll().then(setUserStories);
          }}
        />
      )}

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripPlanningModal
          isOpen={isTripModalOpen}
          onClose={() => {
            setIsTripModalOpen(false);
            setSelectedTrip(null);
          }}
          trip={{
            ...selectedTrip,
            id: String(selectedTrip.id),
            cover_image: selectedTrip.cover_image || ''
          }}
          onTripUpdated={(updatedTrip) => {
            setSelectedTrip(updatedTrip);
            setUniqueTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
          }}
        />
      )}
    </>
  );
}
