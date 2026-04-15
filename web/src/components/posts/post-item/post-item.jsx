import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { sileo } from 'sileo';
import * as ApiService from '../../../services/api-service';
import * as DateUtils from '../../../utils/date-utils';
import socket from '../../../services/socket';

function PostItem({ id, user, likes, content, createdAt, setPosts, setToggle, usersFollow}) {
    const [opacity, setOpacity] = useState(0);
    const { user: currentUser } = useAuth();

    async function deletePost(id) {
        try {
            await ApiService.deletePost(id);
            setPosts(prev => prev.filter(post => post.id !== id));
        } catch (error) {
            if (error.response.status) {
                sileo.error({
                    title: "Something went wrong",
                    description: "You cannot delete a post you do not own.",
                });
            }
        } 
    }

    async function newFollow(id) {
        await ApiService.createFollow(id);
        await ApiService.getProfile(currentUser.id);
        setToggle((prev) => !prev);
    }

    async function addLike(id) {
        await ApiService.createLike(id);
        setToggle((prev) => !prev);
    }

    useEffect(() => {
        const handleDelete = (id) => {
            setPosts((prev) => prev.filter(p => p.id !== id));
        };

        socket.on("post:deleted", handleDelete);

        return () => {
            socket.off("post:deleted", handleDelete);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpacity(1);
        }, 200);

        return () => clearTimeout(timer);
    } , []);
    
    return (
        <div className="container rounded-5 p-5 mb-2" style={{backgroundColor: '#f5f5f5', position: 'relative', opacity, transition: 'opacity 1s ease'}}>
            <div className="">
                <Link className='text-decoration-none text-black' to={`/users/${user?.id}`}>
                    <div className='d-flex justify-content-start align-items-center gap-5'>
                        <img className='rounded-circle' style={{width: '100px'}} src={user?.profilePicture} alt="" />
                        <div>
                            <div>{user?.userName}</div>
                            <div>{DateUtils.dateToString(createdAt)[0]}</div>
                            <div>{DateUtils.dateToString(createdAt)[1]}</div>
                        </div>
                    </div>
                </Link>
                <div style={{textAlign: "justify"}}>{content}</div>
                <div style={{position: 'absolute', top: 15, right: 20, cursor: 'pointer'}} onClick={() => deletePost(id)}><i className="fa fa-times"></i></div>
                <div style={{position: 'absolute', top: 45, right: 20, cursor: 'pointer'}} onClick={() => newFollow(user?.id)}>
                    <i className={usersFollow
                                    .map((follow) => follow.id)
                                    .includes(user?.id) ? 'fa fa-minus' : 'fa fa-plus'}>
                    </i>
                </div>
                <div style={{position: 'absolute', bottom: 15, left: 20}} onClick={()=> addLike(id)}>
                    <i className='fa fa-thumbs-up' style={{color : likes?.map(like => like?.user?.id).includes(currentUser.id) ? 'red' : '', cursor: 'pointer'}}></i>
                </div>
                <div style={{position: 'absolute', bottom: 15, left: 50}}>{likes?.length}</div>
            </div>
        </div>
    );
}

export default PostItem;