import { getDb } from '../db/index.js';
import { auditLogs } from '../db/schema/index.js';

/**
 * Logs an administrative action to the audit_logs table.
 * 
 * @param {Object} logEntry
 * @param {string} logEntry.adminId - The ID of the admin performing the action.
 * @param {string} logEntry.action - The action performed (e.g., "ROLE_UPDATE").
 * @param {string} logEntry.entityType - The type of entity affected (e.g., "user").
 * @param {string} [logEntry.entityId] - The ID of the affected entity.
 * @param {Object} [logEntry.metadata] - Additional context/data about the action.
 */
export async function logAdminAction({ adminId, action, entityType, entityId, metadata }) {
  const db = getDb();
  
  try {
    await db.insert(auditLogs).values({
      adminId,
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // We don't throw here to avoid failing the main action if logging fails,
    // though in high-security systems you might want to.
  }
}
