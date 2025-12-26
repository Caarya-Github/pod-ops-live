'use client';

import { useState } from 'react';
import type { POC, POCRole, CreatePOCDto } from '@/lib/spa-types';

interface POCManagerProps {
  leadId?: string;
  initialPOCs?: POC[];
  onPOCsChange?: (pocs: Partial<CreatePOCDto>[]) => void;
  readOnly?: boolean;
}

const POC_ROLES: POCRole[] = ['Founder', 'CoFounder', 'Marketing', 'TechLead', 'Other'];

export default function POCManager({
  leadId,
  initialPOCs = [],
  onPOCsChange,
  readOnly = false,
}: POCManagerProps) {
  const [pocs, setPOCs] = useState<Partial<CreatePOCDto>[]>(
    initialPOCs.length > 0
      ? initialPOCs.map((poc) => ({
          name: poc.name,
          role: poc.role,
          email: poc.email,
          phone: poc.phone,
          linkedin: poc.linkedin,
          notes: poc.notes,
        }))
      : [{ name: '', role: 'Founder' as POCRole }]
  );

  const handleAddPOC = () => {
    const newPOCs = [...pocs, { name: '', role: 'Founder' as POCRole }];
    setPOCs(newPOCs);
    onPOCsChange?.(newPOCs);
  };

  const handleRemovePOC = (index: number) => {
    const newPOCs = pocs.filter((_, i) => i !== index);
    setPOCs(newPOCs);
    onPOCsChange?.(newPOCs);
  };

  const handleUpdatePOC = (index: number, field: keyof CreatePOCDto, value: string) => {
    const newPOCs = [...pocs];
    newPOCs[index] = { ...newPOCs[index], [field]: value };
    setPOCs(newPOCs);
    onPOCsChange?.(newPOCs);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points of Contact (POCs)
          </label>
          <p className="text-xs text-gray-500">
            At least one POC is required for handover
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddPOC}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
          >
            + Add POC
          </button>
        )}
      </div>

      <div className="space-y-4">
        {pocs.map((poc, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
          >
            {!readOnly && pocs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemovePOC(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={poc.name || ''}
                  onChange={(e) => handleUpdatePOC(index, 'name', e.target.value)}
                  placeholder="John Doe"
                  required
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={poc.role || 'Founder'}
                  onChange={(e) => handleUpdatePOC(index, 'role', e.target.value)}
                  required
                  disabled={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  {POC_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={poc.email || ''}
                  onChange={(e) => handleUpdatePOC(index, 'email', e.target.value)}
                  placeholder="john@startup.com"
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={poc.phone || ''}
                  onChange={(e) => handleUpdatePOC(index, 'phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* LinkedIn */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={poc.linkedin || ''}
                  onChange={(e) => handleUpdatePOC(index, 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={poc.notes || ''}
                  onChange={(e) => handleUpdatePOC(index, 'notes', e.target.value)}
                  placeholder="Additional notes about this contact..."
                  rows={2}
                  readOnly={readOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {pocs.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No POCs added yet. Click "Add POC" to get started.
        </div>
      )}
    </div>
  );
}
