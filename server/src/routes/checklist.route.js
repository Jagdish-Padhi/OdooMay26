import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getDb } from '../db/index.js';
import { checklists } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const items = await db
      .select()
      .from(checklists)
      .where(eq(checklists.tripId, req.params.id)); // tripId is 'id' from parent
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const db = getDb();
    const [item] = await db
      .insert(checklists)
      .values({ tripId: req.params.id, ...req.body })
      .returning();
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.put('/:itemId', async (req, res, next) => {
  try {
    const db = getDb();
    const [updated] = await db
      .update(checklists)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(checklists.id, req.params.itemId))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:itemId', async (req, res, next) => {
  try {
    const db = getDb();
    await db.delete(checklists).where(eq(checklists.id, req.params.itemId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/reset', async (req, res, next) => {
  try {
    const db = getDb();
    await db
      .update(checklists)
      .set({ isPacked: false, updatedAt: new Date() })
      .where(eq(checklists.tripId, req.params.id));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
