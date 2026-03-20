import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as ApiService from '../services/api-service';

function UserPage() {
    const [user, setUser] = useState(null);
    const { id } = useParams();

    async function deleteAccount(id) {
        confirm(`You are going to delete your account. Are you sure?`);
        await ApiService.deleteProfile(id);
    }

    useEffect(() => {
        async function getUserProfile() {
            const detailUser = await ApiService.getProfile(id);
            setUser(detailUser);
        }
        getUserProfile();
    }, []);

    return (
        <>
            {user &&
                <div key={user.id}>
                    <div>{user.userName}</div>
                    
                    <div>Animales</div>
                    {user.pets.map((pet) => (
                    <div>
                        <div>
                            <div>{pet.name}</div>
                        </div>
                    </div>
                    ))}

                    <div>Posts</div>
                    {user.posts.map((post) => (
                    <div>
                        <div>
                            <div>{post.content}</div>
                        </div>
                    </div>
                    ))}
                </div>}

                {/* <div onClick={() => deleteAccount(user.id)}>Delete Acount</div> */}
        </>
    );
}

export default UserPage;