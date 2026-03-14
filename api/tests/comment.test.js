import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import { createUserSession, createPost, createComment } from '../utils';

describe('Comment API - complete CRUD', () => {
    let user;
    let cookies;
    let newPost;
    let newComment;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;

        newPost = await createPost('New post incoming', user.id);

        newComment = await createComment('New comment incoming', user.id, newPost.id);
    });

    // ============================================
    // CREATE - POST /api/posts/:id/comments
    // ============================================
    describe('POST /api/posts', () => {
        it('should correctly create a new comment', async () => {
            const newComment = {
                content: 'This is a new comment',
            };

            const response = await request(app)
                .post(`/api/posts/${newPost.id}/comments`)
                .set("Cookie", cookies)
                .send(newComment)
                .expect(201);
            
            expect(response.body.content).toBe('This is a new comment');
            expect(response.body.user).toBe(user.id);
            expect(response.body.post).toBeDefined(newPost.id);

            const commentInDB = await Comment.findById(response.body.id);
            expect(commentInDB).not.toBeNull();
            expect(commentInDB.content).toBe('This is a new comment');
        });

        it('should return 400 if comment content is missing', async () => {
            const badComment = {
                post: newPost.id,
                user: user.id,
            };

            const response = await request(app)
                .post('/api/posts')
                .set("Cookie", cookies)
                .send(badComment)
                .expect(400);
            
            expect(response.body.content.message).toBe('Path `content` is required.');
        });
    });

    // ============================================
    // DELETE - DELETE /posts/:id/comments/:commentId
    // ============================================
    describe("DELETE /posts/:id/comments/:commentId", () => {
        it("should delete your own comment", async () => {
            const post = await Post.create({
                content: 'This is my post',
                user: user.id,
            });

            const comment = await Comment.create({
                content: 'This is my post',
                user: user.id,
                post: post.id,
            });

            await request(app)
                .delete(`/api/posts/${comment.post}/comments/${comment.id}`)
                .set("Cookie", cookies)
                .expect(204);

            const commentInDB = await Comment.findById(comment.id);
            expect(commentInDB).toBeNull();
        });

        it('should return 403 if you try to delete a comment you do not own', async () => {
            const otherUser = await User.create({
                email: 'other@tests.com',
                password: 'password123',
                userName: 'OtherUser',
            });

            const otherPost = await Post.create({
                content: 'This is an other post',
                user: otherUser.id,
            })

            const otherComment = await Comment.create({
                content: 'Other comment',
                user: otherUser.id,
                post: otherPost.id,
            })

            const response = await request(app)
                .delete(`/api/posts/${otherComment.post}/comments/${otherComment.id}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("It is not your comment!");
        });

        it('should return 404 if the comment to delete does not exist', async () => {
            const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";

            const post = await Post.create({
                content: 'This is my post',
                user: user.id,
            });

            const comment = await Comment.create({
                content: 'This is my post',
                user: user.id,
                post: post.id,
            });

            const response = await request(app)
                .delete(`/api/posts/${comment.post}/comments/${fakeId}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Comment not found');
        });
    });

    // // ============================================
    // // INTEGRATION - Complete CRUD Flow
    // // ============================================
    describe('Complete CRUD Flow', () => {
        it('should create, get and delete a comment', async () => {
            const newComment = {
                content: 'This is a complete CRUD flow comment',
                user: user.id,
                post: newPost.id,
            }

            const createRes = await request(app)
                .post(`/api/posts/${newPost.id}/comments`)
                .set('Cookie', cookies)
                .send(newComment)
                .expect(201);

            const commentId = createRes.body;
            expect(commentId).toBeDefined();

            await request(app)
                .delete(`/api/posts/${commentId.post}/comments/${commentId.id}`)
                .set('Cookie', cookies)
                .expect(204);

            const commentInDB = await Comment.findById(commentId.id);
            expect(commentInDB).toBeNull();
        });
    });
});