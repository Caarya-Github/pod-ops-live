"use client";

import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import cherEmi from "../../../public/cher emi.png";
import yoshi from "../../../public/yoshi.png";
import wojtek from "../../../public/wojtek.png";
import togo from "../../../public/togo.png";
import { StaticImageData } from "next/image";
import Image from "next/image";
import { fetchPods } from "@/lib/api";
import { Pod, Crew } from "@/lib/types";
import { createSlug } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePodAccess } from "@/hooks/usePodAccess";

const crewAvatars: Record<string, StaticImageData> = {
  YOSHI: yoshi,
  WOJTEK: wojtek,
  TOGO: togo,
  "CHER AMI": cherEmi,
  "Cher Ami": cherEmi,
  Yoshi: yoshi,
  Wojtek: wojtek,
  Togo: togo,
  "Bits Pilani": yoshi,
  Ashoka: wojtek,
  default: togo,
};

function groupPodsByCrew(pods: Pod[]): Crew[] {
  const crewMap = new Map<string, Pod[]>();

  pods.forEach((pod) => {
    const crewName = pod.crew.toUpperCase();
    if (!crewMap.has(crewName)) {
      crewMap.set(crewName, []);
    }
    crewMap.get(crewName)!.push(pod);
  });

  return Array.from(crewMap.entries()).map(([crewName, pods], index) => ({
    id: (index + 1).toString(),
    name: `${crewName} CREW`,
    avatar: crewAvatars[crewName] || crewAvatars["default"],
    pods,
  }));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { canAccessAllPods, userCollege } = usePodAccess();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPods = async () => {
      try {
        setLoading(true);
        const fetchedPods = await fetchPods();
        setPods(fetchedPods);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch pods:", err);
        setError("Failed to load pods. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPods();
  }, []);

  const crews = useMemo(() => {
    return groupPodsByCrew(pods);
  }, [pods]);

  const filteredCrews = useMemo(() => {
    return crews
      .map((crew) => ({
        ...crew,
        pods: crew.pods.filter((pod) => {
          const matchesSearch =
            pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pod.location.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus =
            statusFilter === "all" || pod.status === statusFilter;
          const matchesStage =
            stageFilter === "all" || pod.stage === stageFilter;
          const matchesMembers =
            memberFilter === "all" ||
            (memberFilter === "30+" && pod.members >= 30) ||
            (memberFilter === "20-30" &&
              pod.members >= 20 &&
              pod.members < 30) ||
            (memberFilter === "<20" && pod.members < 20);

          return (
            matchesSearch && matchesStatus && matchesStage && matchesMembers
          );
        }),
      }))
      .filter((crew) => crew.pods.length > 0);
  }, [crews, searchQuery, statusFilter, stageFilter, memberFilter]);

  const handlePodClick = (pod: Pod) => {
    const crewSlug = createSlug(pod.crew);
    const podSlug = createSlug(pod.name);
    router.push(`/dashboard/${crewSlug}/${podSlug}`);
  };

  return (
    <>
      <Navbar />
      <div className="w-full px-6 sm:px-12 lg:px-28 py-4 bg-white flex flex-col justify-start items-center gap-12">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search for a pod"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-neutral-50 rounded-full focus:outline-indigo-500 text-sm font-normal font-['Satoshi'] leading-tight tracking-tight transition-all text-black"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
          </div>
          <div className="flex flex-wrap justify-end items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="pl-2.5 pr-8 py-1.5 bg-white rounded-md border border-zinc-100 text-zinc-800 text-xs font-bold font-['Satoshi'] capitalize leading-none tracking-wide appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="pl-2.5 pr-8 py-1.5 bg-white rounded-md border border-zinc-100 text-zinc-800 text-xs font-bold font-['Satoshi'] capitalize leading-none tracking-wide appearance-none cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="Stage 1">Stage 1</option>
              <option value="Stage 2">Stage 2</option>
              <option value="Stage 3">Stage 3</option>
            </select>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="pl-2.5 pr-8 py-1.5 bg-white rounded-md border border-zinc-100 text-zinc-800 text-xs font-bold font-['Satoshi'] capitalize leading-none tracking-wide appearance-none cursor-pointer"
            >
              <option value="all">All Members</option>
              <option value="30+">30+ Members</option>
              <option value="20-30">20-30 Members</option>
              <option value="<20">&lt;20 Members</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="w-full text-center py-12">
            <div className="text-gray-500 text-lg">Loading pods...</div>
          </div>
        ) : error ? (
          <div className="w-full text-center py-12">
            <div className="text-red-500 text-lg">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Retry
            </button>
          </div>
        ) : filteredCrews.length === 0 ? (
          <div className="w-full text-center py-12">
            {!canAccessAllPods && pods.length === 0 ? (
              <>
                <div className="text-gray-500 text-lg">
                  You are not a member of any pod yet
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Contact your lead for assignment
                </p>
              </>
            ) : (
              <>
                <div className="text-gray-500 text-lg">
                  No pods found matching your search criteria
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or search term
                </p>
              </>
            )}
          </div>
        ) : (
          filteredCrews.map((crew) => (
            <div
              key={crew.id}
              className="w-full flex flex-col justify-start items-start gap-4"
            >
              <div className="w-full inline-flex justify-start items-center gap-6">
                <div className="flex justify-start items-center gap-3">
                  <Image
                    className="w-8 h-8 rounded-full"
                    src={crew.avatar}
                    alt={crew.name}
                  />
                  <div className="justify-start text-zinc-800 text-lg font-bold font-['Lato'] leading-relaxed tracking-wide">
                    {crew.name}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({crew.pods.length} pods)
                  </span>
                </div>
                <div className="flex-1 outline-1" />
                <div className="p-1 bg-zinc-100 border-none flex justify-center items-center gap-2 rounded-full">
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </div>
              </div>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {crew.pods.map((pod) => (
                  <div
                    key={pod.id}
                    onClick={() => handlePodClick(pod)}
                    className={`p-3 rounded-2xl flex justify-start items-center gap-3 cursor-pointer transition-colors ${
                      pod.image ? "bg-white" : "bg-neutral-50"
                    }`}
                  >
                    {pod.image ? (
                      <img
                        className="w-16 h-16 rounded"
                        src={pod.image}
                        alt={pod.name}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded flex justify-center items-center bg-black/30">
                        <div className="w-6 h-6 text-white font-bold flex items-center justify-center">
                          {pod.location.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 inline-flex flex-col justify-center items-start gap-2">
                      <div className="self-stretch flex flex-col justify-start items-start">
                        <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                          {pod.name}
                        </div>
                        <div className="justify-center text-stone-500 text-[10px] font-medium font-['Lato'] uppercase leading-none tracking-wide">
                          {pod.stage}
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-between items-center">
                        <div className="justify-center text-stone-500 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                          {pod.members} Members
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-3xl ${pod.status === "active" ? "bg-green-600" : "bg-red-500"}`}
                          />
                          <div className="justify-center text-stone-500 text-[10px] font-medium font-['Satoshi'] leading-none capitalize">
                            {pod.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
