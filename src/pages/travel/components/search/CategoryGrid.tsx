import React from 'react';

interface CategoryGridProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCategory: (category: string) => void;
}

export const CategoryGrid = ({ isOpen, onClose, onSelectCategory }: CategoryGridProps) => {
    if (!isOpen) return null;

    const MODAL_CATEGORIES = [
        { name: 'Gastronomia', icon: 'ri-restaurant-2-line', subtitle: 'Restaurantes e experiências culinárias' },
        { name: 'Hotéis', icon: 'ri-hotel-line', subtitle: 'Lugares incríveis para se hospedar' },
        { name: 'Pontos Turísticos', icon: 'ri-museum-line', subtitle: 'História e arte na região' },
        { name: 'Lazer', icon: 'ri-emotion-happy-line', subtitle: 'Diversão para os pequenos' },
        { name: 'Natureza', icon: 'ri-plant-line', subtitle: 'Parques e áreas verdes' },
        { name: 'Compras', icon: 'ri-shopping-bag-line', subtitle: 'Shoppings e lojas' },
        { name: 'Bares', icon: 'ri-goblet-line', subtitle: 'Bares e entretenimento' },
        { name: 'Cafés', icon: 'ri-cup-line', subtitle: 'Cafés e lanches rápidos' },
        { name: 'Aventura', icon: 'ri-compass-3-line', subtitle: 'Esportes e atividades radicais' },
        { name: 'Relaxamento', icon: 'ri-leaf-line', subtitle: 'Spas e bem-estar' },
        { name: 'Praias', icon: 'ri-sun-line', subtitle: 'Litoral e praias próximas' },
        { name: 'Românticos', icon: 'ri-hearts-line', subtitle: 'Perfeito para casais' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <i className="ri-map-pin-line text-lg sm:text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-bold">O que você procura?</h2>
                            <p className="text-white/90 text-xs sm:text-sm">Selecione uma categoria para encontrar os melhores lugares próximos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <i className="ri-close-line text-lg sm:text-2xl"></i>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {MODAL_CATEGORIES.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => onSelectCategory(category.name)}
                                className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 flex flex-col items-start gap-3 h-full"
                            >
                                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                    <i className={`${category.icon} text-xl text-orange-500`}></i>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-snug">
                                        {category.subtitle}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
