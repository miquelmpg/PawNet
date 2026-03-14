import request from "supertest";
import app from "../app.js";

export const authRequest = (cookies) => {
    return request(app).set("Cookie", cookies);
};