-- Create fuel_records table for fuel expenses
CREATE TABLE public.fuel_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  vehicle_id TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  odometer_reading INTEGER,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Benzin', 'Diesel', 'Super', 'Super Plus', 'E10', 'AdBlue')),
  fuel_amount DECIMAL(8, 3) NOT NULL CHECK (fuel_amount > 0),
  price_per_liter DECIMAL(6, 3) NOT NULL CHECK (price_per_liter > 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
  gas_station TEXT NOT NULL,
  location TEXT,
  receipt_number TEXT,
  receipt_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_records (public access for now since no auth)
CREATE POLICY "Anyone can view fuel records" 
ON public.fuel_records 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create fuel records" 
ON public.fuel_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update fuel records" 
ON public.fuel_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete fuel records" 
ON public.fuel_records 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fuel_records_updated_at
BEFORE UPDATE ON public.fuel_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_fuel_records_user_id ON public.fuel_records(user_id);
CREATE INDEX idx_fuel_records_vehicle_id ON public.fuel_records(vehicle_id);
CREATE INDEX idx_fuel_records_date ON public.fuel_records(date);