const AppDataSource = require('../config/db');
const { Video } = require('../models');
const { getVideoMetaData } = require('../utils/fileHandler');
const { convertBytesToMB } = require('../utils/util');
const { validateTrimBounds, trimVideo } = require('../utils/videoTrimmer');

async function saveVideo(filePath, size, duration) {
    const videoRepo = AppDataSource.getRepository(Video);
    const video = videoRepo.create({ filePath, size, duration });
    await videoRepo.save(video);
    return video;
}

async function trimExistingVideo(videoId, start, end) {
    const videoRepo = AppDataSource.getRepository(Video);
    const video = await videoRepo.findOneBy({ id: videoId });

    if (!videoId) {
        throw new Error('Video not found');
    }

    validateTrimBounds(start, end, video.duration);

    // trimming
    const trimmedPath = await trimVideo(video.filePath, start, end);
    const { duration, size } = await getVideoMetaData(trimmedPath);

    const trimmedVideo = videoRepo.create({
        filePath: trimmedPath,
        size: convertBytesToMB(size),
        duration: duration,
    });
    await videoRepo.save(trimmedVideo);
    return trimmedVideo;
}

module.exports = {
    saveVideo,
    trimExistingVideo,
};
