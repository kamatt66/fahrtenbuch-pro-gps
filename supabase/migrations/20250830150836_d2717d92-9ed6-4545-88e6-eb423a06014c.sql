-- Update existing table policies for trips, fuel_records, and costs
-- Drop existing "Anyone" policies for trips
DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can create trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can update trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can delete trips" ON public.trips;

-- Create user-based policies for trips
CREATE POLICY "Users can view their own trips"
  ON public.trips FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own trips"
  ON public.trips FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own trips"
  ON public.trips FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own trips"
  ON public.trips FOR DELETE
  USING (user_id = auth.uid());

-- Drop existing "Anyone" policies for fuel_records
DROP POLICY IF EXISTS "Anyone can view fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Anyone can create fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Anyone can update fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Anyone can delete fuel records" ON public.fuel_records;

-- Create user-based policies for fuel_records
CREATE POLICY "Users can view their own fuel records"
  ON public.fuel_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own fuel records"
  ON public.fuel_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own fuel records"
  ON public.fuel_records FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own fuel records"
  ON public.fuel_records FOR DELETE
  USING (user_id = auth.uid());

-- Drop existing "Anyone" policies for costs
DROP POLICY IF EXISTS "Anyone can view costs" ON public.costs;
DROP POLICY IF EXISTS "Anyone can create costs" ON public.costs;
DROP POLICY IF EXISTS "Anyone can update costs" ON public.costs;
DROP POLICY IF EXISTS "Anyone can delete costs" ON public.costs;

-- Create user-based policies for costs
CREATE POLICY "Users can view their own costs"
  ON public.costs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own costs"
  ON public.costs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own costs"
  ON public.costs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own costs"
  ON public.costs FOR DELETE
  USING (user_id = auth.uid());