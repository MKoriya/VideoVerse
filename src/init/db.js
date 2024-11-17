const AppDataSource = require('../config/db');

// Initializing DB
async function initDb() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected!!');
    } catch (error) {
        console.error('Database connection error: ', error);
    }
}

module.exports = {
    initDb,
};
