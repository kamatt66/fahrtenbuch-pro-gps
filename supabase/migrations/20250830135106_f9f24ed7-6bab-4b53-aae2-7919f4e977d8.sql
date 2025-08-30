-- Create costs table for vehicle expenses (excluding fuel)
CREATE TABLE public.costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  vehicle_id TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'Wartung', 'Reparatur', 'Versicherung', 'TÜV/HU', 'Reifen', 
    'Autowäsche', 'Parkgebühren', 'Maut', 'Leasing', 'Finanzierung',
    'Zubehör', 'Sonstiges'
  )),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  receipt_number TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT CHECK (recurring_interval IN ('monatlich', 'vierteljährlich', 'halbjährlich', 'jährlich')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

-- Create policies for costs (public access for now since no auth)
CREATE POLICY "Anyone can view costs" 
ON public.costs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create costs" 
ON public.costs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update costs" 
ON public.costs 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete costs" 
ON public.costs 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_costs_updated_at
BEFORE UPDATE ON public.costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_costs_user_id ON public.costs(user_id);
CREATE INDEX idx_costs_vehicle_id ON public.costs(vehicle_id);
CREATE INDEX idx_costs_category ON public.costs(category);
CREATE INDEX idx_costs_date ON public.costs(date);