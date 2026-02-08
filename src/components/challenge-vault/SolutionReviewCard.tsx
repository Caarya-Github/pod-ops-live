"use client";

import { useState } from "react";
import { Solution } from "@/lib/types";
import { reviewSolution, selectSolution } from "@/lib/api";
import { Check, X, Star } from "lucide-react";

interface SolutionReviewCardProps {
  solution: Solution;
  onUpdated: () => void;
}

const statusColors: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-800",
  "under-review": "bg-sky-100 text-sky-800",
  accepted: "bg-green-100 text-green-800",
  discarded: "bg-red-100 text-red-600",
  implementing: "bg-indigo-100 text-indigo-800",
  implemented: "bg-emerald-100 text-emerald-800",
};

export default function SolutionReviewCard({ solution, onUpdated }: SolutionReviewCardProps) {
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const submitterName = typeof solution.submittedBy === "string"
    ? solution.submittedBy
    : solution.submittedBy?.name || "Unknown";

  const handleReview = async (status: "accepted" | "discarded") => {
    setReviewing(true);
    try {
      await reviewSolution(solution._id, status, reviewNotes);
      onUpdated();
    } catch (err) {
      console.error("Error reviewing solution:", err);
    } finally {
      setReviewing(false);
    }
  };

  const handleSelect = async () => {
    try {
      await selectSolution(solution._id);
      onUpdated();
    } catch (err) {
      console.error("Error selecting solution:", err);
    }
  };

  const canReview = solution.status === "submitted" || solution.status === "under-review";
  const canSelect = solution.status === "accepted" && !solution.isSelected;

  return (
    <div className="p-4 bg-neutral-50 rounded-2xl flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-zinc-800 text-sm font-bold font-['Lato']">{submitterName}</div>
          <div className="text-stone-400 text-xs font-['Satoshi']">
            {new Date(solution.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${statusColors[solution.status] || "bg-gray-100 text-gray-600"}`}>
            {solution.status.replace("-", " ")}
          </span>
          {solution.isSelected && (
            <span className="px-2 py-0.5 bg-amber-100 rounded-md text-xs font-bold font-['Satoshi'] text-amber-700 flex items-center gap-1">
              <Star className="w-3 h-3" /> Selected
            </span>
          )}
          {solution.creditsAwarded && (
            <span className="px-1.5 py-0.5 bg-green-100 rounded text-xs font-bold text-green-700">+30</span>
          )}
        </div>
      </div>

      <div className="text-zinc-800 text-sm font-['Satoshi'] leading-relaxed">{solution.description}</div>

      {solution.reviewNotes && (
        <div className="px-3 py-2 bg-white rounded-xl border border-gray-100">
          <div className="text-xs font-bold font-['Satoshi'] text-stone-400 mb-1">Review Notes</div>
          <div className="text-sm font-['Satoshi'] text-zinc-800">{solution.reviewNotes}</div>
        </div>
      )}

      {solution.outcome && (
        <div className="px-3 py-2 bg-white rounded-xl border border-gray-100">
          <div className="text-xs font-bold font-['Satoshi'] text-stone-400 mb-1">Outcome</div>
          <div className="text-sm font-['Satoshi'] text-zinc-800">{solution.outcome}</div>
        </div>
      )}

      {canReview && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="text-sm font-bold font-['Satoshi'] text-[#0497ae] hover:text-[#037a8e] cursor-pointer self-start"
        >
          Review this solution
        </button>
      )}

      {canReview && showReviewForm && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Review notes (optional)..."
            rows={2}
            className="px-3 py-2 bg-white rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-gray-200 focus:border-[#0497ae]/30 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReview("accepted")}
              disabled={reviewing}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold font-['Satoshi'] rounded-full cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Accept (+30 credits)
            </button>
            <button
              onClick={() => handleReview("discarded")}
              disabled={reviewing}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold font-['Satoshi'] rounded-full cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Discard
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-xs font-['Satoshi'] text-stone-400 hover:text-zinc-800 cursor-pointer ml-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {canSelect && (
        <button
          onClick={handleSelect}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0497ae] text-white text-xs font-bold font-['Satoshi'] rounded-full cursor-pointer self-start"
        >
          <Star className="w-3.5 h-3.5" /> Select for Implementation
        </button>
      )}
    </div>
  );
}
