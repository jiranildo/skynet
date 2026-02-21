import React from 'react';
import { CellarWine } from '../../../services/supabase';

interface WineCardProps {
    wine: CellarWine;
    onClick: () => void;
    onConsume: (e: React.MouseEvent) => void; // Keep for compatibility if needed elsewhere
    onAdd: (e: React.MouseEvent) => void;
    onEvaluate?: (e: React.MouseEvent) => void;
    onMoreOptions?: (e: React.MouseEvent) => void;
    onToggleStatus?: (e: React.MouseEvent) => void;
    onToggleFavorite?: (e: React.MouseEvent) => void;
    isReadyToDrink?: boolean;
}

export default function WineCard({
    wine,
    onClick,
    onConsume,
    onAdd,
    onEvaluate,
    onMoreOptions,
    onToggleStatus,
    onToggleFavorite,
    isReadyToDrink = false
}: WineCardProps) {

    // Fallback image
    const wineImage = wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop";

    return (
        <div
            onClick={onClick}
            className={`bg-[#f2f4f5] rounded-[32px] p-4 flex flex-col gap-3 relative cursor-pointer active:scale-[0.98] transition-transform touch-manipulation`}
        >
            <div className="flex gap-4">
                {/* Image Container */}
                <div className="w-[100px] h-[130px] bg-white rounded-2xl flex-shrink-0 relative overflow-hidden shadow-sm flex items-center justify-center">
                    <img
                        src={wineImage}
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop"; }}
                        alt={wine.name}
                        className="h-[90%] w-auto object-contain"
                        loading="lazy"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-1">
                    <span className="text-gray-500 text-[13px] mb-0.5 font-medium">{wine.producer || 'Sem produtor'}</span>
                    <h3 className="font-bold text-gray-900 text-[17px] leading-tight mb-2 pr-2">{wine.name}</h3>

                    <div className="flex items-center gap-1.5 text-gray-600 text-[13px] mb-auto">
                        {wine.country ? (
                            <>
                                {/* Simple country representation */}
                                <span className="w-[18px] h-[18px] rounded-full bg-gray-200 flex items-center justify-center text-[10px] uppercase font-bold overflow-hidden shadow-sm">
                                    {wine.country.substring(0, 2)}
                                </span>
                                <span>{wine.region ? `${wine.region}, ` : ''}{wine.country}</span>
                            </>
                        ) : (
                            <span>{wine.region ? `🍷 ${wine.region}` : 'Origem Indefinida'}</span>
                        )}
                    </div>

                    {/* Bottom stats row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <div className="flex items-center mr-1">
                            <i className="ri-star-fill text-[#e85d04] text-lg mr-1"></i>
                            <span className="font-bold text-gray-900 text-base">{wine.rating ? wine.rating.toFixed(1).replace('.', ',') : 'S/N'}</span>
                            <span className="text-gray-400 text-[13px] ml-1">({(wine as any).rating_count || "0"})</span>
                        </div>

                        <div className="bg-gray-200/60 px-2 py-0.5 rounded text-[15px] font-bold text-gray-900 tracking-tight">
                            {wine.price ? `R$ ${wine.price.toFixed(2).replace('.', ',')}` : 'Sem preço'}
                        </div>
                    </div>
                </div>


            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-2 mt-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onEvaluate && onEvaluate(e); }}
                    className="flex-1 border border-gray-400/40 py-2.5 rounded-full font-semibold text-gray-900 bg-transparent active:bg-gray-200/50 transition-colors"
                >
                    Avaliar
                </button>

                <div className="flex items-center gap-2">
                    {/* Quantity Control */}
                    <div className="border border-gray-400/40 rounded-full h-[42px] px-1.5 flex items-center justify-between min-w-[90px] font-semibold text-gray-900 bg-transparent">
                        <button
                            onClick={(e) => { e.stopPropagation(); onConsume(e); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 active:bg-gray-300/50 text-gray-700 transition-colors shrink-0"
                        >
                            <i className="ri-subtract-line text-lg"></i>
                        </button>
                        <span className="text-[15px] min-w-[1.5rem] text-center">{wine.quantity || 0}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(e); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 active:bg-gray-300/50 text-gray-700 transition-colors shrink-0"
                        >
                            <i className="ri-add-line text-lg"></i>
                        </button>
                    </div>

                    {/* Favorite */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(e); }}
                        className={`w-[42px] h-[42px] border ${wine.is_favorite ? 'bg-red-50 border-red-200' : 'border-gray-400/40'} rounded-full flex items-center justify-center text-gray-900 active:bg-gray-200/50 transition-colors shrink-0`}
                    >
                        <i className={`text-lg ri-heart-3-${wine.is_favorite ? 'fill text-red-500' : 'line'}`}></i>
                    </button>

                    {/* Bookmark */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleStatus && onToggleStatus(e); }}
                        className={`w-[42px] h-[42px] border ${wine.status === 'wishlist' ? 'bg-purple-50 border-purple-200' : 'border-gray-400/40'} rounded-full flex items-center justify-center text-gray-900 active:bg-gray-200/50 transition-colors shrink-0`}
                    >
                        <i className={`text-lg ri-bookmark-${wine.status === 'wishlist' ? 'fill text-purple-600' : 'line'}`}></i>
                    </button>

                    {/* More Options */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoreOptions && onMoreOptions(e); }}
                        className="w-[42px] h-[42px] border border-gray-400/40 rounded-full flex items-center justify-center text-gray-900 active:bg-gray-200/50 transition-colors text-xl"
                    >
                        •••
                    </button>
                </div>
            </div>
        </div>
    );
}
