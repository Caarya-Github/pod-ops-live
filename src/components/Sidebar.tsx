"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

interface Pod {
  id: string;
  name: string;
  location: string;
  stage: string;
  members: number;
  status: "active" | "inactive";
  crew: string;
  image?: string;
}

interface SidebarProps {
  pod: Pod | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const crewImages: Record<string, string> = {
  yoshi: "/yoshi.png",
  wojtek: "/wojtek.png",
  togo: "/togo.png",
  "cher-ami": "/cher emi.png",
  "cher ami": "/cher emi.png",
  "bits-pilani": "/yoshi.png",
  ashoka: "/wojtek.png",
  default: "/yoshi.png",
};

const menuItems = [
  {
    name: "Work Reports",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    name: "Team Directory",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    name: "Leader Activation",
    icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    name: "Assets",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    hasChildren: true,
  },
  {
    name: "Growth Journal",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    name: "Strategic Partners",
    icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    name: "Task Tracking",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    name: "Challenge Vault",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
];

const assetSubItems = [
  { name: "BPMs" },
  { name: "Culture" },
  { name: "Marketing" },
  { name: "Partner Relations" },
  { name: "Services" },
];

export default function Sidebar({ pod, activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const crew = params.crew as string;
  const crewSlug = crew?.toLowerCase() || "";
  const crewImage = crewImages[crewSlug] || crewImages["default"];
  const [assetsExpanded, setAssetsExpanded] = useState(false);

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  const handleTabClick = (tabName: string) => {
    if (tabName === "Assets") {
      setAssetsExpanded(!assetsExpanded);
    } else {
      onTabChange(tabName);
    }
  };

  const isParentActive = (itemName: string) => {
    if (itemName === "Assets") {
      return assetSubItems.some((sub) => activeTab === sub.name);
    }
    return activeTab === itemName;
  };

  const isActive = (itemName: string) => {
    return activeTab === itemName;
  };

  if (!pod) return null;

  return (
    <div className="w-72 min-h-screen bg-white flex flex-col sidebar" style={{ boxShadow: 'inset -2px 0 0 0 #d1d5db' }}>
      {/* Back Button */}
      <div className="px-4 py-4 border-none">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium font-['Satoshi'] uppercase tracking-wide">
            Back
          </span>
        </button>
      </div>

      {/* Pod Info */}
      <div className="px-4 py-4 border-b border-[#f3f2f2] sidebar">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12">
            <Image
              className="rounded-lg object-cover"
              src={crewImage}
              alt={`${pod.name} Pod`}
              fill
              sizes="48px"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-xs font-normal font-['Lato'] uppercase tracking-wide text-stone-500">
              Industrial Pod
            </div>
            <div className="text-lg font-bold font-['Lato'] uppercase tracking-wider text-zinc-800">
              {pod.name}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <div className="px-2.5 py-1.5 bg-neutral-50 rounded-lg border border-zinc-100 flex items-center gap-1.5 sidebar">
            <div className="w-3.5 h-3.5 relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M13.8125 7.77812C13.3219 7.13438 12.6344 6.65625 11.8719 6.41563C11.9031 6.21875 11.9156 6.01875 11.9156 5.81875C11.9156 4.76563 11.5094 3.775 10.7688 3.03125C10.0313 2.28438 9.04688 1.875 8 1.875C6.95313 1.875 5.96875 2.28438 5.23125 3.03125C4.49062 3.775 4.08437 4.76563 4.08437 5.81875C4.08437 6.01875 4.1 6.21875 4.12813 6.41563C3.3625 6.65625 2.67813 7.1375 2.1875 7.77812C1.65625 8.47188 1.375 9.30312 1.375 10.1813C1.375 11.2344 1.78125 12.225 2.52187 12.9688C3.2625 13.7125 4.24688 14.125 5.29063 14.125C6.30938 14.125 7.26563 13.7375 8 13.0313C8.73125 13.7375 9.69063 14.125 10.7094 14.125C11.7563 14.125 12.7406 13.7156 13.4781 12.9688C14.2188 12.225 14.625 11.2344 14.625 10.1813C14.625 9.30312 14.3438 8.47188 13.8125 7.77812Z"
                  fill="#696763"
                />
              </svg>
            </div>
            <span className="text-xs font-medium font-['Satoshi'] text-zinc-800">
              {pod.stage}
            </span>
          </div>

          <div className="px-2.5 py-1.5 bg-neutral-50 rounded-lg border border-zinc-100 flex items-center gap-1.5 sidebar">
            <div
              className={`w-2 h-2 rounded-full ${pod.status === "active" ? "bg-green-600" : "bg-red-500"}`}
            />
            <span className="text-xs font-medium font-['Satoshi'] text-zinc-800 capitalize">
              {pod.status}
            </span>
          </div>

          <div className="px-2.5 py-1.5 bg-neutral-50 rounded-lg border border-zinc-100 flex items-center gap-1.5 sidebar">
            <div className="w-3.5 h-3.5 relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 8.5C9.08667 8.5 10.0467 8.76 10.8267 9.1C11.5467 9.42 12 10.14 12 10.92V12H4V10.9267C4 10.14 4.45333 9.42 5.17333 9.10667C5.95333 8.76 6.91333 8.5 8 8.5ZM2.66667 8.66667C3.4 8.66667 4 8.06667 4 7.33333C4 6.6 3.4 6 2.66667 6C1.93333 6 1.33333 6.6 1.33333 7.33333C1.33333 8.06667 1.93333 8.66667 2.66667 8.66667Z"
                  fill="#696763"
                />
              </svg>
            </div>
            <span className="text-xs font-medium font-['Satoshi'] text-zinc-800">
              {pod.members} Members
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="flex flex-col gap-0.5 px-2">
          {menuItems.map((item) => {
            const active = isActive(item.name);
            const parentActive = isParentActive(item.name);

            return (
              <div key={item.name}>
                <button
                  onClick={() => handleTabClick(item.name)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-[#fff6f5]"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={active ? "#ed4c41" : "#9c9a96"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.icon} />
                  </svg>
                  <span
                    className={`text-xs font-bold font-['Satoshi'] tracking-[0.24px] ${
                      active ? "text-[#ed4c41]" : "text-[#696763]"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.hasChildren && (
                    <ChevronDown
                      className={`w-3 h-3 ml-auto text-[#9c9a96] transition-transform ${
                        assetsExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Asset Sub-items */}
                {item.hasChildren && assetsExpanded && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5">
                    {assetSubItems.map((subItem) => {
                      const isSubActive = activeTab === subItem.name;
                      return (
                        <button
                          key={subItem.name}
                          onClick={() => onTabChange(subItem.name)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            isSubActive
                              ? "bg-[#fff6f5]"
                              : "hover:bg-zinc-50"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold font-['Satoshi'] tracking-[0.24px] ${
                              isSubActive ? "text-[#ed4c41]" : "text-[#696763]"
                            }`}
                          >
                            {subItem.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#f3f2f2] sidebar">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 relative rounded-full overflow-hidden bg-zinc-100">
            <Image
              className="object-cover"
              src="/cher emi.png"
              alt="Profile"
              fill
              sizes="32px"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold font-['Satoshi'] text-zinc-800">
              User Name
            </span>
            <span className="text-xs font-normal font-['Satoshi'] text-stone-500">
              View Profile
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-stone-400 ml-auto" />
        </div>
      </div>
    </div>
  );
}
