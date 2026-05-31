/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Scholarship, StudentProfile, SavedScholarship } from '../types';
import { 
  Search, Filter, MapPin, GraduationCap, DollarSign, Calendar, 
  ShieldCheck, ArrowRight, Heart, Sparkles, AlertCircle, BookmarkCheck
} from 'lucide-react';

interface BrowseScholarshipsProps {
  scholarships: Scholarship[];
  savedScholarshipIds: string[];
  onToggleSave: (id: string) => void;
  onApplySelect: (scholarship: Scholarship) => void;
  appliedScholarshipIds: string[];
  // Initial search terms passed from hero
  initialSearchText?: string;
  initialCountry?: string;
  onViewScholarship?: (id: string) => void;
}

export default function BrowseScholarships({
  scholarships,
  savedScholarshipIds,
  onToggleSave,
  onApplySelect,
  appliedScholarshipIds,
  initialSearchText = '',
  initialCountry = 'Any',
  onViewScholarship
}: BrowseScholarshipsProps) {
  // Search and Filter States
  const [searchText, setSearchText] = useState(initialSearchText);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedIncome, setSelectedIncome] = useState<string>('Any');
  const [minGpa, setMinGpa] = useState<number>(0);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Smart Self Profile Matcher States
  const [showMatcher, setShowMatcher] = useState(false);
  const [userGpa, setUserGpa] = useState<string>('3.5');
  const [userLevel, setUserLevel] = useState<string>('Masters');
  const [userIncome, setUserIncome] = useState<'Low' | 'Medium' | 'High'>('Low');

  // Selected scholarship details modal state
  const [selectedDetail, setSelectedDetail] = useState<Scholarship | null>(null);

  // Filter Logic
  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => {
      // 1. Text Search matches Name, Sponsor, Course, or Description
      const term = searchText.toLowerCase().trim();
      const textMatches = !term || 
        s.name.toLowerCase().includes(term) ||
        s.sponsorName.toLowerCase().includes(term) ||
        s.eligibilityCourse.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term);

      // 2. Country Match
      const countryMatches = selectedCountry === 'Any' || 
        s.eligibilityCountry.toLowerCase() === selectedCountry.toLowerCase() ||
        s.eligibilityCountry === 'Any';

      // 3. Level Match
      const levelMatches = selectedLevel === 'All' || 
        s.eligibilityLevel === 'All' ||
        s.eligibilityLevel === selectedLevel;

      // 4. Income Match (Low-income scholarships are restricted to low-income profiles)
      const incomeMatches = selectedIncome === 'Any' ||
        s.eligibilityIncome === 'Any' ||
        s.eligibilityIncome.toLowerCase() === selectedIncome.toLowerCase();

      // 5. GPA Match (Scholarship GPA minimum threshold)
      const gpaMatches = s.eligibilityGpa <= minGpa || minGpa === 0;

      // 6. Course study keyword (if selected)
      const courseKeywordMatches = !selectedCourse || 
        s.eligibilityCourse.toLowerCase().includes(selectedCourse.toLowerCase()) ||
        s.eligibilityCourse.toLowerCase() === 'any';

      return textMatches && countryMatches && levelMatches && incomeMatches && gpaMatches && courseKeywordMatches;
    });
  }, [scholarships, searchText, selectedCountry, selectedLevel, selectedIncome, minGpa, selectedCourse]);

  // Profile Matching calculation helper for each scholarship
  const getMatchAnalysis = (s: Scholarship) => {
    let score = 100;
    const reasons: string[] = [];

    // Level analysis
    if (s.eligibilityLevel !== 'All' && s.eligibilityLevel !== userLevel) {
      score -= 30;
      reasons.push(`Degree Level mismatch (${s.eligibilityLevel} vs your ${userLevel})`);
    } else {
      reasons.push(`Perfect level match (${userLevel})`);
    }

    // GPA analysis
    const numericUserGpa = parseFloat(userGpa) || 0.0;
    if (s.eligibilityGpa > numericUserGpa) {
      score -= 40;
      reasons.push(`GPA below minimum required (${s.eligibilityGpa} vs your ${userGpa})`);
    } else {
      reasons.push(`Meets GPA criteria (Your ${userGpa} is well above ${s.eligibilityGpa})`);
    }

    // Income analysis
    if (s.eligibilityIncome === 'Low-income' && userIncome !== 'Low') {
      score -= 30;
      reasons.push(`Restricted to low-household incomes (Your profile is ${userIncome})`);
    } else {
      reasons.push(`Financial criteria satisfied`);
    }

    return {
      score: Math.max(0, score),
      reasons
    };
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCountry('Any');
    setSelectedLevel('All');
    setSelectedIncome('Any');
    setMinGpa(0);
    setSelectedCourse('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Header and Smart Match Toggle Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
            Discover verified scholarships
          </h2>
          <p className="text-slate-500 mt-1 max-w-2xl text-[14px]">
            Explore 100% scam-free educational funds manually vetted by our team. Filter by study level, stream, and match with your profile.
          </p>
        </div>

        {/* Profile Matcher toggle button */}
        <button
          onClick={() => setShowMatcher(!showMatcher)}
          className={`px-4.5 py-2.5 rounded-xl font-semibold text-[13px] md:text-[14px] flex items-center gap-2 transition-all ${
            showMatcher 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <Sparkles className="w-4.5 h-4.5 shrink-0" />
          {showMatcher ? 'Close Profile Matcher' : 'Match My Profile Instantly'}
        </button>
      </div>

      {/* Smart Profile Personal Matcher Panel */}
      {showMatcher && (
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 shadow-inner animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-600 w-5 h-5 shrink-0" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Weekly Scholarship Matcher Setup
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-5 max-w-3xl">
            Input your real grades, current education level, and general background state below. The system will dynamically overlay an eligibility percentage on each card and point out any criteria conflicts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Your Current GPA / Grade</label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="4.0"
                value={userGpa}
                onChange={(e) => setUserGpa(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Intended Degree Level</label>
              <select
                value={userLevel}
                onChange={(e) => setUserLevel(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Certificate">Certificate / Vocational</option>
                <option value="Diploma">Diploma Courses</option>
                <option value="Undergraduate">Undergraduate Degree</option>
                <option value="Masters">Masters Postgraduate</option>
                <option value="PhD">PhD Doctorate</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Household Income Bracket</label>
              <select
                value={userIncome}
                onChange={(e) => setUserIncome(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Low">Low Income (Needs-based support)</option>
                <option value="Medium">Medium Income</option>
                <option value="High">Generous / Comfortable Income</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <span className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-500" /> Filter Criteria
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-blue-600 font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Keyword search inside filter */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Study Keyword</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Science, Safe"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none border border-transparent focus:border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Study Destination</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="Any">Any Study Destination</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              {/* Degree Level Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Degree / Course Level</label>
                <div className="space-y-1.5">
                  {['All', 'Certificate', 'Diploma', 'Undergraduate', 'Masters', 'PhD'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                      <input
                        type="radio"
                        name="degree-level"
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level)}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>{level === 'All' ? 'All Education Levels' : level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* GPA Threshold Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600">Min GPA Requirement</label>
                  <span className="text-[11px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {minGpa === 0 ? 'Any GPA' : minGpa.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4.0"
                  step="0.1"
                  value={minGpa}
                  onChange={(e) => setMinGpa(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0.0 (No check)</span>
                  <span>4.0 (Perfect Grade)</span>
                </div>
              </div>

              {/* Financial Support Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Financial Bracket Status</label>
                <select
                  value={selectedIncome}
                  onChange={(e) => setSelectedIncome(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="Any">Apply to All Income levels</option>
                  <option value="Low-income">Restricted to Needs-Based / Low-Income</option>
                </select>
              </div>
            </div>
            
            {/* Vetting disclaimer */}
            <div className="mt-6 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-emerald-800 leading-normal">
                <strong>Our Guarantee:</strong> Every single scholarship listed is audited, manually checked, and connects directly to sponsors. No scammers, no phishing links.
              </div>
            </div>
          </div>
        </div>

        {/* Scholarships Listing Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Active filters status / Result count */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Found {filteredScholarships.length} verified scholarship {filteredScholarships.length === 1 ? 'opportunity' : 'opportunities'}</span>
            {(selectedLevel !== 'All' || selectedCountry !== 'Any' || searchText !== '' || minGpa !== 0) && (
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">Filters active</span>
            )}
          </div>

          {/* Empty State */}
          {filteredScholarships.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-display font-bold text-lg text-slate-800">No results match your filters</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm">
                Try widening your search terms, adjusting the required GPA slider, or selecting "Any Country" to find more opportunities.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScholarships.map(s => {
              const isSaved = savedScholarshipIds.includes(s.id);
              const isApplied = appliedScholarshipIds.includes(s.id);
              const matchStats = showMatcher ? getMatchAnalysis(s) : null;

              return (
                <div 
                  key={s.id} 
                  className="bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg rounded-2xl p-5 transition-all flex flex-col justify-between group relative"
                >
                  {/* Top line banner: Save trigger & Match Rate */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {/* Sponsor badge */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md font-medium tracking-tight truncate max-w-[150px]">
                        {s.sponsorName}
                      </div>
                      {s.verified && (
                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 shadow-sm leading-none" title="ABROAD SCHOLARSHIP Verified Sponsor">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" /> Verified
                        </span>
                      )}
                    </div>
                    
                    {/* Save bookmark button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(s.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-full transition-colors hover:bg-rose-50 cursor-pointer"
                      title={isSaved ? "Saved to Bookmarks" : "Save this scholarship"}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      animate={isSaved ? { 
                        scale: [1, 1.35, 0.95, 1.1, 1], 
                        rotate: [0, -12, 12, -10, 0] 
                      } : { 
                        scale: [1, 0.8, 1],
                        rotate: 0
                      }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </motion.button>
                  </div>

                  {/* Title and details */}
                  <div className="space-y-2 mb-4">
                    <button
                      onClick={() => {
                        setSelectedDetail(s);
                        if (onViewScholarship) onViewScholarship(s.id);
                      }}
                      className="font-display font-bold text-sm text-slate-900 leading-snug text-left hover:text-blue-600 transition-colors cursor-pointer block"
                    >
                      {s.name}
                    </button>
                    
                    {/* Description excerpt */}
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                  </div>

                  {/* Smart Profile matching widget overlay */}
                  {matchStats && (
                    <div className="mb-4 bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-500" /> Match Probability
                        </span>
                        <span className={`font-mono font-bold font-semibold ${
                          matchStats.score >= 80 ? 'text-emerald-600' : matchStats.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {matchStats.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            matchStats.score >= 80 ? 'bg-emerald-500' : matchStats.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${matchStats.score}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 max-w-full truncate">
                        {matchStats.score < 100 ? matchStats.reasons.find(r => r.includes('mismatch') || r.includes('below')) : 'Fully eligible! Apply now.'}
                      </p>
                    </div>
                  )}

                  {/* Metadata and action bottom row */}
                  <div className="pt-3 border-t border-slate-50 space-y-3 mt-auto">
                    {/* Details grid line */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900">{s.amount.split(' /')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-right font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Ends: {s.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate col-span-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Courses: <strong className="font-medium text-slate-700">{s.eligibilityCourse}</strong></span>
                      </div>
                    </div>

                    {/* Bottom main CTA */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedDetail(s);
                          if (onViewScholarship) onViewScholarship(s.id);
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
                      >
                        Read Details →
                      </button>

                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <BookmarkCheck className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (onViewScholarship) onViewScholarship(s.id);
                            onApplySelect(s);
                          }}
                          className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scholarship Detailed Info Modal overlay */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              ✕
            </button>

            {/* Shield anti-scam alert indicator */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-800 text-xs">Vetted &amp; Safe Direct Submission</h4>
                <p className="text-[10px] text-emerald-600 mt-0.5">This listing has been hand-verified by our scholarship board. You will apply directly through the Abroad Scholarship Document Vault proxy.</p>
              </div>
            </div>

            {/* Course Title details */}
            <div className="space-y-2 mb-6 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wide bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {selectedDetail.sponsorName}
                </span>
                {selectedDetail.verified && (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-150 shadow-sm leading-none">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> Verified Sponsor
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 leading-tight">
                {selectedDetail.name}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-2">
                {selectedDetail.description}
              </p>
            </div>

            {/* Criteria Checklist grid */}
            <hr className="border-slate-100 my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-6">
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Funding Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Value:</span> <strong className="text-slate-800">{selectedDetail.amount}</strong></div>
                  <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Deadline:</span> <strong className="text-slate-800">{selectedDetail.deadline}</strong></div>
                  <div className="flex justify-between py-1"><span className="text-slate-500 font-semibold text-rose-500">Service Fee:</span> <strong className="text-emerald-600 font-bold">100% Free</strong></div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Eligibility Thresholds</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Min GPA Required:</span> <strong className="text-slate-800">{selectedDetail.eligibilityGpa.toFixed(1)} / 4.0</strong></div>
                  <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Target Country:</span> <strong className="text-slate-800">{selectedDetail.eligibilityCountry}</strong></div>
                  <div className="flex justify-between py-1"><span className="text-slate-500">Household Income:</span> <strong className="text-slate-800">{selectedDetail.eligibilityIncome}</strong></div>
                </div>
              </div>
            </div>

            {/* Required Documents checklist for the upload vault */}
            <div className="text-left mb-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Application Files</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {selectedDetail.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sponsor Profile & Trust Score Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3 mb-6">
              <div className="flex items-center justify-between gap-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sponsor Organisation Profile</h4>
                {selectedDetail.verified ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-850 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-250 uppercase tracking-wider leading-none shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> Verified Sponsor Profile
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                    Pending Full Verification
                  </span>
                )}
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase tracking-widest font-mono shadow-sm">
                  {selectedDetail.sponsorName.substring(0, 2)}
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-slate-800">{selectedDetail.sponsorName}</h5>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    An audited partner organization dedicated to sponsoring global scholarship applicants. Fully compliant with active communication responsive SLAs, Direct bank treasury transfers, and GDPR encrypted dossier forwarding.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 pt-1.5 text-[9.5px] text-slate-450 text-slate-500 font-mono border-t border-slate-100">
                <div>Status: <span className="text-emerald-700 font-extrabold">● Vetted Active</span></div>
                <div>Audit Reference: <span className="text-slate-700 font-bold">AS-{selectedDetail.id.toUpperCase()}</span></div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedDetail(null)}
                className="hover:bg-slate-100 text-slate-500 rounded-xl px-5 py-2.5 text-xs font-semibold"
              >
                Close Window
              </button>
              
              {appliedScholarshipIds.includes(selectedDetail.id) ? (
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-5 py-2.5 rounded-xl border border-emerald-200">
                  Applied successfully
                </span>
              ) : (
                <button
                  onClick={() => {
                    onApplySelect(selectedDetail);
                    setSelectedDetail(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                >
                  Start Online Application
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
