import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/db/client';
import { Message, User } from '@/services/db/types';
import { generateAgentResponse } from '@/services/gemini';

export default function AgentInBox() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [suggesting, setSuggesting] = useState(false);

    useEffect(() => {
        if (!user) return;

        const loadConversations = async () => {
            // This is a simplified fetch, ideally we'd have a specific table for conversations
            const { data, error } = await supabase
                .from('messages')
                .select('sender_id, created_at, content, users:sender_id(id, full_name, avatar_url)')
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Group by sender handle unique ones
                const uniqueConversations = Array.from(new Set(data.map(m => m.sender_id)))
                    .map(id => data.find(m => m.sender_id === id));
                setConversations(uniqueConversations);
            }
            setLoading(false);
        };

        loadConversations();
    }, [user]);

    useEffect(() => {
        if (!selectedChat || !user) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat}),and(sender_id.eq.${selectedChat},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        };

        fetchMessages();

        const subscription = supabase
            .channel(`chat-${selectedChat}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                const msg = payload.new as Message;
                if ((msg.sender_id === selectedChat && msg.receiver_id === user.id) ||
                    (msg.sender_id === user.id && msg.receiver_id === selectedChat)) {
                    setMessages(prev => [...prev, msg]);
                }
            })
            .subscribe();

        return () => { subscription.unsubscribe(); };
    }, [selectedChat, user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !user) return;

        const { error } = await supabase
            .from('messages')
            .insert([{
                sender_id: user.id,
                receiver_id: selectedChat,
                content: newMessage.trim(),
                is_read: false
            }]);

        if (!error) setNewMessage('');
    };

    const handleSuggestResponse = async () => {
        if (!messages.length) return;
        setSuggesting(true);
        try {
            const lastMsg = messages[messages.length - 1].content;
            const suggestion = await generateAgentResponse(lastMsg, "Você é um agente de viagens premium.");
            if (suggestion) setNewMessage(suggestion);
        } finally {
            setSuggesting(false);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Carregando mensagens...</div>;

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex h-[600px] animate-fadeIn">
            {/* Sidebar: Conversations */}
            <div className="w-1/3 border-r border-gray-50 flex flex-col">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-black text-gray-900">Mensagens</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Nenhuma conversa ativa.</div>
                    ) : (
                        conversations.map((conv, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedChat(conv.sender_id)}
                                className={`w-full p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-50/50 ${selectedChat === conv.sender_id ? 'bg-orange-50/30' : ''}`}
                            >
                                <img src={conv.users?.avatar_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                                <div className="text-left overflow-hidden">
                                    <p className="font-bold text-gray-900 truncate">{conv.users?.full_name || 'Usuário'}</p>
                                    <p className="text-xs text-gray-500 truncate">{conv.content}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50/30">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-gray-900">Em conversa</span>
                            </div>
                            <button onClick={handleSuggestResponse} disabled={suggesting} className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-all flex items-center gap-2">
                                {suggesting ? '...' : 'Sugerir Resposta'}
                                <i className="ri-magic-line"></i>
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${msg.sender_id === user?.id ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'}`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 opacity-60 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-50">
                            <div className="relative flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem premium..."
                                    className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
                                />
                                <button type="submit" className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg hover:rotate-6 active:scale-95">
                                    <i className="ri-send-plane-2-fill text-xl"></i>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <i className="ri-chat-smile-3-line text-8xl mb-4"></i>
                        <p className="font-bold text-xl">Selecione uma conversa para começar o atendimento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
