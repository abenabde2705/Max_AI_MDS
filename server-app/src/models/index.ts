import User from './User.js';
import Conversation from './Conversation.js';
import Message from './Message.js';
import EmotionalJournal from './EmotionalJournal.js';
import Recommendation from './Recommendation.js';
import Subscription from './Subscription.js';

// Définir les associations avec types
// User associations
User.hasMany(Conversation, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(Subscription, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(EmotionalJournal, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

// Conversation associations
Conversation.belongsTo(User, {
  foreignKey: 'userId'
});

Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  onDelete: 'CASCADE',
  as: 'messages'
});

Conversation.hasMany(EmotionalJournal, {
  foreignKey: 'conversationId',
  onDelete: 'CASCADE'
});

// Message associations
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});

// EmotionalJournal associations
EmotionalJournal.belongsTo(User, {
  foreignKey: 'userId'
});

EmotionalJournal.belongsTo(Conversation, {
  foreignKey: 'conversationId'
});

// Subscription associations
Subscription.belongsTo(User, {
  foreignKey: 'userId'
});

// Export des modèles avec types
export {
  User,
  Conversation,
  Message,
  EmotionalJournal,
  Recommendation,
  Subscription
};

// Types pour les relations
declare module 'sequelize' {
  interface Model {
    getUser?: () => Promise<User>;
    getConversations?: () => Promise<Conversation[]>;
    getMessages?: () => Promise<Message[]>;
  }
}