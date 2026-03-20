import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../../contexts/auth-context';
import { Search } from '../../ui'
import * as ApiService from '../../../services/api-service';

function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await ApiService.logout();
        navigate('/login');
    }

    return (
        <nav className="navbar navbar-expand-lg" style={{backgroundColor: '#202020'}}>
            <div className="container-fluid">
                <NavLink className="navbar-brand fw-bold text-white" to={'/'}>PetNet</NavLink>
                <NavLink className='me-auto' to={`/users/${user.id}`}>
                    <img src={user.profilePicture} className='rounded-circle' style={{width: '45px'}} />
                </NavLink>
                <div className="text-white">{user.userName}</div>
                <div className="text-white">Following: {user.following.length}</div>
                <div className="text-white">Followers: {user.followers.length}</div>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="me-auto mb-2 mb-lg-0" style={{width: '100%', listStyle: 'none'}}>
                        <li className="d-flex mx-auto">
                            <Search/>
                            <Search/>
                        </li>
                    </ul>
                    <ul className="navbar-nav mb-2 mb-lg-0">
                        {user && <div className="d-flex justify-content-around gap-2">
                                    <li className="nav-item"><button className="btn btn-outline-light rounded-pill" onClick={handleLogout}><i className="fa fa-sign-out"></i></button></li>
                                </div>}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;