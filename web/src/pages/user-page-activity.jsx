import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PostList } from '../components/posts';
import { useAuth } from '../contexts/auth-context';
import * as ApiService from '../services/api-service';

function UserPageActivity({ toggle, setToggle}) {
    const [user, setUser] = useState(null);
    const [userPost, setPosts] = useState(null);
    const [index, setIndex] = useState(0);
    const [usersFollow, setUsersFollow] = useState([]);
    const { user: currentUser } = useAuth();
    const { id } = useParams();

    function addOneToIndexNumber() {
        {user && (index === (user?.posts?.length - 1)) ? setIndex((0)) : setIndex((prev) => prev + 1);}
    }

    function subtractOneToIndexNumber() {
        {user && index === 0 ? setIndex(user?.posts?.length - 1) : setIndex((prev) => prev - 1);}
    }

    useEffect(() => {
        async function getUserProfile() {
            const detailUser = await ApiService.getProfile(id);
            const postUser = await ApiService.postsListById(id);
            setUser(detailUser);
            setPosts(postUser);
        }
        getUserProfile();
    }, [toggle, id]);

    useEffect(() => {
        async function getFollowing() {
            const updatedFollowing = await ApiService.getProfile(currentUser.id);
            setUsersFollow(updatedFollowing.following.map((follow) => follow.following));
        }
        getFollowing();
    }, [toggle]);

    return (
        <>
            <div className='d-flex justify-content-center' style={{height: 'auto', minHeight: 'calc(100vh - 76px)'}}>
                <div className='d-flex align-items-center justify-content-center w-100' style={{position: 'relative'}}>
                    {userPost && userPost.length > 0 && <PostList post={[userPost[index]]} setToggle={setToggle} usersFollow={usersFollow} setPosts={setPosts} profile={false} />}
                    {user && !(userPost.length === 0) && <div className="fa fa-angle-left btn btn-outline-light btn-sm mb-2 rounded-pill align-self-center" style={{width: '35px', height: 'auto', position: 'absolute', top: '20px', left: '245px'}} onClick={() => subtractOneToIndexNumber()}></div>}
                    {user && !(userPost.length === 0) && <div className="fa fa-angle-right btn btn-outline-light btn-sm mb-2 rounded-pill align-self-center" style={{width: '35px', height: 'auto', position: 'absolute', top: '20px', right: '245px', backgroundColor: ''}} onClick={() => addOneToIndexNumber()}></div>}
                    {userPost && userPost.length === 0 && <div className="text-white rounded-5 d-flex align-items-center justify-content-center fs-5" style={{backgroundColor: '#202020', width: '55vw', height: '15vh'}}>This user does not have comments yet.</div>}
                </div>
            </div>
        </>
    );
}

export default UserPageActivity;