import React, { useState } from 'react';
import { RecommendationCard, Recommendation } from './RecommendationCard';

interface Activity {
    id: string;
    description: string;
    status: 'pending' | 'confirmed' | 'not_reserved';
    type: string;
    coordinates?: { lat: number; lng: number };
    price?: string;
    metadata?: any;
    // ... we don't need all Activity fields here, but keeping compat if needed
    title: string;
}

interface AiResearchResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: Recommendation[]; // Direct Recommendations
    onAddActivity: (recommendation: Recommendation, targetDayIndex: number) => void;
    dayLabelFunction: (index: number) => string;
    dayIndices: number[];
    onSearch: (query: string, categories: string[]) => void;
    onLoadMore?: () => void;
    onOpenPreferences: () => void;
    destination: string;
    dates: string;
    preferencesSummary: {
        vibe: string[];
        pace: string;
        interests: string[];
    };
    isLoading?: boolean;
}

const RESEARCH_CATEGORIES = [
    { id: 'tours', label: 'Passeios', icon: 'ri-camera-line' },
    { id: 'accommodation', label: 'Hospedagens', icon: 'ri-hotel-line' },
    { id: 'transport', label: 'Locomoção', icon: 'ri-taxi-line' },
    { id: 'food', label: 'Alimentação', icon: 'ri-restaurant-line' },
    { id: 'shopping', label: 'Compras', icon: 'ri-shopping-bag-line' },
    // New Categories
    { id: 'cruises', label: 'Cruzeiros', icon: 'ri-ship-line' },
    { id: 'disney', label: 'Disney', icon: 'ri-magic-line' },
    { id: 'universal', label: 'Universal', icon: 'ri-movie-line' },
    { id: 'parks', label: 'Parques', icon: 'ri-ticket-2-line' },
    { id: 'currency', label: 'Câmbio', icon: 'ri-exchange-dollar-line' }
];

export default function AiResearchResultsModal({
    isOpen,
    onClose,
    results,
    onAddActivity,
    dayLabelFunction,
    dayIndices,
    onSearch,
    onLoadMore,
    onOpenPreferences,
    destination,
    dates,
    preferencesSummary,
    isLoading = false
}: AiResearchResultsModalProps) {
    const [openMoveMenuId, setOpenMoveMenuId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleDeepResearch = () => {
        onSearch(searchQuery, selectedCategories);
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    // No client-side pagination anymore
    const visibleResults = results;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 animate-fadeIn backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                <div className="flex-1 overflow-y-auto bg-white/50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Start View Header (Embedded) */}
                    <div className="relative h-48 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden shrink-0">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-20"
                        >
                            <i className="ri-close-line text-xl"></i>
                        </button>
                        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                        <div className="relative z-10 text-center p-6 text-white">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg">
                                <i className="ri-compass-3-line text-3xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold">Pesquisa IA Especialista</h2>
                            <p className="text-purple-100 text-sm mt-1">Explorando o melhor de {destination}</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6 max-w-2xl mx-auto">
                        <p className="text-center text-gray-600">
                            Nossa IA vai analisar milhares de avaliações, clima e segredos locais para montar
                            uma lista exclusiva baseada no seu perfil.
                        </p>

                        {/* Context Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <i className="ri-map-pin-line text-purple-600 mb-2 block text-xl"></i>
                                <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Destino</span>
                                <span className="font-semibold text-gray-800 truncate block" title={destination}>{destination}</span>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <i className="ri-calendar-event-line text-purple-600 mb-2 block text-xl"></i>
                                <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Período</span>
                                <span className="font-semibold text-gray-800 truncate block">{dates}</span>
                            </div>
                        </div>

                        {/* Preferences Review */}
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <i className="ri-user-settings-line text-purple-600"></i>
                                        Seu Perfil de Viagem
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Usado para filtrar as sugestões</p>
                                </div>
                                <button
                                    onClick={onOpenPreferences}
                                    className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:shadow-sm transition-all"
                                >
                                    PERSONALIZAR
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {preferencesSummary && preferencesSummary.vibe.length > 0 ? (
                                        preferencesSummary.vibe.slice(0, 3).map(v => (
                                            <span key={v} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium border border-purple-200">
                                                {v}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">Nenhuma vibe definida</span>
                                    )}
                                    {preferencesSummary && preferencesSummary.vibe.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium border border-gray-200">
                                            +{preferencesSummary.vibe.length - 3}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
                                        <i className="ri-speed-line mr-1"></i>
                                        Ritmo: {preferencesSummary?.pace === 'slow' ? 'Lento' : preferencesSummary?.pace === 'fast' ? 'Intenso' : 'Moderado'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Start View Search Input */}
                        <div className="relative">
                            <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                            <input
                                type="text"
                                placeholder="O que você está procurando? (ex: jantar romântico, passeio aventura...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-purple-100 bg-purple-50/50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-base shadow-sm"
                            />
                        </div>

                        {/* Categories Checkboxes */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {RESEARCH_CATEGORIES.map(cat => {
                                const isSelected = selectedCategories.includes(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border transition-all ${isSelected
                                            ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <i className={`${cat.icon} ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}></i>
                                        {cat.label}
                                        {isSelected && <i className="ri-check-line text-purple-600 ml-1"></i>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleDeepResearch}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:grayscale"
                        >
                            {isLoading ? (
                                <>
                                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                                    Pesquisando...
                                </>
                            ) : (
                                <>
                                    <i className="ri-sparkling-fill text-yellow-300"></i>
                                    Iniciar Pesquisa Profunda
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    {(results.length > 0 || isLoading) && (
                        <div className="p-6 bg-gray-50/30 animate-in fade-in slide-in-from-bottom-10 duration-500 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="ri-magic-line text-indigo-500"></i>
                                Sugestões da IA
                            </h3>
                            <div className="space-y-6 max-w-2xl mx-auto">
                                {isLoading && results.length === 0 && (
                                    <div className="text-center py-10 opacity-60">
                                        <i className="ri-loader-2-line text-4xl animate-spin text-indigo-400 mb-3 block"></i>
                                        <p className="text-gray-500">Criando sugestões personalizadas...</p>
                                    </div>
                                )}
                                {visibleResults.map((rec, idx) => (
                                    <div key={idx} className="relative group">
                                        {rec.suggestedDayId !== undefined && (
                                            <div className="absolute -top-3 left-4 z-10 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                                Sugestão: {dayLabelFunction(rec.suggestedDayId)}
                                            </div>
                                        )}

                                        <RecommendationCard
                                            data={rec}
                                        />

                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMoveMenuId(openMoveMenuId === rec.name ? null : rec.name)} // using Name as ID if no ID
                                                    className="bg-white/90 backdrop-blur text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full shadow-sm border border-indigo-100 flex items-center gap-2 transition-colors"
                                                >
                                                    <i className="ri-add-line"></i>
                                                    Adicionar ao Roteiro
                                                </button>

                                                {openMoveMenuId === rec.name && (
                                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="p-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            Escolha o dia
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {dayIndices.map(dayIndex => (
                                                                <button
                                                                    key={dayIndex}
                                                                    onClick={() => {
                                                                        onAddActivity(rec, dayIndex);
                                                                        setOpenMoveMenuId(null);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0 ${rec.suggestedDayId === dayIndex
                                                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                                        : 'text-gray-700 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <i className={`ri-calendar-${rec.suggestedDayId === dayIndex ? 'check' : 'line'} ${rec.suggestedDayId === dayIndex ? 'text-indigo-500' : 'text-gray-400'}`}></i>
                                                                    {dayLabelFunction(dayIndex)}
                                                                    {rec.suggestedDayId === dayIndex && <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">Sugestão</span>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* AI Pagination Button - Always visible to load more from API */}
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={onLoadMore}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 group disabled:opacity-70 disabled:grayscale"
                                    >
                                        {isLoading ? (
                                            <i className="ri-loader-4-line animate-spin text-xl"></i>
                                        ) : (
                                            <i className="ri-sparkling-fill text-yellow-300 text-xl group-hover:rotate-12 transition-transform"></i>
                                        )}
                                        {isLoading ? 'Processando...' : 'Carregar +5 Sugestões com IA'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
