import { useState, useRef } from 'react';
import { createReel, ensureUserProfile, uploadFile } from '@/services/supabase';

interface CreateReelModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateReelModal({ onClose, onSuccess }: CreateReelModalProps) {
    const [video, setVideo] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                alert('Vídeo muito grande. Limite de 50MB.');
                return;
            }
            setVideo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!video) return;

        try {
            setLoading(true);
            const user = await ensureUserProfile();
            if (!user) throw new Error('Usuário não autenticado');

            // Upload video to Supabase Storage
            const videoUrl = await uploadFile('reels', video);

            // Create reel record
            await createReel({
                user_id: user.id,
                video_url: videoUrl,
                caption: caption,
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating reel:', error);
            alert('Erro ao criar Reel. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                    <h2 className="font-bold text-lg">Novo Reel</h2>
                    <button
                        onClick={handleSubmit}
                        disabled={!video || loading}
                        className={`font-bold ${!video || loading ? 'text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
                    >
                        {loading ? 'Publicando...' : 'Compartilhar'}
                    </button>
                </div>

                <div className="p-6">
                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[9/16] w-full border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 dark:bg-zinc-800/50"
                        >
                            <i className="ri-video-add-line text-5xl text-gray-400 mb-4"></i>
                            <p className="font-medium text-gray-600 dark:text-gray-400">Arraste um vídeo ou clique para selecionar</p>
                            <p className="text-xs text-gray-400 mt-2">MP4 ou WebM, até 50MB</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleVideoChange}
                                accept="video/*"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative aspect-[9/16] w-full max-h-[400px] mx-auto rounded-xl overflow-hidden bg-black">
                                <video src={preview} className="w-full h-full object-contain" controls />
                                <button
                                    onClick={() => { setVideo(null); setPreview(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70"
                                >
                                    <i className="ri-delete-bin-line"></i>
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Legenda</label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Escreva uma legenda..."
                                    className="w-full h-24 p-3 rounded-lg border dark:border-zinc-800 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
