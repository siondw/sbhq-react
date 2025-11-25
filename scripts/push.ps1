param(
  [string]$Message,
  [switch]$AllowMain
)

$branch = (git rev-parse --abbrev-ref HEAD).Trim()

if (-not $branch -or $branch -eq "HEAD") {
  Write-Host "Could not determine current branch. Are you in a git repo?" -ForegroundColor Red
  exit 1
}

if (($branch -eq "main" -or $branch -eq "master") -and -not $AllowMain) {
  Write-Host "You're on '$branch'. Refusing to push from here without -AllowMain." -ForegroundColor Yellow
  Write-Host "Hint: create a feature branch first, e.g.:"
  Write-Host "  pwsh ./scripts/feature.ps1 -Name 'ts migration'"
  exit 1
}

if (-not $Message) {
  $Message = Read-Host "Commit message"
}

if (-not $Message) {
  Write-Host "Commit message is required." -ForegroundColor Red
  exit 1
}

Write-Host "=== SBHQ: Preparing to commit on '$branch' ==="
git status

Write-Host ""
Write-Host "Add ALL changes and commit with message:" -NoNewline
Write-Host " '$Message'" -ForegroundColor Cyan
$confirm = Read-Host "Continue? (y/N)"

if ($confirm.ToLower() -ne "y") {
  Write-Host "Aborted." -ForegroundColor Yellow
  exit 0
}

git add -A
if ($LASTEXITCODE -ne 0) {
  Write-Host "git add failed." -ForegroundColor Red
  exit $LASTEXITCODE
}

git commit -m "$Message"
$commitExit = $LASTEXITCODE

if ($commitExit -ne 0) {
  Write-Host "git commit returned non-zero (maybe nothing to commit)." -ForegroundColor Yellow
  Write-Host "Continuing to push branch anyway..."
}

Write-Host "Pushing to origin/$branch (with -u to set upstream)..."
git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "git push failed." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "✅ Pushed branch '$branch' to origin and set upstream." -ForegroundColor Green
