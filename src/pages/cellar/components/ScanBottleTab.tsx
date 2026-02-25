import { useState, useRef } from 'react';

export default function ScanBottleTab() {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedWine, setScannedWine] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    setIsScanning(true);

    // Simular escaneamento
    setTimeout(() => {
      setIsScanning(false);
      setScannedWine({
        name: 'Château Lafite Rothschild',
        winery: 'Domaines Barons de Rothschild',
        type: 'Tinto',
        vintage: 2016,
        region: 'Pauillac, Bordeaux',
        country: 'França',
        grapes: 'Cabernet Sauvignon 92%, Merlot 8%',
        alcohol: '13%',
        rating: 4.8,
        reviews: 1247,
        price: '€750',
        description: 'Um dos cinco Premier Cru de Bordeaux, este vinho excepcional apresenta aromas complexos de cassis, cedro e grafite. No paladar, revela taninos sedosos, estrutura elegante e um final extraordinariamente longo.',
        foodPairing: 'Carnes vermelhas nobres, cordeiro, queijos maturados',
        servingTemp: '16-18°C',
        decanting: '2-3 horas',
        agingPotential: '30-50 anos',
        image: 'premium french bordeaux wine bottle chateau lafite rothschild elegant classic label pauillac vineyard background sunset sophisticated luxury'
      });
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScan();
    }
  };

  const handleAddToCellar = () => {
    alert('✅ Vinho adicionado à sua adega!\n\nAgora você pode configurar a localização e quantidade.');
    setScannedWine(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scan Mode Selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Como deseja identificar o vinho?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setScanMode('camera')}
            className={`p-6 rounded-xl border-2 transition-all ${scanMode === 'camera'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <i className="ri-camera-line text-3xl text-white"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Câmera</h3>
            <p className="text-sm text-gray-600">Escaneie o rótulo com sua câmera</p>
          </button>

          <button
            onClick={() => {
              setScanMode('upload');
              fileInputRef.current?.click();
            }}
            className={`p-6 rounded-xl border-2 transition-all ${scanMode === 'upload'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <i className="ri-image-add-line text-3xl text-white"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Upload</h3>
            <p className="text-sm text-gray-600">Envie uma foto do rótulo</p>
          </button>

          <button
            onClick={() => setScanMode('manual')}
            className={`p-6 rounded-xl border-2 transition-all ${scanMode === 'manual'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center">
              <i className="ri-edit-line text-3xl text-white"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Manual</h3>
            <p className="text-sm text-gray-600">Digite as informações</p>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Scanning Area */}
      {scanMode === 'camera' && !scannedWine && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="max-w-md mx-auto text-center">
            {!isScanning ? (
              <>
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <i className="ri-scan-line text-6xl text-purple-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pronto para escanear</h3>
                <p className="text-gray-600 mb-6">
                  Posicione o rótulo da garrafa na frente da câmera para identificação automática
                </p>
                <button
                  onClick={handleScan}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
                >
                  <i className="ri-camera-line mr-2"></i>
                  Iniciar Escaneamento
                </button>
              </>
            ) : (
              <>
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <i className="ri-scan-line text-6xl text-white animate-pulse"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Escaneando...</h3>
                <p className="text-gray-600">Identificando o vinho através do rótulo</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Manual Input */}
      {scanMode === 'manual' && !scannedWine && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Buscar Vinho</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Vinho</label>
              <input
                type="text"
                placeholder="Ex: Château Margaux"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Produtor</label>
                <input
                  type="text"
                  placeholder="Ex: Château Margaux"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Safra</label>
                <input
                  type="number"
                  placeholder="Ex: 2015"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleScan}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
            >
              <i className="ri-search-line mr-2"></i>
              Buscar Vinho
            </button>
          </div>
        </div>
      )}

      {/* Scanned Wine Result */}
      {scannedWine && (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 text-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className="ri-check-line text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold">Vinho Identificado!</h3>
                <p className="text-sm text-white/80">Informações encontradas em nossa base de dados</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Wine Image */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-[3/4] rounded-xl overflow-hidden">
                  <img
                    src={`https://readdy.ai/api/search-image?query=$%7BscannedWine.image%7D&width=256&height=341&seq=scanned-wine&orientation=portrait`}
                    alt={scannedWine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Wine Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{scannedWine.name}</h2>
                  <p className="text-lg text-gray-600 mb-3">{scannedWine.winery}</p>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                      {scannedWine.type}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">
                      Safra {scannedWine.vintage}
                    </span>
                    <div className="flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-400"></i>
                      <span className="font-bold text-gray-900">{scannedWine.rating}</span>
                      <span className="text-sm text-gray-600">({scannedWine.reviews} avaliações)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Região</p>
                    <p className="font-semibold text-gray-900">{scannedWine.region}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">País</p>
                    <p className="font-semibold text-gray-900">{scannedWine.country}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Uvas</p>
                    <p className="font-semibold text-gray-900 text-sm">{scannedWine.grapes}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Teor Alcoólico</p>
                    <p className="font-semibold text-gray-900">{scannedWine.alcohol}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{scannedWine.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Harmonização</h4>
                    <p className="text-gray-700 text-sm">{scannedWine.foodPairing}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Temperatura</h4>
                    <p className="text-gray-700 text-sm">{scannedWine.servingTemp}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Decantação</h4>
                    <p className="text-gray-700 text-sm">{scannedWine.decanting}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Preço Estimado</p>
                      <p className="text-3xl font-bold text-gray-900">{scannedWine.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Potencial de Guarda</p>
                      <p className="text-lg font-bold text-purple-600">{scannedWine.agingPotential}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddToCellar}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-2"></i>
                    Adicionar à Adega
                  </button>
                  <button
                    onClick={() => setScannedWine(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all whitespace-nowrap"
                  >
                    <i className="ri-scan-line mr-2"></i>
                    Escanear Outro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {!scannedWine && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="ri-lightbulb-line text-purple-600"></i>
            Dicas para melhor identificação
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-purple-600 mt-0.5"></i>
              <span>Certifique-se de que o rótulo está bem iluminado e visível</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-purple-600 mt-0.5"></i>
              <span>Mantenha a câmera estável e focada no rótulo</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-purple-600 mt-0.5"></i>
              <span>Evite reflexos e sombras sobre o rótulo</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-purple-600 mt-0.5"></i>
              <span>Se não encontrar, você pode adicionar manualmente as informações</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
