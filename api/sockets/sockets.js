const onlineUsers = new Map();

export default function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log(`🔌 Connected: ${socket.id}`);

        handleAuth(socket, io, onlineUsers);
        handleRegister(socket)
        handleMessages(socket, io);
        handleDisconnect(socket, io);
    });
}

function handleAuth(socket, io) {
    socket.on("user:online", (userId) => {
        socket.userId = userId;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socket.id);

        const currentOnline = {};
        onlineUsers.forEach((_, id) => {
            currentOnline[id] = true;
        });

        socket.emit("presence:init", currentOnline);

        io.emit("presence:update", {
            userId,
            status: "online",
        });
    });
}

function handleRegister(socket) {
    socket.on("register", (userId) => {
            if (!userId) return;

            socket.join(userId);
            console.log("👤 joined room:", userId);
    });
}

function handleMessages(socket, io) {
    socket.on("message", (data) => {
        io.emit("new-message", data);
    });
}

function handleDisconnect(socket, io) {
    socket.on("disconnect", () => {
        const userId = socket.userId;
        if (!userId) return;

        const sockets = onlineUsers.get(userId);
        if (!sockets) return;

        sockets.delete(socket.id);

        if (sockets.size === 0) {
            onlineUsers.delete(userId);

            io.emit("presence:update", {
                userId,
                status: "offline",
            });
        }
    });
}