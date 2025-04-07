/*
  # Drop additional profile fields

  1. Removes fields added in 20250408000000_add_profile_fields.sql:
    - `username`
    - `first_name`
    - `last_name`
    - associated constraints
*/

-- Drop the policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop the unique constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;

-- Drop the columns
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS username,
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name; 