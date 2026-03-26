import { Router } from "express";
import createHttpError from "http-errors";
import { detectOffensive } from '../middlewares/detectOffensive.middleware.js';

import * as users from "../controllers/users.controller.js";
import * as pets from '../controllers/pets.controller.js';
import * as posts from "../controllers/posts.controller.js";
import * as comments from "../controllers/comments.controller.js";
import * as likes from "../controllers/likes.controller.js";
import * as follows from "../controllers/follows.controller.js";

const router = Router();

router.post("/users", users.create);
router.post("/sessions", users.login);
router.delete("/sessions", users.logout);

router.get('/users', users.usersList);
router.get("/users/:id", users.detail);
router.patch("/users/:id", users.update);
router.delete("/users/:id", users.remove);

// router.post('/pets', pets.create);
// router.delete('/pets/:id', pets.remove);
// router.patch('/pets/:id', pets.update);

router.post("/posts", detectOffensive, posts.createPost);
router.get("/posts", posts.postsList);
router.get("/posts/:id", posts.postsListByUser);
router.delete("/posts/:id", posts.deletePost);

router.post("/posts/:id/comments", detectOffensive,  comments.createComment);
router.delete("/posts/:id/comments/:commentId", comments.deleteComment);

// router.get('/likes/:targetId/count-likes', likes.count);
// router.get('/likes/:targetId/is-liked', likes.getLike);
router.post('/likes/:targetId/toggle', likes.toggle);

// router.get('/follows/:id/followers-list', follows.getFollowerList);
// router.get('/follows/:id/followers', follows.getFollowersNumber);
// router.get('/follows/:id/following', follows.getFollowingsNumber);
router.post('/follows/:id/toggle', follows.toggle);

router.use((req, res) => {
    throw new createHttpError(404, "Route Not Found");
});

export default router;