import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isUserAgent, isUserAdmin } from '@/services/authz';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CreateTripForm from '../travel/components/CreateTripForm';
import ManagedTrips from './components/ManagedTrips';
import FinancialPanel from './components/FinancialPanel';
import AgentStats from './components/AgentStats';
import AgentInBox from './components/AgentInBox';
import InfoWidgets from './components/InfoWidgets';

export type AgentTab = 'overview' | 'messages' | 'creator' | 'trips';

export default function AgentDashboard() {
    const { user, loading } = useAuth();
    const [isAgent, setIsAgent] = useState<boolean | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as AgentTab) || 'trips';
    const navigate = useNavigate();

    const setActiveTab = (tab: AgentTab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        async function checkRole() {
            if (user) {
                const agentStatus = await isUserAgent(user);
                const adminStatus = await isUserAdmin(user);
                setIsAgent(agentStatus || adminStatus);
                if (!agentStatus && !adminStatus) {
                    navigate('/');
                }
            }
        }
        if (!loading) {
            if (!user) navigate('/login');
            else checkRole();
        }
    }, [user, loading, navigate]);

    if (loading || isAgent === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAgent) return null;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-32">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Painel do Agente</h1>
                        <p className="text-gray-500 font-medium">Bem-vindo de volta! Gerencie e monetize suas experiências.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('creator')}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 hover:scale-105 transition-all"
                        >
                            <i className="ri-add-line text-xl"></i>
                            Criar Experiência
                        </button>
                    </div>
                </div>

                {/* Tabs & Widgets */}
                <div className="mt-8 flex flex-col gap-4">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit overflow-x-auto max-w-full no-scrollbar">
                        <button
                            onClick={() => setActiveTab('trips')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'trips' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Experiências
                        </button>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Mensagens
                        </button>
                    </div>

                    <div className="w-full overflow-x-auto no-scrollbar pb-2">
                        <InfoWidgets />
                    </div>
                </div>
            </header>

            <main>
                {activeTab === 'overview' && <AgentStats />}
                {activeTab === 'messages' && <AgentInBox />}
                {activeTab === 'creator' && (
                    <CreateTripForm
                        onCancel={() => setActiveTab('overview')}
                        onSuccess={() => {
                            setActiveTab('trips');
                        }}
                    />
                )}
                {activeTab === 'trips' && <ManagedTrips />}
            </main>
        </div>
    );
}
