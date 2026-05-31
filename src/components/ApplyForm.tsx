/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scholarship, StudentDocument, ScholarshipApplication } from '../types';
import { 
  FileText, ArrowRight, ShieldCheck, Check, Info, Library, User, DollarSign, Edit, AlertCircle, Plus, Upload, Trash2, Loader2
} from 'lucide-react';

interface ApplyFormProps {
  scholarship: Scholarship;
  documents: StudentDocument[];
  onSubmit: (application: Omit<ScholarshipApplication, 'id' | 'submittedDate'>) => void;
  onCancel: () => void;
  studentEmail: string;
  studentName?: string;
  onAddDocument: (doc: Omit<StudentDocument, 'id' | 'uploadDate'>) => void;
}

export default function ApplyForm({
  scholarship,
  documents,
  onSubmit,
  onCancel,
  studentEmail,
  studentName,
  onAddDocument
}: ApplyFormProps) {
  // Current step state: 1: Personal, 2: Academic, 3: Financial, 4: Specific/Essay, 5: Docs, 6: Declaration
  const [step, setStep] = useState(1);

  // Form Field States
  const [fullName, setFullName] = useState(studentName || 'Brian J. Ono');
  const [dob, setDob] = useState('2004-03-24');
  const [nationality, setNationality] = useState('Kenyan');
  const [idNumber, setIdNumber] = useState('39281729');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('+254 712 345678');
  const [email, setEmail] = useState(studentEmail || 'brian.ono@gmail.com');
  const [address, setAddress] = useState('Nairobi, Westlands, Kileleshwa');

  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [schoolName, setSchoolName] = useState('Jomo Kenyatta University of Agriculture and Technology (JKUAT)');
  const [gpa, setGpa] = useState<number>(3.6);
  const [graduationYear, setGraduationYear] = useState('2026');
  const [intendedCourse, setIntendedCourse] = useState(scholarship.eligibilityCourse !== 'Any' ? scholarship.eligibilityCourse.split(', ')[0] : 'Master of Science in Clean Tech');
  const [preferredCountry, setPreferredCountry] = useState(scholarship.eligibilityCountry !== 'Any' ? scholarship.eligibilityCountry : 'Canada');

  const [incomeRange, setIncomeRange] = useState('Low-income (Under KES 300,000 annually)');
  const [dependents, setDependents] = useState<number>(4);
  const [financialNeedStatement, setFinancialNeedStatement] = useState(
    'I seek financial aid due to my family background. Being the eldest son of 4 raised by a single primary-school teacher, self-funding global education is impossible.'
  );

  const [whyDeserve, setWhyDeserve] = useState(
    'I have consistently maintained top grades in environmental chemistry and spearheaded community organic plastic recycling projects with youth organizations.'
  );
  const [careerGoals, setCareerGoals] = useState(
    'My ambition is to return to Kenya and install accessible clean tech frameworks to counter high carbon levels and secure groundwater in semi-arid zones.'
  );
  const [leadershipStatement, setLeadershipStatement] = useState(
    'Pioneered JKUAT Clean-up and environmental club initiative leading more than 200 youths in neighborhood restoration exercises.'
  );

  // Document attachments selections state - map of requirements to uploaded file names
  const [selectedDocs, setSelectedDocs] = useState<Record<string, string>>({});
  const [dragOverReq, setDragOverReq] = useState<string | null>(null);
  const [uploadingStatus, setUploadingStatus] = useState<Record<string, { progress: number; fileName: string }>>({});

  const handleFileChange = (req: string, file: File) => {
    // Set initial loading state
    setUploadingStatus(prev => ({
      ...prev,
      [req]: { progress: 5, fileName: file.name }
    }));
    
    // Simulate high-fidelity responsive upload progress
    let progress = 5;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadingStatus(prev => {
          const next = { ...prev };
          delete next[req];
          return next;
        });

        // Add to permanent Student Vault
        onAddDocument({
          name: req,
          type: req.toLowerCase().includes('id') || req.toLowerCase().includes('passport') ? 'national_id' : 
                req.toLowerCase().includes('transcript') || req.toLowerCase().includes('result') || req.toLowerCase().includes('kcse') ? 'transcript' : 
                req.toLowerCase().includes('cv') || req.toLowerCase().includes('resume') ? 'cv' : 'other',
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        });

        // Auto-select for this requirement
        setSelectedDocs(prev => ({
          ...prev,
          [req]: file.name
        }));
      } else {
        setUploadingStatus(prev => ({
          ...prev,
          [req]: { progress, fileName: file.name }
        }));
      }
    }, 120);
  };

  const handleDragOver = (e: React.DragEvent, req: string) => {
    e.preventDefault();
    setDragOverReq(req);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverReq(null);
  };

  const handleDrop = (e: React.DragEvent, req: string) => {
    e.preventDefault();
    setDragOverReq(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(req, e.dataTransfer.files[0]);
    }
  };

  // Declarations
  const [consentShare, setConsentShare] = useState(false);
  const [infoTrue, setInfoTrue] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Error validations state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Multi-step progression
  const nextStep = () => {
    setValidationError(null);
    if (step === 1) {
      if (!fullName.trim() || !idNumber.trim() || !phone.trim() || !email.trim()) {
        setValidationError('Please complete all required personal details before continuing.');
        return;
      }
    } else if (step === 2) {
      if (!schoolName.trim() || !intendedCourse.trim() || !gpa) {
        setValidationError('Please verify your academic parameters and intended course.');
        return;
      }
    } else if (step === 3) {
      if (!financialNeedStatement.trim()) {
        setValidationError('Your Statement of Financial Need is highly recommended for eligibility review.');
        return;
      }
    } else if (step === 4) {
      if (whyDeserve.length < 20 || careerGoals.length < 20) {
        setValidationError('Please provide more expressive text details for your career goals & merit statements.');
        return;
      }
    } else if (step === 5) {
      // Check if all needed documents for scholarship have been designated
      const docsMissing: string[] = [];
      scholarship.requirements.forEach(req => {
        if (!selectedDocs[req]) {
          docsMissing.push(req);
        }
      });
      if (docsMissing.length > 0) {
        setValidationError(`Missing required attachments: ${docsMissing.join(', ')}. Please select a file from your Document Vault or create one.`);
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setValidationError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentShare || !infoTrue || !agreeTerms) {
      setValidationError('You must accept all declarations & check boxes to complete your application.');
      return;
    }

    // Format the application submissions
    const finalUploadedDocs = Object.keys(selectedDocs).map(reqKey => ({
      docType: reqKey,
      fileName: selectedDocs[reqKey]
    }));

    onSubmit({
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      sponsorName: scholarship.sponsorName,
      amount: scholarship.amount,
      studentName: fullName,
      studentEmail: email,
      status: 'Pending Payment',
      paymentAmount: 250,
      paymentNumber: '902800',
      paymentStatus: 'unpaid',
      formData: {
        personal: { fullName, dob, nationality, idNumber, gender, phone, email, address },
        academic: { educationLevel, schoolName, gpa, graduationYear, intendedCourse, preferredCountry },
        financial: { incomeRange, dependents, financialNeedStatement },
        specific: { whyDeserve, careerGoals, leadershipStatement }
      },
      uploadedDocs: finalUploadedDocs
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Scholarship Heading Badge */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] text-emerald-650 text-emerald-600 font-bold uppercase tracking-wider">{scholarship.sponsorName}</span>
          <h2 className="font-display font-bold text-lg md:text-xl text-slate-800 leading-tight">
            Apply For: {scholarship.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Max Funding Grant: <strong className="text-slate-700 font-semibold">{scholarship.amount}</strong> | Closing: {scholarship.deadline}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-rose-600 font-semibold bg-white px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
        >
          Cancel Application
        </button>
      </div>

      {/* Progress Multi-Step Bar */}
      <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-semibold text-slate-400 mb-8 shrink-0 font-mono">
        {[
          { num: 1, label: 'Personal' },
          { num: 2, label: 'Academic' },
          { num: 3, label: 'Financial' },
          { num: 4, label: 'Essays' },
          { num: 5, label: 'Vault Files' },
          { num: 6, label: 'Confirm' }
        ].map(s => {
          const isDone = step > s.num;
          const isActive = step === s.num;

          return (
            <div key={s.num} className="space-y-2">
              <div className={`h-1 rounded-full transition-all duration-300 ${
                isDone ? 'bg-emerald-500' : isActive ? 'bg-emerald-600' : 'bg-slate-200'
              }`}></div>
              <span className={`hidden sm:inline-block ${
                isDone ? 'text-emerald-600' : isActive ? 'text-emerald-600 font-bold' : ''
              }`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error validation banner */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 text-left flex gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span className="text-xs text-rose-700 leading-normal font-medium">{validationError}</span>
        </div>
      )}

      {/* Form Content body container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-md">
        
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <User className="text-blue-600 w-5 h-5" />
              <h3 className="font-display font-bold text-base text-slate-900">1. Personal Identification Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nationality</label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">National ID / Passport Number</label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Gender Status</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Decline to states">Preferred not to state</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone Contact (with Code)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Direct Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  disabled
                  title="Contact registration remains fixed within workspace session keys"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Physical Address / Residence</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Academic Background */}
        {step === 2 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <Library className="text-blue-600 w-5 h-5" />
              <h3 className="font-display font-bold text-base text-slate-900">2. Academic Background Parameters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Current Education Qualification Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                >
                  <option value="Undergraduate">Completing Undergraduate Degree</option>
                  <option value="Masters">Completing Masters studies</option>
                  <option value="Diploma">Completing College Diploma</option>
                  <option value="Certificate">Completing Secondary/High School</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Attended/Current School Name</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Score / Cumulative CGPA (on 4.0 scale)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="4.0"
                  required
                  value={gpa}
                  onChange={(e) => setGpa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Graduation Year / Term</label>
                <input
                  type="text"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Intended Course of Study</label>
                <input
                  type="text"
                  required
                  value={intendedCourse}
                  onChange={(e) => setIntendedCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                  placeholder="e.g. Master of Engineering Science"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Preferred Destination Study Country</label>
                <input
                  type="text"
                  required
                  value={preferredCountry}
                  onChange={(e) => setPreferredCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial Information */}
        {step === 3 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <DollarSign className="text-blue-600 w-5 h-5" />
              <h3 className="font-display font-bold text-base text-slate-900">3. Household Financial Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Household Combined Income Range</label>
                <select
                  value={incomeRange}
                  onChange={(e) => setIncomeRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                >
                  <option value="Low-income (Under KES 300,000 annually)">Low-income (Under KES 300,000 / $2,500 annually)</option>
                  <option value="Middle-income (KES 300,000 to 1.2M)">Middle-income (KES 300,000 to KES 1,200,000 annually)</option>
                  <option value="High-income (Above KES 1.2M)">High-income (Above KES 1,200,000 annually)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Number of Family Dependents</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={dependents}
                  onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Statement of Financial Need (Merit / Support justification)</label>
                <textarea
                  rows={4}
                  required
                  value={financialNeedStatement}
                  onChange={(e) => setFinancialNeedStatement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed font-sans"
                  placeholder="Explain why financial sponsorship is critical for you..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Scholarship-Specific Questions */}
        {step === 4 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <Edit className="text-blue-600 w-5 h-5" />
              <h3 className="font-display font-bold text-base text-slate-900">4. Scholarship Program Merit Essays</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Why do you deserve this specific fellowship? (Describe background &amp; value)</label>
                <textarea
                  rows={3}
                  required
                  value={whyDeserve}
                  onChange={(e) => setWhyDeserve(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">What are your long-term career goals &amp; milestones?</label>
                <textarea
                  rows={3}
                  required
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Summarize any past leadership roles or community service projects</label>
                <textarea
                  rows={3}
                  required
                  value={leadershipStatement}
                  onChange={(e) => setLeadershipStatement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Document Vault Selector */}
        {step === 5 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-600 w-5 h-5" />
                <h3 className="font-display font-bold text-base text-slate-900">5. Application Document Attachments</h3>
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Secure SSL File Channel
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Sponsor administrators require high-quality copies of your academic and legal documents. Choose a certified copy already saved in your <strong>Document Vault</strong>, or directly upload new files (National ID, CV, results transcripts, certificates) below. Uploaded files automatically sync with your permanent vault repository.
            </p>

            <div className="space-y-5">
              {scholarship.requirements.map((req, index) => {
                const mappedFile = selectedDocs[req];
                const uploadActive = uploadingStatus[req];
                
                return (
                  <div key={index} className="bg-white border border-slate-150 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-50">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Requirement #{index + 1}</span>
                        <h4 className="font-bold text-xs text-slate-800">{req}</h4>
                      </div>
                      <div>
                        {mappedFile ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-150">
                            <Check className="w-3 h-3" /> Attached Successfully
                          </span>
                        ) : uploadActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-150 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading PDF...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-100">
                            ● Empty Attachment
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Main content body under header */}
                    {uploadActive ? (
                      /* Active Upload state progress bar */
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                        <div className="flex justify-between text-[11px] font-mono text-slate-600">
                          <span className="truncate">Uploading: <strong>{uploadActive.fileName}</strong></span>
                          <span>{uploadActive.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-150" 
                            style={{ width: `${uploadActive.progress}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 block font-mono">Securing transmission blocks to encrypted backend disk...</span>
                      </div>
                    ) : mappedFile ? (
                      /* File successfully attached */
                      <div className="flex items-center justify-between bg-emerald-50/20 border border-emerald-100 rounded-xl p-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-8 h-8 text-emerald-600 bg-emerald-50 p-1.5 rounded-xl shrink-0" />
                          <div className="min-w-0 text-left">
                            <h5 className="text-xs font-bold text-slate-800 truncate" title={mappedFile}>{mappedFile}</h5>
                            <span className="text-[10px] text-slate-500 font-mono">Linked Document Reference</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocs(prev => {
                              const next = { ...prev };
                              delete next[req];
                              return next;
                            });
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold bg-white border border-rose-100 hover:bg-rose-50 px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Disconnect
                        </button>
                      </div>
                    ) : (
                      /* Unattached: choices options */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                          {/* Choice A: Choose existing Vault documents */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Option A: Bind Saved Document</label>
                            <select
                              value={mappedFile || ''}
                              onChange={(e) => {
                                setSelectedDocs(prev => ({
                                  ...prev,
                                  [req]: e.target.value
                                }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-350 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                            >
                              <option value="">-- Choose from Vault --</option>
                              {documents.map(doc => (
                                <option key={doc.id} value={doc.fileName}>
                                  {doc.name} ({doc.fileName})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Choice B: Upload instant simulated template draft */}
                          <div className="space-y-1.5 flex flex-col justify-end">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Option B: Setup Fast matching</label>
                            <button
                              type="button"
                              onClick={() => {
                                const targetName = req.replace(' (3.5+ GPA)', '').replace(' / Birth Certificate', '').replace('Passport or ', '').replace('Academic ', '');
                                const mockFileStr = `${fullName.replace(/\s+/g, '_')}_${targetName.replace(/\s+/g, '_')}.pdf`;
                                setSelectedDocs(prev => ({
                                  ...prev,
                                  [req]: mockFileStr
                                }));
                              }}
                              className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                            >
                              <Plus className="w-3.5 h-3.5" /> Bind Simulated Mock Draft
                            </button>
                          </div>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div className="pt-1.5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Option C: Upload Real Local File (ID, PDF, CV, Certs)</label>
                          <div 
                            onDragOver={(e) => handleDragOver(e, req)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, req)}
                            className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                              dragOverReq === req 
                                ? 'border-indigo-500 bg-indigo-50/40 opacity-90 scale-[1.01]' 
                                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/40'
                            }`}
                          >
                            <input 
                              type="file" 
                              id={`apply-file-${index}`}
                              className="hidden" 
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileChange(req, e.target.files[0]);
                                }
                              }}
                            />
                            <label 
                              htmlFor={`apply-file-${index}`} 
                              className="cursor-pointer block space-y-1.5"
                            >
                              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700">
                                <Upload className="w-4 h-4" />
                                <span>Drag &amp; Drop or Click here to Manual Select</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Supports PDF, high-res PNG, JPG or DOC templates up to 10 MB
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {documents.length === 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <Info className="w-4.5 h-4.5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-900 mb-0.5">Your permanent Document Vault is currently empty!</h5>
                  <p className="text-[11px] text-slate-650">While you can use high-resolution local file uploads to attach document files instantly step-by-step above, you can also head to your student account dashboard core configuration panels to pre-stage papers once and reuse them infinitely.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Direct Submission & Declarations */}
        {step === 6 && (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
              <ShieldCheck className="text-emerald-600 w-5 h-5" />
              <h3 className="font-display font-bold text-base text-slate-900 font-bold text-emerald-800 bg-emerald-50/50 p-2 rounded-xl">6. Legal Consent &amp; Direct Submission</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Every detail submitted undergoes scrutiny. Under the terms of the **Kenya Data Protection Act** and international GDPR standards, your details are encrypted and transferred solely to the target institution selection board.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentShare}
                  onChange={(e) => setConsentShare(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I give consent to <strong>ABROAD SCHOLARSHIP</strong> to securely transmit my academic dossier, transcripts, and financial statements to <strong>{scholarship.sponsorName}</strong>'s review committee.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={infoTrue}
                  onChange={(e) => setInfoTrue(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I declare to the best of my knowledge that all transcripts, household income declarations, and scores provided represent accurate figures. I understand that misrepresentation cancels eligibility.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0 shrink-0 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I agree to the general student terms of service and guarantee that no agency fees or commissions will be paid relative to global fund outcomes.
                </span>
              </label>
            </div>

            {/* Simulated instant file compilation tracker wrapper */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-emerald-800">Ready for digital compilation:</span>
                <p className="text-slate-500 mt-0.5">Connected files: {Object.keys(selectedDocs).length} vault proxies.</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
          </div>
        )}

        {/* Buttons footer bar */}
        <hr className="border-slate-100 my-6" />
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl px-5 py-2.5 text-xs transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6 py-2.5 text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/15 active:scale-95 transition-all"
            >
              Continue Next <ArrowRight className="w-4.5 h-4.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 py-3.5 text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4.5 h-4.5" /> Direct Submit Application
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
