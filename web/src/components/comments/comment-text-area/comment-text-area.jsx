import { useAuth } from '../../../contexts/auth-context';
import { sileo } from 'sileo';
import * as ApiService from '../../../services/api-service';

function CommentTextArea({ setPosts, id }) {
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
                            const newComment = await ApiService.createComment(id, { content: e.target.value });
                            setPosts(prev => prev.map(post => post.id === id ? { ...post, comments: [...post.comments, { ...newComment, user: user, likes: [] }] } : post));
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
            <label htmlFor="floatingTextarea2">Comments</label>
        </div>
    );
}

export default CommentTextArea;