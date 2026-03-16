import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import { createUserSession, authRequest } from '../utils';

describe('Users API', () => {
    let user, newUser;
    let cookies;
    let fakeId;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;

        fakeId = new mongoose.Types.ObjectId();
    });

    beforeEach(async () => {

        newUser = {
            email: 'john@example.com',
            password: 'password123',
            userName: 'JohnDoe',
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Junior Full-Stack Developer passionate about JavaScript',
            location: 'Barcelona',
            birthday: '2000-05-10',
            gender: 'male',
        }
    });

    // ============================================
    // CREATE - POST /api/users
    // ============================================
    describe('POST /api/users', () => {
        it('should correctly create a new user', async () => {
            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);
                
            expect(response.body.email).toBe('john@example.com');
            expect(response.body.userName).toBe('JohnDoe');
            expect(response.body.firstName).toBe('John');
            expect(response.body.lastName).toBe('Doe');
            expect(response.body.bio).toBe('Junior Full-Stack Developer passionate about JavaScript');
            expect(response.body.location).toBe('Barcelona');
            expect(response.body.birthday).toBe('2000-05-10T00:00:00.000Z');
            expect(response.body.gender).toBe('male');
            expect(response.body.id).toBeDefined();

            const userInDB = await User.findById(response.body.id);
            expect(userInDB).not.toBeNull();
            expect(userInDB.email).toBe('john@example.com');
            expect(userInDB.userName).toBe('JohnDoe');
            expect(userInDB.password).not.toBe(newUser.password);
            expect(userInDB.password.length > newUser.password.length).toBe(true);
        });

        it('should create a user without optional fields', async () => {
            delete newUser.firstName;
            delete newUser.lastName;
            delete newUser.bio;
            delete newUser.location;
            delete newUser.birthday;
            delete newUser.gender;

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);
            
            expect(response.body.email).toBe('john@example.com');
            expect(response.body.userName).toBe('JohnDoe');
            expect(response.body.bio).toBeUndefined();
        });

        it('should return 400 if email is missing', async () => {
            delete newUser.email;

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(400);
            
            expect(response.body.email.message).toBe("Path `email` is required.");
        });

        it('should return 400 if email has invalid format', async () => {
            newUser.email = 'invalid-email';

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(400);
            
            expect(response.body.email.message).toContain("is invalid");
        });

        it('should return 400 if password is missing', async () => {
            delete newUser.password;

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(400);
            
            expect(response.body.password.message).toBe("Path `password` is required.");
        });

        it('should return 400 if password is too short', async () => {
            newUser.password = '123';

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(400);
            
            expect(response.body.password.message).toContain("is shorter than the minimum");
        });

        it('should return 400 if userName is missing', async () => {
            delete newUser.userName;

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(400);
            
            expect(response.body.userName.message).toBe("Path `userName` is required.");
        });

        it('should return 409 if email is already registered', async () => {
            await User.deleteMany({});

            await User.collection.createIndex({ email: 1 }, { unique: true });

            const response = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);
            
            expect(response.body.email).toBe("john@example.com");

            const responseTwo = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(409);
            
            expect(responseTwo.body.message).toBe("Resource already exist");

            await User.collection.dropIndex({ email: 1 }, { unique: true });
        });
    });

    // ============================================
    // GET ALL - GET /api/users/search
    // ============================================
    describe('GET /api/users/search', () => {
        it('should return an empty array if there are no users', async () => {
            await User.deleteMany();

            const response = await request(app)
                .get('/api/users/search')
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return all existing users', async () => {
            await User.create({
                email: 'user1@example.com',
                password: 'password123',
                userName: 'userOne',
            });

            await User.create({
                email: 'user2@example.com',
                password: 'password123',
                userName: 'userTwo',
            });

            await User.create({
                email: 'user3@example.com',
                password: 'password123',
                userName: 'userThree',
            });

            await User.create({
                email: 'user4@example.com',
                password: 'password123',
                userName: 'userFour',
            });

            const response = await request(app)
                .get('/api/users/search')
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body).toHaveLength(4);
            expect(response.body[0].email).toBe("user1@example.com");
            expect(response.body[2].userName).toBe("userThree");
        });

        it('should return filer users by userName that contains "four"', async () => {
            const user = await User.create({
                email: 'auth@tests.com',
                password: 'password123',
                userName: 'JohnDoe',
            });

            const session = await Session.create({ user: user._id });
            cookies = [`sessionId=${session._id.toString()}`];

            const response = await request(app)
                .get('/api/users/search')
                .query({ userName: 'four' })
                .set('Cookie', cookies)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);

            const userResponse = response.body[0];
            expect(userResponse.userName).toBe('userFour');
            expect(userResponse.email).toBe('user4@example.com'); 
        });
    });

    // ============================================
    // READ ONE - GET /api/users/:id
    // ============================================
    describe('GET /api/users/:id', () => {
        it('should return an user by its id', async () => {
            const user = await User.create ({
                email: 'john@example.com',
                password: 'password123',
                userName: 'JohnDoe', 
            });

            const response = await request(app)
                .get(`/api/users/${user.id}`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.email).toBe('john@example.com');
            expect(response.body.userName).toBe('JohnDoe');
        });

        it("should include the user's pet (populate)", async () => {
            const user = await User.create ({
                email: 'john@example.com',
                password: 'password123',
                userName: 'JohnDoe', 
            });

            const response = await request(app)
                .get(`/api/users/${user.id}`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.pets).toBeDefined();
            expect(Array.isArray(response.body.pets)).toBe(true);
        });

        it("should include the user's posts (populate)", async () => {
            const user = await User.create ({
                email: 'john@example.com',
                password: 'password123',
                userName: 'JohnDoe', 
            });

            const response = await request(app)
                .get(`/api/users/${user.id}`)
                .set('Cookie', cookies)
                .expect(200);

            expect(response.body.posts).toBeDefined();
            expect(Array.isArray(response.body.posts)).toBe(true);
        });

        it('should return 404 if the user does not exist', async () => {
            const response = await request(app)
                .get(`/api/users/${fakeId}`)
                .set("Cookie", cookies)
                .expect(404);

            expect(response.body.message).toBe("User not found");
        });
    });

    // ============================================
    // UPDATE - PATCH /api/users/:id
    // ============================================
    describe("PATCH /api/users/:id", () => {
        it("should update your own user", async () => {
            const user = await User.create({
                email: 'auth@tests.com',
                password: 'password123',
                userName: 'JohnDoe',
            });

            const session = await Session.create({ user: user._id });
            cookies = [`sessionId=${session._id.toString()}`];

            const updatedData = {
                userName: 'MongoName',
            };

            const response = await request(app)
                .patch(`/api/users/${user.id}`)
                .set('Cookie', cookies)
                .send(updatedData)
                .expect(200);

            expect(response.body.userName).toBe('MongoName');
            expect(response.body.email).toBe('auth@tests.com');

            const userInDB = await User.findById(user.id);
            expect(userInDB.userName).toBe('MongoName');
        });

        it("should update password", async () => {
            const user = await User.create({
                email: 'auth@tests.com',
                password: 'password123',
                userName: 'JohnDoe',
            });

            const session = await Session.create({ user: user._id });
            cookies = [`sessionId=${session._id.toString()}`];

            const updatedData = {
                password: '123123123123',
            };

            const response = await request(app)
                .patch(`/api/users/${user.id}`)
                .set('Cookie', cookies)
                .send(updatedData)
                .expect(200);

            const userInDB = await User.findById(user._id);
            expect(userInDB.password).not.toBe("123123123123");
        });

        it("should return 400 if updated password is too short", async () => {
            const user = await User.create({
                email: 'auth@tests.com',
                password: 'password123',
                userName: 'JohnDoe',
            });

            const session = await Session.create({ user: user._id });
            cookies = [`sessionId=${session._id.toString()}`];

            const updatedData = {
                password: '123',
            };

            const response = await request(app)
                .patch(`/api/users/${user.id}`)
                .set('Cookie', cookies)
                .send(updatedData)
                .expect(400);

            expect(response.body.password.message).toContain("is shorter than the minimum");
        });

        it('should return 403 if you try to update a user account you do not own', async () => {
            const otherUser = await User.create({
                email: 'other@tests.com',
                password: 'password123',
                userName: 'OtherUser',
            });

            const updatedData = {
                userName: 'MongoName',
            };

            const response = await request(app)
                .patch(`/api/users/${otherUser.id}`)
                .set('Cookie', cookies)
                .send(updatedData)
                .expect(403);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("You are not allowed to update this account!");
        });

        it('should return 404 if the user to update does not exist', async () => {
            const updatedData = {
                userName: 'MongoName',
            };

            const response = await request(app)
                .patch(`/api/users/${fakeId}`)
                .set('Cookie', cookies)
                .send(updatedData)
                .expect(404);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    // ============================================
    // DELETE - DELETE /api/users/:id
    // ============================================
    describe("DELETE /api/users/:id", () => {
        it("should delete your own user", async () => {
            const user = await User.create({
                email: 'auth@tests.com',
                password: 'password123',
                userName: 'JohnDoe',
            });

            const session = await Session.create({ user: user._id });
            cookies = [`sessionId=${session._id.toString()}`];

            await request(app)
                .delete(`/api/users/${user.id}`)
                .set("Cookie", cookies)
                .expect(204);

            const userInDB = await User.findById(user.id);
            expect(userInDB).toBeNull();
        });

        it('should return 403 if you try to delete a user account you do not own', async () => {
            const otherUser = await User.create({
                email: 'other@tests.com',
                password: 'password123',
                userName: 'OtherUser',
            });

            const user = await User.create({
                email: 'auth@tests.com',
                password: 'password123',
                userName: 'JohnDoe',
            });

            const session = await Session.create({ user: user._id });
            cookies = [`sessionId=${session._id.toString()}`];

            const response = await request(app)
                .delete(`/api/users/${otherUser.id}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("You are not allowed to delete this account!");
        });

        it('should return 404 if the user to delete does not exist', async () => {
            const response = await request(app)
                .delete(`/api/users/${fakeId}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it('should create, get, update and delete a user', async () => {
            const newUser = {
                email: 'example@example.com',
                password: '1223334444',
                userName: 'eXAMPLe',
            }

            const createRes = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);

            const userId = createRes.body.id;
            expect(userId).toBeDefined();


            const readResponse = await request(app)
            .get(`/api/users/${userId}`)
            .set("Cookie", cookies)
            .expect(200);

            expect(readResponse.body.email).toBe('example@example.com');
            expect(readResponse.body.userName).toBe('eXAMPLe');

            const session = await Session.create({ user: userId });
            cookies = [`sessionId=${session._id.toString()}`];

            const updateData = {
                userName: "New User Name",
            };

            const updateResponse = await request(app)
                .patch(`/api/users/${userId}`)
                .set("Cookie", cookies)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.userName).toBe("New User Name");

            await request(app)
                .delete(`/api/users/${userId}`)
                .set("Cookie", cookies)
                .expect(204);

            await request(app)
                .get(`/api/users/${userId}`)
                .set("Cookie", cookies)
                .expect(404);
        });
    });

    describe("POST /api/sessions (login)", () => {
        beforeAll(async () => {
            const newUser = await User.create({
                email: "juan1@example.com",
                password: "password123",
                userName: "JuanPe",
            });
        });

        it("happy case", async () => {
            const response = await request(app)
                .post("/api/sessions")
                .send({
                email: "juan1@example.com",
                password: "password123",
            })
            .expect(200);

            expect(response.headers["set-cookie"]).toBeDefined();
        });

        it("401 if user does not exist", async () => {
            await request(app)
                .post("/api/sessions")
                .send({
                email: "juanDoesNotExist@example.com",
                password: "password123",
                })
            .expect(401);
        });

        it("401 if wrong password", async () => {
            await request(app)
                .post("/api/sessions")
                .send({
                email: "juan1@example.com",
                password: "WRONG",
                })
                .expect(401);
        });

        it("GET user profile", async () => {
            const response = await request(app)
                .post('/api/sessions')
                .send({
                email: "juan1@example.com",
                password: "password123",
                })
                .expect(200);

            const loginCookies = response.headers["set-cookie"];

            const profileResponse = await request(app)
                .get(`/api/users/${response.body.id}`)
                .set("Cookie", loginCookies)
                .expect(200);

            expect(profileResponse.body.email).toBe("juan1@example.com");
        });
    });
});