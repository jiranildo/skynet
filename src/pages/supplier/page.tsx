import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SupplierStats from './components/SupplierStats';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AgentInBox from '../agent/components/AgentInBox';
import SupplierExperiences from './components/SupplierExperiences';
import Header from '../../components/layout/Header';
import NotificationsPanel from '../home/components/NotificationsPanel';

export type SupplierTab = 'overview' | 'messages' | 'experiences';

export default function SupplierDashboard() {
    const { user, loading, hasPermission } = useAuth();
    const [isSupplier, setIsSupplier] = useState<boolean | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as SupplierTab) || 'experiences';
    const navigate = useNavigate();

    const setActiveTab = (tab: SupplierTab) => {
        setSearchParams({ tab });
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
                return;
            }

            const allowed = hasPermission('can_access_services_portal');
            setIsSupplier(allowed);

            if (!allowed) {
                navigate('/');
            }
        }
    }, [user, loading, navigate, hasPermission]);

    const [isCreatingService, setIsCreatingService] = useState(false);

    if (loading || isSupplier === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isSupplier) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header onShowNotifications={() => setShowNotifications(!showNotifications)} />
            {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}

            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-32 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
                    <div className="border-l-4 border-blue-600 pl-4">
                        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Portal de Serviços</h2>
                        <p className="text-gray-500 font-medium mt-1">Gerencie tudo que você oferece no Marketplace para os viajantes.</p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                            <button
                                onClick={() => setActiveTab('experiences')}
                                title="Experiências & Serviços"
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                                    activeTab === 'experiences' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-store-3-line text-xl"></i>
                            </button>
                            <button
                                onClick={() => setActiveTab('overview')}
                                title="Dashboard"
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                                    activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-dashboard-line text-xl"></i>
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                title="Mensagens"
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                                    activeTab === 'messages' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-message-3-line text-xl"></i>
                            </button>
                        </div>

                        {activeTab === 'experiences' && (
                            <button
                                onClick={() => setIsCreatingService(true)}
                                title="Novo Serviço"
                                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow hover:shadow-lg transition-all"
                            >
                                <i className="ri-add-line text-xl"></i>
                            </button>
                        )}
                    </div>
                </div>

            <main>
                {/* For now, reusing some Agent components, can be split up into specific components later if needed */}
                {activeTab === 'overview' && <SupplierStats />}
                {activeTab === 'messages' && <AgentInBox />}
                {activeTab === 'experiences' && <SupplierExperiences isCreating={isCreatingService} onCloseCreate={() => setIsCreatingService(false)} />}
            </main>
        </div>
        </div>
    );
}
