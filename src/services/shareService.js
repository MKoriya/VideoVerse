const AppDataSource = require('../config/db');
const { Video, SharedLink } = require('../models');
const APIError = require('../utils/APIError');
const { generateUniqueSlug, getShareUrl } = require('../utils/util');

async function createSharedLink(videoId, expiresAt) {
    const videoRepo = AppDataSource.getRepository(Video);
    const sharedLinkRepo = AppDataSource.getRepository(SharedLink);

    const video = await videoRepo.findOneBy({ id: videoId });
    if (!video) {
        throw new APIError(404, 'Video not found');
    }

    const slug = generateUniqueSlug();

    const sharedLink = sharedLinkRepo.create({ videoId, slug, expiresAt });
    await sharedLinkRepo.save(sharedLink);
    return {
        ...sharedLink,
        link: getShareUrl(slug),
    };
}

async function getSharedLink(slug) {
    const sharedLinkRepo = AppDataSource.getRepository(SharedLink);

    const sharedLink = await sharedLinkRepo.findOneBy({ slug });
    if (!sharedLink) {
        throw new APIError(404, 'Shared link not found');
    }

    // Check if the link has expired
    if (new Date() > new Date(sharedLink.expiresAt)) {
        throw new APIError(400, 'Shared link has expired');
    }

    return {
        ...sharedLink,
        link: getShareUrl(slug),
    };
}

/**
 * Validates a shared link and returns the associated video file path.
 * @param {string} link - The unique shared link.
 * @returns {Promise<string>} - The video file path.
 */
async function getVideoBySharedLink(slug) {
    const videoRepo = AppDataSource.getRepository(Video);

    const sharedLink = await getSharedLink(slug);
    const video = await videoRepo.findOneBy({ id: sharedLink.videoId });
    if (!video) {
        throw new APIError(
            400,
            'Video associated with the shared link not found'
        );
    }

    return video.filePath;
}

module.exports = {
    createSharedLink,
    getSharedLink,
    getVideoBySharedLink,
};
