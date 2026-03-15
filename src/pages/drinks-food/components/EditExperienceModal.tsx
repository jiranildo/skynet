import { useState } from 'react';
import { FoodExperience } from '../../../services/supabase';

interface EditExperienceModalProps {
    experience: FoodExperience;
    onClose: () => void;
    onUpdate: (updated: FoodExperience) => void;
}

export default function EditExperienceModal({ experience, onClose, onUpdate }: EditExperienceModalProps) {
    const [formData, setFormData] = useState<FoodExperience>({ ...experience });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!formData.name || !formData.id) return;

        try {
            setLoading(true);
            const { foodExperienceService } = await import('../../../services/supabase');
            const updated = await foodExperienceService.update(formData.id, {
                name: formData.name,
                location: formData.location,
                type: formData.type,
                date: formData.date,
                price: formData.price,
                rating: formData.rating,
                description: formData.description,
            });
            onUpdate(updated);
        } catch (error) {
            console.error('Erro ao editar experiência:', error);
            alert('Não foi possível salvar as alterações.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-pink-50">
                    <h2 className="text-xl font-bold border-b border-gray-100 text-gray-800">
                        Editar Experiência
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-500">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome / Local</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço (opcional)</label>
                            <input
                                type="text"
                                value={formData.location || ''}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
                            <input
                                type="date"
                                value={formData.date ? formData.date.split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                <option value="restaurant">Restaurante</option>
                                <option value="wine">Vinho</option>
                                <option value="dish">Prato</option>
                                <option value="drink">Drink</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Preço ($)</label>
                            <select
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                <option value="">Não informado</option>
                                <option value="$">$ Econômico</option>
                                <option value="$$">$$ Justo</option>
                                <option value="$$$">$$$ Especial</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Avaliação Rápida</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="text-3xl transition-transform hover:scale-110"
                                >
                                    <i className={star <= (formData.rating || 0) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}></i>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !formData.name}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
}
