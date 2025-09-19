import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No logout functionality needed

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 192 // 192px is the width of the dropdown (w-48)
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative z-50" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-[#0097b2]/20 shadow-sm hover:bg-white/80 transition-all duration-200 hover:scale-105"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-[#0097b2] to-[#7ed957] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user.name}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && createPortal(
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[99999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
            ref={dropdownRef}
          >
            <div className="px-4 py-2">
              <div className="text-sm font-semibold text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          </div>,
          document.body
        )}
      </div>

    </>
  );
};

export default ProfileDropdown;
