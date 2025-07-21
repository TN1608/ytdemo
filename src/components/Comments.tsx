'use client';

import {useState, useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {MessageCircle, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '@/context/AuthenticateProvider';
import {addComment, deleteComment, getComments} from "@/services/comments";

// Hàm tạo URL avatar ảo từ DiceBear
const getAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
};

interface Comment {
    id: string;
    videoId: string;
    userEmail: string;
    username: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    replies: Comment[];
}

interface CommentsProps {
    videoId: string;
}

const Comments = ({videoId}: CommentsProps) => {
    const {currentUser, isAuthenticated} = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [newComment, setNewComment] = useState<string>('');
    const [replyTo, setReplyTo] = useState<string>('');
    const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});


    const fetchComments = async () => {
        setLoading(true);
        try {
            const resp = await getComments(videoId);
            setComments(resp.data || []);
        } catch (err: any) {
            console.error('Error fetching comments:', err);
            toast.error(err.message || 'Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (commentId?: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để bình luận');
            window.location.href = '/signin';
            return;
        }
        const content = commentId ? replyInputs[commentId] : newComment;
        if (!content?.trim()) {
            toast.error('Bình luận không được để trống');
            return;
        }
        try {
            await addComment(videoId, content, commentId ?? '');
            if (commentId) {
                setReplyInputs((prev) => ({...prev, [commentId]: ''}));
                setReplyTo('');
            } else {
                setNewComment('');
            }
            toast.success('Bình luận đã được thêm');
            await fetchComments();
        } catch (err: any) {
            console.error('Error adding comment:', err);
            toast.error(err.message || 'Không thể thêm bình luận');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để xóa bình luận');
            window.location.href = '/signin';
            return;
        }
        if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
        try {
            await deleteComment(commentId);
            toast.success('Bình luận đã được xóa');
            await fetchComments();
        } catch (err: any) {
            console.error('Error deleting comment:', err);
            toast.error(err.message || 'Không thể xóa bình luận');
        }
    };

    useEffect(() => {
        if (videoId) fetchComments();
    }, [videoId]);

    const renderComment = (comment: Comment, depth: number = 0) => {
        const isReply = depth > 0;
        return (
            <div
                key={comment.id}
                className={`flex ${isReply ? 'ml-12 mt-2' : 'mt-4'} group`}
            >
                <img
                    src={getAvatarUrl(comment.username || comment.userEmail)}
                    alt={`${comment.username || comment.userEmail}'s avatar`}
                    className={`rounded-full ${isReply ? 'w-7 h-7 mt-1' : 'w-9 h-9'}`}
                />
                <div className="flex-1 ml-3">
                    <div
                        className={`bg-white dark:bg-accent/80 border border-accent-foreground/10 rounded-xl px-4 py-2 shadow-sm ${
                            isReply ? 'bg-gray-50 dark:bg-accent/60' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                            <span className="text-sm font-semibold text-accent-foreground/90">
                                                {comment.username || comment.userEmail}
                                            </span>
                                <span className="ml-2 text-xs text-accent-foreground/60">
                                                {new Date(comment.createdAt).toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'})}
                                            </span>
                            </div>
                            {currentUser?.email === comment.userEmail && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-accent-foreground/40 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Xóa bình luận"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-accent-foreground/80 mt-1 whitespace-pre-line">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {!isReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-accent-foreground/50 hover:text-blue-600 px-2"
                                onClick={() => setReplyTo(comment.id)}
                            >
                                <MessageCircle className="w-4 h-4 mr-1"/>
                                Reply
                            </Button>
                        )}
                    </div>
                    {replyTo === comment.id && (
                        <div className="flex gap-2 mt-2">
                            <Input
                                placeholder="Viết phản hồi..."
                                value={replyInputs[comment.id] || ''}
                                onChange={(e) =>
                                    setReplyInputs((prev) => ({...prev, [comment.id]: e.target.value}))
                                }
                                className="rounded-md border-gray-300"
                            />
                            <Button
                                onClick={() => handleAddComment(comment.id)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Send
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setReplyTo('')}
                                className="text-accent-foreground/50 hover:text-accent-foreground/80"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                    {comment.replies?.length > 0 && (
                        <div className="mt-1">
                            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 max-w-5xl mx-auto mt-4">
            <h3 className="text-lg font-semibold text-accent-foreground/80">Comments</h3>
            <div className="flex gap-2">
                <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="rounded-md border-gray-300"
                />
                <Button
                    onClick={() => handleAddComment()}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                >
                    Send
                </Button>
            </div>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-16 w-full rounded-lg"/>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-2">
                    {comments.map((comment) => renderComment(comment, 0))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">
                    No comments yet. Be the first to comment!
                </p>
            )}
        </div>
    );
};

export default Comments;