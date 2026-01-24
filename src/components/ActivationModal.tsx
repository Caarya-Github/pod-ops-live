"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Clock, MessageSquare } from "lucide-react";
import { PodAssetStatus } from "@/lib/types";
import { toggleAssetCompletion, updateAssetComment } from "@/lib/api";

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  podId: string;
  unlockId: string;
  assetStatuses: PodAssetStatus[];
  onUpdate: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  podId,
  unlockId,
  assetStatuses: initialAssets,
  onUpdate,
}) => {
  const [assets, setAssets] = useState<PodAssetStatus[]>(initialAssets);
  const [loading, setLoading] = useState<Record<string, boolean | "comment">>(
    {},
  );
  const [commentingAssetId, setCommentingAssetId] = useState<string | null>(
    null,
  );
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  if (!isOpen) return null;

  const handleToggleComplete = async (asset: PodAssetStatus) => {
    setLoading((prev) => ({ ...prev, [asset.assetId]: true }));
    try {
      const updated = await toggleAssetCompletion(podId, asset.assetId);
      setAssets((prev) =>
        prev.map((a) =>
          a.assetId === asset.assetId
            ? {
                ...a,
                completed: updated.completed,
                completedAt: updated.completedAt,
              }
            : a,
        ),
      );
      onUpdate();
    } catch (error) {
      console.error("Error toggling asset:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [asset.assetId]: false }));
    }
  };

  const handleAddComment = async (asset: PodAssetStatus) => {
    if (!commentText.trim()) return;

    setLoading((prev) => ({ ...prev, [asset.assetId]: "comment" }));
    try {
      await updateAssetComment(podId, asset.assetId, commentText);
      setAssets((prev) =>
        prev.map((a) =>
          a.assetId === asset.assetId ? { ...a, comment: commentText } : a,
        ),
      );
      setCommentingAssetId(null);
      setCommentText("");
      onUpdate();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [asset.assetId]: false }));
    }
  };

  const completedCount = assets.filter((a) => a.completed).length;
  const progress =
    assets.length > 0 ? Math.round((completedCount / assets.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
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

        {/* Progress Bar */}
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500">Progress</span>
            <span className="text-xs font-bold text-stone-700">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress === 100 ? "bg-green-500" : "bg-amber-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {completedCount} of {assets.length} assets completed
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.assetId}
                  className={`p-4 rounded-lg border transition-all ${
                    asset.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Completion Toggle */}
                    <button
                      onClick={() => handleToggleComplete(asset)}
                      disabled={loading[asset.assetId] === true}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        asset.completed
                          ? "bg-green-500 border-green-500"
                          : "border-neutral-300 hover:border-[#6775F5]"
                      }`}
                    >
                      {loading[asset.assetId] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : asset.completed ? (
                        <Check size={14} className="text-white" />
                      ) : null}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-medium truncate ${
                          asset.completed ? "text-green-800" : "text-zinc-800"
                        }`}
                      >
                        {asset.title}
                      </h3>

                      {/* Existing Comment */}
                      {asset.comment && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-md">
                          <p className="text-xs text-stone-600">
                            {asset.comment}
                          </p>
                        </div>
                      )}

                      {/* Comment Input */}
                      {commentingAssetId === asset.assetId ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6775F5]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddComment(asset);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddComment(asset)}
                            disabled={
                              loading[asset.assetId] === "comment" ||
                              !commentText.trim()
                            }
                            className="px-3 py-2 bg-[#6775F5] text-white text-xs font-medium rounded-lg hover:bg-[#5865e0] disabled:opacity-50"
                          >
                            {loading[asset.assetId] === "comment"
                              ? "..."
                              : "Save"}
                          </button>
                          <button
                            onClick={() => {
                              setCommentingAssetId(null);
                              setCommentText("");
                            }}
                            className="px-3 py-2 bg-neutral-100 text-stone-600 text-xs font-medium rounded-lg hover:bg-neutral-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCommentingAssetId(asset.assetId);
                            setCommentText(asset.comment || "");
                          }}
                          className="mt-2 flex items-center gap-1 text-xs text-stone-400 hover:text-[#6775F5] transition-colors"
                        >
                          <MessageSquare size={12} />
                          {asset.comment ? "Edit comment" : "Add comment"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock size={40} className="mx-auto text-stone-300 mb-3" />
              <p className="text-stone-400 text-sm">
                No assets available for activation
              </p>
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

export default ActivationModal;
