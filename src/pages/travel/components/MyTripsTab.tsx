import { useState, useEffect } from 'react';
import TripPlanningModal from './TripPlanningModal';
import CreateTripForm from './CreateTripForm';
import ShareTripModal, { ShareConfig, PublishConfig } from './ShareTripModal';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { useAuth } from '../../../context/AuthContext';



import { getTrips, deleteTrip, updateTrip, Trip, getNetworkUsers, User, createMarketplaceListing, deleteMarketplaceListing, supabase } from '../../../services/supabase';

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
  const [activeSubTab, setActiveSubTab] = useState<'trips' | 'shared' | 'newtrip' | 'stats' | 'maps' | 'goals' | 'suggestions' | 'retrospectives'>(initialSubTab as any || 'trips');
  const [retrospectives, setRetrospectives] = useState<YearlyRetrospective[]>([]);
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab as any);
    }
  }, [initialSubTab]);

  const [selectedRetrospective, setSelectedRetrospective] = useState<YearlyRetrospective | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [networkUsers, setNetworkUsers] = useState<User[]>([]);
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




  useEffect(() => {
    refreshTrips();
    loadRetrospectives();
    loadNetworkUsers();
  }, [user]);

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

  useEffect(() => {
    if (showShareModal) {
      loadNetworkUsers();
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

  const handleShare = (config: ShareConfig) => {
    if (!selectedTrip) return;

    // Preserving existing shared users if possible, or creating new placeholders
    // In a real app we'd fetch user details
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
          isShared: newSharedWith.length > 0
        };
        // Update Supabase
        const { id, user_id, created_at, ...updates } = updated;
        updateTrip(id, updates);
        return updated;
      }
      return t;
    });
    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) setSelectedTrip(updated);

    alert('Configurações de compartilhamento salvas!');
  };

  const handlePublish = async (config: PublishConfig) => {
    if (!selectedTrip) return;

    // Optimistic update locally
    const updatedTrips = trips.map(t => {
      if (t.id === selectedTrip.id) {
        return {
          ...t,
          marketplaceConfig: config
        };
      }
      return t;
    });

    setTrips(updatedTrips);
    const updated = updatedTrips.find(t => t.id === selectedTrip.id);
    if (updated) setSelectedTrip(updated);

    try {
      if (config.isListed) {
        // Create new listing in marketplace_listings table
        await createMarketplaceListing({
          trip_id: selectedTrip.id,
          seller_id: (selectedTrip as any).user_id, // Assuming user_id is present
          title: selectedTrip.title,
          description: config.description || selectedTrip.description,
          price: config.price,
          currency: 'TM',
          category: selectedTrip.trip_type
        });

        // CRITICAL: Update Trip Visibility to Public so others can see it (RLS)
        // Also sync marketplaceConfig to metadata for consistency
        await updateTrip(selectedTrip.id, {
          visibility: 'public',
          marketplaceConfig: config
        });

        setFeedbackModal({
          isOpen: true,
          title: 'Sucesso!',
          message: 'Roteiro publicado no Marketplace com sucesso!',
          type: 'success'
        });
        // Notify MarketplaceTab to refresh
        window.dispatchEvent(new Event('marketplace-updated'));

        // ============================================================
        // NOTIFICATION LOGIC: Broadcast to followers
        // ============================================================
        // 1. Get current user (Owner)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 2. Fetch followers
          const { data: followers } = await supabase
            .from('followers')
            .select('follower_id')
            .eq('following_id', user.id);

          if (followers && followers.length > 0) {
            // 3. Create notifications for each follower
            const notifications = followers.map(f => ({
              user_id: f.follower_id,
              type: 'trip_published',
              title: `Novo Roteiro de ${user.user_metadata?.full_name || 'um viajante'}`,
              message: `Acabou de publicar "${selectedTrip.title}". Confira no Marketplace!`,
              is_read: false,
              related_user_id: user.id
            }));

            // Batch insert notifications
            await supabase.from('notifications').insert(notifications);
          }

          // 4. Notify the Publisher (Self)
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'system',
            title: 'Roteiro Publicado!',
            message: `Seu roteiro "${selectedTrip.title}" já está disponível no Marketplace.`,
            is_read: false,
            related_user_id: user.id
          });
        }
        // ============================================================

      } else {
        // Handle unlisting: Remove from marketplace_listings table
        await deleteMarketplaceListing(selectedTrip.id);

        // Revert visibility to private when unsharing
        await updateTrip(selectedTrip.id, {
          visibility: 'private',
          marketplaceConfig: config
        });

        setFeedbackModal({
          isOpen: true,
          title: 'Removido',
          message: 'Roteiro removido do Marketplace.',
          type: 'info'
        });

        // Notify refresh in case it was open there
        window.dispatchEvent(new Event('marketplace-updated'));
      }

      // Still update trip metadata for local state persistence
      const { id, user_id, created_at, ...updates } = updated!;

      // Aggressively sanitize: Remove ALL known virtual fields that are not DB columns
      // These are fields added by getTrips or UI state that shouldn't be sent back to DB
      const {
        marketplaceConfig: _mc,
        sharedWith: _sw,
        pendingSuggestions: _ps,
        isShared: _is,
        owner: _own,
        permissions: _perm,
        places: _pl,
        seller: _sel,
        itinerary: _it, // itinerary is usually a column, but if it's large/complex maybe better to treat carefully? keeping it if it's a column. It IS a column.
        ...safeUpdates
      } = updates as any;

      await updateTrip(id, {
        ...safeUpdates,
        metadata: {
          ...selectedTrip.metadata, // Preserve existing metadata
          marketplaceConfig: config   // Add/Update marketplace config
        }
      });

    } catch (error) {
      console.error('Error publishing trip:', error);
      alert(`Erro ao salvar publicação: ${(error as any).message || 'Erro desconhecido'}`);
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
            case 'add_place':
              updatedTrip.places = [...(trip.places || []), suggestion.data];
              break;
            case 'remove_place':
              updatedTrip.places = (trip.places || []).filter(p => p.id !== suggestion.data.placeId);
              break;
            case 'edit_place':
              updatedTrip.places = (trip.places || []).map(p =>
                p.id === suggestion.data.placeId ? { ...p, ...suggestion.data.changes } : p
              );
              break;
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

  const filteredTrips = trips.filter(trip => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'shared') {
      return trip.isShared || (trip.sharedWith && trip.sharedWith.length > 0) || trip.marketplaceConfig?.isListed;
    }
    return trip.status === filterStatus;
  });

  const renderTripsContent = () => (
    <>


      {/* Trip list header with search/sort if needed */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {filterStatus === 'all' ? 'Todas as Viagens' :
            filterStatus === 'completed' ? 'Viagens Concluídas' :
              filterStatus === 'planning' ? 'Planejando' : 'Viagens Compartilhadas'}
        </h3>
      </div>

      {/* Trips Grid */}
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

                {/* Delete Button - Only for Owners/Admins */}
                {trip.permissions === 'admin' && (
                  <button
                    onClick={(e) => handleDeleteTrip(e, trip)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg translate-y-2 group-hover:translate-y-0"
                    title="Excluir Viagem"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                )}




                {/* Pending Suggestions Badge */}
                {
                  pendingCount > 0 && (
                    <div className="absolute top-12 right-3">
                      <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
                        <i className="ri-notification-3-line"></i>
                        {pendingCount} {pendingCount === 1 ? 'sugestão' : 'sugestões'}
                      </div>
                    </div>
                  )
                }

                {/* Trip Info Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTripClick(trip);
                    }}
                    className="text-white font-bold text-lg mb-1 cursor-pointer hover:underline"
                  >
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <i className="ri-map-pin-line"></i>
                    <span>{trip.destination}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Dates */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <i className="ri-calendar-line"></i>
                    <span>
                      {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </span>
                  </div>
                  {daysUntil > 0 && daysUntil < 30 && (
                    <span className="text-orange-600 text-xs font-medium">Em {daysUntil} dias</span>
                  )}
                </div>

                {/* Trip Type & Travelers */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <i className={`${getTripTypeIcon(trip.trip_type)} ${getTripTypeColor(trip.trip_type)}`}></i>
                    <span className="text-xs text-gray-600 capitalize">{trip.trip_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-group-line text-gray-400"></i>
                    <span className="text-xs text-gray-600">{trip.travelers} pessoas</span>
                  </div>
                  {trip.places && trip.places.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <i className="ri-map-pin-2-line text-gray-400"></i>
                      <span className="text-xs text-gray-600">{trip.places.length} locais</span>
                    </div>
                  )}
                </div>

                {/* Collaborators Preview */}
                {trip.isShared && trip.sharedWith && trip.sharedWith.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex -space-x-2">
                      {trip.sharedWith.slice(0, 3).map((user, idx) => (
                        <img
                          key={idx}
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full border-2 border-white"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {trip.sharedWith.length}{' '}
                      {trip.sharedWith.length === 1 ? 'colaborador' : 'colaboradores'}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {pendingCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSuggestions(trip);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium flex items-center justify-center gap-2 relative whitespace-nowrap"
                    >
                      <i className="ri-notification-3-line"></i>
                      Revisar ({pendingCount})
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTrip(trip);
                      setActiveSubTab('newtrip');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    title="Editar Viagem"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </button>
                  {trip.permissions === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrip(trip);
                        setShowShareModal(true);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      title="Compartilhar Viagem"
                    >
                      <i className="ri-share-forward-line text-lg"></i>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateSuggestion(trip);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    title="Simular sugestão (teste)"
                  >
                    <i className="ri-lightbulb-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div >

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
          />
        )
      }

    </>
  );



  const renderStatsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Destinos Visitados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-earth-line text-3xl text-blue-500"></i>
            <span className="text-3xl font-bold text-gray-900">{new Set(trips.map(t => t.destination)).size}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Destinos Visitados</h4>
          <p className="text-sm text-gray-600">Lugares únicos explorados</p>
        </div>

        {/* Continentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-global-line text-3xl text-purple-500"></i>
            <span className="text-3xl font-bold text-gray-900">5</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Continentes</h4>
          <p className="text-sm text-gray-600">América, Europa, Ásia, África, Oceania</p>
        </div>

        {/* Países */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-flag-line text-3xl text-red-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {new Set(trips.map(t => t.destination.split(',')[0])).size}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Países</h4>
          <p className="text-sm text-gray-600">Nações diferentes visitadas</p>
        </div>

        {/* Dias Viajando */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-calendar-check-line text-3xl text-green-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.reduce((acc, trip) => {
                const start = new Date(trip.start_date);
                const end = new Date(trip.end_date);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                return acc + days;
              }, 0)}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Dias Viajando</h4>
          <p className="text-sm text-gray-600">Total de dias em viagens</p>
        </div>

        {/* Distância Percorrida */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-flight-takeoff-line text-3xl text-cyan-500"></i>
            <span className="text-3xl font-bold text-gray-900">{(trips.length * 3500).toLocaleString('pt-BR')}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Km Percorridos</h4>
          <p className="text-sm text-gray-600">Distância total estimada</p>
        </div>

        {/* Viajantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-group-line text-3xl text-purple-500"></i>
            <span className="text-3xl font-bold text-gray-900">{trips.reduce((acc, trip) => acc + trip.travelers, 0)}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Viajantes</h4>
          <p className="text-sm text-gray-600">Total de pessoas nas viagens</p>
        </div>

        {/* Locais Visitados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-map-pin-2-line text-3xl text-orange-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.reduce((acc, trip) => acc + (trip.places?.length || 0), 0)}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Locais Visitados</h4>
          <p className="text-sm text-gray-600">Pontos turísticos explorados</p>
        </div>

        {/* Cidades */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-building-line text-3xl text-indigo-500"></i>
            <span className="text-3xl font-bold text-gray-900">{new Set(trips.map(t => t.destination)).size}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Cidades</h4>
          <p className="text-sm text-gray-600">Centros urbanos visitados</p>
        </div>

        {/* Regiões */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-map-line text-3xl text-teal-500"></i>
            <span className="text-3xl font-bold text-gray-900">12</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Regiões</h4>
          <p className="text-sm text-gray-600">Áreas geográficas exploradas</p>
        </div>

        {/* Viagens Compartilhadas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-share-line text-3xl text-pink-500"></i>
            <span className="text-3xl font-bold text-gray-900">{trips.filter(t => t.isShared).length}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Viagens Compartilhadas</h4>
          <p className="text-sm text-gray-600">Roteiros colaborativos</p>
        </div>

        {/* Viagens Concluídas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-star-line text-3xl text-yellow-500"></i>
            <span className="text-3xl font-bold text-gray-900">{trips.filter(t => t.status === 'completed').length}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Viagens Concluídas</h4>
          <p className="text-sm text-gray-600">Aventuras finalizadas</p>
        </div>

        {/* Fotos Tiradas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-camera-line text-3xl text-rose-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {(trips.filter(t => t.status === 'completed').length * 247).toLocaleString('pt-BR')}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Fotos Tiradas</h4>
          <p className="text-sm text-gray-600">Memórias capturadas</p>
        </div>

        {/* Horas de Voo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-plane-line text-3xl text-sky-500"></i>
            <span className="text-3xl font-bold text-gray-900">{trips.length * 8}h</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Horas de Voo</h4>
          <p className="text-sm text-gray-600">Tempo total no ar</p>
        </div>

        {/* Idiomas Praticados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-translate-2 text-3xl text-violet-500"></i>
            <span className="text-3xl font-bold text-gray-900">7</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Idiomas Praticados</h4>
          <p className="text-sm text-gray-600">Línguas diferentes usadas</p>
        </div>

        {/* Culturas Exploradas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-ancient-gate-line text-3xl text-amber-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.filter(t => t.trip_type === 'cultural').length}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Culturas Exploradas</h4>
          <p className="text-sm text-gray-600">Experiências culturais</p>
        </div>

        {/* Aventuras */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-mountain-line text-3xl text-emerald-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.filter(t => t.trip_type === 'adventure').length}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Aventuras</h4>
          <p className="text-sm text-gray-600">Viagens de aventura</p>
        </div>

        {/* Praias Visitadas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-sun-line text-3xl text-orange-400"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.filter(t => t.trip_type === 'leisure').length * 3}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Praias Visitadas</h4>
          <p className="text-sm text-gray-600">Destinos de praia</p>
        </div>

        {/* Museus Visitados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-bank-line text-3xl text-slate-500"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.filter(t => t.trip_type === 'cultural').length * 5}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Museus Visitados</h4>
          <p className="text-sm text-gray-600">Instituições culturais</p>
        </div>

        {/* Restaurantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <i className="ri-restaurant-line text-3xl text-red-400"></i>
            <span className="text-3xl font-bold text-gray-900">
              {trips.filter(t => t.status === 'completed').length * 12}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Restaurantes</h4>
          <p className="text-sm text-gray-600">Gastronomia local experimentada</p>
        </div>
      </div>

      {/* Detailed Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Por Continente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-global-line text-purple-500"></i>
            Viagens por Continente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  🌍
                </div>
                <span className="font-semibold text-gray-900">Europa</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{Math.floor(trips.length * 0.4)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  🌎
                </div>
                <span className="font-semibold text-gray-900">América</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{Math.floor(trips.length * 0.3)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  🌏
                </div>
                <span className="font-semibold text-gray-900">Ásia</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{Math.floor(trips.length * 0.2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  🌍
                </div>
                <span className="font-semibold text-gray-900">África</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{Math.floor(trips.length * 0.07)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  🌏
                </div>
                <span className="font-semibold text-gray-900">Oceania</span>
              </div>
              <span className="text-2xl font-bold text-cyan-600">{Math.floor(trips.length * 0.03)}</span>
            </div>
          </div>
        </div>

        {/* Por Tipo de Viagens */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-suitcase-line text-orange-500"></i>
            Viagens por Tipo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-sun-line text-2xl text-orange-500"></i>
                <span className="font-semibold text-gray-900">Lazer</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {trips.filter(t => t.trip_type === 'leisure').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-briefcase-line text-2xl text-blue-500"></i>
                <span className="font-semibold text-gray-900">Negócios</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {trips.filter(t => t.trip_type === 'business').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-mountain-line text-2xl text-green-500"></i>
                <span className="font-semibold text-gray-900">Aventura</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {trips.filter(t => t.trip_type === 'adventure').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-heart-line text-2xl text-pink-500"></i>
                <span className="font-semibold text-gray-900">Romântico</span>
              </div>
              <span className="text-2xl font-bold text-pink-600">
                {trips.filter(t => t.trip_type === 'romantic').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-group-line text-2xl text-purple-500"></i>
                <span className="font-semibold text-gray-900">Família</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {trips.filter(t => t.trip_type === 'family').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3">
                <i className="ri-building-line text-2xl text-amber-500"></i>
                <span className="font-semibold text-gray-900">Cultural</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {trips.filter(t => t.trip_type === 'cultural').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMapsContent = () => {
    const visitedDestinations = trips
      .filter(t => t.status === 'completed')
      .map(t => t.destination)
      .join('|');

    return (
      <div className="space-y-6">
        {/* World Map Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <i className="ri-earth-line text-emerald-500"></i>
                  Mapa Mundial de Viagens
                </h3>
                <p className="text-gray-600 text-sm mt-1">Explore todos os destinos que você já visitou</p>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-pink-50 px-6 py-3 rounded-full border-2 border-orange-200">
                <i className="ri-map-pin-fill text-orange-500 text-xl"></i>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {trips.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-xs text-gray-600">Destinos Visitados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa Mundial - Imagem de Fundo */}
          <div className="relative w-full h-[700px] bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Imagem do Mapa Múndi */}
            <img
              src="https://readdy.ai/api/search-image?query=world%20map%20detailed%20continents%20countries%20geography%20political%20boundaries%20clean%20design%20bright%20colors%20high%20quality%20light%20background%20simple%20modern%20style&width=1600&height=700&seq=world-map-pins-v3&orientation=landscape"
              alt="Mapa Múndi"
              className="w-full h-full object-cover"
            />

            {/* Overlay muito leve */}
            <div className="absolute inset-0 bg-white/10"></div>

            {/* Pins dos Locais Visitados */}
            <div className="absolute inset-0">
              {destinations.map((destination, idx) => {
                return (
                  <div
                    key={idx}
                    className="absolute group cursor-pointer z-10"
                    style={{
                      top: destination.position.top,
                      left: destination.position.left,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Pin Principal com Cores Variadas */}
                    <div className="relative">
                      {/* Círculo de pulso animado */}
                      <div className="absolute inset-0 w-20 h-20 -translate-x-6 -translate-y-6 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-ping opacity-60"></div>

                      {/* Pin principal - GRANDE E COLORIDO */}
                      <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center hover:scale-125 transition-transform duration-300 animate-bounce">
                        <i className="ri-map-pin-fill text-white text-3xl"></i>
                      </div>

                      {/* Linha conectando ao mapa */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-400 opacity-70"></div>
                    </div>

                    {/* Tooltip com informações da viagem */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                      <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[280px] border-4 border-orange-200">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <i className="ri-map-pin-fill text-white text-3xl"></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{destination.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{destination.country}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <i className="ri-calendar-line text-orange-500"></i>
                                <span>{destination.dates}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <i className="ri-group-line text-orange-500"></i>
                                <span>{destination.travelers} {destination.travelers === 1 ? 'person' : 'people'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <i className="ri-map-pin-2-line text-orange-500"></i>
                                <span>{destination.places} places visited</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Seta do tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="w-5 h-5 bg-white border-r-4 border-b-4 border-orange-200 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>

                    {/* Badge com número da viagem */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{idx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda Moderna */}
            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border-2 border-orange-200 max-w-xs">
              <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <i className="ri-information-line text-orange-500 text-2xl"></i>
                Legenda
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <i className="ri-map-pin-fill text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Destino visitado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Ordem cronológica</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full border-3 border-white shadow-lg animate-ping opacity-60"></div>
                  <span className="text-sm text-gray-700 font-medium">Animação de destaque</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Destinos Visitados */}
          <div className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 border-t-2 border-orange-200">
            <h4 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
              <i className="ri-list-check text-orange-500 text-2xl"></i>
              Todos os Destinos Visitados ({destinations.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((destination, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-orange-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-sm font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-sm truncate">{destination.name}</h5>
                    <p className="text-xs text-gray-600 truncate">{destination.country}</p>
                    <p className="text-xs text-gray-500 mt-1">{destination.dates}</p>
                  </div>
                  <i className="ri-map-pin-fill text-orange-500 text-xl"></i>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country/Region Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estados Unidos Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🇺🇸</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Estados Unidos</h3>
                  <p className="text-sm text-gray-600">Progresso de Estados</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">10 de 50 estados visitados</span>
                <span className="text-sm font-bold text-blue-600">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            {/* Visited States */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Estados Visitados:</h4>
              <div className="flex flex-wrap gap-2">
                {['Nova York', 'Califórnia', 'Flórida', 'Texas', 'Nevada', 'Illinois', 'Massachusetts', 'Washington', 'Arizona', 'Colorado'].map((state, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{state}</span>
                ))}
              </div>
            </div>

            {/* Next Goal */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-flag-line text-blue-600"></i>
                <span className="text-sm font-semibold text-gray-900">Próxima Meta:</span>
              </div>
              <p className="text-xs text-gray-700">Visite mais 15 estados para alcançar 50% de progresso!</p>
            </div>
          </div>

          {/* Brasil Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🇧🇷</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Brasil</h3>
                  <p className="text-sm text-gray-600">Progresso de Estados</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">8 de 27 estados visitados</span>
                <span className="text-sm font-bold text-green-600">30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            {/* Visited States */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Estados Visitados:</h4>
              <div className="flex flex-wrap gap-2">
                {['São Paulo', 'Rio de Janeiro', 'Bahia', 'Minas Gerais', 'Rio Grande do Sul', 'Paraná', 'Santa Catarina', 'Pernambuco'].map((state, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{state}</span>
                ))}
              </div>
            </div>

            {/* Next Goal */}
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-flag-line text-green-600"></i>
                <span className="text-sm font-semibold text-gray-900">Próxima Meta:</span>
              </div>
              <p className="text-xs text-gray-700">Visite mais 6 estados para alcançar 50% de progresso!</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoalsContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-trophy-line text-amber-500"></i>
          Metas de Viagens
        </h3>

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
    </div>
  );

  const renderSuggestionsContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-lightbulb-line text-yellow-500"></i>
          Sugestões de Viagens
        </h3>

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
    </div>
  );

  const renderRetrospectivesContent = () => (
    <div className="space-y-4">
      {/* Generate New Retrospective */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl sm:rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-robot-2-line text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Gerar Retrospectiva com IA</h3>
            <p className="text-white/90 text-sm mb-4">
              Nossa IA analisa suas viagens e cria uma retrospectiva personalizada com estatísticas, highlights e momentos especiais!
            </p>
            <button
              onClick={() => generateRetrospective(2024)}
              disabled={isGenerating}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Gerando...
                </>
              ) : (
                <>
                  <i className="ri-magic-line"></i>
                  Gerar Retrospectiva 2024
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Retrospectives List */}
      <div className="space-y-4">
        {retrospectives.map((retro) => (
          <div
            key={retro.id}
            onClick={() => setSelectedRetrospective(retro)}
            className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="relative w-full h-64 sm:h-80">
              <img
                src={retro.coverImage}
                alt={retro.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTrip(null);
                  setShowTripDetail(false);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  {retro.title}
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
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Minhas Viagens</h2>
          <p className="text-gray-600 text-sm mt-1">Gerencie e compartilhe seus roteiros</p>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Unified Navigation Row */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
        {/* Trip Filters */}
        {[
          { id: 'all', icon: 'ri-map-pin-line', label: 'Todas', color: 'blue', count: trips.length },
          { id: 'completed', icon: 'ri-checkbox-circle-line', label: 'Concluídas', color: 'green', count: trips.filter(t => t.status === 'completed').length },
          { id: 'planning', icon: 'ri-calendar-line', label: 'Planejando', color: 'orange', count: trips.filter(t => t.status === 'planning').length },
          { id: 'shared_filter', icon: 'ri-share-line', label: 'Compartilhadas', color: 'purple', count: trips.filter(t => t.isShared || (t.sharedWith && t.sharedWith.length > 0) || t.marketplaceConfig?.isListed).length },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => {
              setActiveSubTab('trips');
              setFilterStatus(filter.id === 'shared_filter' ? 'shared' : filter.id as any);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shadow-sm border relative group ${activeSubTab === 'trips' && (filter.id === 'shared_filter' ? filterStatus === 'shared' : filterStatus === filter.id)
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-md scale-105'
              : 'bg-white text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50'
              }`}
            title={filter.label}
          >
            <i className={`${filter.icon} text-xl`}></i>
            {filter.count > 0 && (
              <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold shadow-sm ${activeSubTab === 'trips' && (filter.id === 'shared_filter' ? filterStatus === 'shared' : filterStatus === filter.id)
                ? 'bg-white text-gray-900'
                : 'bg-gray-100 text-gray-600'
                }`}>
                {filter.count}
              </span>
            )}
          </button>
        ))}

        {/* Separator */}
        <div className="w-px h-8 bg-gray-200 mx-1 flex-shrink-0"></div>

        {/* Other Sections (Subtabs) */}
        {[
          { id: 'stats', icon: 'ri-bar-chart-line', label: 'Estatísticas' },
          { id: 'maps', icon: 'ri-map-2-line', label: 'Mapas' },
          { id: 'goals', icon: 'ri-trophy-line', label: 'Metas' },
          { id: 'suggestions', icon: 'ri-lightbulb-line', label: 'Sugestões' },
          { id: 'retrospectives', icon: 'ri-movie-2-line', label: 'Retrospectivas' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(activeSubTab === item.id ? 'trips' : item.id as any)}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shadow-sm border ${activeSubTab === item.id
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-md scale-105'
              : 'bg-white text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50'
              }`}
            title={item.label}
          >
            <i className={`${item.icon} text-xl`}></i>
          </button>
        ))}
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

      {activeSubTab === 'stats' && renderStatsContent()}
      {activeSubTab === 'maps' && renderMapsContent()}
      {activeSubTab === 'goals' && renderGoalsContent()}
      {activeSubTab === 'suggestions' && renderSuggestionsContent()}
      {activeSubTab === 'retrospectives' && renderRetrospectivesContent()}

      {/* Share Modal */}
      {/* Share Modal */}
      {showShareModal && selectedTrip && (
        <ShareTripModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          trip={selectedTrip}
          networkUsers={networkUsers}
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
                          <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
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
                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 pb-4">
                      <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium text-sm">
                        Pendentes ({selectedTrip.pendingSuggestions.filter(s => s.status === 'pending').length})
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200">
                        Aprovadas ({selectedTrip.pendingSuggestions.filter(s => s.status === 'approved').length})
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200">
                        Rejeitadas ({selectedTrip.pendingSuggestions.filter(s => s.status === 'rejected').length})
                      </button>
                    </div>

                    {/* Suggestions List */}
                    {selectedTrip.pendingSuggestions
                      .filter(s => s.status === 'pending')
                      .map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6"
                        >
                          {/* Suggestion Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <img src={suggestion.userAvatar} alt={suggestion.userName} className="w-12 h-12 rounded-full object-cover" />
                              <div>
                                <h4 className="font-bold text-gray-900">{suggestion.userName}</h4>
                                <p className="text-sm text-gray-600">{getTimeAgo(suggestion.createdAt)}</p>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSuggestionColor(suggestion.type).replace('text-', 'bg-')}/20`}>
                              <i className={`${getSuggestionIcon(suggestion.type)} text-xl ${getSuggestionColor(suggestion.type)}`}></i>
                            </div>
                          </div>

                          {/* Suggestion Content */}
                          <div className="bg-white rounded-xl p-4 mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">{suggestion.description}</h5>
                            <div className="text-sm text-gray-600">
                              <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(suggestion.data, null, 2)}</pre>
                            </div>
                          </div>

                          {/* Comments Section */}
                          {suggestion.comments && suggestion.comments.length > 0 && (
                            <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
                              <h6 className="font-semibold text-gray-900 text-sm mb-3">💬 Comentários ({suggestion.comments.length})</h6>
                              {suggestion.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover" />
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h6 className="font-semibold text-gray-900 text-sm">{comment.userName}</h6>
                                      <p className="text-sm text-gray-700">{comment.text}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{getTimeAgo(comment.created_at)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment */}
                          <div className="bg-white rounded-xl p-4 mb-4">
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
                      ))}

                    {selectedTrip.pendingSuggestions.filter(s => s.status === 'pending').length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                          <i className="ri-check-line text-4xl text-green-500"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Tudo revisado!</h3>
                        <p className="text-gray-600">Não há sugestões pendentes no momento.</p>
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
