import User from '../models/user.model.js';
import Session from '../models/session.model.js';

export async function createUserSession(email, password, userName) {
    const user = await User.create({
        email,
        password,
        userName,
    });

    const session = await Session.create({ user: user._id });

    return {
        cookies: [`sessionId=${session._id.toString()}`],
        id: user.id,
    };
}

export async function createUser(email, password, userName) {
    const user = await User.create({
        email,
        password,
        userName,
    });

    return {
        email: user.email,
        password: user.password,
        userName: user.userName,
    };
}