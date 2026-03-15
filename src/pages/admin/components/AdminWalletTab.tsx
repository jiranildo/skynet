import React from 'react';

export default function AdminWalletTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-wallet-3-line text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Carteira Financeira Master</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Painel transacional para gestão financeira global. Histórico de vendas, devoluções, saldo de agências e balanço monetário da Skynet.
        </p>
        
        {/* Placeholder for future table/grid */}
        <div className="mt-8 p-12 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-sm font-medium text-gray-400">Extrato Financeiro em Construção</p>
        </div>
      </div>
    </div>
  );
}
