import { createFileRoute } from "@tanstack/react-router";
import ajuLogo from "@/assets/logo.png";
import technikaLogo from "@/assets/technika_logo.jpg";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Sun } from "lucide-react";
import eventsData from "@/data/events.json";
import timelineData from "@/data/timeline.json";
import sponsorsData from "@/data/sponsors.json";
import organisersData from "@/data/organisers.json";
import galleryData from "@/data/gallery.json";
import contactData from "@/data/contact.json";
import configData from "@/data/config.json";

export const Route = createFileRoute("/")({
  component: Index,
});

const BRUT_COLORS = [
  "var(--brut-yellow)",
  "var(--brut-pink)",
  "var(--brut-blue)",
  "var(--brut-lime)",
  "var(--brut-orange)",
];

const PROVIDED_PHOTOS = [
  "/021A0244.JPG",
  "/021A0059.JPG",
  "/021A0104.JPG",
  "/021A0129.JPG",
  "/021A0140.JPG",
  "/021A0164.JPG",
  "/021A0239.JPG",
  "/021A0262.JPG",
  "/021A9976.JPG",
];

function getEventPhoto(id: string, index: number) {
  const eventId = id.toLowerCase();
  
  const normalizedMap: Record<string, string> = {
    "code-busters": "/code-buster.jpg",
    "code-buster": "/code-buster.jpg",
    "red-tech": "/red-tech.jpg",
    "robo-wars": "/robo-wars.jpg",
    "robo-race": "/robo-race.jpg",
    "robo-pick-n-place": "/robo-pick-n-place.jpg",
    "intelliquest": "/intelliquest.jpg",
    "brainstorm-battle": "/brainstorm-battle.jpg",
    "circuit-crafter": "/circuit-crafter.jpg",
    "electrofix-challenge": "/electrofix-challenge.jpg",
    "junkyard-wars": "/junkyard-wars.jpg",
    "ai-quizathon": "/ai-quizathon.jpg",
    "ecoai-challenge": "/ecoai-challenge.jpg",
    "project-model-exhibition": "/project-model-exhibition.jpg",
    "coding-ladder": "/coding-ladder.jpg",
    "web-wizard": "/web-wizard.jpg",
    "cyber-shield": "/cyber-shield.jpg",
    "app-attack": "/app-attack.jpg",
    "data-dash": "/data-dash.jpg",
    "design-dash": "/design-dash.jpg",
    "load-bridging": "/load-bridging.png",
    "poster-presentation": "/poster-presentation.png",
    "face-painting": "/face-painting.png",
    "pot-painting": "/pot-painting.png",
    "photography": "/photography.png",
    "greenearth-challenge": "/greenearth-challenge.png",
    "cricket": "/cricket.png",
    "need-for-speed": "/need-for-speed.png",
    "bgmi": "/bgmi.png",
    "free-fire": "/free-fire.png",
    "technical-debate": "/technical-debate.png",
    "group-ramp-walk": "/group-ramp-walk.png",
    "solo-ramp-walk": "/solo-ramp-walk.png",
    "treasure-hunt": "/treasure-hunt.png",
    "tug-of-war": "/tug-of-war.png",
    "sudoku": "/sudoku.png",
    "fire-free-cooking": "/fire-free-cooking.png",
    "solo-singing": "/solo-singing.jpg",
    "solo-dance": "/solo-dance.jpg",
    "group-singing": "/group-singing.png",
    "group-dance": "/group-dance.png",
    "rap": "/rap.png",
    "beat-boxing": "/beat-boxing.png",
    "poetry": "/poetry.png",
    "story-telling": "/story-telling.png",
    "art-attack": "/art-attack.png"
  };

  if (normalizedMap[eventId]) {
    return normalizedMap[eventId];
  }

  return PROVIDED_PHOTOS[index % PROVIDED_PHOTOS.length];
}

function PixelDissolveImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (src !== currentSrc) {
      setPrevSrc(currentSrc);
      setCurrentSrc(src);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevSrc(null);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [src, currentSrc]);

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      {/* Underlying Previous Outgoing Image */}
      {prevSrc && (
        <img
          src={prevSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 contrast-95"
        />
      )}

      {/* Incoming New Image with Stepped Pixel Dissolve Animation */}
      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover z-10 ${
          isTransitioning ? "pixel-dissolve-enter" : ""
        }`}
      />

      {/* Overlay Pixel Mosaic Block Grid Effect during crossfade */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 pointer-events-none grid grid-cols-8 grid-rows-6 opacity-40 mix-blend-overlay">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="bg-black/60 border border-white/20 animate-pulse"
              style={{
                animationDelay: `${(i % 8) * 35}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandableFooterText({
  shortContent,
  fullContent,
}: {
  shortContent: React.ReactNode;
  fullContent: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 text-black">
      <div className="text-xs font-semibold leading-relaxed text-black">
        {isExpanded ? fullContent : shortContent}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-[10px] font-black uppercase tracking-wider text-black hover:bg-black hover:text-white transition cursor-pointer bg-white px-2.5 py-1 border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-1"
      >
        {isExpanded ? "Read Less ▲" : "Read More ▼"}
      </button>
    </div>
  );
}

type EventItem = (typeof eventsData)[number];

function FaqSection() {
  const [selectedFaqIdx, setSelectedFaqIdx] = useState(0);

  const faqs = [
    {
      q: "1. Who can participate in Technika 6.0?",
      a: "Students from schools, colleges, and universities can participate. Many events also allow inter-college teams."
    },
    {
      q: "2. Can students from different colleges form a team?",
      a: "Yes. Several events such as Robo Race and Robo Pick N Place explicitly allow participants from different institutes to form a team."
    },
    {
      q: "3. Is spot registration available?",
      a: "Yes. Spot registration will also be available for participants during the event."
    },
    {
      q: "4. What documents should I bring?",
      a: "Please carry: Valid College/School ID Card, Copy of your payment receipt (if applicable)"
    },
    {
      q: "5. Can I participate in more than one event?",
      a: "Yes, provided the event timings do not clash and you complete registration for each event."
    },
    {
      q: "6. Is there any dress code?",
      a: "Participants should carry their institute ID cards. Some events, like the Project Model Exhibition, require participants to wear their college/university uniform."
    },
    {
      q: "7. Will accommodation and food be provided?",
      a: "Details regarding accommodation and food arrangements will be shared with participants during accommodation allotment."
    },
    {
      q: "8. Can first-year students participate?",
      a: "Absolutely! Students from all eligible academic years are welcome to participate unless an event specifically mentions otherwise."
    },
    {
      q: "9. Will participation certificates be provided?",
      a: "Yes. Registered participants will receive participation certificates, while winners and runners-up will receive certificates and prizes (subject to event policy)."
    },
    {
      q: "10. Can I use my mobile phone during competitions?",
      a: "It depends on the event. For example, mobile phones and internet access are prohibited during the first two rounds of Code Busters and electronic gadgets are prohibited in quiz events like Brainstorm Battle."
    },
    {
      q: "11. What happens if two teams score the same marks?",
      a: "Tie-breaking rules depend on the event. In coding competitions, submission time may be considered, while other events follow their respective judging criteria."
    },
    {
      q: "12. Can I change my team members after registration?",
      a: "Team changes may be allowed only before the registration deadline and subject to approval by the event coordinators."
    },
    {
      q: "13. Are laptops required for technical events?",
      a: "Yes, participants should bring their own laptops for coding, web development, AI, data analytics, and similar software-based competitions unless otherwise informed."
    },
    {
      q: "14. Can I use AI tools like ChatGPT during competitions?",
      a: "No. In events like Coding Ladder, AI tools such as ChatGPT, GitHub Copilot, and external internet browsing are strictly prohibited."
    },
    {
      q: "15. What programming languages are allowed in coding events?",
      a: "Depending on the event, languages such as C, C++, Java, and Python are permitted. Some events also allow frameworks like React or Flutter."
    },
    {
      q: "16. Will internet access be provided?",
      a: "Internet availability depends on the event. Some competitions prohibit internet usage, while others, such as EcoAI Challenge, allow internet access only for reference purposes."
    },
    {
      q: "17. What should I bring for robotics events?",
      a: "Teams should bring their own robot, batteries/adapters, controllers, and any required accessories. Standard AC power will be available where specified."
    },
    {
      q: "18. Are ready-made kits allowed in robotics events?",
      a: "No. Several robotics events prohibit Lego kits and ready-made robotic kits, and using them may result in disqualification."
    },
    {
      q: "19. Can I submit a project that I have already built?",
      a: "It depends on the event. Some events allow existing projects, while others, such as IntelliQuest and EcoAI Challenge, require solutions to be developed during the competition itself."
    },
    {
      q: "20. Are judges' decisions final?",
      a: "Yes. The decision of the judges and organizers is final and binding in all events."
    },
    {
      q: "21. Can I participate individually?",
      a: "Yes. Some events are individual competitions, while others require teams. Please check the team size mentioned for your chosen event."
    },
    {
      q: "22. What can lead to disqualification?",
      a: "Common reasons include: Cheating or plagiarism, Using prohibited devices, Bringing pre-built solutions where not allowed, Damaging the arena or equipment, Misconduct or indiscipline, Violating event-specific rules"
    },
    {
      q: "23. Can spectators attend the events?",
      a: "Yes. Spectators are welcome for most events unless restricted due to safety, space, or judging requirements."
    },
    {
      q: "24. Whom should I contact if I have questions during the event?",
      a: "You can approach the event volunteers, student coordinators, or technical coordinators present at the venue for assistance."
    },
    {
      q: "25. Where can I find the latest announcements and schedule updates?",
      a: "All important announcements, schedule updates, and rule modifications will be communicated through the official Technika website and event coordinators. Participants are advised to check them regularly."
    },
    {
      q: "26. Are ARKA JAIN University (AJU) students allowed to participate in the Treasure Hunt event?",
      a: "No. The Treasure Hunt event is exclusively for participants from outside ARKA JAIN University (AJU). Current AJU students are not eligible to participate in this event."
    },
    {
      q: "Bonus: Is prior experience required to participate?",
      a: "No. Beginners and experienced participants are equally encouraged to join."
    },
    {
      q: "Bonus: Can I register for events on the same day?",
      a: "Yes, subject to seat availability."
    },
    {
      q: "Bonus: Will power supply be available for hardware projects?",
      a: "Yes, standard AC supply will be available for applicable events, but teams should carry their own adapters and batteries where required."
    },
    {
      q: "Bonus: What if my robot or project stops working during the event?",
      a: "Time-outs or troubleshooting allowances depend on the event rules. For example, Robo Wars allows up to two 2-minute time-outs per team."
    },
    {
      q: "Bonus: Can I use my own keyboard, controller, or tools?",
      a: "Yes, where permitted. For example, in Need for Speed, participants may bring their own keyboard or controller, while some creative and engineering events require participants to bring their own materials and tools."
    }
  ];

  return (
    <section id="faq" className="max-w-6xl mx-auto px-3 sm:px-6 py-10 sm:py-16 border-t-[3px] border-foreground">
      <div className="mb-5 sm:mb-8 text-center sm:text-left">
        <div className="inline-block bg-[var(--brut-lime)] text-black brut-border px-2.5 py-0.5 text-[10px] sm:text-xs uppercase font-black">
          Got Questions?
        </div>
        <h2 className="mt-2 text-2xl sm:text-4xl md:text-5xl font-display font-black uppercase leading-tight sm:leading-none">
          Frequently Asked <span className="bg-[var(--brut-pink)] text-black brut-border px-1.5 sm:px-2 inline-block -rotate-1">Questions</span>.
        </h2>
      </div>

      {/* Main FAQ Container (No tabs, space-optimized) */}
      <div className="brut-border p-3.5 sm:p-5 md:p-6 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header bar */}
        <div className="text-[11px] sm:text-xs uppercase font-black tracking-wider text-muted-foreground mb-3 sm:mb-4 pb-2 border-b border-border flex justify-between items-center">
          <span>Official Event FAQs</span>
          <span className="text-[10px] bg-[var(--brut-pink)] text-black px-2 py-0.5 font-black uppercase brut-border">
            {faqs.length} Questions
          </span>
        </div>

        {/* Desktop View: 2-Column Split Navigator */}
        <div className="hidden md:grid md:grid-cols-12 gap-5 items-start">
          {/* Questions Scrollable List */}
          <div className="md:col-span-5 flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1.5">
            {faqs.map((item, idx) => {
              const cleanQ = item.q.replace(/^(Bonus:\s*|\d+\.\s*)/i, "");
              const isSelected = selectedFaqIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFaqIdx(idx)}
                  className={`w-full shrink-0 text-left px-3 py-2.5 text-xs font-black uppercase brut-border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--brut-lime)] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                      : "bg-background/80 text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="truncate">
                    <span className="text-[var(--brut-pink)] font-black mr-1.5">Q{idx + 1}.</span>
                    {cleanQ}
                  </span>
                  <span className="shrink-0 font-bold">{isSelected ? "→" : ""}</span>
                </button>
              );
            })}
          </div>

          {/* Answer Panel */}
          <div className="md:col-span-7 brut-border p-6 bg-background shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] min-h-[360px] flex flex-col justify-between">
            <div>
              <div className="inline-block bg-[var(--brut-yellow)] text-black text-[10px] font-black uppercase px-2 py-0.5 brut-border mb-3">
                QUESTION {selectedFaqIdx + 1} OF {faqs.length}
              </div>
              <h3 className="font-display font-black text-lg lg:text-xl uppercase text-foreground leading-snug">
                {faqs[selectedFaqIdx].q.replace(/^(Bonus:\s*|\d+\.\s*)/i, "")}
              </h3>
              <div className="w-10 h-1 bg-[var(--brut-pink)] my-3" />
              <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                {faqs[selectedFaqIdx].a}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>ARKA JAIN University · Technika 6.0</span>
              <span className="text-[10px] uppercase font-black bg-foreground text-background px-2 py-0.5">Verified FAQ</span>
            </div>
          </div>
        </div>

        {/* Mobile View: Compact Interactive Flashcard Navigator */}
        <div className="md:hidden flex flex-col gap-3">
          {/* Quick Jump Dropdown */}
          <div>
            <label htmlFor="faq-mobile-select" className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
              Jump Directly to a Question:
            </label>
            <select
              id="faq-mobile-select"
              value={selectedFaqIdx}
              onChange={(e) => setSelectedFaqIdx(Number(e.target.value))}
              className="w-full brut-border p-2.5 bg-background text-foreground text-xs font-black uppercase tracking-wide cursor-pointer focus:outline-none"
            >
              {faqs.map((item, idx) => (
                <option key={idx} value={idx} className="bg-background text-foreground py-1 font-bold">
                  Q{idx + 1}. {item.q.replace(/^(Bonus:\s*|\d+\.\s*)/i, "")}
                </option>
              ))}
            </select>
          </div>

          {/* Active Question & Answer Card */}
          <div className="brut-border p-4 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="bg-[var(--brut-yellow)] text-black text-[10px] font-black uppercase px-2 py-0.5 brut-border">
                  QUESTION {selectedFaqIdx + 1} OF {faqs.length}
                </span>
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  Technika 6.0
                </span>
              </div>

              <h3 className="font-display font-black text-sm sm:text-base uppercase text-foreground leading-snug">
                {faqs[selectedFaqIdx].q.replace(/^(Bonus:\s*|\d+\.\s*)/i, "")}
              </h3>

              <div className="w-8 h-1 bg-[var(--brut-pink)] my-2.5" />

              <p className="text-xs font-medium text-foreground/90 leading-relaxed">
                {faqs[selectedFaqIdx].a}
              </p>
            </div>

            {/* Prev / Next Bottom Stepper Controls */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={selectedFaqIdx === 0}
                onClick={() => setSelectedFaqIdx((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 text-xs font-black uppercase brut-border bg-background text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted active:scale-95 transition cursor-pointer"
              >
                ← Prev
              </button>

              <span className="text-[11px] font-black text-muted-foreground">
                {selectedFaqIdx + 1} / {faqs.length}
              </span>

              <button
                type="button"
                disabled={selectedFaqIdx === faqs.length - 1}
                onClick={() => setSelectedFaqIdx((prev) => Math.min(faqs.length - 1, prev + 1))}
                className="px-3 py-1.5 text-xs font-black uppercase brut-border bg-[var(--brut-lime)] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NeoBrutalistCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // Technika 6.0 Starts: November 20, 2026 at 09:00:00 AM IST (UTC+5:30)
    const targetDate = new Date("2026-11-20T09:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative brut-border brut-shadow-sm sm:brut-shadow-lg bg-background p-3 sm:p-5 lg:p-5 xl:p-6 mt-4 sm:mt-5 w-full max-w-full lg:-ml-20 xl:-ml-32 lg:-mr-6 xl:-mr-10 lg:w-[calc(100%+6.5rem)] xl:w-[calc(100%+10.5rem)] group hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
      {/* Top sticker badge */}
      <div className="absolute -top-3.5 left-3 sm:left-6 bg-[var(--brut-lime)] text-black px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 sm:gap-2 -rotate-1">
        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-600"></span>
        </span>
        <span>⏳ FEST STARTS IN</span>
      </div>

      {/* Header date info */}
      <div className="flex items-center justify-between pt-1 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-black text-xs sm:text-base lg:text-lg uppercase tracking-tight text-foreground">
            20 NOV 2026 · 09:00 AM
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-black uppercase bg-[var(--brut-pink)] text-foreground px-2 py-0.5 sm:px-2.5 sm:py-1 border border-foreground sm:border-2 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          DAY 1 KICKOFF
        </span>
      </div>

      {/* 4 Neo-Brutalist Digit Boxes */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 lg:gap-3 xl:gap-4">
        {/* DAYS */}
        <div
          className="brut-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--brut-yellow)" }}
        >
          <div className="py-2 sm:py-3.5 lg:py-4 px-0.5 text-center flex items-center justify-center">
            <span className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] text-black leading-none block tabular-nums tracking-tighter">
              {timeLeft.days}
            </span>
          </div>
          <div className="bg-black text-white text-[9px] sm:text-xs font-black uppercase text-center py-0.5 sm:py-1 tracking-wider border-t-2 border-black">
            DAYS
          </div>
        </div>

        {/* HOURS */}
        <div
          className="brut-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--brut-lime)" }}
        >
          <div className="py-2 sm:py-3.5 lg:py-4 px-0.5 text-center flex items-center justify-center">
            <span className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] text-black leading-none block tabular-nums tracking-tighter">
              {timeLeft.hours}
            </span>
          </div>
          <div className="bg-black text-white text-[9px] sm:text-xs font-black uppercase text-center py-0.5 sm:py-1 tracking-wider border-t-2 border-black">
            HOURS
          </div>
        </div>

        {/* MINUTES */}
        <div
          className="brut-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--brut-pink)" }}
        >
          <div className="py-2 sm:py-3.5 lg:py-4 px-0.5 text-center flex items-center justify-center">
            <span className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] text-black leading-none block tabular-nums tracking-tighter">
              {timeLeft.minutes}
            </span>
          </div>
          <div className="bg-black text-white text-[9px] sm:text-xs font-black uppercase text-center py-0.5 sm:py-1 tracking-wider border-t-2 border-black">
            MINS
          </div>
        </div>

        {/* SECONDS */}
        <div
          className="brut-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--brut-orange)" }}
        >
          <div className="py-2 sm:py-3.5 lg:py-4 px-0.5 text-center flex items-center justify-center">
            <span className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] text-black leading-none block tabular-nums tracking-tighter">
              {timeLeft.seconds}
            </span>
          </div>
          <div className="bg-black text-white text-[9px] sm:text-xs font-black uppercase text-center py-0.5 sm:py-1 tracking-wider border-t-2 border-black">
            SECS
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "Technical", "Cultural", "Creative"] as const;
type Cat = (typeof CATEGORIES)[number];

function Index() {
  const [cat, setCat] = useState<Cat>("Technical");
  const [openId, setOpenId] = useState<string | null>(null);
  const [heroEvtIdx, setHeroEvtIdx] = useState(0);
  const [theme, setTheme] = useState<"main" | "light">(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem("technika_theme");
      if (saved === "main") return "main";
      if (saved === "light") return "light";
      return "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "main" ? "light" : "main"));
  };

  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollGallery = (direction: "left" | "right") => {
    if (galleryRef.current) {
      const { scrollLeft, clientWidth } = galleryRef.current;
      const scrollAmount = clientWidth;
      galleryRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.remove("dark", "theme-main", "theme-light");
    if (theme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.add("theme-main");
    }
    try {
      localStorage.setItem("technika_theme", theme);
    } catch {
      // ignore storage access errors
    }
  }, [theme]);

  // Synchronize theme changes across tabs/windows (e.g., registration portal)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "technika_theme" && e.newValue) {
        if (e.newValue === "main" || e.newValue === "light") {
          setTheme(e.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const events = eventsData as EventItem[];

  useEffect(() => {
    if (!events.length) return;
    const interval = setInterval(() => {
      setHeroEvtIdx((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  const filtered = useMemo(
    () => (cat === "All" ? events : events.filter((e) => e.category === cat)),
    [cat, events],
  );
  const openEvent = openId ? events.find((e) => e.id === openId) ?? null : null;
  const currentHeroEvt = events[heroEvtIdx] || events[0];

  const galleryPages = useMemo(() => {
    const displayedGallery = galleryData.slice(0, 16);
    const pages = [];
    for (let i = 0; i < displayedGallery.length; i += 8) {
      pages.push(displayedGallery.slice(i, i + 8));
    }
    return pages;
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      {/* NAV */}
      <header id="header" className="sticky top-0 inset-x-0 z-50 bg-[var(--brut-yellow)] border-b-[3px] border-foreground">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3.5">
          <div className="nav-logo flex items-center gap-2.5 mr-4 md:mr-6 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={ajuLogo} alt="ARKA JAIN University Logo" className="h-8 md:h-9.5 w-auto object-contain" />
            <div className="w-[2px] h-6 bg-foreground/30 hidden sm:block" />
            <img src={technikaLogo} alt="Technika Logo" className="h-8 md:h-9.5 w-auto object-contain border-2 border-foreground shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hidden sm:block" />
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 text-xs font-black uppercase">
            {[
              { label: "About", href: "#about" },
              { label: "Events", href: "#events" },
              { label: "Schedule", href: "#schedule" },
              { label: "Gallery", href: "#gallery" },
              { label: "Sponsors", href: "#sponsors" },
              { label: "Team", href: "#team" },
              { label: "Contact", href: "#contact" },
              { label: "FAQ", href: "#faq" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => scrollToSection(e, href)}
                className="px-2.5 py-1.5 border-[2px] border-transparent hover:border-foreground hover:bg-background text-foreground dark:text-black hover:dark:text-white transition"
              >
                {label}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Rotary Theme Switcher (Theme 1 / Theme 2) - Pure Circular Neo-Brutalism */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch Theme (Current: ${theme === "main" ? "Theme 1" : "Theme 2"})`}
              aria-label={`Switch Theme, currently ${theme === "main" ? "Theme 1" : "Theme 2"}`}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-foreground bg-[var(--brut-yellow)] shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer select-none transition-all shrink-0"
              suppressHydrationWarning
            >
              {/* Rotating Pointer Ring */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
                style={{
                  transform: theme === "main" ? "rotate(0deg)" : "rotate(180deg)",
                }}
              >
                <span className="absolute -top-0.5 w-1.5 h-2 bg-black rounded-full" />
                <span className="absolute -bottom-0.5 w-1 h-1 bg-black/40 rounded-full" />
              </div>

              {/* Center Theme Icon */}
              <div className="relative z-10 transition-transform duration-300 pointer-events-none">
                {theme === "main" ? (
                  <Sparkles className="w-4 h-4 text-black" />
                ) : (
                  <Sun className="w-4 h-4 text-black" />
                )}
              </div>
            </button>

            <a
              href={configData.brochureLink}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase bg-background text-foreground border-[2px] border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition shrink-0"
            >
              Brochure
            </a>

            <a
              href={configData.registrationLink}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase bg-foreground text-background border-[2px] border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              Register →
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-14 sm:pb-24 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-2 bg-[var(--brut-lime)] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black" />
              ARKA JAIN University · Techno-Cultural Fest
            </span>
            <h1 className="mt-4 sm:mt-6 font-display font-black text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] leading-[0.9] tracking-tighter uppercase">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Tech</span>
                <span className="bg-[var(--brut-pink)] brut-border px-2.5 sm:px-4 -rotate-1 inline-block">nika</span>
              </div>
              <div className="mt-1.5 sm:mt-3">
                <span className="bg-foreground text-background px-3 sm:px-4 inline-block">6.0</span>
              </div>
            </h1>
            <p className="mt-4 sm:mt-8 max-w-xl text-sm sm:text-base md:text-lg font-medium leading-relaxed">
              Where creativity <span className="bg-[var(--brut-yellow)] px-1 brut-border border-2">collides</span> with technology.{" "}
              45+ battles across code, robotics, AI, hardware, design & culture. Come build. Come break things. Come win.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-black uppercase">
              <span className="bg-background brut-border px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
                📅 20 & 21 NOVEMBER 2026
              </span>
              <a
                href={configData.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-background brut-border brut-shadow-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition group text-foreground cursor-pointer"
              >
                <span>📍 ARKA JAIN UNIVERSITY</span>
                <span className="ml-1 inline-block group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗️</span>
              </a>
            </div>
            <div className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
              <a href={configData.registrationLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm text-center justify-center font-black uppercase bg-[var(--brut-pink)] text-foreground brut-border brut-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition">
                Register Now →
              </a>
              <a
                href="#events"
                onClick={(e) => scrollToSection(e, "#events")}
                className="flex-1 sm:flex-initial px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm text-center justify-center font-black uppercase bg-background text-foreground brut-border brut-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition cursor-pointer"
              >
                Explore Events
              </a>
              <a
                href={configData.brochureLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm text-center justify-center font-black uppercase bg-[var(--brut-yellow)] text-foreground brut-border brut-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition flex items-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <span>View Brochure</span>
                <span>📄</span>
              </a>
            </div>

            <div className="mt-8 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-xl">
              <div className="brut-border brut-shadow-sm p-3 sm:p-4 flex flex-col justify-between" style={{ background: "var(--brut-blue)" }}>
                <div className="text-2xl sm:text-3xl font-display font-black">45+</div>
                <div className="text-[11px] sm:text-xs uppercase font-bold mt-1">Events</div>
              </div>
              <div className="brut-border brut-shadow-sm p-3 sm:p-4 flex flex-col justify-between" style={{ background: "var(--brut-yellow)" }}>
                <div className="text-xs sm:text-sm font-display font-black leading-tight uppercase">Mementos, Medals & Certificates</div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold mt-1 opacity-90">Awards & Recognition</div>
              </div>
              <div className="col-span-2 sm:col-span-1 brut-border brut-shadow-sm p-3 sm:p-4 flex flex-col justify-between" style={{ background: "var(--brut-orange)" }}>
                <div className="text-3xl font-display font-black">2 DAYS</div>
                <div className="text-xs uppercase font-bold mt-1">Fest Event</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative rotate-3 hidden lg:block">
              <div
                onClick={() => setOpenId(currentHeroEvt.id)}
                className="brut-border brut-shadow-lg bg-background p-4 cursor-pointer hover:scale-[1.02] transition-all group"
              >
                <div className="relative overflow-hidden brut-border aspect-4/3 bg-muted">
                  <PixelDissolveImage
                    src={getEventPhoto(currentHeroEvt.id, heroEvtIdx)}
                    alt={currentHeroEvt.title}
                  />
                  <div className="absolute top-2 right-2 bg-background border-2 border-foreground px-2 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-30">
                    {heroEvtIdx + 1} / {events.length}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="inline-block bg-foreground text-background text-xs uppercase font-black px-2 py-1">
                    {currentHeroEvt.category}
                  </div>
                  <div className="font-display text-2xl font-black mt-2 truncate">
                    {currentHeroEvt.title}
                  </div>
                  <div className="text-sm font-medium line-clamp-2 text-muted-foreground mt-1 min-h-[2.5rem]">
                    {currentHeroEvt.description}
                  </div>
                  <div className="mt-3 text-xs font-black uppercase text-[var(--brut-pink)] group-hover:underline flex items-center gap-1">
                    View Details & Register →
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 bg-[var(--brut-lime)] brut-border brut-shadow px-4 py-2 font-black uppercase -rotate-6 pointer-events-none text-foreground">
                EVENTS!
              </div>
            </div>

            {/* Neo-Brutalist Countdown Timer */}
            <NeoBrutalistCountdown />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y-[3px] border-foreground overflow-hidden bg-foreground py-4">
        <div className="flex gap-8 whitespace-nowrap animate-[marquee_30s_linear_infinite] font-display text-3xl md:text-5xl font-black uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-8 shrink-0 items-center">
              {["Innovate", "◆", "Compete", "◆", "Create", "◆", "Disrupt", "◆", "Celebrate", "◆"].map((w, j) => (
                <span key={j} className={j % 2 ? "text-[var(--brut-yellow)]" : "text-background"}>{w}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[var(--brut-blue)] brut-border px-3 py-1 text-xs uppercase font-black">About the fest</div>
            <h2 className="mt-4 text-4xl md:text-6xl font-display font-black uppercase leading-none">
              A playground for <span className="bg-[var(--brut-pink)] brut-border px-2 inline-block -rotate-1">innovators</span>.
            </h2>
            <p className="mt-6 text-lg font-medium">
              Technika 6.0 is the flagship technical extravaganza of ARKA JAIN University's
              School of Engineering & IT. Six editions in and we're still building it around one
              belief: creativity meets technology when students get room to run.
            </p>
            <p className="mt-4 text-muted-foreground font-medium">
              Expect coding battles, robotics arenas, hardware hackfests, AI quizzathons, cultural
              nights, expert talks — and a campus wired end-to-end with energy.
            </p>
          </div>
          <div className="relative">
            <div className="brut-border brut-shadow-lg bg-background p-3 rotate-2">
              <div className="brut-border aspect-4/3 overflow-hidden">
                <PixelDissolveImage
                  src={PROVIDED_PHOTOS[heroEvtIdx % PROVIDED_PHOTOS.length]}
                  alt="Technika 6.0 Fest Highlights"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL EVENTS */}
      <section id="events" className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-block bg-[var(--brut-orange)] brut-border px-3 py-1 text-xs uppercase font-black">Every Event</div>
            <h2 className="mt-4 text-4xl md:text-6xl font-display font-black uppercase leading-none">
              Pick your <span className="bg-foreground text-background px-2 inline-block">arena</span>.
            </h2>
          </div>
          <p className="max-w-md font-medium">
            {events.length} events across technical, creative and cultural categories.
            Tap any card for rules, venue and event details.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 text-xs font-black uppercase brut-border transition ${
                  active
                    ? "bg-foreground text-background brut-shadow-sm"
                    : "bg-background hover:bg-[var(--brut-yellow)]"
                }`}
              >
                {c} {c !== "All" && `· ${events.filter((e) => e.category === c).length}`}
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((e, i) => (
            <button
              type="button"
              key={e.id}
              onClick={() => setOpenId(e.id)}
              className="relative overflow-hidden brut-card brut-card-hover min-h-[380px] p-6 group flex flex-col justify-between text-left text-white border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Event Photo Full Card Background */}
              <div className="absolute inset-0 z-0">
                <img
                  src={getEventPhoto(e.id, i)}
                  alt={e.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Dark Gradient Overlay for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 group-hover:from-black/95 group-hover:via-black/75 group-hover:to-black/50 transition-colors duration-300" />
              </div>

              {/* Card Content Layer */}
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                  <span className="font-display text-5xl font-black text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 text-black brut-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    style={{ background: BRUT_COLORS[i % BRUT_COLORS.length] }}
                  >
                    {e.category}
                  </span>
                </div>

                <div className="mt-auto">
                  <h3 className="font-display text-2xl font-black uppercase leading-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-gray-200 line-clamp-3 text-shadow">
                    {e.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                    <span className="bg-black/90 text-white brut-border border-white/60 px-2.5 py-1 backdrop-blur-sm">
                      📅 {e.date} · {e.time}
                    </span>
                    <span className="bg-white text-black brut-border border-black px-2.5 py-1">
                      📍 {e.venue}
                    </span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase font-black bg-[var(--brut-lime)] text-black px-3.5 py-2 brut-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:bg-white transition-all">
                    View details →
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SCHEDULE / TIMELINE */}
      <section id="schedule" className="relative py-24 bg-card text-foreground border-y-[3px] border-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <div className="inline-block bg-[var(--brut-lime)] text-black brut-border px-3 py-1 text-xs uppercase font-black">
              Two Days · One Fest
            </div>
            <h2 className="mt-4 text-4xl md:text-6xl font-display font-black uppercase leading-none">
              Full <span className="bg-[var(--brut-pink)] text-black brut-border px-2 inline-block -rotate-1">schedule</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[1, 2].map((day) => (
              <div key={day}>
                <div className="inline-block bg-[var(--brut-yellow)] text-black brut-border px-4 py-2 font-display text-xl font-black uppercase mb-6">
                  Day {day}
                </div>
                <ol className="space-y-4">
                  {timelineData
                    .filter((t) => t.day === day)
                    .map((t, i) => (
                      <li
                        key={i}
                        className="p-5 brut-border text-black"
                        style={{
                          background: BRUT_COLORS[i % BRUT_COLORS.length],
                          boxShadow: "6px 6px 0 0 var(--foreground)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-display font-black text-lg text-black">{t.time}</span>
                          <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 brut-border border-black">
                            {t.type}
                          </span>
                        </div>
                        <div className="font-display font-black text-xl uppercase mt-2 text-black">{t.title}</div>
                        <p className="text-sm font-bold mt-1 text-black/90">{t.description}</p>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-block bg-[var(--brut-pink)] brut-border px-3 py-1 text-xs uppercase font-black">Flashbacks</div>
            <h2 className="mt-4 text-4xl md:text-6xl font-display font-black uppercase leading-none">
              From past <span className="bg-[var(--brut-lime)] brut-border px-2 inline-block -rotate-1">editions</span>.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden md:block max-w-xs text-xs font-semibold text-muted-foreground mr-2">
              Moments from Technika's arenas, stages and workshops.
            </p>
            <button
              onClick={() => scrollGallery('left')}
              className="brut-border p-3 bg-background hover:bg-[var(--brut-lime)] transition shadow-[3px_3px_0px_0px_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer"
              aria-label="Previous images"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => scrollGallery('right')}
              className="brut-border p-3 bg-background hover:bg-[var(--brut-lime)] transition shadow-[3px_3px_0px_0px_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer"
              aria-label="Next images"
            >
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
        <div 
          ref={galleryRef}
          className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4"
        >
          {galleryPages.map((pageImages, pageIdx) => (
            <div 
              key={pageIdx} 
              className="snap-start shrink-0 w-full grid grid-cols-2 sm:grid-cols-4 gap-5"
            >
              {pageImages.map((g, i) => (
                <figure
                  key={g.id}
                  className="brut-border brut-shadow-sm bg-background p-2"
                  style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}
                >
                  <div className="aspect-square overflow-hidden brut-border">
                    <img
                      src={`/gallery${encodeURI(g.image)}`}
                      alt="Past edition moment"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* SPONSORS */}
      <section id="sponsors" className="border-y-[3px] border-foreground bg-[var(--brut-yellow)] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-block bg-background brut-border px-3 py-1 text-xs uppercase font-black">Powered by</div>
            <h2 className="mt-4 text-4xl md:text-6xl font-display font-black uppercase leading-none">
              Our Sponsors
            </h2>
          </div>

          <div className="max-w-2xl mx-auto text-center brut-border p-8 md:p-12 bg-background shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="inline-block bg-[var(--brut-pink)] text-foreground brut-border px-4 py-2 font-display text-2xl md:text-3xl font-black uppercase -rotate-1">
              TO BE ANNOUNCED
            </div>
            <p className="mt-6 text-base font-semibold leading-relaxed text-muted-foreground">
              Official sponsors & brand partners for Technika 6.0 will be unveiled shortly!
            </p>
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
              <a
                href="#contact"
                className="brut-border px-6 py-3 text-xs font-black uppercase bg-[var(--brut-lime)] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition cursor-pointer"
              >
                Become a Sponsor →
              </a>
              <a
                href={configData.sponsorBrochureLink || "/sponsor-brochure.pdf"}
                target="_blank"
                rel="noreferrer"
                className="brut-border px-6 py-3 text-xs font-black uppercase bg-[var(--brut-yellow)] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Sponsor Brochure</span>
                <span>📄</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="max-w-7xl mx-auto px-3 sm:px-6 py-16 sm:py-24 text-center">
        <div className="inline-block bg-[var(--brut-blue)] brut-border px-3 py-1 text-xs uppercase font-black">Behind the fest</div>
        <h2 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-6xl font-display font-black uppercase leading-none">
          The Team
        </h2>

        {(["Convenors", "Faculty Coordinators", "Student Coordinator"] as const).map((group) => {
          const people = organisersData.filter(
            (o) =>
              o.category === group ||
              (group === "Student Coordinator" && (o.category === "Student Coordinators" || o.category === "Core Team"))
          );
          if (people.length === 0) return null;

          const renderMemberCard = (p: (typeof organisersData)[0], i: number, isCompact = false) => {
            const hasPhoto = "image" in p && Boolean(p.image);
            return (
              <div
                key={p.name}
                className={`brut-border ${isCompact ? "p-2 sm:p-3" : "p-2 sm:p-4"} bg-background shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition flex flex-col items-center text-center justify-between w-full`}
              >
                <div className="w-full flex flex-col items-center">
                  {/* Member Photo Frame */}
                  <div className={`relative aspect-square w-full ${isCompact ? "mb-2 sm:mb-2.5" : "mb-2 sm:mb-3.5"} brut-border overflow-hidden bg-muted/30 flex items-center justify-center`}>
                    {hasPhoto ? (
                      <img
                        src={(p as any).image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-avatar');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}

                    <div
                      className="fallback-avatar flex flex-col items-center justify-center p-2 sm:p-3 text-center w-full h-full"
                      style={{
                        display: hasPhoto ? 'none' : 'flex',
                        background: BRUT_COLORS[i % BRUT_COLORS.length]
                      }}
                    >
                      <div className={`w-10 h-10 ${isCompact ? "sm:w-12 sm:h-12 text-sm sm:text-lg" : "sm:w-16 sm:h-16 text-sm sm:text-2xl"} brut-border bg-foreground text-background flex items-center justify-center font-display font-black mb-1 sm:mb-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                        {p.name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("")}
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black bg-background/90 px-1.5 py-0.5 brut-border mt-0.5 sm:mt-1">
                        Photo TBD
                      </span>
                    </div>
                  </div>

                  <div className={`font-display font-black uppercase ${isCompact ? "text-xs sm:text-sm" : "text-xs sm:text-base"} leading-tight sm:leading-snug text-foreground`}>
                    {p.name}
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold mt-0.5 sm:mt-1 text-muted-foreground leading-tight sm:leading-relaxed">
                    {p.role}
                  </div>
                </div>
              </div>
            );
          };

          if (group === "Student Coordinator") {
            const admins = people.filter((p) => p.role.toLowerCase().includes("administration"));
            const otherMembers = people.filter((p) => !p.role.toLowerCase().includes("administration"));

            return (
              <div key={group} className="mt-8 sm:mt-12">
                <div className="text-xs sm:text-sm uppercase font-black mb-4 sm:mb-6 inline-block bg-foreground text-background px-3 sm:px-4 py-1 sm:py-1.5 brut-border">
                  {group}
                </div>

                {/* Admins at the top */}
                {admins.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-md sm:max-w-xl mx-auto justify-center">
                      {admins.map((p, i) => renderMemberCard(p, i, false))}
                    </div>
                  </div>
                )}

                {/* Followed by the whole team as much accommodated in 1 line */}
                {otherMembers.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 max-w-7xl mx-auto">
                    {otherMembers.map((p, i) => renderMemberCard(p, i + admins.length, true))}
                  </div>
                )}
              </div>
            );
          }

          if (group === "Faculty Coordinators") {
            return (
              <div key={group} className="mt-8 sm:mt-12">
                <div className="text-xs sm:text-sm uppercase font-black mb-4 sm:mb-6 inline-block bg-foreground text-background px-3 sm:px-4 py-1 sm:py-1.5 brut-border">
                  {group}
                </div>
                {/* 4 in 1 row on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-6xl mx-auto">
                  {people.map((p, i) => renderMemberCard(p, i, false))}
                </div>
              </div>
            );
          }

          // Convenors (2 people)
          return (
            <div key={group} className="mt-8 sm:mt-12">
              <div className="text-xs sm:text-sm uppercase font-black mb-4 sm:mb-6 inline-block bg-foreground text-background px-3 sm:px-4 py-1 sm:py-1.5 brut-border">
                {group}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-md sm:max-w-xl mx-auto justify-center">
                {people.map((p, i) => renderMemberCard(p, i, false))}
              </div>
            </div>
          );
        })}
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="inline-block bg-[var(--brut-orange)] brut-border px-3 py-1 text-xs uppercase font-black">Get in touch</div>
            <h2 className="mt-4 text-4xl md:text-6xl font-display font-black uppercase leading-none">
              Questions? <br /><span className="bg-[var(--brut-yellow)] brut-border px-2 inline-block -rotate-1">Reach out</span>.
            </h2>
            <p className="mt-6 text-lg font-medium">
              Have a query about registration, rules, sponsorship, or campus arrival? Our core team is here to help.
            </p>

            <div className="mt-8 space-y-4">
              {contactData.queryDesk.map((q: any) => (
                <div key={q.category || q.name} className="space-y-1.5">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-foreground inline-block"></span>
                    <span>{q.category}</span>
                  </div>
                  <div className="brut-border p-4 bg-background flex justify-between items-center">
                    <span className="font-bold">{q.name}</span>
                    <a href={`tel:${q.phone}`} className="font-mono text-sm font-black underline hover:text-[var(--brut-pink)] transition-colors">{q.phone}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="self-center">
            <div className="brut-border brut-shadow bg-background p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Have a direct question?</div>
                <h3 className="font-display text-2xl font-black uppercase mt-2">Send us an Email</h3>
                <p className="text-sm font-semibold text-muted-foreground mt-2">
                  Drop us a line directly at our official email address.
                </p>
                <div className="mt-6 p-4 brut-border bg-[var(--brut-yellow)] text-black">
                  <div className="text-[10px] font-black uppercase opacity-85">Email Address</div>
                  <a
                    href={`mailto:${contactData.email}`}
                    className="font-display text-lg sm:text-xl font-black break-all hover:underline text-black"
                  >
                    {contactData.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTER CTA */}
      <section id="register" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-20">
        <div className="relative brut-border p-4 sm:p-10 md:p-16 bg-[var(--brut-pink)] shadow-[4px_4px_0_0_var(--foreground)] sm:shadow-[12px_12px_0_0_var(--foreground)] md:shadow-[16px_16px_0_0_var(--foreground)]">
          <div className="max-w-3xl">
            <div className="inline-block bg-foreground text-background px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs uppercase font-black tracking-wider sm:tracking-widest brut-border">
              Registration open
            </div>
            <h2 className="mt-2.5 sm:mt-4 font-display text-2xl sm:text-5xl md:text-7xl font-black uppercase leading-tight sm:leading-none text-foreground">
              Ready to <br className="hidden sm:inline" />enter the{" "}
              <span className="bg-[var(--brut-yellow)] brut-border px-1.5 py-0.5 sm:px-2 inline-block -rotate-1 text-black">
                arena?
              </span>
            </h2>
            <p className="mt-2 sm:mt-6 text-xs sm:text-lg font-semibold sm:font-medium leading-relaxed text-foreground/90 max-w-xl">
              Bring your college ID. Bring your squad. Register once, compete across events.
            </p>
            <div className="mt-4 sm:mt-8 flex flex-row flex-wrap sm:flex-nowrap gap-2 sm:gap-4 items-center">
              <a
                href={configData.registrationLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial text-center bg-foreground text-background px-3 sm:px-8 py-2.5 sm:py-4 font-black text-xs sm:text-base uppercase brut-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition whitespace-nowrap"
              >
                <span className="sm:hidden">Register team →</span>
                <span className="hidden sm:inline">Register your team →</span>
              </a>
              <a
                href={configData.brochureLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial text-center bg-background text-foreground px-3 sm:px-8 py-2.5 sm:py-4 font-black text-xs sm:text-base uppercase brut-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition whitespace-nowrap"
              >
                View Brochure
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (JUST ABOVE FOOTER) */}
      <FaqSection />

      {/* CREATORS CREDITS */}
      <section id="creators" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-6 sm:gap-12 md:gap-24">
          {/* Left Text */}
          <div className="text-center md:text-left md:max-w-xs">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black uppercase leading-none text-foreground">
              Meet the <br />
              <span className="bg-[var(--brut-yellow)] text-black brut-border px-2 inline-block -rotate-1 mt-1">Developers</span>
            </h2>
            <p className="text-xs font-semibold text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
              The developers who designed and built the Technika 6.0 portal.
            </p>
          </div>

          {/* Right Cards: Side-by-side on mobile and desktop */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 justify-center w-full max-w-sm sm:max-w-none mx-auto md:mx-0 md:w-auto">
            {/* Creator 1: Adeeb Razi */}
            <div className="brut-border p-3 sm:p-5 bg-background shadow-[3px_3px_0px_0px_var(--foreground)] sm:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200 w-full sm:w-[210px] flex flex-col items-center text-center justify-between">
              <div className="w-full flex flex-col items-center">
                <div className="relative aspect-square w-16 sm:w-24 mb-2.5 sm:mb-3.5 border-2 border-foreground overflow-hidden bg-[var(--brut-pink)] shadow-[2.5px_2.5px_0px_0px_var(--foreground)] sm:shadow-[3.5px_3.5px_0px_0px_var(--foreground)]">
                  <img
                    src="/team/adeeb.png"
                    alt="Adeeb Razi"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-display text-xs sm:text-base font-black uppercase text-foreground leading-tight">
                  Adeeb Razi
                </h3>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black bg-[var(--brut-pink)] px-1.5 sm:px-2 py-0.5 border border-foreground mt-1 shadow-[1px_1px_0px_0px_var(--foreground)] sm:shadow-[1.5px_1.5px_0px_0px_var(--foreground)] whitespace-nowrap">
                  Frontend & UI Dev
                </div>
              </div>
              <a
                href="https://adeebrazi.online"
                target="_blank"
                rel="noreferrer"
                className="mt-3 sm:mt-5 border border-foreground px-2 sm:px-4 py-1 text-[9px] sm:text-[10px] font-black bg-[var(--brut-yellow)] text-black shadow-[1.5px_1.5px_0px_0px_var(--foreground)] sm:shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition uppercase tracking-wider w-full sm:w-auto text-center"
              >
                Portfolio ↗
              </a>
            </div>

            {/* Creator 2: Sanchit Agarwal */}
            <div className="brut-border p-3 sm:p-5 bg-background shadow-[3px_3px_0px_0px_var(--foreground)] sm:shadow-[5px_5px_0px_0px_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200 w-full sm:w-[210px] flex flex-col items-center text-center justify-between">
              <div className="w-full flex flex-col items-center">
                <div className="relative aspect-square w-16 sm:w-24 mb-2.5 sm:mb-3.5 border-2 border-foreground overflow-hidden bg-[var(--brut-lime)] shadow-[2.5px_2.5px_0px_0px_var(--foreground)] sm:shadow-[3.5px_3.5px_0px_0px_var(--foreground)]">
                  <img
                    src="/team/sanchit.png"
                    alt="Sanchit Agarwal"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-display text-xs sm:text-base font-black uppercase text-foreground leading-tight">
                  Sanchit Agarwal
                </h3>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black bg-[var(--brut-pink)] px-1.5 sm:px-2 py-0.5 border border-foreground mt-1 shadow-[1px_1px_0px_0px_var(--foreground)] sm:shadow-[1.5px_1.5px_0px_0px_var(--foreground)] whitespace-nowrap">
                  Backend Developer
                </div>
              </div>
              <a
                href="https://www.linkedin.com/in/sanchit-agarwal-dev/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 sm:mt-5 border border-foreground px-2 sm:px-4 py-1 text-[9px] sm:text-[10px] font-black bg-[var(--brut-yellow)] text-black shadow-[1.5px_1.5px_0px_0px_var(--foreground)] sm:shadow-[2px_2px_0px_0px_var(--foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition uppercase tracking-wider w-full sm:w-auto text-center"
              >
                Portfolio ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-black bg-[var(--brut-yellow)] text-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* About Columns */}
          <div className="grid md:grid-cols-3 gap-8 pb-6 border-b-[3px] border-black">
            <div>
              <div className="font-display font-black text-2xl uppercase text-black">
                TECHNIKA <span className="bg-black text-white px-2">6.0</span>
              </div>
              <p className="text-xs font-semibold mt-3 leading-relaxed text-black">
                Technika 6.0 is the flagship techno-cultural extravaganza of ARKA JAIN University's School of Engineering & IT. A 2-day playground where 40+ events, robotics arenas, coding battles, and live concerts ignite creativity and technology.
              </p>
            </div>
            <div>
              <div className="font-display font-black text-lg uppercase inline-block bg-[var(--brut-pink)] text-black border-2 border-black px-2 py-0.5">
                School of Engineering & IT
              </div>
              <ExpandableFooterText
                shortContent={
                  <p className="text-black">
                    The School of Engineering & IT at ARKA JAIN University stands as a center of technological innovation, academic excellence, and future-ready education.
                  </p>
                }
                fullContent={
                  <div className="text-black">
                    <p>
                      The School of Engineering & IT at ARKA JAIN University stands as a center of technological innovation, academic excellence, and future-ready education. With a strong emphasis on research, practical learning, and emerging technologies, the school provides students with a dynamic platform to explore, innovate, and lead.
                    </p>
                    <p className="mt-2">
                      Our programmes, ranging from Diploma, B.Tech, BCA, MCA, and M.Tech; cover cutting-edge domains such as Computer Science, Artificial Intelligence & Machine Learning, Data Science, Mechanical Engineering, Electrical & Electronics Engineering, and more. Each curriculum is thoughtfully designed to balance academic rigor with industry relevance.
                    </p>
                  </div>
                }
              />
            </div>
            <div>
              <div className="font-display font-black text-lg uppercase inline-block bg-[var(--brut-blue)] text-black border-2 border-black px-2 py-0.5">
                ARKA JAIN University
              </div>
              <ExpandableFooterText
                shortContent={
                  <p className="text-black">
                    ARKA JAIN University was established in 2017 by the Jharkhand State Legislature under "The ARKA JAIN University Act" and is UGC recognized.
                  </p>
                }
                fullContent={
                  <div className="text-black">
                    <p>
                      ARKA JAIN University was established in the year 2017 by the Jharkhand State Legislature under “The ARKA JAIN University Act” and is recognized by the UGC. It is the first state private university in the Kolhan region, comprising three districts of Jharkhand.
                    </p>
                    <p className="mt-2">
                      The University is accredited with NAAC ‘A’ Grade in its first cycle and is the first state private university in Bihar, Jharkhand, and West Bengal to achieve this distinction. ARKA JAIN University is part of the prestigious JAIN Group, Bengaluru, which has more than 77 educational institutions under its umbrella. The University is mentored by JAIN (Deemed-to-be University), Bengaluru, a NAAC A++ accredited institution and a NIRF Top-100 Higher Educational Institution.
                    </p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Social Media Handles in one single line */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-[10px] text-black">Technika Socials</span>
              {contactData.socialLinks.technika.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                >
                  {s.platform}
                </a>
              ))}
            </div>
            <div className="w-0.5 h-3 bg-black/30 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-[10px] text-black">SOEIT Socials</span>
              {contactData.socialLinks.soeit.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                >
                  {s.platform}
                </a>
              ))}
            </div>
            <div className="w-0.5 h-3 bg-black/30 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-[10px] text-black">AJU Socials</span>
              {contactData.socialLinks.aju.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-black bg-white text-black px-2 py-0.5 text-[10px] font-black hover:bg-black hover:text-white transition shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                >
                  {s.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t-[3px] border-black py-5 text-center text-xs font-black uppercase text-black/80 bg-black/5">
          © 2026 ARKA JAIN University · School of Engineering & IT · Technika 6.0
        </div>
      </footer>

      {/* EVENT MODAL */}
      {openEvent && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/75 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-background brut-border my-8 max-h-[90vh] flex flex-col"
            style={{ boxShadow: "12px 12px 0 0 var(--brut-pink)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header with Close Button */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-5 border-b-[3px] border-foreground bg-[var(--brut-yellow)]">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background inline-block px-2 py-0.5">
                  {openEvent.category}
                </div>
                <h3 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase leading-tight text-black">
                  {openEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="brut-border bg-foreground text-background px-3.5 py-2 font-black text-xs uppercase hover:bg-background hover:text-foreground transition shrink-0 flex items-center gap-1.5 brut-shadow-sm cursor-pointer"
                aria-label="Close modal"
              >
                <span className="text-sm font-extrabold">✕</span> CLOSE
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <p className="font-medium text-base leading-relaxed">{openEvent.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-black uppercase">
                <div className="brut-border p-3 bg-[var(--brut-lime)] text-black">
                  <div className="opacity-80 font-black">When</div>
                  <div className="mt-1 font-bold">{openEvent.date} · {openEvent.time}</div>
                </div>
                <div className="brut-border p-3 bg-[var(--brut-blue)] text-white">
                  <div className="opacity-80 font-black">Venue</div>
                  <div className="mt-1 font-bold">{openEvent.venue}</div>
                </div>
                <div className="brut-border p-3 bg-[var(--brut-orange)] text-black">
                  <div className="opacity-80 font-black">Team</div>
                  <div className="mt-1 font-bold">
                    {openEvent.isTeamEvent
                      ? `${openEvent.minMembers}–${openEvent.maxMembers} members`
                      : "Solo"}
                  </div>
                </div>
              </div>
              {openEvent.objective && (
                <div>
                  <div className="text-xs font-black uppercase mb-2">Objective</div>
                  <p className="text-sm font-medium leading-relaxed">{openEvent.objective}</p>
                </div>
              )}
              {openEvent.rules_list && openEvent.rules_list.length > 0 && (
                <div>
                  <div className="text-xs font-black uppercase mb-2">Rules</div>
                  <ul className="space-y-2 text-sm font-medium">
                    {openEvent.rules_list.map((r, i) => (
                      <li key={i} className="pl-4 border-l-[3px] border-foreground">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {openEvent.criteria_list && openEvent.criteria_list.length > 0 && (
                <div>
                  <div className="text-xs font-black uppercase mb-2">Judging</div>
                  <ul className="space-y-1 text-sm font-medium list-disc pl-5">
                    {openEvent.criteria_list.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Modal Action Buttons */}
              <div className="pt-4 mt-2 border-t-2 border-foreground flex flex-wrap items-center justify-between gap-3">
                <a
                  href={configData.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-foreground text-background px-6 py-3 font-black uppercase text-xs brut-border brut-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition inline-flex items-center gap-2"
                >
                  Register For Event →
                </a>
                <a
                  href={configData.brochureLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[var(--brut-yellow)] text-black px-5 py-3 font-black uppercase text-xs brut-border brut-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition inline-flex items-center gap-2"
                >
                  <span>View in Brochure</span>
                  <span>📄</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
