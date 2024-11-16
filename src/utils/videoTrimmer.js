const ffmpeg = require('fluent-ffmpeg');
const path = require('node:path');

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
        throw new Error(
            'Invalid start time. It must be within the video duration'
        );
    }
    if (end !== undefined && (end <= start || end > duration)) {
        throw new Error(
            'Invalid end time. It must be greater than start time and within the video duration'
        );
    }
};

module.exports = {
    trimVideo,
    validateTrimBounds,
};
