"use client";

import { useEffect, useState } from "react";
import { Fish } from "@/types/fish";

export default function GlobalQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [currentFish, setCurrentFish] = useState<Fish | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);

  useEffect(() => {
    if (open) startNewQuestion();
    else reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reset = () => {
    setLoading(false);
    setOptions([]);
    setCurrentFish(null);
    setQuestionText("");
    setSelected(null);
    setResult(null);
    setScore(0);
    setAsked(0);
  };

  const startNewQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5555/api/fish");
      if (!res.ok) throw new Error("Failed to load fish list");
      const all: Fish[] = await res.json();
      if (!all || all.length === 0) {
        setQuestionText("No fish available");
        setOptions([]);
        setLoading(false);
        return;
      }

      // pick a random fish
      const pick = all[Math.floor(Math.random() * all.length)];
      setCurrentFish(pick);

      // try to fetch enrichment (scientific name) for better question phrasing
      let scientific: string | null = null;
      try {
        const enr = await fetch(`http://localhost:5555/api/fish/enrich/${pick.id}`);
        if (enr.ok) {
          const payload = await enr.json();
          scientific = payload?.enrichment?.scientificName ?? null;
        }
      } catch (e) {
        // ignore
      }

      const question = scientific
        ? `Which common name corresponds to the scientific name "${scientific}"?`
        : `Which of these is another name for "${pick.name}"?`;

      // build distractors
      const names = all.map((f) => f.name).filter((n) => n !== pick.name);
      // shuffle and take 3
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
      const picks = names.slice(0, 3);
      const opts = [pick.name, ...picks].sort(() => Math.random() - 0.5);

      setQuestionText(question);
      setOptions(opts);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setQuestionText("Failed to load question");
      setOptions([]);
      setLoading(false);
    }
  };

  const submit = (choice: string) => {
    if (!currentFish) return;
    setSelected(choice);
    const correct = choice === currentFish.name;
    setResult(correct ? "correct" : "incorrect");
    setAsked((a) => a + 1);
    if (correct) setScore((s) => s + 1);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 bg-[color-mix(in_srgb,var(--color-dark-navy)_95%,transparent)] border border-panel-border rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold">Global Fish Quiz</div>
          <div className="text-xs text-text-secondary">Score: {score} / {asked}</div>
        </div>

        <div className="mb-3 text-sm text-text-primary">{loading ? 'Loading question...' : questionText}</div>

        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => submit(opt)}
              disabled={!!result}
              className={`text-left px-3 py-2 rounded border ${selected === opt ? 'border-sonar-green' : 'border-panel-border'}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {result && (
          <div className="mt-3">
            {result === 'correct' ? (
              <div className="text-sonar-green font-bold">Correct!</div>
            ) : (
              <div className="text-warning-amber font-bold">Incorrect — the correct answer was <span className="text-sonar-green">{currentFish?.name}</span>.</div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <div>
            <button className="text-sm px-3 py-1 rounded border border-panel-border mr-2" onClick={onClose}>End Quiz</button>
            <button className="text-sm px-3 py-1 rounded border border-panel-border" onClick={() => { setSelected(null); setResult(null); startNewQuestion(); }}>Next</button>
          </div>
          <div className="text-xs text-text-secondary">Tip: questions use the scientific name when available.</div>
        </div>
      </div>
    </div>
  );
}
