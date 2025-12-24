import { useState } from 'react';

export default function CruisesTab() {
  const [selectedCruise, setSelectedCruise] = useState<any>(null);

  const cruises = [
    {
      id: 1,
      name: 'Caribe Tropical',
      ship: 'MSC Seaside',
      image: 'https://readdy.ai/api/search-image?query=luxury%20cruise%20ship%20Caribbean%20turquoise%20water%20tropical%20islands%20paradise%20vacation&width=500&height=350&seq=cruise1&orientation=landscape',
      duration: '8 dias / 7 noites',
      ports: ['Miami', 'Cozumel', 'Jamaica', 'Bahamas'],
      price: 6890,
      includes: ['All Inclusive', 'Entretenimento', 'Piscinas', 'Restaurantes'],
      rating: 4.8,
      reviews: 432
    },
    {
      id: 2,
      name: 'Mediterrâneo Clássico',
      ship: 'Royal Caribbean',
      image: 'https://readdy.ai/api/search-image?query=Mediterranean%20cruise%20ship%20luxury%20vacation%20Greek%20islands%20blue%20water%20coastal%20cities&width=500&height=350&seq=cruise2&orientation=landscape',
      duration: '12 dias / 11 noites',
      ports: ['Barcelona', 'Roma', 'Atenas', 'Santorini', 'Veneza'],
      price: 12490,
      includes: ['All Inclusive', 'Excursões', 'Shows', 'Spa'],
      rating: 4.9,
      reviews: 567
    },
    {
      id: 3,
      name: 'Fjords Noruegueses',
      ship: 'Norwegian Cruise Line',
      image: 'https://readdy.ai/api/search-image?query=Norway%20fjords%20cruise%20ship%20dramatic%20mountains%20waterfalls%20scenic%20Nordic%20landscape&width=500&height=350&seq=cruise3&orientation=landscape',
      duration: '10 dias / 9 noites',
      ports: ['Oslo', 'Bergen', 'Geiranger', 'Stavanger'],
      price: 9890,
      includes: ['All Inclusive', 'Aurora Boreal', 'Excursões', 'Gastronomia'],
      rating: 4.9,
      reviews: 389
    },
    {
      id: 4,
      name: 'Litoral Brasileiro',
      ship: 'Costa Cruzeiros',
      image: 'https://readdy.ai/api/search-image?query=Brazil%20coast%20cruise%20ship%20tropical%20beaches%20Rio%20de%20Janeiro%20beautiful%20coastline&width=500&height=350&seq=cruise4&orientation=landscape',
      duration: '7 dias / 6 noites',
      ports: ['Santos', 'Rio de Janeiro', 'Búzios', 'Salvador'],
      price: 4290,
      includes: ['Pensão Completa', 'Entretenimento', 'Piscinas'],
      rating: 4.6,
      reviews: 298
    },
    {
      id: 5,
      name: 'Alasca Selvagem',
      ship: 'Princess Cruises',
      image: 'https://readdy.ai/api/search-image?query=Alaska%20cruise%20ship%20glaciers%20mountains%20wildlife%20pristine%20nature%20adventure&width=500&height=350&seq=cruise5&orientation=landscape',
      duration: '9 dias / 8 noites',
      ports: ['Seattle', 'Juneau', 'Skagway', 'Glacier Bay'],
      price: 11290,
      includes: ['All Inclusive', 'Observação de Baleias', 'Glaciares', 'Natureza'],
      rating: 4.8,
      reviews: 445
    },
    {
      id: 6,
      name: 'Ilhas Gregas',
      ship: 'Celebrity Cruises',
      image: 'https://readdy.ai/api/search-image?query=Greek%20islands%20cruise%20ship%20white%20buildings%20blue%20domes%20Aegean%20Sea%20Mediterranean%20beauty&width=500&height=350&seq=cruise6&orientation=landscape',
      duration: '8 dias / 7 noites',
      ports: ['Atenas', 'Mykonos', 'Santorini', 'Creta', 'Rhodes'],
      price: 8690,
      includes: ['All Inclusive', 'Excursões', 'Gastronomia Grega'],
      rating: 4.9,
      reviews: 521
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-ship-line text-3xl"></i>
          <h2 className="text-2xl font-bold">Cruzeiros</h2>
        </div>
        <p className="text-white/90">Navegue pelos mares mais belos do mundo com todo conforto</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none">
              <option>Caribe</option>
              <option>Mediterrâneo</option>
              <option>Fjords</option>
              <option>Alasca</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none">
              <option>Qualquer</option>
              <option>5-7 dias</option>
              <option>8-10 dias</option>
              <option>11+ dias</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap">
          Buscar cruzeiros
        </button>
      </div>

      {/* Cruises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cruises.map((cruise) => (
          <div
            key={cruise.id}
            onClick={() => setSelectedCruise(cruise)}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="relative w-full h-56">
              <img
                src={cruise.image}
                alt={cruise.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {cruise.ship}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{cruise.name}</h3>
              <p className="text-gray-600 mb-3 flex items-center gap-2">
                <i className="ri-calendar-line"></i>
                {cruise.duration}
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Portos:</p>
                <div className="flex flex-wrap gap-2">
                  {cruise.ports.map((port, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                      {port}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Inclui:</p>
                <div className="flex flex-wrap gap-2">
                  {cruise.includes.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <i className="ri-star-fill"></i>
                  <span className="text-sm font-semibold text-gray-900">{cruise.rating}</span>
                </div>
                <span className="text-sm text-gray-600">({cruise.reviews} avaliações)</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">A partir de</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {cruise.price.toLocaleString()}</p>
                </div>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap">
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cruise Detail Modal */}
      {selectedCruise && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCruise(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-72">
              <img
                src={selectedCruise.image}
                alt={selectedCruise.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedCruise(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCruise.name}</h2>
              <p className="text-lg text-gray-600 mb-4">{selectedCruise.ship}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Duração</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCruise.duration}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Avaliação</p>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-500"></i>
                    {selectedCruise.rating} ({selectedCruise.reviews})
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Roteiro</h3>
                <div className="space-y-2">
                  {selectedCruise.ports.map((port: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-gray-900">{port}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">O que está incluído</h3>
                <div className="space-y-2">
                  {selectedCruise.includes.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-green-500"></i>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Preço por pessoa</p>
                  <p className="text-3xl font-bold text-gray-900">R$ {selectedCruise.price.toLocaleString()}</p>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap">
                  Reservar agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
