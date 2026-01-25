// Node.js script to run the SQL migration via Supabase
// Run with: node run-migration.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ ERROR: Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure these are set in .env.local');
  process.exit(1);
}

console.log('✓ Found Supabase configuration');
console.log(`  URL: ${supabaseUrl}`);
console.log('');

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = `
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS creator_controls_unlocked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_creator_controls_unlocked ON users(creator_controls_unlocked);

COMMENT ON COLUMN users.creator_controls_unlocked IS 'Whether this user has unlocked creator controls with the code';
`;

async function runMigration() {
  console.log('Running SQL migration...');
  console.log('');
  
  try {
    // Use Supabase Management API or direct SQL execution
    // Note: Supabase JS client doesn't support direct SQL execution
    // We need to use the REST API or Supabase CLI
    
    // Try using the REST API endpoint for SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    console.log('✓ Migration completed successfully!');
    console.log('');
    console.log('You can now use Creator Controls after logging in and entering code: maker15');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('='.repeat(60));
    console.log('Please run this SQL manually in Supabase SQL Editor:');
    console.log('='.repeat(60));
    console.log('');
    console.log(sql);
    console.log('');
    console.log('Steps:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in left sidebar');
    console.log('4. Click "New query"');
    console.log('5. Paste the SQL above');
    console.log('6. Click "Run" (or press Ctrl+Enter)');
    process.exit(1);
  }
}

runMigration();
