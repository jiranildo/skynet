import { useState, useRef, useEffect } from 'react';
import { storyService, uploadFile, createReel, createPost, updatePost, ensureUserProfile, uploadPostImage } from '@/services/supabase';
import { useAuth } from '../../../context/AuthContext';

interface CreateStoryModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialTab?: 'POST' | 'STORY' | 'REEL' | 'TEMPLATES';
    editingPost?: any;
}

type TabType = 'POST' | 'STORY' | 'REEL' | 'TEMPLATES';

export default function CreateStoryModal({ onClose, onSuccess, initialTab = 'STORY', editingPost }: CreateStoryModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    // Multi-file state
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Can contain existing URLs too if editing
    const [activeIndex, setActiveIndex] = useState(0);

    const [loading, setLoading] = useState(false);
    const [processingLocation, setProcessingLocation] = useState(false);

    // Unified Metadata State
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    // Effect for Editing Mode
    useEffect(() => {
        if (editingPost) {
            setActiveTab('POST'); // Editing is currently only for Posts as per legacy flow
            setCaption(editingPost.caption || '');
            setLocation(editingPost.location || '');
            setVisibility(editingPost.visibility || 'public');

            // Handle existing media
            // If editingPost has media_urls, use them. Else use image.
            // Note: we can't convert URLs to Files, so we need to handle mixed state or just URLs.
            // For simplicity, let's treat previewUrls as the source of truth for display.
            // But we can't upload existing URLs again. We need to track which are new.
            // Just use previewUrls. Logic in handlePost will differentiate.
            // HOWEVER, simple edit usually implies metadata edit OR replace media. 
            // Replacing carousel is complex. Let's assume metadata edit primarily, or full replace.

            const existingMedia = editingPost.media_urls && editingPost.media_urls.length > 0
                ? editingPost.media_urls
                : editingPost.image ? [editingPost.image] : [];

            setPreviewUrls(existingMedia);
            // files state remains empty, implying no NEW files to upload unless user adds them.
        }
    }, [editingPost]);

    // Creative Tools State
    const [activeTool, setActiveTool] = useState<'music' | 'effects' | 'text' | 'sticker' | null>(null);
    const [filter, setFilter] = useState(''); // CSS filter class or string
    const [addedText, setAddedText] = useState<{ text: string; x: number; y: number; color: string } | null>(null);
    const [stickers, setStickers] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
    const [selectedMusic, setSelectedMusic] = useState<string | null>(null);

    const [textInput, setTextInput] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');

    useEffect(() => {
        // Reset state when tab changes, ONLY if not editing
        if (!editingPost) {
            setFiles([]);
            setPreviewUrls([]);
            setActiveIndex(0);
            setCaption('');
            setLocation('');
            setFilter('');
            setAddedText(null);
            setStickers([]);
            setSelectedMusic(null);
        }
    }, [activeTab, editingPost]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);

            // Validation
            if (activeTab === 'REEL') {
                if (selectedFiles.length > 1) {
                    alert('Reels permitem apenas 1 vídeo.');
                    return;
                }
                const file = selectedFiles[0];
                if (!file.type.startsWith('video/')) {
                    alert('Para Reels, selecione um vídeo.');
                    return;
                }
                if (file.size > 50 * 1024 * 1024) {
                    alert('Vídeo muito grande. Limite de 50MB.');
                    return;
                }
                setFiles([file]);
                setPreviewUrls([URL.createObjectURL(file)]);
            } else {
                // Post / Story - Allow multiple
                const maxFiles = 10;
                if (files.length + selectedFiles.length > maxFiles) {
                    alert(`Máximo de ${maxFiles} arquivos.`);
                    return;
                }

                // Append new files
                const newFiles = [...files, ...selectedFiles];
                setFiles(newFiles);

                // Append new previews
                const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
                setPreviewUrls([...previewUrls, ...newPreviews]);
            }
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocalização não suportada.');
            return;
        }

        setProcessingLocation(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                // Format: City, State, Country
                const city = data.address?.city || data.address?.town || data.address?.village || '';
                const state = data.address?.state || '';
                const country = data.address?.country || '';

                const formatted = [city, state, country].filter(Boolean).join(', ');
                setLocation(formatted);
            } catch (error) {
                console.error("Error fetching location:", error);
                alert("Erro ao obter endereço.");
            } finally {
                setProcessingLocation(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            setProcessingLocation(false);
            alert("Permissão de localização negada ou indisponível.");
        });
    };

    const handlePost = async () => {
        // If editing, we might not have new files but have previewUrls (existing)
        const hasMedia = files.length > 0 || previewUrls.length > 0;
        if (!hasMedia && activeTab !== 'TEMPLATES') return;
        if (!user) return;

        try {
            setLoading(true);

            // Upload function helper
            const uploadNewFiles = async (folder: string) => {
                const uploadedUrls = await Promise.all(files.map(file => uploadFile(folder, file)));
                return uploadedUrls;
            };

            if (editingPost) {
                // UPDATE Logic
                let finalMediaUrls = editingPost.media_urls || (editingPost.image_url ? [editingPost.image_url] : []);

                if (files.length > 0) {
                    const newUrls = await uploadNewFiles('posts');
                    finalMediaUrls = [...finalMediaUrls, ...newUrls]; // Appending
                }

                await updatePost(editingPost.id, {
                    caption,
                    location,
                    visibility: visibility as any,
                });

            } else {
                // CREATE Logic
                if (activeTab === 'STORY') {
                    const mediaType = files[0].type.startsWith('video/') ? 'video' : 'image';
                    const mediaUrl = await uploadFile('stories', files[0]);
                    await storyService.create({
                        user_id: user.id,
                        media_url: mediaUrl,
                        media_type: mediaType,
                        caption: caption
                    });
                    // Multiple stories TODO
                } else if (activeTab === 'REEL') {
                    const videoUrl = await uploadFile('reels', files[0]);
                    await createReel({
                        user_id: user.id,
                        video_url: videoUrl,
                        caption: caption,
                    });
                } else if (activeTab === 'POST') {
                    const newUrls = await uploadNewFiles('posts');
                    await createPost({
                        user_id: user.id,
                        caption: caption,
                        image_url: newUrls[0], // Backward compatibility
                        media_urls: newUrls, // New Array
                        location: location,
                        visibility: visibility as any
                    });
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating:', error);
            alert('Erro ao criar publicação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to add text
    const handleAddText = () => {
        if (!textInput.trim()) return;
        setAddedText({
            text: textInput,
            x: 50, // Center
            y: 50,
            color: textColor
        });
        setActiveTool(null);
        setTextInput('');
    };

    // Helper to add sticker
    const handleAddSticker = (emoji: string) => {
        setStickers([...stickers, { id: Date.now(), emoji, x: 50, y: 50 }]);
        setActiveTool(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 text-white hover:text-gray-300 z-50"
            >
                <i className="ri-close-line text-3xl"></i>
            </button>

            {/* Main Content Area */}
            <div className="relative w-full max-w-md h-[85vh] bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center">

                {previewUrls.length > 0 ? (
                    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center overflow-hidden">

                        {/* Media Preview (Carousel) with Filters */}
                        <div className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${filter}`}>
                            {previewUrls[activeIndex].includes('video') || (files[activeIndex] && files[activeIndex].type.startsWith('video/')) ? (
                                <video
                                    src={previewUrls[activeIndex]}
                                    className="w-full h-full object-contain"
                                    controls={!activeTool} // Hide controls when tool active
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={previewUrls[activeIndex]}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Overlays: Text & Stickers */}
                        {addedText && (
                            <div
                                className="absolute pointer-events-none z-20"
                                style={{ top: `${addedText.y}%`, left: `${addedText.x}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                <h2
                                    className="text-2xl font-bold drop-shadow-lg"
                                    style={{ color: addedText.color }}
                                >
                                    {addedText.text}
                                </h2>
                            </div>
                        )}
                        {stickers.map(sticker => (
                            <div
                                key={sticker.id}
                                className="absolute pointer-events-none z-20 text-4xl drop-shadow-md"
                                style={{ top: `${sticker.y}%`, left: `${sticker.x}%`, transform: 'translate(-50%, -50%)' }}
                            >
                                {sticker.emoji}
                            </div>
                        ))}


                        {/* Carousel Navigation */}
                        {previewUrls.length > 1 && !activeTool && (
                            <>
                                <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-white text-xs z-10">
                                    {activeIndex + 1}/{previewUrls.length}
                                </div>
                                {activeIndex > 0 && (
                                    <button
                                        onClick={() => setActiveIndex(prev => prev - 1)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50"
                                    >
                                        <i className="ri-arrow-left-s-line"></i>
                                    </button>
                                )}
                                {activeIndex < previewUrls.length - 1 && (
                                    <button
                                        onClick={() => setActiveIndex(prev => prev + 1)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50"
                                    >
                                        <i className="ri-arrow-right-s-line"></i>
                                    </button>
                                )}
                                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                    {previewUrls.map((_, idx) => (
                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === activeIndex ? 'bg-white' : 'bg-white/50'}`} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Right Sidebar Tools */}
                        {!activeTool && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-30">
                                <button
                                    onClick={() => setActiveTool('music')}
                                    className="flex flex-col items-center gap-1 text-white hover:text-orange-500 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20 ${selectedMusic ? 'border-orange-500 text-orange-500' : ''}`}>
                                        <i className="ri-music-2-line text-xl"></i>
                                    </div>
                                    <span className="text-[10px] font-medium drop-shadow-md">Música</span>
                                </button>

                                <button
                                    onClick={() => setActiveTool('effects')}
                                    className="flex flex-col items-center gap-1 text-white hover:text-pink-500 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20 ${filter ? 'border-pink-500 text-pink-500' : ''}`}>
                                        <i className="ri-magic-line text-xl"></i>
                                    </div>
                                    <span className="text-[10px] font-medium drop-shadow-md">Efeitos</span>
                                </button>

                                <button
                                    onClick={() => setActiveTool('text')}
                                    className="flex flex-col items-center gap-1 text-white hover:text-blue-500 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <i className="ri-text text-xl"></i>
                                    </div>
                                    <span className="text-[10px] font-medium drop-shadow-md">Texto</span>
                                </button>
                                <button
                                    onClick={() => setActiveTool('sticker')}
                                    className="flex flex-col items-center gap-1 text-white hover:text-yellow-500 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <i className="ri-emotion-line text-xl"></i>
                                    </div>
                                    <span className="text-[10px] font-medium drop-shadow-md">Sticker</span>
                                </button>
                            </div>
                        )}

                        {/* Tool Overlays */}
                        {activeTool === 'music' && (
                            <div className="absolute inset-0 bg-black/80 z-40 flex flex-col p-4 animate-fadeIn">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold text-lg">Escolher Música</h3>
                                    <button onClick={() => setActiveTool(null)} className="text-white"><i className="ri-close-line text-2xl"></i></button>
                                </div>
                                <div className="space-y-2 overflow-y-auto">
                                    {['Pop Hits', 'Relaxing Vibes', 'Travel Memories', 'Party Anthem', 'Chill Lofi'].map(track => (
                                        <button
                                            key={track}
                                            onClick={() => { setSelectedMusic(track); setActiveTool(null); }}
                                            className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${selectedMusic === track ? 'bg-white/20 text-orange-400' : 'text-white hover:bg-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center"><i className="ri-music-fill"></i></div>
                                                <span>{track}</span>
                                            </div>
                                            {selectedMusic === track && <i className="ri-check-line"></i>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTool === 'effects' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 z-40 animate-slideUp">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white text-xs font-bold">Filtros</span>
                                    <button onClick={() => setActiveTool(null)} className="text-white text-xs">Concluir</button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {[
                                        { name: 'Normal', class: '' },
                                        { name: 'P&B', class: 'grayscale' },
                                        { name: 'Sépia', class: 'sepia' },
                                        { name: 'Vibrante', class: 'saturate-150' },
                                        { name: 'Frio', class: 'hue-rotate-180' },
                                        { name: 'Quente', class: 'sepia contrast-125' },
                                        { name: 'Blur', class: 'blur-[1px]' },
                                    ].map(f => (
                                        <button
                                            key={f.name}
                                            onClick={() => setFilter(f.class)}
                                            className={`flex flex-col gap-1 items-center flex-shrink-0 group`}
                                        >
                                            <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${filter === f.class ? 'border-pink-500 scale-105' : 'border-transparent group-hover:border-white/50'}`}>
                                                <img src={previewUrls[activeIndex]} className={`w-full h-full object-cover ${f.class}`} alt={f.name} />
                                            </div>
                                            <span className={`text-[10px] ${filter === f.class ? 'text-pink-500' : 'text-gray-400'}`}>{f.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTool === 'text' && (
                            <div className="absolute inset-0 bg-black/60 z-40 flex flex-col items-center justify-center p-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Digite seu texto..."
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value)}
                                    className="bg-transparent text-center text-3xl font-bold text-white outline-none w-full mb-8"
                                    style={{ color: textColor }}
                                />
                                <div className="flex gap-4 mb-8">
                                    {['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setTextColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 ${textColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setActiveTool(null)} className="px-6 py-2 bg-gray-600 rounded-full text-white font-bold">Cancelar</button>
                                    <button onClick={handleAddText} className="px-6 py-2 bg-blue-600 rounded-full text-white font-bold">Adicionar</button>
                                </div>
                            </div>
                        )}

                        {activeTool === 'sticker' && (
                            <div className="absolute inset-0 bg-black/80 z-40 flex flex-col p-4 animate-fadeIn">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold text-lg">Stickers</h3>
                                    <button onClick={() => setActiveTool(null)} className="text-white"><i className="ri-close-line text-2xl"></i></button>
                                </div>
                                <div className="grid grid-cols-5 gap-4 overflow-y-auto">
                                    {['😀', '😍', '🔥', '🎉', '✈️', '🍷', '🍕', '🏖️', '📸', '❤️', '👍', '👀', '🌟', '💡', '🎵'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleAddSticker(emoji)}
                                            className="text-4xl hover:scale-125 transition-transform p-2"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Remove Button (for media) */}
                        {!activeTool && (
                            <button
                                onClick={() => {
                                    const newFiles = [...files];
                                    newFiles.splice(activeIndex, 1);
                                    const newUrls = [...previewUrls];
                                    newUrls.splice(activeIndex, 1);
                                    setFiles(newFiles);
                                    setPreviewUrls(newUrls);
                                    if (activeIndex >= newUrls.length) setActiveIndex(Math.max(0, newUrls.length - 1));
                                }}
                                className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/80 px-3 py-1 rounded-full text-white text-xs hover:bg-red-600 transition-colors z-20"
                            >
                                <i className="ri-delete-bin-line mr-1"></i> Remover
                            </button>
                        )}

                        {/* Metadata Overlay (Caption/Location) - Hide when tool active */}
                        {!activeTool && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 z-20">
                                <input
                                    type="text"
                                    placeholder="Escreva uma legenda..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full bg-transparent text-white placeholder-gray-300 text-sm mb-3 outline-none"
                                />

                                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 flex-shrink-0">
                                        <i className="ri-map-pin-line text-gray-300 mr-2 text-xs"></i>
                                        <input
                                            type="text"
                                            placeholder="Adicionar localização"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="bg-transparent text-white placeholder-gray-400 text-xs w-28 outline-none"
                                        />
                                        <button
                                            onClick={handleGetLocation}
                                            disabled={processingLocation}
                                            className="ml-2 text-gray-300 hover:text-white"
                                            title="Obter localização atual"
                                        >
                                            {processingLocation ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-gps-fill"></i>}
                                        </button>
                                    </div>

                                    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 cursor-pointer hover:bg-white/20 transition-colors flex-shrink-0">
                                        <select
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value as any)}
                                            className="bg-transparent text-white text-xs outline-none cursor-pointer appearance-none"
                                        >
                                            <option value="public" className="text-black">Público 🌎</option>
                                            <option value="friends" className="text-black">Amigos 👥</option>
                                            <option value="private" className="text-black">Privado 🔒</option>
                                        </select>
                                        <i className="ri-arrow-down-s-line text-gray-300 ml-1 text-xs"></i>
                                    </div>

                                    {activeTab === 'POST' && files.length < 10 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center border border-white/10"
                                        >
                                            <i className="ri-add-line"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-4 text-gray-400 cursor-pointer hover:text-white transition-colors"
                    >
                        <i className={`ri-${activeTab === 'REEL' ? 'movie' : 'image'}-add-line text-6xl`}></i>
                        <span className="text-sm font-medium">Toque para adicionar {activeTab === 'REEL' ? 'vídeo' : 'mídia'}</span>
                        {activeTab === 'POST' && <span className="text-xs text-gray-500">Até 10 fotos ou vídeos</span>}
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={activeTab === 'REEL' ? "video/*" : "image/*,video/*"}
                    multiple={activeTab !== 'REEL'}
                />
            </div>

            {/* Bottom Tabs */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-50">
                {['POST', 'STORY', 'REEL', 'TEMPLATES'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            if (!editingPost) setActiveTab(tab as TabType);
                        }}
                        disabled={!!editingPost}
                        className={`text-sm font-bold tracking-wide transition-all ${activeTab === tab
                            ? 'text-white scale-110 border-b-2 border-white pb-1'
                            : 'text-gray-500 hover:text-gray-300'
                            } ${editingPost ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            {previewUrls.length > 0 && !activeTool && (
                <div className="absolute bottom-6 right-6 z-50">
                    <button
                        onClick={handlePost}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <i className="ri-loader-4-line animate-spin text-xl"></i>
                                <span className="text-sm">Publicando...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm">{editingPost ? 'Salvar' : 'Compartilhar'}</span>
                                <i className="ri-send-plane-fill"></i>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
