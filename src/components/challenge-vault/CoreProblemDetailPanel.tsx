"use client";

import { useState, useEffect, useCallback } from "react";
import { CoreProblem, Solution } from "@/lib/types";
import { fetchSolutionsForCoreProblem, openForPublicSolutions, escalateCoreProblem, resolveCoreProblem } from "@/lib/api";
import RCAForm from "./RCAForm";
import SolutionReviewCard from "./SolutionReviewCard";
import OutcomeTracker from "./OutcomeTracker";
import { ArrowLeft, Globe, AlertTriangle, Trophy } from "lucide-react";

const statusLabels: Record<string, string> = {
  identified: "Identified",
  "open-for-solutions": "Open for Solutions",
  "solution-implementing": "Implementing",
  resolved: "Resolved",
  escalated: "Escalated",
};

const statusColors: Record<string, string> = {
  identified: "bg-amber-100 text-amber-800",
  "open-for-solutions": "bg-teal-100 text-teal-800",
  "solution-implementing": "bg-indigo-100 text-indigo-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-red-100 text-red-700",
};

interface CoreProblemDetailPanelProps {
  coreProblem: CoreProblem;
  onBack: () => void;
}

export default function CoreProblemDetailPanel({ coreProblem: initialCP, onBack }: CoreProblemDetailPanelProps) {
  const [cp, setCp] = useState(initialCP);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(true);
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateNotes, setEscalateNotes] = useState("");
  const [escalateUserId, setEscalateUserId] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [winReflection, setWinReflection] = useState("");

  const loadSolutions = useCallback(async () => {
    try {
      setLoadingSolutions(true);
      const data = await fetchSolutionsForCoreProblem(cp._id);
      setSolutions(data);
    } catch (err) {
      console.error("Error loading solutions:", err);
    } finally {
      setLoadingSolutions(false);
    }
  }, [cp._id]);

  useEffect(() => {
    loadSolutions();
  }, [loadSolutions]);

  const handleOpenForSolutions = async () => {
    try {
      const updated = await openForPublicSolutions(cp._id);
      setCp(updated);
    } catch (err) {
      console.error("Error opening for solutions:", err);
    }
  };

  const handleEscalate = async () => {
    if (!escalateUserId.trim()) return;
    try {
      const updated = await escalateCoreProblem(cp._id, escalateUserId, escalateNotes);
      setCp(updated);
      setShowEscalate(false);
    } catch (err) {
      console.error("Error escalating:", err);
    }
  };

  const handleResolve = async () => {
    const selectedSolution = solutions.find((s) => s.isSelected);
    if (!selectedSolution) return;
    try {
      const updated = await resolveCoreProblem(cp._id, selectedSolution._id, winReflection);
      setCp(updated);
      setShowResolve(false);
    } catch (err) {
      console.error("Error resolving:", err);
    }
  };

  const selectedSolution = solutions.find((s) => s.isSelected);
  const acceptedSolutions = solutions.filter((s) => s.status === "accepted");

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 text-sm font-bold font-['Satoshi'] hover:text-zinc-800 cursor-pointer self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Core Problems
      </button>

      {/* Core Problem Info */}
      <div className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-zinc-800 text-xl font-bold font-['Lato']">{cp.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${statusColors[cp.status]}`}>
                {statusLabels[cp.status]}
              </span>
              {cp.isPublic && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 rounded-md text-xs font-medium font-['Satoshi'] text-teal-700">
                  <Globe className="w-3 h-3" /> Public
                </span>
              )}
              {cp.isSolved && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md text-xs font-medium font-['Satoshi'] text-green-700">
                  <Trophy className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-zinc-800 text-sm font-['Satoshi'] leading-relaxed">{cp.description}</div>

        {/* Linked Challenges */}
        {cp.challenges.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold font-['Satoshi'] text-stone-400">Linked Challenges</div>
            <div className="flex flex-wrap gap-2">
              {cp.challenges.map((ch) => (
                <span key={ch._id} className="px-2.5 py-1 bg-neutral-50 rounded-lg text-xs font-['Satoshi'] text-zinc-800">
                  {ch.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assigned To & Escalation */}
        <div className="flex items-center gap-4 text-xs font-['Satoshi'] text-stone-400">
          {cp.assignedTo && (
            <span>Assigned to <span className="text-zinc-800 font-medium">{cp.assignedTo.name}</span></span>
          )}
          {cp.escalatedTo && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3 h-3" />
              Escalated to {cp.escalatedTo.name}
            </span>
          )}
          {cp.resolvedAt && (
            <span>Resolved on {new Date(cp.resolvedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* RCA Section */}
      <div className="p-5 bg-white rounded-2xl border border-gray-100">
        <RCAForm
          coreProblemId={cp._id}
          initialRCA={cp.rootCauseAnalysis}
          onSaved={(rca) => setCp({ ...cp, rootCauseAnalysis: rca })}
        />
      </div>

      {/* Action Buttons */}
      {cp.status !== "resolved" && (
        <div className="flex flex-wrap gap-3">
          {cp.status === "identified" && cp.rootCauseAnalysis.length > 0 && (
            <button
              onClick={handleOpenForSolutions}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0497ae] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer"
            >
              <Globe className="w-4 h-4" /> Open for Brainstorming
            </button>
          )}
          {cp.status !== "escalated" && (
            <button
              onClick={() => setShowEscalate(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" /> Escalate
            </button>
          )}
          {selectedSolution && cp.status === "solution-implementing" && (
            <button
              onClick={() => setShowResolve(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer"
            >
              <Trophy className="w-4 h-4" /> Mark Resolved
            </button>
          )}
        </div>
      )}

      {/* Escalate Form */}
      {showEscalate && (
        <div className="p-5 bg-white rounded-2xl border border-red-100 flex flex-col gap-3">
          <div className="text-zinc-800 text-sm font-bold font-['Lato']">Escalate Core Problem</div>
          <input
            type="text"
            value={escalateUserId}
            onChange={(e) => setEscalateUserId(e.target.value)}
            placeholder="User ID to escalate to..."
            className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none"
          />
          <textarea
            value={escalateNotes}
            onChange={(e) => setEscalateNotes(e.target.value)}
            placeholder="Escalation notes..."
            rows={2}
            className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowEscalate(false)} className="px-4 py-2 text-sm font-['Satoshi'] text-stone-400 cursor-pointer">Cancel</button>
            <button onClick={handleEscalate} className="px-4 py-2 bg-red-600 text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer">Escalate</button>
          </div>
        </div>
      )}

      {/* Resolve Form */}
      {showResolve && (
        <div className="p-5 bg-white rounded-2xl border border-green-100 flex flex-col gap-3">
          <div className="text-zinc-800 text-sm font-bold font-['Lato']">Resolve Core Problem</div>
          <div className="text-xs font-['Satoshi'] text-stone-400">
            Selected solution: <span className="text-zinc-800 font-medium">{selectedSolution?.description.slice(0, 100)}...</span>
          </div>
          <textarea
            value={winReflection}
            onChange={(e) => setWinReflection(e.target.value)}
            placeholder="Win reflection - what did we learn?"
            rows={3}
            className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowResolve(false)} className="px-4 py-2 text-sm font-['Satoshi'] text-stone-400 cursor-pointer">Cancel</button>
            <button onClick={handleResolve} className="px-4 py-2 bg-green-600 text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer">Resolve</button>
          </div>
        </div>
      )}

      {/* Solutions Section */}
      <div className="flex flex-col gap-4">
        <div className="text-zinc-800 text-base font-bold font-['Lato']">
          Solutions ({solutions.length})
        </div>
        {loadingSolutions ? (
          <div className="text-stone-400 text-sm font-['Satoshi']">Loading solutions...</div>
        ) : solutions.length === 0 ? (
          <div className="p-4 bg-neutral-50 rounded-2xl text-center">
            <div className="text-stone-400 text-sm font-['Satoshi']">
              {cp.isPublic ? "No solutions submitted yet. Members can submit solutions from HQ." : "Open this problem for public brainstorming to receive solutions."}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {solutions.map((solution) => (
              <SolutionReviewCard key={solution._id} solution={solution} onUpdated={loadSolutions} />
            ))}
          </div>
        )}
      </div>

      {/* Outcome Tracker (after resolution) */}
      {cp.status === "resolved" && !cp.outcomeNotes && (
        <OutcomeTracker coreProblemId={cp._id} onUpdated={onBack} />
      )}

      {/* Outcome Notes (if already recorded) */}
      {cp.outcomeNotes && (
        <div className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2">
          <div className="text-zinc-800 text-sm font-bold font-['Lato']">Outcome</div>
          <div className="text-sm font-['Satoshi'] text-zinc-800">{cp.outcomeNotes}</div>
          {cp.winReflection && (
            <div className="px-3 py-2 bg-green-50 rounded-xl mt-2">
              <div className="text-xs font-bold font-['Satoshi'] text-green-700 mb-1">Win Reflection</div>
              <div className="text-sm font-['Satoshi'] text-zinc-800">{cp.winReflection}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
