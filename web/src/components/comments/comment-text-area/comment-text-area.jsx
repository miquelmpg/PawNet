import { useAuth } from '../../../contexts/auth-context';
import { useState, useEffect } from 'react';
import { sileo } from 'sileo';
import * as ApiService from '../../../services/api-service';

function CommentTextArea({ setPosts, id }) {
    const [opacity, setOpacity] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpacity(1);
        }, 200);

        return () => clearTimeout(timer);
    } , []);
    
    return (
        <div className="form-floating" style={{opacity: opacity, transition: 'opacity 1s ease'}}>
            <textarea 
                className="form-control rounded-5" 
                placeholder="Leave a comment here" 
                id="floatingTextarea2" 
                style={{height: "100px"}}
                onKeyDown={async (e) => {
                    try {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            await ApiService.createComment(id, { content: e.target.value });
                            e.target.value = "";
                        }
                    } catch (error) {
                        if (error.response.status) {
                            sileo.warning({
                                title: "Warning",
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