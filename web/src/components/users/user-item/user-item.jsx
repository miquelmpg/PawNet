import { Link } from "react-router-dom";

function UserItem({ id, userName, profilePicture }) {
    return (
        <>
            <Link className="d-flex align-items-center gap-2 text-decoration-none text-white" to={`/users/${id}`}>
                <img className='rounded-circle' style={{width: '50px'}} src={profilePicture}/>
                <div>{userName}</div>
            </Link>
        </>
    );
}

export default UserItem;