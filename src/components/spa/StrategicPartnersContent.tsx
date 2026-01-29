'use client';

import { useState, useEffect } from 'react';
import { leadApi } from '@/lib/spaApi';
import type { DashboardStats, StartupLead } from '@/lib/spa-types';
import LeadsKanban from './LeadsKanban';
import Link from 'next/link';

const COLOR_CLASSES: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

const ICONS: Record<string, string> = {
  yellow: '📋',
  blue: '✓',
  green: '⭐',
  purple: '📤',
  gray: '📊',
  indigo: '🎯',
};

interface StatsCardProps {
  title: string;
  value: number | string;
  color: string;
  suffix?: string;
}

function StatsCard({ title, value, color, suffix }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{ICONS[color]}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

export default function StrategicPartnersContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<StartupLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, leadsData] = await Promise.all([
        leadApi.getDashboardStats(),
        leadApi.getAllLeads(),
      ]);
      setStats(statsData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Failed to load SPA data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading strategic partners...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Research Pending"
          value={stats?.researchPending || 0}
          color="yellow"
        />
        <StatsCard
          title="Verified"
          value={stats?.verified || 0}
          color="blue"
        />
        <StatsCard
          title="Qualified"
          value={stats?.qualified || 0}
          color="green"
        />
        <StatsCard
          title="Ready for Outreach"
          value={stats?.readyForOutreach || 0}
          color="purple"
        />
        <StatsCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          color="gray"
        />
        <StatsCard
          title="Average Score"
          value={`${stats?.averageScore?.toFixed(1) || 0}`}
          color="indigo"
          suffix="/100"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Link
          href="/spa/leads/new"
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 text-sm font-medium"
        >
          + Add New Lead
        </Link>
        <Link
          href="/spa/leads"
          className="bg-white text-zinc-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium"
        >
          View All Leads
        </Link>
      </div>

      <LeadsKanban leads={leads} onUpdate={loadData} />
    </div>
  );
}
