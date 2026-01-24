'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { MemberAvailability, fetchMembersAvailability } from '@/lib/api';

interface AvailabilityCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  userIds: string[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  isOpen,
  onClose,
  userIds
}) => {
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<MemberAvailability[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek;
  });

  useEffect(() => {
    if (!isOpen) return;

    const loadAvailability = async () => {
      setLoading(true);
      setError(null);
      console.log('Loading availability for userIds:', userIds);
      try {
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 13); // 2 weeks
        const data = await fetchMembersAvailability(
          userIds,
          currentWeekStart.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        console.log('Availability data loaded:', data);
        setAvailability(data);
      } catch (error) {
        console.error('Error loading availability:', error);
        setError('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [isOpen, currentWeekStart, userIds]);

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[13];

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);

    return `${startStr} - ${endStr}`;
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const getAvailabilityStatus = (userId: string, date: Date) => {
    const member = availability.find(m => m.userId === userId);
    if (!member) return { available: false, hours: 0 };

    const dateStr = date.toISOString().split('T')[0];
    const dateData = member.dates.find(d => d.date === dateStr);
    return dateData || { available: false, hours: 0 };
  };

  if (!isOpen) {
    console.log('Modal is not open, isOpen:', isOpen);
    return null;
  }

  console.log('Modal rendering, userIds:', userIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f3f2f2]">
          <h2 className="text-[16px] font-bold font-['Lato'] text-[#363430] tracking-[0.32px]">
            Availability Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} className="text-[#9c9a96]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(80vh-100px)]">
          {/* Week Navigator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} className="text-[#363430]" />
            </button>
            <div className="px-4 py-2 border-b border-[#e7e6e5]">
              <span className="text-[14px] font-bold font-['Satoshi'] text-[#ed4c41]">
                {formatDateRange()}
              </span>
            </div>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ChevronRight size={20} className="text-[#363430]" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#6775F5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-500 text-sm mb-2">{error}</p>
                <button
                  onClick={() => {
                    const endDate = new Date(currentWeekStart);
                    endDate.setDate(endDate.getDate() + 13);
                    fetchMembersAvailability(
                      userIds,
                      currentWeekStart.toISOString().split('T')[0],
                      endDate.toISOString().split('T')[0]
                    ).then(setAvailability).catch(console.error);
                  }}
                  className="px-4 py-2 bg-[#6775F5] text-white text-xs font-bold rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="w-[160px] text-left px-2 py-3">
                      <span className="text-[14px] font-bold font-['Satoshi'] text-[#363430]">
                        Members
                      </span>
                    </th>
                    {weekDates.map((date) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <th key={date.toISOString()} className="w-[48px] text-center">
                          <div className={`flex flex-col items-center py-2 ${isToday ? 'text-[#ed4c41]' : ''}`}>
                            <span className="text-[12px] font-bold font-['Satoshi'] text-[#363430]">
                              {date.getDate()}
                            </span>
                            <span className="text-[12px] font-medium font-['Satoshi'] text-[#9c9a96]">
                              {DAYS[date.getDay()]}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {availability.map((member) => (
                    <tr key={member.userId} className="border-t border-[#f3f2f2]">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#6775F5] flex items-center justify-center text-white text-[10px] font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[12px] font-medium font-['Satoshi'] text-[#363430] truncate max-w-[120px]">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      {weekDates.map((date) => {
                        const status = getAvailabilityStatus(member.userId, date);
                        return (
                          <td key={date.toISOString()} className="text-center">
                            <div
                              className={`w-[48px] h-[48px] flex items-center justify-center border ${
                                status.available
                                  ? 'bg-[#f3fcf2] border-[#f3f2f2]'
                                  : 'bg-white border-[#f3f2f2]'
                              }`}
                            >
                              {status.available ? (
                                <CheckCircle size={16} className="text-[#2bb656]" />
                              ) : (
                                <Circle size={16} className="text-[#cfcdc9]" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {availability.length === 0 && (
                    <tr>
                      <td colSpan={15} className="text-center py-8">
                        <p className="text-[#9c9a96] text-sm">No members found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-[#f3f2f2] bg-neutral-50">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-[#2bb656]" />
              <span className="text-[#696763]">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle size={14} className="text-[#cfcdc9]" />
              <span className="text-[#696763]">Not Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
