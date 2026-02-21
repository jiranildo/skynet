import { useState, useRef, useEffect } from 'react';
import { createPost, supabase, ensureUserProfile, uploadPostImage, createComment } from '@/services/supabase';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { generateCheckInCaption } from '@/services/gemini';
import { useAddTransaction } from '@/hooks/queries/useWallet';

interface CheckInModalProps {
    onClose: () => void;
}

export default function CheckInModal({ onClose }: CheckInModalProps) {
    const addTransactionMut = useAddTransaction();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [rawFiles, setRawFiles] = useState<File[]>([]);
    const [activity, setActivity] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [location, setLocation] = useState('');
    const [feeling, setFeeling] = useState<{ emoji: string, label: string } | null>(null);
    const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
    const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showFeelingSelector, setShowFeelingSelector] = useState(false);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [showAudienceSelector, setShowAudienceSelector] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
    const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
    const [step, setStep] = useState<'form' | 'evaluation'>('form');

    const [evaluation, setEvaluation] = useState<Record<string, number>>({
        cleanliness: 0,
        service: 0,
        waiting_time: 0,
        restroom: 0,
        visual: 0,
        staff_education: 0,
        lighting: 0,
        location_score: 0,
        near_center: 0,
        transport: 0,
        breakfast: 0,
        shower: 0,
    });

    const [wouldReturn, setWouldReturn] = useState<'yes' | 'no' | 'maybe' | null>(null);
    const [generalScore, setGeneralScore] = useState(10);

    const [isLoading, setIsLoading] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const feelings = [
        { emoji: '😊', label: 'Feliz' },
        { emoji: '😇', label: 'Agradecido' },
        { emoji: '🤩', label: 'Empolgado' },
        { emoji: '😋', label: 'Com fome' },
        { emoji: '🍷', label: 'Degustando' },
        { emoji: '✈️', label: 'Viajando' },
        { emoji: '🏖️', label: 'Relaxado' },
        { emoji: '🥳', label: 'Comemorando' },
        { emoji: '😴', label: 'Cansado' },
        { emoji: '🤔', label: 'Pensativo' },
    ];

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
        detectLocation();
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await ensureUserProfile();
            setUserProfile(profile);
        } catch (err) {
            console.error("Error loading profile:", err);
        }
    };

    const handleUserSearch = async (query: string) => {
        setUserSearchQuery(query);
        if (query.length > 2) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, username, full_name, avatar_url')
                    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                    .limit(5);
                if (error) throw error;
                setSearchResults(data || []);
            } catch (err) {
                console.error("Error searching users:", err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const toggleTagUser = (user: any) => {
        if (taggedUsers.find(u => u.id === user.id)) {
            setTaggedUsers(taggedUsers.filter(u => u.id !== user.id));
        } else {
            setTaggedUsers([...taggedUsers, user]);
        }
    };

    const fetchNearbyPlaces = async (lat: number, lon: number) => {
        try {
            console.log("Fetching nearby places using Overpass for coords:", lat, lon);

            // Overpass query for nodes, ways, and relations (nwr) with broader radius for rural areas
            const query = `
                [out:json][timeout:25];
                (
                  nwr["tourism"~"hotel|guest_house|hostel|motel|resort"](around:3000,${lat},${lon});
                  nwr["amenity"~"bar|pub|place_of_worship|church"](around:3000,${lat},${lon});
                  nwr["amenity"~"restaurant|cafe"](around:2000,${lat},${lon});
                  nwr["tourism"="museum"](around:3000,${lat},${lon});
                  nwr["shop"](around:1000,${lat},${lon});
                  nwr["historic"](around:3000,${lat},${lon});
                );
                out center 40;
            `;

            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            console.log("Overpass data:", data);

            if (data && data.elements && data.elements.length > 0) {
                // Map overpass elements to a common format
                const formattedPlaces = data.elements
                    .filter((el: any) => el.tags && el.tags.name)
                    .map((el: any) => ({
                        display_name: el.tags.name,
                        address: {
                            city: el.tags['addr:city'] || '',
                            suburb: el.tags['addr:suburb'] || ''
                        }
                    }));

                setNearbyPlaces(formattedPlaces);
            } else {
                console.log("No elements found in Overpass response");
            }
        } catch (error) {
            console.error("Error fetching nearby places with Overpass:", error);
        }
    };

    const detectLocation = async () => {
        if (!navigator.geolocation) {
            showAlert('Não Suportado', 'Geolocalização não é suportada pelo seu navegador.', 'warning');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Fetch nearby places immediately
                fetchNearbyPlaces(latitude, longitude);

                try {
                    // Reverse geocoding using Nominatim (free)
                    // Increased zoom to 18 for high precision (house number/POI)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await response.json();

                    if (data && data.address) {
                        console.log("Location Data:", data); // Helpful for debugging
                        const poi = data.name || '';
                        const road = data.address.road || '';
                        const houseNumber = data.address.house_number || '';
                        const suburb = data.address.suburb || data.address.neighbourhood || data.address.city_district || '';
                        const city = data.address.city || data.address.town || data.address.village;
                        const state = data.address.state || '';

                        // Brazilian State Abbreviation Mapper
                        const stateMap: { [key: string]: string } = {
                            'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
                            'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
                            'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
                            'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
                            'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
                            'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
                            'Sergipe': 'SE', 'Tocantins': 'TO'
                        };
                        const stateAbbr = stateMap[state] || state;

                        // Structure: [POI], [Road, Number] - [Suburb], [City] - [State]
                        const clean = (s: string) => (s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');

                        const poiClean = clean(poi);
                        const roadClean = clean(road);

                        let mainPart = poi;
                        const roadWithNumber = houseNumber ? `${road}, ${houseNumber}` : road;

                        if (road && poiClean !== roadClean && !poiClean.includes(roadClean) && !roadClean.includes(poiClean)) {
                            mainPart = mainPart ? `${mainPart}, ${roadWithNumber}` : roadWithNumber;
                        } else if (roadClean && (poiClean === roadClean || poiClean.includes(roadClean) || roadClean.includes(poiClean))) {
                            // If they overlap, use the most descriptive one + house number
                            const bestMain = poi.length >= road.length ? poi : road;
                            mainPart = houseNumber ? `${bestMain}, ${houseNumber}` : bestMain;
                        }

                        const neighborhoodCity = (suburb && city && clean(suburb) === clean(city))
                            ? city
                            : [suburb, city].filter(Boolean).join(', ');

                        const formattedLocation = [mainPart, neighborhoodCity, stateAbbr].filter(Boolean).join(' - ');

                        setLocation(formattedLocation || city || 'Localização Detectada');
                    } else {
                        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                } catch (error) {
                    console.error("Error getting address:", error);
                    setLocation("Localização detectada");
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setIsGettingLocation(false);
                showAlert('Erro', 'Não foi possível obter sua localização automaticamente.', 'warning');
            },
            { timeout: 10000 }
        );
    };

    const handleAIGenerate = async () => {
        if (!location) {
            showAlert('Localização Necessária', 'Detecte sua localização primeiro para gerar uma legenda contextual.', 'warning');
            return;
        }

        try {
            setIsGeneratingWithAI(true);

            // Pass evaluation info to AI for better context
            const evalInfo = {
                generalScore,
                ratings: Object.entries(evaluation)
                    .filter(([_, v]) => v > 0)
                    .map(([k, v]) => `${k}: ${v}/10`)
                    .join(', '),
                wouldReturn
            };

            const caption = await generateCheckInCaption(
                location,
                feeling ? `${feeling.emoji} ${feeling.label}` : undefined,
                `Atividade: ${activity}. Avaliação: ${JSON.stringify(evalInfo)}`
            );
            setActivity(caption);
        } catch (error) {
            console.error("Error generating with AI:", error);
            showAlert('Erro', 'Não foi possível gerar a legenda com IA.', 'warning');
        } finally {
            setIsGeneratingWithAI(false);
        }
    };

    const handlePlacesSelection = (place: any) => {
        const name = place.display_name.split(',')[0];
        const city = place.address?.city || place.address?.town || place.address?.village || '';
        const state = place.address?.state || '';

        // Simple format for selected place
        const formatted = [name, city, state].filter(Boolean).join(' - ');
        setLocation(formatted);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newRawFiles = [...rawFiles, ...files];
            setRawFiles(newRawFiles);

            const newUrls = files.map(file => URL.createObjectURL(file));
            setSelectedImages([...selectedImages, ...newUrls]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...selectedImages];
        const newFiles = [...rawFiles];

        URL.revokeObjectURL(newImages[index]);
        newImages.splice(index, 1);
        newFiles.splice(index, 1);

        setSelectedImages(newImages);
        setRawFiles(newFiles);
    };

    const handlePost = async () => {
        if (!activity.trim()) {
            showAlert('Campo Vazio', 'Por favor, descreva o que você está fazendo.', 'warning');
            return;
        }

        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showAlert('Login Necessário', 'Você precisa estar logado para fazer check-in.', 'warning');
                return;
            }

            await ensureUserProfile();

            let mediaUrls: string[] = [];
            if (rawFiles.length > 0) {
                const uploadPromises = rawFiles.map(file => uploadPostImage(file));
                mediaUrls = await Promise.all(uploadPromises);
            }

            // Format evaluation for caption
            const criteriaLabels: Record<string, string> = {
                service: 'Atendimento',
                staff_education: 'Educação',
                waiting_time: 'Espera/Tempo',
                cleanliness: 'Limpeza',
                visual: 'Visual/Ambiente',
                breakfast: 'Café da Manhã',
                shower: 'Chuveiro',
                restroom: 'Banheiro',
                lighting: 'Iluminação',
                location_score: 'Localização',
                near_center: 'Proximidade ao Centro',
                transport: 'Transporte/Acesso'
            };

            const evaluationLines: string[] = [];
            Object.entries(evaluation).forEach(([key, val]) => {
                if (val > 0 && criteriaLabels[key]) {
                    evaluationLines.push(`${criteriaLabels[key]}: ${val}/10`);
                }
            });

            let evaluationSummary = `⭐ AVALIAÇÃO GERAL: ${generalScore}/10\n\n`;

            if (evaluationLines.length > 0) {
                evaluationSummary += evaluationLines.join('\n');
            }

            if (wouldReturn) {
                const returnLabel = wouldReturn === 'yes' ? 'Sim ✅' : wouldReturn === 'no' ? 'Não ❌' : 'Talvez ❓';
                evaluationSummary += `\n\nVoltaria ao local? ${returnLabel}`;
            }

            const newPost = await createPost({
                user_id: user.id,
                caption: `🚩 Check-In em ${location}\n\n${activity}`,
                image_url: mediaUrls[0] || '',
                location: location,
                visibility: visibility,
                media_urls: mediaUrls,
                feeling: feeling ? `${feeling.emoji} ${feeling.label}` : undefined,
                tagged_users: taggedUsers.map(u => u.id),
                status_update: statusUpdate || undefined,
                review_data: Object.values(evaluation).some(v => v > 0) || wouldReturn ? {
                    ...evaluation,
                    general_score: generalScore,
                    would_return: wouldReturn
                } : undefined
            });

            // If there's an evaluation summary, create a comment
            if (newPost && evaluationSummary) {
                await createComment({
                    post_id: newPost.id,
                    user_id: user.id,
                    content: evaluationSummary.trim() // trim to remove leading newlines if desired
                });
            }

            try {
                // Grant reward for Check-In
                await addTransactionMut.mutateAsync({
                    type: 'earn',
                    amount: 30,
                    description: 'Check-in realizado',
                    category: 'travel'
                });
            } catch (e) {
                console.error("Failed to grant check-in reward", e);
            }

            showAlert('Sucesso', 'Seu check-in foi publicado! (+30 TM)', 'success');
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error creating check-in:', error);
            showAlert('Erro', `Erro ao publicar check-in: ${(error as any).message}`, 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Simplified */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <i className="ri-map-pin-2-fill text-2xl text-sky-500"></i>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Check-In / Out</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Compartilhando Experiências
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all"
                    >
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                    {/* User Profile Info */}
                    <div className="flex gap-4 items-center">
                        <div className="shrink-0 relative">
                            <img
                                src={userProfile?.avatar_url || 'https://via.placeholder.com/150'}
                                alt="Profile"
                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[8px]">
                                <i className="ri-check-line"></i>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 mb-0.5">{userProfile?.full_name || 'Carregando...'}</p>
                            <input
                                placeholder="Definir status..."
                                value={statusUpdate}
                                onChange={(e) => setStatusUpdate(e.target.value)}
                                className="w-full p-0 bg-transparent border-none focus:ring-0 text-xs font-semibold text-sky-500 placeholder-sky-200 outline-none"
                            />
                        </div>
                    </div>

                    {/* Location & Context Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-4">
                            {/* Current Location */}
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isGettingLocation ? 'bg-amber-400 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Localização Atual</p>
                                    {isGettingLocation ? (
                                        <p className="text-sm text-gray-400 italic">Detectando...</p>
                                    ) : (
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-transparent text-sm font-bold text-gray-800 border-none p-0 focus:ring-0 truncate"
                                        />
                                    )}
                                </div>
                                {!isGettingLocation && (
                                    <button
                                        onClick={detectLocation}
                                        className="w-8 h-8 flex items-center justify-center text-sky-600 hover:bg-sky-100/50 rounded-lg transition-colors"
                                    >
                                        <i className="ri-refresh-line"></i>
                                    </button>
                                )}
                            </div>

                            {/* Nearby Places Carousel */}
                            {nearbyPlaces.length > 0 && !isGettingLocation && (
                                <div className="pt-3 border-t border-gray-100/60">
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                                        {nearbyPlaces.map((place, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handlePlacesSelection(place)}
                                                className="shrink-0 px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 hover:border-sky-300 hover:text-sky-600 transition-all flex items-center gap-1.5 shadow-sm"
                                            >
                                                <i className="ri-map-pin-line text-xs"></i>
                                                {place.display_name.split(',')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Options Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setShowFeelingSelector(!showFeelingSelector)}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${feeling ? 'bg-sky-50 border-sky-100 text-sky-700' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                            >
                                <span className="text-lg">{feeling ? feeling.emoji : '😊'}</span>
                                <span className="text-[10px] font-black uppercase tracking-wider">{feeling ? feeling.label : 'Sentir'}</span>
                            </button>
                            <button
                                onClick={() => setShowTagSelector(!showTagSelector)}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${taggedUsers.length > 0 ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                            >
                                <i className="ri-user-smile-line text-lg"></i>
                                <span className="text-[10px] font-black uppercase tracking-wider">{taggedUsers.length > 0 ? `${taggedUsers.length}` : 'Marcar'}</span>
                            </button>
                            <button
                                onClick={() => setShowAudienceSelector(!showAudienceSelector)}
                                className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                <i className={`ri-${visibility === 'public' ? 'earth' : visibility === 'friends' ? 'group' : 'lock'}-line text-lg`}></i>
                                <span className="text-[10px] font-black uppercase tracking-wider">{visibility}</span>
                            </button>
                        </div>
                    </div>

                    {/* Selectors Popovers (Positioned below the grid) */}
                    {(showFeelingSelector || showTagSelector || showAudienceSelector) && (
                        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-xl animate-fadeIn space-y-4">
                            {showFeelingSelector && (
                                <div className="grid grid-cols-5 gap-2">
                                    {feelings.map((f, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setFeeling(f); setShowFeelingSelector(false); }}
                                            className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-2xl transition-colors"
                                        >
                                            <span className="text-2xl">{f.emoji}</span>
                                            <span className="text-[8px] font-bold text-gray-600 truncate w-full text-center">{f.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showTagSelector && (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type="text"
                                            placeholder="Procurar amigos..."
                                            value={userSearchQuery}
                                            onChange={(e) => handleUserSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border-none text-xs focus:ring-1 focus:ring-sky-500"
                                        />
                                    </div>
                                    {searchResults.length > 0 ? (
                                        <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                                            {searchResults.map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => toggleTagUser(user)}
                                                    className="w-full flex items-center justify-between p-2 hover:bg-sky-50 rounded-xl transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <img src={user.avatar_url || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
                                                        <div className="text-left">
                                                            <p className="text-xs font-bold text-gray-800">{user.full_name}</p>
                                                            <p className="text-[10px] text-gray-500">@{user.username}</p>
                                                        </div>
                                                    </div>
                                                    {taggedUsers.find(u => u.id === user.id) ? (
                                                        <i className="ri-checkbox-circle-fill text-sky-500 text-xl"></i>
                                                    ) : (
                                                        <i className="ri-add-circle-line text-gray-300 text-xl"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : userSearchQuery.length > 2 ? (
                                        <p className="text-xs text-center text-gray-400 py-2">Nenhum usuário encontrado</p>
                                    ) : null}
                                    {taggedUsers.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                            {taggedUsers.map(user => (
                                                <span key={user.id} className="flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-[9px] font-black uppercase">
                                                    @{user.username}
                                                    <button onClick={() => toggleTagUser(user)} className="hover:text-sky-900 transition-colors">
                                                        <i className="ri-close-line"></i>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {showAudienceSelector && (
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'public', icon: 'earth', label: 'Público' },
                                        { id: 'friends', icon: 'group', label: 'Amigos' },
                                        { id: 'private', icon: 'lock', label: 'Privado' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setVisibility(opt.id as any); setShowAudienceSelector(false); }}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all ${visibility === opt.id ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                                        >
                                            <i className={`ri-${opt.icon}-line text-xl`}></i>
                                            <span className="text-[8px] font-black uppercase">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity & Media Section */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Seu Relato</label>
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={isGeneratingWithAI || !location}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-[9px] font-black shadow-md hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isGeneratingWithAI ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-magic-line"></i>}
                                    GERAR COM IA
                                </button>
                            </div>
                            <textarea
                                placeholder="No que você está pensando agora?"
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                className="w-full h-28 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-sky-500/10 text-sm text-gray-800 placeholder-gray-300 resize-none transition-all outline-none"
                            />
                        </div>

                        {/* Media Upload */}
                        <div className="grid grid-cols-4 gap-3">
                            {selectedImages.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group shadow-sm">
                                    <img src={img} alt="Post" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50 transition-all"
                            >
                                <i className="ri-camera-add-line text-2xl"></i>
                                <span className="text-[9px] font-black">FOTOS</span>
                            </button>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                    </div>

                    {/* Integrated Evaluation Section */}
                    <div className="pt-4 border-t border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <i className="ri-medal-line text-sky-500 text-xl"></i>
                            <h3 className="font-bold text-gray-800">Avaliação da Experiência</h3>
                        </div>

                        {/* General Score Section */}
                        <div className="bg-sky-50/50 p-6 rounded-3xl border border-sky-100/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-800">Avaliação Geral</label>
                                <span className="text-2xl font-black text-sky-600 italic bg-white px-4 py-1 rounded-2xl shadow-sm border border-sky-100">{generalScore}/10</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={generalScore}
                                onChange={(e) => setGeneralScore(parseInt(e.target.value))}
                                className="w-full h-2 bg-sky-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                            />
                            <div className="flex justify-between text-[10px] font-black text-sky-300 uppercase">
                                <span>Péssimo</span>
                                <span>Excelente</span>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <EvaluationCategory
                                title="Atendimento & Tempo"
                                criteria={[
                                    { key: 'service', label: 'Atendimento', icon: 'ri-user-heart-line' },
                                    { key: 'staff_education', label: 'Educação', icon: 'ri-chat-smile-line' },
                                    { key: 'waiting_time', label: 'Espera', icon: 'ri-time-line' },
                                ]}
                                values={evaluation}
                                onChange={(key, val) => setEvaluation(prev => ({ ...prev, [key]: val }))}
                            />

                            <EvaluationCategory
                                title="Estrutura & Ambiente"
                                criteria={[
                                    { key: 'cleanliness', label: 'Limpeza', icon: 'ri-sparkling-line' },
                                    { key: 'visual', label: 'Visual', icon: 'ri-landscape-line' },
                                ]}
                                values={evaluation}
                                onChange={(key, val) => setEvaluation(prev => ({ ...prev, [key]: val }))}
                            />

                            <EvaluationCategory
                                title="Hospedagem"
                                criteria={[
                                    { key: 'breakfast', label: 'Café', icon: 'ri-cup-line' },
                                    { key: 'shower', label: 'Chuveiro', icon: 'ri-shower-line' },
                                ]}
                                values={evaluation}
                                onChange={(key, val) => setEvaluation(prev => ({ ...prev, [key]: val }))}
                            />
                        </div>

                        {/* Return Question */}
                        <div className="bg-sky-50/50 p-6 rounded-3xl border border-sky-100/50 text-center space-y-4">
                            <p className="text-sm font-bold text-gray-800">Voltaria ao Local?</p>
                            <div className="flex gap-2">
                                {[
                                    { id: 'yes', label: 'Sim', color: 'bg-green-500', icon: 'ri-check-line' },
                                    { id: 'no', label: 'Não', color: 'bg-red-500', icon: 'ri-close-line' },
                                    { id: 'maybe', label: 'Talvez', color: 'bg-amber-500', icon: 'ri-question-mark' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setWouldReturn(opt.id as any)}
                                        className={`flex-1 py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider ${wouldReturn === opt.id
                                            ? `${opt.color} text-white border-transparent shadow-lg scale-105`
                                            : 'bg-white text-gray-300 border-gray-100 hover:border-gray-200 hover:text-gray-400'
                                            }`}
                                    >
                                        <i className={opt.icon}></i>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Simplified */}
                <div className="px-6 py-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={handlePost}
                        disabled={isLoading || !activity.trim()}
                        className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <i className="ri-loader-4-line animate-spin text-xl"></i>
                                PROCESSANDO...
                            </>
                        ) : (
                            <>
                                <i className="ri-send-plane-2-fill text-xl"></i>
                                PUBLICAR CHECK-IN
                            </>
                        )}
                    </button>
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
                cancelText=""
            />
        </div >
    );
}

// Helper Components
function EvaluationCategory({
    title,
    criteria,
    values,
    onChange
}: {
    title: string,
    criteria: { key: string, label: string, icon: string }[],
    values: Record<string, number>,
    onChange: (key: string, val: number) => void
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50/80 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{title}</h4>
                </div>
                <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-gray-400 text-lg`}></i>
            </button>

            {isExpanded && (
                <div className="space-y-4 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                    {criteria.map((item) => (
                        <div key={item.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                                        <i className={item.icon}></i>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">{item.label}</span>
                                </div>
                                <span className="text-sm font-black text-sky-600">{values[item.key] || 0}/10</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={values[item.key] || 0}
                                onChange={(e) => onChange(item.key, parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
