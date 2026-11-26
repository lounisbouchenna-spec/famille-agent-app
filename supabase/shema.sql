CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID,
  display_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member', 'child')) DEFAULT 'member',
  color_hex TEXT DEFAULT '#3B82F6'
);

CREATE TABLE schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('rdv', 'sport', 'ecole', 'perso', 'autre')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  rrule TEXT,
  notes TEXT
);

CREATE TABLE medication_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  med_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule_times TEXT[] NOT NULL,
  meal_instruction TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  remaining_stock INT
);

CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES medication_plans(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('taken', 'snoozed', 'missed')) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);
