import Post from "../models/post.model.js";
import createHttpError from "http-errors";

export async function createPost(req, res) {
    const post = await Post.create({
    ...req.body,
    user: req.session.user.id,
    });

    res.status(201).json(post);
}

export async function list(req, res) {
    const criteria = {};

    const postList = await Post.find(criteria).sort({ createdAt: -1 }).populate('comments');

    res.json(postList);
}

export async function deletePost(req, res) {
    const post = await Post.findById(req.params.id);

    if (post.user.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "It is not your post!");
    }

    await Post.findByIdAndDelete(post.id);

    res.status(204).end();
}