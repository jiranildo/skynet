import { useState } from 'react';
import { CellarWine, cellarService } from '../../../services/supabase';
import { analyzeWineLabel, searchWineInfo } from '../../../services/gemini';

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
    best_drinking_window: '',
    terroir: '',
    intensity: 3,
    visual_perception: '',
    olfactory_perception: '',
    palate_perception: '',
    notes: '',
    image_url: ''
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      setIsProcessing(true);
      // Ensure we're sending a valid object for creation (removing id and internal seq if present)
      const { id, seq, ...wineData } = formData as any;
      await cellarService.create(wineData);

      onAdd(formData); // Notify parent of success
    } catch (error) {
      console.error('Error saving wine:', error);
      alert(`Erro ao salvar vinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIAnalysis = async (file: File) => {
    setIsProcessing(true);

    try {
      // 1. Convert to Base64 for the AI
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // 2. Analyze with Gemini
        const analysis = await analyzeWineLabel(base64String);

        if (analysis) {
          // 3. Map to CellarWine
          const wine: CellarWine = {
            name: analysis.name || '',
            producer: analysis.producer || '',
            vintage: analysis.vintage || new Date().getFullYear(),
            type: analysis.type || 'red',
            region: analysis.region || '',
            country: analysis.country || '',
            grapes: analysis.grapes || '',
            alcohol_content: analysis.alcohol_content || 0,
            description: analysis.description || '',
            food_pairing: analysis.food_pairing || '',
            serving_temp: analysis.serving_temp || '',
            decant_time: analysis.decant_time || '',
            aging_potential: analysis.aging_potential || '',
            best_drinking_window: analysis.best_drinking_window || '',
            terroir: analysis.terroir || '',
            intensity: analysis.intensity || 3,
            visual_perception: analysis.visual_perception || '',
            olfactory_perception: analysis.olfactory_perception || '',
            palate_perception: analysis.palate_perception || '',

            section: '',
            shelf: '',
            position: '',
            quantity: 1,
            price: 0,
            rating: 0,
            notes: '',
            image_url: base64String // Keep the original photo
          };

          setScanResult(wine);
          setFormData(wine);
          setStep('details');
        } else {
          alert('Não foi possível identificar o vinho. Tente novamente com uma foto mais clara.');
        }
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setIsProcessing(false);
      alert('Erro ao processar imagem. Tente novamente.');
    }
  };

  const handleSARASearch = async () => {
    if (!formData.name) {
      alert('Por favor, informe ao menos o nome do vinho para a SARA');
      return;
    }

    setIsProcessing(true);
    try {
      const query = `${formData.name} ${formData.producer || ''} ${formData.vintage || ''}`.trim();
      const analysis = await searchWineInfo(query);

      if (analysis) {
        setFormData({
          ...formData,
          name: analysis.name || formData.name,
          producer: analysis.producer || formData.producer,
          vintage: analysis.vintage || formData.vintage,
          type: analysis.type || formData.type,
          region: analysis.region || formData.region,
          country: analysis.country || formData.country,
          grapes: analysis.grapes || formData.grapes,
          alcohol_content: analysis.alcohol_content || formData.alcohol_content,
          description: analysis.description || formData.description,
          food_pairing: analysis.food_pairing || formData.food_pairing,
          serving_temp: analysis.serving_temp || formData.serving_temp,
          decant_time: analysis.decant_time || formData.decant_time,
          aging_potential: analysis.aging_potential || formData.aging_potential,
          best_drinking_window: analysis.best_drinking_window || formData.best_drinking_window,
          terroir: analysis.terroir || formData.terroir,
          intensity: analysis.intensity || formData.intensity,
          visual_perception: analysis.visual_perception || formData.visual_perception,
          olfactory_perception: analysis.olfactory_perception || formData.olfactory_perception,
          palate_perception: analysis.palate_perception || formData.palate_perception,
        });
        // Transition to details to see the result
        setStep('details');
      } else {
        alert('Não foi possível encontrar informações detalhadas para este vinho.');
      }
    } catch (error) {
      console.error('Error during SARA search:', error);
      alert('Erro na pesquisa SARA AI. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
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

                    <input
                      type="file"
                      id="camera-input"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAIAnalysis(file);
                      }}
                    />
                    <label
                      htmlFor="camera-input"
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="ri-scan-line text-xl"></i>
                      Escanear Agora
                    </label>
                  </>
                ) : (
                  <>
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-full animate-ping opacity-20"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                        <i className="ri-scan-line text-4xl text-white animate-pulse"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">SARA está analisando...</h3>
                    <p className="text-gray-600">Identificando rótulo e buscando informações de sommelier...</p>
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
                        const file = e.target.files?.[0];
                        if (file) handleAIAnalysis(file);
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
                        <i className="ri-magic-line text-4xl text-white animate-pulse"></i>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">SARA está analisando...</h3>
                    <p className="text-gray-600">Processando sua imagem com inteligência artificial</p>
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
                      setFormData({
                        ...formData,
                        name: wine.name,
                        producer: wine.producer,
                        vintage: wine.vintage,
                        type: wine.type,
                        region: wine.region,
                        country: wine.country,
                        image_url: `https://readdy.ai/api/search-image?query=$%7Bwine.name.toLowerCase%28%29.replace%28%2F%5Cs%2Fg%2C%20-%29%7D-wine-bottle-premium-red-wine-on-white-background-studio-photography&width=400&height=600&seq=${wine.seq}-manual&orientation=portrait`
                      });
                      setStep('details');
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
                {/* Wine Image & Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-32 h-44 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative shadow-sm">
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt={formData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <i className="ri-image-add-line text-3xl text-gray-400 mb-1"></i>
                          <p className="text-xs text-gray-500 font-medium leading-tight">Adicionar Foto</p>
                        </div>
                      )}

                      {/* Overlay for hover/edit */}
                      <label
                        htmlFor="detail-image-upload"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                      >
                        <i className="ri-pencil-line text-white text-3xl"></i>
                      </label>
                      <input
                        type="file"
                        id="detail-image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image_url: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    {/* Badge showing origin */}
                    {scanResult && formData.image_url === scanResult.image_url && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
                        IA
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Info Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Nome do Vinho</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-semibold text-lg pr-32"
                        placeholder="Ex: Château Margaux"
                      />
                      <button
                        onClick={handleSARASearch}
                        disabled={isProcessing || !formData.name}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <i className="ri-loader-4-line animate-spin"></i>
                        ) : (
                          <i className="ri-sparkling-fill"></i>
                        )}
                        SARA AI
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Produtor</label>
                    <input
                      type="text"
                      value={formData.producer}
                      onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ex: Margaux"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Safra</label>
                      <input
                        type="number"
                        value={formData.vintage}
                        onChange={(e) => setFormData({ ...formData, vintage: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Tipo</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="red">Tinto</option>
                        <option value="white">Branco</option>
                        <option value="rose">Rosé</option>
                        <option value="sparkling">Espumante</option>
                        <option value="fortified">Fortificado</option>
                        <option value="dessert">Sobremesa</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description - AI Generated */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                    <span>Descrição (IA)</span>
                    <i className="ri-sparkling-fill text-purple-500"></i>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Descrição do vinho..."
                    className="w-full px-4 py-3 border-2 border-purple-100 bg-purple-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-gray-700 leading-relaxed"
                  ></textarea>
                </div>

                {/* Technical Details Grid */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide opacity-70">Ficha Técnica</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Região</label>
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">País</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Uvas</label>
                      <input
                        type="text"
                        value={formData.grapes}
                        onChange={(e) => setFormData({ ...formData, grapes: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Teor Alcoólico (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.alcohol_content || ''}
                        onChange={(e) => setFormData({ ...formData, alcohol_content: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Sommelier Info */}
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <h3 className="text-sm font-bold text-purple-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <i className="ri-lightbulb-flash-line"></i>
                    Sommelier Tips
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-700/70 mb-1">Harmonização</label>
                      <input
                        type="text"
                        value={formData.food_pairing || ''}
                        onChange={(e) => setFormData({ ...formData, food_pairing: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-purple-700/70 mb-1">Temperatura</label>
                        <input
                          type="text"
                          value={formData.serving_temp || ''}
                          onChange={(e) => setFormData({ ...formData, serving_temp: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-purple-700/70 mb-1">Decantação</label>
                        <input
                          type="text"
                          value={formData.decant_time || ''}
                          onChange={(e) => setFormData({ ...formData, decant_time: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700/70 mb-1">Potencial de Guarda</label>
                      <input
                        type="text"
                        value={formData.aging_potential || ''}
                        onChange={(e) => setFormData({ ...formData, aging_potential: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700/70 mb-1">Janela de Consumo</label>
                      <input
                        type="text"
                        value={formData.best_drinking_window || ''}
                        onChange={(e) => setFormData({ ...formData, best_drinking_window: e.target.value })}
                        placeholder="Ex: 2024 - 2030"
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensory Perception */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <h3 className="text-sm font-bold text-amber-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <i className="ri-eye-line"></i>
                  Perfil Sensorial
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-700/70 mb-2">Intensidade (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, intensity: level })}
                          className={`flex-1 py-2 rounded-lg border-2 transition-all ${formData.intensity === level
                            ? 'bg-amber-500 border-amber-600 text-white shadow-inner'
                            : 'bg-white border-amber-200 text-amber-400 hover:border-amber-400'
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700/70 mb-1">Exame Visual</label>
                    <input
                      type="text"
                      value={formData.visual_perception || ''}
                      onChange={(e) => setFormData({ ...formData, visual_perception: e.target.value })}
                      placeholder="Ex: Rubi intenso, reflexos granada"
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700/70 mb-1">Exame Olfativo</label>
                    <textarea
                      value={formData.olfactory_perception || ''}
                      onChange={(e) => setFormData({ ...formData, olfactory_perception: e.target.value })}
                      placeholder="Ex: Frutas negras maduras, tabaco, especiarias"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700/70 mb-1">Exame Gustativo</label>
                    <textarea
                      value={formData.palate_perception || ''}
                      onChange={(e) => setFormData({ ...formData, palate_perception: e.target.value })}
                      placeholder="Ex: Encorpado, taninos sedosos, final longo"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                    />
                  </div>
                </div>
              </div>

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
          )}
        </div>
      </div>
    </div>
  );
}
