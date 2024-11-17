const {
    authenticate,
    getToken,
} = require('../../../src/middlewares/authMiddleware');
const APIError = require('../../../src/utils/APIError');

describe('authenticate middleware', () => {
    it('should throw an error if no token is provided', () => {
        const req = { headers: {} };
        const next = jest.fn();

        expect(() => authenticate(req, {}, next)).toThrow(APIError);
    });

    it('should throw an error if an invalid token is provided', () => {
        const req = { headers: { authorization: 'Bearer invalid-token' } };
        const next = jest.fn();

        expect(() => authenticate(req, {}, next)).toThrow(APIError);
    });

    it('should call next if a valid token is provided', () => {
        process.env.AUTH_TOKEN = 'valid-token';
        const req = { headers: { authorization: `Bearer ${getToken()}` } };
        const next = jest.fn();

        authenticate(req, {}, next);
        expect(next).toHaveBeenCalled();
    });
});
