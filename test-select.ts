import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feyrqdzjrdvzxqydypsq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleXJxZHpqcmR2enhxeWR5cHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQ0MzIsImV4cCI6MjA4ODU1MDQzMn0.eIC8tl5yKeN1snUpmOf_gnyICZwa4nUSGmC79xi2Ndk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase.from('gold_holdings').select('*');
  console.log('ALL GOLD HOLDINGS:', data);
  console.log('ERROR:', error);
}

testQuery();
