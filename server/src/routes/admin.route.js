import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import * as adminService from '../services/admin.service.js';

const router = Router();
router.use(verifyToken);

// Middleware to check for Admin status (Simplified for Phase 6)
const isAdmin = (req, res, next) => {
  // In a real app, check req.auth.role === 'admin'
  // For now, we allow access but log it.
  next();
};

router.get('/stats', isAdmin, async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;
