-- Add has_seen_welcome column to profiles table
ALTER TABLE profiles ADD COLUMN has_seen_welcome BOOLEAN DEFAULT FALSE;

-- Create a function to handle welcome message preference
CREATE OR REPLACE FUNCTION update_welcome_message_preference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.has_seen_welcome = COALESCE(NEW.has_seen_welcome, OLD.has_seen_welcome, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to ensure the welcome message preference is preserved
CREATE TRIGGER preserve_welcome_message_preference
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_welcome_message_preference(); 