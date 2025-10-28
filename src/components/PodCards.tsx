import React from 'react';

// Card Component Props
interface BaseCardProps {
    title: string;
    subtitle?: string;
    description: string;
    onDetailsClick?: () => void;
}

interface LockedCardProps extends BaseCardProps {}

interface ReadyCardProps extends BaseCardProps {
    onActivate?: () => void;
    activateButtonText?: string;
}

interface ActiveCardProps extends BaseCardProps {
    onActivate?: () => void;
    isKickoff?: boolean;
}

// Locked Card Component - For items that are not yet available
export const LockedCard: React.FC<LockedCardProps> = ({ title, subtitle, description, onDetailsClick }) => {
    return (
        <div className="w-80 p-4 rounded-2xl inline-flex flex-col justify-center items-start gap-6 bg-zinc-100 outline outline-1 outline-offset-[-1px] outline-stone-200">
            <div className="w-8 h-8 bg-zinc-800 rounded-md flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 12 14" fill="none">
                    <path
                        d="M9.99996 4.66667H9.33329V3.33333C9.33329 1.49333 7.83996 0 5.99996 0C4.15996 0 2.66663 1.49333 2.66663 3.33333V4.66667H1.99996C1.26663 4.66667 0.666626 5.26667 0.666626 6V12.6667C0.666626 13.4 1.26663 14 1.99996 14H9.99996C10.7333 14 11.3333 13.4 11.3333 12.6667V6C11.3333 5.26667 10.7333 4.66667 9.99996 4.66667ZM5.99996 10.6667C5.26663 10.6667 4.66663 10.0667 4.66663 9.33333C4.66663 8.6 5.26663 8 5.99996 8C6.73329 8 7.33329 8.6 7.33329 9.33333C7.33329 10.0667 6.73329 10.6667 5.99996 10.6667ZM8.06663 4.66667H3.93329V3.33333C3.93329 2.19333 4.85996 1.26667 5.99996 1.26667C7.13996 1.26667 8.06663 2.19333 8.06663 3.33333V4.66667Z"
                        fill="white"
                    />
                </svg>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                    {title}
                </div>
                {subtitle && (
                    <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                        {subtitle}
                    </div>
                )}
            </div>

            <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-tight tracking-tight">
                {description}
            </div>

            <div className="self-stretch inline-flex justify-start items-start gap-6">
                <div className="p-4 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer" onClick={onDetailsClick}>
                    <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                        Details
                    </div>
                </div>
            </div>
        </div>
    );
};

// Ready Card Component - For items that are ready to be activated
export const ReadyCard: React.FC<ReadyCardProps> = ({ title, subtitle, description, onDetailsClick, onActivate, activateButtonText = 'Ready to Activate' }) => {
    return (
        <div className="w-80 p-4 rounded-2xl inline-flex flex-col justify-center items-start gap-6 bg-white shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-neutral-50">
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                    {title}
                </div>
                {subtitle && (
                    <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                        {subtitle}
                    </div>
                )}
            </div>

            <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-tight tracking-tight">
                {description}
            </div>

            <div className="self-stretch inline-flex justify-start items-center gap-3">
                <div className="p-2 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer" onClick={onDetailsClick}>
                    <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                        Details
                    </div>
                </div>
                <div
                    className="flex-1 pl-5 pr-6 py-4 bg-green-100 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer"
                    onClick={onActivate}
                >
                    <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] leading-tight tracking-tight">
                        {activateButtonText}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Active Card Component - For items that are currently active
export const ActiveCard: React.FC<ActiveCardProps> = ({ title, subtitle, description, onDetailsClick, onActivate, isKickoff = false }) => {
    return (
        <div className="w-80 p-4 rounded-2xl inline-flex flex-col justify-center items-start gap-6 bg-white shadow-md shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-neutral-50">
            <div className={isKickoff ? 'self-stretch flex flex-col justify-start items-start' : 'w-60 h-10 flex flex-col justify-start items-start'}>
                <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-normal tracking-tight">
                    {title}
                </div>
                {subtitle && (
                    <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                        {subtitle}
                    </div>
                )}
            </div>

            {description && (
                <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-tight tracking-tight">
                    {description}
                </div>
            )}

            <div className={`self-stretch inline-flex justify-start items-start ${isKickoff ? 'gap-3' : 'gap-6'}`}>
                <div className={`${isKickoff ? 'p-6' : 'p-4'} rounded-[120px] flex justify-center items-center gap-1 cursor-pointer`} onClick={onDetailsClick}>
                    <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                        Details
                    </div>
                </div>
                <div
                    className={`flex-1 ${isKickoff ? 'h-14' : ''} pl-5 pr-6 py-4 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer ${
                        isKickoff
                            ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg shadow-[inset_2px_2px_2px_0px_rgba(255,255,255,0.40)] shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25)] shadow-[inset_-7px_-8px_24px_6px_rgba(0,0,0,0.08)]'
                            : 'bg-green-100'
                    }`}
                    onClick={onActivate}
                >
                    <div
                        className={`justify-start text-sm font-bold font-['Satoshi'] leading-tight tracking-tight ${
                            isKickoff ? 'text-white' : 'text-zinc-800'
                        }`}
                    >
                        {isKickoff ? 'Start Activation Now' : 'BPM Active'}
                    </div>
                </div>
            </div>
        </div>
    );
};
