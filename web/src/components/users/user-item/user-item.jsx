import { Link } from "react-router-dom";
import { useAuth } from '../../../contexts/auth-context';
import * as ApiService from '../../../services/api-service';

function UserItem({ id, userName, profilePicture, usersFollow, setToggle }) {
    const { user: currentUser } = useAuth();

    async function newFollow(id) {
        await ApiService.createFollow(id);
        // await ApiService.getProfile(currentUser.id);
        setToggle((prev) => !prev);
    }

    return (
        <div>
            <Link className="d-flex align-items-center gap-2 text-decoration-none text-white" to={`/users/${id}`} >
                <img className='rounded-circle' style={{width: '50px'}} src={profilePicture}/>
                <div>{userName}</div>
            </Link>
            <div style={{position: 'absolute'}}>
                <div style={{position: 'absolute', bottom: 10, right: 20, cursor: 'pointer'}} onClick={() => newFollow(id)}>
                    <i className={usersFollow
                                    .map((follow) => follow.id)
                                    .includes(id) ? 'fa fa-minus' : 'fa fa-plus'}>
                    </i>
                </div>
            </div>
        </div>
    );
}

export default UserItem;