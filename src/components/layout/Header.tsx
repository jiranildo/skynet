import React from 'react';
import HeaderActions from '../HeaderActions';
import BetaLabel from '../BetaLabel';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onShowNotifications: () => void;
}

export default function Header({ onShowNotifications }: HeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-[40]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
                <div className="flex items-center justify-between gap-3">
                    {/* Left: Logo and Title */}
                    <div
                        className="flex items-center gap-2 md:gap-4 min-w-0 cursor-pointer hover:scale-[1.02] transition-transform"
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/bird.png"
                            alt="SARA Travel Logo"
                            className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-[12px] md:rounded-[14px] flex-shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent truncate cursor-pointer">
                                    SARA Travel
                                </h1>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 italic hidden sm:block">where travels come true.</p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <div className="hidden sm:block">
                            <BetaLabel />
                        </div>
                        <HeaderActions onShowNotifications={onShowNotifications} />
                    </div>
                </div>
            </div>
        </header>
    );
}
