import React from 'react';

export interface Recommendation {
    icon: string;
    name: string;
    description: string;
    reason: string;
    bestTime: string;
    estimatedCost: string;
    duration: string;
    tags: string[];
    highlights: string[];
    suggestedDayId?: number;
    address?: string;
    howToGetThere?: string;
    distanceFromHotel?: string;
    metadata?: { label: string; value: string }[];
}

interface RecommendationCardProps {
    data: Recommendation;
    onSelect?: () => void;
    onView?: () => void;
    onSave?: () => void;
}

export function RecommendationCard({ data, onSelect, onView, onSave }: RecommendationCardProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="mb-4">
                <div className="text-4xl mb-3"><i className={data.icon}></i></div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{data.name}</h3>

                {/* Metadata Badges (Flights/Cruises/etc) */}
                {data.metadata && data.metadata.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {data.metadata.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                <span className="text-blue-400 font-normal">{item.label}:</span>
                                {item.value}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {data.description}
                </p>
            </div>

            {/* AI Reason Box */}
            <div className="bg-purple-50 rounded-xl p-4 mb-4 border-l-4 border-purple-500">
                <div className="flex items-start gap-2">
                    <i className="ri-sparkling-fill text-purple-600 mt-0.5"></i>
                    <div>
                        <h4 className="text-purple-900 font-bold text-xs uppercase tracking-wide mb-1">Por que este destino?</h4>
                        <p className="text-purple-800 text-sm italic leading-relaxed">
                            {data.reason}
                        </p>
                    </div>
                </div>
            </div>

            {/* Location Details Box */}
            {(data.address || data.howToGetThere || data.distanceFromHotel) && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 space-y-3">
                    {data.address && (
                        <div className="flex items-start gap-2.5">
                            <i className="ri-map-pin-2-line text-gray-400 mt-0.5 shrink-0"></i>
                            <div className="text-xs text-gray-600 break-words leading-relaxed">
                                <span className="font-bold text-gray-700 block mb-0.5">Endereço:</span>
                                {data.address}
                            </div>
                        </div>
                    )}

                    {data.distanceFromHotel && (
                        <div className="flex items-start gap-2.5">
                            <i className="ri-hotel-line text-indigo-400 mt-0.5 shrink-0"></i>
                            <div className="text-xs text-gray-600 break-words leading-relaxed">
                                <span className="font-bold text-gray-700 block mb-0.5">Do seu Hotel:</span>
                                {data.distanceFromHotel}
                            </div>
                        </div>
                    )}

                    {data.howToGetThere && (
                        <div className="flex items-start gap-2.5">
                            <i className="ri-direction-line text-emerald-500 mt-0.5 shrink-0"></i>
                            <div className="text-xs text-gray-600 break-words leading-relaxed">
                                <span className="font-bold text-gray-700 block mb-0.5">Como chegar:</span>
                                {data.howToGetThere}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs font-medium text-gray-700">
                    <i className="ri-sun-line text-orange-500"></i>
                    {data.bestTime}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs font-medium text-gray-700">
                    <i className="ri-money-dollar-circle-line text-green-600"></i>
                    {data.estimatedCost}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs font-medium text-gray-700">
                    <i className="ri-time-line text-blue-500"></i>
                    {data.duration}
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {data.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600 bg-white">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Highlights */}
            <div className="mb-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <i className="ri-star-smile-fill text-yellow-400"></i>
                    <span className="font-bold text-gray-900 text-sm">Destaques:</span>
                </div>
                <ul className="space-y-1">
                    {data.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-blue-400 mt-1.5 text-[6px]">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto">
                {onSelect && (
                    <button
                        onClick={onSelect}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <i className="ri-check-line"></i>
                        Escolher
                    </button>
                )}
                {onView && (
                    <button
                        onClick={onView}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        title="Ver detalhes"
                    >
                        <i className="ri-eye-line text-lg"></i>
                    </button>
                )}
                {onSave && (
                    <button
                        onClick={onSave}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        title="Salvar"
                    >
                        <i className="ri-bookmark-line text-lg"></i>
                    </button>
                )}
            </div>
        </div>
    );
}
