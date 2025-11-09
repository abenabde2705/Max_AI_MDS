import User from './User.js';
import Conversation from './Conversation.js';
import Message from './Message.js';
import EmotionalJournal from './EmotionalJournal.js';
import Recommendation from './Recommendation.js';
import Subscription from './Subscription.js';

// Définir les associations
// User associations
User.hasMany(Conversation, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

User.hasMany(Subscription, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

User.hasMany(EmotionalJournal, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

// Conversation associations
Conversation.belongsTo(User, {
  foreignKey: 'user_id'
});

Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  onDelete: 'CASCADE',
  as: 'messages'
});

Conversation.hasMany(EmotionalJournal, {
  foreignKey: 'conversation_id',
  onDelete: 'CASCADE'
});

// Message associations
Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// EmotionalJournal associations
EmotionalJournal.belongsTo(User, {
  foreignKey: 'user_id'
});

EmotionalJournal.belongsTo(Conversation, {
  foreignKey: 'conversation_id'
});

// Subscription associations
Subscription.belongsTo(User, {
  foreignKey: 'user_id'
});

export {
  User,
  Conversation,
  Message,
  EmotionalJournal,
  Recommendation,
  Subscription
};