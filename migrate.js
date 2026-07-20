import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 1. Setup connections
const localDb = new Database('leafs_tracker.db');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function migrate() {
  // 2. Fetch all rows from your local SQLite table
  // Make sure 'games' matches your table name in your .db file
  const localGames = localDb.prepare('SELECT * FROM games').all();
  console.log(`Found ${localGames.length} games in local DB. Starting migration...`);

  // 3. Upload to Supabase
  const { data, error } = await supabase.from('games').insert(localGames);

  if (error) {
    console.error('Migration failed:', error.message);
  } else {
    console.log('Migration successful! Data is now in the cloud.');
  }
}

migrate();