export default function TransferTab() {
  const transferOptions = [
    {
      id: 1,
      type: 'Executivo',
      vehicle: 'Sedan Premium',
      image: 'https://readdy.ai/api/search-image?query=luxury%20black%20sedan%20car%20executive%20transfer%20service%20elegant%20professional&width=400&height=300&seq=transfer1&orientation=landscape',
      capacity: '3 passageiros',
      luggage: '3 malas',
      price: 180,
      features: ['Wi-Fi', 'Água', 'Ar condicionado', 'Motorista bilíngue']
    },
    {
      id: 2,
      type: 'Van',
      vehicle: 'Van Executiva',
      image: 'https://readdy.ai/api/search-image?query=luxury%20van%20minibus%20executive%20transfer%20service%20spacious%20comfortable&width=400&height=300&seq=transfer2&orientation=landscape',
      capacity: '7 passageiros',
      luggage: '7 malas',
      price: 320,
      features: ['Wi-Fi', 'Água', 'Ar condicionado', 'Espaço amplo']
    },
    {
      id: 3,
      type: 'SUV',
      vehicle: 'SUV Premium',
      image: 'https://readdy.ai/api/search-image?query=luxury%20black%20SUV%20premium%20transfer%20service%20elegant%20spacious%20comfortable&width=400&height=300&seq=transfer3&orientation=landscape',
      capacity: '5 passageiros',
      luggage: '5 malas',
      price: 250,
      features: ['Wi-Fi', 'Água', 'Ar condicionado', 'Conforto extra']
    },
    {
      id: 4,
      type: 'Econômico',
      vehicle: 'Sedan Padrão',
      image: 'https://readdy.ai/api/search-image?query=standard%20sedan%20car%20economical%20transfer%20service%20reliable%20comfortable&width=400&height=300&seq=transfer4&orientation=landscape',
      capacity: '3 passageiros',
      luggage: '2 malas',
      price: 120,
      features: ['Ar condicionado', 'Motorista profissional']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-taxi-line text-3xl"></i>
          <h2 className="text-2xl font-bold">Transfer</h2>
        </div>
        <p className="text-white/90">Transporte confortável e seguro do aeroporto ao seu destino</p>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Reserve seu transfer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Origem</label>
            <div className="relative">
              <i className="ri-flight-land-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Aeroporto de origem"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
            <div className="relative">
              <i className="ri-hotel-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Hotel ou endereço"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passageiros</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none">
              <option>1 passageiro</option>
              <option>2 passageiros</option>
              <option>3 passageiros</option>
              <option>4+ passageiros</option>
            </select>
          </div>
        </div>
        <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap">
          Buscar transfers disponíveis
        </button>
      </div>

      {/* Transfer Options */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Opções de Transfer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transferOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative w-full h-48">
                <img
                  src={option.image}
                  alt={option.vehicle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {option.type}
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-3">{option.vehicle}</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="ri-user-line"></i>
                    <span>{option.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="ri-luggage-cart-line"></i>
                    <span>{option.luggage}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Inclui:</p>
                  <div className="space-y-1">
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="ri-checkbox-circle-fill text-green-500 text-xs"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">A partir de</p>
                    <p className="text-2xl font-bold text-gray-900">R$ {option.price}</p>
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap">
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <i className="ri-information-line text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Informações importantes</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-500 mt-0.5"></i>
                <span>Motoristas profissionais e veículos vistoriados</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-500 mt-0.5"></i>
                <span>Monitoramento de voo em tempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-500 mt-0.5"></i>
                <span>Cancelamento gratuito até 24h antes</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-500 mt-0.5"></i>
                <span>Suporte 24/7 em português</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
