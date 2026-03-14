import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';
import createHttpError from "http-errors";

export async function toggle(req, res) {
    if (req.params.id === req.session.user.id) {
        throw createHttpError(400, 'you can not follow yourself')
    }

    const user = await User.findById(req.params.id);
    
    if(!user) {
        throw createHttpError(404, 'Recourse not found');
    }
    
    const follow = await Follow.findOne({ 
        follower: req.session.user.id,
        following: req.params.id,
    });

    if (!follow) {
        const newFollow = await Follow.create({
            follower: req.session.user.id,
            following: req.params.id,
        });
        res.status(201).json(newFollow);
    } else {
        await Follow.findByIdAndDelete(follow.id);
        res.status(204).end();
    }
}

export async function getFollowerList(req, res) {
    const user = await User.findById(req.params.id);
    
    if(!user) {
        throw createHttpError(404, 'Recourse not found');
    }

    const followerList = await Follow.find({ following: req.params.id }).populate('follower');
    res.json(followerList);
}

export async function getFollowersNumber(req, res) {
    const user = await User.findById(req.params.id);
    
    if(!user) {
        throw createHttpError(404, 'Recourse not found');
    }
    const followers = await Follow.countDocuments({ following: req.params.id });
    res.json(followers);
}

export async function getFollowingsNumber(req, res) {
    const user = await User.findById(req.params.id);
    
    if(!user) {
        throw createHttpError(404, 'Recourse not found');
    }
    
    const following = await Follow.countDocuments({ follower: req.params.id });
    res.json(following);
}