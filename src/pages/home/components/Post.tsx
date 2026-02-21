import { useState, useEffect, useRef } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { supabase, deletePost, updatePost, likePost, unlikePost, savedPostService, getComments, createComment, updateComment, deleteComment } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';

interface PostProps {
  post: any; // Using any for now to facilitate prop passing, as FeedPost has some field differences (image vs image_url)
  onEdit?: (post: any) => void;
}

export default function Post({ post, onEdit }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likes, setLikes] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const { user } = useAuth();

  const media = (post.media_urls && post.media_urls.length > 0)
    ? post.media_urls
    : (post.image ? [post.image] : []);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => { }
  });

  const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' | 'success' = 'info') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'OK',
      cancelText: '',
      onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm
    });
  };

  useEffect(() => {
    const checkOwner = async () => {
      if (user && user.id === post.userId) {
        setIsOwner(true);
      }
    };
    checkOwner();
  }, [user, post.userId]);

  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showComments) {
      loadComments();
      // Wait for render animation/expansion
      setTimeout(() => {
        commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showComments]);

  const loadComments = async () => {
    try {
      const data = await getComments(post.id);
      setCommentsData(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    const wasLiked = isLiked;
    // Optimistic update
    setIsLiked(!wasLiked);
    setLikes(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (wasLiked) {
        await unlikePost(post.id, user.id);
      } else {
        await likePost(post.id, user.id);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Rollback on error
      setIsLiked(wasLiked);
      setLikes(likes);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      if (wasSaved) {
        await savedPostService.unsave(user.id, post.id);
      } else {
        await savedPostService.save(user.id, post.id);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(wasSaved);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const newComment = await createComment({
        post_id: post.id,
        user_id: user.id,
        content: commentText.trim(),
        parent_id: replyTo?.id
      });

      // Add real user info to local state for immediate display
      const commentWithUser = {
        ...newComment,
        users: {
          username: user.email?.split('@')[0] || 'você',
          avatar_url: '' // We could fetch this but let's keep it simple
        }
      };

      setCommentsData([...commentsData, commentWithUser]);
      setCommentText('');
      setCommentCount(commentCount + 1);
      setReplyTo(null); // Clear reply context after submitting
    } catch (error) {
      console.error("Error posting comment:", error);
      showAlert('Erro', 'Erro ao publicar comentário.', 'danger');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    showConfirm(
      'Excluir comantário?',
      'Tem certeza que deseja excluir este comentário?',
      async () => {
        try {
          await deleteComment(commentId);
          setCommentsData(prevComments => prevComments.filter(c => c.id !== commentId));
          setCommentCount(prev => prev - 1);
        } catch (error) {
          console.error("Error deleting comment:", error);
          showAlert('Erro', 'Erro ao excluir comentário.', 'danger');
        }
      }
    );
  };

  const handleCommentEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.content);
    setReplyTo(null);
  };

  const handleCommentUpdate = async () => {
    if (!editingCommentId || !commentText.trim()) return;
    try {
      setIsSubmittingComment(true);
      const updated = await updateComment(editingCommentId, commentText.trim());
      setCommentsData(commentsData.map(c => c.id === editingCommentId ? { ...c, content: updated.content } : c));
      setEditingCommentId(null);
      setCommentText('');
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setReplyTo(null);
    setCommentText('');
  };

  const formatCommentDate = (date: string) => {
    const created = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Skynet Post',
      text: `Confira este post de ${post.username}: "${post.caption}"`,
      url: window.location.href // Or a specific post link if we had routes for posts
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showAlert('Sucesso', 'Link copiado para a área de transferência!', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = async () => {
    showConfirm(
      'Excluir Postagem',
      'Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.',
      async () => {
        try {
          setIsDeleting(true);
          await deletePost(post.id);
          window.location.reload(); // Simple refresh
        } catch (error) {
          console.error("Error deleting post:", error);
          showAlert('Erro', 'Erro ao excluir postagem.', 'danger');
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };


  if (isDeleting) return null;

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden relative">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[2px]">
            <img
              src={post.userAvatar}
              alt={post.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm sm:text-base text-gray-900">{post.username}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{post.location}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-600 hover:text-gray-900 p-1 sm:p-2"
          >
            <i className="ri-more-2-fill text-lg sm:text-xl"></i>
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
              {isOwner ? (
                <>
                  <button
                    onClick={() => { onEdit?.(post); setShowOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <i className="ri-edit-line"></i> Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <i className="ri-delete-bin-line"></i> Excluir
                  </button>
                </>
              ) : (
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <i className="ri-flag-line"></i> Denunciar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Image / Carousel */}
      {media.length > 0 && (
        <div className="relative w-full bg-gray-50 flex items-center justify-center group p-2">
          <img
            src={media[currentMediaIndex]}
            alt={`Post ${currentMediaIndex + 1}`}
            className="w-full h-auto max-h-[600px] object-contain rounded-lg"
          />

          {/* Carousel Controls */}
          {media.length > 1 && (
            <>
              {/* Previous */}
              {currentMediaIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening post details if implemented
                    setCurrentMediaIndex(prev => prev - 1);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <i className="ri-arrow-left-s-line text-xl"></i>
                </button>
              )}

              {/* Next */}
              {currentMediaIndex < media.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex(prev => prev + 1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <i className="ri-arrow-right-s-line text-xl"></i>
                </button>
              )}

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
                {media.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>

              {/* Counter Badge */}
              <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[10px] text-white font-medium">
                {currentMediaIndex + 1}/{media.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Actions & Content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleLike}
              className="hover:scale-110 transition-transform"
            >
              <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-700'} text-xl sm:text-2xl`}></i>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:scale-110 transition-transform"
            >
              <i className="ri-chat-3-line text-xl sm:text-2xl text-gray-700"></i>
            </button>
            <button
              onClick={handleShare}
              className="hover:scale-110 transition-transform"
            >
              <i className="ri-share-forward-line text-xl sm:text-2xl text-gray-700"></i>
            </button>
          </div>
          <button
            onClick={handleSave}
            className="hover:scale-110 transition-transform"
          >
            <i className={`${isSaved ? 'ri-bookmark-fill text-yellow-500' : 'ri-bookmark-line'} text-xl sm:text-2xl text-gray-700`}></i>
          </button>
        </div>

        <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1 sm:mb-2 text-left">
          {likes.toLocaleString()} curtidas
        </p>

        <div className="mb-1 sm:mb-2 text-left">
          <p className="text-sm sm:text-base text-gray-900">
            <span className="font-semibold mr-2">{post.username}</span>
            <span className="text-gray-700">{post.caption}</span>
          </p>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="block text-xs sm:text-sm text-gray-500 hover:text-gray-700 mb-1 sm:mb-2"
        >
          Ver todos os {commentCount} comentários
        </button>

        <p className="text-[10px] sm:text-xs text-gray-400 uppercase text-left">{post.timeAgo}</p>

        {showComments && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
              {commentsData.map((comment) => (
                <div key={comment.id} className={`flex gap-2 text-left ${comment.parent_id ? 'ml-8' : ''}`}>
                  {comment.users?.avatar_url && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mt-1">
                      <img src={comment.users.avatar_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold mr-2">{comment.users?.username}</span>
                          <span className="text-gray-700">{comment.content}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500">{formatCommentDate(comment.created_at)}</span>
                          <button
                            onClick={() => {
                              setReplyTo(comment);
                              setEditingCommentId(null);
                              setCommentText(`@${comment.users?.username} `);
                            }}
                            className="text-[10px] font-bold text-gray-500 hover:text-gray-700"
                          >
                            Responder
                          </button>
                          {user && user.id === comment.user_id && (
                            <>
                              <button
                                onClick={() => handleCommentEdit(comment)}
                                className="text-[10px] font-bold text-gray-500 hover:text-gray-700"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleCommentDelete(comment.id)}
                                className="text-[10px] font-bold text-gray-500 hover:text-red-600"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {commentsData.length === 0 && (
                <p className="text-xs text-center text-gray-500 py-2">Nenhum comentário ainda. Seja o primeiro!</p>
              )}
            </div>

            {/* Add Comment */}
            {(replyTo || editingCommentId) && (
              <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-t-lg text-[10px] text-gray-500 border-x border-t border-gray-200">
                <span>{editingCommentId ? 'Editando comentário' : `Respondendo a @${replyTo.users?.username}`}</span>
                <button onClick={handleCancelEdit} className="text-gray-700 hover:text-black">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-3 py-2 border-t border-gray-100">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (editingCommentId ? handleCommentUpdate() : handleCommentSubmit())}
                placeholder={replyTo ? "Escreva uma resposta..." : "Adicione um comentário..."}
                disabled={isSubmittingComment}
                className="flex-1 text-xs sm:text-sm outline-none bg-transparent"
              />
              <button
                onClick={editingCommentId ? handleCommentUpdate : handleCommentSubmit}
                disabled={isSubmittingComment || !commentText.trim()}
                className={`font-semibold text-xs sm:text-sm whitespace-nowrap ${isSubmittingComment || !commentText.trim()
                  ? 'text-gray-300'
                  : 'text-orange-500 hover:text-orange-600'
                  }`}
              >
                {isSubmittingComment ? '...' : editingCommentId ? 'Salvar' : 'Publicar'}
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </article >
  );
}
