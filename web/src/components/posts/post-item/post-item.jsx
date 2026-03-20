import { Link } from 'react-router-dom';
import * as ApiService from '../../../services/api-service';

function PostItem({ id, user, content, createdAt, setPosts }) {

    async function deletePost(id) {
        await ApiService.deletePost(id);
        setPosts(prev => prev.filter(post => post.id !== id));
    }

    async function newFollow(id) {
        await ApiService.createFollow(id);
    }
    
    return (
        <div className="container rounded-5 p-3" style={{backgroundColor: '#f5f5f5', position: 'relative'}}>
            <div className="">
                <Link to={`/users/${user.id}`}>
                    <div className='d-flex'>
                        <img className='rounded-circle' style={{width: '100px'}} src={user.profilePicture} alt="" />
                        <div>
                            <div>{user.userName}</div>
                            <div>{createdAt}</div>
                        </div>
                    </div>
                </Link>
                <div style={{textAlign: "justify"}}>{content}</div>
                <div style={{position: 'absolute', top: 15, right: 20}} onClick={() => deletePost(id)}>X</div>
                <div style={{position: 'absolute', top: 75, right: 20}} onClick={() => newFollow(id)}>Follow</div>
            </div>
        </div>
    );
}

export default PostItem;