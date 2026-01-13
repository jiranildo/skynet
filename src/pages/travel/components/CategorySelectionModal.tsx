import React from 'react';

export interface Category {
    id: string;
    label: string;
    description: string;
    icon: string;
}

interface CategorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCategory: (category: Category) => void;
}

export const CATEGORIES: Category[] = [
    { id: 'gastronomia', label: 'Gastronomia', description: 'Restaurantes e experiências culinárias', icon: 'ri-restaurant-2-line' },
    { id: 'hospedagem', label: 'Hotéis & Hospedagem', description: 'Lugares incríveis para se hospedar', icon: 'ri-hotel-bed-line' },
    { id: 'cultura', label: 'Museus & Cultura', description: 'História e arte na região', icon: 'ri-museum-line' },
    { id: 'criancas', label: 'Locais para Crianças', description: 'Diversão para os pequenos', icon: 'ri-parent-line' },
    { id: 'romantico', label: 'Românticos', description: 'Perfeito para casais', icon: 'ri-hearts-line' },
    { id: 'familia', label: 'Em Família', description: 'Toda família vai adorar', icon: 'ri-team-line' },
    { id: 'natureza', label: 'Natureza', description: 'Parques e áreas verdes', icon: 'ri-plant-line' },
    { id: 'aventura', label: 'Aventura', description: 'Esportes e atividades radicais', icon: 'ri-riding-line' },
    { id: 'relaxamento', label: 'Relaxamento', description: 'Spas e bem-estar', icon: 'ri-cup-line' },
    { id: 'vida_noturna', label: 'Vida Noturna', description: 'Bares e entretenimento', icon: 'ri-goblet-line' },
    { id: 'compras', label: 'Compras', description: 'Shoppings e lojas', icon: 'ri-shopping-bag-3-line' },
    { id: 'praias', label: 'Praias', description: 'Litoral e praias próximas', icon: 'ri-sailboat-line' },
];

export function CategorySelectionModal({ isOpen, onClose, onSelectCategory }: CategorySelectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">O que você procura?</h2>
                        <p className="text-gray-500 text-sm">Selecione uma categoria para explorar a região</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <i className="ri-close-line text-xl text-gray-600"></i>
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onSelectCategory(category)}
                                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <i className={category.icon}></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                                        {category.label}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-snug">
                                        {category.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
