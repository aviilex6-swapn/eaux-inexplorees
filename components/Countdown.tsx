"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownProps {
  targetDate: string; // ISO date string, e.g. "2026-04-28T09:00:00"
}

function computeCountdown(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
    past: false,
  };
}

export function Countdown({ targetDate }: CountdownProps) {
  const target = new Date(targetDate);
  const [cd, setCd] = useState(computeCountdown(target));
  // Track previous hours to trigger flash animation
  const prevHours = useRef(cd.hours);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const next = computeCountdown(target);
      setCd(next);
      if (!next.past && next.hours !== prevHours.current) {
        prevHours.current = next.hours;
        setFlashKey((k) => k + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const display = cd.days > 0
    ? `${cd.days}j ${cd.hours}h`
    : `${cd.hours}h ${cd.minutes}m`;

  if (cd.past) {
    return (
      <div
        className="text-center py-4 rounded-lg"
        style={{
          background: "radial-gradient(circle, rgba(232,168,56,0.12), transparent)",
          border: "1px solid rgba(232,168,56,0.25)",
        }}
      >
        <div
          className="text-3xl font-bold animate-pulse-slow"
          style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
        >
          Aujourd&apos;hui !
        </div>
        <div
          className="text-[10px] uppercase tracking-[2px] mt-2"
          style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.5)" }}
        >
          Jour de Marée
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-center py-4 rounded-lg"
      style={{
        background: "radial-gradient(circle, rgba(232,168,56,0.08), transparent)",
        border: "1px solid rgba(232,168,56,0.2)",
      }}
    >
      {/* Main display — re-keyed on each hour change to re-trigger flash animation */}
      <div
        key={flashKey}
        className="text-4xl font-bold hour-flash"
        style={{ fontFamily: "'Cinzel', serif", color: "#E8A838" }}
      >
        {display}
      </div>
      <div
        className="text-[10px] uppercase tracking-[2px] mt-2"
        style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(240,228,200,0.45)" }}
      >
        avant le Jour de Marée
      </div>
      {cd.days === 0 && (
        <div
          className="mt-1 text-[9px]"
          style={{ fontFamily: "'Press Start 2P', monospace", color: "rgba(232,168,56,0.55)" }}
        >
          {cd.minutes}m {cd.seconds}s
        </div>
      )}
    </div>
  );
}
