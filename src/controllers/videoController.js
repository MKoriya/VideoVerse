const { saveVideo } = require('../services/videoService');
const { upload, validateVideoDuration } = require('../utils/fileHandler');

const uploadVideo = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const filePath = req.file.path;
            const size = parseFloat((req.file.size / 1024 / 1024).toFixed(2)); // convert in MB
            const duration = await validateVideoDuration(filePath);

            const video = await saveVideo(filePath, size, duration);

            res.status(200).json({
                message: 'Video uploaded successfully.',
                video,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
};

module.exports = {
    uploadVideo,
};
