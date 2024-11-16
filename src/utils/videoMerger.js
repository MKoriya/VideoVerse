const path = require('node:path');
const fs = require('node:fs');
const ffmpeg = require('fluent-ffmpeg');

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

module.exports = {
    mergeVideos,
};
