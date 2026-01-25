# PowerShell script to automatically add creator_controls_unlocked column
# This uses Supabase REST API to run the SQL migration

Write-Host "=== Creator Controls Migration ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in .env.local" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $serviceRoleKey) {
    Write-Host "ERROR: Missing environment variables!" -ForegroundColor Red
    Write-Host "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found Supabase configuration" -ForegroundColor Green
Write-Host "  URL: $supabaseUrl" -ForegroundColor Gray
Write-Host ""

# SQL to execute
$sql = @"
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS creator_controls_unlocked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_creator_controls_unlocked ON users(creator_controls_unlocked);

COMMENT ON COLUMN users.creator_controls_unlocked IS 'Whether this user has unlocked creator controls with the code';
"@

Write-Host "Running SQL migration..." -ForegroundColor Yellow

# Use Supabase REST API to execute SQL
$headers = @{
    "apikey" = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sql
} | ConvertTo-Json

try {
    # Try using the Supabase REST API (PostgREST)
    # Note: This might not work directly, so we'll also provide a Node.js alternative
    
    Write-Host "Attempting to run SQL via Supabase API..." -ForegroundColor Yellow
    
    # Alternative: Use Node.js script if PowerShell direct API doesn't work
    Write-Host ""
    Write-Host "Since direct SQL execution via API is complex, let's use a Node.js script instead..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create a temporary Node.js script
    $nodeScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = \`
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS creator_controls_unlocked BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_creator_controls_unlocked ON users(creator_controls_unlocked);

COMMENT ON COLUMN users.creator_controls_unlocked IS 'Whether this user has unlocked creator controls with the code';
\`;

async function runMigration() {
  console.log('Running SQL migration...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try direct query (this won't work, but shows the SQL)
      console.log('Note: Direct SQL execution via client is not available.');
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('');
      console.log(sql);
      console.log('');
      console.log('Or use Supabase CLI: supabase db execute --file add_creator_controls_unlocked.sql');
      process.exit(1);
    }
    
    console.log('✓ Migration completed successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    console.log('');
    console.log('Please run this SQL manually in Supabase SQL Editor:');
    console.log('');
    console.log(sql);
    process.exit(1);
  }
}

runMigration();
"@

    $nodeScriptPath = "temp_migration.js"
    $nodeScript | Out-File -FilePath $nodeScriptPath -Encoding UTF8
    
    Write-Host "Created Node.js migration script..." -ForegroundColor Green
    
    # Check if Node.js is available
    $nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeAvailable) {
        Write-Host "Running Node.js migration script..." -ForegroundColor Yellow
        node $nodeScriptPath
        $exitCode = $LASTEXITCODE
        
        # Clean up
        Remove-Item $nodeScriptPath -ErrorAction SilentlyContinue
        
        if ($exitCode -eq 0) {
            Write-Host ""
            Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
            exit 0
        }
    } else {
        Write-Host "Node.js not found. Showing SQL to run manually..." -ForegroundColor Yellow
    }
    
    # If we get here, show the SQL to run manually
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "Please run this SQL in Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
    Write-Host $sql -ForegroundColor White
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Click 'SQL Editor' in left sidebar" -ForegroundColor White
    Write-Host "4. Click 'New query'" -ForegroundColor White
    Write-Host "5. Paste the SQL above" -ForegroundColor White
    Write-Host "6. Click 'Run' (or press Ctrl+Enter)" -ForegroundColor White
    Write-Host ""
    
    # Clean up
    Remove-Item $nodeScriptPath -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the SQL manually in Supabase SQL Editor (see instructions above)" -ForegroundColor Yellow
    exit 1
}
