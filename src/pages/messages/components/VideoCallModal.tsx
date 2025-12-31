import { useState, useEffect, useRef } from 'react';

interface VideoCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: {
        name: string;
        avatar?: string;
    };
    isVoiceOnly?: boolean;
}

export default function VideoCallModal({ isOpen, onClose, recipient, isVoiceOnly = false }: VideoCallModalProps) {
    const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'connected' | 'ended'>('calling');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Simulate connection steps
            const ringTimer = setTimeout(() => setCallStatus('ringing'), 2000);
            const connectTimer = setTimeout(() => setCallStatus('connected'), 4000);

            // Start Camera
            startCamera();

            return () => {
                clearTimeout(ringTimer);
                clearTimeout(connectTimer);
                stopCamera();
            };
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === 'connected') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const startCamera = async () => {
        if (isVoiceOnly) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
        setIsMuted(!isMuted);
    };

    const toggleCamera = () => {
        if (localStreamRef.current) {
            // Toggle video track
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = isCameraOff);
        }
        setIsCameraOff(!isCameraOff);
    };

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        setCallStatus('ended');
        setTimeout(onClose, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col animate-fadeIn">
            {/* Background / Remote Video Placeholder */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
                {/* Simulated Remote Video (or Avatar if voice/loading) */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
                    {/* Pulse Animation for Calling */}
                    <div className="relative">
                        {callStatus !== 'connected' && (
                            <div className="absolute inset-0 rounded-full border-4 border-[#00a884] animate-ping opacity-20"></div>
                        )}
                        <img
                            src={recipient.avatar || 'https://via.placeholder.com/150'}
                            alt={recipient.name}
                            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl z-10 object-cover"
                        />
                    </div>
                    <h2 className="text-white text-2xl font-bold mt-8">{recipient.name}</h2>
                    <p className="text-gray-400 text-lg mt-2 font-medium capitalize animate-pulse">
                        {callStatus === 'connected' ? formatDuration(duration) : callStatus === 'calling' ? 'Chamando...' : 'Tocando...'}
                    </p>
                </div>

                {/* Local Video (PiP) */}
                {!isVoiceOnly && !isCameraOff && (
                    <div className="absolute top-4 right-4 w-32 h-44 bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-black/80 backdrop-blur-md p-8 pb-12 rounded-t-3xl">
                <div className="flex items-center justify-center gap-8 max-w-sm mx-auto">
                    <button
                        onClick={toggleCamera}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCameraOff ? 'bg-white text-gray-900' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}
                    >
                        <i className={`text-2xl ${isCameraOff ? 'ri-camera-off-fill' : 'ri-camera-fill'}`}></i>
                    </button>

                    <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}
                    >
                        <i className={`text-2xl ${isMuted ? 'ri-mic-off-fill' : 'ri-mic-fill'}`}></i>
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transform hover:scale-110 transition-all shadow-lg shadow-red-600/30"
                    >
                        <i className="ri-phone-end-fill text-3xl"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
