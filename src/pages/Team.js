// src/pages/Team.js
import React from 'react';
import { Users, Construction } from 'lucide-react';

const Team = () => {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center max-w-md">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Users className="w-24 h-24 text-[#0097B2] mb-4" />
              <Construction className="w-8 h-8 text-orange-500 absolute -bottom-2 -right-2 bg-white rounded-full p-1 border-2 border-orange-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Team / Management Module
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            This module is currently under development
          </p>
          
          <div className="bg-gradient-to-r from-[#0097B2]/10 to-[#198C1A]/10 rounded-xl p-6 border border-[#0097B2]/20">
            <p className="text-sm text-gray-700">
              Soon you'll be able to manage site managers, operators, user roles, and team permissions here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
