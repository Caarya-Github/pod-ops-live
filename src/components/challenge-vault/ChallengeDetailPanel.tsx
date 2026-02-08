"use client";

import { useState, useEffect } from "react";
import { Challenge, CoreProblem, ChallengeCategory } from "@/lib/types";
import { fetchCoreProblemsByPod, createCoreProblem, linkChallengeToCoreProblem, updateChallenge } from "@/lib/api";
import RCAForm from "./RCAForm";
import { ArrowLeft, Link2, Plus } from "lucide-react";

const statusLabels: Record<string, string> = {
  identified: "Identified",
  "rca-in-progress": "RCA In Progress",
  "rca-completed": "RCA Completed",
  "solution-in-progress": "Solution In Progress",
  resolved: "Resolved",
  archived: "Archived",
};

const statusColors: Record<string, string> = {
  identified: "bg-amber-100 text-amber-800",
  "rca-in-progress": "bg-sky-100 text-sky-800",
  "rca-completed": "bg-teal-100 text-teal-800",
  "solution-in-progress": "bg-indigo-100 text-indigo-800",
  resolved: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-600",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const categoryLabels: Record<ChallengeCategory, string> = {
  bmps: "BPMs",
  culture: "Culture",
  marketing: "Marketing",
  strategicPartners: "Strategic Partners",
  partnerRelations: "Partner Relations",
  services: "Services",
};

interface ChallengeDetailPanelProps {
  challenge: Challenge;
  podId: string;
  onBack: () => void;
}

export default function ChallengeDetailPanel({ challenge, podId, onBack }: ChallengeDetailPanelProps) {
  const [coreProblems, setCoreProblems] = useState<CoreProblem[]>([]);
  const [showCreateCoreProblem, setShowCreateCoreProblem] = useState(false);
  const [showLinkCoreProblem, setShowLinkCoreProblem] = useState(false);
  const [cpTitle, setCpTitle] = useState("");
  const [cpDescription, setCpDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const addedByName = typeof challenge.addedBy === "string"
    ? challenge.addedBy
    : challenge.addedBy?.name || "Unknown";

  const linkedCoreProblem = typeof challenge.coreProblemId === "object" && challenge.coreProblemId
    ? challenge.coreProblemId
    : null;

  useEffect(() => {
    if (showLinkCoreProblem) {
      fetchCoreProblemsByPod(podId).then(setCoreProblems).catch(console.error);
    }
  }, [showLinkCoreProblem, podId]);

  const handleCreateCoreProblem = async () => {
    if (!cpTitle.trim() || !cpDescription.trim()) return;
    setCreating(true);
    try {
      await createCoreProblem({
        title: cpTitle.trim(),
        description: cpDescription.trim(),
        podId,
        challengeId: challenge._id,
      });
      setShowCreateCoreProblem(false);
      onBack();
    } catch (err) {
      console.error("Error creating core problem:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleLinkCoreProblem = async (cpId: string) => {
    try {
      await linkChallengeToCoreProblem(challenge._id, cpId);
      setShowLinkCoreProblem(false);
      onBack();
    } catch (err) {
      console.error("Error linking core problem:", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateChallenge(challenge._id, { status: newStatus });
      onBack();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 text-sm font-bold font-['Satoshi'] hover:text-zinc-800 cursor-pointer self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Challenges
      </button>

      {/* Challenge Info Card */}
      <div className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-zinc-800 text-xl font-bold font-['Lato']">{challenge.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${statusColors[challenge.status]}`}>
                {statusLabels[challenge.status]}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${priorityColors[challenge.priority]}`}>
                {challenge.priority}
              </span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-xs font-medium font-['Satoshi'] text-stone-500">
                {categoryLabels[challenge.category as ChallengeCategory]}
              </span>
              {challenge.creditsAwarded && (
                <span className="px-1.5 py-0.5 bg-green-100 rounded text-xs font-bold text-green-700">+10 credits</span>
              )}
            </div>
          </div>
          {/* Status Actions */}
          <select
            value={challenge.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-['Satoshi'] text-zinc-800 outline-none cursor-pointer"
          >
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="text-zinc-800 text-sm font-['Satoshi'] leading-relaxed">{challenge.description}</div>

        <div className="flex items-center gap-4 text-xs font-['Satoshi'] text-stone-400">
          <span>Added by <span className="text-zinc-800 font-medium">{addedByName}</span></span>
          <span>Identified on {new Date(challenge.dateIdentified).toLocaleDateString()}</span>
        </div>

        {/* Linked Core Problem */}
        {linkedCoreProblem && (
          <div className="px-3 py-2.5 bg-[#0497ae]/5 rounded-xl border border-[#0497ae]/10 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#0497ae]" />
            <span className="text-sm font-['Satoshi'] text-zinc-800">
              Linked to: <span className="font-bold">{linkedCoreProblem.title}</span>
            </span>
            <span className="ml-auto px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] bg-[#0497ae]/10 text-[#0497ae]">
              {linkedCoreProblem.status}
            </span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      {!linkedCoreProblem && (
        <div className="p-5 bg-white rounded-2xl border border-gray-100 flex flex-col gap-4">
          <div className="text-zinc-800 text-sm font-bold font-['Lato']">Root Cause Analysis</div>
          <div className="text-stone-400 text-xs font-['Satoshi']">
            Create a core problem with RCA or link to an existing one.
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreateCoreProblem(true); setShowLinkCoreProblem(false); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0497ae] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Core Problem
            </button>
            <button
              onClick={() => { setShowLinkCoreProblem(true); setShowCreateCoreProblem(false); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-zinc-800 text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer"
            >
              <Link2 className="w-4 h-4" /> Link Existing
            </button>
          </div>

          {/* Create Core Problem Form */}
          {showCreateCoreProblem && (
            <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={cpTitle}
                onChange={(e) => setCpTitle(e.target.value)}
                placeholder="Core problem title..."
                className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none"
              />
              <textarea
                value={cpDescription}
                onChange={(e) => setCpDescription(e.target.value)}
                placeholder="Core problem description..."
                rows={2}
                className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCreateCoreProblem(false)}
                  className="px-4 py-2 text-sm font-['Satoshi'] text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCoreProblem}
                  disabled={creating}
                  className="px-4 py-2 bg-[#0497ae] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create & Link"}
                </button>
              </div>
            </div>
          )}

          {/* Link Existing Core Problem */}
          {showLinkCoreProblem && (
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              {coreProblems.length === 0 ? (
                <div className="text-stone-400 text-xs font-['Satoshi']">No existing core problems for this pod.</div>
              ) : (
                coreProblems.map((cp) => (
                  <button
                    key={cp._id}
                    onClick={() => handleLinkCoreProblem(cp._id)}
                    className="px-3 py-2.5 bg-neutral-50 rounded-xl text-left hover:bg-[#0497ae]/5 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <span className="text-sm font-bold font-['Satoshi'] text-zinc-800">{cp.title}</span>
                    <span className="text-xs font-['Satoshi'] text-stone-400">{cp.status}</span>
                  </button>
                ))
              )}
              <button
                onClick={() => setShowLinkCoreProblem(false)}
                className="text-xs font-['Satoshi'] text-stone-400 cursor-pointer self-end"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* RCA Form for linked problems that are in RCA stage */}
      {linkedCoreProblem && (challenge.status === "rca-in-progress" || challenge.status === "identified") && (
        <div className="p-5 bg-white rounded-2xl border border-gray-100">
          <RCAForm
            coreProblemId={typeof challenge.coreProblemId === "object" && challenge.coreProblemId ? challenge.coreProblemId._id : ""}
            initialRCA={[]}
            onSaved={() => onBack()}
          />
        </div>
      )}
    </div>
  );
}
