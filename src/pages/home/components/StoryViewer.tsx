import { useState, useEffect, useCallback } from 'react';
import { Story, storyService } from '@/services/supabase';

interface StoryViewerProps {
    stories: Story[];
    initialStoryIndex?: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialStoryIndex = 0, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const story = stories[currentIndex];
    const duration = story.media_type === 'video' ? 15000 : 5000; // 15s for video, 5s for images

    const nextStory = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const prevStory = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        if (isPaused) return;

        const interval = 100; // Update every 100ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    nextStory();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, isPaused, duration, nextStory]);

    useEffect(() => {
        if (story?.id) {
            storyService.markAsViewed(story.id).catch(console.error);
        }
    }, [story?.id]);

    if (!story) return null;

    return (
        <div className="fixed top-[57px] bottom-[65px] left-0 right-0 md:top-0 md:bottom-0 md:left-64 z-[100] bg-black flex flex-col items-center justify-center animate-fadeIn">
            {/* Top Progress Bars */}
            <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-10">
                {stories.map((_, index) => (
                    <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{
                                width: `${index === currentIndex ? progress : index < currentIndex ? 100 : 0}%`
                            }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-4 left-0 right-0 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <img
                        src={story.users?.avatar_url || 'https://via.placeholder.com/150'}
                        className="w-8 h-8 rounded-full border border-white"
                        alt={story.users?.username}
                    />
                    <span className="text-white text-sm font-semibold">{story.users?.username}</span>
                    <span className="text-white/60 text-xs">
                        {new Date(story.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                    <i className="ri-close-line text-2xl"></i>
                </button>
            </div>

            {/* Media Content */}
            <div className="relative w-full h-full max-w-md bg-black flex items-center overflow-hidden">
                {story.media_type === 'video' ? (
                    <video
                        src={story.media_url}
                        autoPlay
                        playsInline
                        muted={false}
                        className="w-full h-auto max-h-full object-contain pointer-events-none"
                        onPlay={() => setIsPaused(false)}
                        onPause={() => setIsPaused(true)}
                        onEnded={nextStory}
                    />
                ) : (
                    <img
                        src={story.media_url}
                        className="w-full h-auto max-h-full object-contain"
                        alt="Story"
                    />
                )}

                {/* Interaction Areas */}
                <div className="absolute inset-0 flex">
                    <div
                        className="flex-1 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            prevStory();
                        }}
                    ></div>
                    <div
                        className="flex-1 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextStory();
                        }}
                    ></div>
                </div>
            </div>

            {/* Footer / Reply (Instagram style placeholder) */}
            <div className="absolute bottom-4 left-0 right-0 p-4 flex gap-4 z-10">
                <div className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-2 text-white/80 text-sm">
                    Enviar mensagem...
                </div>
                <div className="flex gap-4 items-center">
                    <button className="text-white text-2xl hover:scale-110 transition-transform">
                        <i className="ri-heart-line"></i>
                    </button>
                    <button className="text-white text-2xl hover:scale-110 transition-transform">
                        <i className="ri-send-plane-line"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
