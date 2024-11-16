const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: './db.sqlite',
    synchronize: true,
    entities: [__dirname + '/../models/*.js'],
});

module.exports = AppDataSource;
