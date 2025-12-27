import { useState, useEffect } from 'react';
import Post from './Post';

interface FeedProps {
  onExploreClick?: () => void;
  onEdit?: (post: any) => void;
}

export default function Feed({ onExploreClick, onEdit }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Dynamic import to avoid circular dependencies if any, or just standard import
      const { getFeedPosts } = await import('@/services/supabase');
      const data = await getFeedPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Carregando feed...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i className="ri-image-line text-4xl text-gray-400"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma publicação ainda</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-8">
          Siga outras pessoas ou crie sua primeira publicação para ver conteúdos aqui!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Recarregar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Posts */}
      {posts.map((post) => (
        <Post key={post.id} post={post} onEdit={onEdit} />
      ))}

      {/* Load More */}
      {posts.length >= 10 && (
        <div className="flex justify-center py-6 md:py-8">
          <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors duration-200 whitespace-nowrap text-sm sm:text-base">
            Carregar Mais Posts
          </button>
        </div>
      )}
    </div>
  );
}
