const { initDb } = require('../src/init/db');

module.exports = async () => {
    console.log('Global setup');
    await initDb();
};
