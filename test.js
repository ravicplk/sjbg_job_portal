const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data, error } = await supabase.from('applications').select('id, status, applied_at, cover_note, seeker_profiles(id, user_id, headline, location, phone, linkedin_url, resume_url, users(first_name, last_name, email))');
  console.log('Error:', error);
  console.dir(data, { depth: null });
  
  // also check the users table directly
  const { data: usersData } = await supabase.from('users').select('*');
  console.log('Users:');
  console.dir(usersData, { depth: null });
})();
