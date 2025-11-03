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
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    playlists: {
        type: DataTypes.ARRAY(DataTypes.STRING), 
        defaultValue: []
    },
}, {
    timestamps: true
})

const Playlist = sequelize.define('playlist', {
    _id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false
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

async function resetPostgre(){
    try{
        console.log("Starting Postgre Rest Script")
        await sequelize.authenticate();

        // force: true replaces table if it already exists
        await sequelize.sync({ force: true });
        console.log("adding data");
        await User.bulkCreate(testData.users, { validate: true });
        await Playlist.bulkCreate(testData.playlists, { validate: true });
    } catch (error) {
        console.error("Error during database reset:", error);
        process.exit(1);
    } finally {
        console.log("Database connection closed");
    }
}

if (require.main === module) {
    resetPostgre();
}

module.exports = { resetPostgre, User, Playlist, sequelize };