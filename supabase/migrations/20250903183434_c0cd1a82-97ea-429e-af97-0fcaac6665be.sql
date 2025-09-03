-- Fix RLS security issues - Enable RLS on all public tables

-- Enable RLS on all tables that don't have it
ALTER TABLE public.agent_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_idea_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies for all tables

-- Agent payouts policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'agent_payouts' AND policyname = 'Users can manage their own payouts') THEN
        CREATE POLICY "Users can manage their own payouts" ON public.agent_payouts
            FOR ALL USING (auth.uid() = agent_id) WITH CHECK (auth.uid() = agent_id);
    END IF;
END $$;

-- Agent profiles policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'agent_profiles' AND policyname = 'Users can manage their own agent profile') THEN
        CREATE POLICY "Users can manage their own agent profile" ON public.agent_profiles
            FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Business idea purchases policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'business_idea_purchases' AND policyname = 'Users can manage their own purchases') THEN
        CREATE POLICY "Users can manage their own purchases" ON public.business_idea_purchases
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Business ideas policies (public access for reading, admin for writing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'business_ideas' AND policyname = 'Anyone can view business ideas') THEN
        CREATE POLICY "Anyone can view business ideas" ON public.business_ideas
            FOR SELECT USING (true);
    END IF;
END $$;

-- Government requests policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'government_requests' AND policyname = 'Users can manage their own requests') THEN
        CREATE POLICY "Users can manage their own requests" ON public.government_requests
            FOR ALL USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
    END IF;
END $$;

-- Government services policies (public read access)
DO $$
BEGIN  
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'government_services' AND policyname = 'Anyone can view government services') THEN
        CREATE POLICY "Anyone can view government services" ON public.government_services
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Message campaigns policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'message_campaigns' AND policyname = 'Users can manage their own campaigns') THEN
        CREATE POLICY "Users can manage their own campaigns" ON public.message_campaigns
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Contacts policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can manage their own contacts') THEN
        CREATE POLICY "Users can manage their own contacts" ON public.contacts
            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Fix search path for the update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;