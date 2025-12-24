import { useState } from 'react';
import { CellarWine } from '../../../services/supabase';

interface AddWineModalProps {
  onClose: () => void;
  onAdd: (wine: CellarWine) => void;
}

export default function AddWineModal({ onClose, onAdd }: AddWineModalProps) {
  const [step, setStep] = useState<'method' | 'scan' | 'upload' | 'manual' | 'details'>('method');
  const [scanResult, setScanResult] = useState<CellarWine | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CellarWine>({
    name: '',
    producer: '',
    vintage: new Date().getFullYear(),
    type: 'red',
    region: '',
    country: '',
    grapes: '',
    section: '',
    shelf: '',
    position: '',
    quantity: 1,
    price: 0,
    rating: 0,
    food_pairing: '',
    serving_temp: '',
    decant_time: '',
    aging_potential: '',
    notes: '',
    image_url: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.type) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    onAdd(formData);
  };

  const simulateRecognition = (wineData: Partial<CellarWine>) => {
    setIsProcessing(true);
    setTimeout(() => {
      const wine = {
        ...wineData,
        section: '',
        shelf: '',
        position: '',
        notes: '',
        quantity: 1
      } as CellarWine;

      setScanResult(wine);
      setFormData(wine);
      setIsProcessing(false);
      setStep('details');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Method Selection */}
        {step === 'method' && (
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Adicionar Vinho</h2>
                <p className="text-sm text-gray-600 mt-1">Escolha como deseja adicionar</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setStep('scan')}
                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-rose-100 group-hover:from-red-500 group-hover:to-rose-500 rounded-2xl flex items-center justify-center transition-all">
                  <i className="ri-camera-line text-3xl text-red-600 group-hover:text-white transition-colors"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Escanear</h3>
                <p className="text-sm text-gray-600">Use a câmera para escanear o rótulo</p>
              </button>

              <button
                onClick={() => setStep('upload')}
                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-500 group-hover:to-orange-500 rounded-2xl flex items-center justify-center transition-all">
                  <i className="ri-image-line text-3xl text-amber-600 group-hover:text-white transition-colors"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Upload</h3>
                <p className="text-sm text-gray-600">Envie uma foto do rótulo</p>
              </button>

              <button
                onClick={() => setStep('manual')}
                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-500 group-hover:to-pink-500 rounded-2xl flex items-center justify-center transition-all">
                  <i className="ri-edit-line text-3xl text-purple-600 group-hover:text-white transition-colors"></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Manual</h3>
                <p className="text-sm text-gray-600">Digite as informações manualmente</p>
              </button>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
              <div className="flex items-start gap-3">
                <i className="ri-lightbulb-line text-red-600 text-xl mt-0.5"></i>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Dica</h4>
                  <p className="text-sm text-gray-700">Para melhor identificação, certifique-se de que o rótulo está bem iluminado e visível</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Step */}
        {step === 'scan' && (
          <div className="p-6 md:p-8">
            <button onClick={() => setStep('method')} className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium">
              <i className="ri-arrow-left-line"></i>
              Voltar
            </button>

            <div className="text-center py-12">
              {!isProcessing ? (
                <>
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 animate-pulse"></div>
                    <i className="ri-camera-line text-7xl text-red-600 relative z-10"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Posicione o rótulo</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">Centralize o rótulo do vinho na câmera para identificação automática</p>
                  <button
                    onClick={() => simulateRecognition({
                      name: 'Château Margaux',
                      producer: 'Château Margaux',
                      vintage: 2015,
                      type: 'red',
                      region: 'Margaux, Bordeaux',
                      country: 'França',
                      grapes: 'Cabernet Sauvignon, Merlot',
                      food_pairing: 'Carnes vermelhas, queijos maturados',
                      serving_temp: '16-18°C',
                      decant_time: 'Recomendado 1-2 horas',
                      aging_potential: '20-30 anos',
                      rating: 5,
                      price: 2500,
                      image_url: 'https://readdy.ai/api/search-image?query=chateau%20margaux%20wine%20bottle%20elegant%20bordeaux%20red%20wine%20premium%20french%20wine%20on%20white%20background%20studio%20photography&width=400&height=600&seq=margaux-scan&orientation=portrait'
                    })}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <i className="ri-scan-line text-xl"></i>
                    Escanear Agora
                  </button>
                </>
              ) : (
                <>
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-48 h-48 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                      <i className="ri-scan-line text-7xl text-white animate-pulse"></i>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Identificando...</h3>
                  <p className="text-gray-600">Analisando o rótulo e buscando informações</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="p-6 md:p-8">
            <button onClick={() => setStep('method')} className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium">
              <i className="ri-arrow-left-line"></i>
              Voltar
            </button>

            <div className="text-center py-12">
              {!isProcessing ? (
                <>
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-amber-300">
                    <i className="ri-upload-cloud-line text-7xl text-amber-600"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Envie uma foto</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">Selecione uma foto clara do rótulo para identificação automática</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        simulateRecognition({
                          name: 'Sassicaia',
                          producer: 'Tenuta San Guido',
                          vintage: 2018,
                          type: 'red',
                          region: 'Bolgheri, Toscana',
                          country: 'Itália',
                          grapes: 'Cabernet Sauvignon, Cabernet Franc',
                          food_pairing: 'Carnes grelhadas, massas com molho de carne',
                          serving_temp: '16-18°C',
                          decant_time: 'Recomendado 1 hora',
                          aging_potential: '15-25 anos',
                          rating: 5,
                          price: 1800,
                          image_url: 'https://readdy.ai/api/search-image?query=sassicaia%20wine%20bottle%20italian%20super%20tuscan%20red%20wine%20premium%20bolgheri%20on%20white%20background%20studio%20photography&width=400&height=600&seq=sassicaia-upload&orientation=portrait'
                        });
                      }
                    }}
                    className="hidden"
                    id="upload-input"
                  />
                  <label
                    htmlFor="upload-input"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-image-add-line text-xl"></i>
                    Selecionar Foto
                  </label>
                </>
              ) : (
                <>
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-48 h-48 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                      <i className="ri-image-line text-7xl text-white animate-pulse"></i>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Processando...</h3>
                  <p className="text-gray-600">Analisando a imagem e identificando o vinho</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Manual Step */}
        {step === 'manual' && (
          <div className="p-6 md:p-8">
            <button onClick={() => setStep('method')} className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium">
              <i className="ri-arrow-left-line"></i>
              Voltar
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Buscar Vinho</h3>
            <p className="text-sm text-gray-600 mb-6">Digite o nome para buscar em nossa base de dados</p>

            <div className="mb-6">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Digite o nome do vinho..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setStep('details');
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">Sugestões populares:</p>
              {[
                { name: 'Penfolds Grange', producer: 'Penfolds', vintage: 2016, type: 'red' as const, region: 'Barossa Valley', country: 'Austrália', seq: 'penfolds' },
                { name: 'Opus One', producer: 'Opus One Winery', vintage: 2017, type: 'red' as const, region: 'Napa Valley', country: 'EUA', seq: 'opus' },
                { name: 'Vega Sicilia Único', producer: 'Vega Sicilia', vintage: 2010, type: 'red' as const, region: 'Ribera del Duero', country: 'Espanha', seq: 'vega' }
              ].map((wine, index) => (
                <button
                  key={index}
                  onClick={() => {
                    simulateRecognition({
                      ...wine,
                      grapes: 'Syrah',
                      food_pairing: 'Carnes vermelhas',
                      serving_temp: '16-18°C',
                      decant_time: 'Recomendado',
                      aging_potential: '15-20 anos',
                      rating: 5,
                      price: 1500,
                      image_url: `https://readdy.ai/api/search-image?query=$%7Bwine.name.toLowerCase%28%29.replace%28%2F%5Cs%2Fg%2C%20-%29%7D-wine-bottle-premium-red-wine-on-white-background-studio-photography&width=400&height=600&seq=${wine.seq}-manual&orientation=portrait`
                    });
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-500 group-hover:to-pink-500 rounded-xl flex items-center justify-center transition-all">
                      <i className="ri-wine-bottle-line text-xl text-purple-600 group-hover:text-white transition-colors"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{wine.name}</div>
                      <div className="text-sm text-gray-600">{wine.producer} • {wine.vintage} • {wine.region}</div>
                    </div>
                    <i className="ri-arrow-right-line text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <div className="p-6 md:p-8">
            <button onClick={() => setStep('method')} className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium">
              <i className="ri-arrow-left-line"></i>
              Voltar
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6">Detalhes do Vinho</h3>

            <div className="space-y-6">
              {/* Wine Info */}
              {scanResult && (
                <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-28 flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md">
                      <img
                        src={scanResult.image_url}
                        alt={scanResult.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 text-lg">{scanResult.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{scanResult.producer}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                          {scanResult.vintage}
                        </span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                          {scanResult.type === 'red' ? 'Tinto' :
                            scanResult.type === 'white' ? 'Branco' :
                              scanResult.type === 'rose' ? 'Rosé' :
                                scanResult.type === 'sparkling' ? 'Espumante' :
                                  scanResult.type === 'fortified' ? 'Fortificado' :
                                    scanResult.type === 'dessert' ? 'Sobremesa' :
                                      scanResult.type}
                        </span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                          {scanResult.region}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Location */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="ri-map-pin-line text-red-600"></i>
                  Localização na Adega
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Seção</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="A"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Prateleira</label>
                    <input
                      type="text"
                      value={formData.shelf}
                      onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                      placeholder="2"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Posição</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <i className="ri-stack-line text-red-600"></i>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <i className="ri-money-dollar-circle-line text-red-600"></i>
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-semibold"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="ri-star-line text-red-600"></i>
                  Sua Avaliação
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-4xl transition-all hover:scale-110"
                    >
                      <i className={`${star <= (formData.rating || 0) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <i className="ri-file-text-line text-red-600"></i>
                  Notas Pessoais
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Adicione suas observações sobre este vinho..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-add-line text-xl"></i>
                  Adicionar à Adega
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
