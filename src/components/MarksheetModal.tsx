import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap,
  Award,
  Calendar,
  Share2,
  FileText
} from 'lucide-react';
import { Student } from '../types';
import { exportSingleTranscriptPdf } from '../utils/fileImportExport';

interface MarksheetModalProps {
  student: Student | null;
  onClose: () => void;
}

export const MarksheetModal: React.FC<MarksheetModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportSingleTranscriptPdf(student);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(student, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `transcript_${student.rollNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isPass = student.result.isPassed;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none marksheet-print-area">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Official Academic Marksheet & Transcript
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-xs"
              title="Download official PDF transcript"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded transition-colors"
              title="Download Student Record JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded transition-colors shadow-xs"
              title="Print official report card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-2"
              title="Close marksheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Container */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 space-y-6">
          {/* Institutional Header with Emblem */}
          <div className="border-b-2 border-slate-900 pb-5 text-center relative">
            <div className="flex flex-col items-center justify-center gap-1">
              {/* Emblem icon */}
              <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center mb-1">
                <Award className="w-7 h-7 text-slate-900" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 uppercase font-serif-official">
                Central Board of Secondary & Higher Education
              </h1>
              <p className="text-xs text-slate-600 font-medium tracking-wide">
                AFFILIATED INSTITUTIONAL EXAMINATION BOARD · ACADEMIC SESSION {student.academicSession}
              </p>
              <div className="inline-block mt-2 px-3 py-0.5 border border-slate-900 text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-50">
                Official Statement of Marks & Evaluation Transcript
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono-numbers px-2">
              <span>Serial No: NBSE/{student.academicSession.replace('-', '')}/{student.rollNumber}</span>
              <span>Issue Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Student Bio-data Grid */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Roll / Admission No.</span>
              <span className="font-mono-numbers font-bold text-slate-900 text-sm">{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Candidate Full Name</span>
              <span className="font-semibold text-slate-900 text-sm">{student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Father / Guardian</span>
              <span className="font-medium text-slate-800">{student.guardianName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Class & Section</span>
              <span className="font-medium text-slate-800">{student.gradeClass} ({student.section})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date of Birth</span>
              <span className="font-medium text-slate-800">{student.dob || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Gender</span>
              <span className="font-medium text-slate-800">{student.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Examination Term</span>
              <span className="font-medium text-slate-800">{student.examTerm}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Attendance Record</span>
              <span className="font-mono-numbers font-medium text-slate-800">{student.attendance}% (Nominal)</span>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="border border-slate-300 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-300 font-semibold">
                  <th className="py-2.5 px-3">Subject Code</th>
                  <th className="py-2.5 px-4">Subject Description</th>
                  <th className="py-2.5 px-3 text-right">Max Marks</th>
                  <th className="py-2.5 px-3 text-right">Min Pass</th>
                  <th className="py-2.5 px-3 text-right">Marks Obtained</th>
                  <th className="py-2.5 px-3 text-center">Subject Grade</th>
                  <th className="py-2.5 px-3 text-center">Grade Point</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {student.subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono-numbers font-medium text-slate-700">
                      {sub.code}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {sub.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-600">
                      {sub.maxMarks}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-600">
                      {sub.minPassMarks}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers font-bold text-slate-900">
                      {sub.marksObtained}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-semibold text-slate-800">
                      {sub.grade}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers text-slate-700">
                      {sub.gradePoint.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">
                      <span className={sub.isPassed ? 'text-emerald-700' : 'text-rose-700'}>
                        {sub.isPassed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <td colSpan={2} className="py-3 px-4 text-slate-900 uppercase tracking-wider">
                    Grand Total
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers">
                    {student.result.totalMax}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers">
                    —
                  </td>
                  <td className="py-3 px-3 text-right font-mono-numbers text-sm text-slate-950">
                    {student.result.totalObtained}
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-right text-xs font-semibold text-slate-700">
                    Aggregate: {student.result.percentage.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Final Assessment</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isPass ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-800 text-sm">PASSED</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold text-rose-800 text-sm">FAILED / REPEAT</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Overall Grade</span>
              <div className="font-mono-numbers font-bold text-slate-900 text-sm mt-0.5">
                Grade {student.result.overallGrade}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cumulative GPA (CGPA)</span>
              <div className="font-mono-numbers font-bold text-slate-900 text-sm mt-0.5">
                {student.result.cgpa.toFixed(2)} / 10.0
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Division / Standing</span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {student.result.division}
              </div>
            </div>
          </div>

          {/* Remarks by Academic Board */}
          <div className="border border-slate-200 rounded p-3 text-xs bg-white">
            <span className="font-semibold text-slate-700">Official Faculty Remarks: </span>
            <span className="text-slate-600 italic">"{student.result.remarks}"</span>
          </div>

          {/* Grading Scale Footnote */}
          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-600">Evaluation Metric Reference:</p>
            <p>
              A+ (90-100% · 10.0 GP) · A (80-89% · 9.0 GP) · B (70-79% · 8.0 GP) · C (60-69% · 7.0 GP) · D (50-59% · 6.0 GP) · E (33-49% · Pass) · F (&lt; 33% · Essential Repeat).
              Minimum pass standard: 33% per subject.
            </p>
          </div>

          {/* Institutional Signatures & Attestation */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div>
              <div className="h-10 border-b border-slate-400 mx-6 mb-1"></div>
              <p className="font-semibold text-slate-900">Class Incharge</p>
              <p className="text-[10px] text-slate-400">Faculty Examiner</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mx-6 mb-1 flex items-center justify-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 border border-slate-300 px-2 py-0.5 rounded-full font-serif-official">
                  Official Seal
                </span>
              </div>
              <p className="font-semibold text-slate-900">Controller of Examinations</p>
              <p className="text-[10px] text-slate-400">Board Secretariat</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mx-6 mb-1"></div>
              <p className="font-semibold text-slate-900">Principal</p>
              <p className="text-[10px] text-slate-400">Head of Institution</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Student ID: {student.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
          >
            Close Marksheet
          </button>
        </div>
      </div>
    </div>
  );
};
