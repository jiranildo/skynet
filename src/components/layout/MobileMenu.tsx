import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isUserAdmin, isUserAgent, isUserSupplier } from '@/services/authz';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onWalletClick: () => void;
    onGamificationClick: () => void;
}

export default function MobileMenu({
    isOpen,
    onClose,
    onWalletClick,
    onGamificationClick
}: MobileMenuProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAgent, setIsAgent] = useState(false);
    const [isSupplier, setIsSupplier] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkRoles = async () => {
            if (user) {
                const [adminStatus, agentStatus, supplierStatus] = await Promise.all([
                    isUserAdmin(user),
                    isUserAgent(user),
                    isUserSupplier(user)
                ]);
                setIsAdmin(adminStatus);
                setIsAgent(agentStatus);
                setIsSupplier(supplierStatus);
            }
        };
        if (isOpen) {
            checkRoles();
        }
    }, [user, isOpen]);

    const allItems = [
        {
            id: 'blog',
            icon: 'ri-article-line',
            action: () => { navigate('/travel?tab=blogs'); onClose(); },
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            id: 'gamification',
            icon: 'ri-trophy-line',
            action: () => { onGamificationClick(); onClose(); },
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
        },
        {
            id: 'wallet',
            icon: 'ri-wallet-line',
            action: () => { onWalletClick(); onClose(); },
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
    ];

    if (isAgent || isAdmin) {
        allItems.push({
            id: 'agent',
            icon: 'ri-briefcase-line',
            action: () => { navigate('/agent'); onClose(); },
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        });
    }
    if (isSupplier || isAdmin) {
        allItems.push({
            id: 'supplier',
            icon: 'ri-store-2-line',
            action: () => { navigate('/supplier'); onClose(); },
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        });
    }
    if (isAdmin) {
        allItems.push({
            id: 'admin',
            icon: 'ri-shield-star-line',
            action: () => { navigate('/admin'); onClose(); },
            color: 'text-red-500',
            bg: 'bg-red-50'
        });
    }

    // Add settings at the bottom
    allItems.push({
        id: 'settings',
        icon: 'ri-user-settings-line',
        action: () => { navigate('/settings'); onClose(); },
        color: 'text-gray-600',
        bg: 'bg-gray-100'
    });

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
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="flex flex-col-reverse items-center gap-3"
                        >
                            {allItems.map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.5, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            scale: 1,
                                            y: 0,
                                            transition: { delay: index * 0.05 }
                                        }
                                    }}
                                    onClick={item.action}
                                    className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-90 transition-transform`}
                                >
                                    <i className={`${item.icon} text-xl ${item.color}`}></i>
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
