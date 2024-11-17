const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'SharedLink',
    tableName: 'shared_links',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        videoId: {
            type: 'int',
            nullable: false,
        },
        slug: {
            type: 'text',
            nullable: false,
            unique: true,
        },
        expiresAt: {
            type: 'datetime',
            nullable: false,
        },
        createdAt: {
            type: 'datetime',
            default: () => 'CURRENT_TIMESTAMP',
        },
    },
    relations: {
        video: {
            target: 'Video',
            type: 'many-to-one',
            joinColumn: { name: 'videoId' },
            onDelete: 'CASCADE',
        },
    },
});
