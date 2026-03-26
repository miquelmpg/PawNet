import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserProfile } from "../components/users";
import { useAuth } from '../contexts/auth-context';
import { Layout } from "../components/ui";
import * as ApiService from '../services/api-service';

function UserAccount() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [opacity, setOpacity] = useState(0);
    const { user: currentUser } = useAuth();
    const { id } = useParams();
    
    async function deleteAccount(id) {
        const confirmed = confirm(`You are going to delete your account. Are you sure?`);
        if (!confirmed) return;

        await ApiService.deleteProfile(currentUser.id);
        navigate('/register')
    }

    useEffect(() => {
        async function getUserProfile() {
            const detailUser = await ApiService.getProfile(currentUser.id);
            setUser(detailUser);
        }
        getUserProfile();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpacity(1);
        }, 300);

        return () => clearTimeout(timer);
    } , []);

    return (
        <>

            <div className="d-flex flex-column justify-content-center align-items-center gap-1" style={{width: '100%', minHeight: 'calc(100vh - 125px)'}}>
                <div className="d-flex flex-column justify-content-center rounded-4 pt-3 pb-3" style={{width: '500px', height: 'auto', backgroundColor: '#202020', opacity: opacity, transition: 'opacity 1s ease'}}>
                    <Layout>
                        <div>
                            {user && <UserProfile {...user} />}
                        </div>                
                    </Layout>
                </div>
                <div className="text-center align-self-center w-25">
                    {currentUser.id && <div className="fa fa-trash w-100 rounded-5 text-white d-flex justify-content-center align-items-center gap-2" style={{ width: '35px', height: '30px', opacity: opacity, transition: 'opacity 1s ease', backgroundColor: '#202020'}} onClick={() => deleteAccount()}> Delete Account</div>}
                </div>
            </div>
    
        </>
    );
}

export default UserAccount;