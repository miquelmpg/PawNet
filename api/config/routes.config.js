import { Router } from "express";
import createHttpError from "http-errors";

import * as users from "../controllers/users.controller.js";
import * as posts from "../controllers/posts.controller.js";
import * as comments from "../controllers/comments.controller.js";
import * as likes from "../controllers/likes.controller.js";
import * as follows from "../controllers/follows.controller.js";

import upload from "../config/multer.config.js";

const router = Router();

router.post("/users", users.create);
router.post("/sessions", users.login);
router.delete("/sessions", users.logout);

router.get("/users/:id", users.detail);
router.patch("/users/me", upload.single("avatar"), users.update);

router.post("/posts", posts.createPost);
router.get("/posts", posts.list);
router.delete("/posts/:id", posts.deletePost);

router.post("/posts/:id/comments", comments.createComment);
router.delete("/posts/:id/comments/:commentId", comments.deleteComment);

router.get('/likes/count-likes', likes.count);
router.get('/likes/is-liked', likes.getLike);
router.post('/likes/toggle', likes.toggle);

router.get('/followers', follows.getFollowers);
router.get('/following', follows.getFollowings);
router.post('/follow/:id/toggle', follows.toggle);

router.use((req, res) => {
    throw new createHttpError(404, "Route Not Found");
});

export default router;