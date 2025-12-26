'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadApi, pocApi } from '@/lib/spaApi';
import type { StartupLead, POC, ScoringCriteria } from '@/lib/spa-types';
import ScoringPanel from '@/components/spa/ScoringPanel';
import HandoverModal from '@/components/spa/HandoverModal';
import Link from 'next/link';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<StartupLead | null>(null);
  const [pocs, setPOCs] = useState<POC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScoringPanel, setShowScoringPanel] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadData, pocsData] = await Promise.all([
        leadApi.getLead(leadId),
        pocApi.getPOCsByLead(leadId),
      ]);
      setLead(leadData);
      setPOCs(pocsData);
    } catch (error) {
      console.error('Failed to load lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async (criteria: ScoringCriteria) => {
    try {
      setActionLoading(true);
      await leadApi.scoreLead(leadId, criteria);
      await loadData();
      setShowScoringPanel(false);
      alert('Lead scored successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to score lead');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadApi.deleteLead(leadId);
      router.push('/spa/leads');
    } catch (error: any) {
      alert(error.message || 'Failed to delete lead');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ResearchPending: 'bg-yellow-100 text-yellow-800',
      Verified: 'bg-blue-100 text-blue-800',
      Qualified: 'bg-green-100 text-green-800',
      ReadyForOutreach: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ResearchPending: 'Research Pending',
      Verified: 'Verified',
      Qualified: 'Qualified',
      ReadyForOutreach: 'Ready for Outreach',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Lead not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/spa/leads" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Leads
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lead.startupName}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lead.currentStatus)}`}>
                  {getStatusLabel(lead.currentStatus)}
                </span>
                <span className="text-gray-600">{lead.institution}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/spa/leads/${leadId}/edit`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Domain</div>
                  <div className="font-medium text-gray-900">{lead.domain}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Stage</div>
                  <div className="font-medium text-gray-900">{lead.startupStage}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Activity Level</div>
                  <div className="font-medium text-gray-900">{lead.activityLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Source</div>
                  <div className="font-medium text-gray-900">{lead.source}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Description</div>
                  <div className="text-gray-900">{lead.description || 'No description'}</div>
                </div>
                {lead.websiteOrSocialLink && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Website/Social</div>
                    <a
                      href={lead.websiteOrSocialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {lead.websiteOrSocialLink}
                    </a>
                  </div>
                )}
                {lead.serviceFit.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Service Fit</div>
                    <div className="flex flex-wrap gap-2">
                      {lead.serviceFit.map((service) => (
                        <span key={service} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* POCs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Points of Contact</h2>
              {pocs.length > 0 ? (
                <div className="space-y-4">
                  {pocs.map((poc) => (
                    <div key={poc._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">{poc.name}</div>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{poc.role}</span>
                      </div>
                      {poc.email && (
                        <div className="text-sm text-gray-600 mb-1">
                          📧 {poc.email}
                        </div>
                      )}
                      {poc.phone && (
                        <div className="text-sm text-gray-600 mb-1">
                          📱 {poc.phone}
                        </div>
                      )}
                      {poc.linkedin && (
                        <div className="text-sm">
                          <a href={poc.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      {poc.notes && (
                        <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          {poc.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No POCs added yet</div>
              )}
            </div>

            {/* Proof Links */}
            {lead.proofLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Proof Links</h2>
                <div className="space-y-2">
                  {lead.proofLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Score</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {lead.leadScore.toFixed(1)}
                </div>
                <div className="text-gray-500 mb-4">out of 100</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${lead.leadScore >= 50 ? 'bg-green-600' : 'bg-yellow-600'}`}
                    style={{ width: `${lead.leadScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                {lead.currentStatus === 'ResearchPending' && (
                  <button
                    onClick={() => setShowScoringPanel(!showScoringPanel)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Score Lead
                  </button>
                )}
                {lead.currentStatus === 'Qualified' && (
                  <button
                    onClick={() => setShowHandoverModal(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Handover to PRL
                  </button>
                )}
              </div>
            </div>

            {/* Requirements for Handover */}
            {lead.currentStatus !== 'ReadyForOutreach' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Handover Requirements
                </h3>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center ${lead.leadScore >= 50 ? 'text-green-700' : 'text-red-700'}`}>
                    {lead.leadScore >= 50 ? '✓' : '✗'} Score ≥ 50
                  </div>
                  <div className={`flex items-center ${pocs.length >= 1 ? 'text-green-700' : 'text-red-700'}`}>
                    {pocs.length >= 1 ? '✓' : '✗'} At least 1 POC
                  </div>
                  <div className={`flex items-center ${lead.proofLinks.length >= 1 ? 'text-green-700' : 'text-red-700'}`}>
                    {lead.proofLinks.length >= 1 ? '✓' : '✗'} At least 1 proof link
                  </div>
                  <div className={`flex items-center ${lead.currentStatus === 'Qualified' ? 'text-green-700' : 'text-gray-500'}`}>
                    {lead.currentStatus === 'Qualified' ? '✓' : '○'} Status: Qualified
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scoring Panel Modal */}
        {showScoringPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Score Lead</h2>
                  <button
                    onClick={() => setShowScoringPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <ScoringPanel lead={lead} onScore={handleScore} isLoading={actionLoading} />
              </div>
            </div>
          </div>
        )}

        {/* Handover Modal */}
        {showHandoverModal && (
          <HandoverModal
            leadId={leadId}
            onClose={() => setShowHandoverModal(false)}
            onSuccess={() => {
              setShowHandoverModal(false);
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
}
