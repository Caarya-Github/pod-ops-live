'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkReportContent } from '@/components/WorkReportContent';

export default function WorkReports() {
  const searchParams = useSearchParams();
  const podId = searchParams.get('podId');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <WorkReportContent podId={podId || ''} />
      </div>
    </div>
  );
}
