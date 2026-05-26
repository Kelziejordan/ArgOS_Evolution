import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Compass, 
  Shield, 
  Award, 
  ClipboardList, 
  HelpCircle, 
  Send, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  ChevronRight, 
  User, 
  Heart, 
  Briefcase, 
  DollarSign, 
  Lock,
  Check,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NICHES, NicheDefinition, Task, OnboardingQuestion } from '../../data/niches';
import { useSystem } from '../../event-system/EventCore';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// System Error Handler following Firestore security ABAC / DDD instructions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, userId: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Map niche icon ID to lucide component dynamically
const NicheIcon = ({ icon, className = "w-4 h-4" }: { icon: string, className?: string }) => {
  switch (icon) {
    case 'DollarSign': return <DollarSign className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    default: return <Compass className={className} />;
  }
};

export function LifeOSEngine({ setActiveModule }: { setActiveModule?: (s: string) => void }) {
  const { user } = useSystem();
  
  // State definitions matching the calibration schema
  const [activeNicheId, setActiveNicheId] = useState<string>('financial-security');
  const [activeTab, setActiveTab] = useState<'plan' | 'pathways' | 'coach'>('plan');
  const [activeMonth, setActiveMonth] = useState<'month1' | 'month2' | 'month3'>('month1');
  
  // Onboarding Quiz flow states
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  // Dynamic user calibration states
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [onboardingCompletes, setOnboardingCompletes] = useState<Record<string, boolean>>({});
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [nicheStages, setNicheStages] = useState<Record<string, number>>({});
  const [taskCompletes, setTaskCompletes] = useState<Record<string, boolean>>({});

  // AI Coach state tracking (independent per niche)
  const [coachMessages, setCoachMessages] = useState<Record<string, { sender: 'user' | 'assistant' | 'system', text: string, timestamp: Date }[]>>({});
  const [coachInput, setCoachInput] = useState<string>('');
  const [coachLoading, setCoachLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeNiche = NICHES.find(n => n.id === activeNicheId) || NICHES[0];

  // 1. Core State Synchronization (Local storage vs Live Firestore link)
  useEffect(() => {
    if (!user) {
      // Offline fallback: load from LocalStorage
      try {
        const storedOnboarding = localStorage.getItem('argos_onboarding_completes');
        const storedAnswers = localStorage.getItem('argos_onboarding_answers');
        const storedStages = localStorage.getItem('argos_niche_stages');
        const storedTasks = localStorage.getItem('argos_task_completes');

        if (storedOnboarding) setOnboardingCompletes(JSON.parse(storedOnboarding));
        if (storedAnswers) setOnboardingAnswers(JSON.parse(storedAnswers));
        if (storedStages) setNicheStages(JSON.parse(storedStages));
        if (storedTasks) setTaskCompletes(JSON.parse(storedTasks));
      } catch (e) {
        console.error("Local storage restoration failed:", e);
      }
    } else {
      // Cloud synchronization: attach real-time doc snapshot listener
      setDbLoading(true);
      const unsubscribe = onSnapshot(doc(db, "calibrations", user.uid), 
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.onboardingCompletes) setOnboardingCompletes(data.onboardingCompletes);
            if (data.onboardingAnswers) setOnboardingAnswers(data.onboardingAnswers);
            if (data.nicheStages) setNicheStages(data.nicheStages);
            if (data.taskCompletes) setTaskCompletes(data.taskCompletes);
          }
          setDbLoading(false);
        }, 
        (err) => {
          handleFirestoreError(err, OperationType.GET, `calibrations/${user.uid}`, user.uid);
          setDbLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [user]);

  // Handle auto-scroll inside coaching chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages, activeNicheId, activeTab]);

  // 2. High-integrity State persistence updater
  const persistState = async (updates: {
    completes?: Record<string, boolean>;
    answers?: Record<string, Record<string, string>>;
    stages?: Record<string, number>;
    tasks?: Record<string, boolean>;
  }) => {
    // Merge new updates onto existing states
    const nextOnboardingCompletes = { ...onboardingCompletes, ...(updates.completes || {}) };
    const nextOnboardingAnswers = { ...onboardingAnswers, ...(updates.answers || {}) };
    const nextNicheStages = { ...nicheStages, ...(updates.stages || {}) };
    const nextTaskCompletes = { ...taskCompletes, ...(updates.tasks || {}) };

    // Update React local states immediately for fluid latency response
    if (updates.completes) setOnboardingCompletes(nextOnboardingCompletes);
    if (updates.answers) setOnboardingAnswers(nextOnboardingAnswers);
    if (updates.stages) setNicheStages(nextNicheStages);
    if (updates.tasks) setTaskCompletes(nextTaskCompletes);

    if (user) {
      // Write to cloud document (ABAC Protected)
      try {
        const docRef = doc(db, "calibrations", user.uid);
        await setDoc(docRef, {
          userId: user.uid,
          onboardingCompletes: nextOnboardingCompletes,
          onboardingAnswers: nextOnboardingAnswers,
          nicheStages: nextNicheStages,
          taskCompletes: nextTaskCompletes,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `calibrations/${user.uid}`, user.uid);
      }
    } else {
      // Fallback: write to localized state storage
      try {
        localStorage.setItem('argos_onboarding_completes', JSON.stringify(nextOnboardingCompletes));
        localStorage.setItem('argos_onboarding_answers', JSON.stringify(nextOnboardingAnswers));
        localStorage.setItem('argos_niche_stages', JSON.stringify(nextNicheStages));
        localStorage.setItem('argos_task_completes', JSON.stringify(nextTaskCompletes));
      } catch (e) {}
    }
  };

  // Check if onboarding was completed for the active Niche
  const hasCompletedNicheOnboarding = onboardingCompletes[activeNicheId] === true;
  const currentCalibrationStage = nicheStages[activeNicheId] || 1;

  // Render stage names elegantly
  const getStageName = (idx: number) => {
    const stageObj = activeNiche.stages.find(s => s.id === idx);
    return stageObj ? stageObj.name : `Stage ${idx}`;
  };

  // 3. Quiz workflow functions
  const startCalibration = () => {
    setIsQuizMode(true);
    setCurrentQuestionIdx(0);
    setQuizAnswers({});
  };

  const submitQuizAnswer = (qId: string, answerVal: string, points: number) => {
    const nextAnswers = { ...quizAnswers, [qId]: points };
    setQuizAnswers(nextAnswers);

    if (currentQuestionIdx < activeNiche.onboardingQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Calculate total rating stage matching 4 indices based on answers
      let totalScore = 0;
      Object.keys(nextAnswers).forEach((key) => { 
        totalScore += Number(nextAnswers[key] || 0); 
      });
      const averageScore = totalScore / activeNiche.onboardingQuestions.length;

      // Map average answers to integer stage: 1 to 4
      let calibratedStageIdx = 1;
      if (averageScore > 3.2) calibratedStageIdx = 4;
      else if (averageScore > 2.2) calibratedStageIdx = 3;
      else if (averageScore > 1.4) calibratedStageIdx = 2;

      // Transform answers mapping to key details
      const submittedAnswersMap: Record<string, string> = {};
      activeNiche.onboardingQuestions.forEach(q => {
        const matchedOpt = q.options.find(opt => opt.points === nextAnswers[q.id]);
        submittedAnswersMap[q.id] = matchedOpt ? matchedOpt.label : "Unselected";
      });

      // Save onboarding and stage variables safely
      persistState({
        completes: { [activeNicheId]: true },
        stages: { [activeNicheId]: calibratedStageIdx },
        answers: { [activeNicheId]: submittedAnswersMap }
      });

      setIsQuizMode(false);
    }
  };

  // 4. Tasks list controllers
  const toggleTask = (monthKey: string, taskIdx: number) => {
    const taskKey = `${activeNicheId}_${monthKey}_${taskIdx}`;
    persistState({
      tasks: { [taskKey]: !taskCompletes[taskKey] }
    });
  };

  // 5. Specialist Counselor messaging system using Gemini client router
  const submitCoachQuery = async () => {
    const text = coachInput.trim();
    if (!text) return;

    setCoachInput('');
    const userMsg = { sender: 'user' as const, text, timestamp: new Date() };

    // Get current chat context list or initialize defaults
    const currentList = coachMessages[activeNicheId] || [
      {
        sender: 'system' as const,
        text: `ROUTING: Connecting active node to ${activeNiche.name} Specialist Neural Calibration Stream.`,
        timestamp: new Date()
      },
      {
        sender: 'assistant' as const,
        text: `Greetings. I am your specialized Counselor for ${activeNiche.name}.\nCurrently calibrated at: ${getStageName(currentCalibrationStage)}.\n\nHow can I help you implement your structured action steps, analyze your diagnostic results, or customize your routines?`,
        timestamp: new Date()
      }
    ];

    const nextList = [...currentList, userMsg];
    setCoachMessages(prev => ({ ...prev, [activeNicheId]: nextList }));
    setCoachLoading(true);

    try {
      const customInstruction = `You are an elite, professional ${activeNiche.name} Coaching Specialist integrated inside the highly secure ArgOS workspace control panel.
The user is currently calibrated at "${getStageName(currentCalibrationStage)}" for their "${activeNiche.name}" calibration project, aiming to achieve the ultimate outcome: "${activeNiche.outcome}".
Their current answers to diagnostics questions: ${JSON.stringify(onboardingAnswers[activeNicheId] || {})}.

Keep your response highly actionable, professional, and mathematically rigorous. Speak with professional compose, avoid superficial hype, and keep styling formatted with structured markdown. Focus on giving them specific steps to complete their Monthly Action Tasks or clarify the Strategic Pathways.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, customInstruction })
      });

      if (res.ok) {
        const data = await res.json();
        const responseMsg = {
          sender: 'assistant' as const,
          text: data.text || 'Process timeout. Stream could not resolve value.',
          timestamp: new Date()
        };
        setCoachMessages(prev => ({ ...prev, [activeNicheId]: [...nextList, responseMsg] }));
      } else {
        throw new Error('Endpoint returned error status.');
      }
    } catch (e: any) {
      setCoachMessages(prev => ({
        ...prev,
        [activeNicheId]: [
          ...nextList,
          {
            sender: 'system' as const,
            text: `CONNECTION_ERROR: Specialized module decoupled unexpectedly. Core trace: ${e?.message || 'Gateway offline'}`,
            timestamp: new Date()
          }
        ]
      }));
    } finally {
      setCoachLoading(false);
    }
  };

  // Quick prompt presets inside Coach tab
  const triggerQuickPrompt = (promptText: string) => {
    setCoachInput(promptText);
  };

  const getChatLogs = () => {
    return coachMessages[activeNicheId] || [
      {
        sender: 'system' as const,
        text: `ROUTING: Connecting active node to ${activeNiche.name} Specialist Neural Calibration Stream.`,
        timestamp: new Date()
      },
      {
        sender: 'assistant' as const,
        text: `Greetings. I am your specialized Coach for ${activeNiche.name}.\nCurrently calibrated at: ${getStageName(currentCalibrationStage)}.\n\nHow can I help you implement your structured action steps, analyze your diagnostic results, or customize your routines?`,
        timestamp: new Date()
      }
    ];
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-12 text-slate-100">
      
      {/* Header and Back navigation row */}
      <div className="flex items-center justify-between gap-4">
        {setActiveModule && (
          <button 
            onClick={() => setActiveModule("Command Hall")} 
            className="flex items-center gap-1.5 px-3 py-1 bg-nexus-surface/50 border border-nexus-border rounded text-[10px] uppercase font-mono tracking-wider text-nexus-muted hover:text-white hover:border-nexus-border/80 transition-all cursor-pointer"
          >
            ← Back to Command Center
          </button>
        )}
        <div className="flex items-center gap-2 text-[10px] font-mono text-nexus-muted">
          <span>CALIBRATOR STATUS: </span>
          {dbLoading ? (
            <span className="text-nexus-accent animate-pulse">SYNCHRONIZING WITH CLOUD DATABASE...</span>
          ) : user ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" /> CLOUD SYNCED // USER_ID: {user.uid.slice(0, 8)}
            </span>
          ) : (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> OFFLINE LOCK // LOCAL DATABASES ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left sidebar select client niches, Right main panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left column (Grid span 4): Niches list */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="border border-nexus-border/50 rounded-xl bg-nexus-surface/50 p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Calibration Sectors</h3>
            
            <div className="space-y-2">
              {NICHES.map((niche) => {
                const isActive = niche.id === activeNicheId;
                const hasCompletedOnb = onboardingCompletes[niche.id] === true;
                const nicheStage = nicheStages[niche.id] || 1;

                return (
                  <button
                    key={niche.id}
                    onClick={() => {
                      setActiveNicheId(niche.id);
                      setIsQuizMode(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-nexus-accent/15 border-nexus-accent/60 shadow-[0_0_12px_rgba(59,130,246,0.15)] text-white' 
                        : 'bg-black/30 border-nexus-border/40 hover:border-nexus-border/80 hover:bg-black/45 text-nexus-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded border transition-colors ${
                        isActive 
                          ? 'bg-nexus-accent/20 border-nexus-accent/40 text-nexus-accent' 
                          : 'bg-nexus-border/10 border-nexus-border/20 text-nexus-muted'
                      }`}>
                        <NicheIcon icon={niche.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className={`text-[11px] font-bold font-mono tracking-wider ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {niche.name}
                        </span>
                        <span className="text-[8px] font-mono text-nexus-muted mt-0.5">
                          {hasCompletedOnb ? `Calibrated: Stage ${nicheStage}` : 'DIAGNOSTIC PENDING'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5 text-nexus-accent' : 'text-nexus-muted'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Constitutional Warning Card */}
          <div className="bg-nexus-surface/30 border border-nexus-border/30 rounded-xl p-4 text-[9px] font-mono leading-relaxed text-nexus-muted">
            <h4 className="font-bold text-white uppercase flex items-center gap-1.5 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-nexus-accent" />
              Sovereignty Confinement Invariant
            </h4>
            These calibration questionnaires and logs run within sandboxed client operations. If you are unauthenticated, databases compile entirely offline in localized sandboxes to prevent algorithmic scraping or telemetry tracking. For permanent backup, establish secure auth.
          </div>
        </div>

        {/* Right column (Grid span 8): Workspaces & diagnostic modules */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Active Sector banner */}
          <div className="bg-nexus-surface border border-nexus-border/60 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
            <div className="flex-1">
              <span className="text-[9px] font-mono tracking-widest text-nexus-accent uppercase font-bold">CALIBRATION FOCUS SECTOR</span>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">{activeNiche.name}</h2>
              <p className="text-xs text-nexus-muted mt-1.5 leading-relaxed">{activeNiche.outcome}</p>
            </div>

            {hasCompletedNicheOnboarding && !isQuizMode && (
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 rounded flex items-center gap-2">
                  <Award className="w-4 h-4 text-nexus-accent" />
                  <span className="text-[10px] font-mono text-white font-bold">{getStageName(currentCalibrationStage)}</span>
                </div>
                <button 
                  onClick={startCalibration}
                  className="text-[9px] font-mono text-nexus-muted hover:text-nexus-accent flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Re-execute Diagnostics
                </button>
              </div>
            )}
          </div>

          {/* WORKSPACE LOGIC CONTROLLER */}
          <AnimatePresence mode="wait">
            
            {/* Case A: User has not onboarding is currently not run, or wants to run quiz */}
            {!hasCompletedNicheOnboarding || isQuizMode ? (
              <motion.div
                key="quiz-block"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-nexus-surface border border-nexus-border/60 rounded-xl overflow-hidden shadow-lg p-6 relative"
              >
                {!isQuizMode ? (
                  /* Initial intro state before taking quiz */
                  <div className="flex flex-col items-center text-center p-6 gap-4">
                    <div className="p-4 bg-nexus-accent/10 border border-nexus-accent/30 rounded-full text-nexus-accent mb-2">
                      <Compass className="w-10 h-10 animate-pulse" />
                    </div>
                    
                    <h3 className="text-md font-bold tracking-wide font-mono text-white uppercase">Sector Diagnostics Calibration Pending</h3>
                    <p className="text-xs leading-relaxed text-nexus-muted max-w-md">
                      To compile a custom 3-month action blueprint, progressive level checklists, and deploy an AI Specialized calibration Coach, we must execute a baseline metrics diagnostic.
                    </p>

                    <button
                      onClick={startCalibration}
                      className="px-5 py-2.5 bg-nexus-accent hover:bg-nexus-accent/80 text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.25)] mt-2"
                    >
                      EXECUTE CONFORMANCE TEST
                    </button>
                  </div>
                ) : (
                  /* Active state rendering quiz questions */
                  <div>
                    {/* Top Progress bar */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-nexus-muted mb-4 border-b border-nexus-border/30 pb-3">
                      <span>QUESTION {currentQuestionIdx + 1} OF {activeNiche.onboardingQuestions.length}</span>
                      <span>STATED_FIDELITY: HIGH</span>
                    </div>

                    {/* Active Question */}
                    <div className="min-h-[140px] flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-slate-100 font-mono tracking-normal leading-relaxed">
                        {activeNiche.onboardingQuestions[currentQuestionIdx].question}
                      </h3>
                      
                      <div className="mt-6 space-y-2">
                        {activeNiche.onboardingQuestions[currentQuestionIdx].options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => submitQuizAnswer(
                              activeNiche.onboardingQuestions[currentQuestionIdx].id,
                              opt.value,
                              opt.points
                            )}
                            className="w-full text-left p-3 bg-black/20 hover:bg-nexus-accent/10 border border-nexus-border/40 hover:border-nexus-accent/50 text-[11px] font-mono text-slate-300 hover:text-white rounded transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <span>{opt.label}</span>
                            <ChevronRight className="w-4 h-4 text-nexus-muted group-hover:text-nexus-accent transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer indicators */}
                    <div className="mt-6 pt-4 border-t border-nexus-border/30 flex items-center justify-between text-[9px] font-mono text-nexus-muted">
                      <span>* Diagnostic conforms to IArgOSCapability standard</span>
                      <button 
                        onClick={() => setIsQuizMode(false)}
                        className="text-red-400 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Bypass Calibration
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Case B: User has loaded active calibration, render full Workspace workspace Tabs */
              <motion.div
                key="workspace-tabs-block"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-nexus-surface border border-nexus-border/60 rounded-xl overflow-hidden shadow-lg flex flex-col"
              >
                {/* Navigation header */}
                <div className="flex border-b border-nexus-border/50 bg-black/10">
                  <button 
                    onClick={() => setActiveTab('plan')} 
                    className={`flex-1 px-5 py-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'plan' 
                        ? 'text-nexus-accent border-nexus-accent bg-nexus-accent/5' 
                        : 'text-nexus-muted border-transparent hover:text-white hover:bg-white/2.5'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    3-Month Action Steps
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('pathways')} 
                    className={`flex-1 px-5 py-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'pathways' 
                        ? 'text-nexus-accent border-nexus-accent bg-nexus-accent/5' 
                        : 'text-nexus-muted border-transparent hover:text-white hover:bg-white/2.5'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Strategic Pathways
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('coach')} 
                    className={`flex-1 px-5 py-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === 'coach' 
                        ? 'text-nexus-accent border-nexus-accent bg-nexus-accent/5' 
                        : 'text-nexus-muted border-transparent hover:text-white hover:bg-white/2.5'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Neural Coach insights
                  </button>
                </div>

                {/* TAB WINDOW CONTENT COMPONENT */}
                <div className="p-6">
                  
                  {/* Tab 1: Checkout 3-Month Plan */}
                  {activeTab === 'plan' && (
                    <div className="space-y-6">
                      
                      {/* Month selector sliders */}
                      <div className="flex border border-nexus-border/40 rounded bg-black/35 p-1 gap-1">
                        {(['month1', 'month2', 'month3'] as const).map((mKey) => (
                          <button
                            key={mKey}
                            onClick={() => setActiveMonth(mKey)}
                            className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded transition-all cursor-pointer ${
                              activeMonth === mKey
                                ? 'bg-nexus-accent/20 text-white text-nexus-accent border border-nexus-accent/30'
                                : 'text-nexus-muted hover:text-white'
                            }`}
                          >
                            {mKey === 'month1' ? 'Month 1 Plan' : mKey === 'month2' ? 'Month 2 Plan' : 'Month 3 Plan'}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic list rendering active month checklist */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-nexus-accent font-semibold">
                            {activeNiche.plans[activeMonth].title}
                          </h4>
                          <span className="text-[9px] font-mono text-nexus-muted">PROGRESS CHECKLIST</span>
                        </div>

                        <div className="space-y-3">
                          {activeNiche.plans[activeMonth].tasks.map((taskItem, tIdx) => {
                            const taskKey = `${activeNicheId}_${activeMonth}_${tIdx}`;
                            const isCompleted = taskCompletes[taskKey] === true;

                            return (
                              <div 
                                key={tIdx}
                                className={`p-4 border rounded-lg transition-all ${
                                  isCompleted 
                                    ? 'bg-nexus-accent/5 border-nexus-accent/20 text-nexus-muted' 
                                    : 'bg-black/20 border-nexus-border/30 text-white'
                                }`}
                              >
                                <div className="flex gap-4 items-start">
                                  {/* Custom Styled Checkbox matching branding guidelines */}
                                  <button
                                    onClick={() => toggleTask(activeMonth, tIdx)}
                                    className={`shrink-0 p-1.5 rounded border transition-all cursor-pointer ${
                                      isCompleted 
                                        ? 'bg-nexus-accent/20 border-nexus-accent/50 text-nexus-accent' 
                                        : 'bg-black/10 border-nexus-border/50 text-nexus-muted hover:border-nexus-accent/40'
                                    }`}
                                  >
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                                  </button>

                                  <div className="flex-1 space-y-1.5 text-left">
                                    <h5 className={`text-xs font-semibold leading-relaxed font-mono ${isCompleted ? 'line-through text-nexus-muted' : 'text-slate-100'}`}>
                                      {taskItem.task}
                                    </h5>
                                    
                                    <p className="text-[10px] text-nexus-muted leading-relaxed">
                                      {taskItem.details}
                                    </p>

                                    {/* Task metadata properties banner */}
                                    <div className="flex flex-wrap items-center gap-4 text-[8px] font-mono pt-1 text-slate-400">
                                      <span className="flex items-center gap-1 bg-black/30 border border-nexus-border px-1.5 py-0.5 rounded">
                                        ⏱️ EXPECTED_TIME: {taskItem.time}
                                      </span>
                                      
                                      <span className={`flex items-center gap-1 border px-1.5 py-0.5 rounded ${
                                        taskItem.complexity === 'Easy' 
                                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                                          : taskItem.complexity === 'Medium'
                                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                                      }`}>
                                        ⚙️ INSTABILITY: {taskItem.complexity.toUpperCase()}
                                      </span>

                                      <span className="text-nexus-muted">
                                        💡 why: {taskItem.why}
                                      </span>
                                    </div>

                                    {taskItem.courtesyTip && (
                                      <div className="text-[8px] font-mono text-nexus-accent/80 border-t border-nexus-border/20 pt-1.5 mt-2 flex items-start gap-1">
                                        <Zap className="w-2.5 h-2.5 shrink-0" />
                                        <span>SYSTEM_GUIDE: {taskItem.courtesyTip}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Strategic Pathways */}
                  {activeTab === 'pathways' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-nexus-border/25">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-nexus-accent font-semibold">
                          Strategic Expansion Pathways
                        </h4>
                        <span className="text-[9px] font-mono text-nexus-muted">SYSTEM_STRETCH</span>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {activeNiche.pathways.map((pathWay, pIdx) => (
                          <div key={pIdx} className="bg-black/15 border border-nexus-border/40 rounded-xl p-5 space-y-4">
                            <div>
                              <h5 className="text-xs font-mono font-bold text-white uppercase">{pathWay.name}</h5>
                              <p className="text-[10px] text-nexus-muted leading-relaxed mt-1">{pathWay.summary}</p>
                            </div>

                            {/* Timeline-style Levels checklists */}
                            <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-nexus-border/40 pb-1">
                              {pathWay.levels.map((level, lIdx) => (
                                <div key={lIdx} className="flex gap-4 items-start pl-1">
                                  <div className="w-8 h-8 rounded bg-nexus-surface border border-nexus-border flex items-center justify-center text-[10px] font-mono text-nexus-accent font-bold shrink-0 z-10">
                                    L{lIdx + 1}
                                  </div>
                                  
                                  <div className="flex-1 space-y-1 text-left pt-1">
                                    <h6 className="text-[11px] font-semibold font-mono text-slate-200 leading-none">
                                      {level.name}
                                    </h6>
                                    <p className="text-[10px] text-nexus-muted leading-relaxed">
                                      {level.description}
                                    </p>
                                    <p className="text-[9px] text-slate-400 italic">
                                      {level.details}
                                    </p>
                                    
                                    {level.courtesyTip && (
                                      <div className="text-[8px] font-mono text-nexus-accent mt-1 p-1 bg-nexus-accent/5 border-l border-nexus-accent rounded-r-sm max-w-fit pr-2.5">
                                        🔑 Guide: {level.courtesyTip}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Specialist AI Coaching Chat Session */}
                  {activeTab === 'coach' && (
                    <div className="h-[460px] flex flex-col border border-nexus-border/40 rounded-xl bg-black/10 overflow-hidden">
                      
                      {/* Coach Chat logs panel */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-nexus-border">
                        {getChatLogs().map((msg, mIdx) => {
                          if (msg.sender === 'system') {
                            return (
                              <div key={mIdx} className="p-2 bg-black/25 border-l border-nexus-accent/40 rounded text-[9px] font-mono text-nexus-accent leading-normal whitespace-pre-line text-left">
                                &gt; {msg.text}
                              </div>
                            );
                          }

                          const isUser = msg.sender === 'user';
                          return (
                            <div key={mIdx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] px-3 py-2.5 rounded text-[10px] font-mono border leading-relaxed text-left ${
                                isUser 
                                  ? 'bg-nexus-accent/15 border-nexus-accent/30 text-white rounded-br-none' 
                                  : 'bg-black/30 border-nexus-border/30 text-slate-300 rounded-bl-none'
                              }`}>
                                <div className="text-[8px] text-slate-400 mb-1 flex items-center justify-between">
                                  <span className="font-bold">{isUser ? 'OPERATOR' : `${activeNiche.name.toUpperCase()}_COACH`}</span>
                                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="whitespace-pre-line leading-normal">{msg.text}</p>
                              </div>
                            </div>
                          );
                        })}

                        {coachLoading && (
                          <div className="flex items-center gap-2 p-2 bg-black/15 border border-nexus-border/20 rounded w-fit text-left">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-nexus-accent" />
                            <span className="text-[9px] font-mono text-nexus-muted">GENERATING DEDUCTIVE CALIB OUTLINE...</span>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Chat Presets triggers */}
                      <div className="px-4 py-2 border-t border-nexus-border/20 bg-black/20 flex flex-wrap gap-1 md:gap-2 justify-start">
                        <button 
                          onClick={() => triggerQuickPrompt("Outline my Month 1 tasks")}
                          className="px-2 py-0.5 bg-nexus-border/30 hover:bg-nexus-border/60 text-[8px] font-mono text-slate-300 rounded cursor-pointer transition-all border border-nexus-border/30"
                        >
                          "Month 1 Outline"
                        </button>
                        <button 
                          onClick={() => triggerQuickPrompt(`How can I level up on Buffer Acceleration?`)}
                          className="px-2 py-0.5 bg-nexus-border/30 hover:bg-nexus-border/60 text-[8px] font-mono text-slate-300 rounded cursor-pointer transition-all border border-nexus-border/30"
                        >
                          "Explain Pathways Step"
                        </button>
                        <button 
                          onClick={() => triggerQuickPrompt("Suggest a structured schedule to tackle my first objective")}
                          className="px-2 py-0.5 bg-nexus-border/30 hover:bg-nexus-border/60 text-[8px] font-mono text-slate-300 rounded cursor-pointer transition-all border border-nexus-border/30"
                        >
                          "Recommend weekly schedule"
                        </button>
                      </div>

                      {/* Input panel */}
                      <div className="p-3 border-t border-nexus-border/40 bg-nexus-surface/85 flex gap-2">
                        <input
                          type="text"
                          placeholder={`Ask your ${activeNiche.name} Specialist anything...`}
                          value={coachInput}
                          onChange={(e) => setCoachInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') submitCoachQuery(); }}
                          disabled={coachLoading}
                          className="flex-1 bg-black/35 border border-nexus-border/60 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono focus:border-nexus-accent/40 disabled:opacity-50"
                        />
                        <button
                          onClick={submitCoachQuery}
                          disabled={coachLoading || !coachInput.trim()}
                          className="px-3 bg-nexus-accent hover:bg-nexus-accent/80 text-white rounded border border-nexus-accent transition-all cursor-pointer disabled:opacity-25 flex items-center justify-center font-mono font-bold text-[10px] tracking-wider"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
