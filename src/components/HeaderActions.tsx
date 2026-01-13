import { useUnreadCounts } from '../hooks/useUnreadCounts';
import { useSystemNotifications } from '../hooks/useSystemNotifications';
import { useAuth } from '../context/AuthContext';

interface HeaderActionsProps {
    onShowNotifications: () => void;
    showMenu?: boolean;
    onShowMenu?: () => void;
    menuIcon?: string;
}

export default function HeaderActions({ onShowNotifications, showMenu, onShowMenu, menuIcon = 'ri-menu-3-line' }: HeaderActionsProps) {
    const { unreadMessages, unreadNotifications } = useUnreadCounts();
    const { signOut } = useAuth();

    // Auto-check for system notifications (Passport, Trips)
    useSystemNotifications();

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <button
                onClick={onShowNotifications}
                className="relative hover:scale-110 transition-transform w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100"
            >
                <i className="ri-notification-line text-xl md:text-2xl text-gray-700"></i>
                {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium border border-white">
                        {unreadNotifications}
                    </span>
                )}
            </button>
            <button
                onClick={() => window.location.href = '/messages'}
                className="relative hover:scale-110 transition-transform w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100"
            >
                <i className="ri-message-3-line text-xl md:text-2xl text-gray-700"></i>
                {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium border border-white">
                        {unreadMessages}
                    </span>
                )}
            </button>
            <button
                onClick={() => window.location.href = '/profile'}
                className="relative hover:scale-110 transition-transform w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100"
            >
                <i className="ri-user-line text-xl md:text-2xl text-gray-700"></i>
            </button>
            <button
                onClick={async () => {
                    try {
                        await signOut();
                        window.location.href = '/login';
                    } catch (error) {
                        console.error('Error signing out:', error);
                    }
                }}
                className="relative hover:scale-110 transition-transform w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100"
                title="Sair"
            >
                <i className="ri-logout-box-r-line text-xl md:text-2xl text-gray-700"></i>
            </button>
            {showMenu && onShowMenu && (
                <button
                    onClick={onShowMenu}
                    className="hover:scale-110 transition-transform md:hidden w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    <i className={`${menuIcon} text-xl md:text-2xl text-gray-700`}></i>
                </button>
            )}
        </div>
    );
}
