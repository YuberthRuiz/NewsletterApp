-- Remove password_hash column from creators table since we're using Supabase Auth
ALTER TABLE creators DROP COLUMN password_hash;