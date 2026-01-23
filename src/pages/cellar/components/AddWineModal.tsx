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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-3xl overflow-y-auto shadow-2xl animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky on Mobile */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'method' && 'Adicionar Vinho'}
              {step === 'scan' && 'Escanear Rótulo'}
              {step === 'upload' && 'Upload de Foto'}
              {step === 'manual' && 'Busca Manual'}
              {step === 'details' && 'Detalhes do Vinho'}
            </h2>
            {step === 'method' && <p className="text-xs text-gray-500">Escolha como deseja adicionar</p>}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 pb-24 md:pb-8">
          {/* Method Selection */}
          {step === 'method' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('scan')}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group text-left"
              >
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-red-100 to-rose-100 group-hover:from-red-500 group-hover:to-rose-500 rounded-xl flex items-center justify-center transition-all">
                  <i className="ri-camera-line text-2xl text-red-600 group-hover:text-white transition-colors"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Escanear</h3>
                  <p className="text-sm text-gray-600">Use a câmera para identificar</p>
                </div>
                <i className="ri-arrow-right-s-line text-2xl text-gray-300 group-hover:text-red-500 ml-auto"></i>
              </button>

              <button
                onClick={() => setStep('upload')}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 transition-all group text-left"
              >
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-500 group-hover:to-orange-500 rounded-xl flex items-center justify-center transition-all">
                  <i className="ri-image-line text-2xl text-amber-600 group-hover:text-white transition-colors"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Upload</h3>
                  <p className="text-sm text-gray-600">Envie uma foto da galeria</p>
                </div>
                <i className="ri-arrow-right-s-line text-2xl text-gray-300 group-hover:text-amber-500 ml-auto"></i>
              </button>

              <button
                onClick={() => setStep('manual')}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
              >
                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-500 group-hover:to-pink-500 rounded-xl flex items-center justify-center transition-all">
                  <i className="ri-edit-line text-2xl text-purple-600 group-hover:text-white transition-colors"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Manual</h3>
                  <p className="text-sm text-gray-600">Digite as informações</p>
                </div>
                <i className="ri-arrow-right-s-line text-2xl text-gray-300 group-hover:text-purple-500 ml-auto"></i>
              </button>

              <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
                <div className="flex items-start gap-3">
                  <i className="ri-lightbulb-line text-red-600 text-xl mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Dica</h4>
                    <p className="text-sm text-gray-700">Para melhor identificação, certifique-se de que o rótulo está bem iluminado</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan Step */}
          {step === 'scan' && (
            <div>
              <button
                onClick={() => setStep('method')}
                className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium px-2 py-1"
              >
                <i className="ri-arrow-left-line"></i>
                Voltar
              </button>

              <div className="text-center py-8">
                {!isProcessing ? (
                  <>
                    <div className="w-full max-w-xs mx-auto aspect-square bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 animate-pulse"></div>
                      <i className="ri-camera-line text-6xl text-red-600 relative z-10"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Posicione o rótulo</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto px-4">Centralize o rótulo do vinho na câmera para identificação automática</p>
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
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <i className="ri-scan-line text-xl"></i>
                      Escanear Agora
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-full animate-ping opacity-20"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                        <i className="ri-scan-line text-4xl text-white animate-pulse"></i>
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
            <div>
              <button
                onClick={() => setStep('method')}
                className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium px-2 py-1"
              >
                <i className="ri-arrow-left-line"></i>
                Voltar
              </button>

              <div className="text-center py-8">
                {!isProcessing ? (
                  <>
                    <div className="w-full max-w-xs mx-auto aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-amber-300">
                      <i className="ri-upload-cloud-line text-6xl text-amber-600"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Envie uma foto</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto px-4">Selecione uma foto clara do rótulo para identificação automática</p>
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
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i className="ri-image-add-line text-xl"></i>
                      Selecionar Foto
                    </label>
                  </>
                ) : (
                  <>
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full animate-ping opacity-20"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                        <i className="ri-image-line text-4xl text-white animate-pulse"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Processando...</h3>
                    <p className="text-gray-600">Analisando a imagem</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Manual Step */}
          {step === 'manual' && (
            <div>
              <button
                onClick={() => setStep('method')}
                className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium px-2 py-1"
              >
                <i className="ri-arrow-left-line"></i>
                Voltar
              </button>

              <div className="mb-6">
                <div className="relative">
                  <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                  <input
                    type="text"
                    placeholder="Digite o nome do vinho..."
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setStep('details');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Sugestões populares</p>
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
                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-500 group-hover:to-pink-500 rounded-xl flex items-center justify-center transition-all">
                        <i className="ri-wine-bottle-line text-xl text-purple-600 group-hover:text-white transition-colors"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{wine.name}</div>
                        <div className="text-sm text-gray-600 truncate">{wine.producer} • {wine.vintage}</div>
                      </div>
                      <i className="ri-arrow-right-line text-gray-300 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <div>
              <button
                onClick={() => setStep('method')}
                className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium px-2 py-1"
              >
                <i className="ri-arrow-left-line"></i>
                Voltar
              </button>

              <div className="space-y-6">
                {/* Wine Info Card */}
                {scanResult && (
                  <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl p-4 border border-red-100 flex items-start gap-4">
                    <div className="w-20 h-28 flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm border border-white/50">
                      <img
                        src={scanResult.image_url}
                        alt={scanResult.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{scanResult.name}</h4>
                      <p className="text-sm text-gray-600 mb-2 truncate">{scanResult.producer}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-white/60 rounded-md text-xs font-semibold text-gray-700">
                          {scanResult.vintage}
                        </span>
                        <span className="px-2 py-1 bg-white/60 rounded-md text-xs font-semibold text-gray-700">
                          {scanResult.type === 'red' ? 'Tinto' :
                            scanResult.type === 'white' ? 'Branco' :
                              scanResult.type === 'rose' ? 'Rosé' :
                                scanResult.type === 'sparkling' ? 'Espumante' :
                                  'Outro'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage Location */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-map-pin-line text-red-600"></i>
                    Localização na Adega
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase text-center">Seção</label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        placeholder="A"
                        className="w-full py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold text-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase text-center">Prateleira</label>
                      <input
                        type="text"
                        value={formData.shelf}
                        onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                        placeholder="2"
                        className="w-full py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold text-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase text-center">Posição</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="5"
                        className="w-full py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold text-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Quantidade</label>
                    <div className="relative">
                      <i className="ri-stack-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-semibold text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Preço (R$)</label>
                    <div className="relative">
                      <i className="ri-money-dollar-circle-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-semibold text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Sua Avaliação</label>
                  <div className="flex justify-between px-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-2 transition-all hover:scale-110 active:scale-90"
                      >
                        <i className={`text-3xl ${star <= (formData.rating || 0) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'}`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Notas Pessoais</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="O que achou deste vinho?"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-6 border-t border-gray-100 -mx-6 px-6 md:mx-0 md:px-0 md:relative md:border-none md:pb-0 md:bg-transparent">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-[2] py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-red-200 shadow-lg"
                  >
                    <i className="ri-check-line text-xl"></i>
                    Salvar na Adega
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
