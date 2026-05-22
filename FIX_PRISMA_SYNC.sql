-- =============================================================================
-- SAFE fix: only drop the broken `attendance` table that's causing the error.
-- =============================================================================
-- Your REAL data is in plural Prisma-managed tables (students, classes, etc).
-- This script does NOT touch any of them.
-- The only thing we drop is `attendance` because its columns are out of sync
-- with what Prisma expects (snake_case vs camelCase). And it has no real data
-- yet — you couldn't even open the Présences page!
-- =============================================================================

-- First, confirm what we're about to drop has no data (run this query alone
-- if you want to double-check before dropping):
-- SELECT COUNT(*) FROM attendance;

DROP TABLE IF EXISTS attendance CASCADE;

-- Done. Now run `npx prisma db push` in your terminal — Prisma will
-- recreate `attendance` with the correct camelCase columns. No other
-- tables will be touched if they already match the schema.
