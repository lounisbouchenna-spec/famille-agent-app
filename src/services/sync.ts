import { getUnsyncedMedicationLogs, markMedicationLogsSynced } from "./database";
import { supabase } from "./supabase";

export async function syncPendingMedicationLogs(): Promise<{ syncedCount: number }> {
  const pending = getUnsyncedMedicationLogs();
  if (pending.length === 0) {
    return { syncedCount: 0 };
  }

  const { error } = await supabase
    .from("medication_logs")
    .upsert(pending, { onConflict: "id" });

  if (error) {
    throw error;
  }

  const syncedIds = pending.map((item) => item.id);
  markMedicationLogsSynced(syncedIds);

  return { syncedCount: syncedIds.length };
}
