import React from 'react';
import { CellarWine } from '../../../services/supabase';

interface WineCardProps {
    wine: CellarWine;
    onClick: () => void;
    onConsume: (e: React.MouseEvent) => void;
    onAdd: (e: React.MouseEvent) => void;
    compact?: boolean;
    isReadyToDrink?: boolean;
}

export default function WineCard({ wine, onClick, onConsume, onAdd, compact = false, isReadyToDrink = false }: WineCardProps) {
    const getTypeLabel = () => {
        switch (wine.type) {
            case 'red': return 'Tinto';
            case 'white': return 'Branco';
            case 'rose': return 'Rosé';
            case 'sparkling': return 'Espumante';
            case 'fortified': return 'Fortificado';
            case 'dessert': return 'Sobremesa';
            default: return wine.type;
        }
    };

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white/80 backdrop-blur-sm rounded-xl border ${isReadyToDrink ? 'border-amber-300' : 'border-white/20'} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-95 touch-manipulation`}
        >
            {/* Ready to Drink Badge */}
            {isReadyToDrink && (
                <div className="absolute top-0 left-0 z-20">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg shadow-sm uppercase tracking-tighter">
                        Pronto
                    </div>
                </div>
            )}

            {/* Image Container */}
            <div className={`relative ${compact ? 'aspect-square' : 'aspect-[3/4]'} overflow-hidden bg-gray-50`}>
                <img
                    src={wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"}
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop";
                    }}
                    alt={wine.name}
                    className="w-full h-full object-contain p-1 transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradients Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Quantity Badge */}
                <div className={`absolute ${compact ? 'top-2 right-2' : 'top-3 right-3'}`}>
                    <span className={`px-2 py-0.5 rounded-full ${compact ? 'text-[10px]' : 'text-xs'} font-bold shadow-lg backdrop-blur-md ${wine.quantity > 0
                        ? 'bg-white/90 text-gray-900'
                        : 'bg-red-500/90 text-white'
                        }`}>
                        {wine.quantity > 0 ? `${wine.quantity}x` : 'Esgotado'}
                    </span>
                </div>

                {/* Rating Badge */}
                {wine.rating ? (
                    <div className={`absolute ${compact ? 'top-2 left-2' : 'top-3 left-3'} flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg`}>
                        <i className={`ri-star-fill text-amber-400 ${compact ? 'text-[10px]' : 'text-xs'}`}></i>
                        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-gray-900`}>{wine.rating}</span>
                    </div>
                ) : null}


                {/* Content on Image (Mobile style) */}
                <div className={`absolute bottom-0 left-0 right-0 ${compact ? 'p-1.5' : 'p-4'} text-white`}>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/10`}>
                            {getTypeLabel()}
                        </span>
                        {!compact && wine.vintage && (
                            <span className="text-xs font-medium text-white/90">
                                {wine.vintage}
                            </span>
                        )}
                    </div>
                    <h3 className={`font-bold ${compact ? 'text-[10px]' : 'text-lg'} leading-tight mb-0 line-clamp-1 text-shadow-sm`}>
                        {wine.name}
                    </h3>
                    {!compact && (
                        <p className="text-xs text-white/80 line-clamp-1">
                            {wine.producer}
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Actions (Visible on cards, especially mobile friendly) */}
            <div className={`${compact ? 'p-1 h-8' : 'p-3'} bg-white/50 backdrop-blur-sm border-t border-gray-100 flex items-center gap-1`}>
                <button
                    onClick={onConsume}
                    disabled={!wine.quantity}
                    className="flex-1 h-full flex items-center justify-center rounded bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <i className={`${compact ? 'text-xs' : 'text-lg'} ri-subtract-line`}></i>
                    <span className="sr-only">Consumir</span>
                </button>
                <div className="w-px h-3 bg-gray-200" />
                <button
                    onClick={onAdd}
                    className="flex-1 h-full flex items-center justify-center rounded bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                    <i className={`${compact ? 'text-xs' : 'text-lg'} ri-add-line`}></i>
                    <span className="sr-only">Adicionar</span>
                </button>
            </div>
        </div>
    );
}
