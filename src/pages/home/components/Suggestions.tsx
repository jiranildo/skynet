
export default function Suggestions({ onViewRecommendations }: { onViewRecommendations?: () => void }) {
  const suggestions = [
    {
      id: 1,
      username: 'design_studio',
      name: 'Design Studio',
      avatar: 'https://readdy.ai/api/search-image?query=creative%20design%20studio%20professional%20logo%20modern%20aesthetic&width=80&height=80&seq=suggest-1&orientation=squarish',
      isFollowing: false,
    },
    {
      id: 2,
      username: 'tech_news',
      name: 'Tech News',
      avatar: 'https://readdy.ai/api/search-image?query=technology%20news%20media%20professional%20logo%20modern%20design&width=80&height=80&seq=suggest-2&orientation=squarish',
      isFollowing: false,
    },
    {
      id: 3,
      username: 'nature_lover',
      name: 'Nature Lover',
      avatar: 'https://readdy.ai/api/search-image?query=nature%20photography%20professional%20portrait%20outdoor%20enthusiast&width=80&height=80&seq=suggest-3&orientation=squarish',
      isFollowing: false,
    },
    {
      id: 4,
      username: 'music_vibes',
      name: 'Music Vibes',
      avatar: 'https://readdy.ai/api/search-image?query=music%20artist%20professional%20portrait%20modern%20style%20creative&width=80&height=80&seq=suggest-4&orientation=squarish',
      isFollowing: false,
    },
    {
      id: 5,
      username: 'fashion_trends',
      name: 'Fashion Trends',
      avatar: 'https://readdy.ai/api/search-image?query=fashion%20model%20professional%20portrait%20stylish%20modern%20elegant&width=80&height=80&seq=suggest-5&orientation=squarish',
      isFollowing: false,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4 lg:mb-5">
        <h3 className="font-semibold text-sm lg:text-base text-gray-900">Sugestões para você</h3>
        <button 
          onClick={onViewRecommendations}
          className="text-xs lg:text-sm font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap"
        >
          Ver tudo
        </button>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {suggestions.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[2px] flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs lg:text-sm text-gray-900 truncate">{user.username}</p>
              <p className="text-[10px] lg:text-xs text-gray-500 truncate">{user.name}</p>
            </div>
            <button className="text-xs lg:text-sm font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap flex-shrink-0">
              Seguir
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 lg:mt-8 pt-4 lg:pt-5 border-t border-gray-200">
        <p className="text-[10px] lg:text-xs text-gray-400 leading-relaxed">
          © 2024 InstaFlow • Sobre • Ajuda • Privacidade • Termos
        </p>
      </div>
    </div>
  );
}
