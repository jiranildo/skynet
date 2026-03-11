import { useState, useEffect } from 'react';
import type { Role } from '../../../services/db/types';
import { AlertModal } from '../../../components/AlertModal';

interface AdminRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Partial<Role>, isEdit: boolean) => Promise<void>;
    roleToEdit?: Role | null;
}

const AVAILABLE_PERMISSIONS = [
    // 1. Admin
    { key: 'can_access_admin', label: 'Acesso ao Painel Admin', category: 'Admin' },
    { key: 'can_manage_users', label: 'Gerenciar Usuários', category: 'Admin' },
    { key: 'can_manage_roles', label: 'Gerenciar Perfis/Roles', category: 'Admin' },
    { key: 'can_manage_entities', label: 'Gerenciar Empresas/Entidades', category: 'Admin' },
    { key: 'can_moderate_marketplace', label: 'Moderar Marketplace', category: 'Admin' },
    { key: 'can_view_analytics', label: 'Ver Métricas e Analytics', category: 'Admin' },

    // 2. SARA AI
    { key: 'can_access_sara_ai', label: 'Acesso à SARA AI', category: 'SARA AI' },
    { key: 'can_show_floating_ai', label: 'Botão Flutuante SARA', category: 'SARA AI' },
    { key: 'can_use_ai_features', label: 'Recursos de IA', category: 'SARA AI' },
    { key: 'can_manage_ai_settings', label: 'Gerenciar Modelos IA', category: 'SARA AI' },
    { key: 'can_ai_search', label: 'Pesquisa AI', category: 'SARA AI' },
    { key: 'can_ai_personalize', label: 'Personalizar IA', category: 'SARA AI' },
    { key: 'can_ai_generate', label: 'Gerar com IA', category: 'SARA AI' },

    // 3. Viagens
    { key: 'can_access_travel', label: 'Viagens', category: 'Viagens' },
    { key: 'can_create_trips', label: 'Roteiros de Viagem', category: 'Viagens' },
    { key: 'can_manage_blog', label: 'Blog de Viagens', category: 'Viagens' },
    { key: 'can_access_marketplace', label: 'Marketplace', category: 'Viagens' },

    // 4. Social
    { key: 'can_access_messages', label: 'Mensagens', category: 'Social' },
    { key: 'can_post_social', label: 'Posts Sociais', category: 'Social' },
    { key: 'can_access_explorer', label: 'Explorer', category: 'Social' },
    { key: 'can_manage_checkins', label: 'Check In/Out', category: 'Social' },

    // 5. Personalização
    { key: 'can_access_wallet', label: 'Carteira Digital', category: 'Personalização' },
    { key: 'can_access_my_space', label: 'Meu Espaço', category: 'Personalização' },
    { key: 'can_customize_platform', label: 'Personalizar Portal', category: 'Personalização' },
    { key: 'can_access_gamification', label: 'Gamificação', category: 'Personalização' },
    { key: 'can_access_play_explorer', label: 'SARA Play Explorer', category: 'Personalização' },
    { key: 'can_access_notifications', label: 'Notificações', category: 'Personalização' },
    { key: 'can_access_messages', label: 'Mensagens', category: 'Personalização' },
    { key: 'can_access_cellar', label: 'Minha Adega', category: 'Personalização' },
    { key: 'can_access_drinks_food', label: 'Drinks & Food', category: 'Personalização' },

    // 6. Portais
    { key: 'can_access_services_portal', label: 'Portal de Servicos', category: 'Portais' },
    { key: 'can_access_agent_portal', label: 'Portal do Agente', category: 'Portais' },
];

export default function AdminRoleModal({ isOpen, onClose, onSave, roleToEdit }: AdminRoleModalProps) {
    const [formData, setFormData] = useState<Partial<Role>>({
        name: '',
        description: '',
        permissions: {}
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (roleToEdit) {
            setFormData({
                name: roleToEdit.name || '',
                description: roleToEdit.description || '',
                permissions: roleToEdit.permissions || {}
            });
        } else {
            setFormData({
                name: '',
                description: '',
                permissions: {}
            });
        }
        setErrorMsg('');
    }, [roleToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name) {
            setErrorMsg('Nome do perfil é obrigatório.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData, !!roleToEdit);
            onClose();
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao salvar perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (key: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions?.[key]
            }
        }));
    };

    // Group permissions by category
    const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-2xl p-6 md:p-8 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">
                        {roleToEdit ? 'Editar Perfil' : 'Novo Perfil'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
                        <AlertModal
                            isOpen={!!errorMsg}
                            onClose={() => setErrorMsg('')}
                            title="Erro"
                            message={errorMsg}
                            type="danger"
                        />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Nome do Perfil</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    placeholder="Ex: Gerente Administrativo"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Descrição</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descreva as responsabilidades deste perfil..."
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider ml-1">Permissões de Acesso</h3>

                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">{category}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {perms.map((perm) => (
                                            <div
                                                key={`${perm.key}-${category}`}
                                                onClick={() => togglePermission(perm.key)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.permissions?.[perm.key]
                                                    ? 'bg-red-50 border-red-200 text-red-700'
                                                    : 'bg-white border-transparent text-gray-600 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.permissions?.[perm.key]
                                                    ? 'bg-red-500 border-red-500 text-white'
                                                    : 'bg-white border-gray-300'
                                                    }`}>
                                                    {formData.permissions?.[perm.key] && <i className="ri-check-line text-xs"></i>}
                                                </div>
                                                <span className="text-sm font-medium">{perm.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="role-form"
                        disabled={isSaving}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Salvar Perfil'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
