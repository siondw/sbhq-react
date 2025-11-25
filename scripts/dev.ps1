param(
  [switch]$ClearCache
)

Write-Host "=== SBHQ: Starting dev server ==="

if ($ClearCache) {
  Write-Host "Clearing node_modules\.cache..."
  if (Test-Path ".\node_modules\.cache") {
    Remove-Item ".\node_modules\.cache" -Recurse -Force
  }
}

if (-not (Test-Path ".env.local")) {
  Write-Host "WARNING: .env.local not found. Copying from .env.local.example if present..."
  if (Test-Path ".env.local.example") {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "Created .env.local from .env.local.example"
  } else {
    Write-Host "No .env.local.example found. Make sure env vars are set."
  }
}

npm run dev
