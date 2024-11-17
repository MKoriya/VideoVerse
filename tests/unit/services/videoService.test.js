const AppDataSource = require('../../../src/config/db');
const APIError = require('../../../src/utils/APIError');
const {
    saveVideo,
    trimExistingVideo,
    mergeVideoClips,
} = require('../../../src/services/videoService');
const {
    mergeVideos,
    validateTrimBounds,
    trimVideo,
    getVideoMetaData,
} = require('../../../src/utils/videoHandler');
const { convertBytesToMB } = require('../../../src/utils/util');

// Mock dependencies
jest.mock('../../../src/config/db', () => ({
    getRepository: jest.fn(),
}));

jest.mock('../../../src/utils/videoHandler', () => ({
    mergeVideos: jest.fn(),
    validateTrimBounds: jest.fn(),
    trimVideo: jest.fn(),
    getVideoMetaData: jest.fn(),
}));

jest.mock('../../../src/utils/util', () => ({
    convertBytesToMB: jest.fn(),
}));

describe('saveVideo', () => {
    it('should save and return video details', async () => {
        const videoRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        const videoDetails = {
            filePath: '/path/to/video.mp4',
            size: 20,
            duration: 60,
        };

        videoRepo.create.mockReturnValue(videoDetails);
        videoRepo.save.mockResolvedValue(videoDetails);
        AppDataSource.getRepository.mockReturnValue(videoRepo);

        const result = await saveVideo('/path/to/video.mp4', 20, 60);

        expect(videoRepo.create).toHaveBeenCalledWith(videoDetails);
        expect(videoRepo.save).toHaveBeenCalledWith(videoDetails);
        expect(result).toEqual(videoDetails);
    });
});

describe('trimExistingVideo', () => {
    it('should throw an error if the video is not found', async () => {
        const videoRepo = { findOneBy: jest.fn().mockResolvedValue(null) };
        AppDataSource.getRepository.mockReturnValue(videoRepo);

        await expect(trimExistingVideo(1, 0, 10)).rejects.toThrow(APIError);
    });

    it('should validate trim bounds and save the trimmed video', async () => {
        const videoRepo = {
            findOneBy: jest.fn().mockResolvedValue({
                id: 1,
                filePath: '/path/to/video.mp4',
                duration: 60,
            }),
            create: jest.fn(),
            save: jest.fn(),
        };

        const trimmedDetails = {
            filePath: '/path/to/video_trimmed.mp4',
            size: 15,
            duration: 10,
        };

        AppDataSource.getRepository.mockReturnValue(videoRepo);
        videoRepo.create.mockReturnValue(trimmedDetails);
        validateTrimBounds.mockReturnValue(true);
        trimVideo.mockResolvedValue(trimmedDetails.filePath);
        getVideoMetaData.mockResolvedValue({
            size: 15000000,
            duration: trimmedDetails.duration,
        });
        convertBytesToMB.mockReturnValue(trimmedDetails.size);

        const result = await trimExistingVideo(1, 0, 10);

        expect(validateTrimBounds).toHaveBeenCalledWith(0, 10, 60);
        expect(trimVideo).toHaveBeenCalledWith('/path/to/video.mp4', 0, 10);
        expect(getVideoMetaData).toHaveBeenCalledWith(
            '/path/to/video_trimmed.mp4'
        );
        expect(convertBytesToMB).toHaveBeenCalledWith(15000000);
        expect(videoRepo.create).toHaveBeenCalledWith(trimmedDetails);
        expect(videoRepo.save).toHaveBeenCalledWith(trimmedDetails);
        expect(result).toEqual(trimmedDetails);
    });
});

describe('mergeVideoClips', () => {
    it('should throw an error if one or more videos are not found', async () => {
        const videoRepo = { find: jest.fn().mockResolvedValue([]) };
        AppDataSource.getRepository.mockReturnValue(videoRepo);

        await expect(mergeVideoClips([1, 2, 3])).rejects.toThrow(APIError);
    });

    it('should merge videos and save the merged video', async () => {
        const videoPaths = ['/path/to/video1.mp4', '/path/to/video2.mp4'];
        const videoRepo = {
            find: jest.fn().mockResolvedValue([
                { id: 1, filePath: videoPaths[0] },
                { id: 2, filePath: videoPaths[1] },
            ]),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mergedVideoDetails = {
            filePath: '/path/to/merged_video.mp4',
            size: 40,
            duration: 120,
        };

        AppDataSource.getRepository.mockReturnValue(videoRepo);
        mergeVideos.mockResolvedValue(mergedVideoDetails.filePath);
        getVideoMetaData.mockResolvedValue({
            size: 40000000,
            duration: mergedVideoDetails.duration,
        });
        videoRepo.create.mockReturnValue(mergedVideoDetails);
        convertBytesToMB.mockReturnValue(mergedVideoDetails.size);

        const result = await mergeVideoClips([1, 2]);

        expect(mergeVideos).toHaveBeenCalledWith(videoPaths);
        expect(getVideoMetaData).toHaveBeenCalledWith(
            mergedVideoDetails.filePath
        );
        expect(convertBytesToMB).toHaveBeenCalledWith(40000000);
        expect(videoRepo.create).toHaveBeenCalledWith(mergedVideoDetails);
        expect(videoRepo.save).toHaveBeenCalledWith(mergedVideoDetails);
        expect(result).toEqual(mergedVideoDetails);
    });
});
