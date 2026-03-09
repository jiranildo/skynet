import React from 'react';

interface ErrorDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    error: any;
    context?: string;
}

export const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
    isOpen,
    onClose,
    title = 'Falha na Operação',
    error,
    context
}) => {
    if (!isOpen) return null;

    const getErrorMessage = (err: any): string => {
        if (!err) return 'Ocorreu um erro desconhecido.';
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        try {
            return JSON.stringify(err, null, 2);
        } catch (e) {
            return 'Erro ao processar detalhes da falha.';
        }
    };

    const getErrorDetails = (err: any): string => {
        if (!err || typeof err === 'string') return '';
        try {
            return JSON.stringify(err, null, 2);
        } catch (e) {
            return '';
        }
    };

    const errorMessage = getErrorMessage(error);
    const errorDetails = getErrorDetails(error);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl transform transition-all scale-100 opacity-100 overflow-hidden animate-scaleIn border border-red-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner">
                            <i className="ri-error-warning-fill text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
                            {context && <p className="text-red-100 text-xs font-medium uppercase tracking-widest mt-0.5">{context}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all group"
                    >
                        <i className="ri-close-line text-2xl group-hover:rotate-90 transition-transform"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Primary Message */}
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl">
                        <div className="flex gap-3 text-red-700">
                            <i className="ri-information-fill text-xl flex-shrink-0"></i>
                            <p className="font-bold leading-relaxed">{errorMessage}</p>
                        </div>
                    </div>

                    {/* Technical Details */}
                    {errorDetails && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Detalhes Técnicos</h4>
                            <div className="relative group">
                                <pre className="bg-gray-950 text-emerald-400 p-6 rounded-2xl text-xs font-mono overflow-x-auto shadow-inner border border-gray-800 leading-relaxed whitespace-pre-wrap break-all max-h-48 scrollbar-hide">
                                    {errorDetails}
                                </pre>
                                <button
                                    onClick={() => navigator.clipboard.writeText(errorDetails)}
                                    className="absolute top-4 right-4 p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Copiar detalhes"
                                >
                                    <i className="ri-file-copy-line"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Helpful Tips based on common errors */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <i className="ri-lightbulb-line text-amber-500"></i>
                            O que pode ser?
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {errorMessage.includes('API key expired') || errorMessage.includes('API_KEY_INVALID') ? (
                                <li className="flex gap-2">
                                    <span className="text-red-500 font-bold">•</span>
                                    <span>A chave da API de Inteligência Artificial expirou ou é inválida. Por favor, contate o suporte ou verifique as configurações em <b>.env</b>.</span>
                                </li>
                            ) : (
                                <>
                                    <li className="flex gap-2">
                                        <span className="text-orange-500 font-bold">•</span>
                                        <span>Pode ser uma instabilidade momentânea na conexão com o servidor.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-orange-500 font-bold">•</span>
                                        <span>Tente atualizar a página e realizar a operação novamente.</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200 uppercase tracking-wide text-sm"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};
