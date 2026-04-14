import Comment from "../models/comment.model.js";
import createHttpError from "http-errors";

export async function createComment(req, res) {
    const comment = await Comment.create({
        ...req.body,
        user: req.session.user.id,
        post: req.params.id,
    });

    await comment.populate([ { path: "user", select: "id userName profilePicture", }, { path: "likes", populate: { path: "user", select: "id" } } ]);

    const io = req.app.get("io");

    io.emit("comment:created", comment);

    res.status(201).json(comment);
}

export async function deleteComment(req, res) {
    const comment = await Comment.findOne({
        _id: req.params.commentId,
        post: req.params.id,
    });
    
    if(!comment) {
            throw createHttpError(404, 'Comment not found');
    }

    if (comment.user.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "It is not your comment!");
    }

    await Comment.findByIdAndDelete(comment.id);

    const io = req.app.get("io");

    io.emit("comment:deleted", {postId: comment.post, commentId: comment.id});

    res.status(204).end();
}