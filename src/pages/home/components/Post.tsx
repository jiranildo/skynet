
import { useState } from 'react';

interface PostProps {
  post: {
    id: number;
    username: string;
    userAvatar: string;
    location: string;
    image: string;
    likes: number;
    caption: string;
    comments: number;
    timeAgo: string;
    isLiked: boolean;
    isSaved: boolean;
  };
}

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[2px]">
            <img
              src={post.image}
              alt={post.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm sm:text-base text-gray-900">{post.username}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{post.location}</p>
          </div>
        </div>
        <button className="text-gray-600 hover:text-gray-900 p-1 sm:p-2">
          <i className="ri-more-2-fill text-lg sm:text-xl"></i>
        </button>
      </div>

      {/* Post Image */}
      <div className="relative w-full aspect-square">
        <img
          src={post.image}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleLike}
              className="hover:scale-110 transition-transform"
            >
              <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-700'} text-xl sm:text-2xl`}></i>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="hover:scale-110 transition-transform"
            >
              <i className="ri-chat-3-line text-xl sm:text-2xl text-gray-700"></i>
            </button>
            <button className="hover:scale-110 transition-transform">
              <i className="ri-share-forward-line text-xl sm:text-2xl text-gray-700"></i>
            </button>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="hover:scale-110 transition-transform"
          >
            <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-xl sm:text-2xl text-gray-700`}></i>
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">
          {likes.toLocaleString()} curtidas
        </p>

        {/* Caption */}
        <div className="mb-1 sm:mb-2">
          <p className="text-sm sm:text-base text-gray-900">
            <span className="font-semibold mr-2">{post.username}</span>
            <span className="text-gray-700">{post.caption}</span>
          </p>
        </div>

        {/* Comments Link */}
        <button 
          onClick={() => setShowComments(!showComments)}
          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 mb-1 sm:mb-2"
        >
          Ver todos os {post.comments} comentários
        </button>

        {/* Time */}
        <p className="text-[10px] sm:text-xs text-gray-400 uppercase">{post.timeAgo}</p>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm">
                    <span className="font-semibold mr-2">user123</span>
                    <span className="text-gray-700">Amazing shot! 📸</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">2h</p>
                </div>
              </div>
            </div>

            {/* Add Comment */}
            <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
              <input
                type="text"
                placeholder="Adicione um comentário..."
                className="flex-1 text-xs sm:text-sm outline-none"
              />
              <button className="text-orange-500 font-semibold text-xs sm:text-sm hover:text-orange-600 whitespace-nowrap">
                Publicar
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
