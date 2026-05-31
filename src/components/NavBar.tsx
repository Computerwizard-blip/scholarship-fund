/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, Users, Shield, Award, Settings } from 'lucide-react';

interface NavBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: 'student' | 'sponsor' | 'guest';
  onRoleChange: (role: 'student' | 'sponsor' | 'guest') => void;
  savedCount: number;
  currentUser: { name: string; email: string; password?: string } | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export default function NavBar({
  currentView,
  onNavigate,
  userRole,
  onRoleChange,
  savedCount,
  currentUser,
  onLogout,
  onOpenAuth
}: NavBarProps) {
  // Compute initials for the avatar
  const getInitials = () => {
    if (!currentUser) return 'GT';
    if (currentUser.email === 'admin@abroadscholarship.org') return 'AD';
    const parts = currentUser.name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col">
      {/* Main Bar */}
      <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-left group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl tracking-tight shadow-md shadow-emerald-500/20 group-hover:scale-105 active:scale-95 transition-all">
            AS
          </div>
          <div>
            <div className="font-display font-bold text-lg md:text-xl text-slate-900 tracking-tight leading-none">
              ABROAD SCHOLARSHIP
            </div>
            <div className="text-[10px] text-emerald-605 text-emerald-600 font-semibold font-mono tracking-wider mt-0.5 flex items-center gap-1 uppercase">
              <Shield className="w-2.5 h-2.5 stroke-[3]" /> 100% Verified Opportunities
            </div>
          </div>
        </button>

        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-8">
          <button
            onClick={() => onNavigate('browse')}
            className={`text-[14px] font-medium transition-colors ${
              currentView === 'browse' ? 'text-emerald-700 border-b-2 border-emerald-600 pb-0.5' : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Find Scholarships
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-[14px] font-medium text-slate-600 hover:text-emerald-600 transition-colors"
          >
            How It Works
          </button>
          
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-[14px] font-medium text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Trust & Safety
          </button>
        </div>

        {/* Profile Action / Call to Action */}
        <div className="flex items-center gap-3">
          {currentUser === null ? (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="text-[14px] font-medium hover:text-emerald-600 text-slate-700 transition-colors px-3 py-1.5 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="bg-emerald-600 text-white rounded-lg px-4.5 py-2 text-[14px] font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer"
              >
                Sign Up Free
              </button>
            </>
          ) : currentUser.email === 'admin@abroadscholarship.org' ? (
            <>
              <button
                onClick={() => {
                  onNavigate('student-dashboard');
                }}
                className="flex items-center gap-2 hover:bg-slate-50 transition-all rounded-lg p-1 px-2.5 text-slate-700 text-[14px] font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow">
                  {getInitials()}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="font-semibold text-slate-800 text-xs text-emerald-700">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">System Admin</div>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="text-[12px] text-rose-500 hover:bg-rose-50 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                Exit Portal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onRoleChange('student');
                  onNavigate('student-dashboard');
                }}
                className="flex items-center gap-2 hover:bg-slate-50 transition-all rounded-lg p-1 px-2.5 text-slate-700 text-[14px] font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {getInitials()}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="font-semibold text-slate-800 text-xs">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Student Account</div>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="text-[12px] text-rose-500 hover:bg-rose-50 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
