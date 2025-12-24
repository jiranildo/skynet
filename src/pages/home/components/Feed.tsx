import { useState } from 'react';
import Post from './Post';

interface FeedProps {
  onExploreClick?: () => void;
}

export default function Feed({ onExploreClick }: FeedProps) {
  const posts = [
    {
      id: 1,
      username: 'alex_photo',
      userAvatar: 'photographer-1',
      location: 'New York, USA',
      image: 'https://readdy.ai/api/search-image?query=stunning%20cityscape%20photography%20golden%20hour%20new%20york%20skyline%20dramatic%20lighting%20urban%20landscape%20modern%20architecture%20skyscrapers%20sunset%20orange%20sky%20professional%20photography&width=600&height=600&seq=feed-post-1&orientation=squarish',
      likes: 15234,
      caption: 'Golden hour magic in the city 🌆✨ #photography #nyc',
      comments: 342,
      timeAgo: '2 hours ago',
      isLiked: false,
      isSaved: false,
    },
    {
      id: 2,
      username: 'travel_diary',
      userAvatar: 'traveler-1',
      location: 'Santorini, Greece',
      image: 'https://readdy.ai/api/search-image?query=beautiful%20santorini%20greece%20white%20buildings%20blue%20domes%20ocean%20view%20mediterranean%20architecture%20travel%20destination%20sunny%20day%20clear%20blue%20sky%20iconic%20greek%20island%20landscape&width=600&height=600&seq=feed-post-2&orientation=squarish',
      likes: 28456,
      caption: 'Living my best life in Santorini 💙🇬🇷 The views here are absolutely breathtaking!',
      comments: 891,
      timeAgo: '5 hours ago',
      isLiked: true,
      isSaved: false,
    },
    {
      id: 3,
      username: 'foodie_life',
      userAvatar: 'food-blogger',
      location: 'Tokyo, Japan',
      image: 'https://readdy.ai/api/search-image?query=delicious%20japanese%20cuisine%20sushi%20platter%20fresh%20seafood%20artistic%20food%20presentation%20restaurant%20quality%20elegant%20plating%20dark%20background%20professional%20food%20photography&width=600&height=600&seq=feed-post-3&orientation=squarish',
      likes: 19823,
      caption: 'Best sushi experience ever! 🍣 The freshness and presentation were incredible.',
      comments: 567,
      timeAgo: '8 hours ago',
      isLiked: false,
      isSaved: true,
    },
    {
      id: 4,
      username: 'fitness_pro',
      userAvatar: 'fitness-person',
      location: 'Los Angeles, CA',
      image: 'https://readdy.ai/api/search-image?query=fitness%20workout%20gym%20training%20athletic%20person%20exercising%20healthy%20lifestyle%20motivation%20modern%20gym%20equipment%20strength%20training%20dynamic%20action%20shot&width=600&height=600&seq=feed-post-4&orientation=squarish',
      likes: 12456,
      caption: 'No excuses, just results 💪 Day 45 of my transformation journey!',
      comments: 234,
      timeAgo: '12 hours ago',
      isLiked: false,
      isSaved: false,
    },
    {
      id: 5,
      username: 'art_studio',
      userAvatar: 'artist-1',
      location: 'Paris, France',
      image: 'https://readdy.ai/api/search-image?query=contemporary%20art%20painting%20colorful%20abstract%20artwork%20creative%20expression%20modern%20art%20studio%20vibrant%20colors%20artistic%20masterpiece%20gallery%20quality%20canvas&width=600&height=600&seq=feed-post-5&orientation=squarish',
      likes: 8934,
      caption: 'New piece finished! What do you think? 🎨 Available for commission.',
      comments: 178,
      timeAgo: '1 day ago',
      isLiked: true,
      isSaved: true,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* AI Suggestions Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3 mx-3 md:mx-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="ri-sparkling-2-fill text-white text-lg sm:text-xl"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">AI-Powered Suggestions</h3>
          <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1">Descubra conteúdo personalizado para você</p>
        </div>
        <button 
          onClick={onExploreClick}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300 whitespace-nowrap flex-shrink-0"
        >
          Explorar
        </button>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}

      {/* Load More */}
      <div className="flex justify-center py-6 md:py-8">
        <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors duration-200 whitespace-nowrap text-sm sm:text-base">
          Carregar Mais Posts
        </button>
      </div>
    </div>
  );
}
