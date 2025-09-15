'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
    return (
        <nav className="w-full bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Image
                        src="/logo.svg"
                        alt="Caarya Logo"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                    />
                    <span className="text-xl font-bold text-zinc-800">Caarya</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors">
                            Dashboard
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors">
                            Pods
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors">
                            Analytics
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors">
                            Settings
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-zinc-600 hover:text-zinc-800 transition-colors">
                            <div className="w-5 h-5 bg-current rounded-full"></div>
                        </button>
                        <Image
                            src="/cher emi.png"
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

interface BPMCard {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  status: 'active' | 'inactive' | 'locked';
  category: 'leadership' | 'execution' | 'visibility';
}

const bmpData: BPMCard[] = [
  {
    id: 'executive-lead',
    title: 'Executive Lead',
    subtitle: 'Onboarding new members',
    status: 'active',
    category: 'leadership'
  },
  {
    id: 'kickoff-caarya',
    title: 'Kickoff → Caarya',
    subtitle: 'Onboarding new members',
    description: 'New members are most confused on Day 1. If you don\'t standardize onboarding, leads waste time repeating basics, newcomers start late, and enthusiasm dies. A consistent welcome + first mini-task converts interest → contribution fast.',
    status: 'active',
    category: 'leadership'
  },
  {
    id: 'chaos-calendar',
    title: 'Chaos → Calendar',
    subtitle: 'Calendar + comms rhythm',
    description: 'People fail not from lack of will, but from collisions and forgetting. A shared calendar reduces last-minute chaos and normalizes rituals (check-ins, updates)',
    status: 'locked',
    category: 'leadership'
  },
  {
    id: 'inbox-impact',
    title: 'Inbox → Impact',
    subtitle: 'ask tracker + daily/weekly updates',
    description: 'Work gets lost in chats. A public tracker makes status visible, prevents duplicates, and creates a body of evidence for HQ.',
    status: 'locked',
    category: 'execution'
  },
  {
    id: 'talent-tuning-1',
    title: 'Talent Tuning',
    subtitle: 'Roster fit',
    description: 'Mismatched roles = slow progress + frustration. Adjust reality to strengths.',
    status: 'locked',
    category: 'execution'
  },
  {
    id: 'docs-done-1',
    title: 'Docs → Done',
    subtitle: 'Master checklists & SOP vault',
    description: 'Under pressure, memory fails. Checklists make readiness objective and repeatable',
    status: 'locked',
    category: 'execution'
  },
  {
    id: 'raw-report',
    title: 'Raw → Report',
    subtitle: 'Weekly reporting',
    description: '"If it isn\'t written, it didn\'t happen." Reports make your value auditable and shareable (internally and for future references',
    status: 'locked',
    category: 'visibility'
  },
  {
    id: 'talent-tuning-2',
    title: 'Talent Tuning',
    subtitle: 'Roster fit',
    description: 'Mismatched roles = slow progress + frustration. Adjust reality to strengths.',
    status: 'locked',
    category: 'visibility'
  },
  {
    id: 'docs-done-2',
    title: 'Docs → Done',
    subtitle: 'Master checklists & SOP vault',
    description: 'Under pressure, memory fails. Checklists make readiness objective and repeatable',
    status: 'locked',
    category: 'visibility'
  }
];

type TabType = 'Team Directory' | 'BPMs' | 'Culture' | 'Marketing' | 'Strategic Partners' | 'Partner Relations' | 'Services';

function DelhiPage() {
    const [activeTab, setActiveTab] = useState<TabType>('Team Directory');
    const [selectedBPM, setSelectedBPM] = useState<string | null>(null);

    const tabs: TabType[] = [
        'Team Directory',
        'BPMs',
        'Culture',
        'Marketing',
        'Strategic Partners',
        'Partner Relations',
        'Services'
    ];

    const handleBPMClick = (bmpId: string) => {
        setSelectedBPM(bmpId);
    };

    const handleStartActivation = (bmpId: string) => {
        console.log('Starting activation for:', bmpId);
    };

    const renderBPMCard = (bmp: BPMCard) => {
        const isKickoff = bmp.id === 'kickoff-caarya';
        const isActive = bmp.status === 'active';

        return (
            <div
                key={bmp.id}
                className={`w-80 p-4 rounded-2xl inline-flex flex-col justify-center items-start gap-6 cursor-pointer transition-all hover:shadow-lg ${
                    isActive
                        ? 'bg-white shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-neutral-50'
                        : 'bg-zinc-100 outline outline-1 outline-offset-[-1px] outline-stone-200'
                }`}
                onClick={() => handleBPMClick(bmp.id)}
            >
                {!isActive && (
                    <div className="w-8 h-8 p-4 bg-zinc-800 rounded-md inline-flex justify-center items-center gap-2">
                        <div data-style="Filled" className="w-4 h-4 relative overflow-hidden">
                            <div className="w-2.5 h-3.5 left-[2.67px] top-[1px] absolute bg-white" />
                        </div>
                    </div>
                )}

                <div className={isKickoff ? "self-stretch flex flex-col justify-start items-start" : "w-60 h-10 flex flex-col justify-start items-start"}>
                    <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                        {bmp.title}
                    </div>
                    <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                        {bmp.subtitle}
                    </div>
                </div>

                {bmp.description && (
                    <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-tight tracking-tight">
                        {bmp.description}
                    </div>
                )}

                <div className={`self-stretch inline-flex justify-start items-start ${isKickoff ? 'gap-3' : 'gap-6'}`}>
                    <div className={`${isKickoff ? 'p-2' : 'p-4'} rounded-[120px] flex justify-center items-center gap-1`}>
                        <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                            Details
                        </div>
                    </div>

                    {isActive && (
                        <div
                            className={`flex-1 ${isKickoff ? 'h-14' : ''} pl-5 pr-6 py-4 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer ${
                                isKickoff
                                    ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg shadow-[inset_2px_2px_2px_0px_rgba(255,255,255,0.40)] shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25)] shadow-[inset_-7px_-8px_24px_6px_rgba(0,0,0,0.08)]'
                                    : 'bg-green-100'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStartActivation(bmp.id);
                            }}
                        >
                            <div className={`justify-start text-sm font-bold font-['Satoshi'] leading-tight tracking-tight ${
                                isKickoff ? 'text-white' : 'text-zinc-800'
                            }`}>
                                {isKickoff ? 'Start Activation Now' : 'BPM Active'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getCategoryTitle = (category: 'leadership' | 'execution' | 'visibility') => {
        switch (category) {
            case 'leadership':
                return 'Leadership';
            case 'execution':
                return 'Execution rhythm + safety net';
            case 'visibility':
                return 'Visibility, health, and readiness';
        }
    };

    const renderBPMSection = (category: 'leadership' | 'execution' | 'visibility') => {
        const categoryBPMs = bmpData.filter(bmp => bmp.category === category);

        return (
            <div key={category} className="w-full flex flex-col justify-start items-start gap-6">
                <div className="w-full inline-flex justify-start items-center gap-6">
                    <div className="flex justify-start items-center gap-3">
                        <div className="justify-start text-zinc-800 text-xl font-bold font-['Lato'] capitalize leading-loose tracking-wide">
                            {getCategoryTitle(category)}
                        </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-zinc-100 rounded-[112px]" />
                    <div className="p-1 bg-zinc-100 rounded-full flex justify-center items-center gap-2">
                        <div data-style="Filled" className="w-4 h-4 relative overflow-hidden">
                            <div className="w-2 h-[4.94px] left-[4px] top-[5.53px] absolute bg-stone-500" />
                        </div>
                    </div>
                </div>
                <div className={`w-full inline-flex justify-start items-start gap-6 ${category === 'leadership' ? 'flex-wrap content-start' : ''}`}>
                    {categoryBPMs.map(renderBPMCard)}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Header Section */}
            <div className="w-full px-6 py-10 bg-white inline-flex flex-col justify-center items-start gap-2">
                <div className="w-full inline-flex justify-start items-start gap-10">
                    <div data-style="Outlined" className="w-6 h-6 relative overflow-hidden">
                        <div className="w-4 h-4 left-[4px] top-[4px] absolute bg-stone-500" />
                    </div>
                    <div className="flex-1 flex justify-start items-center gap-6">
                        <Image
                            className="w-28 h-28 rounded-lg object-cover"
                            src="/yoshi.png"
                            alt="Delhi Pod"
                            width={120}
                            height={120}
                        />
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                            <div className="flex flex-col justify-start items-start">
                                <div className="justify-center text-stone-500 text-xs font-normal font-['Lato'] uppercase leading-none tracking-wide">
                                    Industrial Pod
                                </div>
                                <div className="justify-start text-zinc-800 text-3xl font-bold font-['Lato'] uppercase leading-[48px] tracking-[3.84px]">
                                    Delhi
                                </div>
                            </div>
                            <div className="inline-flex justify-start items-start gap-2">
                                <div className="pl-3 pr-4 py-2 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-end items-center gap-2">
                                    <div className="w-4 h-4 relative">
                                        <div className="w-3.5 h-3 left-[1.38px] top-[1.88px] absolute bg-stone-500" />
                                    </div>
                                    <div className="justify-start text-zinc-800 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                                        Stage 1
                                    </div>
                                </div>
                                <div className="pl-3 pr-4 py-2 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-end items-center gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-3xl" />
                                    <div className="justify-start text-zinc-800 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                                        Active
                                    </div>
                                </div>
                                <div className="pl-3 pr-4 py-2 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-end items-center gap-2">
                                    <div className="w-4 h-4 relative">
                                        <div className="w-4 h-2 left-0 top-[4px] absolute bg-stone-500 border-stone-500" />
                                    </div>
                                    <div className="justify-start text-zinc-800 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                                        53 Members
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-black/20 rounded-lg" />
                    <Image
                        className="w-14 h-16 rounded-lg object-cover"
                        src="/cher emi.png"
                        alt="Profile"
                        width={60}
                        height={67}
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="w-full px-6 bg-white border-b-2 border-zinc-100 inline-flex justify-start items-center">
                {tabs.map((tab) => (
                    <div
                        key={tab}
                        className={`px-5 py-4 flex justify-start items-center gap-2 cursor-pointer transition-all hover:bg-gray-50 ${
                            activeTab === tab ? 'border-b-4 border-zinc-800' : ''
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <div className="w-4 h-4 relative">
                            <div className={`w-3.5 h-3 left-[1.38px] top-[1.88px] absolute ${
                                activeTab === tab ? 'bg-zinc-800' : 'bg-stone-400'
                            }`} />
                        </div>
                        <div className={`justify-start text-sm font-bold font-['Satoshi'] leading-tight tracking-tight ${
                            activeTab === tab ? 'text-zinc-800' : 'text-stone-400'
                        }`}>
                            {tab}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="w-full px-6 py-16 bg-white inline-flex flex-col justify-center items-center gap-12">
                {activeTab === 'Team Directory' && (
                    <>
                        {renderBPMSection('leadership')}
                        {renderBPMSection('execution')}
                        {renderBPMSection('visibility')}
                    </>
                )}

                {activeTab !== 'Team Directory' && (
                    <div className="text-center py-20">
                        <div className="text-zinc-800 text-xl font-bold font-['Lato'] mb-4">
                            {activeTab}
                        </div>
                        <div className="text-stone-400 text-sm font-normal font-['Satoshi']">
                            Content for {activeTab} section coming soon...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DelhiPage;