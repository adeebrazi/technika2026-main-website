import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Sun,
  ExternalLink,
  QrCode,
  Lock,
  CheckCheck,
  ShieldAlert,
  Clock,
  Copy,
  X,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";

import ajuLogo from "@/assets/logo.webp";
import technikaLogo from "@/assets/technika_logo.webp";

export const Route = createFileRoute("/whatsapp")({
  component: WhatsAppAllocationPage,
});

interface WhatsAppGroup {
  id: number;
  name: string;
  tag: string;
  link: string;
  count: number;
  status: "OPEN" | "LOCKED" | "FROZEN";
  accent: string;
}

interface WhatsAppState {
  limit: number;
  groups: WhatsAppGroup[];
  activeGroupId: number | null;
  totalJoined: number;
  totalCapacity: number;
  totalRemaining: number;
  allFull: boolean;
}

interface ToastItem {
  id: number;
  title: string;
  message: string;
  bg?: string;
  text?: string;
}

const DEFAULT_STATE: WhatsAppState = {
  limit: 1000,
  groups: [
    {
      id: 1,
      name: "Group Alpha",
      tag: "Alpha",
      link: "https://chat.whatsapp.com/JGuwj0BeaqXHtaOT8azHtc",
      count: 0,
      status: "OPEN",
      accent: "#00FF66",
    },
    {
      id: 2,
      name: "Group Beta",
      tag: "Beta",
      link: "https://chat.whatsapp.com/CjfVMQB3G8oA9IlKH3RTXm",
      count: 0,
      status: "LOCKED",
      accent: "#FFE600",
    },
    {
      id: 3,
      name: "Group Gamma",
      tag: "Gamma",
      link: "https://chat.whatsapp.com/invite-gamma-03",
      count: 0,
      status: "LOCKED",
      accent: "#00D8F6",
    },
    {
      id: 4,
      name: "Group Delta",
      tag: "Delta",
      link: "https://chat.whatsapp.com/invite-delta-04",
      count: 0,
      status: "LOCKED",
      accent: "#FF007F",
    },
  ],
  activeGroupId: 1,
  totalJoined: 0,
  totalCapacity: 4000,
  totalRemaining: 4000,
  allFull: false,
};

function triggerConfetti() {
  if (typeof window === "undefined") return;
  const anyWindow = window as any;
  if (anyWindow.confetti) {
    anyWindow.confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  } else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js";
    script.onload = () => {
      if ((window as any).confetti) {
        (window as any).confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    };
    document.body.appendChild(script);
  }
}

function WhatsAppAllocationPage() {
  const [appState, setAppState] = useState<WhatsAppState>(DEFAULT_STATE);
  const previousStateRef = useRef<WhatsAppState | null>(null);
  const [qrModalGroup, setQrModalGroup] = useState<WhatsAppGroup | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [soeitExpanded, setSoeitExpanded] = useState(false);
  const [ajuExpanded, setAjuExpanded] = useState(false);

  // Theme state matching Technika 6.0 Main Website
  const [theme, setTheme] = useState<"main" | "light">(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem("technika_theme");
      if (saved === "main") return "main";
      if (saved === "light") return "light";
    }
    return "main";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "main" ? "light" : "main"));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.remove("dark", "theme-main", "theme-light");
    if (theme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.add("dark", "theme-main");
    }
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("technika_theme", theme);
    }
  }, [theme]);

  // Toast notification helper
  const addToast = (
    title: string,
    message: string,
    bg = "bg-[var(--brut-lime)]",
    text = "text-black",
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, bg, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // State update handler with auto-rollover detection
  const handleStateUpdate = (newState: WhatsAppState) => {
    const prev = previousStateRef.current;
    if (prev && prev.activeGroupId !== newState.activeGroupId) {
      const prevId = prev.activeGroupId;
      const nextId = newState.activeGroupId;

      if (prevId && nextId) {
        triggerConfetti();
        addToast(
          "⚡ AUTO-ROLLOVER TRIGGERED!",
          `Group #${prevId} reached 1,000 members and is FROZEN! Group #${nextId} is now OPEN!`,
          "bg-[var(--brut-yellow)]",
          "text-black",
        );
      } else if (newState.allFull) {
        addToast(
          "🏆 ALL 4 GROUPS ARE FULL!",
          "All 4,000 seats across all squads have reached maximum capacity!",
          "bg-[var(--brut-pink)]",
          "text-white",
        );
      }
    }

    previousStateRef.current = JSON.parse(JSON.stringify(newState));
    setAppState(newState);
  };

  // Fetch state from API with fallback
  const fetchStatus = async () => {
    try {
      // Primary: try relative rewrite endpoint
      let res = await fetch("/api/whatsapp/status").catch(() => null);
      if (!res || !res.ok) {
        // Fallback: try direct backend URL
        res = await fetch("https://reg.technika2026.online/api/whatsapp/status").catch(() => null);
      }
      if (res && res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data && Array.isArray(data.groups)) {
            handleStateUpdate(data);
          }
        }
      }
    } catch (err) {
      // Keep running with last known state
    }
  };

  // Setup SSE connection and fallback polling
  useEffect(() => {
    fetchStatus();

    let sse: EventSource | null = null;
    try {
      if (typeof window !== "undefined" && window.EventSource) {
        sse = new EventSource("/api/whatsapp/events");
        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && Array.isArray(data.groups)) {
              handleStateUpdate(data);
            }
          } catch (e) {}
        };
      }
    } catch (e) {}

    // Fallback polling every 3 seconds for guaranteed real-time updates
    const interval = setInterval(fetchStatus, 3000);

    return () => {
      if (sse) sse.close();
      clearInterval(interval);
    };
  }, []);

  // Join WhatsApp Group handler
  const handleJoinGroup = async (groupId: number) => {
    const targetGroup = appState.groups.find((g) => g.id === groupId);
    if (!targetGroup || targetGroup.status !== "OPEN") {
      addToast("Group Unavailable", "This squad is not currently accepting joins.", "bg-rose-200");
      return;
    }

    const claimKey = `claimed_seat_group_${groupId}`;
    if (typeof window !== "undefined" && localStorage.getItem(claimKey)) {
      addToast(
        "Already Registered",
        "Seat already secured! Opening your WhatsApp group directly ↗",
        "bg-[var(--brut-yellow)]",
      );
      window.open(targetGroup.link, "_blank");
      return;
    }

    try {
      let res = await fetch("/api/whatsapp/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch("https://reg.technika2026.online/api/whatsapp/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success) {
          if (typeof window !== "undefined") {
            localStorage.setItem(claimKey, "true");
          }
          const link = data.whatsappUrl || targetGroup.link;
          window.open(link, "_blank");
          if (data.state) {
            handleStateUpdate(data.state);
          }
        } else {
          addToast("Cannot Join", data.message || "Group is full.", "bg-rose-200");
        }
      } else {
        // Fallback: open link directly
        window.open(targetGroup.link, "_blank");
      }
    } catch (err) {
      window.open(targetGroup.link, "_blank");
    }
  };

  const copyGroupLink = (link: string, name: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        addToast("Link Copied!", `WhatsApp link for ${name} copied to clipboard.`, "bg-[var(--brut-lime)]");
      }).catch(() => {
        addToast("Notice", `Invite Link: ${link}`, "bg-[var(--brut-yellow)]");
      });
    }
  };

  return (
    <div className="min-h-screen text-foreground select-none">
      {/* NAVBAR */}
      <header
        id="header"
        className="sticky top-0 inset-x-0 z-50 bg-[var(--brut-yellow)] border-b-[3px] border-black transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
          {/* Brand Logos */}
          <div
            className="flex items-center gap-2.5 mr-4 md:mr-6 shrink-0 cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined") window.location.href = "/";
            }}
          >
            <a href="/" className="flex items-center gap-2.5">
              <img
                src={ajuLogo}
                alt="ARKA JAIN University Logo"
                className="h-8 md:h-9.5 w-auto object-contain"
              />
              <div className="w-[2px] h-6 bg-black/30 hidden sm:block" />
              <img
                src={technikaLogo}
                alt="Technika Logo"
                className="h-8 md:h-9.5 w-auto object-contain border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hidden sm:block bg-black"
              />
            </a>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Brochure Link Button */}
            <a
              href="https://drive.google.com/file/d/1-g7Yprsh08tiBgp-xHWKInLqNxO1YFs_/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-black uppercase bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition shrink-0"
            >
              <span>Brochure</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>

            {/* Rotary Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition shrink-0 cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {/* Rotating Pointer Ring */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
                style={{
                  transform: theme === "main" ? "rotate(0deg)" : "rotate(180deg)",
                }}
              >
                <span className="absolute -top-0.5 w-1.5 h-2 bg-black rounded-full" />
                <span className="absolute -bottom-0.5 w-1 h-1 bg-black/40 rounded-full" />
              </div>

              {/* Theme Icon */}
              <div className="relative z-10 transition-transform duration-300 pointer-events-none flex items-center justify-center">
                {theme === "main" ? (
                  <Sparkles className="w-4 h-4 text-black" />
                ) : (
                  <Sun className="w-4 h-4 text-black" />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-10 sm:pt-6 sm:pb-12">
        {/* COMPACT NEO-BRUTALIST BRANDING HEADER */}
        <div className="mb-6 sm:mb-8 text-center select-none">
          {/* 1. JOIN BADGE */}
          <div className="inline-block mb-1.5 sm:mb-2">
            <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider bg-[var(--brut-lime)] text-black border-[3px] border-black px-3.5 sm:px-5 py-0.5 sm:py-1 inline-block shadow-[2px_2px_0px_#000]">
              JOIN
            </span>
          </div>

          {/* 2. TECH NIKA 6.0 */}
          <div className="font-display font-black text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight uppercase my-1.5 sm:my-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span>TECH</span>
              <span className="bg-[var(--brut-pink)] text-white border-[3px] border-black px-2.5 sm:px-3.5 py-0.5 -rotate-2 inline-block shadow-[2.5px_2.5px_0px_#000]">
                NIKA
              </span>
              <span>6.0</span>
            </div>
          </div>

          {/* 3. OFFICIAL WHATSAPP GROUPS BADGE */}
          <div className="inline-block mt-1 sm:mt-1.5">
            <span className="font-display font-black text-xs sm:text-sm md:text-base uppercase tracking-wider bg-[var(--brut-lime)] text-black border-[3px] border-black px-3.5 sm:px-5 py-0.5 sm:py-1 inline-block shadow-[2px_2px_0px_#000]">
              OFFICIAL WHATSAPP GROUPS
            </span>
          </div>
        </div>

        {/* 4 WHATSAPP GROUP CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {appState.groups.map((group) => {
            const seatsAvailable = Math.max(0, appState.limit - group.count);
            const pct = Math.min(100, Math.round((group.count / appState.limit) * 100));
            const isOpen = group.status === "OPEN";
            const isFrozen = group.status === "FROZEN";
            const accent = group.accent || "#00FF66";
            const textOnAccent = "#000000";

            let queueNote = "";
            if (group.id === 2) queueNote = "UNLOCKS AFTER ALPHA";
            else if (group.id === 3) queueNote = "UNLOCKS AFTER BETA";
            else if (group.id === 4) queueNote = "UNLOCKS AFTER GAMMA";

            // Watermark opacity calibration
            const watermarkOpacity =
              group.id === 4
                ? "opacity-[0.22] dark:opacity-[0.28]"
                : group.id === 1
                  ? "opacity-[0.14] dark:opacity-[0.18]"
                  : "opacity-[0.12] dark:opacity-[0.15]";

            return (
              <div
                key={group.id}
                className={`relative border-[3px] border-black bg-card text-card-foreground flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "shadow-[6px_6px_0px_#000]"
                    : "opacity-90 hover:opacity-100 hover:shadow-[6px_6px_0px_#000]"
                } hover:-translate-y-1`}
              >
                {/* Signature Accent Top Color Band */}
                <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Number Badge + Group Name + Status */}
                    <div className="flex items-center justify-between pb-3 mb-3.5 border-b-2 border-border/40">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 flex items-center justify-center font-display font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000]"
                          style={{ backgroundColor: accent, color: textOnAccent }}
                        >
                          0{group.id}
                        </span>
                        <h3 className="font-display font-black text-base uppercase tracking-tight m-0 text-foreground">
                          {group.name}
                        </h3>
                      </div>

                      <div>
                        {isOpen ? (
                          <span
                            className="inline-flex items-center gap-1.5 font-display font-black text-[11px] uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000]"
                            style={{ backgroundColor: accent, color: textOnAccent }}
                          >
                            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                            <span>ACTIVE NOW</span>
                          </span>
                        ) : isFrozen ? (
                          <span className="inline-flex items-center gap-1 bg-red-600 text-white font-display font-black text-[11px] uppercase px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                            <CheckCheck className="w-3.5 h-3.5 text-white" />
                            <span>1,000 / 1,000 FILLED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-display font-bold text-[11px] uppercase px-2 py-0.5 border-2 border-border/40 bg-black/10 dark:bg-white/10 text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            <span>STANDBY</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metric Box with Watermark */}
                    <div className="relative p-3.5 border-2 border-border/60 bg-black/5 dark:bg-black/30 mb-3.5 overflow-hidden">
                      {/* Watermark Numeral */}
                      <div
                        className={`absolute right-1 -bottom-3 font-display font-black text-7xl select-none pointer-events-none ${watermarkOpacity}`}
                        style={{ color: accent }}
                      >
                        0{group.id}
                      </div>

                      {/* Header label */}
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                        <span>QUOTA STATUS</span>
                        <span>CAP: {appState.limit}</span>
                      </div>

                      {/* Seat Counter */}
                      <div
                        className={`font-display font-black text-4xl sm:text-5xl tabular-nums leading-none tracking-tight my-1 ${
                          isOpen ? "" : "opacity-85"
                        }`}
                        style={{ color: accent }}
                      >
                        {seatsAvailable.toLocaleString()}
                      </div>

                      {/* Footer micro-label */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/15 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider">
                        <span className="opacity-80">SEATS AVAILABLE</span>
                        <span className="font-mono text-[10px] opacity-75">
                          {group.count} JOINED
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Capacity */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                        <span className="opacity-70">CAPACITY</span>
                        <span
                          className="font-mono font-bold"
                          style={{ color: isOpen ? accent : "inherit" }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 border-2 border-black overflow-hidden bg-black/30">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${Math.max(pct, isOpen ? 2 : 0)}%`,
                            backgroundColor: accent,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action / Standby Footer */}
                  <div className="mt-3.5 pt-3 border-t-2 border-border/40">
                    {isOpen ? (
                      <>
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="w-full py-3 px-3 font-display font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-1.5 border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition cursor-pointer"
                          style={{ backgroundColor: accent, color: textOnAccent }}
                        >
                          <span>JOIN WHATSAPP GROUP</span>
                          <ArrowUpRight className="w-4 h-4" style={{ color: textOnAccent }} />
                        </button>
                        <button
                          onClick={() => setQrModalGroup(group)}
                          className="w-full mt-2 py-1.5 px-3 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 font-display font-bold text-[11px] uppercase border border-black/30 dark:border-white/20 flex items-center justify-center gap-1.5 transition text-foreground cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>SCAN ON MOBILE</span>
                        </button>
                      </>
                    ) : isFrozen ? (
                      <div className="w-full py-3 px-3 bg-red-950/40 text-red-300 font-display font-bold text-xs uppercase border-2 border-red-600/60 flex items-center justify-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        <span>GROUP FULL · FROZEN</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-full py-2.5 px-3 bg-black/10 dark:bg-white/10 text-muted-foreground font-display font-bold text-xs uppercase border-2 border-border/40 flex items-center justify-center gap-1.5 select-none">
                          <Clock className="w-3.5 h-3.5 opacity-70" />
                          <span>{queueNote}</span>
                        </div>
                        <div className="text-[10px] text-center font-semibold uppercase tracking-wider opacity-60 mt-2 select-none">
                          Auto-opens at 1,000 members
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-black bg-[var(--brut-yellow)] text-black pt-10 pb-8 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1: TECHNIKA 6.0 */}
            <div>
              <div className="font-display font-black text-2xl uppercase tracking-tight text-black flex items-center gap-2">
                <span>TECHNIKA</span>
                <span className="bg-black text-white px-2 py-0.5 text-lg shadow-[2px_2px_0px_#000]">
                  6.0
                </span>
              </div>
              <p className="text-xs font-semibold mt-3 leading-relaxed text-black">
                Technika 6.0 is the flagship techno-cultural extravaganza of ARKA JAIN University's
                School of Engineering & IT. A 2-day playground where 40+ events, robotics arenas,
                coding battles, and live concerts ignite creativity and technology.
              </p>
            </div>

            {/* Col 2: SCHOOL OF ENGINEERING & IT */}
            <div>
              <div className="font-display font-black text-base uppercase inline-block bg-[var(--brut-pink)] text-white border-[2px] border-black px-2.5 py-0.5 shadow-[2px_2px_0px_#000] mb-3">
                School of Engineering & IT
              </div>
              <div className="text-xs font-semibold text-black leading-relaxed space-y-2">
                <p>
                  The School of Engineering & IT at ARKA JAIN University stands as a center of
                  technological innovation, academic excellence, and future-ready education. With a
                  strong emphasis on research, practical learning, and emerging technologies, the
                  school provides students with a dynamic platform to explore, innovate, and lead.
                </p>
                {soeitExpanded && (
                  <p className="mt-2">
                    Our programmes, ranging from Diploma, B.Tech, BCA, MCA, and M.Tech; cover
                    cutting-edge domains such as Computer Science, Artificial Intelligence & Machine
                    Learning, Data Science, Mechanical Engineering, Electrical & Electronics
                    Engineering, and more.
                  </p>
                )}
                <button
                  onClick={() => setSoeitExpanded((prev) => !prev)}
                  className="bg-white text-black px-2.5 py-1 text-[10px] font-black uppercase mt-2 inline-flex items-center gap-1 border-[2px] border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <span>{soeitExpanded ? "READ LESS" : "READ MORE"}</span>
                  <span>{soeitExpanded ? "▲" : "▼"}</span>
                </button>
              </div>
            </div>

            {/* Col 3: ARKA JAIN UNIVERSITY */}
            <div>
              <div className="font-display font-black text-base uppercase inline-block bg-[var(--brut-blue)] text-black border-[2px] border-black px-2.5 py-0.5 shadow-[2px_2px_0px_#000] mb-3">
                ARKA JAIN University
              </div>
              <div className="text-xs font-semibold text-black leading-relaxed space-y-2">
                <p>
                  ARKA JAIN University was established in the year 2017 by the Jharkhand State
                  Legislature under “The ARKA JAIN University Act” and is recognized by the UGC. It
                  is the first state private university in the Kolhan region.
                </p>
                {ajuExpanded && (
                  <p className="mt-2">
                    The University is accredited with NAAC ‘A’ Grade in its first cycle and is the
                    first state private university in Bihar, Jharkhand, and West Bengal to achieve
                    this distinction. ARKA JAIN University is part of the prestigious JAIN Group,
                    Bengaluru, which has more than 77 educational institutions under its umbrella.
                  </p>
                )}
                <button
                  onClick={() => setAjuExpanded((prev) => !prev)}
                  className="bg-white text-black px-2.5 py-1 text-[10px] font-black uppercase mt-2 inline-flex items-center gap-1 border-[2px] border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <span>{ajuExpanded ? "READ LESS" : "READ MORE"}</span>
                  <span>{ajuExpanded ? "▲" : "▼"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Social Links & Copyright */}
          <div className="border-t-[2px] border-black mt-8 pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs mb-6">
              {/* Technika Socials */}
              <div className="flex items-center gap-2">
                <span className="font-black uppercase text-[11px] text-black">Technika Socials</span>
                <a
                  href="https://instagram.com/technika_aju"
                  target="_blank"
                  rel="noreferrer"
                  className="border-[2px] border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000]"
                >
                  Instagram
                </a>
                <a
                  href="https://linkedin.com/company/technika-aju"
                  target="_blank"
                  rel="noreferrer"
                  className="border-[2px] border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000]"
                >
                  LinkedIn
                </a>
              </div>

              <div className="w-0.5 h-3 bg-black/40 hidden md:block" />

              {/* SOEIT Socials */}
              <div className="flex items-center gap-2">
                <span className="font-black uppercase text-[11px] text-black">SOEIT Socials</span>
                <a
                  href="https://instagram.com/soeit_aju"
                  target="_blank"
                  rel="noreferrer"
                  className="border-[2px] border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000]"
                >
                  Instagram
                </a>
                <a
                  href="https://linkedin.com/school/arka-jain-university"
                  target="_blank"
                  rel="noreferrer"
                  className="border-[2px] border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000]"
                >
                  LinkedIn
                </a>
              </div>

              <div className="w-0.5 h-3 bg-black/40 hidden md:block" />

              {/* AJU Socials */}
              <div className="flex items-center gap-2">
                <span className="font-black uppercase text-[11px] text-black">AJU Socials</span>
                <a
                  href="https://arkajainuniversity.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="border-[2px] border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000]"
                >
                  Website
                </a>
                <a
                  href="https://instagram.com/arkajainuniversity"
                  target="_blank"
                  rel="noreferrer"
                  className="border-[2px] border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000]"
                >
                  Instagram
                </a>
              </div>
            </div>

            <div className="text-center font-display font-black text-[11px] uppercase tracking-wider text-black">
              © 2026 ARKA JAIN UNIVERSITY · SCHOOL OF ENGINEERING & IT · TECHNIKA 6.0
            </div>
          </div>
        </div>
      </footer>

      {/* QR CODE MODAL FOR MOBILE SCAN */}
      {qrModalGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black border-[3px] border-black p-6 max-w-sm w-full shadow-[10px_10px_0px_#000] relative text-center">
            <button
              onClick={() => setQrModalGroup(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black text-white flex items-center justify-center font-black hover:bg-red-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-block bg-[var(--brut-lime)] text-black border-[2px] border-black px-2 py-0.5 text-xs font-black uppercase mb-3 -rotate-1 shadow-[2px_2px_0px_#000]">
              📱 Scan on Mobile
            </div>

            <h3 className="font-display font-black text-xl uppercase mb-1">
              {qrModalGroup.name} ({qrModalGroup.tag})
            </h3>
            <p className="text-xs text-gray-600 font-semibold mb-4">
              Scan this QR code with your phone camera to join directly.
            </p>

            <div className="p-3 bg-white border-[2px] border-black inline-block shadow-[4px_4px_0px_#000] mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  qrModalGroup.link,
                )}`}
                alt="WhatsApp QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyGroupLink(qrModalGroup.link, qrModalGroup.name)}
                className="flex-1 border-[2px] border-black bg-[var(--brut-yellow)] text-black text-xs font-black uppercase py-2 flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={() => setQrModalGroup(null)}
                className="flex-1 border-[2px] border-black bg-black text-white text-xs font-black uppercase py-2 shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${t.bg || "bg-[var(--brut-lime)]"} ${
              t.text || "text-black"
            } border-[3px] border-black p-4 pointer-events-auto max-w-sm flex items-start gap-3 shadow-[5px_5px_0px_#000] transition-all`}
          >
            <div className="mt-0.5 font-black text-lg">⚡</div>
            <div className="flex-1">
              <div className="font-display font-black text-sm uppercase">{t.title}</div>
              <div className="text-xs font-semibold mt-0.5">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
