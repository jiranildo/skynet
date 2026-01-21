import { useLocation } from 'react-router-dom';

export type PersonaType = 'travel' | 'sommelier' | 'chef' | 'assistant';

export interface SuggestionItem {
    text: string;
    icon: string;
    description?: string;
    keywords?: string[]; // For constructing the prompt
    isSpecial?: boolean; // For triggering special logic (like category modal)
}

export interface PersonaConfig {
    type: PersonaType;
    title: string;
    role: string;
    icon: string;
    color: string;
    gradient: string;
    greeting: string;
    suggestions: SuggestionItem[];
}

export const personas: Record<PersonaType, PersonaConfig> = {
    travel: {
        type: 'travel',
        title: 'SARA Travel',
        role: 'Travel Advisor Sênior',
        icon: 'ri-plane-line',
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-400',
        greeting: 'Olá! Sou sua consultora de viagens. Posso ajudar com roteiros, logística ou otimização de custos.',
        suggestions: [
            {
                icon: 'ri-map-pin-user-line',
                text: 'Locais Próximos',
                description: "Descubra destinos perto de você",
                keywords: ["nearby", "close", "region", "weekend"],
                isSpecial: true
            },
            {
                icon: 'ri-calendar-check-line',
                text: 'O melhor de cada mês',
                description: "Descubra o destino ideal para cada época",
                keywords: ["calendar", "best time", "seasons", "months"]
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
                description: "Magia e diversão nos parques",
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
                icon: 'ri-restaurant-line',
                text: 'Gastronomia',
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
            }
        ]
    },
    sommelier: {
        type: 'sommelier',
        title: 'SARA Sommelier',
        role: 'Curadora de Experiências',
        icon: 'ri-goblet-line',
        color: 'purple',
        gradient: 'from-purple-600 to-red-500',
        greeting: 'Olá! Buscando a harmonização perfeita ou informações sobre um rótulo específico?',
        suggestions: [
            { icon: 'ri-restaurant-line', text: 'Harmonizar com Jantar', keywords: ['harmonização', 'jantar', 'pairing'] },
            { icon: 'ri-star-line', text: 'Avaliar este vinho', keywords: ['avaliação', 'review', 'tasting'] },
            { icon: 'ri-gift-line', text: 'Sugerir Presente', keywords: ['presente', 'gift', 'especial'] }
        ]
    },
    chef: {
        type: 'chef',
        title: 'SARA Chef',
        role: 'Chef Internacional',
        icon: 'ri-restaurant-2-line',
        color: 'orange',
        gradient: 'from-orange-500 to-yellow-400',
        greeting: 'Bon appétit! Precisa de inspiração para o menu ou técnicas de preparo?',
        suggestions: [
            { icon: 'ri-fire-line', text: 'Receita do Dia', keywords: ['receita', 'sugestão', 'prato do dia'] },
            { icon: 'ri-knife-line', text: 'Técnica de Corte', keywords: ['técnica', 'corte', 'preparo'] },
            { icon: 'ri-exchange-line', text: 'Substituir Ingrediente', keywords: ['substituição', 'ingrediente', 'alternativa'] }
        ]
    },
    assistant: {
        type: 'assistant',
        title: 'SARA Assistente',
        role: 'Especialista Contextual',
        icon: 'ri-sparkling-fill',
        color: 'indigo',
        gradient: 'from-indigo-500 to-purple-500',
        greeting: 'Como posso aplicar minha expertise para ajudar você agora?',
        suggestions: [
            { icon: 'ri-list-check', text: 'Resumo do dia', keywords: ['resumo', 'agenda', 'hoje'] },
            { icon: 'ri-search-2-line', text: 'Buscar Informações', keywords: ['pesquisa', 'informação', 'busca'] }
        ]
    }
};

export function useContextualPersona() {
    const location = useLocation();
    const path = location.pathname;

    let currentPersona: PersonaConfig;

    if (path.includes('/travel')) {
        currentPersona = personas.travel;
    } else if (path.includes('/cellar')) {
        currentPersona = personas.sommelier;
    } else if (path.includes('/drinks-food')) {
        currentPersona = personas.chef;
    } else {
        currentPersona = personas.assistant;
    }

    return currentPersona;
}
