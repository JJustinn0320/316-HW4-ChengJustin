const MongoDBManager = require('./mongodb/index');
const PostgreSQLManager = require('./postgresql/index');

class DatabaseFactory {
    static createDatabaseManager() {
        const databaseType = process.env.DB_TYPE || 'mongodb';
        
        switch (databaseType.toLowerCase()) {
            case 'mongodb':
                return new MongoDBManager();
            case 'postgres':
                return new PostgreSQLManager();
            default:
                throw new Error(`Unsupported database type: ${databaseType}`);
        }
    }
}

module.exports = DatabaseFactory;