import { Router } from "express";
import createHttpError from "http-errors";

import * as users from "../controllers/users.controller.js";
import * as pets from '../controllers/pets.controller.js';
import * as posts from "../controllers/posts.controller.js";
import * as comments from "../controllers/comments.controller.js";
import * as likes from "../controllers/likes.controller.js";
import * as follows from "../controllers/follows.controller.js";

import upload from "../config/multer.config.js";

const router = Router();

router.post("/users", users.create);
router.post("/sessions", users.login);
router.delete("/sessions", users.logout);

router.get('/users/search', users.nameList);
router.get("/users/:id", users.detail);
router.patch("/users/:id", upload.single("avatar"), users.update);
router.delete("/users/:id", users.remove);

router.post('/pets', pets.create);
router.delete('/pets/:id', pets.remove);
router.patch('/pets/:id', upload.single("avatar"), pets.update);

router.post("/posts", posts.createPost);
router.get("/posts", posts.list);
router.delete("/posts/:id", posts.deletePost);

router.post("/posts/:id/comments", comments.createComment);
router.delete("/posts/:id/comments/:commentId", comments.deleteComment);

router.get('/likes/:targetId/count-likes', likes.count);
router.get('/likes/:targetId/is-liked', likes.getLike);
router.post('/likes/:targetId/toggle', likes.toggle);

router.get('/follows/:id/followers-list', follows.getFollowerList);
router.get('/follows/:id/followers', follows.getFollowersNumber);
router.get('/follows/:id/following', follows.getFollowingsNumber);
router.post('/follows/:id/toggle', follows.toggle);

router.use((req, res) => {
    throw new createHttpError(404, "Route Not Found");
});

export default router;