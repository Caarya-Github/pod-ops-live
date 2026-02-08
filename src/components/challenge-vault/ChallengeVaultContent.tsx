"use client";

import { useState } from "react";
import ChallengeList from "./ChallengeList";
import CoreProblemList from "./CoreProblemList";

interface ChallengeVaultContentProps {
  podId: string;
}

const tabs = ["Challenges", "Core Problems"] as const;
type Tab = (typeof tabs)[number];

export default function ChallengeVaultContent({ podId }: ChallengeVaultContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Challenges");

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold font-['Satoshi'] tracking-tight transition-colors cursor-pointer ${
              activeTab === tab
                ? "text-[#ed4c41] border-b-2 border-[#ed4c41]"
                : "text-stone-400 hover:text-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Challenges" && <ChallengeList podId={podId} />}
      {activeTab === "Core Problems" && <CoreProblemList podId={podId} />}
    </div>
  );
}
