import { useState, useRef, useEffect } from 'react';
import { createPost, supabase, ensureUserProfile, uploadPostImage, updatePost, FeedPost } from '@/services/supabase';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface CreatePostModalProps {
  onClose: () => void;
  editingPost?: FeedPost;
}

export default function CreatePostModal({ onClose, editingPost }: CreatePostModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(editingPost?.image || null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(editingPost?.location || '');
  const [hashtags, setHashtags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends' | 'custom'>(editingPost?.visibility || 'public');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showAvatarWizard, setShowAvatarWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [avatarChoices, setAvatarChoices] = useState({
    style: '',
    gender: '',
    mood: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' | 'success' = 'info') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type
    });
  };

  useEffect(() => {
    if (editingPost) {
      // Extract hashtags from caption
      const fullCaption = editingPost.caption || '';
      const hashtagRegex = /#[a-zA-Z0-9_]+/g;
      const foundHashtags = fullCaption.match(hashtagRegex);

      if (foundHashtags) {
        setHashtags(foundHashtags.join(' '));
        // Remove hashtags from the main caption for the text area
        const captionWithoutHashtags = fullCaption.replace(hashtagRegex, '').trim();
        setCaption(captionWithoutHashtags);
      } else {
        setCaption(fullCaption);
        setHashtags('');
      }
      if (editingPost.visibility) {
        setVisibility(editingPost.visibility as any);
      }
    }
  }, [editingPost]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setShowAvatarWizard(false);
    setSelectedImage(null); // Clear previous image

    // Construct query based on choices
    const query = `${avatarChoices.style} ${avatarChoices.gender} avatar ${avatarChoices.mood}`.toLowerCase();

    // Simulate AI generation
    setTimeout(() => {
      // Use a more reliable placeholder for demo
      const randomId = Math.floor(Math.random() * 1000);
      setSelectedImage(`https://loremflickr.com/800/800/avatar,${encodeURIComponent(avatarChoices.style.split(' ')[0])}?lock=${randomId}`);
      setIsGenerating(false);
      setWizardStep(1);
    }, 2000);
  };

  const handleAIReview = async () => {
    if (!caption && !selectedImage) return;
    setIsReviewing(true);

    // Simulate AI text generation based on image and existing caption
    setTimeout(() => {
      let aiSuggestion = "";
      if (caption.toLowerCase().includes("viagem") || (selectedImage && selectedImage.includes("travel"))) {
        aiSuggestion = "Explorando novos horizontes e criando memórias inesquecíveis! 🌍✨";
      } else {
        aiSuggestion = "Momento incrível capturado! Aproveitando cada detalhe dessa jornada. 📸💫";
      }

      setCaption(aiSuggestion);
      setHashtags(prev => prev || "#viagem #lifestyle #adventure");
      setIsReviewing(false);
    }, 1500);
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      showAlert('Não Suportado', 'Geolocalização não é suportada pelo seu navegador.', 'warning');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Using a free reverse geocoding approach (or just mock it for now since we don't have an API key)
          // In a real app, we'd use Google Maps Geocoding or similar
          // For now, let's simulate the format the user wanted: "Sao Jose dos Pinhais, Parana, Brasil"
          setTimeout(() => {
            setLocation("Curitiba, Paraná, Brasil"); // Mocking for demo purposes
            setIsGettingLocation(false);
          }, 1000);
        } catch (error) {
          console.error("Error getting address:", error);
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
        showAlert('Erro', 'Não foi possível obter sua localização.', 'warning');
      }
    );
  };
  const handleShare = async () => {
    if (!selectedImage) {
      showAlert('Imagem Requerida', 'Por favor, adicione uma imagem.', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showAlert('Login Necessário', 'Você precisa estar logado para postar.', 'warning');
        return;
      }

      await ensureUserProfile();

      let finalImageUrl = selectedImage;

      // If it's a generated image (remote URL) and we don't have a raw file yet, fetch and upload it
      if (selectedImage && selectedImage.startsWith('http') && !rawFile) {
        try {
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          finalImageUrl = await uploadPostImage(blob);
        } catch (err) {
          console.error('Error persisting generated image:', err);
          // Fallback to URL if upload fails (or handle error)
        }
      }
      // If it's a local file, upload it
      else if (rawFile) {
        finalImageUrl = await uploadPostImage(rawFile);
      }

      const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;

      if (editingPost) {
        await updatePost(editingPost.id, {
          caption: fullCaption,
          image_url: finalImageUrl || '',
          location: location,
          visibility: visibility
        });
      } else {
        await createPost({
          user_id: user.id,
          caption: fullCaption,
          image_url: finalImageUrl || '',
          location: location,
          visibility: visibility
        });
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      showAlert('Erro', `Erro ao criar post: ${(error as any).message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed top-[57px] bottom-[65px] left-0 right-0 md:top-0 md:bottom-0 md:left-64 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => {
              if (showAvatarWizard) {
                if (wizardStep > 1) {
                  setWizardStep(wizardStep - 1);
                } else {
                  setShowAvatarWizard(false);
                }
              } else {
                onClose();
              }
            }}
            className="text-gray-500 font-medium hover:text-gray-700 transition-colors"
          >
            {showAvatarWizard ? 'Voltar' : 'Cancelar'}
          </button>
          <h2 className="font-bold text-lg text-gray-900">
            {showAvatarWizard ? 'Personalizar Avatar' : (editingPost ? 'Editar Post' : 'Novo Post')}
          </h2>
          {!showAvatarWizard && (
            <button
              onClick={handleShare}
              disabled={isLoading}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-send-plane-fill text-xl"></i>}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Image Area */}
          <div className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center relative group transition-colors hover:border-blue-300 overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">Criando seu avatar...</p>
              </div>
            ) : showAvatarWizard ? (
              <div className="w-full h-full p-6 flex flex-col justify-center">
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <p className="text-center text-gray-600 mb-2 font-medium">Qual o estilo do seu avatar?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['3D Pixar', 'Anime', 'Realista', 'Desenho Animado'].map(style => (
                        <button
                          key={style}
                          onClick={() => {
                            setAvatarChoices(prev => ({ ...prev, style }));
                            setWizardStep(2);
                          }}
                          className="p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all font-medium text-gray-700 flex flex-col items-center gap-2"
                        >
                          <i className={`text-2xl ${style === '3D Pixar' ? 'ri-box-3-line' : style === 'Anime' ? 'ri-ink-bottle-line' : style === 'Realista' ? 'ri-user-smile-line' : 'ri-palette-line'}`}></i>
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {wizardStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <p className="text-center text-gray-600 mb-2 font-medium">Qual o gênero?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Masculino', 'Feminino'].map(gender => (
                        <button
                          key={gender}
                          onClick={() => {
                            setAvatarChoices(prev => ({ ...prev, gender }));
                            setWizardStep(3);
                          }}
                          className="p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all font-medium text-gray-700 flex flex-col items-center gap-2"
                        >
                          <i className={`text-2xl ${gender === 'Masculino' ? 'ri-men-line' : 'ri-women-line'}`}></i>
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {wizardStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <p className="text-center text-gray-600 mb-2 font-medium">Qual o clima atual?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Viajando', 'Trabalhando', 'Relaxando', 'Festa'].map(mood => (
                        <button
                          key={mood}
                          onClick={() => {
                            setAvatarChoices(prev => ({ ...prev, mood }));
                            handleGenerateImage();
                          }}
                          className="p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all font-medium text-gray-700 flex flex-col items-center gap-2"
                        >
                          <i className={`text-2xl ${mood === 'Viajando' ? 'ri-plane-line' : mood === 'Trabalhando' ? 'ri-briefcase-line' : mood === 'Relaxando' ? 'ri-hot-tub-line' : 'ri-music-2-line'}`}></i>
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setWizardStep(1);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />

                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <i className="ri-image-add-line text-3xl"></i>
                    </div>
                    <span className="text-sm font-medium">Adicionar fotos</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full max-w-[200px] mx-auto">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs text-gray-400 font-medium uppercase">ou</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <button
                  onClick={() => setShowAvatarWizard(true)}
                  disabled={isGenerating}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                  {isGenerating ? <i className="ri-magic-line animate-spin"></i> : <i className="ri-user-magic-line"></i>}
                  Criar Avatar
                </button>
              </div>
            )}
          </div>

          {/* Caption Area */}
          <div className="relative">
            <textarea
              placeholder="Conte sobre sua viagem..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-32 p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none text-gray-700 placeholder-gray-400"
              maxLength={2200}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={handleAIReview}
                disabled={isReviewing || !caption}
                className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-1 shadow-sm"
              >
                {isReviewing ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-sparkling-fill text-yellow-400"></i>}
                Revisar IA
              </button>
              <span className="text-xs text-gray-400">{caption.length}/2200</span>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-4">

            {/* Location */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <i className="ri-map-pin-line"></i>
                <h3>Localização</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Onde você está?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
                >
                  {isGettingLocation ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-compass-3-line"></i>}
                </button>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <i className="ri-lock-line"></i>
                <h3>Quem pode ver?</h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${visibility === 'public' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200'}`}
                >
                  <i className="ri-earth-line text-lg"></i>
                  <span className="text-[10px] font-bold">Público</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('friends')}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${visibility === 'friends' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200'}`}
                >
                  <i className="ri-group-line text-lg"></i>
                  <span className="text-[10px] font-bold">Amigos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${visibility === 'private' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200'}`}
                >
                  <i className="ri-lock-2-line text-lg"></i>
                  <span className="text-[10px] font-bold">Privado</span>
                </button>
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <i className="ri-hashtag"></i>
                <h3>Hashtags</h3>
              </div>
              <input
                type="text"
                placeholder="#viagem #aventura"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-colors"
              />
            </div>

          </div>

        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText="OK"
        cancelText="" // Hide cancel button
      />
    </div >
  );
}
