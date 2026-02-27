import { motion } from 'framer-motion';

export default function AgentStats() {
    const stats = [
        { label: 'Viagens Ativas', value: '12', icon: 'ri-flight-takeoff-line', color: 'bg-blue-50 text-blue-600' },
        { label: 'Viajantes Suportados', value: '48', icon: 'ri-user-heart-line', color: 'bg-pink-50 text-pink-600' },
        { label: 'Ganhos no Mês', value: 'TM 12.500', icon: 'ri-coins-line', color: 'bg-orange-50 text-orange-600' },
        { label: 'Avaliação Média', value: '4.9', icon: 'ri-star-line', color: 'bg-purple-50 text-purple-600' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                    >
                        <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <i className={`${stat.icon} text-2xl`}></i>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Atividades Recentes</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <i className="ri-notification-3-line text-gray-400"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Nova viagem criada para Vanessa Matos</p>
                                    <p className="text-xs text-gray-500">Destino: Paris, França • Há 2 horas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Suporte SARA Plus</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">Você tem acesso ao suporte prioritário para agentes parceiros.</p>
                        <button className="bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all">
                            Falar com SARA
                        </button>
                    </div>
                    <i className="ri-customer-service-2-line absolute -bottom-4 -right-4 text-9xl text-white/5 font-black"></i>
                </div>
            </div>
        </div>
    );
}
