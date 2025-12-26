'use client';

import { useState } from 'react';
import { leadApi } from '@/lib/spaApi';
import type { HandoverDto } from '@/lib/spa-types';

interface HandoverModalProps {
  leadId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HandoverModal({ leadId, onClose, onSuccess }: HandoverModalProps) {
  const [formData, setFormData] = useState<HandoverDto>({
    prlReceiverId: '',
    notes: '',
    attachments: [],
  });
  const [attachmentInput, setAttachmentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, fetch PRLs from an API
  const mockPRLs = [
    { id: '1', name: 'John Doe - PRL' },
    { id: '2', name: 'Jane Smith - PRL' },
    { id: '3', name: 'Mike Johnson - PRL' },
  ];

  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setFormData({
        ...formData,
        attachments: [...(formData.attachments || []), attachmentInput.trim()],
      });
      setAttachmentInput('');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: (formData.attachments || []).filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.prlReceiverId) {
      setError('Please select a PRL');
      return;
    }

    try {
      setIsLoading(true);
      await leadApi.handoverLead(leadId, formData);
      alert('Lead successfully handed over to PRL! +100 credits awarded.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to handover lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Handover to PRL</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Handover Info */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-900 font-medium mb-2">
              Handover Reward
            </div>
            <div className="text-2xl font-bold text-purple-700">
              +100 Credits
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Awarded upon successful handover to PRL
            </div>
          </div>

          {/* PRL Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PRL <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.prlReceiverId}
              onChange={(e) =>
                setFormData({ ...formData, prlReceiverId: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
            >
              <option value="">Choose a PRL...</option>
              {mockPRLs.map((prl) => (
                <option key={prl.id} value={prl.id}>
                  {prl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handover Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any context or notes for the PRL..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
            />
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Attachments
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                placeholder="Add attachment URL..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddAttachment())
                }
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>

            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm truncate flex-1"
                    >
                      {attachment}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="ml-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation Checklist */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Handover Checklist
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>✓ Lead score ≥ 50</div>
              <div>✓ At least 1 POC added</div>
              <div>✓ Proof link provided</div>
              <div>✓ Status: Qualified</div>
            </div>
            <div className="mt-3 text-xs text-gray-500 italic">
              All requirements have been met. This lead is ready for handover.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Handing Over...' : 'Confirm Handover (+100 credits)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
