import React, { useState } from 'react';

interface AccommodationPrefs {
    type: string[];
    location: string[];
    amenities: string[];
    priceLevel: 'budget' | 'standard' | 'luxury' | '';
}

interface TripPreferences {
    vibe: string[];
    pace: string;
    interests: string[];
    dietary: string[];
    other: string;
    // New Fields
    travelingWithKids: boolean;
    kidsDetails: string;
    accommodation?: AccommodationPrefs;
    dining?: {
        cuisines: string[];
        atmosphere: string[];
        priceLevel: 'cheap' | 'balanced' | 'splurge' | '';
    };
    dislikes: string[]; // Anti-bucket list
}

interface TripPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPreferences?: Partial<TripPreferences>;
    onSave: (prefs: TripPreferences) => void;
}

const VIBE_OPTIONS = [
    'Relaxado', 'Romântico', 'Aventureiro', 'Gastronômico',
    'Cultural', 'Festa', 'Luxo', 'Econômico', 'Familiar'
];

const PACE_OPTIONS = [
    { id: 'slow', label: 'Lento (1-2 atividades/dia)', icon: 'ri-cup-line' },
    { id: 'moderate', label: 'Moderado (3-4 atividades/dia)', icon: 'ri-walk-line' },
    { id: 'fast', label: 'Intenso (5+ atividades/dia)', icon: 'ri-run-line' }
];

const INTEREST_OPTIONS = [
    'Museus', 'História', 'Arte', 'Natureza', 'Praias',
    'Trilhas', 'Compras', 'Tecnologia', 'Esportes',
    'Vida Noturna', 'Fotografia', 'Música', 'Arquitetura',
    'Parques', 'Cafés', 'Mercados Locais', 'Esportes Radicais',
    'Gastronomia'
];

const DIETARY_OPTIONS = [
    'Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose',
    'Halal', 'Kosher', 'Alergia a Frutos do Mar', 'Alergia a Amendoim'
];

// New Options
const ACCOMMODATION_TYPES = ['Hotel', 'Hostel', 'Airbnb/Apto', 'Resort', 'Boutique'];
const ACCOMMODATION_LOCATIONS = ['Centro Histórico', 'Perto da Praia', 'Bairro Boêmio', 'Área de Negócios', 'Natureza/Isolado'];
const ACCOMMODATION_AMENITIES = ['Piscina', 'Academia', 'Café da Manhã', 'Estacionamento', 'Wi-Fi Rápido', 'Cozinha', 'Pet Friendly'];

const DINING_CUISINES = ['Local/Típica', 'Italiana', 'Japonesa', 'Fast Food', 'Vegetariana', 'Steakhouse', 'Frutos do Mar', 'Cafés Especiais'];
const DINING_ATMOSPHERE = ['Casual', 'Sophisticado', 'Romântico', 'Para Famílias', 'Com Vista', 'Rooftop', 'Street Food'];

const DISLIKES_OPTIONS = [
    'Lugares muito cheios', 'Museus entediantes', 'Caminhadas longas',
    'Acordar muito cedo', 'Vida noturna agitada', 'Comida muito picante',
    'Locais inseguros', 'Roteiros turísticos clichês'
];

export default function TripPreferencesModal({ isOpen, onClose, initialPreferences, onSave }: TripPreferencesModalProps) {
    const [prefs, setPrefs] = useState<TripPreferences>({
        vibe: initialPreferences?.vibe || [],
        pace: initialPreferences?.pace || 'moderate',
        interests: initialPreferences?.interests || [],
        dietary: initialPreferences?.dietary || [],
        other: initialPreferences?.other || '',
        travelingWithKids: initialPreferences?.travelingWithKids || false,
        kidsDetails: initialPreferences?.kidsDetails || '',
        accommodation: {
            type: initialPreferences?.accommodation?.type || [],
            location: initialPreferences?.accommodation?.location || [],
            amenities: initialPreferences?.accommodation?.amenities || [],
            priceLevel: initialPreferences?.accommodation?.priceLevel || ''
        },
        dining: {
            cuisines: initialPreferences?.dining?.cuisines || [],
            atmosphere: initialPreferences?.dining?.atmosphere || [],
            priceLevel: initialPreferences?.dining?.priceLevel || ''
        },
        dislikes: initialPreferences?.dislikes || []
    });

    const toggleSelection = (field: keyof TripPreferences, value: string) => {
        setPrefs(prev => {
            const current = prev[field] as string[];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const toggleNestedSelection = (parent: 'accommodation' | 'dining', field: string, value: string) => {
        setPrefs(prev => {
            const parentObj = prev[parent] as any;
            const currentList = parentObj[field] as string[];

            let newList;
            if (currentList.includes(value)) {
                newList = currentList.filter((item: string) => item !== value);
            } else {
                newList = [...currentList, value];
            }

            return {
                ...prev,
                [parent]: {
                    ...parentObj,
                    [field]: newList
                }
            };
        });
    };

    const setNestedField = (parent: 'accommodation' | 'dining', field: string, value: string) => {
        setPrefs(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as any),
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        onSave(prefs);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4 animate-fadeIn backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="ri-sparkles-line text-purple-500"></i>
                            Personalizar Experiência
                        </h3>
                        <p className="text-sm text-gray-500">A IA usará estas informações para criar o roteiro perfeito.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Section: Basic Vibe & Pace */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <i className="ri-heart-pulse-line text-purple-500"></i> Vibe da Viagem
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {VIBE_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => toggleSelection('vibe', option)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${prefs.vibe.includes(option)
                                            ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <i className="ri-speed-line text-blue-500"></i> Ritmo
                            </label>
                            <div className="flex gap-2">
                                {PACE_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setPrefs(prev => ({ ...prev, pace: option.id }))}
                                        className={`flex-1 p-2 rounded-lg border text-center transition-all ${prefs.pace === option.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-blue-200 text-gray-500'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1"><i className={option.icon}></i></div>
                                        <div className="text-xs font-bold">{option.label.split(' (')[0]}</div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section: Companions (Kids) */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <i className="ri-user-smile-line text-orange-500"></i> Viajando com Crianças?
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPrefs(prev => ({ ...prev, travelingWithKids: !prev.travelingWithKids }))}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${prefs.travelingWithKids ? 'bg-orange-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${prefs.travelingWithKids ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                </button>
                                <span className="text-sm font-medium text-gray-600">{prefs.travelingWithKids ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>

                        {prefs.travelingWithKids && (
                            <div className="animate-fadeIn p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <label className="block text-xs font-bold text-orange-700 mb-2">Idades e Necessidades:</label>
                                <textarea
                                    value={prefs.kidsDetails}
                                    onChange={(e) => setPrefs(prev => ({ ...prev, kidsDetails: e.target.value }))}
                                    placeholder="Ex: 5 e 8 anos. Precisam de parquinhos e menu kids. Carrinho de bebê necessário."
                                    className="w-full p-3 rounded-lg border border-orange-200 outline-none text-sm focus:ring-2 focus:ring-orange-300"
                                    rows={2}
                                />
                            </div>
                        )}
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section: Accommodation */}
                    <section>
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                            <i className="ri-hotel-bed-line text-indigo-500"></i> Hospedagem
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl">
                            {/* Type & Location */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mb-2 block">TIPO PREFERIDO</span>
                                    <div className="flex flex-wrap gap-2">
                                        {ACCOMMODATION_TYPES.map(t => (
                                            <button key={t} onClick={() => toggleNestedSelection('accommodation', 'type', t)}
                                                className={`px-3 py-1 rounded-md text-xs border ${prefs.accommodation?.type.includes(t) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mb-2 block">LOCALIZAÇÃO</span>
                                    <div className="flex flex-wrap gap-2">
                                        {ACCOMMODATION_LOCATIONS.map(l => (
                                            <button key={l} onClick={() => toggleNestedSelection('accommodation', 'location', l)}
                                                className={`px-3 py-1 rounded-md text-xs border ${prefs.accommodation?.location.includes(l) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Amenities & Price */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mb-2 block">ITENS ESSENCIAIS</span>
                                    <div className="flex flex-wrap gap-2">
                                        {ACCOMMODATION_AMENITIES.map(a => (
                                            <button key={a} onClick={() => toggleNestedSelection('accommodation', 'amenities', a)}
                                                className={`px-3 py-1 rounded-md text-xs border ${prefs.accommodation?.amenities.includes(a) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>{a}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mb-2 block">FAIXA DE PREÇO (DIÁRIA)</span>
                                    <div className="flex gap-2">
                                        {[{ id: 'budget', label: '$ Econômico' }, { id: 'standard', label: '$$ Padrão' }, { id: 'luxury', label: '$$$ Luxo' }].map(p => (
                                            <button key={p.id} onClick={() => setNestedField('accommodation', 'priceLevel', p.id)}
                                                className={`flex-1 py-1 px-2 rounded-md text-xs border ${prefs.accommodation?.priceLevel === p.id ? 'bg-indigo-100 text-indigo-700 border-indigo-300 font-bold' : 'bg-white text-gray-500 border-gray-200'}`}>{p.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Dining */}
                    <section>
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                            <i className="ri-restaurant-2-line text-emerald-500"></i> Gastronomia
                        </label>
                        <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                            <div>
                                <span className="text-xs font-bold text-gray-500 mb-2 block">CULINÁRIAS DE INTERESSE</span>
                                <div className="flex flex-wrap gap-2">
                                    {DINING_CUISINES.map(c => (
                                        <button key={c} onClick={() => toggleNestedSelection('dining', 'cuisines', c)}
                                            className={`px-3 py-1 rounded-md text-xs border ${prefs.dining?.cuisines.includes(c) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-gray-500 mb-2 block">AMBIENTE</span>
                                    <div className="flex flex-wrap gap-2">
                                        {DINING_ATMOSPHERE.map(a => (
                                            <button key={a} onClick={() => toggleNestedSelection('dining', 'atmosphere', a)}
                                                className={`px-3 py-1 rounded-md text-xs border ${prefs.dining?.atmosphere.includes(a) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}>{a}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Interests */}
                    <section>
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Interesses Principais</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {INTEREST_OPTIONS.map(option => (
                                <label
                                    key={option}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${prefs.interests.includes(option) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={prefs.interests.includes(option)}
                                        onChange={() => toggleSelection('interests', option)}
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Dislikes / Avoid */}
                    <section className="bg-red-50 p-5 rounded-2xl border border-red-100">
                        <label className="block text-sm font-bold text-red-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <i className="ri-prohibited-line"></i> O que Evitar (Anti-Bucket List)
                        </label>
                        <p className="text-xs text-red-500 mb-3">Selecione o que você NÃO quer na sua viagem:</p>
                        <div className="flex flex-wrap gap-2">
                            {DISLIKES_OPTIONS.map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleSelection('dislikes', option)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all group flex items-center gap-1 ${prefs.dislikes.includes(option)
                                        ? 'bg-red-500 text-white border-red-500 shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-red-100 hover:text-red-600'
                                        }`}
                                >
                                    {prefs.dislikes.includes(option) && <i className="ri-close-circle-line"></i>}
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>


                    {/* Restrições Alimentares & Outros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Restrições Alimentares</label>
                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => toggleSelection('dietary', option)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${prefs.dietary.includes(option)
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Pedidos Especiais</label>
                            <textarea
                                value={prefs.other}
                                onChange={(e) => setPrefs(prev => ({ ...prev, other: e.target.value }))}
                                placeholder="Algo mais? Ex: Aniversário de Casamento, Acessibilidade para cadeirantes..."
                                className="w-full h-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-700 resize-none text-sm"
                            />
                        </section>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                        <i className="ri-save-line"></i>
                        Salvar Preferências
                    </button>
                </div>

            </div>
        </div>
    );
}
