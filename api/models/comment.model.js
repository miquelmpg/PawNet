import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: { 
            createdAt: true, 
            updatedAt: false 
        },
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret._id;
            },
        },
    },
);

commentSchema.virtual("likes", {
    ref: "Like",
    localField: "_id",
    foreignField: "targetId",
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;