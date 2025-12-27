import { useState, useEffect } from 'react';
import { getNotificationsWithDetails, supabase, markAllNotificationsAsRead } from '@/services/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

export default function NotificationsPanel({ onClose, onRefresh }: NotificationsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'comments' | 'follows'>('all');

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const data = await getNotificationsWithDetails(user.id);
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await markAllNotificationsAsRead(user.id);
        await loadNotifications();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'likes') return notif.type === 'like';
    if (activeFilter === 'comments') return notif.type === 'comment';
    if (activeFilter === 'follows') return notif.type === 'follow';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'ri-heart-fill text-red-500';
      case 'comment':
        return 'ri-chat-3-fill text-blue-500';
      case 'follow':
        return 'ri-user-add-fill text-green-500';
      default:
        return 'ri-notification-fill text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('likes')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'likes'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Likes
            </button>
            <button
              onClick={() => setActiveFilter('comments')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'comments'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveFilter('follows')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === 'follows'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Follows
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <i className="ri-notification-off-line text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/50' : ''
                    }`}
                >
                  {/* Avatar with Icon Badge */}
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

                  {/* Content */}
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

                  {/* Post Thumbnail or Follow Button */}
                  {notif.related_post?.image_url ? (
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={notif.related_post.image_url}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                      Follow
                    </button>
                  )}

                  {/* Unread Indicator */}
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
          <button
            onClick={handleMarkAllAsRead}
            className="w-full py-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
