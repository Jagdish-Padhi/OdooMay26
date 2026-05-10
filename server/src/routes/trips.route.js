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