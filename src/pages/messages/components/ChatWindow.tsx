
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { AlertModal } from '@/components/AlertModal';
import { getMessages, sendMessage, uploadAttachment, deleteMessage, updateLastSeen, getChatHeaderInfo, ChatMessage } from '@/services/messages/chatService';
import { RealtimeManager } from '@/services/messages/realtimeService';
import EditGroupModal from './EditGroupModal';
import GroupInfoModal from './GroupInfoModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import VideoCallModal from './VideoCallModal';
import { VideoCaptureModal } from './VideoCaptureModal';

interface ChatWindowProps {
    chatId: string;
    type: 'direct' | 'group' | 'community';
    onBack: () => void;
}

const realtimeManager = new RealtimeManager();

export default function ChatWindow({ chatId, type, onBack }: ChatWindowProps) {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [headerInfo, setHeaderInfo] = useState<{ name: string; avatar?: string; subtitle?: string; isOnline?: boolean; createdBy?: string } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);

    // Rich Features State
    const [showEmoji, setShowEmoji] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: 'danger' | 'warning' | 'info' | 'success' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [isVoiceCall, setIsVoiceCall] = useState(false);
    const [showVideoCapture, setShowVideoCapture] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    }, []);

    // Load Header Info
    useEffect(() => {
        getChatHeaderInfo(chatId, type).then(info => {
            if (info) setHeaderInfo(info);
        });
    }, [chatId, type]);

    // Fetch and Subscribe
    useEffect(() => {
        setLoading(true);
        const scope = type === 'group' ? { groupId: chatId }
            : type === 'community' ? { communityId: chatId }
                : { conversationId: chatId };

        getMessages(scope)
            .then(msgs => {
                setMessages(msgs);
                setLoading(false);
                scrollToBottom();
            })
            .catch(err => {
                console.error('Failed to load messages', err);
                setLoading(false);
            });

        const handleNewMessage = async (msg: any) => {
            if (msg.sender_id === currentUser?.id) return; // Already handled by local state in handleSend

            let chatMsg = msg as ChatMessage;

            // Real-time payload doesn't include joined sender details
            if (!chatMsg.sender && chatMsg.sender_id) {
                try {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('username, avatar_url, full_name')
                        .eq('id', chatMsg.sender_id)
                        .single();

                    if (userData) {
                        chatMsg.sender = userData;
                    }
                } catch (err) {
                    console.error('Error fetching sender for realtime message:', err);
                }
            }

            setMessages(prev => {
                if (prev.some(m => m.id === chatMsg.id)) return prev;
                return [...prev, chatMsg];
            });
            scrollToBottom();
        };

        if (type === 'direct') realtimeManager.subscribeToChat(chatId, handleNewMessage);
        else if (type === 'group') realtimeManager.subscribeToGroup(chatId, handleNewMessage);
        else if (type === 'community') realtimeManager.subscribeToCommunity(chatId, handleNewMessage);

        return () => {
            realtimeManager.unsubscribeAll();
        };
    }, [chatId, type]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Update Last Seen
    useEffect(() => {
        updateLastSeen(chatId, type);
        const interval = setInterval(() => updateLastSeen(chatId, type), 60000);
        return () => clearInterval(interval);
    }, [chatId, type]);

    const handleSend = async (content?: string, msgType: 'text' | 'image' = 'text') => {
        const textToSend = content !== undefined ? content : inputText;
        if (!textToSend.trim() && msgType === 'text') return;

        setSending(true);
        try {
            const params: any = { content: textToSend, type: msgType };
            if (type === 'direct') params.conversationId = chatId;
            if (type === 'group') params.groupId = chatId;
            if (type === 'community') params.communityId = chatId;

            if (replyTo) params.replyToId = replyTo.id;

            let newMsg = await sendMessage(params);

            // Manually attach reply_to info since we removed it from the insert select
            if (replyTo) {
                newMsg = { ...newMsg, reply_to: replyTo };
            }

            setMessages(prev => {
                const exists = prev.some(m => m.id === newMsg.id);
                if (exists) return prev.map(m => m.id === newMsg.id ? newMsg : m);
                return [...prev, newMsg];
            });
            if (msgType === 'text') setInputText('');
            setReplyTo(null);
            scrollToBottom();
            setShowEmoji(false);
        } catch (e: any) {
            console.error('Send Error:', e);
            setAlertState({
                isOpen: true,
                title: 'Falha ao Enviar',
                message: `Erro: ${e.message || JSON.stringify(e)}`,
                type: 'danger'
            });
        } finally {
            setSending(false);
        }
    };

    const handleHeaderClick = () => {
        if (type === 'direct') return;

        if (headerInfo?.createdBy === currentUser?.id) {
            setIsEditModalOpen(true);
        } else {
            setIsInfoModalOpen(true);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputText(prev => prev + emojiData.emoji);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Validate
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setAlertState({ isOpen: true, title: 'Arquivo muito grande', message: 'O arquivo deve ter no máximo 5MB.', type: 'warning' });
            return;
        }

        setUploading(true);
        try {
            const publicUrl = await uploadAttachment(file);
            setUploading(false);
            setShowAttachMenu(false); // Close menu if open

            // Send Image Message
            await sendMessage({
                content: publicUrl,
                type: 'image',
                replyToId: replyTo?.id,
                ...(type === 'group' ? { groupId: chatId } : type === 'community' ? { communityId: chatId } : { conversationId: chatId })
            });

            setReplyTo(null);
            scrollToBottom();
        } catch (error) {
            console.error(error);
            setUploading(false);
            setAlertState({ isOpen: true, title: 'Erro', message: 'Falha ao enviar arquivo.', type: 'danger' });
        }
    };

    const handleCameraCapture = async (imageSrc: string) => {
        setUploading(true);
        setShowCamera(false);
        try {
            // Convert Base64 to Blob
            const res = await fetch(imageSrc);
            const blob = await res.blob();
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });

            const publicUrl = await uploadAttachment(file);
            setUploading(false);
            setShowAttachMenu(false);

            await sendMessage({
                content: publicUrl,
                type: 'image',
                replyToId: replyTo?.id,
                ...(type === 'group' ? { groupId: chatId } : type === 'community' ? { communityId: chatId } : { conversationId: chatId })
            });
            scrollToBottom();
        } catch (error) {
            console.error(error);
            setUploading(false);
            setAlertState({ isOpen: true, title: 'Erro', message: 'Falha ao enviar foto da câmera.', type: 'danger' });
        }
    };

    const handleSendLocation = () => {
        if (!navigator.geolocation) {
            setAlertState({ isOpen: true, title: 'Erro', message: 'Geolocalização não suportada pelo navegador.', type: 'warning' });
            return;
        }

        setUploading(true); // Reuse uploading spinner 
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const locationString = `https://www.google.com/maps?q=${latitude},${longitude}`;

                // We send as 'text' for now, but formatted specially or could add 'location' type support if backend allows. 
                // Assuming 'text' is safest fallback unless we change schema.
                // Let's stick to text that renders nicely or create a 'location' type if we can't.
                // The user asked to "enviar a localizacao".

                try {
                    await sendMessage({
                        content: locationString,
                        type: 'text', // Using text so it renders as a link.
                        replyToId: replyTo?.id,
                        ...(type === 'group' ? { groupId: chatId } : type === 'community' ? { communityId: chatId } : { conversationId: chatId })
                    });
                    setUploading(false);
                    setShowAttachMenu(false);
                    scrollToBottom();
                } catch (error) {
                    setUploading(false);
                }
            },
            (error) => {
                console.error(error);
                setUploading(false);
                setAlertState({ isOpen: true, title: 'Erro', message: 'Não foi possível obter a localização.', type: 'warning' });
            }
        );
    };

    const handleVideoCall = () => {
        setIsVoiceCall(false);
        setShowCallModal(true);
    };

    const handleVoiceCall = () => {
        setIsVoiceCall(true);
        setShowCallModal(true);
    };

    const handleSearch = () => {
        setAlertState({
            isOpen: true,
            title: 'Em breve',
            message: 'Pesquisa na conversa estará disponível na próxima atualização!',
            type: 'info'
        });
    };

    const handleVideoCapture = async (videoBlob: Blob) => {
        setUploading(true);
        setShowVideoCapture(false);
        try {
            const file = new File([videoBlob], `video_${Date.now()}.webm`, { type: 'video/webm' });
            const publicUrl = await uploadAttachment(file);
            setUploading(false);
            setShowAttachMenu(false);

            await sendMessage({
                content: publicUrl,
                type: 'image',
                replyToId: replyTo?.id,
                ...(type === 'group' ? { groupId: chatId } : type === 'community' ? { communityId: chatId } : { conversationId: chatId })
            });
            scrollToBottom();
        } catch (error) {
            console.error(error);
            setUploading(false);
            setAlertState({ isOpen: true, title: 'Erro', message: 'Falha ao enviar vídeo.', type: 'danger' });
        }
    };

    return (
        <div className="fixed inset-0 md:relative flex flex-col h-[100dvh] md:h-screen bg-[#EFE7DD] z-[60] md:z-0">
            {/* WhatsApp Header */}
            <div className="h-[60px] px-4 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between flex-shrink-0 z-20">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-[#00a884] flex-shrink-0">
                        <i className="ri-arrow-left-line text-2xl"></i>
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={handleHeaderClick}>
                        {/* Avatar & Info */}
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                            {headerInfo?.avatar ? (
                                <img src={headerInfo.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <i className="ri-user-fill text-xl"></i>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                            <h3 className="font-semibold text-[#111b21] text-[16px] leading-tight truncate">
                                {headerInfo?.name || 'Carregando...'}
                            </h3>
                            <p className="text-[12px] text-[#667781] leading-none mt-0.5 truncate max-w-[200px]">
                                {headerInfo?.subtitle || ''}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[#54656f] flex-shrink-0">
                    <button onClick={handleHeaderClick}>
                        <i className="ri-information-line text-xl"></i>
                    </button>
                    <button onClick={handleVoiceCall}>
                        <i className="ri-phone-line text-xl"></i>
                    </button>
                </div>
            </div>

            {/* Modals outside main flow */}
            {isEditModalOpen && type !== 'direct' && (
                <EditGroupModal
                    type={type as 'group' | 'community'}
                    item={{ id: chatId, name: headerInfo?.name, avatar_url: headerInfo?.avatar, created_by: headerInfo?.createdBy }}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        getChatHeaderInfo(chatId, type).then(info => info && setHeaderInfo(info));
                    }}
                />
            )}

            {isInfoModalOpen && type !== 'direct' && (
                <GroupInfoModal
                    type={type as 'group' | 'community'}
                    item={{ id: chatId, name: headerInfo?.name, avatar_url: headerInfo?.avatar, description: '' }}
                    onClose={() => setIsInfoModalOpen(false)}
                />
            )}

            {/* Messages Area with Doodle Background */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth"
                style={{
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }}>
                <div className="absolute inset-0 bg-[#EFE7DD] opacity-90 pointer-events-none sticky top-0"></div>

                <div className="relative z-10 flex flex-col gap-1 p-4 pb-4">
                    {loading ? (
                        <div className="flex justify-center py-10"><span className="loading loading-spinner text-[#00a884]"></span></div>
                    ) : (
                        messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                type={type}
                                currentUserId={currentUser?.id}
                                onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
                                onReply={(msg) => setReplyTo(msg)}
                                onConfirmDelete={() => {
                                    setConfirmModal({
                                        isOpen: true,
                                        title: 'Excluir mensagem?',
                                        message: 'Deseja apagar esta mensagem?',
                                        onConfirm: async () => {
                                            await deleteMessage(msg.id);
                                            setMessages(prev => prev.filter(m => m.id !== msg.id));
                                        }
                                    });
                                }}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="pb-safe bg-[#f0f2f5] z-20">
                {uploading && (
                    <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border-t border-gray-100 flex items-center gap-2 text-[11px] text-[#00a884]">
                        <i className="ri-loader-4-line animate-spin"></i>
                        <span>Enviando mídia...</span>
                    </div>
                )}

                {replyTo && (
                    <div className="px-4 py-2 bg-[#f0f2f5]">
                        <div className="bg-gray-100/50 border-l-[4px] border-[#00a884] rounded-r p-2 flex justify-between items-center text-sm shadow-sm">
                            <div className="overflow-hidden">
                                <span className="block font-bold text-[#00a884] text-[11px] mb-0.5">{replyTo.sender?.username}</span>
                                <span className="text-gray-500 line-clamp-1 text-[13px]">{replyTo.content}</span>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1">
                                <i className="ri-close-line text-gray-500"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div className="min-h-[62px] px-3 py-2 flex items-end gap-2">
                    <div className="flex items-center gap-1 mb-1.5 text-[#54656f]">
                        <button onClick={() => setShowEmoji(!showEmoji)} className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                            <i className={`ri-emotion-line text-2xl ${showEmoji ? 'text-[#00a884]' : ''}`}></i>
                        </button>

                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                className={`p-1 hover:bg-gray-200 rounded-full transition-colors ${showAttachMenu ? 'bg-gray-200' : ''}`}
                            >
                                <i className={`ri-add-line text-2xl transition-transform ${showAttachMenu ? 'rotate-45' : ''}`}></i>
                            </button>

                            {showAttachMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)}></div>
                                    <div className="absolute bottom-14 left-0 z-20 flex flex-col gap-3 mb-2 animate-scaleIn origin-bottom-left">
                                        {[
                                            { icon: 'ri-map-pin-line', color: 'bg-green-500', label: 'Localização', action: handleSendLocation },
                                            { icon: 'ri-camera-fill', color: 'bg-pink-500', label: 'Câmera', action: () => setShowCamera(true) },
                                            { icon: 'ri-movie-line', color: 'bg-red-500', label: 'Vídeo', action: () => setShowVideoCapture(true) },
                                            { icon: 'ri-image-fill', color: 'bg-purple-500', label: 'Fotos', action: () => fileInputRef.current?.click() }
                                        ].map((item, idx) => (
                                            <button key={idx} onClick={item.action} className="flex items-center gap-3 group">
                                                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white shadow-lg hover:brightness-90 transition-all`}>
                                                    <i className={`${item.icon} text-xl`}></i>
                                                </div>
                                                <span className="bg-[#111b21] text-white text-[12px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    </div>

                    <div className="flex-1 bg-white rounded-[20px] px-3 py-1.5 mb-1.5 shadow-sm border border-transparent focus-within:border-gray-100 flex flex-col justify-center min-h-[40px]">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !window.matchMedia('(max-width: 768px)').matches) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Mensagem"
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-[15px] max-h-[120px] resize-none text-[#111b21] placeholder:text-[#54656f] leading-[20px]"
                            rows={1}
                            style={{ height: 'auto', minHeight: '20px' }}
                            onInput={(e: any) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />
                    </div>

                    <div className="mb-1.5 flex-shrink-0">
                        {inputText.trim() ? (
                            <button onClick={() => handleSend()} className="w-11 h-11 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md hover:bg-[#008f6f] transition-all active:scale-95">
                                {sending ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-send-plane-fill text-xl"></i>}
                            </button>
                        ) : (
                            <button className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#54656f] shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                                <i className="ri-mic-fill text-xl"></i>
                            </button>
                        )}
                    </div>
                </div>

                {showEmoji && (
                    <div className="absolute bottom-[75px] left-3 z-30 shadow-2xl rounded-2xl overflow-hidden animate-fadeInUp md:w-[350px]">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            width="100%"
                            height={400}
                            skinTonesDisabled
                            searchDisabled={window.matchMedia('(max-width: 768px)').matches}
                        />
                    </div>
                )}
            </div>

            {/* Overlays */}
            {showEmoji && <div className="fixed inset-0 z-10" onClick={() => setShowEmoji(false)}></div>}

            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />

            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-medium text-[#111b21] mb-2">{confirmModal.title}</h3>
                        <p className="text-[#54656f] mb-6 text-sm">{confirmModal.message}</p>
                        <div className="flex justify-end gap-4 font-medium text-sm">
                            <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="text-[#00a884] hover:bg-[#f0f2f5] px-3 py-2 rounded">
                                Cancelar
                            </button>
                            <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }} className="text-[#00a884] hover:bg-[#f0f2f5] px-3 py-2 rounded font-bold">
                                Apagar para mim
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CameraCaptureModal
                isOpen={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={handleCameraCapture}
            />

            <VideoCallModal
                isOpen={showCallModal}
                onClose={() => setShowCallModal(false)}
                recipient={{
                    name: headerInfo?.name || 'Usuário',
                    avatar: headerInfo?.avatar
                }}
                isVoiceOnly={isVoiceCall}
            />

            <VideoCaptureModal
                isOpen={showVideoCapture}
                onClose={() => setShowVideoCapture(false)}
                onCapture={handleVideoCapture}
            />
        </div>
    );
}

function MessageBubble({
    message,
    type,
    currentUserId,
    onDelete,
    onReply,
    onConfirmDelete
}: {
    message: ChatMessage,
    type: string,
    currentUserId?: string,
    onDelete: (id: string) => void,
    onReply: (msg: ChatMessage) => void,
    onConfirmDelete: () => void
}) {
    const isMine = currentUserId === message.sender_id;
    const [showContext, setShowContext] = useState(false);

    // Context Menu Logic
    const handleContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setShowContext(true);
    };

    return (
        <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-[2px]`}>
            <div className={`max-w-[85%] md:max-w-[70%] relative flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>

                {/* Bubble */}
                <div
                    className={`
                        px-2 pt-1 pb-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-[14.2px] leading-[19px] text-[#111b21] relative rounded-[7.5px]
                        ${isMine
                            ? 'bg-[#d9fdd3] rounded-tr-none ml-10'
                            : 'bg-white rounded-tl-none mr-10'
                        }
                    `}
                    onContextMenu={handleContextMenu}
                >
                    {/* Tiny Triangle SVG for bubble tail */}
                    {isMine ? (
                        <svg viewBox="0 0 8 13" height="13" width="8" className="absolute -right-[7px] top-0 text-[#d9fdd3] fill-current"><path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path></svg>
                    ) : (
                        <svg viewBox="0 0 8 13" height="13" width="8" className="absolute -left-[7px] top-0 text-white fill-current"><path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path></svg>
                    )}

                    {/* Sender Name in groups */}
                    {!isMine && (type === 'group' || type === 'community') && (
                        <p className={`text-[12.5px] font-bold mb-0.5 px-0.5 ${['text-orange-600', 'text-pink-600', 'text-purple-600', 'text-blue-600', 'text-emerald-600'][message.sender_id.charCodeAt(0) % 5]}`}>
                            {message.sender?.full_name || message.sender?.username}
                        </p>
                    )}

                    {/* Reply Context */}
                    {message.reply_to && (
                        <div className="bg-black/5 rounded-[6px] border-l-[4px] border-[#00a884] p-2 mb-1 text-[12px] opacity-80">
                            <p className="font-bold text-[#00a884] mb-0.5">{message.reply_to.sender?.username}</p>
                            <p className="text-[#54656f] line-clamp-2">{message.reply_to.content}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-0.5 break-words whitespace-pre-wrap">
                        {message.type === 'image' || (message.content && (message.content.endsWith('.webm') || message.content.endsWith('.mp4'))) ? (
                            <div className="mt-0.5 mb-1">
                                {(message.content.endsWith('.webm') || message.content.endsWith('.mp4')) ? (
                                    <video src={message.content} controls className="rounded-lg max-h-[300px] w-full bg-black/5" />
                                ) : (
                                    <img src={message.content} className="rounded-lg max-h-[350px] w-full object-cover" loading="lazy" />
                                )}
                            </div>
                        ) : (
                            <div className="inline-block align-middle pb-1">{message.content}</div>
                        )}
                    </div>

                    {/* Metadata (Time & Check) */}
                    <div className="flex items-center justify-end gap-1 -mt-2 float-right ml-2 h-4">
                        <span className="text-[10px] text-[#667781] leading-none">
                            {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                        {isMine && (
                            <span className={message.read_at ? 'text-[#53bdeb]' : 'text-[#8696a0]'}>
                                <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.283a.32.32 0 0 0 .397.04l.056-.041 6.186-7.79a.319.319 0 0 0-.067-.502l.613-.343zM4.61 7.227l-.482-.372a.365.365 0 0 0-.51.063L.266 11.238a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.283a.32.32 0 0 0 .397.04l.056-.041 3.518-3.085a.319.319 0 0 0 .022.257l.64-.176z"></path></svg>
                            </span>
                        )}
                    </div>
                </div>

                {/* Dropdown Menu (Context) */}
                {showContext && (
                    <>
                        <div className="fixed inset-0 z-[80]" onClick={() => setShowContext(false)}></div>
                        <div className={`absolute z-[90] bg-white shadow-xl border border-gray-100 rounded-lg py-1.5 w-40 animate-scaleIn origin-top-${isMine ? 'right' : 'left'} top-8`}>
                            <button onClick={() => { onReply(message); setShowContext(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[14px] text-[#111b21] flex items-center gap-3">
                                <i className="ri-reply-line text-gray-500"></i>
                                Responder
                            </button>
                            <button onClick={() => { onConfirmDelete(); setShowContext(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-[14px] text-[#111b21] flex items-center gap-3">
                                <i className="ri-delete-bin-line text-gray-500"></i>
                                Apagar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
