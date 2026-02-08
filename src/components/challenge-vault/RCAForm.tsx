"use client";

import { useState } from "react";
import { RootCauseStep } from "@/lib/types";
import { updateRootCauseAnalysis } from "@/lib/api";
import { Plus, Save } from "lucide-react";

interface RCAFormProps {
  coreProblemId: string;
  initialRCA: RootCauseStep[];
  onSaved: (rca: RootCauseStep[]) => void;
}

const whyLabels = ["Why? (Level 1)", "Why? (Level 2)", "Why? (Level 3)", "Why? (Level 4)", "Why? (Level 5)"];

export default function RCAForm({ coreProblemId, initialRCA, onSaved }: RCAFormProps) {
  const [steps, setSteps] = useState<RootCauseStep[]>(
    initialRCA.length > 0 ? initialRCA : [{ level: 1, answer: "" }]
  );
  const [saving, setSaving] = useState(false);

  const addStep = () => {
    if (steps.length >= 5) return;
    setSteps([...steps, { level: steps.length + 1, answer: "" }]);
  };

  const updateStep = (index: number, answer: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], answer };
    setSteps(updated);
  };

  const handleSave = async () => {
    const validSteps = steps.filter((s) => s.answer.trim());
    if (validSteps.length === 0) return;

    setSaving(true);
    try {
      await updateRootCauseAnalysis(coreProblemId, validSteps);
      onSaved(validSteps);
    } catch (err) {
      console.error("Error saving RCA:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="text-zinc-800 text-sm font-bold font-['Lato']">Root Cause Analysis</div>
        <div className="text-xs font-['Satoshi'] text-[#0497ae]">5 Whys Method</div>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0497ae]/10 flex items-center justify-center">
              <span className="text-xs font-bold font-['Satoshi'] text-[#0497ae]">{step.level}</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-medium font-['Satoshi'] text-stone-500">
                {whyLabels[i] || `Why? (Level ${step.level})`}
              </label>
              <textarea
                value={step.answer}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder="Enter the root cause at this level..."
                rows={2}
                className="px-3 py-2 bg-[#0497ae]/5 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-[#0497ae]/10 focus:border-[#0497ae]/30 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {steps.length < 5 && (
          <button
            onClick={addStep}
            className="flex items-center gap-1.5 text-sm font-bold font-['Satoshi'] text-[#0497ae] hover:text-[#037a8e] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Another Why
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || steps.every((s) => !s.answer.trim())}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0497ae] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer disabled:opacity-50 ml-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save RCA"}
        </button>
      </div>
    </div>
  );
}
