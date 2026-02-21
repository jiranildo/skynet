import React, { useState, useRef, useEffect } from 'react';
import { CellarWine } from '../../../services/supabase';

interface RatingBottomSheetProps {
    wine: CellarWine;
    onClose: () => void;
    onSubmit: (rating: number, review: string) => void;
}

export default function RatingBottomSheet({ wine, onClose, onSubmit }: RatingBottomSheetProps) {
    const [rating, setRating] = useState<number>(wine.rating || 0);
    const [review, setReview] = useState<string>('');

    // Custom circular slider logic could go here, for simplicity right now using a standard input range
    // stylized as much as possible like the screenshot, but an actual perfect SVG circular slider
    // might be too complex for a fast implementation. I will implement a custom SVG circular slider.

    const radius = 120;
    const strokeWidth = 12;
    const center = radius + strokeWidth;
    const size = center * 2;
    const circumference = 2 * Math.PI * radius;
    // Use a semi-circle from left to right bottom
    const arcLength = circumference * 0.75; // 270 degrees

    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRating(parseFloat(e.target.value));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#f9fafb] rounded-t-3xl z-50 transform transition-transform duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50">
                        <i className="ri-close-line text-xl text-gray-900"></i>
                    </button>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                        Minha adega <span className="text-gray-400 font-normal text-sm">{/* Item number or something, maybe just Minha adega */}</span>
                    </div>
                    <button
                        onClick={() => onSubmit(rating, review)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-full font-bold text-sm"
                    >
                        Concluir
                    </button>
                </div>

                <div className="p-6 pt-4 flex flex-col items-center">
                    {/* Wine info small */}
                    <div className="flex items-start gap-4 w-full mb-8 px-2">
                        <div className="w-[60px] h-[80px] bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 flex items-center justify-center">
                            <img src={wine.image_url || "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80"} alt={wine.name} className="w-[90%] h-auto object-contain" />
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-[13px] text-gray-500 mb-0.5">{wine.producer || 'Produtor desconhecido'}</p>
                            <h4 className="font-bold text-gray-900 leading-tight text-[15px] mb-1">{wine.name}</h4>
                            <div className="flex items-center gap-1">
                                <i className="ri-star-fill text-[#e85d04] text-sm"></i>
                                <span className="font-bold text-gray-900 text-[13px]">{wine.rating ? wine.rating.toFixed(1).replace('.', ',') : 'S/N'}</span>
                                <span className="text-gray-400 text-[13px]">({(wine as any).rating_count || "0"})</span>
                            </div>
                        </div>
                    </div>

                    {/* Circular Slider Area */}
                    <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-6">
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-4">
                            <div className="flex items-center gap-1">
                                <i className="ri-star-fill text-[#e85d04] text-2xl"></i>
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{rating.toFixed(1).replace('.', ',')}</span>
                            </div>
                        </div>

                        {/* SVG Circular Slider mockup */}
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Background track */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke="#e5e7eb" // gray-200
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * 0.25} // Cut out bottom quarter
                                strokeLinecap="round"
                                className="transform rotate-[135deg] origin-center opacity-40"
                            />
                            {/* Active track */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke="url(#gradient)"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (rating / 5) * arcLength}
                                strokeLinecap="round"
                                className="transform rotate-[135deg] origin-center transition-all duration-100 ease-out"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#fcd34d" /> {/* amber-300 */}
                                    <stop offset="100%" stopColor="#ea580c" /> {/* orange-600 */}
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Invisible native range input over the circle for interaction */}
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.1"
                            value={rating}
                            onChange={handleRatingChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-4">O que achou?</h3>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Escreva sua avaliação"
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none h-24 shadow-sm"
                    />
                </div>
            </div>
        </>
    );
}
