"use client";

import { useState, useEffect, useCallback } from "react";
import { CoreProblem, CoreProblemStatus } from "@/lib/types";
import { fetchCoreProblemsByPod } from "@/lib/api";
import CoreProblemDetailPanel from "./CoreProblemDetailPanel";
import { Search, Globe, AlertTriangle } from "lucide-react";

const statusLabels: Record<CoreProblemStatus, string> = {
  identified: "Identified",
  "open-for-solutions": "Open for Solutions",
  "solution-implementing": "Implementing",
  resolved: "Resolved",
  escalated: "Escalated",
};

const statusColors: Record<CoreProblemStatus, string> = {
  identified: "bg-amber-100 text-amber-800",
  "open-for-solutions": "bg-teal-100 text-teal-800",
  "solution-implementing": "bg-indigo-100 text-indigo-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-red-100 text-red-700",
};

interface CoreProblemListProps {
  podId: string;
}

export default function CoreProblemList({ podId }: CoreProblemListProps) {
  const [coreProblems, setCoreProblems] = useState<CoreProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CoreProblem | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const loadCoreProblems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCoreProblemsByPod(podId, {
        status: statusFilter || undefined,
      });
      setCoreProblems(data);
    } catch (err) {
      console.error("Error loading core problems:", err);
    } finally {
      setLoading(false);
    }
  }, [podId, statusFilter]);

  useEffect(() => {
    loadCoreProblems();
  }, [loadCoreProblems]);

  const filtered = coreProblems.filter((cp) =>
    cp.title.toLowerCase().includes(search.toLowerCase()) ||
    cp.description.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <CoreProblemDetailPanel
        coreProblem={selected}
        onBack={() => { setSelected(null); loadCoreProblems(); }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-zinc-800 text-lg font-bold font-['Lato']">
          Core Problems ({filtered.length})
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search core problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 rounded-xl text-sm font-['Satoshi'] text-zinc-800 placeholder:text-stone-400 outline-none border border-transparent focus:border-[#0497ae]/30"
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
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm font-['Satoshi']">Loading core problems...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-zinc-800 text-base font-bold font-['Lato'] mb-2">No core problems found</div>
          <div className="text-stone-400 text-sm font-['Satoshi']">
            Core problems are created from the challenge detail view via RCA.
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((cp) => (
            <div
              key={cp._id}
              onClick={() => setSelected(cp)}
              className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#0497ae]/20 cursor-pointer transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-800 text-sm font-bold font-['Lato']">{cp.title}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium font-['Satoshi'] ${statusColors[cp.status as CoreProblemStatus]}`}>
                    {statusLabels[cp.status as CoreProblemStatus]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {cp.isPublic && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 rounded-md text-xs font-medium font-['Satoshi'] text-teal-700">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  )}
                  {cp.status === "escalated" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-md text-xs font-medium font-['Satoshi'] text-red-600">
                      <AlertTriangle className="w-3 h-3" /> Escalated
                    </span>
                  )}
                </div>
              </div>
              <div className="text-stone-500 text-xs font-['Satoshi'] line-clamp-1">{cp.description}</div>
              <div className="flex items-center gap-4 text-xs font-['Satoshi'] text-stone-400">
                <span>{cp.challenges.length} linked challenge{cp.challenges.length !== 1 ? "s" : ""}</span>
                <span>{cp.rootCauseAnalysis.length} RCA level{cp.rootCauseAnalysis.length !== 1 ? "s" : ""}</span>
                {cp.assignedTo && (
                  <span>Assigned to <span className="text-zinc-800 font-medium">{cp.assignedTo.name}</span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
