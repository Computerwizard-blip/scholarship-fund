/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SponsorPortal from './SponsorPortal';
import { 
  StudentDocument, ScholarshipApplication, Scholarship, SimulatedEmail
} from '../types';
import { 
  FileText, Upload, Trash2, Calendar, ShieldCheck, Clock, Bookmark, 
  MapPin, CheckCircle, BellRing, Sparkles, PlusCircle, CreditCard, 
  ChevronRight, Eye, Phone, Mail, Check, AlertTriangle, EyeOff, Save,
  Timer, CalendarDays, Inbox, ArrowLeft
} from 'lucide-react';

interface StudentDashboardProps {
  scholarships: Scholarship[];
  savedScholarshipIds: string[];
  onToggleSave: (id: string) => void;
  applications: ScholarshipApplication[];
  documents: StudentDocument[];
  onAddDocument: (doc: Omit<StudentDocument, 'id' | 'uploadDate'>) => void;
  onRemoveDocument: (id: string) => void;
  onApplySelect: (scholarship: Scholarship) => void;
  onNavigate: (view: string) => void;
  viewedScholarshipIds?: string[];
  onViewScholarship?: (id: string) => void;
  currentUser?: { name: string; email: string } | null;
  onUpdateAppPayment?: (appId: string, transactionCode: string) => void;
  onAddScholarship?: (scholarship: Omit<Scholarship, 'id' | 'verified'>) => void;
  onUpdateAppStatus?: (appId: string, status: ScholarshipApplication['status']) => void;
  simulatedEmails?: SimulatedEmail[];
  onClearEmails?: () => void;
}

interface AutoReminder {
  id: string;
  scholarshipId: string;
  daysBefore: number;
  channel: 'sms' | 'email' | 'both';
  contactVal: string;
  status: 'Active' | 'Delivered';
}

const MONTH_INFO: Record<string, { startDay: number; daysCount: number; name: string }> = {
  '07': { startDay: 3, daysCount: 31, name: 'July 2026' },
  '08': { startDay: 6, daysCount: 31, name: 'August 2026' },
  '09': { startDay: 2, daysCount: 30, name: 'September 2026' },
  '10': { startDay: 4, daysCount: 31, name: 'October 2026' },
  '11': { startDay: 0, daysCount: 30, name: 'November 2026' },
  '12': { startDay: 2, daysCount: 31, name: 'December 2026' },
};

export default function StudentDashboard({
  scholarships,
  savedScholarshipIds,
  onToggleSave,
  applications,
  documents,
  onAddDocument,
  onRemoveDocument,
  onApplySelect,
  onNavigate,
  viewedScholarshipIds = [],
  onViewScholarship,
  currentUser,
  onUpdateAppPayment,
  onAddScholarship,
  onUpdateAppStatus,
  simulatedEmails = [],
  onClearEmails
}: StudentDashboardProps) {
  
  const isAdmin = currentUser?.email === 'admin@abroadscholarship.org';
  // Dashboard Action Tabs State: 'vault' | 'saved' | 'calendar' | 'mailbox' | 'admin'
  const [activeTab, setActiveTab] = useState<'vault' | 'saved' | 'calendar' | 'mailbox' | 'admin'>(() => {
    return currentUser?.email === 'admin@abroadscholarship.org' ? 'admin' : 'vault';
  });

  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);

  // Payment states for transaction inputs
  const [pastedCodes, setPastedCodes] = useState<Record<string, string>>({});
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Vault/Document upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<StudentDocument['type']>('transcript');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocSize, setNewDocSize] = useState('1.2 MB');
  const [dashboardDragOver, setDashboardDragOver] = useState(false);
  const [dashboardIsUploading, setDashboardIsUploading] = useState(false);
  const [dashboardUploadProgress, setDashboardUploadProgress] = useState(0);

  // Personal Scholarship notes state loaded from local storage
  const [scholarshipNotes, setScholarshipNotes] = useState<Record<string, string>>(() => {
    const backup = localStorage.getItem('as_scholarship_notes');
    return backup ? JSON.parse(backup) : {
      'schol-001': 'Need to ask Dr. Kiprop for a strong academic recommendation letter by September.',
      'schol-002': 'Scan and upload the KCSE slip. Ask mom for the household income certificate from the Chief.'
    };
  });

  // Calendar Year states
  const [selectedMonth, setSelectedMonth] = useState<string>('08'); // default August 2026 (MPESA)
  const [selectedDayDeadlines, setSelectedDayDeadlines] = useState<Scholarship[]>([]);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);

  // Automated Alerts States
  const [activeReminderMock, setActiveReminderMock] = useState<{
    id: string;
    scholarship: Scholarship;
    daysBefore: number;
    channel: 'sms' | 'email' | 'both';
    contactVal: string;
  } | null>(null);

  const [reminders, setReminders] = useState<AutoReminder[]>(() => {
    const backup = localStorage.getItem('as_auto_reminders');
    return backup ? JSON.parse(backup) : [
      {
        id: 'rem-1',
        scholarshipId: 'schol-002', // M-PESA is August 30
        daysBefore: 3,
        channel: 'both',
        contactVal: '+254 712 345678',
        status: 'Active'
      },
      {
        id: 'rem-2',
        scholarshipId: 'schol-003', // DAAD
        daysBefore: 7,
        channel: 'email',
        contactVal: 'brian.ono@gmail.com',
        status: 'Active'
      }
    ];
  });

  const [notificationLogs, setNotificationLogs] = useState<string[]>([
    'System scheduled Canada-Africa Clean Tech automatic text notification.',
    'Safaricom SMS Gateway checked: +254 network operational.'
  ]);

  // Alert Config State
  const [formSchId, setFormSchId] = useState<string>('');
  const [formDaysBefore, setFormDaysBefore] = useState<number>(3);
  const [formChannel, setFormChannel] = useState<'sms' | 'email' | 'both'>('both');
  const [formContactVal, setFormContactVal] = useState<string>('+254 712 345678');

  // Multi-state backup sync
  useEffect(() => {
    localStorage.setItem('as_scholarship_notes', JSON.stringify(scholarshipNotes));
  }, [scholarshipNotes]);

  useEffect(() => {
    localStorage.setItem('as_auto_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Handle Note Save Event
  const handleSaveNote = (id: string, text: string) => {
    setScholarshipNotes(prev => ({
      ...prev,
      [id]: text
    }));
    alert('Personal scholarship tasks and checklist saved successfully!');
  };

  // Sync Form contact prefill
  useEffect(() => {
    if (formChannel === 'sms') {
      setFormContactVal('+254 712 345678');
    } else if (formChannel === 'email') {
      setFormContactVal('brian.ono@gmail.com');
    } else {
      setFormContactVal('+254 712 345678 / brian.ono@gmail.com');
    }
  }, [formChannel]);

  // Automatically select a scholarship in alert form if empty
  useEffect(() => {
    const list = scholarships.filter(s => savedScholarshipIds.includes(s.id) || viewedScholarshipIds.includes(s.id));
    if (list.length > 0 && !formSchId) {
      setFormSchId(list[0].id);
    }
  }, [scholarships, savedScholarshipIds, viewedScholarshipIds, formSchId]);

  // Filter lists
  const savedScholarships = scholarships.filter(s => savedScholarshipIds.includes(s.id));
  const activeAppliedIds = applications.map(a => a.scholarshipId);

  // Reusable vault upload modal form submit handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocFileName.trim()) return;

    onAddDocument({
      name: newDocName,
      type: newDocType,
      fileName: newDocFileName.endsWith('.pdf') ? newDocFileName : `${newDocFileName}.pdf`,
      fileSize: newDocSize
    });

    setNewDocName('');
    setNewDocFileName('');
    setDashboardUploadProgress(0);
    setDashboardIsUploading(false);
    setShowUploadModal(false);
  };

  const handleDashboardFileChange = (file: File) => {
    setNewDocFileName(file.name);
    // Auto populate label name from file name if empty
    if (!newDocName) {
      const cleanLabel = file.name.split('.')[0]
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setNewDocName(cleanLabel);
    }

    // Auto populate formatted size
    const sizeMB = file.size / (1024 * 1024);
    setNewDocSize(sizeMB > 0.1 ? `${sizeMB.toFixed(2)} MB` : `${(file.size / 1024).toFixed(0)} KB`);

    // Simulate animated upload progress
    setDashboardIsUploading(true);
    setDashboardUploadProgress(10);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setDashboardUploadProgress(100);
        setTimeout(() => {
          setDashboardIsUploading(false);
        }, 150);
      } else {
        setDashboardUploadProgress(progress);
      }
    }, 100);
  };

  // Create customized notification
  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSchId) return;

    const newRem: AutoReminder = {
      id: `rem-${Date.now()}`,
      scholarshipId: formSchId,
      daysBefore: Number(formDaysBefore),
      channel: formChannel,
      contactVal: formContactVal,
      status: 'Active'
    };

    setReminders(prev => [newRem, ...prev]);
    const sch = scholarships.find(s => s.id === formSchId);
    
    setNotificationLogs(prev => [
      `⏰ Configured auto-alert for "${sch?.name || 'Scholarship'}" to trigger ${formDaysBefore} days before deadline on ${sch?.deadline}.`,
      ...prev
    ]);

    alert(`Notification configured! Automated alerts will send reminders ${formDaysBefore} days before the closing date.`);
  };

  const handleRemoveReminder = (id: string, schName: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    setNotificationLogs(prev => [
      `🗑️ Removed automated alerting threshold triggers for "${schName}".`,
      ...prev
    ]);
  };

  // Simulates the automated system delivering SMS / Email notification instantly
  const handleSimulateAlert = (rem: AutoReminder) => {
    const sch = scholarships.find(s => s.id === rem.scholarshipId);
    if (!sch) return;

    setActiveReminderMock({
      id: rem.id,
      scholarship: sch,
      daysBefore: rem.daysBefore,
      channel: rem.channel,
      contactVal: rem.contactVal
    });

    setNotificationLogs(prev => [
      `⚡ [TEST TRIGGERED] Automated alerting task worker fired reminder for "${sch.name}" via [${rem.channel.toUpperCase()}] to ${rem.contactVal}.`,
      ...prev
    ]);
  };

  // Check if a document of type keyword exists in current vault
  const hasVaultDocType = (typeKeywords: string[]) => {
    return typeKeywords.some(kw => 
      documents.some(doc => 
        doc.type.toLowerCase().includes(kw.toLowerCase()) || 
        doc.name.toLowerCase().includes(kw.toLowerCase())
      )
    );
  };

  // Map calendar cells
  const calendarCells = getCalendarCells(selectedMonth);

  function getCalendarCells(monthCode: string) {
    const info = MONTH_INFO[monthCode];
    if (!info) return [];
    
    const cells: { day: number | null; dateString: string | null }[] = [];
    
    // Fill empty slots for start of month
    for (let i = 0; i < info.startDay; i++) {
      cells.push({ day: null, dateString: null });
    }
    
    // Fill actual day slots
    for (let d = 1; d <= info.daysCount; d++) {
      const dayStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        dateString: `2026-${monthCode}-${dayStr}`
      });
    }
    
    return cells;
  }

  // Handle Day cell click inside Calendar
  const handleDayClick = (dayStr: string | null, dayNum: number | null) => {
    if (!dayStr || !dayNum) return;
    setSelectedDayNum(dayNum);
    
    // Find all scholarships matching this deadline date
    const matched = scholarships.filter(s => s.deadline === dayStr);
    setSelectedDayDeadlines(matched);

    // If user clicks a day that has matching scholarships, let's also automatically trigger onView for them!
    matched.forEach(s => {
      if (onViewScholarship) onViewScholarship(s.id);
    });
  };

  // Pre-load current day state on month change
  useEffect(() => {
    setSelectedDayNum(null);
    setSelectedDayDeadlines([]);
  }, [selectedMonth]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 font-sans">
      
      {/* SUCCESS SIMULATION OVERLAY PANELS */}
      {activeReminderMock && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 text-left relative border border-slate-100 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-rose-50">
              <span className="font-bold text-xs text-indigo-700 font-mono tracking-widest uppercase flex items-center gap-1.5 leading-none">
                <Timer className="w-4 h-4 text-indigo-600 animate-bounce" /> Live Automated Server Delivery
              </span>
              <button 
                onClick={() => setActiveReminderMock(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Below is the verified automated notification delivery simulator output for network node <strong>AS-NBO-01</strong>. This reflects real-time triggers dispatched to East African student clients.
            </p>

            <div className="space-y-4 font-sans">
              {/* Phone Mock for SMS */}
              {(activeReminderMock.channel === 'sms' || activeReminderMock.channel === 'both') && (
                <div className="bg-slate-900 text-white rounded-2xl p-4.5 space-y-2 border border-slate-700 shadow-xl relative overflow-hidden">
                  <div className="absolute top-2 right-4 text-[10px] text-slate-500 font-mono">5G • Safaricom</div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold mb-1 font-mono">
                    <Phone className="w-3 h-3" /> SMS Gateway Delivery Notice
                  </div>
                  
                  <div className="bg-slate-850 bg-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 border border-slate-700/60 text-left">
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>Sender: ABROAD SCHOLARSHIP</span>
                      <span>Now</span>
                    </div>
                    <p className="font-mono text-[11px] text-emerald-300 leading-normal font-semibold">
                      "ALERT: Dear {currentUser?.name?.split(' ')[0] || "Brian"}, your saved scholarship "{activeReminderMock.scholarship.name}" is closing in {activeReminderMock.daysBefore} days! Don't miss out. Link your transcripts instantly from your secure Document Vault and apply direct. Under 100% Free guarantee!"
                    </p>
                  </div>
                </div>
              )}

              {/* Webmail Mock for Email */}
              {(activeReminderMock.channel === 'email' || activeReminderMock.channel === 'both') && (
                <div className="bg-slate-50 text-slate-800 rounded-2xl p-4 space-y-2.5 border border-slate-200 shadow-xl">
                  <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold font-mono">
                    <Mail className="w-3 h-3" /> Email Dispatch Node Verified
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-inner text-left text-xs font-sans">
                    <div className="border-b border-slate-100 pb-2 space-y-1 text-[11px]">
                      <div><span className="text-slate-400 font-medium font-sans">From:</span> <span className="font-semibold text-slate-705 text-slate-700">reminders@abroadscholarship.org</span></div>
                      <div><span className="text-slate-400 font-medium font-sans">To:</span> <span className="font-semibold text-slate-705 text-slate-700">{activeReminderMock.contactVal} ({currentUser?.name || "Brian Ono"})</span></div>
                      <div><span className="text-slate-400 font-medium">Subject:</span> <span className="font-bold text-slate-900">⏰ ABSENT-SCAM ALERT: {activeReminderMock.scholarship.name} closing in {activeReminderMock.daysBefore} Days!</span></div>
                    </div>
                    
                    <div className="space-y-2 text-[11.5px] text-slate-600 font-sans leading-relaxed font-sans">
                      <p>Dear {currentUser?.name || "Brian Ono"},</p>
                      <p>This is an automated verified reminder from the <strong>Abroad Scholarship Advisory Tool</strong>.</p>
                      <p>The closing date for <strong className="text-slate-905 text-slate-900">{activeReminderMock.scholarship.name}</strong> is fast-approaching on <strong className="underline text-slate-900">{activeReminderMock.scholarship.deadline}</strong> ({activeReminderMock.daysBefore} days remaining).</p>
                      
                      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2 text-[10px] text-blue-800">
                        <strong>Credentials Integrity Mappings:</strong> Your verified high school transcripts / passport documents are already present in your local vault. You can safely complete direct sponsor mapping in 1-Click!
                      </div>
                      
                      <p className="text-[10px] text-slate-405 text-slate-400">Apply Securely. No agent commissions. Direct university and board submission.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setActiveReminderMock(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-md shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer"
              >
                Acknowledge Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Student Command Center
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
            Welcome Back, {currentUser?.name || "Brian J. Ono"}
          </h2>
          <p className="text-slate-350 text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            You have <strong className="text-white font-bold">{applications.length} submitted active application</strong> tracking on the board, and {savedScholarshipIds.length} saved bookmarks. Link transcripts once to apply overseas securely without agent commissions.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => onNavigate('browse')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4.5 py-2 rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Discover More Matching Funds
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-4.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              + Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tabs selector */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-5 py-3 text-xs font-semibold border-b-2 tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin' ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🛡️ Admin Panel &amp; Approvals
          </button>
        )}
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-5 py-3 text-xs font-semibold border-b-2 tracking-wide transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'vault' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📁 Reusable Vault &amp; Trackers
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-3 text-xs font-semibold border-b-2 tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'saved' ? 'border-rose-500 text-rose-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ❤️ Bookmarks &amp; Checklists ({savedScholarships.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('calendar');
            setSelectedMailId(null);
          }}
          className={`px-5 py-3 text-xs font-semibold border-b-2 tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📅 Deadline Calendar &amp; Reminders ({viewedScholarshipIds.length} added)
        </button>
        <button
          onClick={() => {
            setActiveTab('mailbox');
            setSelectedMailId(null);
          }}
          className={`px-5 py-3 text-xs font-semibold border-b-2 tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'mailbox' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📧 Virtual Mailbox {simulatedEmails.filter(e => isAdmin || e.to === currentUser?.email).length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 animate-pulse">
              {simulatedEmails.filter(e => isAdmin || e.to === currentUser?.email).length}
            </span>
          )}
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB A: VAULT & ACTIVE APPLICATION TRACKING */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Active Application Tracker */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                <Clock className="w-4.5 h-4.5 text-slate-500" /> Active Application Tracking
              </h3>

              {applications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
                  <FileText className="w-10 h-10 mb-2 opacity-55" />
                  <p>You haven't submitted any applications during this session.</p>
                  <button
                    onClick={() => onNavigate('browse')}
                    className="mt-3 text-blue-600 font-semibold text-xs hover:underline cursor-pointer"
                  >
                    Browse opportunities now →
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {applications.map(app => (
                    <div key={app.id} className="border border-slate-100 rounded-xl p-4.5 hover:border-slate-250 hover:shadow-sm transition-all text-left">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wide">{app.sponsorName}</span>
                          <h4 className="font-bold text-xs md:text-sm text-slate-800 mt-0.5">{app.scholarshipName}</h4>
                        </div>
                        
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                          app.status === 'Shortlisted' ? 'bg-teal-50 text-teal-700 border border-teal-150' :
                          app.status === 'Under Review' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          app.status === 'Pending Payment' ? 'bg-amber-50 text-amber-700 border border-amber-150 animate-pulse' :
                          app.status === 'Payment Processing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                          app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                          'bg-slate-50 text-slate-700 border border-slate-150'
                        }`}>
                          • {app.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mb-4 bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                        Submitted on: <strong className="font-mono text-slate-700">{app.submittedDate}</strong> | Files Linked: <strong className="text-slate-700 font-medium">{app.uploadedDocs.map(d => d.docType).join(', ') || 'None'}</strong>
                      </p>

                      {/* Progress tracks visually */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-semibold text-slate-400 font-mono">
                        <div className="border-t-2 border-emerald-500 pt-1.5 text-emerald-600">SUBMITTED</div>
                        <div className={`border-t-2 pt-1.5 ${
                          ['Under Review', 'Shortlisted', 'Accepted'].includes(app.status) 
                            ? 'border-emerald-600 text-emerald-600' : 'border-slate-100'
                        }`}>REVIEWING</div>
                        <div className={`border-t-2 pt-1.5 ${
                          ['Shortlisted', 'Accepted'].includes(app.status) 
                            ? 'border-emerald-600 text-emerald-600 font-bold' : 'border-slate-100'
                        }`}>SHORTLIST</div>
                        <div className={`border-t-2 pt-1.5 ${
                          app.status === 'Accepted' ? 'border-emerald-600 text-emerald-600 font-bold' :
                          app.status === 'Rejected' ? 'border-rose-350 text-rose-600' : 'border-slate-100'
                        }`}>{app.status === 'Rejected' ? 'COMPLETED' : 'OFFER ISSUED'}</div>
                      </div>

                      {/* Sure-Approval Sponsorship Protocol Checklist */}
                      <div className="mt-5 border border-slate-200 rounded-xl bg-slate-50/50 p-4 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <h5 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Sure-Approval Sponsorship Protocol
                          </h5>
                          <span className="text-[9px] font-mono font-bold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200/60">
                            Guaranteed Pathway
                          </span>
                        </div>

                        <div className="space-y-4 text-left">
                          {/* Step 1 */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <span className="text-emerald-600 font-bold font-mono">1.</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Application Proxy Registration Launch</span>
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">Completed</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Bio-metrics and preferred course criteria matching submitted.</p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <span className="text-emerald-600 font-bold font-mono">2.</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Transcript Linkage & Decryption</span>
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">Completed</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Official transcripts and national identity documents securely linked.</p>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <span className="text-slate-600 font-bold font-mono">3.</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Security Fee Verification (KES 250)</span>
                                {app.status === 'Pending Payment' ? (
                                  <span className="text-[9px] bg-amber-50 text-amber-700 font-bold border border-amber-150 px-1.5 py-0.5 rounded animate-pulse">Action Required</span>
                                ) : app.status === 'Payment Processing' ? (
                                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-150 px-1.5 py-0.5 rounded animate-pulse">Verifying Logs</span>
                                ) : (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">Completed</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Sponsors require KES 250 registration verification to index files and prevent invalid query queue flooding.</p>
                              
                              {/* Integrated Fee Submission Section */}
                              {app.status === 'Pending Payment' && (
                                <div className="mt-2.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                                  <p className="text-[10px] text-amber-800 leading-normal">
                                    Transfer exactly <strong>250 KES</strong> via MPESA to activate validation logs:
                                  </p>
                                  <div className="bg-white border border-amber-150 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-[10.5px]">
                                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Official Payment Destination:</span>
                                      <span className="font-mono font-bold text-slate-800">
                                        MPESA Paybill No: <strong className="text-emerald-700 font-extrabold font-sans">902800</strong> | Acc: <strong className="text-emerald-700 font-extrabold font-sans">SCHOLARSHIP-250</strong>
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText('902800');
                                        setCopiedAppId(app.id);
                                        setTimeout(() => setCopiedAppId(null), 2500);
                                      }}
                                      className="text-[9.5px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-1 rounded transition-all shadow-sm cursor-pointer"
                                    >
                                      {copiedAppId === app.id ? '✓ Copied!' : '📋 Copy'}
                                    </button>
                                  </div>

                                  <div className="pt-1.5 border-t border-amber-200/60 space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                      Paste your receipt transaction code below (e.g. QXE82910JS):
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input
                                        type="text"
                                        value={pastedCodes[app.id] || ''}
                                        onChange={(e) => setPastedCodes(prev => ({ ...prev, [app.id]: e.target.value.toUpperCase() }))}
                                        placeholder="Enter Transaction Code"
                                        className="bg-white border border-slate-200 focus:border-emerald-600 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-800 flex-1 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const text = pastedCodes[app.id]?.trim();
                                          if (!text) {
                                            alert('Please input a valid payment transaction code first.');
                                            return;
                                          }
                                          if (onUpdateAppPayment) {
                                            onUpdateAppPayment(app.id, text);
                                          } else {
                                            alert('Payment code submitted successfully.');
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-emerald-600/10 active:scale-95 cursor-pointer text-center"
                                      >
                                        Submit Code
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {app.status === 'Payment Processing' && (
                                <div className="mt-2.5 bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-left space-y-1 animate-fade-in text-[10px]">
                                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span>Submitted to Approval Request (KES 250)</span>
                                  </div>
                                  <p className="text-slate-600 font-mono">
                                    Transaction receipt code: <span className="bg-white px-1.5 py-0.5 rounded border border-emerald-100 font-bold text-emerald-700">{app.paymentTransactionCode}</span>
                                  </p>
                                  <p className="text-slate-500">
                                    Sponsors are currently mapping your receipt with real-time MPESA database logs. Vetting profile will unlock shortly.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <span className="text-slate-600 font-bold font-mono">4.</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold ${['Pending Payment', 'Payment Processing'].includes(app.status) ? 'text-slate-400' : 'text-slate-800'}`}>Transcript Performance Audit</span>
                                {['Pending Payment', 'Payment Processing'].includes(app.status) ? (
                                  <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Locked (Step 3)</span>
                                ) : app.status === 'Under Review' ? (
                                  <span className="text-[9px] bg-amber-50 text-amber-700 font-bold border border-amber-150 px-1.5 py-0.5 rounded animate-pulse">In Review</span>
                                ) : (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">Completed</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">Sponsor committee validates GPA scores against target program criteria.</p>
                            </div>
                          </div>

                          {/* Step 5 */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <span className="text-slate-600 font-bold font-mono">5.</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold ${['Pending Payment', 'Payment Processing', 'Under Review'].includes(app.status) ? 'text-slate-400' : 'text-slate-800'}`}>SMS Interview Voucher Allocation</span>
                                {['Pending Payment', 'Payment Processing', 'Under Review'].includes(app.status) ? (
                                  <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Locked</span>
                                ) : app.status === 'Shortlisted' ? (
                                  <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded animate-pulse">Voucher Dispatched</span>
                                ) : (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">Completed</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">Automated screening systems release a high-priority voucher for direct virtual evaluation calls.</p>
                              {app.status === 'Shortlisted' && (
                                <div className="mt-2 text-[10px] p-3 bg-emerald-50 border border-emerald-150 rounded-lg space-y-1">
                                  <p className="font-bold text-emerald-800">🎉 Congratulations! Your performance logs qualify for high-priority vetting.</p>
                                  <p className="text-slate-600">
                                    Your SMS Interview Voucher Code is: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700">SMS-VOUCH-782</strong>
                                  </p>
                                  <p className="text-[9px] text-slate-500">Wait for our regional coordinator to call your registered mobile line.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Step 6 */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <span className="text-slate-600 font-bold font-mono">6.</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold ${app.status !== 'Accepted' ? 'text-slate-400' : 'text-slate-800 font-bold text-emerald-800'}`}>Direct Funds Release & Scholarship Certificate</span>
                                {app.status === 'Accepted' ? (
                                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">Released!</span>
                                ) : (
                                  <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Locked</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">Sponsorship contract generated. Funding credits dispatch straight to your recipient institution.</p>
                              {app.status === 'Accepted' && (
                                <div className="mt-2.5 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg space-y-1 text-left text-[10px]">
                                  <p className="font-extrabold text-emerald-800 flex items-center gap-1">
                                    <span>🌟</span> Official Academic Voucher Issued
                                  </p>
                                  <p className="text-slate-600">
                                    Your sponsorship is <strong>unconditionally authorized</strong> and mapped to Voucher Acc: <strong>SCH-VOU-SUCCESS</strong>.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reusable Document Vault Widget */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-4">
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-slate-500" /> Reusable Document Vault
                </h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  + Add
                </button>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal mb-4">
                Your uploaded documents are securely stored inside your local decrypted sandbox. They can be reused immediately on any application proxy without repetitive paperwork.
              </p>

              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-8 h-8 text-blue-600 bg-blue-50 p-1.5 rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate" title={doc.name}>{doc.name}</h4>
                        <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1 truncate">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Remove "${doc.name}" from your vault?`)) {
                          onRemoveDocument(doc.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                <div className="text-[9px] text-indigo-800 leading-relaxed font-semibold uppercase tracking-wide">
                  Privacy Encryption Shield
                </div>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                  Our system aligns with the General Data Protection Act and Kenya Commissioner of Data Protection principles. No third-party harvests.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB B: MY SAVED SCHOLARSHIPS AND GOALS */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
              <Bookmark className="w-4.5 h-4.5 text-rose-500" /> Bookmarked &amp; Save Goals Center
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl mb-6">
              Manage your saved scholarships, view linked files state mappings, write down personal preparation notes, and fast-apply with direct trusted server submission.
            </p>

            {savedScholarships.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-450 flex items-center justify-center text-lg mb-2 border border-slate-100">
                  ❤️
                </div>
                <h4 className="font-bold text-sm text-slate-805 mt-2">Your Saved Scholarships is Empty</h4>
                <p className="max-w-sm mx-auto text-slate-500 mt-1.5">Go to the scholarship browser and toggle the heart button on any card of interest to bookmark opportunity details here.</p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4 py-2 cursor-pointer shadow-sm transition-all"
                >
                  Browse Vetted Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedScholarships.map(s => {
                  const hasTranscript = hasVaultDocType(['transcript', 'KCSE', 'grade']);
                  const hasId = hasVaultDocType(['id', 'passport', 'national']);
                  const hasEssay = hasVaultDocType(['essay', 'statement', 'purpose']);
                  const hasRecommendation = hasVaultDocType(['recommendation', 'letter']);

                  return (
                    <div key={s.id} className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between bg-white relative shadow-sm">
                      
                      <div>
                        {/* Title and delete */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">{s.sponsorName}</span>
                            <h4 className="font-display font-bold text-sm md:text-base text-slate-900 mt-1 line-clamp-1">{s.name}</h4>
                          </div>
                          
                          <button
                            onClick={() => onToggleSave(s.id)}
                            className="bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 p-1.5 rounded-lg border border-slate-100 transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        {/* Amount & Date count */}
                        <div className="flex flex-wrap gap-3 py-1 text-[11px] text-slate-650 text-slate-600 mt-1 pb-4 border-b border-slate-50">
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-semibold text-[10.5px]">Amount: {s.amount.split(' /')[0]}</span>
                          <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-semibold text-[10.5px]">Deadline: {s.deadline}</span>
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[10.5px] font-mono">{s.eligibilityCountry}</span>
                        </div>

                        {/* Document Vault completeness checks */}
                        <div className="mt-4 space-y-2 text-xs">
                          <h5 className="font-bold text-[11px] text-slate-500 uppercase tracking-widest block">Vault Credentials Mappings:</h5>
                          
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                              <span className={hasTranscript ? 'text-emerald-600' : 'text-slate-400'}>
                                {hasTranscript ? '✓' : '○'}
                              </span>
                              <span className={hasTranscript ? 'text-slate-700 font-medium' : 'text-slate-400 hover:underline cursor-pointer'} onClick={() => { if (!hasTranscript) { setShowUploadModal(true); setNewDocName('Official Transcript'); setNewDocType('transcript'); }}}>
                                Transcripts / Grades
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                              <span className={hasId ? 'text-emerald-600' : 'text-slate-400'}>
                                {hasId ? '✓' : '○'}
                              </span>
                              <span className={hasId ? 'text-slate-705 text-slate-700 font-medium' : 'text-slate-400 hover:underline cursor-pointer'} onClick={() => { if (!hasId) { setShowUploadModal(true); setNewDocName('Passport Certificate'); setNewDocType('national_id'); }}}>
                                National ID / Scanned Passport
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                              <span className={hasEssay ? 'text-emerald-600' : 'text-slate-400'}>
                                {hasEssay ? '✓' : '○'}
                              </span>
                              <span className={hasEssay ? 'text-slate-705 text-slate-700 font-medium' : 'text-slate-400 hover:underline cursor-pointer'} onClick={() => { if (!hasEssay) { setShowUploadModal(true); setNewDocName('Personal Statement'); setNewDocType('personal_statement'); }}}>
                                Personal Statement Essay
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                              <span className={hasRecommendation ? 'text-emerald-600' : 'text-slate-400'}>
                                {hasRecommendation ? '✓' : '○'}
                              </span>
                              <span className={hasRecommendation ? 'text-slate-705 text-slate-700 font-medium' : 'text-slate-400 hover:underline cursor-pointer'} onClick={() => { if (!hasRecommendation) { setShowUploadModal(true); setNewDocName('Recommendation Letter'); setNewDocType('recommendation'); }}}>
                                Recommendation Letter
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Personal Preparation notes */}
                        <div className="mt-4.5 mt-4 space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest uppercase">Personal Checklist Notes:</label>
                          <textarea
                            placeholder="Type down required physical application stages or deadlines checklist here, e.g. certify transcripts..."
                            defaultValue={scholarshipNotes[s.id] || ''}
                            onBlur={(e) => handleSaveNote(s.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-slate-700 text-left min-h-[60px]"
                          />
                          <span className="text-[9px] text-slate-400 block text-right font-mono">Auto-saves when you click outside writing</span>
                        </div>
                      </div>

                      {/* Apply actions */}
                      <div className="pt-4.5 border-t border-slate-50 mt-5 flex gap-2 font-sans">
                        <button
                          onClick={() => {
                            setFormSchId(s.id);
                            setActiveTab('calendar');
                            setTimeout(() => document.getElementById('reminder-scheduler-card')?.scrollIntoView({ behavior: 'smooth' }), 100);
                          }}
                          className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold py-2.5 cursor-pointer leading-none"
                        >
                          ⏰ Schedule Alert
                        </button>
                        
                        {activeAppliedIds.includes(s.id) ? (
                          <span className="flex-1 text-center bg-slate-100 text-slate-500 rounded-xl text-xs font-bold py-2.5 border border-slate-205 border-slate-200">
                            ✓ Already Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => onApplySelect(s)}
                            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold py-2.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer leading-none"
                          >
                            Apply Online Now
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C: THE DEADLINE CALENDAR & AUTOMATED ALERTS CENTER */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
          
          {/* Interactive Month/Date Calendar Grid panel */}
          <div className="lg:col-span-2 bg-white border border-slate-105 border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-50 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <CalendarDays className="w-5 h-5 text-indigo-600" /> Personal Scholarship Calendar
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Vetted schedules matching your profile activities.</p>
                </div>

                {/* Month navigation slider tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-150 gap-0.5 overflow-x-auto max-w-full">
                  {Object.keys(MONTH_INFO).map(mCode => (
                    <button
                      key={mCode}
                      onClick={() => setSelectedMonth(mCode)}
                      className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                        selectedMonth === mCode 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {MONTH_INFO[mCode].name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status color scheme key */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-slate-500 pb-3">
                <span className="flex items-center gap-1 font-sans"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block font-sans"></span> 🔎 Viewed</span>
                <span className="flex items-center gap-1 font-sans"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block font-sans"></span> ❤️ Saved Bookmarks</span>
                <span className="flex items-center gap-1 font-sans"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block font-sans"></span> 📝 Applied</span>
                <span className="flex items-center gap-1 font-sans"><span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300 inline-block font-sans"></span> ✨ Available Deadlines</span>
              </div>

              {/* Grid headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 font-mono tracking-wide py-2 bg-slate-50 rounded-lg">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
              </div>

              {/* Standard calendar daily grids */}
              <div className="grid grid-cols-7 gap-1 mt-1">
                {calendarCells.map((cell, idx) => {
                  const hasDeadline = cell.dateString ? scholarships.some(s => s.deadline === cell.dateString) : false;
                  const matchedSch = cell.dateString ? scholarships.filter(s => s.deadline === cell.dateString) : [];
                  const isSelected = selectedDayNum === cell.day;

                  // Assess state coloring
                  let cellColorClass = 'bg-white text-slate-700 hover:bg-slate-50';
                  let badgeText = '';

                  if (hasDeadline && cell.dateString) {
                    const matchedApplied = matchedSch.some(s => activeAppliedIds.includes(s.id));
                    const matchedSaved = matchedSch.some(s => savedScholarshipIds.includes(s.id));
                    const matchedViewed = matchedSch.some(s => viewedScholarshipIds.includes(s.id));

                    if (matchedApplied) {
                      cellColorClass = 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-300';
                      badgeText = '📝';
                    } else if (matchedSaved) {
                      cellColorClass = 'bg-rose-500 text-white font-bold ring-2 ring-rose-200';
                      badgeText = '❤️';
                    } else if (matchedViewed) {
                      cellColorClass = 'bg-blue-500 text-white font-bold ring-2 ring-blue-200';
                      badgeText = '🔎';
                    } else {
                      // Vetted available scholarship but hasn't interacted yet!
                      cellColorClass = 'bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300';
                      badgeText = '✨';
                    }
                  }

                  if (!cell.day) {
                    return <div key={`empty-${idx}`} className="h-16 bg-slate-50/50 rounded-lg border border-transparent"></div>;
                  }

                  return (
                    <button
                      key={`day-${cell.day}`}
                      onClick={() => handleDayClick(cell.dateString, cell.day)}
                      className={`h-16 rounded-xl flex flex-col justify-between p-1.5 transition-all text-left relative focus:outline-none border border-slate-100 cursor-pointer ${cellColorClass} ${
                        isSelected ? 'scale-105 border-indigo-600 shadow-md ring-2 ring-indigo-500/20 z-10' : ''
                      }`}
                    >
                      <span className="text-[10px] font-semibold font-mono">{cell.day}</span>
                      {badgeText && (
                        <span className="text-xs uppercase self-end font-mono leading-none">{badgeText}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day preview block */}
            <div className="mt-8 border-t border-slate-100 pt-5 min-h-[140px] text-left">
              {selectedDayNum ? (
                <div>
                  <h4 className="font-bold text-xs text-slate-400 font-mono tracking-widest uppercase mb-3">
                    Selected day deadlines: {MONTH_INFO[selectedMonth].name.split(' ')[0]} {selectedDayNum}, 2026
                  </h4>
                  
                  {selectedDayDeadlines.length === 0 ? (
                    <p className="text-slate-405 text-slate-400 text-xs py-4">No active closing scholarship deadlines registered on this exact date string.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayDeadlines.map(sch => {
                        const isS = savedScholarshipIds.includes(sch.id);
                        const isA = activeAppliedIds.includes(sch.id);
                        const isV = viewedScholarshipIds.includes(sch.id);

                        return (
                          <div key={sch.id} className="border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-50">
                            <div>
                              <div className="flex gap-1.5 py-0.5 text-[9px] font-bold text-indigo-800 uppercase tracking-wide leading-none font-mono">
                                <span>{sch.sponsorName}</span>
                                <span>•</span>
                                <span className={isA ? 'text-emerald-600' : isS ? 'text-rose-600' : isV ? 'text-blue-600' : 'text-slate-500'}>
                                  {isA ? 'Applied' : isS ? 'Saved Bookmark' : isV ? 'Viewed' : 'Available'}
                                </span>
                              </div>
                              <h5 className="font-display font-bold text-xs md:text-sm text-slate-900 mt-1">{sch.name}</h5>
                              <p className="text-[10.5px] text-slate-505 text-slate-500 mt-1">Value package: <strong className="text-slate-800">{sch.amount.split(' /')[0]}</strong> | Minimum GPA: {sch.eligibilityGpa.toFixed(1)} / 4.0</p>
                            </div>

                            <div className="flex gap-2 shrink-0 self-center">
                              <button
                                onClick={() => {
                                  onNavigate('browse');
                                }}
                                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-205 border-slate-200 font-semibold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer"
                              >
                                View Listing
                              </button>
                              
                              {isA ? (
                                <span className="bg-emerald-50 text-emerald-600 text-[10.5px] font-bold px-3 py-1.5 rounded-lg border border-emerald-150">
                                  ✓ Applied
                                </span>
                              ) : (
                                <button
                                  onClick={() => onApplySelect(sch)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer"
                                >
                                  Apply Online
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center">
                  <Calendar className="w-8 h-8 opacity-40 mb-1.5" />
                  <p>Click on any highlighted calendar cell containing deadliness to inspect direct closing sponsor targets and options.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Alert Schedule & Triggers center */}
          <div className="space-y-8">
            
            {/* Form Scheduler */}
            <div id="reminder-scheduler-card" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-left font-sans">
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5 font-semibold">
                <BellRing className="w-4.5 h-4.5 text-blue-605 text-blue-500 animate-pulse" /> Configure Auto-Reminders
              </h3>

              <form onSubmit={handleCreateReminder} className="space-y-4">
                {/* Scholarship selection dropdown */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Scholarship</label>
                  <select
                    value={formSchId}
                    onChange={(e) => setFormSchId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="" disabled>-- Saved / Viewed List --</option>
                    {scholarships.map(sch => {
                      const isV = viewedScholarshipIds.includes(sch.id);
                      const isS = savedScholarshipIds.includes(sch.id);
                      if (!isV && !isS) return null;
                      return (
                        <option key={sch.id} value={sch.id}>
                          {sch.name.substring(0, 42)}... ({sch.deadline})
                        </option>
                      );
                    })}
                    {!scholarships.some(sch => viewedScholarshipIds.includes(sch.id) || savedScholarshipIds.includes(sch.id)) && (
                      <option disabled>No viewed or saved scholarships found</option>
                    )}
                  </select>
                </div>

                {/* Timing selections */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Alert Offset Timing</label>
                  <select
                    value={formDaysBefore}
                    onChange={(e) => setFormDaysBefore(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  >
                    <option value={1}>1 Day Before Closing</option>
                    <option value={3}>3 Days Before Closing</option>
                    <option value={5}>5 Days Before Closing</option>
                    <option value={7}>7 Days Before Closing</option>
                    <option value={14}>14 Days Before Closing</option>
                  </select>
                </div>

                {/* Channels select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Transmission Channel</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFormChannel('sms')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                        formChannel === 'sms' 
                          ? 'border-blue-600 bg-blue-50/55 text-blue-700' 
                          : 'border-slate-150 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      📱 SMS Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormChannel('email')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                        formChannel === 'email' 
                          ? 'border-blue-600 bg-blue-50/55 text-blue-700' 
                          : 'border-slate-150 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ✉️ Email Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormChannel('both')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                        formChannel === 'both' 
                          ? 'border-blue-600 bg-blue-50/55 text-blue-700 font-bold' 
                          : 'border-slate-150 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      🔥 Both
                    </button>
                  </div>
                </div>

                {/* Simulated Target endpoint */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Contact endpoint</label>
                  <input
                    type="text"
                    required
                    value={formContactVal}
                    onChange={(e) => setFormContactVal(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 text-slate-650 cursor-not-allowed font-mono text-left focus:outline-none"
                    title="System prefilled from registration records"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formSchId}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/10 active:scale-95 transition-all text-center cursor-pointer font-semibold uppercase tracking-wide"
                >
                  Activate Secure Auto-Reminder
                </button>
              </form>
            </div>

            {/* Configured alert thresholds lists */}
            <div className="bg-white border border-slate-105 border-slate-100 rounded-2xl p-5 shadow-sm text-left">
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-50 pb-2 mb-3">
                Active Alerts Scheduled ({reminders.length})
              </h3>

              <div className="space-y-3.5">
                {reminders.map(rem => {
                  const sch = scholarships.find(s => s.id === rem.scholarshipId);
                  if (!sch) return null;
                  
                  return (
                    <div key={rem.id} className="border border-slate-150 rounded-xl p-3 flex justify-between gap-3 hover:border-slate-200 transition-all bg-slate-50/50">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-amber-800 uppercase bg-amber-100 px-1.5 py-0.5 rounded tracking-wide inline-block leading-none">
                          {rem.channel === 'both' ? '📱 SMS & ✉️ SMTP' : rem.channel === 'sms' ? '📱 Safaricom SMS' : '✉️ Secure SMTP'}
                        </span>
                        <h4 className="font-bold text-[11px] text-slate-800 line-clamp-1 mt-1">{sch.name}</h4>
                        <p className="text-[9.5px] text-slate-500">Timing threshold: {rem.daysBefore} days before closing • <strong className="font-mono text-slate-700">{sch.deadline}</strong></p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                        <button
                          type="button"
                          onClick={() => handleSimulateAlert(rem)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-2.5 text-[9px] font-bold py-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                          title="Simulates real-time notification sending"
                        >
                          Test Trigger
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveReminder(rem.id, sch.name)}
                          className="text-[9px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer text-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {reminders.length === 0 && (
                  <p className="text-slate-400 text-xs py-2 text-center">No active scheduled notifications running.</p>
                )}
              </div>
            </div>

            {/* Notification execution logs flow console */}
            <div className="bg-slate-900 text-slate-100 p-4.5 rounded-2xl shadow-sm text-left border border-slate-800 font-mono text-[10px]">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3 text-slate-400 font-bold tracking-wider leading-none">
                <span>SIMULATED SERVER DAEMON LOGS</span>
                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="space-y-2 h-36 overflow-y-auto pr-1 text-slate-300">
                {notificationLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-l border-slate-700 pl-2">
                    <span className="text-indigo-400">[2026-05-30 UTC]</span> {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB E: VIRTUAL MAILBOX ADMISSIONS LOGS */}
      {activeTab === 'mailbox' && (() => {
        const myEmails = isAdmin 
          ? simulatedEmails 
          : simulatedEmails.filter(email => email.to === currentUser?.email);
        
        const activeMail = myEmails.find(m => m.id === selectedMailId) || myEmails[0];

        return (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-fade-in text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-amber-605 text-amber-605 text-amber-600 animate-pulse" /> Student Virtual Mailbox Service
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Live verification logs monitoring direct-from-sponsor SMTP relays. Real-time official notifications and admission letters land here.
                </p>
              </div>

              {myEmails.length > 0 && (
                <button
                  onClick={() => {
                    if (onClearEmails) onClearEmails();
                    setSelectedMailId(null);
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-center"
                >
                  Clear Inbox Cache
                </button>
              )}
            </div>

            {myEmails.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                  📧
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-sm">No admission mails yet</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    This mailbox connects directly to the sponsor decision loop. Once an administration selects and marks your application as <span className="bg-emerald-50 text-emerald-705 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-100">'Accepted'</span>, your official simulated offer confirmation will dispatch here instantly!
                  </p>
                </div>
                {isAdmin && (
                  <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 font-mono leading-normal text-center">
                    <strong>Admin Tip:</strong> Simulate this by navigating to the <em>Sponsor Panel</em>, pick any candidate and click the <strong>Accept</strong> button!
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-2xl min-h-[450px]">
                
                {/* List Side */}
                <div className="lg:col-span-1 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex flex-col max-h-[500px]">
                  <div className="p-3 bg-white border-b border-slate-100 font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Inbound Letters ({myEmails.length})
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                    {myEmails.map((email) => {
                      const isSelected = activeMail?.id === email.id;
                      return (
                        <button
                          key={email.id}
                          onClick={() => setSelectedMailId(email.id)}
                          className={`w-full text-left p-4 transition-all focus:outline-none block space-y-1.5 ${
                            isSelected 
                              ? 'bg-amber-50/50 border-l-4 border-amber-500' 
                              : 'bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-slate-800 text-xs truncate max-w-[150px]">
                              {email.sponsorName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {email.sentAt}
                            </span>
                          </div>
                          
                          <div className="text-[11.5px] font-bold text-slate-900 truncate">
                            {email.subject}
                          </div>
                          
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic font-sans">
                            {email.body.replace(/\n+/g, ' ')}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detail View Pane */}
                <div className="lg:col-span-2 border border-slate-100 rounded-2xl p-5 bg-white shadow-inner flex flex-col justify-between space-y-4 max-h-[500px] overflow-y-auto">
                  {activeMail ? (
                    <div className="space-y-4">
                      {/* Technical Header details */}
                      <div className="border-b border-slate-100 pb-3.5 space-y-1.5 font-sans">
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-100">
                            🛡️ OFFICIAL ADMISSION LETTER
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Relayed via secure-node @ {activeMail.sentAt} (UTC)
                          </span>
                        </div>
                        
                        <div className="text-xs text-slate-500 space-y-1 mt-2.5 pt-2 border-t border-slate-50">
                          <div>
                            <span className="text-slate-400 font-medium">From:</span>{" "}
                            <strong className="text-slate-755 text-slate-700">{activeMail.from}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">To:</span>{" "}
                            <strong className="text-slate-755 text-slate-700">{activeMail.to}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Recipient:</span>{" "}
                            <span className="text-slate-600 font-medium">{activeMail.studentName}</span>
                          </div>
                          <div className="pt-1.5">
                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider font-mono">Subject:</span>{" "}
                            <strong className="text-slate-900 text-xs sm:text-sm font-sans">{activeMail.subject}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Letter Body Content */}
                      <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/50 border border-slate-100/60 p-4 rounded-xl">
                        {activeMail.body.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>

                      {/* Official Stamp Vetted banner */}
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Integrity Vetted Proxy Release
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">No Scams. Vetted Funds.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-20">
                      Select an message from the left feed to view the complete official letter details.
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        );
      })()}

      {/* TAB D: ADMIN CONTROL PORTAL */}
      {activeTab === 'admin' && isAdmin && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm animate-fade-in text-left">
          <SponsorPortal
            scholarships={scholarships}
            onAddScholarship={onAddScholarship || (() => {})}
            applications={applications}
            onUpdateAppStatus={onUpdateAppStatus || (() => {})}
          />
        </div>
      )}

      {/* Reusable Document Upload Modal Simulator */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <form 
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4 text-left font-sans"
          >
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> Upload Document to Vault
            </h3>
            
            <p className="text-xs text-slate-500 leading-normal">
              Register certified copies of your identification (National ID card), high school certificates, degrees, official transcripts, recommendation files, or academic CV.
            </p>

            {/* Drag and Drop Selector Zone */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select or Drop Document File</label>
              <div 
                onDragOver={(e) => { e.preventDefault(); setDashboardDragOver(true); }}
                onDragLeave={() => setDashboardDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDashboardDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleDashboardFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                  dashboardDragOver 
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/40'
                }`}
              >
                <input 
                  type="file" 
                  id="dashboard-file-input"
                  className="hidden" 
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleDashboardFileChange(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="dashboard-file-input" className="cursor-pointer block space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600">
                    <Upload className="w-4 h-4" />
                    <span>Upload Local File</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Drag &amp; drop document, or <span className="text-blue-500 font-semibold hover:underline">browse system files</span>
                  </p>
                </label>
              </div>
            </div>

            {/* Active Analysis Bar */}
            {dashboardIsUploading && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-600">
                  <span className="truncate">Analyzing file: <strong>{newDocFileName}</strong></span>
                  <span>{dashboardUploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-100" 
                    style={{ width: `${dashboardUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Document Label Name</label>
              <input
                type="text"
                required
                placeholder="e.g., National ID Card - Kenya"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 font-sans">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Document Category Type</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850"
                >
                  <option value="transcript">Transcript File</option>
                  <option value="national_id">National ID / Passport</option>
                  <option value="personal_statement">Personal Statement / Essay</option>
                  <option value="recommendation">Recommendation Letter</option>
                  <option value="cv">Academic CV</option>
                  <option value="other">Other Certifications</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Simulated File Size</label>
                <select
                  value={newDocSize}
                  onChange={(e) => setNewDocSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                >
                  <option value="210 KB">210 KB</option>
                  <option value="850 KB">850 KB</option>
                  <option value="1.2 MB">1.2 MB</option>
                  <option value="2.8 MB">2.8 MB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Simulated File Name (PDF Target)</label>
              <input
                type="text"
                required
                placeholder="e.g. academic_transcripts_official.pdf"
                value={newDocFileName}
                onChange={(e) => setNewDocFileName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-160 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-left"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 font-sans">
              <button
                type="button"
                onClick={() => {
                  setNewDocName('');
                  setNewDocFileName('');
                  setShowUploadModal(false);
                }}
                className="hover:bg-slate-100 text-slate-500 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Save to Vault
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
