import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { getTrips, Trip, ensureUserProfile, User as UserProfile, addTripFavorite, updateTrip, cellarService } from '@/services/supabase';
import { useContextualPersona } from '@/hooks/useContextualPersona';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useSmartTravelAgent } from '@/pages/travel/hooks/useSmartTravelAgent';
import { RecommendationCard, Recommendation } from '@/pages/travel/components/RecommendationCard';
import { CATEGORIES, Category } from '@/pages/travel/components/CategorySelectionModal';
import CheckInModal from './CheckInModal';
import { useNavigate } from 'react-router-dom';

export default function FloatingMenu() {
  const persona = useContextualPersona();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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

  // Wine Location Options State
  const [showWineLocationOptions, setShowWineLocationOptions] = useState(false);

  // Location Context
  const { userLocation, detectUserLocation, locationStatus } = useSmartTravelAgent();
  const [useLocation, setUseLocation] = useState(false);

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const wasListeningRef = useRef(false); // To track if we just finished a voice session

  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [showCheckIn, setShowCheckIn] = useState(false);

  // Contextual Search Prompt State
  const [showContextPrompt, setShowContextPrompt] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<{ label: string; prompt: string } | null>(null);
  const [waitingForTripSelection, setWaitingForTripSelection] = useState(false);

  // Rich Data State
  const [searchResultData, setSearchResultData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'tudo' | 'noticias' | 'turismo' | 'videos'>('tudo');

  // Effect to trigger search when trip is selected IF waiting
  // Effect to trigger search when trip is selected IF waiting
  useEffect(() => {
    if (selectedTrip && pendingSearch && waitingForTripSelection) {
      // Don't auto-search to allow dashboard to open
      // handleSearch(pendingSearch.prompt, false, selectedTrip);
      setWaitingForTripSelection(false);
      // setPendingSearch(null); // Keep pending context if needed? Or clear it? 
      // Clearing it is safer to rely on manual action from dashboard
      setPendingSearch(null);
    }
  }, [selectedTrip]);

  const handleSearchOptionClick = (label: string, prompt: string) => {
    if (label === 'Check-In') {
      setShowCheckIn(true);
      setIsOpen(false);
      return;
    }
    if (selectedTrip) {
      handleSearch(prompt, false, selectedTrip);
    } else {
      setPendingSearch({ label, prompt });
      setShowContextPrompt(true);
    }
  };

  const handleContextDecision = (linkToTrip: boolean) => {
    setShowContextPrompt(false);
    if (!pendingSearch) return;

    if (linkToTrip) {
      setWaitingForTripSelection(true);
    } else {
      const genericPrompt = `O usuário quer pesquisar sobre ${pendingSearch.label}, mas NÃO selecionou uma viagem específica.
       Diga: "Certo, vamos pesquisar sobre ${pendingSearch.label}. Para onde você gostaria de ir e quais são suas preferências?"
       Seja proativo e pergunte os detalhes necessários (datas, número de pessoas, etc) para fazer uma busca de ${pendingSearch.label}.`;
      handleSearch(genericPrompt, false, null);
      setPendingSearch(null);
    }
  };
  const [schedulingRecommendation, setSchedulingRecommendation] = useState<Recommendation | null>(null);
  const [scheduleData, setScheduleData] = useState<{ dayIndex: number; time: string }>({ dayIndex: 0, time: '12:00' });

  // Load User Profile for SARA Config
  useEffect(() => {
    if (authUser) {
      ensureUserProfile().then(profile => {
        if (profile) setUserProfile(profile);
      });
      // Fetch user trips for travel context
      getTrips(authUser.id).then(trips => {
        if (trips) setUserTrips(trips);
      });
    }
  }, [authUser]);

  // Auto-detect location on first open if in travel mode or generally helpful
  useEffect(() => {
    if (isOpen && !userLocation.coords) {
      // Optional: auto-detect logic could go here
    }
    if (!isOpen) {
      window.speechSynthesis.cancel();
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
    setShowWineLocationOptions(false); // Reset options
    setSearchResultData(null);
    setActiveTab('tudo');
    window.speechSynthesis.cancel(); // Stop talking on nav change
    // Don't reset selectedTrip automatically if switching sections, 
    // but maybe we should if moving AWAY from travel
    if (persona.type !== 'travel') {
      setSelectedTrip(null);
    }
  }, [persona.type]);

  const handleToggleLocation = () => {
    const newState = !useLocation;
    setUseLocation(newState);
    if (newState && !userLocation?.coords) {
      detectUserLocation();
    }
  };

  // Text to Speech Function
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0;

    // Try to find preferred voice first (from config), then fallback
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;

    // 1. User selected voice
    if (userProfile?.sara_config?.voice_uri) {
      preferredVoice = voices.find(v => v.voiceURI === userProfile.sara_config?.voice_uri);
    }

    // 2. Fallback to nice female voices
    if (!preferredVoice) {
      preferredVoice = voices.find(voice =>
        voice.lang.includes('pt-BR') &&
        (voice.name.includes('Google') || voice.name.includes('Luciana') || voice.name.includes('Joana'))
      );
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Voice Interaction Logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    setIsListening(true);
    wasListeningRef.current = true;

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setIsOpen(true); // Force open
        handleSearch(transcript, true);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // wasListeningRef stays true briefly to prevent click handler
      setTimeout(() => {
        wasListeningRef.current = false;
      }, 500);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handlePressStart = (e: any) => {
    // Prevent default context menu on long press
    // e.preventDefault(); 
    wasListeningRef.current = false;
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null; // Mark as fired
      startListening();
    }, 500); // 500ms hold to start listening
  };

  const handlePressEnd = (e: any) => {
    if (pressTimer.current) {
      // Timer didn't fire, so it was a short click
      clearTimeout(pressTimer.current);
      pressTimer.current = null;

      if (isListening) {
        // User clicked again while listening -> stop mic and open screen
        stopListening();
        setIsOpen(true);
      } else {
        // Normal short click to toggle the screen
        setIsOpen(!isOpen);
      }
    } else {
      // The timer already fired (it was a long press). User is now releasing their finger.
      // Do nothing, let it keep listening.
    }
  };

  const handlePressCancel = (e: any) => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      window.speechSynthesis.cancel();
    };
  }, []);


  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.id === 'wine-location-choice') {
      // Special Wine Flow
      if (!useLocation) handleToggleLocation(); // Ensure location is on
      setAiResponse("Ótima ideia! Para ser mais precisa: você procura **locais para comprar vinho** (adegas, lojas) aqui perto, ou quer recomendações dos **melhores rótulos produzidos nesta região**?");
      setShowWineLocationOptions(true); // Trigger UI change
      // Auto-speech disabled as per user request (only speak when voice button is used)
      // if (userProfile?.sara_config?.voice_enabled !== false) {
      //   speakResponse("Você procura locais para comprar ou prefere conhecer os vinhos típicos produzidos nesta região?");
      // }
      return;
    }

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

  const resolveWineOption = (type: 'shops' | 'wines') => {
    setShowWineLocationOptions(false);

    const fullLocationString = [
      userLocation?.name,
      userLocation?.city,
      userLocation?.state,
      userLocation?.country
    ].filter(Boolean).join(', ');

    const locName = fullLocationString || "minha localização atual";

    if (type === 'shops') {
      handleSearch(`Encontre adegas, lojas de vinho especializadas e wine bars próximos a ${locName}. Liste as melhores opções com avaliações e distância.`);
    } else {
      handleSearch(`Quais são os vinhos mais famosos e premiados produzidos na região de ${locName} (ou no país/estado se a cidade não for produtora)? Liste rótulos típicos.`);
    }
  };

  const handleCategorySelect = (category: Category) => {
    // Return to suggestions view but with results
    setViewMode('suggestions');

    const fullLocationString = [
      userLocation?.name,
      userLocation?.city,
      userLocation?.state,
      userLocation?.country
    ].filter(Boolean).join(', ');

    const locationText = fullLocationString ? ` em ${fullLocationString}` : '';
    const promptText = `Quero recomendações de ${category.label} (${category.description})${locationText}. Por favor, liste as melhores opções com detalhes.`;
    handleSearch(promptText);
  };

  const handleSearch = async (text: string = query, isVoiceTriggered: boolean = false, tripOverride?: Trip) => {
    if (!text.trim()) return;

    setShowWineLocationOptions(false); // Close options if manual search starts

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

      // Conditionally add Google Search Tool for queries that need real-time data
      // This keeps general queries fast while allowing weather/news to work
      const needsRealTimeData = ['clima', 'tempo', 'notícia', 'moeda', 'cotação', 'horário', 'hoje', 'agora', 'resumo', 'turismo', 'passeio', 'região'].some(k => lowerText.includes(k));
      const modelConfig: any = {
        model: "gemini-2.0-flash"
      };

      if (needsRealTimeData) {
        modelConfig.tools = [{ googleSearch: {} }];
      }

      const model = genAI.getGenerativeModel(modelConfig);

      // Strict Parity: Exact prompt structure from AISearchTab
      let locationContext = "";
      if (effectiveUseLocation && userLocation && (userLocation.name || userLocation.city)) {
        const fullLocationString = [
          userLocation.name,
          userLocation.city,
          userLocation.state,
          userLocation.country
        ].filter(Boolean).join(', ');

        // Exact string from AISearchTab
        locationContext = `CONTEXTO DE LOCALIZAÇÃO: O usuário está atualmente em ${fullLocationString}. Use essa informação para fornecer recomendações locais, distâncias e opções relevantes a essa área.`;
      }

      // Dynamic Prompt based on Persona but with Strict Guidelines
      let tripContext = "";
      const currentTrip = tripOverride || selectedTrip;
      if (persona.type === 'travel' && currentTrip) {
        tripContext = `
        CONTEXTO DA VIAGEM SELECIONADA:
        - Destino: ${currentTrip.destination}
        - Título: ${currentTrip.title}
        - Datas: ${currentTrip.start_date} até ${currentTrip.end_date}
        - Tipo: ${currentTrip.trip_type}
        - Orçamento: ${currentTrip.budget}
        - Viajantes: ${currentTrip.travelers}
        - Status: ${currentTrip.status}
        - Planejamento Atual: ${JSON.stringify(currentTrip.itinerary || [])}
        
        Sua missão é ajudar o usuário com ESTA viagem. Analise o que falta (Voos? Hotel? Roteiro detalhado?) e seja proativo em sugerir.
        `;
      } else if (persona.type === 'travel' && userTrips.length > 0) {
        tripContext = `
        O usuário tem as seguintes viagens registradas: ${userTrips.map(t => t.destination).join(', ')}.
        Se a pergunta for genérica, você pode perguntar sobre qual dessas viagens ele gostaria de falar ou sugerir algo novo.
        `;
      }

      const prompt = `
        ATUE COMO: "${persona.title}" - ${persona.role}.
        CONTEXTO ATUAL: O usuário está navegando na seção "${persona.type}" do aplicativo.

        ${tripContext}

        SUA MISSÃO: Responder a QUALQUER pergunta do usuário.
        1. Se for sobre viagens/turismo/vinhos: Forneça um resumo útil E uma lista estruturada de recomendações no formato JSON.
        2. Se o usuário pedir o RESUMO DO DIA, Clima, Notícias, Turismo na Região, Horário ou Cotação: USE SUA FERRAMENTA DE BUSCA para trazer dados REAIS e ATUAIS (ex: temperatura exata agora, notícias locais de hoje, dicas de turismo na região). Responda de forma rica e completa no campo "intro" com markdown (negrito, listas, etc) para a tela, e gere uma versão agradável para áudio. Retorne uma lista vazia "[]" em "recommendations" se não houver locais físicos específicos para mapear.
        3. Se NÃO for sobre viagens nem resumo (ex: "Conte uma piada"): Responda de forma útil e simpática no campo "intro". Retorne uma lista vazia "[]".

        INSTRUÇÃO ESPECIAL DE ÁUDIO E TELA: O campo "intro" será A) exibido na tela formatado em Markdown e B) LIDO em voz alta para o usuário. Organize bem a informação com quebras de linha claras.

        IMPORTANTE SOBRE NOTÍCIAS LOCAIS E TURISMO:
        1. Sempre busque notícias EXCLUSIVA E DIRETAMENTE sobre a cidade atual do usuário PRIMEIRO. Apenas se não houver cobertura local, expanda a busca para a região.
        2. Tente ao máximo preencher pelo menos 10 itens tanto para a seção de notícias quanto para a seção de turismo.

        ${locationContext}

        PERGUNTA DO USUÁRIO: "${text}"

        FORMATO DE RESPOSTA OBRIGATÓRIO:
        Você deve retornar UM ÚNICO objeto JSON com a seguinte estrutura estrita:
        {
          "intro": "Texto conversacional para ser lido em voz alta (TTS). Se a pergunta for geral, responda aqui.",
          "weather": { // OPTIONAL, Apenas se o usuário pedir clima/tempo
            "temperature": "Ex: 29",
            "condition": "Ex: Tempestades esparsas",
            "chanceOfRain": "45%",
            "humidity": "72%",
            "wind": "11 km/h",
            "forecast": [
               { "day": "sex.", "max": "29", "min": "19", "icon": "rain" },
               { "day": "sáb.", "max": "30", "min": "19", "icon": "sun" }
            ]
          },
          "news": [ // OPTIONAL, Apenas se o usuário pedir notícias locais (mínimo 10 itens desejado). OBRIGATÓRIO priorizar a cidade exata do usuário.
            { "title": "Título da notícia", "source": "Fonte", "date": "Data", "url": "Link para leitura" }
          ],
          "tourism": [ // OPTIONAL, Apenas se o usuário perguntar sobre turismo local, região, passeios ou cidades próximas (mínimo 10 itens desejado)
            { "title": "Nome do local ou atração", "source": "Localização/Cidade", "date": "Informação (ex: Preço/Horário)", "url": "Link útil" }
          ],
          "videos": [ // OPTIONAL, Apenas se o usuário pedir vídeos ou for muito relevante
            { "title": "Título do vídeo", "url": "URL do vídeo", "thumbnail": "URL da thumb" }
          ],
        "recommendations": [
        {
          "category": "flight|hotel|general|wine",
        "icon": "Emoji",
        "name": "Nome",
        "description": "Descrição curta e atraente",
        "link": "URL",
        "estimatedCost": "Preço",
        "reason": "Why?",
        "visitDuration": "Tempo (Ex: 3 dias)",
        "bestVisitTime": "Melhor época",
        "reservationStatus": "required|recommended|not_needed",
        // Specific fields as defined previously...
        "airline": "...", "flightNumber": "...", "departureTime": "...", "arrivalTime": "...", "departureAirport": "...", "arrivalAirport": "...", "duration": "...", "stops": "...",
        "stars": 4, "amenities": ["..."], "media": ["..."], "address": "Obrigatório: POI, Endereço completo, Cidade, Estado, País", "tripAdvisorRating": 4.5, "bookingRating": 9.2,
        "googleRating": 4.8, "establishmentType": "...", "openHours": "...", "menuLink": "...", "parking": "...", "tags": ["..."], "highlights": ["..."],
        // WINE SPECIFIC
        "producer": "...", "wineType": "...", "vintage": "...", "region": "...", "country": "...", "grapes": "...", "alcohol": "...", "pairing": "...", "temperature": "...", "decanting": "...", "agingPotential": "...", "reviewsCount": 100
            }
        ]
        }
        Retorne apenas o JSON puro.
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

          const introText = parsed.intro || "Aqui está o que encontrei:";
          setAiResponse(introText);
          setRecommendations(parsed.recommendations || []);
          setSearchResultData(parsed);
          setActiveTab('tudo');

          // Trigger TTS ONLY if triggered by voice
          if (isVoiceTriggered) {
            speakResponse(introText);
          }

        } else {
          throw new Error("No JSON found");
        }
      } catch (e) {
        console.warn("JSON parse failed", e);
        // Fallback or explicit error if JSON is strictly required
        setAiResponse(textResponse);
        setRecommendations([]);
        if (isVoiceTriggered) {
          speakResponse(textResponse.substring(0, 150)); // Read start of raw text if fallback
        }
      }

    } catch (error: any) {
      console.error("AI Error:", error);

      // Strict Parity: Specific error messages
      let userMsg = `Desculpe, tive um problema ao processar sua solicitação.`;

      if (error.message?.includes('404')) {
        userMsg = "O modelo de IA não está disponível ou a chave de API é inválida.";
      } else if (error.message?.includes('403')) {
        userMsg = "A chave de API foi rejeitada (Error 403). Verifique se é válida.";
      }

      setAiResponse(userMsg);
      if (isVoiceTriggered) {
        speakResponse(userMsg);
      }
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
      // Removed Google Search Tool to drastically improve response times
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash"
      });

      // Strict Parity: Exact prompt structure from AISearchTab
      let locationContext = "";
      // @ts-ignore
      const effectiveUseLocation = useLocation; // Re-use logic or simplicity
      if (effectiveUseLocation && userLocation && (userLocation.name || userLocation.city)) {
        const fullLocationString = [
          userLocation.name,
          userLocation.city,
          userLocation.state,
          userLocation.country
        ].filter(Boolean).join(', ');

        locationContext = `CONTEXTO DE LOCALIZAÇÃO: O usuário está atualmente em ${fullLocationString}.`;
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
          "category": "Obrigatório: 'flight', 'hotel', 'general' ou 'wine'",
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

        // Variantes...
        "airline": "...", "flightNumber": "...", "departureTime": "...", "arrivalTime": "...",

        // WINE SPECIFIC FIELDS (Obrigatório se category="wine")
        "producer": "Nome do produtor",
        "wineType": "Tinto, Branco, Rosé, Espumante",
        "vintage": "Safra (Ex: Safra 2018)",
        "region": "Região, Cidade de Origem",
        "country": "País",
        "grapes": "Castas (Ex: Cabernet Sauvignon 80%, Merlot 20%)",
        "alcohol": "Teor Alcoólico (Ex: 13.5%)",
        "pairing": "Sugestão de Harmonização",
        "temperature": "Temp. de Serviço (Ex: 16-18°C)",
        "decanting": "Tempo de Decantação (Ex: 30 min)",
        "agingPotential": "Potencial de Guarda (Ex: 10-15 anos)",
        "reviewsCount": 120,

        // ... outros campos genéricos
        "stars": 4, "amenities": ["..."], "media": ["..."], "address": "Obrigatório: POI, Endereço completo, Cidade, Estado, País", "tripAdvisorRating": 4.5, "bookingRating": 9.2,
        "googleRating": 4.8, "establishmentType": "...", "openHours": "...", "menuLink": "...", "parking": "...", "tags": ["..."], "highlights": ["..."],
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
        {showContextPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowContextPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 mx-auto">
                <i className="ri-map-pin-time-line text-2xl"></i>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Relacionar a uma Viagem?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Deseja utilizar os dados de uma das suas viagens planejadas para esta pesquisa de <strong>{pendingSearch?.label}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleContextDecision(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
                >
                  Não, busca livre
                </button>
                <button
                  onClick={() => handleContextDecision(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-sm"
                >
                  Sim, relacionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45] bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-32 md:bottom-28 right-5 md:right-6 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col transition-all duration-300 max-h-[calc(100vh-150px)] ${recommendations.length > 0 || isAiLoading || aiResponse || searchResultData ? 'w-[90vw] md:w-[600px] h-[75vh]' : 'w-[90vw] md:w-96 h-auto'}`}
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

                    {/* Selected Trip Dashboard */}
                    {persona.type === 'travel' && userTrips.length > 0 && (
                      <div className="mb-6 animate-fadeIn">
                        {/* Section Header with "Trocar" */}
                        <div className="flex items-center justify-between mb-3 px-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Viagem Selecionada
                          </p>
                          {selectedTrip && (
                            <button
                              onClick={() => setSelectedTrip(null)}
                              className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1"
                            >
                              <i className="ri-exchange-line"></i> Trocar
                            </button>
                          )}
                        </div>

                        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {selectedTrip ? (
                            // Trip Card - Dashboard Style
                            <div className="flex-none w-full snap-start p-4 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-start gap-4 relative overflow-hidden group">
                              {/* Watermark Icon */}
                              <div className="absolute top-1/2 -right-6 -translate-y-1/2 opacity-5 pointer-events-none">
                                <i className="ri-plane-fill text-9xl -rotate-45 text-gray-900"></i>
                              </div>

                              {/* Image */}
                              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-white">
                                <img
                                  src={selectedTrip.cover_image || `https://readdy.ai/api/search-image?query=${selectedTrip.destination}&width=200&height=200`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0 relative z-10 pt-1">
                                <h4 className="font-bold text-xl text-gray-900 leading-tight mb-1">{selectedTrip.destination}</h4>
                                <p className="text-xs text-gray-500 mb-3 flex items-center gap-3">
                                  <span><i className="ri-calendar-line mr-1"></i> {new Date(selectedTrip.start_date).toLocaleDateString('pt-BR')}</span>
                                  <span><i className="ri-group-line mr-1"></i> {selectedTrip.travelers}</span>
                                </p>

                                <div className="flex gap-2">
                                  <span className="px-3 py-1 text-[10px] font-bold rounded-lg uppercase bg-amber-100/80 text-amber-700">
                                    {selectedTrip.status || 'PLANNING'}
                                  </span>
                                  {(!selectedTrip.itinerary || Object.keys(selectedTrip.itinerary || {}).length === 0) && (
                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg uppercase flex items-center gap-1 border border-rose-100">
                                      <i className="ri-alert-line"></i> Sem roteiro
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // List of trips (unchanged logic for selection)
                            userTrips.map((trip) => (
                              <button
                                key={trip.id}
                                onClick={() => {
                                  setSelectedTrip(trip);
                                }}
                                className="flex-none w-64 snap-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left flex items-center gap-3 group"
                              >
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                  <img
                                    src={trip.cover_image || `https://readdy.ai/api/search-image?query=${trip.destination}&width=100&height=100`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-sm truncate">{trip.destination}</h4>
                                  <p className="text-[10px] text-gray-500">{new Date(trip.start_date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"></i>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specialist Suggestions Header & Carousel */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {viewMode === 'categories' ? 'Selecione uma categoria' :
                          selectedTrip ? 'Pendências do Planejamento' : 'Sugestões do Especialista'}
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
                      selectedTrip ? (
                        /* Trip Specific Suggestions & Progress */
                        <div className="space-y-4">
                          {/* Progress Bar - Dashboard Style */}
                          <div className="px-1">
                            {(() => {
                              const itinerary = selectedTrip.itinerary || {};
                              const activities = Object.values(itinerary).flat() as any[];
                              const activitiesCount = activities.length;
                              const daysCount = Math.ceil((new Date(selectedTrip.end_date).getTime() - new Date(selectedTrip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              const isFullyPlanned = activitiesCount >= daysCount * 2; // Rough heuristic

                              // Simple calculation for demo: 30% default, more if things exist
                              let progress = 30;
                              if (activitiesCount > 0) progress += 20;
                              if (selectedTrip.travelers > 1) progress += 10;
                              if (isFullyPlanned) progress = 100;

                              const pendingText = progress === 100 ? 'Pronto para viajar!' : 'Faltam as passagens'; // Dynamic based on actual missing data in future

                              return (
                                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 text-indigo-700">
                                      <i className="ri-pie-chart-2-fill"></i>
                                      <span className="text-xs font-bold text-gray-900">Status do Planejamento</span>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600">{progress}%</span>
                                  </div>
                                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] text-gray-400 font-medium">{pendingText}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Action Grid Buttons */}
                          <div className="grid grid-cols-3 gap-3 px-1">
                            {/* Button 1: Flights */}
                            <button
                              onClick={() => handleSearchOptionClick('Voos', `Pesquise as melhores opções de voos para ${selectedTrip.destination} partindo de [Minha Localização] nas datas ${new Date(selectedTrip.start_date).toLocaleDateString()} a ${new Date(selectedTrip.end_date).toLocaleDateString()}. Priorize custo-benefício.`)}
                              className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all aspect-square group"
                            >
                              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i className="ri-plane-fill text-xl"></i>
                              </div>
                              <span className="text-[11px] font-bold text-gray-700 text-center leading-tight group-hover:text-blue-700">Buscar<br />Voos</span>
                            </button>

                            {/* Button 2: Hotel */}
                            <button
                              onClick={() => handleSearchOptionClick('Acomodações', `Sugira 3 opções de hospedagem em ${selectedTrip.destination} para as datas da viagem. Considere localização central e boas avaliações. Inclua preços estimados.`)}
                              className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all aspect-square group"
                            >
                              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i className="ri-hotel-fill text-xl"></i>
                              </div>
                              <span className="text-[11px] font-bold text-gray-700 text-center leading-tight group-hover:text-indigo-700">Encontrar<br />Hotel</span>
                            </button>

                            {/* Button 3: Itinerary */}
                            <button
                              onClick={() => handleSearchOptionClick('Roteiro', `Crie um roteiro detalhado dia a dia para minha viagem a ${selectedTrip.destination}. Foco em experiências locais.`)}
                              className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all aspect-square group"
                            >
                              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i className="ri-map-2-line text-xl"></i>
                              </div>
                              <span className="text-[11px] font-bold text-gray-700 text-center leading-tight group-hover:text-emerald-700">Roteiro<br />Dia a Dia</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Suggestions Carousel (Height Reduced) + NEW SEARCH SECTION */
                        <div className="space-y-6">
                          {/* Reduced Height Specialist Suggestions */}
                          <div className="flex overflow-x-auto gap-3 -mx-4 px-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {persona.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="flex-none w-36 snap-start flex flex-col items-start p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group text-left h-24"
                              >
                                <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center transition-colors ${suggestion.icon.includes('map-pin') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                  <i className={`${suggestion.icon} text-lg`}></i>
                                </div>
                                <span className="font-semibold text-xs text-gray-800 leading-tight group-hover:text-indigo-700 block line-clamp-2">
                                  {suggestion.text}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* NEW: SEARCH Section */}
                          {persona.type === 'travel' && (
                            <div className="animate-fadeIn">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                Pesquisa
                              </p>
                              <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {[
                                  { label: 'Ingressos', icon: 'ri-ticket-2-fill', color: 'amber', keywords: 'ingresso, ticket, parque, museu, show...', desc: 'Pesquisar ingressos e experiências...' },
                                  { label: 'Check-In', icon: 'ri-map-pin-user-fill', color: 'sky', action: () => { setIsOpen(false); setShowCheckIn(true); } },
                                  { label: 'Criar Post', icon: 'ri-quill-pen-fill', color: 'pink', keywords: 'post, publicação, foto...', desc: 'Criar uma nova publicação...' },
                                  { label: 'Blog', icon: 'ri-article-fill', color: 'teal', action: () => { setIsOpen(false); navigate('/travel?tab=blogs'); } },
                                  { label: 'Desafios', icon: 'ri-trophy-fill', color: 'yellow', keywords: 'gameficação, pontos, conquistas...', desc: 'Ver desafios e painel de conquistas...' },
                                  { label: 'Transfer', icon: 'ri-taxi-fill', color: 'zinc', keywords: 'transfer, traslado, aeroporto hotel...', desc: 'Pesquisar serviços de transporte...' },
                                  { label: 'Guias', icon: 'ri-user-star-fill', color: 'orange', keywords: 'guia turístico, tour guide, passeio guiado...', desc: 'Pesquisar guias turísticos locais...' },
                                  { label: 'Seguro', icon: 'ri-shield-cross-fill', color: 'rose', keywords: 'seguro viagem, cobertura médica, assistência...', desc: 'Pesquisar planos de seguro viagem...' },
                                  { label: 'Ofertas', icon: 'ri-price-tag-3-fill', color: 'red', keywords: 'promoção viagem, oferta voo, desconto...', desc: 'Pesquisar ofertas e promoções...' },
                                  { label: 'Vistos', icon: 'ri-passport-fill', color: 'slate', keywords: 'visto, passaporte, documentação...', desc: 'Pesquisar exigências de documentação...' },
                                ].map((item: any, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => item.action ? item.action() : handleSearchOptionClick(item.label, `Gostaria de pesquisar sobre ${item.label}. \nContexto: ${item.desc} \nPalavras-chave: ${item.keywords}`)}
                                    className="flex-none w-24 snap-start flex flex-col items-center gap-2 group"
                                  >
                                    <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shadow-sm border border-${item.color}-100 group-hover:scale-110 transition-transform`}>
                                      <i className={`${item.icon} text-2xl`}></i>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-900 text-center leading-tight px-1">
                                      {item.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
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

                    {/* RICH TABS */}
                    {searchResultData && (searchResultData.news?.length > 0 || searchResultData.tourism?.length > 0 || searchResultData.videos?.length > 0) && (
                      <div className="flex overflow-x-auto gap-4 border-b border-gray-100 mb-4 px-1 scrollbar-hide">
                        <button
                          onClick={() => setActiveTab('tudo')}
                          className={`pb-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'tudo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Tudo
                        </button>
                        {searchResultData.news?.length > 0 && (
                          <button
                            onClick={() => setActiveTab('noticias')}
                            className={`pb-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'noticias' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            Notícias
                          </button>
                        )}
                        {searchResultData.tourism?.length > 0 && (
                          <button
                            onClick={() => setActiveTab('turismo')}
                            className={`pb-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'turismo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            Turismo
                          </button>
                        )}
                        {searchResultData.videos?.length > 0 && (
                          <button
                            onClick={() => setActiveTab('videos')}
                            className={`pb-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'videos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            Vídeos
                          </button>
                        )}
                      </div>
                    )}

                    {/* RENDERING BASED ON TAB */}
                    {(activeTab === 'tudo' || !searchResultData) && (
                      <>
                        {/* WEATHER WIDGET */}
                        {searchResultData?.weather && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">
                                {searchResultData.weather.condition.toLowerCase().includes('sol') ? '☀️' :
                                  searchResultData.weather.condition.toLowerCase().includes('chuva') ? '🌧️' :
                                    searchResultData.weather.condition.toLowerCase().includes('nublado') ? '☁️' : '⛅️'}
                              </div>
                              <div>
                                <h4 className="text-3xl font-black text-gray-800">{searchResultData.weather.temperature}°C</h4>
                                <p className="text-sm font-bold text-gray-600 capitalize">{searchResultData.weather.condition}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500 font-medium space-y-1">
                              <p><i className="ri-drop-line text-blue-400"></i> {searchResultData.weather.chanceOfRain || searchResultData.weather.humidity || 'N/A'}</p>
                              <p><i className="ri-windy-line text-gray-400"></i> {searchResultData.weather.wind || 'N/A'}</p>
                            </div>
                          </div>
                        )}

                        {/* Text Response */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 prose prose-sm max-w-none text-gray-700">
                          <div className="leading-relaxed prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 whitespace-pre-line">
                            <ReactMarkdown>{displayedResponse}</ReactMarkdown>
                            {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-blink align-middle"></span>}
                          </div>

                          {/* WINE CHOICE BUTTONS */}
                          {showWineLocationOptions && !isTyping && (
                            <div className="flex flex-col gap-2 mt-4 animate-fadeIn">
                              <button
                                onClick={() => resolveWineOption('shops')}
                                className="w-full p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl flex items-center gap-3 transition-all group text-left"
                              >
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                                  <i className="ri-store-2-line text-xl"></i>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">Buscar Adegas e Lojas</h4>
                                  <p className="text-xs text-gray-600">Encontrar lugares para comprar vinho perto de mim</p>
                                </div>
                                <i className="ri-arrow-right-line ml-auto text-purple-300 group-hover:text-purple-600"></i>
                              </button>

                              <button
                                onClick={() => resolveWineOption('wines')}
                                className="w-full p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-3 transition-all group text-left"
                              >
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform shadow-sm">
                                  <i className="ri-goblet-line text-xl"></i>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">Vinhos da Região</h4>
                                  <p className="text-xs text-gray-600">Descobrir vinhos produzidos neste local/país</p>
                                </div>
                                <i className="ri-arrow-right-line ml-auto text-red-300 group-hover:text-red-600"></i>
                              </button>
                            </div>
                          )}

                        </div>
                      </>
                    )}

                    {/* NEWS TAB CONTENT */}
                    {activeTab === 'noticias' && searchResultData?.news && (
                      <div className="space-y-3 animate-fadeIn">
                        {searchResultData.news.map((newsItem: any, idx: number) => (
                          <a key={idx} href={newsItem.url} target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                            <h4 className="font-bold text-sm text-blue-800 group-hover:underline leading-snug mb-2">{newsItem.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                              <span>{newsItem.source}</span>
                              <span>•</span>
                              <span>{newsItem.date}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* TURISMO TAB CONTENT */}
                    {activeTab === 'turismo' && searchResultData?.tourism && (
                      <div className="space-y-3 animate-fadeIn">
                        {searchResultData.tourism.map((item: any, idx: number) => (
                          <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <h4 className="font-bold text-sm text-emerald-800 group-hover:underline leading-snug mb-2">{item.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                              <span><i className="ri-map-pin-line mr-1 text-emerald-500"></i>{item.source}</span>
                              <span>•</span>
                              <span>{item.date}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* VIDEOS TAB CONTENT */}
                    {activeTab === 'videos' && searchResultData?.videos && (
                      <div className="space-y-3 animate-fadeIn">
                        {searchResultData.videos.map((vid: any, idx: number) => (
                          <a key={idx} href={vid.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all group">
                            <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200 relative">
                              {vid.thumbnail ? (
                                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                  <i className="ri-play-circle-fill text-3xl"></i>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <i className="ri-play-fill text-white text-xl opacity-80 group-hover:opacity-100"></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug">{vid.title}</h4>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {(activeTab === 'tudo' || !searchResultData) && recommendations.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Recomendações</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendations.map((rec, index) => (
                            <div key={index} className="h-full">
                              <RecommendationCard
                                data={rec}
                                onSave={async () => {
                                  if (authUser) {
                                    try {
                                      if (rec.category === 'wine') {
                                        await cellarService.create({
                                          name: rec.name,
                                          producer: rec.producer || rec.name.split(' ')[0],
                                          region: rec.region,
                                          country: rec.country,
                                          vintage: rec.vintage ? parseInt(rec.vintage.replace(/\D/g, '')) || undefined : undefined,
                                          grapes: rec.grapes,
                                          type: (rec.wineType?.toLowerCase().includes('tinto') ? 'red' :
                                            rec.wineType?.toLowerCase().includes('branco') ? 'white' :
                                              rec.wineType?.toLowerCase().includes('rosé') ? 'rose' :
                                                rec.wineType?.toLowerCase().includes('espumante') ? 'sparkling' : 'red') as any,
                                          image_url: rec.icon,
                                          rating: rec.stars || 0,
                                          quantity: 0,
                                          status: 'wishlist',
                                          notes: `SARA: ${rec.reason}`,
                                          price: parseFloat(rec.estimatedCost?.replace(/[^\d,.]/g, '').replace(',', '.') || '0')
                                        });
                                      } else {
                                        await addTripFavorite({
                                          user_id: authUser.id,
                                          destination: rec.name,
                                          description: rec.description,
                                          category: rec.category,
                                          image_url: rec.icon
                                        });
                                      }

                                      // Simple feedback
                                      const btn = document.activeElement as HTMLElement;
                                      if (btn) {
                                        const icon = btn.querySelector('i');
                                        if (icon) {
                                          icon.className = 'ri-bookmark-3-fill text-lg text-purple-600';
                                          icon.parentElement!.classList.add('bg-purple-100');
                                        }
                                      }
                                    } catch (err) {
                                      console.error('Save failed:', err);
                                    }
                                  }
                                }}
                                onAddToItinerary={() => {
                                  setSchedulingRecommendation(rec);
                                  if (!selectedTrip && userTrips.length > 0) {
                                    setSelectedTrip(userTrips[0]);
                                  }
                                }}
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
                    placeholder={
                      useLocation && (userLocation?.name || userLocation?.city)
                        ? `Pergunte algo sobre ${[userLocation.name, userLocation.city, userLocation.state, userLocation.country].filter(Boolean).join(', ')} ao ${persona.role}...`
                        : `Pergunte ao ${persona.role}...`
                    }
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-32 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all resize-none h-20 scrollbar-hide"
                  />

                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    {/* Nova Consulta (Reset) Button - Only show if there is a response */}
                    {aiResponse && (
                      <button
                        onClick={() => { setAiResponse(null); setRecommendations([]); setQuery(''); setDisplayedResponse(''); window.speechSynthesis.cancel(); setShowWineLocationOptions(false); }}
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

                  {/* Helper Text for Location Status */}
                  {useLocation && locationStatus === 'detecting' && (
                    <p className="text-[10px] text-blue-500 mt-1 ml-1 animate-pulse">
                      <i className="ri-loader-2-line animate-spin mr-1"></i> Detectando localização...
                    </p>
                  )}
                  {useLocation && locationStatus === 'error' && (
                    <p className="text-[10px] text-red-500 mt-1 ml-1">
                      <i className="ri-error-warning-line mr-1"></i> Erro na localização.
                      <button onClick={detectUserLocation} className="ml-1 underline font-bold">Tentar</button>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scheduling Overlay */}
      <AnimatePresence>
        {schedulingRecommendation && selectedTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setSchedulingRecommendation(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Agendar Atividade</h3>
                  <p className="text-xs text-gray-500 mt-1">{schedulingRecommendation.name}</p>
                </div>
                <button onClick={() => setSchedulingRecommendation(null)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Selecione o Dia</label>
                  <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar px-1">
                    {Array.from({ length: Math.ceil((new Date(selectedTrip.end_date).getTime() - new Date(selectedTrip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1 }).map((_, i) => {
                      const date = new Date(selectedTrip.start_date);
                      date.setDate(date.getDate() + i);
                      const isSelected = scheduleData.dayIndex === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setScheduleData(prev => ({ ...prev, dayIndex: i }))}
                          className={`flex-none min-w-[100px] px-4 py-3 rounded-2xl border transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-blue-200'}`}
                        >
                          <span className="block text-[10px] opacity-70 font-bold uppercase tracking-widest leading-none mb-1 text-center">Dia {i + 1}</span>
                          <span className="block text-sm font-bold text-center">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Horário</label>
                  <div className="relative">
                    <i className="ri-time-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                    <input
                      type="time"
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold text-gray-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const currentItinerary = selectedTrip.itinerary || {};
                    const dayActivities = currentItinerary[scheduleData.dayIndex] || [];

                    const newActivity = {
                      id: crypto.randomUUID(),
                      title: `${schedulingRecommendation.icon} ${schedulingRecommendation.name}`,
                      description: schedulingRecommendation.description,
                      time: scheduleData.time,
                      type: 'activity',
                      status: 'confirmed',
                      icon: 'ri-map-pin-2-line',
                      metadata: schedulingRecommendation
                    };

                    const updatedItinerary = {
                      ...currentItinerary,
                      [scheduleData.dayIndex]: [...dayActivities, newActivity]
                    };

                    await updateTrip(selectedTrip.id, { itinerary: updatedItinerary });

                    setUserTrips(prev => prev.map(t => t.id === selectedTrip.id ? { ...t, itinerary: updatedItinerary } : t));
                    setSelectedTrip(prev => prev?.id === selectedTrip.id ? { ...prev, itinerary: updatedItinerary } : prev);

                    setSchedulingRecommendation(null);
                  } catch (err) {
                    console.error('Failed to add to itinerary:', err);
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-lg"
              >
                Confirmar Agendamento
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressCancel}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressCancel}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r ${persona.gradient} text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center group select-none`}
      >
        {!isOpen && !isListening && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${persona.gradient} opacity-50`}
          />
        )}
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-red-500 opacity-60"
          />
        ) : null}

        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        {isListening ? (
          <i className="ri-mic-line text-2xl relative z-10 animate-pulse"></i>
        ) : (
          userProfile?.sara_config?.avatar_type === 'image' && userProfile.sara_config.avatar_url ? (
            <img
              src={userProfile.sara_config.avatar_url}
              alt="SARA"
              className="w-full h-full rounded-full object-cover relative z-10 border-2 border-white/20"
            />
          ) : (
            <i className={`${persona.icon} text-2xl drop-shadow-md group-hover:rotate-12 transition-transform duration-300 relative z-10`}></i>
          )
        )}
      </button>
      {/* Check-In Modal */}
      {showCheckIn && (
        <CheckInModal onClose={() => setShowCheckIn(false)} />
      )}
    </>
  );
}
