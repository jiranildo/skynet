
interface NavItem {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onCreateClick: () => void;
  onMenuClick: () => void;
  extraItems?: NavItem[];
}

export default function MobileNav({
  activeTab,
  onTabChange,
  onCreateClick,
  onMenuClick,
  extraItems = []
}: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 transition-all duration-300">
      <div className="flex items-center justify-around px-2 py-2 sm:py-3">
        <button
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-all hover:scale-105 ${activeTab === 'feed' ? 'text-purple-600' : 'text-gray-500'
            }`}
        >
          <i className={`ri-home-${activeTab === 'feed' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
        </button>

        <button
          onClick={() => onTabChange('explore')}
          className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-all hover:scale-105 ${activeTab === 'explore' ? 'text-purple-600' : 'text-gray-500'
            }`}
        >
          <i className={`ri-compass-${activeTab === 'explore' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Explorar</span>
        </button>

        <button
          onClick={onCreateClick}
          className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-2 group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
            <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium text-gray-500">Criar</span>
        </button>

        {extraItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-all hover:scale-105 ${item.isActive ? 'text-purple-600' : 'text-gray-500'
              }`}
          >
            <i className={`${item.icon} text-xl sm:text-2xl`}></i>
            <span className="text-[9px] sm:text-[10px] font-medium">{item.label}</span>
          </button>
        ))}

        {/* If no extra items, show Reels by default as fallback for Home compatibility */}
        {extraItems.length === 0 && (
          <button
            onClick={() => onTabChange('reels')}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 transition-all hover:scale-105 ${activeTab === 'reels' ? 'text-purple-600' : 'text-gray-500'
              }`}
          >
            <i className={`ri-movie-${activeTab === 'reels' ? 'fill' : 'line'} text-xl sm:text-2xl`}></i>
            <span className="text-[9px] sm:text-[10px] font-medium">Reels</span>
          </button>
        )}

        <button
          onClick={onMenuClick}
          className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-500 hover:scale-105 transition-all"
        >
          <i className="ri-menu-line text-xl sm:text-2xl"></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
