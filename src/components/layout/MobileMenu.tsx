import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onWalletClick: () => void;
    onGamificationClick: () => void;
    onSkynetExplorerClick: () => void;
}

export default function MobileMenu({
    isOpen,
    onClose,
    onWalletClick,
    onGamificationClick,
    onSkynetExplorerClick
}: MobileMenuProps) {
    const [isReordering, setIsReordering] = useState(false);

    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();

    // Define all possible items
    const baseItems = useMemo(() => {
        const items = [];
        if (hasPermission('can_access_sara_ai')) {
            items.push({
                id: 'sara-ai',
                icon: 'ri-shining-2-line',
                action: () => { window.dispatchEvent(new CustomEvent('toggle-sara-ai')); onClose(); },
                color: 'text-purple-500',
                bg: 'bg-purple-50'
            });
        }
        if (hasPermission('can_manage_blog')) {
            items.push({
                id: 'blog',
                icon: 'ri-article-line',
                action: () => { navigate('/travel?tab=blogs'); onClose(); },
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            });
        }
        if (hasPermission('can_access_gamification')) {
            items.push({
                id: 'gamification',
                icon: 'ri-trophy-line',
                action: () => { onGamificationClick(); onClose(); },
                color: 'text-yellow-600',
                bg: 'bg-yellow-50'
            });
        }
        if (hasPermission('can_access_wallet')) {
            items.push({
                id: 'wallet',
                icon: 'ri-wallet-line',
                action: () => { onWalletClick(); onClose(); },
                color: 'text-green-600',
                bg: 'bg-green-50'
            });
        }
        if (hasPermission('can_access_play_explorer')) {
            items.push({
                id: 'skynet-explorer',
                icon: 'ri-gamepad-line',
                action: () => { onSkynetExplorerClick(); onClose(); },
                color: 'text-indigo-600',
                bg: 'bg-indigo-50'
            });
        }
        return items;
    }, [hasPermission, navigate, onClose, onGamificationClick, onWalletClick, onSkynetExplorerClick]);

    const roleItems = useMemo(() => {
        const items = [];
        if (hasPermission('can_access_agent_portal')) {
            items.push({
                id: 'agent',
                icon: 'ri-briefcase-line',
                action: () => { navigate('/agent'); onClose(); },
                color: 'text-purple-600',
                bg: 'bg-purple-50'
            });
        }
        if (hasPermission('can_access_services_portal')) {
            items.push({
                id: 'supplier',
                icon: 'ri-store-2-line',
                action: () => { navigate('/supplier'); onClose(); },
                color: 'text-orange-600',
                bg: 'bg-orange-50'
            });
        }
        if (hasPermission('can_access_admin')) {
            items.push({
                id: 'admin',
                icon: 'ri-shield-star-line',
                action: () => { navigate('/admin'); onClose(); },
                color: 'text-red-500',
                bg: 'bg-red-50'
            });
        }
        return items;
    }, [hasPermission, navigate, onClose]);

    const footerItems = useMemo(() => {
        const items = [];
        if (hasPermission('can_customize_platform')) {
            items.push({
                id: 'customize',
                icon: 'ri-palette-line',
                action: () => { navigate('/settings?tab=appearance'); onClose(); },
                color: 'text-pink-500',
                bg: 'bg-pink-50'
            });
        }
        if (hasPermission('can_access_my_space')) {
            items.push({
                id: 'settings',
                icon: 'ri-user-settings-line',
                action: () => { navigate('/settings'); onClose(); },
                color: 'text-gray-600',
                bg: 'bg-gray-100'
            });
        }
        return items;
    }, [hasPermission, navigate, onClose]);

    const allVisibleItems = useMemo(() => [...baseItems, ...roleItems, ...footerItems], [baseItems, roleItems, footerItems]);

    // Managed state for current order
    const [currentItems, setCurrentItems] = useState<any[]>([]);

    useEffect(() => {
        const savedOrder = localStorage.getItem('socialhub_menu_order');
        const menuOrder = savedOrder ? JSON.parse(savedOrder) : [];

        const sorted = [...allVisibleItems].sort((a, b) => {
            const indexA = menuOrder.indexOf(a.id);
            const indexB = menuOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        setCurrentItems(sorted);
    }, [allVisibleItems, isOpen]);

    const handleReorder = (newItems: any[]) => {
        setCurrentItems(newItems);
        const newOrder = newItems.map(item => item.id);
        localStorage.setItem('socialhub_menu_order', JSON.stringify(newOrder));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Minimal Backdrop for Dismissal */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] md:hidden"
                    />

                    {/* Vertical Menu Stack */}
                    <div className="fixed bottom-28 right-4 z-[70] md:hidden flex flex-col items-center gap-3">
                        {/* Customize Toggle */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsReordering(!isReordering)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isReordering ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500'}`}
                        >
                            <i className={isReordering ? 'ri-check-line text-xl' : 'ri-equalizer-line text-xl'}></i>
                        </motion.button>

                        <Reorder.Group
                            axis="y"
                            values={currentItems}
                            onReorder={handleReorder}
                            className="flex flex-col-reverse items-center gap-3"
                        >
                            {currentItems.map((item, index) => (
                                <Reorder.Item
                                    key={item.id}
                                    value={item}
                                    dragListener={isReordering}
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0,
                                        transition: { delay: index * 0.05 }
                                    }}
                                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                >
                                    <button
                                        onClick={() => !isReordering && item.action()}
                                        disabled={isReordering}
                                        className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center shadow-lg transition-all ${isReordering ? 'border-2 border-dashed border-indigo-400 cursor-grab active:cursor-grabbing scale-95 opacity-80' : 'active:scale-90'}`}
                                    >
                                        <i className={`${item.icon} text-xl ${item.color}`}></i>
                                        {isReordering && (
                                            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                <i className="ri-draggable text-[10px]"></i>
                                            </div>
                                        )}
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
