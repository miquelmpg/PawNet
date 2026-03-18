import "../models/pet.model.js";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import createHttpError from "http-errors";

export async function create(req, res) {
    const user = await User.create(req.body);

    res.status(201).json(user);
}

export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        throw createHttpError(400, "missing email or password");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw createHttpError(401, "user not found");
    }

    const match = await user.checkPassword(password);

    if (!match) {
        throw createHttpError(401, "invalid password");
    }

    const session = await Session.create({ user: user.id });

    res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: process.env.COOKIE_SECURE === "true" ? "none" : undefined,
    });

    res.json(user);
}

export async function logout(req, res) {
    await Session.findByIdAndDelete(req.session.id);

    res.status(204).end();
}

export async function detail(req, res) {
    const id = req.params.id === "me" ? req.session.user.id : req.params.id;

    let userPromise = User.findById(id).populate("posts").populate('pets');

    const user = await userPromise;

    if (!user) {
        throw createHttpError(404, "User not found");
    }

    res.json(user);
}

export async function update(req, res) {
    delete req.body.email;

    const user = await User.findById(req.params.id);

    if(!user) {
        throw createHttpError(404, 'User not found');
    }

    if (user.id.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "You are not allowed to update this account!");
    }

    Object.assign(req.session.user, req.body);

    if (req.file) {
        req.session.user.avatarUrl = req.file.path;
    }

    await req.session.user.save();
    res.json(req.session.user);
}

export async function usersList(req, res) {
    const criteria = {};

    if (req.query.userName) {
        criteria.userName = {
            $regex: req.query.userName,
            $options: "i",
        };
    }

    const userNames = await User.find(criteria);

    res.json(userNames);
}

export async function remove(req, res) {
    const user = await User.findById(req.params.id);

    if(!user) {
        throw createHttpError(404, 'User not found');
    }

    if (user.id.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "You are not allowed to delete this account!");
    }

    await User.findByIdAndDelete(user.id);

    res.status(204).end();
}