# SBHQ Dev Agent Notes

## Project References
- Product spec: see `Project-Specs.md` for app goals, flows, and admin dashboard expectations.
- Repo map: see `structure/project_structure_filtered.txt` for the current file/folder layout snapshot.

## PowerShell Scripts
PowerShell scripts live in `scripts/`. Run them from repo root with `pwsh`.

- Start dev server (optional cache clear): `pwsh ./scripts/dev.ps1 [-ClearCache]`
- Lint then typecheck: `pwsh ./scripts/check.ps1`
- Create feature branch from main: `pwsh ./scripts/feature.ps1 -Name "my feature"`
- Sync current (or provided) branch with main: `pwsh ./scripts/sync.ps1 [-Branch branch-name]`
- Commit and push (blocks on main unless -AllowMain): `pwsh ./scripts/push.ps1 -Message "chore: add scripts" [-AllowMain]`
