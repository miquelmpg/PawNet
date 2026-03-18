import { describe, it, expect, beforeAll,beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Post from '../models/post.model.js';
import { createUserSession, createPost } from '../utils';

describe('Post API - complete CRUD', () => {
    let user, otherUser;
    let cookies;
    let newPost;
    let fakeId;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;

        otherUser = await createUserSession("other@tests.com", 'password123', 'OtherUser');

        fakeId = new mongoose.Types.ObjectId();
    });

    beforeEach(async() => {
        await Post.deleteMany({});

        newPost = {
            content: 'This is a new post',
            user: user.id,
        };
    });

    // ============================================
    // CREATE - POST /api/posts
    // ============================================
    describe('POST /api/posts', () => {
        it('should correctly create a new post', async () => {
            const response = await request(app)
                .post('/api/posts')
                .set("Cookie", cookies)
                .send(newPost)
                .expect(201);
            
            expect(response.body.content).toBe('This is a new post');
            expect(response.body.user).toBe(user.id);
            expect(response.body.id).toBeDefined(user.id);

            const postInDB = await Post.findById(response.body.id);
            expect(postInDB).not.toBeNull();
            expect(postInDB.content).toBe('This is a new post');
        });

        it('should return 400 if post content is missing', async () => {
            delete newPost.content;

            const response = await request(app)
                .post('/api/posts')
                .set("Cookie", cookies)
                .send(newPost)
                .expect(400);
            
            expect(response.body.content.message).toBe('Path `content` is required.');
        });
    });

    // ============================================
    // GET ALL - GET /api/posts
    // ============================================
    describe('GET /api/posts', () => {
        beforeEach(async () => {
            Promise.all([
                await Post.create({
                    content: 'user1@example.com',
                    user: user.id,
                    createdAt: '2026-03-16T00:00:00+00:00',
                }),
                await Post.create({
                    content: 'user2@example.com',
                    user: user.id,
                    createdAt: '2026-03-17T00:00:00+00:00',
                }),
                await Post.create({
                    content: 'user3@example.com',
                    user: user.id,
                    createdAt: '2026-03-18T00:00:00+00:00',
                }),
                await Post.create({
                    content: 'user4@example.com',
                    user: user.id,
                    createdAt: '2026-03-19T00:00:00+00:00',
                })
            ]);
        });
        
        it('should return an empty array if there are no posts', async () => {
            await Post.deleteMany({});
            const response = await request(app)
                .get('/api/posts')
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return all existing posts', async () => {
            const response = await request(app)
                .get('/api/posts')
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toHaveLength(4);
            expect(response.body[0].content).toBe("user4@example.com");
            expect(response.body[3].content).toBe("user1@example.com");
        });

        it('should return filtered post by content that contains "user4"', async () => {
            const response = await request(app)
                .get('/api/posts')
                .query({ content: 'user4' })
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body[0].content).toBe("user4@example.com");
        });
        
        it('should return filtered post by max date', async () => {
            const response = await request(app)
                .get('/api/posts')
                .query({ maxDate: '2026-03-17T00:00:00+00:00'})
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body[0].content).toBe("user2@example.com");
            expect(response.body[1].content).toBe("user1@example.com");
        });

        it('should return filtered post by min date', async () => {
            const response = await request(app)
                .get('/api/posts')
                .query({ minDate: '2026-03-18T00:00:00+00:00'})
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body[0].content).toBe("user4@example.com");
            expect(response.body[1].content).toBe("user3@example.com");
        });

        it('should return filtered post by max and min date', async () => {
            const response = await request(app)
                .get('/api/posts')
                .query({ maxDate: '2026-03-18T00:00:00+00:00'})
                .query({ minDate: '2026-03-16T00:00:00+00:00'})
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body[0].content).toBe("user3@example.com");
            expect(response.body[1].content).toBe("user2@example.com");
            expect(response.body[2].content).toBe("user1@example.com");
        });

        it('should return posts filtered by page 2 with limit 2', async () => {
            const response = await request(app)
                .get('/api/posts')
                .query({ page: 4})
                .query({ limit: 1})
                .set('Cookie', cookies)
                .expect(200);

                console.log(response.body)

            expect(response.body[0].content).toBe("user1@example.com");
        });
    });

    // ============================================
    // READ ONE - GET /api/posts
    // ============================================
    describe('GET /api/users/:id', () => {
        it("should include the post's comments (populate)", async () => {           
            await createPost('user1@example.com', user.id);

            const response = await request(app)
                .get(`/api/posts`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body[0].comments).toBeDefined();
            expect(Array.isArray(response.body[0].comments)).toBe(true);
        });
    });
        
    // ============================================
    // DELETE - DELETE /api/posts/:id
    // ============================================
    describe("DELETE /api/posts/:id", () => {
        it("should delete your own post", async () => {
            const post = await createPost('user1@example.com', user.id);

            await request(app)
                .delete(`/api/posts/${post.id}`)
                .set("Cookie", cookies)
                .expect(204);

            const postInDB = await Post.findById(post.id);
            expect(postInDB).toBeNull();
        });

        it('should return 403 if you try to delete a post you do not own', async () => {
            const otherPost = await createPost('This is an other post', otherUser.id);

            const response = await request(app)
                .delete(`/api/posts/${otherPost.id}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("It is not your post!");
        });

        it('should return 404 if the post to delete does not exist', async () => {
            await createPost('This is my post', user.id);

            const response = await request(app)
                .delete(`/api/posts/${fakeId}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Post not found');
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it('should create, get and delete a post', async () => {
            const createRes = await request(app)
                .post('/api/posts')
                .set('Cookie', cookies)
                .send(newPost)
                .expect(201);

            const postId = createRes.body.id;
            expect(postId).toBeDefined();

            const readRes = await request(app)
                .get(`/api/posts`)
                .set("Cookie", cookies)
                .expect(200);
    
                expect(readRes.body[0].content).toBe('This is a new post');

            await request(app)
                .delete(`/api/posts/${postId}`)
                .set('Cookie', cookies)
                .expect(204);

            const postInDB = await Post.findById(postId);
            expect(postInDB).toBeNull();
        });
    });
});