import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
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

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    options: { sort: { createdAt: -1 } },
    foreignField: "post",
});

postSchema.virtual("likes", {
    ref: "Like",
    localField: "_id",
    foreignField: "targetId",
});

const Post = mongoose.model('Post', postSchema);

export default Post;