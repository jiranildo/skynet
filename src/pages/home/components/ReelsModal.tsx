import { useState, useEffect } from 'react';
import { getReels, ensureUserProfile, Reel, User } from '@/services/supabase';
import ReelPlayer from './ReelPlayer';

interface ReelsModalProps {
  onClose: () => void;
}

export default function ReelsModal({ onClose }: ReelsModalProps) {
  const [reels, setReels] = useState<(Reel & { users: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reelsData, userProfile] = await Promise.all([
          getReels(),
          ensureUserProfile()
        ]);
        setReels(reelsData);
        setCurrentUser(userProfile);
      } catch (error) {
        console.error('Error loading reels:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-[60] transition-colors"
      >
        <i className="ri-close-line text-2xl"></i>
      </button>

      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-full w-full snap-start relative">
            <ReelPlayer
              reel={reel}
              isActive={index === activeIndex}
              currentUserId={currentUser?.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
