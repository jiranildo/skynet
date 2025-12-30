import React from 'react';

interface QuickActionsProps {
    onAction: (label: string) => void;
}

export const QuickActions = ({ onAction }: QuickActionsProps) => {
    const quickActions = [
        { icon: 'ri-map-pin-line', label: 'Locais Próximos', bgColor: 'bg-white', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        { icon: 'ri-earth-line', label: 'Explorar seu País', bgColor: 'bg-white', iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
        { icon: 'ri-heart-3-line', label: 'Viagens Românticas', bgColor: 'bg-white', iconColor: 'text-pink-600', iconBg: 'bg-pink-100' },
        { icon: 'ri-mickey-line', label: 'Walt Disney World', bgColor: 'bg-white', iconColor: 'text-violet-600', iconBg: 'bg-violet-100' },
        { icon: 'ri-riding-line', label: 'Aventura Extrema', bgColor: 'bg-white', iconColor: 'text-red-600', iconBg: 'bg-red-100' },
        { icon: 'ri-sun-line', label: 'Praias Paradisíacas', bgColor: 'bg-white', iconColor: 'text-cyan-600', iconBg: 'bg-cyan-100' },
        { icon: 'ri-ancient-pavilion-line', label: 'Roteiro Cultural', bgColor: 'bg-white', iconColor: 'text-amber-600', iconBg: 'bg-amber-100' },
        { icon: 'ri-restaurant-2-line', label: 'Experiências Gastronômicas', bgColor: 'bg-white', iconColor: 'text-rose-600', iconBg: 'bg-rose-100' },
        { icon: 'ri-wallet-3-line', label: 'Viagens Econômica', bgColor: 'bg-white', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
        { icon: 'ri-vip-diamond-line', label: 'Viagens Luxuosa', bgColor: 'bg-white', iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' },
        { icon: 'ri-parent-line', label: 'Viagens em Família', bgColor: 'bg-white', iconColor: 'text-teal-600', iconBg: 'bg-teal-100' },
        { icon: 'ri-gift-line', label: 'Natal Encantador', bgColor: 'bg-white', iconColor: 'text-red-600', iconBg: 'bg-red-100' },
        { icon: 'ri-sparkling-line', label: 'Ano Novo Inesquecível', bgColor: 'bg-white', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100' },
        { icon: 'ri-ship-2-line', label: 'Melhores Cruzeiros', bgColor: 'bg-white', iconColor: 'text-sky-600', iconBg: 'bg-sky-100' },
        { icon: 'ri-calendar-check-line', label: 'O Melhor de cada mês', bgColor: 'bg-white', iconColor: 'text-violet-600', iconBg: 'bg-violet-100' },
        { icon: 'ri-cake-3-line', label: 'Datas Festivas Mais Famosas', bgColor: 'bg-white', iconColor: 'text-fuchsia-600', iconBg: 'bg-fuchsia-100' },
    ];

    return (
        <div className="relative mt-6">
            {/* Gradient Fade Indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Scroll Hints */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none sm:hidden">
                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center animate-pulse">
                    <i className="ri-arrow-left-s-line text-gray-600 text-xl"></i>
                </div>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none sm:hidden">
                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center animate-pulse">
                    <i className="ri-arrow-right-s-line text-gray-600 text-xl"></i>
                </div>
            </div>

            <div className="text-center mb-2">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <i className="ri-arrow-left-right-line"></i>
                    Deslize para ver mais opções
                    <i className="ri-arrow-left-right-line"></i>
                </p>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-4 py-3 min-w-max">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => onAction(action.label)}
                            className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
                        >
                            <i className={`${action.icon} text-lg sm:text-xl ${action.iconColor}`}></i>
                            <span className="text-gray-700 group-hover:text-orange-600 transition-colors whitespace-nowrap">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(Math.ceil(quickActions.length / 3))].map((_, index) => (
                    <div key={index} className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                ))}
            </div>
        </div>
    );
};
