import axios from "axios";

const http = axios.create({
    baseURL:
        window.location.hostname === "localhost"
        ? "http://localhost:3000/api"
        : "https://social-net-work.fly.dev/api",
    withCredentials: true,
});

http.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error),
);

export function register(user) {
    return http.post('users', user);
}

export function login(email, password) {
    return http.post('/sessions', { email, password });
}

export function logout() {
    return http.delete('/sessions');
}

export function usersList(search) {
    return http.get(`/users?userName=${search}`);
}

export function getProfile(id) {
    return http.get(`/users/${id}`);
}

export function updateProfile(id, data) {
    return http.patch(`/users/${id}`, data);
}

export function deleteProfile(id) {
    return http.delete(`/users/${id}`);
}

export function createPost(post) {
    return http.post(`/posts`, post);
}

export function postsList(numPage) {
    return http.get(`/posts?page=${numPage}`);
}

export function postsListById(id) {
    return http.get(`/posts/${id}`);
}

export function deletePost(id) {
    return http.delete(`/posts/${id}`);
}

export function createComment(postId, comment) {
    return http.post(`/posts/${postId}/comments`, comment);
}

export function deleteComment(postId, commentId) {
    return http.delete(`/posts/${postId}/comments/${commentId}`);
}

export function createFollow(id) {
    return http.post(`/follows/${id}/toggle`);
}

export function countLikes(id) {
    return http.get(`/likes/${id}/count-likes`);
}

export function createLike(id) {
    return http.post(`/likes/${id}/toggle`);
}