import { v4 as uuidv4 } from 'uuid';

interface ConversationData {
  id: string;
  title: string;
  user_id: string;
  started_at: Date;
  ended_at: Date | null;
}

interface MessageData {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'user' | 'ai';
  sent_at: Date;
}

interface MessageForSorting {
  id: string;
  sent_at: Date;
  content: string;
}

describe('Conversation Logic', () => {
  describe('Conversation Data Structure', () => {
    test('should create valid conversation object', () => {
      const conversation: ConversationData = {
        id: uuidv4(),
        title: 'Test Conversation',
        user_id: uuidv4(),
        started_at: new Date(),
        ended_at: null
      };

      expect(conversation.id).toBeDefined();
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.user_id).toBeDefined();
      expect(conversation.started_at).toBeInstanceOf(Date);
      expect(conversation.ended_at).toBeNull();
    });

    test('should generate default conversation title', () => {
      const now = new Date();
      const defaultTitle = `Conversation du ${now.toLocaleDateString('fr-FR')}`;
      
      expect(defaultTitle).toContain('Conversation du');
      expect(defaultTitle).toContain('/');
    });

    test('should validate conversation title length', () => {
      const validateTitle = (title: any): boolean => {
        if (!title || typeof title !== 'string') {
          return false;
        }
        return title.length >= 1 && title.length <= 200;
      };

      expect(validateTitle('Valid Title')).toBe(true);
      expect(validateTitle('')).toBe(false);
      expect(validateTitle(null)).toBe(false);
      expect(validateTitle(undefined)).toBe(false);
      expect(validateTitle('a'.repeat(201))).toBe(false);
      expect(validateTitle('Short')).toBe(true);
    });
  });

  describe('Message Data Structure', () => {
    test('should create valid message object', () => {
      const message: MessageData = {
        id: uuidv4(),
        conversation_id: uuidv4(),
        content: 'Hello, this is a test message',
        sender: 'user',
        sent_at: new Date()
      };

      expect(message.id).toBeDefined();
      expect(message.conversation_id).toBeDefined();
      expect(message.content).toBe('Hello, this is a test message');
      expect(message.sender).toBe('user');
      expect(message.sent_at).toBeInstanceOf(Date);
    });

    test('should validate sender types', () => {
      const validSenders = new Set<'user' | 'ai'>(['user', 'ai']);
      
      expect(validSenders.has('user')).toBe(true);
      expect(validSenders.has('ai')).toBe(true);
      expect(validSenders.has('invalid' as any)).toBe(false);
    });

    test('should validate message content', () => {
      const validateContent = (content: any): boolean => {
        if (!content || typeof content !== 'string') {
          return false;
        }
        return content.trim().length > 0 && content.length <= 5000;
      };

      expect(validateContent('Valid message')).toBe(true);
      expect(validateContent('')).toBe(false);
      expect(validateContent(null)).toBe(false);
      expect(validateContent(undefined)).toBe(false);
      expect(validateContent('   ')).toBe(false);
      expect(validateContent('a'.repeat(5001))).toBe(false);
      expect(validateContent('Short')).toBe(true);
    });
  });

  describe('Conversation Timeline', () => {
    test('should track conversation duration', () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T10:30:00Z');
      
      const duration = endTime.getTime() - startTime.getTime();
      const durationInMinutes = duration / (1000 * 60);
      
      expect(durationInMinutes).toBe(30);
    });

    test('should order messages by timestamp', () => {
      const messages: MessageForSorting[] = [
        { id: '1', sent_at: new Date('2024-01-01T10:02:00Z'), content: 'Second' },
        { id: '2', sent_at: new Date('2024-01-01T10:01:00Z'), content: 'First' },
        { id: '3', sent_at: new Date('2024-01-01T10:03:00Z'), content: 'Third' }
      ];

      const sortedMessages = messages.sort((a, b) => a.sent_at.getTime() - b.sent_at.getTime());
      
      expect(sortedMessages[0].content).toBe('First');
      expect(sortedMessages[1].content).toBe('Second');
      expect(sortedMessages[2].content).toBe('Third');
    });
  });

  describe('Authorization Logic', () => {
    test('should check conversation ownership', () => {
      const userId = uuidv4();
      const conversationOwner = uuidv4();
      
      const checkOwnership = (requestUserId: string, conversationOwnerId: string): boolean => {
        return requestUserId === conversationOwnerId;
      };

      expect(checkOwnership(userId, userId)).toBe(true);
      expect(checkOwnership(userId, conversationOwner)).toBe(false);
    });
  });
});