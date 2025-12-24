import { useState, useEffect } from 'react';

interface ReelsModalProps {
  onClose: () => void;
}

export default function ReelsModal({ onClose }: ReelsModalProps) {
  const [currentReel, setCurrentReel] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const reels = [
    {
      id: 1,
      username: 'travel_vibes',
      avatar: 'travel-person',
      video: 'stunning travel destination beautiful landscape adventure scenic view',
      likes: 45678,
      comments: 892,
      caption: 'Paradise found 🌴✨ #travel #adventure',
      music: 'Summer Vibes - Tropical Beats',
    },
    {
      id: 2,
      username: 'dance_moves',
      avatar: 'dancer-person',
      video: 'energetic dance performance dynamic movement creative choreography',
      likes: 89234,
      comments: 1456,
      caption: 'New routine! What do you think? 💃🔥',
      music: 'Dance Hit 2025 - DJ Mix',
    },
    {
      id: 3,
      username: 'cooking_magic',
      avatar: 'chef-person',
      video: 'delicious food preparation cooking process culinary art kitchen scene',
      likes: 67890,
      comments: 1123,
      caption: 'Easy recipe you need to try! 🍳👨‍🍳',
      music: 'Cooking Time - Kitchen Beats',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp' && currentReel > 0) setCurrentReel(currentReel - 1);
      if (e.key === 'ArrowDown' && currentReel < reels.length - 1) setCurrentReel(currentReel + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentReel, onClose]);

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentReel > 0) {
      setCurrentReel(currentReel - 1);
      setIsLiked(false);
    } else if (direction === 'down' && currentReel < reels.length - 1) {
      setCurrentReel(currentReel + 1);
      setIsLiked(false);
    }
  };

  const reel = reels[currentReel];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
      >
        <i className="ri-close-line text-2xl"></i>
      </button>

      {/* Reels Container */}
      <div className="relative w-full max-w-[500px] h-full flex items-center justify-center">
        {/* Navigation Arrows */}
        {currentReel > 0 && (
          <button
            onClick={() => handleScroll('up')}
            className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <i className="ri-arrow-up-s-line text-2xl"></i>
          </button>
        )}

        {currentReel < reels.length - 1 && (
          <button
            onClick={() => handleScroll('down')}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <i className="ri-arrow-down-s-line text-2xl"></i>
          </button>
        )}

        {/* Reel Content */}
        <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden">
          <img
            src={`https://readdy.ai/api/search-image?query=$%7Breel.video%7D%20vertical%20format%20portrait%20orientation&width=500&height=889&seq=reel-modal-${reel.id}&orientation=portrait`}
            alt="Reel"
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

          {/* Top Info */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={`https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20$%7Breel.avatar%7D%20smiling%20friendly%20face&width=100&height=100&seq=reel-avatar-${reel.id}&orientation=squarish`}
                  alt={reel.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-semibold text-sm">{reel.username}</span>
              <button className="px-4 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                Follow
              </button>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            >
              <i className={`${isMuted ? 'ri-volume-mute-line' : 'ri-volume-up-line'} text-xl`}></i>
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-20 z-10">
            <p className="text-white text-sm mb-2">{reel.caption}</p>
            <div className="flex items-center gap-2 text-white text-xs">
              <i className="ri-music-2-line"></i>
              <span className="truncate">{reel.music}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-10">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
            >
              <div className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-white'} text-2xl`}></i>
              </div>
              <span className="text-white text-xs font-medium">
                {(isLiked ? reel.likes + 1 : reel.likes).toLocaleString()}
              </span>
            </button>

            <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
              <div className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className="ri-chat-3-line text-white text-2xl"></i>
              </div>
              <span className="text-white text-xs font-medium">{reel.comments}</span>
            </button>

            <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
              <div className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className="ri-share-forward-line text-white text-2xl"></i>
              </div>
            </button>

            <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
              <div className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className="ri-more-2-line text-white text-2xl"></i>
              </div>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
          {reels.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                index === currentReel ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
