import UserItem from '../user-item/user-item';
import { Search } from '../../ui';
import { useAuth } from '../../../contexts/auth-context';

function UserList({ user, search, setSearch, setUsersList }) {
    const { user: currentUser } = useAuth();
    
    return (
        <>
            <div className="d-flex flex-column gap-3 w-25 rounded-5 p-5" style={{backgroundColor: '#e44949'}}>
                <Search search={search} setSearch={setSearch}/>
                <div className='d-flex'>
                    <div onClick={() => setUsersList(currentUser.followers)}>Followers</div>
                    <div onClick={() => setUsersList(currentUser.following)}>following</div>
                    <div onClick={() => setSearch('')}>XXXX</div>
                </div>

                {user && user.map((user) => (
                            <div key={user.id}>
                                <UserItem {...user}/>
                            </div>
                ))}
            </div>
        </>
    );
}

export default UserList;