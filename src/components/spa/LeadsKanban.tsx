'use client';

import { useState } from 'react';
import type { StartupLead, LeadStatus } from '@/lib/spa-types';
import { leadApi } from '@/lib/spaApi';
import Link from 'next/link';

interface LeadsKanbanProps {
  leads: StartupLead[];
  onUpdate: () => void;
}

const STATUSES: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'ResearchPending', label: 'Research Pending', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'Verified', label: 'Verified', color: 'bg-blue-50 border-blue-200' },
  { key: 'Qualified', label: 'Qualified', color: 'bg-green-50 border-green-200' },
  { key: 'ReadyForOutreach', label: 'Ready for Outreach', color: 'bg-purple-50 border-purple-200' },
];

export default function LeadsKanban({ leads, onUpdate }: LeadsKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    if (!draggingId) return;

    try {
      await leadApi.updateLeadStatus(draggingId, newStatus);
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update lead status');
    } finally {
      setDraggingId(null);
    }
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.currentStatus === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUSES.map((status) => {
        const statusLeads = getLeadsByStatus(status.key);

        return (
          <div
            key={status.key}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.key)}
            className={`${status.color} border-2 rounded-lg p-4 min-h-[600px]`}
          >
            {/* Column Header */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">{status.label}</h3>
              <div className="text-sm text-gray-600">{statusLeads.length} leads</div>
            </div>

            {/* Lead Cards */}
            <div className="space-y-3">
              {statusLeads.map((lead) => (
                <div
                  key={lead._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead._id)}
                  className={`bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow ${
                    draggingId === lead._id ? 'opacity-50' : ''
                  }`}
                >
                  <Link href={`/spa/leads/${lead._id}`}>
                    <div className="font-medium text-gray-900 mb-2 hover:text-blue-600">
                      {lead.startupName}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{lead.institution}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{lead.domain}</span>
                      <span className="font-semibold text-gray-900">
                        {lead.leadScore.toFixed(0)}/100
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">{lead.startupStage}</span>
                      <span className="text-gray-500">{lead.pocCount || 0} POCs</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
