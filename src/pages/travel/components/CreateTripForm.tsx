import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../../../context/AuthContext';
import { createTrip, updateTrip } from '../../../services/supabase';

interface CreateTripFormProps {
    onCancel: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function CreateTripForm({ onCancel, onSuccess, initialData }: CreateTripFormProps) {
    const { user } = useAuth();

    // Helper to map numeric budget to string ID
    const getBudgetLevel = (val?: number) => {
        if (!val) return 'medium';
        if (val <= 1) return 'low';
        if (val <= 2) return 'medium';
        return 'high';
    };

    // Create Trip Form State
    const [tripForm, setTripForm] = useState({
        name: initialData?.title || '',
        destination: initialData?.destination || '',
        startDate: initialData?.start_date || '',
        endDate: initialData?.end_date || '',
        startTime: initialData?.metadata?.startTime || '09:00',
        endTime: initialData?.metadata?.endTime || '18:00',
        travelers: initialData?.travelers || 2,
        tripType: initialData?.trip_type || 'leisure',
        budget: getBudgetLevel(initialData?.budget),
        description: initialData?.description || '',
        coverImage: initialData?.cover_image || ''
    });

    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    const handleGenerateImage = async () => {
        if (!tripForm.destination) {
            alert('Por favor, preencha o destino primeiro');
            return;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) {
            alert('Erro de configuração: VITE_GOOGLE_API_KEY não encontrada. O sistema usará um prompt padrão.');
            console.error('VITE_GOOGLE_API_KEY missing');
            // We proceed with the default prompt, but warn the user
        }

        setIsGeneratingImage(true);
        setGenerationProgress(0);

        // Progress Animation
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 10;
                setGenerationProgress(Math.min(90, progress));
            }
        }, 300);

        try {
            // Find selected trip type name for context
            const selectedTripType = tripTypes.find(t => t.id === tripForm.tripType)?.name || 'Viagem';

            // 1. Generate Optimized Search Keywords with Gemini
            let searchKeywords = `${tripForm.destination}, ${selectedTripType}, travel`; // Default
            let isGeminiUsed = false;

            if (apiKey) {
                try {
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                    const result = await model.generateContent(`
                        You are an expert travel photographer's assistant.
                        Generate a SHORT, VIVID, VISUAL description (in English) of a perfect travel photo for: "${tripForm.destination}" with a "${selectedTripType}" vibe.
                        
                        Rules:
                        - Focus on visual elements (colors, lighting, landmarks).
                        - NO introduction, NO "Here is a description", NO "prompt:".
                        - Just the raw description text.
                        - Max 25 words.
                        - Example output: "Sun setting over the Eiffel Tower with golden light reflecting on the Seine river, autumn leaves"
                    `);
                    const response = await result.response;
                    const text = response.text();
                    if (text && text.length > 5) {
                        searchKeywords = text.replace(/[*"]/g, '').trim(); // Clean up quotes/markdown
                        isGeminiUsed = true;
                        console.log('✨ Gemini visual description:', searchKeywords);
                    }
                } catch (e) {
                    console.error("Gemini description generation failed:", e);
                }
            }

            // 2. Reliable Image Strategy: LoremFlickr (Real Photos)
            // Pollinations is unstable and returns "Robot" errors. We switch to LoremFlickr for real photos based on tags.

            const cleanDestination = tripForm.destination.replace(/[^a-zA-Z0-9\s]/g, '');
            // Create specific tags for Flickr search
            // We use the Gemini visual keywords if available, otherwise construct standard tags
            const tags = searchKeywords
                ? searchKeywords.split(',').map(s => s.trim().replace(/\s+/g, '')).join(',')
                : `${cleanDestination.replace(/\s+/g, '')},travel,landmark,city`;

            const randomLock = Math.floor(Math.random() * 10000);

            // Primary: Strict Tag Match
            const primaryUrl = `https://loremflickr.com/1200/630/${encodeURIComponent(tags)}/all?lock=${randomLock}`;

            // Secondary: Relaxed Match (Just City)
            const secondaryUrl = `https://loremflickr.com/1200/630/${encodeURIComponent(cleanDestination.replace(/\s+/g, ''))},travel/?lock=${randomLock}`;

            // Final Fallback: Unsplash Static
            const staticFallbackUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&q=80&w=1200&auto=format&fit=crop`;

            const img = new Image();

            const finish = (url: string) => {
                clearInterval(interval);
                setGenerationProgress(100);
                setTimeout(() => {
                    setTripForm(prev => ({ ...prev, coverImage: url }));
                    setIsGeneratingImage(false);
                    setGenerationProgress(0);
                }, 500);
            };

            img.onload = () => finish(primaryUrl);

            img.onerror = () => {
                const img2 = new Image();
                img2.onload = () => finish(secondaryUrl);
                img2.onerror = () => finish(staticFallbackUrl);
                img2.src = secondaryUrl;
            };

            img.src = primaryUrl;

        } catch (error) {
            clearInterval(interval);
            setIsGeneratingImage(false);
            console.error("Image generation flow error", error);
            alert('Ocorreu um erro ao gerar a imagem.');
        }
    };

    const tripTypes = [
        { id: 'leisure', name: 'Lazer', icon: 'ri-sun-line', color: 'text-orange-500' },
        { id: 'business', name: 'Negócios', icon: 'ri-briefcase-line', color: 'text-blue-500' },
        { id: 'adventure', name: 'Aventura', icon: 'ri-mountain-line', color: 'text-green-500' },
        { id: 'romantic', name: 'Romântica', icon: 'ri-heart-line', color: 'text-pink-500' },
        { id: 'family', name: 'Família', icon: 'ri-group-line', color: 'text-purple-500' },
        { id: 'cultural', name: 'Cultural', icon: 'ri-building-line', color: 'text-amber-500' }
    ];

    const budgetOptions = [
        { id: 'low', name: 'Econômica', range: 'Até R$ 3.000', color: 'text-green-500' },
        { id: 'medium', name: 'Moderada', range: 'R$ 3.000 - R$ 8.000', color: 'text-blue-500' },
        { id: 'high', name: 'Luxo', range: 'Acima de R$ 8.000', color: 'text-purple-500' }
    ];

    const handleCreateTrip = async () => {
        if (!user) {
            alert('Você precisa estar logado para criar uma viagem.');
            return;
        }

        // Validate form
        if (!tripForm.name || !tripForm.destination || !tripForm.startDate || !tripForm.endDate) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Map budget string to number
        const budgetMap: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3 };
        const budgetVal = budgetMap[tripForm.budget] || 2;

        const tripData = {
            user_id: user.id,
            title: tripForm.name,
            destination: tripForm.destination,
            start_date: tripForm.startDate,
            end_date: tripForm.endDate,
            travelers: tripForm.travelers,
            trip_type: tripForm.tripType as any,
            budget: budgetVal,
            description: tripForm.description,
            cover_image: tripForm.coverImage,
            status: 'planning' as const,
            metadata: {
                startTime: tripForm.startTime,
                endTime: tripForm.endTime
            }
        };

        try {
            if (initialData) {
                // Update existing trip
                await updateTrip(initialData.id, tripData);
            } else {
                // Create new trip
                await createTrip(tripData);
                alert('Viagem criada com sucesso! 🎉');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving trip:', error);
            alert('Erro ao salvar viagem. Tente novamente.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0 mb-6">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        {initialData ? 'Editar Viagem' : 'Criar Nova Viagem'}
                    </h2>
                    <p className="text-gray-500">
                        {initialData ? 'Atualize os detalhes da sua aventura' : 'Comece a planejar sua próxima aventura'}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <i className="ri-close-line text-2xl text-gray-500"></i>
                </button>
            </div>

            {/* Form Content */}
            <div className="p-6 pt-0">
                <div className="space-y-6 max-w-4xl mx-auto">

                    {/* Trip Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nome da Viagem *
                        </label>
                        <input
                            type="text"
                            value={tripForm.name}
                            onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                            placeholder="Ex: Férias em Paris 2025"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                        />
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Destino *
                        </label>
                        <div className="relative">
                            <i className="ri-map-pin-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                value={tripForm.destination}
                                onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                                placeholder="Para onde você quer ir?"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Data de Ida *
                            </label>
                            <input
                                type="date"
                                value={tripForm.startDate}
                                onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Data de Volta *
                            </label>
                            <input
                                type="date"
                                value={tripForm.endDate}
                                onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Horário de Chegada (Ida)
                            </label>
                            <div className="relative">
                                <i className="ri-time-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="time"
                                    value={tripForm.startTime}
                                    onChange={(e) => setTripForm({ ...tripForm, startTime: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Horário de Partida (Volta)
                            </label>
                            <div className="relative">
                                <i className="ri-time-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="time"
                                    value={tripForm.endTime}
                                    onChange={(e) => setTripForm({ ...tripForm, endTime: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Travelers */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Número de Viajantes
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setTripForm({ ...tripForm, travelers: Math.max(1, tripForm.travelers - 1) })}
                                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                            >
                                <i className="ri-subtract-line text-lg"></i>
                            </button>
                            <span className="text-xl font-semibold text-gray-900 w-12 text-center">{tripForm.travelers}</span>
                            <button
                                onClick={() => setTripForm({ ...tripForm, travelers: tripForm.travelers + 1 })}
                                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                            >
                                <i className="ri-add-line text-lg"></i>
                            </button>
                        </div>
                    </div>

                    {/* Trip Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Tipo de Viagem
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {tripTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setTripForm({ ...tripForm, tripType: type.id })}
                                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${tripForm.tripType === type.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <i className={`${type.icon} text-2xl ${type.color} mb-2 block`}></i>
                                    <h4 className="font-semibold text-gray-900 text-sm">{type.name}</h4>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Orçamento Aproximado
                        </label>
                        <div className="space-y-3">
                            {budgetOptions.map((budget) => (
                                <button
                                    key={budget.id}
                                    onClick={() => setTripForm({ ...tripForm, budget: budget.id })}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${tripForm.budget === budget.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className={`font-semibold ${budget.color} text-sm`}>{budget.name}</h4>
                                            <p className="text-gray-600 text-xs">{budget.range}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 ${tripForm.budget === budget.id
                                            ? 'border-orange-500 bg-orange-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {tripForm.budget === budget.id && (
                                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            value={tripForm.description}
                            onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                            placeholder="Conte-nos mais sobre seus planos para esta viagem..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 resize-none"
                        />
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Capa da Viagem
                        </label>

                        <div className="space-y-4">
                            {/* Preview */}
                            {tripForm.coverImage ? (
                                <div
                                    className="relative w-full h-48 rounded-xl overflow-hidden group cursor-pointer border-2 border-transparent hover:border-orange-300 transition-all"
                                    onClick={() => document.getElementById('coverImageUpload')?.click()}
                                    title="Clique para alterar a imagem"
                                >
                                    <img
                                        src={tripForm.coverImage}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <div className="flex flex-col items-center text-white">
                                            <i className="ri-image-edit-line text-3xl mb-1"></i>
                                            <span className="text-sm font-medium">Trocar Imagem</span>
                                        </div>
                                    </div>

                                    {/* Delete Button (Stop Propagation to avoid triggering upload) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTripForm({ ...tripForm, coverImage: '' });
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors z-10"
                                        title="Remover imagem"
                                    >
                                        <i className="ri-close-line text-lg"></i>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="file"
                                        id="coverImageUpload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setTripForm({ ...tripForm, coverImage: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => document.getElementById('coverImageUpload')?.click()}
                                        className="w-full py-8 border-2 border-dashed border-gray-200 bg-gray-50 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-300 transition-all flex flex-col items-center justify-center gap-2"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-1">
                                            <i className="ri-upload-cloud-2-line text-2xl text-gray-700"></i>
                                        </div>
                                        <span>Fazer Upload</span>
                                        <span className="text-xs font-normal opacity-70">JPG ou PNG</span>
                                    </button>

                                    <button
                                        onClick={handleGenerateImage}
                                        disabled={isGeneratingImage || !tripForm.destination}
                                        className="w-full py-8 border-2 border-dashed border-purple-200 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                                    >
                                        {isGeneratingImage ? (
                                            <div className="flex flex-col items-center gap-3 z-10 w-full px-4">
                                                <div className="w-full bg-purple-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                                                        style={{ width: `${generationProgress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium animate-pulse">
                                                    Criando sua imagem... {Math.round(generationProgress)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-1">
                                                    <i className="ri-magic-line text-2xl text-purple-600"></i>
                                                </div>
                                                <span>Gerar com IA</span>
                                                <span className="text-xs font-normal opacity-70 text-center px-2">
                                                    {tripForm.destination ? `Baseado em: ${tripForm.destination}` : 'Preencha o destino'}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        {!tripForm.destination && (
                            <p className="text-xs text-orange-500">
                                * Preencha o destino para gerar uma imagem com IA
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleCreateTrip}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                    {initialData ? 'Salvar Alterações' : 'Criar Viagem'}
                </button>
            </div>
        </div>
    );
}
