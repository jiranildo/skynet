import { useState, useEffect } from 'react';
import type { ManageUserPayload } from '../../../services/db/admin';
import type { User, Role } from '../../../services/db/types';
import { uploadFile } from '../../../services/db/posts';
import { AlertModal } from '../../../components/AlertModal';
import { useAuth } from '../../../context/AuthContext';

interface AdminUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ManageUserPayload, isEdit: boolean) => Promise<void>;
    userToEdit?: User | null;
    currentUserRole: string;
    entities?: { id: string, name: string }[];
    dbRoles?: Role[];
}

export default function AdminUserModal({ isOpen, onClose, onSave, userToEdit, currentUserRole, entities, dbRoles }: AdminUserModalProps) {
    const { user } = useAuth();

    const [formData, setFormData] = useState<ManageUserPayload>({
        full_name: '',
        username: '',
        email: '',
        password: '',
        role: 'viajante',
        status: 'active',
        force_password_reset: false,
        avatar_url: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                full_name: userToEdit.full_name || '',
                username: userToEdit.username || '',
                email: '', // Don't populate email to avoid confusion since we don't have it in public table
                password: '',
                role: userToEdit.role || 'viajante',
                role_id: userToEdit.role_id || '',
                status: userToEdit.status || 'active',
                force_password_reset: userToEdit.force_password_reset || false,
                avatar_url: userToEdit.avatar_url || '',
                entity_id: userToEdit.entity_id || ''
            });
        } else {
            setFormData({
                full_name: '',
                username: '',
                email: '',
                password: '',
                role: 'viajante',
                role_id: '00000000-0000-0000-0000-000000000004',
                status: 'active',
                force_password_reset: false,
                avatar_url: '',
                entity_id: ''
            });
        }
        setErrorMsg('');
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        // Basic validation
        if (!userToEdit && (!formData.email || !formData.password)) {
            setErrorMsg('Email e senha são obrigatórios para novos usuários.');
            return;
        }

        setIsSaving(true);
        const finalData = { ...formData };
        // Clean up entity_id if it's empty to prevent sending empty string instead of null
        if (!finalData.entity_id) {
            delete finalData.entity_id;
        }

        // Send created_by explicitly on creation
        if (!userToEdit && user) {
            finalData.created_by = user.id;
        }

        try {
            await onSave(finalData, !!userToEdit);
            onClose();
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao salvar usuário.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setErrorMsg('');
        try {
            const url = await uploadFile('avatars', file);
            setFormData(prev => ({ ...prev, avatar_url: url }));
        } catch (error: any) {
            setErrorMsg('Erro ao fazer upload do avatar: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerateAvatar = async () => {
        if (!formData.full_name && !formData.username) {
            setErrorMsg('Digite o nome completo ou username antes de gerar um avatar.');
            return;
        }

        setIsGeneratingAvatar(true);
        setErrorMsg('');
        try {
            const seed = encodeURIComponent(formData.username || formData.full_name || 'user');
            const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
            setFormData(prev => ({ ...prev, avatar_url: url }));
        } catch (error: any) {
            setErrorMsg('Erro ao gerar avatar: ' + error.message);
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const isSuperAdmin = currentUserRole === 'super_admin';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-lg p-6 md:p-8 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">
                        {userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                        <AlertModal
                            isOpen={!!errorMsg}
                            onClose={() => setErrorMsg('')}
                            title="Erro Administrativo"
                            message={errorMsg}
                            type="danger"
                        />

                        <div className="space-y-1.5 flex flex-col items-center mb-6">
                            <label className="text-sm font-bold text-gray-700 w-full text-left ml-1">Avatar / Foto</label>

                            <div className="flex w-full items-start gap-4">
                                <div className="shrink-0 relative group">
                                    <div className="h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="ri-user-3-line text-3xl text-gray-400"></i>
                                        )}
                                    </div>
                                    {formData.avatar_url && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remover Avatar"
                                        >
                                            <i className="ri-close-line text-sm"></i>
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.avatar_url || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                                            className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                            placeholder="https://.../foto.png"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGenerateAvatar}
                                            disabled={isGeneratingAvatar || (!formData.full_name && !formData.username)}
                                            className="px-3 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-bold flex items-center justify-center gap-1 disabled:opacity-50 text-sm whitespace-nowrap"
                                        >
                                            {isGeneratingAvatar ? (
                                                <i className="ri-loader-4-line animate-spin"></i>
                                            ) : (
                                                <i className="ri-magic-line"></i>
                                            )}
                                            Gerar IA
                                        </button>
                                    </div>
                                    <label className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-red-300 transition-all text-gray-500">
                                        {isUploading ? (
                                            <div className="flex items-center gap-2">
                                                <i className="ri-loader-4-line animate-spin"></i>
                                                <span className="text-sm font-bold">Enviando...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <i className="ri-upload-2-line"></i>
                                                <span className="text-sm font-bold">Fazer Upload de Arquivo</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Username (sem @)</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.replace('@', '') }))}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                Email {userToEdit && <span className="font-normal text-xs text-gray-500">(Opcional para alteração)</span>}
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                required={!userToEdit}
                                placeholder={userToEdit ? "Oculto por segurança (preencha para alterar)" : "usuario@exemplo.com"}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                Senha {userToEdit && <span className="font-normal text-xs text-gray-500">(Deixe em branco para não alterar)</span>}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                required={!userToEdit}
                                minLength={6}
                                placeholder={userToEdit ? "Deixe em branco para manter a senha" : "No mínimo 6 caracteres"}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Perfil (Role)</label>
                                {dbRoles && dbRoles.length > 0 ? (
                                    <select
                                        value={formData.role_id || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled>Selecione um perfil</option>
                                        {dbRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                                        required
                                    >
                                        <option value="viajante">Role Básica (Free)</option>
                                        <option value="agente">Agente</option>
                                        <option value="fornecedor">Fornecedor</option>
                                        {isSuperAdmin && <option value="admin">Administrador</option>}
                                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                                    required
                                >
                                    <option value="active">Ativo</option>
                                    <option value="suspended">Suspenso</option>
                                    <option value="banned">Banido</option>
                                </select>
                            </div>
                        </div>

                        {isSuperAdmin && (
                            <div className="space-y-1.5 mt-4">
                                <label className="text-sm font-bold text-gray-700 ml-1">Empresa / Agência</label>
                                <select
                                    value={formData.entity_id || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, entity_id: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
                                    disabled={!entities || entities.length === 0}
                                >
                                    <option value="">Nenhuma (Vazio)</option>
                                    {entities?.map(entity => (
                                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-4 ml-1">
                            <input
                                type="checkbox"
                                id="force_password_reset"
                                checked={formData.force_password_reset}
                                onChange={(e) => setFormData(prev => ({ ...prev, force_password_reset: e.target.checked }))}
                                className="w-4 h-4 text-red-500 rounded focus:ring-red-500 border-gray-300"
                            />
                            <label htmlFor="force_password_reset" className="text-sm text-gray-700 cursor-pointer select-none">
                                Exigir troca de senha no primeiro login
                            </label>
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
                        form="user-form"
                        disabled={isSaving}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Salvar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
