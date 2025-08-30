-- Create trips table for recording journeys
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  vehicle_id TEXT,
  driver_name TEXT NOT NULL,
  start_location TEXT,
  end_location TEXT,
  start_latitude DECIMAL(10, 8),
  start_longitude DECIMAL(11, 8),
  end_latitude DECIMAL(10, 8),
  end_longitude DECIMAL(11, 8),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(8, 2),
  purpose TEXT DEFAULT 'Geschäftlich',
  notes TEXT,
  bluetooth_device TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policies for trips (public access for now since no auth)
CREATE POLICY "Anyone can view trips" 
ON public.trips 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update trips" 
ON public.trips 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete trips" 
ON public.trips 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_start_time ON public.trips(start_time);
CREATE INDEX idx_trips_is_active ON public.trips(is_active);