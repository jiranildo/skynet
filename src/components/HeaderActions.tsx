import { useUnreadCounts } from '../hooks/useUnreadCounts';

interface HeaderActionsProps {
    onShowNotifications: () => void;
    showMenu?: boolean;
    onShowMenu?: () => void;
}

export default function HeaderActions({ onShowNotifications, showMenu, onShowMenu }: HeaderActionsProps) {
    const { unreadMessages, unreadNotifications } = useUnreadCounts();

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <button
                onClick={onShowNotifications}
                className="relative hover:scale-110 transition-transform"
            >
                <i className="ri-notification-line text-xl md:text-2xl text-gray-700"></i>
                {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium">
                        {unreadNotifications}
                    </span>
                )}
            </button>
            <button
                onClick={() => window.location.href = '/messages'}
                className="relative hover:scale-110 transition-transform"
            >
                <i className="ri-message-3-line text-xl md:text-2xl text-gray-700"></i>
                {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-[10px] flex items-center justify-center font-medium">
                        {unreadMessages}
                    </span>
                )}
            </button>
            <button
                onClick={() => window.location.href = '/profile'}
                className="relative hover:scale-110 transition-transform"
            >
                <i className="ri-user-line text-xl md:text-2xl text-gray-700"></i>
            </button>
            {showMenu && onShowMenu && (
                <button
                    onClick={onShowMenu}
                    className="hover:scale-110 transition-transform md:hidden"
                >
                    <i className="ri-menu-3-line text-xl md:text-2xl text-gray-700"></i>
                </button>
            )}
        </div>
    );
}
