import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a user with all required fields', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        age: 25
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(25);
      expect(user.is_anonymous).toBe(false);
      expect(user.is_premium).toBe(false);
    });

    test('should hash password on creation', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25
      };

      const user = await User.create(userData);

      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe('password123');
      
      // Vérifier que le mot de passe peut être validé
      const isValid = await bcrypt.compare('password123', user.password_hash);
      expect(isValid).toBe(true);
    });

    test('should create anonymous user', async () => {
      const userData = {
        firstName: null,
        lastName: null,
        email: null,
        pseudonym: 'Anonymous123',
        is_anonymous: true
      };

      const user = await User.create(userData);

      expect(user.pseudonym).toBe('Anonymous123');
      expect(user.is_anonymous).toBe(true);
      expect(user.email).toBeNull();
    });

    test('should enforce unique email constraint', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25
      };

      await User.create(userData);

      // Essayer de créer un autre utilisateur avec le même email
      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
        age: 25
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25
      });
    });

    test('should find user by email', async () => {
      const foundUser = await User.findOne({ where: { email: 'john@example.com' } });

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.firstName).toBe('John');
    });

    test('should update user information', async () => {
      await user.update({
        firstName: 'Jane',
        is_premium: true
      });

      expect(user.firstName).toBe('Jane');
      expect(user.is_premium).toBe(true);
    });

    test('should delete user', async () => {
      const userId = user.id;
      await user.destroy();

      const deletedUser = await User.findByPk(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Password Validation', () => {
    test('should validate correct password', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25
      });

      const isValid = await bcrypt.compare('password123', user.password_hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25
      });

      const isValid = await bcrypt.compare('wrongpassword', user.password_hash);
      expect(isValid).toBe(false);
    });
  });
});