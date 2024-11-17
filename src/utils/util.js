const { randomUUID } = require('node:crypto');

function convertBytesToMB(bytes) {
    const MB = bytes / (1024 * 1024);
    return parseFloat(MB.toFixed(2));
}

function generateUniqueSlug() {
    return randomUUID();
}

function getShareUrl(slug) {
    const host =
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${host}/s/${slug}`;
}

module.exports = {
    convertBytesToMB,
    generateUniqueSlug,
    getShareUrl,
};
