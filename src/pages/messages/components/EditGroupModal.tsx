import React, { useState, useEffect, useRef } from 'react';
import {
    updateGroup, updateCommunity,
    getGroupMembers, getCommunityMembers,
    addGroupMember, addCommunityMember,
    removeGroupMember, removeCommunityMember,
    uploadGroupAvatar
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'info' as any });

    useEffect(() => {
        loadMembers();
    }, []);

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
        // Filter out existing members
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
                        Editar {type === 'group' ? 'Grupo' : 'Comunidade'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <i className="ri-close-line text-lg text-gray-500"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
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

                        {/* Members Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">Membros ({members.length})</label>
                                <button
                                    type="button"
                                    onClick={() => setShowAddMember(!showAddMember)}
                                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                                >
                                    {showAddMember ? 'Concluir Adição' : '+ Adicionar Membro'}
                                </button>
                            </div>

                            {showAddMember && (
                                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <input
                                        value={searchTerm}
                                        onChange={e => handleSearch(e.target.value)}
                                        placeholder="Buscar pessoas..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                                    />
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {searchResults.map(user => (
                                            <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`} className="w-6 h-6 rounded-full" />
                                                    <span className="text-sm font-medium">{user.username}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddMember(user)}
                                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold hover:bg-indigo-200"
                                                >
                                                    Adicionar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50 custom-scrollbar">
                                {members.map(member => (
                                    <div key={member.id} className="p-2 flex justify-between items-center hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}`} className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.full_name || member.username}</p>
                                                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                        {member.role !== 'admin' && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                                title="Remover"
                                            >
                                                <i className="ri-user-unfollow-line"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
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
