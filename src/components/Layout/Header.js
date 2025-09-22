import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Clock, RefreshCw, CalendarDays, BarChart3 } from 'lucide-react';
import ProfileDropdown from '../ProfileDropdown';
import { useDateRange } from '../../hooks/redux';
// Remove useRefresh import as we'll use global refresh

const Header = () => {
  // Get global date range context
  const {
    selectedSite,
    updateSelectedSite, // Use the new function that saves to localStorage
    fromDateTime,
    setFromDateTime,
    endDateTime,
    setEndDateTime,
    appliedFromDateTime, // Applied values for display
    appliedEndDateTime, // Applied values for display
    selectedInterval,
    updateSelectedInterval, // Use the new function that saves to localStorage
    isUsingTodayDefault,
    setIsUsingTodayDefault,
    triggerGlobalRefresh,
    applyDateTimeChanges // New function to apply changes
  } = useDateRange();

  // Local loading state for refresh button
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIntervalDropdown, setShowIntervalDropdown] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('today'); // Track selected preset

  // Site options
  const sites = [
    { id: 'dubai', name: 'Green Energy Site - Dubai', location: 'Dubai, UAE', status: 'active' },
    { id: 'abu-dhabi', name: 'Solar Farm - Abu Dhabi', location: 'Abu Dhabi, UAE', status: 'active' },
    { id: 'london', name: 'Wind Farm - London', location: 'London, UK', status: 'maintenance' },
    { id: 'california', name: 'Hybrid Plant - California', location: 'California, USA', status: 'active' },
    { id: 'tokyo', name: 'Smart Grid - Tokyo', location: 'Tokyo, Japan', status: 'active' }
  ];

  // Interval options for data sampling
  const intervals = [
    { id: '5s', label: '5 Seconds' },
    { id: '1m', label: '1 Minute' },
    { id: '5m', label: '5 Minutes' },
    { id: '15m', label: '15 Minutes' },
    { id: '30m', label: '30 Minutes' },
    { id: '1h', label: '1 Hour' },
    { id: '6h', label: '6 Hours' },
    { id: '1d', label: '1 Day' }
  ];

  const selectedSiteData = sites.find(site => site.id === selectedSite);
  const selectedIntervalData = intervals.find(interval => interval.id === selectedInterval);

  // Handle global refresh
  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Trigger global refresh for all KPI components
      triggerGlobalRefresh();
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      setIsRefreshing(false);
    }
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      })
    };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowSiteDropdown(false);
        setShowDatePicker(false);
        setShowIntervalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-[#198c1a]/15 shadow-lg shadow-[#198c1a]/5 relative">
      {/* Perfect gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/3 via-[#198c1a]/5 to-[#0097b2]/3"></div>
      
      <div className="flex items-center justify-between px-6 py-3 h-20 relative z-10">
        {/* Left: Site Selection */}
        <div className="flex items-center space-x-4">
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowSiteDropdown(!showSiteDropdown);
                setShowDatePicker(false);
                setShowIntervalDropdown(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#0097b2]/20 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                    {selectedSiteData?.name}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center space-x-2">
                    <span>{selectedSiteData?.location}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedSiteData?.status)}`}>
                      {selectedSiteData?.status}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showSiteDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Site Dropdown */}
            {showSiteDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#0097b2]/20 z-[9999] overflow-hidden">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                    SELECT SITE
                  </div>
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => {
                        updateSelectedSite(site.id);
                        setShowSiteDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        selectedSite === site.id 
                          ? 'bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10 border border-[#0097b2]/20' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedSite === site.id ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <MapPin className="w-3 h-3" />
                        </div>
                        <div className="text-left">
                          <div className={`text-sm font-medium ${selectedSite === site.id ? 'text-gray-900' : 'text-gray-700'}`}>
                            {site.name}
                          </div>
                          <div className="text-xs text-gray-500">{site.location}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(site.status)}`}>
                        {site.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: DateTime Range Picker */}
        <div className="flex items-center space-x-3">

          {/* Date Range Picker */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowSiteDropdown(false);
                setShowIntervalDropdown(false);
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#0097b2]/20 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                  {isUsingTodayDefault ? 'Today' : `${formatDateTime(appliedFromDateTime).date} - ${formatDateTime(appliedEndDateTime).date}`}
                </div>
                <div className="text-xs text-gray-600">
                  {isUsingTodayDefault ? '12:00 AM → 12:00 AM (24h)' : `${formatDateTime(appliedFromDateTime).time} → ${formatDateTime(appliedEndDateTime).time}`}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {/* DateTime Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-[#0097b2]/20 z-[9999] overflow-hidden">
                <div className="p-4">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent mb-4">
                    SELECT DATE & TIME RANGE
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* From DateTime */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#0097b2]" />
                        <span>From Date & Time</span>
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={fromDateTime}
                          onChange={(e) => {
                            setFromDateTime(e.target.value);
                            setIsUsingTodayDefault(false);
                          }}
                          max={endDateTime}
                          step="1"
                          className="w-full px-3 py-2 border border-[#0097b2]/20 rounded-lg bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2]/30 focus:border-[#0097b2]/50 transition-all duration-300 text-sm"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {formatDateTime(fromDateTime).date} at {formatDateTime(fromDateTime).time}
                      </div>
                    </div>

                    {/* End DateTime */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#198c1a]" />
                        <span>End Date & Time</span>
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={endDateTime}
                          onChange={(e) => {
                            setEndDateTime(e.target.value);
                            setIsUsingTodayDefault(false);
                          }}
                          min={fromDateTime}
                          max={new Date().toISOString().slice(0, 19)}
                          step="1"
                          className="w-full px-3 py-2 border border-[#0097b2]/20 rounded-lg bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#0097b2]/30 focus:border-[#0097b2]/50 transition-all duration-300 text-sm"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {formatDateTime(endDateTime).date} at {formatDateTime(endDateTime).time}
                      </div>
                    </div>
                  </div>

                  {/* Quick Date Presets */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-2">Quick Select</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Today', type: 'today' },
                        { label: 'Last Hour', hours: 1 },
                        { label: 'Last 6 Hours', hours: 6 },
                        { label: 'Last 24 Hours', hours: 24 },
                        { label: 'Last 3 Days', days: 3 },
                        { label: 'Last Week', days: 7 }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            setSelectedPreset(preset.type || preset.label.toLowerCase().replace(/\s+/g, '-'));
                            
                            if (preset.type === 'today') {
                              // Set to full day (12:00 AM to tomorrow 12:00 AM)
                              const now = new Date();
                              const startOfDay = new Date(now);
                              startOfDay.setHours(0, 0, 0, 0); // 12:00 AM today
                              const endOfDay = new Date(now);
                              endOfDay.setDate(endOfDay.getDate() + 1);
                              endOfDay.setHours(0, 0, 0, 0); // 12:00 AM tomorrow
                              
                              // Format for datetime-local input
                              const formatForInput = (date) => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                return `${year}-${month}-${day}T${hours}:${minutes}`;
                              };
                              
                              setFromDateTime(formatForInput(startOfDay));
                              setEndDateTime(formatForInput(endOfDay));
                              setIsUsingTodayDefault(true);
                            } else {
                              // Other presets
                              const end = new Date();
                              const start = new Date();
                              if (preset.hours) {
                                start.setHours(end.getHours() - preset.hours);
                              } else {
                                start.setDate(end.getDate() - preset.days);
                              }
                              
                              // Format for datetime-local input
                              const formatForInput = (date) => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                return `${year}-${month}-${day}T${hours}:${minutes}`;
                              };
                              
                              setFromDateTime(formatForInput(start));
                              setEndDateTime(formatForInput(end));
                              setIsUsingTodayDefault(false);
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                            selectedPreset === (preset.type || preset.label.toLowerCase().replace(/\s+/g, '-'))
                              ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white'
                              : 'bg-gray-100 hover:bg-gradient-to-r hover:from-[#0097b2]/10 hover:to-[#198c1a]/10 hover:border hover:border-[#0097b2]/20'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        applyDateTimeChanges();
                        setShowDatePicker(false);
                        // Update selected preset based on current selection
                        if (isUsingTodayDefault) {
                          setSelectedPreset('today');
                        } else {
                          // Determine which preset matches current selection
                          const fromTime = new Date(fromDateTime);
                          const toTime = new Date(endDateTime);
                          const diffHours = (toTime - fromTime) / (1000 * 60 * 60);
                          const diffDays = (toTime - fromTime) / (1000 * 60 * 60 * 24);
                          
                          if (diffHours <= 1) setSelectedPreset('last-hour');
                          else if (diffHours <= 6) setSelectedPreset('last-6-hours');
                          else if (diffHours <= 24) setSelectedPreset('last-24-hours');
                          else if (diffDays <= 3) setSelectedPreset('last-3-days');
                          else if (diffDays <= 7) setSelectedPreset('last-week');
                          else setSelectedPreset('custom');
                        }
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Apply DateTime Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Interval Selector */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowIntervalDropdown(!showIntervalDropdown);
                setShowSiteDropdown(false);
                setShowDatePicker(false);
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#0097b2]/20 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                  {selectedIntervalData?.label}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showIntervalDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Interval Dropdown */}
            {showIntervalDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-[#0097b2]/20 z-[9999] overflow-hidden">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                    DATA SAMPLING INTERVAL
                  </div>
                  {intervals.map((interval) => (
                    <button
                      key={interval.id}
                      onClick={() => {
                        updateSelectedInterval(interval.id);
                        setShowIntervalDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        selectedInterval === interval.id 
                          ? 'bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10 border border-[#0097b2]/20' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedInterval === interval.id ? 'bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <BarChart3 className="w-3 h-3" />
                        </div>
                        <div className="text-left">
                          <div className={`text-sm font-medium ${selectedInterval === interval.id ? 'text-gray-900' : 'text-gray-700'}`}>
                            {interval.label}
                          </div>
                        </div>
                      </div>
                      {selectedInterval === interval.id && (
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0097b2] to-[#198c1a]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleGlobalRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-[#0097b2]/20 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group disabled:opacity-50"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white group-hover:shadow-lg transition-all duration-300">
              <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            </div>
            <div className="text-left ml-2">
              <div className="text-sm font-bold bg-gradient-to-r from-[#0097b2] to-[#198c1a] bg-clip-text text-transparent">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </div>
              <div className="text-xs text-gray-600">Update data</div>
            </div>
          </button>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header; 