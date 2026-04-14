import Post from "../models/post.model.js";
import User from '../models/user.model.js';
import createHttpError from "http-errors";

export async function createPost(req, res) {
    const post = await Post.create({
    ...req.body,
    user: req.session.user.id,
    });

    await post.populate([ { path: "user", select: "id userName profilePicture", }, { path: "likes", populate: { path: "user", select: "id" } } ]);

    const io = req.app.get("io");

    io.emit("post:created", post);

    res.status(201).json(post);
}

export async function postsList(req, res) {
    const criteria = {};

    if (req.query.content) {
        criteria.content = {
            $regex: req.query.content,
            $options: "i",
        };
    };
        
    if (req.query.minDate || req.query.maxDate) {
        criteria.createdAt = {};

        if (req.query.minDate) {
            criteria.createdAt = { $gte: req.query.minDate };
        }

        if (req.query.maxDate) {
            criteria.createdAt = { $lte: req.query.maxDate };
        }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const postList = await Post
        .find(criteria)
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate({ path: 'user', select: 'id userName profilePicture' })
        .populate({ path: 'comments', populate: [ { path: 'user', select: 'id userName profilePicture' }, { path: 'likes', populate: { path: 'user', select: '_id userName profilePicture' } }]})
        .populate({ path: 'likes', populate: { path: 'user', select: 'id' } });
    
    postList.forEach(post => {
    post.comments.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )});

    res.json(postList);
}

export async function postsListByUser(req, res) {
    const user = await User.findById(req.params.id);

    if(!user) {
        throw createHttpError(404, 'User not found');
    }

    const { id } = req.params

    const criteria = {user: id};

    const postList = await Post
        .find(criteria)
        .sort({ createdAt: -1 })
        .populate({ path: 'user', select: 'id userName profilePicture' })
        .populate({ path: 'comments', populate: [ { path: 'user', select: 'id userName profilePicture' }, { path: 'likes', populate: { path: 'user', select: '_id userName profilePicture' } }]})
        .populate({ path: 'likes', populate: { path: 'user', select: 'id' } });
    
    postList.forEach(post => {
    post.comments.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )});

    res.json(postList);
}

export async function deletePost(req, res) {
    const post = await Post.findById(req.params.id);

    if(!post) {
        throw createHttpError(404, 'Post not found');
    }

    if (post.user.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "It is not your post!");
    }

    await Post.findByIdAndDelete(post.id);

    const io = req.app.get("io");

    io.emit("post:deleted", post.id);

    res.status(204).end();
}