import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateMenu from '../../components/CreateMenu';
import CreatePostModal from '../home/components/CreatePostModal';
import NotificationsPanel from '../home/components/NotificationsPanel';
// import GamificationWidget from '../../components/GamificationWidget'; // Removed as it is now in ProfileHub
// import WalletWidget from '../../components/WalletWidget'; // Removed as it is now in ProfileHub
// import EditProfileModal from './components/EditProfileModal'; // Removed as it is now in ProfileHub
// import SettingsModal from './components/SettingsModal'; // Removed as it is now in ProfileHub
// import ProfileHubModal from './components/ProfileHubModal'; // Removed as we are using SettingsPage now
import HeaderActions from '../../components/HeaderActions';
import {
  ensureUserProfile,
  getFeedPosts,
  FeedPost,
  User as UserType,
  getUser,
  getUserByUsername,
  savedPostService,
  followUser,
  unfollowUser,
  checkIfReelLiked,
  getReelsByUser,
  getFollowers,
  getFollowing,
  storyService,
  Story
} from '../../services/supabase';
import UserListModal from './components/UserListModal';
import { supabase } from '../../services/supabase';
import StoryViewer from '../home/components/StoryViewer';

type TabType = 'posts' | 'reels' | 'saved' | 'tagged';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const { user: authUser, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  /* New ProfileHub State - REMOVED, using SettingsPage */
  // const [profileHub, setProfileHubState] = useState<{ isOpen: boolean; tab: 'edit' | 'settings' | 'wallet' | 'gamification' }>({
  //   isOpen: false,
  //   tab: 'edit'
  // });

  // Old states removed:
  // const [showEditProfile, setShowEditProfile] = useState(false);
  // const [showSettings, setShowSettings] = useState(false);
  // const [showGamification, setShowGamification] = useState(false);
  // const [showWallet, setShowWallet] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Determine which user ID we are viewing
  const targetUserId = routeUserId || authUser?.id;
  const isOwnProfile = authUser && targetUserId === authUser.id;

  useEffect(() => {
    if (!authLoading && !authUser && !routeUserId) {
      navigate('/login');
    }
  }, [authUser, authLoading, routeUserId, navigate]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReels, setShowReels] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // const [showMenu, setShowMenu] = useState(false); // Removed as main menu is now settings page
  // const [showGamification, setShowGamification] = useState(false); // Removed
  // const [showWallet, setShowWallet] = useState(false); // Removed
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Follower/Following Modal State
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Load Profile Data
  useEffect(() => {
    const loadProfileAndPosts = async () => {
      if (!targetUserId) return;

      try {
        setIsLoadingProfile(true);

        let profile: UserType | null = null;

        if (isOwnProfile) {
          profile = await ensureUserProfile();
        } else {
          // Check if targetUserId is a UUID
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);

          if (isUuid) {
            profile = await getUser(targetUserId);
          } else {
            // Try fetching by username
            try {
              profile = await getUserByUsername(targetUserId);
            } catch (e) {
              console.warn("User not found by username, assuming ID or invalid");
            }
          }
        }

        if (profile) {
          setUserProfile(profile);
          const realUserId = profile.id; // Use the resolved UUID

          // Fetch posts for this user
          const userPosts = await getFeedPosts(20, 0, realUserId);
          setPosts(userPosts);

          // Fetch reels for this user
          try {
            const userReels = await getReelsByUser(realUserId);
            setReels(userReels);
          } catch (e) {
            console.error("Error loading reels:", e);
          }

          // Fetch stories for this user
          try {
            const stories = await storyService.getByUser(realUserId);
            setUserStories(stories);
          } catch (e) {
            console.error("Error loading stories:", e);
          }

          // If viewing another user, check if following
          if (!isOwnProfile && authUser) {
            const { count } = await supabase
              .from('followers')
              .select('*', { count: 'exact', head: true })
              .eq('follower_id', authUser.id)
              .eq('following_id', realUserId);

            setIsFollowing(!!count);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileAndPosts();
  }, [targetUserId, authUser, isOwnProfile]);

  // Handle Follow/Unfollow
  const handleFollowToggle = async () => {
    if (!authUser || !userProfile || isFollowLoading) {
      console.warn("Follow aborted: Missing authUser, userProfile, or loading.", { authUser, userProfile, isFollowLoading });
      return;
    }

    const followerId = authUser.id;
    const followingId = userProfile.id;

    console.log(`Attempting to ${isFollowing ? 'unfollow' : 'follow'} user.`, { followerId, followingId });

    setIsFollowLoading(true);
    // Optimistic update
    const previousState = isFollowing;
    const previousFollowers = userProfile?.followers_count || 0;

    setIsFollowing(!previousState);
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        followers_count: previousState ? previousFollowers - 1 : previousFollowers + 1
      });
    }

    try {
      if (previousState) {
        await unfollowUser(followerId, followingId);
        console.log("Unfollow successful");
      } else {
        await followUser(followerId, followingId);
        console.log("Follow successful");
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      alert(`Erro ao seguir/deixar de seguir: ${error.message || JSON.stringify(error)}`);

      // Revert on error
      setIsFollowing(previousState);
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          followers_count: previousFollowers
        });
      }
    } finally {
      setIsFollowLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === 'saved' && isOwnProfile && savedPosts.length === 0) {
      const loadSaved = async () => {
        if (!authUser) return;
        try {
          const data = await savedPostService.getSavedPosts(authUser.id);
          setSavedPosts(data);
        } catch (error) {
          console.error("Error loading saved posts:", error);
        }
      };
      loadSaved();
    }
  }, [activeTab, isOwnProfile, authUser, savedPosts.length]);

  if (authLoading && !userProfile) { // Show loading only if we have no profile data yet
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Carregando perfil...</p>
      </div>
    );
  }

  // Safe fallback
  const currentProfile = userProfile || {
    id: targetUserId || '',
    username: '...',
    full_name: 'Usuário',
    avatar_url: undefined,
    bio: '',
    website: '',
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    privacy_setting: 'public'
  } as UserType;


  // Helper functions
  const handleCreateClick = () => {
    setShowCreateMenu(true);
  };

  const handleCreateOption = (option: 'post' | 'travel' | 'cellar' | 'food') => {
    if (option === 'post') {
      setShowCreatePost(true);
    } else if (option === 'travel') {
      window.REACT_APP_NAVIGATE('/travel');
    } else if (option === 'cellar') {
      window.REACT_APP_NAVIGATE('/cellar');
    } else if (option === 'food') {
      window.REACT_APP_NAVIGATE('/drinks-food');
    }
  };

  const handleOpenFollowers = async () => {
    if (!currentProfile?.id) return;
    setShowFollowersModal(true);
    setIsLoadingList(true);
    try {
      const data = await getFollowers(currentProfile.id);
      setFollowersList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleOpenFollowing = async () => {
    if (!currentProfile?.id) return;
    setShowFollowingModal(true);
    setIsLoadingList(true);
    try {
      const data = await getFollowing(currentProfile.id);
      setFollowingList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleRemoveFollower = async (targetUserId: string) => {
    if (!authUser || !currentProfile) return;
    // Current user is the 'following' (me), target is 'follower'
    // unfollowUser deletes based on follower_id, following_id
    try {
      await unfollowUser(targetUserId, authUser.id);
      setFollowersList(prev => prev.filter(item => item.follower_id !== targetUserId));
      // Update local count
      setUserProfile(prev => prev ? ({ ...prev, followers_count: (prev.followers_count || 1) - 1 }) : null);
    } catch (e) {
      console.error("Error removing follower:", e);
      alert("Erro ao remover seguidor.");
    }
  };

  const handleUnfollowFromList = async (targetUserId: string) => {
    if (!authUser) return;
    // Current user is 'follower' (me), target is 'following'
    try {
      await unfollowUser(authUser.id, targetUserId);
      setFollowingList(prev => prev.filter(item => item.following_id !== targetUserId));
      // Update local count
      setUserProfile(prev => prev ? ({ ...prev, following_count: (prev.following_count || 1) - 1 }) : null);

      // If we are on that user's profile, update the main button too
      if (targetUserId === currentProfile.id) {
        setIsFollowing(false);
      }
    } catch (e) {
      console.error("Error unfollowing:", e);
      alert("Erro ao deixar de seguir.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="px-3 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="hover:scale-110 transition-transform"
            >
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 bg-clip-text text-transparent">
                {isOwnProfile ? 'Meu Perfil' : `Perfil de @${currentProfile.username}`}
              </h1>
            </button>
            <HeaderActions
              onShowNotifications={() => setShowNotifications(true)}
              showMenu={isOwnProfile} // Still show the button
              onShowMenu={() => navigate('/settings')} // Go to unified menu
              menuIcon="ri-settings-3-line"
            />
          </div>
        </div>
      </header>

      {/* Menu Lateral (Drawer) - Removed */}{/*
      {showMenu && isOwnProfile && (
        <>
        ... removed ...
        </>
      )}
      */}

      {/* Content */}
      <div className="pt-[57px] md:pt-[73px] pb-20 md:pb-6">
        <div className="px-3 sm:px-4 md:px-6 max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <div className="relative group cursor-pointer" onClick={() => userStories.length > 0 && setShowStoryViewer(true)}>
                <div className={`p-[3px] rounded-full ${userStories.length > 0 ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600' : 'bg-transparent'}`}>
                  <div className="bg-white p-[2px] rounded-full">
                    <img
                      src={currentProfile.avatar_url || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-sm"
                    />
                  </div>
                </div>
                {userStories.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="ri-play-circle-fill text-white text-4xl drop-shadow-md"></i>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{currentProfile.full_name || currentProfile.username}</h2>
                  <p className="text-gray-500 text-sm">@{currentProfile.username}</p>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={() => navigate('/settings?tab=edit')}
                          className="bg-gray-100 text-gray-900 px-6 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-gray-200 transition-all text-sm w-full sm:w-auto justify-center"
                        >
                          <i className="ri-edit-line text-lg"></i>
                          <span>Editar Perfil</span>
                        </button>
                        <button
                          onClick={() => navigate('/settings')}
                          className="bg-gray-100 text-gray-700 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-all"
                          title="Mais Opções"
                        >
                          <i className="ri-menu-add-line text-lg"></i>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className={`px-6 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 ${isFollowing
                          ? 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                          : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isFollowLoading ? (
                          <i className="ri-loader-4-line animate-spin text-lg"></i>
                        ) : isFollowing ? (
                          <>
                            <i className="ri-user-check-fill text-lg"></i>
                            Seguindo
                          </>
                        ) : (
                          <>
                            <i className="ri-user-add-line text-lg"></i>
                            Seguir
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-center sm:justify-start gap-6 mb-3">
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-900">{currentProfile.posts_count || posts.length}</div>
                    <div className="text-xs md:text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={handleOpenFollowers}>
                    <div className="text-lg md:text-xl font-bold text-gray-900">{currentProfile.followers_count || 0}</div>
                    <div className="text-xs md:text-sm text-gray-600">Seguidores</div>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={handleOpenFollowing}>
                    <div className="text-lg md:text-xl font-bold text-gray-900">{currentProfile.following_count || 0}</div>
                    <div className="text-xs md:text-sm text-gray-600">Seguindo</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{currentProfile.full_name}</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2 whitespace-pre-wrap">
                    {currentProfile.bio || 'Sem biografia ainda.'}
                  </p>
                  {currentProfile.website && (
                    <a
                      href={currentProfile.website.startsWith('http') ? currentProfile.website : `https://${currentProfile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 font-medium text-xs md:text-sm flex items-center gap-1 justify-center sm:justify-start"
                    >
                      <i className="ri-link"></i>
                      {currentProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {/* Location display based on settings */}
                  {currentProfile.location && currentProfile.show_location !== false && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm mt-1">
                      <i className="ri-map-pin-line"></i>
                      <span>{currentProfile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Check */}
          {(!isOwnProfile && (currentProfile.privacy_setting === 'private' || currentProfile.privacy_setting === 'friends') && !isFollowing) ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-lock-2-line text-4xl text-gray-400"></i>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Esta conta é privada</h3>
              <p className="text-gray-500 text-sm mt-1">Siga esta conta para ver suas fotos e vídeos.</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm mb-4">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${activeTab === 'posts'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <i className="ri-grid-line text-base sm:text-lg"></i>
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium">Posts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reels')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${activeTab === 'reels'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <i className="ri-movie-line text-base sm:text-lg"></i>
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium">Reelss</span>
                  </button>

                  {isOwnProfile && (
                    <button
                      onClick={() => setActiveTab('saved')} // Only owner can see saved
                      className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${activeTab === 'saved'
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      <i className="ri-bookmark-line text-base sm:text-lg"></i>
                      <span className="hidden sm:inline text-xs sm:text-sm font-medium">Salvos</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('tagged')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${activeTab === 'tagged'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <i className="ri-user-line text-base sm:text-lg"></i>
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium">Marcações</span>
                  </button>
                </div>
              </div>

              {/* Posts Grid */}
              {
                (activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : activeTab === 'saved' ? savedPosts : []).length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    {(activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : activeTab === 'saved' ? savedPosts : []).map((item: any) => (
                      <div
                        key={item.id}
                        className="relative aspect-square bg-gray-100 rounded-sm sm:rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => {
                          // TODO: Handle click (open post/reel modal)
                        }}
                      >
                        {activeTab === 'reels' ? (
                          <video
                            src={item.video_url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.image || item.image_url}
                            alt={`Post ${item.id}`}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <div className="flex items-center gap-1 text-white">
                            <i className="ri-heart-fill text-base sm:text-xl"></i>
                            <span className="font-bold text-xs sm:text-sm">{item.likes || item.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white">
                            <i className={`ri-${activeTab === 'reels' ? 'play-circle-fill' : 'chat-3-fill'} text-base sm:text-xl`}></i>
                            <span className="font-bold text-xs sm:text-sm">{activeTab === 'reels' ? item.views_count : item.comments}</span>
                          </div>
                        </div>
                        {activeTab === 'reels' && (
                          <div className="absolute top-2 right-2 text-white">
                            <i className="ri-movie-fill drop-shadow-md"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                    <i className={`ri-${activeTab === 'reels' ? 'movie' : 'camera-lens'}-line text-4xl mb-4 block opacity-20`}></i>
                    <p>Nenhuma {activeTab === 'reels' ? 'publicação (Reel)' : 'postagem'} ainda.</p>
                  </div>
                )
              }
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-2 py-2 sm:py-3">
          <button onClick={() => window.REACT_APP_NAVIGATE('/')} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <i className="ri-home-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <i className="ri-compass-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Explorar</span>
          </button>
          <button onClick={handleCreateClick} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium">Criar</span>
          </button>
          <button onClick={() => setShowReels(true)} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <i className="ri-movie-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Reels</span>
          </button>
          {isOwnProfile ? (
            <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
              <i className="ri-user-settings-line text-xl sm:text-2xl"></i>
              <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
            </button>
          ) : (
            // If viewing another user, maybe show 'Profile' link to go back to own profile? For now, stick to standard
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                <img src={authUser?.user_metadata?.avatar_url || 'https://via.placeholder.com/30'} alt="Me" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium">Eu</span>
            </button>
          )}
        </div>
      </nav >

      {/* Modals */}
      {/* ProfileHubModal REMOVED - using SettingsPage */}

      {
        userStories.length > 0 && showStoryViewer && (
          <StoryViewer
            stories={userStories}
            onClose={() => setShowStoryViewer(false)}
          />
        )
      }
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showCreateMenu && <CreateMenu onClose={() => setShowCreateMenu(false)} onSelectOption={handleCreateOption} />}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}

      {showFollowersModal && (
        <UserListModal
          title="Seguidores"
          users={followersList}
          onClose={() => setShowFollowersModal(false)}
          onAction={handleRemoveFollower}
          actionLabel="Remover"
          actionIcon="ri-close-circle-line"
          isLoading={isLoadingList}
          isActionDestructive={true}
        />
      )}

      {showFollowingModal && (
        <UserListModal
          title="Seguindo"
          users={followingList}
          onClose={() => setShowFollowingModal(false)}
          onAction={handleUnfollowFromList}
          actionLabel="Seguindo"
          actionIcon="ri-user-check-line"
          isLoading={isLoadingList}
          isActionDestructive={true}
        />
      )}
    </div >
  );
}
