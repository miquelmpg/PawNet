import Comment from "../models/comment.model.js";
import createHttpError from "http-errors";

export async function createComment(req, res) {
    const comment = await Comment.create({
        ...req.body,
        user: req.session.user.id,
        post: req.params.id,
    });

    res.status(201).json(comment);
}

export async function deleteComment(req, res) {
    const comment = await Comment.findOne({
        _id: req.params.commentId,
        post: req.params.id,
    });

    if (comment.user.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "It is not your comment!");
    }

    await Comment.findByIdAndDelete(comment.id);

    res.status(204).end();
}