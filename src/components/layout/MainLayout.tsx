import React, { useState, Suspense } from 'react';
import Sidebar from './Sidebar';
import MobileNav from '@/pages/home/components/MobileNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import FloatingMenu from '@/components/FloatingMenu';
import BetaLabel from '@/components/BetaLabel';
import NotificationsPanel from '@/pages/home/components/NotificationsPanel';
import CreateMenu from '@/components/CreateMenu';
import CreateStoryModal from '@/pages/home/components/CreateStoryModal';
import WalletWidget from '@/components/WalletWidget';
import GamificationWidget from '@/components/GamificationWidget';
import CheckInModal from '@/components/CheckInModal';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { refreshCounts } = useUnreadCounts();

    // Shared UI States
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showWallet, setShowWallet] = useState(false);
    const [showGamification, setShowGamification] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [createModalTab, setCreateModalTab] = useState<'POST' | 'STORY' | 'REEL' | 'TEMPLATES' | null>(null);

    // Hidden on specific pages
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);
    if (isAuthPage) return <>{children}</>;

    const handleCreateOption = (option: string) => {
        if (option === 'post') setCreateModalTab('POST');
        if (option === 'reel') setCreateModalTab('REEL');
        if (option === 'story') setCreateModalTab('STORY');

        if (option === 'travel') {
            navigate('/travel');
        } else if (option === 'cellar') {
            setShowCreateMenu(false);
            navigate('/cellar');
        } else if (option === 'food') {
            navigate('/drinks-food');
        } else if (option === 'checkin') {
            setShowCheckIn(true);
        }
        setShowCreateMenu(false);
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar
                    onNotificationsClick={() => setShowNotifications(true)}
                    onCreateClick={() => setShowCreateMenu(true)}
                    onWalletClick={() => setShowWallet(true)}
                    onGamificationClick={() => setShowGamification(true)}
                />
            </div>

            {/* Main Content Area */}
            <main className="md:ml-64 min-h-screen relative">
                <Suspense fallback={
                    <div className="h-screen flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                }>
                    {children}
                </Suspense>
            </main>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <MobileNav
                    activeTab={location.pathname === '/' ? 'feed' : ''}
                    onTabChange={(tab) => {
                        if (tab === 'feed') navigate('/');
                        else if (tab === 'explore') navigate('/explore'); // Note: Need a route for this
                        else if (tab === 'reels') navigate('/reels'); // Note: Need a route for this
                    }}
                    onCreateClick={() => setShowCreateMenu(true)}
                    onMenuClick={() => navigate('/settings')}
                />
            </div>

            {/* Global Elements */}
            <FloatingMenu />
            <BetaLabel />

            {/* Modals & Panels */}
            {showNotifications && (
                <NotificationsPanel
                    onClose={() => setShowNotifications(false)}
                    onRefresh={refreshCounts}
                />
            )}

            {showCreateMenu && (
                <CreateMenu
                    onClose={() => setShowCreateMenu(false)}
                    onSelectOption={handleCreateOption}
                />
            )}

            {(createModalTab) && (
                <CreateStoryModal
                    onClose={() => setCreateModalTab(null)}
                    onSuccess={() => {
                        setCreateModalTab(null);
                        window.location.reload();
                    }}
                    initialTab={createModalTab}
                />
            )}

            {showWallet && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowWallet(false)}>
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <WalletWidget onClose={() => setShowWallet(false)} />
                    </div>
                </div>
            )}

            {showGamification && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowGamification(false)}>
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <GamificationWidget onClose={() => setShowGamification(false)} />
                    </div>
                </div>
            )}

            {showCheckIn && (
                <CheckInModal onClose={() => setShowCheckIn(false)} />
            )}
        </div>
    );
}
