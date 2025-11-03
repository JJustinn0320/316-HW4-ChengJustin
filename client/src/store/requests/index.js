/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: 'http://localhost:4000/store',
// })

const BASE_URL = 'http://localhost:4000/store';
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
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

// export const createPlaylist = (newListName, newSongs, userEmail) => {
//     return api.post(`/playlist/`, {
//         // SPECIFY THE PAYLOAD
//         name: newListName,
//         songs: newSongs,
//         ownerEmail: userEmail
//     })
// }
export const createPlaylist = async (newListName, newSongs, userEmail) => {
    const response = await fetch(`${BASE_URL}/playlist/`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    })
    return handleResponse(response)
}

// export const deletePlaylistById = (id) => api.delete(`/playlist/${id}`)
export const deletePlaylistById = async (id) => {
    const response = await fetch(`${BASE_URL}/playlist/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    return handleResponse(response);
}

// export const getPlaylistById = (id) => api.get(`/playlist/${id}`)
export const getPlaylistById = async (id) => {
    const response = await fetch(`${BASE_URL}/playlist/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    return handleResponse(response);
}

// export const getPlaylistPairs = () => api.get(`/playlistpairs/`)
export const getPlaylistPairs = async () => {
    const response = await fetch(`${BASE_URL}/playlistpairs/`, {
        method: 'GET',
        credentials: 'include'
    })
    return handleResponse(response);
}

// export const updatePlaylistById = (id, playlist) => {
//     return api.put(`/playlist/${id}`, {
//         // SPECIFY THE PAYLOAD
//         playlist : playlist
//     })
// }
export const updatePlaylistById = async (id, playlist) => {
    const response = await fetch(`${BASE_URL}/playlist/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            playlist : playlist
        })
    })
    return handleResponse(response);
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis
