import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsCard = () => {
  return (
    <div className="h-full rounded-3xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
          Notifications
        </h3>
        <Bell className="w-5 h-5 text-[#0097b2]" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-center">No notifications</p>
      </div>
    </div>
  );
};

export default NotificationsCard;
