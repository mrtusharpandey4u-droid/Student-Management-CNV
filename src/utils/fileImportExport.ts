import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as pdfjsLib from 'pdfjs-dist';
import { Student, SubjectMark } from '../types';
import { evaluateStudentResults, DEFAULT_SUBJECTS_TEMPLATE } from './gradeCalculator';
import { saveStudentToLocalStorage } from './storage';

// Configure pdfjs worker
try {
  // Use unpkg CDN or cdnjs for the worker script matching the installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker initialization warning:', e);
}

// -------------------------------------------------------------
// 1. EXCEL / CSV EXPORT
// -------------------------------------------------------------

export function exportToExcel(students: Student[], filename = 'academic_results_cohort.xlsx') {
  // Construct detailed tabular dataset
  const rows = students.map((s, index) => {
    const rowObj: Record<string, string | number> = {
      'S.No': index + 1,
      'Roll Number': s.rollNumber,
      'Full Name': s.fullName,
      'Class': s.gradeClass,
      'Section': s.section,
      'Gender': s.gender,
      'Guardian Name': s.guardianName,
      'Contact': s.contactNumber || '—',
      'Email': s.email || '—',
      'Attendance %': s.attendance,
    };

    // Subject marks columns
    s.subjects.forEach((sub) => {
      rowObj[`${sub.name} (${sub.maxMarks})`] = sub.marksObtained;
    });

    rowObj['Total Marks'] = `${s.result.totalObtained} / ${s.result.totalMax}`;
    rowObj['Percentage (%)'] = s.result.percentage;
    rowObj['Status'] = s.result.isPassed ? 'PASS' : 'FAIL';
    rowObj['Letter Grade'] = s.result.overallGrade;
    rowObj['Division'] = s.result.division;
    rowObj['CGPA'] = s.result.cgpa;

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Results');

  XLSX.writeFile(workbook, filename);
}

export function downloadSampleExcelTemplate(type: 'xlsx' | 'csv' = 'xlsx') {
  const sampleRows = [
    {
      'Roll Number': 'ADM-2026-201',
      'Full Name': 'Siddharth Rao',
      'Class': 'Class 10',
      'Section': 'A',
      'Gender': 'Male',
      'Guardian Name': 'Venkat Rao',
      'Contact': '+91 98765 00001',
      'Email': 'siddharth.rao@school.edu',
      'English Core': 88,
      'Mathematics': 92,
      'General Science': 85,
      'Social Studies': 78,
      'Computer Applications': 95,
      'Attendance %': 94,
    },
    {
      'Roll Number': 'ADM-2026-202',
      'Full Name': 'Meera Krishnan',
      'Class': 'Class 10',
      'Section': 'B',
      'Gender': 'Female',
      'Guardian Name': 'K. Krishnan',
      'Contact': '+91 98765 00002',
      'Email': 'meera.k@school.edu',
      'English Core': 75,
      'Mathematics': 68,
      'General Science': 70,
      'Social Studies': 82,
      'Computer Applications': 80,
      'Attendance %': 91,
    },
    {
      'Roll Number': 'ADM-2026-203',
      'Full Name': 'Devansh Gupta',
      'Class': 'Class 10',
      'Section': 'A',
      'Gender': 'Male',
      'Guardian Name': 'Manoj Gupta',
      'Contact': '+91 98765 00003',
      'Email': 'devansh.g@school.edu',
      'English Core': 55,
      'Mathematics': 25, // Note: Under 33 to demonstrate compartment/fail validation
      'General Science': 48,
      'Social Studies': 52,
      'Computer Applications': 60,
      'Attendance %': 78,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  if (type === 'csv') {
    XLSX.writeFile(workbook, 'student_enrollment_template.csv', { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, 'student_enrollment_template.xlsx', { bookType: 'xlsx' });
  }
}

// -------------------------------------------------------------
// 2. EXCEL / CSV IMPORT PARSER
// -------------------------------------------------------------

export interface ParsedStudentRow {
  rollNumber: string;
  fullName: string;
  gradeClass: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  guardianName: string;
  contactNumber: string;
  email: string;
  attendance: number;
  subjects: Array<{
    name: string;
    code: string;
    marks: number;
    maxMarks: number;
    minPassMarks: number;
  }>;
  isValid: boolean;
  validationError?: string;
}

export async function parseExcelOrCsvFile(file: File): Promise<ParsedStudentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return parseRawRows(rawRows);
}

export function parseRawRows(rawRows: Record<string, any>[]): ParsedStudentRow[] {
  const result: ParsedStudentRow[] = [];

  rawRows.forEach((row, idx) => {
    // Flexible header mapping
    const rollNumber = String(
      row['Roll Number'] || row['Roll No'] || row['Roll'] || row['RollNo'] || row['ID'] || row['Admission No'] || ''
    ).trim();

    const fullName = String(
      row['Full Name'] || row['Name'] || row['Student Name'] || row['Candidate Name'] || ''
    ).trim();

    const gradeClass = String(row['Class'] || row['Grade'] || 'Class 10').trim();
    const section = String(row['Section'] || row['Sec'] || 'A').trim();
    const rawGender = String(row['Gender'] || 'Male').trim().toLowerCase();
    const gender = rawGender.startsWith('f') ? 'Female' : rawGender.startsWith('o') ? 'Other' : 'Male';
    const guardianName = String(
      row['Guardian Name'] || row['Father Name'] || row['Parent Name'] || row['Guardian'] || 'Not Specified'
    ).trim();
    const contactNumber = String(row['Contact'] || row['Phone'] || row['Mobile'] || '').trim();
    const email = String(row['Email'] || row['Email Address'] || '').trim();
    const attendance = Number(row['Attendance %'] || row['Attendance'] || 90) || 90;

    // Detect subjects dynamically or match default subjects
    const subjectList: Array<{
      name: string;
      code: string;
      marks: number;
      maxMarks: number;
      minPassMarks: number;
    }> = [];

    // Check for standard subjects
    const standardMap: Record<string, { code: string; defaultName: string }> = {
      'english': { code: 'ENG-101', defaultName: 'English Core' },
      'math': { code: 'MTH-102', defaultName: 'Mathematics' },
      'mathematics': { code: 'MTH-102', defaultName: 'Mathematics' },
      'science': { code: 'SCI-103', defaultName: 'General Science' },
      'general science': { code: 'SCI-103', defaultName: 'General Science' },
      'social': { code: 'SST-104', defaultName: 'Social Studies' },
      'social studies': { code: 'SST-104', defaultName: 'Social Studies' },
      'computer': { code: 'CSC-105', defaultName: 'Computer Applications' },
      'computer applications': { code: 'CSC-105', defaultName: 'Computer Applications' },
    };

    // Scan all keys in row for marks
    Object.keys(row).forEach((colName) => {
      const lower = colName.toLowerCase().trim();
      const val = row[colName];

      // Exclude bio columns
      if (
        lower.includes('roll') ||
        lower.includes('name') ||
        lower.includes('class') ||
        lower.includes('section') ||
        lower.includes('sec') ||
        lower.includes('gender') ||
        lower.includes('guardian') ||
        lower.includes('parent') ||
        lower.includes('father') ||
        lower.includes('contact') ||
        lower.includes('phone') ||
        lower.includes('email') ||
        lower.includes('attendance') ||
        lower.includes('total') ||
        lower.includes('percentage') ||
        lower.includes('status') ||
        lower.includes('grade') ||
        lower.includes('cgpa') ||
        lower.includes('s.no') ||
        lower === 'division'
      ) {
        return;
      }

      // If column is numeric or can be parsed as number, treat as subject
      if (val !== '' && val !== null && val !== undefined) {
        const markVal = Number(val);
        if (!isNaN(markVal)) {
          let code = `SUB-${101 + subjectList.length}`;
          let name = colName.replace(/\(\d+\)/, '').trim();

          // Match standard code if exists
          for (const [k, v] of Object.entries(standardMap)) {
            if (lower.includes(k)) {
              code = v.code;
              name = v.defaultName;
              break;
            }
          }

          subjectList.push({
            name,
            code,
            marks: markVal,
            maxMarks: 100,
            minPassMarks: 33,
          });
        }
      }
    });

    // If no dynamic subjects were matched from header, provide template subjects
    if (subjectList.length === 0) {
      DEFAULT_SUBJECTS_TEMPLATE.forEach((tpl) => {
        subjectList.push({
          name: tpl.name,
          code: tpl.code,
          marks: 50,
          maxMarks: tpl.maxMarks,
          minPassMarks: tpl.minPassMarks,
        });
      });
    }

    // Row validation
    let isValid = true;
    let validationError = '';

    if (!rollNumber) {
      isValid = false;
      validationError = `Row ${idx + 1}: Missing Roll Number.`;
    } else if (!fullName) {
      isValid = false;
      validationError = `Row ${idx + 1}: Missing Student Name.`;
    } else {
      for (const s of subjectList) {
        if (s.marks < 0 || s.marks > s.maxMarks) {
          isValid = false;
          validationError = `Row ${idx + 1} (${fullName}): ${s.name} marks (${s.marks}) out of bounds (0–${s.maxMarks}).`;
          break;
        }
      }
    }

    result.push({
      rollNumber: rollNumber || `ADM-TEMP-${idx + 1}`,
      fullName: fullName || `Student ${idx + 1}`,
      gradeClass,
      section,
      gender,
      guardianName,
      contactNumber,
      email,
      attendance,
      subjects: subjectList,
      isValid,
      validationError,
    });
  });

  return result;
}

// -------------------------------------------------------------
// 3. PDF IMPORT / TEXT EXTRACTION
// -------------------------------------------------------------

export async function parsePdfFile(file: File): Promise<ParsedStudentRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const fullTextLines: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageLines = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s.trim().length > 0);
    fullTextLines.push(...pageLines);
  }

  // Parse lines to detect student records
  // Typically look for Roll Number patterns like ADM-XXXX or digits followed by Name and scores
  const parsedRows: Record<string, any>[] = [];

  for (let j = 0; j < fullTextLines.length; j++) {
    const line = fullTextLines[j];
    // Check if line looks like a roll number or contains comma/tab separated fields
    if (line.includes(',') || line.includes('\t') || line.includes('|')) {
      const parts = line.split(/[,|\t]/).map((p) => p.trim());
      if (parts.length >= 3) {
        parsedRows.push({
          'Roll Number': parts[0],
          'Full Name': parts[1],
          'English Core': Number(parts[2]) || 60,
          'Mathematics': Number(parts[3]) || 60,
          'General Science': Number(parts[4]) || 60,
          'Social Studies': Number(parts[5]) || 60,
          'Computer Applications': Number(parts[6]) || 60,
        });
      }
    } else if (/^(ADM|STU|ROLL|REG|\d{3,})[-_]?[0-9]+/i.test(line)) {
      // Line is a roll number, next line might be student name
      const roll = line;
      const name = fullTextLines[j + 1] || 'Candidate';
      // Search subsequent 5 numeric tokens for marks
      const marks: number[] = [];
      let offset = 2;
      while (marks.length < 5 && j + offset < fullTextLines.length) {
        const potentialNum = Number(fullTextLines[j + offset]);
        if (!isNaN(potentialNum) && potentialNum >= 0 && potentialNum <= 100) {
          marks.push(potentialNum);
        }
        offset++;
      }

      parsedRows.push({
        'Roll Number': roll,
        'Full Name': name,
        'English Core': marks[0] || 75,
        'Mathematics': marks[1] || 75,
        'General Science': marks[2] || 75,
        'Social Studies': marks[3] || 75,
        'Computer Applications': marks[4] || 75,
      });

      j += Math.max(offset - 1, 1);
    }
  }

  if (parsedRows.length === 0) {
    // If structured parser couldn't find roll rows, create a row from first identifiable items or return warning
    throw new Error(
      'Could not detect standard tabular records in this PDF. Please ensure the PDF contains identifiable student roll numbers and score columns, or copy the text table and use Paste Tabular Data.'
    );
  }

  return parseRawRows(parsedRows);
}

// -------------------------------------------------------------
// 4. CONVERT PARSED ROWS TO PERSISTED STUDENT OBJECTS
// -------------------------------------------------------------

export function convertParsedRowsToStudents(rows: ParsedStudentRow[]): Student[] {
  return rows.map((r, idx) => {
    const evaluated = evaluateStudentResults(
      r.subjects.map((s, sIdx) => ({
        id: `sub-${Date.now()}-${idx}-${sIdx}`,
        code: s.code,
        name: s.name,
        maxMarks: s.maxMarks,
        minPassMarks: s.minPassMarks,
        marksObtained: s.marks,
      }))
    );

    const student: Student = {
      id: `stu-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      rollNumber: r.rollNumber.toUpperCase(),
      fullName: r.fullName,
      gradeClass: r.gradeClass,
      section: r.section,
      gender: r.gender,
      dob: '2010-06-15',
      guardianName: r.guardianName,
      contactNumber: r.contactNumber || 'Not Provided',
      email: r.email || `${r.rollNumber.toLowerCase()}@institution.edu`,
      academicSession: '2025-2026',
      examTerm: 'Annual Examination',
      attendance: r.attendance,
      subjects: evaluated.subjects,
      result: evaluated.result,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return student;
  });
}

// -------------------------------------------------------------
// 5. OFFICIAL PDF EXPORT (COHORT ROSTER & MARKSHEET)
// -------------------------------------------------------------

export function exportCohortPdf(students: Student[], filename = 'academic_cohort_results.pdf') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRAL BOARD OF SECONDARY & HIGHER EDUCATION', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('OFFICIAL COHORT EXAMINATION ROSTER & RESULT SUMMARY', 14, 21);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} · Total Candidates: ${students.length}`, 14, 26);

  // Table Data
  const headers = [
    ['S.N', 'Roll No', 'Student Name', 'Class/Sec', 'Total Marks', 'Pct (%)', 'Status', 'Grade', 'CGPA', 'Division']
  ];

  const body = students.map((s, idx) => [
    idx + 1,
    s.rollNumber,
    s.fullName,
    `${s.gradeClass} (${s.section})`,
    `${s.result.totalObtained} / ${s.result.totalMax}`,
    `${s.result.percentage.toFixed(2)}%`,
    s.result.isPassed ? 'PASS' : 'FAIL',
    s.result.overallGrade,
    s.result.cgpa.toFixed(2),
    s.result.division
  ]);

  autoTable(doc, {
    startY: 32,
    head: headers,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 40 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' },
      9: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      // Color highlight PASS/FAIL
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'PASS') {
          data.cell.styles.textColor = [16, 122, 60];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer signatures
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  if (finalY < 175) {
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text('Prepared by: Faculty Examination Committee', 14, finalY + 18);
    doc.text('Verified by: Controller of Examinations', 110, finalY + 18);
    doc.text('Approved: Principal & Head of Institution', 210, finalY + 18);
  }

  doc.save(filename);
}

export function exportSingleTranscriptPdf(student: Student) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Border frame
  doc.setDrawColor(200, 200, 200);
  doc.rect(8, 8, 194, 281);

  // Institution title
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CENTRAL BOARD OF SECONDARY & HIGHER EDUCATION', 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`STATEMENT OF MARKS & EVALUATION TRANSCRIPT · SESSION ${student.academicSession}`, 105, 28, { align: 'center' });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // Bio Particulars
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);

  doc.text('Roll / Admission ID:', 14, 40);
  doc.text('Student Full Name:', 14, 46);
  doc.text('Class & Section:', 14, 52);
  doc.text('Examination Term:', 14, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(student.rollNumber, 55, 40);
  doc.text(student.fullName, 55, 46);
  doc.text(`${student.gradeClass} (${student.section})`, 55, 52);
  doc.text(student.examTerm, 55, 58);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Guardian Name:', 110, 40);
  doc.text('Date of Birth:', 110, 46);
  doc.text('Gender:', 110, 52);
  doc.text('Attendance Rate:', 110, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(student.guardianName || '—', 145, 40);
  doc.text(student.dob || '—', 145, 46);
  doc.text(student.gender, 145, 52);
  doc.text(`${student.attendance}% (Nominal)`, 145, 58);

  // Subject Table
  const headers = [['Code', 'Subject Description', 'Max Marks', 'Min Pass', 'Scored', 'Grade', 'GP', 'Result']];
  const body = student.subjects.map((sub) => [
    sub.code,
    sub.name,
    sub.maxMarks,
    sub.minPassMarks,
    sub.marksObtained,
    sub.grade,
    sub.gradePoint.toFixed(1),
    sub.isPassed ? 'PASS' : 'FAIL',
  ]);

  // Grand Total row
  body.push([
    'TOTAL',
    'Grand Aggregate Scored',
    String(student.result.totalMax),
    '—',
    String(student.result.totalObtained),
    student.result.overallGrade,
    student.result.cgpa.toFixed(2),
    student.result.isPassed ? 'PASS' : 'FAIL',
  ]);

  autoTable(doc, {
    startY: 65,
    head: headers,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, finalY + 6, 182, 26, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('FINAL RESULT ASSESSMENT:', 18, finalY + 13);
  doc.text('AGGREGATE PERCENTAGE:', 18, finalY + 21);
  doc.text('DIVISION / STANDING:', 18, finalY + 29);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(student.result.isPassed ? 16 : 220, student.result.isPassed ? 122 : 38, student.result.isPassed ? 60 : 38);
  doc.text(student.result.isPassed ? 'PASSED' : 'FAILED / REPEAT', 75, finalY + 13);

  doc.setTextColor(0, 0, 0);
  doc.text(`${student.result.percentage.toFixed(2)}% (Grade ${student.result.overallGrade} · CGPA ${student.result.cgpa})`, 75, finalY + 21);
  doc.text(student.result.division, 75, finalY + 29);

  // Remarks
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Board Remarks: "${student.result.remarks}"`, 14, finalY + 38);

  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.line(20, finalY + 68, 60, finalY + 68);
  doc.text('Faculty Incharge', 25, finalY + 73);

  doc.line(85, finalY + 68, 125, finalY + 68);
  doc.text('Controller of Exams', 88, finalY + 73);

  doc.line(150, finalY + 68, 190, finalY + 68);
  doc.text('Principal', 165, finalY + 73);

  doc.save(`transcript_${student.rollNumber}.pdf`);
}
