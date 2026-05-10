import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { users } from '../db/schema/users.js';

export const updateProfile = async (req, res) => {
  try {
    const db = getDb();
    const { name, notifyOnHighPriority, notifyDigest } = req.body;
    const userId = req.auth.userId;

    const [updatedUser] = await db
      .update(users)
      .set({
        name,
        notifyOnHighPriority,
        notifyDigest,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        notifyOnHighPriority: users.notifyOnHighPriority,
        notifyDigest: users.notifyDigest,
      });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const db = getDb();
    const userId = req.auth.userId;
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        notifyOnHighPriority: users.notifyOnHighPriority,
        notifyDigest: users.notifyDigest,
        plan: users.plan,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
