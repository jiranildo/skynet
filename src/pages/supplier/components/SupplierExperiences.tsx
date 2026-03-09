import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getSupplierExperiences, deleteExperience } from '../../../services/db/experiences';
import { Experience } from '../../../services/db/types';
import ExperienceModal from './ExperienceModal';

export default function SupplierExperiences() {
    const { user } = useAuth();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

    const loadExperiences = async () => {
        if (!user) return;
        setLoading(true);
        const data = await getSupplierExperiences(user.id);
        setExperiences(data as Experience[]);
        setLoading(false);
    };

    useEffect(() => {
        loadExperiences();
    }, [user]);

    const handleCreate = () => {
        setEditingExperience(null);
        setShowModal(true);
    };

    const handleEdit = (exp: Experience) => {
        setEditingExperience(exp);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta experiência?')) {
            const ok = await deleteExperience(id);
            if (ok) {
                setExperiences(experiences.filter(e => e.id !== id));
            } else {
                alert('Erro ao excluir.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <i className="ri-store-3-fill text-purple-500"></i>
                        Serviços e Experiências
                    </h2>
                    <p className="text-sm text-gray-500">
                        Gerencie tudo que você oferece no Marketplace para os viajantes.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <i className="ri-add-line"></i>
                    Novo Serviço
                </button>
            </div>

            {experiences.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="mx-auto w-24 h-24 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mb-4">
                        <i className="ri-shopping-basket-line text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum Serviço Cadastrado</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Comece agora mesmo a anunciar os seus serviços, hospedagens ou pacotes no Marketplace da Skynet.</p>
                    <button
                        onClick={handleCreate}
                        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-105 transition-all"
                    >
                        Criar o meu Primeiro!
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {experiences.map(exp => {
                        const isExpired = exp.validity_end_date ? new Date(exp.validity_end_date) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

                        return (
                            <div key={exp.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="h-48 relative overflow-hidden">
                                    {exp.cover_image ? (
                                        <img src={exp.cover_image} alt={exp.title} className={`w-full h-full object-cover transition-transform duration-500 ${isExpired ? 'grayscale' : 'group-hover:scale-110'}`} />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center text-purple-300 ${isExpired ? 'grayscale' : ''}`}>
                                            <i className="ri-image-line text-4xl"></i>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                                        {exp.category}
                                    </div>
                                    {isExpired && (
                                        <div className="absolute top-3 right-3 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                            <i className="ri-error-warning-line"></i> Expirado
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            <button onClick={() => handleEdit(exp)} className="w-10 h-10 bg-white text-gray-900 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center justify-center shadow-lg">
                                                <i className="ri-pencil-line"></i>
                                            </button>
                                            <button onClick={() => handleDelete(exp.id)} className="w-10 h-10 bg-white text-gray-900 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center shadow-lg">
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{exp.title}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                                        <i className="ri-map-pin-line"></i>
                                        <span className="truncate">{exp.location || 'Localização não definida'}</span>
                                    </div>

                                    {(exp.validity_start_date || exp.validity_end_date) && (
                                        <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium mb-3 bg-purple-50 px-2 py-1 rounded-lg w-fit">
                                            <i className="ri-calendar-event-line"></i>
                                            {exp.validity_start_date ? new Date(exp.validity_start_date).toLocaleDateString('pt-BR') : 'Agora'} - {exp.validity_end_date ? new Date(exp.validity_end_date).toLocaleDateString('pt-BR') : 'Indeterminado'}
                                        </div>
                                    )}

                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                                        {exp.description || 'Sem descrição.'}
                                    </p>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <i className="ri-shopping-cart-2-line"></i>
                                            {exp.sales_count && exp.sales_count > 0 ? `${exp.sales_count} vendas` : 'Sem vendas'}
                                        </div>
                                        {exp.sales_count && exp.sales_count > 0 && exp.total_revenue && (
                                            <div className="text-xs font-bold text-gray-400">
                                                Total: R$ {(exp.total_revenue / 1000).toFixed(1)}k
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Valor</div>
                                        <div className="font-black text-gray-900 flex items-center gap-1">
                                            {exp.price > 0 ? (
                                                <>
                                                    {exp.price} <span className="text-sm font-semibold text-purple-600">{exp.currency}</span>
                                                </>
                                            ) : (
                                                <span className="text-green-600">GRÁTIS</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {showModal && user && (
                <ExperienceModal
                    experience={editingExperience}
                    supplierId={user.id}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadExperiences();
                    }}
                />
            )}
        </div>
    );
}
