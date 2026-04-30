-- ====================================================================
-- EDURA — Row-Level Security policies
-- Phase 11: Production deployment
--
-- HOW TO APPLY:
--   1. Open Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file
--   3. Click "Run"
--
-- WHAT IT DOES:
--   - Enables RLS on every multi-tenant table
--   - Adds a session variable `app.school_id` that the app sets per request
--   - Creates policies that only allow rows where school_id matches
--   - Service-role key bypasses RLS (used by admin operations only)
-- ====================================================================

-- ── Step 1: Helper function to get the active school context ────────
-- Set by the application via:
--   await prisma.$executeRaw`SELECT set_config('app.school_id', ${schoolId}, true)`
-- before every query.
CREATE OR REPLACE FUNCTION current_school_id()
RETURNS text AS $$
  SELECT NULLIF(current_setting('app.school_id', true), '');
$$ LANGUAGE sql STABLE;

-- ── Step 2: Enable RLS on every tenant-scoped table ─────────────────
ALTER TABLE schools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years    ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- ── Step 3: Drop existing policies (so this script is idempotent) ───
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname LIKE 'edura_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ── Step 4: Direct school_id tables ─────────────────────────────────

-- schools: row IS the tenant
CREATE POLICY edura_schools_select ON schools
  FOR ALL USING (id = current_school_id());

CREATE POLICY edura_users_isolate ON users
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_years_isolate ON academic_years
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_classes_isolate ON classes
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_subjects_isolate ON subjects
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_students_isolate ON students
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_payments_isolate ON payments
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_announcements_isolate ON announcements
  FOR ALL USING (school_id = current_school_id());

CREATE POLICY edura_audit_isolate ON audit_logs
  FOR ALL USING (school_id = current_school_id());

-- ── Step 5: Indirect tables (joined via class or student) ───────────

CREATE POLICY edura_classsubjects_isolate ON class_subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_subjects.class_id
        AND c.school_id = current_school_id()
    )
  );

CREATE POLICY edura_assignments_isolate ON teacher_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = teacher_assignments.class_id
        AND c.school_id = current_school_id()
    )
  );

CREATE POLICY edura_schedules_isolate ON schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = schedules.class_id
        AND c.school_id = current_school_id()
    )
  );

CREATE POLICY edura_assessments_isolate ON assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = assessments.class_id
        AND c.school_id = current_school_id()
    )
  );

CREATE POLICY edura_grades_isolate ON grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = grades.student_id
        AND s.school_id = current_school_id()
    )
  );

CREATE POLICY edura_attendance_isolate ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = attendance.student_id
        AND s.school_id = current_school_id()
    )
  );

CREATE POLICY edura_fees_isolate ON fee_structures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = fee_structures.class_id
        AND c.school_id = current_school_id()
    )
  );

-- ====================================================================
-- DONE. To verify:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
-- All tenant tables should show rowsecurity = true.
-- ====================================================================
