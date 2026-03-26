import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        password: {
            type: String,
            required: true,
            minLength: 10,
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        profilePicture: {
            type: String,
            default: function () {
                return `https://i.pravatar.cc/300?u=${encodeURIComponent(this.email)}`;
            },
        },
        location: {
            type: String,
            trim: true,
        },
        birthday: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.password;
            },
        },
    },
);

userSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "user",
});

userSchema.virtual("pets", {
    ref: "Pet",
    localField: "_id",
    foreignField: "owner",
});

userSchema.virtual("following", {
    ref: "Follow",
    localField: "_id",
    foreignField: "follower",
});

userSchema.virtual("followers", {
    ref: "Follow",
    localField: "_id",
    foreignField: "following",
});

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    };
});

userSchema.methods.checkPassword = function (passwordToCheck) {
    return bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;