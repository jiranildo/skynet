
interface MobileNavProps {
  onCreateClick: () => void;
  onMenuClick: () => void;
}

export default function MobileNav({ onCreateClick, onMenuClick }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
      <div className="flex items-center justify-around px-2 py-2 sm:py-3">
        <button
          onClick={() => window.REACT_APP_NAVIGATE('/')}
          className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
        >
          <i className="ri-home-line text-xl sm:text-2xl"></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Início</span>
        </button>

        <button className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
          <i className="ri-compass-line text-xl sm:text-2xl"></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Explorar</span>
        </button>

        <button
          onClick={onCreateClick}
          className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <i className="ri-add-line text-xl sm:text-2xl text-white"></i>
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium">Criar</span>
        </button>

        <button className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600">
          <i className="ri-movie-line text-xl sm:text-2xl"></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Reels</span>
        </button>

        <button
          onClick={onMenuClick}
          className="flex flex-col items-center gap-0.5 sm:gap-1 p-2 text-gray-600"
        >
          <i className="ri-menu-line text-xl sm:text-2xl"></i>
          <span className="text-[9px] sm:text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
