import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  reward: number;
  category: 'travel' | 'social' | 'food' | 'special';
}

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
  expiresIn: string;
}

interface UserLevel {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  title: string;
  perks: string[];
}

interface GamificationWidgetProps {
  onClose?: () => void;
}

export default function GamificationWidget({ onClose }: GamificationWidgetProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'badges' | 'ranking' | 'level'>('missions');
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  // User Level System
  const [userLevel, setUserLevel] = useState<UserLevel>(() => {
    const saved = localStorage.getItem('user-level');
    return saved ? JSON.parse(saved) : {
      level: 1,
      currentXP: 0,
      nextLevelXP: 100,
      title: 'Viajante Iniciante',
      perks: ['Acesso básico', 'Missões diárias']
    };
  });

  // Badges System
  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('user-badges');
    return saved ? JSON.parse(saved) : [
      {
        id: 'first-trip',
        name: 'Primeira Viagens',
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
  });

  // Daily Missions
  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('daily-missions');
    const lastReset = localStorage.getItem('missions-last-reset');
    const today = new Date().toDateString();

    if (saved && lastReset === today) {
      return JSON.parse(saved);
    }

    // Reset missions for new day
    const newMissions = [
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

    localStorage.setItem('missions-last-reset', today);
    return newMissions;
  });

  // Ranking
  const [ranking, setRanking] = useState([
    {
      rank: 1,
      name: 'Ana Costa',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20young%20woman%20confident%20smile%20travel%20enthusiast&width=80&height=80&seq=rank-1&orientation=squarish',
      level: 15,
      xp: 12500,
      badges: 28,
      trips: 45
    },
    {
      rank: 2,
      name: 'Carlos Silva',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20young%20man%20friendly%20smile%20adventure%20traveler&width=80&height=80&seq=rank-2&orientation=squarish',
      level: 14,
      xp: 11800,
      badges: 25,
      trips: 42
    },
    {
      rank: 3,
      name: 'Marina Santos',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20woman%20cheerful%20smile%20world%20traveler&width=80&height=80&seq=rank-3&orientation=squarish',
      level: 13,
      xp: 10900,
      badges: 23,
      trips: 38
    },
    {
      rank: 4,
      name: 'Pedro Oliveira',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20man%20happy%20smile%20travel%20blogger&width=80&height=80&seq=rank-4&orientation=squarish',
      level: 12,
      xp: 9500,
      badges: 20,
      trips: 35
    },
    {
      rank: 5,
      name: 'Você',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20warm%20smile%20confident%20traveler&width=80&height=80&seq=rank-you&orientation=squarish',
      level: userLevel.level,
      xp: userLevel.currentXP,
      badges: badges.filter(b => b.unlocked).length,
      trips: 8,
      isYou: true
    }
  ]);

  // Save data
  useEffect(() => {
    localStorage.setItem('user-level', JSON.stringify(userLevel));
  }, [userLevel]);

  useEffect(() => {
    localStorage.setItem('user-badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('daily-missions', JSON.stringify(missions));
  }, [missions]);

  // Complete Mission
  const completeMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    // Update mission
    const updatedMissions = missions.map(m => {
      if (m.id === missionId) {
        return { ...m, progress: m.total, completed: true };
      }
      return m;
    });
    setMissions(updatedMissions);

    // Add XP and TM
    addXP(mission.reward);
    
    // Update wallet
    const currentBalance = parseFloat(localStorage.getItem('travel-money-balance') || '500');
    const newBalance = currentBalance + mission.reward;
    localStorage.setItem('travel-money-balance', newBalance.toString());

    // Add transaction
    const transactions = JSON.parse(localStorage.getItem('travel-money-transactions') || '[]');
    transactions.unshift({
      id: Date.now().toString(),
      type: 'gain',
      amount: mission.reward,
      description: `Missão: ${mission.title}`,
      date: new Date().toISOString(),
      category: 'reward'
    });
    localStorage.setItem('travel-money-transactions', JSON.stringify(transactions));

    // Dispatch event
    window.dispatchEvent(new Event('walletUpdated'));

    // Show success
    alert(`🎉 Missão completada! +${mission.reward} TM e +${mission.reward} XP`);
  };

  // Add XP
  const addXP = (amount: number) => {
    let newXP = userLevel.currentXP + amount;
    let newLevel = userLevel.level;
    let nextLevelXP = userLevel.nextLevelXP;

    // Check level up
    while (newXP >= nextLevelXP) {
      newXP -= nextLevelXP;
      newLevel++;
      nextLevelXP = Math.floor(nextLevelXP * 1.5);
    }

    // Update level
    const newUserLevel = {
      ...userLevel,
      level: newLevel,
      currentXP: newXP,
      nextLevelXP: nextLevelXP,
      title: getLevelTitle(newLevel),
      perks: getLevelPerks(newLevel)
    };

    setUserLevel(newUserLevel);

    // Show level up
    if (newLevel > userLevel.level) {
      alert(`🎊 Level Up! Você agora é nível ${newLevel} - ${getLevelTitle(newLevel)}`);
    }
  };

  // Get level title
  const getLevelTitle = (level: number): string => {
    if (level >= 20) return 'Lenda das Viagens';
    if (level >= 15) return 'Explorador Mestre';
    if (level >= 10) return 'Viajante Experiente';
    if (level >= 5) return 'Aventureiro';
    return 'Viajante Iniciante';
  };

  // Get level perks
  const getLevelPerks = (level: number): string[] => {
    const perks = ['Acesso básico', 'Missões diárias'];
    if (level >= 5) perks.push('Desconto 5% em reservas');
    if (level >= 10) perks.push('Acesso a eventos exclusivos');
    if (level >= 15) perks.push('Desconto 10% em reservas');
    if (level >= 20) perks.push('Suporte VIP prioritário');
    return perks;
  };

  // Unlock badge
  const unlockBadge = (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || badge.unlocked) return;

    const updatedBadges = badges.map(b => {
      if (b.id === badgeId) {
        return { ...b, unlocked: true, currentProgress: b.requirement };
      }
      return b;
    });
    setBadges(updatedBadges);

    // Add reward
    addXP(badge.reward);
    
    const currentBalance = parseFloat(localStorage.getItem('travel-money-balance') || '500');
    const newBalance = currentBalance + badge.reward;
    localStorage.setItem('travel-money-balance', newBalance.toString());

    const transactions = JSON.parse(localStorage.getItem('travel-money-transactions') || '[]');
    transactions.unshift({
      id: Date.now().toString(),
      type: 'gain',
      amount: badge.reward,
      description: `Conquista: ${badge.name}`,
      date: new Date().toISOString(),
      category: 'reward'
    });
    localStorage.setItem('travel-money-transactions', JSON.stringify(transactions));

    window.dispatchEvent(new Event('walletUpdated'));

    // Show unlock animation
    setUnlockedBadge(badge);
    setShowBadgeUnlock(true);
    setTimeout(() => setShowBadgeUnlock(false), 3000);
  };

  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;
  const completedMissionsCount = missions.filter(m => m.completed).length;

  return (
    <>
      {/* Badge Unlock Animation */}
      {showBadgeUnlock && unlockedBadge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center animate-fadeIn">
          <div className="text-center animate-scaleIn">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r ${unlockedBadge.color} p-1 shadow-2xl animate-bounce`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <i className={`${unlockedBadge.icon} text-6xl bg-gradient-to-r ${unlockedBadge.color} bg-clip-text text-transparent`}></i>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">🎉 Conquista Desbloqueada!</h2>
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">{unlockedBadge.name}</h3>
            <p className="text-white/90 mb-4">{unlockedBadge.description}</p>
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <i className="ri-coin-fill text-yellow-400 text-xl"></i>
                <span className="font-bold">+{unlockedBadge.reward} TM</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-star-fill text-purple-400 text-xl"></i>
                <span className="font-bold">+{unlockedBadge.reward} XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Widget - Agora sem o botão flutuante, apenas o conteúdo */}
      <div className="flex flex-col h-full max-h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <i className="ri-trophy-fill text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Gamificação</h3>
              <p className="text-white/90 text-sm">Nível {userLevel.level} - {userLevel.title}</p>
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'missions'
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Missões
            {completedMissionsCount < missions.length && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
            {activeTab === 'missions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'badges'
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conquistas
            {activeTab === 'badges' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('level')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'level'
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nível
            {activeTab === 'level' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'ranking'
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ranking
            {activeTab === 'ranking' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Missions Tab */}
          {activeTab === 'missions' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">Missões Diárias</h4>
                  <span className="text-sm text-purple-600 font-medium">
                    {completedMissionsCount}/{missions.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Complete todas para ganhar bônus de 100 TM!</p>
              </div>

              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`bg-white rounded-xl p-4 border-2 transition-all ${
                    mission.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      mission.completed
                        ? 'bg-green-100'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100'
                    }`}>
                      <i className={`${mission.icon} text-2xl ${
                        mission.completed ? 'text-green-600' : 'text-purple-600'
                      }`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{mission.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                      
                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{mission.progress}/{mission.total}</span>
                          <span className="text-purple-600 font-medium">+{mission.reward} TM</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          <i className="ri-time-line mr-1"></i>
                          Expira em {mission.expiresIn}
                        </span>
                        {!mission.completed && (
                          <button
                            onClick={() => completeMission(mission.id)}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
                          >
                            Completar
                          </button>
                        )}
                        {mission.completed && (
                          <span className="text-xs text-green-600 font-medium">
                            <i className="ri-check-line mr-1"></i>
                            Completo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">Suas Conquistas</h4>
                    <p className="text-sm text-gray-600">{unlockedBadgesCount}/{badges.length} desbloqueadas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{Math.round((unlockedBadgesCount / badges.length) * 100)}%</div>
                    <div className="text-xs text-gray-600">Completo</div>
                  </div>
                </div>
              </div>

              {/* Category filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['Todas', 'Viagens', 'Social', 'Gastronomia', 'Especial'].map((cat) => (
                  <button
                    key={cat}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-colors whitespace-nowrap"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-xl p-4 border-2 transition-all ${
                      badge.unlocked
                        ? 'border-purple-300 shadow-md'
                        : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${badge.color} p-0.5 ${
                      badge.unlocked ? 'shadow-lg' : 'grayscale'
                    }`}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <i className={`${badge.icon} text-3xl bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}></i>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-600 text-center mb-2 line-clamp-2">{badge.description}</p>
                    
                    {!badge.unlocked && (
                      <>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                            style={{ width: `${(badge.currentProgress / badge.requirement) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          {badge.currentProgress}/{badge.requirement}
                        </p>
                        <button
                          onClick={() => unlockBadge(badge.id)}
                          className="w-full mt-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
                        >
                          Desbloquear
                        </button>
                      </>
                    )}
                    {badge.unlocked && (
                      <div className="text-center">
                        <span className="text-xs text-green-600 font-medium">
                          <i className="ri-check-line mr-1"></i>
                          Desbloqueado
                        </span>
                        <p className="text-xs text-purple-600 font-medium mt-1">+{badge.reward} TM</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level Tab */}
          {activeTab === 'level' && (
            <div className="space-y-4">
              {/* Level card */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-4xl font-bold">{userLevel.level}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{userLevel.title}</h3>
                  <p className="text-white/90 text-sm">Continue explorando para subir de nível!</p>
                </div>

                {/* XP Progress */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{userLevel.currentXP} XP</span>
                    <span>{userLevel.nextLevelXP} XP</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${(userLevel.currentXP / userLevel.nextLevelXP) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-center text-sm text-white/90">
                  Faltam {userLevel.nextLevelXP - userLevel.currentXP} XP para o próximo nível
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <i className="ri-trophy-fill text-2xl text-yellow-500 mb-2"></i>
                  <div className="text-2xl font-bold text-gray-900">{unlockedBadgesCount}</div>
                  <div className="text-xs text-gray-600">Conquistas</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <i className="ri-flight-takeoff-fill text-2xl text-blue-500 mb-2"></i>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-xs text-gray-600">Viagens</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <i className="ri-star-fill text-2xl text-purple-500 mb-2"></i>
                  <div className="text-2xl font-bold text-gray-900">{userLevel.currentXP}</div>
                  <div className="text-xs text-gray-600">XP Total</div>
                </div>
              </div>

              {/* Perks */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="ri-gift-fill text-purple-500"></i>
                  Benefícios do Nível
                </h4>
                <div className="space-y-2">
                  {userLevel.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <i className="ri-check-line text-green-500"></i>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next level preview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-2">Próximo Nível</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Nível {userLevel.level + 1} - {getLevelTitle(userLevel.level + 1)}
                </p>
                <div className="space-y-1">
                  {getLevelPerks(userLevel.level + 1).filter(p => !userLevel.perks.includes(p)).map((perk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-purple-600">
                      <i className="ri-lock-fill"></i>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ranking Tab */}
          {activeTab === 'ranking' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-1">Ranking Global</h4>
                <p className="text-sm text-gray-600">Top viajantes da comunidade</p>
              </div>

              {ranking.map((user) => (
                <div
                  key={user.rank}
                  className={`bg-white rounded-xl p-4 border-2 transition-all ${
                    user.isYou
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      user.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                      user.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                      user.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-amber-600 text-white' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.rank === 1 && <i className="ri-trophy-fill text-xl"></i>}
                      {user.rank === 2 && <i className="ri-medal-fill text-xl"></i>}
                      {user.rank === 3 && <i className="ri-medal-2-fill text-xl"></i>}
                      {user.rank > 3 && user.rank}
                    </div>

                    {/* Avatar */}
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{user.name}</h4>
                        {user.isYou && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="ri-star-fill text-purple-500"></i>
                          Nv {user.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-trophy-fill text-yellow-500"></i>
                          {user.badges}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-flight-takeoff-fill text-blue-500"></i>
                          {user.trips}
                        </span>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{user.xp.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">XP</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 text-center">
                <p className="text-sm text-gray-600">
                  Continue completando missões e conquistando badges para subir no ranking! 🚀
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
