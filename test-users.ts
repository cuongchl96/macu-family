import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feyrqdzjrdvzxqydypsq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleXJxZHpqcmR2enhxeWR5cHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQ0MzIsImV4cCI6MjA4ODU1MDQzMn0.eIC8tl5yKeN1snUpmOf_gnyICZwa4nUSGmC79xi2Ndk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase.from('wealth_users').select('*');
  console.log('USERS:', data);
  if (data && data.length > 0) {
    // try Auth with that email? we don't know the password
  }
}

checkUsers();
