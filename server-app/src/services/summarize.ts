import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import EmotionalJournal from '../models/EmotionalJournal.js';

interface SummarizeResponse {
  summary: string;
  mood: string;
  title: string;
  tags: string[];
}

export async function summarizeAndSave(conversationId: string, userId: string): Promise<void> {
  // 1. Fetch all messages from the conversation
  const messages = await Message.findAll({
    where: { conversationId },
    order: [['sentAt', 'ASC']],
    attributes: ['sender', 'content'],
  });

  if (messages.length === 0) return;

  const formattedMessages = messages.map((m: any) => ({
    sender: m.sender,
    content: m.content,
  }));

  // 2. Call chat_api /summarize
  const chatApiUrl = process.env.CHAT_API_URL || 'http://chat_api:8000';
  const response = await fetch(`${chatApiUrl}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: formattedMessages }),
  });

  if (!response.ok) {
    throw new Error(`Summarize API error ${response.status}: ${await response.text()}`);
  }

  const result: SummarizeResponse = await response.json() as SummarizeResponse;

  // 3. Update conversation title and emotionalContext
  await Conversation.update(
    {
      title: result.title,
      emotionalContext: {
        summary: result.summary,
        mood: result.mood,
        tags: result.tags,
        summarizedAt: new Date().toISOString(),
      },
    },
    { where: { id: conversationId } }
  );

  // 4. Create automatic EmotionalJournal entry
  await EmotionalJournal.create({
    userId,
    conversationId,
    mood: result.mood,
    description: result.summary,
    tags: result.tags,
    dateLogged: new Date(),
  });
}
