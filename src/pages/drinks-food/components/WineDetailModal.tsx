interface WineDetailModalProps {
  wine: any;
  onClose: () => void;
}

export default function WineDetailModal({ wine, onClose }: WineDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Detalhes do Vinho</h2>
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
              src={`https://readdy.ai/api/search-image?query=$%7Bwine.image%7D&width=800&height=450&seq=wine-detail-${wine.id}&orientation=landscape`}
              alt={wine.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{wine.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                {wine.type}
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                Safra {wine.vintage}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`text-lg ${
                    i < wine.rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'
                  }`}
                ></i>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Região</p>
              <p className="font-semibold text-gray-900">{wine.region}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Uva</p>
              <p className="font-semibold text-gray-900">{wine.grape}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Preço</p>
              <p className="font-semibold text-gray-900">{wine.price}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Data da Degustação</p>
              <p className="font-semibold text-gray-900">{wine.date}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Notas de Degustação</h4>
            <p className="text-gray-700 leading-relaxed">{wine.notes}</p>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Harmonização</h4>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="ri-restaurant-line text-orange-500"></i>
              <span>{wine.pairing}</span>
            </div>
          </div>

          {wine.occasion && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Ocasião</h4>
              <div className="flex items-center gap-2 text-gray-700">
                <i className="ri-calendar-line text-orange-500"></i>
                <span>{wine.occasion}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
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
