const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('node:fs');
const path = require('node:path');

// Configurable limits
const MAX_SIZE_MB = process.env.MAX_SIZE_MB || 25;
const MIN_DURATION_SEC = process.env.MIN_DURATION_SEC || 1;
const MAX_DURATION_SEC = process.env.MAX_DURATION_SEC || 25;

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

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
                new Error('Invalid file type. Only MP4 and MOV are allowed.')
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

function getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            const duration = metadata.format.duration;
            resolve(duration);
        });
    });
}

async function validateVideoDuration(filePath) {
    const duration = await getVideoDuration(filePath);
    if (duration < MIN_DURATION_SEC || duration > MAX_DURATION_SEC) {
        fs.unlinkSync(filePath); // remove invalid file
        throw new Error(
            `Video duration must be between ${MIN_DURATION_SEC} and ${MAX_DURATION_SEC} seconds`
        );
    }
    return duration;
}

module.exports = {
    upload,
    getVideoMetaData,
    getVideoDuration,
    validateVideoDuration,
};
