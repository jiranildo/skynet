import { useState, useEffect } from 'react';
import { cellarService, CellarWine } from '../../../services/supabase';

export default function StatsTab() {
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      setLoading(true);
      const data = await cellarService.getAll();
      setWines(data);
    } catch (error) {
      console.error('Erro ao carregar vinhos:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalWines = wines.length;
  const totalBottles = wines.reduce((sum, wine) => sum + (wine.quantity || 0), 0);
  const totalValue = wines.reduce((sum, wine) => sum + ((wine.price || 0) * (wine.quantity || 0)), 0);
  const avgRating = wines.length > 0
    ? wines.reduce((sum, wine) => sum + (wine.rating || 0), 0) / wines.length
    : 0;

  const typeDistribution = wines.reduce((acc, wine) => {
    const type = wine.type || 'Outro';
    acc[type] = (acc[type] || 0) + (wine.quantity || 0);
    return acc;
  }, {} as Record<string, number>);

  const countryDistribution = wines.reduce((acc, wine) => {
    const country = wine.country || 'Desconhecido';
    acc[country] = (acc[country] || 0) + (wine.quantity || 0);
    return acc;
  }, {} as Record<string, number>);

  const vintageDistribution = wines.reduce((acc, wine) => {
    if (wine.vintage) {
      const vintage = wine.vintage.toString();
      acc[vintage] = (acc[vintage] || 0) + (wine.quantity || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const mostValuableWines = [...wines]
    .sort((a, b) => ((b.price || 0) * (b.quantity || 0)) - ((a.price || 0) * (a.quantity || 0)))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin"></i>
          </div>
          <p className="text-gray-500 font-medium tracking-wide text-sm">Atualizando dashboard...</p>
        </div>
      </div>
    );
  }

  // Helper for progress bars
  const ProgressBar = ({ percentage, colorClass }: { percentage: number, colorClass: string }) => (
    <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h2>
          <p className="text-gray-500 text-sm">Análise detalhada da sua coleção</p>
        </div>
      </div>

      {/* Main Stats Cards - Premium Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wines */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <i className="ri-wine-fill text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rótulos</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{totalWines}</span>
            <span className="text-sm text-gray-400">vinhos</span>
          </div>
        </div>

        {/* Total Bottles */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
              <i className="ri-stack-fill text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Estoque</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{totalBottles}</span>
            <span className="text-sm text-gray-400">garrafas</span>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <i className="ri-money-dollar-circle-fill text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Valor Total</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              <span className="text-lg text-gray-500 mr-1">R$</span>
              {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <i className="ri-star-fill text-xl"></i>
            </div>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Qualidade</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{avgRating.toFixed(1)}</span>
            <div className="flex text-amber-400 text-sm">
              {[1, 2, 3, 4, 5].map(star => (
                <i key={star} className={`${avgRating >= star ? 'ri-star-fill' : avgRating >= star - 0.5 ? 'ri-star-half-fill' : 'ri-star-line'}`}></i>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Detailed Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* By Type */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <i className="ri-contrast-drop-2-line text-gray-400"></i>
                Por Tipo
              </h3>
              <div className="space-y-5">
                {Object.entries(typeDistribution).sort(([, a], [, b]) => b - a).map(([type, count]) => {
                  const percentage = (count / totalBottles) * 100;
                  const colorClass =
                    type === 'red' ? 'bg-red-500' :
                      type === 'white' ? 'bg-amber-200' :
                        type === 'rose' ? 'bg-rose-300' :
                          type === 'sparkling' ? 'bg-sky-300' : 'bg-purple-400';
                  const label = type === 'red' ? 'Tinto' : type === 'white' ? 'Branco' : type === 'rose' ? 'Rosé' : type === 'sparkling' ? 'Espumante' : type;

                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">{label}</span>
                        <span className="text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <ProgressBar percentage={percentage} colorClass={colorClass} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Country */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <i className="ri-earth-line text-gray-400"></i>
                Por País
              </h3>
              <div className="space-y-5">
                {Object.entries(countryDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([country, count]) => {
                    const percentage = (count / totalBottles) * 100;
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-700">{country}</span>
                          <span className="text-gray-500">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <ProgressBar percentage={percentage} colorClass="bg-indigo-500" />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Value Analysis */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-vip-diamond-line text-gray-400"></i>
                Jóias da Coleção
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Vinho</th>
                    <th className="pb-3 text-right">Preço Unit.</th>
                    <th className="pb-3 text-right pr-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mostValuableWines.map((wine, index) => (
                    <tr key={wine.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-2 text-gray-400 font-medium text-sm w-12">#{index + 1}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                            <i className="ri-wine-fill"></i>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors">{wine.name}</div>
                            <div className="text-xs text-gray-500">{wine.producer} • {wine.vintage}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm text-gray-600">
                        R$ {wine.price?.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-4 text-right pr-2 text-sm font-bold text-gray-900">
                        R$ {((wine.price || 0) * (wine.quantity || 0)).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-6">
          {/* Smart Insights */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <i className="ri-magic-line"></i>
              Insights
            </h3>
            <p className="text-indigo-100 text-sm mb-6">Baseado na sua coleção</p>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold mb-1">Média de Preço</div>
                <div className="text-2xl font-bold">R$ {(totalValue / (totalBottles || 1)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-indigo-200 mt-1">por garrafa</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold mb-1">Potencial de Guarda</div>
                <div className="text-2xl font-bold">{wines.filter(w => w.aging_potential).length}</div>
                <div className="text-xs text-indigo-200 mt-1">vinhos identificados</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold mb-1">Valorização Estimada</div>
                <div className="text-2xl font-bold text-emerald-300">+12%</div>
                <div className="text-xs text-indigo-200 mt-1">últimos 12 meses</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
