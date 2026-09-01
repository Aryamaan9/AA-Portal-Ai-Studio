import { Router, Request, Response } from 'express';
import { classifyWhatsAppMessage } from './classifier.js';
import { db } from '../db.js';

export const whatsappRouter = Router();

// -----------------------------------------------------------------------------
// GET: Webhook Verification for Meta WhatsApp Cloud API
// -----------------------------------------------------------------------------
whatsappRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'aryamaan_sanctuary_secret_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp] Webhook verified successfully!');
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ error: 'Verification failed' });
});

// -----------------------------------------------------------------------------
// POST: Incoming WhatsApp Message Handler
// -----------------------------------------------------------------------------
whatsappRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    let rawText = '';
    let sender = 'WhatsApp';

    // 1. Direct JSON test payload
    if (req.body?.message) {
      rawText = req.body.message;
      sender = req.body.from || sender;
    }
    // 2. Twilio WhatsApp Webhook format
    else if (req.body?.Body) {
      rawText = req.body.Body;
      sender = req.body.From || sender;
    }
    // 3. Meta WhatsApp Cloud API format
    else if (req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      const msgObj = req.body.entry[0].changes[0].value.messages[0];
      rawText = msgObj.text.body;
      sender = msgObj.from || sender;
    }

    if (!rawText || !rawText.trim()) {
      return res.status(200).json({ status: 'ignored_empty_message' });
    }

    console.log(`[WhatsApp] Received from ${sender}: "${rawText}"`);

    // AI Classification
    const classification = await classifyWhatsAppMessage(
      rawText,
      process.env.GEMINI_API_KEY
    );

    let savedItem: any = null;
    let confirmationLabel = 'Diary';

    // Route to appropriate DB collection
    if (classification.primaryType === 'todo') {
      savedItem = await db.createTodo({
        title: classification.title || classification.cleanContent,
        notes: classification.cleanContent !== classification.title ? classification.cleanContent : undefined,
        due_date: classification.todoDueDate,
        priority: classification.todoPriority || 'medium',
        source: 'whatsapp',
        metadata: { original_message: rawText, sender }
      });
      confirmationLabel = 'To-do';
    } else if (classification.primaryType === 'goal') {
      savedItem = await db.createGoal({
        title: classification.title || classification.cleanContent,
        horizon: classification.goalHorizon || 'current_season',
        description: classification.cleanContent,
        status: 'active',
        source: 'whatsapp'
      });
      confirmationLabel = 'Goal';
    } else {
      savedItem = await db.createEntry({
        type: classification.primaryType,
        title: classification.title,
        content: classification.cleanContent,
        author: classification.author,
        source: 'whatsapp',
        tags: classification.tags,
        mood_state: classification.moodState,
        metadata: { original_message: rawText, sender }
      });

      if (classification.primaryType === 'quote') confirmationLabel = 'Quote';
      if (classification.primaryType === 'mood') confirmationLabel = 'Mood Check-in';
      if (classification.primaryType === 'idea') confirmationLabel = 'Idea';
    }

    const replyMessage = `🌿 Saved to Sanctuary (${confirmationLabel})`;

    return res.status(200).json({
      success: true,
      category: classification.primaryType,
      reply: replyMessage,
      item: savedItem
    });
  } catch (error: any) {
    console.error('[WhatsApp] Webhook Error:', error);
    return res.status(500).json({ error: error.message || 'Processing failed' });
  }
});
