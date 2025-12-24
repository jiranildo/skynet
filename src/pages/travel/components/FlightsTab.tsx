import { useState } from 'react';

export default function FlightsTab() {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway' | 'multicity'>('roundtrip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState('economy');

  const popularRoutes = [
    { from: 'São Paulo', to: 'Rio de Janeiro', price: 'R$ 280', airline: 'GOL', duration: '1h 10m', image: 'https://readdy.ai/api/search-image?query=airplane%20flying%20over%20Rio%20de%20Janeiro%20Christ%20the%20Redeemer%20statue%2C%20aerial%20view%2C%20beautiful%20coastal%20city%2C%20travel%20photography&width=300&height=200&seq=flight1&orientation=landscape' },
    { from: 'São Paulo', to: 'Miami', price: 'R$ 2.450', airline: 'LATAM', duration: '8h 30m', image: 'https://readdy.ai/api/search-image?query=airplane%20flying%20over%20Miami%20beach%20coastline%2C%20turquoise%20ocean%2C%20aerial%20view%2C%20sunny%20day%2C%20travel%20destination&width=300&height=200&seq=flight2&orientation=landscape' },
    { from: 'Rio de Janeiro', to: 'Lisboa', price: 'R$ 3.200', airline: 'TAP', duration: '9h 45m', image: 'https://readdy.ai/api/search-image?query=airplane%20flying%20over%20Lisbon%20Portugal%2C%20historic%20city%20with%20red%20roofs%2C%20Tagus%20river%2C%20European%20architecture%2C%20aerial%20photography&width=300&height=200&seq=flight3&orientation=landscape' },
    { from: 'Brasília', to: 'Buenos Aires', price: 'R$ 1.850', airline: 'Aerolíneas', duration: '3h 20m', image: 'https://readdy.ai/api/search-image?query=airplane%20flying%20over%20Buenos%20Aires%20Argentina%2C%20modern%20city%20skyline%2C%20urban%20landscape%2C%20South%20American%20capital%2C%20aerial%20view&width=300&height=200&seq=flight4&orientation=landscape' },
  ];

  const airlines = [
    { name: 'GOL', logo: 'ri-plane-line', color: 'text-orange-500' },
    { name: 'LATAM', logo: 'ri-plane-line', color: 'text-red-500' },
    { name: 'Azul', logo: 'ri-plane-line', color: 'text-blue-500' },
    { name: 'TAP', logo: 'ri-plane-line', color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        {/* Trip Type */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTripType('roundtrip')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tripType === 'roundtrip'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ida e volta
          </button>
          <button
            onClick={() => setTripType('oneway')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tripType === 'oneway'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Só ida
          </button>
          <button
            onClick={() => setTripType('multicity')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tripType === 'multicity'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Múltiplos destinos
          </button>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">De onde?</label>
            <div className="relative">
              <i className="ri-flight-takeoff-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Cidade ou aeroporto"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Para onde?</label>
            <div className="relative">
              <i className="ri-flight-land-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Cidade ou aeroporto"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de ida</label>
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
          {tripType === 'roundtrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de volta</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passageiros</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'passageiro' : 'passageiros'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['economy', 'premium', 'business', 'first'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFlightClass(cls)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  flightClass === cls
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cls === 'economy' && 'Econômica'}
                {cls === 'premium' && 'Premium'}
                {cls === 'business' && 'Executiva'}
                {cls === 'first' && 'Primeira'}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
          <i className="ri-search-line mr-2"></i>
          Buscar voos
        </button>
      </div>

      {/* Airlines */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Companhias aéreas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {airlines.map((airline, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center`}>
                <i className={`${airline.logo} text-2xl ${airline.color}`}></i>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">{airline.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rotas populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularRoutes.map((route, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex">
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={route.image}
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{route.from}</span>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                    <span className="font-bold text-gray-900">{route.to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <i className="ri-plane-line"></i>
                    <span>{route.airline}</span>
                    <span>•</span>
                    <span>{route.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-500">{route.price}</span>
                    <button className="px-4 py-1.5 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors whitespace-nowrap">
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
