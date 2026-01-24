'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { workReportApi, DsrDetails } from '@/lib/spaApi';

interface ViewDsrProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  memberName: string;
  date: string;
}

export const ViewDsr: React.FC<ViewDsrProps> = ({
  isOpen,
  onClose,
  userId,
  memberName,
  date,
}) => {
  const [loading, setLoading] = useState(true);
  const [dsrData, setDsrData] = useState<DsrDetails | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setDsrData(null);
      return;
    }

    const fetchDsrData = async () => {
      setLoading(true);
      try {
        const data = await workReportApi.getDsrDetails(userId, date);
        setDsrData(data);
      } catch (error) {
        console.error('Error fetching DSR data:', error);
        setDsrData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDsrData();
  }, [isOpen, userId, date]);

  if (!isOpen) return null;

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  };

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-[20px] w-full max-w-2xl mx-4 p-12 flex items-center justify-center shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#6775F5]" />
        </div>
      </div>
    );
  }

  // Fallback mock data when no DSR found
  const data = dsrData || {
    memberName,
    memberAvatar: undefined,
    date: formatDateDisplay(date),
    responsibilities: {
      workDone: [],
      totalTime: '0h',
      challenges: 'No challenges recorded',
      supportAvailed: [],
    },
    accountability: [],
    visionSync: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f3f2f2] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={20} className="text-[#363430]" />
            </button>
            <h2 className="text-[16px] font-bold font-['Lato'] text-[#282724] tracking-[0.32px]">
              Daily Status Report
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#6775F5] flex items-center justify-center text-white text-xs font-bold">
                {data.memberName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-[#363430]">{data.memberName}</span>
                <span className="text-[10px] text-[#9c9a96]">{data.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
          {/* Responsibilities Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ED4C41" strokeWidth="2"/>
                  <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" fill="#ED4C41"/>
                  <path d="M10 12L11.5 13.5L14 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[16px] font-bold font-['Satoshi'] text-[#363430] tracking-[0.4px]">
                Responsibilities
              </p>
            </div>

            <div className="bg-[#fafafa] rounded-lg p-3">
              {/* Work Done Items */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[14px] font-bold font-['Satoshi'] text-[#363430]">Work Done</p>
                  <p className="text-[14px] font-medium font-['Satoshi'] text-[#ff7e6e]">{data.responsibilities.totalTime}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {data.responsibilities.workDone.map((item) => (
                    <div key={item.id}>
                      <div className="bg-white border border-[#f3f2f2] rounded-lg p-2 flex items-center gap-2">
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="#ED4C41" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="5" fill="#ED4C41"/>
                          </svg>
                        </div>
                        <p className="flex-1 text-[12px] font-bold font-['Satoshi'] text-[#363430] truncate">
                          {item.title}
                        </p>
                        <ChevronRight size={14} className="text-[#363430]" />
                      </div>

                      {/* Subtasks */}
                      <div className="ml-4 mt-2 flex flex-col gap-2">
                        {item.subtasks.map((subtask, idx) => (
                          <div key={idx} className="border-l-2 border-[#e7e6e5] pl-3 py-2 pr-2">
                            <p className="text-[12px] font-['Satoshi'] text-[#363430] mb-1">
                              {subtask.description}
                            </p>
                            <p className="text-[12px] font-bold font-['Satoshi'] text-[#9c9a96]">
                              {subtask.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges Faced */}
              <div className="mb-4">
                <p className="text-[14px] font-bold font-['Satoshi'] text-[#363430] mb-2">Challenges Faced</p>
                <p className="text-[14px] font-['Satoshi'] text-[#363430] leading-relaxed">
                  {data.responsibilities.challenges}
                </p>
              </div>

              {/* Support Availed */}
              <div>
                <p className="text-[14px] font-bold font-['Satoshi'] text-[#363430] mb-2">Support Availed</p>
                <div className="flex flex-col gap-2">
                  {data.responsibilities.supportAvailed.map((support, idx) => (
                    <div key={idx} className="border-l-2 border-[#e7e6e5] pl-3 py-2 pr-2">
                      <p className="text-[12px] font-bold font-['Satoshi'] text-[#363430] capitalize">
                        {support.type}
                      </p>
                      <p className="text-[12px] font-['Satoshi'] text-[#696763]">
                        {support.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accountability Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6H21" stroke="#363430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H21" stroke="#363430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 18H21" stroke="#363430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6H3.01M3 12H3.01M3 18H3.01" stroke="#363430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[16px] font-bold font-['Satoshi'] text-[#363430] tracking-[0.4px]">
                Accountability
              </p>
            </div>

            <div className="bg-[#fafafa] rounded-lg p-3 flex flex-col gap-2">
              {data.accountability.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-2 flex items-start gap-3">
                  <p className="flex-1 text-[14px] font-medium font-['Satoshi'] text-[#363430]">
                    {item.task}
                  </p>
                  {item.completed ? (
                    <CheckCircle size={20} className="text-[#363430]" />
                  ) : (
                    <Circle size={20} className="text-[#e7e6e5]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vision Sync Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#363430" strokeWidth="2"/>
                  <path d="M2 12H22" stroke="#363430" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 2C15.866 2 19 5.13401 19 9C19 12.866 15.866 16 12 16C8.13401 16 5 12.866 5 9C5 5.13401 8.13401 2 12 2Z" stroke="#363430" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-[16px] font-bold font-['Satoshi'] text-[#363430] tracking-[0.4px]">
                Vision Sync
              </p>
            </div>

            <div className="bg-[#fafafa] rounded-lg p-3 flex flex-col gap-2">
              {data.visionSync.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-2">
                  <p className="text-[14px] font-medium font-['Satoshi'] text-[#363430]">
                    {item.task}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDsr;
