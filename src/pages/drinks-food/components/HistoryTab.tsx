import { useState, useEffect, useMemo } from 'react';
import AddExperienceModal from './AddExperienceModal';
import ExperienceDetailModal from './ExperienceDetailModal';
import { FoodExperience, foodExperienceService } from '../../../services/supabase';

interface HistoryTabProps {
  lastUpdated?: number;
}

export default function HistoryTab({ lastUpdated }: HistoryTabProps) {
  const [experiences, setExperiences] = useState<FoodExperience[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<FoodExperience | null>(null);

  // Filters & Controls States
  const [filterType, setFilterType] = useState<'all' | 'restaurant' | 'wine' | 'dish' | 'drink'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'price'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, [lastUpdated]);

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

  const handleDeleteExperience = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir esta experiência?')) return;

    try {
      await foodExperienceService.delete(id);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      if (selectedExperience?.id === id) setSelectedExperience(null);
    } catch (error) {
      console.error('Erro ao deletar experiência:', error);
      alert('Erro ao deletar experiência.');
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

  // Stats Calculation
  const stats = useMemo(() => {
    const total = experiences.length;
    const restaurants = experiences.filter(e => e.type === 'restaurant').length;
    const wines = experiences.filter(e => e.type === 'wine').length;
    const avgRating = total > 0
      ? (experiences.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total).toFixed(1)
      : '0.0';
    return { total, restaurants, wines, avgRating };
  }, [experiences]);

  // Filtering Logic
  const filteredExperiences = useMemo(() => {
    let result = experiences;

    // Type Filter
    if (filterType !== 'all') {
      result = result.filter(exp => exp.type === filterType);
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(exp =>
        exp.name.toLowerCase().includes(lower) ||
        (exp.location && exp.location.toLowerCase().includes(lower)) ||
        (exp.restaurant && exp.restaurant.toLowerCase().includes(lower))
      );
    }

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Price is string, so simple length/value proxy or custom logic
      return (b.price?.length || 0) - (a.price?.length || 0);
    });

    return result;
  }, [experiences, filterType, searchTerm, sortBy]);

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
    <div className="space-y-6 pb-20">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full -mr-8 -mt-8"></div>
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            <span className="text-xs text-orange-500 font-medium mb-1">Exp.</span>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full -mr-8 -mt-8"></div>
          <p className="text-xs text-gray-500 mb-1">Restaurantes</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats.restaurants}</span>
            <i className="ri-restaurant-line text-purple-400 mb-1"></i>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-full -mr-8 -mt-8"></div>
          <p className="text-xs text-gray-500 mb-1">Vinhos</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats.wines}</span>
            <i className="ri-goblet-line text-rose-400 mb-1"></i>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-yellow-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 rounded-full -mr-8 -mt-8"></div>
          <p className="text-xs text-gray-500 mb-1">Média</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats.avgRating}</span>
            <i className="ri-star-fill text-yellow-400 mb-1"></i>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-sm p-2 sticky top-[114px] md:top-[160px] z-20 mx-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <i className="ri-grid-fill"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <i className="ri-list-check"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'restaurant', label: 'Restaurantes' },
              { id: 'wine', label: 'Vinhos' },
              { id: 'dish', label: 'Pratos' },
              { id: 'drink', label: 'Drinks' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filterType === type.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-medium text-gray-500 border-none focus:ring-0 pr-8 cursor-pointer hover:text-orange-500 transition-colors"
          >
            <option value="date">Mais Recentes</option>
            <option value="rating">Melhor Avaliação</option>
            <option value="price">Maior Preço</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12 md:py-20 border-2 border-dashed border-gray-200 rounded-3xl mx-2 bg-gray-50/50">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce-slow">
            <i className="ri-camera-lens-line text-4xl text-gray-300"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhum resultado' : 'Colecione Momentos'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">
            {searchTerm
              ? 'Tente buscar por outro termo ou limpe os filtros.'
              : 'Suas experiências gastronômicas aparecerão aqui. Que tal adicionar a primeira agora?'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all"
          >
            <i className="ri-magic-line text-lg"></i>
            Adicionar Experiência
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
        }>
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              onClick={() => setSelectedExperience(exp)}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 ${viewMode === 'list' ? 'flex items-center' : ''
                }`}
            >
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-[4/3]'}`}>
                <img
                  src={exp.image_url || `https://readdy.ai/api/search-image?query=${exp.type}-food-drink-experience&width=400&height=300&seq=${exp.type}-${exp.id}`}
                  alt={exp.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {exp.would_return && (
                    <div className="w-6 h-6 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs shadow-sm" title="Voltaria!">
                      <i className="ri-heart-3-fill"></i>
                    </div>
                  )}
                </div>
                {viewMode === 'grid' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs line-clamp-1">
                      <i className="ri-map-pin-line mr-1"></i>
                      {exp.location || exp.restaurant}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-orange-500 uppercase mb-1 block">
                      {exp.type}
                    </span>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{exp.name}</h3>
                  </div>
                  {viewMode === 'list' && (
                    <button
                      onClick={(e) => handleDeleteExperience(e, exp.id!)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`text-xs ${i < (exp.rating || 0) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-200'}`}
                    ></i>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({exp.rating?.toFixed(1)})</span>
                </div>

                {viewMode === 'list' && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{exp.description || exp.notes}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-calendar-line"></i>
                    <span>{exp.date ? new Date(exp.date).toLocaleDateString('pt-BR') : 'Data n/a'}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{exp.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddExperienceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddExperience}
        />
      )}

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