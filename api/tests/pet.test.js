import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from '../app.js';
import Pet from "../models/pet.model.js";
import { createUserSession } from '../utils/index.js';

describe('Pet API - complete CRUD', () => {
    let user;
    let cookies;

    beforeAll(async () => {
        user = await createUserSession("auth@tests.com", 'password123', 'JohnDoe');
        cookies = user.cookies;
    });

    // ============================================
    // CREATE - POST /api/pets
    // ============================================
    describe('POST /api/pets', () => {
        it('should correctly create a new pet', async () => {

            const newPet = {
                name: 'Mochi',
                species: 'cat',
                bio: 'European short hair cat with a calm and friendly nature',
                weight: 5,
                birthday: '2020-05-10',
            };

            const response = await request(app)
                .post('/api/pets')
                .set("Cookie", cookies)
                .send(newPet)
                .expect(201);

            expect(response.body.name).toBe('Mochi');
            expect(response.body.species).toBe('cat');
            expect(response.body.bio).toBe('European short hair cat with a calm and friendly nature');
            expect(response.body.weight).toBe(5);
            expect(response.body.birthday).toBe("2020-05-10T00:00:00.000Z");
            expect(response.body.owner).toBe(user.id);
            expect(response.body.id).toBeDefined();

            const petInDB = await Pet.findById(response.body.id);
            expect(petInDB).not.toBeNull();
            expect(petInDB.name).toBe('Mochi');
        });

        it('should return 400 if pet name is missing', async () => {
            const badPet = {
                species: 'cat',
            };

            const response = await request(app)
                .post('/api/pets')
                .set("Cookie", cookies)
                .send(badPet)
                .expect(400);
            
            expect(response.body.name.message).toBe('Path `name` is required.');
        });

        it('should return 400 if pet species is missing', async () => {
            const badPet = {
                name: 'Mochi',
            };

            const response = await request(app)
                .post('/api/pets')
                .set("Cookie", cookies)
                .send(badPet)
                .expect(400);
            
            expect(response.body.species.message).toBe('Path `species` is required.');
        });
    });

    // ============================================
    // UPDATE - PATCH /api/pets/:id
    // ============================================
    describe('PATCH /api/pets/:id', () => {
        it('should partially update an existing pet', async () => {
            const pet = await Pet.create({
                name: 'Mochi',
                species: 'cat',
                bio: 'European short hair cat with a calm and friendly nature',
                weight: 5,
                birthday: '2020-05-10',
                owner: user.id,
            });

            const updatedPet = {
                name: 'Moka',
                weight: 3.5,
                birthday: '2020-04-09',
            };

            const response = await request(app)
                .patch(`/api/pets/${pet.id}`)
                .set('Cookie', cookies)
                .send(updatedPet)
                .expect(200);

            expect(response.body.name).toBe('Moka');
            expect(response.body.species).toBe('cat');
            expect(response.body.bio).toBe('European short hair cat with a calm and friendly nature');
            expect(response.body.weight).toBe(3.5);
            expect(response.body.birthday).toBe('2020-04-09T00:00:00.000Z');

            const petInDB = await Pet.findById(pet.id);
            expect(petInDB.name).toBe('Moka');
        });

        it('should return 403 if you try to update a pet you do not own', async () => {
            const fakeOwnerId = "64f1a2b3c4d5e6f7a8b9c0d1";
            const pet = await Pet.create({
                name: 'Mochi',
                species: 'cat',
                bio: 'European short hair cat with a calm and friendly nature',
                weight: 5,
                birthday: '2020-05-10',
                owner: fakeOwnerId,
            });

            const updatedPet = {
                name: 'Moka',
                weight: 3.5,
                birthday: '2020-04-09',
            };

            const response = await request(app)
                .patch(`/api/pets/${pet.id}`)
                .set('Cookie', cookies)
                .send(updatedPet);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("It is not your pet!");
        });

        it('should return 404 if the pet to update does not exist', async () => {
            const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";

            const response = await request(app)
                .patch(`/api/pets/${fakeId}`)
                .set('Cookie', cookies)
                .send({ name: 'Mona' });
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Pet not found");
        });
    });

    // ============================================
    // DELETE - DELETE /api/pets/:id
    // ============================================
    describe('DELETE /api/pets/:id', () => {
        it('should delete an existing pet', async () => {
            const pet = await Pet.create({
                name: 'Mona',
                species: 'dog',
                bio: 'Friendly and energetic dog',
                weight: 20,
                owner: user.id,
            });

            await request(app)
                .delete(`/api/pets/${pet.id}`)
                .set('Cookie', cookies)
                .expect(204);

            const petInDB = await Pet.findById(pet.id);
            expect(petInDB).toBeNull();
        });

        it('should return 403 if you try to delete a pet you do not own', async () => {
            const fakeOwnerId = "64f1a2b3c4d5e6f7a8b9c0d1";
            const pet = await Pet.create({
                name: 'Mochi',
                species: 'cat',
                bio: 'European short hair cat with a calm and friendly nature',
                weight: 5,
                birthday: '2020-05-10',
                owner: fakeOwnerId,
            });

            const response = await request(app)
                .delete(`/api/pets/${pet.id}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("It is not your pet!");
        });

        it('should return 404 if the pet to delete does not exist', async () => {
            const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";

            const response = await request(app)
                .delete(`/api/pets/${fakeId}`)
                .set('Cookie', cookies);
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Pet not found");
        });
    });

    // ============================================
    // INTEGRATION - Complete CRUD Flow
    // ============================================
    describe('Complete CRUD Flow', () => {
        it('should create, update and delete a pet', async () => {
            const createRes = await request(app)
            .post('/api/pets')
            .set('Cookie', cookies)
            .send({
                name: 'Galeta',
                species: 'cat',
                bio: 'Loves cuddles and exploring',
                weight: 4,
                birthday: '2026-01-01',
            })
            .expect(201);

            const petId = createRes.body.id;

            const updateRes = await request(app)
                .patch(`/api/pets/${petId}`)
                .set('Cookie', cookies)
                .send({ name: 'Moka', bio: 'Hides and does not come when called'})
                .expect(200);
            
            expect(updateRes.body.name).toBe('Moka');
            expect(updateRes.body.bio).toBe('Hides and does not come when called');

            await request(app)
                .delete(`/api/pets/${petId}`)
                .set('Cookie', cookies)
                .expect(204);

            const petInDB = await Pet.findById(petId);
            expect(petInDB).toBeNull();
        });
    });
});