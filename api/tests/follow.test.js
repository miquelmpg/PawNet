import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import Follow from '../models/follow.model.js';

describe('Follow API - complete CRUD', () => {
    let cookies;
    let id;

    beforeAll(async () => {
        const user = await User.create({
            email: "auth@tests.com",
            password: "password123",
            userName: 'JohnDoe',
        });

        const session = await Session.create({ user: user._id });
        cookies = [`sessionId=${session._id.toString()}`];
        id = user.id;
    });

    // ============================================
    // CREATE - POST /api/follows/:id/toggle
    // ============================================
    describe('POST /api/likes/:targetId/toggle', () => {
        it('should correctly follow a user', async () => {
            await Follow.deleteMany();

            const user1 = await User.create({
                email: 'user1@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            const session1 = await Session.create({ user: user1._id });
            const cookies1 = [`sessionId=${session1._id.toString()}`];

            const response = await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);
            
            expect(response.body.follower).toBe(user1.id);
            expect(response.body.following).toBe(id);
            expect(response.body.id).toBeDefined();

            const followInDB = await Follow.findById(response.body.id);
            expect(followInDB).not.toBeNull();
            expect(followInDB.following.toString()).toBe(id);
            expect(followInDB.follower.toString()).toBe(user1.id);
        });

        it('should correctly unfollow a user', async () => {
            await Follow.deleteMany();

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
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies2)
                .expect(204);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies3)
                .expect(201);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies4)
                .expect(201);

            const response = await request(app)
                .get(`/api/follows/${id}/followers`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(3);
        });

        it('should not follow or unfollow yourself', async () => {
            const response = await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies)
                .expect(400);

            expect(response.body.message).toBe('you can not follow yourself');
        });
    });

    // ============================================
    // GET - GET /api/follows/:id/followers
    // ============================================
    describe('GET /api/follows/:id/followers', () => {
        it('should return the number of followers', async () => {                
            const response = await request(app)
                .get(`/api/follows/${id}/followers`)
                .set("Cookie", cookies)
                .expect(200);
            
            expect(response.body).toEqual(3);
        });
    });
    
    // ============================================
    // GET - GET /api/follows/:id/following
    // ============================================
    describe('POST /api/likes/:targetId/toggle', () => {
        it('should return the number of following users', async () => {
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

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user2.id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);

            const response = await request(app)
                .get(`/api/follows/${user1.id}/following`)
                .set("Cookie", cookies)
                .expect(200);
            
            expect(response.body).toEqual(2);
        });
    });

    // // ============================================
    // // GET - GET /api/follows/:id/followers-list
    // // ============================================
    describe('POST /api/follows/:id/followers-list', () => {
        it('should return the followers list (populate)', async () => {
            const response = await request(app)
                .get(`/api/follows/${id}/followers-list`)
                .set("Cookie", cookies)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(0)
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it('should create, delete and get followers or following', async () => {
            await Follow.deleteMany();

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

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies2)
                .expect(204);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user1.id}/toggle`)
                .set("Cookie", cookies)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user2.id}/toggle`)
                .set("Cookie", cookies)
                .expect(201);

            const response = await request(app)
                .get(`/api/follows/${id}/followers`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(2);

            const response2 = await request(app)
                .get(`/api/follows/${id}/following`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response2.body).toEqual(2);

            const response3 = await request(app)
                .get(`/api/follows/${id}/followers-list`)
                .set("Cookie", cookies)
                .expect(200);

            expect(Array.isArray(response3.body)).toBe(true);
            expect(response3.body.length === 2).toBe(true)

            const response4 = await request(app)
                .get(`/api/follows/${user1.id}/followers-list`)
                .set("Cookie", cookies)
                .expect(200);

            expect(Array.isArray(response4.body)).toBe(true);
            expect(response4.body.length === 1).toBe(true)
        });
    });
});