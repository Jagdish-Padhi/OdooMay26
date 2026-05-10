import { Router } from 'express';

import * as tripsController from '../controllers/trips.controller.js';
import * as tripService from '../services/trips.service.js';
import { computeBudget } from '../services/budget.service.js';
import checklistRoute from './checklist.route.js';
import notesRoute from './notes.route.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

// Public route - read-only public itinerary
router.get('/public/:id', tripsController.getPublicTrip);

// Protected routes
router.use(verifyToken);

router.get('/', tripsController.getMyTrips);
router.post('/', tripsController.createTrip);

// Duplicate a trip (copy for current user)
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const trip = await tripService.duplicateTrip(req.params.id, req.auth.userId);
    res.status(201).json({ success: true, data: trip, message: 'Trip duplicated successfully' });
  } catch (err) { next(err); }
});

router.get('/:id', tripsController.getTrip);
router.put('/:id', tripsController.updateTrip);
router.delete('/:id', tripsController.deleteTrip);

// Budget computation for a trip
router.get('/:id/budget', async (req, res, next) => {
  try {
    const budget = await computeBudget(req.params.id);
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
});

// Nested feature routes
router.use('/:id/checklist', checklistRoute);
router.use('/:id/notes', notesRoute);

export default router;
