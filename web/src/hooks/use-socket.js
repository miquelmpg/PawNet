import { useEffect } from "react";
import socket from "../services/socket";

export const useSocket = () => {
    useEffect(() => {
        const handleConnect = () => {
        console.log("Connected to backend:", socket.id);
        };

        socket.on("connect", handleConnect);

        return () => {
        socket.off("connect", handleConnect);
        };
    }, []);
};