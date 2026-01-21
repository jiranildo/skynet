import { useState, useRef, useEffect } from 'react';
import { useContextualPersona } from '@/hooks/useContextualPersona';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useSmartTravelAgent } from '@/pages/travel/hooks/useSmartTravelAgent';
import { RecommendationCard, Recommendation } from '@/pages/travel/components/RecommendationCard';
import { CATEGORIES, Category } from '@/pages/travel/components/CategorySelectionModal';

export default function FloatingMenu() {
  const persona = useContextualPersona();
  const [isOpen, setIsOpen] = useState(false);

  // Navigation State
  const [viewMode, setViewMode] = useState<'suggestions' | 'categories'>('suggestions');

  // AI Search State
  const [query, setQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  // State for Load More
  const [lastQuery, setLastQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Location Context
  const { userLocation, detectUserLocation } = useSmartTravelAgent();
  const [useLocation, setUseLocation] = useState(false);

  // Auto-detect location on first open if in travel mode or generally helpful
  useEffect(() => {
    if (isOpen && !userLocation.coords) {
      // Optional: auto-detect logic could go here
    }
  }, [isOpen]);

  // Typing effect
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
      }, 5);
      return () => clearInterval(interval);
    }
  }, [aiResponse]);

  // Reset state when persona (section) changes
  useEffect(() => {
    setQuery('');
    setAiResponse(null);
    setRecommendations([]);
    setDisplayedResponse('');
    setIsAiLoading(false);
    setViewMode('suggestions'); // Reset view mode
  }, [persona.type]);

  const handleToggleLocation = () => {
    const newState = !useLocation;
    setUseLocation(newState);
    if (newState && !userLocation?.coords) {
      detectUserLocation();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.isSpecial) {
      // Switch to category view inline
      setViewMode('categories');

      // Ensure location is ready/requested since this is a "Nearby" feature
      if (!useLocation) {
        handleToggleLocation();
      }
    } else if (suggestion.keywords) {
      // Construct a richer query using description and keywords if available
      const richQuery = `Quero recomendações sobre: "${suggestion.text}". ${suggestion.description || ''}. (Palavras-chave: ${suggestion.keywords.join(', ')}).`;
      handleSearch(richQuery);
    } else {
      handleSearch(suggestion.text);
    }
  };

  const handleCategorySelect = (category: Category) => {
    // Return to suggestions view but with results
    setViewMode('suggestions');

    const locationText = userLocation?.name ? ` em ${userLocation.name}` : '';
    const promptText = `Quero recomendações de ${category.label} (${category.description})${locationText}. Por favor, liste as melhores opções com detalhes.`;
    handleSearch(promptText);
  };

  const handleSearch = async (text: string = query) => {
    if (!text.trim()) return;

    // Auto-enable location logic similar to AISearchTab
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
    setLastQuery(text);
    setIsAiLoading(true);
    setAiResponse(null);
    setRecommendations([]);
    setDisplayedResponse('');
    // Ensure we are in suggestions view to see results
    setViewMode('suggestions');

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) throw new Error("VITE_GOOGLE_API_KEY not defined");

      const genAI = new GoogleGenerativeAI(apiKey);
      // Enable Google Search Tool for real-time data and images
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        // @ts-ignore - googleSearch is supported in v0.24+ but types might lag
        tools: [{ googleSearch: {} }]
      });

      // Strict Parity: Exact prompt structure from AISearchTab
      let locationContext = "";
      if (effectiveUseLocation && userLocation && userLocation.name) {
        // Exact string from AISearchTab
        locationContext = `CONTEXTO DE LOCALIZAÇÃO: O usuário está atualmente em ${userLocation.name}, ${userLocation.country}. Use essa informação para fornecer recomendações locais, distâncias e opções relevantes a essa área.`;
      }

      // Dynamic Prompt based on Persona but with Strict Guidelines
      const prompt = `
        ATUE COMO: "${persona.title}" - ${persona.role}.
        CONTEXTO ATUAL: O usuário está navegando na seção "${persona.type}" do aplicativo.
        
        SUA MISSÃO: Fornecer um resumo introdutório útil E uma lista estruturada de recomendações de viagem no formato JSON. (Estilo Concierge/Especialista).
        
        FILTRO OBRIGATÓRIO DE CONTEÚDO:
        1. Analise o pedido do usuário com rigor. Se ele pedir "hotéis", retorne APENAS recomendações com category: "hotel".
        2. Se pedir "voos" ou "passagens", retorne APENAS recomendações com category: "flight".
        3. Se pedir "restaurantes", retorne APENAS category: "general" com establishmentType de restaurante.
        4. NÃO misture categorias a menos que o usuário peça explicitamente um "roteiro completo", "planejamento de viagem" ou "dicas gerais".
        5. Se a pergunta for específica (ex: "hotéis baratos"), qualquer outro tipo de resposta (voo, passeio) será considerado ERRO.
        6. Para CIDADES, PAÍSES, REGIÕES, ILHAS ou PRAIAS: NUNCA retorne "openHours". OBRIGATÓRIO preencher "visitDuration" (Ex: "3 dias") e "bestVisitTime".
        
        IMPORTANTE SOBRE IMAGENS E LINKS:
        1. OBRIGATÓRIO: Use o GOOGLE SEARCH para encontrar URLs de imagens. Pesquise por "Nome do Local photos" ou "Nome do Local official site".
        2. Priorize imagens da WIKIPEDIA (upload.wikimedia.org), TRIPADVISOR ou sites oficiais.
        3. Tente encontrar ao menos UMA imagem para cada item.
        4. Se o link parecer uma imagem (.jpg, .png, .webp) e for de uma fonte pública, USE-O.
        5. Se realmente não encontrar nada, deixe vazio, mas ESFORCE-SE para achar.
        
        ${locationContext}

        PERGUNTA DO USUÁRIO: "${text}"

        FORMATO DE RESPOSTA OBRIGATÓRIO:
        Você deve retornar UM ÚNICO objeto JSON com a seguinte estrutura estrita:
        {
            "intro": "Um texto curto (max 3 parágrafos) introdutório de alto nível, estilo especialista, respondendo diretamente ao usuário com formatação Markdown.",
            "recommendations": [
            {
                "category": "Obrigatório: 'flight', 'hotel' ou 'general'",
                "icon": "Emoji representative",
                "name": "Nome",
                "description": "Descrição curta e atraente (2 linhas)",
                
                // Campos Universais
                "link": "URL of website/deal",
                "estimatedCost": "Preço (Ex: R$ 500 ou R$ 1.200/noite)",
                "reason": "Why this choice?",

                // NOVOS CAMPOS (OBRIGATÓRIOS PARA TODOS)
                "visitDuration": "OBRIGATÓRIO. Tempo exato ideal. Use rangos: '3-4 dias', '2 horas'. (NUNCA 'Variável')",
                "bestVisitTime": "OBRIGATÓRIO. Melhor mês/época. (Ex: 'Maio a Setembro').",
                "reservationStatus": "'required' | 'recommended' | 'not_needed' | 'unknown'",
                
                // Campos Específicos para 'flight'
                "airline": "Nome da Cia Aérea",
                "flightNumber": "Nº Voo (Ex: LA3042)",
                "departureTime": "Horário Saída (Ex: 08:30)",
                "arrivalTime": "Horário Chegada (Ex: 11:45)",
                "departureAirport": "Aeroporto Saída (Ex: GRU)",
                "arrivalAirport": "Aeroporto Chegada (Ex: GIG)",
                "duration": "Duração (Ex: 1h 15m)",
                "stops": "Ex: Direto, 1 parada",
                
                // Campos Específicos para 'hotel'
                "stars": 4, // Número de estrelas
                "amenities": ["Piscina", "Wi-Fi", "Academia"],
                "media": ["URL_IMAGEM_HOTEL"], // Importante: Imagem para o layout Trivago
                "address": "Endereço do hotel",
                "tripAdvisorRating": "Nota 0-5 (Ex: 4.5)",
                "bookingRating": "Nota 0-10 (Ex: 9.2)",

                // Campos Específicos para 'general' (Restaurantes, Pontos Turísticos)
                "googleRating": 4.8,
                "establishmentType": "Tipo (Ex: Restaurante Italiano)",
                "michelin": "Opcional. Ex: '3 Estrelas Michelin', 'Bib Gourmand'. Só preencher se tiver.",
                "openHours": "Horário func.",
                "menuLink": "Link do menu",
                "parking": "Info estacionamento",
                
                "tags": ["tag1", "tag2"],
                "highlights": ["highlight1"]
            }
            ]
        }

        Retorne apenas o JSON puro, sem blocos de código.
        `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      console.log("🤖 AI Raw Response:", textResponse); // Debug log

      try {
        const start = textResponse.indexOf('{');
        const end = textResponse.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonString = textResponse.substring(start, end + 1);
          const parsed = JSON.parse(jsonString);
          console.log("📦 Parsed Recommendations:", parsed); // Debug log
          setAiResponse(parsed.intro || "Aqui está o que encontrei:");
          setRecommendations(parsed.recommendations || []);
        } else {
          throw new Error("No JSON found");
        }
      } catch (e) {
        console.warn("JSON parse failed", e);
        // Fallback or explicit error if JSON is strictly required
        setAiResponse(textResponse);
        setRecommendations([]);
      }

    } catch (error: any) {
      console.error("AI Error:", error);

      // Strict Parity: Specific error messages
      let userMsg = `Desculpe, tive um problema ao processar sua solicitação. (${error.message || 'Erro desconhecido'})`;

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

  const handleLoadMore = async () => {
    if (!lastQuery || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        // @ts-ignore
        tools: [{ googleSearch: {} }]
      });

      // Strict Parity: Exact prompt structure from AISearchTab
      let locationContext = "";
      // @ts-ignore
      const effectiveUseLocation = useLocation; // Re-use logic or simplicity
      if (useLocation && userLocation && userLocation.name) {
        locationContext = `CONTEXTO DE LOCALIZAÇÃO: O usuário está atualmente em ${userLocation.name}, ${userLocation.country}. Use essa informação para fornecer recomendações locais, distâncias e opções relevantes a essa área.`;
      }

      const prompt = `
        ATUE COMO: "${persona.title}" - ${persona.role}.
        CONTEXTO: O usuário quer MAIS opções sobre a pesquisa anterior: "${lastQuery}".
        
        SUA MISSÃO: Fornecer 3 NOVAS recomendações que NÃO foram listadas ainda.
        
        IMPORTANTE:
        1. Mantenha o mesmo rigor de imagens REAIS e dados precisos.
        2. Retorne APENAS o JSON com o array "recommendations" (sem intro).
        3. Siga o mesmo schema JSON estrito anterior.
        
        FILTRO OBRIGATÓRIO DE CONTEÚDO:
        1. Siga as mesmas restrições da busca original (só hotéis se for hotel, etc).
        2. Para CIDADES, PAÍSES, REGIÕES, ILHAS ou PRAIAS: NUNCA retorne "openHours". OBRIGATÓRIO preencher "visitDuration" e "bestVisitTime".
        3. Para ATRAÇÕES (Museus, Parques): Priorize "visitDuration" (tempo de visita) ao invés de apenas "Aberto 24h".
        4. O campo "description" é OBRIGATÓRIO (resumo curto e atraente).

        ${locationContext}
        
        FORMATO DE RESPOSTA OBRIGATÓRIO:
         Você deve retornar UM ÚNICO objeto JSON com a seguinte estrutura estrita:
        {
            "recommendations": [
            {
                "category": "Obrigatório: 'flight', 'hotel' ou 'general'",
                "icon": "Emoji representative",
                "name": "Nome",
                "description": "Descrição curta e atraente (2 linhas)",
                
                // Campos Universais
                "link": "URL of website/deal",
                "estimatedCost": "Preço",
                "estimatedCost": "Preço",
                "reason": "Why?",
                "visitDuration": "OBRIGATÓRIO. Tempo exato ideal. Use rangos: '3-4 dias', '2 horas'.",
                "bestVisitTime": "OBRIGATÓRIO. Melhor mês/época. (Ex: 'Maio a Setembro').",
                "reservationStatus": "required|recommended|not_needed|unknown",
                "airline": "...",
                "flightNumber": "...",
                "departureTime": "...",
                "arrivalTime": "...",
                "departureAirport": "...",
                "arrivalAirport": "...",
                "duration": "...",
                "stops": "...",
                "stars": 4,
                "amenities": ["..."],
                "media": ["..."],
                "address": "...",
                "tripAdvisorRating": 4.5,
                "bookingRating": 9.2,
                "googleRating": 4.8,
                "establishmentType": "...",
                "michelin": "Opcional. Ex: '3 Estrelas Michelin', 'Bib Gourmand'. Só preencher se tiver.",
                "openHours": "...",
                "menuLink": "...",
                "parking": "...",
                "tags": ["..."],
                "highlights": ["..."]
            }
            ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      try {
        const start = textResponse.indexOf('{');
        const end = textResponse.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonString = textResponse.substring(start, end + 1);
          const parsed = JSON.parse(jsonString);
          if (parsed.recommendations && parsed.recommendations.length > 0) {
            setRecommendations(prev => [...prev, ...parsed.recommendations]);
          }
        }
      } catch (e) {
        console.error("Error parsing load more JSON", e);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-44 right-5 md:right-6 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col transition-all duration-300 ${recommendations.length > 0 || isAiLoading ? 'w-[90vw] md:w-[600px] h-[80vh]' : 'w-[90vw] md:w-96'}`}
          >
            {/* Header */}
            <div className={`p-5 bg-gradient-to-r ${persona.gradient} text-white relative shrink-0`}>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <i className={`${persona.icon} text-2xl`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{persona.title}</h3>
                  <p className="text-xs font-medium opacity-90 uppercase tracking-wide">{persona.role}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>

              {!aiResponse && !isAiLoading && (
                <p className="text-sm font-medium leading-relaxed relative z-10 opacity-95 mt-3">
                  "{persona.greeting}"
                </p>
              )}
            </div>

            {/* Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">

              {/* Initial State: Suggestions OR Categories */}
              {!aiResponse && !isAiLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {viewMode === 'categories' ? 'Selecione uma categoria' : 'Sugestões do Especialista'}
                    </p>
                    {viewMode === 'categories' && (
                      <button
                        onClick={() => setViewMode('suggestions')}
                        className="text-[10px] items-center gap-1 flex text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <i className="ri-arrow-left-line"></i> Voltar
                      </button>
                    )}
                  </div>

                  {viewMode === 'suggestions' ? (
                    /* Standard Suggestions Carousel */
                    <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {persona.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex-none w-40 snap-start flex flex-col items-start p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group text-left h-32"
                        >
                          <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center transition-colors ${suggestion.icon.includes('map-pin') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                            <i className={`${suggestion.icon} text-lg`}></i>
                          </div>
                          <span className="font-semibold text-xs text-gray-800 leading-tight mb-1 group-hover:text-indigo-700 block">
                            {suggestion.text}
                          </span>
                          {suggestion.description && (
                            <span className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                              {suggestion.description}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* In-Menu Categories Carousel */
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-center group bg-white"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                            <i className={category.icon}></i>
                          </div>
                          <span className="font-bold text-xs text-gray-900 group-hover:text-blue-700">
                            {category.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isAiLoading && (
                <div className="space-y-4 p-4">
                  <div className="flex items-center gap-3 text-gray-500 animate-pulse">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <span>Consultando especialistas...</span>
                  </div>
                  <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              )}

              {/* Response State */}
              {aiResponse && (
                <div className="animate-fadeIn pb-4">
                  {/* Text Response */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 prose prose-sm max-w-none text-gray-700">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {displayedResponse}
                      {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-blink"></span>}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Recomendações</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="h-full">
                            <RecommendationCard
                              data={rec}
                              onSave={() => console.log('Save', rec.name)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div className="mt-6 mb-2">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-70 group"
                      >
                        {isLoadingMore ? (
                          <>
                            <i className="ri-loader-4-line animate-spin text-indigo-500"></i>
                            <span className="text-gray-500">Buscando mais opções...</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-add-circle-line text-indigo-500 group-hover:scale-110 transition-transform"></i>
                            <span>Carregar Mais Opções</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {!isTyping && (
                    <div className="h-4"></div> /* Spacer instead of button */
                  )}
                </div>
              )}
            </div>

            {/* Input Area (Fixed at bottom) */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder={useLocation && userLocation?.name ? `Pergunte algo sobre ${userLocation.name} ao ${persona.role}...` : `Pergunte ao ${persona.role}...`}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-32 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all resize-none h-20 scrollbar-hide"
                />

                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  {/* Nova Consulta (Reset) Button - Only show if there is a response */}
                  {aiResponse && (
                    <button
                      onClick={() => { setAiResponse(null); setRecommendations([]); setQuery(''); setDisplayedResponse(''); }}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                      title="Nova Consulta"
                    >
                      <i className="ri-restart-line text-lg"></i>
                    </button>
                  )}

                  <button
                    onClick={handleToggleLocation}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${useLocation ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                    title="Usar minha localização"
                  >
                    <i className={`${useLocation ? 'ri-map-pin-fill' : 'ri-map-pin-line'}`}></i>
                  </button>
                  <button
                    onClick={() => handleSearch()}
                    disabled={isAiLoading || !query.trim()}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${persona.gradient} text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isAiLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-fill"></i>}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r ${persona.gradient} text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center group`}
      >
        {!isOpen && (
          <span className={`absolute inset-0 rounded-full bg-gradient-to-r ${persona.gradient} animate-ping opacity-75`}></span>
        )}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <i className={`${persona.icon} text-3xl drop-shadow-md group-hover:rotate-12 transition-transform duration-300 relative z-10`}></i>
      </button>
    </>
  );
}
