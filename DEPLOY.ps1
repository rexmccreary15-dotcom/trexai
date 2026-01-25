# Copy and paste this ENTIRE block into PowerShell whenever you make updates:

cd "c:\Users\Rexan\.cursor\cursor app"; git add .; git status; git commit -m "Updates" 2>&1 | Out-Null; Write-Host "`nDeploying to Vercel...`n" -ForegroundColor Yellow; vercel --prod; Write-Host "`nDone. Wait 1-2 min then refresh your site (Ctrl+F5).`n" -ForegroundColor Green
