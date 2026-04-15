import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feyrqdzjrdvzxqydypsq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleXJxZHpqcmR2enhxeWR5cHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQ0MzIsImV4cCI6MjA4ODU1MDQzMn0.eIC8tl5yKeN1snUpmOf_gnyICZwa4nUSGmC79xi2Ndk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
  const newId = crypto.randomUUID();
  const { error } = await supabase.from('gold_holdings').insert([{
    id: newId,
    taels: 1.5,
    purchase_price: 85000000,
    current_price: 86000000,
    purchase_date: new Date().toISOString().split('T')[0],
    owner: 'invalid_owner' // Purposely invalid to see if it triggers an error
  }]);
  console.log('Error with invalid owner:', error);

  const { error: err2 } = await supabase.from('gold_holdings').insert([{
    id: newId,
    taels: 1.5,
    purchase_price: 85000000,
    current_price: 86000000,
    purchase_date: new Date().toISOString().split('T')[0],
    owner: 'joint' // Valid
  }]);
  console.log('Error with valid owner:', err2);
}

probe();
