import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PostList } from '../components/posts';
import { useAuth } from '../contexts/auth-context';
import { sileo } from 'sileo';
import { PaginationArrows } from '../components/ui';
import * as ApiService from '../services/api-service';

function UserPageActivity({ toggle, setToggle }) {
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
        try {
            async function getUserProfile() {
                const detailUser = await ApiService.getProfile(id);
                const postUser = await ApiService.postsListById(id);
                setUser(detailUser);
                setPosts(postUser);

                if (postUser.length > 0) {
                    sileo.info({ title: "Use bottom arrows to navigate posts" });
                }
            }
            getUserProfile();
        } catch (error) {
            console.log(error);
        }
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
            <div className='d-flex justify-content-center' style={{height: 'auto', minHeight: 'calc(100vh - 125px)'}}>
                <div className='d-flex flex-column align-items-center justify-content-center gap-3 w-100' style={{position: 'relative'}}>
                    {userPost && userPost.length > 0 && <PostList post={[userPost[index]]} setToggle={setToggle} usersFollow={usersFollow} setPosts={setPosts} profile={false} />}
                    {userPost && userPost.length === 0 && <div className="text-white rounded-5 d-flex align-items-center justify-content-center fs-5" style={{backgroundColor: '#202020', width: '55vw', height: '15vh'}}>This user does not have comments yet.</div>}
                    {user && !(userPost.length === 0) && <PaginationArrows numPage={index} addOneToPage={addOneToIndexNumber} subtractOneTpoPage={subtractOneToIndexNumber} posts={userPost} detail />}
                </div>
            </div>
        </>
    );
}

export default UserPageActivity;