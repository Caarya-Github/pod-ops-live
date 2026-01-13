import React, { useState } from 'react';
import { AssetsModal, Asset } from './AssetsModal';

// Card Component Props
interface BaseCardProps {
    title: string;
    subtitle?: string;
    description: string;
    onDetailsClick?: () => void;
    assets?: Asset[];
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
export const LockedCard: React.FC<LockedCardProps> = ({ title, subtitle, description, onDetailsClick, assets }) => {
    const [showAssets, setShowAssets] = useState(false);

    const handleDetailsClick = () => {
        setShowAssets(true);
        onDetailsClick?.();
    };

    return (
        <>
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
                    <div className="p-4 rounded-[120px] flex justify-center items-center gap-1 cursor-pointer" onClick={handleDetailsClick}>
                        <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-tight tracking-tight">
                            Details
                        </div>
                    </div>
                </div>
            </div>

            <AssetsModal
                isOpen={showAssets}
                onClose={() => setShowAssets(false)}
                title={title}
                subtitle={subtitle}
                assets={assets || []}
            />
        </>
    );
};

// Ready Card Component - For items that are ready to be activated
export const ReadyCard: React.FC<ReadyCardProps> = ({ title, subtitle, description, onDetailsClick, onActivate, activateButtonText = 'Ready to Activate', assets }) => {
    const [showAssets, setShowAssets] = useState(false);

    const handleDetailsClick = () => {
        setShowAssets(true);
        onDetailsClick?.();
    };

    return (
        <>
            <div className="w-80 p-4 rounded-[16px] inline-flex flex-col justify-center items-start gap-6 bg-white border border-neutral-50 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10),0px_4px_6px_-1px_rgba(0,0,0,0.10)]">
                <div className="self-stretch flex flex-col justify-start items-start">
                    <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-[24px] tracking-[0.4px]">
                        {title}
                    </div>
                    {subtitle && (
                        <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                            {subtitle}
                        </div>
                    )}
                </div>

                <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-[19.2px] tracking-[0.24px]">
                    {description}
                </div>

                <div className="self-stretch inline-flex justify-start items-center gap-3">
                    <div
                        className="px-[8px] py-[8px] rounded-[120px] flex justify-center items-center gap-1 cursor-pointer"
                        onClick={handleDetailsClick}
                    >
                        <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-[21px] tracking-[0.28px]">
                            Details
                        </div>
                    </div>
                    <div
                        className="flex-1 pl-5 pr-6 py-4 rounded-[120px] flex justify-center items-center cursor-pointer bg-gradient-to-b from-[#ff7e6e] to-[#c63434] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(0,0,0,0.10)]"
                        onClick={onActivate}
                    >
                        <div className="justify-start text-sm font-bold font-['Satoshi'] leading-[21px] tracking-[0.28px] text-white">
                            {activateButtonText}
                        </div>
                        <div className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25),inset_2px_2px_2px_0px_rgba(255,255,255,0.4)]" />
                    </div>
                </div>
            </div>

            <AssetsModal
                isOpen={showAssets}
                onClose={() => setShowAssets(false)}
                title={title}
                subtitle={subtitle}
                assets={assets || []}
            />
        </>
    );
};

// Active Card Component - For items that are currently active
export const ActiveCard: React.FC<ActiveCardProps> = ({ title, subtitle, description, onDetailsClick, onActivate, isKickoff = false, assets }) => {
    const [showAssets, setShowAssets] = useState(false);

    const handleDetailsClick = () => {
        setShowAssets(true);
        onDetailsClick?.();
    };

    return (
        <>
            <div className="w-80 p-4 rounded-[16px] inline-flex flex-col justify-center items-start gap-6 bg-white border border-neutral-50 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10),0px_4px_6px_-1px_rgba(0,0,0,0.10)]">
                <div className={isKickoff ? 'self-stretch flex flex-col justify-start items-start' : 'w-60 h-10 flex flex-col justify-start items-start'}>
                    <div className="self-stretch justify-start text-zinc-800 text-base font-bold font-['Lato'] leading-[24px] tracking-[0.4px]">
                        {title}
                    </div>
                    {subtitle && (
                        <div className="justify-center text-stone-400 text-xs font-medium font-['Satoshi'] leading-none tracking-tight">
                            {subtitle}
                        </div>
                    )}
                </div>

                {description && (
                    <div className="self-stretch justify-center text-zinc-800 text-xs font-normal font-['Satoshi'] leading-[19.2px] tracking-[0.24px]">
                        {description}
                    </div>
                )}

                <div className={`self-stretch inline-flex justify-start items-center ${isKickoff ? 'gap-3' : 'gap-3'}`}>
                    <div
                        className={`${isKickoff ? 'px-[8px] py-[8px]' : 'p-4'} rounded-[120px] flex justify-center items-center gap-1 cursor-pointer`}
                        onClick={handleDetailsClick}
                    >
                        <div className="justify-start text-zinc-800 text-sm font-bold font-['Satoshi'] underline leading-[21px] tracking-[0.28px]">
                            Details
                        </div>
                    </div>
                    <div
                        className={`flex-1 ${isKickoff ? 'h-[53px]' : ''} pl-5 pr-6 py-4 rounded-[120px] flex justify-center items-center cursor-pointer ${
                            isKickoff
                                ? 'bg-gradient-to-b from-[#ff7e6e] to-[#c63434] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10),0px_4px_6px_-4px_rgba(0,0,0,0.10)]'
                                : 'bg-green-100'
                        }`}
                        onClick={onActivate}
                        style={{
                            boxShadow: isKickoff ? undefined : undefined,
                        }}
                    >
                        <div
                            className={`justify-start text-sm font-bold font-['Satoshi'] leading-[21px] tracking-[0.28px] ${
                                isKickoff ? 'text-white' : 'text-zinc-800'
                            }`}
                        >
                            {isKickoff ? 'Start Activation Now' : 'BPM Active'}
                        </div>
                        {isKickoff && (
                            <div className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_-1px_-1px_3px_0px_rgba(0,0,0,0.25),inset_2px_2px_2px_0px_rgba(255,255,255,0.4)]" />
                        )}
                    </div>
                </div>
            </div>

            <AssetsModal
                isOpen={showAssets}
                onClose={() => setShowAssets(false)}
                title={title}
                subtitle={subtitle}
                assets={assets || []}
            />
        </>
    );
};
