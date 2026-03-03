import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateTravelItinerary } from '@/services/gemini';
import { createManagedTrip } from '@/services/db/agent';
import { Trip } from '@/services/db/types';

export default function TripCreator({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [clientInput, setClientInput] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        client_ids: [] as string[],
        budget: 'Medium',
        duration: 7,
        type: 'Lazer'
    });

    const handleGenerateAI = async () => {
        if (!formData.destination) return;
        setGenerating(true);
        try {
            const aiTrip = await generateTravelItinerary(
                formData.destination,
                formData.budget,
                formData.type,
                formData.duration
            );
            if (aiTrip) {
                setFormData(prev => ({
                    ...prev,
                    title: aiTrip.title || prev.title,
                }));
                // In a real app we'd show the preview here
                alert('Roteiro gerado com sucesso pela IA!');
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleAddClient = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const id = clientInput.trim();
            if (id && !formData.client_ids.includes(id)) {
                setFormData(prev => ({ ...prev, client_ids: [...prev.client_ids, id] }));
            }
            setClientInput('');
        }
    };

    const handleRemoveClient = (idToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            client_ids: prev.client_ids.filter(id => id !== idToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            const success = await createManagedTrip({
                user_id: user.id,
                title: formData.title,
                destination: formData.destination,
                status: 'planning',
                travelers: Math.max(1, formData.client_ids.length),
                metadata: {
                    sharedWith: formData.client_ids.map(id => ({ id }))
                }
            });
            if (success) {
                onSuccess();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl max-w-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Criador de Experiência</h2>
                    <p className="text-gray-500 text-sm font-medium">Configure uma viagem premium para um ou mais clientes.</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="ri-close-line text-2xl"></i>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Título da Viagem</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Paris Romantic Getaway"
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Destino</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                placeholder="Ex: Paris, França"
                                className="w-full bg-gray-50 border-none rounded-2xl pl-5 pr-12 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={generating || !formData.destination}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all disabled:opacity-30"
                                title="Gerar com IA"
                            >
                                {generating ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div> : <i className="ri-magic-line text-xl"></i>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Duração (dias)</label>
                        <input
                            type="number"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Budget</label>
                        <select
                            value={formData.budget}
                            onChange={e => setFormData({ ...formData, budget: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium appearance-none"
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Luxury</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tipo</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium appearance-none"
                        >
                            <option>Lazer</option>
                            <option>Negócios</option>
                            <option>Aventura</option>
                            <option>Romântico</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">IDs dos Clientes (Pressione ENTER)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={clientInput}
                            onChange={e => setClientInput(e.target.value)}
                            onKeyDown={handleAddClient}
                            placeholder="Cole o ID do usuário e pressione Enter..."
                            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                        <i className="ri-user-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                    </div>

                    {formData.client_ids.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {formData.client_ids.map(id => (
                                <div key={id} className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
                                    <span className="truncate max-w-[150px]">{id}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveClient(id)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <i className="ri-close-circle-fill"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        Criar Experiência
                    </button>
                </div>
            </form>
        </div>
    );
}
