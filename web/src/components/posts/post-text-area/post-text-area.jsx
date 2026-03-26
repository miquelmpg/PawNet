import { useAuth } from '../../../contexts/auth-context';
import { sileo } from 'sileo'
import * as ApiService from '../../../services/api-service';

function PostTextArea({ setPosts }) {
    const { user } = useAuth();
    
    return (
        <div className="form-floating">
            <textarea 
                className="form-control rounded-5" 
                placeholder="Leave a comment here" 
                id="floatingTextarea2" 
                style={{height: "100px"}}
                onKeyDown={async (e) => {
                    try {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            const newPost = await ApiService.createPost({ content: e.target.value });
                            setPosts(prev => ([...prev,{...newPost, user: user, comments: [], likes: []}]).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                            e.target.value = "";
                        }
                    } catch (error) {
                        if (error.response.status) {
                            sileo.error({
                                title: "Something went wrong",
                                description: "Offensive language is not allowed.",
                            });
                        }
                    }
                }}
                ></textarea>
            <label htmlFor="floatingTextarea2">Posts</label>
        </div>
    );
}

export default PostTextArea;