import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

// All user routes are protected
router.use(verifyToken);

router.get('/me', userController.getProfile);
router.put('/profile', userController.updateProfile);

export default router;
