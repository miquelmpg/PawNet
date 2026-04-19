import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

// const socket = io("https://social-net-work.fly.dev", {
//     transports: ["websocket"]
// });

export default socket;