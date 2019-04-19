import Axios from 'axios';
import jwt_decode from 'jwt-decode';

export const isAuthenticated = (allowedRoles) => {
    if (Axios.defaults.headers.common['Authorization']) {
        if(allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(getUserData().role) === -1) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

export const getUserData = () => {
    if (!isAuthenticated()) {
        return { email: "unknown" };
    }
    return jwt_decode(Axios.defaults.headers.common['Authorization']);
}

export const logoutUser = (history, next) => {
    // localStorage.removeItem('jwtToken');
    setAuthToken(false);
    history.push('/login');
    next(false, { message: "Successfully logged out!"});
}

export const registerUser = (user, history, next) => {
    Axios.post('http://localhost:4000/signup', user)
        .then(res => {
            if (res.status === 201) {
                console.log("Successfully registered!");
            } else {
                console.log("Register failed with status code " + res.status);
            }
            if (res) {
                history.push('/login')
                next(false, { message: "Sucessfully registered!" });
            }
        })
        .catch(err => {
            if (err) {
                console.error(err);
                next({
                    message: "Register failed!",
                    errors: err.response.data
                }, false);
            }
        });
}

export const loginUser = (user, history, next, nextRoute) => {
    Axios.post('http://localhost:4000/login', user)
        .then(res => {
            if (res) {
                if (res.status === 200) {
                    console.log("Successfully logged in!");
                } else {
                    console.log("Login failed with status code " + res.status);
                }
                const decoded = login(res, history, nextRoute);
                next(false, {
                    message: "Successfully logged in!",
                    data: decoded
                });
            }
        })
        .catch(err => {
            if (err) {
                next({
                    message: "Login failed!",
                    // errors: err.response.data
                }, false);
            }
        });
}

const login = (res, history, nextRoute) => {
    nextRoute = nextRoute || "/exercises";
    const { token } = res.data;
    // localStorage.setItem('jwtToken', token);
    setAuthToken(token);
    const decoded = jwt_decode(token);
    history.push(nextRoute);
    return decoded;
}

const setAuthToken = token => {
    if (token) {
        Axios.defaults.headers.common['Authorization'] = token;
    } else {
        delete Axios.defaults.headers.common['Authorization'];
    }
}


