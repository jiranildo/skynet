import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getManagedTrips, deleteManagedTrip, calculateTripTotalSpent, calculateItineraryProgress } from '@/services/db/agent';
import { Trip, User as DBUser } from '@/services/db/types';
import { getAgents } from '@/services/db/entities';
import { assignAgentsToTrip } from '@/services/db/trips';
import { isUserAdmin, isUserSuperAdmin } from '@/services/authz';
import TripPlanningModal from '../../travel/components/TripPlanningModal';
import TripUsersModal from './TripUsersModal';

export default function ManagedTrips() {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableAgents, setAvailableAgents] = useState<DBUser[]>([]);
    const [selectedTripToAssign, setSelectedTripToAssign] = useState<Trip | null>(null);
    const [selectedAgentsForAssign, setSelectedAgentsForAssign] = useState<string[]>([]);
    const [selectedTripForPlanning, setSelectedTripForPlanning] = useState<Trip | null>(null);
    const [selectedTripForUsers, setSelectedTripForUsers] = useState<Trip | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

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

            const [data, agentsData, adminCheck, superAdminCheck] = await Promise.all([
                getManagedTrips(user.id),
                getAgents(entityId),
                isUserAdmin(user as any),
                isUserSuperAdmin(user as any)
            ]);
            setTrips(data);
            setAvailableAgents(agentsData);
            setIsAdmin(adminCheck || superAdminCheck);
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

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900">Experiências Gerenciadas</h3>
                    <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-bold">Total: {trips.length}</span>
                </div>
                <div className="overflow-x-auto">
                    {trips.length === 0 ? (
                        <div className="p-12 text-center">
                            <i className="ri-folder-open-line text-4xl text-gray-200 mb-2 block"></i>
                            <p className="text-gray-400 font-medium">Nenhuma viagem encontrada no seu portfólio.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Viagem</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Destino</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Datas</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Responsável</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Resumo Financeiro</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Preço Venda</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {trips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div
                                                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setSelectedTripForPlanning(trip)}
                                            >
                                                <img
                                                    src={trip.cover_image || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100&h=100&fit=crop`}
                                                    alt={trip.title}
                                                    className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100"
                                                />
                                                <div>
                                                    <h4 className="font-bold text-gray-900 line-clamp-1">{trip.title}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Criado por <span className="font-bold text-gray-700">{(trip as any).users?.full_name || 'Usuário'}</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-600 font-medium">{trip.destination}</td>
                                        <td className="px-6 py-5 text-gray-500 text-sm">
                                            {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'A definir'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">
                                                    {(trip as any).responsible_agent?.full_name || 'Sem agente'}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {(trip as any).responsible_agency?.name || 'Venda Direta'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2 w-28">
                                                <span className={`px-3 py-1 text-center rounded-full text-[10px] font-bold uppercase ${trip.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {trip.status === 'planning' ? 'Planejando' : trip.status}
                                                </span>
                                                {(() => {
                                                    const planningPercentage = calculateItineraryProgress(trip);
                                                    return (
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 rounded-full bg-fuchsia-500`}
                                                                style={{ width: `${planningPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {(() => {
                                                // Calculate Budget
                                                let budget = 5000;
                                                if (trip.budget) {
                                                    const bStr = String(trip.budget);
                                                    if (bStr === '1' || bStr === 'low' || bStr === 'budget') budget = 3000;
                                                    else if (bStr === '2' || bStr === 'medium' || bStr === 'standard') budget = 8000;
                                                    else if (bStr === '3' || bStr === 'high' || bStr === 'luxury') budget = 15000;
                                                    else budget = typeof trip.budget === 'number' && trip.budget > 3 ? trip.budget : 5000;
                                                }
                                                // Calculate Expenses
                                                const totalSpent = calculateTripTotalSpent(trip);

                                                const progressPercentage = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 100;

                                                return (
                                                    <div className="flex flex-col gap-1 w-32">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-gray-500">Gasto: R$ {totalSpent.toLocaleString('pt-BR')}</span>
                                                            <span className="text-gray-400">/ R$ {budget.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 rounded-full ${progressPercentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${progressPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-xs text-indigo-600">
                                            TM {trip.price_tm || 0}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => window.location.href = `/agent?tab=finance`}
                                                    className="p-2 hover:bg-emerald-50 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                                                    title="Detalhes Financeiros"
                                                >
                                                    <i className="ri-funds-box-line text-gray-400 group-hover:text-emerald-600"></i>
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => openAssignModal(trip)}
                                                        className="p-2 hover:bg-blue-50 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                                                        title="Atribuir Agentes"
                                                    >
                                                        <i className="ri-user-add-line text-gray-400 group-hover:text-blue-600"></i>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedTripForUsers(trip)}
                                                    className="p-2 hover:bg-purple-50 rounded-xl transition-all shadow-sm group-hover:shadow-md"
                                                    title="Associar Clientes"
                                                >
                                                    <i className="ri-group-line text-gray-400 group-hover:text-purple-600"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {
                selectedTripToAssign && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scaleUp">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-gray-900">Atribuir Agente</h3>
                                <button
                                    onClick={() => setSelectedTripToAssign(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <i className="ri-close-line text-xl text-gray-400"></i>
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-6">
                                Selecione os agentes responsáveis por <span className="font-bold text-gray-900">{selectedTripToAssign.title}</span>. Você pode selecionar múltiplos agentes.
                            </p>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableAgents.map((agent) => {
                                    const isSelected = selectedAgentsForAssign.includes(agent.id);
                                    return (
                                        <button
                                            key={agent.id}
                                            disabled={isAssigning}
                                            onClick={() => toggleAgentSelection(agent.id)}
                                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-50 hover:border-orange-200'
                                                } disabled:opacity-50`}
                                        >
                                            <img
                                                src={agent.avatar_url || `https://ui-avatars.com/api/?name=${agent.full_name}`}
                                                alt={agent.full_name}
                                                className="w-10 h-10 rounded-full object-cover shadow-sm"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm">{agent.full_name}</h4>
                                                <p className="text-[10px] text-gray-500">@{agent.username}</p>
                                            </div>
                                            {isSelected && (
                                                <i className="ri-checkbox-circle-fill text-orange-500 text-xl"></i>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setSelectedTripToAssign(null)}
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveAgents}
                                    disabled={isAssigning}
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isAssigning ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <i className="ri-check-line text-xl"></i>
                                    )}
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Trip Planning Modal */}
            {
                selectedTripForPlanning && (
                    <TripPlanningModal
                        isOpen={true}
                        onClose={() => setSelectedTripForPlanning(null)}
                        trip={selectedTripForPlanning}
                        onTripUpdated={(updatedTrip) => {
                            setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
                            setSelectedTripForPlanning(updatedTrip);
                        }}
                    />
                )
            }

            {/* Trip Users Modal (Multiple Association) */}
            {
                selectedTripForUsers && (
                    <TripUsersModal
                        trip={selectedTripForUsers}
                        onClose={() => setSelectedTripForUsers(null)}
                        onSuccess={() => {
                            setSelectedTripForUsers(null);
                            loadTrips(); // Refresh list to reflect travelers count changes
                        }}
                    />
                )
            }
        </div >
    );
}
