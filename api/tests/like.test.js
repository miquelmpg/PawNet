import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';

describe('Like API - complete CRUD', () => {
    let cookies;
    let id;
    let newPost;
    let newComment;

    beforeAll(async () => {
        const user = await User.create({
            email: "auth@tests.com",
            password: "password123",
            userName: 'JohnDoe',
        });

        const session = await Session.create({ user: user._id });
        cookies = [`sessionId=${session._id.toString()}`];
        id = user.id;

        newPost = await Post.create({
            content: 'New post incoming',
            user: id,
        });

        newComment = await Comment.create({
            content: 'New comment incoming',
            user: id,
            post: newPost.id,
        })
    });

    // ============================================
    // CREATE - POST /api/likes/:targetId/toggle
    // ============================================
    describe('POST /api/likes/:targetId/toggle', () => {
        it('should correctly create a new like on a post', async () => {
            const response = await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set("Cookie", cookies)
                .expect(201);
            
            expect(response.body.user).toBe(id);
            expect(response.body.targetId).toBe(newPost.id);
            expect(response.body.id).toBeDefined();

            const likeInDB = await Like.findById(response.body.id);
            expect(likeInDB).not.toBeNull();
            expect(likeInDB.user.toString()).toBe(id);
            expect(likeInDB.targetId.toString()).toBe(newPost.id);
        });

        it('should correctly create a new like on a comment', async () => {
            const response = await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set("Cookie", cookies)
                .expect(201);
            
            expect(response.body.user).toBe(id);
            expect(response.body.targetId).toBe(newComment.id);
            expect(response.body.id).toBeDefined();

            const likeInDB = await Like.findById(response.body.id);
            expect(likeInDB).not.toBeNull();
            expect(likeInDB.user.toString()).toBe(id);
            expect(likeInDB.targetId.toString()).toBe(newComment.id);
        });

        it('should correctly delete a like from a post', async () => {
            const response = await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set("Cookie", cookies)
                .expect(204);

            const likeInDB = await Like.findById(response.body.id);
            expect(likeInDB).toBeNull();
        });

        it('should correctly delete a like from a comment', async () => {
            const response = await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set("Cookie", cookies)
                .expect(204);

            const likeInDB = await Like.findById(response.body.id);
            expect(likeInDB).toBeNull();
        });

        it('should return 400 if targetId belongs to a user', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .post(`/api/likes/${id}/toggle`)
                .set('Cookie', cookies)
                .expect(400);

            expect(response.body.message).toBe('Invalid post or comment id');
        });
    });

    // ============================================
    // GET COUNT LIKES - GET /api/likes/count-likes
    // ============================================
    describe('GET /api/likes/:targetId/count-likes', () => {
        it('should return 0 if there are no likes on a post', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .get(`/api/likes/${newPost.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(0);
        });

        it('should return 0 if there are no likes on a post', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .get(`/api/likes/${newComment.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(0);
        });

        it('should return 3 when 3 users like a post', async () => {
            await Like.deleteMany();

            const user1 = await User.create({
                email: 'user1@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session1 = await Session.create({ user: user1._id });
            const cookies1 = [`sessionId=${session1._id.toString()}`];

            const user2 = await User.create({
                email: 'user2@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session2 = await Session.create({ user: user2._id });
            const cookies2 = [`sessionId=${session2._id.toString()}`];

            const user3 = await User.create({
                email: 'user3@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session3 = await Session.create({ user: user3._id });
            const cookies3 = [`sessionId=${session3._id.toString()}`];

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies1)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies2)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies3)
                .expect(201);

            const response = await request(app)
                .get(`/api/likes/${newPost.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(3);
        });

        it('should return 4 when 4 users like a comment', async () => {
            await Like.deleteMany();

            const user1 = await User.create({
                email: 'user1@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session1 = await Session.create({ user: user1._id });
            const cookies1 = [`sessionId=${session1._id.toString()}`];

            const user2 = await User.create({
                email: 'user2@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session2 = await Session.create({ user: user2._id });
            const cookies2 = [`sessionId=${session2._id.toString()}`];

            const user3 = await User.create({
                email: 'user3@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session3 = await Session.create({ user: user3._id });
            const cookies3 = [`sessionId=${session3._id.toString()}`];

            const user4 = await User.create({
                email: 'user4@example.com',
                password: 'password123',
                userName: 'userFour',
            });

            const session4 = await Session.create({ user: user4._id });
            const cookies4 = [`sessionId=${session4._id.toString()}`];

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies1)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies2)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies3)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies4)
                .expect(201);

            const response = await request(app)
                .get(`/api/likes/${newPost.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(4);
        });

        it('should return 400 if targetId belongs to a user', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .get(`/api/likes/${id}/count-likes`)
                .set('Cookie', cookies)
                .expect(400);

            expect(response.body.message).toBe('Invalid post or comment id');
        });
    });

    // ============================================
    // GET IS LIKED - GET /api/likes/:targetId/is-liked
    // ============================================
    describe('GET /api/likes/:targetId/count-likes', () => {
        it('should return true if the user liked a post', async () => {
            await Like.deleteMany();

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies)
                .expect(201);

            const response = await request(app)
                .get(`/api/likes/${newPost.id}/is-liked`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.liked).toBe(true);
        });

        it('should return false if the user removed a like from a post', async () => {
            await Like.deleteMany();

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies)
                .expect(204);

            const response = await request(app)
                .get(`/api/likes/${newPost.id}/is-liked`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.liked).toBe(false);
        });

        it('should return true if the user liked a comment', async () => {
            await Like.deleteMany();

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies)
                .expect(201);

            const response = await request(app)
                .get(`/api/likes/${newComment.id}/is-liked`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.liked).toBe(true);
        });

        it('should return false if the user removed a like from a comment', async () => {
            await Like.deleteMany();

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies)
                .expect(204);

            const response = await request(app)
                .get(`/api/likes/${newComment.id}/is-liked`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.liked).toBe(false);
        });

        it('should return 400 if targetId belongs to a user', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .get(`/api/likes/${id}/is-liked`)
                .set('Cookie', cookies)
                .expect(400);

            expect(response.body.message).toBe('Invalid post or comment id');
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it("should create, delete, and get a user’s like", async () => {
            await Like.deleteMany();

            const user1 = await User.create({
                email: 'user1@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session1 = await Session.create({ user: user1._id });
            const cookies1 = [`sessionId=${session1._id.toString()}`];

            const user2 = await User.create({
                email: 'user2@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session2 = await Session.create({ user: user2._id });
            const cookies2 = [`sessionId=${session2._id.toString()}`];

            const user3 = await User.create({
                email: 'user3@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session3 = await Session.create({ user: user3._id });
            const cookies3 = [`sessionId=${session3._id.toString()}`];

            const user4 = await User.create({
                email: 'user4@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session4 = await Session.create({ user: user4._id });
            const cookies4 = [`sessionId=${session4._id.toString()}`];

            const user5 = await User.create({
                email: 'user5@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session5 = await Session.create({ user: user5._id });
            const cookies5 = [`sessionId=${session5._id.toString()}`];

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies1)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies2)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newPost.id}/toggle`)
                .set('Cookie', cookies3)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies4)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies5)
                .expect(201);

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies5)
                .expect(204);

            await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set('Cookie', cookies5)
                .expect(201);

            const response = await request(app)
                .get(`/api/likes/${newPost.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(3);

            const response2 = await request(app)
                .get(`/api/likes/${newComment.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response2.body).toEqual(2);

            const response3 = await request(app)
                .get(`/api/likes/${newComment.id}/is-liked`)
                .set('Cookie', cookies5)
                .expect(200);

            expect(response3.body.liked).toBe(true);

            const response4 = await request(app)
                .get(`/api/likes/${newComment.id}/is-liked`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response4.body.liked).toBe(false);
        });
    });
});