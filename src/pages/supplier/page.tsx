import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SupplierStats from './components/SupplierStats';
import { isUserSupplier, isUserAdmin } from '@/services/authz';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AgentInBox from '../agent/components/AgentInBox';
import SupplierExperiences from './components/SupplierExperiences';

export type SupplierTab = 'overview' | 'messages' | 'experiences';

export default function SupplierDashboard() {
    const { user, loading } = useAuth();
    const [isSupplier, setIsSupplier] = useState<boolean | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as SupplierTab) || 'experiences';
    const navigate = useNavigate();

    const setActiveTab = (tab: SupplierTab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        async function checkRole() {
            if (user) {
                const supplierStatus = await isUserSupplier(user);
                const adminStatus = await isUserAdmin(user);
                setIsSupplier(supplierStatus || adminStatus);
                if (!supplierStatus && !adminStatus) {
                    navigate('/');
                }
            }
        }
        if (!loading) {
            if (!user) navigate('/login');
            else checkRole();
        }
    }, [user, loading, navigate]);

    if (loading || isSupplier === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isSupplier) return null;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-32">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Portal de Serviços</h1>
                        <p className="text-gray-500 font-medium">Bem-vindo de volta! Gerencie e acompanhe seus serviços corporativos.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mt-8 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab('experiences')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'experiences' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Experiências & Serviços
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Mensagens
                    </button>
                </div>
            </header>

            <main>
                {/* For now, reusing some Agent components, can be split up into specific components later if needed */}
                {activeTab === 'overview' && <SupplierStats />}
                {activeTab === 'messages' && <AgentInBox />}
                {activeTab === 'experiences' && <SupplierExperiences />}
            </main>
        </div>
    );
}
