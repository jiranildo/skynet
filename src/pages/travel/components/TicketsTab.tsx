import { useState } from 'react';

export default function TicketsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: 'ri-ticket-line' },
    { id: 'attractions', name: 'Atrações', icon: 'ri-camera-line' },
    { id: 'tours', name: 'Tours', icon: 'ri-map-line' },
    { id: 'shows', name: 'Shows', icon: 'ri-music-line' },
    { id: 'sports', name: 'Esportes', icon: 'ri-football-line' },
    { id: 'museums', name: 'Museus', icon: 'ri-building-2-line' },
  ];

  const experiences = [
    {
      title: 'Cristo Redentor + Pão de Açúcar',
      location: 'Rio de Janeiro, RJ',
      duration: '8 horas',
      rating: 4.9,
      reviews: 3421,
      price: 280,
      image: 'https://readdy.ai/api/search-image?query=Christ%20the%20Redeemer%20statue%20in%20Rio%20de%20Janeiro%20with%20panoramic%20city%20view%2C%20blue%20sky%2C%20iconic%20landmark%2C%20tourist%20attraction&width=400&height=300&seq=ticket1&orientation=landscape',
      category: 'attractions',
      includes: ['Guia', 'Transporte', 'Ingressos']
    },
    {
      title: 'Cataratas do Iguaçu - Tour Completo',
      location: 'Foz do Iguaçu, PR',
      duration: '6 horas',
      rating: 4.8,
      reviews: 2156,
      price: 320,
      image: 'https://readdy.ai/api/search-image?query=Iguazu%20Falls%20waterfall%20with%20rainbow%2C%20lush%20green%20jungle%2C%20powerful%20water%20cascade%2C%20natural%20wonder%2C%20breathtaking%20view&width=400&height=300&seq=ticket2&orientation=landscape',
      category: 'tours',
      includes: ['Guia', 'Transporte', 'Almoço']
    },
    {
      title: 'Ingresso Parque Beto Carrero',
      location: 'Penha, SC',
      duration: 'Dia inteiro',
      rating: 4.7,
      reviews: 5234,
      price: 180,
      image: 'https://readdy.ai/api/search-image?query=colorful%20amusement%20park%20with%20roller%20coasters%20and%20attractions%2C%20family%20entertainment%2C%20theme%20park%2C%20fun%20rides%2C%20blue%20sky&width=400&height=300&seq=ticket3&orientation=landscape',
      category: 'attractions',
      includes: ['Acesso total', 'Brinquedos ilimitados']
    },
    {
      title: 'Show de Tango em Buenos Aires',
      location: 'Buenos Aires, Argentina',
      duration: '3 horas',
      rating: 4.9,
      reviews: 1876,
      price: 420,
      image: 'https://readdy.ai/api/search-image?query=elegant%20tango%20dancers%20performing%20on%20stage%2C%20dramatic%20red%20lighting%2C%20Argentine%20culture%2C%20passionate%20dance%20show%2C%20theatrical%20atmosphere&width=400&height=300&seq=ticket4&orientation=landscape',
      category: 'shows',
      includes: ['Show', 'Jantar', 'Bebidas']
    },
    {
      title: 'Museu do Amanhã + AquaRio',
      location: 'Rio de Janeiro, RJ',
      duration: '5 horas',
      rating: 4.6,
      reviews: 1432,
      price: 150,
      image: 'https://readdy.ai/api/search-image?query=futuristic%20modern%20museum%20architecture%20with%20reflective%20surfaces%2C%20contemporary%20design%2C%20waterfront%20location%2C%20innovative%20building&width=400&height=300&seq=ticket5&orientation=landscape',
      category: 'museums',
      includes: ['Ingressos', 'Audioguia']
    },
    {
      title: 'Passeio de Balão - Boituva',
      location: 'Boituva, SP',
      duration: '4 horas',
      rating: 5.0,
      reviews: 892,
      price: 650,
      image: 'https://readdy.ai/api/search-image?query=colorful%20hot%20air%20balloons%20floating%20over%20countryside%20at%20sunrise%2C%20peaceful%20landscape%2C%20adventure%20activity%2C%20golden%20hour%20light&width=400&height=300&seq=ticket6&orientation=landscape',
      category: 'tours',
      includes: ['Voo', 'Café', 'Certificado']
    },
    {
      title: 'Jogo do Flamengo - Maracanã',
      location: 'Rio de Janeiro, RJ',
      duration: '3 horas',
      rating: 4.8,
      reviews: 2341,
      price: 220,
      image: 'https://readdy.ai/api/search-image?query=packed%20football%20stadium%20at%20night%20with%20bright%20lights%2C%20excited%20crowd%2C%20Brazilian%20soccer%20match%20atmosphere%2C%20Maracana%20stadium&width=400&height=300&seq=ticket7&orientation=landscape',
      category: 'sports',
      includes: ['Ingresso', 'Setor especial']
    },
    {
      title: 'Pinacoteca de São Paulo',
      location: 'São Paulo, SP',
      duration: '3 horas',
      rating: 4.7,
      reviews: 1123,
      price: 80,
      image: 'https://readdy.ai/api/search-image?query=elegant%20art%20museum%20interior%20with%20classical%20paintings%2C%20gallery%20space%2C%20cultural%20institution%2C%20sophisticated%20atmosphere%2C%20natural%20lighting&width=400&height=300&seq=ticket8&orientation=landscape',
      category: 'museums',
      includes: ['Ingresso', 'Exposições']
    },
    {
      title: 'Mergulho em Fernando de Noronha',
      location: 'Fernando de Noronha, PE',
      duration: '4 horas',
      rating: 5.0,
      reviews: 756,
      price: 480,
      image: 'https://readdy.ai/api/search-image?query=underwater%20diving%20scene%20with%20colorful%20tropical%20fish%20and%20coral%20reef%2C%20crystal%20clear%20turquoise%20water%2C%20marine%20life%2C%20scuba%20diving&width=400&height=300&seq=ticket9&orientation=landscape',
      category: 'tours',
      includes: ['Equipamento', 'Instrutor', 'Fotos']
    },
  ];

  const filteredExperiences = selectedCategory === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar experiências, shows, atrações..."
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none text-base"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Categorias</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-pink-500'
              }`}
            >
              <i className={category.icon}></i>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Experiences Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredExperiences.length} experiências encontradas
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none">
            <option>Recomendados</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
            <option>Melhor avaliação</option>
            <option>Mais populares</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiences.map((experience, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative w-full h-48">
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <i className="ri-heart-line text-lg text-gray-700"></i>
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                    {experience.duration}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{experience.title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <i className="ri-map-pin-line text-xs"></i>
                  <span className="line-clamp-1">{experience.location}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-pink-50 rounded-lg">
                    <i className="ri-star-fill text-pink-500 text-xs"></i>
                    <span className="text-sm font-bold text-pink-500">{experience.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({experience.reviews} avaliações)</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {experience.includes.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">A partir de</p>
                    <p className="text-xl font-bold text-gray-900">R$ {experience.price}</p>
                    <p className="text-xs text-gray-500">por pessoa</p>
                  </div>
                  <button className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors whitespace-nowrap">
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Destinations Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-gift-line text-2xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Oferta especial!</h3>
            <p className="text-white/90 text-sm leading-relaxed mb-3">
              Reserve 3 ou mais experiências e ganhe 15% de desconto no total da sua compra. 
              Válido para reservas feitas até o final do mês.
            </p>
            <button className="px-6 py-2 bg-white text-pink-500 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap">
              Aproveitar oferta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
