import { useState, useEffect} from 'react';
import { Link } from "react-router-dom";
import { useAuth } from '../../../contexts/auth-context';
import { sileo } from 'sileo';
import * as ApiService from '../../../services/api-service';
import socket from "../../../services/socket";

function UserItem({ id, userName, profilePicture, usersFollow, setToggle }) {
    const { user: currentUser, setUser: setCurrentUser } = useAuth();

    async function newFollow(id) {
        try {
            await ApiService.createFollow(id);
            // setCurrentUser((prev) => [...prev.following || [], {following: {following: {id, profilePicture, userName}}}])
            setToggle((prev) => !prev);
        } catch (error) {
            if (error.response.status) {
                sileo.error({
                    title: "Something went wrong",
                    description: "You cannot follow yourself.",
                });
            }
        }
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
                <div style={{position: 'absolute', top: -20, left: 40}} onClick={() => newFollow(id)}>
                    <i className='fa fa-circle' style={{color: currentUser.id === id ? "green" : "red"}}></i>
                </div>
            </div>
        </div>
    );
}

export default UserItem;