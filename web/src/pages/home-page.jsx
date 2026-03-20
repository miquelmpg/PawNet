import { useState, useEffect } from 'react';
import { UserList } from '../components/users';
import { PostList } from '../components/posts';
import { Navbar } from '../components/ui';
import { useAuth } from '../contexts/auth-context';
import * as ApiService from '../services/api-service';

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    console.log(user);

    useEffect(() => {
        async function profileFetch() {
        const posts = await ApiService.postsList();
        setPosts(posts);
    };
        profileFetch();
    }, []);

    useEffect(() => {
        const timer = search ? 500 : 0;

        const timeout = window.setTimeout(async () => {
            const users = await ApiService.usersList(search);
            setUsersList(users);
        }, timer);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [search]);

    return ( 
        <>  
            <Navbar />
            <div className='d-flex gap-5'>
                <UserList user={usersList} search={search} setSearch={setSearch} setUsersList={setUsersList}/>
                <PostList setPosts={setPosts} post={posts}/>
                <UserList user={usersList}/>
            </div>
        </>
    );
}

export default HomePage;