import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getManagedTrips, deleteManagedTrip, calculateTripTotalSpent, calculateItineraryProgress } from '@/services/db/agent';
import { Trip, User as DBUser } from '@/services/db/types';
import { getAgents } from '@/services/db/entities';
import { assignAgentsToTrip } from '@/services/db/trips';
import TripPlanningModal from '../../travel/components/TripPlanningModal';
import TripUsersModal from './TripUsersModal';

export default function ManagedTrips() {
    const { user, hasPermission, isSuperAdmin: checkSuperAdmin, isAdmin: checkAdmin } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableAgents, setAvailableAgents] = useState<DBUser[]>([]);
    const [selectedTripToAssign, setSelectedTripToAssign] = useState<Trip | null>(null);
    const [selectedAgentsForAssign, setSelectedAgentsForAssign] = useState<string[]>([]);
    const [selectedTripForPlanning, setSelectedTripForPlanning] = useState<Trip | null>(null);
    const [selectedTripForUsers, setSelectedTripForUsers] = useState<Trip | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const isAdmin = checkAdmin || checkSuperAdmin || hasPermission('can_access_admin');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const loadTrips = async () => {
        if (user?.id) {
            let entityId = user.user_metadata?.entity_id;

            // If missing in metadata, fallback to a DB check
            if (!entityId) {
                const { supabase } = await import('@/services/supabase');
                const { data: userRow } = await supabase.from('users').select('entity_id').eq('id', user.id).single();
                if (userRow) {
                    entityId = userRow.entity_id;
                }
            }

            const [data, agentsData] = await Promise.all([
                getManagedTrips(user.id),
                getAgents(entityId)
            ]);
            setTrips(data);
            setAvailableAgents(agentsData);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, [user]);

    const openAssignModal = (trip: Trip) => {
        setSelectedTripToAssign(trip);
        const existingAgents = trip.metadata?.assignedAgents?.map((a: any) => a.id) || [];
        if (existingAgents.length === 0 && trip.responsible_agent_id) {
            existingAgents.push(trip.responsible_agent_id);
        }
        setSelectedAgentsForAssign(existingAgents);
    };

    const toggleAgentSelection = (agentId: string) => {
        if (selectedAgentsForAssign.includes(agentId)) {
            setSelectedAgentsForAssign(prev => prev.filter(id => id !== agentId));
        } else {
            setSelectedAgentsForAssign(prev => [...prev, agentId]);
        }
    };

    const handleSaveAgents = async () => {
        if (!selectedTripToAssign) return;
        setIsAssigning(true);
        try {
            await assignAgentsToTrip(selectedTripToAssign.id, selectedAgentsForAssign, selectedTripToAssign.metadata);
            await loadTrips();
            setSelectedTripToAssign(null);
            setSelectedAgentsForAssign([]);
        } catch (error) {
            console.error('Error assigning agents:', error);
            alert('Erro ao atribuir agentes.');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleDeleteTrip = async (tripId: string, tripTitle: string) => {
        if (window.confirm(`Tem certeza que deseja excluir permanentemente a experiência "${tripTitle}"?`)) {
            setLoading(true);
            try {
                const success = await deleteManagedTrip(tripId);
                if (success) {
                    setTrips(prev => prev.filter(t => t.id !== tripId));
                } else {
                    alert('Erro ao excluir experiência. Tente novamente mais tarde.');
                }
            } catch (error) {
                console.error("Erro deletando trip", error);
                alert('Ocorreu um erro ao excluir a experiência.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const filtered = trips.filter(trip => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = trip.title.toLowerCase().includes(query) ||
            (trip.destination || '').toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-gray-900">Experiências Gerenciadas</h3>
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-black">
                            TOTAL: {trips.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:flex-none">
                            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Buscar viagem ou destino..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                        >
                            <option value="all">Todos Status</option>
                            <option value="planning">Planejando</option>
                            <option value="confirmed">Confirmado</option>
                        </select>

                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="ri-layout-grid-line text-lg"></i>
                                <span className="text-sm">Cards</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm border border-gray-50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="ri-layout-list-line text-lg"></i>
                                <span className="text-sm">Lista</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <i className="ri-file-search-line text-4xl text-gray-200 mb-2 block"></i>
                            <p className="text-gray-400 font-medium">Nenhum resultado para os filtros aplicados.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(trip => (
                                <div key={trip.id} className="bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all group flex flex-col">
                                    <div className="relative h-40 cursor-pointer overflow-hidden" onClick={() => setSelectedTripForPlanning(trip)}>
                                        <img src={trip.cover_image || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=200&fit=crop`} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg backdrop-blur-md ${trip.status === 'confirmed' ? 'bg-green-500/80 text-white' : 'bg-orange-500/80 text-white'}`}>
                                                {trip.status === 'planning' ? 'Planejando' : trip.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h4 className="font-black text-gray-900 line-clamp-1 mb-1">{trip.title}</h4>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <i className="ri-map-pin-2-line text-xs"></i>
                                                <span className="text-[10px] font-medium">{trip.destination}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[1px]">
                                                <img src={(trip as any).responsible_agent?.avatar_url || `https://ui-avatars.com/api/?name=${(trip as any).responsible_agent?.full_name || '?'}`} className="w-full h-full rounded-full object-cover bg-white p-[1px]" alt="Agent" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-gray-900 truncate">{(trip as any).responsible_agent?.full_name || 'Sem agente'}</p>
                                                <p className="text-[9px] text-gray-500 truncate">{(trip as any).responsible_agency?.name || 'Venda Direta'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-6">
                                            {(() => {
                                                const totalSpent = calculateTripTotalSpent(trip);
                                                const progress = calculateItineraryProgress(trip);
                                                return (
                                                    <>
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Gasto</span>
                                                                <span className="text-xs font-black text-emerald-600">R$ {totalSpent.toLocaleString('pt-BR')}</span>
                                                            </div>
                                                            <div className="flex flex-col text-right">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Planejamento</span>
                                                                <span className="text-xs font-black text-fuchsia-600">{progress}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div>
                                                <span className="text-[8px] font-black text-gray-400 uppercase block mb-0.5">Venda</span>
                                                <span className="text-sm font-black text-indigo-600">TM {trip.price_tm || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => window.location.href = `/agent?tab=finance`} className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Financeiro"><i className="ri-funds-box-line"></i></button>
                                                {isAdmin && (<button onClick={() => openAssignModal(trip)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Atribuir"><i className="ri-user-add-line"></i></button>)}
                                                <button onClick={() => setSelectedTripForUsers(trip)} className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="Clientes"><i className="ri-group-line"></i></button>
                                                {trip.user_id === user?.id && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/trip/${trip.id}`); }} 
                                                            className="w-8 h-8 flex items-center justify-center bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors" 
                                                            title="Editar Experiência"
                                                        >
                                                            <i className="ri-pencil-line"></i>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id, trip.title); }} 
                                                            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" 
                                                            title="Excluir Experiência"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viagem</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destino</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Datas</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsável</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resumo Financeiro</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Preço Venda</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedTripForPlanning(trip)}>
                                                <img src={trip.cover_image || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100&h=100&fit=crop`} alt={trip.title} className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100" />
                                                <div>
                                                    <h4 className="font-bold text-gray-900 line-clamp-1">{trip.title}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Criado por <span className="font-bold text-gray-700">{(trip as any).users?.full_name || 'Usuário'}</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-600 font-medium">{trip.destination}</td>
                                        <td className="px-6 py-5 text-gray-500 text-sm">{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'A definir'}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">{(trip as any).responsible_agent?.full_name || 'Sem agente'}</span>
                                                <span className="text-[10px] text-gray-500">{(trip as any).responsible_agency?.name || 'Venda Direta'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2 w-28">
                                                <span className={`px-3 py-1 text-center rounded-full text-[10px] font-bold uppercase ${trip.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {trip.status === 'planning' ? 'Planejando' : trip.status}
                                                </span>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-500 rounded-full bg-fuchsia-500`} style={{ width: `${calculateItineraryProgress(trip)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {(() => {
                                                const totalSpent = calculateTripTotalSpent(trip);
                                                return (
                                                    <div className="flex flex-col gap-1 w-32">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-gray-500">Gasto: R$ {totalSpent.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-xs text-indigo-600">TM {trip.price_tm || 0}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => window.location.href = `/agent?tab=finance`} className="p-2 hover:bg-emerald-50 rounded-xl transition-all"><i className="ri-funds-box-line text-gray-400 hover:text-emerald-600"></i></button>
                                                {isAdmin && (<button onClick={() => openAssignModal(trip)} className="p-2 hover:bg-blue-50 rounded-xl transition-all"><i className="ri-user-add-line text-gray-400 hover:text-blue-600"></i></button>)}
                                                <button onClick={() => setSelectedTripForUsers(trip)} className="p-2 hover:bg-purple-50 rounded-xl transition-all"><i className="ri-group-line text-gray-400 hover:text-purple-600"></i></button>
                                                {trip.user_id === user?.id && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/trip/${trip.id}`); }} 
                                                            className="p-2 hover:bg-orange-50 rounded-xl transition-all" 
                                                            title="Editar Experiência"
                                                        >
                                                            <i className="ri-pencil-line text-gray-400 hover:text-orange-600"></i>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id, trip.title); }} 
                                                            className="p-2 hover:bg-red-50 rounded-xl transition-all" 
                                                            title="Excluir Experiência"
                                                        >
                                                            <i className="ri-delete-bin-line text-gray-400 hover:text-red-600"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedTripToAssign && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scaleUp">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900">Atribuir Agente</h3>
                            <button onClick={() => setSelectedTripToAssign(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><i className="ri-close-line text-xl text-gray-400"></i></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Selecione os agentes responsáveis por <span className="font-bold text-gray-900">{selectedTripToAssign.title}</span>.</p>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableAgents.map((agent) => {
                                const isSelected = selectedAgentsForAssign.includes(agent.id);
                                return (
                                    <button key={agent.id} disabled={isAssigning} onClick={() => toggleAgentSelection(agent.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-50 hover:border-orange-200'} disabled:opacity-50`}>
                                        <img src={agent.avatar_url || `https://ui-avatars.com/api/?name=${agent.full_name}`} alt={agent.full_name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 text-sm">{agent.full_name}</h4>
                                            <p className="text-[10px] text-gray-500">@{agent.username}</p>
                                        </div>
                                        {isSelected && <i className="ri-checkbox-circle-fill text-orange-500 text-xl"></i>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setSelectedTripToAssign(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">Cancelar</button>
                            <button onClick={handleSaveAgents} disabled={isAssigning} className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {isAssigning ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="ri-check-line text-xl"></i>}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedTripForPlanning && (
                <TripPlanningModal isOpen={true} onClose={() => setSelectedTripForPlanning(null)} trip={selectedTripForPlanning} onTripUpdated={(updatedTrip) => {
                    setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
                    setSelectedTripForPlanning(updatedTrip);
                }} />
            )}

            {selectedTripForUsers && (
                <TripUsersModal trip={selectedTripForUsers} onClose={() => setSelectedTripForUsers(null)} onSuccess={() => {
                    setSelectedTripForUsers(null);
                    loadTrips();
                }} />
            )}
        </div>
    );
}
