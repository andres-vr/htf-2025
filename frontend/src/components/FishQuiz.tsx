"use client";

import { useEffect, useState } from "react";
import { Fish } from "@/types/fish";

interface FishQuizProps {
  open: boolean;
  fish: Fish;
  scientificName?: string | null;
  onClose: () => void;
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FishQuiz({ open, fish, scientificName, onClose }: FishQuizProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setResult(null);
    const load = async () => {
      setLoading(true);
      try {
        // fetch fish list to pick distractors
        const res = await fetch("http://localhost:5555/api/fish");
        if (!res.ok) {
          setOptions([fish.name]);
          return;
        }
        const all: Fish[] = await res.json();
        const names = all.map((f) => f.name).filter((n) => n !== fish.name);
        shuffle(names);
        const picks = names.slice(0, 3);
        const opts = shuffle([fish.name, ...picks]);
        setOptions(opts);
      } catch (err) {
        console.error(err);
        setOptions([fish.name]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, fish]);

  if (!open) return null;

  const question = scientificName ? `What is the common name for ${scientificName}?` : `Which of these is another name for ${fish.name}?`;

  const onSelect = (opt: string) => {
    setSelected(opt);
    setResult(opt === fish.name ? "correct" : "incorrect");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[color-mix(in_srgb,var(--color-dark-navy)_95%,transparent)] border border-panel-border rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold">Fish Quiz</div>
          <button className="text-xs text-text-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="mb-3 text-sm text-text-primary">{question}</div>

        <div className="flex flex-col gap-2">
          {loading && <div className="text-text-secondary">Loading options…</div>}
          {!loading && options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`text-left px-3 py-2 rounded border ${selected === opt ? "border-sonar-green" : "border-panel-border"} ${result && opt === fish.name ? "bg-[rgba(20,255,236,0.08)]" : ''}`}
              disabled={!!result}
            >
              {opt}
            </button>
          ))}
        </div>

        {result && (
          <div className="mt-3 text-sm">
            {result === "correct" ? (
              <div className="text-sonar-green font-bold">Correct! Nice job.</div>
            ) : (
              <div className="text-warning-amber font-bold">Incorrect — the correct answer is <span className="text-sonar-green">{fish.name}</span>.</div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button className="text-sm px-3 py-1 rounded border border-panel-border" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
