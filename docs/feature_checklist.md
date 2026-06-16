# Alchemist's Crucible Feature Checklist

## Offline / Local Mode Support
- `[x]` Extract direct apiFetch backend calls from App.tsx into separate client service files
- `[x]` Implement client-side `LocalAuthService` for apprentice session mock and local stats caching
- `[x]` Implement client-side `LocalGameService` using local state engine mutation rules and localStorage
- `[x]` Set up index.ts proxy router to hot-swap online/offline services
- `[x]` Integrate Offline Mode toggle on Auth Screen and main dashboard header bar
- `[x]` Verify successful compilation and offline transmutation game loop execution

## Systemd Service and Deployment
- `[x]` Update `server.cjs` with dual-port production routing logic
- `[x]` Write Node.js utility to register game & achievements in Hub database
- `[x]` Create `deploy.sh` script to package, compile, and configure service
- `[x]` Run build, setup `/servers/alchemists-crucible`, and install dependencies
- `[x]` Enable and start `alchemists-crucible.service` on ports 19004 and 20004
- `[x]` Run DB registration to expose game on KBS Cloud Hub Storefront

