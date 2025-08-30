-- Fix security definer functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create all RLS policies for the new tables
-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile and public profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile and public profiles"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Profiles are created automatically" ON public.profiles;
CREATE POLICY "Profiles are created automatically"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers
DROP POLICY IF EXISTS "Users can view drivers in their organization" ON public.drivers;
CREATE POLICY "Users can view drivers in their organization"
  ON public.drivers FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can create drivers" ON public.drivers;
CREATE POLICY "Users can create drivers"
  ON public.drivers FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can update their own drivers or admins/managers can update all" ON public.drivers;
CREATE POLICY "Users can update their own drivers or admins/managers can update all"
  ON public.drivers FOR UPDATE
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Users can delete their own drivers or admins/managers can delete all" ON public.drivers;
CREATE POLICY "Users can delete their own drivers or admins/managers can delete all"
  ON public.drivers FOR DELETE
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Update existing table policies to be user-based
-- Drop existing "Anyone" policies first
DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete vehicles" ON public.vehicles;

-- Create user-based policies for vehicles
CREATE POLICY "Users can view their own vehicles"
  ON public.vehicles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own vehicles"
  ON public.vehicles FOR DELETE
  USING (user_id = auth.uid());