const { DataSource } = require('typeorm');

const dbPath = process.env.DATABASE_PATH || './db.sqlite';

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
    synchronize: true,
    entities: [__dirname + '/../models/*.js'],
});

module.exports = AppDataSource;
