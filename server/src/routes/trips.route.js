import { Router } from 'express';

import * as tripsController from '../controllers/trips.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.get('/public/:id', tripsController.getPublicTrip);

router.use(verifyToken);

router.get('/', tripsController.getMyTrips);
router.post('/', tripsController.createTrip);
router.get('/:id', tripsController.getTrip);
router.put('/:id', tripsController.updateTrip);
router.delete('/:id', tripsController.deleteTrip);

export default router;
import * as tripService from '../services/trips.service.js';
import { computeBudget } from '../services/budget.service.js';
import checklistRoute from './checklist.route.js';
import notesRoute from './notes.route.js';

const router = Router();

// Public route - Fetches public itinerary data
router.get('/public/:id', async (req, res, next) => {
  try {
    const trip = await tripService.getPublicTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Public trip not found' });
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
});

// Protected routes
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const data = await tripService.getTripsByUser(req.auth.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await tripService.createTrip(req.auth.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const trip = await tripService.duplicateTrip(req.params.id, req.auth.userId);
    res.status(201).json({ success: true, data: trip, message: 'Trip duplicated successfully' });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await tripService.getTripById(req.params.id, req.auth.userId);
    if (!data) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await tripService.updateTrip(req.params.id, req.auth.userId, req.body);
    if (!data) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = await tripService.deleteTrip(req.params.id, req.auth.userId);
    if (!data) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) { next(err); }
});
router.get('/:id/budget', async (req, res, next) => {
  try {
    const budget = await computeBudget(req.params.id);
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
});

router.use('/:id/checklist', checklistRoute);
router.use('/:id/notes', notesRoute);

export default router;
