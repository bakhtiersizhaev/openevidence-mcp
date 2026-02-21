$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $RepoRoot

npm install
npx playwright install chromium
npm run build

Write-Host "Setup complete."
Write-Host "Next: npm run login"

