import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { authorize } from '../middlewares/authorize.js';
import * as adminService from '../services/admin.service.js';

const router = Router();

// Protect all routes with auth + admin role
router.use(verifyToken);
router.use(authorize('admin'));

// Platform Stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// User Management
router.get('/users', async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await adminService.getAllUsers({ 
      page: Number(page) || 1, 
      limit: Number(limit) || 20, 
      search: search || '',
      role: role
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body, req.auth.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// Moderation & Reports
router.get('/reports', async (req, res, next) => {
  try {
    const reports = await adminService.getReports(req.query);
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
});

router.patch('/reports/:id', async (req, res, next) => {
  try {
    const report = await adminService.updateReport(req.params.id, req.body, req.auth.userId);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const logs = await adminService.getAuditLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 50
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

export default router;
