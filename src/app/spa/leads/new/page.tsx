'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LeadForm from '@/components/spa/LeadForm';
import { leadApi, pocApi } from '@/lib/spaApi';
import type { CreateLeadDto, CreatePOCDto } from '@/lib/spa-types';

export default function NewLeadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (leadData: CreateLeadDto, pocs: Partial<CreatePOCDto>[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create the lead
      const createdLead = await leadApi.createLead(leadData);

      // Create POCs for the lead
      await Promise.all(
        pocs.map((poc) =>
          pocApi.createPOC({
            leadId: createdLead._id,
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
      router.push(`/spa/leads/${createdLead._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Startup Lead</h1>
          <p className="text-gray-600">
            Fill in the details below to create a new lead (+10 credits)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        )}

        {/* Form */}
        <LeadForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="Create Lead"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
