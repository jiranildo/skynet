import { useState, useEffect } from 'react';
import { getItineraryCatalogs, type ItineraryCatalog } from '../../../services/db/itinerary_catalog';
import { useAuth } from '../../../context/AuthContext';

interface ItineraryCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCatalog: (catalog: ItineraryCatalog) => void;
  onStartFromScratch: () => void;
}

export default function ItineraryCatalogModal({ isOpen, onClose, onSelectCatalog, onStartFromScratch }: ItineraryCatalogModalProps) {
  const [catalogs, setCatalogs] = useState<ItineraryCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const entityId = user?.user_metadata?.entity_id;
  
  // New States for view options, filters, and sorting
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'duration_asc' | 'duration_desc' | 'name_asc' | 'name_desc'>('newest');

  useEffect(() => {
    if (isOpen) {
      loadCatalogs();
    }
  }, [isOpen]);

  const loadCatalogs = async () => {
    setIsLoading(true);
    try {
      const data = await getItineraryCatalogs(entityId);
      setCatalogs(data);
    } catch (error) {
      console.error('Failed to load catalogs', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Extract unique categories
  const categories = Array.from(new Set(catalogs.map(c => c.category?.toLowerCase() || 'geral')));

  // Apply filters and sorting
  const processedCatalogs = catalogs.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const catalogCategory = c.category?.toLowerCase() || 'geral';
    const matchesCategory = selectedCategory === 'all' || catalogCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Apply Sorting
  processedCatalogs.sort((a, b) => {
    switch (sortBy) {
      case 'duration_asc':
        return (a.duration_days || 0) - (b.duration_days || 0);
      case 'duration_desc':
        return (b.duration_days || 0) - (a.duration_days || 0);
      case 'name_asc':
        return a.title.localeCompare(b.title);
      case 'name_desc':
        return b.title.localeCompare(a.title);
      case 'newest':
      default:
        // Assuming there's a created_at or just relying on natural load order
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <i className="ri-road-map-line text-blue-500"></i>
              Como você deseja começar?
            </h2>
            <p className="text-gray-500 text-sm mt-1">Escolha um roteiro pronto do nosso catálogo ou crie o seu do zero.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
             <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          
          {/* Start from scratch Option */}
          <div 
            onClick={onStartFromScratch}
            className="mb-8 p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 transition-all cursor-pointer group flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <i className="ri-add-line text-3xl text-blue-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">Começar do Zero</h3>
              <p className="text-sm text-gray-500">Crie um roteiro totalmente personalizado passo a passo.</p>
            </div>
            <i className="ri-arrow-right-line ml-auto text-2xl text-gray-300 group-hover:text-blue-500 transition-colors"></i>
          </div>

          {/* Catalog Selection Header & Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-900">Ou escolha um roteiro pré-fabricado:</h3>
              <div className="relative w-full sm:w-64">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder="Buscar destinos..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 rounded-xl text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'all' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap capitalize transition-colors ${
                      selectedCategory === cat ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* View and Sort Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-100 border-none text-gray-700 text-sm font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="duration_asc">Menos Dias</option>
                  <option value="duration_desc">Mais Dias</option>
                  <option value="name_asc">Nome (A-Z)</option>
                  <option value="name_desc">Nome (Z-A)</option>
                </select>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                {/* Grid/List Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Exibição em Grid"
                  >
                    <i className="ri-grid-fill"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Exibição em Lista"
                  >
                    <i className="ri-list-check"></i>
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
               <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <i className="ri-loader-4-line animate-spin text-3xl mb-2 text-blue-500"></i>
                  <p>Buscando os melhores roteiros...</p>
               </div>
            ) : processedCatalogs.length === 0 ? (
                <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <i className="ri-file-search-line text-4xl mb-2 text-gray-300 inline-block"></i>
                  <p>Nenhum roteiro encontrado para estes filtros.</p>
                  <button 
                    onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                    }}
                    className="mt-3 text-sm text-blue-500 font-bold hover:underline"
                  >
                      Limpar Filtros
                  </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedCatalogs.map(catalog => (
                    <div key={catalog.id} className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col relative">
                       {/* Banner/Header */}
                       <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 flex items-end relative overflow-hidden">
                          {catalog.image_url ? (
                             <img src={catalog.image_url} alt={catalog.title} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                          ) : (
                             <div className="absolute -right-4 -bottom-4 opacity-20">
                               <i className="ri-compass-3-line text-8xl"></i>
                             </div>
                          )}
                          <div className="relative z-10 w-full">
                            <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                              {catalog.category || 'Geral'}
                            </span>
                            <div className="flex justify-between items-end">
                               <h4 className="text-white font-bold text-lg leading-tight truncate pr-2">{catalog.title}</h4>
                            </div>
                          </div>
                       </div>
                       
                       <div className="p-4 flex-1 flex flex-col">
                         <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded w-max mb-3">
                           <i className="ri-map-pin-line"></i> {catalog.destination}
                         </div>
                         <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                           {catalog.description || 'Um roteiro incrível preparado especialmente para você aproveitar o melhor deste destino.'}
                         </p>
                         
                         <div className="flex items-center justify-between mt-auto">
                            <div className="flex -space-x-1">
                               <span className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center outline-none" title={`${catalog.duration_days} dias`}>
                                 <span className="text-xs font-bold text-gray-600">{catalog.duration_days}D</span>
                               </span>
                            </div>
                            <button 
                              onClick={() => onSelectCatalog(catalog)}
                              className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-rose-500 transition-colors shadow-md flex items-center gap-2"
                            >
                              <i className="ri-arrow-right-line"></i> Usar
                            </button>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                  {processedCatalogs.map(catalog => (
                    <div key={catalog.id} className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col sm:flex-row shadow-sm">
                       {/* Left Image Side List View */}
                       <div className="w-full sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden flex-shrink-0">
                          {catalog.image_url ? (
                             <img src={catalog.image_url} alt={catalog.title} className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center opacity-30">
                               <i className="ri-landscape-line text-6xl text-white"></i>
                             </div>
                          )}
                          <div className="absolute top-3 left-3">
                             <span className="inline-block px-2 py-1 bg-black/40 backdrop-blur-md rounded text-xs font-bold text-white uppercase tracking-wider">
                              {catalog.category || 'Geral'}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-gray-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                             <i className="ri-calendar-event-line text-blue-500"></i> {catalog.duration_days} dias
                          </div>
                       </div>
                       
                       {/* Right Content Side List View */}
                       <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                         <div className="flex justify-between items-start mb-1">
                            <div>
                               <h4 className="text-gray-900 font-bold text-lg leading-tight mb-1">{catalog.title}</h4>
                               <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 mb-2">
                                 <i className="ri-map-pin-line"></i> {catalog.destination}
                               </div>
                            </div>
                         </div>
                         <p className="text-sm text-gray-500 line-clamp-2 w-full sm:max-w-xl">
                           {catalog.description || 'Um roteiro incrível preparado especialmente para você aproveitar o melhor deste destino.'}
                         </p>
                       </div>

                       {/* Action Button Side */}
                       <div className="p-4 border-t sm:border-t-0 sm:border-l border-gray-100 flex items-center justify-end sm:justify-center bg-gray-50/50 sm:w-40 flex-shrink-0">
                           <button 
                              onClick={() => onSelectCatalog(catalog)}
                              className="px-6 py-2.5 w-full bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-rose-500 hover:-translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <i className="ri-arrow-right-line"></i> Usar Roteiro
                            </button>
                       </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
