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
          <i className="ri-loader-4-line text-4xl text-orange-500 animate-spin"></i>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-wine-bottle-line text-3xl opacity-80"></i>
            <span className="text-sm opacity-80">Total</span>
          </div>
          <div className="text-3xl font-bold mb-1">{totalWines}</div>
          <div className="text-sm opacity-90">Vinhos Diferentes</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-stack-line text-3xl opacity-80"></i>
            <span className="text-sm opacity-80">Estoque</span>
          </div>
          <div className="text-3xl font-bold mb-1">{totalBottles}</div>
          <div className="text-sm opacity-90">Garrafas Total</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-money-dollar-circle-line text-3xl opacity-80"></i>
            <span className="text-sm opacity-80">Valor</span>
          </div>
          <div className="text-3xl font-bold mb-1">R$ {totalValue.toLocaleString('pt-BR')}</div>
          <div className="text-sm opacity-90">Valor Estimado</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-star-line text-3xl opacity-80"></i>
            <span className="text-sm opacity-80">Média</span>
          </div>
          <div className="text-3xl font-bold mb-1">{avgRating.toFixed(1)}</div>
          <div className="text-sm opacity-90">Avaliação Média</div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-pie-chart-line text-orange-500"></i>
            Distribuição por Tipo
          </h3>
          <div className="space-y-3">
            {Object.entries(typeDistribution).map(([type, count]) => {
              const percentage = (count / totalBottles) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        type === 'Tinto' ? 'bg-red-500' :
                        type === 'Branco' ? 'bg-yellow-500' :
                        type === 'Rosé' ? 'bg-pink-500' :
                        type === 'Espumante' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-global-line text-orange-500"></i>
            Distribuição por País
          </h3>
          <div className="space-y-3">
            {Object.entries(countryDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => {
                const percentage = (count / totalBottles) * 100;
                return (
                  <div key={country}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{country}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Vintage Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-calendar-line text-orange-500"></i>
            Distribuição por Safra
          </h3>
          <div className="space-y-3">
            {Object.entries(vintageDistribution)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .slice(0, 5)
              .map(([vintage, count]) => {
                const percentage = (count / totalBottles) * 100;
                return (
                  <div key={vintage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{vintage}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Most Valuable Wines */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-trophy-line text-orange-500"></i>
            Vinhos Mais Valiosos
          </h3>
          <div className="space-y-3">
            {mostValuableWines.map((wine, index) => (
              <div key={wine.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-full font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{wine.name}</div>
                  <div className="text-sm text-gray-600">{wine.vintage}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-gray-900">
                    R$ {((wine.price || 0) * (wine.quantity || 0)).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-600">{wine.quantity}x R$ {(wine.price || 0).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Growth */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-line-chart-line text-orange-500"></i>
          Valorização da Coleção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
            <i className="ri-arrow-up-line text-3xl text-green-600 mb-2"></i>
            <div className="text-2xl font-bold text-gray-900 mb-1">+{((totalValue / (totalBottles || 1)) * 0.15).toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Valorização Média Anual</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <i className="ri-funds-line text-3xl text-blue-600 mb-2"></i>
            <div className="text-2xl font-bold text-gray-900 mb-1">R$ {(totalValue / (totalBottles || 1)).toFixed(0)}</div>
            <div className="text-sm text-gray-600">Valor Médio por Garrafa</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <i className="ri-time-line text-3xl text-purple-600 mb-2"></i>
            <div className="text-2xl font-bold text-gray-900 mb-1">{wines.filter(w => w.aging_potential).length}</div>
            <div className="text-sm text-gray-600">Vinhos com Potencial de Guarda</div>
          </div>
        </div>
      </div>
    </div>
  );
}
