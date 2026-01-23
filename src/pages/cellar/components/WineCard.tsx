import React from 'react';
import { CellarWine } from '../../../services/supabase';

interface WineCardProps {
    wine: CellarWine;
    onClick: () => void;
    onConsume: (e: React.MouseEvent) => void;
    onAdd: (e: React.MouseEvent) => void;
}

export default function WineCard({ wine, onClick, onConsume, onAdd }: WineCardProps) {
    const isRed = wine.type === 'red';
    const isWhite = wine.type === 'white';
    const isRose = wine.type === 'rose';
    const isSparkling = wine.type === 'sparkling';

    const getTypeColor = () => {
        if (isRed) return 'bg-red-50 text-red-700 border-red-100';
        if (isWhite) return 'bg-amber-50 text-amber-700 border-amber-100';
        if (isRose) return 'bg-pink-50 text-pink-700 border-pink-100';
        if (isSparkling) return 'bg-blue-50 text-blue-700 border-blue-100';
        return 'bg-purple-50 text-purple-700 border-purple-100'; // fortified/dessert/other
    };

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
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-95 touch-manipulation"
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <img
                    src={wine.image_url || `https://readdy.ai/api/search-image?query=${wine.name} wine bottle&width=300&height=400&orientation=portrait`}
                    alt={wine.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradients Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Quantity Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${wine.quantity > 0
                            ? 'bg-white/90 text-gray-900'
                            : 'bg-red-500/90 text-white'
                        }`}>
                        {wine.quantity > 0 ? `${wine.quantity}x` : 'Esgotado'}
                    </span>
                </div>

                {/* Rating Badge */}
                {wine.rating ? (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
                        <i className="ri-star-fill text-amber-400 text-xs"></i>
                        <span className="text-xs font-bold text-gray-900">{wine.rating}</span>
                    </div>
                ) : null}

                {/* Content on Image (Mobile style) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/10`}>
                            {getTypeLabel()}
                        </span>
                        {wine.vintage && (
                            <span className="text-xs font-medium text-white/90">
                                {wine.vintage}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-0.5 line-clamp-1 text-shadow-sm">
                        {wine.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1">
                        {wine.producer}
                    </p>
                </div>
            </div>

            {/* Quick Actions (Visible on cards, especially mobile friendly) */}
            <div className="p-3 bg-white/50 backdrop-blur-sm border-t border-gray-100 flex items-center gap-2">
                <button
                    onClick={onConsume}
                    disabled={!wine.quantity}
                    className="flex-1 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <i className="ri-subtract-line text-lg"></i>
                    <span className="sr-only">Consumir</span>
                </button>
                <div className="w-px h-6 bg-gray-200" />
                <button
                    onClick={onAdd}
                    className="flex-1 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                    <i className="ri-add-line text-lg"></i>
                    <span className="sr-only">Adicionar</span>
                </button>
            </div>
        </div>
    );
}
