
import { useState, useEffect } from 'react';
import { FoodExperience, FoodReview, foodReviewService, foodExperienceService } from '../../../services/supabase';

interface ExperienceDetailModalProps {
  experience: FoodExperience;
  onClose: () => void;
  onUpdate: (updated: FoodExperience) => void;
}

export default function ExperienceDetailModal({ experience, onClose, onUpdate }: ExperienceDetailModalProps) {
  const [reviews, setReviews] = useState<FoodReview[]>([]);
  const [userReview, setUserReview] = useState<FoodReview | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    would_return: null as boolean | null
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  const currentUserId = 'user_123'; // Substituir por ID real do usuário autenticado

  useEffect(() => {
    loadReviews();
  }, [experience.id]);

  const loadReviews = async () => {
    if (!experience.id) return;
    
    try {
      const allReviews = await foodReviewService.getByExperience(experience.id);
      setReviews(allReviews);
      
      const myReview = await foodReviewService.getUserReview(experience.id, currentUserId);
      setUserReview(myReview);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  };

  const handleWouldReturn = async (wouldReturn: boolean) => {
    if (!experience.id) return;
    
    try {
      setLoading(true);
      const updated = await foodExperienceService.updateWouldReturn(experience.id, wouldReturn);
      onUpdate(updated);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!experience.id || reviewForm.rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setLoading(true);
      
      if (userReview) {
        await foodReviewService.update(userReview.id!, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          would_return: reviewForm.would_return
        });
      } else {
        await foodReviewService.create({
          experience_id: experience.id,
          user_id: currentUserId,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          would_return: reviewForm.would_return
        });
      }
      
      await loadReviews();
      setShowReviewForm(false);
      setReviewForm({ rating: 0, comment: '', would_return: null });
      
      // Recarregar experiência atualizada
      const updated = await foodExperienceService.getById(experience.id);
      onUpdate(updated);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = {
    restaurant: 'Restaurante',
    wine: 'Vinho',
    dish: 'Prato',
    drink: 'Drink'
  };

  const typeIcons = {
    restaurant: 'ri-restaurant-line',
    wine: 'ri-goblet-line',
    dish: 'ri-cake-3-line',
    drink: 'ri-cup-line'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header com Imagem */}
        <div className="relative h-64 bg-gradient-to-br from-orange-500 to-pink-500">
          {experience.image_url ? (
            <img
              src={experience.image_url}
              alt={experience.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className={`${typeIcons[experience.type]} text-8xl text-white/50`}></i>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <i className="ri-close-line text-xl text-gray-700"></i>
          </button>
          
          {/* Badge de Tipo */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-2">
            <i className={`${typeIcons[experience.type]} text-orange-600`}></i>
            <span className="text-sm font-semibold text-gray-700">{typeLabels[experience.type]}</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="p-6 md:p-8">
            {/* Título e Avaliação */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{experience.name}</h2>
              {experience.location && (
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <i className="ri-map-pin-line"></i>
                  <span>{experience.location}</span>
                </div>
              )}
              
              {/* Avaliação Média */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`text-2xl ${
                        star <= (experience.average_rating || experience.rating || 0)
                          ? 'ri-star-fill text-yellow-400'
                          : 'ri-star-line text-gray-300'
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {(experience.average_rating || experience.rating || 0).toFixed(1)}
                </span>
                {experience.reviews_count && experience.reviews_count > 0 && (
                  <span className="text-sm text-gray-500">
                    ({experience.reviews_count} {experience.reviews_count === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                )}
              </div>
            </div>

            {/* Botões de Ação - Volta ou Não Volta */}
            {experience.user_id === currentUserId && (
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl">
                <p className="text-sm font-medium text-gray-700 mb-3">Você voltaria aqui?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleWouldReturn(true)}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      experience.would_return === true
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                    }`}
                  >
                    <i className="ri-check-line mr-2"></i>
                    Voltaria Sim
                  </button>
                  <button
                    onClick={() => handleWouldReturn(false)}
                    disabled={loading}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      experience.would_return === false
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-red-50 border border-gray-200'
                    }`}
                  >
                    <i className="ri-close-line mr-2"></i>
                    Não Voltaria
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 px-2 font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-2 font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Avaliações ({reviews.length})
              </button>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'info' ? (
              <div className="space-y-4">
                {experience.price && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Faixa de Preço</p>
                    <p className="text-lg font-semibold text-gray-900">{experience.price}</p>
                  </div>
                )}
                
                {experience.date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Data da Visita</p>
                    <p className="text-lg text-gray-900">
                      {new Date(experience.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                
                {(experience.description || experience.notes) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Descrição</p>
                    <p className="text-gray-700 leading-relaxed">
                      {experience.description || experience.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Botão Adicionar/Editar Avaliação */}
                {!showReviewForm && (
                  <button
                    onClick={() => {
                      if (userReview) {
                        setReviewForm({
                          rating: userReview.rating,
                          comment: userReview.comment || '',
                          would_return: userReview.would_return || null
                        });
                      }
                      setShowReviewForm(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    <i className={`${userReview ? 'ri-edit-line' : 'ri-add-line'} mr-2`}></i>
                    {userReview ? 'Editar Minha Avaliação' : 'Adicionar Avaliação'}
                  </button>
                )}

                {/* Formulário de Avaliação */}
                {showReviewForm && (
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sua Avaliação *
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-4xl transition-colors"
                          >
                            <i className={`${star <= reviewForm.rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Você voltaria?
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, would_return: true })}
                          className={`flex-1 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                            reviewForm.would_return === true
                              ? 'bg-green-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, would_return: false })}
                          className={`flex-1 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                            reviewForm.would_return === false
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentário
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={3}
                        placeholder="Conte sobre sua experiência..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      ></textarea>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ rating: 0, comment: '', would_return: null });
                        }}
                        className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all whitespace-nowrap"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={loading || reviewForm.rating === 0}
                        className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {loading ? 'Salvando...' : 'Publicar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Avaliações */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="ri-chat-3-line text-5xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500">Nenhuma avaliação ainda</p>
                    <p className="text-sm text-gray-400">Seja o primeiro a avaliar!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                              <i className="ri-user-line text-white"></i>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.user_id === currentUserId ? 'Você' : 'Usuário'}
                              </p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`text-sm ${
                                      star <= review.rating
                                        ? 'ri-star-fill text-yellow-400'
                                        : 'ri-star-line text-gray-300'
                                    }`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {review.would_return !== null && review.would_return !== undefined && (
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              review.would_return
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {review.would_return ? 'Voltaria' : 'Não Voltaria'}
                            </div>
                          )}
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                        )}
                        
                        {review.created_at && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(review.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
