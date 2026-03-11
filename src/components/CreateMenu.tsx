import { useAuth } from '../context/AuthContext';

interface CreateMenuProps {
  onClose: () => void;
  onSelectOption: (option: 'post' | 'travel' | 'cellar' | 'food' | 'story' | 'checkin') => void;
}

export default function CreateMenu({ onClose, onSelectOption }: CreateMenuProps) {
  const { hasPermission } = useAuth();

  const handleSelect = (option: 'post' | 'travel' | 'cellar' | 'food' | 'story' | 'checkin') => {
    onSelectOption(option);
  };

  const options = [
    { id: 'post', label: 'Postar', icon: 'ri-image-add-line', color: 'from-orange-500 to-pink-500', bg: 'from-orange-50 to-pink-50', border: 'border-orange-200', hover: 'hover:border-orange-400', permission: 'can_post_social' },
    { id: 'travel', label: 'Viagem', icon: 'ri-flight-takeoff-line', color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', hover: 'hover:border-blue-400', permission: 'can_create_trips' },
    { id: 'cellar', label: 'Adega', icon: 'ri-goblet-line', color: 'from-indigo-500 to-purple-500', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', hover: 'hover:border-indigo-400', permission: 'can_access_cellar' },
    { id: 'food', label: 'Gastronomia', icon: 'ri-restaurant-line', color: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', hover: 'hover:border-amber-400', permission: 'can_access_drinks_food' },
  ].filter(opt => hasPermission(opt.permission));

  return (
    <>
      {/* Backdrop invisível para fechar ao clicar fora */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu suspenso */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-[300px] relative">
          {/* Grid de opções */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id as any)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${opt.bg} border ${opt.border} ${opt.hover} hover:shadow-md transition-all duration-200 group`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${opt.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <i className={`${opt.icon} text-xl text-white`}></i>
                </div>
                <span className="text-[10px] font-semibold text-gray-900">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Botão Central: Check-In/Out */}
          {hasPermission('can_manage_checkins') && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={() => handleSelect('checkin')}
                className="group relative"
              >
                <div className="relative w-[74px] h-[74px] rounded-full bg-gradient-to-br from-sky-500 to-blue-600 border-4 border-white shadow-xl flex flex-col items-center justify-center gap-1 hover:scale-105 transition-all duration-300 z-10 overflow-hidden">
                  {/* Shine layer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <i className="ri-map-pin-user-fill text-xl text-white drop-shadow-md"></i>
                  <span className="text-[9px] font-black text-white uppercase tracking-wider text-center leading-tight">
                    Check<br />In-Out
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Seta apontando para baixo */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"></div>
      </div>
    </>
  );
}
