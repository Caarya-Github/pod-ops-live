"use client";

import { useState } from "react";
import { createChallenge } from "@/lib/api";
import { ChallengeCategory, ChallengePriority } from "@/lib/types";
import { X } from "lucide-react";

const categories: { value: ChallengeCategory; label: string }[] = [
  { value: "bmps", label: "BPMs" },
  { value: "culture", label: "Culture" },
  { value: "marketing", label: "Marketing" },
  { value: "strategicPartners", label: "Strategic Partners" },
  { value: "partnerRelations", label: "Partner Relations" },
  { value: "services", label: "Services" },
];

const priorities: { value: ChallengePriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

interface AddChallengeModalProps {
  podId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddChallengeModal({ podId, onClose, onCreated }: AddChallengeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChallengeCategory>("bmps");
  const [priority, setPriority] = useState<ChallengePriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createChallenge({ title: title.trim(), description: description.trim(), podId, category, priority });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create challenge");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold font-['Lato'] text-zinc-800">Add Challenge</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-['Satoshi'] text-stone-400">+10 credits will be awarded</span>
              <span className="px-1.5 py-0.5 bg-green-100 rounded text-xs font-bold text-green-700">+10</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-zinc-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 rounded-lg text-red-600 text-xs font-['Satoshi']">{error}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-['Satoshi'] text-zinc-800">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Briefly describe the challenge..."
              className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-transparent focus:border-[#0497ae]/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-['Satoshi'] text-zinc-800">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the challenge..."
              rows={3}
              className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-transparent focus:border-[#0497ae]/30 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium font-['Satoshi'] text-zinc-800">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChallengeCategory)}
                className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium font-['Satoshi'] text-zinc-800">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ChallengePriority)}
                className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 outline-none cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full text-sm font-bold font-['Satoshi'] text-stone-500 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-b from-[#ff7e6e] to-[#c63434] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
