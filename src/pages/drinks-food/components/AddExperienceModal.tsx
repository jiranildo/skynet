import { useState, useRef, useEffect } from 'react';
import { FoodExperience } from '../../../services/supabase';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AddExperienceModalProps {
    onClose: () => void;
    onAdd: (experience: FoodExperience) => void;
}

type Step = 'location' | 'capture' | 'details' | 'share';

export default function AddExperienceModal({ onClose, onAdd }: AddExperienceModalProps) {
    const [step, setStep] = useState<Step>('location');
    const [formData, setFormData] = useState<FoodExperience>({
        type: 'restaurant',
        name: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        price: '',
        rating: 0,
        description: '',
        image_url: ''
    });

    // Location State
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
    const [customLocation, setCustomLocation] = useState('');
    const [detectedAddress, setDetectedAddress] = useState<string>('');

    // Media State
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    // UI State
    const [showGamification, setShowGamification] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    // 1. Auto-Trigger Location on Mount
    useEffect(() => {
        if (step === 'location') {
            detectLocation();
        }
    }, []);

    const [locationError, setLocationError] = useState<string>('');

    const detectLocation = () => {
        setIsLoadingLocation(true);
        setDetectedAddress('');
        setLocationError('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    identifyAddressWithSara(latitude, longitude);
                    await fetchNearbyPlacesWithSara(latitude, longitude);
                },
                (error) => {
                    console.error(error);
                    setIsLoadingLocation(false);
                    let msg = "Não foi possível obter sua localização.";
                    if (error.code === 1) msg = "Permissão de localização negada.";
                    if (error.code === 2) msg = "Sinal de GPS indisponível.";
                    if (error.code === 3) msg = "Tempo limite esgotado.";
                    setLocationError(msg);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }
            );
        } else {
            setIsLoadingLocation(false);
            setLocationError("Seu navegador não suporta geolocalização.");
        }
    };

    const identifyAddressWithSara = async (lat: number, lng: number) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) return;

            const genAI = new GoogleGenerativeAI(apiKey);
            const modelWithTools = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                // @ts-ignore
                tools: [{ googleSearch: {} }]
            });

            // Prompt otimizado para evitar recusas/desculpas
            const prompt = `
            Atue como um serviço de Geocodificação Reversa.
            Tarefa: Identifique o endereço mais próximo para as coordenadas: ${lat}, ${lng}.
            Use o Google Search para verificar a localização.
            
            REGRAS OBRIGATÓRIAS:
            1. Retorne APENAS o texto: "Nome da Rua, Bairro".
            2. Se não identificar a rua exata, retorne "Bairro, Cidade".
            3. Analise o contexto da região para ser preciso.
            4. NÃO peça desculpas. NÃO diga "não consigo". NÃO dê explicações.
            5. Se falhar totalmente, retorne apenas "Localização Detectada".
            `;

            const result = await modelWithTools.generateContent(prompt);
            const text = result.response.text();

            // Limpeza extra caso o modelo ainda seja verboso
            let cleanText = text.replace(/\n/g, '').trim();
            if (cleanText.length > 50 || cleanText.includes("Infelizmente") || cleanText.includes("não consigo")) {
                cleanText = "Localização Detectada";
            }

            setDetectedAddress(cleanText);
        } catch (e) {
            console.error("Address identify failed", e);
            setDetectedAddress("Localização via Satélite");
        }
    }

    const fetchNearbyPlacesWithSara = async (lat: number, lng: number) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) {
                console.warn("No Google API Key found");
                throw new Error("No API Key");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                // @ts-ignore
                tools: [{ googleSearch: {} }]
            });

            const prompt = `
            Você é SARA, uma IA especialista em gastronomia.
            Tarefa: Identifique os 4 estabelecimentos gastronômicos (restaurantes, bares, adegas, cafeterias) MAIS PRÓXIMOS das coordenadas: ${lat}, ${lng}.
            Use o Google Search para garantir dados reais e atuais dessa localização exata.
            
            Retorne APENAS um JSON array puro com este formato (sem markdown):
            [
              { "id": 1, "name": "Nome do Local", "address": "Endereço", "type": "restaurant|wine|drink|dish" }
            ]
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                const jsonString = text.substring(start, end + 1);
                const jsonIdx = JSON.parse(jsonString);
                setNearbyPlaces(jsonIdx);
            } else {
                throw new Error("Invalid JSON from SARA");
            }
        } catch (error) {
            console.error("SARA Location Error:", error);
            setNearbyPlaces([
                { id: 1, name: 'Local Desconhecido (GPS)', address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, type: 'restaurant' }
            ]);
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Gamification Timer
    useEffect(() => {
        let interval: any;
        if (showGamification) {
            interval = setTimeout(() => {
                onClose();
                onAdd(formData); // Finalize
            }, 3000);
        }
        return () => clearTimeout(interval);
    }, [showGamification]);

    // Recording Timer
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleSelectPlace = (place: any) => {
        setFormData(prev => ({
            ...prev,
            name: place.name,
            location: place.address,
            type: place.type
        }));
        setStep('capture');
    };

    const handleCustomLocationSubmit = () => {
        if (!customLocation) return;
        setFormData(prev => ({
            ...prev,
            name: customLocation,
            location: 'Localização Personalizada'
        }));
        setStep('capture');
    };

    const handleCapture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setImagePreview(imageSrc);
                setFormData(prev => ({ ...prev, image_url: imageSrc }));
                setStep('details');
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData(prev => ({ ...prev, image_url: result }));
                setStep('details');
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                const chunks: BlobPart[] = [];
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    setAudioBlob(blob);
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                alert("Erro ao acessar microfone");
            }
        }
    };

    const handleNext = () => {
        if (step === 'details') setStep('share');
    };

    const handleSave = () => {
        setShowGamification(true);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fadeIn">

            {/* GAMIFICATION OVERLAY */}
            {showGamification && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1.5, rotate: 0 }}
                        transition={{ type: "spring" }}
                        className="text-6xl mb-4"
                    >
                        🎉
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-2">Experiência Salva!</h2>
                    <p className="text-xl text-orange-400 font-bold">+50 XP Foodie</p>
                    <p className="text-sm text-gray-400 mt-4">Redirecionando...</p>
                </motion.div>
            )}

            {/* HEADER WITH PROGRESS */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-all">
                    <i className="ri-close-line text-2xl"></i>
                </button>
                <div className="flex gap-1 flex-1 mx-4 max-w-[200px]">
                    {['location', 'capture', 'details', 'share'].map((s, i) => {
                        const steps = ['location', 'capture', 'details', 'share'];
                        const currentIndex = steps.indexOf(step);
                        const thisIndex = steps.indexOf(s);
                        return (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${thisIndex <= currentIndex ? 'bg-white' : 'bg-white/20'}`} />
                        );
                    })}
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* BACKGROUND (Dynamic based on step) */}
            <div className="absolute inset-0 z-0">
                {step === 'location' ? (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        {/* Map Placeholder or Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900"></div>
                    </div>
                ) : step === 'capture' ? (
                    <div className="w-full h-full bg-black"></div>
                ) : (
                    <>
                        <img src={imagePreview} className="w-full h-full object-cover blur-md scale-105" alt="Background" />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </>
                )}
            </div>

            {/* CONTENT STEPS */}
            <div className="relative z-10 flex-1 flex flex-col mt-16 p-6 overflow-y-auto">

                {/* STEP 1: LOCATION */}
                {step === 'location' && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <i className="ri-map-pin-user-fill text-4xl text-blue-400"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Onde você está?</h2>
                            <p className="text-white/60">
                                {locationError ? (
                                    <span className="text-red-400 font-medium">⚠️ {locationError}</span>
                                ) : detectedAddress ? (
                                    <span className="text-blue-300 font-medium animate-fadeIn">📍 {detectedAddress}</span>
                                ) : (
                                    'SARA está buscando locais próximos via Satélite...'
                                )}
                            </p>
                            {locationError && (
                                <button
                                    onClick={detectLocation}
                                    className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm transition-colors"
                                >
                                    Tentar Novamente
                                </button>
                            )}
                        </div>

                        {isLoadingLocation ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {nearbyPlaces.map(place => (
                                    <button
                                        key={place.id}
                                        onClick={() => handleSelectPlace(place)}
                                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4 text-left hover:bg-white/20 transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
                                            <i className={place.type === 'restaurant' ? 'ri-restaurant-fill' : place.type === 'wine' ? 'ri-goblet-fill' : 'ri-cup-fill'}></i>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold">{place.name}</h3>
                                            <p className="text-white/60 text-xs">{place.address}</p>
                                        </div>
                                        <i className="ri-arrow-right-s-line text-white/50 group-hover:translate-x-1 transition-transform"></i>
                                    </button>
                                ))}

                                {/* Custom Location Input */}
                                <div className="pt-4 border-t border-white/10">
                                    <label className="text-white/80 text-sm font-semibold mb-2 block">Outro local?</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customLocation}
                                            onChange={(e) => setCustomLocation(e.target.value)}
                                            placeholder="Digite o nome..."
                                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={handleCustomLocationSubmit}
                                            disabled={!customLocation}
                                            className="bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50"
                                        >
                                            <i className="ri-arrow-right-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STEP 2: CAPTURE */}
                {step === 'capture' && (
                    <div className="absolute inset-0 flex flex-col">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: 'environment' }}
                            className="w-full h-full object-cover"
                        />

                        {/* Location Overlay Badge */}
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center gap-2 border border-white/10">
                            <i className="ri-map-pin-fill text-orange-400"></i>
                            <span className="font-semibold text-sm max-w-[200px] truncate">{formData.name}</span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                            <label className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-white/20 transition-all">
                                <i className="ri-image-add-line text-2xl"></i>
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>

                            <button
                                onClick={handleCapture}
                                className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            >
                                <div className="w-16 h-16 bg-white rounded-full"></div>
                            </button>

                            <div className="w-14"></div> {/* Spacer for symmetry */}
                        </div>
                    </div>
                )}

                {/* STEP 3: DETAILS (VIBE) */}
                {step === 'details' && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="space-y-6 mt-10"
                    >
                        <div className="text-center text-white mb-4">
                            <h2 className="text-3xl font-bold">Como foi?</h2>
                            <p className="text-white/70">{formData.name}</p>
                        </div>

                        {/* Preview Thumb */}
                        <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-white/30 shadow-lg mb-6">
                            <img src={imagePreview} className="w-full h-full object-cover" />
                        </div>

                        {/* Rating */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="text-5xl transition-all hover:scale-125 focus:scale-125 hover:rotate-6"
                                >
                                    <span className={star <= (formData.rating || 0) ? 'grayscale-0' : 'grayscale opacity-30 text-white'}>
                                        {star === 1 ? '😠' : star === 2 ? '😐' : star === 3 ? '🙂' : star === 4 ? '😃' : '🤩'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Audio Note */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-semibold flex items-center gap-2">
                                    <i className="ri-mic-line"></i> Voice Note
                                </span>
                                {recordingTime > 0 && <span className="text-red-400 font-mono animate-pulse">00:0{recordingTime}</span>}
                            </div>
                            <button
                                onClick={toggleRecording}
                                className={`w-full py-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${isRecording ? 'border-red-500 bg-red-500/20' : 'border-white/30 hover:border-white/60'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-white/20'}`}>
                                    <i className={`text-xl text-white ${isRecording ? 'ri-stop-mini-fill' : 'ri-mic-fill'}`}></i>
                                </div>
                                <span className="text-white/60 text-xs">{isRecording ? 'Parar' : 'Gravar áudio'}</span>
                            </button>
                        </div>

                        {/* Price & Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 [&>option]:text-black"
                            >
                                <option value="">Preço</option>
                                <option value="$">$ Econômico</option>
                                <option value="$$">$$ Justo</option>
                                <option value="$$$">$$$ Especial</option>
                            </select>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: SHARE (PREVIEW) */}
                {step === 'share' && (
                    <motion.div
                        initial={{ zoom: 0.8, opacity: 0 }}
                        animate={{ zoom: 1, opacity: 1 }}
                        className="flex flex-col items-center mt-6"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Pronto para compartilhar!</h2>

                        {/* Instagram Story Style Card */}
                        <div className="w-[80%] aspect-[9/16] bg-white rounded-2xl overflow-hidden relative shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Background" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

                            <div className="absolute top-6 left-6 right-6 flex items-center gap-2">
                                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/30 uppercase tracking-widest">
                                    {formData.type}
                                </div>
                                <div className="ml-auto flex gap-1">
                                    {[...Array(formData.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xs">★</span>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute bottom-12 left-6 right-6 text-white">
                                <h1 className="text-2xl font-black mb-1 font-serif italic">{formData.name}</h1>
                                <div className="flex items-center gap-2 opacity-80 text-sm mb-4">
                                    <i className="ri-map-pin-fill"></i> {formData.location}
                                </div>

                                {audioBlob && (
                                    <div className="flex items-center gap-2 bg-white/20 p-2 rounded-lg backdrop-blur-sm w-fit">
                                        <i className="ri-voiceprint-line"></i>
                                        <span className="text-xs">Audio Note</span>
                                        <div className="flex gap-0.5 h-3 items-end">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: Math.random() * 100 + '%' }}></div>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8 w-full">
                            <button className="flex-1 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 backdrop-blur-md transition-all">
                                <i className="ri-instagram-line mr-2"></i> Story
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                            >
                                Salvar
                            </button>
                        </div>

                    </motion.div>
                )}

            </div>


            {/* FOOTER NAVIGATION (STEPS DETAILS) */}
            {(step === 'details') && (
                <div className="p-6 bg-transparent relative z-20">
                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-white text-black font-bold text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        Continuar
                    </button>
                </div>
            )}

        </div>
    );
}
