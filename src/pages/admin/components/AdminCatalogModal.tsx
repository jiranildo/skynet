import { useState, useMemo, useEffect } from 'react';
import type { ItineraryCatalog } from '../../../services/db/itinerary_catalog';

interface AdminCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (catalog: Partial<ItineraryCatalog>) => Promise<void>;
  catalogToEdit?: ItineraryCatalog | null;
}

const ACTIVITY_TYPES = [
  { id: 'activity', label: 'Atividade', icon: 'ri-camera-line' },
  { id: 'flight', label: 'Voo', icon: 'ri-plane-line' },
  { id: 'accommodation', label: 'Hotel', icon: 'ri-hotel-line' },
  { id: 'car', label: 'Carro', icon: 'ri-car-line' },
  { id: 'restaurant', label: 'Restaurante', icon: 'ri-restaurant-line' },
  { id: 'transport', label: 'Transporte', icon: 'ri-taxi-line' },
  { id: 'ticket', label: 'Ingresso', icon: 'ri-ticket-line' },
  { id: 'service', label: 'Serviço', icon: 'ri-group-line' }
];

export default function AdminCatalogModal({ isOpen, onClose, onSave, catalogToEdit }: AdminCatalogModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'itinerary'>('info');
  const [formData, setFormData] = useState({
    title: catalogToEdit?.title || '',
    destination: catalogToEdit?.destination || '',
    duration_days: catalogToEdit?.duration_days?.toString() || '1',
    category: catalogToEdit?.category || 'geral',
    description: catalogToEdit?.description || '',
    image_url: catalogToEdit?.image_url || ''
  });
  
  const [itineraryData, setItineraryData] = useState<Record<number, any[]>>(catalogToEdit?.itinerary_data || {});
  const [activeDay, setActiveDay] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Activity Form State
  const [newActivity, setNewActivity] = useState({
    type: 'activity',
    time: '09:00',
    title: '',
    description: '',
    location: '',
    cost: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: catalogToEdit?.title || '',
        destination: catalogToEdit?.destination || '',
        duration_days: catalogToEdit?.duration_days?.toString() || '1',
        category: catalogToEdit?.category || 'geral',
        description: catalogToEdit?.description || '',
        image_url: catalogToEdit?.image_url || ''
      });
      setItineraryData(catalogToEdit?.itinerary_data || {});
      setActiveDay(0);
      setActiveTab('info');
      setNewActivity({
        type: 'activity',
        time: '09:00',
        title: '',
        description: '',
        location: '',
        cost: ''
      });
    }
  }, [isOpen, catalogToEdit]);

  const durationDaysStr = formData.duration_days;
  const daysCount = parseInt(durationDaysStr) || 1;

  const daysArray = useMemo(() => {
    return Array.from({ length: daysCount }).map((_, i) => i);
  }, [daysCount]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, duration_days: val });
    
    // If we reduce days, should we truncate itineraryData? 
    // Let's keep data in state but it just won't be accessible by day tabs 
    // until saved (then we might clean it up on save or keep it).
    
    const newDaysCount = parseInt(val) || 1;
    if (activeDay >= newDaysCount) {
      setActiveDay(Math.max(0, newDaysCount - 1));
    }
  };

  const handleAddActivity = () => {
    if (!newActivity.title) {
      alert("Preencha o título da atividade.");
      return;
    }

    const activity = {
      id: Math.random().toString(36).substring(2, 9),
      type: newActivity.type,
      time: newActivity.time,
      title: newActivity.title,
      description: newActivity.description,
      location: newActivity.location,
      cost: newActivity.cost ? parseFloat(newActivity.cost) : 0,
      icon: ACTIVITY_TYPES.find(t => t.id === newActivity.type)?.icon || 'ri-map-pin-line'
    };

    setItineraryData(prev => {
      const dayActivities = prev[activeDay] || [];
      const updatedDay = [...dayActivities, activity].sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [activeDay]: updatedDay };
    });

    // Reset Form
    setNewActivity({
      type: 'activity',
      time: '09:00',
      title: '',
      description: '',
      location: '',
      cost: ''
    });
  };

  const handleRemoveActivity = (dayIndex: number, activityId: string) => {
    setItineraryData(prev => {
      const dayActivities = prev[dayIndex] || [];
      return {
        ...prev,
        [dayIndex]: dayActivities.filter(a => a.id !== activityId)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.destination) {
      setActiveTab('info');
      alert('Preencha os campos obrigatórios (Título e Destino).');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up itineraryData to only include valid days
      const finalItineraryData: Record<number, any[]> = {};
      daysArray.forEach(day => {
        if (itineraryData[day]) {
          finalItineraryData[day] = itineraryData[day];
        }
      });

      await onSave({
        ...formData,
        duration_days: daysCount,
        itinerary_data: finalItineraryData
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden relative">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
             <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <i className="ri-road-map-line text-rose-500"></i>
                {catalogToEdit ? 'Editar Roteiro' : 'Novo Roteiro'}
             </h2>
             <p className="text-sm text-gray-500 mt-1">Configure as informações gerais e as atividades diárias do template.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
           <button
             onClick={() => setActiveTab('info')}
             className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === 'info' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
           >
              Informações Básicas
           </button>
           <button
             onClick={() => setActiveTab('itinerary')}
             className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'itinerary' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
           >
              Roteiro Dia-a-Dia
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{daysCount} Dias</span>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 sm:p-6">
           {activeTab === 'info' && (
              <div className="space-y-5 max-w-3xl mx-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Roteiro *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition-all bg-white"
                    placeholder="Ex: Explorando Paris em 5 Dias"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Destino Principal *</label>
                    <input
                      type="text"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white"
                      placeholder="Ex: Paris, França"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duração Total (Dias) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="30"
                      value={formData.duration_days}
                      onChange={handleDayChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria Temática</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white"
                  >
                    <option value="geral">Geral</option>
                    <option value="lazer">Lazer</option>
                    <option value="aventura">Aventura</option>
                    <option value="romantico">Romântico</option>
                    <option value="historia">História / Cultura</option>
                    <option value="familia">Família</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Resumo / Descrição Mágica</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm h-32 resize-none bg-white"
                    placeholder="Descreva brevemente o que este roteiro oferece e por que ele é perfeito para o viajante..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Imagem de Capa (Opcional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm bg-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
           )}

           {activeTab === 'itinerary' && (
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                 {/* Left Sidebar - Days */}
                 <div className="w-full lg:w-64 flex-shrink-0 flex gap-2 lg:flex-col overflow-x-auto lg:overflow-y-auto hide-scrollbar pb-2 lg:pb-0">
                    {daysArray.map((dayIndex) => {
                       const actCount = (itineraryData[dayIndex] || []).length;
                       return (
                         <button
                           key={dayIndex}
                           onClick={() => setActiveDay(dayIndex)}
                           className={`flex items-center justify-between p-3 sm:p-4 rounded-xl text-left font-bold transition-all flex-shrink-0 w-32 lg:w-full border
                             ${activeDay === dayIndex 
                               ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                               : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                         >
                            <span>Dia {dayIndex + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeDay === dayIndex ? 'bg-rose-200 text-rose-800' : 'bg-gray-100 text-gray-500'}`}>
                               {actCount}
                            </span>
                         </button>
                       );
                    })}
                 </div>

                 {/* Right Area - Activities for Active Day */}
                 <div className="flex-1 flex flex-col min-w-0 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                       <span>Atividades do Dia {activeDay + 1}</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
                       {(!itineraryData[activeDay] || itineraryData[activeDay].length === 0) ? (
                          <div className="text-center py-10 text-gray-400">
                             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="ri-map-pin-line text-2xl text-gray-300"></i>
                             </div>
                             <p>Este dia ainda não possui atividades.</p>
                             <p className="text-xs mt-1">Adicione lugares para visitar, restaurantes ou transportes.</p>
                          </div>
                       ) : (
                          itineraryData[activeDay].map((act, index) => (
                             <div key={act.id || index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl text-rose-500 shrink-0">
                                   <i className={act.icon || 'ri-map-pin-line'}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{act.time}</span>
                                      <h4 className="font-bold text-gray-900 truncate">{act.title}</h4>
                                      {act.cost > 0 && (
                                         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                                            R$ {act.cost}
                                         </span>
                                      )}
                                   </div>
                                   {act.location && (
                                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1 truncate">
                                         <i className="ri-map-pin-line"></i> {act.location}
                                      </div>
                                   )}
                                   {act.description && (
                                      <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed rounded bg-white p-2 border border-gray-100">{act.description}</p>
                                   )}
                                </div>
                                <div className="flex relative">
                                  <button
                                     onClick={() => handleRemoveActivity(activeDay, act.id)}
                                     className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                                     title="Remover Atividade"
                                  >
                                     <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                             </div>
                          ))
                       )}
                    </div>

                    {/* Add Activity Form Inline */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-auto">
                       <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                         <i className="ri-add-circle-line text-rose-500"></i> Adicionar Nova Atividade
                       </h4>
                       <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-3">
                             <select
                               value={newActivity.type}
                               onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                             >
                               {ACTIVITY_TYPES.map(t => (
                                  <option key={t.id} value={t.id}>{t.label}</option>
                               ))}
                             </select>
                          </div>
                          <div className="sm:col-span-2">
                             <input
                               type="time"
                               value={newActivity.time}
                               onChange={e => setNewActivity({...newActivity, time: e.target.value})}
                               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                             />
                          </div>
                          <div className="sm:col-span-7">
                             <input
                               type="text"
                               placeholder="Título (Ex: Visita ao Museu...)"
                               value={newActivity.title}
                               onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                             />
                          </div>
                          
                          <div className="sm:col-span-6">
                             <input
                               type="text"
                               placeholder="Local (Endereço/Cidade)"
                               value={newActivity.location}
                               onChange={e => setNewActivity({...newActivity, location: e.target.value})}
                               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                             />
                          </div>
                          
                          <div className="sm:col-span-6">
                             <input
                               type="text"
                               placeholder="Descrição breve (Opcional)"
                               value={newActivity.description}
                               onChange={e => setNewActivity({...newActivity, description: e.target.value})}
                               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                             />
                          </div>

                          <div className="sm:col-span-4 lg:sm:col-span-3">
                             <input
                               type="number"
                               placeholder="Custo Estimado (R$)"
                               value={newActivity.cost}
                               onChange={e => setNewActivity({...newActivity, cost: e.target.value})}
                               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                               min="0"
                             />
                          </div>
                          
                          <div className="sm:col-span-8 lg:sm:col-span-9 flex justify-end">
                            <button
                               onClick={handleAddActivity}
                               disabled={!newActivity.title}
                               className="px-6 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                               Incluir no Dia {activeDay + 1}
                            </button>
                          </div>

                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
           {activeTab === 'info' ? (
             <button
               type="button"
               onClick={() => setActiveTab('itinerary')}
               className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm ml-auto flex items-center gap-2"
             >
               Avançar para Roteiro <i className="ri-arrow-right-line"></i>
             </button>
           ) : (
             <button
               type="button"
               onClick={() => setActiveTab('info')}
               className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
             >
               <i className="ri-arrow-left-line"></i> Voltar
             </button>
           )}
           
           {activeTab === 'itinerary' && (
             <button
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="px-8 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 outline-none text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSubmitting ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-check-line text-xl"></i>}
               Salvar Catálogo Definitivo
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
