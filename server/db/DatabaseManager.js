class DatabaseManager {
    constructor() {
        if (this.constructor === DatabaseManager) {
            throw new Error("Cannot instantiate abstract class");
        }
    }

    // Connection methods
    async connect() {
        throw new Error("Method 'connect()' must be implemented");
    }

    async disconnect() {
        throw new Error("Method 'disconnect()' must be implemented");
    }

    // User operations
    async createUser(userData) {
        throw new Error("Method 'createUser()' must be implemented");
    }

    async findUserById(id) {
        throw new Error("Method 'findUserById()' must be implemented");
    }

    async findUserByEmail(email) {
        throw new Error("Method 'findUserByEmail()' must be implemented");
    }

    async updateUserPlaylists(userId, playlistIds) {
        throw new Error("Method 'updateUserPlaylists()' must be implemented");
    }

    // Playlist operations
    async createPlaylist(playlistData) {
        throw new Error("Method 'createPlaylist()' must be implemented");
    }

    async findPlaylistById(id) {
        throw new Error("Method 'findPlaylistById()' must be implemented");
    }

    async findPlaylistsByOwnerEmail(email) {
        throw new Error("Method 'findPlaylistsByOwnerEmail()' must be implemented");
    }

    async updatePlaylist(id, playlistData) {
        throw new Error("Method 'updatePlaylist()' must be implemented");
    }

    async deletePlaylist(id) {
        throw new Error("Method 'deletePlaylist()' must be implemented");
    }
}

module.exports = DatabaseManager;