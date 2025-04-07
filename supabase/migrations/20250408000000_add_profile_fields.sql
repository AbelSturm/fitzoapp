/*
  # Add additional profile fields

  1. Adding new fields to profiles table:
    - `username` (text)
    - `first_name` (text)
    - `last_name` (text)

  2. Updates to allow users to modify their own profiles
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text;

-- Add unique constraint to username
ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Update policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id); 