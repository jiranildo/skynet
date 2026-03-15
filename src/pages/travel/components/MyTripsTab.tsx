import { useState, useEffect } from 'react';
import TripPlanningModal from './TripPlanningModal';
import CreateTripForm from './CreateTripForm';
import ShareTripModal, { ShareConfig, PublishConfig } from './ShareTripModal';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { useAuth } from '../../../context/AuthContext';
import { UserAvatar } from '../../../components/UserAvatar';



import { getTrips, deleteTrip, updateTrip, Trip, getNetworkUsers, User, createMarketplaceListing, deleteMarketplaceListing, supabase, getGroups, Group, notifySharedGroups, getTripJournalEntries, createJournalEntry, deleteJournalEntry } from '../../../services/supabase';
import { getUserAcquiredExperiences, submitExperienceReview } from '../../../services/db/experiences';
import { UserExperience, TripJournalEntry } from '../../../services/db/types';
import { ErrorDetailsModal } from '../../../components/ErrorDetailsModal';

interface SharedUser {
  id: string;
  name: string;
  avatar: string;
  permission: 'view' | 'edit' | 'admin';
  joinedAt: string;
}

interface Suggestion {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'add_place' | 'remove_place' | 'edit_place' | 'edit_info' | 'change_date';
  description: string;
  data: any;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface YearlyRetrospective {
  id: string;
  year: number;
  title: string;
  coverImage: string;
  stats: {
    countries: number;
    cities: number;
    flights: number;
    hotels: number;
    totalSpent: number;
    favoriteDestination: string;
  };
  highlights: string[];
  topMoments: Array<{
    title: string;
    image: string;
    description: string;
  }>;
  isGenerating?: boolean;
}

export default function MyTripsTab({ onCreateTrip, initialSubTab }: { onCreateTrip?: () => void, initialSubTab?: string }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetail, setShowTripDetail] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [shareLink, setShareLink] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'trips' | 'shared' | 'newtrip' | 'maps' | 'goals' | 'suggestions' | 'retrospectives' | 'services' | 'journal'>(initialSubTab as any || 'maps');
  const [journalEntries, setJournalEntries] = useState<TripJournalEntry[]>([]);
  const [selectedJournalTrip, setSelectedJournalTrip] = useState<Trip | null>(null);
  const [activeJournalDay, setActiveJournalDay] = useState(1);
  const [isAddingJournalEntry, setIsAddingJournalEntry] = useState(false);
  const [newJournalEntry, setNewJournalEntry] = useState({
    type: 'general' as const,
    title: '',
    content: '',
    rating: 5,
    media_url: ''
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiError, setApiError] = useState<any>(null);
  const [userExperiences, setUserExperiences] = useState<UserExperience[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewExperience, setSelectedReviewExperience] = useState<UserExperience | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [retrospectives, setRetrospectives] = useState<YearlyRetrospective[]>([]);
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab as any);
    }
  }, [initialSubTab]);

  const [selectedRetrospective, setSelectedRetrospective] = useState<YearlyRetrospective | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [suggestionTab, setSuggestionTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [networkUsers, setNetworkUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'date'>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);




  useEffect(() => {
    refreshTrips();
    loadRetrospectives();
    loadNetworkUsers();
    refreshExperiences();
  }, [user]);

  useEffect(() => {
    if (selectedJournalTrip) {
      loadJournalEntries(selectedJournalTrip.id);
    }
  }, [selectedJournalTrip]);

  const loadJournalEntries = async (tripId: string) => {
    try {
      const entries = await getTripJournalEntries(tripId);
      setJournalEntries(entries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setApiError(error);
      setShowErrorModal(true);
    }
  };

  const getTripDayCount = (trip: Trip) => {
    if (!trip.start_date || !trip.end_date) return 1;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getJournalDayDate = (trip: Trip, day: number) => {
    if (!trip.start_date) return null;
    const date = new Date(trip.start_date);
    date.setDate(date.getDate() + (day - 1));
    return date;
  };

  const refreshExperiences = async () => {
    if (user) {
      try {
        const data = await getUserAcquiredExperiences(user.id);
        setUserExperiences(data as any);
      } catch (err) {
        console.error('Error fetching experiences:', err);
      }
    }
  };

  const refreshTrips = async () => {
    if (user) {
      try {
        const data = await getTrips(user.id);
        setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    }
  };

  const loadNetworkUsers = async () => {
    if (!user) return;
    try {
      setLoadingNetwork(true);
      const users = await getNetworkUsers(user.id);
      setNetworkUsers(users);
    } catch (error) {
      console.error('Error loading network users:', error);
    } finally {
      setLoadingNetwork(false);
    }
  };

  const loadUserGroups = async () => {
    if (!user) return;
    try {
      const groups = await getGroups(user.id);
      setUserGroups(groups);
    } catch (error) {
      console.error('Error loading user groups:', error);
    }
  };

  useEffect(() => {
    if (showShareModal) {
      loadNetworkUsers();
      loadUserGroups();
    }
  }, [showShareModal]);

  const loadRetrospectives = () => {
    const mockRetrospectives: YearlyRetrospective[] = [
      {
        id: '1',
        year: 2024,
        title: 'Minhas Aventuras em 2024',
        coverImage: 'https://readdy.ai/api/search-image?query=year%202024%20travel%20memories%20collage%20beautiful%20destinations%20adventure%20journey%20highlights&width=800&height=500&seq=retro-2024&orientation=landscape',
        stats: {
          countries: 8,
          cities: 23,
          flights: 15,
          hotels: 18,
          totalSpent: 45000,
          favoriteDestination: 'Paris, France'
        },
        highlights: [
          'Conheci 8 países diferentes',
          'Experimentei 156 pratos novos',
          'Fiz 2.345 fotos incríveis',
          'Conheci 89 pessoas de todo o mundo',
          'Acumulei 45.000 milhas aéreas'
        ],
        topMoments: [
          {
            title: 'Pôr do Sol em Santorini',
            image: 'https://readdy.ai/api/search-image?query=santorini%20greece%20sunset%20white%20houses%20blue%20domes%20romantic%20beautiful%20golden%20hour&width=400&height=300&seq=moment-1&orientation=landscape',
            description: 'O momento mais mágico do ano foi assistir ao pôr do sol em Oia'
          },
          {
            title: 'Aventura nos Alpes Suíços',
            image: 'https://readdy.ai/api/search-image?query=swiss%20alps%20mountains%20snow%20adventure%20hiking%20beautiful%20scenery%20nature&width=400&height=300&seq=moment-2&orientation=landscape',
            description: 'Trilha inesquecível nas montanhas da Suíça'
          },
          {
            title: 'Gastronomia em Tóquio',
            image: 'https://readdy.ai/api/search-image?query=tokyo%20japan%20sushi%20ramen%20street%20food%20authentic%20cuisine%20delicious%20traditional&width=400&height=300&seq=moment-3&orientation=landscape',
            description: 'Descobri os sabores autênticos da culinária japonesa'
          }
        ]
      },
      {
        id: '2',
        year: 2023,
        title: 'Retrospectiva 2023',
        coverImage: 'https://readdy.ai/api/search-image?query=year%202023%20travel%20memories%20adventure%20destinations%20beautiful%20places%20visited%20journey&width=800&height=500&seq=retro-2023&orientation=landscape',
        stats: {
          countries: 5,
          cities: 15,
          flights: 10,
          hotels: 12,
          totalSpent: 32000,
          favoriteDestination: 'Barcelona, Spain'
        },
        highlights: [
          'Visitei 5 países europeus',
          'Provei 98 vinhos diferentes',
          'Tirei 1.876 fotos',
          'Fiz 45 novos amigos',
          'Acumulei 28.000 milhas'
        ],
        topMoments: [
          {
            title: 'Sagrada Família',
            image: 'https://readdy.ai/api/search-image?query=sagrada%20familia%20barcelona%20gaudi%20architecture%20beautiful%20cathedral%20stunning&width=400&height=300&seq=moment-4&orientation=landscape',
            description: 'A arquitetura de Gaudí me deixou sem palavras'
          },
          {
            title: 'Vinícolas em Portugal',
            image: 'https://readdy.ai/api/search-image?query=portugal%20wine%20vineyard%20douro%20valley%20beautiful%20landscape%20grapes%20wine%20tasting&width=400&height=300&seq=moment-5&orientation=landscape',
            description: 'Tour pelas vinícolas do Vale do Douro'
          },
          {
            title: 'Praias da Costa Amalfitana',
            image: 'https://readdy.ai/api/search-image?query=amalfi%20coast%20italy%20beautiful%20beach%20colorful%20houses%20mediterranean%20sea%20stunning&width=400&height=300&seq=moment-6&orientation=landscape',
            description: 'As praias mais bonitas que já vi'
          }
        ]
      }
    ];
    setRetrospectives(mockRetrospectives);
  };

  const generateRetrospective = async (year: number) => {
    setIsGenerating(true);

    // Simular geração pela IA
    setTimeout(() => {
      const newRetrospective: YearlyRetrospective = {
        id: Date.now().toString(),
        year: year,
        title: `Minhas Aventuras em ${year}`,
        coverImage: `https://readdy.ai/api/search-image?query=year%20${year}%20travel%20memories%20collage%20beautiful%20destinations%20adventure%20journey%20highlights&width=800&height=500&seq=retro-${year}&orientation=landscape`,
        stats: {
          countries: Math.floor(Math.random() * 10) + 1,
          cities: Math.floor(Math.random() * 30) + 5,
          flights: Math.floor(Math.random() * 20) + 3,
          hotels: Math.floor(Math.random() * 25) + 5,
          totalSpent: Math.floor(Math.random() * 50000) + 10000,
          favoriteDestination: 'Paris, France'
        },
        highlights: [
          `Conheci ${Math.floor(Math.random() * 10) + 1} países diferentes`,
          `Experimentei ${Math.floor(Math.random() * 200) + 50} pratos novos`,
          `Fiz ${Math.floor(Math.random() * 3000) + 500} fotos incríveis`,
          `Conheci ${Math.floor(Math.random() * 100) + 20} pessoas de todo o mundo`,
          `Acumulei ${Math.floor(Math.random() * 50000) + 10000} milhas aéreas`
        ],
        topMoments: [
          {
            title: 'Momento Inesquecível 1',
            image: `https://readdy.ai/api/search-image?query=beautiful%20travel%20moment%20${year}%20memorable%20experience%20adventure&width=400&height=300&seq=ai-moment-1-${year}&orientation=landscape`,
            description: 'Um dos momentos mais especiais da viagem'
          },
          {
            title: 'Momento Inesquecível 2',
            image: `https://readdy.ai/api/search-image?query=amazing%20travel%20experience%20${year}%20unforgettable%20journey&width=400&height=300&seq=ai-moment-2-${year}&orientation=landscape`,
            description: 'Experiência única e transformadora'
          },
          {
            title: 'Momento Inesquecível 3',
            image: `https://readdy.ai/api/search-image?query=special%20travel%20memory%20${year}%20beautiful%20destination&width=400&height=300&seq=ai-moment-3-${year}&orientation=landscape`,
            description: 'Memória que ficará para sempre'
          }
        ]
      };

      setRetrospectives(prev => [newRetrospective, ...prev]);
      setIsGenerating(false);
      setSelectedRetrospective(newRetrospective);
    }, 3000);
  };



  const handleShareTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    const link = `${window.location.origin}/travel/shared/${trip.id}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const handleShare = async (config: ShareConfig) => {
    if (!selectedTrip) return;

    try {
      // 1. Sync trip_members table for Users
      // Delete old user members (except owner) and insert new ones
      // In a more complex app, we'd only insert/delete the delta
      const { data: existingMembers } = await supabase
        .from('trip_members')
        .select('user_id, group_id')
        .eq('trip_id', selectedTrip.id);

      // Filter out creator from removal
      const membersToDelete = (existingMembers || []).filter(m =>
        (m.user_id && m.user_id !== selectedTrip.user_id) || m.group_id
      );

      if (membersToDelete.length > 0) {
        await supabase
          .from('trip_members')
          .delete()
          .eq('trip_id', selectedTrip.id)
          .neq('user_id', selectedTrip.user_id);
      }

      // Insert new user members
      if (config.sharedWith.length > 0) {
        const userInserts = config.sharedWith.map(userId => ({
          trip_id: selectedTrip.id,
          user_id: userId,
          role: 'view',
          status: 'accepted'
        }));
        await supabase.from('trip_members').insert(userInserts);
      }

      // Insert new group members
      if (config.sharedGroups.length > 0) {
        const groupInserts = config.sharedGroups.map(groupId => ({
          trip_id: selectedTrip.id,
          group_id: groupId,
          user_id: null,
          role: 'view',
          status: 'accepted'
        }));
        await supabase.from('trip_members').insert(groupInserts);
      }

      // 2. Update UI State and Trip metadata
      const newSharedWith = config.sharedWith.map(userId => {
        const existing = selectedTrip.sharedWith?.find(u => u.id === userId);
        if (existing) return existing;
        const netUser = networkUsers.find(u => u.id === userId);
        return {
          id: userId,
          name: netUser?.full_name || 'Usuário',
          avatar: netUser?.avatar_url || '',
          permission: 'view',
          joinedAt: new Date().toISOString()
        } as SharedUser;
      });

      const updatedTrips = trips.map(t => {
        if (t.id === selectedTrip.id) {
          const updated = {
            ...t,
            visibility: config.visibility,
            sharedWith: newSharedWith,
            isShared: newSharedWith.length > 0 || config.sharedGroups.length > 0,
            metadata: {
              ...t.metadata,
              sharedGroups: config.sharedGroups
            }
          };
          // Update Supabase trips table
          const { id, user_id, created_at, ...updates } = updated;
          updateTrip(id, updates);
          return updated;
        }
        return t;
      });

      setTrips(updatedTrips);
      const updated = updatedTrips.find(t => t.id === selectedTrip.id);
      if (updated) setSelectedTrip(updated);

      // 3. Automate Group Notifications
      // We only notify groups that were newly shared or refreshed in this config
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && config.sharedGroups.length > 0) {
        // Find the user object for the sender (current user)
        const senderUser: User = {
          id: currentUser.id,
          username: currentUser.user_metadata?.username || 'user',
          full_name: currentUser.user_metadata?.full_name || 'Usuário',
          avatar_url: currentUser.user_metadata?.avatar_url || ''
        } as User;

        notifySharedGroups(selectedTrip, config.sharedGroups, senderUser);
      }

      setFeedbackModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'Configurações de compartilhamento salvas!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error sharing trip:', error);
      setFeedbackModal({
        isOpen: true,
        title: 'Erro',
        message: 'Não foi possível salvar as configurações.',
        type: 'danger'
      });
    }
  };

  const handlePublish = async (config: PublishConfig) => {
    if (!selectedTrip) return;

    // 1. Prepare updates for optimistic state and DB
    const isListing = config.isListed;
    const newPrice = isListing ? config.price : 0;
    const newVisibility = (isListing ? 'public' : 'private') as 'public' | 'followers' | 'private';

    const updatedMarketplaceConfig = {
      ...config,
      isListed: isListing,
      price: newPrice,
      currency: 'TM' as 'TM' | 'BRL'
    };

    // Optimistic update locally
    const updatedTrips = trips.map(t => {
      if (t.id === selectedTrip.id) {
        return {
          ...t,
          visibility: newVisibility,
          price_tm: newPrice,
          marketplaceConfig: updatedMarketplaceConfig
        };
      }
      return t;
    });

    setTrips(updatedTrips);
    const updatedLocalTrip = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updatedLocalTrip) setSelectedTrip(updatedLocalTrip);

    try {
      if (isListing) {
        // Create/Update listing in marketplace_listings table
        await createMarketplaceListing({
          trip_id: selectedTrip.id,
          seller_id: (selectedTrip as any).user_id,
          title: selectedTrip.title,
          description: config.description || selectedTrip.description,
          price: newPrice,
          currency: 'TM',
          category: selectedTrip.trip_type
        });

        setFeedbackModal({
          isOpen: true,
          title: 'Sucesso!',
          message: 'Roteiro publicado no Marketplace com sucesso!',
          type: 'success'
        });

        // Broadcast notifications
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: followers } = await supabase
            .from('followers')
            .select('follower_id')
            .eq('following_id', user.id);

          if (followers && followers.length > 0) {
            const notifications = followers.map(f => ({
              user_id: f.follower_id,
              type: 'trip_published',
              title: `Novo Roteiro de ${user.user_metadata?.full_name || 'um viajante'}`,
              message: `Acabou de publicar "${selectedTrip.title}". Confira no Marketplace!`,
              is_read: false,
              related_user_id: user.id
            }));
            await supabase.from('notifications').insert(notifications);
          }

          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'system',
            title: 'Roteiro Publicado!',
            message: `Seu roteiro "${selectedTrip.title}" já está disponível no Marketplace.`,
            is_read: false,
            related_user_id: user.id
          });
        }
      } else {
        // Handle unlisting
        await deleteMarketplaceListing(selectedTrip.id);

        setFeedbackModal({
          isOpen: true,
          title: 'Removido',
          message: 'Roteiro removido do Marketplace.',
          type: 'info'
        });
      }

      // 2. Perform ONE atomic update to the trips table
      // Sanitize fields - remove UI-only virtual fields
      const {
        id, user_id, created_at, // identification
        marketplaceConfig: _mc,
        sharedWith: _sw,
        pendingSuggestions: _ps,
        isShared: _is,
        owner: _own,
        permissions: _perm,
        places: _pl,
        seller: _sel,
        itinerary: _it, // itinerary is a column, but we often treat it separately or it's complex
        ...safeUpdates
      } = updatedLocalTrip as any;

      await updateTrip(selectedTrip.id, {
        ...safeUpdates,
        visibility: newVisibility,
        price_tm: newPrice,
        metadata: {
          ...selectedTrip.metadata,
          marketplaceConfig: updatedMarketplaceConfig
        }
      });

      // Notify MarketplaceTab to refresh
      window.dispatchEvent(new Event('marketplace-updated'));

    } catch (error) {
      console.error('Error publishing trip:', error);
      alert(`Erro ao salvar publicação: ${(error as any).message || 'Erro desconhecido'}`);
      // Revert trips if error (optional, for now just alert)
      refreshTrips();
    }
  };


  const handleLeaveTrip = async (trip: Trip) => {
    if (!confirm('Tem certeza que deseja sair desta viagem compartilhada? Você perderá o acesso a ela e não poderá mais ver ou editar.')) return;

    try {
      const { supabase } = await import('../../../services/supabase');
      // Call RPC
      const { error } = await supabase.rpc('leave_trip', { target_trip_id: trip.id });

      if (error) throw error;

      alert('Você saiu da viagem com sucesso.');
      refreshTrips();
    } catch (err) {
      console.error(err);
      alert('Erro ao sair da viagem.');
    }
  };

  const handleInviteUser = () => {
    if (!shareEmail || !selectedTrip) return;

    const newCollaborator: SharedUser = {
      id: Date.now().toString(),
      name: shareEmail.split('@')[0],
      avatar: `https://readdy.ai/api/search-image?query=professional%20portrait%20person%20smiling%20friendly&width=100&height=100&seq=user-${Date.now()}&orientation=squarish`,
      permission: sharePermission,
      joinedAt: new Date().toISOString()
    };

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        return {
          ...trip,
          isShared: true,
          sharedWith: [...(trip.sharedWith || []), newCollaborator]
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip?.id);
    if (updated) {
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates).catch(err => console.error('Error sharing trip', err));
    }
    alert(`✅ Convite enviado para ${shareEmail}!`);
    setShareEmail('');
  };

  const handleDeleteTrip = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setTripToDelete(trip);
  };

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTrip(tripToDelete.id);
      refreshTrips();
      if (selectedTrip?.id === tripToDelete.id) {
        setIsPlanningModalOpen(false);
        setSelectedTrip(null);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Erro ao excluir viagem. Tente novamente.');
    } finally {
      setTripToDelete(null);
    }
  };




  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('🔗 Link copiado para área de transferência!');
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (!selectedTrip) return;

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        const updatedSharedWith = trip.sharedWith?.filter(user => user.id !== collaboratorId) || [];
        return {
          ...trip,
          sharedWith: updatedSharedWith,
          isShared: updatedSharedWith.length > 0
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) {
      setSelectedTrip(updated);
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates);
    }
  };

  const handleChangePermission = (collaboratorId: string, newPermission: 'view' | 'edit' | 'admin') => {
    if (!selectedTrip) return;

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        return {
          ...trip,
          sharedWith: trip.sharedWith?.map(user =>
            user.id === collaboratorId ? { ...user, permission: newPermission } : user
          )
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) {
      setSelectedTrip(updated);
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates);
    }
  };

  const handleViewSuggestions = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowSuggestionsModal(true);
  };

  const handleApproveSuggestion = (suggestionId: string) => {
    if (!selectedTrip) return;

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        const suggestions = trip.pendingSuggestions || [];
        const suggestion = suggestions.find(s => s.id === suggestionId);

        if (suggestion) {
          let updatedTrip = { ...trip };

          switch (suggestion.type) {
            case 'add_place': {
              const { suggestedDayId, ...activityData } = suggestion.data;
              const dayIdx = suggestedDayId !== undefined ? suggestedDayId : 0;
              const currentDayItinerary = updatedTrip.itinerary?.[dayIdx] || [];

              updatedTrip.itinerary = {
                ...(updatedTrip.itinerary || {}),
                [dayIdx]: [...currentDayItinerary, activityData].sort((a: any, b: any) => (a.time || '').localeCompare(b.time || ''))
              };
              updatedTrip.places = [...(trip.places || []), activityData];
              break;
            }
            case 'remove_place': {
              const rDayIdx = suggestion.data.dayIndex;
              const actId = suggestion.data.activityId;

              if (rDayIdx !== undefined && updatedTrip.itinerary?.[rDayIdx]) {
                updatedTrip.itinerary = {
                  ...updatedTrip.itinerary,
                  [rDayIdx]: updatedTrip.itinerary[rDayIdx].filter((a: any) => String(a.id) !== String(actId))
                };
              }
              updatedTrip.places = (trip.places || []).filter((p: any) => String(p.id) !== String(actId));
              break;
            }
            case 'edit_place': {
              const eDayIdx = suggestion.data.dayIndex;
              const eActId = suggestion.data.activityId;
              const changes = suggestion.data.changes;

              if (eDayIdx !== undefined && updatedTrip.itinerary?.[eDayIdx]) {
                updatedTrip.itinerary = {
                  ...updatedTrip.itinerary,
                  [eDayIdx]: updatedTrip.itinerary[eDayIdx].map((a: any) =>
                    String(a.id) === String(eActId) ? { ...a, ...changes } : a
                  )
                };
              }
              updatedTrip.places = (trip.places || []).map((p: any) =>
                p.id === suggestion.data.placeId ? { ...p, ...changes } : p
              );
              break;
            }
            case 'edit_info':
              updatedTrip = { ...updatedTrip, ...suggestion.data };
              break;
            case 'change_date':
              updatedTrip.start_date = suggestion.data.startDate || trip.start_date;
              updatedTrip.end_date = suggestion.data.endDate || trip.end_date;
              break;
          }

          updatedTrip.pendingSuggestions = suggestions.map(s =>
            s.id === suggestionId ? { ...s, status: 'approved' as const } : s
          );

          return updatedTrip;
        }
      }
      return trip;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) {
      setSelectedTrip(updated);
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates);
    }
    alert('✅ Sugestão aprovada e aplicada ao roteiro!');
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    if (!selectedTrip) return;

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        return {
          ...trip,
          pendingSuggestions: (trip.pendingSuggestions || []).map(s =>
            s.id === suggestionId ? { ...s, status: 'rejected' as const } : s
          )
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) {
      setSelectedTrip(updated);
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates);
    }
    alert('❌ Sugestão rejeitada.');
  };

  const handleAddComment = (suggestionId: string) => {
    if (!commentText.trim() || !selectedTrip) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Você',
      userAvatar:
        'https://readdy.ai/api/search-image?query=professional%20portrait%20person%20smiling%20friendly&width=100&height=100&seq=current-user&orientation=squarish',
      text: commentText,
      createdAt: new Date().toISOString()
    };

    const updatedTrips = trips.map(trip => {
      if (trip.id === selectedTrip.id) {
        return {
          ...trip,
          pendingSuggestions: (trip.pendingSuggestions || []).map(s =>
            s.id === suggestionId
              ? { ...s, comments: [...(s.comments || []), newComment] }
              : s
          )
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) {
      setSelectedTrip(updated);
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates);
    }
    setCommentText('');
  };

  const handleOpenReviewModal = (item: UserExperience) => {
    setSelectedReviewExperience(item);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !selectedReviewExperience) return;

    setIsSubmittingReview(true);
    try {
      const result = await submitExperienceReview({
        experience_id: selectedReviewExperience.experience_id,
        user_id: user.id,
        rating: reviewRating,
        comment: reviewComment
      });

      if (result) {
        alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
        setShowReviewModal(false);
        // We could refresh reviews here but they are mostly shown in Marketplace
      } else {
        alert('Erro ao enviar avaliação. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ocorreu um erro inesperado.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSimulateSuggestion = (trip: Trip) => {
    const suggestionTypes = [
      {
        type: 'add_place' as const,
        description: 'Adicionar Torre Eiffel ao roteiro',
        data: {
          id: Date.now().toString(),
          name: 'Eiffel Tower',
          description: 'Monumento icônico de Paris',
          time: '14:00',
          duration: '2h'
        }
      },
      {
        type: 'edit_info' as const,
        description: 'Alterar orçamento da viagem',
        data: {
          budget: '€€€€'
        }
      },
      {
        type: 'change_date' as const,
        description: 'Estender viagem por mais 2 dias',
        data: {
          endDate: new Date(new Date(trip.end_date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];

    const randomSuggestion = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];

    const newSuggestion: Suggestion = {
      id: Date.now().toString(),
      tripId: trip.id,
      userId: 'collaborator-1',
      userName: 'Maria Silva',
      userAvatar:
        'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly&width=100&height=100&seq=collab-1&orientation=squarish',
      type: randomSuggestion.type,
      description: randomSuggestion.description,
      data: randomSuggestion.data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      comments: []
    };

    const updatedTrips = trips.map(t => {
      if (t.id === trip.id) {
        return {
          ...t,
          pendingSuggestions: [...(t.pendingSuggestions || []), newSuggestion]
        };
      }
      return t;
    });

    setTrips(updatedTrips);
    // Find the updated trip 
    const updated = updatedTrips.find(t => t.id === trip.id);
    if (updated) {
      const { id, user_id, created_at, ...updates } = updated;
      updateTrip(id, updates);
    }
    alert('✨ Nova sugestão simulada adicionada!');
  };

  const getTripTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      leisure: 'ri-sun-line',
      business: 'ri-briefcase-line',
      adventure: 'ri-mountain-line',
      romantic: 'ri-heart-line',
      family: 'ri-group-line',
      cultural: 'ri-building-line'
    };
    return icons[type] || 'ri-map-pin-line';
  };

  const getTripTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      leisure: 'text-orange-500',
      business: 'text-blue-500',
      adventure: 'text-green-500',
      romantic: 'text-pink-500',
      family: 'text-purple-500',
      cultural: 'text-amber-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string; bg: string }> = {
      planning: { text: 'Planejando', color: 'text-blue-600', bg: 'bg-blue-100' },
      confirmed: { text: 'Confirmada', color: 'text-green-600', bg: 'bg-green-100' },
      ongoing: { text: 'Em Andamento', color: 'text-orange-600', bg: 'bg-orange-100' },
      completed: { text: 'Concluída', color: 'text-gray-600', bg: 'bg-gray-100' }
    };
    return badges[status] || badges.planning;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Fix: Appending T00:00:00 ensures local time interpretation for YYYY-MM-DD strings
    // avoiding the -3h timezone offset issue (e.g. 14 -> 13)
    const safeDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    const date = new Date(safeDate);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }); // Force UTC interpretation if input is UTC
  };

  const getDaysUntilTrip = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getSuggestionIcon = (type: string) => {
    const icons: Record<string, string> = {
      add_place: 'ri-map-pin-add-line',
      remove_place: 'ri-map-pin-line',
      edit_place: 'ri-edit-line',
      edit_info: 'ri-information-line',
      change_date: 'ri-calendar-line'
    };
    return icons[type] || 'ri-lightbulb-line';
  };

  const getSuggestionColor = (type: string) => {
    const colors: Record<string, string> = {
      add_place: 'text-green-500',
      remove_place: 'text-red-500',
      edit_place: 'text-blue-500',
      edit_info: 'text-purple-500',
      change_date: 'text-orange-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const getPendingSuggestionsCount = (trip: Trip) => {
    return (trip.pendingSuggestions || []).filter(s => s.status === 'pending').length;
  };

  // Coordinate mapping for major cities (approximate % on the map image)
  const cityCoordinates: Record<string, { top: string; left: string }> = {
    // --- North America ---
    'Orlando': { top: '39%', left: '28%' },
    'Orlando, FL': { top: '39%', left: '28%' },
    'Florida': { top: '40%', left: '28%' },
    'New York': { top: '34%', left: '29%' },
    'New York City': { top: '34%', left: '29%' },
    'NY': { top: '34%', left: '29%' },
    'Nova York': { top: '34%', left: '29%' },
    'Los Angeles': { top: '37%', left: '18%' },
    'LA': { top: '37%', left: '18%' },
    'San Francisco': { top: '36%', left: '17%' },
    'California': { top: '36%', left: '18%' },
    'Miami': { top: '40%', left: '28%' },
    'Las Vegas': { top: '36%', left: '19%' },
    'Chicago': { top: '34%', left: '26%' },
    'Toronto': { top: '33%', left: '28%' },
    'Vancouver': { top: '31%', left: '17%' },
    'Canada': { top: '30%', left: '25%' },
    'Mexico City': { top: '45%', left: '22%' },
    'Mexico': { top: '45%', left: '22%' },
    'Cancun': { top: '44%', left: '24%' },

    // --- South America ---
    'Rio de Janeiro': { top: '75%', left: '33%' },
    'Rio': { top: '75%', left: '33%' },
    'Sao Paulo': { top: '76%', left: '32%' },
    'São Paulo': { top: '76%', left: '32%' },
    'Brasil': { top: '70%', left: '30%' },
    'Brazil': { top: '70%', left: '30%' },
    'Buenos Aires': { top: '82%', left: '30%' },
    'Argentina': { top: '82%', left: '30%' },
    'Bariloche': { top: '85%', left: '28%' },
    'Santiago': { top: '80%', left: '28%' },
    'Chile': { top: '80%', left: '28%' },
    'Lima': { top: '65%', left: '28%' },
    'Peru': { top: '65%', left: '28%' },
    'Cusco': { top: '66%', left: '29%' },
    'Bogota': { top: '55%', left: '28%' },
    'Colombia': { top: '55%', left: '28%' },

    // --- Europe ---
    'London': { top: '30%', left: '48.5%' },
    'Londres': { top: '30%', left: '48.5%' },
    'UK': { top: '29%', left: '48%' },
    'Paris': { top: '32%', left: '49%' },
    'France': { top: '33%', left: '49%' },
    'França': { top: '33%', left: '49%' },
    'Rome': { top: '37%', left: '51%' },
    'Roma': { top: '37%', left: '51%' },
    'Italy': { top: '38%', left: '51%' },
    'Itália': { top: '38%', left: '51%' },
    'Venice': { top: '36%', left: '51.5%' },
    'Veneza': { top: '36%', left: '51.5%' },
    'Milan': { top: '35%', left: '50.5%' },
    'Milão': { top: '35%', left: '50.5%' },
    'Barcelona': { top: '37%', left: '49%' },
    'Madrid': { top: '37%', left: '48%' },
    'Spain': { top: '37%', left: '48%' },
    'Espanha': { top: '37%', left: '48%' },
    'Lisbon': { top: '38%', left: '47%' },
    'Lisboa': { top: '38%', left: '47%' },
    'Portugal': { top: '38%', left: '47%' },
    'Amsterdam': { top: '31%', left: '50%' },
    'Netherlands': { top: '31%', left: '50%' },
    'Holanda': { top: '31%', left: '50%' },
    'Berlin': { top: '31%', left: '51%' },
    'Berlim': { top: '31%', left: '51%' },
    'Munich': { top: '33%', left: '51%' },
    'Germany': { top: '32%', left: '51%' },
    'Alemanha': { top: '32%', left: '51%' },
    'Prague': { top: '32%', left: '52%' },
    'Praga': { top: '32%', left: '52%' },
    'Vienna': { top: '33%', left: '52%' },
    'Viena': { top: '33%', left: '52%' },
    'Zurich': { top: '33%', left: '50.5%' },
    'Suíça': { top: '33%', left: '50.5%' },
    'Athens': { top: '38%', left: '54%' },
    'Atenas': { top: '38%', left: '54%' },
    'Greece': { top: '38%', left: '54%' },
    'Grécia': { top: '38%', left: '54%' },
    'Santorini': { top: '39%', left: '54.5%' },
    'Istanbul': { top: '37%', left: '55%' },
    'Istambul': { top: '37%', left: '55%' },
    'Moscow': { top: '25%', left: '58%' },
    'Moscou': { top: '25%', left: '58%' },
    'Russia': { top: '25%', left: '65%' },
    'Stockholm': { top: '25%', left: '52%' },
    'Estocolmo': { top: '25%', left: '52%' },
    'Dublin': { top: '30%', left: '47%' },
    'Ireland': { top: '30%', left: '47%' },
    'Reykjavik': { top: '20%', left: '45%' },
    'Iceland': { top: '20%', left: '45%' },

    // --- Asia / Middle East ---
    'Tokyo': { top: '35%', left: '82%' },
    'Tokyo, Japan': { top: '35%', left: '82%' },
    'Tokio': { top: '35%', left: '82%' },
    'Japan': { top: '35%', left: '82%' },
    'Japão': { top: '35%', left: '82%' },
    'Kyoto': { top: '36%', left: '81.5%' },
    'Osaka': { top: '36%', left: '81.5%' },
    'Seoul': { top: '35%', left: '79%' },
    'Seul': { top: '35%', left: '79%' },
    'South Korea': { top: '35%', left: '79%' },
    'Coreia do Sul': { top: '35%', left: '79%' },
    'Beijing': { top: '33%', left: '76%' },
    'Pequim': { top: '33%', left: '76%' },
    'Shanghai': { top: '38%', left: '77%' },
    'Xangai': { top: '38%', left: '77%' },
    'China': { top: '35%', left: '75%' },
    'Hong Kong': { top: '42%', left: '76%' },
    'Bangkok': { top: '48%', left: '73%' },
    'Thailand': { top: '48%', left: '73%' },
    'Tailândia': { top: '48%', left: '73%' },
    'Singapore': { top: '53%', left: '74%' },
    'Singapura': { top: '53%', left: '74%' },
    'Bali': { top: '60%', left: '78%' },
    'Indonesia': { top: '58%', left: '77%' },
    'Indonésia': { top: '58%', left: '77%' },
    'Mumbai': { top: '45%', left: '65%' },
    'New Delhi': { top: '40%', left: '66%' },
    'India': { top: '42%', left: '66%' },
    'Maldives': { top: '55%', left: '65%' },
    'Maldivas': { top: '55%', left: '65%' },
    'Vietnam': { top: '46%', left: '75%' },
    'Dubai': { top: '42%', left: '58%' },
    'Dubai, UAE': { top: '42%', left: '58%' },
    'UAE': { top: '42%', left: '58%' },
    'Abu Dhabi': { top: '42.5%', left: '57.5%' },
    'Jerusalem': { top: '40%', left: '56%' },
    'Tel Aviv': { top: '40%', left: '56%' },
    'Israel': { top: '40%', left: '56%' },
    'Doha': { top: '43%', left: '59%' },

    // --- Africa ---
    'Cairo': { top: '40%', left: '55%' },
    'Egypt': { top: '40%', left: '55%' },
    'Cape Town': { top: '82%', left: '53%' },
    'Cidade do Cabo': { top: '82%', left: '53%' },
    'South Africa': { top: '80%', left: '54%' },
    'Marrakech': { top: '39%', left: '46%' },
    'Morocco': { top: '39%', left: '46%' },

    // --- Oceania ---
    'Sydney': { top: '85%', left: '92%' },
    'Australia': { top: '80%', left: '88%' },
    'Austrália': { top: '80%', left: '88%' },
    'Melbourne': { top: '86%', left: '90%' },
    'Auckland': { top: '87%', left: '96%' },
    'New Zealand': { top: '88%', left: '95%' },
    'Nova Zelândia': { top: '88%', left: '95%' },
    'Fiji': { top: '75%', left: '97%' }

  };

  const destinations = trips
    .filter(t => t.destination) // Ensure destination exists
    .map((trip, idx) => {
      // Try to find exact match or partial match
      const cityKey = Object.keys(cityCoordinates).find(key =>
        trip.destination.includes(key) || key.includes(trip.destination)
      );

      const position = cityKey ? cityCoordinates[cityKey] : { top: '50%', left: '50%' }; // Default to center if unknown

      // Determine continent roughly (fallback)
      let continent = 'Unknown';
      if (position.left < '30%') continent = 'Americas';
      else if (position.left > '60%') continent = 'Asia/Oceania';
      else if (position.top > '50%') continent = 'Africa/South America';
      else continent = 'Europe';

      return {
        id: trip.id,
        name: trip.destination,
        country: trip.destination.split(',')[1] || 'Unknown',
        continent: continent,
        dates: `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`,
        travelers: trip.travelers || 1,
        places: trip.places?.length || 0,
        color: ['blue', 'purple', 'orange', 'green', 'pink', 'cyan', 'yellow', 'red'][idx % 8],
        position: position,
        image: trip.cover_image || `https://readdy.ai/api/search-image?query=${encodeURIComponent(trip.destination)}%20travel%20landmark&width=400&height=300&orientation=landscape`,
        isUnknownLocation: !cityKey // Flag to maybe hide or style differently
      };
    })
    // Filter out unknown locations if you want to avoid clustering at center, 
    // OR keep them to show the user their trip IS there even if map is generic.
    // For now, let's keep them but maybe the user will see they are in the middle of the ocean.
    // Actually, let's filter only valid coordinates to avoid "middle of ocean" clustering which looks broken.
    .filter(d => !d.isUnknownLocation);



  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsPlanningModalOpen(true);
  };

  const filteredTrips = trips
    .filter(trip => {
      const matchesSearch =
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      if (filterStatus === 'shared') {
        return trip.isShared || (trip.sharedWith && trip.sharedWith.length > 0) || trip.marketplaceConfig?.isListed;
      }
      if (filterStatus === 'approvals') {
        return trip.pendingSuggestions?.some((s: any) => s.status === 'pending');
      }
      return trip.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'date') return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      // default: recent (by created_at or start_date descending)
      return new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime();
    });

  const renderTripsContent = () => (
    <>


      {/* Refined Search & Filter Header (Matched to Reference) */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 space-y-4">
        {/* Search Bar Row */}
        <div className="relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/10 transition-all text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Filters & Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'planning', label: 'Planejando' },
              { id: 'shared', label: 'Compartilhadas' },
              { id: 'approvals', label: 'Pendentes' },
              { id: 'completed', label: 'Concluídas' },
            ].map((chip) => {
              const isActive = filterStatus === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilterStatus(chip.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive
                    ? 'bg-[#FF6B35] text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                <i className="ri-arrow-down-s-line"></i>
                {sortBy === 'recent' ? 'Mais Recentes' : sortBy === 'title' ? 'Título' : 'Data'}
              </button>

              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    {[
                      { id: 'recent', label: 'Mais Recentes' },
                      { id: 'title', label: 'Título' },
                      { id: 'date', label: 'Data da Viagem' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id as any);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${sortBy === option.id
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {option.label}
                        {sortBy === option.id && <i className="ri-check-line"></i>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-gray-100 mx-1"></div>

            {/* View Toggles */}
            <div className="flex items-center p-1 bg-gray-50 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid'
                  ? 'bg-white text-orange-600 shadow-sm border border-gray-100'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
                title="Visualização em Cards"
              >
                <i className="ri-grid-fill text-lg"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list'
                  ? 'bg-white text-orange-600 shadow-sm border border-gray-100'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
                title="Visualização em Lista"
              >
                <i className="ri-list-check text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Content */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <i className="ri-search-line text-4xl"></i>
          </div>
          <h4 className="text-xl font-bold text-gray-700 mb-2">Nenhuma viagem encontrada</h4>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchTerm ? `Não encontramos resultados para "${searchTerm}". Tente uma busca diferente.` : 'Não há viagens nesta categoria.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-orange-600 font-bold text-sm hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const statusBadge = getStatusBadge(trip.status);
            const daysUntil = getDaysUntilTrip(trip.start_date);
            const pendingCount = getPendingSuggestionsCount(trip);

            return (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      trip.cover_image ||
                      `https://readdy.ai/api/search-image?query=${trip.destination}%20beautiful%20travel%20destination%20scenic%20view&width=400&height=300&seq=trip-${trip.id}&orientation=landscape`
                    }
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg ${statusBadge.color} ${statusBadge.bg}`}
                    >
                      {statusBadge.text}
                    </span>
                    {trip.isShared && (
                      <div className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium flex items-center gap-1 shadow-lg border border-white/20">
                        <i className="ri-group-line"></i>
                        Compartilhada
                      </div>
                    )}
                  </div>

                  {trip.permissions === 'admin' && (
                    <button
                      onClick={(e) => handleDeleteTrip(e, trip)}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg translate-y-2 group-hover:translate-y-0"
                      title="Excluir Viagem"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}

                  {pendingCount > 0 && trip.permissions === 'admin' && (
                    <div className="absolute top-12 right-3">
                      <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium flex items-center gap-1 animate-pulse border border-white/20 shadow-lg">
                        <i className="ri-notification-3-line"></i>
                        {pendingCount}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-0.5 truncate">{trip.title}</h3>
                    <div className="flex items-center gap-1 text-white/90 text-xs">
                      <i className="ri-map-pin-line text-orange-400"></i>
                      <span className="truncate">{trip.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <i className="ri-calendar-line text-orange-500"></i>
                      <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    </div>
                    {daysUntil > 0 && daysUntil < 30 && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Em {daysUntil} dias
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                      <i className={`${getTripTypeIcon(trip.trip_type)} ${getTripTypeColor(trip.trip_type)} text-xs`}></i>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{trip.trip_type}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                      <i className="ri-group-line text-blue-500 text-xs"></i>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{trip.travelers} pessoas</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {pendingCount > 0 && trip.permissions === 'admin' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewSuggestions(trip); }}
                        className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <i className="ri-notification-3-line"></i>
                        Revisar
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTrip(trip); setActiveSubTab('newtrip'); }}
                      className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center border border-gray-100"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    {trip.permissions === 'admin' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); setShowShareModal(true); }}
                        className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center border border-gray-100"
                      >
                        <i className="ri-share-forward-line"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const statusBadge = getStatusBadge(trip.status);
            const daysUntil = getDaysUntilTrip(trip.start_date);
            const pendingCount = getPendingSuggestionsCount(trip);

            return (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip)}
                className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer group hover:border-orange-200"
              >
                {/* Compact Thumbnail */}
                <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img
                    src={trip.cover_image || `https://readdy.ai/api/search-image?query=${trip.destination}%20city&width=200&height=200`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={trip.title}
                  />
                  <div className="absolute top-2 left-2 sm:hidden">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.color} ${statusBadge.bg}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-orange-600 transition-colors">
                      {trip.title}
                    </h4>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.color} ${statusBadge.bg}`}>
                        {statusBadge.text}
                      </span>
                      {trip.isShared && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Compartilhada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-map-pin-line text-orange-500"></i>
                      <span className="font-medium text-gray-700">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-calendar-line text-orange-400"></i>
                      <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 uppercase text-[10px] font-bold tracking-tight">
                        <i className={getTripTypeIcon(trip.trip_type)}></i>
                        {trip.trip_type}
                      </span>
                      <span className="flex items-center gap-1 uppercase text-[10px] font-bold tracking-tight">
                        <i className="ri-group-line"></i>
                        {trip.travelers} pessoas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {pendingCount > 0 && trip.permissions === 'admin' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold border border-amber-200 animate-pulse">
                      <i className="ri-notification-3-line"></i>
                      {pendingCount} Pendentes
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTrip(trip); setActiveSubTab('newtrip'); }}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                      title="Editar"
                    >
                      <i className="ri-edit-line text-xl"></i>
                    </button>
                    {trip.permissions === 'admin' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); setShowShareModal(true); }}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                          title="Compartilhar"
                        >
                          <i className="ri-share-forward-line text-xl"></i>
                        </button>
                        <button
                          onClick={(e) => handleDeleteTrip(e, trip)}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line text-xl"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trip Planning Modal */}
      {
        selectedTrip && (
          <TripPlanningModal
            isOpen={isPlanningModalOpen}
            onClose={() => {
              setIsPlanningModalOpen(false);
              setSelectedTrip(null);
              refreshTrips(); // Refresh to get latest data including itinerary updates
            }}
            trip={{
              ...selectedTrip,
              cover_image: selectedTrip.cover_image || `https://readdy.ai/api/search-image?query=${selectedTrip.destination}%20beautiful%20travel%20destination%20scenic%20view&width=800&height=400&seq=trip-modal-${selectedTrip.id}&orientation=landscape`
            }}
            onTripUpdated={(updatedTrip) => {
              setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
              setSelectedTrip(updatedTrip);
            }}
            onApproveSuggestion={handleApproveSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
          />
        )
      }

    </>
  );





  const renderMapsContent = () => {
    const stats = {
      destinations: new Set(trips.map(t => t.destination)).size,
      countries: new Set(trips.map(t => t.destination.split(',')[0])).size,
      days: trips.reduce((acc, trip) => {
        if (!trip.start_date || !trip.end_date) return acc;
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0),
      km: (trips.length * 3500).toLocaleString('pt-BR'),
      travelers: trips.reduce((acc, trip) => acc + (trip.travelers || 0), 0),
      places: trips.reduce((acc, trip) => acc + (trip.places?.length || 0), 0),
      continents: 5,
      cities: new Set(trips.map(t => t.destination)).size,
      photos: (trips.filter(t => t.status === 'completed').length * 247).toLocaleString('pt-BR'),
      flightHours: trips.length * 8
    };

    return (
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* Top KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                <i className="ri-earth-line"></i>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{stats.destinations}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Destinos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                <i className="ri-flag-line"></i>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{stats.countries}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Países</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                <i className="ri-calendar-check-line"></i>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{stats.days}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Dias Viajando</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                <i className="ri-flight-takeoff-line"></i>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 leading-none">{stats.km}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">KM Percorridos</p>
              </div>
            </div>
          </div>
        </div>

        {/* World Map Section */}
        <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                <i className="ri-earth-fill text-emerald-500 animate-pulse"></i>
                Exploração Global
              </h3>
              <p className="text-gray-500 font-medium mt-1">Sua jornada detalhada no mapa do mundo</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 rounded-[24px] shadow-lg shadow-orange-100 text-white">
              <i className="ri-map-pin-2-fill text-2xl"></i>
              <div>
                <p className="text-2xl font-black leading-none">{destinations.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Pins no Mapa</p>
              </div>
            </div>
          </div>

          {/* World Map Image Container */}
          <div className="relative w-full h-[700px] bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <img
              src="https://readdy.ai/api/search-image?query=world%20map%20detailed%20continents%20countries%20geography%20political%20boundaries%20clean%20design%20bright%20colors%20high%20quality%20light%20background%20simple%20modern%20style&width=1600&height=700&seq=world-map-pins-v3&orientation=landscape"
              alt="Mapa Múndi"
              className="w-full h-full object-cover opacity-90"
            />

            {/* Interactive Pins */}
            <div className="absolute inset-0">
              {destinations.map((destination, idx) => (
                <div
                  key={idx}
                  className="absolute group cursor-pointer z-10"
                  style={{
                    top: destination.position.top,
                    left: destination.position.left,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 w-24 h-24 -translate-x-8 -translate-y-8 bg-blue-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-white shadow-2xl flex items-center justify-center hover:scale-125 transition-all duration-300 animate-bounce">
                      <i className="ri-map-pin-fill text-white text-3xl"></i>
                    </div>
                  </div>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 min-w-[320px] border-4 border-orange-200">
                      <div className="flex items-start gap-5">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                          <i className="ri-map-pin-fill text-white text-4xl"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-gray-900 text-xl mb-1 truncate uppercase tracking-tight">{destination.name}</h4>
                          <p className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-widest">{destination.country}</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                              <i className="ri-calendar-line text-orange-500 text-lg"></i>
                              <span>{destination.dates}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                              <i className="ri-group-line text-orange-500 text-lg"></i>
                              <span>{destination.travelers} VIAJANTES</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                              <i className="ri-map-pin-2-line text-orange-500 text-lg"></i>
                              <span>{destination.places} LOCAIS VISITADOS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-6 h-6 bg-white border-r-4 border-b-4 border-orange-200 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-sm font-black">{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 border-2 border-orange-100 max-w-xs scale-90 origin-bottom-left hover:scale-100 transition-all">
              <h4 className="font-black text-gray-900 text-xl mb-6 flex items-center gap-3 uppercase tracking-tighter">
                <i className="ri-guide-line text-orange-500 text-3xl"></i>
                Guia do Mapa
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center">
                    <i className="ri-map-pin-fill text-white text-lg"></i>
                  </div>
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest leading-none">Destino Concluído</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-black">1</span>
                  </div>
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest leading-none">Sequência de Visita</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards Below Map */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm hover:translate-y-[-5px] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-2xl">
                  <i className="ri-group-line"></i>
                </div>
                <span className="text-2xl font-black text-gray-900">{stats.travelers}</span>
              </div>
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Viajantes</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase leading-none">Pessoas em sua rede</p>
            </div>

            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm hover:translate-y-[-5px] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl">
                  <i className="ri-map-pin-2-line"></i>
                </div>
                <span className="text-2xl font-black text-gray-900">{stats.places}</span>
              </div>
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Pontos de Interesse</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase leading-none">Atrações visitadas</p>
            </div>

            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm hover:translate-y-[-5px] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-2xl">
                  <i className="ri-camera-line"></i>
                </div>
                <span className="text-2xl font-black text-gray-900">{stats.photos}</span>
              </div>
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Momentos</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase leading-none">Fotos registradas</p>
            </div>

            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm hover:translate-y-[-5px] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center text-2xl">
                  <i className="ri-plane-line"></i>
                </div>
                <span className="text-2xl font-black text-gray-900">{stats.flightHours}h</span>
              </div>
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Log de Voo</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase leading-none">Horas totais</p>
            </div>
          </div>
        </div>

        {/* Breakdown Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <i className="ri-global-line text-purple-500"></i>
              Mundo por Continentes
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Europa', color: 'bg-blue-500', icon: '🌍', percent: 40, count: Math.floor(trips.length * 0.4) },
                { name: 'América', color: 'bg-green-500', icon: '🌎', percent: 30, count: Math.floor(trips.length * 0.3) },
                { name: 'Ásia', color: 'bg-orange-500', icon: '🌏', percent: 20, count: Math.floor(trips.length * 0.2) },
                { name: 'África', color: 'bg-yellow-500', icon: '🌍', percent: 7, count: Math.floor(trips.length * 0.07) },
                { name: 'Oceania', color: 'bg-cyan-500', icon: '🌏', percent: 3, count: Math.floor(trips.length * 0.03) }
              ].map((cont) => (
                <div key={cont.name} className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{cont.icon}</span>
                      <span className="font-black text-gray-900 uppercase tracking-widest text-xs">{cont.name}</span>
                    </div>
                    <span className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{cont.count}</span>
                  </div>
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div
                      className={`h-full ${cont.color} rounded-full transition-all duration-1000 group-hover:opacity-80`}
                      style={{ width: `${cont.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <i className="ri-suitcase-fill text-orange-500"></i>
              Perfil do Viajante
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'Lazer', icon: 'ri-sun-line', color: 'bg-orange-50 text-orange-600', val: trips.filter(t => t.trip_type === 'leisure').length },
                { type: 'Negócios', icon: 'ri-briefcase-line', color: 'bg-blue-50 text-blue-600', val: trips.filter(t => t.trip_type === 'business').length },
                { type: 'Aventura', icon: 'ri-mountain-line', color: 'bg-green-50 text-green-600', val: trips.filter(t => t.trip_type === 'adventure').length },
                { type: 'Cultural', icon: 'ri-bank-line', color: 'bg-amber-50 text-amber-600', val: trips.filter(t => t.trip_type === 'cultural').length }
              ].map((item) => (
                <div key={item.type} className={`p-6 rounded-[24px] ${item.color} flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform`}>
                  <i className={`${item.icon} text-4xl mb-3`}></i>
                  <span className="text-2xl font-black leading-none">{item.val}</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Horizontal List */}
        <div className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-gray-900 text-2xl uppercase tracking-tighter flex items-center gap-3">
              <i className="ri-history-line text-blue-500 font-normal"></i>
              Linha do Tempo ({destinations.length})
            </h4>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-2">
            {destinations.map((dest, i) => (
              <div key={i} className="flex-shrink-0 w-72 bg-gray-50 rounded-[40px] p-8 border border-gray-100 group hover:bg-white hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform"></div>
                <div className="flex items-center gap-4 mb-6 relative">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-gray-900 border-2 border-gray-100 shadow-sm group-hover:border-blue-500 transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-gray-900 text-lg truncate uppercase tracking-tight leading-none">{dest.name}</h5>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">{dest.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-white px-5 py-3 rounded-2xl border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-200 group-hover:text-orange-600 transition-all uppercase tracking-widest">
                  <i className="ri-calendar-line text-orange-500 text-lg"></i>
                  {dest.dates}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 group hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20"></div>
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🇺🇸</div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Estados Unidos</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Território Visitado</p>
                </div>
              </div>
              <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg shadow-blue-100">20%</div>
            </div>
            <div className="space-y-6 relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">10/50 Estados</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faltam 40</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['NY', 'CA', 'FL', 'TX', 'NV', 'IL', 'MA', 'WA', 'AZ', 'CO'].map((s, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black border border-blue-100 uppercase">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 group hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full -mr-20 -mt-20"></div>
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🇧🇷</div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Brasil</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Território Visitado</p>
                </div>
              </div>
              <div className="bg-green-500 text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg shadow-green-100">30%</div>
            </div>
            <div className="space-y-6 relative">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">8/27 Estados</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faltam 19</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['SP', 'RJ', 'BA', 'MG', 'RS', 'PR', 'SC', 'PE'].map((s, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-xl text-[10px] font-black border border-green-100 uppercase">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoalsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3 flex items-center gap-2">
          <i className="ri-trophy-line"></i>
          Metas de Viagens
        </h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">Visitar 10 Países</h4>
            <span className="text-sm font-semibold text-amber-600">
              {new Set(trips.map(t => t.destination)).size}/10
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(new Set(trips.map(t => t.destination)).size / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">100 Dias Viajando</h4>
            <span className="text-sm font-semibold text-blue-600">
              {trips.reduce((acc, trip) => {
                const start = new Date(trip.start_date);
                const end = new Date(trip.end_date);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                return acc + days;
              }, 0)}/100
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{
                width: `${(trips.reduce((acc, trip) => {
                  const start = new Date(trip.start_date);
                  const end = new Date(trip.end_date);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  return acc + days;
                }, 0) / 100) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">5 Viagens Concluídas</h4>
            <span className="text-sm font-semibold text-green-600">
              {trips.filter(t => t.status === 'completed').length}/5
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${(trips.filter(t => t.status === 'completed').length / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">3 Viagens Compartilhadas</h4>
            <span className="text-sm font-semibold text-purple-600">
              {trips.filter(t => t.isShared).length}/3
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${(trips.filter(t => t.isShared).length / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuggestionsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-yellow-400 pl-3 flex items-center gap-2">
          <i className="ri-lightbulb-line"></i>
          Sugestões de Viagens
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-plane-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Europa no Verão</h4>
              <p className="text-xs text-gray-600">Melhor época para visitar</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Explore as cidades europeias durante o verão com clima perfeito e festivais incríveis.</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-mountain-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Trilhas na América do Sul</h4>
              <p className="text-xs text-gray-600">Aventura e natureza</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Descubra trilhas incríveis em Machu Picchu, Patagônia e outros destinos deslumbrantes.</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-200 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <i className="ri-sun-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Praias do Caribe</h4>
              <p className="text-xs text-gray-600">Relaxamento total</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Aproveite as praias paradisíacas do Caribe com águas cristalinas e resorts de luxo.</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <i className="ri-building-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Cultura Asiática</h4>
              <p className="text-xs text-gray-600">Experiência única</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Mergulhe na rica cultura asiática visitando templos, mercados e cidades históricas.</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <i className="ri-heart-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Lua de Mel em Paris</h4>
              <p className="text-xs text-gray-600">Romântico e inesquecível</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Celebre o amor na cidade mais romântica do mundo com experiências exclusivas.</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <i className="ri-group-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Viagens em Família</h4>
              <p className="text-xs text-gray-600">Diversão para todos</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Destinos perfeitos para toda a família com atividades para todas as idades.</p>
        </div>
      </div>
    </div>
  );

  const renderRetrospectivesContent = () => {
    if (!selectedTrip && !selectedRetrospective) {
      // Step 1: Select a trip to generate a retrospective
      const completedTrips = trips.filter(t => t.status === 'completed' || t.status === 'confirmed' || t.status === 'planning');
      
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-robot-2-line text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2">Retrospectiva Inteligente</h3>
            <p className="text-white/90 text-sm max-w-md mx-auto">
              Selecione uma viagem e nossa IA analisará seu roteiro, fotos e anotações para criar um resumo inesquecível da sua experiência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrips.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <i className="ri-flight-takeoff-line text-4xl text-gray-400 mb-3"></i>
                <h4 className="font-bold text-gray-700">Nenhuma viagem disponível</h4>
                <p className="text-sm text-gray-500">Você precisará completar uma viagem antes de gerar uma retrospectiva.</p>
              </div>
            ) : (
              completedTrips.map(trip => (
                <div 
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer group"
                >
                  <div className="h-40 relative">
                    <img src={trip.cover_image || `https://readdy.ai/api/search-image?query=${trip.destination}&width=400&height=300`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-lg leading-tight truncate">{trip.title}</h4>
                      <p className="text-xs opacity-90"><i className="ri-map-pin-line"></i> {trip.destination}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                      {formatDate(trip.start_date)}
                    </span>
                    <button className="text-purple-600 font-bold text-sm hover:text-purple-700 pointer-events-none group-hover:translate-x-1 transition-transform">
                      Gerar <i className="ri-arrow-right-line align-middle"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {retrospectives.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-purple-500 pl-3">Retrospectivas Salvas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {retrospectives.map((retro) => (
                  <div
                    key={retro.id}
                    onClick={() => setSelectedRetrospective(retro)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer group flex h-32"
                  >
                    <div className="w-32 h-full flex-shrink-0 relative overflow-hidden">
                      <img src={retro.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-4 flex flex-col justify-center flex-1">
                      <h4 className="font-bold text-gray-900 truncate">{retro.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{retro.year} • {retro.stats.countries} Países</p>
                      <button className="text-left text-xs font-bold text-purple-600 hover:text-purple-700 mt-auto">
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selectedTrip && !selectedRetrospective && !isGenerating) {
      // Step 2: Confirmation and AI Options before generating
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <button onClick={() => setSelectedTrip(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <i className="ri-arrow-left-line"></i> Voltar
          </button>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
             <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden shadow-md">
                <img src={selectedTrip.cover_image || `https://readdy.ai/api/search-image?query=${selectedTrip.destination}&width=200&height=200`} className="w-full h-full object-cover" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedTrip.title}</h3>
             <p className="text-gray-500 mb-6">{selectedTrip.destination} • {formatDate(selectedTrip.start_date)}</p>
             
             <div className="bg-purple-50 rounded-xl p-4 text-left space-y-3 mb-6">
                <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                  <i className="ri-brain-line"></i> A IA analisará:
                </h4>
                <ul className="text-xs text-purple-800 space-y-2 ml-1">
                  <li className="flex items-center gap-2"><i className="ri-check-line text-purple-500"></i> Seu roteiro (locais e restaurantes)</li>
                  <li className="flex items-center gap-2"><i className="ri-check-line text-purple-500"></i> Suas fotos salvas no diário</li>
                  <li className="flex items-center gap-2"><i className="ri-check-line text-purple-500"></i> Avaliações e anotações ({journalEntries.length} itens)</li>
                </ul>
             </div>

             <button
               onClick={() => generateRetrospective(new Date(selectedTrip.end_date).getFullYear())}
               className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
             >
               <i className="ri-magic-line text-xl"></i>
               Iniciar Geração da Retrospectiva
             </button>
          </div>
        </div>
      );
    }
    
    if (isGenerating) {
       return (
         <div className="py-20 text-center flex flex-col items-center justify-center">
             <div className="w-20 h-20 relative mb-6">
                <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                   <i className="ri-robot-2-line text-3xl text-white animate-pulse"></i>
                </div>
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">A IA está trabalhando...</h3>
             <p className="text-gray-500 max-w-sm mx-auto animate-pulse">
                Analisando fotos, lendo seu roteiro e compilando os melhores momentos. Isso pode levar alguns segundos.
             </p>
         </div>
       )
    }

    if (selectedRetrospective) {
      // Step 3: View the generated retrospective
      return (
        <div className="space-y-6">
           <button onClick={() => { setSelectedRetrospective(null); setSelectedTrip(null); }} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <i className="ri-arrow-left-line"></i> Voltar
          </button>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-64 sm:h-80">
              <img src={selectedRetrospective.coverImage} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold mb-3 border border-white/30">
                  <i className="ri-calendar-event-fill mr-1"></i> Resumo {selectedRetrospective.year}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{selectedRetrospective.title}</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <i className="ri-map-pin-user-fill text-2xl text-purple-500 mb-1"></i>
                  <div className="text-2xl font-black text-gray-900">{selectedRetrospective.stats.cities}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Cidades</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <i className="ri-camera-lens-fill text-2xl text-pink-500 mb-1"></i>
                  <div className="text-2xl font-black text-gray-900">124</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Fotos Analisadas</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <i className="ri-goblet-fill text-2xl text-red-500 mb-1"></i>
                  <div className="text-2xl font-black text-gray-900">8</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Vinhos/Drinks</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <i className="ri-restaurant-fill text-2xl text-orange-500 mb-1"></i>
                  <div className="text-2xl font-black text-gray-900">12</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Restaurantes</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-purple-500 pl-3">Destaques da Viagem</h3>
              <div className="space-y-4 mb-8">
                {selectedRetrospective.highlights.slice(0, 3).map((highlight, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 font-medium self-center">{highlight}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-pink-500 pl-3">Top Momentos (Vídeo Gerado)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {selectedRetrospective.topMoments.map((moment, idx) => (
                   <div key={idx} className="rounded-xl overflow-hidden border border-gray-100 group cursor-pointer relative">
                      <img src={moment.image} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <h5 className="text-white font-bold text-sm leading-tight">{moment.title}</h5>
                         <p className="text-white/80 text-[10px] mt-1 line-clamp-2">{moment.description}</p>
                      </div>
                   </div>
                ))}
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                 <i className="ri-share-forward-line text-xl"></i>
                 Compartilhar Vídeo Resumo
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  const handleDeleteJournalEntry = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      await deleteJournalEntry(id);
      setJournalEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setApiError(error);
      setShowErrorModal(true);
    }
  };

  const handleSubmitJournalEntry = async () => {
    if (!selectedJournalTrip || !user) return;
    if (!newJournalEntry.title) {
      alert('Por favor, insira um título');
      return;
    }

    try {
      const entry = await createJournalEntry({
        trip_id: selectedJournalTrip.id,
        user_id: user.id,
        day_number: activeJournalDay,
        type: newJournalEntry.type,
        title: newJournalEntry.title,
        content: newJournalEntry.content,
        rating: newJournalEntry.rating,
        media_url: newJournalEntry.media_url,
        metadata: {}
      });

      setJournalEntries(prev => [...prev, entry]);
      setIsAddingJournalEntry(false);
      setNewJournalEntry({
        type: 'general',
        title: '',
        content: '',
        rating: 5,
        media_url: ''
      });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setApiError(error);
      setShowErrorModal(true);
    }
  };

  const renderAddJournalEntryModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center flex-1">Novo Registro - Dia {activeJournalDay}</h3>
            <button onClick={() => setIsAddingJournalEntry(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Categoria</label>
                <select
                  value={newJournalEntry.type}
                  onChange={(e) => setNewJournalEntry({ ...newJournalEntry, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="general">Geral</option>
                  <option value="culinary">Gastronomia</option>
                  <option value="wine">Vinhos</option>
                  <option value="excursion">Passeios</option>
                  <option value="photo">Foto Especial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Avaliação</label>
                <div className="flex gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewJournalEntry({ ...newJournalEntry, rating: star })}
                      className={`text-2xl ${newJournalEntry.rating >= star ? 'text-amber-500' : 'text-gray-200'}`}
                    >
                      <i className={newJournalEntry.rating >= star ? "ri-star-fill" : "ri-star-line"}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Título</label>
              <input
                type="text"
                value={newJournalEntry.title}
                onChange={(e) => setNewJournalEntry({ ...newJournalEntry, title: e.target.value })}
                placeholder="Ex: Almoço no Restaurante X, Degustação de Vinhos..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Descrição / Notas</label>
              <textarea
                value={newJournalEntry.content}
                onChange={(e) => setNewJournalEntry({ ...newJournalEntry, content: e.target.value })}
                rows={4}
                placeholder="Conte mais sobre essa experiência..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">URL da Imagem (Upload em breve)</label>
              <input
                type="text"
                value={newJournalEntry.media_url}
                onChange={(e) => setNewJournalEntry({ ...newJournalEntry, media_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleSubmitJournalEntry}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              Salvar no Diário
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJournalContent = () => {
    if (!selectedJournalTrip) {
      const journalTrips = trips.filter(t => t.status !== 'planning');

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
              Diário de Viagens
            </h3>
          </div>

          {journalTrips.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-400">
                <i className="ri-road-map-line text-4xl"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhuma viagem em andamento ou concluída</h4>
              <p className="text-gray-600 max-w-sm mx-auto">
                Inicie uma viagem para começar a registrar seus momentos inesquecíveis!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {journalTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => {
                    setSelectedJournalTrip(trip);
                    setActiveJournalDay(1);
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer group"
                >
                  <div className="relative h-40">
                    <img
                      src={trip.cover_image || `https://readdy.ai/api/search-image?query=${encodeURIComponent(trip.destination)}%20travel&width=400&height=300`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={trip.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-lg">{trip.title}</h4>
                      <p className="text-white/80 text-xs flex items-center gap-1">
                        <i className="ri-map-pin-line text-orange-400"></i>
                        {trip.destination}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const dayCount = getTripDayCount(selectedJournalTrip);
    const dayDate = getJournalDayDate(selectedJournalTrip, activeJournalDay);
    const dayEntries = journalEntries.filter(e => e.day_number === activeJournalDay);

    return (
      <div className="space-y-6">
        {/* Journal Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedJournalTrip(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <i className="ri-arrow-left-line"></i>
              Voltar para lista
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedJournalTrip.title}</h3>
              <p className="text-gray-500 text-sm font-medium">Meu Diário de Bordo</p>
            </div>
            <div className="w-[120px]"></div> {/* Balance for back button */}
          </div>

          {/* Day Selector */}
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
            {Array.from({ length: dayCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveJournalDay(i + 1)}
                className={`flex-shrink-0 w-24 h-28 rounded-[28px] flex flex-col items-center justify-center transition-all ${activeJournalDay === i + 1
                  ? 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white shadow-xl scale-110 z-10'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500'
                  }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Dia</span>
                <span className="text-3xl font-black leading-none">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Day Timeline */}
        <div className="relative pl-12 sm:pl-16 space-y-10 min-h-[400px]">
          {/* Timeline Vertical Line */}
          <div className="absolute left-[23px] sm:left-[31px] top-6 bottom-6 w-1 bg-gradient-to-b from-orange-500/50 via-pink-500/50 to-purple-500/50 rounded-full"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-2xl font-black text-gray-900 capitalize">
                {dayDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <i className="ri-pulse-line text-orange-500"></i>
                <span>{dayEntries.length} {dayEntries.length === 1 ? 'experiência registrada' : 'experiências registradas'}</span>
              </div>
            </div>
            <button
              onClick={() => setIsAddingJournalEntry(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200"
            >
              <i className="ri-quill-pen-line"></i>
              Registrar Agora
            </button>
          </div>

          {dayEntries.length === 0 ? (
            <div className="bg-white/50 rounded-[40px] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-soft flex items-center justify-center mx-auto mb-6 text-gray-300 transform -rotate-12 group-hover:rotate-0 transition-transform">
                <i className="ri-image-add-line text-4xl"></i>
              </div>
              <h5 className="text-xl font-bold text-gray-900 mb-2">Este dia ainda está em branco</h5>
              <p className="text-gray-500 max-w-xs mx-auto">Conte sobre suas descobertas, pratos novos ou lugares incríveis que visitou hoje.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {dayEntries.map((entry) => (
                <div key={entry.id} className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group overflow-hidden">
                  {/* Decorative Gradient Bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${entry.type === 'culinary' ? 'bg-orange-500' :
                    entry.type === 'wine' ? 'bg-purple-600' :
                      entry.type === 'excursion' ? 'bg-blue-500' :
                        entry.type === 'photo' ? 'bg-pink-500' : 'bg-gray-400'
                    }`}></div>

                  {/* Timeline Dot with Indicator */}
                  <div className={`absolute -left-[44px] sm:-left-[52px] top-10 w-6 h-6 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center ${entry.type === 'culinary' ? 'bg-orange-500' :
                    entry.type === 'wine' ? 'bg-purple-600' :
                      entry.type === 'excursion' ? 'bg-blue-500' :
                        entry.type === 'photo' ? 'bg-pink-500' : 'bg-gray-400'
                    }`}>
                    <i className={`${entry.type === 'culinary' ? 'ri-restaurant-line' :
                      entry.type === 'wine' ? 'ri-goblet-line' :
                        entry.type === 'excursion' ? 'ri-map-2-line' :
                          entry.type === 'photo' ? 'ri-camera-lens-line' : 'ri-edit-line'
                      } text-[10px] text-white`}></i>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    {entry.media_url && (
                      <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                        <img src={entry.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={entry.title} />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${entry.type === 'culinary' ? 'bg-orange-100 text-orange-600' :
                              entry.type === 'wine' ? 'bg-purple-100 text-purple-600' :
                                entry.type === 'excursion' ? 'bg-blue-100 text-blue-600' :
                                  entry.type === 'photo' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                              {entry.type === 'culinary' ? 'Gastronomia' :
                                entry.type === 'wine' ? 'Vinhos' :
                                  entry.type === 'excursion' ? 'Passeio' :
                                    entry.type === 'photo' ? 'Foto da Galeria' : 'Registro Geral'}
                            </span>
                          </div>
                          <h5 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{entry.title}</h5>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`ri-star-fill text-sm ${i < (entry.rating || 0) ? 'text-amber-500' : 'text-gray-200'}`}></i>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed text-sm flex-1 italic">
                        "{entry.content}"
                      </p>

                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={entry.user?.avatar_url} name={entry.user?.full_name} className="w-8 h-8 ring-2 ring-white shadow-sm" />
                          <div>
                            <p className="text-[10px] font-bold text-gray-900 leading-none">{entry.user?.full_name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Em {new Date(entry.created_at || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteJournalEntry(entry.id)}
                          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all group-hover:opacity-100 sm:opacity-0"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Entry Modal remains similarly implemented */}
        {isAddingJournalEntry && renderAddJournalEntryModal()}
      </div>
    );
  };

  const renderServicesContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-purple-500 pl-3">
          Meus Serviços Adquiridos
        </h3>
        <p className="text-sm text-gray-500">
          {userExperiences.length} {userExperiences.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
        </p>
      </div>

      {userExperiences.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
            <i className="ri-shopping-bag-3-line text-4xl"></i>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Sua mochila está vazia</h4>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            Você ainda não adquiriu nenhum serviço ou pacote no Marketplace. Explore as experiências disponíveis e comece seu planejamento!
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'marketplace' }));
            }}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Explorar Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userExperiences.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="relative h-48">
                <img
                  src={item.experience?.cover_image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={item.experience?.title}
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-lg border border-white/20 ${item.status === 'available' ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'
                    }`}>
                    {item.status === 'available' ? 'Disponível' : 'Utilizado'}
                  </span>
                  {item.experience?.validity_end_date && new Date(item.experience.validity_end_date) < new Date() && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/80 text-white backdrop-blur-md shadow-lg border border-white/20">
                      Expirado
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  {item.quantity > 1 && (
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-lg border border-white/20">
                      x{item.quantity} Disponível
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1 block">
                  {item.experience?.category}
                </span>
                <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.experience?.title}</h4>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                  <i className="ri-map-pin-line text-purple-500"></i>
                  {item.experience?.location || 'Local a combinar'}
                </div>

                {(item.experience?.validity_start_date || item.experience?.validity_end_date || item.experience?.contact_phone || item.experience?.contact_email) && (
                  <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-100 space-y-2">
                    {(item.experience?.validity_start_date || item.experience?.validity_end_date) && (
                      <div className="flex flex-col gap-0.5 text-purple-800 text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><i className="ri-calendar-check-line text-purple-500"></i>Período de Validade:</span>
                        <span className="pl-5 text-gray-700 font-normal">
                          {item.experience.validity_start_date ? new Date(item.experience.validity_start_date).toLocaleDateString('pt-BR') : 'Agora'} até {item.experience.validity_end_date ? new Date(item.experience.validity_end_date).toLocaleDateString('pt-BR') : 'Indeterminado'}
                        </span>
                      </div>
                    )}
                    {item.experience?.contact_phone && (
                      <div className="flex items-center gap-1.5 text-gray-700 text-xs">
                        <i className="ri-whatsapp-line text-green-500"></i>
                        {item.experience.contact_phone}
                      </div>
                    )}
                    {item.experience?.contact_email && (
                      <div className="flex items-center gap-1.5 text-gray-700 text-xs truncate">
                        <i className="ri-mail-line text-purple-400"></i>
                        {item.experience.contact_email}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[10px] text-gray-400 uppercase font-medium">
                    Adquirido em {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  {item.status === 'used' ? (
                    <button
                      onClick={() => handleOpenReviewModal(item)}
                      className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 border border-amber-100"
                    >
                      <i className="ri-star-line"></i>
                      Avaliar Serviço
                    </button>
                  ) : (
                    <button
                      disabled={item.experience?.validity_end_date && new Date(item.experience.validity_end_date) < new Date()}
                      onClick={() => {
                        if (item.experience?.validity_end_date && new Date(item.experience.validity_end_date) < new Date()) {
                          alert('Este serviço expirou e não pode mais ser utilizado.');
                          return;
                        }
                        setActiveSubTab('trips');
                        alert('Selecione uma viagem para incluir este serviço no seu roteiro!');
                      }}
                      className={`text-xs font-bold flex items-center gap-1 ${item.experience?.validity_end_date && new Date(item.experience.validity_end_date) < new Date()
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-purple-600 hover:text-purple-700'}`}
                    >
                      <i className="ri-add-circle-line"></i>
                      Usar em Viagem
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Matched to Reference */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="border-l-4 border-blue-600 pl-4">
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Minhas Viagens</h2>
          <p className="text-gray-500 font-medium mt-1">Gerencie e compartilhe seus roteiros</p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveSubTab('trips')}
              title="Minhas Viagens"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                activeSubTab === 'trips' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
               <i className={`text-2xl ${activeSubTab === 'trips' ? 'ri-suitcase-3-fill' : 'ri-suitcase-3-line'}`}></i>
            </button>
            <button
              onClick={() => setActiveSubTab('services')}
              title="Meus Serviços"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                activeSubTab === 'services' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
               <i className={`text-2xl ${activeSubTab === 'services' ? 'ri-service-fill' : 'ri-service-line'}`}></i>
            </button>
            <button
              onClick={() => setActiveSubTab('journal')}
              title="Meu Diário"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                activeSubTab === 'journal' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
               <i className={`text-2xl ${activeSubTab === 'journal' ? 'ri-book-2-fill' : 'ri-book-2-line'}`}></i>
            </button>
            <button
              onClick={() => setActiveSubTab('maps')}
              title="Mapa"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                activeSubTab === 'maps' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
               <i className={`text-2xl ${activeSubTab === 'maps' ? 'ri-map-2-fill' : 'ri-map-2-line'}`}></i>
            </button>
            <button
              onClick={() => { setActiveSubTab('retrospectives'); setSelectedRetrospective(null); setSelectedTrip(null); }}
              title="Retrospectiva"
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                activeSubTab === 'retrospectives' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
               <i className={`text-2xl ${activeSubTab === 'retrospectives' ? 'ri-magic-fill' : 'ri-magic-line'}`}></i>
            </button>
          </div>
          <button
            onClick={() => setActiveSubTab(activeSubTab === 'newtrip' ? 'trips' : 'newtrip')}
            title="Nova Viagem"
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow hover:shadow-lg transition-all"
          >
            <i className="ri-add-line text-xl"></i>
          </button>
        </div>
      </div>


      {/* Content */}
      {activeSubTab === 'trips' && renderTripsContent()}

      {activeSubTab === 'newtrip' && (
        <CreateTripForm
          onCancel={() => {
            setActiveSubTab('trips');
            setEditingTrip(null);
          }}
          onSuccess={() => {
            // Refresh trips
            refreshTrips();
            setActiveSubTab('trips');
            setEditingTrip(null);
          }}
          initialData={editingTrip}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReviewExperience && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-8">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-star-line text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Avaliar Experiência</h3>
              <p className="text-gray-500 text-center mb-8">
                Como foi sua experiência com <b>{selectedReviewExperience.experience?.title}</b>? Sua opinião ajuda outros viajantes!
              </p>

              <div className="space-y-6">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition-all transform hover:scale-125 ${reviewRating >= star ? 'text-amber-500' : 'text-gray-200'}`}
                    >
                      <i className={reviewRating >= star ? "ri-star-fill" : "ri-star-line"}></i>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Comentário (opcional)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder="Conte o que achou de mais especial, o atendimento, etc..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all resize-none text-sm"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <i className="ri-loader-4-line animate-spin"></i>
                    ) : (
                      <i className="ri-send-plane-fill"></i>
                    )}
                    Enviar Avaliação
                  </button>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Agora não
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'maps' && renderMapsContent()}
      {activeSubTab === 'goals' && renderGoalsContent()}
      {activeSubTab === 'suggestions' && renderSuggestionsContent()}
      {activeSubTab === 'retrospectives' && renderRetrospectivesContent()}
      {activeSubTab === 'journal' && renderJournalContent()}
      {activeSubTab === 'services' && renderServicesContent()}

      {/* Share Modal */}
      {/* Share Modal */}
      {showShareModal && selectedTrip && (
        <ShareTripModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          trip={selectedTrip}
          networkUsers={networkUsers}
          groups={userGroups}
          onShare={handleShare}
          onPublish={handlePublish}
        />
      )}

      {/* Collaborators Modal */}
      {
        showCollaboratorsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="ri-group-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Gerenciar Colaboradores</h2>
                    <p className="text-white/90 text-sm">{selectedTrip.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCollaboratorsModal(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedTrip.sharedWith && selectedTrip.sharedWith.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTrip.sharedWith.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <UserAvatar
                            src={user.avatar}
                            name={user.name}
                            size="lg"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-500">Entrou {new Date(user.joinedAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={user.permission}
                            onChange={(e) => handleChangePermission(user.id, e.target.value as any)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="view">👁️ Visualizar</option>
                            <option value="edit">✏️ Editar (Sugerir)</option>
                            <option value="admin">👑 Admin</option>
                          </select>

                          <button
                            onClick={() => handleRemoveCollaborator(user.id)}
                            className="w-10 h-10 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                      <i className="ri-group-line text-4xl text-purple-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum colaborador ainda</h3>
                    <p className="text-gray-600 mb-6">Compartilhe esta viagem para começar a colaborar!</p>
                    <button
                      onClick={() => {
                        setShowCollaboratorsModal(false);
                        handleShareTrip(selectedTrip);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Compartilhar Viagens
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Suggestions Review Modal */}
      {
        showSuggestionsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="ri-notification-3-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Revisar Sugestões</h2>
                    <p className="text-white/90 text-sm">{selectedTrip.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuggestionsModal(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedTrip.pendingSuggestions && selectedTrip.pendingSuggestions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex gap-2 border-b border-gray-200 pb-4">
                      <button
                        onClick={() => setSuggestionTab('pending')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${suggestionTab === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        Pendentes ({selectedTrip.pendingSuggestions.filter(s => s.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setSuggestionTab('approved')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${suggestionTab === 'approved'
                          ? 'bg-green-100 text-green-700 shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        Aprovadas ({selectedTrip.pendingSuggestions.filter(s => s.status === 'approved').length})
                      </button>
                      <button
                        onClick={() => setSuggestionTab('rejected')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${suggestionTab === 'rejected'
                          ? 'bg-red-100 text-red-700 shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        Rejeitadas ({selectedTrip.pendingSuggestions.filter(s => s.status === 'rejected').length})
                      </button>
                    </div>

                    {/* Suggestions List */}
                    {selectedTrip.pendingSuggestions
                      .filter(s => s.status === suggestionTab)
                      .map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className={`rounded-2xl p-6 border-2 transition-all ${suggestionTab === 'pending'
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                            : suggestionTab === 'approved'
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                              : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                            }`}
                        >
                          {/* Suggestion Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <UserAvatar
                                src={suggestion.userAvatar}
                                name={suggestion.userName}
                                size="lg"
                                className="border-2 border-white"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900">{suggestion.userName}</h4>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-600">{getTimeAgo(suggestion.createdAt)}</p>
                                  {suggestion.status !== 'pending' && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${suggestion.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                      {suggestion.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSuggestionColor(suggestion.type).replace('text-', 'bg-')}/20`}>
                              <i className={`${getSuggestionIcon(suggestion.type)} text-xl ${getSuggestionColor(suggestion.type)}`}></i>
                            </div>
                          </div>

                          {/* Suggestion Content */}
                          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
                            <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <i className="ri-information-line text-blue-500"></i>
                              Detalhes da Sugestão
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Título</span>
                                  <p className="text-sm font-semibold text-gray-900">{suggestion.data.title || suggestion.data.name}</p>
                                </div>
                                {suggestion.data.description && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Descrição</span>
                                    <p className="text-sm text-gray-600 line-clamp-2">{suggestion.data.description}</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div className="flex gap-4">
                                  {suggestion.data.time && (
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Horário</span>
                                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        <i className="ri-time-line text-blue-500 text-xs"></i>
                                        {suggestion.data.time}
                                      </div>
                                    </div>
                                  )}
                                  {suggestion.data.duration && (
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Duração</span>
                                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        <i className="ri-timer-line text-orange-500 text-xs"></i>
                                        {suggestion.data.duration}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {suggestion.data.location && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Localização</span>
                                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                      <i className="ri-map-pin-2-line text-red-500"></i>
                                      {suggestion.data.location}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {suggestion.type === 'add_place' && suggestion.data.suggestedDayId !== undefined && (
                              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">Sugestão de inclusão para o:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                                  Dia {suggestion.data.suggestedDayId + 1}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Comments Section */}
                          {suggestion.comments && suggestion.comments.length > 0 && (
                            <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
                              <h6 className="font-semibold text-gray-900 text-sm mb-3">💬 Comentários ({suggestion.comments.length})</h6>
                              {suggestion.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <UserAvatar
                                    src={comment.userAvatar}
                                    name={comment.userName}
                                    size="sm"
                                    className="border border-gray-100"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h6 className="font-semibold text-gray-900 text-sm">{comment.userName}</h6>
                                      <p className="text-sm text-gray-700">{comment.text}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{getTimeAgo(comment.createdAt || comment.created_at)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions or Status */}
                          {suggestion.status === 'pending' ? (
                            <div className="space-y-4">
                              {/* Add Comment */}
                              <div className="bg-white rounded-xl p-4">
                                <div className="flex gap-3">
                                  <input
                                    type="text"
                                    value={selectedSuggestion?.id === suggestion.id ? commentText : ''}
                                    onChange={(e) => {
                                      setSelectedSuggestion(suggestion);
                                      setCommentText(e.target.value);
                                    }}
                                    placeholder="Adicionar um comentário..."
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddComment(suggestion.id);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleAddComment(suggestion.id)}
                                    disabled={!commentText.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <i className="ri-send-plane-fill"></i>
                                  </button>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveSuggestion(suggestion.id)}
                                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <i className="ri-check-line text-xl"></i>
                                  Aprovar e Aplicar
                                </button>
                                <button
                                  onClick={() => handleRejectSuggestion(suggestion.id)}
                                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                  <i className="ri-close-line text-xl"></i>
                                  Rejeitar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className={`p-4 rounded-xl border text-center font-medium ${suggestion.status === 'approved' ? 'bg-green-100/50 border-green-200 text-green-700' : 'bg-red-100/50 border-red-200 text-red-700'
                              }`}>
                              Esta sugestão foi {suggestion.status === 'approved' ? 'Aprovada e Aplicada' : 'Rejeitada'}.
                            </div>
                          )}
                        </div>
                      ))}

                    {selectedTrip.pendingSuggestions.filter(s => s.status === suggestionTab).length === 0 && (
                      <div className="text-center py-12">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${suggestionTab === 'pending'
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100'
                          : suggestionTab === 'approved'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100'
                            : 'bg-gradient-to-r from-red-100 to-pink-100'
                          }`}>
                          <i className={`${suggestionTab === 'pending'
                            ? 'ri-lightbulb-line text-yellow-500'
                            : suggestionTab === 'approved'
                              ? 'ri-check-line text-green-500'
                              : 'ri-close-line text-red-500'
                            } text-4xl`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {suggestionTab === 'pending' ? 'Nenhuma sugestão pendente' : suggestionTab === 'approved' ? 'Nenhuma sugestão aprovada' : 'Nenhuma sugestão rejeitada'}
                        </h3>
                        <p className="text-gray-600">
                          {suggestionTab === 'pending' ? 'Tudo revisado por aqui!' : 'As sugestões aparecerão aqui após sua ação.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 flex items-center justify-center">
                      <i className="ri-lightbulb-line text-4xl text-yellow-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma sugestão ainda</h3>
                    <p className="text-gray-600 mb-6">Quando colaboradores sugerirem mudanças, elas aparecerão aqui para sua aprovação.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Retrospective Detail Modal */}
      {
        selectedRetrospective && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRetrospective(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-64 sm:h-96">
                <img
                  src={selectedRetrospective.coverImage}
                  alt={selectedRetrospective.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRetrospective(null);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                    {selectedRetrospective.title}
                  </h1>
                </div>
              </div>

              <div className="p-6">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                  <i className="ri-share-line text-xl"></i>
                  Compartilhar Retrospectiva
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={confirmDeleteTrip}
        title="Excluir Viagem?"
        message={`Tem certeza que deseja excluir a viagem para "${tripToDelete?.destination}"? Essa ação não pode ser desfeita.`}
        type="danger"
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />

      {/* Feedback Modal */}
      <ConfirmationModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmText="OK"
        cancelText=""
        type={feedbackModal.type}
      />
    </div >
  );
}
