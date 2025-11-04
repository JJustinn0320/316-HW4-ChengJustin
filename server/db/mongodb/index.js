const mongoose = require('mongoose');
const DatabaseManager = require('../DatabaseManager'); 
const { INTEGER } = require('sequelize');

class MongoDBManager extends DatabaseManager {
    constructor() {
        super();
        this.isConnected = false;
        this.User = null;
        this.Playlist = null;
        this.defineSchemas();
    }

    defineSchemas() {
        // User Schema
        const userSchema = new mongoose.Schema({
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            passwordHash: { type: String, required: true },
            playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }]
        }, { timestamps: true });

        // Playlist Schema
        const playlistSchema = new mongoose.Schema({
            name: { type: String, required: true },
            songs: [{
                artist: { type: String, required: true },
                title: { type: String, required: true },
                year: {type: Number, required: true},
                youTubeId: { type: String, required: true }
            }],
            ownerEmail: { type: String, required: true }
        }, { timestamps: true });

        this.User = mongoose.model('User', userSchema);
        this.Playlist = mongoose.model('Playlist', playlistSchema);
    }

    async connect() {
        if (this.isConnected) return;

        const connectionString = process.env.MONGODB_URI;
        
        try {
            await mongoose.connect(connectionString);
            this.isConnected = true;
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('Disconnected from MongoDB');
        }
    }

    // Normalize MongoDB documents to use 'id'
    normalizeUser(userDoc) {
        if (!userDoc) return null;
        const user = userDoc.toObject ? userDoc.toObject() : userDoc;
        user.id = user._id ? user._id.toString() : user.id;
        return user;
    }

    normalizePlaylist(playlistDoc) {
        if (!playlistDoc) return null;
        const playlist = playlistDoc.toObject ? playlistDoc.toObject() : playlistDoc;
        playlist.id = playlist._id ? playlist._id.toString() : playlist.id;
        playlist._id = playlist.id;
        return playlist;
    }

    // User operations
    async createUser(userData) {
        const user = new this.User(userData);
        const savedUser = await user.save();
        return this.normalizeUser(savedUser);
    }

    async findUserById(id) {
        const user = await this.User.findOne({ _id: id });
        return this.normalizeUser(user);
    }

    async findUserByEmail(email) {
        const user = await this.User.findOne({ email: email });
        return this.normalizeUser(user);
    }

    async updateUserPlaylists(userId, playlistIds) {
        const user = await this.User.findOneAndUpdate(
            { _id: userId },
            { playlists: playlistIds },
            { new: true }
        );
        return this.normalizeUser(user);
    }

    // Playlist operations
    async createPlaylist(playlistData) {
        const playlist = new this.Playlist(playlistData);
        const savedPlaylist = await playlist.save();
        return this.normalizePlaylist(savedPlaylist);
    }

    async findPlaylistById(id) {
        const playlist = await this.Playlist.findOne({ _id: id });
        return this.normalizePlaylist(playlist);
    }

    async findPlaylistsByOwnerEmail(email) {
        const playlists = await this.Playlist.find({ ownerEmail: email });
        return playlists.map(playlist => this.normalizePlaylist(playlist));
    }

    async updatePlaylist(id, playlistData) {
        const playlist = await this.Playlist.findOneAndUpdate(
            { _id: id },
            playlistData,
            { new: true }
        );
        return this.normalizePlaylist(playlist);
    }

    async deletePlaylist(id) {
        const result = await this.Playlist.findOneAndDelete({ _id: id });
        return !!result;
    }

    async deleteUser(id) {
        const result = await this.User.findOneAndDelete({ _id: id });
    }
}

module.exports = MongoDBManager;