import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { Trip } from '@/services/db/types';
import { getTrips } from '@/services/db/trips';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Activity {
    id: string;
    title: string;
    type: string;
    time?: string;
    status: string;
}

interface Node {
    id: string;
    dayIndex: number;
    activity: Activity;
    status: 'completed' | 'current' | 'locked';
    missionType: 'quiz' | 'photo' | 'review' | 'fortune';
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
}

interface SkynetExplorerWidgetProps {
    onClose: () => void;
}

// Enhanced Regional Centers for the "world_map_interactive_board" Image
// High Precision Coordinates for accurate country-level clustering
const REGION_CENTERS: Record<string, { x: number, y: number, radiusX: number, radiusY: number }> = {
    // Specific Countries
    'france': { x: 50, y: 27, radiusX: 1.5, radiusY: 1.5 },
    'italy': { x: 51, y: 32, radiusX: 1, radiusY: 1.5 },
    'uk': { x: 47, y: 26, radiusX: 1, radiusY: 1.2 },
    'spain': { x: 46, y: 32, radiusX: 1.2, radiusY: 1.2 },
    'portugal': { x: 44, y: 32, radiusX: 0.5, radiusY: 1 },
    'germany': { x: 50, y: 28, radiusX: 1.5, radiusY: 1.5 },
    'russia': { x: 65, y: 22, radiusX: 5, radiusY: 5 },
    'brazil': { x: 34, y: 70, radiusX: 4, radiusY: 5 },
    'argentina': { x: 30, y: 78, radiusX: 2, radiusY: 5 },
    'us_east': { x: 27, y: 35, radiusX: 2, radiusY: 4 }, // NY, Florida
    'us_west': { x: 18, y: 35, radiusX: 2, radiusY: 4 }, // CA, Vegas
    'japan': { x: 86, y: 32, radiusX: 1, radiusY: 2 },
    'australia': { x: 88, y: 68, radiusX: 3, radiusY: 3 },
    'new_zealand': { x: 93, y: 78, radiusX: 1, radiusY: 2 },
    'thailand': { x: 82, y: 56, radiusX: 1.5, radiusY: 2 },

    // Broad Continents Fallback
    'south america': { x: 30, y: 70, radiusX: 5, radiusY: 10 },
    'north america': { x: 18, y: 35, radiusX: 10, radiusY: 10 },
    'europe': { x: 50, y: 28, radiusX: 6, radiusY: 6 },
    'africa': { x: 52, y: 55, radiusX: 8, radiusY: 12 },
    'asia': { x: 75, y: 35, radiusX: 12, radiusY: 10 },
    'oceania': { x: 86, y: 75, radiusX: 6, radiusY: 6 },
    'global': { x: 50, y: 50, radiusX: 40, radiusY: 25 }
};

const ORIGIN_BRASIL = { x: 34, y: 72 }; // Position for Brazil on the map

// Simple Activity templates to inject when the itinerary is sparse
const CREATIVE_MISSIONS = [
    { title: "Raio-X do Aeroporto Local", type: "transport", missionType: "quiz" },
    { title: "A Primeira Foto no Destino", type: "activity", missionType: "photo" },
    { title: "Aventura ao Fazer o Check-in", type: "accommodation", missionType: "review" },
    { title: "Desafio Culinário Local!", type: "restaurant", missionType: "quiz" },
    { title: "Sorteio de Passeios", type: "activity", missionType: "fortune" }
] as const;

// Granular Multi-Region Matcher
const getDestinationRegions = (destination: string): string[] => {
    const dest = destination.toLowerCase();
    const found: { key: string, index: number }[] = [];

    const check = (keywords: string[], key: string) => {
        let minIndex = -1;
        keywords.forEach(kw => {
            const idx = dest.indexOf(kw);
            if (idx !== -1 && (minIndex === -1 || idx < minIndex)) {
                minIndex = idx;
            }
        });
        if (minIndex !== -1) found.push({ key, index: minIndex });
    };

    // Specific Countries
    check(['paris', 'frança', 'france', 'franca'], 'france');
    check(['roma', 'itália', 'italy', 'veneza'], 'italy');
    check(['londres', 'inglaterra', 'uk', 'london'], 'uk');
    check(['madrid', 'espanha', 'barcelona', 'spain'], 'spain');
    check(['lisboa', 'portugal', 'lisbon'], 'portugal');
    check(['berlim', 'alemanha', 'munique', 'germany'], 'germany');
    check(['russia', 'rússia', 'moscou', 'moscow'], 'russia');

    check(['nova york', 'orlando', 'miami', 'florida', 'ny'], 'us_east');
    check(['los angeles', 'vegas', 'califórnia', 'california'], 'us_west');

    check(['tóquio', 'japão', 'japan', 'tokyo'], 'japan');
    check(['sydney', 'austrália', 'australia'], 'australia');
    check(['nova zelandia', 'nova zelândia', 'new zealand'], 'new_zealand');
    check(['tailandia', 'tailândia', 'thailand', 'taillandia'], 'thailand'); // Added taillandia for typos

    check(['brasil', 'brazil', 'rio de janeiro', 'são paulo'], 'brazil');
    check(['buenos aires', 'argentina', 'bariloche'], 'argentina');

    // Only fallback to Continents if no specific countries found
    if (found.length === 0) {
        check(['europa', 'europe'], 'europe');
        check(['eua', 'usa', 'estados unidos', 'america do norte', 'north america'], 'north america');
        check(['america do sul', 'chile', 'peru', 'south america'], 'south america');
        check(['quenia', 'africa', 'egito', 'marrocos', 'áfrica'], 'africa');
        check(['asia', 'ásia', 'bali'], 'asia');
        check(['oceania'], 'oceania');
    }

    if (found.length === 0) return ['global'];

    // Sort by order of appearance in destination string
    found.sort((a, b) => a.index - b.index);
    const uniqueRegions = Array.from(new Set(found.map(f => f.key)));

    return uniqueRegions;
};

const getCoordinatesForRegion = (regionKey: string, index: number, total: number) => {
    const center = REGION_CENTERS[regionKey] || REGION_CENTERS['global'];

    // Create a snake-like path or a spiral around the center
    // We'll use a simple sine wave path crossing the region

    // Normalize progress 0 to 1
    const p = total > 1 ? index / (total - 1) : 0.5;

    // -1 to 1 Sweep
    const sweep = (p * 2) - 1;

    // Snake curve using sine
    const curve = Math.sin(p * Math.PI * 2);

    return {
        x: center.x + (sweep * center.radiusX),
        y: center.y + (curve * center.radiusY)
    };
};



const getStringHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

export default function SkynetExplorerWidget({ onClose }: SkynetExplorerWidgetProps) {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);

    // Modals & Interactivity
    const [activeNode, setActiveNode] = useState<Node | null>(null);
    const [showRules, setShowRules] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Audio State
    const [isMuted, setIsMuted] = useState(true); // Default muted to comply with browser autoplay policies
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (selectedTrip) {
            setShowWelcomeModal(true); // Show welcome when trip is selected
        }
    }, [selectedTrip]);

    useEffect(() => {
        if (selectedTrip && audioRef.current) {
            if (!isMuted) {
                audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [selectedTrip, isMuted]);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!user) return;
            try {
                const userTrips = await getTrips(user.id);
                const activeTrips = userTrips.filter(t => t.status !== 'completed');
                setTrips(activeTrips);

                if (activeTrips.length === 1) {
                    setSelectedTrip(activeTrips[0]);
                }
            } catch (error) {
                console.error("Error fetching trips for SARA Play Explorer:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [user]);

    const boardNodes = useMemo(() => {
        if (!selectedTrip) return [];

        const nodes: Node[] = [];
        const journeyRegions = getDestinationRegions(selectedTrip.destination);

        // NODE 0: A ORIGEM (Brasil) - Aeroporto de Saída
        nodes.push({
            id: 'origin_node',
            dayIndex: 0,
            activity: {
                id: 'origin_act',
                title: 'Check-in de Partida (Brasil)',
                type: 'flight',
                status: 'completed'
            },
            status: 'completed',
            missionType: 'photo',
            x: ORIGIN_BRASIL.x,
            y: ORIGIN_BRASIL.y
        });

        const itinerary = selectedTrip.itinerary || {};
        const days = Object.keys(itinerary).map(Number).sort((a, b) => a - b);
        let currentActivities: Activity[] = [];

        days.forEach(d => {
            currentActivities = currentActivities.concat(itinerary[d] || []);
        });

        // Se o roteiro tiver poucas atividades, injete aventureiras criativas
        const totalInjects = Math.max(0, 5 - currentActivities.length);
        for (let i = 0; i < totalInjects; i++) {
            const creative = CREATIVE_MISSIONS[i % CREATIVE_MISSIONS.length];
            currentActivities.push({
                id: `gen_act_${i}`,
                title: creative.title,
                type: creative.type,
                status: 'pending' // pending until visited
            });
        }

        let isFirstLockedFound = false;
        let globalIndex = 0;
        const totalDestActivities = currentActivities.length;

        // Distribui os nós iterando pelas múltiplas regiões na ordem em que aparecem no destino
        currentActivities.forEach((act, actIndex) => {
            let nodeStatus: 'completed' | 'current' | 'locked' = 'locked';

            if (act.status === 'completed' || act.title.toLowerCase().includes('check-in')) {
                nodeStatus = 'completed';
            } else if (!isFirstLockedFound) {
                nodeStatus = 'current';
                isFirstLockedFound = true;
            }

            const mTypes: ('quiz' | 'photo' | 'review' | 'fortune')[] = ['quiz', 'photo', 'review', 'fortune', 'quiz', 'photo'];
            const missionType = (CREATIVE_MISSIONS.find(m => m.title === act.title)?.missionType) || mTypes[getStringHash(act.id || '') % mTypes.length];

            // Calculate which region this node falls into (split the activities equally among regions)
            const regionSegmentSize = journeyRegions.length > 0 ? Math.max(1, Math.floor(totalDestActivities / journeyRegions.length)) : totalDestActivities;
            let rIndex = Math.floor(globalIndex / regionSegmentSize);
            if (rIndex >= journeyRegions.length) rIndex = journeyRegions.length - 1;

            const regionKey = journeyRegions[rIndex];

            // Local index within this specific region cluster
            const localIndex = globalIndex % regionSegmentSize;
            const segmentTotal = (rIndex === journeyRegions.length - 1) ? (totalDestActivities - rIndex * regionSegmentSize) : regionSegmentSize;

            const coord = getCoordinatesForRegion(regionKey, localIndex, segmentTotal);

            nodes.push({
                id: act.id || `act_${globalIndex}`,
                dayIndex: Math.floor(actIndex / 2),
                activity: act,
                status: nodeStatus,
                missionType: missionType as 'quiz' | 'photo' | 'review' | 'fortune',
                x: coord.x,
                y: coord.y
            });

            globalIndex++;
        });

        // Garantia de ter um Current se tudo estiver trancado e nada travado
        if (!isFirstLockedFound && nodes.length > 1) {
            const lastCompletedIndex = nodes.map(n => n.status).lastIndexOf('completed');
            if (lastCompletedIndex >= 0 && lastCompletedIndex < nodes.length - 1) {
                nodes[lastCompletedIndex + 1].status = 'current';
            } else if (lastCompletedIndex === -1) {
                nodes[1].status = 'current';
            }
        }

        return nodes;
    }, [selectedTrip]);

    const getIconForType = (type: string) => {
        const map: Record<string, string> = { flight: 'flight-takeoff', accommodation: 'hotel', restaurant: 'restaurant-2', activity: 'camera-lens', transport: 'car' };
        return map[type] || 'map-pin';
    };

    if (loading) {
        return (
            <div className="flex flex-col h-[80vh] bg-white rounded-[32px] overflow-hidden items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // VIEW 1: TRIP SELECTION (If Multiple) - TRULY FULLSCREEN
    // -------------------------------------------------------------
    if (!selectedTrip && trips.length > 0) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900 overflow-y-auto">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

                <div className="pt-16 p-8 text-center relative z-10 max-w-2xl mx-auto">
                    <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 rounded-full w-12 h-12 flex items-center justify-center transition hover:bg-white/20"><i className="ri-close-line text-2xl"></i></button>
                    <div className="w-32 h-32 mx-auto flex items-center justify-center mb-4 relative drop-shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform duration-500">
                        <img src="/images/sara_exploradora.png" alt="SARA Play World Tour Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">SARA Play World Tour</h2>
                    <p className="text-emerald-300 mt-3 text-lg">Selecione uma viagem ativa para embarcar na aventura</p>
                </div>

                <div className="flex-1 p-6 space-y-4 relative z-10 w-full max-w-3xl mx-auto">
                    {trips.map(trip => (
                        <button key={trip.id} onClick={() => setSelectedTrip(trip)} className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all hover:-translate-y-1">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                {trip.cover_image
                                    ? <img src={trip.cover_image} alt="Destino" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-slate-500"><i className="ri-map-2-line text-2xl"></i></div>
                                }
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold leading-tight line-clamp-2">{trip.title}</h3>
                                <p className="text-[#3b82f6] text-sm mt-1">{trip.destination}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center"><i className="ri-play-fill text-xl"></i></div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!selectedTrip) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-center p-8">
                <button onClick={onClose} className="absolute top-8 right-8 bg-white/10 text-white/50 hover:text-white w-12 h-12 transition rounded-full flex items-center justify-center"><i className="ri-close-line text-2xl"></i></button>
                <i className="ri-map-2-line text-6xl text-slate-700 mb-6 drop-shadow-md"></i>
                <h2 className="text-3xl font-black text-white mb-2">Sem Embarques Restantes</h2>
                <p className="text-slate-400 text-lg">Suas aventuras atuais terminaram. Planeje uma nova viagem para o Explorer.</p>
            </div>
        );
    }

    // -------------------------------------------------------------
    // VIEW 2: THE AUTHENTIC BOARD GAME (Fullscreen Interactive Map)
    // -------------------------------------------------------------
    const totalNodes = boardNodes.length;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0b1b36] overflow-hidden shadow-2xl font-sans" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>

            {/* Audio Track */}
            <audio ref={audioRef} src="https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3" loop />

            {/* Header Toolbar (Relative to push the board down, avoiding overlap) */}
            <div className="relative z-50 bg-[#081326]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b-[6px] border-[#1e3a8a] shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => trips.length > 1 ? setSelectedTrip(null) : onClose()} className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-[0_4px_0_#be123c]">
                        <i className="ri-arrow-left-line font-black text-2xl"></i>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase drop-shadow-md">{selectedTrip.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <button onClick={() => setShowRules(true)} className="text-sm font-black text-blue-300 uppercase flex items-center gap-1 hover:text-blue-200 transition-colors">
                                <i className="ri-question-fill text-lg"></i> REGRAS DO JOGO
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Audio Toggle */}
                    <button onClick={() => setIsMuted(!isMuted)} className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-lg transition-all ${isMuted ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-blue-500 text-white border-blue-300 shadow-[0_0_15px_#3b82f6]'}`}>
                        <i className={`text-xl ${isMuted ? 'ri-volume-mute-fill' : 'ri-volume-up-fill'}`}></i>
                    </button>

                    <div className="bg-yellow-400 rounded-2xl px-5 py-2 border-[4px] border-orange-500 shadow-[2px_4px_0_#ea580c] text-center transform rotate-2 hover:rotate-0 transition-transform cursor-default">
                        <span className="block text-[10px] text-orange-900 font-black uppercase tracking-wider mb-0.5">Pontos de Exploração</span>
                        <div className="text-2xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] leading-none">1.250 <span className="text-sm text-yellow-100">EP</span></div>
                    </div>

                    <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border-2 border-slate-600 shadow-[0_4px_0_#475569] transition-transform hover:scale-105"><i className="ri-close-line font-bold text-2xl"></i></button>
                </div>
            </div>

            {/* THE WORLD MAP BOARD (Fullscreen Interactive Container - Stretched to fill remaining space) */}
            <div className="flex-1 w-full relative overflow-hidden bg-[#081326] z-0 cursor-grab active:cursor-grabbing">

                {/* Wrapper that explicitly matches screen size to stretch the map */}
                <div className="w-full h-full relative">
                    <img src="/images/sara_play_board.jpg" className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="Board Canvas" />
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] z-0"></div>

                    {/* SVG PATH CONNECTOR - The "Flight Path" and region snaking */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                        {/* Trail Line Original -> Destiny */}
                        {boardNodes.length > 1 && (
                            <path
                                d={`M ${boardNodes.map(n => `${n.x}% ${n.y}%`).join(' L ')}`}
                                fill="none"
                                stroke="rgba(255,255,255,0.7)"
                                strokeWidth="4"
                                strokeDasharray="10 10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-80"
                                style={{ strokeDashoffset: '1000', animation: 'dash 30s linear infinite' }}
                            />
                        )}
                        {/* Completed Lines - Solid Golden Path */}
                        {boardNodes.length > 1 && (
                            <path
                                d={`M ${boardNodes.filter(n => n.status === 'completed' || n.status === 'current').map(n => `${n.x}% ${n.y}%`).join(' L ')}`}
                                fill="none"
                                stroke="#facc15" // Yellow-400
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </svg>

                    {/* THE NODES (Interactive Overlays mapping over the baked-in image numbers) */}
                    {boardNodes.map((node, i) => {
                        const isCompleted = node.status === 'completed';
                        const isCurrent = node.status === 'current';

                        return (
                            <div
                                key={node.id}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                <div
                                    onClick={() => isCurrent ? setActiveNode(node) : null}
                                    className={`relative rounded-full flex items-center justify-center transition-all duration-300 font-black shadow-lg ${isCurrent ? 'ring-[6px] ring-yellow-400 ring-offset-4 ring-offset-transparent animate-pulse shadow-[0_0_20px_#facc15] bg-yellow-400 text-yellow-900 border-4 border-white cursor-pointer hover:scale-110 w-[45px] h-[45px] z-50' :
                                        isCompleted ? 'bg-emerald-500 text-white border-4 border-emerald-200 cursor-default opacity-90 w-[35px] h-[35px] z-20' :
                                            'bg-slate-300 text-slate-500 border-4 border-slate-100 cursor-default opacity-80 w-[35px] h-[35px] z-10 hover:opacity-100 hover:scale-110'}`}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <i className="ri-check-line text-lg font-black"></i>
                                    ) : (
                                        <span className="text-sm">{i + 1}</span>
                                    )}
                                </div>

                                {/* Popover Activity Name on Hover */}
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-blue-900 border-2 border-slate-300 text-xs font-black px-4 py-2 rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.15)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 transform group-hover:-translate-y-2">
                                    <i className={`ri-${getIconForType(node.activity.type)}-line mr-1 text-red-500 text-sm align-middle`}></i>
                                    {node.activity.title}
                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-slate-300 shadow-[2px_2px_0_rgba(0,0,0,0.15)]"></div>
                                </div>

                                {/* Avatar Token for Current Node */}
                                {isCurrent && (
                                    <motion.div
                                        initial={{ y: -30, opacity: 0 }}
                                        animate={{ y: [-30, -15, -30], opacity: 1 }}
                                        transition={{ y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }}
                                        className="absolute -top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-[4px] border-white shadow-2xl bg-[#ffeb99] flex items-center justify-center overflow-hidden">
                                                <img src="/images/sara_exploradora.png" alt="Guia SARA" className="w-full h-full object-cover scale-110" />
                                            </div>
                                            <div className="absolute -bottom-2 -left-4 -right-4 bg-[#ff6b6b] text-white text-[10px] uppercase font-black px-1 py-0.5 rounded-full text-center shadow-md border-2 border-white">
                                                Guia SARA
                                            </div>
                                        </div>
                                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-white mx-auto -mt-[2px]"></div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* -------------------------------------------------------------
                SARA INTERACTIVE LOCATION GUIDE MODAL
            ------------------------------------------------------------- */}
            <AnimatePresence>
                {activeNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="absolute inset-x-4 md:inset-x-8 bottom-4 md:bottom-8 z-[110] bg-white rounded-[32px] border-8 border-yellow-400 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_4px_rgba(30,58,138,1)] overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row"
                    >
                        {/* Left Side: SARA Character */}
                        <div className="w-full md:w-1/3 bg-blue-900 p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0 border-b-8 md:border-b-0 md:border-r-8 border-yellow-400">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="w-32 h-32 md:w-48 md:h-48 relative z-10">
                                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
                                <img src="/images/sara_exploradora.png" alt="SARA Guide" className="w-full h-full object-contain relative z-20 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                            </div>
                            <div className="mt-4 text-center z-10">
                                <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full font-black text-xs uppercase tracking-widest mb-1 shadow-md">Guia Local</span>
                                <h3 className="text-white font-black text-2xl uppercase tracking-tighter" style={{ WebkitTextStroke: '0.5px black' }}>SARA</h3>
                            </div>
                            <button onClick={() => setActiveNode(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white border-2 border-white shadow-lg transition transform hover:scale-110 md:hidden z-30">
                                <i className="ri-close-line font-black text-xl"></i>
                            </button>
                        </div>

                        {/* Right Side: Interactive Content */}
                        <div className="flex-1 bg-slate-50 relative flex flex-col">
                            <button onClick={() => setActiveNode(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 items-center justify-center text-white border-2 border-white shadow-lg transition transform hover:scale-110 hidden md:flex z-30">
                                <i className="ri-close-line font-black text-xl"></i>
                            </button>

                            <div className="px-6 pt-6 pb-2 border-b-4 border-slate-200 bg-white z-10">
                                <span className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                    <i className="ri-map-pin-2-fill text-rose-500"></i> {activeNode.activity.type === 'flight' ? 'Origem / Destino' : `Ponto ${activeNode.dayIndex + 1}`}
                                </span>
                                <h4 className="text-2xl font-black text-[#1e3a8a] leading-tight uppercase mt-1">
                                    {activeNode.activity.title}
                                </h4>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[40vh] md:max-h-[50vh]">
                                {/* AI Insights Section */}
                                <div className="space-y-4 mb-8">
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 relative">
                                        <div className="absolute -top-3 left-4 bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full border-2 border-blue-200 shadow-sm">
                                            História & Cultura
                                        </div>
                                        <p className="text-blue-900 text-sm font-medium mt-2">
                                            Este lugar tem uma história fascinante! Sabia que este é um dos pontos mais importantes para entender a cultura local? Aproveite para observar a arquitetura única.
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 relative">
                                        <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full border-2 border-emerald-200 shadow-sm">
                                            Dicas Nativas
                                        </div>
                                        <ul className="text-emerald-900 text-sm font-medium mt-2 space-y-1">
                                            <li><i className="ri-check-fill text-emerald-600 font-bold"></i> <strong>O que fazer:</strong> Experimente explorar nas ruas laterais, menos turísticas.</li>
                                            <li><i className="ri-error-warning-fill text-amber-500 font-bold"></i> <strong>Cuidado:</strong> Evite horários de pico entre 12h e 14h.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Mission Section */}
                                <div className="bg-slate-100 rounded-3xl p-5 md:p-6 border-4 border-slate-200 relative overflow-hidden">
                                    {/* decorative bg icon */}
                                    <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] pointer-events-none">
                                        {activeNode.missionType === 'quiz' && '🧠'}
                                        {activeNode.missionType === 'photo' && '📸'}
                                        {activeNode.missionType === 'review' && '⭐'}
                                        {activeNode.missionType === 'fortune' && '🎲'}
                                    </div>

                                    <h5 className="font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2 relative z-10 w-full">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${activeNode.missionType === 'quiz' ? 'bg-purple-500' :
                                                activeNode.missionType === 'photo' ? 'bg-rose-500' :
                                                    activeNode.missionType === 'review' ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}>
                                            <i className={`ri-${activeNode.missionType === 'quiz' ? 'question-mark' : activeNode.missionType === 'photo' ? 'camera-lens' : activeNode.missionType === 'review' ? 'star' : 'vip-crown'}-fill`}></i>
                                        </div>
                                        <span>Missão Local</span>
                                    </h5>

                                    {/* Mission Interactive Area */}
                                    <div className="relative z-10">
                                        {activeNode.missionType === 'quiz' && (
                                            <div className="space-y-3">
                                                <div className="bg-purple-100 border-2 border-purple-300 rounded-2xl p-4 text-center">
                                                    <p className="font-black text-purple-900 text-base md:text-lg">Qual é a regra de ouro neste local?</p>
                                                </div>
                                                <div className="grid gap-3">
                                                    <button className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-sm md:text-base font-bold text-slate-700 hover:text-purple-700 transition shadow-[0_4px_0_#cbd5e1] hover:shadow-[0_4px_0_#a855f7] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-left">A. Nunca falar alto em público</button>
                                                    <button className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-sm md:text-base font-bold text-slate-700 hover:text-purple-700 transition shadow-[0_4px_0_#cbd5e1] hover:shadow-[0_4px_0_#a855f7] hover:-translate-y-1 active:translate-y-1 active:shadow-none text-left">B. Sempre cumprimentar com um abraço</button>
                                                </div>
                                            </div>
                                        )}
                                        {activeNode.missionType === 'photo' && (
                                            <div className="py-8 bg-rose-50 border-[3px] border-dashed border-rose-300 rounded-3xl text-center cursor-pointer hover:bg-rose-100 transition shadow-inner">
                                                <i className="ri-image-add-fill text-5xl text-rose-400 block mb-2 drop-shadow-sm"></i>
                                                <span className="text-rose-600 font-black text-sm uppercase">Tocar para Adicionar Foto</span>
                                            </div>
                                        )}
                                        {activeNode.missionType === 'review' && (
                                            <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 text-center shadow-inner">
                                                <p className="font-black text-amber-900 mb-3 text-lg">Como você avalia este lugar?</p>
                                                <div className="flex gap-2 justify-center">
                                                    {[1, 2, 3, 4, 5].map(s => <i key={s} className="ri-star-s-fill text-4xl text-slate-300 hover:text-yellow-400 cursor-pointer transition hover:scale-125 drop-shadow-sm"></i>)}
                                                </div>
                                            </div>
                                        )}
                                        {activeNode.missionType === 'fortune' && (
                                            <div className="py-6 text-center bg-emerald-50 rounded-3xl border-2 border-emerald-200 shadow-inner flex flex-col items-center">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border-[4px] border-emerald-400 shadow-[0_6px_0_#34d399] animate-bounce">
                                                    <i className="ri-dice-3-fill text-5xl text-emerald-500"></i>
                                                </div>
                                                <p className="mt-4 font-black text-emerald-800 text-sm uppercase">Gire a roleta de prêmios!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mission Action Button */}
                            <div className="p-4 md:p-6 bg-white border-t-4 border-slate-200 mt-auto">
                                <button className={`w-full py-4 text-white rounded-[20px] text-lg md:text-xl font-black transition-all flex items-center justify-center gap-2 group uppercase tracking-widest ${activeNode.missionType === 'quiz' ? 'bg-[#8b5cf6] shadow-[0_6px_0_#5b21b6] hover:bg-[#7c3aed] hover:shadow-[0_4px_0_#5b21b6] active:translate-y-1 active:shadow-none' :
                                    activeNode.missionType === 'photo' ? 'bg-[#f43f5e] shadow-[0_6px_0_#be123c] hover:bg-[#e11d48] hover:shadow-[0_4px_0_#be123c] active:translate-y-1 active:shadow-none' :
                                        activeNode.missionType === 'review' ? 'bg-[#f59e0b] shadow-[0_6px_0_#b45309] hover:bg-[#d97706] hover:shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none' :
                                            'bg-[#10b981] shadow-[0_6px_0_#047857] hover:bg-[#059669] hover:shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none'
                                    }`}>
                                    Completar Missão! <i className="ri-check-double-line group-hover:scale-125 transition-transform delay-100"></i>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SARA WELCOME MODAL */}
            <AnimatePresence>
                {showWelcomeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[120] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[40px] p-6 md:p-10 max-w-3xl w-full relative shadow-[0_20px_0_#1e3a8a] border-8 border-yellow-400 flex flex-col md:flex-row items-center gap-8"
                        >
                            <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 relative">
                                <div className="absolute inset-x-0 bottom-0 top-10 bg-yellow-300 rounded-full animate-pulse blur-xl opacity-60"></div>
                                <img src="/images/sara_exploradora.png" alt="SARA" className="w-full h-full object-contain relative z-10 drop-shadow-2xl translate-y-[-10px] md:translate-y-[-20px]" />
                            </div>

                            <div className="flex-1 text-center md:text-left relative z-20">
                                <span className="inline-block px-4 py-1 bg-rose-100 text-rose-600 rounded-full font-black text-xs uppercase tracking-widest mb-3 border-2 border-rose-200">Guia de Viagem Especialista</span>
                                <h3 className="text-3xl md:text-4xl font-black text-blue-900 mb-4 uppercase leading-none tracking-tight">E aí, Viajante!</h3>
                                <p className="text-slate-600 text-lg md:text-xl font-bold leading-snug mb-8">
                                    "Eu sou a <span className="text-rose-500">SARA exploradora</span> e vou te ajudar de forma interativa a conhecer melhor tudo que está no seu roteiro de viagens! Prepara para dicas nativas, histórias curiosas e algumas missões locais. Vamos lá?"
                                </p>
                                <button onClick={() => setShowWelcomeModal(false)} className="w-full md:w-auto px-10 py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-2xl text-xl font-black transition active:translate-y-1 shadow-[0_6px_0_#ca8a04] hover:shadow-[0_4px_0_#ca8a04] uppercase tracking-wide border-2 border-yellow-600">
                                    Explorar Agora! 🚀
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RULES MODAL */}
            <AnimatePresence>
                {showRules && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] bg-blue-900/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-sm w-full relative shadow-[0_20px_0_#1e3a8a] border-8 border-yellow-400"
                        >
                            <button onClick={() => setShowRules(false)} className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-lg transition transform hover:scale-110">X</button>
                            <div className="w-20 h-20 rounded-full bg-blue-500 mx-auto border-4 border-yellow-400 flex items-center justify-center mb-4 text-4xl shadow-lg -mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                📜
                            </div>
                            <h3 className="text-3xl font-black text-[#1e3a8a] mb-6 text-center uppercase tracking-tight" style={{ WebkitTextStroke: '1px white' }}>Regras da Aventura</h3>

                            <div className="space-y-4 mb-8">
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 flex gap-4 items-center">
                                    <div className="text-3xl drop-shadow">🚶</div>
                                    <p className="text-blue-900 font-bold text-sm">O mapa usa o roteiro da sua viagem. Siga a trilha azul!</p>
                                </div>
                                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 flex gap-4 items-center">
                                    <div className="text-3xl drop-shadow">🔴</div>
                                    <p className="text-rose-900 font-bold text-sm">O prino gigante marca sua <b>Missão Ativa</b>. Cumpra o desafio para avançar!</p>
                                </div>
                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 flex gap-4 items-center">
                                    <div className="text-3xl drop-shadow">🪙</div>
                                    <p className="text-emerald-900 font-bold text-sm">Ganhe <b>Pontos Explorer (EP)</b> a cada vitória completada e troque por saldo!</p>
                                </div>
                            </div>

                            <button onClick={() => setShowRules(false)} className="w-full py-4 uppercase bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-b-4 border-yellow-600 rounded-2xl text-xl font-black transition active:border-b-0 active:translate-y-1 shadow-lg">Entendido, Capitão!</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
