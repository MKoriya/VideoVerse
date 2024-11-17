const fs = require('node:fs');
const ffmpeg = require('fluent-ffmpeg');
const {
    getVideoMetaData,
    validateVideoDuration,
    mergeVideos,
    validateTrimBounds,
    serveVideo,
} = require('../../../src/utils/videoHandler');

jest.mock('node:fs');
jest.mock('fluent-ffmpeg', () => {
    const mockFfmpeg = jest.fn(() => mockFfmpeg);
    mockFfmpeg.ffprobe = jest.fn();
    mockFfmpeg.input = jest.fn().mockReturnThis();
    mockFfmpeg.inputOptions = jest.fn().mockReturnThis();
    mockFfmpeg.outputOptions = jest.fn().mockReturnThis();
    mockFfmpeg.output = jest.fn().mockReturnThis();
    mockFfmpeg.on = jest.fn().mockReturnThis();
    mockFfmpeg.run = jest.fn();
    return mockFfmpeg;
});

describe('getVideoMetaData', () => {
    it('should resolve metadata for a valid video file', async () => {
        const mockMetadata = { format: { duration: 60 } };
        ffmpeg.ffprobe.mockImplementation((filePath, cb) =>
            cb(null, mockMetadata)
        );

        const metadata = await getVideoMetaData('/path/to/video.mp4');
        expect(metadata).toEqual(mockMetadata.format);
    });

    it('should reject with an error if ffprobe fails', async () => {
        ffmpeg.ffprobe.mockImplementation((filePath, cb) =>
            cb(new Error('ffprobe error'))
        );

        await expect(getVideoMetaData('/path/to/video.mp4')).rejects.toThrow(
            'ffprobe error'
        );
    });
});

describe('validateVideoDuration', () => {
    it('should validate the video duration successfully', async () => {
        const mockMetadata = { format: { duration: 10 } };
        ffmpeg.ffprobe.mockImplementation((filePath, cb) =>
            cb(null, mockMetadata)
        );

        const duration = await validateVideoDuration('/path/to/video.mp4');
        expect(duration).toBe(10);
    });

    it('should throw an error if the video duration is out of bounds', async () => {
        const mockMetadata = { format: { duration: 30 } }; // Above MAX_DURATION_SEC (default 25)
        ffmpeg.ffprobe.mockImplementation((filePath, cb) =>
            cb(null, mockMetadata)
        );

        fs.unlinkSync.mockImplementation(() => {});
        await expect(
            validateVideoDuration('/path/to/video.mp4')
        ).rejects.toThrow('Video duration must be between 1 and 25 seconds');
        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/video.mp4');
    });
});

describe('mergeVideos', () => {
    it('should merge video files successfully', async () => {
        fs.writeFileSync.mockImplementation(() => {});
        fs.unlinkSync.mockImplementation(() => {});

        ffmpeg.on.mockImplementation(function (event, callback) {
            if (event === 'end') callback();
            return this;
        });

        const result = await mergeVideos([
            '/path/to/video1.mp4',
            '/path/to/video2.mp4',
        ]);
        expect(result).toMatch(/merged_\d+\.mp4/);
    });

    it('should handle errors during merging', async () => {
        fs.writeFileSync.mockImplementation(() => {});
        fs.unlinkSync.mockImplementation(() => {});

        ffmpeg.on.mockImplementation(function (event, callback) {
            if (event === 'error') callback(new Error('merge error'));
            return this;
        });

        await expect(
            mergeVideos(['/path/to/video1.mp4', '/path/to/video2.mp4'])
        ).rejects.toThrow('merge error');
    });
});

describe('validateTrimBounds', () => {
    it('should validate trim bounds successfully', () => {
        expect(() => validateTrimBounds(0, 10, 15)).not.toThrow();
    });

    it('should throw an error for invalid start time', () => {
        expect(() => validateTrimBounds(-1, 10, 15)).toThrow(
            'Invalid start time. It must be within the video duration'
        );
    });

    it('should throw an error for invalid end time', () => {
        expect(() => validateTrimBounds(0, 20, 15)).toThrow(
            'Invalid end time. It must be greater than start time and within the video duration'
        );
    });
});

describe('serveVideo', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = { headers: {} };
        mockRes = {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            pipe: jest.fn(),
        };
        fs.statSync.mockReturnValue({ size: 100 });
        fs.createReadStream.mockReturnValue({ pipe: mockRes.pipe });
    });

    it('should serve the entire video file for download', () => {
        serveVideo('/path/to/video.mp4', mockReq, mockRes, 'attachment');

        expect(mockRes.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'video/mp4'
        );
        expect(mockRes.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            'attachment; filename="video.mp4"'
        );
        expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
            'Content-Length': 100,
        });
        expect(fs.createReadStream).toHaveBeenCalledWith('/path/to/video.mp4');
    });

    it('should handle partial content requests', () => {
        mockReq.headers.range = 'bytes=0-49';

        serveVideo('/path/to/video.mp4', mockReq, mockRes, 'inline');

        expect(mockRes.writeHead).toHaveBeenCalledWith(206, {
            'Content-Range': 'bytes 0-49/100',
            'Accept-Ranges': 'bytes',
            'Content-Length': 50,
        });
        expect(fs.createReadStream).toHaveBeenCalledWith('/path/to/video.mp4', {
            start: 0,
            end: 49,
        });
    });
});
