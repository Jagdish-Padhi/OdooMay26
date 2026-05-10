/**
 * Route barrel
 *
 * Mount new routers here as you add domain features.
 * Pattern: import router → router.use('/your-resource', yourRouter)
 */
import { Router } from 'express';
import healthRouter   from './health.route.js';
import authRouter     from './auth.route.js';

const router = Router();

router.use(healthRouter);
router.use('/auth',      authRouter);

export default router;

