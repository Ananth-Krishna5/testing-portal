param()

$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

Write-Host "Starting Testing Portal locally (server + Vite client, hot reload)..." -ForegroundColor Cyan
Write-Host "  Requires PostgreSQL on DATABASE_URL (see server/.env)." -ForegroundColor DarkGray
Write-Host "  Redis optional: queue is off in development unless NODE_ENV=production or ENABLE_TEST_RUN_QUEUE=true." -ForegroundColor DarkGray
npm run dev
