# Runtime Loop Sub-system

This folder handles loop ticking, execution protocols, and real-time state re-hydration. Its primary job is execution continuity under any server state change.

## 🗂️ Map
- `/runtime-loop/memory/`     - Core snap persistence, disk persistence, and replay.
- `/runtime-loop/execution/`  - Order placement engine and active trade managers.
- `/runtime-loop/automation/` - Pulse tick schedulers and timers.
