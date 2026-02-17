import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useSmartTravelAgent } from '../hooks/useSmartTravelAgent';
import { RecommendationCard, Recommendation } from './RecommendationCard';
import { CategorySelectionModal, Category } from './CategorySelectionModal';

export default function AISearchTab() {
    const [query, setQuery] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedResponse, setDisplayedResponse] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // State to control if location should be used
    const [useLocation, setUseLocation] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const responseRef = useRef<HTMLDivElement>(null);

    // Use the smart travel agent hook to get location
    const { userLocation, detectUserLocation } = useSmartTravelAgent();

    const handleToggleLocation = () => {
        const newState = !useLocation;
        setUseLocation(newState);

        // If turning on and we don't have location yet, try to detect it
        if (newState && !userLocation?.coords) {
            detectUserLocation();
        }
    };

    const suggestions = [
        {
            icon: 'ri-map-pin-user-line',
            text: 'Locais Próximos e Região',
            description: "Descubra destinos perto de você",
            keywords: ["nearby", "close", "region", "weekend"],
            isSpecial: true
        },
        {
            icon: 'ri-hearts-line',
            text: 'Viagens Românticas',
            description: "Destinos perfeitos para casais",
            keywords: ["romantic", "couple", "honeymoon"]
        },
        {
            icon: 'ri-magic-line',
            text: 'Walt Disney World',
            description: "Magia e diversão nos parques Disney",
            keywords: ["disney", "orlando", "theme parks"]
        },
        {
            icon: 'ri-flag-line',
            text: 'Explore seu País',
            description: "Conheça os tesouros do Brasil",
            keywords: ["brazil", "nacional", "domestic"]
        },
        {
            icon: 'ri-run-line',
            text: 'Aventura Extrema',
            description: "Para quem busca adrenalina",
            keywords: ["adventure", "extreme", "hiking"]
        },
        {
            icon: 'ri-sun-line',
            text: 'Praias Paradisíacas',
            description: "Águas cristalinas e areia branca",
            keywords: ["beach", "paradise", "tropical"]
        },
        {
            icon: 'ri-museum-line',
            text: 'Roteiro Cultural',
            description: "História, arte e museus",
            keywords: ["culture", "history", "museums"]
        },
        {
            icon: 'ri-restaurant-line',
            text: 'Experiência Gastronômica',
            description: "Para os amantes da boa comida",
            keywords: ["food", "gastronomy", "culinary"]
        },
        {
            icon: 'ri-money-dollar-circle-line',
            text: 'Viagem Econômica',
            description: "Destinos incríveis gastando pouco",
            keywords: ["budget", "cheap", "affordable"]
        },
        {
            icon: 'ri-vip-diamond-line',
            text: 'Experiência Luxuosa',
            description: "O melhor que o dinheiro pode comprar",
            keywords: ["luxury", "premium", "exclusive"]
        },
        {
            icon: 'ri-parent-line',
            text: 'Viagem em Família',
            description: "Diversão para todas as idades",
            keywords: ["family", "kids", "children"]
        },
        {
            icon: 'ri-gift-2-line',
            text: 'Melhores Locais para Viajar no Natal',
            description: "Destinos mágicos para o Natal",
            keywords: ["christmas", "natal", "december", "winter"]
        },
        {
            icon: 'ri-fire-line',
            text: 'Melhores Locais para Viajar no Ano Novo',
            description: "Celebre a virada do ano",
            keywords: ["new year", "ano novo", "celebration", "fireworks"]
        },
        {
            icon: 'ri-ship-line',
            text: 'Melhores Cruzeiros',
            description: "Experiências incríveis no mar",
            keywords: ["cruise", "cruzeiro", "ship", "ocean"]
        },
        {
            icon: 'ri-calendar-event-line',
            text: 'Melhores Destinos por Mês',
            description: "Onde ir em cada época do ano",
            keywords: ["monthly", "calendar", "when to go", "best time"]
        },
        {
            icon: 'ri-goblet-line',
            text: 'Datas Festivas Mais Famosas',
            description: "Festas e eventos pelo mundo",
            keywords: ["festival", "celebration", "events", "parties"]
        },
    ];

    const handleSuggestionClick = (suggestion: any) => {
        if (suggestion.isSpecial) {
            // Open modal for specific category selection
            setIsCategoryModalOpen(true);
            // Ensure location is ready/requested since this is a "Nearby" feature
            if (!useLocation) {
                handleToggleLocation();
            }
        } else {
            // Construct a richer query using description and keywords
            const richQuery = `Quero recomendações sobre: "${suggestion.text}". ${suggestion.description}. (Palavras-chave: ${suggestion.keywords?.join(', ')}).`;
            handleSearch(richQuery);
        }
    };

    const handleCategorySelect = (category: Category) => {
        setIsCategoryModalOpen(false);
        const locationText = userLocation?.name ? ` em ${userLocation.name}` : '';
        const promptText = `Quero recomendações de ${category.label} (${category.description})${locationText}. Por favor, liste as melhores opções com detalhes.`;
        handleSearch(promptText);
    }

    const handleSearch = async (text: string = query) => {
        if (!text.trim()) return;

        // Auto-enable location for proximity keywords
        const lowerText = text.toLowerCase();
        const locationKeywords = ['perto', 'próximo', 'proximo', 'onde estou', 'aqui', 'ao meu redor', 'nesta cidade', 'nesse local', 'região'];
        let effectiveUseLocation = useLocation;

        if (locationKeywords.some(keyword => lowerText.includes(keyword))) {
            if (!useLocation) {
                setUseLocation(true);
                effectiveUseLocation = true;
                if (!userLocation?.coords) {
                    detectUserLocation();
                }
            }
        }

        setQuery(text);
        setIsAiLoading(true);
        setAiResponse(null);
        setRecommendations([]);
        setDisplayedResponse('');

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

            if (!apiKey) {
                throw new Error("VITE_GOOGLE_API_KEY is not defined in .env");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Detect if this is a follow-up query for "more"
            const moreKeywords = ['mais', 'more', 'outros', 'outras', 'outra', 'continua', 'prossiga', 'além disso', 'mais informações'];
            const isFollowUp = moreKeywords.some(keyword => lowerText.includes(keyword)) && searchHistory.length > 0;

            // Construct a prompt that includes location context ONLY if enabled (or auto-enabled)
            let locationContext = "";
            if (effectiveUseLocation && userLocation && userLocation.name) {
                locationContext = `CONTEXTO DE LOCALIZAÇÃO: O usuário está atualmente em ${userLocation.name}, ${userLocation.country}. Use essa informação para fornecer recomendações locais EXTREMAMENTE específicas, incluindo EXATAMENTE onde ficam (bairro, rua ou área de referência).`;
            }

            // Construct history context to avoid repeats
            const historyContext = isFollowUp && searchHistory.length > 0
                ? `HISTÓRICO DE RESULTADOS JÁ MOSTRADOS: [${searchHistory.join(', ')}]. VOCÊ NÃO PODE REPETIR NENHUM DESSES RESULTADOS. Traga apenas novas opções diferentes das que já foram mostradas.`
                : "";

            const prompt = `
            ATUE COMO: "SARA" - O Agente de Viagens Pessoal Definitivo (Travel Concierge AI).
            
            SUA PERSONALIDADE: Seja ASSERTIVA, DIRETA e MANTENHA O FOCO NO QUE O USUÁRIO PEDIU. Não seja prolixa.
            
            SUA MISSÃO: Fornecer um resumo introdutório útil E uma lista estruturada de recomendações de viagem no formato JSON.
            
            ${locationContext}
            ${historyContext}

            PERGUNTA DO USUÁRIO: "${text}"

            DIRETRIZES TÉCNICAS:
            1. Se o usuário pedir "mais" ou continuar uma pesquisa, IGNORE os locais já mencionados: ${searchHistory.length > 0 ? searchHistory.join(', ') : 'nenhum'}.
            2. Cada recomendação DEVE conter um endereço ou localização específica no campo "address".
            3. Seja extremamente assertiva na escolha dos locais.

            FORMATO DE RESPOSTA OBRIGATÓRIO (JSON PURO):
            {
                "intro": "Resuma a resposta de forma direta e assertiva.",
                "recommendations": [
                {
                    "icon": "Emoji",
                    "name": "Nome",
                    "address": "Localização Exata (Rua, Bairro ou Ponto de Referência)",
                    "description": "Descrição curta (2 linhas)",
                    "reason": "Por que é assertivo para este pedido",
                    "bestTime": "Melhor época",
                    "estimatedCost": "Custo",
                    "duration": "Duração sugerida",
                    "tags": ["tag1", "tag2"],
                    "highlights": ["Destaque 1", "Destaque 2"]
                }
                ]
            }

            Retorne apenas o JSON.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();

            try {
                // Robust JSON extraction
                const start = textResponse.indexOf('{');
                const end = textResponse.lastIndexOf('}');

                if (start !== -1 && end !== -1) {
                    const jsonString = textResponse.substring(start, end + 1);
                    const parsed = JSON.parse(jsonString);
                    setAiResponse(parsed.intro || "Aqui estão minhas novas recomendações:");

                    const newRecs = parsed.recommendations || [];
                    setRecommendations(newRecs);

                    // Update history with new names to avoid repeats next time
                    if (newRecs.length > 0) {
                        const newNames = newRecs.map((r: any) => r.name);
                        setSearchHistory(prev => [...prev, ...newNames]);
                    }
                } else {
                    // Fallback for non-JSON responses
                    throw new Error("No JSON found");
                }
            } catch (e) {
                console.warn("Failed to parse JSON, falling back to text", e);
                setAiResponse(textResponse);
                setRecommendations([]);
            }

        } catch (error: any) {
            console.error("AI Error Detailed:", error);
            let userMsg = `**Erro na IA:** ${error.message || JSON.stringify(error)}`;

            if (error.message?.includes('404')) {
                userMsg = "O modelo de IA não está disponível ou a chave de API é inválida.";
            } else if (error.message?.includes('403')) {
                userMsg = "A chave de API foi rejeitada (Error 403). Verifique se é válida.";
            }

            setAiResponse(userMsg);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Typing effect for the response
    useEffect(() => {
        if (aiResponse) {
            setIsTyping(true);
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedResponse(aiResponse.slice(0, i + 1));
                i++;
                if (i > aiResponse.length) {
                    clearInterval(interval);
                    setIsTyping(false);
                }
            }, 5); // Typing speed
            return () => clearInterval(interval);
        }
    }, [aiResponse]);

    return (
        <div className="min-h-screen bg-white">
            <CategorySelectionModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSelectCategory={handleCategorySelect}
            />

            <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">

                {/* Header / Hero */}
                {!aiResponse && !isAiLoading && (
                    <div className="text-center mb-12 animate-fadeIn">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="font-bold text-gray-900">Modo IA</span>
                            <span className="text-gray-500 text-sm">SARA Travel Agent</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 tracking-tight">
                            Seu Concierge de Viagens
                        </h1>
                        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
                            {useLocation && userLocation && userLocation.name ?
                                `Considerando sua localização em ${userLocation.name}.` :
                                "Planejamento completo, dicas locais e itinerários personalizados."}
                        </p>
                    </div>
                )}

                {/* Input Area */}
                <div className={`transition-all duration-500 ${aiResponse || isAiLoading ? 'mb-8' : 'mb-12'}`}>
                    <div className="relative group max-w-4xl mx-auto">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
                        <div className="relative flex items-start bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all shadow-sm hover:shadow-md">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSearch();
                                    }
                                }}
                                placeholder={useLocation && userLocation?.name ? `Pergunte algo sobre ${userLocation.name}...` : "Ex: Roteiro romântico de 10 dias na Itália com orçamento médio..."}
                                className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[60px] md:min-h-[80px] text-lg resize-none text-gray-800 placeholder-gray-400"
                                style={{ borderRadius: '1rem', paddingRight: '120px' }}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                {/* Clear Button */}
                                {query && (
                                    <button
                                        onClick={() => {
                                            setQuery('');
                                            setAiResponse(null);
                                            setRecommendations([]);
                                            setDisplayedResponse('');
                                            setSearchHistory([]);
                                        }}
                                        className="p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all duration-300"
                                        title="Limpar pesquisa"
                                    >
                                        <i className="ri-close-line text-xl"></i>
                                    </button>
                                )}

                                {/* Location Toggle Button */}
                                <button
                                    onClick={handleToggleLocation}
                                    className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${useLocation
                                        ? 'bg-blue-100 text-blue-600 shadow-sm'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                    title={useLocation ? "Localização Ativada" : "Usar minha localização"}
                                >
                                    <i className={`${useLocation ? 'ri-map-pin-fill' : 'ri-map-pin-line'} text-xl`}></i>
                                </button>

                                {/* Send Button */}
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={!query.trim() || isAiLoading}
                                    className={`p-2 rounded-full transition-all duration-300 ${query.trim() ? 'bg-blue-600 text-white shadow-lg transform scale-100' : 'bg-gray-200 text-gray-400 scale-90'}`}
                                >
                                    {isAiLoading ? (
                                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                                    ) : (
                                        <i className="ri-arrow-right-line text-xl"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Helper Text for Location Status */}
                    {useLocation && !userLocation?.name && (
                        <p className="text-xs text-blue-500 mt-2 ml-2 animate-pulse text-center">
                            <i className="ri-loader-2-line animate-spin mr-1"></i> Detectando sua localização...
                        </p>
                    )}
                </div>

                {/* Suggestions Carousel */}
                {!aiResponse && !isAiLoading && (
                    <div className="relative group/carousel max-w-6xl mx-auto animate-slideUp">
                        <div
                            className="flex overflow-x-auto gap-4 pb-6 px-2 snap-x snap-mandatory no-scrollbar"
                            style={{
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="relative flex-none w-[150px] md:w-[180px] snap-start bg-white p-2.5 text-left rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300 group flex flex-col items-start gap-2 h-auto"
                                >
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 ${suggestion.isSpecial ? 'bg-blue-100 text-blue-600 shadow-blue-100/50' : 'bg-gray-50 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'} shadow-sm group-hover:scale-110`}>
                                        <i className={`${suggestion.icon} text-sm`}></i>
                                    </div>
                                    <div className="w-full pr-1">
                                        <span className={`block font-bold text-xs mb-0.5 leading-tight ${suggestion.isSpecial ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'}`}>
                                            {suggestion.text}
                                        </span>
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-light line-clamp-2">
                                            {suggestion.description}
                                        </p>
                                    </div>

                                    {/* Indicator that it's clickable/swipable - Absolute positioned to save height */}
                                    <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="ri-arrow-right-line text-blue-400 text-xs"></i>
                                    </div>
                                </button>
                            ))}

                            {/* Spacer for end of list */}
                            <div className="flex-none w-4"></div>
                        </div>

                        {/* Fade gradients for scroll indication - optional but nice */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none md:hidden"></div>
                        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
                    </div>
                )}

                {/* Loading Skeleton */}
                {isAiLoading && !aiResponse && (
                    <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
                            <div className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* AI Response Area */}
                {aiResponse && (
                    <div className="animate-fadeIn" ref={responseRef}>
                        <div className="bg-white rounded-none md:rounded-2xl md:p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <i className="ri-sparkling-fill text-white text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Resposta da SARA</h3>
                                    <p className="text-xs text-gray-500">
                                        Baseado em IA Google Gemini {useLocation && userLocation?.name && `• 📍 ${userLocation.name}`}
                                    </p>
                                </div>
                            </div>

                            <div className="prose prose-lg prose-blue max-w-none mb-10">
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-light text-lg">
                                    {displayedResponse}
                                    {isTyping && <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-blink"></span>}
                                </div>
                            </div>

                            {/* Recommendations Grid */}
                            {recommendations.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 animate-slideUp">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="h-full">
                                            <RecommendationCard
                                                data={rec}
                                                onSelect={() => console.log('Selected', rec.name)}
                                                onSave={() => console.log('Saved', rec.name)}
                                                onView={() => console.log('Viewed', rec.name)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isTyping && (
                                <div className="flex gap-3 mt-12 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            const followUpText = `Me traga mais opções assertivas, diferentes das anteriores.`;
                                            setQuery(followUpText);
                                            handleSearch(followUpText);
                                        }}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                    >
                                        <i className="ri-add-circle-line"></i>
                                        Trazer mais informações
                                    </button>
                                    <button onClick={() => { setAiResponse(null); setRecommendations([]); setQuery(''); setSearchHistory([]); }} className="text-sm text-gray-400 hover:text-gray-600 ml-auto">
                                        Nova Pesquisa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
