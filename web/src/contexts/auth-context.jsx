import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import * as ApiService from '../services/api-service';

const AuthContext = createContext({});

export function AuthContextProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [online, setOnline] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function userFetch() {
            try {
                const user = await ApiService.getProfile();
                setUser(user);
            } catch (error) {
                navigate('/login');
            }
        }
        userFetch();
    }, []);

        useEffect(() => {
        const userId = user?.id;

        socket.emit("user:online", userId);

        socket.on("presence:init", (users) => {
            setOnline(users);
        });

        socket.on("presence:update", ({ userId, status }) => {
            setOnline((prev) => ({
                ...prev,
                [userId]: status === "online"
            }));
        });

        return () => {
            socket.off("presence:update");
            socket.off("presence:init");
        };
    }, [user?.id]);

    async function userLogin(email, password) {
        const user = await ApiService.login(email, password);
        setUser(user);
    }

    async function userLogout() {
        await ApiService.logout();
        setUser(null);
    }

    if (
        user === null &&
        location.pathname !== '/login' &&
        location.pathname !== '/register'
    ) {
        return <></>
    }

    return (
        <AuthContext.Provider value={{ user, userLogin, userLogout, setUser, online }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}