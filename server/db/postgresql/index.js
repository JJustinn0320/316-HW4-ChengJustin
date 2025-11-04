const { Sequelize, DataTypes } = require('sequelize');
const DatabaseManager = require('../DatabaseManager');

class PostgreSQLManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = null;
        this.isConnected = false;
        this.transaction = null;
        this.User = null;
        this.Playlist = null;
    }

    async connect() {
        if (this.isConnected) return;

        const connectionString = process.env.POSTGRES_URI;
        
        this.sequelize = new Sequelize(connectionString, {
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            dialect: 'postgres'
        });

        try {
            await this.sequelize.authenticate();
            await this.defineModels();
            // Use sync without force to not drop existing tables
            await this.sequelize.sync({ force: false });
            this.isConnected = true;
            console.log('Connected to PostgreSQL');
        } catch (error) {
            console.error('PostgreSQL connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected && this.sequelize) {
            await this.sequelize.close();
            this.isConnected = false;
            console.log('Disconnected from PostgreSQL');
        }
    }

    async defineModels() {
        // User Model - use INTEGER to match your database
        this.User = this.sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'firstName'
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'lastName'
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'passwordHash'
            },
            playlists: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                defaultValue: []
            }
        }, {
            tableName: 'users',
            timestamps: true
        });

        // Playlist Model - FIX: Add id: false
        this.Playlist = this.sequelize.define('Playlist', {
            _id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: '_id'
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            songs: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: []
            },
            ownerEmail: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'ownerEmail'
            }
        }, {
            tableName: 'playlists',
            timestamps: true,
            id: false  // ADD THIS LINE - tells Sequelize not to use default id field
        });

        // Define associations
        this.User.hasMany(this.Playlist, { 
            foreignKey: 'ownerEmail', 
            sourceKey: 'email'
        });
        
        this.Playlist.belongsTo(this.User, { 
            foreignKey: 'ownerEmail', 
            targetKey: 'email'
        });
    }

    // Normalize data - PostgreSQL uses id, no mapping needed
    normalizeUser(user) {
        if (!user) return null;
        const userData = user.get ? user.get({ plain: true }) : user;
        return userData;
    }

    normalizePlaylist(playlist) {
        if (!playlist) return null;
        const playlistData = playlist.get ? playlist.get({ plain: true }) : playlist;
        
        playlistData.id = playlistData._id;
        
        return playlistData;
}

    // User operations
    async createUser(userData) {
        const options = { transaction: this.transaction };
        const user = await this.User.create(userData, options);
        return this.normalizeUser(user);
    }

    async findUserById(id) {
        const options = { 
            transaction: this.transaction
        };
        const user = await this.User.findByPk(id, options);
        return this.normalizeUser(user);
    }

    async findUserByEmail(email) {
        const options = { 
            transaction: this.transaction
        };
        const user = await this.User.findOne({ where: { email }, ...options });
        return this.normalizeUser(user);
    }

    async updateUserPlaylists(userId, playlistIds) {
        const options = { 
            transaction: this.transaction,
            where: { id: userId },
            returning: true
        };
        
        const [affectedCount, [updatedUser]] = await this.User.update(
            { playlists: playlistIds }, 
            options
        );
        
        return this.normalizeUser(updatedUser);
    }

    // Playlist operations
    async createPlaylist(playlistData) {
        const options = { transaction: this.transaction };
        const playlist = await this.Playlist.create(playlistData, options);
        return this.normalizePlaylist(playlist);
    }

    async findPlaylistById(id) {
        // Add validation for the ID
        if (!id || id === 'undefined' || id === 'null') {
            console.log('Invalid playlist ID received:', id);
            return null;
        }

        const options = { 
            transaction: this.transaction
        };
        
        try {
            const playlist = await this.Playlist.findByPk(id, options);
            return this.normalizePlaylist(playlist);
        } catch (error) {
            console.error('Error finding playlist by ID:', error);
            return null;
        }
    }

    async findPlaylistsByOwnerEmail(email) {
        const options = { 
            transaction: this.transaction,
            where: { ownerEmail: email }
        };
        const playlists = await this.Playlist.findAll(options);
        return playlists.map(playlist => this.normalizePlaylist(playlist));
    }

    async updatePlaylist(id, playlistData) {
        const options = { 
            transaction: this.transaction,
            where: { _id: id },
            returning: true
        };
        
        const [affectedCount, [updatedPlaylist]] = await this.Playlist.update(
            playlistData, 
            options
        );
        
        return this.normalizePlaylist(updatedPlaylist);
    }

    async deletePlaylist(id) {
        const options = { 
            transaction: this.transaction,
            where: { _id: id } 
        };
        const result = await this.Playlist.destroy(options);
        return result > 0;
    }
    }

module.exports = PostgreSQLManager;