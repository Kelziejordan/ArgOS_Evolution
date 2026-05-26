/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { SystemProvider, useSystem } from "./event-system/EventCore";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { StatusBar } from "./components/layout/StatusBar";
import { TerminalCore } from "./components/terminal/Terminal";
import { MarketPulse } from "./components/telemetry/MarketPulse";
import { TelemetryOverlay } from "./components/telemetry/TelemetryOverlay";
import { ImmuneDashboard } from "./components/telemetry/ImmuneDashboard";
import { FloatingChat } from "./components/terminal/FloatingChat";
import { LifeOSEngine } from "./components/niche/LifeOSEngine";

function SystemShell() {
  const [activeModule, setActiveModule] = useState("Command Hall");
  const { isRunningDiagnostics, addAssistantMessage } = useSystem();

  const handleShare = () => {
    const reportText = `argOS Platform Evolution: Health score PASS, registered interfaces verified. Standard IArgOSCapability compliance is 100%. Immune Sentinel Guard is active and SECURE.`;
    navigator.clipboard.writeText(reportText).then(() => {
      addAssistantMessage("PLATFORM_COMPLIANCE_LOG_COPIED_TO_CLIPBOARD. READY FOR SECURE LOG DISTRIBUTION.");
    });
  };

  const handleSetModule = (module: string) => {
    setActiveModule(module);
    addAssistantMessage(`INITIALIZING_${module.replace(' ', '_').toUpperCase()}_SUBSYSTEM...`);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <Sidebar activeModule={activeModule} setActiveModule={handleSetModule} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header onShare={handleShare} />

        <div className="flex-1 w-full max-w-4xl mx-auto p-6 overflow-y-auto">
          {activeModule === "Life OS Engine" && <LifeOSEngine setActiveModule={handleSetModule} />}
          {activeModule === "Command Hall" && <TerminalCore activeModule={activeModule} setActiveModule={handleSetModule} />}
          {activeModule === "Event Pipeline" && <TerminalCore activeModule={activeModule} />}
          {activeModule === "Immune System" && <ImmuneDashboard />}
        </div>
      </main>

      <FloatingChat activeModule={activeModule} />
    </div>
  );
}

export default function App() {
  return (
    <SystemProvider>
      <SystemShell />
    </SystemProvider>
  );
}
