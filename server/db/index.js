const DatabaseFactory = require('./database-factory');

// Create and export the database manager instance directly
const db = DatabaseFactory.createDatabaseManager();

// Initialize database
db.connect().then(() => {
    console.log(`Database ${process.env.DB_TYPE || 'mongodb'} initialized successfully`);
}).catch(error => {
    console.error('Database connection error:', error);
});

module.exports = db;