/**
 * Route barrel
 *
 * Mount new routers here as you add domain features.
 * Pattern: import router → router.use('/your-resource', yourRouter)
 */
import { Router } from 'express';
import healthRouter   from './health.route.js';
import authRouter     from './auth.route.js';
import userRouter     from './user.routes.js';
import tripsRouter    from './trips.route.js';
import citiesRouter   from './cities.route.js';
import aiRouter       from './ai.route.js';
import adminRouter    from './admin.route.js';

const router = Router();

router.use(healthRouter);
router.use('/auth',      authRouter);
router.use('/users',     userRouter);
router.use('/trips',     tripsRouter);
router.use('/cities',    citiesRouter);
router.use('/ai',        aiRouter);
router.use('/admin',     adminRouter);

export default router;

