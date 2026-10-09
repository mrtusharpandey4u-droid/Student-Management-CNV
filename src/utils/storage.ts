import { Student } from '../types';
import { evaluateStudentResults } from './gradeCalculator';

export const STORAGE_KEY = 'academic_records_students_v1';

export const SAMPLE_STUDENTS: Student[] = [
  {
    id: 'stu-seed-001',
    rollNumber: 'ADM-2026-101',
    fullName: 'Ananya Sharma',
    gradeClass: 'Class 10',
    section: 'A',
    gender: 'Female',
    dob: '2010-04-15',
    guardianName: 'Rajesh Sharma',
    contactNumber: '+91 98765 43210',
    email: 'ananya.sharma@institution.edu',
    academicSession: '2025-2026',
    examTerm: 'Annual Examination',
    attendance: 96,
    ...evaluateStudentResults([
      { id: 'sub-1', code: 'ENG-101', name: 'English Core', maxMarks: 100, minPassMarks: 33, marksObtained: 94 },
      { id: 'sub-2', code: 'MTH-102', name: 'Mathematics', maxMarks: 100, minPassMarks: 33, marksObtained: 98 },
      { id: 'sub-3', code: 'SCI-103', name: 'General Science', maxMarks: 100, minPassMarks: 33, marksObtained: 92 },
      { id: 'sub-4', code: 'SST-104', name: 'Social Studies', maxMarks: 100, minPassMarks: 33, marksObtained: 89 },
      { id: 'sub-5', code: 'CSC-105', name: 'Computer Applications', maxMarks: 100, minPassMarks: 33, marksObtained: 97 },
    ]),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'stu-seed-002',
    rollNumber: 'ADM-2026-102',
    fullName: 'Aarav Patel',
    gradeClass: 'Class 10',
    section: 'A',
    gender: 'Male',
    dob: '2010-08-22',
    guardianName: 'Suresh Patel',
    contactNumber: '+91 98220 11984',
    email: 'aarav.patel@institution.edu',
    academicSession: '2025-2026',
    examTerm: 'Annual Examination',
    attendance: 91,
    ...evaluateStudentResults([
      { id: 'sub-1', code: 'ENG-101', name: 'English Core', maxMarks: 100, minPassMarks: 33, marksObtained: 82 },
      { id: 'sub-2', code: 'MTH-102', name: 'Mathematics', maxMarks: 100, minPassMarks: 33, marksObtained: 88 },
      { id: 'sub-3', code: 'SCI-103', name: 'General Science', maxMarks: 100, minPassMarks: 33, marksObtained: 79 },
      { id: 'sub-4', code: 'SST-104', name: 'Social Studies', maxMarks: 100, minPassMarks: 33, marksObtained: 81 },
      { id: 'sub-5', code: 'CSC-105', name: 'Computer Applications', maxMarks: 100, minPassMarks: 33, marksObtained: 85 },
    ]),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'stu-seed-003',
    rollNumber: 'ADM-2026-103',
    fullName: 'Priya Nair',
    gradeClass: 'Class 10',
    section: 'B',
    gender: 'Female',
    dob: '2010-02-11',
    guardianName: 'Gopal Nair',
    contactNumber: '+91 97451 22890',
    email: 'priya.nair@institution.edu',
    academicSession: '2025-2026',
    examTerm: 'Annual Examination',
    attendance: 88,
    ...evaluateStudentResults([
      { id: 'sub-1', code: 'ENG-101', name: 'English Core', maxMarks: 100, minPassMarks: 33, marksObtained: 76 },
      { id: 'sub-2', code: 'MTH-102', name: 'Mathematics', maxMarks: 100, minPassMarks: 33, marksObtained: 71 },
      { id: 'sub-3', code: 'SCI-103', name: 'General Science', maxMarks: 100, minPassMarks: 33, marksObtained: 74 },
      { id: 'sub-4', code: 'SST-104', name: 'Social Studies', maxMarks: 100, minPassMarks: 33, marksObtained: 68 },
      { id: 'sub-5', code: 'CSC-105', name: 'Computer Applications', maxMarks: 100, minPassMarks: 33, marksObtained: 78 },
    ]),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'stu-seed-004',
    rollNumber: 'ADM-2026-104',
    fullName: 'Rohan Verma',
    gradeClass: 'Class 10',
    section: 'B',
    gender: 'Male',
    dob: '2009-11-05',
    guardianName: 'Vikas Verma',
    contactNumber: '+91 99104 55678',
    email: 'rohan.verma@institution.edu',
    academicSession: '2025-2026',
    examTerm: 'Annual Examination',
    attendance: 82,
    ...evaluateStudentResults([
      { id: 'sub-1', code: 'ENG-101', name: 'English Core', maxMarks: 100, minPassMarks: 33, marksObtained: 62 },
      { id: 'sub-2', code: 'MTH-102', name: 'Mathematics', maxMarks: 100, minPassMarks: 33, marksObtained: 58 },
      { id: 'sub-3', code: 'SCI-103', name: 'General Science', maxMarks: 100, minPassMarks: 33, marksObtained: 65 },
      { id: 'sub-4', code: 'SST-104', name: 'Social Studies', maxMarks: 100, minPassMarks: 33, marksObtained: 60 },
      { id: 'sub-5', code: 'CSC-105', name: 'Computer Applications', maxMarks: 100, minPassMarks: 33, marksObtained: 66 },
    ]),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'stu-seed-005',
    rollNumber: 'ADM-2026-105',
    fullName: 'Kabir Mehta',
    gradeClass: 'Class 10',
    section: 'C',
    gender: 'Male',
    dob: '2010-06-30',
    guardianName: 'Sunil Mehta',
    contactNumber: '+91 98112 34499',
    email: 'kabir.mehta@institution.edu',
    academicSession: '2025-2026',
    examTerm: 'Annual Examination',
    attendance: 74,
    ...evaluateStudentResults([
      { id: 'sub-1', code: 'ENG-101', name: 'English Core', maxMarks: 100, minPassMarks: 33, marksObtained: 55 },
      { id: 'sub-2', code: 'MTH-102', name: 'Mathematics', maxMarks: 100, minPassMarks: 33, marksObtained: 28 }, // Failed in Math (< 33)
      { id: 'sub-3', code: 'SCI-103', name: 'General Science', maxMarks: 100, minPassMarks: 33, marksObtained: 48 },
      { id: 'sub-4', code: 'SST-104', name: 'Social Studies', maxMarks: 100, minPassMarks: 33, marksObtained: 44 },
      { id: 'sub-5', code: 'CSC-105', name: 'Computer Applications', maxMarks: 100, minPassMarks: 33, marksObtained: 51 },
    ]),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getStudentsFromLocalStorage(): Student[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // Seed initial data if first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_STUDENTS));
      return SAMPLE_STUDENTS;
    }
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load students from LocalStorage:', err);
    return [];
  }
}

export function saveStudentToLocalStorage(student: Student): Student[] {
  const current = getStudentsFromLocalStorage();
  const existingIndex = current.findIndex((s) => s.id === student.id || s.rollNumber.toLowerCase() === student.rollNumber.toLowerCase());

  let updated: Student[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = {
      ...student,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updated = [student, ...current];
  }

  // Explicitly convert student object to JSON and store in Local Storage as specified
  const jsonString = JSON.stringify(updated, null, 2);
  localStorage.setItem(STORAGE_KEY, jsonString);
  return updated;
}

export function deleteStudentFromLocalStorage(id: string): Student[] {
  const current = getStudentsFromLocalStorage();
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated, null, 2));
  return updated;
}

export function resetLocalStorageToDefault(): Student[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_STUDENTS, null, 2));
  return SAMPLE_STUDENTS;
}

export function clearLocalStorage(): Student[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([], null, 2));
  return [];
}

export function exportStudentsAsJson(): string {
  const students = getStudentsFromLocalStorage();
  return JSON.stringify(students, null, 2);
}

export function importStudentsFromJson(jsonStr: string): { success: boolean; data?: Student[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Invalid JSON format: Expected an array of student records.' };
    }
    // Verify each record has minimal essential properties
    for (const item of parsed) {
      if (!item.rollNumber || !item.fullName || !item.subjects || !item.result) {
        return { success: false, error: 'Schema mismatch: Student records must contain rollNumber, fullName, subjects, and result.' };
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed, null, 2));
    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: 'JSON parsing failed. Please verify syntax.' };
  }
}
