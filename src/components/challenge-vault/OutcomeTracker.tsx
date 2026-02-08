"use client";

import { useState } from "react";
import { recordOutcome } from "@/lib/api";
import { Check, RotateCcw } from "lucide-react";

interface OutcomeTrackerProps {
  coreProblemId: string;
  onUpdated: () => void;
}

export default function OutcomeTracker({ coreProblemId, onUpdated }: OutcomeTrackerProps) {
  const [isSolved, setIsSolved] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSolved === null) return;

    setSubmitting(true);
    try {
      await recordOutcome(coreProblemId, isSolved, notes);
      onUpdated();
    } catch (err) {
      console.error("Error recording outcome:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-50 rounded-2xl">
      <div className="text-zinc-800 text-sm font-bold font-['Lato']">Outcome Tracking</div>
      <div className="text-stone-500 text-xs font-['Satoshi']">
        Did the selected solution solve the core problem?
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setIsSolved(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold font-['Satoshi'] cursor-pointer transition-all ${
            isSolved === true
              ? "bg-green-600 text-white"
              : "bg-white border border-gray-200 text-zinc-800 hover:border-green-300"
          }`}
        >
          <Check className="w-4 h-4" /> Yes, Solved
        </button>
        <button
          onClick={() => setIsSolved(false)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold font-['Satoshi'] cursor-pointer transition-all ${
            isSolved === false
              ? "bg-amber-500 text-white"
              : "bg-white border border-gray-200 text-zinc-800 hover:border-amber-300"
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Re-evaluate
        </button>
      </div>

      {isSolved !== null && (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isSolved ? "Share the win reflection..." : "What should be re-evaluated?"}
            rows={3}
            className="px-3 py-2.5 bg-white rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-gray-200 focus:border-[#0497ae]/30 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#0497ae] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer disabled:opacity-50 self-end"
          >
            {submitting ? "Saving..." : "Record Outcome"}
          </button>
        </>
      )}
    </div>
  );
}
