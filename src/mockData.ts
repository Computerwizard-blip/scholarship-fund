/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scholarship, StudentDocument, ScholarshipApplication } from './types';

const POSSIBLE_AMOUNTS = [5000, 10000, 20000, 25000, 30000, 40000];

const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const shuffledAmounts = shuffleArray(POSSIBLE_AMOUNTS);

export const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'schol-001',
    name: 'Canada-Africa Clean Tech Fellowship',
    sponsorName: 'Ontario Science & Education Fund',
    amount: 'Up to KES 2,500,000 / year',
    rawAmount: 2500000,
    deadline: '2026-11-12',
    description: 'A fully funded scholarship targeting African innovators in Environmental Sciences, Engineering, and Clean Technology to study at top-tier universities in Ontario, Canada. Covers tuition, health insurance, and return flight tickets.',
    eligibilityCourse: 'Environmental Science, Tech, Engineering, Agriculture',
    eligibilityLevel: 'Masters',
    eligibilityCountry: 'Canada',
    eligibilityGpa: 3.5,
    eligibilityIncome: 'Any',
    verified: true,
    requirements: ['Transcript (3.5+ GPA)', 'National ID / Passport', 'Personal Statement', 'Recommendation Letter']
  },
  {
    id: 'schol-002',
    name: 'M-PESA Foundation STEM Excellence Scholarship',
    sponsorName: 'Safaricom M-PESA Foundation',
    amount: 'Up to KES 1,200,000 / year',
    rawAmount: 1200000,
    deadline: '2026-08-30',
    description: 'Providing full-ride scholarships for talented but financially underprivileged students to undertake undergraduate studies in STEM fields at recognized public or private universities in the United Kingdom.',
    eligibilityCourse: 'Computer Science, Medicine, Engineering, Information Technology',
    eligibilityLevel: 'Undergraduate',
    eligibilityCountry: 'United Kingdom',
    eligibilityGpa: 3.0,
    eligibilityIncome: 'Low-income',
    verified: true,
    requirements: ['KCSE Certificate / Transcript', 'Proof of Financial Need', 'Passport Photo', 'National ID / Birth Certificate']
  },
  {
    id: 'schol-003',
    name: 'DAAD Germany-Africa Graduate Fellowship',
    sponsorName: 'German Academic Exchange Service (DAAD)',
    amount: 'Up to KES 1,800,000 / year',
    rawAmount: 1800000,
    deadline: '2026-10-15',
    description: 'Designed to support academic training of highly qualified postgraduates from Sub-Saharan countries in developmental or scientific disciplines. Fully covers travel-allowance, health insurance, and monthly living stipends in Germany.',
    eligibilityCourse: 'Any Development-related course, Economics, engineering, agriculture',
    eligibilityLevel: 'Masters',
    eligibilityCountry: 'Germany',
    eligibilityGpa: 3.4,
    eligibilityIncome: 'Any',
    verified: true,
    requirements: ['Academic Transcript', '2 Letters of Recommendation', 'CV', 'Research Proposal']
  },
  {
    id: 'schol-004',
    name: 'Equity Leaders Wings to Fly - University Track',
    sponsorName: 'Equity Group Foundation & MasterCard Foundation',
    amount: 'Up to KES 950,000 / year',
    rawAmount: 950000,
    deadline: '2026-10-20',
    description: 'A stellar partnership program enabling high-performing secondary school graduates from challenging financial backgrounds to transition successfully into professional programs at top-tier universities in the United Kingdom.',
    eligibilityCourse: 'Business, Tech, Medicine, Law, Arts',
    eligibilityLevel: 'Undergraduate',
    eligibilityCountry: 'United Kingdom',
    eligibilityGpa: 3.2,
    eligibilityIncome: 'Low-income',
    verified: true,
    requirements: ['KCSE Result Slip', 'Recommendation Letter from Chief / Reverend', 'Household Income Statement', 'Birth Certificate']
  },
  {
    id: 'schol-005',
    name: 'Starlight Global Leadership Grant (Columbia & Stanford Program)',
    sponsorName: 'The Starlight Trust NGO',
    amount: 'Up to KES 4,500,000 / year',
    rawAmount: 4500000,
    deadline: '2026-12-05',
    description: 'Prestigious award connecting top young scholars who demonstrate profound leadership capabilities and social impact in their communities with fully supported study in US Ivy League institutions.',
    eligibilityCourse: 'Political Science, Public Policy, Data Science, Sociology',
    eligibilityLevel: 'PhD',
    eligibilityCountry: 'United States',
    eligibilityGpa: 3.7,
    eligibilityIncome: 'Any',
    verified: true,
    requirements: ['Transcripts', 'Personal CV', '3 Recommendation Letters', 'Statement of Direct Social Impact']
  },
  {
    id: 'schol-006',
    name: 'East African Community Young Professionals Bursary',
    sponsorName: 'EAC Secretariat & Partners',
    amount: 'Up to KES 450,000',
    rawAmount: 450000,
    deadline: '2026-07-15',
    description: 'Encourages cross-border study and training among East African nations. Covers localized tuition rates and learning materials inside academic colleges in Uganda, Tanzania, Rwanda, and Burundi.',
    eligibilityCourse: 'Education, Forestry, International Relations, Law',
    eligibilityLevel: 'Diploma',
    eligibilityCountry: 'Any',
    eligibilityGpa: 2.5,
    eligibilityIncome: 'Middle-income',
    verified: true,
    requirements: ['Secondary school certificate', 'National ID', 'CV', 'Course admission slip']
  }
].map((schol, index): Scholarship => {
  const chosenAmount = shuffledAmounts[index] || 25000;
  const isYearly = schol.amount.toLowerCase().includes('year') || schol.amount.toLowerCase().includes('annual');
  const kesAmount = chosenAmount * 130; // 1 USD = 130 KES
  return {
    ...schol,
    eligibilityLevel: schol.eligibilityLevel as Scholarship['eligibilityLevel'],
    amount: `Up to $${chosenAmount.toLocaleString()} USD${isYearly ? ' / year' : ''} (KES ${kesAmount.toLocaleString()})`,
    rawAmount: kesAmount
  };
});

export const INITIAL_DOCUMENTS: StudentDocument[] = [
  {
    id: 'doc-001',
    name: 'Official High School Academic Transcript',
    type: 'transcript',
    fileName: 'Brian_JKUAT_Academic_Transcript_2025.pdf',
    uploadDate: '2026-04-10',
    fileSize: '1.4 MB'
  },
  {
    id: 'doc-002',
    name: 'National Identity Card (Scanned Colored)',
    type: 'national_id',
    fileName: 'National_ID_Brian_Ono.pdf',
    uploadDate: '2026-04-12',
    fileSize: '420 KB'
  },
  {
    id: 'doc-003',
    name: 'Personal Statement & Career Purpose',
    type: 'personal_statement',
    fileName: 'Brian_My_Environmental_Career_Essay_V2.pdf',
    uploadDate: '2026-05-15',
    fileSize: '850 KB'
  }
];

export const SUCCESS_STORIES = [
  {
    name: 'Brian Ono',
    university: 'JKUAT/McGill Canada',
    text: 'Got a full scholarship to Canada. Applied to 5 through ABROAD SCHOLARSHIP in one afternoon. All of them were checked and safe from scammers!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    programme: 'BSc. Environmental Tech',
    gender: 'male'
  },
  {
    name: 'Wanjiku Kamau',
    university: 'UoN Kenya',
    text: 'No more Facebook scam links asking for money. Got KES 800,000 Wings to Fly funding for my Masters studies without any agent fee cuts.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop',
    programme: 'MSc. Finance & Analytics',
    gender: 'female'
  },
  {
    name: 'David Kiprop',
    university: 'Technical University of Munich',
    text: 'Simplest scholarship process ever. Uploaded my transcripts and recommendation letter once in my Document Vault, and submitted directly to public German hosts.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    programme: 'PhD. Renewable Energy',
    gender: 'male'
  }
];

// Seed sample application (for Student Dashboard demonstration)
export const SEED_APPLICATIONS: ScholarshipApplication[] = [
  {
    id: 'app-101',
    scholarshipId: 'schol-003',
    scholarshipName: 'DAAD Germany-Africa Graduate Fellowship',
    sponsorName: 'German Academic Exchange Service (DAAD)',
    amount: 'Up to KES 1,800,000 / year',
    studentName: 'Brian J. Ono',
    studentEmail: 'brian.ono@gmail.com',
    status: 'Shortlisted',
    submittedDate: '2026-05-18',
    formData: {
      personal: {
        fullName: 'Brian J. Ono',
        dob: '2004-03-24',
        nationality: 'Kenyan',
        idNumber: '39281729',
        gender: 'Male',
        phone: '+254 712 345678',
        email: 'brian.ono@gmail.com',
        address: 'Nairobi, Westlands'
      },
      academic: {
        educationLevel: 'Undergraduate',
        schoolName: 'JKUAT',
        gpa: 3.6,
        graduationYear: '2026',
        intendedCourse: 'Master of Science in Development Studies',
        preferredCountry: 'Germany'
      },
      financial: {
        incomeRange: 'Low-income (Under KES 300,000 annually)',
        dependents: 4,
        financialNeedStatement: 'I am the eldest of four siblings raised by a single mother. Supporting my post-graduate studies independently is financially impossible.'
      },
      specific: {
        whyDeserve: 'I graduated top list from JKUAT and have researched sustainable water recycling frameworks.',
        careerGoals: 'To install advanced water desalination systems in semi-arid environments of Africa.',
        leadershipStatement: 'Pioneered JKUAT Clean-up and environmental club initiative leading more than 200 youths.'
      }
    },
    uploadedDocs: [
      { docType: 'transcript', fileName: 'Brian_JKUAT_Academic_Transcript_2025.pdf' },
      { docType: 'national_id', fileName: 'National_ID_Brian_Ono.pdf' }
    ]
  }
];
