import { useState, useEffect, useRef } from 'react';
import { Reel, User, likeReel, unlikeReel, checkIfReelLiked, addReelComment, getReelComments } from '@/services/supabase';

interface ReelPlayerProps {
    reel: Reel & { users: User };
    isActive: boolean;
    currentUserId?: string;
}

export default function ReelPlayer({ reel, isActive, currentUserId }: ReelPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes_count || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    useEffect(() => {
        if (currentUserId && reel.id) {
            checkIfReelLiked(reel.id, currentUserId).then(setIsLiked);
        }
    }, [reel.id, currentUserId]);

    const handleLike = async () => {
        if (!currentUserId || !reel.id) return;

        try {
            if (isLiked) {
                await unlikeReel(reel.id, currentUserId);
                setLikesCount(prev => prev - 1);
            } else {
                await likeReel(reel.id, currentUserId);
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const loadComments = async () => {
        if (!reel.id) return;
        const data = await getReelComments(reel.id);
        setComments(data);
        setShowComments(true);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId || !reel.id || !newComment.trim()) return;

        try {
            const comment = await addReelComment(reel.id, currentUserId, newComment);
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center snap-start overflow-hidden">
            <video
                ref={videoRef}
                src={reel.video_url}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                onClick={handleTogglePlay}
            />

            {/* Play/Pause Indicator (Overlay) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center">
                        <i className="ri-play-fill text-white text-4xl ml-1"></i>
                    </div>
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

            {/* Top Controls */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <h2 className="text-white font-bold text-xl drop-shadow-md">Reels</h2>
            </div>

            <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10"
            >
                <i className={`${isMuted ? 'ri-volume-mute-line' : 'ri-volume-up-line'} text-xl`}></i>
            </button>

            {/* Interaction Buttons (Right Side) */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-5 items-center z-10">
                <button onClick={handleLike} className="group flex flex-col items-center gap-1">
                    <div className="w-12 h-12 flex items-center justify-center transition-transform active:scale-95 group-hover:scale-110">
                        <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-white'} text-3xl drop-shadow-lg`}></i>
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">{likesCount.toLocaleString()}</span>
                </button>

                <button onClick={loadComments} className="group flex flex-col items-center gap-1">
                    <div className="w-12 h-12 flex items-center justify-center transition-transform active:scale-95 group-hover:scale-110">
                        <i className="ri-chat-3-line text-white text-3xl drop-shadow-lg"></i>
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">{reel.comments_count || 0}</span>
                </button>

                <button className="group flex flex-col items-center gap-1">
                    <div className="w-12 h-12 flex items-center justify-center transition-transform active:scale-95 group-hover:scale-110">
                        <i className="ri-share-forward-line text-white text-3xl drop-shadow-lg"></i>
                    </div>
                    <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
                </button>

                <button className="group flex flex-col items-center gap-1">
                    <div className="w-12 h-12 flex items-center justify-center transition-transform active:scale-95 group-hover:scale-110">
                        <i className="ri-bookmark-line text-white text-3xl drop-shadow-lg"></i>
                    </div>
                </button>

                <button className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white mt-4">
                    <img src={reel.users?.avatar_url || 'https://via.placeholder.com/150'} alt="Audio" className="w-full h-full object-cover animate-spin-slow" />
                </button>
            </div>

            {/* User Info & Caption (Bottom) */}
            <div className="absolute bottom-4 left-4 right-16 z-10 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50">
                        <img src={reel.users?.avatar_url || 'https://via.placeholder.com/150'} alt={reel.users?.username} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-sm drop-shadow-md">{reel.users?.username}</span>
                    <button className="px-4 py-1.5 border border-white/50 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                        Seguir
                    </button>
                </div>

                <p className="text-sm line-clamp-2 mb-3 drop-shadow-md">{reel.caption}</p>

                <div className="flex items-center gap-2 text-xs bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 w-fit">
                    <i className="ri-music-2-fill"></i>
                    <span className="max-w-[150px] truncate">Áudio original • {reel.users?.username}</span>
                </div>
            </div>

            {/* Comments Drawer/Overlay */}
            {showComments && (
                <div className="absolute inset-0 z-50 flex flex-col bg-white rounded-t-2xl mt-20 animate-slide-up">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-bold text-center flex-1">Comentários</h3>
                        <button onClick={() => setShowComments(false)}>
                            <i className="ri-close-line text-2xl"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.users?.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-bold mr-2">{comment.users?.username}</span>
                                        {comment.content}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddComment} className="p-4 border-t flex gap-3">
                        <input
                            type="text"
                            placeholder="Adicione um comentário..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="text-blue-500 font-bold text-sm">Publicar</button>
                    </form>
                </div>
            )}
        </div>
    );
}
