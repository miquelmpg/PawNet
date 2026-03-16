import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Follow from '../models/follow.model.js';
import { createUserSession } from '../utils/user-test-utils.js';

describe('Follow API - complete CRUD', () => {
    let user, user1, user2, user3, user4;
    let cookies, cookies1, cookies2, cookies3, cookies4;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;

        user1 = await createUserSession("user1@example.com", 'password123', 'userOne');
        cookies1 = user1.cookies;

        user2 = await createUserSession("user2@example.com", 'password123', 'userTwo');
        cookies2 = user2.cookies;

        user3 = await createUserSession("user3@example.com", 'password123', 'userThree');
        cookies3 = user3.cookies;

        user4 = await createUserSession("user4@example.com", 'password123', 'userFour');
        cookies4 = user4.cookies;
    });

    beforeEach(async () => {
        await Follow.deleteMany({});
    });

    // ============================================
    // CREATE - POST /api/follows/:id/toggle
    // ============================================
    describe('POST /api/follows/:targetId/toggle', () => {
        it('should correctly follow a user', async () => {
            const response = await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);
            
            expect(response.body.follower).toBe(user1.id);
            expect(response.body.following).toBe(user.id);
            expect(response.body.id).toBeDefined();

            const followInDB = await Follow.findById(response.body.id);
            expect(followInDB).not.toBeNull();
            expect(followInDB.following.toString()).toBe(user.id);
            expect(followInDB.follower.toString()).toBe(user1.id);
        });

        it('should correctly unfollow a user', async () => {
            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(204);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies3)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies4)
                .expect(201);

            const response = await request(app)
                .get(`/api/follows/${user.id}/followers`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(3);
        });

        it('should not follow or unfollow yourself', async () => {
            const response = await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies)
                .expect(400);

            expect(response.body.message).toBe('you can not follow yourself');
        });
        
                
        it('should return 400 if user id does not exist', async () => {
            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .post(`/api/follows/${fakeId}/toggle`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
        });
    });

    // ============================================
    // GET - GET /api/follows/:id/followers
    // ============================================
    describe('GET /api/follows/:id/followers', () => {
        it('should return the number of followers', async () => { 
            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies1)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(204);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies3)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies4)
                .expect(201);

            const response = await request(app)
                .get(`/api/follows/${user.id}/followers`)
                .set("Cookie", cookies)
                .expect(200);
            
            expect(response.body).toEqual(3);
        });

        it('should return 400 if user id does not exist', async () => {
            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .get(`/api/follows/${fakeId}/followers`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
        });
    });
    
    // ============================================
    // GET - GET /api/follows/:id/following
    // ============================================
    describe('POST /api/likes/:targetId/toggle', () => {
        it('should return the number of following users', async () => {
            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
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
        
        it('should return 400 if user id does not exist', async () => {
            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .get(`/api/follows/${fakeId}/following`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
        });
    });

    // // ============================================
    // // GET - GET /api/follows/:id/followers-list
    // // ============================================
    describe('POST /api/follows/:id/followers-list', () => {
        it('should return the followers list (populate)', async () => {
            const response = await request(app)
                .get(`/api/follows/${user.id}/followers-list`)
                .set("Cookie", cookies)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(0)
        });

        it('should return 400 if user id does not exist', async () => {
            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .get(`/api/follows/${fakeId}/followers-list`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it('should create, delete and get followers or following', async () => {
            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(204);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
                .set("Cookie", cookies2)
                .expect(201);

            await request(app)
                .post(`/api/follows/${user.id}/toggle`)
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
                .get(`/api/follows/${user.id}/followers`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual(2);

            const response2 = await request(app)
                .get(`/api/follows/${user.id}/following`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response2.body).toEqual(2);

            const response3 = await request(app)
                .get(`/api/follows/${user.id}/followers-list`)
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