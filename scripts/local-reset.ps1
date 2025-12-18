Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " SD System - LOCAL Supabase Full Reset" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "WARNING: This will DESTROY ALL LOCAL Supabase data." -ForegroundColor Yellow
Write-Host "Cloud Supabase is NOT affected." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type RESET to continue"
if ($confirm -ne "RESET") {
    Write-Host "Aborted." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Stopping local Supabase..." -ForegroundColor Cyan
supabase stop

Write-Host ""
Write-Host "Removing local Supabase Docker volumes..." -ForegroundColor Cyan
docker volume rm `
    supabase_db_SD_System `
    supabase_storage_SD_System `
    supabase_realtime_SD_System `
    supabase_auth_SD_System `
    supabase_functions_SD_System `
    -f 2>$null

Write-Host ""
Write-Host "Starting local Supabase..." -ForegroundColor Cyan
supabase start

Write-Host ""
Write-Host "Resetting database (migrations + seed)..." -ForegroundColor Cyan
supabase db reset

Write-Host ""
Write-Host "Restarting PostgREST to refresh RPC cache..." -ForegroundColor Cyan
docker restart supabase_rest_SD_System | Out-Null

Write-Host ""
Write-Host "LOCAL RESET COMPLETE" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS (1-2 minutes total):" -ForegroundColor Cyan
Write-Host ""

Write-Host "1) Create ONE local auth user:" -ForegroundColor White
Write-Host "   Studio: http://127.0.0.1:54323" -ForegroundColor Gray
Write-Host "   Auth -> Users -> Add user (email/password)" -ForegroundColor Gray
Write-Host ""

Write-Host "2) Copy the user UUID and run this SQL:" -ForegroundColor White
Write-Host ""
Write-Host "insert into public.practice_users (user_id, practice_id)" -ForegroundColor DarkGray
Write-Host "values ('<AUTH_USER_ID>', '11111111-1111-1111-1111-111111111111')" -ForegroundColor DarkGray
Write-Host "on conflict do nothing;" -ForegroundColor DarkGray
Write-Host ""

Write-Host "3) Test slots endpoint:" -ForegroundColor White
Write-Host ""
Write-Host "GET /functions/v1/admin-api/public/slots" -ForegroundColor DarkGray
Write-Host "?zip=33139^&date=2025-12-23^&slot_minutes=30" -ForegroundColor DarkGray
Write-Host "Header: x-sd-website-key = dev-test-key-123" -ForegroundColor DarkGray
Write-Host ""

Write-Host "You are back to a known-good local system." -ForegroundColor Green
Write-Host ""
