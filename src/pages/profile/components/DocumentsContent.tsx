import { useState, useEffect } from 'react';
import { User, UserDocument, getUserDocuments, addUserDocument, deleteUserDocument } from '../../../services/supabase';

interface DocumentsContentProps {
    userProfile: User | null;
    isEmbedded?: boolean;
}

export default function DocumentsContent({ userProfile, isEmbedded = false }: DocumentsContentProps) {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState<UserDocument>({
        type: 'passport',
        number: '',
        country: '',
        expiry_date: '',
        user_id: userProfile?.id,
    });

    useEffect(() => {
        if (userProfile?.id) {
            loadDocuments();
        }
    }, [userProfile?.id]);

    const loadDocuments = async () => {
        try {
            const data = await getUserDocuments(userProfile!.id);
            setDocuments(data);
        } catch (error) {
            console.error("Error loading documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile?.id) return;

        setFormLoading(true);
        try {
            await addUserDocument({
                ...formData,
                user_id: userProfile.id
            });
            await loadDocuments();
            setIsAdding(false);
            setFormData({ // Reset form
                type: 'passport',
                number: '',
                country: '',
                expiry_date: '',
                user_id: userProfile.id,
            });
        } catch (error) {
            console.error("Error adding document:", error);
            alert("Erro ao adicionar documento.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este documento?")) return;
        try {
            await deleteUserDocument(id);
            setDocuments(documents.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Carregando documentos...</div>;
    }

    const docTypeLabels: Record<string, string> = {
        passport: 'Passaporte',
        visa: 'Visto',
        id_card: 'RG / Identidade',
        driver_license: 'CNH',
        other: 'Outro'
    };

    return (
        <div className={`bg-white ${!isEmbedded ? 'rounded-xl shadow-sm p-6' : ''}`}>
            {!isAdding ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Meus Documentos</h2>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <i className="ri-add-line"></i>
                            Adicionar
                        </button>
                    </div>

                    {documents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <i className="ri-file-list-line text-4xl mb-3 block opacity-50"></i>
                            <p>Nenhum documento cadastrado.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <i className={`ri-${doc.type === 'passport' ? 'passport' : doc.type === 'visa' ? 'global' : doc.type === 'driver_license' ? 'car' : 'file-user'}-line text-xl`}></i>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block">{docTypeLabels[doc.type] || doc.type}</span>
                                                <span className="text-lg font-mono text-gray-900">{doc.number}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-600 mt-3 pl-1">
                                        {doc.country && (
                                            <div className="flex items-center gap-2">
                                                <i className="ri-map-pin-line text-gray-400"></i>
                                                <span>País: {doc.country}</span>
                                            </div>
                                        )}
                                        {doc.expiry_date && (
                                            <div className={`flex items-center gap-2 ${new Date(doc.expiry_date) < new Date() ? 'text-red-500 font-medium' : ''}`}>
                                                <i className="ri-calendar-line text-gray-400"></i>
                                                <span>Validade: {new Date(doc.expiry_date).toLocaleDateString()}</span>
                                                {new Date(doc.expiry_date) < new Date() && <span className="text-xs border border-red-200 bg-red-50 px-1 rounded">Vencido</span>}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(doc.id!)}
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

                    <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Documento</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="passport">Passaporte</option>
                                <option value="visa">Visto</option>
                                <option value="id_card">RG / Identidade</option>
                                <option value="driver_license">CNH</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <input
                                type="text"
                                required
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ex: AB123456"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">País Emissor (Opcional)</label>
                            <input
                                type="text"
                                value={formData.country || ''}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ex: Brasil"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade (Opcional)</label>
                            <input
                                type="date"
                                value={formData.expiry_date || ''}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
