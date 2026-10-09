import { SubjectMark, StudentResult } from '../types';

export const DEFAULT_SUBJECTS_TEMPLATE = [
  { code: 'ENG-101', name: 'English Core', maxMarks: 100, minPassMarks: 33 },
  { code: 'MTH-102', name: 'Mathematics', maxMarks: 100, minPassMarks: 33 },
  { code: 'SCI-103', name: 'General Science', maxMarks: 100, minPassMarks: 33 },
  { code: 'SST-104', name: 'Social Studies', maxMarks: 100, minPassMarks: 33 },
  { code: 'CSC-105', name: 'Computer Applications', maxMarks: 100, minPassMarks: 33 },
];

export function calculateSubjectGrade(marks: number, maxMarks: number): { grade: string; gradePoint: number } {
  if (maxMarks <= 0) return { grade: 'F', gradePoint: 0 };
  const pct = (marks / maxMarks) * 100;

  if (pct >= 90) return { grade: 'A+', gradePoint: 10.0 };
  if (pct >= 80) return { grade: 'A', gradePoint: 9.0 };
  if (pct >= 70) return { grade: 'B', gradePoint: 8.0 };
  if (pct >= 60) return { grade: 'C', gradePoint: 7.0 };
  if (pct >= 50) return { grade: 'D', gradePoint: 6.0 };
  if (pct >= 33) return { grade: 'E', gradePoint: 4.0 };
  return { grade: 'F', gradePoint: 0.0 };
}

export function evaluateStudentResults(subjects: {
  id: string;
  code: string;
  name: string;
  maxMarks: number;
  minPassMarks: number;
  marksObtained: number;
}[]): { subjects: SubjectMark[]; result: StudentResult } {
  let totalObtained = 0;
  let totalMax = 0;
  const failedSubjects: string[] = [];

  const evaluatedSubjects: SubjectMark[] = subjects.map((sub) => {
    const marks = Number(sub.marksObtained) || 0;
    const max = Number(sub.maxMarks) || 100;
    const minPass = Number(sub.minPassMarks) || 33;
    const { grade, gradePoint } = calculateSubjectGrade(marks, max);
    const isPassed = marks >= minPass;

    if (!isPassed) {
      failedSubjects.push(sub.name);
    }

    totalObtained += marks;
    totalMax += max;

    return {
      ...sub,
      marksObtained: marks,
      maxMarks: max,
      minPassMarks: minPass,
      grade,
      gradePoint,
      isPassed,
    };
  });

  const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
  const isPassed = failedSubjects.length === 0 && evaluatedSubjects.length > 0;

  let overallGrade = 'F';
  if (isPassed) {
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B';
    else if (percentage >= 60) overallGrade = 'C';
    else if (percentage >= 50) overallGrade = 'D';
    else if (percentage >= 33) overallGrade = 'E';
  }

  let division = 'Essential Repeat';
  if (isPassed) {
    if (percentage >= 75) division = 'First Division (Distinction)';
    else if (percentage >= 60) division = 'First Division';
    else if (percentage >= 50) division = 'Second Division';
    else division = 'Third Division';
  } else if (failedSubjects.length === 1) {
    division = `Eligible for Compartment (${failedSubjects[0]})`;
  }

  const totalGradePoints = evaluatedSubjects.reduce((acc, curr) => acc + curr.gradePoint, 0);
  const cgpa = evaluatedSubjects.length > 0 ? Number((totalGradePoints / evaluatedSubjects.length).toFixed(2)) : 0;

  let remarks = '';
  if (isPassed) {
    if (percentage >= 90) {
      remarks = 'Outstanding scholastic excellence. Commended for exemplary academic achievement.';
    } else if (percentage >= 75) {
      remarks = 'Very good academic performance. Demonstrates strong analytical competence.';
    } else if (percentage >= 60) {
      remarks = 'Consistent and satisfactory progress. Encouraged to aim for distinction.';
    } else {
      remarks = 'Passing standard met. Advised additional focus in core conceptual topics.';
    }
  } else {
    remarks = `Requires mandatory re-examination in: ${failedSubjects.join(', ')}. Supplemental tutoring advised.`;
  }

  return {
    subjects: evaluatedSubjects,
    result: {
      totalObtained,
      totalMax,
      percentage,
      isPassed,
      failedSubjects,
      overallGrade,
      division,
      cgpa,
      remarks,
    },
  };
}
