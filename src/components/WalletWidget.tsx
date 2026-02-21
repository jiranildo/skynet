import { useState } from 'react';
import { useGamification } from '@/hooks/queries/useGamification';
import { useTransactions, useAddTransaction, useEarnOptions, useSpendOptions, useBuyPackages } from '@/hooks/queries/useWallet';

interface WalletWidgetProps {
  onClose?: () => void;
}

export default function WalletWidget({ onClose }: WalletWidgetProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'earn' | 'spend' | 'buy'>('overview');

  const { data: gamification } = useGamification();
  const { data: transactions } = useTransactions();
  const addTransactionMut = useAddTransaction();

  const balance = gamification?.tm_balance || 0;
  const safeTransactions = transactions || [];

  const addTransaction = async (transaction: { type: 'earn' | 'spend'; amount: number; description: string; category: string }) => {
    try {
      await addTransactionMut.mutateAsync(transaction);
    } catch (e) {
      console.error(e);
    }
  };

  const { data: earnWays = [] } = useEarnOptions();
  const { data: spendWays = [] } = useSpendOptions();
  const { data: buyPackages = [] } = useBuyPackages();

  const handleBuyPackage = async (pkg: any) => {
    try {
      await addTransactionMut.mutateAsync({
        type: 'earn',
        amount: pkg.amount + pkg.bonus,
        description: `Compra de Pacote TM`,
        category: 'reward'
      });
      alert(`Compra de ${pkg.price} simulada com sucesso! Você recebeu ${pkg.amount + pkg.bonus} TM.`);
    } catch (e) {
      console.error(e);
      alert('Erro ao processar compra.');
    }
  };

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
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-none px-2 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border-b-2 border-transparent hover:border-gray-200'
              }`}
          >
            <i className="ri-dashboard-line mr-2"></i>
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border-b-2 border-transparent hover:border-gray-200'
              }`}
          >
            <i className="ri-history-line mr-2"></i>
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('earn')}
            className={`px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'earn'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border-b-2 border-transparent hover:border-gray-200'
              }`}
          >
            <i className="ri-gift-line mr-2"></i>
            Ganhar
          </button>
          <button
            onClick={() => setActiveTab('spend')}
            className={`px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'spend'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border-b-2 border-transparent hover:border-gray-200'
              }`}
          >
            <i className="ri-shopping-cart-2-line mr-2"></i>
            Gastar
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'buy'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border-b-2 border-transparent hover:border-gray-200'
              }`}
          >
            <i className="ri-bank-card-line mr-2"></i>
            Comprar
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
                  {safeTransactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + Number(t.amount), 0)}
                </p>
                <p className="text-xs text-gray-600">Ganhos</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                <i className="ri-arrow-up-line text-2xl text-red-600 mb-2"></i>
                <p className="text-2xl font-bold text-gray-900">
                  {safeTransactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + Number(t.amount), 0)}
                </p>
                <p className="text-xs text-gray-600">Gastos</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <i className="ri-exchange-line text-2xl text-blue-600 mb-2"></i>
                <p className="text-2xl font-bold text-gray-900">{safeTransactions.length}</p>
                <p className="text-xs text-gray-600">Transações</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transações Recentes</h3>
              <div className="space-y-3">
                {safeTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                      <i className={`${getCategoryIcon(transaction.category)} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.created_at || '')}</p>
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
            {safeTransactions.length > 0 ? (
              safeTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                    <i className={`${getCategoryIcon(transaction.category)} text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.created_at || '')}</p>
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
                  className="bg-white rounded-xl p-5 border border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${way.color} flex items-center justify-center text-white mb-4`}>
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

        {/* Spend Tab */}
        {activeTab === 'spend' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-start gap-3">
                <i className="ri-shopping-bag-3-line text-2xl text-indigo-600"></i>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Use seu Saldo</h4>
                  <p className="text-sm text-gray-700">
                    Troque seu Travel Money por benefícios reais na plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spendWays.map((way, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 border border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${way.color} flex items-center justify-center text-white mb-4`}>
                    <i className={`${way.icon} text-2xl`}></i>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{way.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{way.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Custo</span>
                    <span className="text-lg font-bold text-indigo-600">-{way.cost} TM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buy Tab */}
        {activeTab === 'buy' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
              <div className="flex items-start gap-3">
                <i className="ri-secure-payment-line text-2xl text-teal-600"></i>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Recarregue sua Carteira</h4>
                  <p className="text-sm text-gray-700">
                    Compre pacotes de Travel Money com PIX ou Cartão de Crédito de forma segura.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {buyPackages.map((pkg, index) => (
                <button
                  key={index}
                  onClick={() => handleBuyPackage(pkg)}
                  className="w-full text-left bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-teal-400 hover:shadow-md transition-all group flex items-center justify-between relative overflow-hidden"
                >
                  {pkg.bonus > 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      +{pkg.bonus} TM Bônus
                    </div>
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="ri-vip-diamond-line text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-gray-900">{pkg.amount} TM</h4>
                      <p className="text-sm text-gray-500">Adicionar à carteira</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-bold text-lg text-teal-600">{pkg.price}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Comprar agora</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
