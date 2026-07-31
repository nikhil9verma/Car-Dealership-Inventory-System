import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../../src/server/middleware/auth';

describe('Auth Unit Tests', () => {
  describe('Password Hashing', () => {
    it('should correctly hash password and verify match', async () => {
      const password = 'SecretPassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toEqual(password);
      expect(await bcrypt.compare(password, hash)).toBe(true);
      expect(await bcrypt.compare('WrongPassword', hash)).toBe(false);
    });
  });

  describe('JWT Token Handling', () => {
    it('should generate and verify a valid JWT token', () => {
      const payload = {
        id: 'user-uuid-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.id).toEqual(payload.id);
      expect(decoded.email).toEqual(payload.email);
      expect(decoded.role).toEqual(payload.role);
    });

    it('should throw error when verifying an invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.string');
      }).toThrow();
    });
  });
});
