import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import socketHandler from "./sockets/sockets.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://social-net-work.fly.dev"
        ],
        credentials: true
    }
});

socketHandler(io);

app.set("io", io);

if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}