import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

interface ContextualSuggestion {
  icon: string;
  text: string;
  action: string;
}

interface JarvisAIProps {
  onClose?: () => void;
}

export default function JarvisAI({ onClose }: JarvisAIProps) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const location = useLocation();

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContextualSuggestions = (): ContextualSuggestion[] => {
    const path = location.pathname;
    
    if (path === '/travel') {
      return [
        { icon: 'ri-map-pin-line', text: 'Sugerir destinos para mim', action: 'suggest_destinations' },
        { icon: 'ri-calendar-line', text: 'Planejar próxima viagem', action: 'plan_trip' },
        { icon: 'ri-flight-takeoff-line', text: 'Encontrar voos baratos', action: 'find_flights' },
        { icon: 'ri-hotel-line', text: 'Melhores hotéis', action: 'find_hotels' },
      ];
    } else if (path === '/drinks-food') {
      return [
        { icon: 'ri-restaurant-line', text: 'Restaurantes próximos', action: 'nearby_restaurants' },
        { icon: 'ri-wine-glass-line', text: 'Experiências gastronômicas', action: 'food_experiences' },
        { icon: 'ri-star-line', text: 'Lugares bem avaliados', action: 'top_rated' },
      ];
    } else if (path === '/') {
      return [
        { icon: 'ri-compass-line', text: 'Explorar destinos', action: 'explore' },
        { icon: 'ri-group-line', text: 'Conectar com viajantes', action: 'connect' },
        { icon: 'ri-map-2-line', text: 'Criar roteiro', action: 'create_itinerary' },
      ];
    }
    
    return [
      { icon: 'ri-question-line', text: 'Como posso ajudar?', action: 'help' },
      { icon: 'ri-lightbulb-line', text: 'Dicas de viagem', action: 'tips' },
    ];
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date(),
        suggestions: getFollowUpSuggestions(messageText),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (action: string) => {
    const suggestionTexts: Record<string, string> = {
      suggest_destinations: 'Sugira destinos incríveis para mim',
      plan_trip: 'Quero planejar uma viagem',
      find_flights: 'Encontre voos baratos',
      find_hotels: 'Mostre os melhores hotéis',
      nearby_restaurants: 'Restaurantes próximos a mim',
      food_experiences: 'Experiências gastronômicas únicas',
      top_rated: 'Lugares mais bem avaliados',
      explore: 'Quero explorar novos destinos',
      connect: 'Como conectar com outros viajantes?',
      create_itinerary: 'Ajude-me a criar um roteiro',
      help: 'Como você pode me ajudar?',
      tips: 'Dê-me dicas de viagem',
    };

    const text = suggestionTexts[action] || action;
    handleSendMessage(text);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Travel-related responses
    if (lowerMessage.includes('viagem') || lowerMessage.includes('viajar') || lowerMessage.includes('destino')) {
      return '✈️ Adoraria ajudar você a planejar sua próxima viagem! Baseado no seu perfil e preferências, recomendo:\n\n🌴 **Bali, Indonésia** - Praias paradisíacas e cultura única\n🗼 **Paris, França** - Romance e gastronomia\n🏔️ **Suíça** - Montanhas e aventura\n\nQual tipo de experiência você procura? Praia, cultura, aventura ou gastronomia?';
    }
    
    if (lowerMessage.includes('restaurante') || lowerMessage.includes('comida') || lowerMessage.includes('gastronom')) {
      return '🍽️ Que delícia! Encontrei experiências gastronômicas incríveis para você:\n\n⭐ **Terraço Grill** - Churrascaria premium (4.8★)\n🍣 **Sushi House** - Culinária japonesa autêntica (4.9★)\n🍝 **Bella Italia** - Massas artesanais (4.7★)\n\nQual tipo de culinária você prefere?';
    }
    
    if (lowerMessage.includes('hotel') || lowerMessage.includes('hospedagem')) {
      return '🏨 Vou te ajudar a encontrar a hospedagem perfeita! Você prefere:\n\n💎 Hotel de luxo com spa\n🏢 Hotel boutique no centro\n💰 Opção econômica mas confortável\n\nQual é o seu orçamento aproximado?';
    }
    
    if (lowerMessage.includes('voo') || lowerMessage.includes('passagem')) {
      return '✈️ Posso ajudar você a encontrar as melhores passagens! Para otimizar sua busca:\n\n📅 Viaje na baixa temporada (economize até 40%)\n🔔 Ative alertas de preço\n🎯 Seja flexível com as datas\n\nPara onde você gostaria de ir e quando planeja viajar?';
    }
    
    if (lowerMessage.includes('barato') || lowerMessage.includes('econom') || lowerMessage.includes('preço')) {
      return '💰 Dicas para economizar na sua viagem:\n\n✅ Reserve com 2-3 meses de antecedência\n✅ Viaje na baixa temporada\n✅ Use nosso Travel Money (cashback de 5%)\n✅ Compare preços em diferentes datas\n\nQuer que eu encontre as melhores ofertas para você?';
    }
    
    if (lowerMessage.includes('roteiro') || lowerMessage.includes('planejar') || lowerMessage.includes('itinerário')) {
      return '🗺️ Vou criar um roteiro personalizado para você! Preciso saber:\n\n📍 Destino\n📅 Quantos dias\n👥 Quantas pessoas\n💵 Orçamento aproximado\n🎯 Tipo de viagem (aventura, relaxamento, cultura)\n\nMe conte mais sobre sua viagem ideal!';
    }
    
    if (lowerMessage.includes('dica') || lowerMessage.includes('sugest')) {
      return '💡 Aqui vão algumas dicas valiosas:\n\n✨ Use o modo offline do app para acessar seus roteiros sem internet\n🎁 Acumule Travel Money em cada reserva\n📸 Compartilhe suas experiências e ganhe badges\n🤝 Conecte-se com viajantes locais\n\nQuer saber mais sobre alguma dessas funcionalidades?';
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('como')) {
      return '🤝 Estou aqui para ser seu copiloto de viagens! Posso ajudar com:\n\n✈️ Planejamento de viagens\n🏨 Reservas de hotéis e voos\n🍽️ Experiências gastronômicas\n🗺️ Criação de roteiros\n💰 Dicas para economizar\n🎯 Recomendações personalizadas\n\nO que você gostaria de fazer?';
    }
    
    return '🌟 Estou aqui para tornar suas viagens inesquecíveis! Posso ajudar com planejamento, reservas, dicas de destinos, experiências gastronômicas e muito mais. Como posso te auxiliar hoje?';
  };

  const getFollowUpSuggestions = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('viagem') || lowerMessage.includes('destino')) {
      return ['Ver pacotes completos', 'Comparar preços', 'Criar roteiro'];
    }
    
    if (lowerMessage.includes('restaurante') || lowerMessage.includes('comida')) {
      return ['Ver cardápio', 'Fazer reserva', 'Mais opções'];
    }
    
    if (lowerMessage.includes('hotel')) {
      return ['Ver disponibilidade', 'Comparar hotéis', 'Ler avaliações'];
    }
    
    return ['Continuar planejando', 'Ver ofertas', 'Falar com especialista'];
  };

  const contextualSuggestions = getContextualSuggestions();

  return (
    <div className="h-full flex flex-col">
      {/* Header - Cores SocialHub */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <i className="ri-robot-2-fill text-xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"></i>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">AI Copilot</h3>
            <p className="text-white/90 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online e pronto para ajudar
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        )}
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <i className="ri-robot-2-fill text-3xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"></i>
              </div>
            </div>
            <h4 className="text-gray-800 font-semibold mb-2">Olá! Sou seu AI Copilot</h4>
            <p className="text-gray-600 text-sm mb-6">Como posso ajudar você hoje?</p>
            
            {/* Sugestões contextuais */}
            <div className="space-y-2">
              {contextualSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.action)}
                  className="w-full px-4 py-3 bg-white hover:bg-blue-50 text-gray-700 rounded-xl text-sm transition-colors border border-gray-200 shadow-sm flex items-center gap-3"
                >
                  <i className={`${suggestion.icon} text-blue-500 text-lg`}></i>
                  <span className="flex-1 text-left">{suggestion.text}</span>
                  <i className="ri-arrow-right-line text-gray-400"></i>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 text-white shadow-md'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                <span className={`text-xs mt-1 block ${
                  message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Follow-up suggestions */}
            {message.sender === 'ai' && message.suggestions && (
              <div className="flex flex-wrap gap-2 mt-2 ml-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-xs font-medium transition-colors border border-blue-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-3 rounded-full transition-all ${
              isListening
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={`${isListening ? 'ri-mic-fill' : 'ri-mic-line'} text-xl`}></i>
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors text-sm"
          />
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-send-plane-fill text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
