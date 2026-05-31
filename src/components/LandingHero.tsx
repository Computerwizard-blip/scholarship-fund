/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, ShieldAlert, Award, Star, Users, GraduationCap } from 'lucide-react';

interface LandingHeroProps {
  onSearch: (searchTerm: string, country: string) => void;
  onNavigate: (view: string) => void;
}

export default function LandingHero({ onSearch, onNavigate }: LandingHeroProps) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('Any');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, country);
    onNavigate('browse');
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-slate-50 overflow-hidden py-14 md:py-24 px-4 md:px-8">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-300 opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-purple-200 opacity-25 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Content */}
        <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">


          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-none tracking-tight">
            Stop Searching.<br/>
            <span className="text-blue-600">
              Start Studying Abroad.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-600 text-[16px] md:text-[18px] max-w-2xl leading-relaxed">
            Find <strong className="font-semibold text-slate-900">10,000+ verified scholarships, grants, and bursaries</strong>. Apply online in minutes. 100% free with no hidden commissions, agent cuts, or paperwork scams.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSubmit}
            className="bg-white p-2 ml-0 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row items-center gap-2 max-w-3xl"
          >
            {/* Study field input */}
            <div className="w-full flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="What do you want to study? (e.g., Computer Science)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-[14px] text-slate-800 focus:outline-none bg-transparent"
              />
            </div>

            {/* Country Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-2 px-3 py-2 min-w-[150px]">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-[14px] text-slate-800 focus:outline-none bg-transparent font-medium cursor-pointer"
              >
                <option value="Any">All Countries</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 active:scale-95 transition-colors text-white text-[14px] font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-200"
            >
              Search Scholarships
            </button>
          </form>

          {/* Fear Elimination Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Manual scam checks</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Direct-to-sponsor uploads</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Safe document vault</span>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-6 border-t border-slate-100 shrink-0 grid grid-cols-3 gap-4 max-w-xl">
            <div>
              <div className="font-display font-bold text-2xl md:text-3xl text-slate-900">15,000+</div>
              <div className="text-[12px] text-slate-500 mt-1">Students Assisted</div>
            </div>
            <div>
              <div className="font-display font-bold text-2xl md:text-3xl text-slate-900">500+</div>
              <div className="text-[12px] text-slate-500 mt-1">Verified Sponsors</div>
            </div>
            <div>
              <div className="font-display font-bold text-2xl md:text-3xl text-slate-900">KES 2.1B+</div>
              <div className="text-[12px] text-slate-500 mt-1 flex items-center gap-1">Awarded</div>
            </div>
          </div>
        </div>

        {/* Right Side: Mini UI Collage and Visual Frame */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-[320px] sm:w-[380px] h-[340px] sm:h-[400px]">
            {/* Background blob design */}
            <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-6 scale-95 opacity-5 animate-pulse"></div>
            
            {/* Illustrative image placeholder using gorgeous Tailwind layouts and students style card */}
            <div className="absolute inset-0 bg-slate-900 rounded-3xl rotate-3 shadow-2xl flex flex-col justify-between p-6 overflow-hidden text-white border-2 border-slate-800">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-600 rounded-full opacity-60 blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded border border-slate-700">
                  SECURE PLATFORM
                </span>
              </div>

              {/* Glowing Student Concept Card */}
              <div className="z-10 text-left my-auto space-y-4">
                <GraduationCap className="w-12 h-12 text-blue-400 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20" />
                <h3 className="font-display font-bold text-xl leading-tight">
                  Unlock fully-funded undergraduate & post-graduate education.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apply directly to universities, governmental boards, and charity funds from Nairobi directly to Canada, USA, Germany and more.
                </p>
              </div>

              {/* Status Update Simulator Toast inside image UI! */}
              <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-xl flex items-center gap-3 z-10 shadow-lg translate-y-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  ✓
                </div>
                <div className="text-xs text-left">
                  <div className="font-semibold text-slate-100">Brian J. Ono • Accepted!</div>
                  <div className="text-[10px] text-slate-400">KES 2.5M Clean-Tech Master Scholar</div>
                </div>
              </div>
            </div>

            {/* Small hovering Badge */}
            <div className="absolute top-8 left-[-40px] bg-white border border-slate-100 p-3 rounded-xl shadow-lg flex items-center gap-2 max-w-[150px] transform -rotate-6 z-20">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                ★
              </div>
              <div className="text-[11px] text-left">
                <div className="font-bold text-slate-900">NO SCAMS</div>
                <div className="text-slate-500">Manual vetting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
