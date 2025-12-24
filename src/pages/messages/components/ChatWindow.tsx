import { useState, useEffect, useRef } from 'react';

interface ChatWindowProps {
  chatId: string | null;
  onBack?: () => void;
}

const chatData: Record<string, any> = {
  'sarah': {
    type: 'direct',
    name: 'Sarah Johnson',
    username: 'sarahjohnson',
    online: true,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly%20face%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-1&orientation=squarish',
    messages: [
      { id: 1, text: 'Hey! How are you doing?', sender: 'them', time: '10:30', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly%20face%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-1&orientation=squarish' },
      { id: 2, text: 'I\'m great! Just finished working on a new project', sender: 'me', time: '10:32' },
      { id: 3, text: 'That\'s awesome! What kind of project?', sender: 'them', time: '10:33', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly%20face%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-1&orientation=squarish' },
      { id: 4, text: 'It\'s a social media platform with some cool AI features', sender: 'me', time: '10:35' },
      { id: 5, text: 'That sounds amazing! Let\'s do it 🎉', sender: 'them', time: '10:36', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20smiling%20friendly%20face%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-1&orientation=squarish' }
    ]
  },
  'wine-lovers': {
    type: 'group',
    name: 'Wine Lovers 🍷',
    members: 24,
    avatar: 'https://readdy.ai/api/search-image?query=elegant%20wine%20glasses%20red%20wine%20tasting%20sophisticated%20ambiance%20warm%20lighting&width=100&height=100&seq=group-wine-lovers&orientation=squarish',
    messages: [
      { id: 1, text: 'Alguém já experimentou o Malbec argentino?', sender: 'Alex', time: '09:15', avatar: 'https://readdy.ai/api/search-image?query=professional%20person%20portrait%20friendly%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-4&orientation=squarish' },
      { id: 2, text: 'Sim! É excelente. Recomendo o Catena Zapata', sender: 'me', time: '09:18' },
      { id: 3, text: 'Concordo! Esse é um dos melhores', sender: 'Maria', time: '09:20', avatar: 'https://readdy.ai/api/search-image?query=woman%20portrait%20cheerful%20expression%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-5&orientation=squarish' },
      { id: 4, text: 'Vou experimentar esse fim de semana 🍷', sender: 'Carlos', time: '09:25', avatar: 'https://readdy.ai/api/search-image?query=man%20portrait%20confident%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-8&orientation=squarish' }
    ]
  },
  'travel-community': {
    type: 'community',
    name: 'Viajantes do Mundo 🌍',
    members: 1247,
    avatar: 'https://readdy.ai/api/search-image?query=world%20travel%20destinations%20iconic%20landmarks%20passport%20adventure%20map%20globe%20international%20tourism&width=100&height=100&seq=community-travel&orientation=squarish',
    messages: [
      { id: 1, text: 'Dicas para viajar pela Europa em 2025?', sender: 'Maria', time: '08:30', avatar: 'https://readdy.ai/api/search-image?query=woman%20portrait%20cheerful%20expression%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-5&orientation=squarish' },
      { id: 2, text: 'Comece por Portugal e Espanha! Clima ótimo e preços acessíveis', sender: 'João', time: '08:35', avatar: 'https://readdy.ai/api/search-image?query=man%20portrait%20professional%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-6&orientation=squarish' },
      { id: 3, text: 'Não esqueça de visitar a Itália! Roma é imperdível', sender: 'me', time: '08:40' },
      { id: 4, text: 'Ótimas dicas! Vou anotar tudo 📝', sender: 'Maria', time: '08:42', avatar: 'https://readdy.ai/api/search-image?query=woman%20portrait%20cheerful%20expression%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-5&orientation=squarish' }
    ]
  },
  'mike': {
    type: 'direct',
    name: 'Mike Chen',
    username: 'mikechen',
    online: true,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20confident%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-2&orientation=squarish',
    messages: [
      { id: 1, text: 'Did you see the latest updates?', sender: 'them', time: '09:15', avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20confident%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-2&orientation=squarish' },
      { id: 2, text: 'Yes! They look fantastic', sender: 'me', time: '09:20' },
      { id: 3, text: 'Thanks for sharing!', sender: 'them', time: '09:22', avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20confident%20smile%20modern%20photography%20clean%20background&width=100&height=100&seq=chat-avatar-2&orientation=squarish' }
    ]
  }
};

export default function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<any>(null);
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId !== null) {
      setChat(chatData[chatId]);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  useEffect(() => {
    let interval: any;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && chat) {
      const newMsg = {
        id: chat.messages.length + 1,
        text: newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChat({ ...chat, messages: [...chat.messages, newMsg] });
      setNewMessage('');
    }
  };

  const startCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setIsInCall(true);
    setCallDuration(0);
    setShowCallMenu(false);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallType(null);
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-full">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <i className="ri-message-3-line text-7xl text-gray-300"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">Suas Mensagens</h3>
          <p className="text-gray-500 text-sm">Envie mensagens privadas para amigos ou participe de grupos e comunidades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Call Overlay */}
      {isInCall && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{chat.name}</h3>
            <p className="text-white/70 text-lg">{formatDuration(callDuration)}</p>
          </div>

          <div className="flex items-center gap-6">
            {callType === 'video' && (
              <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <i className="ri-camera-off-line text-2xl text-white"></i>
              </button>
            )}
            <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <i className="ri-mic-off-line text-2xl text-white"></i>
            </button>
            <button 
              onClick={endCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <i className="ri-phone-line text-3xl text-white"></i>
            </button>
            <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <i className="ri-volume-up-line text-2xl text-white"></i>
            </button>
            {callType === 'video' && (
              <button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <i className="ri-camera-switch-line text-2xl text-white"></i>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden hover:bg-gray-100 p-2 rounded-full transition-colors -ml-2"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
            )}
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {chat.type === 'direct' && chat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                {chat.name}
                {chat.type === 'group' && (
                  <i className="ri-group-line text-sm text-gray-500"></i>
                )}
                {chat.type === 'community' && (
                  <i className="ri-global-line text-sm text-gray-500"></i>
                )}
              </h3>
              <p className="text-xs text-gray-500">
                {chat.type === 'direct' 
                  ? (chat.online ? 'Ativo agora' : 'Ativo há 2h')
                  : `${chat.members} membros`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chat.type === 'direct' && (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowCallMenu(!showCallMenu)}
                    className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <i className="ri-phone-line text-xl text-orange-500"></i>
                  </button>
                  {showCallMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowCallMenu(false)}
                      ></div>
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 w-48">
                        <button
                          onClick={() => startCall('voice')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <i className="ri-phone-line text-lg text-orange-500"></i>
                          <span className="text-sm font-medium">Chamada de Voz</span>
                        </button>
                        <button
                          onClick={() => startCall('video')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                          <i className="ri-vidicon-line text-lg text-orange-500"></i>
                          <span className="text-sm font-medium">Chamada de Vídeo</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
              <i className="ri-information-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chat.messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender !== 'me' && msg.avatar && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              {msg.sender !== 'me' && chat.type !== 'direct' && (
                <span className="text-xs font-medium text-gray-600 mb-1 px-1">{msg.sender}</span>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === 'me'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>
              </div>
              <span className={`text-xs mt-1 px-1 ${msg.sender === 'me' ? 'text-gray-500' : 'text-gray-500'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0"
          >
            <i className="ri-image-line text-xl text-orange-500"></i>
          </button>
          <button
            type="button"
            className="hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0"
          >
            <i className="ri-attachment-line text-xl text-gray-600"></i>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mensagem..."
            className="flex-1 outline-none bg-gray-100 rounded-full px-4 py-2.5 text-sm"
          />
          {newMessage.trim() ? (
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all flex-shrink-0 whitespace-nowrap text-sm"
            >
              Enviar
            </button>
          ) : (
            <button
              type="button"
              className="hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0"
            >
              <i className="ri-emotion-line text-xl text-gray-600"></i>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
