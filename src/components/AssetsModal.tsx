'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface Asset {
    _id: string;
    title: string;
    desc: string;
    unlock_id?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    assets: Asset[];
}

export const AssetsModal: React.FC<AssetsModalProps> = ({ isOpen, onClose, title, subtitle, assets }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
                        {subtitle && (
                            <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-stone-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {assets.length > 0 ? (
                        <div className="space-y-3">
                            {assets.map((asset, index) => (
                                <div
                                    key={asset._id}
                                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-100"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#6775F5] mt-2 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-zinc-800 truncate">
                                                {asset.title}
                                            </h3>
                                            {asset.desc && (
                                                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                                                    {asset.desc}
                                                </p>
                                            )}
                                            {index < assets.length - 1 && (
                                                <div className="absolute left-4 bottom-0 w-0.5 h-3 bg-neutral-200" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-stone-400 text-sm">No assets available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetsModal;
