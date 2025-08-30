-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  plate TEXT NOT NULL,
  fuel TEXT,
  year INTEGER,
  consumption NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  initial_km INTEGER NOT NULL DEFAULT 0,
  total_km INTEGER NOT NULL DEFAULT 0,
  monthly_km INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle access
CREATE POLICY "Users can view all vehicles" 
ON public.vehicles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create vehicles" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update vehicles" 
ON public.vehicles 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete vehicles" 
ON public.vehicles 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();