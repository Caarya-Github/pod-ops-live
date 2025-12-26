'use client';

import { useState, useEffect } from 'react';
import { leadApi } from '@/lib/spaApi';
import type { StartupLead, LeadStatus, ViewMode } from '@/lib/spa-types';
import Link from 'next/link';
import LeadsKanban from '@/components/spa/LeadsKanban';

export default function LeadsPage() {
  const [leads, setLeads] = useState<StartupLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState({
    status: '',
    domain: '',
    search: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StartupLead;
    order: 'asc' | 'desc';
  }>({ key: 'createdAt', order: 'desc' });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadApi.getAllLeads({
        currentStatus: filters.status || undefined,
        domain: filters.domain || undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.order,
      });
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof StartupLead) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredLeads = leads.filter((lead) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        lead.startupName.toLowerCase().includes(searchLower) ||
        lead.institution.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      ResearchPending: 'bg-yellow-100 text-yellow-800',
      Verified: 'bg-blue-100 text-blue-800',
      Qualified: 'bg-green-100 text-green-800',
      ReadyForOutreach: 'bg-purple-100 text-purple-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: LeadStatus) => {
    const labels = {
      ResearchPending: 'Research Pending',
      Verified: 'Verified',
      Qualified: 'Qualified',
      ReadyForOutreach: 'Ready for Outreach',
    };
    return labels[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Startup Leads</h1>
            <p className="text-gray-600">Manage and track your research pipeline</p>
          </div>
          <Link
            href="/spa/leads/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add New Lead
          </Link>
        </div>

        {/* View Toggle & Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or institution..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                loadLeads();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ResearchPending">Research Pending</option>
              <option value="Verified">Verified</option>
              <option value="Qualified">Qualified</option>
              <option value="ReadyForOutreach">Ready for Outreach</option>
            </select>

            {/* Domain Filter */}
            <select
              value={filters.domain}
              onChange={(e) => {
                setFilters({ ...filters, domain: e.target.value });
                loadLeads();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Domains</option>
              <option value="EdTech">EdTech</option>
              <option value="FinTech">FinTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="AgriTech">AgriTech</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="SaaS">SaaS</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={loadLeads}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('startupName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Startup Name {sortConfig.key === 'startupName' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('institution')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Institution {sortConfig.key === 'institution' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('domain')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Domain {sortConfig.key === 'domain' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('startupStage')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Stage {sortConfig.key === 'startupStage' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('leadScore')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Score {sortConfig.key === 'leadScore' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      POCs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.startupName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{lead.institution}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{lead.domain}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{lead.startupStage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {lead.leadScore.toFixed(1)}
                          <span className="text-gray-400 text-xs">/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            lead.currentStatus
                          )}`}
                        >
                          {getStatusLabel(lead.currentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{lead.pocCount || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/spa/leads/${lead._id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/spa/leads/${lead._id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No leads found. Create your first lead to get started!
              </div>
            )}
          </div>
        ) : (
          <LeadsKanban leads={filteredLeads} onUpdate={loadLeads} />
        )}
      </div>
    </div>
  );
}
