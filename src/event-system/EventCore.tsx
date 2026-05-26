import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle, logoutUser } from "../lib/firebase";

export interface SystemContextProps {
  serverStatus: string;
  isRunningDiagnostics: boolean;
  marketData: any;
  addAssistantMessage: (msg: string) => void;
  aggressionMatrix: { risk: number, neuralDepth: number };
  setAggressionMatrix: (matrix: { risk: number, neuralDepth: number }) => void;
  isAutoBotActive: boolean;
  setIsAutoBotActive: (active: boolean) => void;
  user: any;
  login: () => Promise<any>;
  logout: () => Promise<void>;
  isFirebaseReady: boolean;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverStatus, setServerStatus] = useState("CONNECTION_ESTABLISHED");
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  
  const [aggressionMatrix, setAggressionMatrix] = useState({ risk: 75, neuralDepth: 16 });
  const [isAutoBotActive, setIsAutoBotActive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    // Sync React user state automatically with Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsFirebaseReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setServerStatus("CONNECTION_ESTABLISHED");
    
    // Fetch market pulse and pass the entire real-time state object
    const fetchPulse = async () => {
      try {
        const res = await fetch("/api/market-pulse");
        if (res.ok) {
          const data = await res.json();
          setMarketData(data);
        }
      } catch (e) {}
    }
    
    fetchPulse();
    const iv = setInterval(fetchPulse, 2000);
    return () => clearInterval(iv);
  }, []);

  const addAssistantMessage = (msg: string) => {
    // Basic terminal logging wrapper
    console.log("[SYSTEM_CORE]", msg);
  };

  const login = async () => {
    return await loginWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
  };

  return (
    <SystemContext.Provider value={{ 
      serverStatus, isRunningDiagnostics, marketData, addAssistantMessage,
      aggressionMatrix, setAggressionMatrix,
      isAutoBotActive, setIsAutoBotActive,
      user, login, logout, isFirebaseReady
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be within SystemProvider");
  return ctx;
};
