# ArgOS Universal Stage-Based LifeOS Template Spec
**Schema Version:** 1.0.0-BETA  
**Standard Compliance:** IArgOSCapability v2  

This specification defines the universal schema layout for creating dynamic stage-based life-calibration niches. The engine matches user parameters and diagnostic points to dynamically build 30-day, 60-day, and 90-day execution blocks.

---

## 1. Concrete JSON/TypeScript Definition Schema (IUnifiedNiche)

A standard LifeOS niche template must implement the following TypeScript schema:

```typescript
export interface OnboardingOption {
  label: string;    // Human-readable option
  points: number;   // Calculated weight (1-4 points)
}

export interface OnboardingQuestion {
  id: string;       // Unique question key
  question: string; // The query prompted to user
  options: OnboardingOption[]; // Choices
}

export interface Stage {
  id: number;       // Stage index (1 = Fragile, 2 = Stable, 3 = Compounding, 4 = Sovereign)
  name: string;     // Stage Name
  description: string; // Dynamic clinical assessment
}

export interface Task {
  task: string;     // Simple, direct action instructions
  time: string;     // Weekly hours/minutes required
  complexity: 'Easy' | 'Medium' | 'Hard';
  why: string;      // Rationale justifying necessity
  details: string;  // Detailed action execution steps 
  courtesyTip?: string; // Opt-in monetization link or affiliate pointer (e.g. high-yield savings, fit tools)
}

export interface MonthPlan {
  title: string;    // Month focus title (e.g., "Build Defensive Liquidity")
  tasks: Task[];    // Step-by-step checklists
}

export interface PathwayLevel {
  name: string;     // Tier Name
  description: string; // Technical scope
  details: string;  // Detailed execution path
  courtesyTip?: string; // Associated affiliate sponsor
}

export interface Pathway {
  name: string;     // Pathway focus area (e.g., "Equity Ventures", "Metabolic Redesign")
  summary: string;  // Visual overview of goals
  levels: PathwayLevel[]; // Upgradable progression tiers
}

export interface NicheDefinition {
  id: string;       // Unique niche locator (e.g., 'financial-security')
  name: string;     // Name
  icon: string;     // Icon selector (e.g. 'DollarSign', 'Heart', 'Briefcase')
  outcome: string;  // Primary sovereign outcome statement
  onboardingQuestions: OnboardingQuestion[];
  stages: Stage[];
  plans: {
    month1: MonthPlan;
    month2: MonthPlan;
    month3: MonthPlan;
  };
  pathways: Pathway[];
}
```

---

## 2. Standard YAML Format (Reference Parser Blueprint)

For terminal operations or scripting servers, niches are loaded from local file directories using standard YAML blueprints:

```yaml
niche: "Financial Security"
domain_id: "financial-security"
icon_type: "DollarSign"
core_outcome: "Financial security and defensive liquidity buffers."

stages:
  - id: 1
    name: "Fragile Base"
    description: "Zero liquid safety net. Vulnerable to structural emergencies."
  - id: 2
    name: "Stable Base"
    description: "Consistent 1-3 month buffer. Core debt loops isolated."
  - id: 3
    name: "Compounding Base"
    description: "4-6 month capital reserve. Consistent yield expansion."
  - id: 4
    name: "Sovereign Base"
    description: "Passive yield covers baseline outlays. 100% decoupling."

onboarding_questions:
  - id: "income_stability"
    question: "How predictable is your primary incoming yield stream?"
    options:
      - label: "Predetermined & reliable (salary/structured contract)"
        points: 4
      - label: "Moderate volatility (commissions, freelancers, active shop)"
        points: 2
      - label: "Highly sporadic (low predictability, gig-work basis)"
        points: 1

plans:
  month1:
    title: "Isolate Metabolic Leakages"
    tasks:
      - task: "Conduct 7-Day Outlay Track audit."
        time: "15 min/day"
        complexity: "Easy"
        why: "Precision measurement prevents downstream drift."
        details: "Write down every outbound currency transaction inside a simple local ledger."
        courtesyTip: "Partner recommendation: Try Monarch or YNAB (Self-directed)."
  month2:
    title: "Construct Liquidity Wedge"
    tasks:
      - task: "Set up auto-savings transaction protocol."
        time: "20 min"
        complexity: "Medium"
        why: "Automated routing overrides cognitive resistance."
        details: "Interface with your personal banking system and automate routing of 5% net value."
  month3:
    title: "Verify Core Resilience"
    tasks:
      - task: "Achieve $1,000 metabolic buffer checkpoint."
        time: "Ongoing"
        complexity: "Medium"
        why: "Protects credit indicators against emergency scenarios."
        details: "Accumulate cash in your separate isolated HISA container. Minimize unnecessary spending."
```
