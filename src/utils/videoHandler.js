const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('node:fs');
const path = require('node:path');
const APIError = require('./APIError');

// Configurable limits
const MAX_SIZE_MB = process.env.MAX_SIZE_MB || 25;
const MIN_DURATION_SEC = process.env.MIN_DURATION_SEC || 1;
const MAX_DURATION_SEC = process.env.MAX_DURATION_SEC || 25;

const UPLOAD_DIR = path.join(
    __dirname,
    `../../${process.env.UPLOAD_DIR || 'uploads'}`
);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (fileExt !== '.mp4' && fileExt !== '.mov') {
            return cb(
                new APIError(
                    400,
                    'Invalid file type. Only MP4 and MOV are allowed'
                )
            );
        }
        cb(null, true);
    },
}).single('video');

function getVideoMetaData(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            const data = metadata.format;
            resolve(data);
        });
    });
}

async function validateVideoDuration(filePath) {
    const { duration } = await getVideoMetaData(filePath);
    if (duration < MIN_DURATION_SEC || duration > MAX_DURATION_SEC) {
        fs.unlinkSync(filePath); // remove invalid file
        throw new APIError(
            400,
            `Video duration must be between ${MIN_DURATION_SEC} and ${MAX_DURATION_SEC} seconds`
        );
    }
    return duration;
}

function mergeVideos(videoPaths) {
    return new Promise((resolve, reject) => {
        const mergeListPath = path.join(
            path.dirname(videoPaths[0]),
            'merge_list.txt'
        );
        const mergedVideoPath = path.join(
            path.dirname(videoPaths[0]),
            `merged_${Date.now()}.mp4`
        );

        // Create a text file listing all video files
        fs.writeFileSync(
            mergeListPath,
            videoPaths.map((filePath) => `file '${filePath}'`).join('\n')
        );

        ffmpeg()
            .input(mergeListPath)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions(['-c copy'])
            .output(mergedVideoPath)
            .on('end', () => {
                fs.unlinkSync(mergeListPath);
                resolve(mergedVideoPath);
            })
            .on('error', (error) => {
                if (fs.existsSync(mergeListPath)) {
                    fs.unlinkSync(mergeListPath);
                }
                reject(error);
            })
            .run();
    });
}

function trimVideo(filePath, start, end) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(filePath, path.extname(filePath));
        const trimmedPath = path.join(
            path.dirname(filePath),
            `${fileName}_trimmed.mp4`
        );

        const command = ffmpeg(filePath).setStartTime(start);

        if (end) {
            command.setDuration(end - start);
        }

        command
            .output(trimmedPath)
            .on('end', () => {
                resolve(trimmedPath);
            })
            .on('error', (error) => {
                reject(error);
            })
            .run();
    });
}

const validateTrimBounds = (start, end, duration) => {
    if (start < 0 || start >= duration) {
        throw new APIError(
            400,
            'Invalid start time. It must be within the video duration'
        );
    }
    if (end !== undefined && (end <= start || end > duration)) {
        throw new APIError(
            400,
            'Invalid end time. It must be greater than start time and within the video duration'
        );
    }
};

/**
 * Serves a video file for streaming or direct download.
 * @param {string} filePath - The path to the video file.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {string} disposition - Content-Disposition header value ('inline' for stream, 'attachment' for download).
 */
function serveVideo(filePath, req, res, disposition) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Set headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${path.basename(filePath)}"`
    );

    if (range) {
        // Handle partial content for streaming
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            res.status(416).send('Requested range not satisfiable');
            return;
        }

        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
        });

        fileStream.pipe(res);
    } else {
        // Serve the entire file for direct download
        res.writeHead(200, {
            'Content-Length': fileSize,
        });

        fs.createReadStream(filePath).pipe(res);
    }
}

module.exports = {
    upload,
    getVideoMetaData,
    validateVideoDuration,
    mergeVideos,
    trimVideo,
    validateTrimBounds,
    serveVideo,
};
