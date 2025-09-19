import React from 'react';

const ProjectPictureCard = () => {
  return (
    <div className="rounded-2xl bg-white shadow-lg border border-gray-200 p-4 h-full overflow-hidden">
      {/* 50/50 Split Layout */}
      <div className="flex h-full gap-4">
        {/* Left Side - Project Image (50%) */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent mb-2">
            Project Picture
          </h3>
          
          {/* Project Image - Properly Contained */}
          <div className="flex-1 rounded-lg overflow-hidden min-h-0">
            <img 
              src="/kpi-images/solar.jpg" 
              alt="Solar Energy Project" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback content if image doesn't load */}
            <div className="w-full h-full bg-gradient-to-br from-[#0097b2]/20 to-[#198c1a]/20 rounded-lg flex items-center justify-center hidden">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 font-medium">Green Energy</p>
                <p className="text-xs text-gray-500">Solar Farm</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Weather & Capacity Info (50%) */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Weather Info Section */}
          <div className="bg-gradient-to-br from-[#0097b2]/8 to-[#198c1a]/8 rounded-xl p-4 mb-4 shadow-sm border border-[#0097b2]/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                  London, UK
                </p>
                <p className="text-xl font-bold text-gray-900">25°C</p>
              </div>
              
              {/* Weather Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-xl flex items-center justify-center shadow-md">
                <div className="text-white text-lg">☁️</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">Last sync: 2 min ago</p>
              <span className="px-3 py-1.5 text-xs rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active
              </span>
            </div>
          </div>
          
          {/* Capacity Info Section - Three Columns with Dividers */}
          <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-[#0097b2]/3 to-[#198c1a]/3 rounded-xl p-4">
            {/* Total PV Capacity */}
            <div className="flex-1 text-center">
              <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent leading-tight">
                Total PV<br />Capacity
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">25 kW</div>
            </div>
            
            {/* Vertical Divider */}
            <div className="w-px h-16 bg-gradient-to-b from-[#0097b2]/30 to-[#198c1a]/30 mx-4"></div>
            
            {/* Total Genset Rating */}
            <div className="flex-1 text-center">
              <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent leading-tight">
                Total Genset<br />Rating
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">15 kW</div>
            </div>
            
            {/* Vertical Divider */}
            <div className="w-px h-16 bg-gradient-to-b from-[#0097b2]/30 to-[#198c1a]/30 mx-4"></div>
            
            {/* Total Grid Rating */}
            <div className="flex-1 text-center">
              <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent leading-tight">
                Total Grid<br />Rating
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2">40 kW</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPictureCard;
