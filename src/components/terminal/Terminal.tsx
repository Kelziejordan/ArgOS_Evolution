import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  Trash2, 
  Loader2, 
  Activity, 
  Lock, 
  ShieldCheck, 
  Layers, 
  ExternalLink, 
  Cpu, 
  Info, 
  FileText,
  AlertTriangle,
  Compass
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

interface ProjectBranch {
  id: string;
  name: string;
  status: 'FROZEN' | 'ACTIVE' | 'STANDBY' | 'MONITORING';
  statusLabel: string;
  health: number;
  healthState: string;
  version: string;
  repoPath: string;
  statistics: string;
  decoupleNotes: string;
}

export function TerminalCore({ activeModule, setActiveModule }: { activeModule: string, setActiveModule?: (s: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'quick-commands'>('chat');
  const [activeTabId, setActiveTabId] = useState<string>('argos-core');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with standard ArgOS welcome greeting
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'system',
        text: 'SYSTEM_LINK: Connection secure. ArgOS Platform Command Hub initialized successfully.',
        timestamp: new Date()
      },
      {
        id: 'intro',
        sender: 'assistant',
        text: 'Greetings. I am ArgOS Workspace Intelligence, your unified platform manager. I hold complete visibility over all active capabilities, integration contracts, and branched repositories.\n\nOur core platform (ArgOS Core) is frozen and immutable (acting as the stable master trunk) guaranteeing safety and immune sentinel standards. Features like the quantitative trading module and life calibration branch off directly from this frozen source and evolve on independent active branches to preserve the independence and stability of the core system. How can I assist you with standard service interfaces, immune compliance, or platform abstraction rules today?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputVal).trim();
    if (!messageText) return;

    if (!textToSend) {
      setInputVal('');
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Intercept /lifeos CLI commands to run completely local diagnostics query queries
    if (messageText.toLowerCase().startsWith('/lifeos')) {
      setTimeout(() => {
        const cmd = messageText.toLowerCase().trim();
        let reply = '';
        
        if (cmd === '/lifeos' || cmd === '/lifeos help' || cmd === '/lifeos --help') {
          reply = `ARGOS_SYSTEM_CLI: LifeOS Calibration Module (Sub-system LO-0.9) Active.
Available CLI Interfaces:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /lifeos status         - Inspect active niche profiles & stage metrics.
  /lifeos info           - Display package registry details & schema standards.
  /lifeos diagnose       - Display diagnostic onboarding guide parameters.
  /lifeos reset          - Wipe sandbox state databases & re-lock.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Niche ID Guides: 'financial-security' | 'fitness-health' | 'career-skills'`;
        } else if (cmd === '/lifeos status') {
          const onboardedStr = localStorage.getItem('argos_lifeos_onboarding');
          const stagesStr = localStorage.getItem('argos_lifeos_stages');
          const answersStr = localStorage.getItem('argos_lifeos_answers');
          
          const onboarded = onboardedStr ? JSON.parse(onboardedStr) : {};
          const stages = stagesStr ? JSON.parse(stagesStr) : {};
          const answers = answersStr ? JSON.parse(answersStr) : {};
          
          const getStatusText = (id: string, name: string) => {
            const hasOnboarded = onboarded[id] === true;
            const stageNum = stages[id] || 1;
            let stageName = 'Stage 1: Fragile';
            if (stageNum === 2) stageName = 'Stage 2: Stable';
            if (stageNum === 3) stageName = 'Stage 3: Compounding';
            if (stageNum === 4) stageName = 'Stage 4: Sovereign';

            return `⚡ ${name}:
     • Status:      [${hasOnboarded ? 'CALIBRATED' : 'LAUNCH_PENDING'}]
     • Active Stage: ${hasOnboarded ? stageName : 'Unknown (Run Diagnostic Onboarding)'}
     • State Code:  LO-${id.substring(0,6).toUpperCase()}-${stageNum}.0`;
          };

          reply = `ARGOS_STATUS_OUTPUT: Querying localized storage containers...

${getStatusText('financial-security', 'Financial Security Niche')}
${getStatusText('fitness-health', 'Fitness & Health Niche')}
${getStatusText('career-skills', 'Career & Skills Niche')}

[OPERATOR_SOVEREIGNTY]: Data is fully insulated offline. Zero background analytics transmitted.`;
        } else if (cmd === '/lifeos info') {
          reply = `ARGOS_REGISTRY_INFO: LifeOS Calibration Engine [LO-0.9]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Protocol:    IArgOSCapability Compliance Standard
  • Dependency:  Zero Cloud-locked databases (SQLite / LocalStorage Local Interface)
  • Template:    Multi-stage 90-day adaptive scheduling model
  • Sync-Level:  Fully Decoupled Workspace Sandbox
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Branch repo path: 'branch/argos-lifeos-calibrator'
Active status: Evolving Early Beta (96% platform alignment).`;
        } else if (cmd.startsWith('/lifeos diagnose') || cmd.startsWith('/lifeos calibrate')) {
          reply = `ARGOS_ACTION_GUIDE: Recalibration Workflow Intercepted.
To execute diagnostic calibration, click the "Execute Branch Workspace" button in the Decoupled Project Indicators pane on the right side of the Command Hall, or select "Life OS Calibration" inside the sidebar on the left.
This will load the full stage-based interactive calibrator workspace UI, allowing you to answer questions, generate plans, and interact with the Specialist AI Coaching assistant.`;
        } else if (cmd === '/lifeos reset') {
          localStorage.removeItem('argos_lifeos_onboarding');
          localStorage.removeItem('argos_lifeos_stages');
          localStorage.removeItem('argos_lifeos_answers');
          localStorage.removeItem('argos_lifeos_tasks');
          localStorage.removeItem('argos_lifeos_params');
          
          reply = `ARGOS_HYGIENE: Local LifeOS databases purged. 
All temporary metrics, onboarding stages, action checklist records, and local chat memories have been securely deleted and reset to Stage 1 Defaults.`;
        } else {
          reply = `ARGOS_CLI_ERROR: Unknown option "${messageText.substring(8)}". Type "/lifeos help" to view valid parameters.`;
        }

        const botMsg: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          sender: 'system',
          text: reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
      }, 350);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          text: data.text || 'Error parsing dynamic query.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Endpoint returned error status.');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        sender: 'system',
        text: `COMMUNICATION_TIMEOUT: Failed to process prompt. Details: ${err?.message || 'Check local server stack'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'cleared-log',
        sender: 'system',
        text: 'SESSION_HYGIENE: Chat log cleared. New session started.',
        timestamp: new Date()
      }
    ]);
  };

  // Automated inspection query trigger
  const triggerInspectQuery = (projectName: string, context: string) => {
    sendMessage(`Explain the current architecture strategy and health for the "${projectName}" branch. Context: ${context}`);
  };

  // Branched projects indicators
  const projectBranches: ProjectBranch[] = [
    {
      id: 'argos-core',
      name: 'ArgOS Core System & Registry',
      status: 'FROZEN',
      statusLabel: 'FROZEN / MAIN SOURCE',
      health: 100,
      healthState: 'Canonical Baseline Locked',
      version: 'v2.0.0-FINAL',
      repoPath: 'main/argos-evolution-core',
      statistics: 'Core Mandates: Preserved | Status: Immutable Master Trunk',
      decoupleNotes: 'The canonical frozen core of ArgOS. Locked down to guarantee that all values, policies, pipelines, mandates, and immunology protocols stably persist and aren\'t diluted.'
    },
    {
      id: 'trading-engine',
      name: 'Quantitative-Trading Suite',
      status: 'ACTIVE',
      statusLabel: 'DEVELOPING BRANCH',
      health: 92,
      healthState: 'Evolving Early Build',
      version: 'v0.4.1-ALPHA',
      repoPath: 'branch/argos-trading-suite-dev',
      statistics: 'Active pipelines: Sandbox Setup | Execution Delay: Under Test',
      decoupleNotes: 'Active experimental branch offset from the frozen master source. Inherits all core principles but is under direct feature expansion and initial sandbox mock-ups.'
    },
    {
      id: 'lifeos-engine',
      name: 'Life OS Calibration Engine',
      status: 'ACTIVE',
      statusLabel: 'EVOLVING BRANCH',
      health: 96,
      healthState: 'Diagnostics Integrated',
      version: 'v0.9.0-BETA',
      repoPath: 'branch/argos-lifeos-calibrator',
      statistics: 'Active modules: Adaptive Onboarding | Specialist AI Coach',
      decoupleNotes: 'A reusable, niche-agnostic stage-based template engine featuring specialized AI coaching, diagnostic onboarding, and adaptive 90-day action plans.'
    },
    {
      id: 'api-gateway',
      name: 'Enterprise API Gateway',
      status: 'ACTIVE',
      statusLabel: 'ONLINE / RE-ROUTING',
      health: 98,
      healthState: 'Metabolic Audit Confirmed',
      version: 'v1.4.2-RELEASE',
      repoPath: 'branch/api-gateway-core',
      statistics: 'Active bindings: 3 | Protocol: JSON-RPC/REST',
      decoupleNotes: 'Translates downstream commands and subscriber hooks into safe localized event streams.'
    },
    {
      id: 'infra-bridge',
      name: 'Infrastructure Abstraction',
      status: 'STANDBY',
      statusLabel: 'STANDBY / INSTALLED',
      health: 100,
      healthState: 'Registry Compliant',
      version: 'v1.0.0-FINAL',
      repoPath: 'branch/platform-abstraction',
      statistics: 'Target: Multi-Cloud | IArgOSCapability Standard',
      decoupleNotes: 'Lazy initialization structures insulating memory against premature failures during runtime initialization.'
    }
  ];

  return (
    <div className="lg:col-span-12 flex flex-col gap-6 animate-fade-in">
      {/* Top Welcome Title Grid (Ecosystem Alignment) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border border-nexus-border/40 rounded-lg p-5 bg-nexus-surface/30 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-nexus-accent font-mono block mb-1">Architecture Overview</span>
          <h2 className="text-xl font-sans font-medium tracking-tight text-white">ArgOS Operational Command Hub</h2>
          <p className="text-xs text-nexus-muted mt-1 font-mono">
            A secure, framework-neutral environment utilizing clean capability registry protocols and decoupled operations.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-black/30 border border-nexus-border/30 px-3.5 py-2 rounded">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="font-mono text-[10px] tracking-wider text-nexus-subtle">
            SYSTEM_VITAL: <span className="text-emerald-400 font-bold">OPTIMAL</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Main Left Pane: The Unified ArgOS Chatbot Center */}
        <div id="argos-chatbot-container" className="xl:col-span-8 border border-nexus-border/50 rounded-lg bg-nexus-surface/50 flex flex-col min-h-[580px] h-[650px] shadow-lg relative overflow-hidden">
          {/* Box Header */}
          <div className="px-5 py-4 border-b border-nexus-border flex items-center justify-between bg-nexus-surface">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-nexus-accent/15 border border-nexus-accent/45 rounded text-nexus-accent">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2">
                  ArgOS Chatbot area
                </h3>
                <span className="text-[10px] font-mono text-nexus-accent block leading-none mt-0.5">
                  WORKSPACE_INTELLIGENCE // GEMINI_CONNECTED
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={clearChat}
                title="Reset log"
                className="p-1.5 hover:bg-nexus-border/40 border border-transparent hover:border-nexus-border/50 text-nexus-muted hover:text-red-400 rounded transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-nexus-border/30 px-2 py-1 rounded">
                <span className="text-[9px] font-mono text-nexus-muted">MODEL:</span>
                <span className="text-[9px] font-mono text-nexus-accent font-bold">gemini-3.5-flash</span>
              </div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-nexus-border text-nexus-subtle">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="p-3 bg-black/30 border-l border-nexus-accent/55 rounded font-mono text-[11px] text-nexus-accent tracking-wide leading-relaxed">
                    &gt; {msg.text}
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[85%] rounded px-4 py-3 border ${
                    isUser 
                      ? 'bg-nexus-accent/10 border-nexus-accent/30 text-white rounded-br-none' 
                      : 'bg-black/20 border-nexus-border/40 text-neutral-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-12 text-[9px] text-nexus-muted mb-1.5 font-sans">
                      <span className={`font-mono font-bold uppercase ${isUser ? 'text-nexus-accent' : 'text-nexus-subtle'}`}>
                        {isUser ? 'OPERATOR' : 'ARGOS_INTELLIGENCE'}
                      </span>
                      <span>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    {/* Preserve line breaks for clean multi-line system logs and layout response */}
                    <div className="whitespace-pre-line leading-relaxed text-[11px]">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start items-center gap-3 text-nexus-muted p-2 animate-pulse bg-black/10 rounded w-fit border border-dashed border-nexus-border/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-nexus-accent" />
                <span className="font-mono text-[10px]">THINKING_IN_PROGRESS: Resolving metadata and security variables...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Console */}
          <div className="p-4 border-t border-nexus-border bg-nexus-surface">
            <div className="flex items-center gap-3 bg-black/40 border border-nexus-border/60 rounded px-3 py-2 focus-within:border-nexus-accent/50 transition-all">
              <span className="text-nexus-accent font-bold font-mono pl-1">&gt;</span>
              <input 
                type="text"
                placeholder="Ask about active capability registries, modular compliance contracts, or decoupled branches..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs placeholder:text-nexus-muted placeholder:font-mono py-1 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !inputVal.trim()}
                className="px-3.5 py-1.5 bg-nexus-accent/15 hover:bg-nexus-accent/30 border border-nexus-accent/40 text-nexus-accent disabled:opacity-30 disabled:hover:bg-nexus-accent/15 rounded text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>TRANSMIT</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-nexus-muted mt-2 px-1 font-mono">
              <span>Type instructions clearly inside standard workspace margins</span>
              <span className="text-[10px] text-nexus-accent">ESC_SECURE // AES_256</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Branched Project Portfolio Indicator Windows (Bento styled grid with Window Tabs) */}
        <div className="xl:col-span-4 flex flex-col gap-5 h-full">
          <div className="border border-nexus-border/40 rounded-lg p-4 bg-nexus-surface/40 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-nexus-muted font-mono text-[10px] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-nexus-accent" />
                <h3>Decoupled Project Indicators</h3>
              </div>
              <h4 className="text-sm font-sans font-medium text-white tracking-tight mt-1">Ecosystem Repository Windows</h4>
              <p className="text-[11px] text-nexus-muted mt-1 leading-normal font-mono">
                Select a tab to inspect localized operations and metadata.
              </p>
            </div>

            {/* Window-style Tabs Header */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-md border border-nexus-border/30">
                {projectBranches.map((project) => {
                  const isActive = activeTabId === project.id;
                  let shortName = project.name;
                  if (project.id === 'argos-core') shortName = "ArgOS Core";
                  if (project.id === 'trading-engine') shortName = "Trading Suite";
                  if (project.id === 'lifeos-engine') shortName = "LifeOS Engine";
                  if (project.id === 'api-gateway') shortName = "API Gateway";
                  if (project.id === 'infra-bridge') shortName = "Infra Bridge";

                  return (
                    <button
                      key={project.id}
                      onClick={() => setActiveTabId(project.id)}
                      className={`flex-1 min-w-[80px] py-1.5 px-2 rounded font-mono text-[9px] uppercase tracking-wider transition-all text-center cursor-pointer ${
                        isActive
                          ? 'bg-nexus-accent/15 border border-nexus-accent/40 text-white font-bold'
                          : 'border border-transparent text-nexus-muted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {shortName}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Panel details */}
              {projectBranches.filter(p => p.id === activeTabId).map((project) => {
                const isFrozen = project.status === 'FROZEN';
                return (
                  <div 
                    key={project.id}
                    className={`border rounded-lg bg-black/30 p-4 flex flex-col gap-3.5 transition-all animate-fade-in ${
                      isFrozen 
                        ? 'border-red-950/50 relative overflow-hidden bg-red-950/5' 
                        : 'border-nexus-border/30'
                    }`}
                  >
                    {isFrozen && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500/10 border-l border-b border-red-500/25 text-red-500 text-[8px] font-mono tracking-wider font-bold">
                        DEC_LOCK
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-bold text-white group-hover:text-nexus-accent transition-colors">
                          {project.name}
                        </span>
                        <span className="text-[9px] font-mono text-nexus-muted tracking-wider mt-1 block">
                          PATH: {project.repoPath}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-[3px] text-[8px] font-mono font-bold tracking-wide uppercase border ${
                        isFrozen 
                          ? 'bg-red-500/10 border-red-500/30 text-red-500/90' 
                          : project.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : project.status === 'STANDBY'
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {project.statusLabel}
                      </span>
                    </div>

                    {/* Stats details */}
                    <div className="bg-black/50 p-3 rounded border border-nexus-border/10 grid grid-cols-2 gap-y-2 font-mono text-[10px] text-nexus-subtle leading-normal">
                      <div>Status Index: <span className="text-white font-bold">{project.healthState}</span></div>
                      <div>Engine Ver: <span className="text-white font-bold">{project.version}</span></div>
                      <div>Platform Score: <span className="text-emerald-400 font-bold">{project.health}%</span></div>
                      <div>Telemetry: <span className="text-white font-bold">Encrypted</span></div>
                      <div className="col-span-2 text-[9px] text-nexus-muted pt-2 border-t border-nexus-border/10">
                        {project.statistics}
                      </div>
                    </div>

                    {/* Explanatory subtitle */}
                    <div className="bg-nexus-surface/30 p-2.5 rounded border-l-2 border-nexus-accent/50">
                      <span className="text-[8px] uppercase tracking-wider text-nexus-accent font-mono block mb-1 font-bold">DECOUPLING HYGIENE</span>
                      <p className="text-[10px] text-nexus-muted italic font-mono leading-relaxed">
                        {project.decoupleNotes}
                      </p>
                    </div>

                    {/* Inspect trigger to consult chatbot */}
                    <button
                      onClick={() => triggerInspectQuery(project.name, project.decoupleNotes)}
                      className="w-full py-2 bg-nexus-accent/10 hover:bg-nexus-accent/20 border border-nexus-accent/30 hover:border-nexus-accent/50 text-nexus-accent rounded text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Inquire on this branch
                    </button>

                    {project.id === 'lifeos-engine' && setActiveModule && (
                      <button
                        onClick={() => setActiveModule("Life OS Engine")}
                        className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-400 rounded text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold mt-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        Execute Branch Workspace
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

