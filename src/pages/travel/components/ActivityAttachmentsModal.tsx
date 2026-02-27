import React, { useState, useRef } from 'react';
import { supabase } from '../../../services/supabase';
import { AlertModal } from '../../../components/AlertModal';
import { ConfirmationModal } from '../../../components/ConfirmationModal';

interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    created_at: string;
}

interface ActivityAttachmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId: string;
    attachments: Attachment[];
    onUpdateAttachments: (attachments: Attachment[]) => void;
}

export default function ActivityAttachmentsModal({
    isOpen,
    onClose,
    activityId,
    attachments,
    onUpdateAttachments
}: ActivityAttachmentsModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: 'danger' | 'warning' | 'info' | 'success' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `activity-attachments/${activityId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('trip-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('trip-assets')
                .getPublicUrl(filePath);

            const newAttachment: Attachment = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                url: publicUrl,
                type: file.type,
                created_at: new Date().toISOString()
            };

            onUpdateAttachments([...attachments, newAttachment]);
        } catch (error) {
            console.error('Error uploading file:', error);
            setAlertState({
                isOpen: true,
                title: 'Erro',
                message: 'Falha ao fazer upload do arquivo. Por favor, tente novamente.',
                type: 'danger'
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAttachment = (attachment: Attachment) => {
        setConfirmModal({
            isOpen: true,
            title: 'Excluir Anexo',
            message: `Tem certeza que deseja excluir o anexo "${attachment.name}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    // Extract file path from URL
                    const path = attachment.url.split('trip-assets/').pop();
                    if (path) {
                        const { error } = await supabase.storage.from('trip-assets').remove([path]);
                        if (error) throw error;
                    }

                    onUpdateAttachments(attachments.filter(a => a.id !== attachment.id));
                } catch (error) {
                    console.error('Error deleting attachment:', error);
                    setAlertState({
                        isOpen: true,
                        title: 'Erro',
                        message: 'Não foi possível excluir o anexo.',
                        type: 'danger'
                    });
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scaleIn overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Anexos</h3>
                        <p className="text-sm text-gray-500">Documentos e mídias</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <i className="ri-close-line text-2xl text-gray-500"></i>
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-4">
                    {attachments.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="ri-attachment-line text-3xl text-gray-300"></i>
                            </div>
                            <p className="text-gray-500 font-medium">Nenhum anexo ainda</p>
                            <p className="text-xs text-gray-400">Adicione fotos, vídeos ou PDFs</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0 relative group">
                                        {attachment.type.startsWith('image/') && (
                                            <img
                                                src={attachment.url}
                                                alt={attachment.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        )}
                                        <div className={`${attachment.type.startsWith('image/') ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
                                            {attachment.type.startsWith('video/') ? (
                                                <i className="ri-video-line text-2xl text-blue-500"></i>
                                            ) : (
                                                <i className="ri-file-text-line text-2xl text-blue-500"></i>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{attachment.name}</p>
                                        <p className="text-xs text-gray-500">{new Date(attachment.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-blue-500 shadow-sm border border-gray-100 transition-all"
                                        >
                                            <i className="ri-external-link-line"></i>
                                        </a>
                                        <button
                                            onClick={() => handleDeleteAttachment(attachment)}
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2 bg-gray-50/50 border-t border-gray-100">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,video/*,application/pdf"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <>
                                <i className="ri-loader-4-line animate-spin"></i>
                                <span>Enviando...</span>
                            </>
                        ) : (
                            <>
                                <i className="ri-add-line text-xl"></i>
                                <span>Adicionar Anexo</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState({ ...alertState, isOpen: false })}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
}
