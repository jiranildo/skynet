
import { useState, useEffect, useRef } from 'react';
import { getConversationsKeyed, archiveConversation, deleteConversation } from '@/services/messages/chatService';
import {
    getMyGroups, getMyCommunities,
    archiveGroup, archiveCommunity,
    deleteGroup, deleteCommunity,
    leaveGroup, leaveCommunity
} from '@/services/messages/groupService';
import { useLongPress } from '../hooks/useLongPress';

// ... (keep exports and imports same)


import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CreateFlowModal from './CreateFlowModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import EditGroupModal from './EditGroupModal';
import { CameraCaptureModal } from './CameraCaptureModal';

interface MessagesSidebarProps {
    currentUser: any;
    selectedChatId: string | null;
    onSelectChat: (id: string, type: 'direct' | 'group' | 'community') => void;
}

interface ConversationItemProps {
    item: any;
    isSelected: boolean;
    onSelect: (id: string, type: any) => void;
    onContextMenu: (e: any, item: any) => void;
    formatTime: (date?: string) => string;
}

function ConversationItem({ item, isSelected, onSelect, onContextMenu, formatTime }: ConversationItemProps) {
    const longPressProps = useLongPress({
        onLongPress: (e) => {
            // Calculate position for context menu based on the event
            const x = e.clientX || (e.touches && e.touches[0]?.clientX);
            const y = e.clientY || (e.touches && e.touches[0]?.clientY);

            // Create a pseudo-mouse event for handleContextMenu
            const pseudoEvent = {
                preventDefault: () => { },
                clientX: x,
                clientY: y
            } as any;

            onContextMenu(pseudoEvent, item);
        },
        onClick: () => onSelect(item.id, item.type),
        delay: 500
    });

    return (
        <div
            {...longPressProps}
            onContextMenu={(e) => onContextMenu(e, item)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] group relative
                ${isSelected ? 'bg-[#f0f2f5]' : ''}
            `}
        >
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {item.avatar ? (
                        <img src={item.avatar} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <i className={`ri-${item.type === 'direct' ? 'user' : item.type === 'group' ? 'group' : 'community'}-fill text-xl`}></i>
                        </div>
                    )}
                </div>
                {item.type === 'direct' && Math.random() > 0.7 && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
            </div>

            <div className="flex-1 min-w-0 border-b border-gray-100 pb-3 group-hover:border-transparent">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-medium text-[#111b21] truncate text-[17px]">{item.name}</h3>
                    <span className="text-[12px] text-[#667781] whitespace-nowrap">{formatTime(item.time)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-[14px] text-[#667781] truncate pr-2 flex items-center gap-1">
                        {item.lastMessage || 'Inicie uma conversa'}
                    </p>
                    {item.unread > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-[#25d366] text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {item.unread}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

type TabType = 'all' | 'direct' | 'groups' | 'communities' | 'archived';

interface PendingAction {
    type: 'archive' | 'unarchive' | 'delete' | 'leave';
    item: any;
}

export default function MessagesSidebar({ currentUser, selectedChatId, onSelectChat }: MessagesSidebarProps) {
    const [tab, setTab] = useState<TabType>('all');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Confirmation State
    const [confirmation, setConfirmation] = useState<PendingAction | null>(null);

    // Edit Modal State
    const [editingItem, setEditingItem] = useState<{ type: 'group' | 'community', item: any } | null>(null);

    // Context Menu State
    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: any } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [showCamera, setShowCamera] = useState(false);

    // Data
    const [conversations, setConversations] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [communities, setCommunities] = useState<any[]>([]);

    const executeAction = async () => {
        if (!confirmation) return;
        const { type, item } = confirmation;

        try {
            if (type === 'archive' || type === 'unarchive') {
                const isArchive = type === 'archive';
                if (item.type === 'direct') await archiveConversation(item.id, isArchive);
                if (item.type === 'group') await archiveGroup(item.id, isArchive);
                if (item.type === 'community') await archiveCommunity(item.id, isArchive);
            }

            if (type === 'delete') {
                if (item.type === 'direct') await deleteConversation(item.id);
                if (item.type === 'group') await deleteGroup(item.id);
                if (item.type === 'community') await deleteCommunity(item.id);
            }

            if (type === 'leave') {
                if (item.type === 'group') await leaveGroup(item.id);
                if (item.type === 'community') await leaveCommunity(item.id);
            }

            // Refresh
            refreshData();
            if (selectedChatId === item.id) {
                onSelectChat(null as any, item.type); // Clear selection
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao realizar ação");
        } finally {
            setConfirmation(null);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const [dms, grps, comms] = await Promise.all([
                getConversationsKeyed(tab === 'archived' ? 'archived' : 'active'),
                getMyGroups(tab === 'archived'),
                getMyCommunities(tab === 'archived')
            ]);

            setConversations(dms || []);
            setGroups(grps || []);
            setCommunities(comms || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        setContextMenu(null);
    }, [tab]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);


    const handleContextMenu = (e: React.MouseEvent, item: any) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            item
        });
    };

    const initiateAction = (action: 'archive' | 'unarchive' | 'delete' | 'leave' | 'edit') => {
        if (!contextMenu?.item) return;

        // Close menu immediately
        const item = contextMenu.item;
        setContextMenu(null);

        if (action === 'edit') {
            if (item.type === 'group' || item.type === 'community') {
                setEditingItem({ type: item.type, item });
            }
            return;
        }

        // Open confirmation
        setConfirmation({ type: action as any, item });
    };


    const getCreateInitialMode = () => {
        if (tab === 'direct') return 'direct';
        if (tab === 'groups') return 'group';
        if (tab === 'communities') return 'community';
        return undefined; // Let user choose
    };

    const filterItems = () => {
        const dms = (['all', 'direct', 'archived'].includes(tab)) ? conversations.map(c => ({
            ...c,
            id: c.id,
            name: c.otherUser?.full_name || c.otherUser?.username || 'User',
            avatar: c.otherUser?.avatar_url,
            lastMessage: c.last_message,
            time: c.last_message_at,
            type: 'direct' as const,
            isArchived: tab === 'archived',
            unread: c.unread_count || 0 // Use actual unread count if available
        })) : [];

        const grps = (['all', 'groups', 'archived'].includes(tab)) ? groups.map(g => ({
            ...g,
            id: g.id,
            name: g.name,
            avatar: g.avatar_url,
            lastMessage: g.last_message,
            time: g.last_message_at || g.created_at,
            type: 'group' as const,
            isArchived: tab === 'archived',
            unread: g.unread_count || 0
        })) : [];

        const comms = (['all', 'communities', 'archived'].includes(tab)) ? communities.map(c => ({
            ...c,
            id: c.id,
            name: c.name,
            avatar: c.avatar_url,
            lastMessage: `${c.members_count || 0} membros`,
            time: c.created_at,
            type: 'community' as const,
            isArchived: tab === 'archived',
            unread: c.unread_count || 0
        })) : [];

        let items = [...dms, ...grps, ...comms];

        // Sort by time
        return items.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
    };



    const handleCreateSuccess = (id: string, type: 'direct' | 'group' | 'community') => {
        setShowCreateModal(false);
        setTab(type === 'direct' ? 'direct' : type === 'group' ? 'groups' : 'communities');
        refreshData();
        onSelectChat(id, type);
    };

    const items = filterItems();

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return 'Ontem';
        return format(date, 'dd/MM/yyyy');
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header: WhatsApp Style */}
            <div className="px-4 py-3 bg-white flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-[22px] font-bold text-[#111b21]">Conversas</h2>
                <div className="flex gap-4 text-[#111b21]">
                    <button onClick={() => setShowCamera(true)} className="hover:bg-gray-100 p-1.5 rounded-full"><i className="ri-camera-line text-xl"></i></button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="hover:bg-gray-100 p-1.5 rounded-full"
                    >
                        <i className={`ri-add-circle-fill text-[28px] text-[#00a884]`}></i>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 pb-2 sticky top-[60px] bg-white z-10">
                <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 h-[35px]">
                    <i className="ri-search-line text-gray-500 mr-3 text-sm"></i>
                    <input
                        placeholder="Pesquisar ou começar uma nova conversa"
                        className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#54656f]"
                    />
                </div>
            </div>

            {/* Tabs / Filters */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 sticky top-[105px] bg-white z-10">
                {[
                    { id: 'all', label: 'Todas' },
                    { id: 'direct', label: 'Privadas' },
                    { id: 'groups', label: 'Grupos' },
                    { id: 'communities', label: 'Comunidades' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as TabType)}
                        className={`
                            px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors
                            ${tab === t.id
                                ? 'bg-[#e7fce3] text-[#008069]'
                                : 'bg-[#f0f2f5] text-[#54656f] hover:bg-gray-200'
                            }
                        `}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Archived Row */}
            <button
                onClick={() => setTab('archived')}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-[#111b21] mx-2 mt-1 rounded-lg"
            >
                <div className="w-6 flex justify-center"><i className="ri-archive-line text-xl opacity-60"></i></div>
                <span className="font-medium text-[15px]">Arquivadas</span>
            </button>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-400">Carregando...</div>
                ) : (
                    items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
                            <i className="ri-chat-1-line text-4xl mb-2 text-gray-300"></i>
                            <p className="text-sm">Nenhuma conversa encontrada</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <ConversationItem
                                key={`${item.type}-${item.id}`}
                                item={item}
                                isSelected={selectedChatId === item.id}
                                onSelect={onSelectChat}
                                onContextMenu={handleContextMenu}
                                formatTime={formatTime}
                            />
                        ))
                    )
                )}
            </div>
            {/* Context Menu */}
            {
                contextMenu && (
                    <div
                        ref={contextMenuRef}
                        className="fixed bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 w-48 animate-fadeIn"
                        style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
                    >
                        {(contextMenu.item.type === 'group' || contextMenu.item.type === 'community') && (
                            <button
                                onClick={() => initiateAction('edit')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <i className="ri-edit-line"></i> Editar
                            </button>
                        )}
                        <button
                            onClick={() => initiateAction(contextMenu.item.isArchived ? 'unarchive' : 'archive')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <i className={`ri-archive-${contextMenu.item.isArchived ? 'arrow-up' : 'drawer'}-line`}></i>
                            {contextMenu.item.isArchived ? 'Desarquivar' : 'Arquivar'}
                        </button>
                        {contextMenu.item.type === 'direct' ? (
                            <button
                                onClick={() => initiateAction('delete')}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <i className="ri-delete-bin-line"></i> Excluir
                            </button>
                        ) : (
                            <button
                                onClick={() => initiateAction('leave')}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <i className="ri-logout-box-r-line"></i> Sair do {contextMenu.item.type === 'group' ? 'Grupo' : 'Comunidade'}
                            </button>
                        )}
                    </div>
                )
            }

            {
                showCreateModal && (
                    <CreateFlowModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleCreateSuccess}
                        initialMode={getCreateInitialMode()}
                    />
                )
            }

            {
                editingItem && (
                    <EditGroupModal
                        type={editingItem.type}
                        item={editingItem.item}
                        onClose={() => setEditingItem(null)}
                        onSuccess={() => {
                            setEditingItem(null);
                            refreshData();
                        }}
                    />
                )
            }

            {
                confirmation && (
                    <ConfirmationModal
                        isOpen={!!confirmation}
                        onClose={() => setConfirmation(null)}
                        onConfirm={executeAction}
                        title="Confirmar Ação"
                        message="Tem certeza?"
                        type="warning"
                    />
                )
            }


            <CameraCaptureModal
                isOpen={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={(img) => {
                    console.log("Captured from Sidebar:", img);
                    setShowCamera(false);
                    // Usage for Status or Send to New Contact would go here
                }}
            />
        </div >
    );
}
