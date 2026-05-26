export interface OnboardingQuestion {
  id: string;
  question: string;
  options: { label: string; value: any; points: number }[];
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  criteria: string[];
  nextStageDescription: string;
}

export interface Task {
  task: string;
  time: string;
  complexity: 'Easy' | 'Medium' | 'Hard';
  why: string;
  details: string;
  courtesyTip?: string;
}

export interface MonthPlan {
  title: string;
  tasks: Task[];
}

export interface Pathway {
  name: string;
  summary: string;
  levels: {
    name: string;
    description: string;
    details: string;
    courtesyTip?: string;
  }[];
}

export interface NicheDefinition {
  id: string;
  name: string;
  icon: string;
  outcome: string;
  stages: Stage[];
  onboardingQuestions: OnboardingQuestion[];
  pathways: Pathway[];
  plans: {
    month1: MonthPlan;
    month2: MonthPlan;
    month3: MonthPlan;
  };
}

export const NICHES: NicheDefinition[] = [
  {
    id: "financial-security",
    name: "Financial Security",
    icon: "DollarSign",
    outcome: "Financial security and an absurd amount of money.",
    stages: [
      {
        id: 1,
        name: "Stage 1: Fragile",
        description: "No financial safety net. Living paycheck to paycheck with high high-interest debt.",
        criteria: [
          "Emergency fund contains less than 1 month of living expenses",
          "Credit card interest rates or other bad debts draining cash flow",
          "Income is unstable or highly concentrated on a single fragile source"
        ],
        nextStageDescription: "Establish a starter emergency fund and aggressively contain high-interest outflows."
      },
      {
        id: 2,
        name: "Stage 2: Stable Base",
        description: "Starter buffer established, debt is under control, lifestyle is stable but not yet secure.",
        criteria: [
          "1 to 3 months of basic living expenses saved in high-yield cash",
          "No high-interest revolving bad debts remaining",
          "Predictable passive awareness of weekly spend metrics"
        ],
        nextStageDescription: "Optimize high-yield savings to 6 months and initiate the asset compounding loop."
      },
      {
        id: 3,
        name: "Stage 3: Compounding",
        description: "Full safety buffer exists. Surplus income is actively redirected into productive assets.",
        criteria: [
          "6+ months of living cash safely parked in high interest instruments",
          "Automated percentage allocation into stable diversified investment indexes",
          "Secondary income stream or active side optimization initiated"
        ],
        nextStageDescription: "Scale parallel automated pipelines and shift focus to complete sovereignty."
      },
      {
        id: 4,
        name: "Stage 4: Sovereign",
        description: "Absolute control. Assets generate reliable cash flow or options exceeding basic lifestyle baseline costs.",
        criteria: [
          "Asset distributions cover basic metabolic baseline living budgets",
          "Multi-layered contingency accounts fully resistant to single errors",
          "Unbounded leverage options in professional and capital allocation"
        ],
        nextStageDescription: "Maintain high structural safety, optimize lifestyle quality, and expand philanthropic/venture interests."
      }
    ],
    onboardingQuestions: [
      {
        id: "savings",
        question: "How many months of essential living expenses do you currently hold in liquid cash?",
        options: [
          { label: "Less than 1 month (Fragile state)", value: "less_1", points: 1 },
          { label: "1 to 3 months (Baseline buffer)", value: "1_3", points: 2 },
          { label: "3 to 6 months (Semi-secure scale)", value: "3_6", points: 3 },
          { label: "6+ months (Fully shielded)", value: "more_6", points: 4 }
        ]
      },
      {
        id: "debt",
        question: "What is your current status with high-interest non-mortgage debts (e.g., credit cards)?",
        options: [
          { label: "Significant revolving balances dragging down cash flow daily", value: "high", points: 1 },
          { label: "Some minor balances, currently in active pay-down phase", value: "medium", points: 2 },
          { label: "Completely debt-free except for primary low-rate mortgage", value: "none", points: 4 }
        ]
      },
      {
        id: "income",
        question: "How would you describe the stability and diversity of your monthly income?",
        options: [
          { label: "Highly unstable or currently un-monetized", value: "unstable", points: 1 },
          { label: "Single reliable salary with no external safety valves", value: "single", points: 2 },
          { label: "Standard salary augmented by growing freelance or interest yields", value: "diversifying", points: 3 },
          { label: "Multiple decoupled income streams generating recurrent cash flow", value: "abundant", points: 4 }
        ]
      },
      {
        id: "tracking",
        question: "Do you have a deterministic mechanism for tracking and optimizing your weekly cash flows?",
        options: [
          { label: "No system; spending happens mostly of impulse or estimates", value: "none", points: 1 },
          { label: "Manual intermittent checks via bank apps of credit portals", value: "manual", points: 2 },
          { label: "Automated aggregation system reviewing exact weekly margins", value: "automated", points: 4 }
        ]
      }
    ],
    pathways: [
      {
        name: "Buffer Acceleration",
        summary: "Solidify emergency cash into high-yield instruments to immediately absorb life's shockwaves.",
        levels: [
          {
            name: "Level 1: The Starter Wedge",
            description: "Amass a strict $1,000 cash wedge to prevent returning to credit card reliance.",
            details: "Immediately separate this cash in an independent account. Do not bundle it with monthly spending pools.",
            courtesyTip: "Recommendation: Set up a high-interest savings account (HISA) yielding 4.5%+ to protect against core cash erosion."
          },
          {
            name: "Level 2: The Halfway Shield",
            description: "Grow the starter cash to cover 3 full months of bare metabolic survival costs.",
            details: "Calculate your bare metabolic spending: rent, utilities, basic nourishment. Multiply by 3. This cash acts as your ultimate sleep-easy index.",
            courtesyTip: "Automation tip: Schedule weekly recurring transfers of $25 on paydays to completely bypass spending friction."
          },
          {
            name: "Level 3: Universal Sovereignty Buffer",
            description: "Fortify cash to cover 6-12 months of standard lifestyle costs.",
            details: "Once achieved, this capital handles emergency transitions, employment changes, or market crashes without forcing you to liquidate long-term assets.",
            courtesyTip: "Asset suggestion: Explore safe cash-like Treasury yields to maximize compound returns while keeping liquidity pristine."
          }
        ]
      },
      {
        name: "Leveraged Expansion",
        summary: "Amplify your core earning potential by decoupling professional yields from strict hourly restraints.",
        levels: [
          {
            name: "Level 1: High-Income Skill Acquisition",
            description: "Dedicate 5 hours a week to master a digital skill with asymmetric market demand.",
            details: "Focus purely on skills with zero ceiling: system scripting, technical copywriting, conversion optimization, or architecture designs.",
            courtesyTip: "Resource: Review certified technical training pipelines to gain baseline operational authority quickly."
          },
          {
            name: "Level 2: The Fractional Consultant",
            description: "Package your newly acquired skills into high-ticket freelance retainers.",
            details: "Transition from billing by raw hours to bidding on clear outcomes. This multiplies your real hourly return by 3x-5x.",
            courtesyTip: "Platform tip: Position your services highlighting complete data sovereignty and speed of delivery."
          },
          {
            name: "Level 3: Automated Asset Infrastructure",
            description: "Turn your service expertise into repeatable digital products or system structures.",
            details: "Launch custom templates, software widgets, or recurring workflows that serve clients in parallel while you sleep.",
            courtesyTip: "Hosting Tip: Host on lightweight server setups to keep monthly maintenance overhead to zero."
          }
        ]
      }
    ],
    plans: {
      month1: {
        title: "Month 1: Structural Stabilization",
        tasks: [
          {
            task: "Conduct complete metabolic spend audit.",
            time: "2 hours",
            complexity: "Easy",
            why: "You cannot optimize what you fail to mathematically measure.",
            details: "Download your bank records from the last 30 days. Group them into bare survival (metabolic) versus luxury (expansion) outlays."
          },
          {
            task: "Deploy distinct high-yield buffer vault.",
            time: "1 hour",
            complexity: "Easy",
            why: "Intermingled funds get spent. Physical segregation prevents leakage.",
            details: "Set up a separate, zero-fee high-yield cash account with a different institution, completely decoupled from your primary credit line.",
            courtesyTip: "Partner suggestion: Use safe high-yield providers which offer real-time sub-vault categorization features."
          },
          {
            task: "Enact high-interest debt confinement protocol.",
            time: "3 hours",
            complexity: "Medium",
            why: "Revolving bad debt compounding at 20%+ is a critical health system error.",
            details: "List all outstanding card balances. Arrange them by snowball or avalanche. Choose one strategy and redirect all baseline surpluses to it."
          }
        ]
      },
      month2: {
        title: "Month 2: Earning & System Scaling",
        tasks: [
          {
            task: "Initiate micro-savers automated transfer.",
            time: "30 minutes",
            complexity: "Easy",
            why: "Habit automation outperforms discipline every single day.",
            details: "Configure a recurring transfer of 10% of every incoming payload directly into your buffer vault. Lock it out of sight."
          },
          {
            task: "Identify a high-leverage skill wedge.",
            time: "4 hours",
            complexity: "Medium",
            why: "Savings only goes so far; wealth requires increasing output capacity.",
            details: "Analyze current market trends. Dedicate 30 minutes a day to learning a tool (e.g. AI-grounding libraries, custom full-stack templates)."
          }
        ]
      },
      month3: {
        title: "Month 3: Compound & Diversify",
        tasks: [
          {
            task: "Launch an incremental side service.",
            time: "5 hours",
            complexity: "Hard",
            why: "Decoupling dependency from a single salary unlocks financial independence.",
            details: "Draft a simple one-page offer detailing a custom automation, template, or service. Reach out to three prospective digital operators.",
            courtesyTip: "Launch Resource: Utilize lightweight boilerplate builders to launch a professional dashboard in under 2 hours."
          },
          {
            task: "Review and establish the automated index loop.",
            time: "2 hours",
            complexity: "Medium",
            why: "Letting long-term surplus hold in standard cash dilutes purchasing power over time.",
            details: "Once the baseline buffer is fully secured, link a diversified index account. Automate $50/month allocations to yield broad market indexes."
          }
        ]
      }
    }
  },
  {
    id: "fitness-health",
    name: "Fitness & Health",
    icon: "Heart",
    outcome: "Consistent fitness, peak energy, and sustainable biological health.",
    stages: [
      {
        id: 1,
        name: "Stage 1: Inactive / Fragile",
        description: "Lacking structural health routines. Inconsistent nutrition, disrupted sleep patterns, and low physical readiness.",
        criteria: [
          "Zero deliberate physical activity or strength stress per week",
          "Highly processed, non-calculated nutritional intake causing energy swings",
          "Sleep index consistently under 6 hours with high daytime lethargy"
        ],
        nextStageDescription: "Stabilize basic movement patterns, clean metabolic hydration, and enforce sleep windows."
      },
      {
        id: 2,
        name: "Stage 2: Consistent Base",
        description: "Initial physical habits stabilized. Core movement patterns incorporated into weekly agenda.",
        criteria: [
          "2 to 3 structured physical sessions active per week",
          "Deliberate hydration and protein target monitoring",
          "7+ hours of anchored sleep with controlled bedtime rhythm"
        ],
        nextStageDescription: "Progress resistance loads safely and optimize macronutrient targets for performance."
      },
      {
        id: 3,
        name: "Stage 3: High Performance",
        description: "Optimized routine. Strength, cardiovascular capacity, and recovery are tracked and compounding.",
        criteria: [
          "4+ highly focused physical sessions weekly (balanced resistance + zone 2 cardio)",
          "Clean, calculated nutrition plans aligned with bodily recovery needs",
          "Consistent biomarkers indicating high autonomic nervous system recovery"
        ],
        nextStageDescription: "Refine elite conditioning schedules, advanced micro-recovery methods, and long-term joint health."
      },
      {
        id: 4,
        name: "Stage 4: Sovereign Vigor",
        description: "Optimal biological state. Exceptional energy levels, bulletproof joint structures, auto-regulated habits.",
        criteria: [
          "Autonomic nervous system metrics stably high under demanding workloads",
          "High relative functional strength and outstanding cardiovascular endurance metrics",
          "Lifestyle parameters fully optimized for lifetime cellular preservation"
        ],
        nextStageDescription: "Maintain biological durability, mentor others, and explore deep peak performance boundaries."
      }
    ],
    onboardingQuestions: [
      {
        id: "activity",
        question: "How many hours of deliberate progressive strength or cardiovascular training do you do per week?",
        options: [
          { label: "Less than 1 hour (Highly fragile baseline)", value: "none", points: 1 },
          { label: "1 to 3 hours (Developing foundation)", value: "moderate", points: 2 },
          { label: "3 to 5 hours (Compounding athletic state)", value: "advanced", points: 3 },
          { label: "5+ hours (Elite high performance)", value: "elite", points: 4 }
        ]
      },
      {
        id: "nutrition",
        question: "How would you describe your baseline daily nutritional intake?",
        options: [
          { label: "Untracked, highly processed, or prone to extreme energy crashes", value: "high_processed", points: 1 },
          { label: "Pragmatic mixed meals, with passive awareness of protein levels", value: "medium_clean", points: 2 },
          { label: "Calculated macronutrients customized for absolute daily performance", value: "optimized_precision", points: 4 }
        ]
      },
      {
        id: "sleep",
        question: "What is your average sleep hygiene quality and total duration?",
        options: [
          { label: "Sub-optimal: Under 6 hours with inconsistent bedtime schedules", value: "poor", points: 1 },
          { label: "Adequate: 6 to 7 hours with standard active rest days", value: "medium", points: 2 },
          { label: "Outstanding: 7.5+ hours with blacked-out room and regular wake-up metrics", value: "optimized", points: 4 }
        ]
      },
      {
        id: "joints",
        question: "Do you experience chronic joint aches, mobility limitations, or body inflammation?",
        options: [
          { label: "Frequent limitations or constant nagging localized pains", value: "high_pain", points: 1 },
          { label: "Occasional mild stiffness after high-intensity training cycles", value: "some_stiff", points: 2 },
          { label: "Zero pain; excellent structural mobility and full system durability", value: "bulletproof", points: 4 }
        ]
      }
    ],
    pathways: [
      {
        name: "Resistance Architecture",
        summary: "Build lean dense contractile tissue to turn your skeletal framework into an anti-fragile fortress.",
        levels: [
          {
            name: "Level 1: Compound Foundations",
            description: "Master clean biological movement: squats, hinges, pushes, and pulls using bodyweight.",
            details: "Commit to 2 basic bodyweight full-body circuits weekly. Emphasize joint positioning and range of motion over absolute speed.",
            courtesyTip: "Stability Tip: Wear completely flat-soled footwear or train barefoot to unlock optimal ankle power transfer."
          },
          {
            name: "Level 2: Progressive Overload Hook",
            description: "Introduce structured loads (barbells/dumbbells) three times a week.",
            details: "Keep detailed records of reps and weights. Force muscles to adapt by micro-loading weights (e.g. +2.5 lbs) every single week.",
            courtesyTip: "Equipment Suggestion: Use highly rated adjustable dumbbells to easily scale load in small square-footage environments."
          },
          {
            name: "Level 3: Power & Density Mastery",
            description: "Implement high-frequency split matrices targeted at elite recovery rates.",
            details: "Optimize mechanical tension and metabolically tax target fibers, tracked through objective velocity parameters.",
            courtesyTip: "Supplements Guide: Enhance recovery through safe, pure creatine monohydrate to fuel cellular ATP recharge."
          }
        ]
      },
      {
        name: "Metabolic Conditioning",
        summary: "Optimize mitochondrial density and cardiorespiratory health to bulletproof your cardiovascular system.",
        levels: [
          {
            name: "Level 1: Hourly Motion Anchor",
            description: "Amass a strict baseline of 8,000 steps daily. Zero excuses.",
            details: "A simple 15-minute walk post-digestive meals dramatically flattens blood glucose curves.",
            courtesyTip: "Tracking Suggestion: Use a simple smart-wearable to monitor step trends continuously."
          },
          {
            name: "Level 2: Zone 2 Cardiovascular Foundation",
            description: "Introduce 120 minutes per week of low-intensity aerobic conditioning.",
            details: "Exercise at a rhythm where you can easily speak full sentences but breathing is visibly deeper. This multiplies mitochondrial efficiency.",
            courtesyTip: "Optimization Tip: Run on low-impact surfaces or stationary bikes to fully shield knee cartilage."
          },
          {
            name: "Level 3: High-Intensity Interval Spurt",
            description: "Add a single weekly VO2 max booster session (e.g. 4x4 minute sprints).",
            details: "Unlocks ultimate heart stroke volume and expands cognitive clarity through dense oxygenation metrics.",
            courtesyTip: "Nutrition Wedge: Recharge with clean organic electrolytes containing optimal sodium-to-magnesium matrices."
          }
        ]
      }
    ],
    plans: {
      month1: {
        title: "Month 1: Habits & Sleep Anchor",
        tasks: [
          {
            task: "Enact absolute sleep environment lockdown.",
            time: "1 hour",
            complexity: "Easy",
            why: "All biological rebuild, hormone balancing, and neural cleanup happen in deep sleep.",
            details: "Completely black out your room, lower the ambient temperature to 66°F, and lock your screen away 45 minutes before bedtime."
          },
          {
            task: "Conduct daily direct hydration tracking.",
            time: "10 minutes/day",
            complexity: "Easy",
            why: "A minor 2% drop in cellular hydration levels decreases motor focus and coordination by 15%.",
            details: "Drink 16oz of pure mineralized water immediately upon waking. Target a total of 1 gallon of water daily."
          },
          {
            task: "Execute three 20-minute bodyweight mobility drills weekly.",
            time: "1 hour/week",
            complexity: "Medium",
            why: "Unlocks synovial fluid in hip and shoulder joints to reduce stiffness.",
            details: "Focus on deep glute stretches, spinal rotations, thoracic openers, and body squats. Zero external weights."
          }
        ]
      },
      month2: {
        title: "Month 2: Progressive Force Build",
        tasks: [
          {
            task: "Deploy basic calculated protein targets.",
            time: "30 minutes/week",
            complexity: "Medium",
            why: "Adequate dietary amino acids prevent muscle breakdown under training stresses.",
            details: "Target 0.8 to 1.0 grams of complete protein per pound of lean bodyweight daily. Rely on whole foods like eggs, fowl, or clean plant options."
          },
          {
            task: "Begin 3-day full body compound resistance routines.",
            time: "3 hours/week",
            complexity: "Medium",
            why: "Direct mechanical load preserves skeletal density and skeletal muscle volume.",
            details: "Perform 3 sets of squats, pushes (presses), and vertical pulls (pull-ups or rows). Always leave 2 reps in reserve."
          }
        ]
      },
      month3: {
        title: "Month 3: Conditioning Integration",
        tasks: [
          {
            task: "Incorporate Zone 2 Aerobic Conditioning sessions.",
            time: "2 hours/week",
            complexity: "Medium",
            why: "Aerobic cellular respiration maximizes mitochondrial density and metabolic elasticity.",
            details: "Incorporate two 45-minute sessions running, cycling, or climbing on a stationary trainer keeping your heart in a steady, conversational rhythm."
          },
          {
            task: "Assess baseline body biometrics and body state.",
            time: "1 hour",
            complexity: "Easy",
            why: "Objective measurements prove the efficacy of your physical trajectory.",
            details: "Perform static flexibility checks, calculate resting heart rate at waking, and evaluate total physical structural work indices."
          }
        ]
      }
    }
  },
  {
    id: "career-skills",
    name: "Career & Skill Growth",
    icon: "Briefcase",
    outcome: "High-income skill proficiency, career scale, and vocational independence.",
    stages: [
      {
        id: 1,
        name: "Stage 1: Commuter / Fragile",
        description: "No distinctive specialized skill. High vulnerability to market layoffs, low professional leverage.",
        criteria: [
          "Zero personal control over daily schedule or working structures",
          "Compensation is purely based on general administrative hours, easily automated",
          "No visible portfolio of independent projects, custom templates, or references"
        ],
        nextStageDescription: "Acquire specialized software, scripting, or strategic skills and carve out a niche wedge."
      },
      {
        id: 2,
        name: "Stage 2: Specialist Core",
        description: "Specialized skill acquired. Capable of executing clear tasks independently with decent quality.",
        criteria: [
          "Possesses 1 highly valued digital or technical modern skill",
          "Public portfolio or active GitHub repository showcasing functional creations",
          "Direct inbound professional inquiries starting to occur monthly"
        ],
        nextStageDescription: "Learn to bundle services into complete high-ticket value, decoupling pay from hours."
      },
      {
        id: 3,
        name: "Stage 3: High Leverage",
        description: "Highly leverageable consultant or operator. Pricing is based on project output or metrics, not raw hours.",
        criteria: [
          "Billing models decoupled from simple hourly clock limits",
          "Consistent funnel of warm client or promotion opportunities arriving",
          "Established system of auxiliary freelancers or script tools handling repetition"
        ],
        nextStageDescription: "Transition specialist systems into modular products or enterprise frameworks."
      },
      {
        id: 4,
        name: "Stage 4: Sovereign Operator",
        description: "Complete professional autonomy. Running an independent agency, sass infrastructure, or high-equity operation.",
        criteria: [
          "Earning structures completely decoupled from personal physical minutes",
          "Proprietary framework or high-demand IP generating steady automated value",
          "Selective intake accepting only highly matched high-margin projects"
        ],
        nextStageDescription: "Expand global market leverage, invest in early stage specialized talent, and secure generational intellectual property assets."
      }
    ],
    onboardingQuestions: [
      {
        id: "skill_depth",
        question: "How would you rate the market scarcity and specialization of your primary skill set?",
        options: [
          { label: "Generalist: High competition, easily replaceable within 30 days", value: "generalist", points: 1 },
          { label: "Specialist: Technically capable but still billing mostly by raw hours", value: "specialist", points: 2 },
          { label: "Expert: Highly unique, billing by output value and scalable metrics", value: "expert", points: 4 }
        ]
      },
      {
        id: "portfolio",
        question: "Do you have a public digital portfolio, repository, or track record of direct case studies?",
        options: [
          { label: "No: Mostly internal corporate work covered under NDAs or resumes", value: "no", points: 1 },
          { label: "Some: Basic LinkedIn profile and a few static files or project descriptions", value: "moderate", points: 2 },
          { label: "Outstanding: Clean public portfolio, open-source designs, and verified metrics", value: "strong", points: 4 }
        ]
      },
      {
        id: "leads",
        question: "How reliably do fresh career or business opportunities land in your inbox?",
        options: [
          { label: "Passive: I must actively pitch, cold-outreach, or apply to general listings", value: "cold", points: 1 },
          { label: "Intermittent: 1 or 2 soft inbound referrals land every few months", value: "warm", points: 2 },
          { label: "Frequent: Automated inbound funnel feeding pre-qualified direct targets weekly", value: "automated", points: 4 }
        ]
      },
      {
        id: "leverage",
        question: "Is your current daily income strictly capped by the number of hours you sit in a chair?",
        options: [
          { label: "Yes: Fixed salary or strict hourly contracts limit daily expansion", value: "capped", points: 1 },
          { label: "Slightly: Simple performance bonuses or commission metrics exist", value: "partial", points: 2 },
          { label: "No: Multiple recurring retainer streams and products run in parallel", value: "unlocked", points: 4 }
        ]
      }
    ],
    pathways: [
      {
        name: "Specialized Skill Mastery",
        summary: "Identify high-margin specialized domains and stack your talent layers for maximum unique advantage.",
        levels: [
          {
            name: "Level 1: The Scarcity Map",
            description: "Find a tech or strategy wedge at the intersection of two distinct, growing domains.",
            details: "For example, combine standard web template rendering with serverless database grounding or localized security audits.",
            courtesyTip: "Learning Guide: Follow curated open-source repositories to study real-world high-quality design pattern code."
          },
          {
            name: "Level 2: The Core Portfolio Project",
            description: "Build a single, highly polished end-to-end open-source system of exceptional quality.",
            details: "Never showcase theoretical 'todo lists'. Create a real-world tool that solves a painful operational leak for a business in your target niche.",
            courtesyTip: "Release tip: Host your application live so prospects can click through the interface instantly without downloading code."
          },
          {
            name: "Level 3: Metric-Driven Case Studies",
            description: "Document exactly how your creations saved money, saved hours, or grew revenue.",
            details: "Structure your case study as: Pain point → Strategy → Architectural Solution → $ saved or % performance increased.",
            courtesyTip: "Marketing asset: Publish a high-contrast explanation video showing your execution speed and command of terms."
          }
        ]
      },
      {
        name: "Inbound Pipeline Setup",
        summary: "Configure automated systems that position your authority in front of high-budget buyers, turning outreach into inbounds.",
        levels: [
          {
            name: "Level 1: The Specialized Landing",
            description: "Build a single minimal landing page solving one core problem for one type of buyer.",
            details: "Craft a headline focusing strictly on output value: 'I build reliable sandboxed systems that secure downstream metrics.'",
            courtesyTip: "Tech suggestion: Keep page load times under 200ms using serverless static optimization tools."
          },
          {
            name: "Level 2: The Value Loop Outreach",
            description: "Audit three prospective buyers for free, surfacing a specific leakage in their current setups.",
            details: "Do not pitch. Send a 3-minute video showing the exact bug, speed delay, or design misalignment, and provide a clean code fragment to resolve it.",
            courtesyTip: "Conversion Tip: Over 80% of operators will reply out of pure reciprocity and professional appreciation."
          },
          {
            name: "Level 3: Automated Authority Engine",
            description: "Publish high-quality structural breakdowns of complex systems once a week.",
            details: "Distribute your learnings on professional platforms to establish long-term compounding SEO and thought-leadership queries.",
            courtesyTip: "SEO optimization: Optimize for search queries related to enterprise stability and framework migrations."
          }
        ]
      }
    ],
    plans: {
      month1: {
        title: "Month 1: Skill Positioning Audit",
        tasks: [
          {
            task: "Conduct complete corporate output audit.",
            time: "3 hours",
            complexity: "Medium",
            why: "You must identify exactly which of your efforts create the highest margin for companies.",
            details: "Write down everything you executed in the last quarter. Isolate the processes that directly grew revenue or prevented downtime."
          },
          {
            task: "Perform a public digital hygiene upgrade.",
            time: "2 hours",
            complexity: "Easy",
            why: "First impressions are structural filters. A cluttered profile flags generalist levels.",
            details: "Optimize your LinkedIn or GitHub. Clear out generic descriptions. Update profiles to explicitly detail which niche problems you solve."
          },
          {
            task: "Map out interest areas of three niche market sectors.",
            time: "4 hours",
            complexity: "Medium",
            why: "Broad targeting forces you to compete heavily on rock-bottom prices.",
            details: "Select three high-margin sectors (such as automated SaaS models, biotech tools, legal operations). List their primary technical inefficiencies."
          }
        ]
      },
      month2: {
        title: "Month 2: High-Scarcity Build-Out",
        tasks: [
          {
            task: "Build a target-niche high-end system mockup.",
            time: "8 hours",
            complexity: "Hard",
            why: "A working prototype is worth 1,000 resumes.",
            details: "Design a clean, responsive single-screen dashboard solving a painful tracking or telemetry issue for your high-margin sector.",
            courtesyTip: "Development Tool: Leverage pre-configured component registries to speed up frontend scaffolding."
          },
          {
            task: "Draft a metric-backed case study of the template.",
            time: "3 hours",
            complexity: "Medium",
            why: "Buyers don't pay for elegant code; they pay for increased peace of mind and higher conversion metrics.",
            details: "Detail the architecture, stress-testing boundaries, and how your code isolates critical system states from failure loops."
          }
        ]
      },
      month3: {
        title: "Month 3: Lead Pipeline Deployment",
        tasks: [
          {
            task: "Deploy specialized value outreach loops.",
            time: "6 hours",
            complexity: "Hard",
            why: "Inbounds require early proactive seeds.",
            details: "Select 10 pre-screened companies in your target sector. Audit their systems and submit a recorded 3-minute walk-through of a performance opportunity."
          },
          {
            task: "Configure professional billing retainers.",
            time: "2 hours",
            complexity: "Easy",
            why: "Professional systems must support lightning-fast transactional checkouts.",
            details: "Establish clean invoicing, professional business licensing limits, and automatic recurring retainer contracts.",
            courtesyTip: "Payment Tool: Utilize leading client dashboard integrations to automate transaction ledger balance checks."
          }
        ]
      }
    }
  }
];
