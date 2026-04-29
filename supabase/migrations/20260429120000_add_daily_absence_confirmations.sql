CREATE TABLE IF NOT EXISTS daily_absence_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  absence_date date NOT NULL,
  absence_type text NOT NULL CHECK (
    absence_type IN (
      'symptoms',
      'stress',
      'pain',
      'exercise',
      'hydration',
      'bowel_movement',
      'sleep',
      'medication'
    )
  ),
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  source text NOT NULL DEFAULT 'daily_mark_none' CHECK (
    source IN ('daily_mark_none', 'system', 'import')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, absence_date, absence_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_absence_confirmations_user_date
  ON daily_absence_confirmations (user_id, absence_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_absence_confirmations_user_type_date
  ON daily_absence_confirmations (user_id, absence_type, absence_date DESC);

ALTER TABLE daily_absence_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily absence confirmations"
  ON daily_absence_confirmations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily absence confirmations"
  ON daily_absence_confirmations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily absence confirmations"
  ON daily_absence_confirmations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily absence confirmations"
  ON daily_absence_confirmations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_daily_absence_confirmations_updated_at
  ON daily_absence_confirmations;

CREATE TRIGGER update_daily_absence_confirmations_updated_at
  BEFORE UPDATE ON daily_absence_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
