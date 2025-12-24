interface CreateMenuProps {
  onClose: () => void;
  onSelectOption: (option: 'post' | 'travel' | 'cellar' | 'food') => void;
}

export default function CreateMenu({ onClose, onSelectOption }: CreateMenuProps) {
  const handleSelect = (option: 'post' | 'travel' | 'cellar' | 'food') => {
    onSelectOption(option);
  };

  return (
    <>
      {/* Backdrop invisível para fechar ao clicar fora */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu suspenso */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-[280px]">
          {/* Grid de opções */}
          <div className="grid grid-cols-2 gap-3">
            {/* Post */}
            <button
              onClick={() => handleSelect('post')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 group-hover:scale-110 transition-transform">
                <i className="ri-image-add-line text-2xl text-white"></i>
              </div>
              <span className="text-xs font-semibold text-gray-900">Post</span>
            </button>

            {/* Travel */}
            <button
              onClick={() => handleSelect('travel')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform">
                <i className="ri-flight-takeoff-line text-2xl text-white"></i>
              </div>
              <span className="text-xs font-semibold text-gray-900">Viagens</span>
            </button>

            {/* Cellar */}
            <button
              onClick={() => handleSelect('cellar')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform">
                <i className="ri-goblet-line text-2xl text-white"></i>
              </div>
              <span className="text-xs font-semibold text-gray-900">Adega</span>
            </button>

            {/* Food & Drinks */}
            <button
              onClick={() => handleSelect('food')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 group-hover:scale-110 transition-transform">
                <i className="ri-restaurant-line text-2xl text-white"></i>
              </div>
              <span className="text-xs font-semibold text-gray-900">Food & Drinks</span>
            </button>
          </div>
        </div>

        {/* Seta apontando para baixo */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"></div>
      </div>
    </>
  );
}
