export default function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log(`🔌 Connected: ${socket.id}`);

        handleMessages(socket, io);
        handleDisconnect(socket);
    });
    }

    function handleMessages(socket, io) {
        socket.on("message", (data) => {
            io.emit("new-message", data);
        });
    }

    function handleDisconnect(socket) {
        socket.on("disconnect", () => {
            console.log(`❌ Disconnected: ${socket.id}`);
    });
}