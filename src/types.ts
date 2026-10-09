export interface SubjectMark {
  id: string;
  code: string;
  name: string;
  maxMarks: number;
  minPassMarks: number;
  marksObtained: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
}

export interface StudentResult {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  isPassed: boolean;
  failedSubjects: string[];
  overallGrade: string;
  division: string;
  cgpa: number;
  remarks: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  fullName: string;
  gradeClass: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  guardianName: string;
  contactNumber: string;
  email: string;
  academicSession: string;
  examTerm: string;
  attendance: number;
  subjects: SubjectMark[];
  result: StudentResult;
  createdAt: string;
  updatedAt: string;
}

export interface CohortAnalytics {
  totalStudents: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
  averagePercentage: number;
  highestPercentage: number;
  topperStudent: Student | null;
  lowestPercentage: number;
}
