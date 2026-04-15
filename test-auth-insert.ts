import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feyrqdzjrdvzxqydypsq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleXJxZHpqcmR2enhxeWR5cHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQ0MzIsImV4cCI6MjA4ODU1MDQzMn0.eIC8tl5yKeN1snUpmOf_gnyICZwa4nUSGmC79xi2Ndk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertAuth() {
  // Try to sign in or sign up a test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });

  if (authError) {
    console.log('User not found, signing up...');
    await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    if (signInErr) {
      console.error('Sign in failed', signInErr);
      return;
    }
  }

  console.log('Auth success:', (await supabase.auth.getSession()).data.session?.user.id);

  const newId = crypto.randomUUID();
  const { data, error } = await supabase.from('gold_holdings').insert([{
    id: newId,
    taels: 2.0,
    purchase_price: 88000000,
    current_price: 89000000,
    purchase_date: new Date().toISOString().split('T')[0],
    owner: 'joint'
  }]);

  if (error) {
    console.error('INSERT ERROR:', error);
  } else {
    console.log('INSERT SUCCESS. Now selecting...');
    const { data: selData, error: selErr } = await supabase.from('gold_holdings').select('*').eq('id', newId);
    console.log('SELECT RESULT:', selData, selErr);
  }
}

testInsertAuth();
