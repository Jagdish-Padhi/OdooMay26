import { Router } from 'express';

import { verifyToken } from '../middlewares/verifyToken.js';
import * as stopsService from '../services/stops.service.js';
import activitiesRoute from './activities.route.js';

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const data = await stopsService.getStopsByTrip(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const stop = await stopsService.addStop(req.params.id, req.body);
    return res.status(201).json({ success: true, data: stop });
  } catch (error) {
    return next(error);
  }
});

router.put('/reorder', async (req, res, next) => {
  try {
    await stopsService.reorderStops(req.params.id, req.body.orderedIds || []);
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.put('/:stopId', async (req, res, next) => {
  try {
    const stop = await stopsService.updateStop(req.params.id, req.params.stopId, req.body);
    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found.' });
    }

    return res.status(200).json({ success: true, data: stop });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:stopId', async (req, res, next) => {
  try {
    const stop = await stopsService.deleteStop(req.params.id, req.params.stopId);
    if (!stop) {
      return res.status(404).json({ success: false, message: 'Stop not found.' });
    }

    return res.status(200).json({ success: true, message: 'Stop deleted.' });
  } catch (error) {
    return next(error);
  }
});

router.use('/:stopId/activities', activitiesRoute);

export default router;