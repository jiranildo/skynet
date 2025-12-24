import { useState, useEffect } from 'react';
import CreateBlogModal from './CreateBlogModal';

interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  content: string;
  likes: number;
  comments: number;
  views: number;
  tags: string[];
  isAIGenerated?: boolean;
}

export default function BlogsTab() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = () => {
    const mockBlogs: BlogPost[] = [
      {
        id: '1',
        title: '10 Destinos Imperdíveis para 2025',
        subtitle: 'Descubra os lugares mais incríveis para visitar no próximo ano',
        coverImage: 'https://readdy.ai/api/search-image?query=beautiful%20travel%20destinations%20world%20map%20colorful%20pins%20adventure%20exploration%20wanderlust&width=800&height=500&seq=blog-1&orientation=landscape',
        date: '15 Dez 2024',
        readTime: '8 min',
        category: 'Dicas de Viagens',
        excerpt: 'Prepare-se para conhecer os destinos mais fascinantes que prometem ser tendência em 2025. De praias paradisíacas a cidades históricas...',
        content: 'Conteúdo completo do blog...',
        likes: 234,
        comments: 45,
        views: 1823,
        tags: ['Destinos', 'Planejamento', 'Tendências'],
        isAIGenerated: false
      },
      {
        id: '2',
        title: 'Como Economizar em Viagens Internacionais',
        subtitle: 'Dicas práticas para viajar mais gastando menos',
        coverImage: 'https://readdy.ai/api/search-image?query=travel%20budget%20savings%20money%20piggy%20bank%20passport%20tickets%20affordable%20vacation%20planning&width=800&height=500&seq=blog-2&orientation=landscape',
        date: '10 Dez 2024',
        readTime: '6 min',
        category: 'Economia',
        excerpt: 'Viajar não precisa ser caro! Descubra estratégias comprovadas para economizar em passagens, hospedagem e experiências...',
        content: 'Conteúdo completo do blog...',
        likes: 567,
        comments: 89,
        views: 3421,
        tags: ['Economia', 'Dicas', 'Budget'],
        isAIGenerated: false
      },
      {
        id: '3',
        title: 'Guia Completo: Primeira Viagens Solo',
        subtitle: 'Tudo que você precisa saber para viajar sozinho',
        coverImage: 'https://readdy.ai/api/search-image?query=solo%20traveler%20backpack%20adventure%20freedom%20independent%20journey%20exploring%20alone%20confident&width=800&height=500&seq=blog-3&orientation=landscape',
        date: '5 Dez 2024',
        readTime: '10 min',
        category: 'Viagens Solo',
        excerpt: 'Viajar sozinho é uma experiência transformadora. Aprenda como planejar, se manter seguro e aproveitar ao máximo...',
        content: 'Conteúdo completo do blog...',
        likes: 892,
        comments: 156,
        views: 5234,
        tags: ['Solo', 'Segurança', 'Independência'],
        isAIGenerated: false
      }
    ];
    setBlogPosts(mockBlogs);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              📝 Blogs de Viagens
            </h2>
            <p className="text-sm text-gray-600">
              Dicas, guias e histórias de viagens incríveis
            </p>
          </div>
        </div>
      </div>

      {/* Blogs Content */}
      <div className="space-y-4">
        {/* Create Blog Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <i className="ri-add-line text-xl"></i>
          Criar Novo Blog
        </button>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {blogPosts.map((blog) => (
            <div
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">
                    {blog.category}
                  </span>
                </div>
                {blog.isAIGenerated && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                      <i className="ri-robot-2-line"></i>
                      IA
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>
                    {blog.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-time-line"></i>
                    {blog.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {blog.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="ri-heart-line"></i>
                      {blog.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-chat-3-line"></i>
                      {blog.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-eye-line"></i>
                      {blog.views}
                    </span>
                  </div>
                  <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
                    Ler mais →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBlog(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-64 sm:h-96">
              <img
                src={selectedBlog.coverImage}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-384px)]">
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-medium">
                  {selectedBlog.category}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  {selectedBlog.date}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  {selectedBlog.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {selectedBlog.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {selectedBlog.subtitle}
              </p>

              <div className="flex items-center justify-between py-4 border-y border-gray-200 mb-6">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                    <i className="ri-heart-line text-xl"></i>
                    <span className="font-medium">{selectedBlog.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                    <i className="ri-chat-3-line text-xl"></i>
                    <span className="font-medium">{selectedBlog.comments}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-500">
                    <i className="ri-eye-line text-xl"></i>
                    <span className="font-medium">{selectedBlog.views}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
                  <i className="ri-share-line text-xl"></i>
                  <span className="font-medium">Compartilhar</span>
                </button>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedBlog.excerpt}
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {selectedBlog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <CreateBlogModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
