'use client';

import { useState, useEffect } from 'react';
import { leadApi } from '@/lib/spaApi';
import type { DashboardStats } from '@/lib/spa-types';
import Link from 'next/link';

export default function SPADashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await leadApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SPA Dashboard - Student Startups
          </h1>
          <p className="text-gray-600">
            Track and manage your startup lead research pipeline
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Research Pending */}
          <StatsCard
            title="Research Pending"
            value={stats?.researchPending || 0}
            color="bg-yellow-500"
            icon="📋"
          />

          {/* Verified */}
          <StatsCard
            title="Verified"
            value={stats?.verified || 0}
            color="bg-blue-500"
            icon="✓"
          />

          {/* Qualified */}
          <StatsCard
            title="Qualified"
            value={stats?.qualified || 0}
            color="bg-green-500"
            icon="⭐"
          />

          {/* Ready for Outreach */}
          <StatsCard
            title="Ready for Outreach"
            value={stats?.readyForOutreach || 0}
            color="bg-purple-500"
            icon="📤"
          />

          {/* Total Leads */}
          <StatsCard
            title="Total Leads"
            value={stats?.totalLeads || 0}
            color="bg-gray-700"
            icon="📊"
          />

          {/* Average Score */}
          <StatsCard
            title="Average Score"
            value={`${stats?.averageScore?.toFixed(1) || 0}`}
            color="bg-indigo-500"
            icon="🎯"
            suffix="/100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/spa/leads/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add New Lead
          </Link>

          <Link
            href="/spa/leads"
            className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
          >
            View All Leads
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  color,
  icon,
  suffix = '',
}: {
  title: string;
  value: number | string;
  color: string;
  icon: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value}
        {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
