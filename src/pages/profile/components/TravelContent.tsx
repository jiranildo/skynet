import { useState, useEffect } from 'react';
import { User, UserTravelProfile, getUserTravelProfile, addUserTravelProfile, deleteUserTravelProfile } from '../../../services/supabase';

interface TravelContentProps {
    userProfile: User | null;
    isEmbedded?: boolean;
}

export default function TravelContent({ userProfile, isEmbedded = false }: TravelContentProps) {
    const [preferences, setPreferences] = useState<UserTravelProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState<UserTravelProfile>({
        preference_type: 'seat',
        value: '',
        description: '',
        user_id: userProfile?.id,
    });

    useEffect(() => {
        if (userProfile?.id) {
            loadPreferences();
        }
    }, [userProfile?.id]);

    const loadPreferences = async () => {
        try {
            const data = await getUserTravelProfile(userProfile!.id);
            setPreferences(data);
        } catch (error) {
            console.error("Error loading travel preferences:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.id) return;

        setFormLoading(true);
        try {
            await addUserTravelProfile({
                ...formData,
                user_id: userProfile.id
            });
            await loadPreferences();
            setIsAdding(false);
            setFormData({ // Reset form
                preference_type: 'seat',
                value: '',
                description: '',
                user_id: userProfile.id,
            });
        } catch (error) {
            console.error("Error adding preference:", error);
            alert("Erro ao adicionar preferência.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta preferência?")) return;
        try {
            await deleteUserTravelProfile(id);
            setPreferences(preferences.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting preference:", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Carregando perfil de viagem...</div>;
    }

    const typeLabels: Record<string, string> = {
        seat: 'Assento',
        meal: 'Refeição',
        frequent_flyer: 'Programa de Milhagem',
        hotel: 'Preferência de Hotel',
        car: 'Preferência de Carro',
        other: 'Outro'
    };

    const typeIcons: Record<string, string> = {
        seat: 'armchair',
        meal: 'restaurant',
        frequent_flyer: 'plane',
        hotel: 'hotel-bed',
        car: 'car',
        other: 'star'
    };

    return (
        <div className={`bg-white ${!isEmbedded ? 'rounded-xl shadow-sm p-6' : ''}`}>
            {!isAdding ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Perfil de Viagem</h2>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <i className="ri-add-line"></i>
                            Adicionar
                        </button>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 mb-6 text-sm text-orange-800 border border-orange-100 flex gap-3">
                        <i className="ri-lightbulb-line text-lg"></i>
                        <p>Adicione suas preferências para que a IA possa personalizar melhor seus roteiros de viagem.</p>
                    </div>

                    {preferences.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <i className="ri-suitcase-line text-4xl mb-3 block opacity-50"></i>
                            <p>Nenhuma preferência cadastrada.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {preferences.map((pref) => (
                                <div key={pref.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                                <i className={`ri-${typeIcons[pref.preference_type] || 'star'}-line text-xl`}></i>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wide block">{typeLabels[pref.preference_type]}</span>
                                                <span className="font-medium text-gray-900">{pref.value}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {pref.description && (
                                        <div className="mt-2 pl-1 pt-2 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 italic">"{pref.description}"</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleDelete(pref.id!)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-gray-100 rounded-lg"
                                        title="Excluir"
                                    >
                                        <i className="ri-delete-bin-line text-lg"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => setIsAdding(false)}
                        className="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <i className="ri-arrow-left-line"></i> Voltar para lista
                    </button>

                    <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Preferência</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Preferência</label>
                            <select
                                value={formData.preference_type}
                                onChange={(e) => setFormData({ ...formData, preference_type: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            >
                                <option value="seat">Assento (Janela, Corredor...)</option>
                                <option value="meal">Refeição (Vegetariana, Kosher...)</option>
                                <option value="frequent_flyer">Programa de Milhagem</option>
                                <option value="hotel">Preferência de Hotel</option>
                                <option value="car">Preferência de Carro</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor / Preferência</label>
                            <input
                                type="text"
                                required
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                placeholder={formData.preference_type === 'seat' ? 'Ex: Janela' : formData.preference_type === 'frequent_flyer' ? 'Ex: AA - 1234567' : 'Sua preferência'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Detalhes (Opcional)</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all h-24 resize-none"
                                placeholder="Detalhes adicionais..."
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {formLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
