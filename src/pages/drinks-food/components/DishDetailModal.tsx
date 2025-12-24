interface DishDetailModalProps {
  dish: any;
  onClose: () => void;
}

export default function DishDetailModal({ dish, onClose }: DishDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Detalhes do Prato</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <div className="p-6">
          <div className="aspect-[16/9] rounded-xl overflow-hidden mb-6">
            <img
              src={`https://readdy.ai/api/search-image?query=$%7Bdish.image%7D&width=800&height=450&seq=dish-detail-${dish.id}&orientation=landscape`}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{dish.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm font-bold rounded-full">
                {dish.cuisine}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`text-lg ${
                    i < dish.rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'
                  }`}
                ></i>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Restaurante</p>
              <p className="font-semibold text-gray-900">{dish.restaurant}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Localização</p>
              <p className="font-semibold text-gray-900">{dish.location}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Preço</p>
              <p className="font-semibold text-gray-900">{dish.price}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Data</p>
              <p className="font-semibold text-gray-900">{dish.date}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Descrição</h4>
            <p className="text-gray-700 leading-relaxed">{dish.description}</p>
          </div>

          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Ingredientes Principais</h4>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ingredient: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dish.notes && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Notas Pessoais</h4>
              <p className="text-gray-700 leading-relaxed">{dish.notes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
              <i className="ri-edit-line mr-2"></i>
              Editar
            </button>
            <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all whitespace-nowrap">
              <i className="ri-share-line mr-2"></i>
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
