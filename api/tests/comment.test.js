import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Comment from '../models/comment.model.js';
import { createUserSession, createPost, createComment } from '../utils';

describe('Comment API - complete CRUD', () => {
    let user, otherUser;
    let cookies;
    let newPost, otherPost, post;
    let newComment, otherComment, comment;
    let fakeId;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;
        otherUser = await createUserSession("other@tests.com", 'password123', 'OtherUser');

        newPost = await createPost('New post incoming', user.id);
        otherPost = await createPost('This is an other post', otherUser.id);
        post = await createPost('This is my post', user.id);

        fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";
    });

    beforeEach(async () => {
        await Comment.deleteMany({});

        newComment = {
            content: 'This is a new comment',
            user: user.id,
        };

        comment = await createComment('This is my comment', user.id, post.id);
        otherComment = await createComment('Other comment', otherUser.id, otherPost.id);
    });

    // ============================================
    // CREATE - POST /api/posts/:id/comments
    // ============================================
    describe('POST /api/posts', () => {
        it('should correctly create a new comment', async () => {
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
            delete newComment.content;

            const response = await request(app)
                .post('/api/posts')
                .set("Cookie", cookies)
                .send(newComment)
                .expect(400);
            
            expect(response.body.content.message).toBe('Path `content` is required.');
        });
    });

    // ============================================
    // DELETE - DELETE /posts/:id/comments/:commentId
    // ============================================
    describe("DELETE /posts/:id/comments/:commentId", () => {
        it("should delete your own comment", async () => {
            await request(app)
                .delete(`/api/posts/${comment.post}/comments/${comment.id}`)
                .set("Cookie", cookies)
                .expect(204);

            const commentInDB = await Comment.findById(comment.id);
            expect(commentInDB).toBeNull();
        });

        it('should return 403 if you try to delete a comment you do not own', async () => {
            const response = await request(app)
                .delete(`/api/posts/${otherComment.post}/comments/${otherComment.id}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("It is not your comment!");
        });

        it('should return 404 if the comment to delete does not exist', async () => {
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