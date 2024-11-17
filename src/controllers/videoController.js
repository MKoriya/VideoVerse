const {
    saveVideo,
    trimExistingVideo,
    mergeVideoClips,
} = require('../services/videoService');
const { upload, validateVideoDuration } = require('../utils/videoHandler');
const { convertBytesToMB } = require('../utils/util');

const uploadVideo = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const filePath = req.file.path;
            const size = convertBytesToMB(req.file.size);
            const duration = await validateVideoDuration(filePath);

            const video = await saveVideo(filePath, size, duration);

            res.status(200).json({
                message: 'Video uploaded successfully',
                video,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
};

const trimVideo = async (req, res, next) => {
    try {
        const { videoId, start = 0, end } = req.body;

        const trimmedVideo = await trimExistingVideo(videoId, start, end);

        res.status(200).json({
            message: 'Video trimmed successfully',
            video: trimmedVideo,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const mergeVideo = async (req, res, next) => {
    try {
        const { videoIds } = req.body;

        if (!videoIds || !Array.isArray(videoIds) || videoIds.length < 2) {
            return res
                .status(400)
                .json({ error: 'Provide at least two video IDs to merge' });
        }

        const mergedVideo = await mergeVideoClips(videoIds);

        res.status(200).json({
            message: 'Videos merged successfully.',
            video: mergedVideo,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    uploadVideo,
    trimVideo,
    mergeVideo,
};
