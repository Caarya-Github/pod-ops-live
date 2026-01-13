'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Clock, ExternalLink } from 'lucide-react';
import { Unlock, Asset, PodUnlockProgress } from '@/lib/types';

interface UnlockCardProps {
    unlock: Unlock;
    progress?: PodUnlockProgress;
    assets: Asset[];
    onStartActivation: (unlockId: string) => void;
    isLoading?: boolean;
}

export const UnlockCard: React.FC<UnlockCardProps> = ({
    unlock,
    progress,
    assets,
    onStartActivation,
    isLoading = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const status = progress?.status || 'pending';
    const progressPercent = progress?.progress || 0;
    const isCompleted = status === 'completed';
    const isInProgress = status === 'in-progress';
    const isPending = status === 'pending';

    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'in-progress':
                return <Clock size={20} className="text-amber-500" />;
            case 'pending':
            default:
                return <Circle size={20} className="text-neutral-400" />;
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in-progress':
                return 'In Progress';
            case 'pending':
            default:
                return 'Pending';
        }
    };

    const handleStartActivation = () => {
        if (isPending && !isLoading) {
            onStartActivation(unlock._id);
        }
    };

    return (
        <div className="w-80 rounded-[16px] inline-flex flex-col justify-center items-start gap-4 bg-white border border-neutral-50 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10),0px_4px_6px_-1px_rgba(0,0,0,0.10)] overflow-hidden">
            {/* Card Header */}
            <div className="self-stretch p-4 flex flex-col justify-start items-start gap-3">
                <div className="self-stretch flex justify-start items-start gap-3">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                        {getStatusIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-[24px] tracking-[0.4px]">
                            {unlock.name}
                        </div>
                        <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                            {unlock.subtitle}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="self-stretch h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-green-500' : isInProgress ? 'bg-amber-500' : 'bg-neutral-300'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Status and Progress Badge */}
                <div className="self-stretch flex justify-between items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                        isCompleted ? 'bg-green-100 text-green-700' :
                        isInProgress ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                    }`}>
                        {getStatusLabel()}
                    </span>
                    <span className="text-xs font-bold text-neutral-500">
                        {progressPercent}% complete
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="self-stretch px-4">
                <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-[19.2px] tracking-[0.24px] line-clamp-2">
                    {unlock.desc}
                </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="self-stretch px-4 py-2 flex justify-center items-center gap-2 hover:bg-neutral-50 transition-colors"
            >
                <span className="text-xs font-medium text-stone-500">
                    {isExpanded ? 'Hide Assets' : 'View Assets'}
                </span>
                {isExpanded ? (
                    <ChevronUp size={14} className="text-stone-400" />
                ) : (
                    <ChevronDown size={14} className="text-stone-400" />
                )}
            </button>

            {/* Expanded Assets Section */}
            {isExpanded && (
                <div className="self-stretch border-t border-neutral-100 p-4 bg-neutral-50">
                    <div className="text-xs font-bold text-neutral-700 mb-3">Assets</div>

                    {assets.length > 0 ? (
                        <div className="space-y-2">
                            {assets.map((asset) => (
                                <div
                                    key={asset._id}
                                    className="flex items-start gap-2 p-2 bg-white rounded-lg border border-neutral-100"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6775F5] mt-1.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-zinc-800 truncate">
                                            {asset.title}
                                        </div>
                                        <div className="text-[10px] text-stone-400 line-clamp-2">
                                            {asset.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-stone-400 py-2 text-center">
                            No assets available
                        </div>
                    )}
                </div>
            )}

            {/* Action Button - Start Activation */}
            {isPending && (
                <div className="self-stretch p-4 border-t border-neutral-100">
                    <button
                        onClick={handleStartActivation}
                        disabled={isLoading}
                        className="w-full pl-5 pr-6 py-3 rounded-[120px] flex justify-center items-center cursor-pointer bg-gradient-to-b from-[#ff7e6e] to-[#c63434] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(0,0,0,0.10)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="text-sm font-bold font-['Satoshi'] leading-[21px] tracking-[0.28px] text-white">
                                    Start Activation Now
                                </span>
                                <ExternalLink size={14} className="ml-2 text-white" />
                            </>
                        )}
                        <div className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25),inset_2px_2px_2px_0px_rgba(255,255,255,0.4)]" />
                    </button>
                </div>
            )}

            {/* Completed State */}
            {isCompleted && (
                <div className="self-stretch p-4 border-t border-neutral-100">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle size={18} />
                        <span className="text-sm font-medium">All Assets Completed</span>
                    </div>
                </div>
            )}

            {/* In Progress State */}
            {isInProgress && (
                <div className="self-stretch p-4 border-t border-neutral-100">
                    <div className="flex items-center justify-center gap-2 text-amber-600">
                        <Clock size={18} />
                        <span className="text-sm font-medium">In Progress</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnlockCard;
