import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
  category: 'travel' | 'food' | 'reward' | 'booking' | 'social';
}

interface WalletWidgetProps {
  onClose?: () => void;
}

export default function WalletWidget({ onClose }: WalletWidgetProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'earn'>('overview');

  useEffect(() => {
    // Carregar saldo do localStorage
    const savedBalance = localStorage.getItem('travel-money-balance');
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    } else {
      // Saldo inicial de boas-vindas
      setBalance(500);
      localStorage.setItem('travel-money-balance', '500');
    }

    // Carregar transações
    const savedTransactions = localStorage.getItem('travel-money-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Transações iniciais de exemplo
      const initialTransactions: Transaction[] = [
        {
          id: '1',
          type: 'earn',
          amount: 500,
          description: 'Bônus de boas-vindas',
          date: new Date().toISOString(),
          category: 'reward'
        }
      ];
      setTransactions(initialTransactions);
      localStorage.setItem('travel-money-transactions', JSON.stringify(initialTransactions));
    }
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('travel-money-transactions', JSON.stringify(updatedTransactions));

    const newBalance = transaction.type === 'earn' 
      ? balance + transaction.amount 
      : balance - transaction.amount;
    
    setBalance(newBalance);
    localStorage.setItem('travel-money-balance', newBalance.toString());
  };

  const earnWays = [
    {
      icon: 'ri-camera-line',
      title: 'Compartilhar Viagens',
      description: 'Poste fotos da sua viagem',
      reward: 50,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'ri-star-line',
      title: 'Avaliar Experiência',
      description: 'Avalie restaurantes e hotéis',
      reward: 25,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: 'ri-user-add-line',
      title: 'Convidar Amigos',
      description: 'Ganhe por cada amigo que se cadastrar',
      reward: 100,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Check-in',
      description: 'Faça check-in em destinos',
      reward: 30,
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: 'ri-calendar-check-line',
      title: 'Completar Viagens',
      description: 'Complete uma viagem planejada',
      reward: 200,
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: 'ri-trophy-line',
      title: 'Conquistas',
      description: 'Desbloqueie badges e conquistas',
      reward: 150,
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return 'ri-flight-takeoff-line';
      case 'food': return 'ri-restaurant-line';
      case 'reward': return 'ri-gift-line';
      case 'booking': return 'ri-hotel-line';
      case 'social': return 'ri-share-line';
      default: return 'ri-money-dollar-circle-line';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'text-blue-500 bg-blue-50';
      case 'food': return 'text-orange-500 bg-orange-50';
      case 'reward': return 'text-purple-500 bg-purple-50';
      case 'booking': return 'text-pink-500 bg-pink-50';
      case 'social': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <i className="ri-wallet-3-line text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Travel Money</h2>
              <p className="text-white/90 text-sm">Sua carteira digital</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          )}
        </div>

        {/* Saldo */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p className="text-white/80 text-sm mb-2">Saldo Disponível</p>
          <div className="flex items-center justify-center gap-2">
            <i className="ri-money-dollar-circle-line text-4xl"></i>
            <span className="text-5xl font-bold">{balance.toFixed(0)}</span>
            <span className="text-2xl opacity-90">TM</span>
          </div>
          <p className="text-white/70 text-xs mt-2">≈ R$ {(balance * 0.1).toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-dashboard-line mr-2"></i>
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-history-line mr-2"></i>
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('earn')}
            className={`flex-1 px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'earn'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-gift-line mr-2"></i>
            Ganhar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <i className="ri-arrow-down-line text-2xl text-green-600 mb-2"></i>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0)}
                </p>
                <p className="text-xs text-gray-600">Ganhos</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                <i className="ri-arrow-up-line text-2xl text-red-600 mb-2"></i>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0)}
                </p>
                <p className="text-xs text-gray-600">Gastos</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <i className="ri-exchange-line text-2xl text-blue-600 mb-2"></i>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                <p className="text-xs text-gray-600">Transações</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transações Recentes</h3>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                      <i className={`${getCategoryIcon(transaction.category)} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                    <div className={`text-right ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="font-bold text-lg">
                        {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                      </p>
                      <p className="text-xs">TM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                    <i className={`${getCategoryIcon(transaction.category)} text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                  <div className={`text-right ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="font-bold text-lg">
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                    </p>
                    <p className="text-xs">TM</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-history-line text-4xl text-gray-400"></i>
                </div>
                <p className="text-gray-600">Nenhuma transação ainda</p>
              </div>
            )}
          </div>
        )}

        {/* Earn Tab */}
        {activeTab === 'earn' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-start gap-3">
                <i className="ri-lightbulb-line text-2xl text-yellow-600"></i>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Ganhe Travel Money!</h4>
                  <p className="text-sm text-gray-700">
                    Complete atividades e ganhe moedas para usar em viagens, experiências gastronômicas e muito mais!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnWays.map((way, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-yellow-400 transition-all cursor-pointer group"
                  onClick={() => {
                    addTransaction({
                      type: 'earn',
                      amount: way.reward,
                      description: way.title,
                      category: 'reward'
                    });
                    alert(`🎉 Você ganhou ${way.reward} TM!`);
                  }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${way.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <i className={`${way.icon} text-2xl`}></i>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{way.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{way.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Recompensa</span>
                    <span className="text-lg font-bold text-yellow-600">+{way.reward} TM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
