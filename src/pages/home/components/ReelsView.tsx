import { useState, useEffect, useRef } from 'react';
import { getReels, ensureUserProfile, User, Reel } from '@/services/supabase';
import ReelPlayer from './ReelPlayer';

interface ReelsViewProps {
    onCreateReel?: () => void;
}

export default function ReelsView({ onCreateReel }: ReelsViewProps) {
    const [reels, setReels] = useState<(Reel & { users: User })[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
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

    const handleScroll = () => {
        if (containerRef.current) {
            const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
            if (index !== activeIndex) {
                setActiveIndex(index);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-black">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-black text-white p-6 text-center">
                <i className="ri-movie-line text-6xl mb-4 text-gray-500"></i>
                <h3 className="text-xl font-bold">Nenhum Reel encontrado</h3>
                <p className="text-gray-400 mt-2">Crie o primeiro Reel para começar!</p>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-black">
            {/* Create Button Overlay */}
            <button
                onClick={onCreateReel}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20 transition-all active:scale-95 group"
                title="Criar Reel"
            >
                <i className="ri-camera-lens-line text-2xl drop-shadow-lg group-hover:scale-110 transition-transform"></i>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-black">
                    <i className="ri-add-line text-[10px] text-white font-bold"></i>
                </div>
            </button>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
            >
                {reels.map((reel, index) => (
                    <div key={reel.id} className="h-full w-full snap-start">
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
