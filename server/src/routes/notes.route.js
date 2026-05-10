import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getDb } from '../db/index.js';
import { notes } from '../db/schema/index.js';
import { desc, eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const items = await db
      .select()
      .from(notes)
      .where(eq(notes.tripId, req.params.id))
      .orderBy(desc(notes.createdAt));
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const db = getDb();
    const [note] = await db
      .insert(notes)
      .values({ tripId: req.params.id, ...req.body })
      .returning();
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
});

router.put('/:noteId', async (req, res, next) => {
  try {
    const db = getDb();
    const [updated] = await db
      .update(notes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(notes.id, req.params.noteId))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:noteId', async (req, res, next) => {
  try {
    const db = getDb();
    await db.delete(notes).where(eq(notes.id, req.params.noteId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
