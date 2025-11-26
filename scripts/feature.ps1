param(
  [Parameter(Mandatory=$true)]
  [string]$Name
)

$sanitized = $Name.ToLower() -replace '[^a-z0-9\\-]+', '-'
$branch = "feature/$sanitized"

Write-Host "=== SBHQ: Creating feature branch '$branch' ==="

git fetch origin
git checkout main
git pull origin main
git checkout -b $branch
git push -u origin $branch

Write-Host "Created and switched to $branch"
