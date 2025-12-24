export default function SuggestionsTab() {
  const suggestions = [
    {
      id: 1,
      type: 'restaurant',
      name: 'Eleven Madison Park',
      chef: 'Daniel Humm',
      location: 'New York, EUA',
      cuisine: 'Americana Contemporânea',
      stars: 3,
      price: '€€€€',
      rating: 4.9,
      image:
        'elegant michelin three star restaurant new york fine dining modern american cuisine sophisticated interior',
      reason:
        'Baseado no seu interesse por restaurantes Michelin e culinária contemporânea',
      highlights: ['3 Estrelas Michelin', 'Top 10 Mundial', 'Experiência única'],
    },
    {
      id: 2,
      type: 'wine',
      name: 'Pétrus 2016',
      region: 'Pomerol, Bordeaux',
      grape: 'Merlot',
      vintage: 2016,
      price: '€3,200',
      rating: 5,
      image:
        'petrus wine bottle luxury bordeaux pomerol premium french wine elegant presentation dark background',
      reason:
        'Você apreciou Château Margaux e Sassicaia, este é o próximo nível',
      highlights: ['100 pontos Parker', 'Safra excepcional', 'Investimento'],
    },
    {
      id: 3,
      type: 'restaurant',
      name: 'Mirazur',
      chef: 'Mauro Colagreco',
      location: 'Menton, França',
      cuisine: 'Mediterrânea',
      stars: 3,
      price: '€€€€',
      rating: 4.9,
      image:
        'mirazur restaurant mediterranean fine dining french riviera elegant terrace sea view',
      reason:
        'Eleito melhor restaurante do mundo em 2019, combina com seu perfil',
      highlights: ['3 Estrelas Michelin', '#1 World 2019', 'Vista incrível'],
    },
    {
      id: 4,
      type: 'dish',
      name: 'Fugu Sashimi',
      restaurant: 'Usukifugu Yamadaya',
      location: 'Osaka, Japão',
      cuisine: 'Japonesa',
      price: '€180',
      rating: 5,
      image:
        'fugu sashimi japanese delicacy pufferfish elegant plating fine dining osaka traditional',
      reason:
        'Uma experiência única e exclusiva da culinária japonesa',
      highlights: ['Chef certificado', 'Experiência rara', 'Tradição milenar'],
    },
    {
      id: 5,
      type: 'drink',
      name: 'Sazerac',
      bar: 'Sazerac Bar',
      location: 'New Orleans, EUA',
      drinkCategory: 'Coquetel', // renamed to avoid duplicate key
      price: '€14',
      rating: 4.8,
      image:
        'sazerac cocktail classic new orleans drink whiskey rye elegant glass bar atmosphere',
      reason:
        'Você gostou de Old Fashioned, este é um clássico similar',
      highlights: [
        'Coquetel oficial de New Orleans',
        'História rica',
        'Sabor único',
      ],
    },
    {
      id: 6,
      type: 'wine',
      name: 'Screaming Eagle 2015',
      region: 'Napa Valley, Califórnia',
      grape: 'Cabernet Sauvignon',
      vintage: 2015,
      price: '€2,800',
      rating: 5,
      image:
        'screaming eagle wine bottle napa valley cult wine luxury california cabernet premium',
      reason: 'Um dos vinhos cult mais desejados do mundo',
      highlights: [
        'Cult wine',
        'Produção limitada',
        'Colecionável',
      ],
    },
  ];

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-2xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Sugestões Personalizadas</h3>
            <p className="text-sm text-white/90">
              Baseadas no seu histórico e preferências gastronômicas, selecionamos
              experiências que você vai adorar!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={`https://readdy.ai/api/search-image?query=${item.image}&width=600&height=450&seq=suggestion-${item.id}&orientation=landscape`}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xs font-semibold">
                Recomendado
              </div>
              {item.stars && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-yellow-600">
                  {'⭐'.repeat(item.stars)}
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                  {item.type === 'restaurant' && '🍴 Restaurante'}
                  {item.type === 'wine' && '🍷 Vinho'}
                  {item.type === 'dish' && '🍽️ Prato'}
                  {item.type === 'drink' && '🍹 Drink'}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.name}</h3>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(item.rating)
                        ? 'ri-star-fill text-yellow-400'
                        : 'ri-star-line text-gray-300'
                    }`}
                  ></i>
                ))}
                <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                <i className="ri-map-pin-line mr-1"></i>
                {item.location}
              </p>

              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <i className="ri-information-line mr-1 text-orange-500"></i>
                  {item.reason}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {item.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-orange-500">{item.price}</span>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all whitespace-nowrap">
                  Adicionar à lista
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}