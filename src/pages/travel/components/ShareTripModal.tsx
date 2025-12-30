import { useState, useEffect } from 'react';
import { User, Trip } from '../../../services/supabase';
import { ConfirmationModal } from '../../../components/ConfirmationModal';

interface ShareTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: Trip;
    networkUsers: User[];
    onShare: (config: ShareConfig) => void;
    onPublish: (config: PublishConfig) => void;
}

export interface ShareConfig {
    visibility: 'public' | 'followers' | 'private';
    sharedWith: string[]; // User IDs
}

export interface PublishConfig {
    isListed: boolean;
    price: number;
    currency: 'TM' | 'BRL';
    description?: string;
}

export default function ShareTripModal({
    isOpen,
    onClose,
    trip,
    networkUsers,
    onShare,
    onPublish
}: ShareTripModalProps) {
    // Shared State
    const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('private');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchUser, setSearchUser] = useState('');

    // Marketplace State
    const [isListed, setIsListed] = useState(false);
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');

    // Confirmation Modal State
    const [showUnlistConfirm, setShowUnlistConfirm] = useState(false);

    useEffect(() => {
        if (trip) {
            if (trip.visibility && (trip.visibility as string) !== 'groups') setVisibility(trip.visibility);
            if (trip.sharedWith) setSelectedUsers(trip.sharedWith.map(u => u.id || u));
            if (trip.marketplaceConfig) {
                setIsListed(trip.marketplaceConfig.isListed);
                setPrice(trip.marketplaceConfig.price);
            }
            if (trip.description) setDescription(trip.description);
        }
    }, [trip]);

    const handleConfirm = () => {
        // 1. Save Share Config
        onShare({
            visibility,
            sharedWith: selectedUsers
        });

        // 2. Save Marketplace Config (only if public or followers, typically)
        const shouldBeListed = isListed || visibility === 'public'; // Enforce listing if public

        onPublish({
            isListed: shouldBeListed,
            price: price,
            currency: 'TM',
            description: description || trip.description
        });

        onClose();
    };

    const handleUnlistClick = () => {
        setShowUnlistConfirm(true);
    };

    const confirmUnlist = () => {
        onPublish({
            isListed: false, // This signals removal
            price: 0,
            currency: 'TM'
        });
        setShowUnlistConfirm(false);
        onClose();
    };

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const filteredUsers = networkUsers.filter(user =>
        user.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
        user.username.toLowerCase().includes(searchUser.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
                    {/* Header - Unified Style (Purple/Orange Gradient) */}
                    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-6 text-white text-center relative">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                            <i className="ri-share-forward-fill text-3xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold">Publicar Roteiro</h2>
                        <p className="text-white/90 text-sm mt-1">Configure a visibilidade e venda do seu roteiro</p>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                        {/* Section 1: Visibility */}
                        <div className="mb-8">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <i className="ri-eye-line text-purple-500"></i>
                                Quem pode ver?
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setVisibility('public');
                                        if (!isListed) {
                                            setIsListed(true);
                                            setPrice(0);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${visibility === 'public'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-100 hover:border-purple-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visibility === 'public' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <i className="ri-global-line text-xl"></i>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900">Público (Marketplace)</div>
                                        <div className="text-xs text-gray-500">Visível para todos na comunidade</div>
                                    </div>
                                    {visibility === 'public' && <i className="ri-check-circle-fill text-purple-500 text-xl"></i>}
                                </button>

                                <button
                                    onClick={() => setVisibility('followers')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${visibility === 'followers'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-100 hover:border-purple-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visibility === 'followers' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <i className="ri-group-line text-xl"></i>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900">Seguidores</div>
                                        <div className="text-xs text-gray-500">Apenas seus seguidores</div>
                                    </div>
                                    {visibility === 'followers' && <i className="ri-check-circle-fill text-purple-500 text-xl"></i>}
                                </button>

                                <button
                                    onClick={() => setVisibility('private')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${visibility === 'private'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-100 hover:border-purple-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visibility === 'private' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <i className="ri-lock-2-line text-xl"></i>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-gray-900">Privado / Específico</div>
                                        <div className="text-xs text-gray-500">Apenas você e convidados</div>
                                    </div>
                                    {visibility === 'private' && <i className="ri-check-circle-fill text-purple-500 text-xl"></i>}
                                </button>
                            </div>
                        </div>

                        {/* Section 2: User Selector (Only if Private) */}
                        {visibility === 'private' && (
                            <div className="mb-8 animate-fadeIn">
                                <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                    <i className="ri-user-add-line text-purple-500"></i>
                                    Compartilhar com
                                </h3>
                                <div className="relative mb-3">
                                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar pessoas..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50">
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedUsers.includes(user.id) ? 'bg-purple-100' : 'hover:bg-white'
                                                }`}
                                        >
                                            <img
                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`}
                                                alt={user.full_name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="text-sm font-medium text-gray-700 flex-1 text-left">{user.full_name}</span>
                                            {selectedUsers.includes(user.id) && <i className="ri-check-circle-fill text-purple-500"></i>}
                                        </button>
                                    )) : (
                                        <div className="text-center text-gray-500 text-sm py-4">Nenhum usuário encontrado</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section 3: Value / Pricing Options - Available for ALL scopes */}
                        <div className="mb-6 animate-fadeIn">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                            <i className="ri-price-tag-3-line text-lg"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Valor do Roteiro</h3>
                                            <p className="text-xs text-gray-600">Defina se será gratuito ou pago</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setIsListed(true); setPrice(0); }}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${isListed && price === 0
                                                ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
                                                }`}
                                        >
                                            <i className="ri-gift-line mr-2"></i>
                                            Gratuito
                                        </button>
                                        <button
                                            onClick={() => { setIsListed(true); if (price === 0) setPrice(50); }}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${isListed && price > 0
                                                ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
                                                }`}
                                        >
                                            <i className="ri-money-dollar-circle-line mr-2"></i>
                                            Pago (TM)
                                        </button>
                                    </div>

                                    {isListed && price > 0 && (
                                        <div className="animate-fadeIn">
                                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Preço (Travel Money)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">TM</div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={price}
                                                    onChange={(e) => setPrice(Number(e.target.value))}
                                                    className="w-full pl-12 pr-4 py-3 border border-emerald-200 rounded-xl text-xl font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Descrição / Observações</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20 bg-white"
                                            placeholder="Descreva o que está incluído neste roteiro..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Feedback and Actions */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4 mt-6">
                            {trip.marketplaceConfig?.isListed ? (
                                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                    <i className="ri-checkbox-circle-fill text-xl"></i>
                                    <div>
                                        <p className="font-bold text-sm">Status Atual: Publicado</p>
                                        <p className="text-xs opacity-80">Visível no Marketplace. Use os botões abaixo para remover ou atualizar.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-500 p-3 rounded-xl border border-gray-200 border-dashed">
                                    <i className="ri-eye-off-line text-xl"></i>
                                    <div>
                                        <p className="font-bold text-sm">Status Atual: Não Publicado</p>
                                        <p className="text-xs opacity-80">Configure o valor acima e clique em "Publicar Agora" para vender.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {trip.marketplaceConfig?.isListed && (
                                    <button
                                        onClick={handleUnlistClick}
                                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center gap-2"
                                    >
                                        <i className="ri-delete-bin-line"></i>
                                        Remover
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <i className="ri-save-line text-lg"></i>
                                    {trip.marketplaceConfig?.isListed ? 'Salvar Alterações' : 'Publicar Agora'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showUnlistConfirm}
                onClose={() => setShowUnlistConfirm(false)}
                onConfirm={confirmUnlist}
                title="Remover Publicação"
                message="Tem certeza que deseja remover este roteiro do Marketplace? Outros usuários não poderão mais vê-lo ou comprá-lo."
                confirmText="Sim, Remover"
                cancelText="Cancelar"
                type="danger"
                icon="ri-delete-bin-line"
            />
        </>
    );
}

