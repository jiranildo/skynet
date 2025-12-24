import { useState } from 'react';

export default function OffersTab() {
  const offers = [
    {
      id: 1,
      type: 'Passagem',
      destination: 'Paris, França',
      image: 'https://readdy.ai/api/search-image?query=Paris%20Eiffel%20Tower%20romantic%20sunset%20special%20offer%20travel%20deal%20beautiful%20pink%20sky&width=400&height=300&seq=offer1&orientation=landscape',
      originalPrice: 4500,
      discountPrice: 2890,
      discount: 36,
      validUntil: '31 Dez 2024',
      description: 'Ida e volta com bagagem incluída'
    },
    {
      id: 2,
      type: 'Hotel',
      destination: 'Cancún, México',
      image: 'https://readdy.ai/api/search-image?query=Cancun%20beach%20resort%20luxury%20hotel%20special%20offer%20turquoise%20water%20white%20sand%20paradise&width=400&height=300&seq=offer2&orientation=landscape',
      originalPrice: 3200,
      discountPrice: 1990,
      discount: 38,
      validUntil: '15 Jan 2025',
      description: '5 noites com café da manhã'
    },
    {
      id: 3,
      type: 'Pacote',
      destination: 'Dubai, EAU',
      image: 'https://readdy.ai/api/search-image?query=Dubai%20Burj%20Khalifa%20luxury%20travel%20package%20special%20offer%20modern%20architecture%20golden%20sunset&width=400&height=300&seq=offer3&orientation=landscape',
      originalPrice: 12800,
      discountPrice: 8490,
      discount: 34,
      validUntil: '20 Fev 2025',
      description: '7 dias com hotel 5 estrelas e passeios'
    },
    {
      id: 4,
      type: 'Cruzeiro',
      destination: 'Caribe',
      image: 'https://readdy.ai/api/search-image?query=Caribbean%20cruise%20ship%20luxury%20vacation%20special%20offer%20turquoise%20water%20tropical%20islands&width=400&height=300&seq=offer4&orientation=landscape',
      originalPrice: 9800,
      discountPrice: 6290,
      discount: 36,
      validUntil: '10 Mar 2025',
      description: '8 dias visitando 5 ilhas'
    },
    {
      id: 5,
      type: 'Passagem',
      destination: 'Nova York, EUA',
      image: 'https://readdy.ai/api/search-image?query=New%20York%20City%20skyline%20special%20offer%20travel%20deal%20Manhattan%20buildings%20urban%20landscape&width=400&height=300&seq=offer5&orientation=landscape',
      originalPrice: 3800,
      discountPrice: 2490,
      discount: 34,
      validUntil: '05 Jan 2025',
      description: 'Ida e volta direto'
    },
    {
      id: 6,
      type: 'Hotel',
      destination: 'Maldivas',
      image: 'https://readdy.ai/api/search-image?query=Maldives%20overwater%20villa%20luxury%20resort%20special%20offer%20crystal%20clear%20water%20tropical%20paradise&width=400&height=300&seq=offer6&orientation=landscape',
      originalPrice: 15800,
      discountPrice: 9990,
      discount: 37,
      validUntil: '28 Fev 2025',
      description: '6 noites em bangalô sobre a água'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-price-tag-3-line text-3xl"></i>
          <h2 className="text-2xl font-bold">Ofertas Especiais</h2>
        </div>
        <p className="text-white/90">Aproveite descontos incríveis em passagens, hotéis e pacotes!</p>
      </div>

      {/* Countdown Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">⚡ Flash Sale</h3>
            <p className="text-white/90">Ofertas por tempo limitado!</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs">Horas</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">34</p>
              <p className="text-xs">Min</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">56</p>
              <p className="text-xs">Seg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3 overflow-x-auto">
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium whitespace-nowrap">
            Todas
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            Passagens
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            Hotéis
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            Pacotes
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            Cruzeiros
          </button>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative w-full h-48">
              <img
                src={offer.image}
                alt={offer.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                -{offer.discount}%
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                {offer.type}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{offer.destination}</h3>
              <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500 line-through">
                  R$ {offer.originalPrice.toLocaleString()}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  R$ {offer.discountPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  Até {offer.validUntil}
                </span>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap">
                  Aproveitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <i className="ri-mail-line text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Receba ofertas exclusivas!</h3>
            <p className="text-gray-700 mb-4">
              Cadastre seu e-mail e seja o primeiro a saber sobre nossas promoções especiais.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
