import Axios from 'axios';
import jwt_decode from 'jwt-decode';

import { log } from '../services/Logger';

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
    Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/signup', user)
        .then(res => {
            if (res.status === 201) {
                log("Successfully registered!");
            } else {
                console.error("Register failed with status code " + res.status);
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
                    errors: err
                }, false);
            }
        });
}

export const loginUser = (user, history, next, nextRoute) => {
    Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/login', user)
        .then(res => {
            if (res) {
                if (res.status === 200) {
                    log("Successfully logged in!");
                    const decoded = login(res, history, nextRoute);
                    next(false, {
                        message: "Successfully logged in!",
                        data: decoded
                    });
                } else {
                    console.error("Login failed with status code " + res.status);
                    next({
                        message: "Login failed!",
                        // errors: err.response.data
                        // TODO errors
                    }, false);
                }
            }
        })
        .catch(err => {
            if (err) {
                console.error("Login failed! Catched error!");
                console.error(err);
                next({
                    message: "Login failed!",
                    // errors: err.response.data
                    // TODO errors
                }, false);
            }
        });
}

const login = (res, history, nextRoute) => {
    // nextRoute = nextRoute || "/exercises";
    const { token } = res.data;
    // localStorage.setItem('jwtToken', token);
    setAuthToken(token);
    const decoded = jwt_decode(token);
    if (nextRoute !== null) {
        history.push(nextRoute);
    }
    return decoded;
}

const setAuthToken = token => {
    if (token) {
        Axios.defaults.headers.common['Authorization'] = token;
    } else {
        delete Axios.defaults.headers.common['Authorization'];
    }
}


