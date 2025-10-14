import request from 'supertest';
import app from '../server.js';
// import { User, Conversation, Message } from '../models/index.js'; // Unused imports

describe('Conversation Routes', () => {
  let authToken;
  let userId;
  let conversationId;

  beforeEach(async () => {
    // Créer et authentifier un utilisateur
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: `john${Date.now()}@example.com`,
        password: 'password123',
        age: 25
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Créer une conversation de test
    const conversationResponse = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Conversation'
      });

    conversationId = conversationResponse.body.id;
  });

  describe('POST /api/conversations', () => {
    test('should create a new conversation', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Conversation'
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('New Conversation');
      expect(response.body.user_id).toBe(userId);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .send({
          title: 'New Conversation'
        })
        .expect(401);

      expect(response.body.message).toContain('Token');
    });

    test('should create conversation with default title', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toContain('Conversation du');
    });
  });

  describe('GET /api/conversations', () => {
    test('should get user conversations', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].user_id).toBe(userId);
    });

    test('should return empty array for new user', async () => {
      // Créer un nouveau utilisateur
      const newUser = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: `jane${Date.now()}@example.com`,
          password: 'password123',
          age: 25
        });

      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${newUser.body.token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/conversations')
        .expect(401);
    });
  });

  describe('DELETE /api/conversations/:id', () => {
    test('should delete user conversation', async () => {
      const response = await request(app)
        .delete(`/api/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('supprimée');

      // Vérifier que la conversation est supprimée
      const conversations = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      const deletedConv = conversations.body.find(c => c.id === conversationId);
      expect(deletedConv).toBeUndefined();
    });

    test('should not delete non-existent conversation', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .delete(`/api/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toContain('trouvée');
    });

    test('should not delete other user conversation', async () => {
      // Créer un autre utilisateur
      const otherUser = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Other',
          lastName: 'User',
          email: `other${Date.now()}@example.com`,
          password: 'password123',
          age: 25
        });

      const response = await request(app)
        .delete(`/api/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .expect(404);

      expect(response.body.message).toContain('trouvée');
    });

    test('should require authentication', async () => {
      await request(app)
        .delete(`/api/conversations/${conversationId}`)
        .expect(401);
    });
  });

  describe('GET /api/conversations/:id/messages', () => {
    // let messageId; // Unused variable

    beforeEach(async () => {
      // Créer un message de test
      await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test message',
          sender: 'user'
        });
    });

    test('should get conversation messages', async () => {
      const response = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].conversation_id).toBe(conversationId);
    });

    test('should return empty array for conversation without messages', async () => {
      // Créer une nouvelle conversation
      const newConv = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Empty Conversation'
        });

      const response = await request(app)
        .get(`/api/conversations/${newConv.body.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('should not get messages from non-existent conversation', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      await request(app)
        .get(`/api/conversations/${fakeId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should require authentication', async () => {
      await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .expect(401);
    });
  });

  describe('POST /api/conversations/:id/messages', () => {
    test('should create a new message', async () => {
      const messageData = {
        content: 'Hello, this is a test message',
        sender: 'user'
      };

      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.content).toBe(messageData.content);
      expect(response.body.sender).toBe(messageData.sender);
      expect(response.body.conversation_id).toBe(conversationId);
    });

    test('should validate message content', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sender: 'user'
          // content manquant
        })
        .expect(400);

      expect(response.body.message).toContain('requis');
    });

    test('should validate sender type', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test message',
          sender: 'invalid_sender'
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test('should not create message in non-existent conversation', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .post(`/api/conversations/${fakeId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test message',
          sender: 'user'
        })
        .expect(404);

      expect(response.body.message).toContain('trouvée');
    });

    test('should require authentication', async () => {
      await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .send({
          content: 'Test message',
          sender: 'user'
        })
        .expect(401);
    });
  });
});