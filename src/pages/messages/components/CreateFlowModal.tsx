
import { useState, useRef } from 'react';
import { createDirectConversation } from '@/services/messages/chatService';
import { createGroup, createCommunity, createGroupInvite } from '@/services/messages/groupService';
import { searchUsers } from '@/services/supabase';

interface CreateFlowModalProps {
    onClose: () => void;
    onSuccess: (id: string, type: 'direct' | 'group' | 'community') => void;
    initialMode?: 'direct' | 'group' | 'community' | null;
}

type ModalStep = 'select_type' | 'details' | 'members';
type CreateType = 'direct' | 'group' | 'community';

export default function CreateFlowModal({ onClose, onSuccess, initialMode }: CreateFlowModalProps) {
    const [step, setStep] = useState<ModalStep>(() => {
        if (initialMode === 'direct') return 'members';
        if (initialMode === 'group' || initialMode === 'community') return 'details';
        return 'select_type';
    });
    const [type, setType] = useState<CreateType | null>(initialMode || null);

    // Form Data
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(initialMode === 'community'); // Default true for community
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Members / Search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [externalInvites, setExternalInvites] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');

    // UI Helpers
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTypeSelect = (selectedType: CreateType) => {
        setType(selectedType);
        if (selectedType === 'direct') {
            // Direct goes straight to member selection (search)
            setStep('members');
        } else {
            // Groups/Communities go to details first
            setStep('details');
            // Default privacy: Groups private, Communities public via default state logic, or here:
            setIsPublic(selectedType === 'community');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 3) return;
        const users = await searchUsers(term);
        setSearchResults(users || []);
    };

    const toggleUserSelection = (user: any) => {
        if (type === 'direct') {
            createDirect(user.id);
            return;
        }

        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    const addExternalInvite = () => {
        const email = emailInput.trim().toLowerCase();
        if (!email || !email.includes('@')) return;
        if (!externalInvites.includes(email)) {
            setExternalInvites(prev => [...prev, email]);
        }
        setEmailInput('');
    };

    const removeExternalInvite = (email: string) => {
        setExternalInvites(prev => prev.filter(e => e !== email));
    };

    const createDirect = async (userId: string) => {
        setLoading(true);
        try {
            const conv = await createDirectConversation(userId);
            onSuccess(conv.id, 'direct');
        } catch (e) {
            console.error(e);
            alert('Erro ao criar conversa');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 'details') {
            // Validate Details
            if (!name) return;
            setStep('members');
        } else if (step === 'members') {
            handleCreate();
        }
    };

    const handleCreate = async () => {
        if (!type || !name) return;
        setLoading(true);
        try {
            if (type === 'group') {
                const group = await createGroup(name, description, selectedUsers.map(u => u.id), imageFile || undefined, isPublic);

                // Send external invites
                if (externalInvites.length > 0) {
                    await Promise.all(externalInvites.map(email => createGroupInvite(group.id, email)));
                }

                onSuccess(group.id, 'group');
            } else if (type === 'community') {
                const comm = await createCommunity(name, description, imageFile || undefined, isPublic);

                // Send external invites
                if (externalInvites.length > 0) {
                    await Promise.all(externalInvites.map(email => createGroupInvite(comm.id, email)));
                }

                onSuccess(comm.id, 'community');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao criar ' + (type === 'group' ? 'grupo' : 'comunidade'));
        } finally {
            setLoading(false);
        }
    };

    // Validation
    const canProceedFromDetails = !!name;
    const canProceedFromMembers = type === 'direct' ? false : (isPublic ? true : selectedUsers.length > 0); // Mandatory if private

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fadeInScale">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        {step !== 'select_type' && (
                            <button onClick={() => setStep(step === 'details' ? 'select_type' : 'details')} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-arrow-left-line text-xl"></i>
                            </button>
                        )}
                        <h3 className="font-bold text-lg text-gray-800">
                            {step === 'select_type' && 'Criar Nova...'}
                            {step === 'details' && (type === 'group' ? 'Detalhes do Grupo' : 'Detalhes da Comunidade')}
                            {step === 'members' && (type === 'direct' ? 'Nova Conversa' : 'Adicionar Membros')}
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <i className="ri-close-line text-gray-600"></i>
                    </button>
                </div>

                {/* Progress Bar (Only for multi-step) */}
                {type !== 'direct' && type !== null && (
                    <div className="h-1 w-full bg-gray-100 flex">
                        <div className={`h-full bg-indigo-500 transition-all duration-300 ${step === 'details' ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

                    {/* STEP 1: TYPE SELECTION */}
                    {step === 'select_type' && (
                        <div className="space-y-4">
                            <button onClick={() => handleTypeSelect('direct')} className="w-full p-4 bg-white hover:bg-blue-50/50 border border-transparent hover:border-blue-100 rounded-2xl flex items-center gap-4 transition-all shadow-sm hover:shadow-md group">
                                <div className="w-12 h-12 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <i className="ri-user-line"></i>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-gray-900">Conversa Direta</h4>
                                    <p className="text-xs text-gray-500">Mande mensagem para um amigo</p>
                                </div>
                                <i className="ri-arrow-right-s-line ml-auto text-gray-300 group-hover:text-blue-500"></i>
                            </button>

                            <button onClick={() => handleTypeSelect('group')} className="w-full p-4 bg-white hover:bg-purple-50/50 border border-transparent hover:border-purple-100 rounded-2xl flex items-center gap-4 transition-all shadow-sm hover:shadow-md group">
                                <div className="w-12 h-12 bg-purple-100/50 text-purple-600 rounded-full flex items-center justify-center text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <i className="ri-group-line"></i>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-gray-900">Novo Grupo</h4>
                                    <p className="text-xs text-gray-500">Bate-papo privado com amigos</p>
                                </div>
                                <i className="ri-arrow-right-s-line ml-auto text-gray-300 group-hover:text-purple-500"></i>
                            </button>

                            <button onClick={() => handleTypeSelect('community')} className="w-full p-4 bg-white hover:bg-orange-50/50 border border-transparent hover:border-orange-100 rounded-2xl flex items-center gap-4 transition-all shadow-sm hover:shadow-md group">
                                <div className="w-12 h-12 bg-orange-100/50 text-orange-600 rounded-full flex items-center justify-center text-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <i className="ri-community-line"></i>
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-gray-900">Nova Comunidade</h4>
                                    <p className="text-xs text-gray-500">Espaço público para discussões</p>
                                </div>
                                <i className="ri-arrow-right-s-line ml-auto text-gray-300 group-hover:text-orange-500"></i>
                            </button>
                        </div>
                    )}

                    {/* STEP 2: DETAILS (Groups/Communities) */}
                    {step === 'details' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Image Upload */}
                            <div className="flex justify-center">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                <i className="ri-camera-line text-3xl"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="ri-image-add-line text-white text-2xl"></i>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nome</label>
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder={`Nome do ${type === 'group' ? 'grupo' : 'espaço'}`}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Sobre o que é este espaço?"
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none h-24 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Privacy Toggle */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                        <i className={`ri-${isPublic ? 'earth-line' : 'lock-line'} text-xl`}></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{isPublic ? 'Público' : 'Privado'}</h4>
                                        <p className="text-xs text-gray-500">
                                            {isPublic
                                                ? 'Qualquer pessoa pode encontrar e entrar '
                                                : 'Somente convidados podem entrar'}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: MEMBERS (Search) */}
                    {step === 'members' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
                                <input
                                    value={searchTerm}
                                    onChange={e => handleSearch(e.target.value)}
                                    placeholder="Buscar pessoas..."
                                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    autoFocus
                                />
                            </div>

                            {/* External Invites (Email) */}
                            {type !== 'direct' && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Convidar por E-mail (Externo)</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={emailInput}
                                            onChange={e => setEmailInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExternalInvite())}
                                            placeholder="amigo@email.com"
                                            className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            onClick={addExternalInvite}
                                            className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            <i className="ri-add-line"></i>
                                        </button>
                                    </div>

                                    {externalInvites.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {externalInvites.map(email => (
                                                <div key={email} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                                                    <i className="ri-mail-line text-[10px]"></i>
                                                    {email}
                                                    <button onClick={() => removeExternalInvite(email)} className="w-4 h-4 rounded-full hover:bg-amber-100 flex items-center justify-center">
                                                        <i className="ri-close-line"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selected Chips */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div key={user.id} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                            {user.username}
                                            <button onClick={() => toggleUserSelection(user)} className="w-4 h-4 rounded-full hover:bg-indigo-200 flex items-center justify-center">
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Results */}
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {searchResults.length === 0 && searchTerm.length > 2 && (
                                    <div className="text-center py-4 text-gray-400 text-sm">Nenhum usuário encontrado.</div>
                                )}
                                {searchResults.map(user => {
                                    const isSelected = selectedUsers.some(u => u.id === user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => toggleUserSelection(user)}
                                            className={`w-full p-2 rounded-xl flex items-center gap-3 transition-colors ${isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-white hover:shadow-sm'}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{user.full_name || user.username}</p>
                                                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                            </div>
                                            {type !== 'direct' && (
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                                                    {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {type !== 'direct' && !isPublic && selectedUsers.length === 0 && (
                                <div className="p-3 bg-amber-50 text-amber-600 text-xs rounded-lg flex items-start gap-2">
                                    <i className="ri-alert-line mt-0.5"></i>
                                    Grupos privados precisam de pelo menos 1 membro inicial além de você.
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                {step !== 'select_type' && (
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
                        {step === 'details' ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceedFromDetails}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Próximo
                            </button>
                        ) : step === 'members' && type !== 'direct' ? (
                            <button
                                onClick={handleCreate}
                                disabled={!canProceedFromMembers || loading}
                                className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {loading && <i className="ri-loader-4-line animate-spin"></i>}
                                Criar {type === 'group' ? 'Grupo' : 'Comunidade'}
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
