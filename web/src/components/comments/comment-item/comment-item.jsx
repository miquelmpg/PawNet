import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './../../../contexts/auth-context';
import { sileo } from 'sileo';
import * as ApiService from '../../../services/api-service';
import * as DateUtils from '../../../utils/date-utils';
import socket from '../../../services/socket';

function CommentItem({ id, user, likes, content, createdAt, post, setPosts, usersFollow, setToggle }) {
    const [opacity, setOpacity] = useState(0);
    const { user: currentUser } = useAuth();

    async function deleteComment(postId, commentId) {
        try {
            await ApiService.deleteComment(postId, commentId);
            setPosts(prev => prev.map(post => post.id === postId ? { ...post,  comments: post.comments.filter(comment => comment.id !== commentId)} : post));
        } catch (error) {
            if (error.response.status) {
                sileo.error({
                    title: "Something went wrong",
                    description: "You cannot delete a comment you do not own.",
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
        const handleDelete = ({ postId, commentId} ) => {
            setPosts(prev => prev.map(post => post.id === postId ? { ...post, comments: (post.comments ?? []).filter(comment => comment.id != commentId) } : post));
        };

        socket.on("comment:deleted", handleDelete);

        return () => {
            socket.off("comment:deleted", handleDelete);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpacity(1);
        }, 200);

        return () => clearTimeout(timer);
    } , []);
    
    return (
        <div className="container rounded-5 p-5 mb-2 mt-2" style={{backgroundColor: '#f5f5f5', position: 'relative', opacity: opacity, transition: 'opacity 1s ease'}}>
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
                <div style={{position: 'absolute', top: 15, right: 20, cursor: 'pointer'}} onClick={() => deleteComment(post, id)}><i className="fa fa-times"></i></div>
                <div style={{position: 'absolute', top: 45, right: 20, cursor: 'pointer'}} onClick={() => newFollow(user?.id)}>
                    <i className={usersFollow
                                    ?.map((follow) => follow.id)
                                    .includes(user?.id) ? 'fa fa-minus' : 'fa fa-plus'}>
                    </i>
                </div>
            </div>
            <div style={{position: 'absolute', bottom: 15, left: 20}} onClick={()=> addLike(id)}>
                <i className='fa fa-thumbs-up' style={{color : likes?.map(like => like?.user?.id).includes(currentUser.id) ? 'red' : '', cursor: 'pointer'}}></i>
            </div>
            <div style={{position: 'absolute', bottom: 15, left: 50}}>{likes?.length}</div>
        </div>
    );
}

export default CommentItem;