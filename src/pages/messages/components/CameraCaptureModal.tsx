import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageSrc: string) => void;
}

const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
};

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
            setCapturedImage(null);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="relative w-full max-w-lg bg-black rounded-lg overflow-hidden flex flex-col items-center">
                {/* Header */}
                <div className="w-full p-4 flex justify-between items-center absolute top-0 z-10">
                    <button onClick={onClose} className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                    {!capturedImage && (
                        <div className="text-white font-medium bg-black/40 px-3 py-1 rounded-full">Tirar Foto</div>
                    )}
                </div>

                {/* Content */}
                <div className="relative w-full aspect-[3/4] sm:aspect-square bg-gray-900 flex items-center justify-center">
                    {capturedImage ? (
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Controls */}
                <div className="w-full p-6 flex justify-center items-center gap-8 bg-black">
                    {capturedImage ? (
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
                            onClick={capture}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-white"></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
