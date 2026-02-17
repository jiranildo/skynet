import { useState } from 'react';
import { CellarWine } from '../../../services/supabase';
import WineLifecycleChart from './WineLifecycleChart';
import { searchWineInfo } from '../../../services/gemini';

interface WineDetailModalProps {
  wine: CellarWine;
  onClose: () => void;
  onUpdate?: (updates: Partial<CellarWine>) => void;
  onDelete?: () => void;
  onConsumeBottle?: () => void;
  onAddBottle?: () => void;
}

export default function WineDetailModal({
  wine,
  onClose,
  onUpdate,
  onDelete,
  onConsumeBottle,
  onAddBottle
}: WineDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CellarWine>(wine);
  const [isSearching, setIsSearching] = useState(false);

  const handleSARASearchForEnrichment = async () => {
    if (!editForm.name) {
      alert('Por favor, informe ao menos o nome do vinho para a SARA');
      return;
    }

    setIsSearching(true);
    try {
      const query = `${editForm.name} ${editForm.producer || ''} ${editForm.vintage || ''}`.trim();
      const analysis = await searchWineInfo(query);

      if (analysis) {
        setEditForm({
          ...editForm,
          name: analysis.name || editForm.name,
          producer: analysis.producer || editForm.producer,
          vintage: analysis.vintage || editForm.vintage,
          type: analysis.type || editForm.type,
          region: analysis.region || editForm.region,
          country: analysis.country || editForm.country,
          grapes: analysis.grapes || editForm.grapes,
          alcohol_content: analysis.alcohol_content || editForm.alcohol_content,
          description: analysis.description || editForm.description,
          food_pairing: analysis.food_pairing || editForm.food_pairing,
          serving_temp: analysis.serving_temp || editForm.serving_temp,
          decant_time: analysis.decant_time || editForm.decant_time,
          aging_potential: analysis.aging_potential || editForm.aging_potential,
          best_drinking_window: analysis.best_drinking_window || editForm.best_drinking_window,
          terroir: analysis.terroir || editForm.terroir,
          intensity: analysis.intensity || editForm.intensity,
          visual_perception: analysis.visual_perception || editForm.visual_perception,
          olfactory_perception: analysis.olfactory_perception || editForm.olfactory_perception,
          palate_perception: analysis.palate_perception || editForm.palate_perception,
        });
      } else {
        alert('Não foi possível encontrar informações detalhadas para este vinho.');
      }
    } catch (error) {
      console.error('Error during SARA enrichment:', error);
      alert('Erro na pesquisa SARA AI. Por favor, tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editForm);
      setIsEditing(false);
    }
  };

  const handleConsume = () => {
    if (onConsumeBottle && (wine.quantity || 0) > 0) {
      onConsumeBottle();
    }
  };

  const handleAdd = () => {
    if (onAddBottle) {
      onAddBottle();
    }
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pt-10 md:pt-0 md:p-4" onClick={onClose}>
        <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-3xl shadow-2xl overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Editar Vinho</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Nome</label>
              <div className="relative">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none pr-32"
                />
                <button
                  onClick={handleSARASearchForEnrichment}
                  disabled={isSearching || !editForm.name}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isSearching ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-sparkling-fill"></i>
                  )}
                  SARA AI
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Produtor</label>
                <input
                  type="text"
                  value={editForm.producer || ''}
                  onChange={e => setEditForm({ ...editForm, producer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Safra</label>
                <input
                  type="number"
                  value={editForm.vintage || ''}
                  onChange={e => setEditForm({ ...editForm, vintage: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Preço (R$)</label>
                <input
                  type="number"
                  value={editForm.price || 0}
                  onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={editForm.quantity || 0}
                  onChange={e => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Notas</label>
              <textarea
                value={editForm.notes || ''}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              />
            </div>

            {/* Location Fields */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Localização</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Seção"
                  value={editForm.section || ''}
                  onChange={e => setEditForm({ ...editForm, section: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center"
                />
                <input
                  type="text"
                  placeholder="Prat."
                  value={editForm.shelf || ''}
                  onChange={e => setEditForm({ ...editForm, shelf: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center"
                />
                <input
                  type="text"
                  placeholder="Pos."
                  value={editForm.position || ''}
                  onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Temperatura</label>
                <input
                  type="text"
                  value={editForm.serving_temp || ''}
                  onChange={e => setEditForm({ ...editForm, serving_temp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Decantação</label>
                <input
                  type="text"
                  value={editForm.decant_time || ''}
                  onChange={e => setEditForm({ ...editForm, decant_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Janela de Consumo</label>
                <input
                  type="text"
                  value={editForm.best_drinking_window || ''}
                  onChange={e => setEditForm({ ...editForm, best_drinking_window: e.target.value })}
                  placeholder="Ex: 2024 - 2030"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Terroir</label>
                <input
                  type="text"
                  value={editForm.terroir || ''}
                  onChange={e => setEditForm({ ...editForm, terroir: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-100">
              <h3 className="font-bold text-gray-900">Perfil Sensorial</h3>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Intensidade (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editForm.intensity || 3}
                  onChange={e => setEditForm({ ...editForm, intensity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-1">
                  <span>Leve</span>
                  <span>Médio</span>
                  <span>Encropado</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Exame Visual</label>
                <input
                  type="text"
                  value={editForm.visual_perception || ''}
                  onChange={e => setEditForm({ ...editForm, visual_perception: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Exame Olfativo</label>
                <textarea
                  value={editForm.olfactory_perception || ''}
                  onChange={e => setEditForm({ ...editForm, olfactory_perception: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Exame Gustativo</label>
                <textarea
                  value={editForm.palate_perception || ''}
                  onChange={e => setEditForm({ ...editForm, palate_perception: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3 pb-safe-area md:pb-0">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-3xl shadow-2xl overflow-y-auto animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full md:h-auto">
          {/* Image Section */}
          <div className="w-full md:w-2/5 bg-gray-50 relative flex-shrink-0">
            <div className="sticky top-0 h-72 md:h-full md:min-h-[500px] flex items-center justify-center p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white flex items-center justify-center md:hidden"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>

              <img
                src={wine.image_url || `https://readdy.ai/api/search-image?query=${wine.name} wine bottle&width=400&height=600&orientation=portrait`}
                alt={wine.name}
                className="h-full w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col h-full md:h-auto bg-white rounded-t-3xl -mt-6 md:mt-0 md:rounded-none relative z-10 md:min-h-[600px]">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-start justify-between bg-white md:rounded-tr-3xl sticky top-0 z-20 md:static">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${wine.type === 'red' ? 'bg-red-100 text-red-700' :
                    wine.type === 'white' ? 'bg-amber-100 text-amber-700' :
                      wine.type === 'rose' ? 'bg-pink-100 text-pink-700' :
                        wine.type === 'sparkling' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                    }`}>
                    {wine.type === 'red' ? 'Tinto' :
                      wine.type === 'white' ? 'Branco' :
                        wine.type === 'rose' ? 'Rosé' :
                          wine.type === 'sparkling' ? 'Espumante' :
                            wine.type === 'fortified' ? 'Fortificado' :
                              wine.type === 'dessert' ? 'Sobremesa' :
                                wine.type}
                  </span>
                  {wine.vintage && (
                    <span className="text-sm font-semibold text-gray-500">
                      {wine.vintage}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-1">
                  {wine.name}
                </h2>
                <p className="text-lg text-gray-600">
                  {wine.producer}
                </p>
              </div>

              <button
                onClick={onClose}
                className="hidden md:flex w-10 h-10 items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                title="Fechar"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Scrollable Details */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-32 md:pb-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <i className="ri-money-dollar-circle-line text-2xl text-emerald-600 mb-1 block"></i>
                  <span className="text-sm text-gray-500 block">Preço</span>
                  <span className="font-bold text-gray-900">
                    {wine.price ? `R$ ${wine.price}` : '-'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <i className="ri-star-fill text-2xl text-amber-400 mb-1 block"></i>
                  <span className="text-sm text-gray-500 block">Avaliação</span>
                  <span className="font-bold text-gray-900">
                    {wine.rating ? wine.rating.toFixed(1) : '-'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <i className="ri-map-pin-line text-2xl text-red-500 mb-1 block"></i>
                  <span className="text-sm text-gray-500 block">Região</span>
                  <span className="font-bold text-gray-900 truncate px-2 block">
                    {wine.country || '-'}
                  </span>
                </div>
              </div>

              {/* Lifecycle Chart */}
              <WineLifecycleChart
                vintage={wine.vintage || 0}
                bestDrinkingWindow={wine.best_drinking_window}
                agingPotential={wine.aging_potential}
              />

              {/* Service & Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Column */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-sm font-bold text-purple-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <i className="ri-temp-hot-line"></i>
                    Serviço de Sommelier
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-purple-200/50 pb-2">
                      <span className="text-sm text-purple-700 font-medium">Temperatura</span>
                      <span className="text-sm font-bold text-purple-900">{wine.serving_temp || '16-18°C'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-purple-200/50 pb-2">
                      <span className="text-sm text-purple-700 font-medium">Decantação</span>
                      <span className="text-sm font-bold text-purple-900">{wine.decant_time || 'Não necessário'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 font-medium">Potencial</span>
                      <span className="text-sm font-bold text-purple-900">{wine.aging_potential || 'Longa guarda'}</span>
                    </div>
                  </div>
                </div>

                {/* Technical / Terroir Column */}
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <i className="ri-earth-line"></i>
                    Terroir e Composição
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-amber-200/50 pb-2">
                      <span className="text-sm text-amber-700 font-medium">Teor Alcoólico</span>
                      <span className="text-sm font-bold text-amber-900">{wine.alcohol_content ? `${wine.alcohol_content}%` : '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-amber-700 font-medium">Terroir</span>
                      <span className="text-sm font-bold text-amber-900 leading-tight">{wine.terroir || 'Solo argilo-calcário'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensory Profile Analysis */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 md:p-8 border border-amber-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <h3 className="text-lg font-bold text-amber-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <i className="ri-eye-line text-amber-600 text-xl"></i>
                  </div>
                  Perfil Sensorial
                </h3>

                <div className="space-y-6">
                  {/* Intensity Meter */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">Intensidade e Corpo</span>
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">Nível {wine.intensity || 3}/5</span>
                    </div>
                    <div className="flex gap-1.5 h-3">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-500 ${level <= (wine.intensity || 3)
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-sm shadow-amber-200'
                            : 'bg-amber-200/30'
                            }`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-amber-600/60 font-bold uppercase mt-2">
                      <span>Leve</span>
                      <span>Médio</span>
                      <span>Encorpado</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                        <i className="ri-drop-line text-amber-600"></i>
                        Visual
                      </h4>
                      <p className="text-sm text-amber-900 leading-relaxed font-medium">
                        {wine.visual_perception || 'Análise visual não disponível.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                        <i className="ri-windy-line text-amber-600"></i>
                        Olfativa
                      </h4>
                      <p className="text-sm text-amber-900 leading-relaxed font-medium">
                        {wine.olfactory_perception || 'Análise olfativa não disponível.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                        <i className="ri-restaurant-line text-amber-600"></i>
                        Gustativa
                      </h4>
                      <p className="text-sm text-amber-900 leading-relaxed font-medium">
                        {wine.palate_perception || 'Análise gustativa não disponível.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Info */}
              <div className="space-y-4">
                {wine.region && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-map-2-line text-red-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Região</h4>
                      <p className="text-gray-600">{wine.region}</p>
                    </div>
                  </div>
                )}

                {wine.grapes && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-plant-line text-purple-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Uvas</h4>
                      <p className="text-gray-600">{wine.grapes}</p>
                    </div>
                  </div>
                )}

                {wine.food_pairing && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-restaurant-line text-orange-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Harmonização</h4>
                      <p className="text-gray-600">{wine.food_pairing}</p>
                    </div>
                  </div>
                )}

                {wine.notes && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                      <i className="ri-sticky-note-line"></i>
                      Notas Pessoais
                    </h4>
                    <p className="text-yellow-900/80 italic">{wine.notes}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Localização</h4>
                <div className="flex gap-4">
                  <span className="px-4 py-2 bg-gray-100 rounded-lg font-mono font-bold text-gray-600 text-sm">Seção: {wine.section || '-'}</span>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg font-mono font-bold text-gray-600 text-sm">Prat: {wine.shelf || '-'}</span>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg font-mono font-bold text-gray-600 text-sm">Pos: {wine.position || '-'}</span>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col gap-3 fixed bottom-0 left-0 right-0 md:static md:bottom-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-medium">Estoque Atual</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConsume}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!wine.quantity || wine.quantity <= 0}
                    title="Consumir uma garrafa"
                  >
                    <i className="ri-subtract-line text-xl"></i>
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-8 text-center">{wine.quantity}</span>
                  <button
                    onClick={handleAdd}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 flex items-center justify-center transition-colors"
                    title="Adicionar uma garrafa"
                  >
                    <i className="ri-add-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="py-3.5 rounded-xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-pencil-line"></i>
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja apagar este vinho?')) {
                      if (onDelete) onDelete();
                    }
                  }}
                  className="py-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-delete-bin-line"></i>
                  Apagar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
