export default function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log(`🔌 Conectado: ${socket.id}`);

        handleMessages(socket, io);
        handleDisconnect(socket);
    });
    }

    function handleMessages(socket, io) {
    socket.on("mensaje", (data) => {
        io.emit("nuevo-mensaje", data);
    });
    }

    function handleDisconnect(socket) {
    socket.on("disconnect", () => {
        console.log(`❌ Desconectado: ${socket.id}`);
    });
}