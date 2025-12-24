import { useState } from 'react';

export default function CarsTab() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [sameLocation, setSameLocation] = useState(true);

  const cars = [
    {
      name: 'Fiat Argo',
      category: 'Econômico',
      passengers: 5,
      bags: 2,
      transmission: 'Manual',
      ac: true,
      price: 89,
      company: 'Localiza',
      image: 'https://readdy.ai/api/search-image?query=modern%20compact%20red%20car%20on%20clean%20white%20background%2C%20side%20view%2C%20economy%20vehicle%2C%20studio%20lighting%2C%20car%20rental%20photography&width=300&height=200&seq=car1&orientation=landscape',
      rating: 4.5
    },
    {
      name: 'Volkswagen Polo',
      category: 'Compacto',
      passengers: 5,
      bags: 3,
      transmission: 'Automático',
      ac: true,
      price: 125,
      company: 'Movida',
      image: 'https://readdy.ai/api/search-image?query=silver%20compact%20sedan%20car%20on%20white%20background%2C%20side%20view%2C%20modern%20design%2C%20automatic%20transmission%2C%20rental%20car&width=300&height=200&seq=car2&orientation=landscape',
      rating: 4.6
    },
    {
      name: 'Toyota Corolla',
      category: 'Sedan',
      passengers: 5,
      bags: 4,
      transmission: 'Automático',
      ac: true,
      price: 180,
      company: 'Unidas',
      image: 'https://readdy.ai/api/search-image?query=elegant%20white%20sedan%20car%20on%20clean%20background%2C%20side%20view%2C%20executive%20vehicle%2C%20premium%20rental%20car%2C%20professional%20photography&width=300&height=200&seq=car3&orientation=landscape',
      rating: 4.8
    },
    {
      name: 'Jeep Compass',
      category: 'SUV',
      passengers: 5,
      bags: 5,
      transmission: 'Automático',
      ac: true,
      price: 250,
      company: 'Localiza',
      image: 'https://readdy.ai/api/search-image?query=black%20SUV%20car%20on%20white%20background%2C%20side%20view%2C%20spacious%20family%20vehicle%2C%20adventure%20ready%2C%20modern%20design&width=300&height=200&seq=car4&orientation=landscape',
      rating: 4.7
    },
    {
      name: 'Chevrolet Onix',
      category: 'Econômico',
      passengers: 5,
      bags: 2,
      transmission: 'Manual',
      ac: true,
      price: 79,
      company: 'Movida',
      image: 'https://readdy.ai/api/search-image?query=blue%20compact%20hatchback%20car%20on%20clean%20background%2C%20side%20view%2C%20budget%20friendly%20vehicle%2C%20city%20car%2C%20rental%20photography&width=300&height=200&seq=car5&orientation=landscape',
      rating: 4.4
    },
    {
      name: 'Honda HR-V',
      category: 'SUV Compacto',
      passengers: 5,
      bags: 4,
      transmission: 'Automático',
      ac: true,
      price: 220,
      company: 'Unidas',
      image: 'https://readdy.ai/api/search-image?query=gray%20compact%20SUV%20on%20white%20background%2C%20side%20view%2C%20versatile%20crossover%20vehicle%2C%20modern%20styling%2C%20rental%20car&width=300&height=200&seq=car6&orientation=landscape',
      rating: 4.7
    },
  ];

  const rentalCompanies = [
    { name: 'Localiza', logo: 'ri-car-line', color: 'text-green-500' },
    { name: 'Movida', logo: 'ri-car-line', color: 'text-blue-500' },
    { name: 'Unidas', logo: 'ri-car-line', color: 'text-orange-500' },
    { name: 'Hertz', logo: 'ri-car-line', color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameLocation}
              onChange={(e) => setSameLocation(e.target.checked)}
              className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Devolver no mesmo local</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Local de retirada</label>
            <div className="relative">
              <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Cidade ou aeroporto"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          {!sameLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Local de devolução</label>
              <div className="relative">
                <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Cidade ou aeroporto"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de retirada</label>
            <input
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de devolução</label>
            <input
              type="datetime-local"
              value={dropoffDate}
              onChange={(e) => setDropoffDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
          <i className="ri-search-line mr-2"></i>
          Buscar carros
        </button>
      </div>

      {/* Rental Companies */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Locadoras parceiras</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rentalCompanies.map((company, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                <i className={`${company.logo} text-2xl ${company.color}`}></i>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">{company.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cars List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {cars.length} carros disponíveis
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none">
            <option>Recomendados</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
            <option>Categoria</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-contain p-4"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                    {car.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{car.name}</h3>
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    <span className="text-sm font-medium text-gray-700">{car.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{car.company}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <i className="ri-user-line"></i>
                    <span>{car.passengers} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-luggage-cart-line"></i>
                    <span>{car.bags} malas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-settings-line"></i>
                    <span>{car.transmission}</span>
                  </div>
                  {car.ac && (
                    <div className="flex items-center gap-1">
                      <i className="ri-temp-cold-line"></i>
                      <span>Ar condicionado</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">A partir de</p>
                    <p className="text-xl font-bold text-gray-900">R$ {car.price}</p>
                    <p className="text-xs text-gray-500">por dia</p>
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
    </div>
  );
}
