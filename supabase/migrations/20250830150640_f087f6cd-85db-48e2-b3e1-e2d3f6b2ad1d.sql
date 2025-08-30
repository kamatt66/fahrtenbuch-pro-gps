-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create drivers table if not exists
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  license_expiry DATE,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  total_trips INTEGER NOT NULL DEFAULT 0,
  total_km NUMERIC NOT NULL DEFAULT 0,
  monthly_km NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
-- Drop existing "Anyone" policies 
DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can create trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can update trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can delete trips" ON public.trips;

DROP POLICY IF EXISTS "Anyone can view fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Anyone can create fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Anyone can update fuel records" ON public.fuel_records;
DROP POLICY IF EXISTS "Anyone can delete fuel records" ON public.fuel_records;

DROP POLICY IF EXISTS "Anyone can view costs" ON public.costs;
DROP POLICY IF EXISTS "Anyone can create costs" ON public.costs;
DROP POLICY IF EXISTS "Anyone can update costs" ON public.costs;
DROP POLICY IF EXISTS "Anyone can delete costs" ON public.costs;