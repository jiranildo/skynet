import { useNavigate } from 'react-router-dom';

interface UserListModalProps {
    title: string;
    users: any[];
    onClose: () => void;
    onAction: (userId: string) => void;
    actionLabel: string;
    actionIcon?: string;
    isActionDestructive?: boolean;
    isLoading?: boolean;
}

export default function UserListModal({
    title,
    users,
    onClose,
    onAction,
    actionLabel,
    actionIcon = 'ri-user-unfollow-line',
    isActionDestructive = true,
    isLoading = false
}: UserListModalProps) {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-lg">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhum usuário encontrado.</p>
                        </div>
                    ) : (
                        users.map((item) => {
                            // Extract user data. 
                            // If title is 'Seguidores', data is in item.follower
                            // If title is 'Seguindo', data is in item.following
                            const user = item.follower || item.following || item;

                            return (
                                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                        onClick={() => {
                                            onClose();
                                            navigate(`/profile/${user.username || user.id}`);
                                        }}
                                    >
                                        <img
                                            src={user.avatar_url || 'https://via.placeholder.com/150'}
                                            alt={user.username}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{user.full_name || user.username}</h4>
                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onAction(user.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${isActionDestructive
                                                ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent'
                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                            }`}
                                    >
                                        <i className={actionIcon}></i>
                                        {actionLabel}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
