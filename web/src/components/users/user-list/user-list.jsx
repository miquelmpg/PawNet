import UserItem from '../user-item/user-item';
import { Search } from '../../ui';
import { useAuth } from '../../../contexts/auth-context';
import * as ApiService from '../../../services/api-service';

function UserList({ usersList, search, setSearch, setUsersList, usersFollow, filter, follows, setToggle }) {
    const { user } = useAuth();
    
    return (
        <>
            <div className="d-flex flex-column gap-3 w-25 rounded-5 p-5" style={{backgroundColor: '#e44949'}}>
                {filter && <Search search={search} setSearch={setSearch}/>}

                {follows && <div className='d-flex text-white'>
                                <div className='rounded-5 text-center' style={{width: '200px', height: '25px', backgroundColor: '#202020'}}>Accounts you follow</div>
                            </div>}

                {usersList && usersList.map((user) => (
                    <div key={user.id}>
                        <UserItem {...user} usersFollow={usersFollow} setToggle={setToggle} />
                    </div>
                ))}
            </div>
        </>
    );
}

export default UserList;