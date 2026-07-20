import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  try {
    const { data, error } = await supabase.from('games').select('*');
    
    if (error) {
      console.error('Connection Error:', error.message);
    } else {
      console.log('--- Success! ---');
      console.log('Connected to:', process.env.SUPABASE_URL);
      console.log('Found', data.length, 'rows in the "games" table.');
    }
  } catch (err) {
    console.error('Runtime Error:', err);
  }
}

check();