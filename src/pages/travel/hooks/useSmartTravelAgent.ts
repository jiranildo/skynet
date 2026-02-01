import { useState, useCallback } from 'react';

// --- Types ---
type SearchContext = 'NEARBY' | 'EXPLORE_COUNTRY' | 'DESTINATION_DISCOVERY' | 'SPECIFIC_CATEGORY' | 'MANUAL_PLACE';

interface TravelAgentState {
    userLocation: { name: string; country: string; coords: { lat: number; lon: number } | null, types?: string[] };
    results: any[];
    isLoading: boolean;
    hasSearched: boolean;
    lastTerm: string;
    isLoadingMore: boolean;
    showModal: boolean;
    page: number;
}

// --- Helpers ---

// Haversine Distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
};

// Nominatim Fetcher
const fetchNominatim = async (query: string, limit: number, viewbox?: string) => {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;
    if (viewbox) {
        url += `&viewbox=${viewbox}&bounded=1`;
    }
    const response = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
    if (!response.ok) return [];
    return await response.json();
};

// --- Constants & Types ---
interface CategoryDef {
    id: string;
    title: string;
    icon?: string;
    description: string;
    keywords?: string[];
}

const INSPIRATION_TOPICS: CategoryDef[] = [
    { id: "top10_year", title: "Top 10 Viagens 2024", icon: "🌟", description: "Destinos mais procurados do ano", keywords: ["trending", "popular", "2024"] },
    { id: "romantic", title: "Viagens Românticas", icon: "💕", description: "Destinos perfeitos para casais", keywords: ["romantic", "couple", "honeymoon"] },
    { id: "disney", title: "Walt Disney World", icon: "🏰", description: "Magia e diversão nos parques Disney", keywords: ["disney", "orlando", "theme parks"] },
    { id: "nearby", title: "Locais Próximos e Região", icon: "📍", description: "Descubra destinos perto de você", keywords: ["nearby", "close", "region", "weekend"] },
    { id: "explore_country", title: "Explore seu País", icon: "🇧🇷", description: "Conheça os tesouros do Brasil", keywords: ["brazil", "nacional", "domestic"] },
    { id: "adventure", title: "Aventura Extrema", icon: "⛰️", description: "Para quem busca adrenalina", keywords: ["adventure", "extreme", "hiking"] },
    { id: "beach", title: "Praias Paradisíacas", icon: "🏖️", description: "Águas cristalinas e areia branca", keywords: ["beach", "paradise", "tropical"] },
    { id: "culture", title: "Roteiro Cultural", icon: "🏛️", description: "História, arte e museus", keywords: ["culture", "history", "museums"] },
    { id: "gastronomy", title: "Experiência Gastronômica", icon: "🍽️", description: "Para os amantes da boa comida", keywords: ["food", "gastronomy", "culinary"] },
    { id: "budget", title: "Viagem Econômica", icon: "💰", description: "Destinos incríveis gastando pouco", keywords: ["budget", "cheap", "affordable"] },
    { id: "luxury", title: "Experiência Luxuosa", icon: "💎", description: "O melhor que o dinheiro pode comprar", keywords: ["luxury", "premium", "exclusive"] },
    { id: "family", title: "Viagem em Família", icon: "👨‍👩‍👧‍👦", description: "Diversão para todas as idades", keywords: ["family", "kids", "children"] },
    { id: "christmas", title: "Melhores Locais para Viajar no Natal", icon: "🎄", description: "Destinos mágicos para o Natal", keywords: ["christmas", "natal", "december", "winter"] },
    { id: "newyear", title: "Melhores Locais para Viajar no Ano Novo", icon: "🎆", description: "Celebre a virada do ano", keywords: ["new year", "ano novo", "celebration", "fireworks"] },
    { id: "cruises", title: "Melhores Cruzeiros", icon: "🚢", description: "Experiências incríveis no mar", keywords: ["cruise", "cruzeiro", "ship", "ocean"] },
    { id: "monthly", title: "Melhores Destinos por Mês", icon: "📅", description: "Onde ir em cada época do ano", keywords: ["monthly", "calendar", "when to go", "best time"] },
    { id: "festivals", title: "Datas Festivas Mais Famosas", icon: "🎉", description: "Festas e eventos pelo mundo", keywords: ["festival", "celebration", "events", "parties"] },
];

const NEARBY_SUBCATEGORIES: CategoryDef[] = [
    { id: "gastronomy", title: "Gastronomia", icon: "🍽️", description: "Restaurantes e experiências culinárias", keywords: ["restaurante", "bistro", "gastronomia"] },
    { id: "hotels", title: "Hotéis & Hospedagem", icon: "🏨", description: "Lugares incríveis para se hospedar", keywords: ["hotel", "pousada", "resort"] },
    { id: "museums", title: "Museus & Cultura", icon: "🏛️", description: "História e arte na região", keywords: ["museu", "teatro", "galeria", "cultura"] },
    { id: "kids", title: "Locais para Crianças", icon: "🎠", description: "Diversão para os pequenos", keywords: ["parque infantil", "lazer", "crianças"] },
    { id: "romantic", title: "Românticos", icon: "💑", description: "Perfeito para casais", keywords: ["romântico", "casal", "jantar"] },
    { id: "family", title: "Em Família", icon: "👨‍👩‍👧‍👦", description: "Toda família vai adorar", keywords: ["família", "parque", "lazer"] },
    { id: "nature", title: "Natureza", icon: "🌳", description: "Parques e áreas verdes", keywords: ["parque", "natureza", "ar livre", "trilha"] },
    { id: "adventure", title: "Aventura", icon: "🧗", description: "Esportes e atividades radicais", keywords: ["aventura", "esporte", "radical"] },
    { id: "relax", title: "Relaxamento", icon: "🧘", description: "Spas e bem-estar", keywords: ["spa", "massagem", "relaxar"] },
    { id: "nightlife", title: "Vida Noturna", icon: "🎉", description: "Bares e entretenimento", keywords: ["bar", "balada", "pub", "noite"] },
    { id: "shopping", title: "Compras", icon: "🛍️", description: "Shoppings e lojas", keywords: ["shopping", "lojas", "compras"] },
    { id: "beach", title: "Praias", icon: "🏖️", description: "Litoral e praias próximas", keywords: ["praia", "litoral", "mar"] },
];

export const useSmartTravelAgent = () => {
    // --- State ---
    const [state, setState] = useState<TravelAgentState>({
        userLocation: { name: '', country: '', coords: null },
        results: [],
        isLoading: false,
        hasSearched: false,
        lastTerm: '',
        isLoadingMore: false,
        showModal: false,
        page: 1
    });

    // --- Actions ---

    // 1. Detect Location (Enhanced)
    const detectUserLocation = useCallback(async () => {
        try {
            const position: any = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
            });
            const { latitude, longitude } = position.coords;

            // Reverse Geocode
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                const data = await res.json();

                const city = data.address.city || data.address.town || data.address.municipality || 'Sua Região';
                const country = data.address.country || 'Brasil';

                // Extract types/categories
                const types = [];
                if (data.type) types.push(data.type);
                if (data.category) types.push(data.category);
                if (data.addresstype) types.push(data.addresstype);

                setState(prev => ({
                    ...prev,
                    userLocation: {
                        name: data.name || city, // Prefer precise name if available (POI)
                        country: country,
                        coords: { lat: latitude, lon: longitude },
                        types: types
                    }
                }));
            } catch (e) {
                console.warn("Reverse Geo Error", e);
                setState(prev => ({
                    ...prev,
                    userLocation: { name: 'Localização Atual', country: 'Brasil', coords: { lat: latitude, lon: longitude } }
                }));
            }
        } catch (error) {
            console.error("Location Denied/Error", error);
        }
    }, []);

    // 2. The "Brain" - Search Orchestrator
    const search = useCallback(async (category: string, rawQuery?: string, append: boolean = false) => {
        const newPage = append ? state.page + 1 : 1;

        setState(prev => ({
            ...prev,
            isLoading: !append,
            isLoadingMore: append,
            page: newPage
        }));

        const { userLocation } = state;
        const searchLat = userLocation.coords?.lat || -23.5505;
        const searchLon = userLocation.coords?.lon || -46.6333;

        // --- Context Analysis ---
        let context: SearchContext = 'SPECIFIC_CATEGORY';
        let queries: string[] = [];
        let useViewbox = false;
        let finalQuery = '';

        // Find matching topic (Fuzzy match)
        const topic = INSPIRATION_TOPICS.find(t => category.includes(t.title) || t.title.includes(category)) ||
            NEARBY_SUBCATEGORIES.find(t => category.includes(t.title) || t.title.includes(category));

        // Determine Intent for "Resultados da Busca" (Manual Input)
        if (category === 'Resultados da Busca' && rawQuery) {
            // Manual Input Analysis
            const q = rawQuery.toLowerCase();
            const knownCategories = ['hotel', 'restaurante', 'parque', 'museu', 'praia', 'shopping', 'casino', 'cassino', 'show', 'teatro', 'aeroporto', 'rodoviária', 'resort'];

            if (knownCategories.some(cat => q.includes(cat))) {
                // User typed "Hotel em Las Vegas" or "Hotel"
                context = 'MANUAL_PLACE';
                finalQuery = rawQuery;
                if (!rawQuery.includes(' em ') && userLocation.coords) {
                    useViewbox = true; // Use radius if no location specified in query
                }
            } else {
                // Likely a Destination
                context = 'DESTINATION_DISCOVERY';
                finalQuery = `Pontos turísticos em ${rawQuery}`;
                queries = [
                    `Atrações em ${rawQuery}`,
                    `Tourist attractions in ${rawQuery}`,
                    `Top sights in ${rawQuery}`,
                    `City Center ${rawQuery}`
                ];
            }
        }
        // Logic for Known Topics with Semantic Mapping
        else if (topic) {
            context = topic.id === 'nearby' ? 'NEARBY' : (topic.id === 'explore_country' ? 'EXPLORE_COUNTRY' : 'SPECIFIC_CATEGORY');
            const locationName = userLocation.name || 'São Paulo';

            // Semantic Logic Switch
            switch (topic.id) {
                case 'disney':
                    finalQuery = 'Walt Disney World Resort';
                    useViewbox = false;
                    break;
                case 'explore_country':
                    const hubs = ['Rio de Janeiro', 'Gramado', 'Salvador', 'Foz do Iguaçu', 'Florianópolis', 'Recife', 'Brasília', 'Fortaleza', 'São Paulo', 'Manaus'];
                    const target = hubs[(newPage - 1) % hubs.length];
                    finalQuery = `Pontos turísticos em ${target}`;
                    queries = [`Atrações em ${target}`, `Turismo em ${target}`];
                    break;
                case 'nearby':
                    const nearbyMixin = ['Pontos turísticos', 'Restaurantes', 'Parques', 'Lazer'];
                    finalQuery = nearbyMixin[(newPage - 1) % nearbyMixin.length];
                    useViewbox = true;
                    break;

                // Semantic Mapping for Abstract Categories
                case 'luxury':
                    finalQuery = `Hotel 5 estrelas em ${locationName}`;
                    queries = [`Resort em ${locationName}`, `Restaurante de luxo em ${locationName}`];
                    break;
                case 'budget':
                    finalQuery = `Hostel em ${locationName}`;
                    queries = [`Camping em ${locationName}`, `Parque público em ${locationName}`, `Comida de rua em ${locationName}`];
                    break;
                case 'romantic':
                    finalQuery = `Restaurante romântico em ${locationName}`;
                    queries = [`Mirante em ${locationName}`, `Hotel romântico em ${locationName}`];
                    break;
                case 'family':
                case 'kids':
                    finalQuery = `Parque diversões em ${locationName}`;
                    queries = [`Parque aquático em ${locationName}`, `Zoológico em ${locationName}`, `Aquário em ${locationName}`];
                    break;
                case 'christmas':
                    finalQuery = `Decoração de natal em ${locationName}`; // Difficult, usually better to fallback to generic heavy hitters
                    queries = [`Shopping em ${locationName}`, `Catedral em ${locationName}`];
                    break;
                case 'newyear':
                    finalQuery = `Praia em ${locationName}`;
                    queries = [`Clube em ${locationName}`, `Show em ${locationName}`, `Praça pública em ${locationName}`];
                    break;
                case 'culture':
                case 'museums':
                    finalQuery = `Museu em ${locationName}`;
                    queries = [`Teatro em ${locationName}`, `Galeria de arte em ${locationName}`, `Centro histórico em ${locationName}`];
                    break;
                case 'adventure':
                case 'nature':
                    finalQuery = `Trilha em ${locationName}`;
                    queries = [`Cachoeira em ${locationName}`, `Montanhismo em ${locationName}`, `Parque nacional em ${locationName}`];
                    break;
                case 'gastronomy':
                    finalQuery = `Restaurante bem avaliado em ${locationName}`;
                    queries = [`Mercado municipal em ${locationName}`, `Bistro em ${locationName}`, `Feira gastronômica em ${locationName}`];
                    break;
                case 'relax':
                    finalQuery = `Spa em ${locationName}`;
                    queries = [`Parque em ${locationName}`, `Jardim botânico em ${locationName}`, `Yoga em ${locationName}`];
                    break;
                case 'beach':
                    finalQuery = `Praia`; // Viewbox should handle proximity
                    useViewbox = true;
                    if (locationName !== 'Sua Região') queries = [`Praia em ${locationName}`];
                    break;
                case 'shopping':
                    finalQuery = `Shopping em ${locationName}`;
                    queries = [`Rua comercial em ${locationName}`, `Feira de artesanato em ${locationName}`];
                    break;
                case 'nightlife':
                    finalQuery = `Bar em ${locationName}`;
                    queries = [`Balada em ${locationName}`, `Pub em ${locationName}`, `Casa de shows em ${locationName}`];
                    break;

                // Default Fallback to Title/Keyword
                default:
                    const keyword = topic.keywords && topic.keywords.length > 0 ? topic.keywords[0] : topic.title;
                    finalQuery = `${keyword} em ${locationName}`;
                    if (topic.keywords && topic.keywords.length > 1) {
                        queries = topic.keywords.slice(1).map(k => `${k} em ${locationName}`);
                    }
            }

            // Enforce radius for local categories not covered by specific cases
            const isGlobal = ['cruises', 'disney', 'monthly', 'festivals', 'top10_year'].includes(topic.id);
            if (!isGlobal && userLocation.coords && topic.id !== 'disney') {
                useViewbox = true;
                // Specific fix for "Beach" is handled above, but for others we might want to be careful
            }
        }
        else {
            // Fallback for completely unknown categories
            finalQuery = `${category} em ${userLocation.name || 'Brasil'}`;
        }

        // --- Execute Search ---
        try {
            let viewboxStr = undefined;
            // Only use viewbox if we truly have coordinates AND it's a nearby/local intent
            if (useViewbox && userLocation.coords) {
                const r = 25; // Increased radius to 25km for better hits
                const dLat = r / 111;
                const dLon = r / (111 * Math.cos(searchLat * Math.PI / 180));
                viewboxStr = `${searchLon - dLon},${searchLat + dLat},${searchLon + dLon},${searchLat - dLat}`;
            }

            // Fallback for missing location in Dev/Headless
            if (!userLocation.coords && context !== 'DESTINATION_DISCOVERY') {
                console.warn("No location detected, defaulting to São Paulo for demo purposes");
                // We don't set viewboxStr here, just rely on the query string "em São Paulo"
                if (!finalQuery.includes(' em ')) {
                    finalQuery += ' em São Paulo';
                }
            }

            console.log(`Executing Search: "${finalQuery}" with viewbox: ${viewboxStr}`);

            // Primary Fetch
            let rawData = await fetchNominatim(finalQuery, 10, viewboxStr);

            // Retry logic with relaxed queries
            if ((!rawData || rawData.length === 0) && queries.length > 0) {
                // Try secondary queries
                for (const q of queries) {
                    console.log(`Retrying search with: ${q}`);
                    rawData = await fetchNominatim(q, 10, viewboxStr);
                    if (rawData && rawData.length > 0) break;
                }
            }

            // Final "Hail Mary" Retry - Search WITHOUT Viewbox if it failed with it
            if ((!rawData || rawData.length === 0) && viewboxStr) {
                console.log(`Retrying "${finalQuery}" WITHOUT viewbox`);
                rawData = await fetchNominatim(finalQuery, 10, undefined);
            }

            // Process & Enrich Data
            const processed = await Promise.all((rawData || []).map(async (item: any) => {
                const dist = calculateDistance(searchLat, searchLon, parseFloat(item.lat), parseFloat(item.lon));
                const placeName = item.name || item.display_name.split(',')[0];
                const city = item.address?.city || item.address?.town || 'Local';

                return {
                    name: placeName,
                    description: item.display_name,
                    aiReason: null, // Removed AI Reason
                    address: item.display_name,
                    distance: `${dist}km`,
                    price: 'Sob consulta',
                    category: item.type,
                    tags: [item.type, context === 'NEARBY' ? 'Perto de você' : 'Destino Recomendado'],
                    highlights: ['Verificado', 'Alta Procura'],
                    lat: item.lat,
                    lon: item.lon,
                    image: ''
                };
            }));

            // Filter & Update State
            setState(prev => {
                const existing = new Set(prev.results.map(r => r.name + r.lat));
                const fresh = processed.filter(r => !existing.has(r.name + r.lat));

                if (context === 'NEARBY' || context === 'MANUAL_PLACE') {
                    fresh.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                }

                return {
                    ...prev,
                    results: append ? [...prev.results, ...fresh] : fresh,
                    isLoading: false,
                    isLoadingMore: false,
                    hasSearched: true,
                    lastTerm: finalQuery,
                    showModal: (!append && fresh.length > 0) || (append && prev.results.length > 0),
                    page: newPage
                };
            });

        } catch (err) {
            console.error("Agent Critical Error", err);
            setState(prev => ({ ...prev, isLoading: false, isLoadingMore: false }));
        }

    }, [state.userLocation, state.page, state.results]);

    const setSearchState = (updater: (prev: TravelAgentState) => TravelAgentState) => {
        setState(updater);
    };

    return {
        userLocation: state.userLocation,
        searchState: {
            results: state.results,
            isLoading: state.isLoading,
            hasSearched: state.hasSearched,
            isLoadingMore: state.isLoadingMore,
            showModal: state.showModal
        },
        detectUserLocation,
        search,
        setSearchState
    };
};
