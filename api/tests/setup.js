import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";

import "../config/db.config";

beforeAll(async () => {
    await mongoose.connection.dropDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});