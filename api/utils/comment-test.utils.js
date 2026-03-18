import Comment from '../models/comment.model.js';

export async function createComment(content, user, post) {
    const comment = await Comment.create({
        content,
        user,
        post,
    });

    return {
        id: comment.id,
        content: comment.content,
        user: comment.user,
        post: comment.post,
    };
}