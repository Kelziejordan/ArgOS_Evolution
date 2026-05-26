# Trading Engine Module

This folder is dedicated purely to domain-specific trading signal generators, exchange connectors, configs, and trades logging. All live trading execution, strategy tuning, and paper-trading integrations reside here.

## 🗂️ Internal Structure
- `/trading-engine/strategies/` - Custom indicators, signal generators, or ML predictors.
- `/trading-engine/connectors/`  - Exchange API orchestrators (e.g. Kraken live connection).
- `/trading-engine/logs/`        - Trade journal files and execution audit trails.
- `/trading-engine/configs/`     - Parameters for strategies (RSI trigger values, stop losses).

## 🚀 Transitioning to Live
This section is cleanly separated from the core spinal cord (`/server/nervous-system/` and `/server/runtime/`) so that updating strategies or adding exchange protocols never breaks central state persistence.
