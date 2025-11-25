# SBHQ TypeScript Migration Progress

- **Branch:** `feature/phase4-ts-migration` (build passes with `DISABLE_ESLINT_PLUGIN=true`)
- **Phase 2 – Tooling setup:** ✅ (TS config, ESLint/Prettier, scripts)
- **Phase 3 – Types + utils:** ✅ (`src/types/sbhq.ts`, `src/utils/realtime.ts`)
- **Phase 4 – App migration:** 🚧 in progress
  - Converted infra/contexts and game/auth/admin screens to TSX
  - Added global shims (`src/types/global.d.ts`, `react-app-env.d.ts`)
  - Admin components still `@ts-nocheck` (TODO: type and remove)
  - Build: `npm run build` succeeds (CRA eslint disabled during build)
  - Pending cleanup: re-enable ESLint in build (resolve CRA/@typescript-eslint crashes), remove `any` casts and console logs, fix hooks deps warnings

## Next Steps
1) Type admin components to drop `@ts-nocheck`.
2) Resolve ESLint rule crashes and re-enable lint in build; address existing lint warnings.
3) Merge `feature/phase4-ts-migration` into `develop` and delete branch.
