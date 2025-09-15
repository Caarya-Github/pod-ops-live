'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchPods } from '@/lib/api';
import { Pod } from '@/lib/types';
import Navbar from '@/components/Navbar';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import podDataJson from '@/lib/pod-data.json';

interface BPMCard {
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    status: 'active' | 'inactive' | 'locked';
    category: 'leadership' | 'execution' | 'visibility';
}

interface CultureItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    status: 'active' | 'locked';
}

interface CultureSection {
    id: string;
    title: string;
    items: CultureItem[];
}

interface CultureData {
    sections: CultureSection[];
}

interface SimpleItem {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    status: 'active' | 'locked';
}

interface SimpleTabData {
    items: SimpleItem[];
}

interface SectionedTabData {
    sections: Array<{
        id: string;
        title: string;
        items: SimpleItem[];
    }>;
}

interface PodData {
    podId: string;
    name: string;
    crew: string;
    bmps: BPMCard[];
    culture?: CultureData;
    marketing?: SimpleTabData;
    strategicPartners?: SectionedTabData;
    partnerRelations?: SectionedTabData;
    services?: SectionedTabData;
    tabs: string[];
}

type TabType = 'Team Directory' | 'BPMs' | 'Culture' | 'Marketing' | 'Strategic Partners' | 'Partner Relations' | 'Services';

const crewImages: Record<string, string> = {
    yoshi: '/yoshi.png',
    wojtek: '/wojtek.png',
    togo: '/togo.png',
    'cher-ami': '/cher emi.png',
    'cher ami': '/cher emi.png',
    'bits-pilani': '/yoshi.png',
    ashoka: '/wojtek.png',
    default: '/yoshi.png',
};

export default function PodPage() {
    const params = useParams();
    const router = useRouter();
    const [pod, setPod] = useState<Pod | null>(null);
    const [podData, setPodData] = useState<PodData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('Team Directory');
    const [selectedBPM, setSelectedBPM] = useState<string | null>(null);

    const crew = params.crew as string;
    const podSlug = params.pod as string;

    useEffect(() => {
        const loadPod = async () => {
            try {
                setLoading(true);
                const allPods = await fetchPods();

                const foundPod = allPods.find((p) => {
                    const podNameSlug = p.name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();
                    const podCrewSlug = p.crew
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();

                    return podCrewSlug === crew && podNameSlug === podSlug;
                });

                if (foundPod) {
                    setPod(foundPod);

                    // Load pod-specific data from JSON
                    const podKey = `${crew}-${podSlug}`;
                    const staticPodData = podDataJson.pods[podKey as keyof typeof podDataJson.pods];

                    if (staticPodData) {
                        // Cast the JSON data to match our TypeScript interfaces
                        setPodData({
                            ...staticPodData,
                            bmps: staticPodData.bmps.map((bmp) => ({
                                ...bmp,
                                status: bmp.status as 'active' | 'inactive' | 'locked',
                                category: bmp.category as 'leadership' | 'execution' | 'visibility',
                            })),
                            culture: staticPodData.culture
                                ? {
                                      sections: staticPodData.culture.sections.map((section) => ({
                                          ...section,
                                          items: section.items.map((item) => ({
                                              ...item,
                                              status: item.status as 'active' | 'locked',
                                          })),
                                      })),
                                  }
                                : undefined,
                            marketing: staticPodData.marketing
                                ? {
                                      items: staticPodData.marketing.items.map((item) => ({
                                          ...item,
                                          status: item.status as 'active' | 'locked',
                                      })),
                                  }
                                : undefined,
                            strategicPartners: staticPodData.strategicPartners
                                ? {
                                      sections: staticPodData.strategicPartners.sections.map((section) => ({
                                          ...section,
                                          items: section.items.map((item) => ({
                                              ...item,
                                              status: item.status as 'active' | 'locked',
                                          })),
                                      })),
                                  }
                                : undefined,
                            partnerRelations: staticPodData.partnerRelations
                                ? {
                                      sections: staticPodData.partnerRelations.sections.map((section) => ({
                                          ...section,
                                          items: section.items.map((item) => ({
                                              ...item,
                                              status: item.status as 'active' | 'locked',
                                          })),
                                      })),
                                  }
                                : undefined,
                            services: staticPodData.services
                                ? {
                                      sections: staticPodData.services.sections.map((section) => ({
                                          ...section,
                                          items: section.items.map((item) => ({
                                              ...item,
                                              status: item.status as 'active' | 'locked',
                                          })),
                                      })),
                                  }
                                : undefined,
                        });
                    } else {
                        // Default data if no specific config found
                        setPodData({
                            podId: foundPod.id,
                            name: foundPod.name,
                            crew: foundPod.crew,
                            bmps: [],
                            culture: { sections: [] },
                            marketing: { items: [] },
                            strategicPartners: { sections: [] },
                            partnerRelations: { sections: [] },
                            services: { sections: [] },
                            tabs: ['Team Directory', 'BPMs', 'Culture', 'Marketing', 'Strategic Partners', 'Partner Relations', 'Services'],
                        });
                    }
                } else {
                    setError('Pod not found');
                }
            } catch (err) {
                console.error('Failed to fetch pod:', err);
                setError('Failed to load pod data');
            } finally {
                setLoading(false);
            }
        };

        loadPod();
    }, [crew, podSlug]);

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
                    <div className="w-8 h-8 bg-zinc-800 rounded-md flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 12 14" fill="none">
                            <path
                                d="M9.99996 4.66667H9.33329V3.33333C9.33329 1.49333 7.83996 0 5.99996 0C4.15996 0 2.66663 1.49333 2.66663 3.33333V4.66667H1.99996C1.26663 4.66667 0.666626 5.26667 0.666626 6V12.6667C0.666626 13.4 1.26663 14 1.99996 14H9.99996C10.7333 14 11.3333 13.4 11.3333 12.6667V6C11.3333 5.26667 10.7333 4.66667 9.99996 4.66667ZM5.99996 10.6667C5.26663 10.6667 4.66663 10.0667 4.66663 9.33333C4.66663 8.6 5.26663 8 5.99996 8C6.73329 8 7.33329 8.6 7.33329 9.33333C7.33329 10.0667 6.73329 10.6667 5.99996 10.6667ZM8.06663 4.66667H3.93329V3.33333C3.93329 2.19333 4.85996 1.26667 5.99996 1.26667C7.13996 1.26667 8.06663 2.19333 8.06663 3.33333V4.66667Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                )}

                <div
                    className={
                        isKickoff ? 'self-stretch flex flex-col justify-start items-start' : 'w-60 h-10 flex flex-col justify-start items-start'
                    }
                >
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
                    <div className={`${isKickoff ? 'p-6' : 'p-4'} rounded-[120px] flex justify-center items-center gap-1`}>
                        <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                            Details
                        </div>
                    </div>

                    {isActive && (
                        <div
                            className={`flex-1 ${
                                isKickoff ? 'h-14' : ''
                            } pl-5 pr-6 py-4 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer ${
                                isKickoff
                                    ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg shadow-[inset_2px_2px_2px_0px_rgba(255,255,255,0.40)] shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25)] shadow-[inset_-7px_-8px_24px_6px_rgba(0,0,0,0.08)]'
                                    : 'bg-green-100'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStartActivation(bmp.id);
                            }}
                        >
                            <div
                                className={`justify-start text-sm font-bold font-['Satoshi'] leading-tight tracking-tight ${
                                    isKickoff ? 'text-white' : 'text-zinc-800'
                                }`}
                            >
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
        if (!podData) return null;

        const categoryBPMs = podData.bmps.filter((bmp) => bmp.category === category);

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
                        <ChevronDown className="w-4 h-4 text-stone-500" />
                    </div>
                </div>
                <div className={`w-full inline-flex justify-start items-start gap-6 ${category === 'leadership' ? 'flex-wrap content-start' : ''}`}>
                    {categoryBPMs.map(renderBPMCard)}
                </div>
            </div>
        );
    };

    const renderCultureCard = (item: CultureItem) => {
        const isActive = item.status === 'active';

        return (
            <div
                key={item.id}
                className={`w-80 min-h-60 p-4 rounded-2xl inline-flex flex-col justify-center items-start gap-6 ${
                    isActive
                        ? 'bg-white shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-neutral-50'
                        : 'bg-zinc-100 outline outline-1 outline-offset-[-1px] outline-stone-200'
                }`}
            >
                {!isActive && (
                    <div className="w-8 h-8 bg-zinc-800 rounded-md flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 12 14" fill="none">
                            <path
                                d="M9.99996 4.66667H9.33329V3.33333C9.33329 1.49333 7.83996 0 5.99996 0C4.15996 0 2.66663 1.49333 2.66663 3.33333V4.66667H1.99996C1.26663 4.66667 0.666626 5.26667 0.666626 6V12.6667C0.666626 13.4 1.26663 14 1.99996 14H9.99996C10.7333 14 11.3333 13.4 11.3333 12.6667V6C11.3333 5.26667 10.7333 4.66667 9.99996 4.66667ZM5.99996 10.6667C5.26663 10.6667 4.66663 10.0667 4.66663 9.33333C4.66663 8.6 5.26663 8 5.99996 8C6.73329 8 7.33329 8.6 7.33329 9.33333C7.33329 10.0667 6.73329 10.6667 5.99996 10.6667ZM8.06663 4.66667H3.93329V3.33333C3.93329 2.19333 4.85996 1.26667 5.99996 1.26667C7.13996 1.26667 8.06663 2.19333 8.06663 3.33333V4.66667Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                )}

                <div className="self-stretch flex flex-col justify-start items-start">
                    <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                        {item.title}
                    </div>
                    <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                        {item.subtitle}
                    </div>
                </div>

                <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-tight tracking-tight">
                    {item.description}
                </div>

                {isActive && (
                    <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div className="p-2 rounded-[120px] flex justify-center items-center gap-1">
                            <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                                Details
                            </div>
                        </div>
                        <div className="flex-1 h-14 pl-5 pr-6 py-4 bg-gradient-to-b from-red-400 to-red-600 rounded-[120px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg shadow-[inset_2px_2px_2px_0px_rgba(255,255,255,0.40)] shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25)] shadow-[inset_-7px_-8px_24px_6px_rgba(0,0,0,0.08)] flex justify-center items-center gap-1">
                            <div className="justify-start text-white text-sm font-bold font-['Satoshi'] leading-tight tracking-tight">
                                Start Activation Now
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCultureSection = (section: CultureSection) => {
        return (
            <div key={section.id} className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-center gap-6">
                    <div className="flex justify-start items-center gap-3">
                        <div className="justify-start text-zinc-800 text-xl font-bold font-['Lato'] capitalize leading-loose tracking-wide">
                            {section.title}
                        </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-zinc-100 rounded-[112px]" />
                    <div className="p-1 bg-zinc-100 rounded-full flex justify-center items-center gap-2">
                        <ChevronDown className="w-4 h-4 text-stone-500" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {section.items.map(renderCultureCard)}
                </div>
            </div>
        );
    };

    const renderSimpleCard = (item: SimpleItem) => {
        const isActive = item.status === 'active';

        return (
            <div
                key={item.id}
                className={`w-80 p-4 rounded-2xl inline-flex flex-col justify-center items-start gap-6 ${
                    isActive
                        ? 'bg-white shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-neutral-50'
                        : 'bg-zinc-100 outline outline-1 outline-offset-[-1px] outline-stone-200'
                }`}
            >
                {!isActive && (
                    <div className="w-8 h-8 bg-zinc-800 rounded-md flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 12 14" fill="none">
                            <path
                                d="M9.99996 4.66667H9.33329V3.33333C9.33329 1.49333 7.83996 0 5.99996 0C4.15996 0 2.66663 1.49333 2.66663 3.33333V4.66667H1.99996C1.26663 4.66667 0.666626 5.26667 0.666626 6V12.6667C0.666626 13.4 1.26663 14 1.99996 14H9.99996C10.7333 14 11.3333 13.4 11.3333 12.6667V6C11.3333 5.26667 10.7333 4.66667 9.99996 4.66667ZM5.99996 10.6667C5.26663 10.6667 4.66663 10.0667 4.66663 9.33333C4.66663 8.6 5.26663 8 5.99996 8C6.73329 8 7.33329 8.6 7.33329 9.33333C7.33329 10.0667 6.73329 10.6667 5.99996 10.6667ZM8.06663 4.66667H3.93329V3.33333C3.93329 2.19333 4.85996 1.26667 5.99996 1.26667C7.13996 1.26667 8.06663 2.19333 8.06663 3.33333V4.66667Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                )}

                <div className="self-stretch flex flex-col justify-start items-start">
                    <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                        {item.title}
                    </div>
                    {item.subtitle && (
                        <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                            {item.subtitle}
                        </div>
                    )}
                </div>

                <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-tight tracking-tight">
                    {item.description}
                </div>

                {isActive && (
                    <div className="self-stretch inline-flex justify-start items-center gap-3">
                        <div className="p-2 rounded-[120px] flex justify-center items-center gap-1">
                            <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                                Details
                            </div>
                        </div>
                        <div className="flex-1 h-14 pl-5 pr-6 py-4 bg-gradient-to-b from-red-400 to-red-600 rounded-[120px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg shadow-[inset_2px_2px_2px_0px_rgba(255,255,255,0.40)] shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25)] shadow-[inset_-7px_-8px_24px_6px_rgba(0,0,0,0.08)] flex justify-center items-center gap-1">
                            <div className="justify-start text-white text-sm font-bold font-['Satoshi'] leading-tight tracking-tight">
                                Start Activation Now
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderSimpleTabSection = (tabData: SimpleTabData) => {
        return (
            <div className="self-stretch px-28 py-16 bg-white inline-flex flex-col justify-center items-center gap-12">
                <div className="grid grid-cols-3 gap-4">
                    {tabData.items.map(renderSimpleCard)}
                </div>
            </div>
        );
    };

    const renderSectionedTabSection = (section: { id: string; title: string; items: SimpleItem[] }) => {
        return (
            <div key={section.id} className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="self-stretch inline-flex justify-start items-center gap-6">
                    <div className="flex justify-start items-center gap-3">
                        <div className="justify-start text-zinc-800 text-xl font-bold font-['Lato'] capitalize leading-loose tracking-wide">
                            {section.title}
                        </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-zinc-100 rounded-[112px]" />
                    <div className="p-1 bg-zinc-100 rounded-full flex justify-center items-center gap-2">
                        <ChevronDown className="w-4 h-4 text-stone-500" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {section.items.map(renderSimpleCard)}
                </div>
            </div>
        );
    };

    const renderSectionedTab = (tabData: SectionedTabData) => {
        return (
            <div className="self-stretch px-28 py-16 bg-white inline-flex flex-col justify-center items-center gap-12">
                {tabData.sections.map(renderSectionedTabSection)}
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-gray-500 text-lg">Loading pod...</div>
                </div>
            </>
        );
    }

    if (error || !pod || !podData) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                    <div className="text-red-500 text-lg mb-4">{error || 'Pod not found'}</div>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                        Go Back
                    </button>
                </div>
            </>
        );
    }

    const crewSlug = crew.toLowerCase();
    const crewImage = crewImages[crewSlug] || crewImages['default'];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Header Section */}
            <div className="w-full px-6 py-10 bg-white inline-flex flex-col justify-center items-start gap-2">
                <div className="w-full inline-flex justify-start items-start gap-10">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex justify-start items-center gap-6">
                        <Image className="w-28 h-28 rounded-lg object-cover" src={crewImage} alt={`${pod.name} Pod`} width={120} height={120} />
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                            <div className="flex flex-col justify-start items-start">
                                <div className="justify-center text-stone-500 text-xs font-normal font-['Lato'] uppercase leading-none tracking-wide">
                                    Industrial Pod
                                </div>
                                <div className="justify-start text-zinc-800 text-3xl font-bold font-['Lato'] uppercase leading-[48px] tracking-[3.84px]">
                                    {pod.name}
                                </div>
                            </div>
                            <div className="inline-flex justify-start items-start gap-2">
                                <div className="pl-3 pr-4 py-2 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-end items-center gap-2">
                                    <div className="w-4 h-4 relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path
                                                d="M13.8125 7.77812C13.3219 7.13438 12.6344 6.65625 11.8719 6.41563C11.9031 6.21875 11.9156 6.01875 11.9156 5.81875C11.9156 4.76563 11.5094 3.775 10.7688 3.03125C10.0313 2.28438 9.04688 1.875 8 1.875C6.95313 1.875 5.96875 2.28438 5.23125 3.03125C4.49062 3.775 4.08437 4.76563 4.08437 5.81875C4.08437 6.01875 4.1 6.21875 4.12813 6.41563C3.3625 6.65625 2.67813 7.1375 2.1875 7.77812C1.65625 8.47188 1.375 9.30312 1.375 10.1813C1.375 11.2344 1.78125 12.225 2.52187 12.9688C3.2625 13.7125 4.24688 14.125 5.29063 14.125C6.30938 14.125 7.26563 13.7375 8 13.0313C8.73125 13.7375 9.69063 14.125 10.7094 14.125C11.7563 14.125 12.7406 13.7156 13.4781 12.9688C14.2188 12.225 14.625 11.2344 14.625 10.1813C14.625 9.30312 14.3438 8.47188 13.8125 7.77812ZM8 2.67188C9.72188 2.67188 11.125 4.08438 11.125 5.81875C11.125 5.96563 11.1156 6.1125 11.0938 6.25938C10.9656 6.24688 10.8375 6.24063 10.7063 6.24063C9.6875 6.24063 8.73125 6.62813 7.99688 7.33438C7.26563 6.62813 6.30625 6.24063 5.2875 6.24063C5.15938 6.24063 5.02813 6.24688 4.9 6.25938C4.88125 6.11563 4.86875 5.96563 4.86875 5.81875C4.875 4.08125 6.27813 2.67188 8 2.67188ZM8 8.96563C7.94375 8.96563 7.88438 8.9625 7.82813 8.95938C7.87813 8.84063 7.93438 8.725 8 8.6125C8.06563 8.725 8.12188 8.84063 8.17188 8.95938C8.11563 8.96563 8.05625 8.96563 8 8.96563ZM6.54375 13.0656C6.14688 13.2406 5.72813 13.3281 5.29063 13.3281C3.56875 13.3281 2.16563 11.9156 2.16563 10.1813C2.16563 9.48438 2.3875 8.82188 2.80938 8.26875C3.19375 7.76563 3.72812 7.38438 4.325 7.1875C4.53125 7.74688 4.86563 8.25938 5.3 8.675C5.73438 9.09375 6.26563 9.40625 6.8375 9.58438C6.80625 9.78125 6.79375 9.98125 6.79375 10.1813C6.79375 10.9875 7.03438 11.7625 7.4875 12.4219C7.2125 12.6938 6.89375 12.9094 6.54375 13.0656ZM7.03438 8.8125C6.17188 8.53125 5.47188 7.88125 5.11875 7.04063C5.175 7.0375 5.23438 7.03438 5.29063 7.03438C5.725 7.03438 6.14688 7.12188 6.54375 7.29688C6.89375 7.45313 7.2125 7.66875 7.48438 7.94063C7.3 8.2125 7.14688 8.50313 7.03438 8.8125ZM8 11.75C7.72813 11.275 7.58438 10.7344 7.58438 10.1813C7.58438 10.0344 7.59375 9.8875 7.61563 9.74063C7.87336 9.76558 8.13289 9.76558 8.39063 9.74063C8.40938 9.88438 8.42188 10.0344 8.42188 10.1813C8.41563 10.7344 8.27188 11.275 8 11.75ZM9.45625 7.29688C9.85313 7.12188 10.2719 7.03438 10.7094 7.03438C10.7656 7.03438 10.825 7.0375 10.8813 7.04063C10.5281 7.88125 9.82813 8.53125 8.96563 8.8125C8.85313 8.50625 8.7 8.2125 8.51563 7.94063C8.7875 7.66875 9.10625 7.45313 9.45625 7.29688ZM10.7094 13.3281C10.275 13.3281 9.85313 13.2406 9.45625 13.0656C9.10625 12.9094 8.7875 12.6938 8.51563 12.4219C8.96875 11.7625 9.20938 10.9906 9.20938 10.1813C9.20938 9.98125 9.19375 9.78125 9.16563 9.58438C9.7375 9.40625 10.2656 9.09375 10.7031 8.675C11.1344 8.25938 11.4688 7.75 11.6781 7.1875C12.275 7.38438 12.8094 7.7625 13.1938 8.26875C13.6156 8.82188 13.8375 9.48438 13.8375 10.1813C13.8344 11.9188 12.4313 13.3281 10.7094 13.3281Z"
                                                fill="#696763"
                                            />
                                        </svg>
                                    </div>
                                    <div className="justify-start text-zinc-800 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                                        {pod.stage}
                                    </div>
                                </div>
                                <div className="pl-3 pr-4 py-2 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-end items-center gap-2">
                                    <div className={`w-2 h-2 rounded-3xl ${pod.status === 'active' ? 'bg-green-600' : 'bg-red-500'}`} />
                                    <div className="justify-start text-zinc-800 text-xs font-medium font-['Satoshi'] leading-none tracking-tight capitalize">
                                        {pod.status}
                                    </div>
                                </div>
                                <div className="pl-3 pr-4 py-2 bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-100 flex justify-end items-center gap-2">
                                    <div className="w-4 h-4 relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path
                                                d="M8 8.5C9.08667 8.5 10.0467 8.76 10.8267 9.1C11.5467 9.42 12 10.14 12 10.92V12H4V10.9267C4 10.14 4.45333 9.42 5.17333 9.10667C5.95333 8.76 6.91333 8.5 8 8.5ZM2.66667 8.66667C3.4 8.66667 4 8.06667 4 7.33333C4 6.6 3.4 6 2.66667 6C1.93333 6 1.33333 6.6 1.33333 7.33333C1.33333 8.06667 1.93333 8.66667 2.66667 8.66667ZM3.42 9.4C3.17333 9.36 2.92667 9.33333 2.66667 9.33333C2.00667 9.33333 1.38 9.47333 0.813334 9.72C0.571808 9.82324 0.365949 9.99518 0.221346 10.2145C0.0767418 10.4337 -0.000229124 10.6907 5.12329e-07 10.9533V12H3V10.9267C3 10.3733 3.15333 9.85333 3.42 9.4ZM13.3333 8.66667C14.0667 8.66667 14.6667 8.06667 14.6667 7.33333C14.6667 6.6 14.0667 6 13.3333 6C12.6 6 12 6.6 12 7.33333C12 8.06667 12.6 8.66667 13.3333 8.66667ZM16 10.9533C16 10.4133 15.68 9.93333 15.1867 9.72C14.6021 9.46492 13.9711 9.33329 13.3333 9.33333C13.0733 9.33333 12.8267 9.36 12.58 9.4C12.8467 9.85333 13 10.3733 13 10.9267V12H16V10.9533ZM8 4C9.10667 4 10 4.89333 10 6C10 7.10667 9.10667 8 8 8C6.89333 8 6 7.10667 6 6C6 4.89333 6.89333 4 8 4Z"
                                                fill="#696763"
                                            />
                                        </svg>
                                    </div>
                                    <div className="justify-start text-zinc-800 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                                        {pod.members} Members
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Image className="w-14 h-16 rounded-lg object-cover" src="/cher emi.png" alt="Profile" width={60} height={67} />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="w-full px-6 bg-white border-b-2 border-zinc-100 inline-flex justify-start items-center">
                {podData?.tabs.map((tab) => (
                    <div
                        key={tab}
                        className={`px-5 py-4 flex justify-start items-center gap-2 cursor-pointer transition-all hover:bg-gray-50 ${
                            activeTab === tab ? 'border-b-4 border-zinc-800' : ''
                        }`}
                        onClick={() => setActiveTab(tab as TabType)}
                    >
                        <div className="w-4 h-4 relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M13.8125 7.77812C13.3219 7.13438 12.6344 6.65625 11.8719 6.41563C11.9031 6.21875 11.9156 6.01875 11.9156 5.81875C11.9156 4.76563 11.5094 3.775 10.7688 3.03125C10.0313 2.28438 9.04688 1.875 8 1.875C6.95313 1.875 5.96875 2.28438 5.23125 3.03125C4.49062 3.775 4.08437 4.76563 4.08437 5.81875C4.08437 6.01875 4.1 6.21875 4.12813 6.41563C3.3625 6.65625 2.67813 7.1375 2.1875 7.77812C1.65625 8.47188 1.375 9.30312 1.375 10.1813C1.375 11.2344 1.78125 12.225 2.52187 12.9688C3.2625 13.7125 4.24688 14.125 5.29063 14.125C6.30938 14.125 7.26563 13.7375 8 13.0313C8.73125 13.7375 9.69063 14.125 10.7094 14.125C11.7563 14.125 12.7406 13.7156 13.4781 12.9688C14.2188 12.225 14.625 11.2344 14.625 10.1813C14.625 9.30312 14.3438 8.47188 13.8125 7.77812ZM8 2.67188C9.72188 2.67188 11.125 4.08438 11.125 5.81875C11.125 5.96563 11.1156 6.1125 11.0938 6.25938C10.9656 6.24688 10.8375 6.24063 10.7063 6.24063C9.6875 6.24063 8.73125 6.62813 7.99688 7.33438C7.26563 6.62813 6.30625 6.24063 5.2875 6.24063C5.15938 6.24063 5.02813 6.24688 4.9 6.25938C4.88125 6.11563 4.86875 5.96563 4.86875 5.81875C4.875 4.08125 6.27813 2.67188 8 2.67188ZM8 8.96563C7.94375 8.96563 7.88438 8.9625 7.82813 8.95938C7.87813 8.84063 7.93438 8.725 8 8.6125C8.06563 8.725 8.12188 8.84063 8.17188 8.95938C8.11563 8.96563 8.05625 8.96563 8 8.96563ZM6.54375 13.0656C6.14688 13.2406 5.72813 13.3281 5.29063 13.3281C3.56875 13.3281 2.16563 11.9156 2.16563 10.1813C2.16563 9.48438 2.3875 8.82188 2.80938 8.26875C3.19375 7.76563 3.72812 7.38438 4.325 7.1875C4.53125 7.74688 4.86563 8.25938 5.3 8.675C5.73438 9.09375 6.26563 9.40625 6.8375 9.58438C6.80625 9.78125 6.79375 9.98125 6.79375 10.1813C6.79375 10.9875 7.03438 11.7625 7.4875 12.4219C7.2125 12.6938 6.89375 12.9094 6.54375 13.0656ZM7.03438 8.8125C6.17188 8.53125 5.47188 7.88125 5.11875 7.04063C5.175 7.0375 5.23438 7.03438 5.29063 7.03438C5.725 7.03438 6.14688 7.12188 6.54375 7.29688C6.89375 7.45313 7.2125 7.66875 7.48438 7.94063C7.3 8.2125 7.14688 8.50313 7.03438 8.8125ZM8 11.75C7.72813 11.275 7.58438 10.7344 7.58438 10.1813C7.58438 10.0344 7.59375 9.8875 7.61563 9.74063C7.87336 9.76558 8.13289 9.76558 8.39063 9.74063C8.40938 9.88438 8.42188 10.0344 8.42188 10.1813C8.41563 10.7344 8.27188 11.275 8 11.75ZM9.45625 7.29688C9.85313 7.12188 10.2719 7.03438 10.7094 7.03438C10.7656 7.03438 10.825 7.0375 10.8813 7.04063C10.5281 7.88125 9.82813 8.53125 8.96563 8.8125C8.85313 8.50625 8.7 8.2125 8.51563 7.94063C8.7875 7.66875 9.10625 7.45313 9.45625 7.29688ZM10.7094 13.3281C10.275 13.3281 9.85313 13.2406 9.45625 13.0656C9.10625 12.9094 8.7875 12.6938 8.51563 12.4219C8.96875 11.7625 9.20938 10.9906 9.20938 10.1813C9.20938 9.98125 9.19375 9.78125 9.16563 9.58438C9.7375 9.40625 10.2656 9.09375 10.7031 8.675C11.1344 8.25938 11.4688 7.75 11.6781 7.1875C12.275 7.38438 12.8094 7.7625 13.1938 8.26875C13.6156 8.82188 13.8375 9.48438 13.8375 10.1813C13.8344 11.9188 12.4313 13.3281 10.7094 13.3281Z"
                                    fill="#696763"
                                />
                            </svg>
                        </div>
                        <div
                            className={`justify-start text-sm font-bold font-['Satoshi'] leading-tight tracking-tight ${
                                activeTab === tab ? 'text-zinc-800' : 'text-stone-400'
                            }`}
                        >
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

                {activeTab === 'Culture' && podData?.culture && (
                    <div className="self-stretch px-28 py-16 bg-white inline-flex flex-col justify-center items-center gap-12">
                        {podData.culture.sections.map(renderCultureSection)}
                    </div>
                )}

                {activeTab === 'Marketing' && podData?.marketing && renderSimpleTabSection(podData.marketing)}

                {activeTab === 'Strategic Partners' && podData?.strategicPartners && renderSectionedTab(podData.strategicPartners)}

                {activeTab === 'Partner Relations' && podData?.partnerRelations && renderSectionedTab(podData.partnerRelations)}

                {activeTab === 'Services' && podData?.services && renderSectionedTab(podData.services)}

                {activeTab === 'BPMs' && (
                    <div className="text-center py-20">
                        <div className="text-zinc-800 text-xl font-bold font-['Lato'] mb-4">BPMs</div>
                        <div className="text-stone-400 text-sm font-normal font-['Satoshi']">BPMs content coming soon...</div>
                    </div>
                )}

                {!['Team Directory', 'Culture', 'Marketing', 'Strategic Partners', 'Partner Relations', 'Services', 'BPMs'].includes(activeTab) && (
                    <div className="text-center py-20">
                        <div className="text-zinc-800 text-xl font-bold font-['Lato'] mb-4">{activeTab}</div>
                        <div className="text-stone-400 text-sm font-normal font-['Satoshi']">Content for {activeTab} section coming soon...</div>
                    </div>
                )}
            </div>
        </div>
    );
}
