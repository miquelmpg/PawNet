import { useState, useEffect } from 'react';
import { UserList } from '../components/users';
import { PostList } from '../components/posts';
import { Footer, PaginationArrows } from '../components/ui';
import { useAuth } from '../contexts/auth-context';
import * as ApiService from '../services/api-service';
import socket from '../services/socket';

function HomePage({ toggle, setToggle, numPage, setNumPage }) {
    const [posts, setPosts] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [usersListFollow, setUsersListFollow] = useState([]);
    const [usersFollow, setUsersFollow] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        async function getFollowing() {
            const updatedFollowing = await ApiService.getProfile(user.id);
            setUsersFollow(updatedFollowing.following.map((follow) => follow.following));
        }
        getFollowing();
    }, [toggle]);

    useEffect(() => {
        async function profileFetch() {
            const posts = await ApiService.postsList(numPage);
            setPosts(posts);
        }

        profileFetch();
    }, [numPage]);

    useEffect(() => {
        const handleCreatePost = (post) => {
            setPosts((prev) => {
                if (prev.some(p => p.id === post.id)) return prev;
                return [post, ...prev];
            });
        };

        socket.on("post:created", handleCreatePost);
        socket.on(`user:${user.id}`, handleCreatePost);

        return () => {
            socket.off("post:created", handleCreatePost);
        };
    }, []);

    useEffect(() => {
        const handleCreateComment = (comment) => {
            setPosts(prev => prev.map(post => post.id === comment.post ? { ...post, comments: [...(post.comments || []), comment].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) } : post));
        };

        socket.on("comment:created", handleCreateComment);

        return () => {
            socket.off("comment:created", handleCreateComment);
        };
    }, []);

    useEffect(() => {
        const handleCreateLikePost = ({ postId, like }) => {
            setPosts(prev => prev.map(post => post.id === postId ? {...post, likes: [...post.likes, {user: {id: like}}]} : post));
        };

        socket.on("like:created", handleCreateLikePost);

        return () => {
            socket.off("like:created", handleCreateLikePost);
        };
    }, []);

    useEffect(() => {
        const handleCreateLikeComment = ({ postId, like }) => {
            setPosts(prev => prev.map(post => ({ ...post, comments: (post.comments ?? []).map(comment => comment.id === postId ? { ...comment, likes: [...(comment.likes ?? []), { user: { id: like } }] } : comment) })));
        };

        socket.on("like:created", handleCreateLikeComment);

        return () => {
            socket.off("like:created", handleCreateLikeComment);
        };
    }, []);

    useEffect(() => {
        const handleDeleteLikePost = ({ postId, like }) => {
            setPosts(prev => prev.map(post => post.id === postId ? { ...post, likes: post.likes.filter(likeItem => likeItem.user.id !== like) } : post));
        };

        socket.on("like:deleted", handleDeleteLikePost);

        return () => {
            socket.off("like:deleted", handleDeleteLikePost);
        };
    }, []);

    useEffect(() => {
        const handleDeleteLikeComment = ({ postId, like }) => {
            setPosts(prev => prev.map(post => post.id !== postId ? { ...post, comments: post.comments.map(comment => comment.id === postId ? { ...comment, likes: comment.likes.filter(l => l.user.id !== like) } : comment) } : post));
        };

        socket.on("like:deleted", handleDeleteLikeComment);

        return () => {
            socket.off("like:deleted", handleDeleteLikeComment);
        };
    }, []);

    useEffect(() => {
        const timer = search ? 500 : 0;

        const timeout = setTimeout(async () => {
            const users = await ApiService.usersList(search);
            setUsersList(users.filter(user => !usersFollow.some(f => f.id === user.id)))
        }, timer);

        return () => {
            clearTimeout(timeout);
        };
    }, [search, usersFollow]);

    // setUsersList(
    //     users.filter(user => 
    //         usersFollow.some(f => f.id === user.id)
    //     )
    // )

    return ( 
        <>  
            <div className='d-flex gap-5' style={{ minHeight: 'calc(100vh - 190px)'}}>
                <UserList usersList={usersList} search={search} setSearch={setSearch} setUsersList={setUsersList} usersFollow={usersFollow} setToggle={setToggle} filter follows={false}/>
                <PostList setPosts={setPosts} post={posts} setUsersFollow={setUsersFollow} setToggle={setToggle} usersFollow={usersFollow} profile/>
                <UserList usersList={usersFollow} search={search} setSearch={setSearch} setUsersList={setUsersFollow} setToggle={setToggle} usersFollow={usersFollow} filter={false} follows/>
            </div>
            <Footer numPage={numPage} setNumPage={setNumPage} posts={posts}/>
        </>
    );
}

export default HomePage;