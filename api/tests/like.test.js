import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Like from '../models/like.model.js';
import { createUserSession, createPost, createComment } from '../utils';

describe('Like API - complete CRUD', () => {
    let user, user1, user2, user3, user4, user5;
    let cookies, cookies1, cookies2, cookies3, cookies4, cookies5;
    let newPost;
    let newComment;

    beforeAll(async () => {
        user = await createUserSession("user@example.com", 'password123', 'user');
        cookies = user.cookies;
        
        user1 = await createUserSession("user1@example.com", 'password123', 'userOne');
        cookies1 = user1.cookies;

        user2 = await createUserSession("user2@example.com", 'password123', 'userTwo');
        cookies2 = user2.cookies;

        user3 = await createUserSession("user3@example.com", 'password123', 'userThree');
        cookies3 = user3.cookies;

        user4 = await createUserSession("user4@example.com", 'password123', 'userFour');
        cookies4 = user4.cookies;

        user5 = await createUserSession("user5@example.com", 'password123', 'userFive');
        cookies5 = user5.cookies;

        newPost = await createPost('New post incoming', user.id);

        newComment = await createComment('New comment incoming', user.id, newPost.id);
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
            
            expect(response.body.user).toBe(user.id);
            expect(response.body.targetId).toBe(newPost.id);
            expect(response.body.id).toBeDefined();

            const likeInDB = await Like.findById(response.body.id);
            expect(likeInDB).not.toBeNull();
            expect(likeInDB.user.toString()).toBe(user.id);
            expect(likeInDB.targetId.toString()).toBe(newPost.id);
        });

        it('should correctly create a new like on a comment', async () => {
            const response = await request(app)
                .post(`/api/likes/${newComment.id}/toggle`)
                .set("Cookie", cookies)
                .expect(201);
            
            expect(response.body.user).toBe(user.id);
            expect(response.body.targetId).toBe(newComment.id);
            expect(response.body.id).toBeDefined();

            const likeInDB = await Like.findById(response.body.id);
            expect(likeInDB).not.toBeNull();
            expect(likeInDB.user.toString()).toBe(user.id);
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

        it('should return 400 if the targetId belongs to a user instead of a post or comment', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .post(`/api/likes/${user.id}/toggle`)
                .set('Cookie', cookies)
                .expect(400);

            expect(response.body.message).toBe('Invalid post or comment id');
        });

        it('should return 400 if targetId does not exist', async () => {
            await Like.deleteMany();

            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .post(`/api/likes/${fakeId}/toggle`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
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

        it('should return 400 if the targetId belongs to a user instead of a post or comment', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .get(`/api/likes/${user.id}/count-likes`)
                .set('Cookie', cookies)
                .expect(400);

            expect(response.body.message).toBe('Invalid post or comment id');
        });

        
        it('should return 400 if targetId does not exist', async () => {
            await Like.deleteMany();

            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .get(`/api/likes/${fakeId}/count-likes`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
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

        it('should return 400 if the targetId belongs to a user instead of a post or comment', async () => {
            await Like.deleteMany();

            const response = await request(app)
                .get(`/api/likes/${user.id}/is-liked`)
                .set('Cookie', cookies)
                .expect(400);

            expect(response.body.message).toBe('Invalid post or comment id');
        });
        
        it('should return 400 if targetId does not exist', async () => {
            await Like.deleteMany();

            const fakeId = '642f1f1f1f1f1f1f1f1f1f1f';

            const response = await request(app)
                .get(`/api/likes/${fakeId}/is-liked`)
                .set('Cookie', cookies)
                .expect(404);

            expect(response.body.message).toBe('Recourse not found');
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it("should create, delete, and get a user’s like", async () => {
            await Like.deleteMany();

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