import { useState, useEffect } from 'react';
import AddExperienceModal from './AddExperienceModal';
import ExperienceDetailModal from './ExperienceDetailModal';
import { FoodExperience, foodExperienceService } from '../../../services/supabase';

export default function HistoryTab() {
  const [experiences, setExperiences] = useState<FoodExperience[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<FoodExperience | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'restaurant' | 'wine' | 'dish' | 'drink'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await foodExperienceService.getAll();
      setExperiences(data);
    } catch (error) {
      console.error('Erro ao carregar experiências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta experiência?')) return;
    
    try {
      await foodExperienceService.delete(id);
      await loadExperiences();
      // Fechar modais
      setSelectedExperience(null);
    } catch (error) {
      console.error('Erro ao deletar experiência:', error);
      alert('Erro ao deletar experiência. Por favor, tente novamente.');
    }
  };

  const handleAddExperience = async (newExperience: FoodExperience) => {
    try {
      const created = await foodExperienceService.create(newExperience);
      setExperiences([created, ...experiences]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Erro ao adicionar experiência:', error);
    }
  };

  const handleUpdateExperience = (updated: FoodExperience) => {
    setExperiences(experiences.map(exp => exp.id === updated.id ? updated : exp));
  };

  const filteredExperiences = filterType === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-orange-500 animate-spin"></i>
          <p className="mt-4 text-gray-600">Carregando experiências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Minhas Experiências
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap"
        >
          <i className="ri-add-line text-lg"></i>
          <span className="hidden sm:inline">Nova Experiência</span>
          <span className="sm:hidden">Adicionar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-white text-orange-500 shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterType('restaurant')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filterType === 'restaurant'
              ? 'bg-white text-orange-500 shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white'
          }`}
        >
          🍴 Restaurantes
        </button>
        <button
          onClick={() => setFilterType('wine')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filterType === 'wine'
              ? 'bg-white text-orange-500 shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white'
          }`}
        >
          🍷 Vinhos
        </button>
        <button
          onClick={() => setFilterType('dish')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filterType === 'dish'
              ? 'bg-white text-orange-500 shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white'
          }`}
        >
          🍽️ Pratos
        </button>
        <button
          onClick={() => setFilterType('drink')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filterType === 'drink'
              ? 'bg-white text-orange-500 shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white'
          }`}
        >
          🍹 Drinks
        </button>
      </div>

      {/* Empty State */}
      {filteredExperiences.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-restaurant-line text-4xl text-orange-500"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filterType === 'all' ? 'Nenhuma experiência registrada' : 'Nenhuma experiência encontrada'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {filterType === 'all' 
              ? 'Comece a registrar suas experiências gastronômicas e crie seu diário de sabores!'
              : 'Tente ajustar os filtros ou adicione novas experiências'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap"
          >
            <i className="ri-add-line text-lg"></i>
            Adicionar Primeira Experiência
          </button>
        </div>
      )}

      {/* Grid de Experiências */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExperiences.map((exp) => (
          <div
            key={exp.id}
            onClick={() => setSelectedExperience(exp)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={exp.image_url || `https://readdy.ai/api/search-image?query=$%7Bexp.type%7D-food-drink-experience-elegant-presentation&width=600&height=450&seq=${exp.type}-${exp.id}&orientation=landscape`}
                alt={exp.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold">
                {exp.type === 'restaurant' && '🍴 Restaurante'}
                {exp.type === 'wine' && '🍷 Vinho'}
                {exp.type === 'dish' && '🍽️ Prato'}
                {exp.type === 'drink' && '🍹 Drink'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-1">{exp.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`text-sm ${
                      i < (exp.rating || 0) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'
                    }`}
                  ></i>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {exp.location || exp.restaurant}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{exp.date ? new Date(exp.date).toLocaleDateString('pt-BR') : ''}</span>
                <span className="font-semibold text-orange-500">{exp.price}</span>
              </div>
            </div>

            {/* Adicionar indicador de avaliações */}
            {exp.reviews_count && exp.reviews_count > 0 && (
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="ri-chat-3-line"></i>
                  <span>{exp.reviews_count} {exp.reviews_count === 1 ? 'avaliação' : 'avaliações'}</span>
                </div>
              </div>
            )}
            
            {/* Indicador "Voltaria" */}
            {exp.would_return !== null && exp.would_return !== undefined && (
              <div className="px-4 pb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  exp.would_return
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <i className={exp.would_return ? 'ri-check-line' : 'ri-close-line'}></i>
                  {exp.would_return ? 'Voltaria' : 'Não Voltaria'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botão flutuante para adicionar (mobile) */}
      {experiences.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-30"
        >
          <i className="ri-add-line text-2xl"></i>
        </button>
      )}

      {/* Modal de Adicionar */}
      {showAddModal && (
        <AddExperienceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddExperience}
        />
      )}

      {/* Modal de Detalhes */}
      {selectedExperience && (
        <ExperienceDetailModal
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
          onUpdate={handleUpdateExperience}
        />
      )}
    </div>
  );
}