import { useState } from 'react';
import PackageDetailModal from './PackageDetailModal';

export default function PackagesTab() {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const packages = [
    {
      id: 1,
      destination: 'Paris Romântica',
      country: 'França',
      days: 7,
      nights: 6,
      price: 8500,
      originalPrice: 12000,
      image: 'https://readdy.ai/api/search-image?query=romantic%20paris%20eiffel%20tower%20sunset%20beautiful%20cityscape%20with%20warm%20golden%20light%20and%20clear%20sky%20elegant%20architecture%20dreamy%20atmosphere%20professional%20travel%20photography%20high%20quality%20stunning%20view&width=800&height=500&seq=pkg1&orientation=landscape',
      rating: 4.9,
      reviews: 342,
      includes: [
        'Passagens aéreas ida e volta',
        '6 noites em hotel 4 estrelas',
        'Café da manhã incluído',
        'Transfer aeroporto-hotel-aeroporto',
        'City tour em Paris',
        'Ingresso para Torre Eiffel',
        'Cruzeiro no Rio Sena',
        'Visita ao Museu do Louvre',
        'Seguro viagem',
        'Guia em português'
      ],
      highlights: [
        'Subida à Torre Eiffel com vista panorâmica',
        'Jantar romântico em restaurante francês',
        'Passeio de barco pelo Rio Sena ao pôr do sol',
        'Visita guiada ao Palácio de Versalhes',
        'Tempo livre para compras na Champs-Élysées',
        'Degustação de vinhos e queijos franceses'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Chegada em Paris',
          description: 'Chegada ao aeroporto Charles de Gaulle, transfer para o hotel e check-in.',
          activities: [
            '14:00 - Check-in no hotel',
            '16:00 - Tempo livre para explorar o bairro',
            '19:00 - Jantar de boas-vindas'
          ]
        },
        {
          day: 2,
          title: 'Paris Clássica',
          description: 'City tour pelos principais pontos turísticos de Paris.',
          activities: [
            '09:00 - Visita à Torre Eiffel',
            '12:00 - Almoço em restaurante típico',
            '14:00 - Arco do Triunfo e Champs-Élysées',
            '17:00 - Cruzeiro no Rio Sena'
          ]
        },
        {
          day: 3,
          title: 'Arte e Cultura',
          description: 'Dia dedicado aos museus e cultura parisiense.',
          activities: [
            '09:00 - Museu do Louvre',
            '13:00 - Almoço no Quartier Latin',
            '15:00 - Catedral de Notre-Dame',
            '17:00 - Bairro de Montmartre'
          ]
        },
        {
          day: 4,
          title: 'Versalhes',
          description: 'Excursão ao magnífico Palácio de Versalhes.',
          activities: [
            '08:00 - Saída para Versalhes',
            '10:00 - Visita ao Palácio',
            '13:00 - Almoço nos jardins',
            '15:00 - Jardins de Versalhes',
            '18:00 - Retorno a Paris'
          ]
        },
        {
          day: 5,
          title: 'Dia Livre',
          description: 'Dia livre para explorar Paris no seu ritmo.',
          activities: [
            'Sugestões: Disneyland Paris, Museu d\'Orsay, Shopping',
            'Degustação de vinhos (opcional)',
            'Jantar em restaurante Michelin (opcional)'
          ]
        },
        {
          day: 6,
          title: 'Últimas Descobertas',
          description: 'Últimas compras e experiências parisienses.',
          activities: [
            '10:00 - Mercado de pulgas (opcional)',
            '14:00 - Compras na Galeries Lafayette',
            '19:00 - Jantar de despedida'
          ]
        },
        {
          day: 7,
          title: 'Retorno',
          description: 'Check-out e transfer para o aeroporto.',
          activities: [
            '10:00 - Check-out do hotel',
            '12:00 - Transfer para o aeroporto',
            'Voo de retorno'
          ]
        }
      ],
      hotels: [
        {
          name: 'Hotel Le Marais Boutique',
          stars: 4,
          nights: 6
        }
      ],
      flights: {
        departure: 'São Paulo (GRU)',
        arrival: 'Paris (CDG)',
        airline: 'Air France'
      }
    },
    {
      id: 2,
      name: 'Tóquio Completo',
      destination: 'Tóquio, Japão',
      duration: '10 dias / 9 noites',
      image: 'https://readdy.ai/api/search-image?query=Tokyo%20Japan%20travel%20package%20Mount%20Fuji%20cherry%20blossoms%20modern%20city%20traditional%20culture%20vibrant&width=500&height=350&seq=package2&orientation=landscape',
      price: 12800,
      includes: ['Passagens aéreas', 'Hotel 5 estrelas', 'Café da manhã', 'JR Pass', 'Guia em português'],
      highlights: ['Monte Fuji', 'Templos', 'Shibuya', 'Kyoto'],
      rating: 4.8,
      reviews: 289
    },
    {
      id: 3,
      name: 'Caribe All Inclusive',
      destination: 'Cancún, México',
      duration: '5 dias / 4 noites',
      image: 'https://readdy.ai/api/search-image?query=Caribbean%20beach%20resort%20all%20inclusive%20turquoise%20water%20white%20sand%20palm%20trees%20luxury%20vacation&width=500&height=350&seq=package3&orientation=landscape',
      price: 6200,
      includes: ['Passagens aéreas', 'Resort All Inclusive', 'Bebidas ilimitadas', 'Atividades aquáticas'],
      highlights: ['Praias paradisíacas', 'Mergulho', 'Festas'],
      rating: 4.7,
      reviews: 521
    },
    {
      id: 4,
      name: 'Europa Clássica',
      destination: 'Paris, Roma, Londres',
      duration: '15 dias / 14 noites',
      image: 'https://readdy.ai/api/search-image?query=European%20cities%20tour%20Paris%20Rome%20London%20iconic%20landmarks%20travel%20package%20cultural%20experience&width=500&height=350&seq=package4&orientation=landscape',
      price: 18900,
      includes: ['Passagens aéreas', 'Hotéis 4 estrelas', 'Café da manhã', 'Trem entre cidades', 'City tours'],
      highlights: ['3 países', '10 cidades', 'Guia em português'],
      rating: 4.9,
      reviews: 412
    },
    {
      id: 5,
      name: 'Dubai Luxo',
      destination: 'Dubai, Emirados Árabes',
      duration: '6 dias / 5 noites',
      image: 'https://readdy.ai/api/search-image?query=Dubai%20luxury%20travel%20package%20Burj%20Khalifa%20modern%20architecture%20golden%20sunset%20futuristic%20skyline&width=500&height=350&seq=package5&orientation=landscape',
      price: 9800,
      includes: ['Passagens aéreas', 'Hotel 5 estrelas', 'Café da manhã', 'Safari no deserto', 'Burj Khalifa'],
      highlights: ['Burj Khalifa', 'Safari', 'Compras'],
      rating: 4.8,
      reviews: 267
    },
    {
      id: 6,
      name: 'Machu Picchu Aventura',
      destination: 'Cusco, Peru',
      duration: '8 dias / 7 noites',
      image: 'https://readdy.ai/api/search-image?query=Machu%20Picchu%20Peru%20adventure%20travel%20package%20ancient%20ruins%20mountains%20mystical%20landscape&width=500&height=350&seq=package6&orientation=landscape',
      price: 7400,
      includes: ['Passagens aéreas', 'Hotel 4 estrelas', 'Café da manhã', 'Trilha Inca', 'Guia especializado'],
      highlights: ['Machu Picchu', 'Vale Sagrado', 'Cusco'],
      rating: 4.9,
      reviews: 398
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-gift-line text-3xl"></i>
          <h2 className="text-2xl font-bold">Pacotes de Viagens</h2>
        </div>
        <p className="text-white/90">Pacotes completos com tudo incluído para você viajar sem preocupações</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium whitespace-nowrap">
            Todos
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            Europa
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            Ásia
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            América
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg)}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="relative w-full h-56">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Pacote Completo
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
              <p className="text-gray-600 mb-3 flex items-center gap-2">
                <i className="ri-map-pin-line"></i>
                {pkg.destination}
              </p>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  {pkg.duration}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-star-fill text-yellow-500"></i>
                  {pkg.rating} ({pkg.reviews})
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Inclui:</p>
                <div className="flex flex-wrap gap-2">
                  {pkg.includes.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs">
                      {item}
                    </span>
                  ))}
                  {pkg.includes.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                      +{pkg.includes.length - 3} mais
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">A partir de</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {pkg.price.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedPackage(pkg)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <PackageDetailModal
          package={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
}
