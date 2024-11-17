const {
    getVideoBySharedLink,
    createSharedLink,
    getSharedLink,
} = require('../../../src/services/shareService');
const AppDataSource = require('../../../src/config/db');
const APIError = require('../../../src/utils/APIError');
const { generateUniqueSlug, getShareUrl } = require('../../../src/utils/util');

jest.mock('../../../src/config/db', () => ({
    getRepository: jest.fn(),
}));

jest.mock('../../../src/utils/util', () => ({
    generateUniqueSlug: jest.fn(),
    getShareUrl: jest.fn(),
}));

describe('getVideoBySharedLink', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if the shared link is not found', async () => {
        const sharedLinkRepo = { findOneBy: jest.fn().mockResolvedValue(null) };
        AppDataSource.getRepository.mockReturnValue(sharedLinkRepo);

        await expect(getVideoBySharedLink('invalid-link')).rejects.toThrow(
            APIError
        );
    });

    it('should throw an error if the shared link has expired', async () => {
        const sharedLinkRepo = {
            findOneBy: jest
                .fn()
                .mockResolvedValue({ expiresAt: new Date(Date.now() - 1000) }),
        };
        AppDataSource.getRepository.mockReturnValue(sharedLinkRepo);

        await expect(getVideoBySharedLink('expired-link')).rejects.toThrow(
            APIError
        );
    });

    it('should return the video file path if the link is valid', async () => {
        const sharedLinkRepo = {
            findOneBy: jest.fn().mockResolvedValue({
                expiresAt: new Date(Date.now() + 1000),
                videoId: 1,
                filePath: '/path/to/video.mp4',
            }),
        };
        const videoRepo = {
            findOneBy: jest
                .fn()
                .mockResolvedValue({ filePath: '/path/to/video.mp4' }),
        };
        AppDataSource.getRepository
            .mockReturnValueOnce(sharedLinkRepo)
            .mockReturnValueOnce(videoRepo);

        const filePath = await getVideoBySharedLink('valid-link');
        expect(filePath).toBe('/path/to/video.mp4');
    });
});

describe('createSharedLink', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if the video is not found', async () => {
        const videoRepo = { findOneBy: jest.fn().mockResolvedValue(null) };
        const sharedLinkRepo = { create: jest.fn(), save: jest.fn() };

        AppDataSource.getRepository
            .mockReturnValueOnce(videoRepo)
            .mockReturnValueOnce(sharedLinkRepo);

        await expect(createSharedLink(1, new Date())).rejects.toThrow(APIError);
    });

    it('should create and return a shared link with the correct properties', async () => {
        const videoRepo = { findOneBy: jest.fn().mockResolvedValue({ id: 1 }) };
        const sharedLinkRepo = { create: jest.fn(), save: jest.fn() };

        const slug = 'unique-slug';
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour later
        const sharedLink = { videoId: 1, slug, expiresAt };

        generateUniqueSlug.mockReturnValue(slug);
        sharedLinkRepo.create.mockReturnValue(sharedLink);
        sharedLinkRepo.save.mockResolvedValue(sharedLink);
        getShareUrl.mockReturnValue(`http://localhost/s/${slug}`);

        AppDataSource.getRepository
            .mockReturnValueOnce(videoRepo)
            .mockReturnValueOnce(sharedLinkRepo);

        const result = await createSharedLink(1, expiresAt);

        expect(result).toEqual({
            ...sharedLink,
            link: `http://localhost/s/${slug}`,
        });
        expect(sharedLinkRepo.save).toHaveBeenCalledWith(sharedLink);
    });
});

describe('getSharedLink', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if the shared link is not found', async () => {
        const sharedLinkRepo = { findOneBy: jest.fn().mockResolvedValue(null) };

        AppDataSource.getRepository.mockReturnValue(sharedLinkRepo);

        await expect(getSharedLink('invalid-slug')).rejects.toThrow(APIError);
    });

    it('should throw an error if the shared link has expired', async () => {
        const sharedLinkRepo = {
            findOneBy: jest.fn().mockResolvedValue({
                slug: 'expired-slug',
                expiresAt: new Date(Date.now() - 1000), // Already expired
            }),
        };

        AppDataSource.getRepository.mockReturnValue(sharedLinkRepo);

        await expect(getSharedLink('expired-slug')).rejects.toThrow(APIError);
    });

    it('should return the shared link with its URL if valid', async () => {
        const slug = 'valid-slug';
        const sharedLinkRepo = {
            findOneBy: jest.fn().mockResolvedValue({
                slug,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Not expired
            }),
        };

        getShareUrl.mockReturnValue(`http://localhost/s/${slug}`);
        AppDataSource.getRepository.mockReturnValue(sharedLinkRepo);

        const result = await getSharedLink(slug);

        expect(result).toEqual({
            slug,
            expiresAt: expect.any(Date),
            link: `http://localhost/s/${slug}`,
        });
    });
});
