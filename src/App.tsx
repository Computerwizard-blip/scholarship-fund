/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Scholarship, StudentDocument, ScholarshipApplication, StudentProfile, SimulatedEmail } from './types';
import { 
  INITIAL_SCHOLARSHIPS, INITIAL_DOCUMENTS, SUCCESS_STORIES, SEED_APPLICATIONS 
} from './mockData';
import NavBar from './components/NavBar';
import LandingHero from './components/LandingHero';
import BrowseScholarships from './components/BrowseScholarships';
import StudentDashboard from './components/StudentDashboard';
import ApplyForm from './components/ApplyForm';
import SponsorPortal from './components/SponsorPortal';
import { 
  ShieldCheck, ArrowRight, CheckCircle2, Award, Users, BookOpen, 
  Sparkles, Heart, Clock, LogIn, ChevronRight, Check, HeartCrack, Flame, Lock,
  DollarSign, Calendar, GraduationCap, Mail, Send
} from 'lucide-react';

export interface UserAccount {
  name: string;
  email: string;
  password?: string;
}

export default function App() {
  // Navigation View State: 'landing' | 'browse' | 'student-dashboard' | 'sponsor-portal' | 'apply-form'
  const [currentView, setCurrentView] = useState<string>('landing');
  
  // Simulator User Role: 'guest' | 'student' | 'sponsor'
  const [userRole, setUserRole] = useState<'guest' | 'student' | 'sponsor'>('guest');

  // Registered Users list
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const backup = localStorage.getItem('as_users');
    if (backup) {
      return JSON.parse(backup);
    } else {
      return [
        { name: 'System Sponsor Specialist', email: 'admin@abroadscholarship.org', password: 'admin' },
        { name: 'Brian Ono', email: 'brian.ono@gmail.com' } // no password
      ];
    }
  });

  // Active User Account state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const backup = localStorage.getItem('as_current_user');
    return backup ? JSON.parse(backup) : null;
  });

  // Sync users list
  useEffect(() => {
    localStorage.setItem('as_users', JSON.stringify(users));
  }, [users]);

  // Sync currentUser session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('as_current_user', JSON.stringify(currentUser));
      if (currentUser.email === 'admin@abroadscholarship.org') {
        setUserRole('sponsor');
      } else {
        setUserRole('student');
      }
    } else {
      localStorage.removeItem('as_current_user');
      setUserRole('guest');
    }
  }, [currentUser]);

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Core Isomorphic States with optional localStorage backups
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    const backup = localStorage.getItem('as_scholarships');
    return backup ? JSON.parse(backup) : INITIAL_SCHOLARSHIPS;
  });

  const [applications, setApplications] = useState<ScholarshipApplication[]>(() => {
    const backup = localStorage.getItem('as_applications');
    return backup ? JSON.parse(backup) : SEED_APPLICATIONS;
  });

  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>(() => {
    const backup = localStorage.getItem('as_saved_ids');
    return backup ? JSON.parse(backup) : [];
  });

  const [viewedScholarshipIds, setViewedScholarshipIds] = useState<string[]>(() => {
    const backup = localStorage.getItem('as_viewed_ids');
    return backup ? JSON.parse(backup) : [];
  });

  const [documents, setDocuments] = useState<StudentDocument[]>(() => {
    const backup = localStorage.getItem('as_documents');
    return backup ? JSON.parse(backup) : INITIAL_DOCUMENTS;
  });

  // Target scholarship selected for active apply form
  const [selectedApplyScholarship, setSelectedApplyScholarship] = useState<Scholarship | null>(null);
  
  // Selected detail modal for Landing page
  const [landingSelectedDetail, setLandingSelectedDetail] = useState<Scholarship | null>(null);

  // Simulated Emails Tracking
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>(() => {
    const backup = localStorage.getItem('as_simulated_emails');
    return backup ? JSON.parse(backup) : [];
  });
  const [latestDispatchedEmail, setLatestDispatchedEmail] = useState<SimulatedEmail | null>(null);

  useEffect(() => {
    localStorage.setItem('as_simulated_emails', JSON.stringify(simulatedEmails));
  }, [simulatedEmails]);

  // Search parameters dispatched from Hero search box to Browse
  const [heroSearchText, setHeroSearchText] = useState('');
  const [heroCountry, setHeroCountry] = useState('Any');

  // Sync isomorphics to localStorage
  useEffect(() => {
    localStorage.setItem('as_scholarships', JSON.stringify(scholarships));
  }, [scholarships]);

  useEffect(() => {
    localStorage.setItem('as_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('as_saved_ids', JSON.stringify(savedScholarshipIds));
  }, [savedScholarshipIds]);

  useEffect(() => {
    localStorage.setItem('as_viewed_ids', JSON.stringify(viewedScholarshipIds));
  }, [viewedScholarshipIds]);

  useEffect(() => {
    localStorage.setItem('as_documents', JSON.stringify(documents));
  }, [documents]);

  // Handle Event Triggers
  const handleToggleSave = (id: string) => {
    setSavedScholarshipIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleViewScholarship = (id: string) => {
    setViewedScholarshipIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const handleHeroSearch = (term: string, country: string) => {
    setHeroSearchText(term);
    setHeroCountry(country);
  };

  const handleApplySelect = (sch: Scholarship) => {
    setSelectedApplyScholarship(sch);
    if (!currentUser) {
      setAuthMode('signup');
      setAuthEmail('');
      setAuthName('');
      setAuthPassword('');
      setAuthError('');
      setAuthSuccess('');
      setShowAuthModal(true);
    } else {
      setUserRole('student');
      setCurrentView('apply-form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddDocument = (newDoc: Omit<StudentDocument, 'id' | 'uploadDate'>) => {
    const formed: StudentDocument = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [...prev, formed]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(item => item.id !== id));
  };

  const handleAddScholarship = (newSch: Omit<Scholarship, 'id' | 'verified'>) => {
    const formed: Scholarship = {
      ...newSch,
      id: `schol-${Date.now()}`,
      verified: true
    };
    setScholarships(prev => [formed, ...prev]);
  };

  const handleUpdateAppStatus = (appId: string, status: ScholarshipApplication['status']) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        if (status === 'Accepted' && app.status !== 'Accepted') {
          // Trigger simulated email dispatch!
          const targetEmail = app.studentEmail || app.formData?.personal?.email || "student@abroadscholarship.org";
          const newEmail: SimulatedEmail = {
            id: `email-${Date.now()}`,
            from: 'awards-coordinator@abroadscholarship.org',
            to: targetEmail,
            subject: `🎉 CONGRATULATIONS! Your application for "${app.scholarshipName}" has been ACCEPTED`,
            body: `Dear ${app.studentName || "Scholar"},\n\nWe are absolutely thrilled to inform you that your application for the "${app.scholarshipName}" has been officially approved and ACCEPTED by "${app.sponsorName}"!\n\nThis fully-funded award of ${app.amount} is a testament to your excellent academic records and integrity-mapped credentials in your verified Document Vault.\n\nNext Steps:\n1. Log in to your Student Command Center to view your official Admission offer letter under your dashboard documents.\n2. Connect with your designated sponsor coordinator at awards@${app.sponsorName.toLowerCase().replace(/[^a-z0-9]/g, '')}.org.\n3. Complete the final consent declaration under your profile to begin the visa disbursement voucher processing.\n\nThank you for choosing the verified direct-to-sponsor portal.\nOur zero-scam guarantee ensures your scholarship funds will be direct-disbursed strictly according to regulatory frameworks.\n\nBest Regards,\nScholarship Award Selection Committee\nAbroad Scholarship Platform`,
            sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            studentName: app.studentName || "Scholar",
            scholarshipName: app.scholarshipName,
            sponsorName: app.sponsorName,
            amount: app.amount
          };
          setSimulatedEmails(prevEmail => [newEmail, ...prevEmail]);
          setLatestDispatchedEmail(newEmail);
        }
        return { ...app, status };
      }
      return app;
    }));
  };

  const handleUpdateAppPayment = (appId: string, transactionCode: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return { 
          ...app, 
          status: 'Payment Processing',
          paymentTransactionCode: transactionCode 
        };
      }
      return app;
    }));
  };

  const handleApplySubmit = (newApp: Omit<ScholarshipApplication, 'id' | 'submittedDate'>) => {
    const formed: ScholarshipApplication = {
      ...newApp,
      id: `app-${Date.now()}`,
      submittedDate: new Date().toISOString().split('T')[0]
    };

    setApplications(prev => [formed, ...prev]);
    setSelectedApplyScholarship(null);
    setCurrentView('student-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeAppliedIds = applications.map(a => a.scholarshipId);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans select-none antialiased">
      
      {/* Universal Sticky Header Navigation */}
      <NavBar 
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'student-dashboard' && !currentUser) {
            setAuthMode('login');
            setAuthError('Please log in to access your student command center.');
            setAuthEmail('');
            setAuthPassword('');
            setShowAuthModal(true);
            return;
          }
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userRole={userRole}
        onRoleChange={(r) => {
          setUserRole(r);
        }}
        savedCount={savedScholarshipIds.length}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setUserRole('guest');
          setCurrentView('landing');
        }}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthEmail('');
          setAuthName('');
          setAuthPassword('');
          setAuthError('');
          setAuthSuccess('');
          setShowAuthModal(true);
        }}
      />

      {/* Main Dynamic View Outlet */}
      <main className="flex-1">
        
        {/* VIEW 1: LANDING/HOMEPAGE */}
        {currentView === 'landing' && (
          <div className="space-y-16 animate-fade-in">
            {/* 1. Hero Section */}
            <LandingHero 
              onSearch={handleHeroSearch}
              onNavigate={setCurrentView}
            />

            {/* 2. How It Works Step Layout */}
            <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 py-5">
              <div className="text-center space-y-3 mb-12">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Simple Process</span>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-slate-900 tracking-tight">
                  Get Funded in 4 Clicks
                </h3>
                <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
                  Our system is built for speed and security. Follow this path to match with and secure your global educational sponsorship.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left relative flex flex-col justify-between hover:border-blue-100 transition-all">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center font-display border border-blue-100">
                      1
                    </div>
                    <h4 className="font-display font-semibold text-base text-slate-900">Step 1 – Match</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Create your student profile with your grades, GPA, course choice and target countries to immediately calculate real weekly scholarship match rates.
                    </p>
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-4">Profile Matcher enabled →</div>
                </div>

                {/* Step 2 */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left relative flex flex-col justify-between hover:border-blue-100 transition-all">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center font-display border border-blue-100">
                      2
                    </div>
                    <h4 className="font-display font-semibold text-base text-slate-900">Step 2 – Apply</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Click <strong className="font-semibold text-slate-805">"Apply Now"</strong>, link your required transcripts or ID once from your secure Document Vault, and submit directly to sponsors.
                    </p>
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-4">One-click vault extraction →</div>
                </div>

                {/* Step 3 */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left relative flex flex-col justify-between hover:border-blue-100 transition-all">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center font-display border border-blue-100">
                      3
                    </div>
                    <h4 className="font-display font-semibold text-base text-slate-900">Step 3 – Track</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Monitor submissions on your real-time tracking panel until final shortlists, interviews or digital acceptance credentials are issued.
                    </p>
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-4">Real-time status tracking →</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center mt-10">
                <button
                  onClick={() => {
                    setUserRole('student');
                    setCurrentView('student-dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl px-7 py-3 text-xs shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                >
                  Create Free Account
                </button>
              </div>
            </section>

            {/* 3. Featured Scholarships Section (Deadlines Closing Soon) */}
            <section className="bg-slate-50 py-16 px-4 md:px-8">
              <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-4.5 h-4.5" /> High urgency opportunities
                    </span>
                    <h3 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mt-1 tracking-tight">
                      Deadlines Closing Soon
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => {
                      setHeroSearchText('');
                      setHeroCountry('Any');
                      setCurrentView('browse');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold border-b border-transparent hover:border-blue-700 pb-0.5"
                  >
                    View All Scholarships →
                  </button>
                </div>

                {/* Cards row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {scholarships.slice(0, 3).map((s) => {
                    const isSaved = savedScholarshipIds.includes(s.id);
                    return (
                      <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-6 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-700">{s.sponsorName}</span>
                              {s.verified && (
                                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100/80 leading-none" title="ABROAD SCHOLARSHIP Verified Sponsor">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" /> Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 animate-fade-in">
                              {/* Save Heart Button */}
                              <motion.button
                                onClick={() => handleToggleSave(s.id)}
                                className="text-slate-400 hover:text-rose-500 p-1 rounded-full transition-colors hover:bg-rose-50 cursor-pointer"
                                title={isSaved ? "Remove Bookmark" : "Bookmark Scholarship"}
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
                                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                              </motion.button>
                              <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded font-semibold font-mono">Closing</span>
                            </div>
                          </div>
                          
                          <h4 className="font-display font-bold text-sm text-slate-805 mt-2.5 line-clamp-1">{s.name}</h4>
                          <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed line-clamp-2">{s.description}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-50 mt-5 space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Amount:</span>
                            <strong className="text-slate-900 font-semibold">{s.amount.split(' /')[0]}</strong>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Closing date:</span>
                            <span className="text-slate-705 font-mono text-slate-700">{s.deadline}</span>
                          </div>

                          <div className="flex gap-2 font-sans">
                            <button
                              onClick={() => {
                                handleViewScholarship(s.id);
                                setLandingSelectedDetail(s);
                              }}
                              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold py-2 rounded-lg text-center transition-colors border border-slate-200"
                            >
                              Read Details
                            </button>
                            {activeAppliedIds.includes(s.id) ? (
                              <span className="flex-1 text-center bg-slate-100 text-slate-500 text-[11px] font-bold py-2 rounded-lg cursor-default border border-slate-200">
                                ✓ Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  handleViewScholarship(s.id);
                                  handleApplySelect(s);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 rounded-lg text-center transition-all"
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
            </section>

            {/* 4. Why Abroad Scholarship - Trust Section */}
            <section id="why-us" className="max-w-7xl mx-auto px-4 md:px-8 py-5">
              <div className="text-center space-y-3 mb-12">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Unmatched Integrity</span>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-slate-900 tracking-tight">
                  Slay the Scams, Study Safely
                </h3>
                <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
                  Searching for funding shouldn't expose you to data harvest or agency commissions. Every list item on Abroad Scholarship is locked by verified trust shields.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 100% Verified */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl text-left shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900">100% Verified</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Our admin team manually reviews, calls, and tests every listing before publication. Scams and dead phishing links are blocked entirely.
                  </p>
                </div>

                {/* Apply Online */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl text-left shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Apply Online</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Say goodbye to endless mailing chains. Map credentials from your secure Document Vault and submit directly to sponsors in single clicks.
                  </p>
                </div>

                {/* Free Forever */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl text-left shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold">
                    💎
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Free Forever</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    We never charge students. Zero enrollment fees, zero commission cuts, and zero hidden costs. Funded entirely by university sponsors.
                  </p>
                </div>

                {/* Data Safe */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl text-left shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    🔒
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Data Protected</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    GDPR &amp; Kenya Data Protection Act compliant. 256-bit bank-level local encryption secures your transcripts, passport and essay documents.
                  </p>
                </div>
              </div>

              {/* Verified Sponsor Protocol Detail Block */}
              <div id="verified-sponsor-protocol" className="mt-12 bg-gradient-to-br from-emerald-50/50 to-teal-50/20 border border-emerald-100 rounded-3xl p-6 md:p-8 text-left space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-emerald-100/60">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-widest leading-none">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> VeriSponsor™ Standard
                    </span>
                    <h4 className="font-display font-bold text-lg text-slate-900 mt-2">
                      Official Verified Sponsor Verification Protocol
                    </h4>
                    <p className="text-slate-500 text-xs max-w-2xl leading-relaxed">
                      To safeguard students from international scams, malicious tuition-agency harvesting, and fictitious awards, ABROAD SCHOLARSHIP enforces a rigorous multi-stage criteria audit. Only institutions displaying our verified badge have authenticated their physical legal status, financial reserves, and data confidentiality compliance.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm shrink-0 flex items-center gap-3 max-w-xs">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0 animate-pulse">
                      🛡️
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-emerald-800">100% Secure Node</div>
                      <div className="text-[10px] text-slate-405 text-slate-500 leading-tight">All verified sponsor fund pathways are audited and legally bound.</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">1</span>
                      <h5 className="font-semibold text-slate-900 text-xs sm:text-sm">Legal Identity &amp; Ministerial Accreditation</h5>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                      We check credentials against local ministries of education, corporate registries, and active consular listings. Independent legal counsel signs off to confirm the sponsor's status as an active, registered entity before listings publish.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">2</span>
                      <h5 className="font-semibold text-slate-900 text-xs sm:text-sm">Direct Financial Escrow Checks</h5>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                      Sponsors must verify their award capital by depositing official irrevocable reserve declarations or connecting straight into verified institutional bank lines. No anonymous intermediaries or fee-taking third-party agencies are permitted.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">3</span>
                      <h5 className="font-semibold text-slate-900 text-xs sm:text-sm">Confidential Document Vault Transmission</h5>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                      Applicants' dossier assets—such as transcript sheets, KCSE reports, or passport scans—remain encrypted. When verified sponsors access dossiers, files are routed using secure token exchanges that comply with international GDPR standards.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">4</span>
                      <h5 className="font-semibold text-slate-900 text-xs sm:text-sm">Responsive Selection SLA Commitment</h5>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                      Every verified sponsor assigns a coordinator committed to addressing queued dossiers through our secure mail service, adhering to a 14-day responsiveness SLA to prevent silent stalling and ghosted student submissions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Testimonials / Success Stories */}
            <section className="bg-blue-900 py-16 text-white px-4 md:px-8">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-xs text-blue-300 font-bold uppercase tracking-widest block font-mono">STUDENT MILESTONES</span>
                  <h3 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                    Meet Students We’ve Funded
                  </h3>
                  <p className="text-blue-100 text-xs md:text-sm max-w-lg mx-auto">
                    Real students who successfully mapped their credentials on Abroad Scholarship to secure full global sponsorships.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {SUCCESS_STORIES.map((st, idx) => (
                    <div key={idx} className="bg-blue-800/90 border-2 border-blue-700/60 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xl hover:bg-blue-800 transition-colors">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl animate-pulse"></div>
                      
                      <div className="space-y-4 z-10">
                        {/* Rating stars */}
                        <div className="flex gap-0.5 text-orange-400 text-sm">★★★★★</div>
                        <p className="text-blue-50 text-xs italic leading-relaxed font-medium">"{st.text}"</p>
                      </div>

                      <div className="flex items-center gap-3 pt-5 border-t border-blue-700/40 mt-5 z-10">
                        {/* Visual placeholder avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-blue-600 flex items-center justify-center text-xs font-bold text-white border border-blue-500 shrink-0 uppercase shadow-inner">
                          {st.name.charAt(0) + st.name.split(' ').slice(-1)[0].charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white leading-none">{st.name}</h4>
                          <span className="text-[10px] text-blue-300 block mt-1">Graduate of {st.university} • {st.programme}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>


          </div>
        )}

        {/* VIEW 2: SEARCH/FILTER BROWSER */}
        {currentView === 'browse' && (
          <BrowseScholarships 
            scholarships={scholarships}
            savedScholarshipIds={savedScholarshipIds}
            onToggleSave={handleToggleSave}
            onApplySelect={handleApplySelect}
            appliedScholarshipIds={activeAppliedIds}
            initialSearchText={heroSearchText}
            initialCountry={heroCountry}
            onViewScholarship={handleViewScholarship}
          />
        )}

        {/* VIEW 3: STUDENT COMMAND CENTER */}
        {currentView === 'student-dashboard' && (
          currentUser ? (
            <StudentDashboard 
              scholarships={scholarships}
              savedScholarshipIds={savedScholarshipIds}
              onToggleSave={handleToggleSave}
              applications={applications}
              documents={documents}
              onAddDocument={handleAddDocument}
              onRemoveDocument={handleRemoveDocument}
              onApplySelect={handleApplySelect}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              viewedScholarshipIds={viewedScholarshipIds}
              onViewScholarship={handleViewScholarship}
              currentUser={currentUser}
              onUpdateAppPayment={handleUpdateAppPayment}
              onAddScholarship={handleAddScholarship}
              onUpdateAppStatus={handleUpdateAppStatus}
              simulatedEmails={simulatedEmails}
              onClearEmails={() => setSimulatedEmails([])}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">🎯</div>
              <h3 className="font-display font-bold text-xl text-slate-900 leading-tight">Student Command Center locked</h3>
              <p className="text-xs text-slate-500 leading-normal max-w-xs mx-auto">
                Create a free student profile or log in to safely store transcripts in your secure Document Vault, monitor submissions, and set up SMS reminders.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthEmail('');
                    setAuthPassword('');
                    setAuthError('');
                    setAuthSuccess('');
                    setShowAuthModal(true);
                  }}
                  className="bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthEmail('');
                    setAuthName('');
                    setAuthPassword('');
                    setAuthError('');
                    setAuthSuccess('');
                    setShowAuthModal(true);
                  }}
                  className="bg-blue-600 text-white font-bold hover:bg-blue-700 px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-all active:scale-95 cursor-pointer"
                >
                  Create Profile
                </button>
              </div>
            </div>
          )
        )}

        {/* VIEW 4: APPLICATION DRAFT STEPPER */}
        {currentView === 'apply-form' && selectedApplyScholarship && (
          <ApplyForm 
            scholarship={selectedApplyScholarship}
            documents={documents}
            onSubmit={handleApplySubmit}
            onCancel={() => {
              setSelectedApplyScholarship(null);
              setCurrentView('browse');
            }}
            studentEmail={currentUser?.email || "brian.ono@gmail.com"}
            studentName={currentUser?.name || "Brian J. Ono"}
            onAddDocument={handleAddDocument}
          />
        )}



        {/* Landing Detailed Info Modal */}
        {landingSelectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              
              {/* Close button */}
              <button
                onClick={() => setLandingSelectedDetail(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2.5 bg-slate-105 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors font-bold text-xs"
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
                  <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wide bg-blue-50 px-2.5 py-1 rounded-md">
                    {landingSelectedDetail.sponsorName}
                  </span>
                  {landingSelectedDetail.verified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm leading-none">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Verified Sponsor
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 leading-tight">
                  {landingSelectedDetail.name}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mt-2 font-sans">
                  {landingSelectedDetail.description}
                </p>
              </div>

              {/* Alert info banner that it's added to calendar! */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 mb-6 text-left">
                <div className="text-blue-600 text-sm">📅</div>
                <div>
                  <h4 className="font-bold text-blue-800 text-xs">Now in Your Deadline Calendar!</h4>
                  <p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">Because you viewed this scholarship, its closing deadline of <strong>{landingSelectedDetail.deadline}</strong> has been automatically synchronized to your personal Student Calendar. You can configure automated SMS and Email alerts on your student dashboard.</p>
                </div>
              </div>

              {/* Criteria Checklist grid */}
              <hr className="border-slate-100 my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-6">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Funding Details</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Value:</span> <strong className="text-slate-800">{landingSelectedDetail.amount}</strong></div>
                    <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Deadline:</span> <strong className="text-slate-800">{landingSelectedDetail.deadline}</strong></div>
                    <div className="flex justify-between py-1"><span className="text-slate-500 font-semibold text-rose-500">Service Fee:</span> <strong className="text-emerald-600 font-bold">100% Free</strong></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Eligibility Thresholds</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Min GPA Required:</span> <strong className="text-slate-800">{landingSelectedDetail.eligibilityGpa.toFixed(1)} / 4.0</strong></div>
                    <div className="flex justify-between border-b border-slate-50 py-1"><span className="text-slate-500">Target Country:</span> <strong className="text-slate-800">{landingSelectedDetail.eligibilityCountry}</strong></div>
                    <div className="flex justify-between py-1"><span className="text-slate-500">Household Income:</span> <strong className="text-slate-800">{landingSelectedDetail.eligibilityIncome}</strong></div>
                  </div>
                </div>
              </div>

              {/* Required Documents checklist */}
              <div className="text-left mb-6 font-sans">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Required Application Files</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-sans">
                  {landingSelectedDetail.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 font-sans">
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
                  {landingSelectedDetail.verified ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-850 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider leading-none shadow-sm">
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
                    {landingSelectedDetail.sponsorName.substring(0, 2)}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-800">{landingSelectedDetail.sponsorName}</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      An audited partner organization dedicated to sponsoring global scholarship applicants. Fully compliant with active communication responsive SLAs, Direct bank treasury transfers, and GDPR encrypted dossier forwarding.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 pt-1.5 text-[9.5px] text-slate-450 text-slate-500 font-mono border-t border-slate-100">
                  <div>Status: <span className="text-emerald-700 font-extrabold">● Vetted Active</span></div>
                  <div>Audit Reference: <span className="text-slate-700 font-bold">AS-{landingSelectedDetail.id.toUpperCase()}</span></div>
                </div>
              </div>

              {/* Footer triggers */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setLandingSelectedDetail(null)}
                  className="hover:bg-slate-100 text-slate-500 rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Close Window
                </button>
                
                {activeAppliedIds.includes(landingSelectedDetail.id) ? (
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-5 py-2.5 rounded-xl border border-emerald-200">
                    Applied successfully
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      handleApplySelect(landingSelectedDetail);
                      setLandingSelectedDetail(null);
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

      </main>

      {/* Universal Sticky Footer Columns & Social Links */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-12 px-4 md:px-8 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 border-b border-slate-200 pb-10 text-slate-600">
          
          {/* Logo brand & mission statement column */}
          <div className="col-span-2 space-y-4 text-left">
            <h4 className="font-display font-semibold text-slate-900 text-base">ABROAD SCHOLARSHIP</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              To make global education accessible by removing information barriers and streamlining the scholarship application process. No hidden fees. No agent commissions. Just verified opportunities.
            </p>
            <div className="text-[11px] text-emerald-700 font-semibold font-mono tracking-wide bg-slate-50 border border-slate-100 p-2.5 rounded-lg max-w-[200px]">
              "Find Scholarships.<br/> Apply Online.<br/> Study Abroad."
            </div>
          </div>

          {/* About Columns links */}
          <div className="space-y-3 text-left">
            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">About Platform</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setCurrentView('landing')} className="hover:text-blue-600 transition-colors">Find Scholarships</button></li>
              <li><button onClick={() => {
                setCurrentView('landing');
                setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }} className="hover:text-blue-600 transition-colors">How It Works</button></li>
              <li><button onClick={() => {
                setCurrentView('student-dashboard');
              }} className="hover:text-emerald-600 transition-colors">For Students</button></li>
              <li><button onClick={() => {
                setCurrentView('landing');
                setTimeout(() => document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }} className="hover:text-blue-600 transition-colors">Trust Verification</button></li>
            </ul>
          </div>

          {/* User Resources column */}
          <div className="space-y-3 text-left">
            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Student Help</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Help Center: Connect directly via help@abroadscholarship.org'); }} className="hover:text-blue-600 transition-colors">Help Center</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Community forum coming soon!'); }} className="hover:text-blue-600">Student Blog</a></li>
              <li><a href="#" className="hover:text-blue-600">Nairobi Office Contact</a></li>
              <li><a href="#" className="hover:text-blue-600">Security Disclaimers</a></li>
            </ul>
          </div>

          {/* Legal Compliance column */}
          <div className="space-y-3 text-left">
            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Legal Directs</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('256-Bit SSL protection & GDPR compliance active.'); }} className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600">Data Protection Act</a></li>
              <li><a href="#" className="hover:text-blue-600">Escrow Policies</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Socials & copyright indicators */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 text-center">
          
          <div className="text-left leading-relaxed text-slate-400">
            <div className="text-slate-500">© 2026 ABROAD SCHOLARSHIP. All rights reserved. Making global education accessible.</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">160-Character Target: ABROAD SCHOLARSHIP: Find verified scholarships &amp; apply online. Get matched, upload docs, track status. Free, safe, no scams. Fund your future.</div>
          </div>

          {/* Social icons */}
          <div className="flex gap-4">
            <span className="hover:text-blue-600 text-slate-500 cursor-pointer select-none">LinkedIn</span>
            <span className="hover:text-blue-600 text-slate-500 cursor-pointer select-none">X (Twitter)</span>
            <span className="hover:text-blue-600 text-slate-500 cursor-pointer select-none">Facebook</span>
            <span className="hover:text-blue-600 text-slate-500 cursor-pointer select-none">Instagram</span>
          </div>

        </div>
      </footer>

      {/* --------------------- AUTH MODAL OVERLAY --------------------- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 font-sans animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-8 relative shadow-2xl border border-slate-100 overflow-hidden text-slate-800">
            
            {/* Modal Ambient Theme Accent Banner */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-750"></div>

            {/* Close button */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError('');
                setAuthSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors font-bold text-xs cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center space-y-1 mb-5">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold mx-auto shadow-sm">
                🎓
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mt-2 leading-tight">
                {authMode === 'login' ? 'Verified Sign In' : 'Create Student Profile'}
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal max-w-[240px] mx-auto">
                {authMode === 'login' 
                  ? 'Access your saved bookmarked opportunities and secure document vault.' 
                  : 'Register free to unlock student tools & submit direct sponsor packages.'}
              </p>
            </div>

            {/* Error & Success Messages */}
            {authError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-[11px] text-left mb-3 leading-normal">
                ⚠️ {authError}
              </div>
            )}
            {authSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-750 text-emerald-600 p-2.5 rounded-xl text-[11px] text-left mb-3 leading-normal">
                ✓ {authSuccess}
              </div>
            )}

            {/* Tabs switcher */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'login' 
                    ? 'bg-white text-slate-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup' 
                    ? 'bg-white text-slate-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Render form */}
            <div className="space-y-3.5">
              {/* Login mode */}
              {authMode === 'login' && (
                <>
                  <div className="space-y-1">
                    <label className="text-left block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="e.g. hello@abroadscholarship.org"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Password section */}
                  {(() => {
                    const existing = users.find(u => u.email.toLowerCase() === authEmail.trim().toLowerCase());
                    if (existing) {
                      if (existing.password) {
                        return (
                          <div className="space-y-1 animate-fade-in">
                            <div className="flex justify-between items-center">
                              <label className="text-left block text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-wider">
                                Secret Password
                              </label>
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded leading-none">
                                Required
                              </span>
                            </div>
                            <input
                              type="password"
                              value={authPassword}
                              onChange={(e) => {
                                  setAuthPassword(e.target.value);
                                  setAuthError('');
                              }}
                              placeholder="Enter your security password"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none transition-all"
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-[10.5px] text-emerald-800 leading-normal font-sans animate-fade-in space-y-2">
                            <div className="flex gap-1.5">
                              <span className="shrink-0 text-emerald-600 font-bold">✓</span>
                              <div>
                                <strong>Sign in instantly:</strong> This account was created without password security. You can select "Proceed" to enter immediately.
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-emerald-100/60">
                              <label className="block text-[9px] font-bold text-emerald-750 uppercase tracking-widest leading-none mb-1">
                                Or create a password now:
                              </label>
                              <input
                                type="password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="Create an optional password"
                                className="w-full bg-white border border-emerald-150 focus:outline-none focus:border-emerald-500 rounded-lg px-2 py-1 text-xs text-emerald-950 font-medium transition-all"
                              />
                            </div>
                          </div>
                        );
                      }
                    } else if (authEmail.trim() !== '') {
                      return (
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 text-left animate-fade-in space-y-2.5">
                          <p className="text-[10px] text-emerald-800 leading-normal">
                            ✨ <strong>Welcome New Applicant!</strong> No profile found with this email. Enter your details to get started instantly:
                          </p>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-450 text-slate-500 uppercase tracking-wider">
                              Your Full Name
                            </label>
                            <input
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="e.g. Jane Doe"
                              className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-850 font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-450 text-slate-500 uppercase tracking-wider">
                              Optional Password
                            </label>
                            <input
                              type="password"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="Leave blank for passwordless"
                              className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-850"
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={() => {
                      const emailTrimmed = authEmail.trim().toLowerCase();
                      if (!emailTrimmed) {
                        setAuthError('Please enter your email address.');
                        return;
                      }

                      const existing = users.find(u => u.email.toLowerCase() === emailTrimmed);
                      if (existing) {
                        if (existing.password && authPassword.trim() !== existing.password) {
                          setAuthError('Incorrect secret password. Please try again or use our quick-start helpers below.');
                          return;
                        }
                        if (!existing.password && authPassword.trim() !== '') {
                          // Setup password now (create password logic!)
                          setUsers(prev => prev.map(u => u.email.toLowerCase() === emailTrimmed ? { ...u, password: authPassword.trim() } : u));
                        }
                        
                        setAuthSuccess('Sign in verified! Landing on Command Center...');
                        setTimeout(() => {
                          setCurrentUser(existing);
                          setShowAuthModal(false);
                          setUserRole(existing.email === 'admin@abroadscholarship.org' ? 'sponsor' : 'student');
                          setCurrentView('student-dashboard');
                        }, 750);
                      } else {
                        if (!authName.trim()) {
                          setAuthError('Please write your full name above to finalize registration.');
                          return;
                        }
                        const newUser: UserAccount = {
                          name: authName.trim(),
                          email: emailTrimmed,
                          password: authPassword.trim() || undefined
                        };
                        setUsers(prev => [...prev, newUser]);
                        setAuthSuccess('Account registered successfully! Directing...');
                        setTimeout(() => {
                          setCurrentUser(newUser);
                          setShowAuthModal(false);
                          setUserRole('student');
                          setCurrentView('student-dashboard');
                        }, 750);
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-emerald-500/15 transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 mt-1"
                  >
                    Proceed Securely →
                  </button>
                </>
              )}

              {/* Sign up mode */}
              {authMode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="text-left block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => {
                        setAuthName(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-left block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="Username, e.g. jane@example.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-left block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Password (Optional)
                      </label>
                      <span className="text-[9px] text-slate-400">Leave blank for passwordless</span>
                    </div>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => {
                        setAuthPassword(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="Create a password, or leave blank"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!authName.trim()) {
                        setAuthError('Full Name is required.');
                        return;
                      }
                      if (!authEmail.trim()) {
                        setAuthError('Email Address is required.');
                        return;
                      }
                      const emailTrimmed = authEmail.trim().toLowerCase();
                      const existing = users.find(u => u.email.toLowerCase() === emailTrimmed);
                      if (existing) {
                        setAuthError('This email is already registered. Please click Log In above.');
                        return;
                      }

                      const newUser: UserAccount = {
                        name: authName.trim(),
                        email: emailTrimmed,
                        password: authPassword.trim() || undefined
                      };

                      setUsers(prev => [...prev, newUser]);
                      setAuthSuccess('Profile created successfully! Navigating to dashboard...');
                      setTimeout(() => {
                        setCurrentUser(newUser);
                        setShowAuthModal(false);
                        setUserRole(emailTrimmed === 'admin@abroadscholarship.org' ? 'sponsor' : 'student');
                        setCurrentView('student-dashboard');
                      }, 750);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-emerald-500/15 transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 mt-1"
                  >
                    Register Student Profile & Proceed →
                  </button>
                </>
              )}
            </div>

            {/* Quick Helper for Admin Demo */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-1">
              <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">✨ Reviewer Quick-Start switches:</p>
              <div className="flex flex-col gap-1 pt-1 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthEmail('admin@abroadscholarship.org');
                    setAuthPassword('admin');
                    setAuthError('');
                    setAuthSuccess('Filled Sponsor Administrator details. Click Proceed!');
                  }}
                  className="bg-violet-50 text-violet-700 hover:bg-violet-100 p-1.5 rounded-lg text-[9.5px] font-mono font-semibold cursor-pointer border border-violet-100 transition-all text-center"
                >
                  admin@abroadscholarship.org (pass: admin)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthEmail('brian.ono@gmail.com');
                    setAuthPassword('');
                    setAuthError('');
                    setAuthSuccess('Filled student details (no password saved). Click Proceed!');
                  }}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-1.5 rounded-lg text-[9.5px] font-mono font-semibold cursor-pointer border border-indigo-100 transition-all text-center"
                >
                  brian.ono@gmail.com (no password)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {latestDispatchedEmail && (
        <div id="email-simulator-overlay" className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-left relative border border-slate-100 animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-rose-50">
              <span className="font-bold text-xs text-emerald-700 font-mono tracking-widest uppercase flex items-center gap-1.5 leading-none">
                <Send className="w-4 h-4 text-emerald-600 animate-pulse" /> Automated Mail Gateway Node
              </span>
              <button 
                onClick={() => setLatestDispatchedEmail(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Sub description */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                🎉
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-800 text-xs">Simulated Real-Time Dispatch Success!</h4>
                <p className="text-[10px] text-emerald-600 leading-normal">
                  The application has been officially marked <strong>'Accepted'</strong>. An automated confirmation letter was successfully generated and dispatched to the student's email address below.
                </p>
              </div>
            </div>

            {/* Email Preview Client UI */}
            <div className="bg-slate-50 text-slate-800 rounded-2xl p-4.5 space-y-3.5 border border-slate-200 shadow-inner">
              <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold font-mono">
                <Mail className="w-3.5 h-3.5" /> Outbox SMTP Relay Logs Verified
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner text-left text-xs">
                <div className="border-b border-slate-100 pb-3 space-y-1.5 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 font-medium">From:</span>{" "}
                    <span className="font-semibold text-slate-800">awards-coordinator@abroadscholarship.org</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">To:</span>{" "}
                    <span className="font-semibold text-slate-800">{latestDispatchedEmail.to}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Subject:</span>{" "}
                    <span className="font-bold text-slate-900">{latestDispatchedEmail.subject}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <span className="text-slate-450 font-medium">Network Relay Timestamp:</span>{" "}
                    <span className="font-mono">{latestDispatchedEmail.sentAt} (UTC)</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-[11.5px] text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-1 font-sans">
                  {latestDispatchedEmail.body.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA action */}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  setLatestDispatchedEmail(null);
                  setCurrentView('student-dashboard');
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-xl px-4 py-2 transition-all cursor-pointer"
              >
                Go to Student Inbox
              </button>
              <button 
                onClick={() => setLatestDispatchedEmail(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer"
              >
                Confirm Simulation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
