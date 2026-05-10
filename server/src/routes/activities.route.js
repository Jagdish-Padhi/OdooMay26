import { Router } from 'express';

import { verifyToken } from '../middlewares/verifyToken.js';
import * as activitiesService from '../services/activities.service.js';

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const data = await activitiesService.getActivitiesByStop(req.params.stopId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const activity = await activitiesService.addActivity(req.params.stopId, req.body);
    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
});

router.put('/reorder', async (req, res, next) => {
  try {
    await activitiesService.reorderActivities(req.params.stopId, req.body.orderedIds || []);
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.put('/:activityId', async (req, res, next) => {
  try {
    const activity = await activitiesService.updateActivity(req.params.stopId, req.params.activityId, req.body);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    return res.status(200).json({ success: true, data: activity });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:activityId', async (req, res, next) => {
  try {
    const activity = await activitiesService.deleteActivity(req.params.stopId, req.params.activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    return res.status(200).json({ success: true, message: 'Activity deleted.' });
  } catch (error) {
    return next(error);
  }
});

export default router;