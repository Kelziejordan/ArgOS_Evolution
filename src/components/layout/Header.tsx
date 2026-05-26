import React from 'react';
import { useSystem } from "../../event-system/EventCore";
import { LogIn, LogOut, User, ShieldAlert } from "lucide-react";

export function Header({ onShare }: { onShare: () => void }) {
  const { user, login, logout, isFirebaseReady } = useSystem();

  return (
    <header className="flex justify-between items-center p-4 border-b border-nexus-border bg-nexus-surface/50">
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-sm tracking-widest text-nexus-accent font-semibold">argOS // COMMAND CENTER</h1>
        {isFirebaseReady && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-nexus-border bg-black/30 text-[9px] font-mono">
            {user ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400 font-bold">SECURE_LINK ENABLED</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className="text-amber-400 font-bold">UNAUTHENTICATED GUEST</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isFirebaseReady && (
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3 px-3 py-1 bg-black/20 border border-nexus-border rounded-lg">
                <img 
                  src={user.photoURL || ""} 
                  alt={user.displayName || "Operator"} 
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full border border-nexus-accent/40"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[9px] font-mono font-bold leading-none text-white">{user.displayName || "Operator"}</span>
                  <span className="text-[8px] font-mono text-nexus-muted leading-none mt-0.5">{user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="ml-1 p-1 text-nexus-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                  title="Disconnect Sovereign Link"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 px-3 py-1 bg-nexus-accent hover:bg-nexus-accent/80 text-white text-[10px] font-mono tracking-widest uppercase rounded border border-nexus-accent transition-all cursor-pointer shadow-[0_0_8px_rgba(59,130,246,0.2)]"
              >
                <LogIn className="w-3 h-3" />
                Establish Sovereign Auth
              </button>
            )}
          </div>
        )}
        <button onClick={onShare} className="px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 hover:bg-nexus-accent/20 text-nexus-accent text-[10px] font-mono tracking-widest uppercase rounded cursor-pointer transition-all">
          SHARE LOG
        </button>
      </div>
    </header>
  );
}
