import React, { useRef, useState, useEffect } from 'react';

interface VideoCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (videoBlob: Blob) => void;
}

export const VideoCaptureModal: React.FC<VideoCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);

    // Initialize Camera
    useEffect(() => {
        if (isOpen && !recordedVideoURL) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, recordedVideoURL]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            setTimer(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            // Handle error (e.g., call onClose or show alert)
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startRecording = () => {
        if (!stream) return;
        setRecordedChunks([]);
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setRecordedChunks(prev => [...prev, event.data]);
            }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedVideoURL(url);
                stopCamera(); // Stop camera preview to show playback
            };
        }
        setIsRecording(false);
    };

    // Need to update blob when chunks update? 
    // Actually MediaRecorder.onstop logic above might run before last chunk is added if not careful.
    // Better approach: toggle isRecording, then in useEffect or onstop handler build the blob.
    // However, for simplicity here, let's trust the event flow or improve:

    // Improved stop logic to Ensure all chunks are captured:
    // We'll rely on the fact that `stop()` triggers a final `dataavailable` event.

    // Let's rewrite stopRecording slightly to be safer
    const handleStopClick = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // We need to wait for onstop event which we defined in startRecording? 
            // Or define it here?
            mediaRecorderRef.current.onstop = () => {
                // Important: recordedChunks state might be stale inside specific closure if we used that.
                // But since we are setting state, we should assemble it carefully.
                // Actually, it's better to construct blob from the state *after* we are sure.
                // But `setRecordedChunks` is async.
                // Let's use a simpler approach: pushing to a local array ref might be safer, but for React, 
                // usually the `dataavailable` fires, updates state.
                // Let's just create the blob in a separate useEffect or button click?
                // No, we want instant preview.

                // Fix: Assemble blob in Ref or assume simplistic flow.
                // Re-implementation below for robustness.
            };
        }
    };

    // Robust effect to create URL when recording stops
    useEffect(() => {
        if (!isRecording && recordedChunks.length > 0 && !recordedVideoURL) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedVideoURL(url);
            stopCamera();
        }
    }, [isRecording, recordedChunks]);


    const handleRetake = () => {
        if (recordedVideoURL) {
            URL.revokeObjectURL(recordedVideoURL);
        }
        setRecordedVideoURL(null);
        setRecordedChunks([]);
        startCamera();
    };

    const handleConfirm = () => {
        if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            onCapture(blob);
            onClose();
        }
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fadeIn">
            <div className="relative w-full max-w-lg bg-black rounded-lg overflow-hidden flex flex-col items-center">
                {/* Header */}
                <div className="w-full p-4 flex justify-between items-center absolute top-0 z-10">
                    <button onClick={() => { handleRetake(); onClose(); }} className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                    {!recordedVideoURL && (
                        <div className="text-white font-medium bg-red-600/80 px-4 py-1 rounded-full animate-pulse flex items-center gap-2">
                            {isRecording && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            {isRecording ? formatTime(timer) : 'Gravar Vídeo'}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="relative w-full aspect-[3/4] sm:aspect-square bg-gray-900 flex items-center justify-center">
                    {recordedVideoURL ? (
                        <video
                            src={recordedVideoURL}
                            controls
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    )}
                </div>

                {/* Controls */}
                <div className="w-full p-6 flex justify-center items-center gap-8 bg-black">
                    {recordedVideoURL ? (
                        <>
                            <button
                                onClick={handleRetake}
                                className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700"
                            >
                                <i className="ri-refresh-line text-xl"></i>
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="w-16 h-16 rounded-full bg-[#00a884] flex items-center justify-center text-white hover:bg-[#008f6f]"
                            >
                                <i className="ri-send-plane-fill text-2xl"></i>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={isRecording ? handleStopClick : startRecording}
                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'border-red-500 bg-red-500/20' : 'border-white hover:bg-white/10'}`}
                        >
                            <div className={`transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-16 h-16 bg-red-600 rounded-full'}`}></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
