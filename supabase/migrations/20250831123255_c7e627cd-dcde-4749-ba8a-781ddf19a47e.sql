-- Tabelle für GPS-Routenpunkte während der Fahrt
CREATE TABLE public.route_points (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accuracy NUMERIC,
    speed NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies für route_points
ALTER TABLE public.route_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own route points"
ON public.route_points
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = route_points.trip_id 
        AND trips.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert route points for their own trips"
ON public.route_points
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = route_points.trip_id 
        AND trips.user_id = auth.uid()
    )
);

-- Index für bessere Performance
CREATE INDEX idx_route_points_trip_id ON public.route_points(trip_id);
CREATE INDEX idx_route_points_recorded_at ON public.route_points(recorded_at);