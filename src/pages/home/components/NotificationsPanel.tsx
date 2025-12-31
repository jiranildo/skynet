import { useState, useEffect } from 'react';
import { getNotificationsWithDetails, supabase, markAllNotificationsAsRead } from '@/services/supabase';
import { getPendingGroupInvites, respondToGroupInvite } from '@/services/messages/groupService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

export default function NotificationsPanel({ onClose, onRefresh }: NotificationsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'invites' | 'likes' | 'comments' | 'follows'>('all');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [notifsData, invitesData] = await Promise.all([
          getNotificationsWithDetails(user.id),
          getPendingGroupInvites()
        ]);
        setNotifications(notifsData);
        setInvites(invitesData || []);
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

  const handleInviteResponse = async (type: 'group' | 'community', targetId: string, accept: boolean) => {
    try {
      await respondToGroupInvite(type, targetId, accept);
      // Remove locally or reload
      setInvites(prev => prev.filter(i => i.target_id !== targetId));
      loadData();
    } catch (e) {
      console.error(e);
      setError('Erro ao responder convite');
    }
  };

  const filteredItems = () => {
    // If specific filter
    if (activeFilter === 'invites') return invites.map(i => ({ ...i, origin_type: i.type, type: 'invite', created_at: i.created_at || new Date().toISOString() })); // Adapter

    // Notifications filter
    const filteredNotifs = notifications.filter(notif => {
      if (activeFilter === 'likes') return notif.type === 'like';
      if (activeFilter === 'comments') return notif.type === 'comment';
      if (activeFilter === 'follows') return notif.type === 'follow';
      return true;
    });

    if (activeFilter === 'all') {
      const inviteItems = invites.map(i => ({ ...i, origin_type: i.type, type: 'invite', created_at: i.created_at || new Date().toISOString() }));
      // Combine and sort by date? Invites usually high priority. 
      // Let's put invites at top.
      return [...inviteItems, ...filteredNotifs];
    }

    return filteredNotifs;
  };

  const items = filteredItems();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return 'ri-heart-fill text-red-500';
      case 'comment': return 'ri-chat-3-fill text-blue-500';
      case 'follow': return 'ri-user-add-fill text-green-500';
      case 'invite': return 'ri-mail-send-fill text-purple-500';
      default: return 'ri-notification-fill text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Tudo
            </button>
            <button
              onClick={() => setActiveFilter('invites')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeFilter === 'invites'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
            >
              Convites
              {invites.length > 0 && <span className="bg-white text-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold px-1">{invites.length}</span>}
            </button>
            <button
              onClick={() => setActiveFilter('likes')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'likes'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Curtidas
            </button>
            <button
              onClick={() => setActiveFilter('comments')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'comments'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Comentários
            </button>
            <button
              onClick={() => setActiveFilter('follows')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'follows'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Seguidores
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 p-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <i className="ri-error-warning-line text-3xl text-red-500 mb-2"></i>
              <p className="text-gray-900 font-medium">Erro: {error}</p>
              <button onClick={loadData} className="mt-2 text-blue-500 hover:underline">Tentar novamente</button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <i className="ri-notification-off-line text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-sm">Sem notificações</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                if (item.type === 'invite') {
                  return (
                    <div key={item.id} className="p-4 bg-purple-50/30 hover:bg-purple-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200">
                            {item.avatar_url ? (
                              <img src={item.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-200 text-purple-600 font-bold">
                                {item.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <i className="ri-mail-star-fill text-xs text-purple-600"></i>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600 mb-2">Convidou você para participar do grupo.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleInviteResponse(item.origin_type, item.target_id, true)}
                              className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all"
                            >
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleInviteResponse(item.origin_type, item.target_id, false)}
                              className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
                            >
                              Recusar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const notif = item;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50' : ''
                      }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={notif.related_user?.avatar_url || `https://readdy.ai/api/search-image?query=portrait&width=100&height=100&seq=notif-${notif.id}`}
                          alt={notif.related_user?.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <i className={`${getIcon(notif.type)} text-xs`}></i>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{notif.related_user?.username}</span>{' '}
                        <span className="text-gray-600">
                          {notif.type === 'like' && 'curtiu seu post'}
                          {notif.type === 'comment' && 'comentou: "..."'}
                          {notif.type === 'follow' && 'começou a te seguir'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>

                    {notif.related_post?.image_url ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={notif.related_post.image_url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      notif.type === 'follow' && (
                        <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                          Seguir
                        </button>
                      )
                    )}

                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
          <button
            onClick={handleMarkAllAsRead}
            className="w-full py-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            Marcar tudo como lido
          </button>
        </div>
      </div>
    </div>
  );
}
