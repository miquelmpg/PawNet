import mongoose from 'mongoose';
import "../config/db.config.js";
import { faker } from "@faker-js/faker";

import User from '../models/user.model.js';
import Pet from '../models/pet.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import Follow from '../models/follow.model.js';
import Like from '../models/like.model.js';

const NUM_USERS = 200;
const NUM_PETS = 150;
const NUM_POSTS = 50;
const NUM_COMMENTS = 50;
const NUM_FOLLOWS = 50;
const NUM_LIKES = 50;

function generateUser() {
    return {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        userName: faker.internet.username(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        bio: faker.person.bio(),
        location: faker.location.city(),
        birthday: faker.date.birthdate({ min: 16, max: 80, mode: 'age' }),
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    };
}

function generatePet(usersArray) {
    const species = faker.helpers.arrayElement(['cat', 'dog']);
    return {
        name: faker.animal[species](),
        species,
        bio: faker.lorem.sentence(),
        weight: faker.number.float({ min: 1, max: 50, precision: 0.1 }),
        birthday: faker.date.past(15),
        owner: faker.helpers.arrayElement(usersArray)._id,
    };
}

function generatePost(usersArray) {
    return {
        content: faker.lorem.sentences(faker.number.int({ min: 5, max: 20 })),
        user: faker.helpers.arrayElement(usersArray)._id,
        createdAt: faker.date.past(),
    };
}

function generateComment(postsArray, usersArray) {
    return {
        content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        post: faker.helpers.arrayElement(postsArray)._id,
        user: faker.helpers.arrayElement(usersArray)._id,
        createdAt: faker.date.past(),
    };
}

function generateFollow(usersArray) {
    return {
        follower: faker.helpers.arrayElement(usersArray)._id,
        following: faker.helpers.arrayElement(usersArray)._id,
    };
}

function generateLike(usersArray, postsArray, commentsArray) {
    return {
        user: faker.helpers.arrayElement(usersArray)._id,
        targetId: faker.helpers.arrayElement([...postsArray, ...commentsArray])._id,
    };
}

async function seed() {
    console.log("Seeding the database...");

    console.log("drop database...");
    await mongoose.connection.dropDatabase();
    console.log("drop database... [OK]");

    console.log("seeding users...");
    const usersData = Array.from({ length: NUM_USERS }, generateUser);
    const users = await User.insertMany(usersData);
    console.log("First user:", users[0]);

    console.log("seeding pets...");
    const petsData = Array.from({ length: NUM_PETS }, () => generatePet(users));
    console.log("First pet:", petsData[0]);

    await Pet.insertMany(petsData);
    console.log("seeding pets... [OK]");

    console.log("seeding posts...");
    const postsData = Array.from({ length: NUM_POSTS }, () => generatePost(users));
    console.log("First post:", postsData[0]);

    const insertedPosts = await Post.insertMany(postsData);
    console.log("seeding post... [OK]");

    console.log("seeding comments...");
    const commentsData = Array.from({ length: NUM_COMMENTS }, () => generateComment(insertedPosts, users));
    console.log("First comment:", commentsData[0]);

    const insertedComments = await Comment.insertMany(commentsData);
    console.log("seeding comment... [OK]");

    const followsData = Array.from({ length: NUM_FOLLOWS }, () => generateFollow(users));
    console.log("First follow:", followsData[0]);

    try {
        const result = await Follow.insertMany(followsData, { ordered: false });
        console.log("Inserted:", result.length);
    } catch (err) {
        if (err.code === 11000) {
            console.log("Duplicate follows ignored");
        } else {
            throw err;
        }
    }

    console.log("seeding follow... [OK]");

    console.log("seeding likes...");

    const likesData = Array.from({ length: NUM_LIKES }, () => generateLike(users, insertedPosts, insertedComments));

    console.log("First like:", likesData[0]);

    try {
        await Like.insertMany(likesData, { ordered: false });
    } catch (err) {
        if (err.code !== 11000) throw err;
        console.log("Duplicate likes ignored");
    }

    console.log("seeding like... [OK]");

    console.log("close connection...");
    await mongoose.connection.close();
    console.log("close connection... [OK]");
}

seed();