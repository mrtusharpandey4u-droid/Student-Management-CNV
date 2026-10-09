import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  Download, 
  RotateCcw, 
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Student } from '../types';

import { 
  exportToExcel, 
  exportCohortPdf 
} from '../utils/fileImportExport';

interface StudentTableProps {
  students: Student[];
  onViewMarksheet: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onResetDefaults: () => void;
  onClearAll: () => void;
  onExportJson: () => void;
  onOpenImport: () => void;
  onAddNew: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onViewMarksheet,
  onEditStudent,
  onDeleteStudent,
  onResetDefaults,
  onClearAll,
  onExportJson,
  onOpenImport,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [sortBy, setSortBy] = useState<'pct_desc' | 'pct_asc' | 'roll_asc' | 'name_asc'>('pct_desc');

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClass = classFilter === 'ALL' || s.gradeClass === classFilter;

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'PASS' && s.result.isPassed) ||
          (statusFilter === 'FAIL' && !s.result.isPassed);

        return matchesSearch && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'pct_desc') return b.result.percentage - a.result.percentage;
        if (sortBy === 'pct_asc') return a.result.percentage - b.result.percentage;
        if (sortBy === 'roll_asc') return a.rollNumber.localeCompare(b.rollNumber);
        if (sortBy === 'name_asc') return a.fullName.localeCompare(b.fullName);
        return 0;
      });
  }, [students, searchTerm, classFilter, statusFilter, sortBy]);

  // Export as CSV
  const handleExportCsv = () => {
    if (students.length === 0) return;
    const headers = ['Roll Number', 'Full Name', 'Class', 'Section', 'Total Marks', 'Max Marks', 'Percentage', 'Status', 'Grade', 'CGPA'];
    const rows = students.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.fullName}"`,
      `"${s.gradeClass}"`,
      `"${s.section}"`,
      s.result.totalObtained,
      s.result.totalMax,
      `${s.result.percentage}%`,
      s.result.isPassed ? 'PASS' : 'FAIL',
      `"${s.result.overallGrade}"`,
      s.result.cgpa,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    exportToExcel(students);
  };

  const handleExportPdf = () => {
    exportCohortPdf(students);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, roll number, or guardian..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Import Button */}
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
              title="Import from Excel (.xlsx), CSV, PDF, or JSON"
            >
              <Download className="w-3.5 h-3.5 rotate-180" />
              <span>Import (Excel/PDF/JSON)</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              title="Download Excel spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              title="Download formal cohort results roster PDF (.pdf)"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF Roster</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              title="Download results CSV"
            >
              <span>CSV</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={onExportJson}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50"
              title="Export complete records as JSON"
            >
              <span>JSON</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              title="Reset records to default sample students"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Filters and Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Filter */}
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-800 border-none focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <span className="text-slate-300" aria-hidden="true">|</span>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PASS' | 'FAIL')}
                className="bg-transparent font-medium text-slate-800 border-none focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Outcomes</option>
                <option value="PASS">Passed Only</option>
                <option value="FAIL">Failed Only</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 border-none focus:outline-none cursor-pointer"
            >
              <option value="pct_desc">Highest Percentage</option>
              <option value="pct_asc">Lowest Percentage</option>
              <option value="roll_asc">Roll Number</option>
              <option value="name_asc">Student Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Count / Summary */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{students.length}</span> enrolled students
        </div>
        {students.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 transition-colors"
          >
            Clear All Records
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Particulars</th>
                <th className="py-3 px-3">Class & Sec</th>
                <th className="py-3 px-3 text-right">Marks Scored</th>
                <th className="py-3 px-3 text-right">Percentage</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center">Result Status</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium text-slate-700">No student records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || classFilter !== 'ALL' || statusFilter !== 'ALL'
                        ? 'Try clearing filters to display results.'
                        : 'Register a student to calculate results and populate the ledger.'}
                    </p>
                    <button
                      onClick={onAddNew}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Enroll First Student
                    </button>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isPass = student.result.isPassed;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Roll Number */}
                      <td className="py-3.5 px-4 font-mono-numbers text-xs font-semibold text-slate-900">
                        {student.rollNumber}
                      </td>

                      {/* Student Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Guardian: {student.guardianName}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-3 text-xs text-slate-600">
                        <span className="font-medium text-slate-800">{student.gradeClass}</span>
                        <span className="text-slate-400 ml-1">({student.section})</span>
                      </td>

                      {/* Total Marks */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers text-xs">
                        <span className="font-semibold text-slate-900">
                          {student.result.totalObtained}
                        </span>
                        <span className="text-slate-400"> / {student.result.totalMax}</span>
                      </td>

                      {/* Percentage */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers text-sm font-bold text-slate-900">
                        {student.result.percentage.toFixed(2)}%
                      </td>

                      {/* Grade & CGPA */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono-numbers text-xs font-semibold text-slate-800">
                          {student.result.overallGrade}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono-numbers">
                          {student.result.cgpa} GPA
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          {isPass ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700">PASS</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span className="text-rose-700">FAIL</span>
                            </>
                          )}
                        </div>
                        {!isPass && student.result.failedSubjects.length > 0 && (
                          <div className="text-[10px] text-rose-600 line-clamp-1 max-w-[130px] mx-auto">
                            {student.result.failedSubjects.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewMarksheet(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            title="Generate and view official printable report card"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Report Card</span>
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit student records & marks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete student record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
