const AppDataSource = require('../config/db');
const { Video } = require('../models');

async function saveVideo(filePath, size, duration) {
    const videoRepo = AppDataSource.getRepository(Video);
    const video = videoRepo.create({ filePath, size, duration });
    await videoRepo.save(video);
    return video;
}

module.exports = {
    saveVideo,
};
