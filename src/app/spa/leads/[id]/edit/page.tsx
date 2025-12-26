'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LeadForm from '@/components/spa/LeadForm';
import { leadApi, pocApi } from '@/lib/spaApi';
import type { CreateLeadDto, CreatePOCDto, StartupLead, POC } from '@/lib/spa-types';

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<StartupLead | null>(null);
  const [pocs, setPOCs] = useState<POC[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (leadData: CreateLeadDto, newPocs: Partial<CreatePOCDto>[]) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Update the lead
      await leadApi.updateLead(leadId, leadData);

      // Delete all existing POCs and create new ones
      // In a real app, you'd want to be smarter about this (update vs delete/create)
      await Promise.all(pocs.map((poc) => pocApi.deletePOC(poc._id)));

      // Create new POCs
      await Promise.all(
        newPocs.map((poc) =>
          pocApi.createPOC({
            leadId: leadId,
            name: poc.name!,
            role: poc.role!,
            email: poc.email,
            phone: poc.phone,
            linkedin: poc.linkedin,
            notes: poc.notes,
          })
        )
      );

      // Redirect to the lead detail page
      router.push(`/spa/leads/${leadId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update lead');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Lead not found'}
          </div>
        </div>
      </div>
    );
  }

  const initialData: Partial<CreateLeadDto> = {
    startupName: lead.startupName,
    description: lead.description,
    institution: lead.institution,
    domain: lead.domain,
    startupStage: lead.startupStage,
    websiteOrSocialLink: lead.websiteOrSocialLink,
    source: lead.source,
    activityLevel: lead.activityLevel,
    serviceFit: lead.serviceFit,
    proofLinks: lead.proofLinks,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Startup Lead</h1>
          <p className="text-gray-600">Update the details for {lead.startupName}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        )}

        {/* Form */}
        <LeadForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/spa/leads/${leadId}`)}
          submitLabel="Update Lead"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
