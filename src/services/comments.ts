import api from "@/utils/axios";

export const getComments = async (videoId: string) => {
    try{
        const resp = await api.get('/comments', {
            params: { videoId }
        })
        return resp.data;
    }catch (err: any) {
        console.error('Error fetching comments:', err);
        throw new Error(err.message || 'Failed to fetch comments');
    }
}

export const addComment = async  (videoId: string, content: string, parentId: string) => {
    try {
        const resp = await api.post('/comment', { videoId, content, parentId });
        return resp.data;
    } catch (err: any) {
        console.error('Error adding comment:', err);
        throw new Error(err.message || 'Failed to add comment');
    }
}

export const deleteComment = async (commentId: string) => {
    try {
        const resp = await api.delete(`/comment/${commentId}`);
        return resp.data;
    } catch (err: any) {
        console.error('Error deleting comment:', err);
        throw new Error(err.message || 'Failed to delete comment');
    }
}