/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Scholarship, ScholarshipApplication } from '../types';
import { 
  PlusCircle, Users, GraduationCap, Award, Calendar, Check, X, Mail, Phone, MapPin, 
  DollarSign, FileText, Send, Sparkles, Filter, CheckCircle2, ChevronDown, BarChart3, HelpCircle,
  Search
} from 'lucide-react';

interface SponsorPortalProps {
  scholarships: Scholarship[];
  onAddScholarship: (scholarship: Omit<Scholarship, 'id' | 'verified'>) => void;
  applications: ScholarshipApplication[];
  onUpdateAppStatus: (appId: string, status: ScholarshipApplication['status']) => void;
}

export default function SponsorPortal({
  scholarships,
  onAddScholarship,
  applications,
  onUpdateAppStatus
}: SponsorPortalProps) {
  // Navigation inside sponsor portal: 'applicant-board' | 'post-scholarship' | 'active-listings'
  const [activeTab, setActiveTab] = useState<'applicants' | 'post' | 'listings'>('applicants');

  // Form states for posting a new scholarship
  const [formName, setFormName] = useState('');
  const [formSponsor, setFormSponsor] = useState('Nairobi Clean-Water NGO Council');
  const [formAmount, setFormAmount] = useState('KES 1,500,000 / year');
  const [formRawAmount, setFormRawAmount] = useState(1500000);
  const [formDeadline, setFormDeadline] = useState('2026-11-20');
  const [formDesc, setFormDesc] = useState('');
  const [formCourse, setFormCourse] = useState('Environmental Tech, Chemistry, Agriculture');
  const [formLevel, setFormLevel] = useState<Scholarship['eligibilityLevel']>('Masters');
  const [formCountry, setFormCountry] = useState('United Kingdom');
  const [formGpa, setFormGpa] = useState<number>(3.2);
  const [formIncome, setFormIncome] = useState('Low-income');
  const [formReqs, setFormReqs] = useState('High school report, Letter of Recommendation, Personal Statement');

  // Success message state
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Selected applicant detail view
  const [selectedApplicant, setSelectedApplicant] = useState<ScholarshipApplication | null>(null);

  // Applicant messaging panel
  const [messageText, setMessageText] = useState('');
  const [messageSuccessMsg, setMessageSuccessMsg] = useState<string | null>(null);

  // Search filter matching candidates by Name or Course
  const [searchText, setSearchText] = useState('');

  const filteredApplications = useMemo(() => {
    if (!searchText.trim()) return applications;
    const lowerSearch = searchText.toLowerCase();
    return applications.filter(app => {
      const nameMatches = app.studentName.toLowerCase().includes(lowerSearch);
      const courseMatches = app.formData.academic.intendedCourse.toLowerCase().includes(lowerSearch);
      return nameMatches || courseMatches;
    });
  }, [applications, searchText]);

  // Sponsor metric statistics calculations
  const stats = useMemo(() => {
    const totalCount = applications.length;
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
    const acceptedCount = applications.filter(a => a.status === 'Accepted').length;
    // Sum raw values
    const totalPreAlloc = scholarships.reduce((sum, s) => sum + (s.rawAmount || 0), 0); 

    return {
      totalCount,
      shortlistedCount,
      acceptedCount,
      totalPreAlloc
    };
  }, [applications, scholarships]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesc.trim() || !formAmount.trim()) {
      alert('Please fill out all mandatory terms.');
      return;
    }

    // Split requirements
    const splitReqs = formReqs.split(',').map(r => r.trim()).filter(Boolean);

    onAddScholarship({
      name: formName,
      sponsorName: formSponsor,
      amount: formAmount,
      rawAmount: formRawAmount,
      deadline: formDeadline,
      description: formDesc,
      eligibilityCourse: formCourse,
      eligibilityLevel: formLevel,
      eligibilityCountry: formCountry,
      eligibilityGpa: formGpa,
      eligibilityIncome: formIncome,
      requirements: splitReqs.length > 0 ? splitReqs : ['Proof of GPA', 'National ID Scans']
    });

    setFormName('');
    setFormDesc('');
    setSuccessBanner('Opportunity posted isomorphically! It is immediately discoverable on the Student browse page.');
    setActiveTab('listings');

    setTimeout(() => {
      setSuccessBanner(null);
    }, 7000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedApplicant) return;

    setMessageSuccessMsg(`[MESSAGING SIMULATOR] Outbox dispatch to candidate "${selectedApplicant.studentName}" via ${selectedApplicant.studentEmail}: "${messageText}" successfully compiled and sent!`);
    setMessageText('');

    setTimeout(() => {
      setMessageSuccessMsg(null);
    }, 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      
      {/* Dynamic Success Baner notification */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 bg-emerald-500 text-white rounded-full p-0.5 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Header section with toggle navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs text-violet-600 font-mono font-bold uppercase tracking-widest block">ADMINISTRATION SYSTEM</span>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight leading-none mt-1">
            University &amp; Sponsor Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review incoming student dossiers, change acceptance statuses, filter by qualifications, or configure new funding opportunities.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'applicants' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> received Applicants ({applications.length})
          </button>
          
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'listings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Active Listings ({scholarships.length})
          </button>

          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'post' ? 'bg-violet-600 text-white shadow-md shadow-violet-500/10' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Post Scholarship
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-left">
          <BarChart3 className="w-5 h-5 text-indigo-500 mb-3" />
          <div className="text-2xl font-bold text-slate-900">{stats.totalCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Applications Received</div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-3" />
          <div className="text-2xl font-bold text-slate-900">{stats.shortlistedCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Shortlisted Profiles</div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-left">
          <Award className="w-5 h-5 text-violet-500 mb-3" />
          <div className="text-2xl font-bold text-slate-900">{stats.acceptedCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Accepted Scholars</div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-left font-mono">
          <DollarSign className="w-5 h-5 text-blue-500 mb-3" />
          <div className="text-xl font-bold text-slate-900">KES {(stats.totalPreAlloc / 1000000).toFixed(1)} Million</div>
          <div className="text-[11px] text-slate-400 font-medium font-sans">Sponsorships Allocated</div>
        </div>
      </div>

      {/* Main Area based on activeTab */}
      {activeTab === 'post' && (
        <form 
          onSubmit={handlePostSubmit}
          className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-left max-w-3xl mx-auto"
        >
          <div className="pb-3 border-b border-slate-50">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1">
              <PlusCircle className="text-violet-600 w-5 h-5" /> Post New Scholarship Opportunity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add details, specify limits, requirements criteria. No student registration fee is allowed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Scholarship Title Name</label>
              <input
                type="text"
                required
                placeholder="e.g. McGill Kenya Medical bursary"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sponsor / Organization Brand</label>
              <input
                type="text"
                required
                value={formSponsor}
                onChange={(e) => setFormSponsor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Grant Value Text Representation</label>
              <input
                type="text"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Standard Close Deadline Date</label>
              <input
                type="date"
                required
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Detailed Scholarship Narrative Overview</label>
              <textarea
                rows={4}
                required
                placeholder="Describe funding cover structures, parameters and general rules..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Eligible Courses (Comma split)</label>
              <input
                type="text"
                required
                value={formCourse}
                onChange={(e) => setFormCourse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Minimum GPA required (4.0 scale)</label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="4.0"
                required
                value={formGpa}
                onChange={(e) => setFormGpa(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Degree Levels Eligibility</label>
              <select
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
              >
                <option value="Undergraduate">Undergraduate Degree</option>
                <option value="Masters">Masters Postgraduate</option>
                <option value="PhD">PhD Doctorate</option>
                <option value="Diploma">Diploma Level</option>
                <option value="Certificate">Certificate Level</option>
                <option value="All">All Education Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Target Study Location Country</label>
              <input
                type="text"
                required
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Required Documents checklists (Comma listed for Vault mapping)</label>
              <input
                type="text"
                required
                value={formReqs}
                onChange={(e) => setFormReqs(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                placeholder="e.g. Scanned Passport, Transcripts, Personal Statement Essay"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className="hover:bg-slate-50 text-slate-500 rounded-xl px-5 py-2 px-3 text-xs font-semibold"
            >
              Back to listings
            </button>
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-lg shadow-violet-500/10 active:scale-95 transition-all"
            >
              Verify &amp; Publish Scholarship
            </button>
          </div>
        </form>
      )}

      {activeTab === 'listings' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-4">
            <h3 className="font-display font-bold text-sm text-slate-900">
              Active Verified Opportunities Listed ({scholarships.length})
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
              Verified &amp; Escrow Guaranteed
            </span>
          </div>

          <div className="space-y-4">
            {scholarships.map(s => (
              <div key={s.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{s.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Value: {s.amount} | Eligible: {s.eligibilityLevel} ({s.eligibilityCountry}) | Course: {s.eligibilityCourse}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                    ID: {s.id}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                    Vetted
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applicants' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Applications list board (Left 1 or 2 Columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-left">
            <h3 className="font-display font-bold text-sm text-slate-900 pb-3 border-b border-slate-50 mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-600" /> Incoming Candidates dossier {searchText ? `(${filteredApplications.length} found)` : `(${applications.length})`}
            </h3>

            {applications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center">
                <Users className="w-10 h-10 mb-2 opacity-60" />
                <p>No student applications have been submitted yet. Go to the student simulator block to execute a live test.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search candidate filter input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter candidates by name or intended course of study..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-violet-500 rounded-xl text-xs font-sans transition-all focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 font-bold text-xs"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
                    <Search className="w-7 h-7 mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">No candidates match your search</p>
                    <p className="text-[10px] text-slate-400 mt-1">Try searching with a different name or course keyword.</p>
                    <button
                      type="button"
                      onClick={() => setSearchText('')}
                      className="mt-3 text-violet-600 hover:text-violet-700 font-bold hover:underline"
                    >
                      Clear Filter
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 space-y-3">
                    {filteredApplications.map(app => (
                      <div 
                        key={app.id} 
                        onClick={() => setSelectedApplicant(app)}
                        className={`pt-3 pb-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-4 group ${
                          selectedApplicant?.id === app.id 
                            ? 'bg-violet-50/50 border border-violet-100' 
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                              {app.studentName}
                            </h4>
                            <span className="text-[9px] text-slate-400">• GPA {app.formData.academic.gpa}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            Application for: <strong className="font-semibold text-slate-700">{app.scholarshipName}</strong>
                          </p>

                          <div className="text-[9px] text-slate-400 font-mono">
                            Intended course: {app.formData.academic.intendedCourse}
                          </div>
                        </div>

                        <div className="text-right space-y-1.5 shrink-0 flex flex-col items-end font-mono">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full block border ${
                            app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                            app.status === 'Shortlisted' ? 'bg-teal-50 text-teal-750 border-teal-150' :
                            app.status === 'Under Review' ? 'bg-slate-100 text-slate-705 border-slate-200' :
                            app.status === 'Pending Payment' ? 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse' :
                            app.status === 'Payment Processing' ? 'bg-indigo-50 text-indigo-700 border-indigo-150 font-bold' :
                            'bg-slate-50 text-slate-700 border-slate-150'
                          }`}>
                            {app.status === 'Payment Processing' ? 'Verifying Fee' : app.status}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-mono">{app.submittedDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Decision Review & Messaging Panel (Right Column) */}
          <div className="space-y-6">
                   {selectedApplicant ? (
              <div className="bg-white border border-slate-110 rounded-2xl p-5 shadow-md text-left space-y-5 animate-fade-in">
                
                {/* Applicant overview */}
                <div className="pb-3 border-b border-slate-50">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest block">ADMIN DECISION MODULE</span>
                    <button 
                      onClick={() => setSelectedApplicant(null)} 
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                  <h3 className="font-display font-bold text-sm text-slate-900 mt-1">
                    {selectedApplicant.studentName}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Email address: {selectedApplicant.studentEmail}</p>
                </div>

                {/* Registration Fee 250 Verification Widget */}
                {(selectedApplicant.status === 'Pending Payment' || selectedApplicant.status === 'Payment Processing') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                    <div className="text-xs">
                      <span className="font-bold text-amber-900">Registration Verification Badge:</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Fee: <strong>KES 250 / USD 250</strong>
                      </p>
                    </div>

                    {selectedApplicant.status === 'Pending Payment' ? (
                      <p className="text-[10px] text-amber-600 italic bg-white/70 p-1.5 rounded border border-amber-100 font-mono">
                        ⌛ Candidate has not entered their transaction code yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border border-amber-100 text-[11px] space-y-1">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Transaction Code Pasted:</span>
                          <strong className="font-mono text-emerald-700 text-xs tracking-wider select-all">{selectedApplicant.paymentTransactionCode}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAppStatus(selectedApplicant.id, 'Under Review');
                            setSelectedApplicant(prev => prev ? { ...prev, status: 'Under Review' } : null);
                            alert('Registration Verified! 250 fee has been approved. The application state is now unlocked to "Under Review".');
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer text-center"
                        >
                          ✓ Approve Payment & Unlock Profile
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Decision triggers */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Candidate Status</span>
                  
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <button
                      onClick={() => {
                        onUpdateAppStatus(selectedApplicant.id, 'Under Review');
                        // update visual item
                        setSelectedApplicant(prev => prev ? { ...prev, status: 'Under Review' } : null);
                      }}
                      className={`py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        selectedApplicant.status === 'Under Review' 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-slate-50 text-slate-605 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Reviewing
                    </button>

                    <button
                      onClick={() => {
                        onUpdateAppStatus(selectedApplicant.id, 'Shortlisted');
                        // update visual item
                        setSelectedApplicant(prev => prev ? { ...prev, status: 'Shortlisted' } : null);
                      }}
                      className={`py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        selectedApplicant.status === 'Shortlisted' 
                          ? 'bg-teal-600 text-white border-teal-700' 
                          : 'bg-slate-50 text-slate-605 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Shortlist
                    </button>

                    <button
                      onClick={() => {
                        onUpdateAppStatus(selectedApplicant.id, 'Accepted');
                        setSelectedApplicant(prev => prev ? { ...prev, status: 'Accepted' } : null);
                      }}
                      className={`py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        selectedApplicant.status === 'Accepted' 
                          ? 'bg-emerald-700 text-white border-emerald-800' 
                          : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      Accept
                    </button>
                  </div>
                </div>

                {/* Academic highlights */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 leading-normal">
                  <div className="flex justify-between border-b border-white pb-1"><span className="text-slate-500">GPA Score:</span> <strong className="text-slate-800">{selectedApplicant.formData.academic.gpa} / 4.0</strong></div>
                  <div className="flex justify-between border-b border-white pb-1"><span className="text-slate-500">Qualification:</span> <strong className="text-slate-800 truncate max-w-[130px]" title={selectedApplicant.formData.academic.schoolName}>{selectedApplicant.formData.academic.schoolName}</strong></div>
                  <div className="flex justify-between pb-1"><span className="text-slate-500">Needs Statement:</span> <span className="text-slate-700 italic text-[10px] truncate max-w-[140px]" title={selectedApplicant.formData.financial.financialNeedStatement}>{selectedApplicant.formData.financial.financialNeedStatement}</span></div>
                </div>

                {/* Linked Documents list from Vault */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Linked Document Vault Keys</span>
                  <div className="space-y-1.5">
                    {selectedApplicant.uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate" title={doc.fileName}>{doc.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Outbox candidate messaging */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Applicant</span>
                  
                  {messageSuccessMsg && (
                    <div className="bg-emerald-50 text-emerald-800 text-[9px] p-2 leading-normal rounded border border-emerald-100 font-mono mb-2">
                      {messageSuccessMsg}
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="e.g. Please send certified KCSE slip..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="bg-emerald-600 text-white rounded-lg p-2 hover:bg-emerald-700 shrink-0 self-center cursor-pointer"
                    >
                      <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=40&q=80" className="hidden" referrerPolicy="no-referrer" />
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center">
                <HelpCircle className="w-8 h-8 opacity-45 mb-2 text-slate-400" />
                <p>Select any student applicant dossier from the board to access qualification grades, check documents, shortlist or dispatch messages.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
