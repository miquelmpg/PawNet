import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../../contexts/auth-context';
import * as ApiService from '../../../services/api-service';
import { useEffect, useState } from "react";
import socialMedia from '../../../assets/icons/socialNetwork.png';
import socket from "../../../services/socket";

function Navbar({ toggle, setNumPage }) {
    const [user, setUser] = useState()
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        await ApiService.logout();
        navigate('/login');
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setNumPage(1);
    };

    useEffect(() => {
        socket.on("follow:created", (post) => {
            setUser((prev) => [post, ...prev]);
        });

        return () => {
            socket.off("follow:created");
        };
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        async function fetchProfile() {
            const reloadUser = await ApiService.getProfile(currentUser.id);
            setUser(reloadUser);
        }

        fetchProfile();
    }, [toggle, currentUser]);

    return (
        <>
            {location.pathname !== '/register' &&
                location.pathname !== '/login' && 
                user && <nav className="navbar navbar-expand-lg sticky-top navbar rounded-5" style={{backgroundColor: '#202020', top: '15px'}}>
                <div className="container-fluid">
                    <NavLink className="fw-bold text-white"  to={'/'} onClick={() => scrollToTop()}>
                        <img className="rounded-5" style={{width: '60px'}} src={socialMedia}/>
                    </NavLink>
                    <div className="d-flex gap-5 align-items-center">
                        <NavLink to={`/account/${user.id}`}>
                            <img src={user.profilePicture} className='rounded-circle' style={{width: '60px'}} />
                        </NavLink>
                        <div className="d-flex gap-5 me-auto">
                            <div className="text-white">Hi, {user.userName}!</div>
                            <div className="text-white">Following: {user.following.length}</div>
                            <div className="text-white">Followers: {user.followers.length}</div>
                        </div>
                    </div>
                        <ul className="navbar-nav mb-2 mb-lg-0">
                            {user && <div className="d-flex justify-content-around gap-2">
                                        <li className="nav-item"><button className="btn btn-outline-light rounded-pill" style={{height: '60px', width: '60px'}} onClick={handleLogout}><i className="fa fa-sign-out"></i></button></li>
                                    </div>}
                        </ul>
                </div>
            </nav>}
        </>
    );
}

export default Navbar;