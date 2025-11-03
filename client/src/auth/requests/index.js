/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: 'http://localhost:4000/auth',
// })

const BASE_URL = 'http://localhost:4000/auth';

const handleResponse = async (response) => {
    // axios response schema
    let newResponse = { 
        data: {},
        status:  response.status,
        statusText: response.statusText, 
        headers: response.headers
        // config: {},
        // request: {}
    }

    const contentType = response.headers.get('content-type');
    const hasJson = contentType && contentType.includes('application/json');

    if(response.ok) {
        if (hasJson) {
            newResponse.data = await response.json();
        }
    }
    else{

        if (hasJson) {
            newResponse.data = await response.json().catch(() => ({}));
        }

        const error = new Error(newResponse.data.message || `Request failed with status ${response.status}`);
        error.response = newResponse;
        throw error;
    }
    return newResponse;
}

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

// export const getLoggedIn = () => api.get(`/loggedIn/`);
export const getLoggedIn = async () => {
    const response = await fetch(`${BASE_URL}/loggedIn/`, {
        method: 'GET',
        credentials: 'include'
    });
    return handleResponse(response)
}

// export const loginUser = (email, password) => {
//     return api.post(`/login/`, {
//         email : email,
//         password : password
//     })
// }
export const loginUser = async (email, password) => {
    const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email : email,
            password : password
        })
    })
    return handleResponse(response);
}

// export const logoutUser = () => api.get(`/logout/`)
export const logoutUser = async () => {
    const response = await fetch(`${BASE_URL}/logout/`, {
        method: 'GET',
        credentials: 'include',
    })
    return handleResponse(response);
}

// export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
//     return api.post(`/register/`, {
//         firstName : firstName,
//         lastName : lastName,
//         email : email,
//         password : password,
//         passwordVerify : passwordVerify
//     })
// }
export const registerUser = async (firstName, lastName, email, password, passwordVerify) => {
    const response = await fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            firstName : firstName,
            lastName : lastName,
            email : email,
            password : password,
            passwordVerify : passwordVerify
        })
    })
    return handleResponse(response);
}

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis
