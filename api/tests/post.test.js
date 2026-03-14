import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Post from '../models/post.model.js';
import { createUserSession, createPost } from '../utils';

describe('Post API - complete CRUD', () => {
    let user, otherUser;
    let cookies;
    let newPost;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;

        otherUser = await createUserSession("other@tests.com", 'password123', 'OtherUser');

        newPost = await createPost('New post incoming', user.id);
    });

    // ============================================
    // CREATE - POST /api/posts
    // ============================================
    describe('POST /api/posts', () => {
        it('should correctly create a new post', async () => {
            const newPost = {
                content: 'This is a new post',
                user: user.id,
            };

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
            const badPost = {
                user: user.id,
            };

            const response = await request(app)
                .post('/api/posts')
                .set("Cookie", cookies)
                .send(badPost)
                .expect(400);
            
            expect(response.body.content.message).toBe('Path `content` is required.');
        });
    });

    // ============================================
    // GET ALL - GET /api/posts/search
    // ============================================
    describe('GET /api/posts', () => {
        it('should return an empty array if there are no posts', async () => {
            await Post.deleteMany();

            const response = await request(app)
                .get('/api/posts/search')
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return all existing posts', async () => {

            Promise.all([
            await Post.create({
                content: 'user1@example.com',
                user: user.id,
            }),
            await Post.create({
                content: 'user2@example.com',
                user: user.id,
            }),
            await Post.create({
                content: 'user3@example.com',
                user: user.id,
            }),
            await Post.create({
                content: 'user4@example.com',
                user: user.id,
            })]);      

            const response = await request(app)
                .get('/api/posts/search')
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toHaveLength(4);
            expect(response.body[0].content).toBe("user4@example.com");
            expect(response.body[3].content).toBe("user1@example.com");
        });

        it('should return filer post by content that contains "user4"', async () => {
            const response = await request(app)
                .get('/api/posts/search')
                .query({ content: 'user4' })
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body[0].content).toBe("user4@example.com");
        });
    });

    // ============================================
    // READ ONE - GET /api/posts
    // ============================================
    describe('GET /api/users/:id', () => {
        it("should include the post's comments (populate)", async () => {           
            const post = await Post.create({
                content: 'user1@example.com',
                user: user.id,
            });

            const response = await request(app)
                .get(`/api/posts/search`)
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
            const post = await Post.create({
                content: 'This is my post',
                user: user.id,
            });

            await request(app)
                .delete(`/api/posts/${post.id}`)
                .set("Cookie", cookies)
                .expect(204);

            const postInDB = await Post.findById(post.id);
            expect(postInDB).toBeNull();
        });

        it('should return 403 if you try to delete a post you do not own', async () => {
            const otherPost = await Post.create({
                content: 'This is an other post',
                user: otherUser.id,
            })

            const response = await request(app)
                .delete(`/api/posts/${otherPost.id}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("It is not your post!");
        });

        it('should return 404 if the post to delete does not exist', async () => {
            const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";

            const post = await Post.create({
                content: 'This is my post',
                user: user.id,
            });

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
            const newPost = {
                content: 'This is a complete CRUD flow post',
                user: user.id,
            }

            const createRes = await request(app)
                .post('/api/posts')
                .set('Cookie', cookies)
                .send(newPost)
                .expect(201);

            const postId = createRes.body.id;
            expect(postId).toBeDefined();

            const readRes = await request(app)
                .get(`/api/posts/search`)
                .set("Cookie", cookies)
                .expect(200);
    
                expect(readRes.body[0].content).toBe('This is a complete CRUD flow post');

            await request(app)
                .delete(`/api/posts/${postId}`)
                .set('Cookie', cookies)
                .expect(204);

            const postInDB = await Post.findById(postId);
            expect(postInDB).toBeNull();
        });
    });
});