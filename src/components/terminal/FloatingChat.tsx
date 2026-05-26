import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Trash2, 
  Loader2, 
  Bot, 
  Lock, 
  Maximize2,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export function FloatingChat({ activeModule }: { activeModule: string }) {
  // Only render on pages other than the home page/Command Hall (which already focus on the chat area)
  if (activeModule === 'Command Hall' || activeModule === 'Event Pipeline') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with standard ArgOS welcome greeting
  useEffect(() => {
    setMessages([
      {
        id: 'float-welcome',
        sender: 'system',
        text: `ROUTING: Workspace link secure. Listening from "${activeModule}" module context.`,
        timestamp: new Date()
      },
      {
        id: 'float-intro',
        sender: 'assistant',
        text: `Greetings. I am ArgOS Workspace Intelligence. I am running as a secure overlay daemon while you inspect the ${activeModule} subsystem. Ask me any conceptual platform questions.`,
        timestamp: new Date()
      }
    ]);
  }, [activeModule]);

  // Alert highlight for unopened messages
  useEffect(() => {
    if (messages.length > 2 && !isOpen) {
      setHasNewMessage(true);
    }
  }, [messages.length, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async () => {
    const textToSend = inputVal.trim();
    if (!textToSend) return;

    setInputVal('');
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          text: data.text || 'Error parsing response.',
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
        text: `SEC_CONN_ERR: Failed to process query. Details: ${err?.message || 'Check connection'}`,
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
        id: 'float-clear',
        sender: 'system',
        text: 'OVERLAY_HYGIENE: Chat logs flushed. Overlay session reset.',
        timestamp: new Date()
      }
    ]);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="w-[380px] h-[500px] bg-nexus-surface/95 border border-nexus-border/80 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col mb-4 backdrop-blur-md"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-nexus-border/60 bg-nexus-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-white uppercase tracking-wider leading-none">
                    ArgOS Overlay Workspace
                  </h4>
                  <span className="text-[9px] font-mono text-nexus-accent leading-none block mt-1">
                    CONTEXT: {activeModule.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  title="Reset Overlay Logs"
                  className="p-1 text-nexus-muted hover:text-red-400 hover:bg-black/20 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={toggleOpen}
                  className="p-1 text-nexus-muted hover:text-white hover:bg-black/20 rounded transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Banner detailing Sandboxed security */}
            <div className="bg-black/40 px-3 py-1.5 border-b border-nexus-border/20 flex items-center justify-between text-[8px] font-mono tracking-wide text-nexus-muted">
              <span className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-nexus-accent" />
                SECURE CONFINEMENT PASS
              </span>
              <span className="text-emerald-400 font-bold">100% ISOLATED</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-nexus-border">
              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div 
                      key={msg.id} 
                      className="p-2.5 bg-black/45 border-l border-nexus-accent/40 rounded text-[9px] font-mono text-nexus-accent leading-normal whitespace-pre-line"
                    >
                      &gt; {msg.text}
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded text-[10px] font-mono border leading-relaxed ${
                      isUser 
                        ? 'bg-nexus-accent/10 border-nexus-accent/30 text-white rounded-br-none' 
                        : 'bg-black/30 border-nexus-border/30 text-neutral-200 rounded-bl-none'
                    }`}>
                      <div className="text-[8px] text-nexus-muted mb-1 flex items-center justify-between">
                        <span className="font-bold">{isUser ? 'OPERATOR' : 'ARGOS_INTELLIGENCE'}</span>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-line leading-normal">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 p-2 bg-black/25 rounded border border-nexus-border/20 w-fit">
                  <Loader2 className="w-3 h-3 animate-spin text-nexus-accent" />
                  <span className="text-[9px] font-mono text-nexus-muted">RESOLVING ENVIRONMENT VALUES...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-nexus-border/60 bg-nexus-surface/90 flex gap-2">
              <input
                type="text"
                placeholder="Submit inquiry here..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 bg-black/40 border border-nexus-border/60 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono focus:border-nexus-accent/40 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputVal.trim()}
                className="p-1.5 bg-nexus-accent/15 hover:bg-nexus-accent/35 text-nexus-accent hover:text-white rounded border border-nexus-accent/50 cursor-pointer disabled:opacity-20 flex items-center justify-center transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-nexus-surface border-2 border-nexus-accent/70 hover:border-nexus-accent hover:shadow-[0_0_15px_rgba(143,162,188,0.35)] p-4 rounded-full text-nexus-accent cursor-pointer transition-all flex items-center justify-center shadow-lg"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6 text-nexus-accent" />
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-nexus-surface animate-bounce shadow"></span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
