import { Badge, Mission } from '@/components/GamificationWidget';

export const STATIC_BADGES: Badge[] = [
    {
        id: 'first-trip',
        name: 'Primeira Viagem',
        description: 'Complete sua primeira viagem',
        icon: 'ri-flight-takeoff-fill',
        color: 'from-blue-500 to-cyan-500',
        requirement: 1,
        currentProgress: 0,
        unlocked: false,
        reward: 100,
        category: 'travel'
    },
    {
        id: 'social-butterfly',
        name: 'Borboleta Social',
        description: 'Faça 10 novos amigos',
        icon: 'ri-user-heart-fill',
        color: 'from-pink-500 to-rose-500',
        requirement: 10,
        currentProgress: 0,
        unlocked: false,
        reward: 150,
        category: 'social'
    },
    {
        id: 'foodie',
        name: 'Foodie Expert',
        description: 'Experimente 20 restaurantes diferentes',
        icon: 'ri-restaurant-2-fill',
        color: 'from-orange-500 to-amber-500',
        requirement: 20,
        currentProgress: 0,
        unlocked: false,
        reward: 200,
        category: 'food'
    },
    {
        id: 'globe-trotter',
        name: 'Viajante Mundial',
        description: 'Visite 5 países diferentes',
        icon: 'ri-earth-fill',
        color: 'from-green-500 to-emerald-500',
        requirement: 5,
        currentProgress: 0,
        unlocked: false,
        reward: 300,
        category: 'travel'
    },
    {
        id: 'content-creator',
        name: 'Criador de Conteúdo',
        description: 'Publique 50 posts',
        icon: 'ri-camera-fill',
        color: 'from-purple-500 to-violet-500',
        requirement: 50,
        currentProgress: 0,
        unlocked: false,
        reward: 250,
        category: 'social'
    },
    {
        id: 'wine-connoisseur',
        name: 'Sommelier',
        description: 'Experimente 15 vinhos diferentes',
        icon: 'ri-wine-glass-fill',
        color: 'from-red-500 to-rose-500',
        requirement: 15,
        currentProgress: 0,
        unlocked: false,
        reward: 180,
        category: 'food'
    },
    {
        id: 'adventure-seeker',
        name: 'Aventureiro',
        description: 'Complete 10 atividades de aventura',
        icon: 'ri-mountain-fill',
        color: 'from-teal-500 to-cyan-500',
        requirement: 10,
        currentProgress: 0,
        unlocked: false,
        reward: 220,
        category: 'travel'
    },
    {
        id: 'influencer',
        name: 'Influenciador',
        description: 'Alcance 1000 seguidores',
        icon: 'ri-star-fill',
        color: 'from-yellow-500 to-amber-500',
        requirement: 1000,
        currentProgress: 0,
        unlocked: false,
        reward: 500,
        category: 'social'
    },
    {
        id: 'luxury-traveler',
        name: 'Viajante Luxo',
        description: 'Reserve 5 hotéis 5 estrelas',
        icon: 'ri-vip-diamond-fill',
        color: 'from-indigo-500 to-purple-500',
        requirement: 5,
        currentProgress: 0,
        unlocked: false,
        reward: 400,
        category: 'special'
    },
    {
        id: 'early-bird',
        name: 'Madrugador',
        description: 'Complete missões por 7 dias seguidos',
        icon: 'ri-sun-fill',
        color: 'from-orange-400 to-yellow-400',
        requirement: 7,
        currentProgress: 0,
        unlocked: false,
        reward: 350,
        category: 'special'
    }
];

export const STATIC_MISSIONS: Mission[] = [
    {
        id: 'daily-post',
        title: 'Compartilhe sua Jornada',
        description: 'Publique 1 foto da sua viagem',
        icon: 'ri-camera-line',
        reward: 50,
        progress: 0,
        total: 1,
        completed: false,
        expiresIn: '23h 45m'
    },
    {
        id: 'daily-like',
        title: 'Espalhe Amor',
        description: 'Curta 10 posts de outros viajantes',
        icon: 'ri-heart-line',
        reward: 30,
        progress: 0,
        total: 10,
        completed: false,
        expiresIn: '23h 45m'
    },
    {
        id: 'daily-explore',
        title: 'Explore Destinos',
        description: 'Visite 3 páginas de destinos diferentes',
        icon: 'ri-compass-line',
        reward: 40,
        progress: 0,
        total: 3,
        completed: false,
        expiresIn: '23h 45m'
    },
    {
        id: 'daily-friend',
        title: 'Faça Conexões',
        description: 'Siga 2 novos viajantes',
        icon: 'ri-user-add-line',
        reward: 35,
        progress: 0,
        total: 2,
        completed: false,
        expiresIn: '23h 45m'
    },
    {
        id: 'daily-review',
        title: 'Compartilhe Experiência',
        description: 'Avalie 1 restaurante ou hotel',
        icon: 'ri-star-line',
        reward: 45,
        progress: 0,
        total: 1,
        completed: false,
        expiresIn: '23h 45m'
    }
];

// Helper functions for Level Info
export const getLevelTitle = (level: number): string => {
    if (level >= 20) return 'Lenda das Viagens';
    if (level >= 15) return 'Explorador Mestre';
    if (level >= 10) return 'Viajante Experiente';
    if (level >= 5) return 'Aventureiro';
    return 'Viajante Iniciante';
};

export const getLevelPerks = (level: number): string[] => {
    const perks = ['Acesso básico', 'Missões diárias'];
    if (level >= 5) perks.push('Desconto 5% em reservas');
    if (level >= 10) perks.push('Acesso a eventos exclusivos');
    if (level >= 15) perks.push('Desconto 10% em reservas');
    if (level >= 20) perks.push('Suporte VIP prioritário');
    return perks;
};
