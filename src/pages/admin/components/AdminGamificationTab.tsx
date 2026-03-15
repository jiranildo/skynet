import React from 'react';

export default function AdminGamificationTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-trophy-line text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gameficação Corporativa</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Gestão centralizada do programa de recompensas, níveis de usuários e injeção do Travel Money (TM) de engajamento do ecossistema.
        </p>
        
        {/* Placeholder for future table/grid */}
        <div className="mt-8 p-12 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Dashboard de Gameficação em Construção</p>
        </div>
      </div>
    </div>
  );
}
