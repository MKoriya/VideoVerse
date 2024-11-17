const {
    getSharedLink,
    createSharedLink,
    getVideoBySharedLink,
} = require('../services/shareService');
const { serveVideo } = require('../utils/videoHandler');

const createLink = async (req, res) => {
    try {
        // expiresIn time in minutes, default 1440 (1 day)
        const { videoId, expiresIn = 1440 } = req.body;

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
        const sharedLink = await createSharedLink(videoId, expiresAt);

        res.status(200).json({
            message: 'Shared link created successfully.',
            link: sharedLink,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getLink = async (req, res) => {
    try {
        const { slug } = req.params;

        const sharedLink = await getSharedLink(slug);

        res.status(200).json({
            message: 'Shared link retrieved successfully.',
            link: sharedLink,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const serveSharedVideo = async (req, res) => {
    try {
        const { slug } = req.params;
        const disposition = req.headers['content-disposition'] || 'inline'; // Default to streaming

        const filePath = await getVideoBySharedLink(slug);

        serveVideo(filePath, req, res, disposition);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createLink,
    getLink,
    serveSharedVideo,
};
