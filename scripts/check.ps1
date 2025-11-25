Write-Host "=== SBHQ: Running lint + typecheck ==="

npm run lint
if ($LASTEXITCODE -ne 0) {
  Write-Host "Lint failed." -ForegroundColor Red
  exit $LASTEXITCODE
}

npm run typecheck
if ($LASTEXITCODE -ne 0) {
  Write-Host "Typecheck failed." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "All checks passed." -ForegroundColor Green
