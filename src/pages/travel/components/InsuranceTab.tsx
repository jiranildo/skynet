export default function InsuranceTab() {
  const insurancePlans = [
    {
      id: 1,
      name: 'Básico',
      price: 15,
      coverage: 30000,
      color: 'from-blue-400 to-cyan-500',
      features: [
        'Despesas médicas até USD 30.000',
        'Bagagem extraviada até USD 500',
        'Cancelamento de viagem',
        'Assistência 24h em português',
        'Cobertura COVID-19'
      ]
    },
    {
      id: 2,
      name: 'Completo',
      price: 28,
      coverage: 60000,
      color: 'from-purple-400 to-pink-500',
      popular: true,
      features: [
        'Despesas médicas até USD 60.000',
        'Bagagem extraviada até USD 1.200',
        'Cancelamento de viagem',
        'Assistência 24h em português',
        'Cobertura COVID-19',
        'Despesas odontológicas',
        'Atraso de voo',
        'Regresso antecipado'
      ]
    },
    {
      id: 3,
      name: 'Premium',
      price: 45,
      coverage: 100000,
      color: 'from-yellow-400 to-orange-500',
      features: [
        'Despesas médicas até USD 100.000',
        'Bagagem extraviada até USD 2.000',
        'Cancelamento de viagem',
        'Assistência 24h em português',
        'Cobertura COVID-19',
        'Despesas odontológicas',
        'Atraso de voo',
        'Regresso antecipado',
        'Esportes radicais',
        'Gestantes até 32 semanas',
        'Telemedicina ilimitada'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <i className="ri-shield-check-line text-3xl"></i>
          <h2 className="text-2xl font-bold">Seguro Viagens</h2>
        </div>
        <p className="text-white/90">Viaje com tranquilidade e proteção completa</p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Calcule seu seguro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none">
              <option>Europa</option>
              <option>América do Norte</option>
              <option>América do Sul</option>
              <option>Ásia</option>
              <option>Oceania</option>
              <option>África</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de ida</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de volta</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>
        <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap">
          Ver planos disponíveis
        </button>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Escolha seu plano</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insurancePlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden hover:shadow-lg transition-all ${
                plan.popular ? 'border-purple-500 relative' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-bold">
                  ⭐ Mais Popular
                </div>
              )}
              
              <div className="p-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white`}>
                  <i className="ri-shield-check-line text-3xl"></i>
                </div>
                
                <h4 className="text-2xl font-bold text-gray-900 text-center mb-2">{plan.name}</h4>
                
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-1">A partir de</p>
                  <p className="text-4xl font-bold text-gray-900">R$ {plan.price}</p>
                  <p className="text-sm text-gray-500">por dia</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600 text-center mb-1">Cobertura médica</p>
                  <p className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    USD {plan.coverage.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-green-500 mt-0.5 flex-shrink-0"></i>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full px-6 py-3 bg-gradient-to-r ${plan.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap`}>
                  Contratar agora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Insurance */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-question-line text-green-600"></i>
          Por que contratar um seguro viagem?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <i className="ri-hospital-line text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Emergências médicas</h4>
              <p className="text-sm text-gray-700">Cobertura para consultas, exames e internações no exterior</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <i className="ri-luggage-cart-line text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Bagagem extraviada</h4>
              <p className="text-sm text-gray-700">Indenização em caso de perda ou extravio de bagagem</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <i className="ri-calendar-close-line text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Cancelamento</h4>
              <p className="text-sm text-gray-700">Reembolso em caso de cancelamento por motivos cobertos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <i className="ri-customer-service-2-line text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Assistência 24h</h4>
              <p className="text-sm text-gray-700">Suporte em português disponível a qualquer momento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Info */}
      <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <i className="ri-alert-line text-2xl text-yellow-600 flex-shrink-0"></i>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Importante saber</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Alguns países exigem seguro viagem obrigatório (Europa, Cuba, etc.)</li>
              <li>• Contrate o seguro antes de sair do Brasil</li>
              <li>• Leia atentamente as condições gerais da apólice</li>
              <li>• Guarde os contatos de emergência do seguro</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
