import * as SQLite from "expo-sqlite";
import type { MedicationLogStatus } from "../types/family";

const db = SQLite.openDatabaseSync("famille_agent.db");

export function initLocalDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS local_medication_logs (
      id TEXT PRIMARY KEY NOT NULL,
      plan_id TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      status TEXT NOT NULL,
      logged_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS local_events_cache (
      id TEXT PRIMARY KEY NOT NULL,
      member_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export function logMedicationDoseLocal(
  id: string,
  planId: string,
  scheduledFor: string,
  status: MedicationLogStatus
): void {
  const loggedAt = new Date().toISOString();
  db.runSync(
    `INSERT OR REPLACE INTO local_medication_logs
      (id, plan_id, scheduled_for, status, logged_at, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, planId, scheduledFor, status, loggedAt]
  );
}

export function getUnsyncedMedicationLogs() {
  return db.getAllSync<{
    id: string;
    plan_id: string;
    scheduled_for: string;
    status: MedicationLogStatus;
    logged_at: string;
  }>(`SELECT id, plan_id, scheduled_for, status, logged_at FROM local_medication_logs WHERE synced = 0`);
}

export function markMedicationLogsSynced(ids: string[]): void {
  for (const id of ids) {
    db.runSync(`UPDATE local_medication_logs SET synced = 1 WHERE id = ?`, [id]);
  }
}
