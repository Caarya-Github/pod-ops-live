'use client';

import { useState } from 'react';
import type {
  CreateLeadDto,
  Domain,
  StartupStage,
  ActivityLevel,
  LeadSource,
} from '@/lib/spa-types';
import { SERVICE_FIT_OPTIONS } from '@/lib/spa-types';
import POCManager from './POCManager';
import type { CreatePOCDto } from '@/lib/spa-types';

interface LeadFormProps {
  initialData?: Partial<CreateLeadDto>;
  onSubmit: (data: CreateLeadDto, pocs: Partial<CreatePOCDto>[]) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

const DOMAINS: Domain[] = ['EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-Commerce', 'SaaS', 'Other'];
const STAGES: StartupStage[] = ['Idea', 'MVP', 'Beta', 'Launched', 'MarketTraction'];
const ACTIVITY_LEVELS: ActivityLevel[] = ['Dormant', 'Occasional', 'Active', 'Consistent'];
const SOURCES: LeadSource[] = ['E-cell', 'Incubator', 'Referral', 'SocialMedia', 'Other'];

export default function LeadForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Create Lead',
  isLoading = false,
}: LeadFormProps) {
  const [formData, setFormData] = useState<CreateLeadDto>({
    startupName: initialData.startupName || '',
    description: initialData.description || '',
    institution: initialData.institution || '',
    domain: initialData.domain || 'EdTech',
    startupStage: initialData.startupStage || 'Idea',
    websiteOrSocialLink: initialData.websiteOrSocialLink || '',
    source: initialData.source || 'E-cell',
    activityLevel: initialData.activityLevel || 'Active',
    serviceFit: initialData.serviceFit || [],
    proofLinks: initialData.proofLinks || [],
  });

  const [pocs, setPOCs] = useState<Partial<CreatePOCDto>[]>([]);
  const [proofLinkInput, setProofLinkInput] = useState('');

  const handleChange = (
    field: keyof CreateLeadDto,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceFitToggle = (service: string) => {
    const current = formData.serviceFit || [];
    if (current.includes(service)) {
      handleChange(
        'serviceFit',
        current.filter((s) => s !== service)
      );
    } else {
      handleChange('serviceFit', [...current, service]);
    }
  };

  const handleAddProofLink = () => {
    if (proofLinkInput.trim()) {
      handleChange('proofLinks', [...(formData.proofLinks || []), proofLinkInput.trim()]);
      setProofLinkInput('');
    }
  };

  const handleRemoveProofLink = (index: number) => {
    handleChange(
      'proofLinks',
      (formData.proofLinks || []).filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.startupName || !formData.institution) {
      alert('Please fill in all required fields');
      return;
    }

    if (pocs.length === 0 || !pocs[0].name) {
      alert('Please add at least one POC');
      return;
    }

    onSubmit(formData, pocs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Startup Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startup Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.startupName}
              onChange={(e) => handleChange('startupName', e.target.value)}
              placeholder="e.g., EduTech Solutions"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              placeholder="e.g., IIT Delhi"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value as Domain)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {DOMAINS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          {/* Startup Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startup Stage <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.startupStage}
              onChange={(e) => handleChange('startupStage', e.target.value as StartupStage)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value as LeadSource)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value as ActivityLevel)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Website/Social Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website or Social Link
            </label>
            <input
              type="url"
              value={formData.websiteOrSocialLink}
              onChange={(e) => handleChange('websiteOrSocialLink', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the startup..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
      </div>

      {/* Service Fit */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Fit</h2>

        <div className="flex flex-wrap gap-2">
          {SERVICE_FIT_OPTIONS.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => handleServiceFitToggle(service)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                formData.serviceFit?.includes(service)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Proof Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Proof Links</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={proofLinkInput}
            onChange={(e) => setProofLinkInput(e.target.value)}
            placeholder="Add proof link (deck, website, etc.)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProofLink())}
          />
          <button
            type="button"
            onClick={handleAddProofLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>

        {formData.proofLinks && formData.proofLinks.length > 0 && (
          <div className="space-y-2">
            {formData.proofLinks.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate flex-1"
                >
                  {link}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveProofLink(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POCs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Points of Contact</h2>
        <POCManager onPOCsChange={setPOCs} />
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
