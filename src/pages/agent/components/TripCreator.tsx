import { useState } from 'react';
import { Trip } from '@/services/db/types';

export default function TripCreator({ onCancel }: { onCancel: () => void }) {
    const [step, setStep] = useState(1);

    return (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-lg max-w-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Criador de Experiência</h2>
                    <p className="text-gray-500 text-sm font-medium">Configure uma viagem premium para um cliente.</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <i className="ri-close-line text-2xl"></i>
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Título da Viagem</label>
                        <input
                            type="text"
                            placeholder="Ex: Paris Romantic Getaway"
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Destino</label>
                        <input
                            type="text"
                            placeholder="Ex: Paris, França"
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">ID do Cliente (UUID)</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cole o ID do usuário..."
                            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                        <i className="ri-user-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        className="flex-1 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl shadow-orange-100 hover:scale-[1.02] transition-all"
                    >
                        Próximo Passo
                    </button>
                </div>
            </div>
        </div>
    );
}
