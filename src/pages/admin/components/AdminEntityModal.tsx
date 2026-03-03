import { useState, useEffect } from 'react';
import type { ManageEntityPayload } from '../../../services/db/admin';
import type { Entity } from '../../../services/db/types';
import { uploadFile } from '../../../services/db/posts';
import { AlertModal } from '../../../components/AlertModal';

interface AdminEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ManageEntityPayload, isEdit: boolean) => Promise<void>;
    entityToEdit?: Entity | null;
    currentUserRole: string;
}

export default function AdminEntityModal({ isOpen, onClose, onSave, entityToEdit, currentUserRole }: AdminEntityModalProps) {
    const defaultTheme = { primary_color: '#f97316', secondary_color: '#ea580c', logo_url: '' };

    const [formData, setFormData] = useState<ManageEntityPayload>({
        name: '',
        type: 'agency',
        theme_config: defaultTheme
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (entityToEdit) {
            setFormData({
                name: entityToEdit.name || '',
                type: entityToEdit.type || 'agency',
                theme_config: { ...defaultTheme, ...(entityToEdit.theme_config || {}) }
            });
        } else {
            setFormData({
                name: '',
                type: 'agency',
                theme_config: defaultTheme
            });
        }
        setErrorMsg('');
    }, [entityToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name) {
            setErrorMsg('Nome da empresa é obrigatório.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData, !!entityToEdit);
            onClose();
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao salvar empresa.');
        } finally {
            setIsSaving(false);
        }
    };

    const isSuperAdmin = currentUserRole === 'super_admin';

    // Helper to update theme config
    const updateThemeConfig = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            theme_config: {
                ...(prev.theme_config || {}),
                [key]: value
            }
        }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setErrorMsg('');
        try {
            const url = await uploadFile('posts', file); // using posts bucket as general storage for now
            updateThemeConfig('logo_url', url);
        } catch (error: any) {
            setErrorMsg('Erro ao fazer upload da logo: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerateLogo = async () => {
        if (!formData.name) {
            setErrorMsg('Digite o nome da empresa antes de gerar uma logo.');
            return;
        }

        setIsGeneratingLogo(true);
        setErrorMsg('');
        try {
            // Utilizando o Readdy AI Image Search / Genérico
            const encodedName = encodeURIComponent(formData.name + ' logo minimalist professional');
            const url = `https://readdy.ai/api/search-image?query=${encodedName}&width=400&height=400&orientation=squarish`;
            updateThemeConfig('logo_url', url);
        } catch (error: any) {
            setErrorMsg('Erro ao gerar logo: ' + error.message);
        } finally {
            setIsGeneratingLogo(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        {entityToEdit ? 'Editar Empresa e Look & Feel' : 'Nova Empresa'}
                    </h2>

                    <AlertModal
                        isOpen={!!errorMsg}
                        onClose={() => setErrorMsg('')}
                        title="Aviso"
                        message={errorMsg}
                        type="danger"
                    />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                    placeholder="Ex: Skynet Travel Agency"
                                />
                            </div>

                            {/* Only Super Admins can change the type of an existing entity or create new ones */}
                            {(isSuperAdmin || !entityToEdit) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entidade</label>
                                    <select
                                        value={formData.type || 'agency'}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                    >
                                        <option value="agency">Agência (B2B)</option>
                                        <option value="supplier">Fornecedor</option>
                                        <option value="individual">Individual</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 mt-6">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Look & Feel (Visual)</h3>
                            <p className="text-xs text-gray-500 mb-2">Configure as cores e logo desta empresa. O aplicativo se adaptará a este tema para os usuários logados desta empresa.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="color"
                                            value={formData.theme_config?.primary_color || '#f97316'}
                                            onChange={e => updateThemeConfig('primary_color', e.target.value)}
                                            className="w-10 h-10 border rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme_config?.primary_color || '#f97316'}
                                            onChange={e => updateThemeConfig('primary_color', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="#f97316"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="color"
                                            value={formData.theme_config?.secondary_color || '#ea580c'}
                                            onChange={e => updateThemeConfig('secondary_color', e.target.value)}
                                            className="w-10 h-10 border rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.theme_config?.secondary_color || '#ea580c'}
                                            onChange={e => updateThemeConfig('secondary_color', e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="#ea580c"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Logo</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={formData.theme_config?.logo_url || ''}
                                        onChange={e => updateThemeConfig('logo_url', e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-shadow"
                                        placeholder="https://exemplo.com/logo.png"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGenerateLogo}
                                        disabled={isGeneratingLogo || !formData.name}
                                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
                                    >
                                        {isGeneratingLogo ? (
                                            <i className="ri-loader-4-line animate-spin"></i>
                                        ) : (
                                            <i className="ri-magic-line"></i>
                                        )}
                                        Gerar IA
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-orange-300 transition-all text-gray-500">
                                            {isUploading ? (
                                                <div className="flex items-center gap-2">
                                                    <i className="ri-loader-4-line animate-spin"></i>
                                                    <span className="text-sm font-medium">Enviando...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <i className="ri-upload-2-line"></i>
                                                    <span className="text-sm font-medium">Fazer Upload de Arquivo</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                                {formData.theme_config?.logo_url && (
                                    <div className="mt-4 text-center bg-gray-50 border rounded-xl p-4 relative group">
                                        <img src={formData.theme_config.logo_url} alt="Logo Preview" className="h-20 w-auto mx-auto object-contain rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => updateThemeConfig('logo_url', '')}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                            title="Remover Logo"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Empresa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
