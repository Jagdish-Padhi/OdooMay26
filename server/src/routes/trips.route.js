import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { computeBudget } from '../services/budget.service.js';
import checklistRoute from './checklist.route.js';
import notesRoute from './notes.route.js';

// TODO: These should be imported from trips.controller.js once Phase 2 is built by colleague
// For now, providing shell handlers to allow Phase 4 testing
const stubHandler = (req, res) => res.json({ success: true, message: 'Trip shell handler' });

const router = Router();

// Public route placeholder
router.get('/public/:id', stubHandler);

// Protected routes
router.use(verifyToken);

router.get('/', stubHandler);
router.post('/', stubHandler);
router.get('/:id', stubHandler);
router.put('/:id', stubHandler);
router.delete('/:id', stubHandler);

// Phase 4 Utilities (Financials & Journals)
router.get('/:id/budget', async (req, res, next) => {
  try {
    const budget = await computeBudget(req.params.id);
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
});

router.use('/:id/checklist', checklistRoute);
router.use('/:id/notes', notesRoute);

export default router;
