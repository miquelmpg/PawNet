import Follow from '../models/follow.model.js';

export async function toggle(req, res) {
    const follow = await Follow.findOne({ 
        follower: req.session.user.id,
        following: req.body.id,
    });

    if (!follow) {
        const newFollow = await Follow.create({
            follower: req.session.user.id,
            following: req.body.id,
        });
        res.json(newFollow);
    } else {
        await Follow.findByIdAndDelete(follow.id);
        res.status(204).end();
    }
}

export async function getFollowers(req, res) {
    const followers = await Follow.countDocuments({ following: req.session.user.id });
    res.json(followers);
}

export async function getFollowings(req, res) {
    const following = await Follow.countDocuments({ follower: req.session.user.id });
    res.json(following);
}