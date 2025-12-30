import React from 'react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    if (!isOpen) return null;

    const getTheme = () => {
        switch (type) {
            case 'danger': return { bg: 'bg-red-50', text: 'text-red-900', btn: 'bg-red-600 hover:bg-red-700', icon: 'ri-error-warning-line text-red-600' };
            case 'warning': return { bg: 'bg-yellow-50', text: 'text-yellow-900', btn: 'bg-yellow-600 hover:bg-yellow-700', icon: 'ri-alert-line text-yellow-600' };
            case 'success': return { bg: 'bg-green-50', text: 'text-green-900', btn: 'bg-green-600 hover:bg-green-700', icon: 'ri-checkbox-circle-line text-green-600' };
            default: return { bg: 'bg-blue-50', text: 'text-blue-900', btn: 'bg-blue-600 hover:bg-blue-700', icon: 'ri-information-line text-blue-600' };
        }
    };

    const theme = getTheme();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all scale-100 opacity-100 overflow-hidden animate-slideUp">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${theme.bg} flex items-center justify-center mr-4`}>
                            <i className={`${theme.icon} text-2xl`}></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap break-words">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btn} transition-colors uppercase tracking-wide`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
