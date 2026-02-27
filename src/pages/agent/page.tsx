import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isUserAgent } from '@/services/authz';
import { useNavigate } from 'react-router-dom';
import TripCreator from './components/TripCreator';
import ManagedTrips from './components/ManagedTrips';
import FinancialPanel from './components/FinancialPanel';
import AgentStats from './components/AgentStats';

export default function AgentDashboard() {
    const { user, loading } = useAuth();
    const [isAgent, setIsAgent] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'creator' | 'trips' | 'finance'>('overview');
    const navigate = useNavigate();

    useEffect(() => {
        async function checkRole() {
            if (user) {
                const agentStatus = await isUserAgent(user);
                setIsAgent(agentStatus);
                if (!agentStatus) {
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
                        <p className="text-gray-500 font-medium">Bem-vindo de volta! Gerencie e monetize suas viagens.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('creator')}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 hover:scale-105 transition-all"
                        >
                            <i className="ri-add-line text-xl"></i>
                            Criar Nova Viagem
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mt-8 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'trips' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Viagens Gerenciadas
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'finance' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Financeiro
                    </button>
                </div>
            </header>

            <main>
                {activeTab === 'overview' && <AgentStats />}
                {activeTab === 'creator' && <TripCreator onCancel={() => setActiveTab('overview')} />}
                {activeTab === 'trips' && <ManagedTrips />}
                {activeTab === 'finance' && <FinancialPanel />}
            </main>
        </div>
    );
}
