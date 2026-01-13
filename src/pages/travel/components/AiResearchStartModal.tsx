import React from 'react';

interface AiResearchStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartResearch: () => void;
    onOpenPreferences: () => void;
    destination: string;
    dates: string;
    preferencesSummary: {
        vibe: string[];
        pace: string;
        interests: string[];
    };
}

export default function AiResearchStartModal({
    isOpen,
    onClose,
    onStartResearch,
    onOpenPreferences,
    destination,
    dates,
    preferencesSummary
}: AiResearchStartModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with Image Background */}
                <div className="relative h-48 bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="relative z-10 text-center p-6 text-white">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg">
                            <i className="ri-compass-3-line text-3xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold">Pesquisa IA Especialista</h2>
                        <p className="text-purple-100 text-sm mt-1">Explorando o melhor de {destination}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <p className="text-center text-gray-600">
                        Nossa IA vai analisar milhares de avaliações, clima e segredos locais para montar
                        uma lista exclusiva baseada no seu perfil.
                    </p>

                    {/* Context Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <i className="ri-map-pin-line text-purple-600 mb-2 block text-xl"></i>
                            <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Destino</span>
                            <span className="font-semibold text-gray-800 truncate block" title={destination}>{destination}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                                {preferencesSummary.vibe.length > 0 ? (
                                    preferencesSummary.vibe.slice(0, 3).map(v => (
                                        <span key={v} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium border border-purple-200">
                                            {v}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500 italic">Nenhuma vibe definida</span>
                                )}
                                {preferencesSummary.vibe.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium border border-gray-200">
                                        +{preferencesSummary.vibe.length - 3}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
                                    <i className="ri-speed-line mr-1"></i>
                                    Ritmo: {preferencesSummary.pace === 'slow' ? 'Lento' : preferencesSummary.pace === 'fast' ? 'Intenso' : 'Moderado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onStartResearch}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        <i className="ri-sparkling-fill text-yellow-300"></i>
                        Iniciar Pesquisa Profunda
                    </button>
                </div>
            </div>
        </div>
    );
}
