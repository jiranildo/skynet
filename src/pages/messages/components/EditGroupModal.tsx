import React, { useState, useEffect, useRef } from 'react';
import {
    updateGroup, updateCommunity,
    getGroupMembers, getCommunityMembers,
    addGroupMember, addCommunityMember,
    removeGroupMember, removeCommunityMember,
    uploadGroupAvatar,
    createGroupInvite, getGroupInvites,
    revokeGroupInvite, remindGroupInvite
} from '@/services/messages/groupService';
import { searchUsers } from '@/services/supabase';
import { AlertModal } from '@/components/AlertModal';

interface EditGroupModalProps {
    type: 'group' | 'community';
    item: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditGroupModal({ type, item, onClose, onSuccess }: EditGroupModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'members' | 'invites'>('details');
    const [name, setName] = useState(item.name || '');
    const [description, setDescription] = useState(item.description || '');
    const [isPublic, setIsPublic] = useState(item.is_public || false);
    const [avatarUrl, setAvatarUrl] = useState(item.avatar_url || '');
    const [loading, setLoading] = useState(false);

    // Members State
    const [members, setMembers] = useState<any[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Invites State
    const [invites, setInvites] = useState<any[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' as any });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadMembers(),
                loadInvites()
            ]);
        } catch (e) {
            console.error('Failed to load data', e);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const data = type === 'group'
                ? await getGroupMembers(item.id)
                : await getCommunityMembers(item.id);
            setMembers(data || []);
        } catch (e) {
            console.error('Failed to load members', e);
        }
    };

    const loadInvites = async () => {
        try {
            const data = await getGroupInvites(item.id);
            setInvites(data || []);
        } catch (e) {
            console.error('Failed to load invites', e);
        }
    };

    const handleCreateInvite = async () => {
        try {
            setLoading(true);
            const data = await createGroupInvite(item.id, inviteEmail || undefined);
            setInvites(prev => [data, ...prev]);
            setInviteEmail('');
            setAlert({ isOpen: true, title: 'Sucesso', message: 'Convite gerado com sucesso!', type: 'success' });
        } catch (e) {
            console.error(e);
            setAlert({ isOpen: true, title: 'Erro', message: 'Falha ao criar convite', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeInvite = async (inviteId: string) => {
        try {
            await revokeGroupInvite(inviteId);
            setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: 'revoked' } : i));
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemindInvite = async (inviteId: string) => {
        try {
            await remindGroupInvite(inviteId);
            setAlert({ isOpen: true, title: 'Sucesso', message: 'Lembrete enviado!', type: 'success' });
        } catch (e) {
            console.error(e);
            setAlert({ isOpen: true, title: 'Erro', message: 'Falha ao enviar lembrete', type: 'danger' });
        }
    };

    const copyInviteLink = (code: string) => {
        const url = `${window.location.origin}/signup?invite=${code}`;
        navigator.clipboard.writeText(url);
        setAlert({ isOpen: true, title: 'Copiado', message: 'Link de convite copiado para a área de transferência!', type: 'success' });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                setLoading(true);
                const url = await uploadGroupAvatar(file);
                setAvatarUrl(url);
            } catch (error) {
                console.error(error);
                setAlert({ isOpen: true, title: 'Erro', message: 'Falha no upload da imagem', type: 'danger' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 3) {
            setSearchResults([]);
            return;
        }
        const users = await searchUsers(term);
        const filtered = users.filter((u: any) => !members.find(m => m.id === u.id));
        setSearchResults(filtered);
    };

    const handleAddMember = async (user: any) => {
        try {
            if (type === 'group') await addGroupMember(item.id, user.id);
            else await addCommunityMember(item.id, user.id);

            setMembers(prev => [...prev, user]);
            setSearchResults(prev => prev.filter(u => u.id !== user.id));
            setAlert({ isOpen: true, title: 'Sucesso', message: `${user.username} adicionado!`, type: 'success' });
        } catch (e) {
            console.error(e);
            setAlert({ isOpen: true, title: 'Erro', message: 'Falha ao adicionar membro', type: 'danger' });
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Remover este membro?')) return;
        try {
            if (type === 'group') await removeGroupMember(item.id, userId);
            else await removeCommunityMember(item.id, userId);

            setMembers(prev => prev.filter(m => m.id !== userId));
        } catch (e) {
            console.error(e);
            setAlert({ isOpen: true, title: 'Erro', message: 'Falha ao remover membro', type: 'danger' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = { name, description, is_public: isPublic, avatar_url: avatarUrl };
            if (type === 'group') {
                await updateGroup(item.id, updates);
            } else {
                await updateCommunity(item.id, updates);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to update:', error);
            setAlert({ isOpen: true, title: 'Erro', message: 'Falha ao atualizar. Tente novamente.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeUp flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">
                        Configurações do {type === 'group' ? 'Grupo' : 'Comunidade'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <i className="ri-close-line text-lg text-gray-500"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Detalhes
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'members' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Membros
                    </button>
                    <button
                        onClick={() => setActiveTab('invites')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'invites' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Convites
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'details' && (
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                {/* Avatar */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                    <i className="ri-camera-line text-3xl"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <i className="ri-image-edit-line text-white text-2xl"></i>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none h-20 resize-none"
                                    />
                                </div>

                                {/* Privacy */}
                                <div className="mb-6 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isPublic ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{isPublic ? 'Público' : 'Privado'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Membros ({members.length})</h3>
                                <button
                                    onClick={() => setShowAddMember(!showAddMember)}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                                >
                                    {showAddMember ? 'Fechar' : '+ Adicionar'}
                                </button>
                            </div>

                            {showAddMember && (
                                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-indigo-100 animate-fadeIn">
                                    <input
                                        value={searchTerm}
                                        onChange={e => handleSearch(e.target.value)}
                                        placeholder="Buscar por username..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                        {searchResults.map(user => (
                                            <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`} className="w-6 h-6 rounded-full object-cover" />
                                                    <span className="text-sm font-medium text-gray-800">{user.username}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAddMember(user)}
                                                    className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                                                >
                                                    ADICIONAR
                                                </button>
                                            </div>
                                        ))}
                                        {searchTerm.length >= 3 && searchResults.length === 0 && (
                                            <div className="text-center py-4 space-y-3">
                                                <p className="text-xs text-gray-500 italic">Nenhum usuário encontrado com "{searchTerm}"</p>
                                                {searchTerm.includes('@') && (
                                                    <button
                                                        onClick={() => {
                                                            setInviteEmail(searchTerm);
                                                            setActiveTab('invites');
                                                            setSearchTerm('');
                                                            setShowAddMember(false);
                                                        }}
                                                        className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <i className="ri-mail-send-line"></i>
                                                        CONVIDAR {searchTerm.toUpperCase()} POR E-MAIL
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {members.map(member => (
                                    <div key={member.id} className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}`} className="w-10 h-10 rounded-full bg-gray-200 object-cover border-2 border-white shadow-sm" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{member.full_name || member.username}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">@{member.username} • {member.role}</p>
                                            </div>
                                        </div>
                                        {member.role !== 'admin' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2 transition-all"
                                                title="Remover"
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'invites' && (
                        <div className="p-6">
                            <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <h4 className="text-xs font-bold text-indigo-900 uppercase mb-3">Gerar Novo Link de Convite</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="E-mail (opcional)"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    />
                                    <button
                                        onClick={handleCreateInvite}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                                    >
                                        <i className="ri-link-m"></i>
                                        {loading ? '...' : 'Gerar'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-indigo-400 mt-2">Links de convites automáticos funcionam mesmo para quem ainda não tem conta.</p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Convites Pendentes ({invites.filter(i => i.status === 'pending').length})</h3>
                                {invites.filter(i => i.status === 'pending').map(invite => (
                                    <div key={invite.id} className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Código: <span className="font-mono text-indigo-600">{invite.invite_code}</span></p>
                                                {invite.email && <p className="text-xs text-gray-500">{invite.email}</p>}
                                                <p className="text-[10px] text-gray-400">Criado em {new Date(invite.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleRemindInvite(invite.id)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Enviar Lembrete"
                                                >
                                                    <i className="ri-notification-3-line"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Revogar Link"
                                                >
                                                    <i className="ri-close-circle-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyInviteLink(invite.invite_code)}
                                            className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 border border-gray-100 flex items-center justify-center gap-2"
                                        >
                                            <i className="ri-file-copy-line"></i>
                                            COPIAR LINK DE CONVITE
                                        </button>
                                    </div>
                                ))}
                                {invites.filter(i => i.status === 'pending').length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <i className="ri-mail-send-line text-4xl mb-2 block"></i>
                                        <p className="text-xs italic">Nenhum convite ativo encontrado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AlertModal
                isOpen={alert.isOpen}
                onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
}
