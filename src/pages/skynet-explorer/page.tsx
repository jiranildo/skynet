import React from 'react';
import { useNavigate } from 'react-router-dom';
import SkynetExplorerWidget from '@/components/SkynetExplorerWidget';

export default function SkynetExplorerPage() {
    const navigate = useNavigate();

    // Container with subtle background to frame the board game on a large screen
    return (
        <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 pt-[100px] md:pt-8 w-full flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto">
                <SkynetExplorerWidget onClose={() => navigate(-1)} />
            </div>
        </div>
    );
}
