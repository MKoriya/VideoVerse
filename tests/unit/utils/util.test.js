const { randomUUID } = require('node:crypto');
const {
    convertBytesToMB,
    generateUniqueSlug,
    getShareUrl,
} = require('../../../src/utils/util');

jest.mock('node:crypto', () => ({
    randomUUID: jest.fn(),
}));

describe('Utility Functions', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('convertBytesToMB', () => {
        it('should convert bytes to MB correctly', () => {
            const bytes = 1048576;
            const result = convertBytesToMB(bytes);
            expect(result).toBe(1.0);
        });

        it('should return a number with 2 decimal places', () => {
            const bytes = 1572864;
            const result = convertBytesToMB(bytes);
            expect(result).toBe(1.5);
        });
    });

    describe('generateUniqueSlug', () => {
        it('should generate a unique slug using randomUUID', () => {
            const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
            randomUUID.mockReturnValue(mockUUID);

            const slug = generateUniqueSlug();
            expect(slug).toBe(mockUUID);
            expect(randomUUID).toHaveBeenCalled();
        });
    });

    describe('getShareUrl', () => {
        it('should generate a share URL using the BASE_URL environment variable', () => {
            process.env.BASE_URL = 'https://example.com';
            const slug = 'test-slug';
            const url = getShareUrl(slug);

            expect(url).toBe(`https://example.com/s/${slug}`);
        });

        it('should fall back to localhost if BASE_URL is not set', () => {
            delete process.env.BASE_URL;
            process.env.PORT = 4000;
            const slug = 'test-slug';
            const url = getShareUrl(slug);

            expect(url).toBe(`http://localhost:4000/s/${slug}`);
        });

        it('should default to port 3000 if PORT is not set', () => {
            delete process.env.BASE_URL;
            delete process.env.PORT;
            const slug = 'test-slug';
            const url = getShareUrl(slug);

            expect(url).toBe(`http://localhost:3000/s/${slug}`);
        });
    });
});
