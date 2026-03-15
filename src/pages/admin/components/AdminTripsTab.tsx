import React from 'react';

export default function AdminTripsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-flight-takeoff-line text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Viagens, Serviços e Experiências</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Módulo de administração global para visualização de todos os roteiros e serviços criados pelas agências e agentes na plataforma.
        </p>
        
        {/* Placeholder for future table/grid */}
        <div className="mt-8 p-12 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Tabela de Viagens em Construção</p>
        </div>
      </div>
    </div>
  );
}
