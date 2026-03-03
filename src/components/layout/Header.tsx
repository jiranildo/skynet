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
            <div className="px-3 sm:px-4 md:px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Logo */}
                    <button
                        onClick={() => navigate('/')}
                        className="hover:scale-110 transition-transform text-left"
                    >
                        <div>
                            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                Travel Experience
                            </h1>
                            <p className="text-xs text-gray-500 italic">where travels come true.</p>
                        </div>
                    </button>

                    {/* Center: Beta Label (Desktop only for balance, or centered) */}
                    <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
                        <BetaLabel />
                    </div>

                    {/* Right: Actions */}
                    <HeaderActions
                        onShowNotifications={onShowNotifications}
                    />
                </div>
            </div>
        </header>
    );
}
