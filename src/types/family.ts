export type MemberRole = "admin" | "member" | "child";

export type EventCategory = "rdv" | "sport" | "ecole" | "perso" | "autre";

export type MedicationLogStatus = "taken" | "snoozed" | "missed";

export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  household_id: string;
  user_id: string | null;
  display_name: string;
  role: MemberRole;
  color_hex: string;
}

export interface ScheduleEvent {
  id: string;
  household_id: string;
  member_id: string;
  title: string;
  category: EventCategory;
  start_at: string;
  end_at: string;
  location?: string | null;
  rrule?: string | null;
  notes?: string | null;
}

export interface MedicationPlan {
  id: string;
  household_id: string;
  member_id: string;
  med_name: string;
  dosage: string;
  schedule_times: string[]; // Ex. : ["08:00", "20:00"]
  meal_instruction?: string | null;
  start_date: string;
  end_date?: string | null;
  remaining_stock?: number | null;
}

export interface MedicationLog {
  id: string;
  plan_id: string;
  scheduled_for: string;
  status: MedicationLogStatus;
  logged_at: string;
}
