//const Playlist = require('../models/playlist-model')
//const User = require('../models/user-model');
const auth = require('../auth')
//const db = require('../db')
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }

    try {
        // Get user to associate playlist
        const user = await req.db.findUserById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const playlistData = {
            name: body.name,
            songs: body.songs || [],
            ownerEmail: user.email
        };

        // Use database manager to create playlist
        const playlist = await req.db.createPlaylist(playlistData);
        
        // Update user's playlists
        const updatedPlaylists = [...user.playlists, playlist.id];
        await req.db.updateUserPlaylists(req.userId, updatedPlaylists);

        return res.status(201).json({
            playlist: playlist
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        });
    }
}

deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    
    try {
        const playlist = await req.db.findPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            });
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await req.db.findUserByEmail(playlist.ownerEmail);
        if (!user) {
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }

        // Use database-agnostic ID comparison
        const userId = user.id;
        if (userId.toString() !== req.userId.toString()) {
            console.log("incorrect user!");
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }

        console.log("correct user!");
        await req.db.deletePlaylist(req.params.id);
        
        // FIX: Handle null values in playlists array
        const updatedPlaylists = user.playlists
            .filter(playlistId => playlistId !== null) 
            .filter(playlistId => {
                if (!playlistId) return false;  // Skip null/undefined
                return playlistId.toString() !== req.params.id.toString();
            });
            
        console.log("Original playlists:", user.playlists);
        console.log("Updated playlists:", updatedPlaylists);
        
        await req.db.updateUserPlaylists(req.userId, updatedPlaylists);

        return res.status(200).json({});

    } catch (error) {
        console.error(error);
        return res.status(400).json({ 
            errorMessage: "Error deleting playlist: " + error.message 
        });
    }
}

getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    // Add detailed logging
    console.log("=== DEBUG getPlaylistById ===");
    console.log("Request params:", req.params);
    console.log("Request query:", req.query);
    console.log("Request URL:", req.url);
    console.log("Playlist ID from params:", req.params.id);
    console.log("Type of ID:", typeof req.params.id);
    console.log("=============================");
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const playlist = await req.db.findPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(400).json({ success: false, error: 'Playlist not found' });
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await req.db.findUserByEmail(playlist.ownerEmail);
        if (!user) {
            return res.status(400).json({ success: false, description: "authentication error" });
        }

        // Use database-agnostic ID comparison
        const userId = user.id;
        if (userId.toString() !== req.userId.toString()) {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }

        console.log("correct user!");
        return res.status(200).json({ success: true, playlist: playlist });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, error: error.message });
    }
}

getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    
    try {
        const user = await req.db.findUserById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        console.log("find all Playlists owned by " + user.email);
        const playlists = await req.db.findPlaylistsByOwnerEmail(user.email);
        
        if (!playlists || playlists.length === 0) {
            console.log("!playlists.length");
            return res.status(200).json({ success: true, idNamePairs: [] });
        }

        console.log("Send the Playlist pairs");
        // PUT ALL THE LISTS INTO ID, NAME PAIRS
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            
            // FIX: Make sure we include the ID
            let pair = {
                _id: list._id,  // Use whichever ID property exists
                name: list.name
            };
            pairs.push(pair);
        }
        
        console.log("Final pairs:", pairs); // Debug the output
        return res.status(200).json({ success: true, idNamePairs: pairs });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, error: error.message });
    }
}

getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        // This endpoint might need adjustment based on your needs
        const user = await req.db.findUserById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const playlists = await req.db.findPlaylistsByOwnerEmail(user.email);
        return res.status(200).json({ success: true, data: playlists });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, error: error.message });
    }
}

updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    // Debug logging - use req.body instead of body
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Playlist ID from params:", req.params.id);
    console.log("Playlist ID from body:", req.body.playlist ? req.body.playlist.id : 'none');

    const body = req.body; // Now define body after using req.body for logging
    
    if (!body || !body.playlist) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a playlist to update',
        })
    }

    try {
        // Get playlist ID - try from params first, then from body
        const playlistId = req.params.id !== 'undefined' ? req.params.id : (body.playlist && body.playlist.id);
        
        if (!playlistId || playlistId === 'undefined') {
            return res.status(400).json({
                success: false,
                error: 'Playlist ID is required',
            });
        }

        console.log("Using playlist ID:", playlistId);

        const playlist = await req.db.findPlaylistById(playlistId);
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            });
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await req.db.findUserByEmail(playlist.ownerEmail);
        if (!user) {
            return res.status(400).json({ success: false, description: "authentication error" });
        }

        // Use database-agnostic ID comparison
        const userId = user.id;
        if (userId.toString() !== req.userId.toString()) {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }

        console.log("correct user!");
        
        // Access the nested playlist object
        const playlistData = {
            name: body.playlist.name,
            songs: body.playlist.songs
        };

        const updatedPlaylist = await req.db.updatePlaylist(playlistId, playlistData);
        
        if (!updatedPlaylist) {
            throw new Error('Failed to update playlist');
        }
        
        console.log("SUCCESS!!!");
        return res.status(200).json({
            success: true,
            id: updatedPlaylist.id,
            message: 'Playlist updated!',
        });

    } catch (error) {
        console.log("FAILURE: " + error.message);
        return res.status(400).json({
            error: error.message,
            message: 'Playlist not updated!',
        });
    }
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}