import { useState } from 'react';

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'comments' | 'follows'>('all');

  const notifications = [
    {
      id: 1,
      type: 'like',
      username: 'sarah_wilson',
      avatar: 'professional woman smiling friendly portrait',
      action: 'liked your photo',
      time: '5m',
      postImage: 'beautiful landscape sunset photography',
      isRead: false,
    },
    {
      id: 2,
      type: 'follow',
      username: 'mike_travels',
      avatar: 'professional man smiling friendly portrait',
      action: 'started following you',
      time: '12m',
      isRead: false,
    },
    {
      id: 3,
      type: 'comment',
      username: 'emma_art',
      avatar: 'professional woman artist portrait',
      action: 'commented: "Amazing work! 🔥"',
      time: '1h',
      postImage: 'creative art painting colorful',
      isRead: false,
    },
    {
      id: 4,
      type: 'like',
      username: 'john_fitness',
      avatar: 'professional fitness man portrait',
      action: 'liked your reel',
      time: '2h',
      postImage: 'fitness workout gym scene',
      isRead: true,
    },
    {
      id: 5,
      type: 'follow',
      username: 'lisa_food',
      avatar: 'professional woman chef portrait',
      action: 'started following you',
      time: '3h',
      isRead: true,
    },
    {
      id: 6,
      type: 'comment',
      username: 'david_photo',
      avatar: 'professional photographer man portrait',
      action: 'commented: "Love this shot!"',
      time: '5h',
      postImage: 'stunning cityscape photography',
      isRead: true,
    },
    {
      id: 7,
      type: 'like',
      username: 'anna_style',
      avatar: 'professional fashion woman portrait',
      action: 'liked your photo',
      time: '8h',
      postImage: 'fashion style photography',
      isRead: true,
    },
    {
      id: 8,
      type: 'follow',
      username: 'chris_music',
      avatar: 'professional musician man portrait',
      action: 'started following you',
      time: '12h',
      isRead: true,
    },
    {
      id: 9,
      type: 'comment',
      username: 'sophia_travel',
      avatar: 'professional woman traveler portrait',
      action: 'commented: "Where is this? 😍"',
      time: '1d',
      postImage: 'beautiful travel destination',
      isRead: true,
    },
    {
      id: 10,
      type: 'like',
      username: 'ryan_tech',
      avatar: 'professional tech man portrait',
      action: 'liked your post',
      time: '2d',
      postImage: 'modern technology gadget',
      isRead: true,
    },
  ];

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
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('likes')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'likes'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Likes
            </button>
            <button
              onClick={() => setActiveFilter('comments')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'comments'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveFilter('follows')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === 'follows'
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
                  className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Avatar with Icon Badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={`https://readdy.ai/api/search-image?query=$%7Bnotif.avatar%7D&width=100&height=100&seq=notif-avatar-${notif.id}&orientation=squarish`}
                        alt={notif.username}
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
                      <span className="font-semibold">{notif.username}</span>{' '}
                      <span className="text-gray-600">{notif.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
                  </div>

                  {/* Post Thumbnail or Follow Button */}
                  {notif.postImage ? (
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={`https://readdy.ai/api/search-image?query=$%7Bnotif.postImage%7D&width=100&height=100&seq=notif-post-${notif.id}&orientation=squarish`}
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
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
          <button className="w-full py-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
