import { useState } from 'react';

interface CreateBlogModalProps {
  onClose: () => void;
}

export default function CreateBlogModal({ onClose }: CreateBlogModalProps) {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('adventure');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'adventure', label: 'Aventura', icon: 'ri-compass-3-line', color: 'from-orange-500 to-red-500' },
    { id: 'culture', label: 'Cultura', icon: 'ri-building-line', color: 'from-purple-500 to-pink-500' },
    { id: 'food', label: 'Gastronomia', icon: 'ri-restaurant-line', color: 'from-yellow-500 to-orange-500' },
    { id: 'nature', label: 'Natureza', icon: 'ri-leaf-line', color: 'from-green-500 to-teal-500' },
    { id: 'luxury', label: 'Luxo', icon: 'ri-vip-diamond-line', color: 'from-indigo-500 to-purple-500' },
    { id: 'budget', label: 'Econômico', icon: 'ri-money-dollar-circle-line', color: 'from-blue-500 to-cyan-500' }
  ];

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !destination.trim() || !content.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    // Simular salvamento
    setTimeout(() => {
      const newBlog = {
        id: Date.now().toString(),
        title: title.trim(),
        destination: destination.trim(),
        category,
        content: content.trim(),
        coverImage: coverImage || `https://readdy.ai/api/search-image?query=beautiful%20travel%20destination%20$%7Bdestination%7D%20landscape%20scenic%20view%20vibrant%20colors&width=800&height=500&seq=blog-${Date.now()}&orientation=landscape`,
        tags,
        author: {
          name: 'Você',
          avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20young%20person%20confident%20smile&width=60&height=60&seq=author-you&orientation=squarish'
        },
        date: new Date().toISOString(),
        likes: 0,
        comments: 0,
        views: 0
      };

      // Salvar no localStorage
      const savedBlogs = JSON.parse(localStorage.getItem('user-blogs') || '[]');
      savedBlogs.unshift(newBlog);
      localStorage.setItem('user-blogs', JSON.stringify(savedBlogs));

      setIsSubmitting(false);
      alert('✅ Blog publicado com sucesso!');
      onClose();
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <i className="ri-quill-pen-line text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Criar Novo Blog</h2>
                <p className="text-white/90 text-sm">Compartilhe sua experiência de viagem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Título do Blog <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Minha Aventura Incrível em Paris"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100 caracteres</p>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Destino <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Paris, França"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Categoria <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r ${cat.color} flex items-center justify-center text-white`}>
                      <i className={`${cat.icon} text-xl`}></i>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image URL (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                URL da Imagem de Capa (Opcional)
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Deixe em branco para gerar automaticamente</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Conteúdo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Conte sua história de viagem... Descreva os lugares que visitou, as experiências que teve, as pessoas que conheceu..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm resize-none"
                rows={8}
                maxLength={5000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{content.length}/5000 caracteres</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tags (Máximo 5)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ex: viagem, aventura, cultura"
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  disabled={tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={tags.length >= 5}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-orange-900 transition-colors"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-start gap-3">
                <i className="ri-lightbulb-line text-2xl text-orange-600 flex-shrink-0"></i>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Dicas para um ótimo blog:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✨ Seja autêntico e compartilhe suas experiências reais</li>
                    <li>📸 Use imagens de alta qualidade</li>
                    <li>💡 Inclua dicas práticas e informações úteis</li>
                    <li>🎯 Seja específico sobre locais e experiências</li>
                    <li>❤️ Mostre sua paixão por viajar!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all whitespace-nowrap"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Publicando...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-fill"></i>
                  Publicar Blog
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
