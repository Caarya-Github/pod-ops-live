'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, FileText } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  workPlan: 'not-submitted' | 'on-leave' | 'submitted';
  dsr: 'not-submitted' | 'pending' | 'approved' | 'flagged';
}

export default function WorkReports() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date('2025-11-12'));

  const teamMembers: TeamMember[] = [
    { id: 1, name: 'Kathryn Murphy', avatar: 'https://i.pravatar.cc/150?img=1', workPlan: 'not-submitted', dsr: 'not-submitted' },
    { id: 2, name: 'Kathryn Murphy', avatar: 'https://i.pravatar.cc/150?img=2', workPlan: 'on-leave', dsr: 'pending' },
    { id: 3, name: 'Kathryn Murphy', avatar: 'https://i.pravatar.cc/150?img=3', workPlan: 'submitted', dsr: 'approved' },
    { id: 4, name: 'Kathryn Murphy', avatar: 'https://i.pravatar.cc/150?img=4', workPlan: 'submitted', dsr: 'flagged' },
    { id: 5, name: 'Kathryn Murphy', avatar: 'https://i.pravatar.cc/150?img=5', workPlan: 'submitted', dsr: 'approved' },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getWorkPlanStatus = (status: string) => {
    switch (status) {
      case 'not-submitted':
        return <span className="text-red-500 flex items-center gap-1"><span className="text-lg">!</span> Not Submitted</span>;
      case 'on-leave':
        return <span className="text-gray-500">On Leave</span>;
      case 'submitted':
        return <span className="text-gray-900 font-medium underline">Submitted</span>;
      default:
        return null;
    }
  };

  const getDsrBadge = (status: string) => {
    const badges = {
      'not-submitted': 'bg-gray-100 text-gray-600 border border-gray-300',
      'pending': 'bg-blue-50 text-blue-600 border border-blue-200',
      'approved': 'bg-green-50 text-green-600 border border-green-200',
      'flagged': 'bg-orange-50 text-orange-600 border border-orange-200',
    };

    const labels = {
      'not-submitted': 'Not Submitted',
      'pending': 'Pending Review',
      'approved': 'Approved ✓',
      'flagged': 'Flagged 🚩',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-red-500 mb-1">Work Reports</h1>
              <p className="text-gray-500 text-sm">Track and acknowledge the daily work reports of pod members here</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Jan 20, 2023</div>
              <div>3:20 PM</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('daily')}
              className={`pb-3 px-1 relative ${
                activeTab === 'daily'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500'
              }`}
            >
              Daily
              {activeTab === 'daily' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`pb-3 px-1 relative ${
                activeTab === 'weekly'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500'
              }`}
            >
              Weekly
              {activeTab === 'weekly' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
          </div>
        </div>

        {/* Date Navigation and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-gray-900 font-medium min-w-[200px] text-center">
              {formatDate(currentDate)}
            </span>
            <button 
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Check Availability
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Summary Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">00 / 00</div>
            <div className="text-gray-500 text-sm">Members Working Today</div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">00 / 00</div>
            <div className="text-gray-500 text-sm">Daily Plan Submitted</div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">00 / 00</div>
            <div className="text-gray-500 text-sm">DSR Submitted</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    Member
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    Work Plan
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    DSR
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-gray-900 font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getWorkPlanStatus(member.workPlan)}
                  </td>
                  <td className="px-6 py-4">
                    {getDsrBadge(member.dsr)}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 text-sm font-medium underline transition">
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination hint */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          View DSR
        </div>
      </div>
    </div>
  );
}