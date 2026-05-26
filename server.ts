import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { marketState } from "./server/state/state";
import { getGemini } from "./server/organs/gemini";
import { bootSystem } from "./server/runtime/bootstrap";
import { capabilityRegistry } from "./server/services/contracts/RuntimeRegistry";
import { eventBus } from "./server/events/event-bus/Bus";
import { NexusEvent } from "./server/events/event-bus/Registry";
import { adaptiveSignalGenerator } from "./server/brain/adaptiveSignalGenerator";
import { positionManager } from "./server/runtime/positionManager";
import { approvalSystem } from "./server/services/approval/ApprovalSystem";
import { geneticEvolution } from "./server/memory/snapshots/genetics/Evolution";
import { healthMonitor } from "./server/services/execution/health/HealthMonitor";
import { replayEvents } from "./server/memory/replay/ReplayEngine";

dotenv.config();

import { getRecentEvents } from "./server/memory/events/Logger";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  
  const ai = getGemini();

  // Initialize adaptive generator early if not already initialized
  adaptiveSignalGenerator;
  geneticEvolution;
  healthMonitor;

  // Boot the System Architecture (Spinal Cord, Heart, Brain, Logic Gates)
  await bootSystem();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json(healthMonitor.getMetabolicStats());
  });

  app.get("/api/capabilities", (req, res) => {
    res.json(capabilityRegistry.list().map(cap => ({
      metadata: cap.metadata,
      health: cap.getHealth()
    })));
  });

  app.get("/api/market-pulse", (req, res) => {
    res.json(marketState);
  });

  app.get("/api/events", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const events = await getRecentEvents(limit);
    res.json(events);
  });

  app.post("/api/command", (req, res) => {
    const { command, args } = req.body;
    if (!command) return res.status(400).json({ error: "Missing command" });

    const ALLOWED_COMMANDS = ['ROLLBACK', 'KILL_SWITCH', 'REPLAY_STATE'];
    if (!ALLOWED_COMMANDS.includes(command)) {
      return res.status(400).json({
        error: "Unrecognized or unauthorized command",
        allowedCommands: ALLOWED_COMMANDS
      });
    }

    eventBus.dispatch(NexusEvent.COMMAND_RECEIVED, { command, args }, 'API_COMMAND_GATEWAY');
    res.json({ status: "ACKNOWLEDGED", command });
  });

  app.get("/api/signal-memory", (req, res) => {
    res.json(adaptiveSignalGenerator.getMemory());
  });

  app.get("/api/portfolio", (req, res) => {
    res.json(positionManager.getPortfolioState());
  });

  app.post("/api/close-position/:positionId", (req, res) => {
    const { positionId } = req.params;
    positionManager.emergencyClose(positionId);
    res.json({ status: 'closed' });
  });

  app.post("/api/close-all", (req, res) => {
    positionManager.closeAll();
    res.json({ status: 'all_closed' });
  });

  app.get("/api/approvals/pending", (req, res) => {
    res.json(approvalSystem.getQueue());
  });

  app.post("/api/diagnostics/storm", (req, res) => {
    for (let i = 0; i < 500; i++) {
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: `STORM_TEST_PACKET_${i}`, level: 'TEST' }, 'DIAGNOSTICS');
    }
    res.json({ status: "STORM_INITIATED" });
  });

  app.post("/api/diagnostics/replay", async (req, res) => {
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: `TEMPORAL REPLAY AUDIT INITIATED manually`, level: 'INFO' }, 'DIAGNOSTICS');
    await replayEvents();
    res.json({ status: "REPLAY_COMPLETED" });
  });
  
  app.post("/api/diagnostics/mutation-leak", (req, res) => {
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: `MUTATION_LEAK_TEST_PACKET`, level: 'TEST' }, 'DIAGNOSTICS');
    res.json({ status: "MUTATION_TEST_INITIATED" });
  });

  app.post("/api/approve/:token", (req, res) => {
    const { token } = req.params;
    
    // Check if token exists first
    const pending = approvalSystem.getQueue().find(req => req.token === token);
    if (!pending) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    approvalSystem.approve(token);
    res.json({ status: 'approved' });
  });

  app.post("/api/kraken/simulate", async (req, res) => {
    const { symbol, side, amount, aggression } = req.body;
    // Simulated paper trade execution with a 'delay' or 'slippage' based on aggression
    const delay = 500 + (1 - aggression) * 2000;
    
    setTimeout(() => {
      res.json({
        success: true,
        orderId: `KRAKEN-P-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'executed',
        symbol,
        side,
        price: side === 'buy' ? marketState.btc.price * 1.001 : marketState.btc.price * 0.999,
        timestamp: Date.now()
      });
    }, delay);
  });

  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.json({ text: "SYSTEM_DEGRADED: Neural processor (Gemini) disconnected. Environment variable GEMINI_API_KEY missing." });
      }
      
      const { message, customInstruction } = req.body;
      const defaultInstruction = "You are the ArgOS Workspace Intelligence. Your tone is highly professional, secure, and trustworthy. You handle questions about the ArgOS platform ecosystem, including active modular capability standards (IArgOSCapability registry), security-policy rules, temporal replay sandboxing, and enterprise scalability. When asked about specific project branches like the quantitative trading module, clearly explain that the main body of ArgOS (the core platform engine, its values, metrics pipelines, and immune protocols) is frozen and immutable to protect its integrity as the canonical master source. The quantitative trading suite, in turn, is an active developing branch created off this frozen ArgOS core, inheriting its structural safety principles while undergoing initial sandboxed build-out. Keep responses concisely formatted, helpful, and technically precise.";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: customInstruction || defaultInstruction,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      const errStr = String(error.message || "");
      if (errStr.includes("leaked") || errStr.includes("403") || errStr.includes("PERMISSION_DENIED") || errStr.includes("API key")) {
        return res.json({ 
          text: "⚠️ **SYSTEM_ALERT: NEURAL PROCESSOR NODE OFFLINE**\n\nThe current `GEMINI_API_KEY` has been reported as **leaked** or is **invalid**.\n\n### How to Resolve:\n1. Click on the **Settings (gear icon)** in the bottom-left corner of the AI Studio window.\n2. Navigate to **Secrets**.\n3. Locate the variable `GEMINI_API_KEY`.\n4. Input a fresh, valid Gemini API Key and save the settings.\n\n*No manual code modifications are necessary.*" 
        });
      }
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

startServer();
