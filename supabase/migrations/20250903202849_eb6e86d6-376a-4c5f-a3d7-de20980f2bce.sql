-- Clean up database to make Government Services a standalone product
-- Remove all non-government related tables

-- Drop messaging service tables
DROP TABLE IF EXISTS message_campaigns CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;  
DROP TABLE IF EXISTS scheduled_messages CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Drop business service tables
DROP TABLE IF EXISTS business_ideas CASCADE;
DROP TABLE IF EXISTS business_idea_purchases CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS activities CASCADE;

-- Keep only government service related tables:
-- - profiles (user management)
-- - user_roles (role management)
-- - government_services (available services)
-- - government_requests (client requests)
-- - request_assignments (admin-agent assignments)
-- - request_status_history (tracking)
-- - notifications (system notifications)
-- - document_uploads (file management)
-- - task_completion_proofs (agent proof uploads)
-- - agent_profiles (agent details)
-- - agent_payouts (agent payments)

-- Update profiles table to be government-focused
ALTER TABLE profiles 
DROP COLUMN IF EXISTS subscription_plan;

-- Add government-specific fields to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'national_id') THEN
        ALTER TABLE profiles ADD COLUMN national_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;
END $$;