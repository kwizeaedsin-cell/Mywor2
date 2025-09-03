-- Enhanced Government Services Platform with Role-Based System

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('client', 'admin', 'agent');

-- Create user roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- Create request assignments table
CREATE TABLE IF NOT EXISTS public.request_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.government_requests(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    agent_id UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create request status history table
CREATE TABLE IF NOT EXISTS public.request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.government_requests(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table for real-time updates
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    related_request_id UUID REFERENCES public.government_requests(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent task completion proofs table
CREATE TABLE IF NOT EXISTS public.task_completion_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.request_assignments(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES auth.users(id) NOT NULL,
    proof_type TEXT NOT NULL CHECK (proof_type IN ('document', 'photo', 'note', 'signature')),
    file_path TEXT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completion_proofs ENABLE ROW LEVEL SECURITY;

-- Update government_requests table with additional fields
ALTER TABLE public.government_requests 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS estimated_completion_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS requirements_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT role::text FROM public.user_roles 
    WHERE user_id = user_uuid AND is_active = true 
    LIMIT 1;
$$;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_uuid 
        AND role = required_role::user_role 
        AND is_active = true
    );
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
    FOR ALL 
    USING (public.user_has_role(auth.uid(), 'admin'))
    WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT 
    USING (user_id = auth.uid());

-- RLS Policies for request_assignments
CREATE POLICY "Admins can manage all assignments" ON public.request_assignments
    FOR ALL 
    USING (public.user_has_role(auth.uid(), 'admin'))
    WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view their own assignments" ON public.request_assignments
    FOR SELECT 
    USING (agent_id = auth.uid() AND public.user_has_role(auth.uid(), 'agent'));

CREATE POLICY "Agents can update their assignment status" ON public.request_assignments
    FOR UPDATE 
    USING (agent_id = auth.uid() AND public.user_has_role(auth.uid(), 'agent'))
    WITH CHECK (agent_id = auth.uid() AND public.user_has_role(auth.uid(), 'agent'));

-- RLS Policies for request_status_history
CREATE POLICY "Admins can view all status history" ON public.request_status_history
    FOR SELECT 
    USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their request history" ON public.request_status_history
    FOR SELECT 
    USING (
        public.user_has_role(auth.uid(), 'client') AND 
        request_id IN (
            SELECT id FROM public.government_requests WHERE client_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create status history" ON public.request_status_history
    FOR INSERT 
    WITH CHECK (changed_by = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for task_completion_proofs
CREATE POLICY "Agents can manage their own completion proofs" ON public.task_completion_proofs
    FOR ALL 
    USING (agent_id = auth.uid() AND public.user_has_role(auth.uid(), 'agent'))
    WITH CHECK (agent_id = auth.uid() AND public.user_has_role(auth.uid(), 'agent'));

CREATE POLICY "Admins can view all completion proofs" ON public.task_completion_proofs
    FOR SELECT 
    USING (public.user_has_role(auth.uid(), 'admin'));

-- Enhanced RLS policies for government_requests (role-based access)
DROP POLICY IF EXISTS "Users can manage their own requests" ON public.government_requests;

CREATE POLICY "Clients can manage their own requests" ON public.government_requests
    FOR ALL 
    USING (client_id = auth.uid() AND public.user_has_role(auth.uid(), 'client'))
    WITH CHECK (client_id = auth.uid() AND public.user_has_role(auth.uid(), 'client'));

CREATE POLICY "Admins can manage all requests" ON public.government_requests
    FOR ALL 
    USING (public.user_has_role(auth.uid(), 'admin'))
    WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view assigned requests without client details" ON public.government_requests
    FOR SELECT 
    USING (
        public.user_has_role(auth.uid(), 'agent') AND 
        id IN (
            SELECT request_id FROM public.request_assignments 
            WHERE agent_id = auth.uid()
        )
    );

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'info',
    request_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, title, message, type, related_request_id
    ) VALUES (
        target_user_id, notification_title, notification_message, 
        notification_type, request_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Function to assign request to agent
CREATE OR REPLACE FUNCTION public.assign_request_to_agent(
    request_uuid UUID,
    admin_uuid UUID,
    agent_uuid UUID,
    assignment_notes TEXT DEFAULT NULL,
    assignment_priority TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    assignment_id UUID;
    request_info RECORD;
BEGIN
    -- Verify admin has permission
    IF NOT public.user_has_role(admin_uuid, 'admin') THEN
        RAISE EXCEPTION 'Only admins can assign requests';
    END IF;
    
    -- Get request info
    SELECT * INTO request_info FROM public.government_requests WHERE id = request_uuid;
    
    -- Create assignment
    INSERT INTO public.request_assignments (
        request_id, admin_id, agent_id, notes, priority
    ) VALUES (
        request_uuid, admin_uuid, agent_uuid, assignment_notes, assignment_priority
    ) RETURNING id INTO assignment_id;
    
    -- Update request status
    UPDATE public.government_requests 
    SET 
        status = 'processing',
        assigned_agent_id = agent_uuid 
    WHERE id = request_uuid;
    
    -- Create status history
    INSERT INTO public.request_status_history (
        request_id, old_status, new_status, changed_by, change_reason
    ) VALUES (
        request_uuid, request_info.status, 'processing', admin_uuid, 'Assigned to agent'
    );
    
    -- Notify agent
    PERFORM public.create_notification(
        agent_uuid,
        'New Task Assigned',
        'You have been assigned a new government service task',
        'info',
        request_uuid
    );
    
    RETURN assignment_id;
END;
$$;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_request_assignments_agent_id ON public.request_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_request_assignments_request_id ON public.request_assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_government_requests_status ON public.government_requests(status);
CREATE INDEX IF NOT EXISTS idx_government_requests_assigned_agent ON public.government_requests(assigned_agent_id);