import { useState, useRef, useEffect } from 'react';
import { supabase, updateUser, uploadAvatar, User as UserType } from '@/services/supabase';

interface EditProfileModalProps {
    userProfile: UserType;
    onClose: () => void;
    onUpdate: (updatedUser: UserType) => void;
}

export default function EditProfileModal({ userProfile, onClose, onUpdate }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(userProfile.full_name || '');
    const [username, setUsername] = useState(userProfile.username || '');
    const [bio, setBio] = useState(userProfile.bio || '');
    const [website, setWebsite] = useState(userProfile.website || '');
    const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar_url || '');
    const [privacySetting, setPrivacySetting] = useState<'public' | 'private' | 'friends'>(userProfile.privacy_setting || 'public');
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setIsUploading(true);
                const url = await uploadAvatar(file);
                setAvatarUrl(url);
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Erro ao carregar avatar.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleGenerateAvatar = async () => {
        setIsGenerating(true);
        // Simulation: AI Avatar generation
        setTimeout(() => {
            const generatedUrl = `https://readdy.ai/api/search-image?query=creative%20artistic%20avatar%20portrait%20stylized%20character&width=400&height=400&seq=${Date.now()}`;
            setAvatarUrl(generatedUrl);
            setIsGenerating(false);
        }, 2000);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const updated = await updateUser(userProfile.id, {
                full_name: fullName,
                username: username,
                bio: bio,
                website: website,
                avatar_url: avatarUrl,
                privacy_setting: privacySetting
            });
            onUpdate(updated);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                    <h2 className="font-bold text-lg">Editar Perfil</h2>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="text-blue-500 font-bold hover:text-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? <i className="ri-loader-4-line animate-spin"></i> : 'Salvar'}
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                                <img
                                    src={avatarUrl || 'https://via.placeholder.com/150'}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                                {(isUploading || isGenerating) && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <i className="ri-loader-4-line animate-spin text-white text-2xl"></i>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-500 hover:bg-gray-50 transition-colors"
                                title="Upload custom avatar"
                            >
                                <i className="ri-camera-line"></i>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <button
                            onClick={handleGenerateAvatar}
                            disabled={isGenerating}
                            className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                            <i className="ri-magic-line"></i>
                            Criar Avatar IA
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome de Usuário</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                            <input
                                type="text"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="https://exemplo.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Privacidade da Conta</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPrivacySetting('public')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${privacySetting === 'public'
                                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <i className="ri-earth-line block text-lg mb-1"></i>
                                    Público
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacySetting('private')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${privacySetting === 'private'
                                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <i className="ri-lock-2-line block text-lg mb-1"></i>
                                    Privado
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrivacySetting('friends')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${privacySetting === 'friends'
                                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <i className="ri-group-line block text-lg mb-1"></i>
                                    Amigos
                                </button>
                            </div>
                            <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                                {privacySetting === 'public' && "Qualquer pessoa pode ver seu perfil e posts no Explorar."}
                                {privacySetting === 'private' && "Apenas seguidores aprovados podem ver seu conteúdo."}
                                {privacySetting === 'friends' && "Apenas amigos mútuos podem ver suas postagens."}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all resize-none h-24"
                                placeholder="Conte-nos sobre você..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
