import React from 'react';
import { CellarWine } from '../../../services/supabase';

interface WineCardProps {
    wine: CellarWine;
    onClick: () => void;
    onConsume: (e: React.MouseEvent) => void; // Keep for compatibility if needed elsewhere
    onAdd: (e: React.MouseEvent) => void;
    onEvaluate?: (e: React.MouseEvent) => void;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
    onToggleStatus?: (e: React.MouseEvent) => void;
    onToggleFavorite?: (e: React.MouseEvent) => void;
    isReadyToDrink?: boolean;
    viewMode?: 'list' | 'grid';
}

export default function WineCard({
    wine,
    onClick,
    onConsume,
    onAdd,
    onEvaluate,
    onEdit,
    onDelete,
    onToggleStatus,
    onToggleFavorite,
    isReadyToDrink = false,
    viewMode = 'list'
}: WineCardProps) {

    // Fallback image
    const wineImage = wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=300&auto=format&fit=crop";

    return (
        <div
            onClick={onClick}
            className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${viewMode === 'grid' ? 'p-3 rounded-[24px]' : 'p-4 rounded-[32px]'} flex flex-col gap-3 relative cursor-pointer active:scale-[0.98] transition-all touch-manipulation h-full`}
        >
            <div className={`flex ${viewMode === 'grid' ? 'flex-col gap-3' : 'gap-4'} h-full`}>
                {/* Image Container */}
                <div className={`${viewMode === 'grid' ? 'w-full h-[140px]' : 'w-[100px] h-[130px]'} bg-black/[0.02] rounded-[20px] flex-shrink-0 relative overflow-hidden flex items-center justify-center`}>
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
                    <span className="text-gray-500 text-[13px] mb-0.5 font-medium truncate">{wine.producer || 'Sem produtor'}</span>
                    <h3 className={`font-bold text-gray-900 ${viewMode === 'grid' ? 'text-[15px] line-clamp-2' : 'text-[17px] leading-tight'} mb-2 pr-2`}>{wine.name}</h3>

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
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col items-start gap-1.5 justify-end' : 'flex-wrap items-center gap-2'} mt-3`}>
                        <div className="flex items-center mr-1 bg-gray-50/80 px-2 py-1 rounded-full border border-gray-100">
                            <i className="ri-star-fill text-[#e85d04] text-[15px] mr-1"></i>
                            <span className="font-bold text-gray-900 text-[14px] leading-none mt-0.5">{wine.rating ? wine.rating.toFixed(1).replace('.', ',') : 'S/N'}</span>
                            <span className="text-gray-400 text-[11px] ml-1 mt-0.5">({(wine as any).rating_count || "0"})</span>
                        </div>

                        <div className={`bg-gray-50/80 border border-gray-100 px-2.5 py-1 rounded-full ${viewMode === 'grid' ? 'text-[13px]' : 'text-[14px]'} font-bold text-gray-900 tracking-tight`}>
                            {wine.price ? `R$ ${wine.price.toFixed(2).replace('.', ',')}` : 'Sem preço'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Row */}
            {viewMode === 'list' && (
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEvaluate && onEvaluate(e); }}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-2xl font-semibold text-gray-700 active:scale-95 transition-all text-[15px]"
                    >
                        Avaliar
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Quantity Control */}
                        <div className="bg-gray-50 rounded-2xl h-[42px] px-1.5 flex items-center justify-between min-w-[95px] font-semibold text-gray-900">
                            <button
                                onClick={(e) => { e.stopPropagation(); onConsume(e); }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white shadow-sm active:scale-90 text-gray-500 hover:text-gray-900 transition-all shrink-0"
                            >
                                <i className="ri-subtract-line text-lg"></i>
                            </button>
                            <span className="text-[15px] min-w-[1.5rem] text-center">{wine.quantity || 0}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(e); }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white shadow-sm active:scale-90 text-gray-500 hover:text-gray-900 transition-all shrink-0"
                            >
                                <i className="ri-add-line text-lg"></i>
                            </button>
                        </div>

                        {/* Favorite */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(e); }}
                            className={`w-[42px] h-[42px] rounded-2xl flex items-center justify-center active:scale-95 transition-all shrink-0 ${wine.is_favorite ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                        >
                            <i className={`text-[19px] ri-heart-3-${wine.is_favorite ? 'fill' : 'line'}`}></i>
                        </button>

                        {/* Bookmark */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleStatus && onToggleStatus(e); }}
                            className={`w-[42px] h-[42px] rounded-2xl flex items-center justify-center active:scale-95 transition-all shrink-0 ${wine.status === 'wishlist' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                        >
                            <i className={`text-[19px] ri-bookmark-${wine.status === 'wishlist' ? 'fill' : 'line'}`}></i>
                        </button>

                        {/* Edit */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(e); }}
                            className="w-[42px] h-[42px] bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95 transition-all"
                            title="Editar"
                        >
                            <i className="ri-pencil-line text-[19px]"></i>
                        </button>

                        {/* Delete */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(e); }}
                            className="w-[42px] h-[42px] bg-gray-50 hover:bg-red-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-95 transition-all"
                            title="Excluir"
                        >
                            <i className="ri-delete-bin-line text-[19px]"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Grid View Actions */}
            {viewMode === 'grid' && (
                <div className="mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        {/* Quantity Control (Main Action for Grid View) */}
                        <div className="bg-gray-50 rounded-xl h-[36px] px-1.5 flex items-center justify-between flex-1 font-semibold text-gray-900 mr-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onConsume(e); }}
                                className="w-7 h-7 flex items-center justify-center rounded-[10px] hover:bg-white shadow-sm active:scale-90 text-gray-500 hover:text-gray-900 transition-all shrink-0"
                            >
                                <i className="ri-subtract-line text-[15px]"></i>
                            </button>
                            <span className="text-[14px] min-w-[1.2rem] text-center">{wine.quantity || 0}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(e); }}
                                className="w-7 h-7 flex items-center justify-center rounded-[10px] hover:bg-white shadow-sm active:scale-90 text-gray-500 hover:text-gray-900 transition-all shrink-0"
                            >
                                <i className="ri-add-line text-[15px]"></i>
                            </button>
                        </div>

                        {/* Status (Favorite / Wishlist toggle shortcut for grid view) */}
                        <div className="flex gap-1 shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(e); }}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all text-[17px] ${wine.is_favorite ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                            >
                                <i className={`ri-heart-3-${wine.is_favorite ? 'fill' : 'line'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
