
import React, { useEffect, useState } from 'react';
import { getGroupMembers, getCommunityMembers } from '@/services/messages/groupService';

interface GroupInfoModalProps {
    type: 'group' | 'community';
    item: any;
    onClose: () => void;
}

export default function GroupInfoModal({ type, item, onClose }: GroupInfoModalProps) {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                let data = [];
                if (type === 'group') {
                    data = await getGroupMembers(item.id);
                } else {
                    data = await getCommunityMembers(item.id);
                }
                setMembers(data || []);
            } catch (error) {
                console.error("Failed to load members", error);
            } finally {
                setLoading(false);
            }
        };
        loadMembers();
    }, [item.id, type]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">

                {/* Header */}
                <div className="bg-[#008069] px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white text-lg font-semibold">Dados do {type === 'group' ? 'Grupo' : 'Comunidade'}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                <div className="p-6">
                    {/* Avatar & Name */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-gray-100 shadow-sm relative group bg-gray-200 flex items-center justify-center">
                            {item.avatar_url ? (
                                <img src={item.avatar_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <i className={`ri-${type === 'group' ? 'group' : 'community'}-fill text-4xl text-gray-400`}></i>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center">{item.name}</h3>
                        {item.description && <p className="text-center text-gray-500 text-sm mt-1">{item.description}</p>}
                    </div>

                    {/* Members List */}
                    <div className="mb-2">
                        <h4 className="text-sm font-semibold text-[#008069] uppercase tracking-wider mb-2">Membros ({members.length})</h4>
                        <div className="max-h-64 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="text-center py-4 text-gray-400">Carregando...</div>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                                                        <i className="ri-user-fill"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">
                                                    {member.full_name || member.username || 'Usuário'}
                                                </div>
                                                {member.role === 'admin' && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Admin</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
