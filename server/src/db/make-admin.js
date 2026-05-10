import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { users } from './schema/users.js';
import { eq } from 'drizzle-orm';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/Odoo_May26';

const run = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email: node src/db/make-admin.js user@example.com');
    process.exit(1);
  }

  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    const result = await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log(`Successfully updated ${email} to admin role.`);
    }
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await client.end();
  }
};

run();
