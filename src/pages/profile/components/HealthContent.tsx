import { useState, useEffect } from 'react';
import { User, UserHealthInfo, getUserHealthInfo, addUserHealthInfo, deleteUserHealthInfo } from '../../../services/supabase';

interface HealthContentProps {
    userProfile: User | null;
    isEmbedded?: boolean;
}

export default function HealthContent({ userProfile, isEmbedded = false }: HealthContentProps) {
    const [healthInfo, setHealthInfo] = useState<UserHealthInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState<UserHealthInfo>({
        category: 'blood_type',
        name: '',
        details: '',
        date_ref: '',
        expiry_date: '',
        user_id: userProfile?.id,
    });

    useEffect(() => {
        if (userProfile?.id) {
            loadHealthInfo();
        }
    }, [userProfile?.id]);

    const loadHealthInfo = async () => {
        try {
            const data = await getUserHealthInfo(userProfile!.id);
            setHealthInfo(data);
        } catch (error) {
            console.error("Error loading health info:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.id) return;

        setFormLoading(true);
        try {
            await addUserHealthInfo({
                ...formData,
                user_id: userProfile.id
            });
            await loadHealthInfo();
            setIsAdding(false);
            setFormData({ // Reset form
                category: 'blood_type',
                name: '',
                details: '',
                date_ref: '',
                expiry_date: '',
                user_id: userProfile.id,
            });
        } catch (error) {
            console.error("Error adding health info:", error);
            alert("Erro ao adicionar informação de saúde.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta informação?")) return;
        try {
            await deleteUserHealthInfo(id);
            setHealthInfo(healthInfo.filter(h => h.id !== id));
        } catch (error) {
            console.error("Error deleting health info:", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Carregando informações de saúde...</div>;
    }

    const categoryLabels: Record<string, string> = {
        blood_type: 'Tipo Sanguíneo',
        condition: 'Condição Médica / Doença',
        medication: 'Medicamento',
        vaccine: 'Vacina',
        allergy: 'Alergia',
        emergency_contact: 'Contato de Emergência',
        insurance: 'Seguro Saúde',
    };

    const categoryIcons: Record<string, string> = {
        blood_type: 'drop',
        condition: 'pulse',
        medication: 'capsule',
        vaccine: 'syringe',
        allergy: 'alert',
        emergency_contact: 'phone',
        insurance: 'shield-cross',
    };

    const categoryColors: Record<string, string> = {
        blood_type: 'red',
        condition: 'orange',
        medication: 'blue',
        vaccine: 'green',
        allergy: 'yellow',
        emergency_contact: 'purple',
        insurance: 'teal',
    };

    return (
        <div className={`bg-white ${!isEmbedded ? 'rounded-xl shadow-sm p-6' : ''}`}>
            {!isAdding ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Saúde</h2>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <i className="ri-add-line"></i>
                            Adicionar
                        </button>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 mb-6 text-sm text-green-800 border border-green-100 flex gap-3">
                        <i className="ri-shield-cross-line text-lg"></i>
                        <p>Mantenha suas informações de saúde atualizadas para emergências e viagens.</p>
                    </div>

                    {healthInfo.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <i className="ri-heart-pulse-line text-4xl mb-3 block opacity-50"></i>
                            <p>Nenhuma informação de saúde cadastrada.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {healthInfo.map((info) => {
                                const color = categoryColors[info.category] || 'gray';
                                return (
                                    <div key={info.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-${color}-100 text-${color}-600 rounded-lg flex items-center justify-center`}>
                                                    <i className={`ri-${categoryIcons[info.category] || 'folder'}-line text-xl`}></i>
                                                </div>
                                                <div>
                                                    <span className={`text-xs font-bold text-${color}-600 uppercase tracking-wide block`}>{categoryLabels[info.category]}</span>
                                                    <span className="font-medium text-gray-900">{info.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600 mt-2 pl-1 border-t border-gray-100 pt-2">
                                            {info.details && <p className="mb-1">{info.details}</p>}

                                            {info.date_ref && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <i className="ri-calendar-event-line"></i>
                                                    <span>Data: {new Date(info.date_ref).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {info.expiry_date && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <i className="ri-calendar-check-line"></i>
                                                    <span>Validade: {new Date(info.expiry_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDelete(info.id!)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-gray-100 rounded-lg"
                                            title="Excluir"
                                        >
                                            <i className="ri-delete-bin-line text-lg"></i>
                                        </button>
                                    </div>
                                )
                            })}
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

                    <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Informação de Saúde</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            >
                                <option value="blood_type">Tipo Sanguíneo</option>
                                <option value="condition">Condição Médica / Doença</option>
                                <option value="medication">Medicamento (Controle)</option>
                                <option value="vaccine">Vacina (Carteira de Vacinação)</option>
                                <option value="allergy">Alergia</option>
                                <option value="emergency_contact">Contato de Emergência</option>
                                <option value="insurance">Seguro Saúde</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.category === 'blood_type' ? 'Tipo (Ex: O+)' :
                                    formData.category === 'medication' ? 'Nome do Medicamento' :
                                        formData.category === 'emergency_contact' ? 'Nome do Contato' :
                                            'Nome / Título'}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="Informe o nome ou título"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.category === 'medication' ? 'Dosagem / Frequência' :
                                    formData.category === 'emergency_contact' ? 'Telefone / Grau de Parentesco' :
                                        'Detalhes Adicionais'}
                            </label>
                            <textarea
                                value={formData.details || ''}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all h-24 resize-none"
                                placeholder="Detalhes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.category === 'vaccine' ? 'Data da Aplicação' : 'Data de Referência (Opcional)'}
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_ref || ''}
                                    onChange={(e) => setFormData({ ...formData, date_ref: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade (Opcional)</label>
                                <input
                                    type="date"
                                    value={formData.expiry_date || ''}
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                />
                            </div>
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
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
