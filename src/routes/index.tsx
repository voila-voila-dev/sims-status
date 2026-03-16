import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: SimsStatus,
});

type Direction = "increasing" | "decreasing" | "static";

type Category = {
  id: string;
  label: string;
  icon: string;
  value: number;
  direction: Direction;
};

const defaultCategories: Category[] = [
  { id: "bladder", label: "Bladder", icon: "🚽", value: 50, direction: "static" },
  { id: "fun", label: "Fun", icon: "🎮", value: 50, direction: "static" },
  { id: "hunger", label: "Hunger", icon: "🍔", value: 50, direction: "static" },
  { id: "attention", label: "Attention", icon: "💬", value: 50, direction: "static" },
  { id: "energy", label: "Energy", icon: "⚡", value: 50, direction: "static" },
  { id: "hygiene", label: "Hygiene", icon: "🚿", value: 50, direction: "static" },
];

function getBarGradient(value: number): string {
  if (value >= 60) return "from-emerald-400 via-green-400 to-green-500";
  if (value >= 30) return "from-yellow-300 via-amber-400 to-orange-500";
  return "from-red-400 via-red-500 to-red-600";
}

function getBarTrack(value: number): string {
  if (value >= 60) return "bg-green-950/60";
  if (value >= 30) return "bg-amber-950/60";
  return "bg-red-950/60";
}

function getIconRing(value: number): string {
  if (value >= 60) return "ring-emerald-400/50 bg-emerald-500/15";
  if (value >= 30) return "ring-amber-400/50 bg-amber-500/15";
  return "ring-red-400/50 bg-red-500/15";
}

function getDirectionIcon(direction: Direction): string {
  if (direction === "increasing") return "▲";
  if (direction === "decreasing") return "▼";
  return "";
}

function getDirectionColor(direction: Direction): string {
  if (direction === "increasing") return "text-emerald-400";
  if (direction === "decreasing") return "text-red-400";
  return "text-slate-500";
}

function StatusBar({ category, onChange, onCycleDirection }: {
  category: Category;
  onChange: (id: string, value: number) => void;
  onCycleDirection: (id: string) => void;
}) {
  const { id, label, icon, value, direction } = category;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateValue = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(id, Math.round(ratio * 100));
  }, [id, onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateValue(e.clientX);
  }, [updateValue]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updateValue(e.clientX);
  }, [isDragging, updateValue]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={`relative rounded-2xl p-3.5 transition-all duration-300 backdrop-blur-sm ${
      isDragging
        ? "bg-white/10 scale-[1.02] shadow-xl"
        : "bg-white/[0.04] hover:bg-white/[0.07]"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ring-1 ${getIconRing(value)} transition-all duration-500`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-[13px]">{label}</span>
              {direction !== "static" && (
                <span className={`text-[10px] ${getDirectionColor(direction)} animate-pulse`}>
                  {getDirectionIcon(direction)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-white/30 font-medium tabular-nums">{value}/100</span>
          </div>
        </div>
        <button
          onClick={() => onCycleDirection(id)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
            direction === "static"
              ? "bg-white/5 text-white/40 hover:bg-white/10"
              : direction === "increasing"
                ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
          }`}
        >
          {direction === "static" ? "Static" : direction === "increasing" ? "Rising" : "Falling"}
        </button>
      </div>

      {/* Bar track */}
      <div
        ref={trackRef}
        className={`relative h-8 rounded-xl overflow-hidden cursor-pointer ${getBarTrack(value)} transition-colors duration-500 touch-none`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Fill */}
        <div
          className={`absolute inset-y-0 left-0 rounded-xl bg-gradient-to-r ${getBarGradient(value)} transition-[width,background] duration-300 ease-out`}
          style={{ width: `${value}%` }}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 via-transparent to-black/10" />
          {/* Animated shimmer */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
          </div>
        </div>
        {/* Thumb indicator */}
        <div
          className="absolute top-1 bottom-1 w-1 rounded-full bg-white/80 shadow-lg transition-[left] duration-300 ease-out"
          style={{ left: `calc(${value}% - 2px)` }}
        />
      </div>
    </div>
  );
}

function SimsPlumbob({ mood }: { mood: number }) {
  const color = mood >= 60 ? "text-emerald-400" : mood >= 30 ? "text-amber-400" : "text-red-400";
  const glow = mood >= 60 ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : mood >= 30 ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]";

  return (
    <svg viewBox="0 0 40 60" className={`w-8 h-12 ${color} ${glow} animate-bounce-slow`} fill="currentColor">
      <path d="M20 2 L38 30 L20 58 L2 30 Z" />
      <path d="M20 2 L38 30 L20 30 Z" fill="currentColor" opacity="0.7" />
      <path d="M20 30 L38 30 L20 58 Z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function SimsStatus() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [playerName, setPlayerName] = useState("Your Name");
  const [isEditingName, setIsEditingName] = useState(false);

  // Animate bars that are moving
  useEffect(() => {
    const interval = setInterval(() => {
      setCategories(prev => prev.map(cat => {
        if (cat.direction === "static") return cat;
        const delta = cat.direction === "increasing" ? 1 : -1;
        const newValue = Math.max(0, Math.min(100, cat.value + delta));
        // Stop at boundaries
        if (newValue === 0 || newValue === 100) {
          return { ...cat, value: newValue, direction: "static" as Direction };
        }
        return { ...cat, value: newValue };
      }));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleChange = useCallback((id: string, value: number) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, value } : c))
    );
  }, []);

  const handleCycleDirection = useCallback((id: string) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const next: Direction = c.direction === "static" ? "increasing" : c.direction === "increasing" ? "decreasing" : "static";
        return { ...c, direction: next };
      })
    );
  }, []);

  const overallMood = Math.round(
    categories.reduce((sum, c) => sum + c.value, 0) / categories.length
  );

  const moodLabel = overallMood >= 80 ? "Thriving" : overallMood >= 60 ? "Content" : overallMood >= 40 ? "Meh" : overallMood >= 20 ? "Struggling" : "SOS";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1923] via-[#152030] to-[#0d1520] flex flex-col items-center px-4 py-5 select-none">
      {/* Header with Plumbob */}
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-5">
          <SimsPlumbob mood={overallMood} />
          <div className="mt-2 flex items-center gap-2">
            {isEditingName ? (
              <input
                autoFocus
                className="bg-transparent text-white font-bold text-xl text-center border-b-2 border-emerald-400/60 outline-none w-44"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                maxLength={20}
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-white font-bold text-xl hover:text-emerald-300 transition-colors"
              >
                {playerName}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(overallMood)} transition-all duration-500`}
                style={{ width: `${overallMood}%` }}
              />
            </div>
            <span className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">{moodLabel}</span>
          </div>
        </div>

        {/* Status panel */}
        <div className="bg-white/[0.03] rounded-3xl p-3 ring-1 ring-white/[0.06] shadow-2xl">
          <div className="grid grid-cols-1 gap-2">
            {categories.map(cat => (
              <StatusBar
                key={cat.id}
                category={cat}
                onChange={handleChange}
                onCycleDirection={handleCycleDirection}
              />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.25em]">
            Slide to set · Tap button to animate · Tap name to edit
          </p>
        </div>
      </div>
    </div>
  );
}
