# ArgOS // LifeOS Calibration Engine (Branch LO-0.9)
**Status:** ACTIVE BRANCH  
**Integration Status:** Coupled to LocalStorage State Systems  
**Master Source Core Match:** ArgOS Evolution v2.0.0-FINAL  

This README outlines the high-fidelity template architecture, folder layouts, and git branching procedures used to stack the niche-agnostic LifeOS engine securely on top of your frozen **ArgOS** platform.

---

## 1. High-Level Git Branching & Merging Strategy

To keep the master core of ArgOS perfectly frozen (`FROZEN / MAIN SOURCE` v2.0) while experimenting, we maintain the code on a dedicated branch named `ArgOS-LifeEngine`.

### Create and Track the Branch
```bash
# 1. Access your local repo and verify tag baseline
git checkout master
git tag v6.2-frozen

# 2. Branch off into the LifeOS ecosystem sandbox
git checkout -b ArgOS-LifeEngine

# 3. Commit features modularly without affecting master stability
git add lifeengine/ src/components/niche/
git commit -m "feat: Integrate dynamic LifeOS calibration engine and Specialist AI Coach"
git push origin ArgOS-LifeEngine
```

---

## 2. Dynamic Platform Architecture Details

The structure is broken down into clean, decoupled, single-responsibility modules:

### 2.1 Schema Definition Layer (`/src/data/niches.ts`)
- Serves as the central directory for all life niches.
- Holds exact JSON declarations, questions, options, point weights, 90-day action items, and partner recommendations for active domains:
  1. **Financial Security** (Income stabilization & liquidation)
  2. **Fitness & Health** (Body composition & metabolic buffers)
  3. **Career & Skills** (Value proposition & vocational scale)

### 2.2 React Core Viewport (`/src/components/niche/LifeOSEngine.tsx`)
- **Diagnostic Panel:** Prompts questions one-by-one. Accumulates points to calculate user stages deterministically.
- **90-Day Tracker:** Renders month-by-month plans, keeping score of progress bars in real-time.
- **Pathways Index:** Displays vertical upgrade trees for the domain.
- **Advisor Sandbox:** An interactive coaching simulator powered directly by server-side `GoogleGenAI` prompts to answer domain questions based on user stage variables.

### 2.3 Shared Persistent Storage Logic
Your indicators are persistent, offline-first, and completely local. The data stores are mapped using key-value hashes inside the client browser’s `localStorage`:

| Key Name | Core Content Structure | Focus Area |
| :--- | :--- | :--- |
| `argos_lifeos_onboarding` | `Record<nicheId, boolean>` | Identifies if diagnostics have run |
| `argos_lifeos_stages` | `Record<nicheId, stageNumber>` | Calculated Stage index (1 - 4) |
| `argos_lifeos_answers` | `Record<nicheId, Record<questionId, points>>` | Individual answers to trace inputs |
| `argos_lifeos_tasks` | `Record<uniqueTaskKey, boolean>` | 90-day checkbox status indices |
| `argos_lifeos_params` | `Record<nicheId, UserCustomParams>` | Income budget, hours/wk, constraints |

---

## 3. Back-End SQLite Database Strategy (For Advanced Deployment)

If you migrate the local-storage model to a persistent SQLite back-end system within ArgOS, use this structured database schema:

```sql
-- Represents the central user diagnostics records
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY DEFAULT 'local_operator',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Active niche settings and user metrics
CREATE TABLE IF NOT EXISTS niche_profiles (
    niche_id TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'local_operator',
    calculated_stage INTEGER DEFAULT 1,
    primary_metric TEXT, -- E.g. $4,500/mo or 185 lbs
    target_metric TEXT,  -- E.g. $12,000/mo or 165 lbs
    weekly_hours INTEGER DEFAULT 6,
    custom_constraints TEXT,
    completed_onboarding INTEGER DEFAULT 0, -- Boolean (0 or 1)
    PRIMARY KEY (niche_id, user_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

-- Selected option scoring records for diagnostic tracing
CREATE TABLE IF NOT EXISTS onboarding_answers (
    niche_id TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'local_operator',
    question_id TEXT NOT NULL,
    point_value INTEGER DEFAULT 0,
    PRIMARY KEY (niche_id, question_id, user_id),
    FOREIGN KEY (niche_id, user_id) REFERENCES niche_profiles(niche_id, user_id) ON DELETE CASCADE
);

-- Months progress checklists
CREATE TABLE IF NOT EXISTS task_checkboxes (
    niche_id TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'local_operator',
    task_key TEXT NOT NULL, -- E.g. 'month1-2'
    is_checked INTEGER DEFAULT 0, -- Boolean (0 or 1)
    PRIMARY KEY (niche_id, task_key, user_id),
    FOREIGN KEY (niche_id, user_id) REFERENCES niche_profiles(niche_id, user_id) ON DELETE CASCADE
);
```

---

## 4. Operational Commands inside Command Hall CLI

Type these commands directly inside the main **ArgOS Chatbot Terminal** (`Command Hall`) to inspect active indicators in real-time:

*   `/lifeos status` - Query client profile indices, active niches, and diagnostic stage levels.
*   `/lifeos diagnose [niche_id]` - Force recalibration workflow for a specified life domain.
*   `/lifeos info` - Display general package compliance details and active spec parameters.
*   `/lifeos reset` - Erase local-storage sandboxes and re-lock state variables.
