import { useState } from 'react';

export default function HotelsTab() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  const hotels = [
    {
      name: 'Grand Luxury Hotel & Spa',
      location: 'Copacabana, Rio de Janeiro',
      rating: 4.8,
      reviews: 1247,
      price: 450,
      image: 'https://readdy.ai/api/search-image?query=luxury%20beachfront%20hotel%20with%20infinity%20pool%20overlooking%20ocean%2C%20modern%20architecture%2C%20palm%20trees%2C%20sunset%20sky%2C%20five%20star%20resort&width=400&height=300&seq=hotel1&orientation=landscape',
      amenities: ['Wi-Fi', 'Piscina', 'Spa', 'Restaurante'],
      stars: 5
    },
    {
      name: 'Boutique Hotel Centro',
      location: 'Centro Histórico, Salvador',
      rating: 4.6,
      reviews: 892,
      price: 280,
      image: 'https://readdy.ai/api/search-image?query=charming%20boutique%20hotel%20colonial%20architecture%2C%20colorful%20facade%2C%20historic%20district%2C%20cozy%20entrance%2C%20tropical%20plants&width=400&height=300&seq=hotel2&orientation=landscape',
      amenities: ['Wi-Fi', 'Café', 'Bar', 'Terraço'],
      stars: 4
    },
    {
      name: 'Beach Resort Paradise',
      location: 'Porto de Galinhas, Pernambuco',
      rating: 4.9,
      reviews: 2103,
      price: 680,
      image: 'https://readdy.ai/api/search-image?query=tropical%20beach%20resort%20with%20white%20sand%2C%20crystal%20clear%20water%2C%20palm%20trees%2C%20luxury%20bungalows%2C%20paradise%20setting&width=400&height=300&seq=hotel3&orientation=landscape',
      amenities: ['All Inclusive', 'Praia Privada', 'Spa', 'Kids Club'],
      stars: 5
    },
    {
      name: 'Urban Style Hotel',
      location: 'Jardins, São Paulo',
      rating: 4.5,
      reviews: 756,
      price: 320,
      image: 'https://readdy.ai/api/search-image?query=modern%20urban%20hotel%20lobby%20with%20contemporary%20design%2C%20stylish%20furniture%2C%20ambient%20lighting%2C%20business%20hotel%20interior&width=400&height=300&seq=hotel4&orientation=landscape',
      amenities: ['Wi-Fi', 'Academia', 'Business Center', 'Estacionamento'],
      stars: 4
    },
    {
      name: 'Mountain Lodge Retreat',
      location: 'Campos do Jordão, São Paulo',
      rating: 4.7,
      reviews: 634,
      price: 520,
      image: 'https://readdy.ai/api/search-image?query=cozy%20mountain%20lodge%20with%20fireplace%2C%20wooden%20interior%2C%20surrounded%20by%20pine%20trees%2C%20misty%20mountains%2C%20rustic%20luxury&width=400&height=300&seq=hotel5&orientation=landscape',
      amenities: ['Lareira', 'Trilhas', 'Restaurante', 'Spa'],
      stars: 4
    },
    {
      name: 'Eco Resort Amazônia',
      location: 'Manaus, Amazonas',
      rating: 4.8,
      reviews: 421,
      price: 590,
      image: 'https://readdy.ai/api/search-image?query=eco%20resort%20in%20Amazon%20rainforest%2C%20wooden%20bungalows%20over%20river%2C%20lush%20green%20jungle%2C%20sustainable%20tourism%2C%20nature%20lodge&width=400&height=300&seq=hotel6&orientation=landscape',
      amenities: ['Eco-friendly', 'Passeios', 'Restaurante', 'Wi-Fi'],
      stars: 4
    },
  ];

  const filters = [
    { icon: 'ri-star-line', label: '5 estrelas' },
    { icon: 'ri-swimming-pool-line', label: 'Piscina' },
    { icon: 'ri-wifi-line', label: 'Wi-Fi grátis' },
    { icon: 'ri-restaurant-line', label: 'Café da manhã' },
    { icon: 'ri-parking-line', label: 'Estacionamento' },
    { icon: 'ri-heart-pulse-line', label: 'Spa' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
            <div className="relative">
              <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Para onde você vai?"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hóspedes</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'hóspede' : 'hóspedes'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quartos</label>
            <select
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'quarto' : 'quartos'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
          <i className="ri-search-line mr-2"></i>
          Buscar hotéis
        </button>
      </div>

      {/* Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros rápidos</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter, index) => (
            <button
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-pink-500 hover:text-pink-500 transition-colors whitespace-nowrap"
            >
              <i className={filter.icon}></i>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hotels List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {hotels.length} hotéis encontrados
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none">
            <option>Recomendados</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
            <option>Melhor avaliação</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative w-full h-48">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <i className="ri-heart-line text-lg text-gray-700"></i>
                </button>
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {[...Array(hotel.stars)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400 text-sm"></i>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <i className="ri-map-pin-line text-xs"></i>
                  <span>{hotel.location}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-pink-50 rounded-lg">
                    <i className="ri-star-fill text-pink-500 text-xs"></i>
                    <span className="text-sm font-bold text-pink-500">{hotel.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({hotel.reviews} avaliações)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {hotel.amenities.slice(0, 3).map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">A partir de</p>
                    <p className="text-xl font-bold text-gray-900">R$ {hotel.price}</p>
                    <p className="text-xs text-gray-500">por noite</p>
                  </div>
                  <button className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors whitespace-nowrap">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
