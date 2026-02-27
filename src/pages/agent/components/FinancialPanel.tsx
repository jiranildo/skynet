export default function FinancialPanel() {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Wallet Balance */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-white/70 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Saldo Disponível</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-black">TM 42.850</span>
                        <span className="text-white/60 font-medium text-sm">~ R$ 4.285,00</span>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black hover:scale-105 transition-all text-sm">
                            Solicitar Resgate
                        </button>
                        <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-2xl font-black hover:bg-white/30 transition-all text-sm">
                            Ver Extrato
                        </button>
                    </div>
                </div>

                {/* Abstract shapes */}
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-400/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Transactions */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Últimas Transações</h3>
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <i className="ri-arrow-left-down-line text-emerald-600"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Comissão de Venda - Paris Luxo</p>
                                    <p className="text-xs text-gray-500">24 Fev 2026</p>
                                </div>
                            </div>
                            <p className="font-bold text-emerald-600">+ TM 1.200</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
