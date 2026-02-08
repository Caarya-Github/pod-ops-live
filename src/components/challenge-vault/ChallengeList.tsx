"use client";

import { useState, useEffect, useCallback } from "react";
import { Challenge, ChallengeCategory, ChallengeStatus } from "@/lib/types";
import { fetchChallengesByPod, deleteChallenge } from "@/lib/api";
import ChallengeDetailPanel from "./ChallengeDetailPanel";
import AddChallengeModal from "./AddChallengeModal";
import { Plus, Search, Trash2 } from "lucide-react";

const statusLabels: Record<ChallengeStatus, string> = {
  identified: "Identified",
  "rca-in-progress": "RCA In Progress",
  "rca-completed": "RCA Completed",
  "solution-in-progress": "Solution In Progress",
  resolved: "Resolved",
  archived: "Archived",
};

const statusColors: Record<ChallengeStatus, string> = {
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

interface ChallengeListProps {
  podId: string;
}

export default function ChallengeList({ podId }: ChallengeListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchChallengesByPod(podId, {
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setChallenges(data);
    } catch (err) {
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  }, [podId, statusFilter, categoryFilter]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await deleteChallenge(id);
      setChallenges((prev) => prev.filter((c) => c._id !== id));
      if (selectedChallenge?._id === id) setSelectedChallenge(null);
    } catch (err) {
      console.error("Error deleting challenge:", err);
    }
  };

  const filtered = challenges.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const getAddedByName = (addedBy: Challenge["addedBy"]) =>
    typeof addedBy === "string" ? addedBy : addedBy?.name || "Unknown";

  if (selectedChallenge) {
    return (
      <ChallengeDetailPanel
        challenge={selectedChallenge}
        podId={podId}
        onBack={() => { setSelectedChallenge(null); loadChallenges(); }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-zinc-800 text-lg font-bold font-['Lato']">
          Challenges ({filtered.length})
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-[#ff7e6e] to-[#c63434] text-white text-sm font-bold font-['Satoshi'] rounded-full cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Challenge
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-transparent focus:border-[#ed4c41]/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm font-['Satoshi']">Loading challenges...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-zinc-800 text-base font-bold font-['Lato'] mb-2">No challenges found</div>
          <div className="text-stone-400 text-sm font-['Satoshi']">Add your first challenge to get started.</div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((challenge) => (
            <div
              key={challenge._id}
              onClick={() => setSelectedChallenge(challenge)}
              className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#ed4c41]/20 cursor-pointer transition-all flex items-start justify-between gap-4"
            >
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-800 text-sm font-bold font-['Lato']">{challenge.title}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${statusColors[challenge.status as ChallengeStatus]}`}>
                    {statusLabels[challenge.status as ChallengeStatus]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${priorityColors[challenge.priority]}`}>
                    {challenge.priority}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-xs font-medium font-['Satoshi'] text-stone-500">
                    {categoryLabels[challenge.category as ChallengeCategory]}
                  </span>
                </div>
                <div className="text-stone-500 text-xs font-['Satoshi'] line-clamp-1">{challenge.description}</div>
                <div className="text-stone-400 text-xs font-['Satoshi']">
                  Added by {getAddedByName(challenge.addedBy)} &middot; {new Date(challenge.dateIdentified).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(challenge._id); }}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddChallengeModal
          podId={podId}
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); loadChallenges(); }}
        />
      )}
    </div>
  );
}
