# run-all.ps1
# Orchestrates the full lifecycle of the Fake News Detection Engine

$ErrorActionPreference = "Stop"

Write-Host "--- 1. Starting SpacetimeDB Server ---" -ForegroundColor Cyan
# Start spacetime in the background. Note: this assumes the spacetime CLI is in your PATH.
Start-Process -FilePath "spacetime" -ArgumentList "start" -WindowStyle Minimized
Start-Sleep -Seconds 5 # Give it a moment to boot up

Set-Location -Path "fake-news-engine"

Write-Host "--- 2. Publishing Schema & Reducers ---" -ForegroundColor Cyan
spacetime publish fake-news-engine

Write-Host "--- 3. Generating Client Bindings ---" -ForegroundColor Cyan
spacetime generate --lang ts fake-news-engine --out-dir src/module_bindings -y

Write-Host "--- 4. Seeding System User (API_Agent) ---" -ForegroundColor Cyan
npx tsx scripts/seed_user.ts

Write-Host "--- 5. Ingesting Articles from NewsAPI.ai ---" -ForegroundColor Cyan
npx tsx scripts/ingest.ts

Write-Host "--- 6. Running NLP Analysis (Classification) ---" -ForegroundColor Cyan
npx tsx scripts/analyze.ts

Write-Host "--- 7. Launching Frontend Dashboard ---" -ForegroundColor Cyan
# Run the dev server. This will stay open.
npm run dev
