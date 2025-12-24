import { useState } from 'react';
import { FoodExperience } from '../../../services/supabase';

interface AddExperienceModalProps {
  onClose: () => void;
  onAdd: (experience: FoodExperience) => void;
}

export default function AddExperienceModal({ onClose, onAdd }: AddExperienceModalProps) {
  const [selectedType, setSelectedType] = useState<'restaurant' | 'wine' | 'dish' | 'drink'>('restaurant');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<FoodExperience>({
    type: 'restaurant',
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    price: '',
    rating: 0,
    description: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const types = [
    { id: 'restaurant' as const, label: 'Restaurante', icon: 'ri-restaurant-line', color: 'from-orange-500 to-pink-500' },
    { id: 'wine' as const, label: 'Vinho', icon: 'ri-goblet-line', color: 'from-purple-500 to-pink-500' },
    { id: 'dish' as const, label: 'Prato', icon: 'ri-cake-3-line', color: 'from-green-500 to-teal-500' },
    { id: 'drink' as const, label: 'Drink', icon: 'ri-cup-line', color: 'from-blue-500 to-cyan-500' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image_url: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.rating) {
      alert('Por favor, preencha o nome e a avaliação');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({ ...formData, type: selectedType });
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao adicionar experiência. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">✨ Nova Experiência</h2>
              <p className="text-sm text-gray-600 mt-1">Registre seus momentos gastronômicos</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tipo de Experiência *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setFormData({ ...formData, type: type.id });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedType === type.id
                      ? `border-transparent bg-gradient-to-br ${type.color} text-white shadow-lg scale-105`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <i className={`${type.icon} text-2xl mb-2 block`}></i>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Ex: ${selectedType === 'restaurant' ? 'Restaurante Bella Vista' : selectedType === 'wine' ? 'Vinho Tinto Reserva' : selectedType === 'dish' ? 'Risoto de Funghi' : 'Mojito Clássico'}`}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Localização
              </label>
              <div className="relative">
                <i className="ri-map-pin-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: São Paulo, Brasil"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Date and Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Data
                </label>
                <div className="relative">
                  <i className="ri-calendar-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Faixa de Preço
                </label>
                <select
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="">Selecione</option>
                  <option value="$">$ - Econômico (até R$ 50)</option>
                  <option value="$$">$$ - Moderado (R$ 50-150)</option>
                  <option value="$$$">$$$ - Caro (R$ 150-300)</option>
                  <option value="$$$$">$$$$ - Muito Caro (R$ 300+)</option>
                </select>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Avaliação *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-4xl transition-all hover:scale-110"
                  >
                    <i className={`${star <= (formData.rating || 0) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}`}></i>
                  </button>
                ))}
                {formData.rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600 self-center">
                    {formData.rating === 5 ? '😍 Perfeito!' : formData.rating === 4 ? '😊 Muito bom!' : formData.rating === 3 ? '🙂 Bom' : formData.rating === 2 ? '😐 Regular' : '😞 Ruim'}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descrição / Notas
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Conte sobre sua experiência... O que você achou? O que mais gostou?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.description?.length || 0} caracteres
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Foto
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-orange-300 transition-all">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, image_url: '' });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <i className="ri-image-add-line text-5xl text-gray-300 mb-3"></i>
                    <p className="text-gray-600 mb-1 font-medium">Adicione uma foto da sua experiência</p>
                    <p className="text-xs text-gray-500 mb-4">PNG, JPG até 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap transition-all"
                >
                  <i className="ri-upload-2-line"></i>
                  {imagePreview ? 'Trocar Foto' : 'Selecionar Foto'}
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all whitespace-nowrap disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.rating}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  Salvar Experiência
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}