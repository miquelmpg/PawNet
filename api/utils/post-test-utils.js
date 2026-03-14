import Post from '../models/post.model.js';

export async function createPost(content, user) {
    const post = await Post.create({
        content,
        user,
    });

    return {
        id: post.id,
        content: post.content,
        user: post.user,
    };
}