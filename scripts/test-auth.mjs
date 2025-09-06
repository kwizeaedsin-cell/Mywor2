import { createClient } from '@supabase/supabase-js';

// Using the same values from src/integrations/supabase/client.ts
const SUPABASE_URL = "https://rrwxqdunhjxmzszspmol.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyd3hxZHVuaGp4bXpzenNwbW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NTIxNzksImV4cCI6MjA3MjQyODE3OX0.ompnzOPAE0outu7HY6kkveCWsPjHyCOz6l5yldPrSWQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false }
});

(async () => {
  try {
    const email = `test+${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log('Creating test user:', email);
    const signup = await supabase.auth.signUp({ email, password });
    console.log('signUp result:');
    console.log(JSON.stringify(signup, null, 2));

    console.log('\nAttempting sign in for the same user...');
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    console.log('signIn result:');
    console.log(JSON.stringify(signIn, null, 2));
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
