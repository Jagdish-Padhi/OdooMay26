import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import * as aiService from '../services/ai.service.js';

const router = Router();
router.use(verifyToken);

router.post('/plan', async (req, res, next) => {
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

export default router;
