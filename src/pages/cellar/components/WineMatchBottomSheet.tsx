import React, { useState } from 'react';
import { CellarWine } from '../../../services/db/types';
import WineCard from './WineCard';

interface WineMatchBottomSheetProps {
    wines: CellarWine[];
    onClose: () => void;
    onSelectWine: (wine: CellarWine) => void;
}

type Step = 'moment' | 'food' | 'result';

const MOMENTS = [
    { id: 'casual', label: 'Dia a dia / Relaxar', icon: 'ri-sofa-line' },
    { id: 'dinner', label: 'Jantar a dois', icon: 'ri-restaurant-line' },
    { id: 'celebration', label: 'Celebração / Festa', icon: 'ri-vip-crown-line' },
    { id: 'tasting', label: 'Degustação Criteriosa', icon: 'ri-flask-line' },
    { id: 'gift', label: 'Presentear', icon: 'ri-gift-line' },
];

const FOODS = [
    { id: 'red_meat', label: 'Carne Vermelha', icon: 'ri-steak-line' },
    { id: 'poultry', label: 'Aves', icon: 'ri-restaurant-2-line' },
    { id: 'seafood', label: 'Peixes / Frutos do Mar', icon: 'ri-anchor-line' },
    { id: 'pasta', label: 'Massas', icon: 'ri-bowl-line' },
    { id: 'cheese', label: 'Queijos e Frios', icon: 'ri-cake-3-line' },
    { id: 'dessert', label: 'Sobremesas', icon: 'ri-cake-line' },
    { id: 'none', label: 'Sem comida', icon: 'ri-goblet-line' },
];

export default function WineMatchBottomSheet({ wines, onClose, onSelectWine }: WineMatchBottomSheetProps) {
    const [step, setStep] = useState<Step>('moment');
    const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
    const [selectedFood, setSelectedFood] = useState<string | null>(null);
    const [suggestedWines, setSuggestedWines] = useState<CellarWine[]>([]);

    // Simple hardcoded scoring logic for matching
    const matchWines = (food: string, moment: string) => {
        let matches: { wine: CellarWine; score: number }[] = wines.map(w => ({ wine: w, score: 0 }));

        // 1. Base Score by Food
        matches = matches.map(m => {
            let score = m.score;
            const t = m.wine.type;

            switch (food) {
                case 'red_meat':
                    if (t === 'red') score += 10;
                    break;
                case 'poultry':
                    if (t === 'white' || t === 'red') score += 5;
                    break;
                case 'seafood':
                    if (t === 'white' || t === 'sparkling' || t === 'rose') score += 10;
                    break;
                case 'pasta':
                    if (t === 'red' || t === 'white') score += 5;
                    break;
                case 'cheese':
                    if (t === 'red' || t === 'white' || t === 'fortified') score += 8;
                    break;
                case 'dessert':
                    if (t === 'dessert' || t === 'fortified' || t === 'sparkling') score += 10;
                    break;
                case 'none':
                    if (t === 'sparkling' || t === 'rose' || t === 'white') score += 5;
                    break;
            }
            return { ...m, score };
        });

        // 2. Adjust Score by Moment
        matches = matches.map(m => {
            let score = m.score;
            const w = m.wine;

            switch (moment) {
                case 'casual':
                    if ((w.price || 0) < 150) score += 5; // Preference for cheaper wines
                    break;
                case 'dinner':
                    if ((w.rating || 0) >= 4) score += 5;
                    break;
                case 'celebration':
                    if (w.type === 'sparkling' || (w.price || 0) > 200) score += 8;
                    break;
                case 'tasting':
                    if ((w.rating || 0) >= 4.5 || (w.price || 0) > 300) score += 10;
                    break;
                case 'gift':
                    if ((w.price || 0) > 150 && (w.rating || 0) >= 4) score += 8;
                    break;
            }
            return { ...m, score };
        });

        // 3. Fallback: Include highly rated wines if score is too low
        matches.forEach(m => {
            if (m.score === 0 && (m.wine.rating || 0) >= 4.5) {
                m.score += 2;
            }
        });

        // 4. Sort and return Top 3
        const topWines = matches
            .filter(m => m.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(m => m.wine);

        // Fallback if no specific match
        if (topWines.length === 0) {
            return [...wines].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
        }

        return topWines;
    };

    const handleNext = () => {
        if (step === 'moment' && selectedMoment) {
            setStep('food');
        } else if (step === 'food' && selectedFood) {
            const results = matchWines(selectedFood, selectedMoment!);
            setSuggestedWines(results);
            setStep('result');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-50 rounded-t-3xl w-full max-h-[90vh] flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-3xl shrink-0">
                    <div className="w-10">
                        {step !== 'moment' && (
                            <button
                                onClick={() => setStep(step === 'result' ? 'food' : 'moment')}
                                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full"
                            >
                                <i className="ri-arrow-left-line text-xl"></i>
                            </button>
                        )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 text-center flex-1">
                        {step === 'moment' ? 'Qual a ocasião?' : step === 'food' ? 'O que vai comer?' : 'A Escolha Perfeita'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="p-4 overflow-y-auto shrink-0" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    {/* Step 1: Moment */}
                    {step === 'moment' && (
                        <div className="space-y-3 pb-8">
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Selecione o momento para ajudarmos a encontrar o vinho ideal da sua adega.
                            </p>
                            <div className="grid gap-3">
                                {MOMENTS.map(moment => (
                                    <button
                                        key={moment.id}
                                        onClick={() => setSelectedMoment(moment.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedMoment === moment.id
                                                ? 'border-purple-600 bg-purple-50 text-purple-900'
                                                : 'border-transparent bg-white shadow-sm hover:border-purple-200 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${selectedMoment === moment.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <i className={moment.icon}></i>
                                        </div>
                                        <span className="font-semibold text-[15px] flex-1">{moment.label}</span>
                                        {selectedMoment === moment.id && (
                                            <i className="ri-checkbox-circle-fill text-2xl text-purple-600"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Food */}
                    {step === 'food' && (
                        <div className="space-y-3 pb-8">
                            <p className="text-sm text-gray-500 text-center mb-6">
                                O que você pretende comer para acompanhar?
                            </p>
                            <div className="grid gap-3">
                                {FOODS.map(food => (
                                    <button
                                        key={food.id}
                                        onClick={() => setSelectedFood(food.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedFood === food.id
                                                ? 'border-red-600 bg-red-50 text-red-900'
                                                : 'border-transparent bg-white shadow-sm hover:border-red-200 hover:bg-red-50/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${selectedFood === food.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <i className={food.icon}></i>
                                        </div>
                                        <span className="font-semibold text-[15px] flex-1">{food.label}</span>
                                        {selectedFood === food.id && (
                                            <i className="ri-checkbox-circle-fill text-2xl text-red-600"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Result */}
                    {step === 'result' && (
                        <div className="space-y-6 pb-8">
                            {suggestedWines.length > 0 ? (
                                <>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow shadow-lg shadow-purple-200">
                                            <i className="ri-magic-line text-3xl text-white"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aqui estão as melhores opções</h3>
                                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                            Analisamos sua adega e encontramos {suggestedWines.length} vinha(s) perfeita(s) para este momento.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {suggestedWines.map((wine, index) => (
                                            <div key={wine.id} className="relative">
                                                {index === 0 && (
                                                    <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
                                                        <i className="ri-star-fill text-[#f3e5ab]"></i> Melhor Match
                                                    </div>
                                                )}
                                                <div onClick={() => { onSelectWine(wine); onClose(); }}>
                                                    {/* Reusing WineCard style but streamlined for the result list */}
                                                    <div className={`bg-white rounded-2xl p-4 flex gap-4 border-2 transition-all cursor-pointer ${index === 0 ? 'border-purple-200 shadow-purple-100 shadow-xl' : 'border-transparent shadow-sm hover:shadow-md'}`}>
                                                        <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                                                            {wine.image_url ? (
                                                                <img src={wine.image_url} alt={wine.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <i className="ri-wine-fill text-4xl text-gray-300"></i>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            {wine.producer && <p className="text-xs text-gray-500 mb-1 truncate">{wine.producer}</p>}
                                                            <h4 className="font-bold text-gray-900 mb-1 leading-tight">{wine.name}</h4>
                                                            <div className="flex items-center gap-2 mt-auto">
                                                                {wine.vintage && <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{wine.vintage}</span>}
                                                                {wine.type && (
                                                                    <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                        <i className={`ri-goblet-fill ${wine.type === 'red' ? 'text-red-600' :
                                                                                wine.type === 'white' ? 'text-[#f3e5ab]' :
                                                                                    wine.type === 'rose' ? 'text-pink-400' :
                                                                                        wine.type === 'sparkling' ? 'text-yellow-400' : 'text-gray-400'
                                                                            }`}></i>
                                                                        <span className="capitalize">{wine.type === 'red' ? 'Tinto' : wine.type === 'white' ? 'Branco' : wine.type === 'rose' ? 'Rosé' : wine.type === 'sparkling' ? 'Espumante' : wine.type}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="ri-flask-line text-3xl text-gray-400"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sem combinações exatas</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                        Não encontramos um vinho na sua adega que dê o "match" perfeito para esta combinação. Que tal tentar outras opções?
                                    </p>
                                    <button onClick={() => setStep('moment')} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-medium">Refazer Busca</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step !== 'result' && (
                    <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
                        <button
                            onClick={handleNext}
                            disabled={(step === 'moment' && !selectedMoment) || (step === 'food' && !selectedFood)}
                            className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
                        >
                            {step === 'moment' ? 'Próximo' : 'Encontrar Vinho'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
