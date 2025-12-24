import { useState } from "react";
import JarvisAI from "./JarvisAI";

const FloatingMenu = () => {
  const [showAI, setShowAI] = useState(false);

  const openAI = () => {
    setShowAI(true);
  };

  return (
    <>
      {/* Botão IA Flutuante */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={openAI}
          className="group relative w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          title="Assistente IA"
        >
          <i className="ri-robot-2-fill text-white text-2xl"></i>
          <span className="absolute right-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Assistente IA
          </span>
        </button>

        {/* Indicador de status */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      {/* Modal de IA */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAI(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <JarvisAI onClose={() => setShowAI(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMenu;
