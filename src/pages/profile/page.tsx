import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateMenu from '../../components/CreateMenu';
import CreatePostModal from '../home/components/CreatePostModal';
import NotificationsPanel from '../home/components/NotificationsPanel';
import GamificationWidget from '../../components/GamificationWidget';
import WalletWidget from '../../components/WalletWidget';
import EditProfileModal from './components/EditProfileModal';
import HeaderActions from '../../components/HeaderActions'; // Added this import
import { ensureUserProfile, getFeedPosts, FeedPost, User as UserType, getUser, savedPostService } from '../../services/supabase';

type TabType = 'posts' | 'reels' | 'saved' | 'tagged';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [, setShowReels] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadProfileAndPosts = async () => {
      if (!user) return;
      try {
        setIsLoadingProfile(true);
        // Using ensureUserProfile to create a profile if it doesn't exist
        const profile = await ensureUserProfile();
        if (profile) {
          setUserProfile(profile);
          const userPosts = await getFeedPosts(20, 0, user.id);
          setPosts(userPosts);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      loadProfileAndPosts();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'saved' && user && savedPosts.length === 0) {
      const loadSaved = async () => {
        try {
          const data = await savedPostService.getSavedPosts(user.id);
          setSavedPosts(data);
        } catch (error) {
          console.error("Error loading saved posts:", error);
        }
      };
      loadSaved();
    }
  }, [activeTab, user, savedPosts.length]);

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Carregando perfil...</p>
      </div>
    );
  }

  // Fallback if profile still null but not loading
  const currentProfile = userProfile || {
    id: user?.id || '',
    username: user?.email?.split('@')[0] || 'user',
    full_name: user?.user_metadata?.full_name || 'Usuário',
    avatar_url: user?.user_metadata?.avatar_url,
    bio: '',
    website: '',
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    is_admin: false,
    created_at: '',
    updated_at: ''
  } as UserType;


  const tabs = [
    { id: 'posts' as TabType, icon: 'ri-grid-line', label: 'Posts' },
    { id: 'reels' as TabType, icon: 'ri-movie-line', label: 'Reels' },
    { id: 'saved' as TabType, icon: 'ri-bookmark-line', label: 'Salvos' },
    { id: 'tagged' as TabType, icon: 'ri-user-line', label: 'Marcações' },
  ];

  const menuItems = [
    { icon: 'ri-wallet-line', label: 'Carteira', action: () => setShowWallet(true) },
    { icon: 'ri-trophy-line', label: 'Conquistas', action: () => setShowGamification(true) },
    { icon: 'ri-settings-3-line', label: 'Editar Perfil', action: () => setShowEditProfile(true) },
  ];

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
                Perfil
              </h1>
            </button>
            <HeaderActions
              onShowNotifications={() => setShowNotifications(true)}
              showMenu={true}
              onShowMenu={() => setShowMenu(true)}
            />
          </div>
        </div>
      </header>

      {/* Profile Sections & UI unchanged except for using profile data */}
      {/* Menu Lateral (Drawer) */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => setShowMenu(false)}
          ></div>

          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 animate-slideInRight overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-2xl font-bold">Menu</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <img
                  src={currentProfile.avatar_url || 'https://via.placeholder.com/150'}
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">{currentProfile.full_name || currentProfile.username}</h3>
                  <p className="text-white/90 text-xs md:text-sm">@{currentProfile.username}</p>
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4 space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i className={`${item.icon} text - white text - base md: text - lg`}></i>
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-700 group-hover:text-gray-900 text-sm md:text-base">
                    {item.label}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-gray-600"></i>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="pt-[57px] md:pt-[73px] pb-20 md:pb-6">
        <div className="px-3 sm:px-4 md:px-6 max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <img
                src={currentProfile.avatar_url || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{currentProfile.full_name || currentProfile.username}</h2>
                  <p className="text-gray-500 text-sm">@{currentProfile.username}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="px-4 md:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all whitespace-nowrap text-sm"
                    >
                      Editar Perfil
                    </button>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px - 4 md: px - 6 py - 2 rounded - lg font - medium transition - all whitespace - nowrap text - sm ${isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 font-bold'
                        } `}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-start gap-6 mb-3">
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-900">{currentProfile.posts_count || posts.length}</div>
                    <div className="text-xs md:text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-gray-900">{currentProfile.followers_count || 0}</div>
                    <div className="text-xs md:text-sm text-gray-600">Seguidores</div>
                  </div>
                  <div className="text-center">
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
                    </a >
                  )}
                </div >
              </div >
            </div >
          </div >

          {/* Tabs */}
          < div className="bg-white rounded-xl shadow-sm mb-4" >
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <i className={`${tab.icon} text-base sm:text-lg`}></i>
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div >

          {/* Posts Grid */}
          {
            (activeTab === 'posts' ? posts : activeTab === 'saved' ? savedPosts : []).length > 0 ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {(activeTab === 'posts' ? posts : activeTab === 'saved' ? savedPosts : []).map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square bg-gray-100 rounded-sm sm:rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={post.image}
                      alt={`Post ${post.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <i className="ri-heart-fill text-base sm:text-xl"></i>
                        <span className="font-bold text-xs sm:text-sm">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <i className="ri-chat-3-fill text-base sm:text-xl"></i>
                        <span className="font-bold text-xs sm:text-sm">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                <i className="ri-camera-lens-line text-4xl mb-4 block opacity-20"></i>
                <p>Nenhuma postagem ainda.</p>
              </div>
            )
          }
        </div >
      </div >

      {/* Mobile Navigation */}
      < nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40" >
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
          <button onClick={() => setShowMenu(true)} className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
            <i className="ri-menu-line text-xl sm:text-2xl"></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav >

      {/* Modals */}
      {
        showEditProfile && (
          <EditProfileModal
            userProfile={currentProfile}
            onClose={() => setShowEditProfile(false)}
            onUpdate={(updated) => setUserProfile(updated)}
          />
        )
      }
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showCreateMenu && <CreateMenu onClose={() => setShowCreateMenu(false)} onSelectOption={handleCreateOption} />}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      {
        showGamification && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowGamification(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <GamificationWidget onClose={() => setShowGamification(false)} />
            </div>
          </div>
        )
      }
      {
        showWallet && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowWallet(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <WalletWidget onClose={() => setShowWallet(false)} />
            </div>
          </div>
        )
      }
    </div >
  );
}
