import React from 'react';

export default function BetaLabel() {
    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    BETA v1.0
                </span>
            </div>
        </div>
    );
}
