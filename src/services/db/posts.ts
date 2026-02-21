import { supabase } from './client';
import type { Post, FeedPost, Like, Comment, Story, Reel, SavedPost } from './types';

export const getPosts = async (limit = 20, offset = 0) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as Post[];
};

export const getPostsByUser = async (userId: string) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
};

export const getFeedPosts = async (limit = 20, offset = 0, targetUserId?: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser?.id;

    let query = supabase.from('posts').select(`
      *,
      users (
        username,
        avatar_url,
        privacy_setting
      )
    `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    let followedUserIds: string[] = [];

    if (targetUserId) {
        query = query.eq('user_id', targetUserId);
        // ... privacy logic for target user ...
        const { data: targetUser } = await supabase.from('users').select('privacy_setting').eq('id', targetUserId).single();
        if (targetUser?.privacy_setting === 'private' && targetUserId !== currentUserId) {
            const { count } = await supabase.from('followers').select('*', { count: 'exact', head: true })
                .eq('follower_id', currentUserId).eq('following_id', targetUserId).eq('status', 'accepted');
            if (!count) return [];
        }
        // Similar check for friends...
        else if (targetUser?.privacy_setting === 'friends' && targetUserId !== currentUserId) {
            const { count } = await supabase.from('followers').select('*', { count: 'exact', head: true })
                .eq('follower_id', currentUserId).eq('following_id', targetUserId).eq('status', 'accepted');
            if (!count) return [];
        }
    } else {
        // General Feed
        if (currentUserId) {
            const { data: followingUsers } = await supabase.from('followers').select('following_id').eq('follower_id', currentUserId).eq('status', 'accepted');
            followedUserIds = followingUsers?.map(f => f.following_id) || [];
            followedUserIds.push(currentUserId);

            const followedStr = `(${followedUserIds.join(',')})`;
            query = query.or(`visibility.eq.public,user_id.in.${followedStr},user_id.eq.${currentUserId}`);
        } else {
            query = query.eq('visibility', 'public'); // Guest
        }
    }

    const { data: rawPosts, error } = await query;
    if (error) throw error;

    let validPosts = rawPosts;

    // In-Memory Privacy Filter for General Feed
    if (!targetUserId && currentUserId) {
        const followedSet = new Set(followedUserIds);
        validPosts = rawPosts.filter((post: any) => {
            if (post.user_id === currentUserId) return true;
            if (followedSet.has(post.user_id)) return true; // Followed users (trust queries)
            // Non-followed: Only show if User is Public AND Post is Public
            return post.users?.privacy_setting === 'public' && post.visibility === 'public';
        });
    } else if (!targetUserId && !currentUserId) {
        // Guest: Strict check
        validPosts = rawPosts.filter((post: any) => post.users?.privacy_setting === 'public' && post.visibility === 'public');
    }


    // If there's no logged-in user, we can't check isLiked/isSaved properly, defaults to false
    // Or we can do a secondary query if we have a user
    let likedPostIds = new Set<string>();
    let savedPostIds = new Set<string>();

    if (currentUser) {
        const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', currentUser.id);

        const { data: saved } = await supabase
            .from('saved_posts')
            .select('post_id')
            .eq('user_id', currentUser.id);

        likes?.forEach(l => likedPostIds.add(l.post_id));
        saved?.forEach(s => savedPostIds.add(s.post_id));
    }

    // Map to FeedPost format
    return validPosts.map((post: any) => {
        // Calculate timeAgo
        const created = new Date(post.created_at);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
        let timeAgo = '';

        if (diffInSeconds < 60) timeAgo = 'Just now';
        else if (diffInSeconds < 3600) timeAgo = `${Math.floor(diffInSeconds / 60)}m ago`;
        else if (diffInSeconds < 86400) timeAgo = `${Math.floor(diffInSeconds / 3600)}h ago`;
        else timeAgo = `${Math.floor(diffInSeconds / 86400)}d ago`;

        return {
            id: post.id,
            username: post.users?.username || 'Unknown',
            userAvatar: post.users?.avatar_url || 'https://via.placeholder.com/40',
            location: post.location || '',
            image: post.image_url || '',
            likes: post.likes_count || 0,
            caption: post.caption || '',
            comments: post.comments_count || 0,
            timeAgo,
            isLiked: likedPostIds.has(post.id),
            isSaved: savedPostIds.has(post.id),
            userId: post.user_id,
            visibility: post.visibility,
            media_urls: post.media_urls || [],
        } as FeedPost;
    });
};

export const getRecentStories = async () => {
    // To keep it simple and fulfill "reais dos usuarios", we'll fetch users 
    // who have posts, ordered by their latest post.
    const { data, error } = await supabase
        .from('posts')
        .select(`
      user_id,
      users (
        id,
        username,
        avatar_url,
        full_name
      )
    `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;

    // Deduplicate users
    const usersMap = new Map();
    data?.forEach((post: any) => {
        const userData = post.users;
        if (userData && !usersMap.has(userData.id)) {
            usersMap.set(userData.id, {
                id: userData.id,
                username: userData.username,
                avatar: userData.avatar_url,
                hasStory: true
            });
        }
    });

    return Array.from(usersMap.values());
};

export const uploadPostImage = async (file: File | Blob) => {
    return uploadFile('posts', file);
};

export const uploadFile = async (bucket: string, file: File | Blob) => {
    let fileExt = 'png'; // Default for blobs if type not found
    if (file instanceof File) {
        fileExt = file.name.split('.').pop() || 'png';
    } else if (file.type) {
        fileExt = file.type.split('/')[1] || 'png';
    }

    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
};


export const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('posts')
        .insert({
            ...post,
            user_id: user?.id
        })
        .select()
        .single();

    if (error) throw error;
    return data as Post;
};

export const updatePost = async (postId: string, updates: Partial<Pick<Post, 'caption' | 'location' | 'image_url' | 'visibility' | 'media_urls'>>) => {
    const { data, error } = await supabase
        .from('posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .select()
        .single();

    if (error) throw error;
    return data as Post;
};


export const deletePost = async (postId: string) => {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) throw error;
};

// ==================== CURTIDAS ====================

export const likePost = async (postId: string, userId: string) => {
    const { data, error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId })
        .select()
        .single();

    if (error) throw error;
    return data as Like;
};

export const unlikePost = async (postId: string, userId: string) => {
    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

    if (error) throw error;
};

export const getPostLikes = async (postId: string) => {
    const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId);

    if (error) throw error;
    return data as Like[];
};

// ==================== COMENTÁRIOS ====================

export const getComments = async (postId: string) => {
    const { data, error } = await supabase
        .from('comments')
        .select('*, user:users!comments_user_id_fkey(*)') // Assuming foreign key name
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Comment[];
};

export const createComment = async (comment: Omit<Comment, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();

    if (error) throw error;

    // Try to increment comment count on post
    try {
        const { data: postData } = await supabase
            .from('posts')
            .select('comments_count')
            .eq('id', comment.post_id)
            .single();

        if (postData) {
            await supabase
                .from('posts')
                .update({ comments_count: (postData.comments_count || 0) + 1 })
                .eq('id', comment.post_id);
        }
    } catch (err) {
        console.error('Error incrementing comment count:', err);
    }

    return data as Comment;
};

export const updateComment = async (commentId: string, content: string) => {
    const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single();

    if (error) throw error;
    return data as Comment;
};

export const deleteComment = async (commentId: string) => {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) throw error;
};

// ==================== STORIES ====================

export const storyService = {
    async getAll(): Promise<Story[]> {
        const { data, error } = await supabase
            .from('stories')
            .select('*, users(username, avatar_url)')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Story[];
    },

    async getByUser(userId: string): Promise<Story[]> {
        const { data, error } = await supabase
            .from('stories')
            .select('*, users(username, avatar_url)')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Story[];
    },

    async getActiveStories(): Promise<Story[]> {
        return this.getAll();
    },

    async create(story: Omit<Story, 'id' | 'created_at' | 'expires_at' | 'users'>): Promise<Story> {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('stories')
            .insert({
                ...story,
                user_id: user?.id
            })
            .select('*, users(username, avatar_url)')
            .single();

        if (error) throw error;
        return data as Story;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('stories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async markAsViewed(id: string): Promise<void> {
        const { error } = await supabase.rpc('increment_story_views', { story_id: id });
        if (error) {
            // If RPC fails, fallback to simple update
            await supabase
                .from('stories')
                .update({ views_count: supabase.rpc('increment', { row: 'views_count', x: 1 }) })
                .eq('id', id);
        }
    }
};

// ==================== REELS ====================

export const reelService = {
    async getAll(): Promise<Reel[]> {
        const { data, error } = await supabase
            .from('reels')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Reel[];
    },

    async getById(id: string): Promise<Reel> {
        const { data, error } = await supabase
            .from('reels')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Reel;
    },

    async create(reel: Omit<Reel, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>): Promise<Reel> {
        const { data, error } = await supabase
            .from('reels')
            .insert(reel)
            .select()
            .single();

        if (error) throw error;
        return data as Reel;
    },

    async update(id: string, updates: Partial<Reel>): Promise<Reel> {
        const { data, error } = await supabase
            .from('reels')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Reel;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('reels')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async incrementViews(id: string): Promise<void> {
        const { error } = await supabase.rpc('increment_reel_views', { reel_id: id });
        if (error) throw error;
    }
};

// ==================== POSTS SALVOS ====================

export const savedPostService = {
    async getAll(userId: string): Promise<SavedPost[]> {
        const { data, error } = await supabase
            .from('saved_posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as SavedPost[];
    },

    async save(userId: string, postId: string): Promise<SavedPost> {
        const { data, error } = await supabase
            .from('saved_posts')
            .insert({ user_id: userId, post_id: postId })
            .select()
            .single();

        if (error) throw error;
        return data as SavedPost;
    },

    async unsave(userId: string, postId: string): Promise<void> {
        const { error } = await supabase
            .from('saved_posts')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

        if (error) throw error;
    },

    async isSaved(userId: string, postId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', userId)
            .eq('post_id', postId)
            .single();

        return !error && !!data;
    },

    async getSavedPosts(userId: string): Promise<FeedPost[]> {
        const { data: saved, error: savedError } = await supabase
            .from('saved_posts')
            .select(`
        post_id,
      posts(
          *,
        users(
          username,
          avatar_url
        )
      )
        `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (savedError) throw savedError;

        // Filter out potential null posts and map to FeedPost format
        const posts = saved
            .filter(s => s.posts !== null)
            .map(s => {
                const p = s.posts as any;
                return {
                    id: p.id,
                    username: p.users.username,
                    userAvatar: p.users.avatar_url,
                    location: p.location || '',
                    image: p.image_url,
                    likes: p.likes_count,
                    caption: p.caption || '',
                    comments: p.comments_count,
                    timeAgo: new Date(p.created_at).toLocaleDateString(),
                    isLiked: false, // Will be checked in the frontend or we could secondary query
                    isSaved: true,
                    userId: p.user_id
                } as FeedPost;
            });

        return posts;
    }
};

// ==================== EXPLORAR & BUSCA ====================

export const getExplorePosts = async (limit = 30) => {
    // Only show public posts from public users in Explore
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      users!inner(
        username,
        avatar_url,
        privacy_setting
      )
      `)
        .eq('visibility', 'public')
        .eq('users.privacy_setting', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return data.map((post: any) => ({
        id: post.id,
        username: post.users?.username || 'Unknown',
        userAvatar: post.users?.avatar_url || '',
        location: post.location || '',
        image: post.image_url || '',
        likes: post.likes_count || 0,
        caption: post.caption || '',
        comments: post.comments_count || 0,
        timeAgo: new Date(post.created_at).toLocaleDateString(),
        isLiked: false,
        isSaved: false,
        userId: post.user_id,
        visibility: post.visibility,
    }));
};

export const searchPosts = async (query: string) => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      id,
      caption,
      image_url,
      users!inner(
        username,
        privacy_setting
      )
        `)
        .ilike('caption', `%${query}%`)
        .eq('visibility', 'public') // Only public posts
        .eq('users.privacy_setting', 'public') // Only from public users
        .limit(10);

    if (error) throw error;
    return data;
};
