import React, { useState } from 'react';
import { Trip } from '@/services/db/types';
import { syncTripUsers, searchAgentClients } from '@/services/db/agent';

interface TripUsersModalProps {
    trip: Trip;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TripUsersModal({ trip, onClose, onSuccess }: TripUsersModalProps) {
    const [loading, setLoading] = useState(false);
    const [clientInput, setClientInput] = useState('');

    // Extract existing clients from metadata.sharedWith
    const initialClients = Array.isArray(trip.metadata?.sharedWith)
        ? trip.metadata.sharedWith.filter((u: any) => u.id).map((u: any) => ({
            id: u.id,
            full_name: u.full_name || u.id,
            email: u.email || ''
        }))
        : [];

    const [selectedClients, setSelectedClients] = useState<{ id: string, full_name: string, email: string }[]>(initialClients);

    const [searchResults, setSearchResults] = useState<{ id: string, full_name: string, email: string, avatar_url?: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Debounced Search Effect
    React.useEffect(() => {
        const fetchResults = async () => {
            if (clientInput.trim().length >= 2) {
                setIsSearching(true);
                const results = await searchAgentClients(clientInput);
                setSearchResults(results);
                setIsSearching(false);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 400);
        return () => clearTimeout(timeoutId);
    }, [clientInput]);

    const handleAddClient = (client: { id: string, full_name: string, email: string }) => {
        if (!selectedClients.some(c => c.id === client.id)) {
            setSelectedClients(prev => [...prev, client]);
        }
        setClientInput('');
        setShowResults(false);
    };

    const handleRemoveClient = (idToRemove: string) => {
        setSelectedClients(prev => prev.filter(c => c.id !== idToRemove));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const success = await syncTripUsers(trip.id, selectedClients, trip.metadata);

            if (success) {
                onSuccess();
            } else {
                alert('Erro ao atualizar os usuários da viagem.');
            }
        } catch (error) {
            console.error('Error updating trip users:', error);
            alert('Erro ao atualizar os usuários da viagem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Associar Usuários</h2>
                        <p className="text-gray-500 font-medium text-sm mt-1">{trip.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <i className="ri-close-line text-2xl text-gray-400"></i>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Buscar Clientes ou Grupos</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={clientInput}
                                onChange={e => setClientInput(e.target.value)}
                                onFocus={() => clientInput.length >= 2 && setShowResults(true)}
                                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                placeholder="Digite o nome ou e-mail..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                            />
                            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>

                            {/* Autocomplete Dropdown */}
                            {showResults && (
                                <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto top-[100%]">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">Buscando...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map(result => (
                                            <button
                                                key={result.id}
                                                type="button"
                                                onClick={() => handleAddClient({ id: result.id, full_name: result.full_name, email: result.email })}
                                                className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                {result.avatar_url ? (
                                                    <img src={result.avatar_url} alt={result.full_name} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                                                        <i className="ri-user-line text-sm"></i>
                                                    </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-gray-900 truncate text-sm">{result.full_name}</span>
                                                    <span className="text-xs text-gray-500 truncate">{result.email}</span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">Nenhum resultado encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-orange-50 rounded-xl p-4 mt-3">
                            <p className="text-xs text-orange-800 font-medium leading-relaxed">
                                Ao adicionar os usuários abaixo, esta viagem aparecerá no painel "Minhas Viagens" de todos eles simultaneamente.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 mt-4 min-h-[50px] max-h-48 overflow-y-auto pr-1">
                            {selectedClients.length === 0 ? (
                                <p className="text-sm text-gray-400 italic py-2 w-full text-center">Nenhum cliente associado ainda.</p>
                            ) : (
                                selectedClients.map(client => (
                                    <div key={client.id} className="flex justify-between items-center bg-orange-50/50 border border-orange-100 px-3 py-2 rounded-xl text-sm group transition-colors hover:border-orange-200">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-orange-800 truncate">{client.full_name}</span>
                                            {client.email && <span className="text-xs text-orange-600/70 truncate">{client.email}</span>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveClient(client.id)}
                                            className="ml-2 w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange-400 hover:text-white hover:bg-red-500 transition-colors shadow-sm"
                                        >
                                            <i className="ri-close-line text-lg"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <i className="ri-check-line text-xl"></i>
                            )}
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
