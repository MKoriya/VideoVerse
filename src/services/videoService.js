const { In } = require('typeorm');
const AppDataSource = require('../config/db');
const { Video } = require('../models');
const { convertBytesToMB } = require('../utils/util');
const {
    mergeVideos,
    validateTrimBounds,
    trimVideo,
    getVideoMetaData,
} = require('../utils/videoHandler');
const APIError = require('../utils/APIError');

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
        throw new APIError(404, 'Video not found');
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

async function mergeVideoClips(videoIds) {
    const videoRepo = AppDataSource.getRepository(Video);

    const videos = await videoRepo.find({
        where: {
            id: In(videoIds),
        },
    });
    if (videos.length !== videoIds.length) {
        throw new APIError(400, 'One or more videos not found');
    }

    const mergedVideoPath = await mergeVideos(videoPaths);
    const { duration, size } = await getVideoMetaData(mergedVideoPath);

    const mergedVideo = videoRepo.create({
        filePath: mergedVideoPath,
        size: convertBytesToMB(size),
        duration: duration,
    });
    await videoRepo.save(mergedVideo);
    return mergedVideo;
}

module.exports = {
    saveVideo,
    trimExistingVideo,
    mergeVideoClips,
};
