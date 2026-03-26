import { useForm } from 'react-hook-form';
import * as ApiService from '../../../services/api-service';
import * as DateUtils from '../../../utils/date-utils';

function UserProfile({ id, userName, email, password, bio, firstName, lastName, location, gender, birthday }) {
    const defaultValues = {
        firstName,
        lastName,
        gender,
        birthday: birthday ? DateUtils.dateToString(birthday)[0] : '',
        location,
        userName,
        email,
        password,
        bio,
    }

    const { register, handleSubmit, formState: { errors, isValid } } = useForm({defaultValues});


    const onSubmit = async (data) => {
        if (!data.password) {
            delete data.password;
        }
        await ApiService.updateProfile(id, data);
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            {/* USERNAME */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-user fa-fw"></i></span>
                <input type="text" className={`form-control ${errors.userName ? 'is-invalid' : ''}`} placeholder="Enter your username" {...register('userName', { required: 'User userName is required' }) }/>
                {errors.userName && (<div className="invalid-feedback">{errors.userName.message}</div> )}
            </div>

            {/* EMAIL */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-envelope fa-fw"></i></span>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="user@example.org" {...register('email', { required: 'User email is required' })} />
                {errors.email && (<div className="invalid-feedback">{errors.email.message}</div>)}
            </div>

            {/* PASSWORD */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-lock fa-fw"></i></span>
                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="*****" {...register('password')} />
                {errors.password && (<div className="invalid-feedback">{errors.password.message}</div>)}
            </div>

            {/* FIRST NAME */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-user fa-fw"></i></span>
                <input type="text" className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} placeholder="Enter your first name" {...register('firstName', { required: 'User firstName is required' }) }/>
                {errors.firstName && (<div className="invalid-feedback">{errors.firstName.message}</div> )}
            </div>

            {/* LAST NAME */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-user fa-fw"></i></span>
                <input type="text" className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} placeholder="Enter your last name" {...register('lastName', { required: 'User lastName is required' }) }/>
                {errors.lastName && (<div className="invalid-feedback">{errors.lastName.message}</div> )}
            </div>

            {/* BIO */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-pencil"></i></span>
                <input type="text" className={`form-control ${errors.bio ? 'is-invalid' : ''}`} placeholder="Enter your bio" {...register('bio', { required: 'User bio is required' }) }/>
                {errors.bio && (<div className="invalid-feedback">{errors.bio.message}</div> )}
            </div>

            {/* LOCATION */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-map"></i></span>
                <input type="text" className={`form-control ${errors.location ? 'is-invalid' : ''}`} placeholder="Enter your location" {...register('location', { required: 'User location is required' }) }/>
                {errors.location && (<div className="invalid-feedback">{errors.location.message}</div> )}
            </div>

            {/* GENDER */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-mercury"></i></span>
                <input type="text" className={`form-control ${errors.gender ? 'is-invalid' : ''}`} placeholder="Enter your gender" {...register('gender', { required: 'User gender is required' }) }/>
                {errors.gender && (<div className="invalid-feedback">{errors.gender.message}</div> )}
            </div>

            {/* BIRTHDAY */}
            <div className="input-group mb-1">
                <span className="input-group-text"><i className="fa fa-birthday-cake"></i></span>
                <input type="text" className={`form-control ${errors.birthday ? 'is-invalid' : ''}`} placeholder="Enter your birthday" {...register('birthday', { required: 'User userName is required' }) }/>
                {errors.birthday && (<div className="invalid-feedback">{errors.birthday.message}</div> )}
            </div>

            <div className="d-grid gap-2 mt-2">
                <button className='btn btn-primary' type='submit' disabled={!isValid}>Update</button>
                <hr className='m-0' />
            </div>
        </form>
    );
}

export default UserProfile;