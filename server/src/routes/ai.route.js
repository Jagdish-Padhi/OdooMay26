import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { optionalVerifyToken } from '../middlewares/optionalVerifyToken.js';
import * as aiService from '../services/ai.service.js';

const router = Router();

router.post('/plan', verifyToken, async (req, res, next) => {
  try {
    const { city, country, duration, budget, preferences } = req.body;
    
    if (!city || !duration) {
      return res.status(400).json({ success: false, message: 'City and duration are required.' });
    }

    const itinerary = await aiService.generateAiItinerary({ 
      city, 
      country: country || '', 
      duration: parseInt(duration), 
      budget: budget || 'medium', 
      preferences 
    });

    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
});

router.post('/activity-search', verifyToken, async (req, res, next) => {
  try {
    const { city, country, type, budget, duration, limit } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, message: 'City is required.' });
    }

    const activities = await aiService.generateActivityIdeas({
      city,
      country: country || '',
      type: type || '',
      budget: budget || 'medium',
      duration: duration || '',
      limit: Number(limit) || 6,
    });

    return res.status(200).json({ success: true, data: activities });
  } catch (err) {
    return next(err);
  }
});

router.get('/chat/:tripId', optionalVerifyToken, async (req, res, next) => {
  try {
    const history = await aiService.getTripChatHistory({
      tripId: req.params.tripId,
      userId: req.auth?.userId || null,
    });

    if (!history) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    return res.json({ success: true, data: history });
  } catch (err) {
    return next(err);
  }
});

router.post('/chat', optionalVerifyToken, async (req, res, next) => {
  try {
    const { tripId, messages, stream = true } = req.body;

    if (!tripId) {
      return res.status(400).json({ success: false, message: 'Trip ID is required.' });
    }

    const completion = await aiService.generateTripChatReply({
      tripId,
      userId: req.auth?.userId || null,
      messages,
      stream: stream !== false,
    });

    if (completion.mode !== 'stream') {
      await aiService.persistTripChatTurn({
        chatId: completion.chatId,
        userMessage: completion.userMessage,
        assistantMessage: completion.reply,
      });

      return res.json({
        success: true,
        data: {
          reply: completion.reply,
        },
      });
    }

    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');

    let assistantReply = '';

    for await (const chunk of completion.stream) {
      const text = chunk.text();
      assistantReply += text;
      res.write(text);
    }

    await completion.replyPromise;

    await aiService.persistTripChatTurn({
      chatId: completion.chatId,
      userMessage: completion.userMessage,
      assistantMessage: assistantReply,
    });

    return res.end();
  } catch (err) {
    if (!res.headersSent) {
      return next(err);
    }

    return res.end();
  }
});

export default router;
