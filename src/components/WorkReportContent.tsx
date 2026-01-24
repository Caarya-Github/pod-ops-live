'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, FileText, Loader2 } from 'lucide-react';
import { workReportApi, WorkReportSummary, WeeklyWorkReport } from '@/lib/spaApi';
import { fetchPodMembers, TeamMember as ApiTeamMember } from '@/lib/api';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import ViewDsr from '@/components/ViewDsr';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  workPlan: 'not-submitted' | 'on-leave' | 'submitted';
  dsr: 'not-submitted' | 'pending' | 'approved' | 'flagged';
}

interface WorkReportContentProps {
  podId: string;
}

export function WorkReportContent({ podId }: WorkReportContentProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState({
    membersWorking: { submitted: 0, total: 0 },
    workPlans: { submitted: 0, total: 0 },
    dsrs: { submitted: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [podMembers, setPodMembers] = useState<ApiTeamMember[]>([]);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [viewDsrModalOpen, setViewDsrModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [dsrDate, setDsrDate] = useState<string>('');

  // Weekly report state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeklyReport, setWeeklyReport] = useState<WeeklyWorkReport | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // Load pod members for availability calendar
  useEffect(() => {
    const loadMembers = async () => {
      if (!podId) return;
      try {
        const members = await fetchPodMembers(podId);
        setPodMembers(members);
      } catch (err) {
        console.error('Failed to load pod members:', err);
      }
    };
    loadMembers();
  }, [podId]);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const formatDateForApi = useCallback((date: Date) => {
    return date.toISOString().split('T')[0];
  }, []);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const fetchWorkReportData = useCallback(async () => {
    if (!podId) return;
    setLoading(true);
    setError(null);
    try {
      const dateStr = formatDateForApi(currentDate);
      const summary: WorkReportSummary = await workReportApi.getWorkReportSummary(dateStr);

      // Get pod member IDs for filtering
      const podMemberIds = new Set(podMembers.map(m => m._id));

      // Filter to only include pod members
      const filteredUsers = summary.users.filter(user => podMemberIds.has(user.userId));

      const members: TeamMember[] = filteredUsers.map((user) => ({
        id: user.userId,
        name: user.name,
        avatar: user.avatar,
        workPlan: user.workPlanStatus,
        dsr: user.dsrStatus,
      }));

      setTeamMembers(members);
      setStats({
        // Count members as "working" if they have submitted a work plan or are on leave
        membersWorking: { submitted: filteredUsers.filter(u => u.workPlanStatus === 'submitted' || u.workPlanStatus === 'on-leave').length, total: filteredUsers.length },
        workPlans: { submitted: filteredUsers.filter(u => u.workPlanStatus === 'submitted').length, total: filteredUsers.length },
        dsrs: { submitted: filteredUsers.filter(u => u.dsrStatus === 'approved' || u.dsrStatus === 'pending').length, total: filteredUsers.length },
      });
    } catch (err: any) {
      console.error('Error fetching work report:', err);
      setError(err.message || 'Failed to load work report data');
    } finally {
      setLoading(false);
    }
  }, [currentDate, formatDateForApi, podId, podMembers]);

  useEffect(() => {
    fetchWorkReportData();
  }, [fetchWorkReportData]);

  const fetchWeeklyReportData = useCallback(async () => {
    if (!podId) return;
    setWeeklyLoading(true);
    try {
      const dateStr = format(currentWeekStart, 'yyyy-MM-dd');
      const report = await workReportApi.getWeeklyWorkReport(dateStr);

      if (!report) return;

      // Get pod member IDs for filtering
      const podMemberIds = new Set(podMembers.map(m => m._id));

      // Filter to only include pod members
      const filteredMembers = report.members.filter(m => podMemberIds.has(m.userId));

      setWeeklyReport({
        ...report,
        members: filteredMembers,
        goalsCompleted: filteredMembers.reduce((sum, m) => sum + (m.assignedQuests > 0 ? 1 : 0), 0),
      });
    } catch (err) {
      console.error('Error fetching weekly report:', err);
      setWeeklyReport(null);
    } finally {
      setWeeklyLoading(false);
    }
  }, [currentWeekStart, podId, podMembers]);

  useEffect(() => {
    if (activeTab === 'weekly') {
      fetchWeeklyReportData();
    }
  }, [activeTab, fetchWeeklyReportData]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentWeekStart((prev) => {
      const newDate = direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1);
      return newDate;
    });
  }, []);

  const formatWeekRange = useCallback((weekStart: Date) => {
    const weekEnd = addWeeks(weekStart, 6);
    return `${format(weekStart, 'MMMM d, yyyy')} - ${format(weekEnd, 'MMMM d, yyyy')}`;
  }, []);

  const getWorkPlanStatus = (status: string) => {
    switch (status) {
      case 'not-submitted':
        return (
          <span className="text-red-500 flex items-center gap-1">
            <span className="text-lg">!</span> Not Submitted
          </span>
        );
      case 'on-leave':
        return <span className="text-gray-500">On Leave</span>;
      case 'submitted':
        return <span className="text-gray-900 font-medium underline">Submitted</span>;
      default:
        return null;
    }
  };

  const getDsrBadge = (status: string) => {
    const badges: Record<string, string> = {
      'not-submitted': 'bg-gray-100 text-gray-600 border border-gray-300',
      pending: 'bg-blue-50 text-blue-600 border border-blue-200',
      approved: 'bg-green-50 text-green-600 border border-green-200',
      flagged: 'bg-orange-50 text-orange-600 border border-orange-200',
    };

    const labels: Record<string, string> = {
      'not-submitted': 'Not Submitted',
      pending: 'Pending Review',
      approved: 'Approved ✓',
      flagged: 'Flagged 🚩',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges] || badges['not-submitted']
        }`}
      >
        {labels[status as keyof typeof labels] || labels['not-submitted']}
      </span>
    );
  };

  const getAvatarUrl = (name: string, avatar?: string) => {
    if (avatar) return avatar;
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=40`;
  };

  if (!podId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg">Loading pod...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-red-500 mb-1">Work Reports</h1>
            <p className="text-gray-500 text-sm">
              Track and acknowledge the daily work reports of pod members here
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 px-1 relative ${activeTab === 'daily' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
          >
            Daily
            {activeTab === 'daily' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>}
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`pb-3 px-1 relative ${activeTab === 'weekly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
          >
            Weekly
            {activeTab === 'weekly' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>}
          </button>
        </div>
      </div>

      {/* Date Navigation and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {activeTab === 'daily' ? (
            <>
              <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-gray-900 font-medium min-w-[200px] text-center">{formatDate(currentDate)}</span>
              <button onClick={() => navigateDate('next')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-gray-900 font-medium min-w-[280px] text-center">{formatWeekRange(currentWeekStart)}</span>
              <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setAvailabilityModalOpen(true)}
            className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Check Availability
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Summary Report
          </button>
        </div>
      </div>

      {/* Stats Cards - Daily */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">{stats.membersWorking.submitted} / {stats.membersWorking.total}</div>
            <div className="text-gray-500 text-sm">Members Working Today</div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">{stats.workPlans.submitted} / {stats.workPlans.total}</div>
            <div className="text-gray-500 text-sm">Daily Plan Submitted</div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">{stats.dsrs.submitted} / {stats.dsrs.total}</div>
            <div className="text-gray-500 text-sm">DSR Submitted</div>
          </div>
        </div>
      )}

      {/* Stats Cards - Weekly */}
      {activeTab === 'weekly' && weeklyReport && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">{weeklyReport.goalsCompleted} / {weeklyReport.members.length}</div>
            <div className="text-gray-500 text-sm">Goals Completed</div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">{weeklyReport.totalPodProductivity}h</div>
            <div className="text-gray-500 text-sm">Total Pod Productivity</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      )}

      {/* Weekly Loading State */}
      {weeklyLoading && activeTab === 'weekly' && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {/* Daily Tab Content */}
      {activeTab === 'daily' && !loading && !error && (
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Member</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Work Plan</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">DSR</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(member.name, member.avatar)} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className="text-gray-900 font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getWorkPlanStatus(member.workPlan)}</td>
                  <td className="px-6 py-4">{getDsrBadge(member.dsr)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedMember({ id: member.id, name: member.name });
                        setDsrDate(formatDateForApi(currentDate));
                        setViewDsrModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-sm font-medium underline transition"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teamMembers.length === 0 && (
            <div className="py-12 text-center text-gray-500">No team members found for this pod</div>
          )}
        </div>
      )}

      {/* Weekly Tab Content */}
      {activeTab === 'weekly' && !weeklyLoading && weeklyReport && (
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Member</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 text-center">Currently Assigned</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 text-center">Work Ex Target</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-700 text-center">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeklyReport.members.map((member) => (
                <tr key={member.userId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(member.name, member.avatar)} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className="text-gray-900 font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {member.assignedQuests > 0 ? (
                      <span className="text-gray-900 font-medium underline cursor-pointer">{member.assignedQuests} Quest{member.assignedQuests !== 1 ? 's' : ''}</span>
                    ) : (
                      <span className="text-[#f57d34] font-medium">! 0 Quests</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-900">{member.workExCompleted}h / {member.workExTarget}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff7e6e] rounded-full" style={{ width: `${member.progress}%` }} />
                      </div>
                      <span className="text-gray-500 text-sm font-medium min-w-[40px] text-center">{member.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {weeklyReport.members.length === 0 && (
            <div className="py-12 text-center text-gray-500">No team members found for this pod</div>
          )}
        </div>
      )}

      {/* Availability Calendar Modal - shows only pod members */}
      <AvailabilityCalendar isOpen={availabilityModalOpen} onClose={() => setAvailabilityModalOpen(false)} userIds={podMembers.map(m => m._id)} />

      {/* View DSR Modal */}
      <ViewDsr isOpen={viewDsrModalOpen} onClose={() => { setViewDsrModalOpen(false); setSelectedMember(null); }} userId={selectedMember?.id || null} memberName={selectedMember?.name || ''} date={dsrDate} />
    </div>
  );
}
