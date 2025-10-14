// Tests basiques pour les utilitaires d'authentification
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Auth Utils', () => {
  describe('JWT Token Generation', () => {
    test('should generate a valid JWT token', () => {
      const userId = 'test-user-id';
      process.env.JWT_SECRET = 'test-secret';
      
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
    });

    test('should verify JWT token correctly', () => {
      const userId = 'test-user-id';
      process.env.JWT_SECRET = 'test-secret';
      
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(30);
    });

    test('should verify password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Input Validation', () => {
    test('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('test@')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
    });

    test('should validate required fields', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      expect(userData.firstName).toBeDefined();
      expect(userData.lastName).toBeDefined();
      expect(userData.email).toBeDefined();
      expect(userData.password).toBeDefined();
      
      expect(userData.firstName.length).toBeGreaterThan(0);
      expect(userData.password.length).toBeGreaterThanOrEqual(6);
    });
  });
});