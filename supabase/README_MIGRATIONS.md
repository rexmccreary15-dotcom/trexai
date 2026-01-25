# Supabase Migrations

## What This Is

This folder contains version-controlled database migrations. Each SQL file represents a database change that can be applied to your Supabase project.

## Current Migrations

- `20250124000000_add_creator_controls_unlocked.sql` - Adds creator controls unlock status to users table

## How to Use

### Option 1: Manual (Current Method)
1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from the migration file
3. Paste and run it

### Option 2: Supabase CLI (Recommended for Future)
If you install Supabase CLI, you can run migrations automatically:

```powershell
# Install Supabase CLI first
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all pending migrations
supabase db push
```

### Option 3: GitHub Actions (Future Automation)
We can set up GitHub Actions to automatically run migrations when you push to GitHub.

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Example: `20250124000000_add_creator_controls_unlocked.sql`

This ensures migrations run in chronological order.

## Important Notes

- ✅ **This migration is already applied** - You ran it manually
- ✅ **Future migrations** - Just add new SQL files here and run them
- ✅ **Version controlled** - All migrations are tracked in GitHub
- ✅ **One-time setup** - Once a migration runs, it won't run again (uses `IF NOT EXISTS`)

## For Future Changes

When you need to add new database features:
1. Create a new migration file in this folder
2. Name it with timestamp + description
3. Use `IF NOT EXISTS` clauses to make it safe to re-run
4. Run it manually in Supabase Dashboard (or use CLI if set up)
