import { useState, useEffect } from 'react';
import { getNotificationsWithDetails, supabase, markAllNotificationsAsRead, markNotificationAsRead, deleteNotification, getPendingFriendRequests, respondToFriendRequest } from '@/services/supabase';
import { getPendingGroupInvites, respondToGroupInvite } from '@/services/messages/groupService';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

export default function NotificationsPanel({ onClose, onRefresh }: NotificationsPanelProps) {
  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    categories: {
      tags: true, // Mentions/Tags (approximated by internal logic or specific types if available)
      comments: true,
      follows: true,
      likes: true // Added likes as it's common
    },
    accountTypes: {
      verified: true, // We don't have verified status yet, keeping for UI
      followed: true  // We don't have simplified "is followed" check on notif yet easily, but can add UI
    }
  });

  const activeFilterCount = Object.values(filterConfig.categories).filter(v => v).length +
    Object.values(filterConfig.accountTypes).filter(v => v).length;

  const isFiltered = activeFilterCount > 0;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [processedItems, setProcessedItems] = useState<Record<string, 'accepted' | 'rejected' | 'followed_back'>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [notifsData, invitesData, friendRequestsData] = await Promise.all([
          getNotificationsWithDetails(user.id),
          getPendingGroupInvites(),
          getPendingFriendRequests()
        ]);
        setNotifications(notifsData);
        // Merge group invites and friend requests
        setInvites([...(invitesData || []), ...(friendRequestsData || [])]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || JSON.stringify(error) || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await markAllNotificationsAsRead(user.id);
        loadData(); // Reload to refresh both lists if needed
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleInviteResponse = async (type: 'group' | 'community' | 'friend', targetId: string, accept: boolean, followBack = false) => {
    try {
      // 1. Optimistic Update: Mark as processed immediately
      const status = followBack ? 'followed_back' : (accept ? 'accepted' : 'rejected');
      setProcessedItems(prev => ({ ...prev, [targetId]: status }));

      if (type === 'friend') {
        // Logic for friend request response
        await respondToFriendRequest(targetId, accept);
      } else {
        await respondToGroupInvite(type, targetId, accept);
      }

      // We do NOT reload data here to keep the item visible with its new status
      // We only reload if we really need to sync other things, but for this UX request, persistence is key.
      // loadData(); 
    } catch (e) {
      console.error(e);
      setError('Erro ao responder convite');
      // Revert optimistic update on error
      setProcessedItems(prev => {
        const newState = { ...prev };
        delete newState[targetId];
        return newState;
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id));
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      loadData(); // Revert on error
    }
  };

  const filteredItems = () => {
    // 1. Merge invites and notifications into a single list first for unified filtering
    const inviteItems = invites.map(i => ({ ...i, origin_type: i.type, type: 'invite', created_at: i.created_at || new Date().toISOString() }));
    const allItems = [...inviteItems, ...notifications];

    // 2. Apply Filters
    return allItems.filter(item => {
      // Always show system/trip alerts regardless of "social" filters unless we add specific toggle
      if (['alert', 'warning', 'trip', 'system'].includes(item.type)) return true;

      // Categories Map
      if (item.type === 'like' && !filterConfig.categories.likes) return false;
      if (item.type === 'comment' && !filterConfig.categories.comments) return false;
      if (item.type === 'follow' && !filterConfig.categories.follows) return false;
      if ((item.type === 'invite' || item.type === 'mention') && !filterConfig.categories.tags) return false;

      // Account types (Placeholder logic until we have real data)
      // if (item.related_user?.is_verified && !filterConfig.accountTypes.verified) return false;

      return true;
    });
  };

  const items = filteredItems();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return 'ri-heart-fill text-red-500';
      case 'comment': return 'ri-chat-3-fill text-blue-500';
      case 'follow': return 'ri-user-add-fill text-green-500';
      case 'invite': return 'ri-mail-star-fill text-purple-500';
      case 'message': return 'ri-message-3-fill text-sky-500';
      case 'alert': return 'ri-alarm-warning-fill';
      case 'warning': return 'ri-error-warning-fill';
      case 'trip': return 'ri-plane-fill';
      default: return 'ri-notification-fill text-gray-500';
    }
  };

  const renderNotificationItem = (item: any) => {
    if (item.type === 'invite') {
      const isFriendRequest = item.origin_type === 'friend';
      return (
        <div key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200">
                {item.avatar_url ? (
                  <img src={item.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-200 text-purple-600 font-bold">
                    {item.name[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <i className={`text-xs text-purple-600 ${isFriendRequest ? 'ri-user-add-fill' : 'ri-mail-star-fill'}`}></i>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600 mb-2">
                {isFriendRequest ? 'Enviou uma solicitação de amizade.' : 'Convidou você para participar do grupo.'}
              </p>
              {processedItems[item.target_id] ? (
                <div className="text-sm text-gray-500 font-medium">
                  {processedItems[item.target_id] === 'followed_back' && 'Solicitação aceita'}
                  {processedItems[item.target_id] === 'accepted' && 'Solicitação aceita'}
                  {processedItems[item.target_id] === 'rejected' && 'Solicitação excluída'}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => handleInviteResponse(item.origin_type, item.target_id, true)}
                    className="flex-1 min-w-[100px] px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleInviteResponse(item.origin_type, item.target_id, false)}
                    className="flex-1 min-w-[100px] px-4 py-1.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-200"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    /* SYSTEM NOTIFICATION RENDERER */
    const notif = item;
    const isSystem = ['alert', 'warning', 'trip', 'system'].includes(notif.type) || !notif.related_user;
    const iconInfo = getIcon(notif.type);

    const createdDate = new Date(notif.created_at);

    return (
      <div
        key={notif.id}
        onClick={() => {
          if (!notif.is_read) handleMarkAsRead(notif.id);
        }}
        className={`relative group flex gap-3 px-4 py-2.5 items-center hover:bg-gray-50 transition-all cursor-pointer`}
      >
        {/* Avatar / Icon */}
        <div className="flex-shrink-0 relative">
          {isSystem ? (
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${notif.type === 'alert' ? 'bg-red-50 border-red-100 text-red-600' :
              notif.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                notif.type === 'trip' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-600'
              }`}>
              <i className={`${iconInfo} text-lg`}></i>
            </div>
          ) : (
            <div className="w-11 h-11 relative">
              <img
                src={notif.related_user?.avatar_url || `https://ui-avatars.com/api/?name=${notif.related_user?.username || 'User'}&background=random`}
                alt={notif.related_user?.username}
                className="w-full h-full object-cover rounded-full"
              />
              {/* Type Badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                {notif.type === 'like' && <i className="ri-heart-fill text-xs text-red-500"></i>}
                {notif.type === 'comment' && <i className="ri-chat-3-fill text-xs text-blue-500"></i>}
                {notif.type === 'follow' && <i className="ri-user-add-fill text-xs text-green-500"></i>}
                {notif.type === 'message' && <i className="ri-message-3-fill text-xs text-sky-500"></i>}
                {!['like', 'comment', 'follow', 'message'].includes(notif.type) && <i className="ri-notification-fill text-xs text-gray-500"></i>}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[14px] text-gray-900 leading-snug">
            {isSystem ? (
              <span className="font-semibold">{notif.title}</span>
            ) : (
              <span className="font-semibold">{notif.related_user?.username}</span>
            )}
            <span className="text-gray-900 font-normal ml-1">
              {isSystem ? (
                <span className="text-gray-600 block text-[13px] mt-0.5 font-normal">{notif.message}</span>
              ) : (
                <>
                  {notif.type === 'like' && 'curtiu seu post.'}
                  {notif.type === 'comment' && `comentou: "${notif.message}"`}
                  {notif.type === 'follow' && 'começou a seguir você.'}
                  {notif.type === 'message' && `enviou uma mensagem: "${notif.message}"`}
                </>
              )}
            </span>
            <span className="text-gray-500 text-[13px] ml-1.5 font-normal whitespace-nowrap">
              {getShortTime(createdDate)}
            </span>
          </p>
        </div>

        {/* Post Thumbnail (Media) */}
        {!isSystem && notif.related_post?.image_url && (
          <div className="w-11 h-11 rounded bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 ml-1 self-center">
            <img
              src={notif.related_post.image_url}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Actions (Delete/Read) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNotification(notif.id);
            }}
            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            title="Excluir"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>

        {/* Read Indicator */}
        {!notif.is_read && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
        )}
      </div>
    );
  };

  const getShortTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) return `${diffMins || 1}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };

  // Group notifications by date (and filter requests)
  const groupedNotifications = items.reduce((groups, item) => {
    if (item.type === 'invite') {
      if (!groups['Solicitações de seguir']) groups['Solicitações de seguir'] = [];
      groups['Solicitações de seguir'].push(item);
      return groups;
    }

    const date = new Date(item.created_at);
    let key = 'Anteriores';

    if (isThisWeek(date)) key = 'Esta Semana';
    else if (date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()) key = 'Este Mês';

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, typeof items>);

  const groupOrder = ['Solicitações de seguir', 'Esta Semana', 'Este Mês', 'Anteriores'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="md:hidden -ml-2 p-2">
                <i className="ri-arrow-left-line text-2xl text-gray-900"></i>
              </button>
              <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => setShowFilter(true)}
                className={`text-sm font-semibold transition-colors ${isFiltered ? 'text-blue-500' : 'text-blue-500 hover:text-blue-600'}`}
              >
                Filtrar {isFiltered ? `(${activeFilterCount})` : ''}
              </button>
            )}
          </div>
        </div>

        {/* Filter Overlay */}
        {showFilter && (
          <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px]" onClick={() => setShowFilter(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl overflow-hidden flex flex-col max-h-[70%]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="w-8"></div> {/* Spacer */}
                <h3 className="text-base font-bold text-gray-900">Filtrar</h3>
                <button onClick={() => setShowFilter(false)} className="w-8 flex justify-end">
                  <i className="ri-close-line text-2xl text-gray-900"></i>
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Categorias</h4>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base text-gray-700">Marcações e menções</span>
                    <input
                      type="checkbox"
                      checked={filterConfig.categories.tags}
                      onChange={e => setFilterConfig(prev => ({ ...prev, categories: { ...prev.categories, tags: e.target.checked } }))}
                      className="w-6 h-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base text-gray-700">Comentários</span>
                    <input
                      type="checkbox"
                      checked={filterConfig.categories.comments}
                      onChange={e => setFilterConfig(prev => ({ ...prev, categories: { ...prev.categories, comments: e.target.checked } }))}
                      className="w-6 h-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base text-gray-700">Solicitações para seguir</span>
                    <input
                      type="checkbox"
                      checked={filterConfig.categories.follows}
                      onChange={e => setFilterConfig(prev => ({ ...prev, categories: { ...prev.categories, follows: e.target.checked } }))}
                      className="w-6 h-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base text-gray-700">Curtidas</span>
                    <input
                      type="checkbox"
                      checked={filterConfig.categories.likes}
                      onChange={e => setFilterConfig(prev => ({ ...prev, categories: { ...prev.categories, likes: e.target.checked } }))}
                      className="w-6 h-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-4"></div>

                {/* Account Types (Visual only for now + verified placeholder) */}
                <h4 className="text-sm font-bold text-gray-900 mb-4">Tipos de contas</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base text-gray-700">Verificado</span>
                    <input
                      type="checkbox"
                      checked={filterConfig.accountTypes.verified}
                      onChange={e => setFilterConfig(prev => ({ ...prev, accountTypes: { ...prev.accountTypes, verified: e.target.checked } }))}
                      className="w-6 h-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-base text-gray-700">Pessoas que você segue</span>
                    <input
                      type="checkbox"
                      checked={filterConfig.accountTypes.followed}
                      onChange={e => setFilterConfig(prev => ({ ...prev, accountTypes: { ...prev.accountTypes, followed: e.target.checked } }))}
                      className="w-6 h-6 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-gray-900 font-medium">Erro ao carregar</p>
              <button onClick={loadData} className="mt-2 text-sm text-blue-500 font-semibold">Tentar novamente</button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
                <i className="ri-heart-line text-3xl text-gray-900"></i>
              </div>
              <p className="text-gray-900 font-semibold text-lg">Atividade nos seus posts</p>
              <p className="text-gray-500 text-sm text-center mt-1">Quando alguém curtir ou comentar, você verá aqui.</p>
            </div>
          ) : (
            <div className="pb-4 pt-1">
              {groupOrder.map(group => {
                const groupItems = groupedNotifications[group];
                if (!groupItems || groupItems.length === 0) return null;

                return (
                  <div key={group}>
                    <h3 className="px-4 py-3 text-base font-bold text-gray-900 bg-white">{group}</h3>
                    <div className="flex flex-col">
                      {groupItems.map(item => renderNotificationItem(item))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-3">
          <button
            onClick={handleMarkAllAsRead}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Marcar tudo como lido
          </button>
        </div>
      </div>
    </div>
  );
}
