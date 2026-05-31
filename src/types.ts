/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Scholarship {
  id: string;
  name: string;
  sponsorName: string;
  logoUrl?: string;
  amount: string;
  rawAmount: number;
  deadline: string; // YYYY-MM-DD
  description: string;
  eligibilityCourse: string; // e.g. "Computer Science", "Engineering", "Medicine", "Any"
  eligibilityLevel: 'Certificate' | 'Diploma' | 'Undergraduate' | 'Masters' | 'PhD' | 'All';
  eligibilityCountry: string; // "Canada", "Germany", "United States", "United Kingdom", "Australia", "Any"
  eligibilityGpa: number; // minimum GPA required
  eligibilityIncome: string; // e.g. "Any", "Low-income", "Middle-income"
  verified: boolean;
  requirements: string[];
}

export interface StudentProfile {
  name: string;
  email: string;
  nationality: string;
  gpa: number;
  educationLevel: 'Certificate' | 'Diploma' | 'Undergraduate' | 'Masters' | 'PhD';
  course: string;
  preferredCountries: string[];
  householdIncome: 'Low' | 'Medium' | 'High';
}

export interface StudentDocument {
  id: string;
  name: string;
  type: 'transcript' | 'national_id' | 'recommendation' | 'personal_statement' | 'cv' | 'other';
  fileName: string;
  uploadDate: string;
  fileSize: string;
}

export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  sponsorName: string;
  amount: string;
  studentName: string;
  studentEmail: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected' | 'Pending Payment' | 'Payment Processing';
  submittedDate: string;
  formData: {
    personal: {
      fullName: string;
      dob: string;
      nationality: string;
      idNumber: string;
      gender: string;
      phone: string;
      email: string;
      address: string;
    };
    academic: {
      educationLevel: string;
      schoolName: string;
      gpa: number;
      graduationYear: string;
      intendedCourse: string;
      preferredCountry: string;
    };
    financial: {
      incomeRange: string;
      dependents: number;
      financialNeedStatement: string;
    };
    specific: {
      whyDeserve: string;
      careerGoals: string;
      leadershipStatement: string;
    };
  };
  uploadedDocs: { docType: string; fileName: string }[];
  paymentAmount?: number;
  paymentNumber?: string;
  paymentTransactionCode?: string;
  paymentStatus?: 'unpaid' | 'pending_verification' | 'verified';
}

export interface SavedScholarship {
  scholarshipId: string;
  savedDate: string;
}

export interface SimulatedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  studentName: string;
  scholarshipName: string;
  sponsorName: string;
  amount: string;
}
