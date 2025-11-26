param(
  [string]$Branch
)

if (-not $Branch) {
  $Branch = git rev-parse --abbrev-ref HEAD
}

Write-Host "=== SBHQ: Syncing '$Branch' with 'main' ==="

git fetch origin

git checkout main
git pull origin main

git checkout $Branch
git merge main

if ($LASTEXITCODE -eq 0) {
  Write-Host "Branch '$Branch' is now up to date with 'main'." -ForegroundColor Green
} else {
  Write-Host "Merge had conflicts. Resolve and commit manually." -ForegroundColor Yellow
}
