-- Allow users to insert their own profile
-- This is needed as a fallback if the trigger doesn't work
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);