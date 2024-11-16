function convertBytesToMB(bytes) {
    const MB = bytes / (1024 * 1024);
    return parseFloat(MB.toFixed(2));
}

module.exports = {
    convertBytesToMB,
};
