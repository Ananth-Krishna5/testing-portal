$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

Write-Host "Starting Testing Portal (server + client)..." -ForegroundColor Cyan
npm run dev
