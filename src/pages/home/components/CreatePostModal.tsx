import { useState } from 'react';

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [step, setStep] = useState<'select' | 'edit' | 'share'>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  const handleImageSelect = () => {
    // Simulate image selection
    setSelectedImage('https://readdy.ai/api/search-image?query=beautiful%20creative%20photography%20artistic%20composition%20vibrant%20colors&width=800&height=800&seq=create-post&orientation=squarish');
    setStep('edit');
  };

  const handleNext = () => {
    if (step === 'edit') {
      setStep('share');
    }
  };

  const handleShare = () => {
    // Simulate post creation
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <button onClick={onClose} className="hover:text-gray-600">
            <i className="ri-close-line text-2xl"></i>
          </button>
          <h2 className="font-semibold text-base">
            {step === 'select' && 'Create new post'}
            {step === 'edit' && 'Edit'}
            {step === 'share' && 'Share'}
          </h2>
          {step !== 'select' && (
            <button
              onClick={step === 'edit' ? handleNext : handleShare}
              className="text-orange-500 font-semibold hover:text-orange-600 whitespace-nowrap"
            >
              {step === 'edit' ? 'Next' : 'Share'}
            </button>
          )}
          {step === 'select' && <div className="w-6"></div>}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'select' && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8">
              <div className="w-24 h-24 mb-6 flex items-center justify-center">
                <i className="ri-image-add-line text-7xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-light mb-6">Select photos and videos</h3>
              <button
                onClick={handleImageSelect}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                Select from computer
              </button>
            </div>
          )}

          {step === 'edit' && selectedImage && (
            <div className="flex h-[600px]">
              <div className="flex-1 bg-black flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="w-80 border-l border-gray-200 p-4 space-y-4">
                <h3 className="font-semibold text-sm">Filters</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['Original', 'Clarendon', 'Gingham', 'Moon', 'Lark', 'Reyes'].map((filter) => (
                    <button
                      key={filter}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-colors"
                    >
                      <img
                        src={selectedImage}
                        alt={filter}
                        className="w-full h-full object-cover"
                      />
                      <p className="text-xs text-center mt-1">{filter}</p>
                    </button>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-sm mb-3">Adjustments</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">Brightness</label>
                      <input type="range" className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Contrast</label>
                      <input type="range" className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Saturation</label>
                      <input type="range" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'share' && selectedImage && (
            <div className="flex h-[600px]">
              <div className="flex-1 bg-black flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="w-80 border-l border-gray-200 p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500"></div>
                  <span className="font-semibold text-sm">your_username</span>
                </div>

                <div>
                  <textarea
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full h-32 text-sm outline-none resize-none"
                    maxLength={2200}
                  />
                  <p className="text-xs text-gray-400 text-right">{caption.length}/2,200</p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                  <input
                    type="text"
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 text-sm outline-none"
                  />
                  <i className="ri-map-pin-line text-gray-400"></i>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm">Accessibility</span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm">Advanced settings</span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <i className="ri-sparkling-2-fill text-orange-500 text-lg"></i>
                    <div>
                      <h4 className="text-xs font-semibold mb-1">AI Enhancement</h4>
                      <p className="text-xs text-gray-600">
                        Optimize your post for better reach with AI-powered suggestions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
