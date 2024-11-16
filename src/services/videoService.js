const { In } = require('typeorm');
const AppDataSource = require('../config/db');
const { Video } = require('../models');
const { getVideoMetaData } = require('../utils/fileHandler');
const { convertBytesToMB } = require('../utils/util');
const { mergeVideos } = require('../utils/videoMerger');
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

async function mergeVideoClips(videoIds) {
    const videoRepo = AppDataSource.getRepository(Video);

    const videos = await videoRepo.find({
        where: {
            id: In(videoIds),
        },
    });
    if (videos.length !== videoIds.length) {
        throw new Error('One or more videos not found');
    }

    const videoPaths = videos.map((video) => video.filePath);
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
