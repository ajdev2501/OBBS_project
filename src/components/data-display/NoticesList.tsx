import React from 'react';
import { format } from 'date-fns';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import type { Notice } from '../../types/database';

interface NoticesListProps {
  notices: (Notice & { created_by_profile: { full_name: string } })[];
  showAll?: boolean;
}

export const NoticesList: React.FC<NoticesListProps> = ({ notices, showAll = false }) => {
  const displayNotices = showAll ? notices : notices.slice(0, 3);

  if (displayNotices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <SpeakerWaveIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No notices available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayNotices.map((notice) => (
        <div key={notice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <SpeakerWaveIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{notice.title}</h4>
              <p className="text-gray-700 text-sm mb-2">{notice.message}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>By {notice.created_by_profile.full_name}</span>
                <span>•</span>
                <span>{format(new Date(notice.created_at), 'MMM dd, yyyy')}</span>
                {notice.city && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {notice.city}
                    </span>
                  </>
                )}
                {notice.blood_group && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      {notice.blood_group}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};