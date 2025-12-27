
import { useState, useEffect, useRef } from 'react';
import { getExplorePosts, searchUsers, searchPosts } from '@/services/supabase';
import Post from './Post';

export default function ExploreView() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ users: any[], posts: any[] }>({ users: [], posts: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const searchTimeout = useRef<any>(null);

    useEffect(() => {
        loadExplorePosts();
    }, []);

    const loadExplorePosts = async () => {
        try {
            setLoading(true);
            const data = await getExplorePosts();
            setPosts(data);
        } catch (error) {
            console.error("Error loading explore posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults({ users: [], posts: [] });
            setShowResults(false);
            return;
        }

        setShowResults(true);
        setIsSearching(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            try {
                const [users, p] = await Promise.all([
                    searchUsers(query),
                    searchPosts(query)
                ]);
                setSearchResults({ users, posts: p });
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md pt-2 pb-4 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar pessoas, posts, hashtags..."
                        className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>

                    {searchQuery && (
                        <button
                            onClick={() => handleSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <i className="ri-close-circle-fill text-xl"></i>
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                            {isSearching ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-gray-500 text-sm">Buscando...</p>
                                </div>
                            ) : (
                                <div className="p-2">
                                    {searchResults.users.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Pessoas</h3>
                                            {searchResults.users.map(u => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => window.REACT_APP_NAVIGATE(`/profile/${u.username}`)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex-shrink-0">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-orange-500">
                                                                {u.username[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight">@{u.username}</p>
                                                        <p className="text-xs text-gray-500">{u.full_name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.posts.length > 0 && (
                                        <div>
                                            <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Posts</h3>
                                            <div className="grid grid-cols-2 gap-2 p-2">
                                                {searchResults.posts.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setSelectedPost(p)}
                                                        className="aspect-square rounded-lg overflow-hidden relative group"
                                                    >
                                                        <img src={p.image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <p className="text-white text-[10px] font-medium px-2 truncate w-full text-center">
                                                                {p.caption}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                                        <div className="p-8 text-center text-gray-500">
                                            <i className="ri-search-eye-line text-4xl mb-2 block"></i>
                                            <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Explore Grid */}
            {loading ? (
                <div className="grid grid-cols-3 gap-1 sm:gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 sm:gap-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="aspect-square cursor-pointer relative group overflow-hidden rounded-lg"
                            onClick={() => setSelectedPost(post)}
                        >
                            <img
                                src={post.image}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-lg">
                                <div className="flex items-center gap-1">
                                    <i className="ri-heart-fill"></i> {post.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                    <i className="ri-chat-3-fill"></i> {post.comments}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-10" onClick={() => setSelectedPost(null)}>
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-[80]"
                        onClick={() => setSelectedPost(null)}
                    >
                        <i className="ri-close-line text-4xl"></i>
                    </button>
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-full overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                        {/* Left side: Image */}
                        <div className="md:w-2/3 bg-black flex items-center justify-center min-h-[300px]">
                            <img src={selectedPost.image_url || selectedPost.image} alt="" className="max-h-full max-w-full object-contain" />
                        </div>

                        {/* Right side: Post content and interactions */}
                        <div className="md:w-1/3 flex flex-col bg-white">
                            <div className="flex-1 overflow-y-auto">
                                <Post post={selectedPost} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
