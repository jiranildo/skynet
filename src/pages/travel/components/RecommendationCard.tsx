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
    link?: string;
    media?: string[];

    // New Fields for Enhanced AI Search
    visitDuration?: string; // e.g., "3 horas", "2 dias"
    bestVisitTime?: string; // e.g., "Manhãs de semana", "Abril a Setembro"
    reservationStatus?: 'required' | 'recommended' | 'not_needed' | 'unknown';
    michelin?: string; // e.g., "1 Estrela Michelin", "Bib Gourmand"

    // New Fields for Adaptive Layouts
    category?: 'flight' | 'hotel' | 'general' | 'wine';

    // General / Restaurant
    googleRating?: number;
    menuLink?: string;
    parking?: string;
    establishmentType?: string;
    openHours?: string;
    address?: string;
    howToGetThere?: string;
    distanceFromHotel?: string;
    metadata?: { label: string; value: string }[];

    // Flight Specific
    airline?: string;
    flightNumber?: string;
    departureTime?: string;
    arrivalTime?: string;
    departureAirport?: string;
    arrivalAirport?: string;
    stops?: string; // "Direto", "1 parada"

    // Hotel Specific
    amenities?: string[]; // ["pool", "wifi", "gym"]
    pricePerNight?: string;
    stars?: number;
    tripAdvisorRating?: number | string;
    bookingRating?: number | string;

    // Wine Specific (New)
    producer?: string;
    wineType?: string; // Tinto, Branco, Rose...
    vintage?: string; // Safra 2016
    region?: string;
    country?: string;
    grapes?: string;
    alcohol?: string;
    pairing?: string;
    temperature?: string;
    decanting?: string;
    agingPotential?: string;
    reviewsCount?: number;
}


interface RecommendationCardProps {
    data: Recommendation;
    onSelect?: () => void;
    onView?: () => void;
    onSave?: () => void;
}

export function RecommendationCard({ data, onSelect, onView, onSave }: RecommendationCardProps) {

    // --- WINE LAYOUT (Special Custom Design) ---
    if (data.category === 'wine') {
        return (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300 group">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight mb-1">{data.name}</h3>
                    {data.producer && (
                        <p className="text-sm text-gray-500 font-medium">{data.producer}</p>
                    )}
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {data.wineType && (
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide">
                            {data.wineType}
                        </span>
                    )}
                    {data.vintage && (
                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                            {data.vintage}
                        </span>
                    )}
                    {data.stars && (
                        <div className="flex items-center gap-1 px-2 py-1">
                            <i className="ri-star-fill text-yellow-500 text-sm"></i>
                            <span className="font-bold text-gray-900 text-sm">{data.stars}</span>
                            {data.reviewsCount && (
                                <span className="text-gray-400 text-xs">({data.reviewsCount} avaliações)</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Região</span>
                        <div className="text-sm font-semibold text-gray-800">{data.region || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">País</span>
                        <div className="text-sm font-semibold text-gray-800">{data.country || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Uvas</span>
                        <div className="text-sm font-semibold text-gray-800 leading-tight">{data.grapes || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Teor Alcoólico</span>
                        <div className="text-sm font-semibold text-gray-800">{data.alcohol || '-'}</div>
                    </div>
                </div>

                {/* Description */}
                {data.description && (
                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-1">Descrição</h4>
                        <p className="text-xs text-gray-600 leading-relaxed font-light text-justify">
                            {data.description}
                        </p>
                    </div>
                )}

                {/* Details List */}
                <div className="space-y-3 mb-5">
                    {data.pairing && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-1">Harmonização</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{data.pairing}</p>
                        </div>
                    )}
                    {data.temperature && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-1">Temperatura</h4>
                            <p className="text-xs text-gray-600">{data.temperature}</p>
                        </div>
                    )}
                    {data.decanting && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-1">Decantação</h4>
                            <p className="text-xs text-gray-600">{data.decanting}</p>
                        </div>
                    )}
                </div>

                {/* Footer (Price & Aging) */}
                <div className="mt-auto bg-purple-50 rounded-2xl p-4 flex items-center justify-between border border-purple-100">
                    <div>
                        <span className="text-[10px] text-gray-500 block mb-0.5">Preço Estimado</span>
                        <span className="text-xl font-bold text-gray-900">{data.estimatedCost}</span>
                    </div>
                    {data.agingPotential && (
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 block mb-0.5">Potencial de Guarda</span>
                            <span className="text-sm font-bold text-purple-700">{data.agingPotential}</span>
                        </div>
                    )}
                </div>
                {/* Action Buttons (Footer) */}
                <div className="flex items-center gap-2 mt-4 pt-1">
                    {onSelect && (
                        <button
                            onClick={onSelect}
                            className="flex-1 bg-gray-900 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <span>Adicionar à Adega</span>
                            <i className="ri-add-line"></i>
                        </button>
                    )}
                    <div className="flex gap-1">
                        {onSave && (
                            <button onClick={onSave} className="p-2.5 rounded-xl hover:bg-purple-50 text-purple-400 hover:text-purple-600 transition-colors border border-purple-100" title="Adicionar à Wishlist">
                                <i className="ri-bookmark-3-line text-lg"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- FLIGHT LAYOUT (Google Flights Style) ---
    if (data.category === 'flight') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                            {data.icon || '✈️'}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">{data.airline}</div>
                            <div className="text-[10px] text-gray-400">{data.flightNumber}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">{data.estimatedCost}</div>
                        <div className="text-[10px] text-gray-500">por passageiro</div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="text-center">
                        <div className="font-bold text-gray-900 text-sm">{data.departureTime}</div>
                        <div className="text-xs text-gray-500">{data.departureAirport}</div>
                    </div>

                    <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="text-[10px] text-gray-400 mb-1">{data.duration}</div>
                        <div className="w-full h-[1px] bg-gray-300 relative">
                            <i className="ri-plane-fill absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-gray-400 text-xs rotate-90"></i>
                        </div>
                        <div className="text-[10px] text-green-600 mt-1 font-medium">{data.stops}</div>
                    </div>

                    <div className="text-center">
                        <div className="font-bold text-gray-900 text-sm">{data.arrivalTime}</div>
                        <div className="text-xs text-gray-500">{data.arrivalAirport}</div>
                    </div>
                </div>

                {data.link && (
                    <a href={data.link} target="_blank" rel="noopener noreferrer" className="block text-center py-2 rounded-lg border border-blue-100 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors mb-3">
                        Ver Voos no Google
                    </a>
                )}

                {/* AI Reason (Collapsed) */}
                <div className="bg-blue-50/50 rounded-lg p-3">
                    <p className="text-blue-900/80 text-xs italic leading-relaxed">
                        <i className="ri-sparkling-fill text-blue-600 mr-1"></i>
                        {data.reason}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {onSelect && <button onClick={onSelect} className="flex-1 text-xs font-bold text-gray-700 hover:text-gray-900">Selecionar</button>}
                    {onSave && <button onClick={onSave} className="text-gray-400 hover:text-gray-600"><i className="ri-bookmark-line"></i></button>}
                </div>
            </div>
        );
    }

    // --- HOTEL LAYOUT (Trivago Style) ---
    if (data.category === 'hotel') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                {/* Hero Image */}
                <div className="h-40 relative bg-gray-100">
                    {data.media && data.media.length > 0 ? (
                        <div className="flex h-full overflow-x-auto snap-x scrollbar-hide">
                            {data.media.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    className="w-full h-full object-cover snap-center flex-shrink-0"
                                    alt={data.name}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <i className="ri-hotel-line text-4xl"></i>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-green-700 text-xs">{data.googleRating}</span>
                            <i className="ri-star-fill text-yellow-400 text-[10px]"></i>
                            <span className="text-[8px] text-gray-500">Google</span>
                        </div>
                        {data.tripAdvisorRating && (
                            <div className="flex items-center gap-1 border-t border-gray-100 pt-0.5 mt-0.5">
                                <span className="font-bold text-emerald-600 text-xs">{data.tripAdvisorRating}</span>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <i className="ri-owl-fill text-white text-[6px]"></i>
                                </div>
                                <span className="text-[8px] text-gray-500">TripAdv.</span>
                            </div>
                        )}
                        {data.bookingRating && (
                            <div className="flex items-center gap-1 border-t border-gray-100 pt-0.5 mt-0.5">
                                <span className="font-bold text-blue-700 text-xs">{data.bookingRating}</span>
                                <div className="w-2.5 h-2.5 rounded-sm bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-[6px] font-bold">B.</span>
                                </div>
                                <span className="text-[8px] text-gray-500">Booking</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5">{data.name}</h3>
                            <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                                {[...Array(data.stars || 3)].map((_, i) => <i key={i} className="ri-star-fill"></i>)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg text-gray-900">{data.estimatedCost}</div>
                            <div className="text-[10px] text-gray-500">/noite</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs">
                        <i className="ri-map-pin-line"></i>
                        <span className="truncate">{data.address}</span>
                    </div>

                    {/* Amenities */}
                    {data.amenities && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {data.amenities.slice(0, 4).map((amenity, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-2">
                        <div className="bg-purple-50 rounded-lg p-2.5">
                            <p className="text-purple-900 text-xs italic">
                                <i className="ri-sparkling-fill text-purple-600 mr-1.5"></i>
                                {data.reason}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {data.link && (
                                <a href={data.link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg text-center transition-colors">
                                    Ver Oferta
                                </a>
                            )}
                            {onSelect && (
                                <button onClick={onSelect} className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                                    <i className="ri-add-line"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- GENERAL LAYOUT (Existing Clean & Elegant) ---
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-lg transition-all duration-300 group">
            {/* Header Section - Clean & Elegant */}
            <div className="mb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-3xl mb-2 opacity-90">{data.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                            {data.name}
                        </h3>
                        {data.establishmentType && (
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                {data.establishmentType}
                            </span>
                        )}
                    </div>
                    {data.googleRating && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                <span className="text-sm font-bold text-green-700">{data.googleRating}</span>
                                <i className="ri-star-fill text-yellow-400 text-xs"></i>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1">Google</span>
                        </div>
                    )}
                </div>

                {/* Primary Actions (Link & Address) */}
                <div className="flex flex-col gap-1 mt-2">
                    {data.link && (
                        <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-fit">
                            <span>Website Oficial</span>
                            <i className="ri-arrow-right-up-line text-[10px]"></i>
                        </a>
                    )}

                    {data.address && (
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name + ' ' + data.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-start gap-1.5 mt-1"
                        >
                            <i className="ri-map-pin-line mt-0.5 shrink-0 text-gray-400"></i>
                            <span className="line-clamp-1">{data.address}</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Media Carousel - Seamless Integration */}
            {data.media && data.media.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide snap-x -mx-2 px-2">
                    {data.media.map((url, idx) => (
                        <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-none w-32 h-24 rounded-xl overflow-hidden border border-gray-100 snap-start relative group/media shadow-sm"
                            style={{ display: 'block' }}
                        >
                            <img
                                src={url}
                                alt={`Media ${idx + 1}`}
                                className="w-full h-full object-cover transform group-hover/media:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) target.parentElement.style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors"></div>
                        </a>
                    ))}
                </div>
            )}

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                {data.description}
            </p>

            {/* Info Grid - Minimalist Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <i className="ri-money-dollar-circle-line text-lg text-emerald-500"></i>
                    <span>{data.estimatedCost}</span>
                </div>
                {/* Smart Time Display Logic */}
                <div className="space-y-1 mt-2">
                    {/* Primary Time Info: Visit Duration OR Open Hours */}
                    {/* Primary Time Info: Visit Duration OR Open Hours */}
                    {(() => {
                        // Priority: VisitDuration > OpenHours > Duration (only if flight)
                        let rawText = data.visitDuration || data.openHours;

                        if (!rawText) {
                            // Generic fallback or just null
                        }

                        // Clean up text
                        if (!rawText || typeof rawText !== 'string') return null;
                        const cleanText = rawText.trim();
                        if (cleanText === '' || cleanText === 'undefined' || cleanText === 'null') return null;

                        const isVisitDuration = !!data.visitDuration;
                        const finalText = isVisitDuration ? `Tempo ideal: ${cleanText}` : cleanText;

                        return (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <i className={`${isVisitDuration ? 'ri-hourglass-2-line text-orange-500' : 'ri-time-line text-blue-500'} text-lg`}></i>
                                <span>{finalText}</span>
                            </div>
                        );
                    })()}

                    {/* Best Visit Time (New Row) */}
                    {data.bestVisitTime && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <i className="ri-sun-cloudy-line text-lg text-yellow-500"></i>
                            <span>Melhor época: {data.bestVisitTime}</span>
                        </div>
                    )}

                    {/* Michelin Rating (New Row) */}
                    {data.michelin && (
                        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-1.5 rounded-lg border border-red-100 w-fit">
                            <i className="ri-award-fill text-lg text-red-600"></i>
                            <span className="font-bold">{data.michelin}</span>
                        </div>
                    )}

                    {/* Reservation Status */}
                    {data.reservationStatus && data.reservationStatus !== 'not_needed' && data.reservationStatus !== 'unknown' && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <i className={`ri-calendar-check-line text-lg ${data.reservationStatus === 'required' ? 'text-red-500' : 'text-gray-400'}`}></i>
                            <span className={data.reservationStatus === 'required' ? 'text-red-600 font-medium' : ''}>
                                {data.reservationStatus === 'required' ? 'Reserva Obrigatória' : 'Reserva Recomendada'}
                            </span>
                        </div>
                    )}
                </div>

                {data.parking && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <i className="ri-roadster-line text-lg text-gray-400"></i>
                        <span>{data.parking}</span>
                    </div>
                )}

                {data.menuLink && (
                    <a href={data.menuLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-indigo-600 hover:underline">
                        <i className="ri-restaurant-2-line text-lg"></i>
                        <span>Ver Cardápio</span>
                    </a>
                )}
            </div>

            {/* AI Insight - The "Why" */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/40 rounded-full -mr-8 -mt-8 blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="ri-sparkling-fill text-purple-600"></i>
                        <span className="text-xs font-bold text-purple-900 uppercase tracking-widest">Opinião do Especialista</span>
                    </div>
                    <p className="text-purple-900/80 text-sm italic leading-relaxed">
                        "{data.reason}"
                    </p>
                </div>
            </div>

            {/* Highlights/Tags - Chips */}
            <div className="flex flex-wrap gap-2 mt-auto">
                {data.highlights && data.highlights.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wide">
                        <i className="ri-check-line text-green-500"></i>
                        {item}
                    </span>
                ))}
            </div>

            {/* Action Buttons (Footer) */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-50">
                {onSelect && (
                    <button
                        onClick={onSelect}
                        className="flex-1 bg-gray-900 text-white font-medium py-3 px-4 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <span>Selecionar</span>
                        <i className="ri-arrow-right-line"></i>
                    </button>
                )}
                <div className="flex gap-1">
                    {onView && (
                        <button onClick={onView} className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors">
                            <i className="ri-eye-line text-lg"></i>
                        </button>
                    )}
                    {onSave && (
                        <button onClick={onSave} className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors">
                            <i className="ri-bookmark-line text-lg"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
