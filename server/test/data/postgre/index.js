const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const { Sequelize, DataTypes } = require('sequelize');
const testData = require('../example-db-data.json');

console.log(dotenv)
console.log(process.env.POSTGRES_URI)
const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false
});

const User = sequelize.define('user', {
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
        type: DataTypes.ARRAY(DataTypes.INTEGER),  // Changed to INTEGER array
        defaultValue: []
    },
}, {
    tableName: 'users',  // Added explicit table name
    timestamps: true
})

const Playlist = sequelize.define('playlist', {
    _id: {
        type: DataTypes.INTEGER,  // Changed to INTEGER
        autoIncrement: true,      // Added autoIncrement
        primaryKey: true,
        field: '_id'
    },
    ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ownerEmail'
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
}, {
    tableName: 'playlists',  // Added explicit table name
    timestamps: true,
    id: false  // Added to disable default id field
})

// Change the association name
User.hasMany(Playlist, { 
    foreignKey: 'ownerEmail', 
    sourceKey: 'email',
    as: 'userPlaylists'  
});
Playlist.belongsTo(User, { 
    foreignKey: 'ownerEmail', 
    targetKey: 'email',
    as: 'owner'  
});

// Update test data to match new schema
function updateTestData(testData) {
    // Update users to use integer IDs and playlist arrays
    const updatedUsers = testData.users.map(user => ({
        ...user,
        id: undefined, // Let database auto-generate
        playlists: [] // Start with empty playlists, will be populated after
    }));

    // Update playlists - let database auto-generate _id
    const updatedPlaylists = testData.playlists.map(playlist => ({
        ...playlist,
        _id: undefined, // Let database auto-generate
        songs: playlist.songs || []
    }));

    return {
        users: updatedUsers,
        playlists: updatedPlaylists
    };
}

async function resetPostgre(){
    try{
        console.log("Starting Postgre Reset Script")
        await sequelize.authenticate();

        // Update test data to match new schema
        const updatedTestData = updateTestData(testData);
        
        //console.log("Updated test data:", JSON.stringify(updatedTestData, null, 2));

        // force: true replaces table if it already exists
        await sequelize.sync({ force: true });
        console.log("Tables created successfully");
        
        console.log("Adding users...");
        const createdUsers = await User.bulkCreate(updatedTestData.users, { 
            validate: true,
            returning: true
        });
        
        console.log("Adding playlists...");
        const createdPlaylists = await Playlist.bulkCreate(updatedTestData.playlists, { 
            validate: true,
            returning: true
        });
        
        // Debug: Let's see what we actually have
        console.log("\n=== DEBUG INFO ===");
        console.log("Created users:");
        createdUsers.forEach(user => {
            console.log(`  - ${user.firstName} (${user.email}) - ID: ${user.id}`);
        });
        
        console.log("Created playlists:");
        createdPlaylists.forEach(playlist => {
            console.log(`  - "${playlist.name}" - Owner: ${playlist.ownerEmail} - ID: ${playlist._id}`);
        });
        
        // Dynamically populate user playlists based on owner email
        console.log("\nUpdating user playlists...");
        
        // Create a map of users by email for easy lookup
        const usersByEmail = {};
        createdUsers.forEach(user => {
            usersByEmail[user.email] = user;
            console.log(`User map: ${user.email} -> ${user.id}`);
        });
        
        // Group playlists by owner email
        const playlistsByOwner = {};
        createdPlaylists.forEach(playlist => {
            if (!playlistsByOwner[playlist.ownerEmail]) {
                playlistsByOwner[playlist.ownerEmail] = [];
            }
            playlistsByOwner[playlist.ownerEmail].push(playlist._id);
            console.log(`Playlist map: ${playlist.ownerEmail} -> ${playlist._id}`);
        });
        
        console.log("\nPlaylists by owner:", JSON.stringify(playlistsByOwner, null, 2));
        
        // Update each user with their playlists
        for (const user of createdUsers) {
            const userPlaylistIds = playlistsByOwner[user.email] || [];
            
            if (userPlaylistIds.length > 0) {
                await user.update({ playlists: userPlaylistIds });
                console.log(`Updated ${user.email} with ${userPlaylistIds.length} playlists:`, userPlaylistIds);
            } else {
                console.log(`No playlists found for ${user.email}`);
                console.log(`Available owners: ${Object.keys(playlistsByOwner).join(', ')}`);
            }
        }
        
        console.log("Database reset completed successfully");
    } catch (error) {
        console.error("Error during database reset:", error);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log("Database connection closed");
    }
}

if (require.main === module) {
    resetPostgre();
}

module.exports = { resetPostgre, User, Playlist, sequelize };