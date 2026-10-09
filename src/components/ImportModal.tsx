import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  TableProperties,
  ArrowRight
} from 'lucide-react';
import { 
  parseExcelOrCsvFile, 
  parsePdfFile, 
  parseRawRows, 
  convertParsedRowsToStudents, 
  downloadSampleExcelTemplate,
  ParsedStudentRow 
} from '../utils/fileImportExport';
import { importStudentsFromJson, getStudentsFromLocalStorage } from '../utils/storage';
import { Student } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (students: Student[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[] | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [pastedText, setPastedText] = useState('');

  // Handle File Input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'json') {
        const text = await file.text();
        const res = importStudentsFromJson(text);
        if (res.success && res.data) {
          onImportComplete(res.data);
          onClose();
          return;
        } else {
          throw new Error(res.error || 'Failed to parse JSON file.');
        }
      } else if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
        const rows = await parseExcelOrCsvFile(file);
        if (rows.length === 0) {
          throw new Error('No rows found in this spreadsheet.');
        }
        setParsedRows(rows);
      } else if (extension === 'pdf') {
        const rows = await parsePdfFile(file);
        setParsedRows(rows);
      } else {
        throw new Error('Unsupported format. Please upload .xlsx, .xls, .csv, .pdf, or .json.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process file.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Handle Raw Text Parse (from TSV / CSV pasted from Excel or PDF)
  const handleParsePastedText = () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg('Please paste tabular rows or delimited text.');
      return;
    }

    try {
      // Split lines
      const lines = pastedText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      // Detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(',') ? ',' : '|';

      // Parse headers
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));

      const rawRows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
        });
        rawRows.push(rowObj);
      }

      if (rawRows.length === 0) {
        throw new Error('Could not parse any rows from the pasted text. Verify line endings and columns.');
      }

      const rows = parseRawRows(rawRows);
      setParsedRows(rows);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse tabular text.');
    }
  };

  // Commit imported rows to local storage
  const handleCommitImport = () => {
    if (!parsedRows || parsedRows.length === 0) return;

    // Filter valid rows
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg('No valid rows available to import.');
      return;
    }

    const newStudents = convertParsedRowsToStudents(validRows);

    let finalStudents: Student[];
    if (importMode === 'replace') {
      finalStudents = newStudents;
    } else {
      const existing = getStudentsFromLocalStorage();
      const existingMap = new Map(existing.map((s) => [s.rollNumber.toLowerCase(), s]));

      // Merge: replace matching roll numbers, append new ones
      newStudents.forEach((ns) => {
        existingMap.set(ns.rollNumber.toLowerCase(), ns);
      });

      finalStudents = Array.from(existingMap.values());
    }

    // Persist as JSON in LocalStorage
    localStorage.setItem('academic_records_students_v1', JSON.stringify(finalStudents, null, 2));
    onImportComplete(finalStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Import Student Records & Marks</h3>
              <p className="text-xs text-slate-400">
                Supports Microsoft Excel (.xlsx), CSV (.csv), PDF Transcripts (.pdf), or JSON data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Tab Navigation if not previewing */}
          {!parsedRows && (
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'file'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Upload File (.xlsx, .csv, .pdf, .json)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'paste'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Paste Table / Text Data
                </button>
              </div>

              {/* Download templates */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => downloadSampleExcelTemplate('xlsx')}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 underline"
                  title="Download standard Excel format"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sample Excel (.xlsx)</span>
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => downloadSampleExcelTemplate('csv')}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 underline"
                  title="Download standard CSV format"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sample CSV</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Import Issue: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* View 1: File Upload Screen */}
          {!parsedRows && activeTab === 'file' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3 transition-colors">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-700" />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-900 text-center">
                  Click to browse or drag and drop files here
                </div>
                <p className="text-xs text-slate-500 mt-1 text-center">
                  Excel (.xlsx, .xls), Comma-Separated Values (.csv), PDF documents (.pdf), or JSON backups (.json)
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf,.json"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>

              {/* Format Guide */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <TableProperties className="w-4 h-4 text-slate-600" />
                  Expected Columns in Excel / CSV / PDF:
                </div>
                <p>
                  <code className="text-slate-800 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    Roll Number, Full Name, Class, Section, Guardian Name, English Core, Mathematics, General Science, Social Studies, Computer Applications
                  </code>
                </p>
                <p className="text-[11px] text-slate-500">
                  The calculation engine automatically verifies individual pass thresholds (&ge; 33), totals, percentages, letter grades, and division classification upon import.
                </p>
              </div>
            </div>
          )}

          {/* View 2: Paste Raw Text */}
          {!parsedRows && activeTab === 'paste' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Paste tabular rows copied from an Excel sheet, CSV file, or PDF table. Ensure the first line contains column headers.
              </p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Roll Number\tFull Name\tClass\tSection\tEnglish Core\tMathematics\tGeneral Science\nADM-2026-301\tAarav Gupta\tClass 10\tA\t85\t92\t89`}
                rows={8}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
              >
                Parse Tabular Data
              </button>
            </div>
          )}

          {/* View 3: Data Parsing & Validation Preview */}
          {parsedRows && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    Parsed {parsedRows.length} candidate rows
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-emerald-700">
                    {parsedRows.filter((r) => r.isValid).length} ready to import
                  </span>
                  {parsedRows.some((r) => !r.isValid) && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-rose-600 font-semibold">
                        {parsedRows.filter((r) => !r.isValid).length} with warnings
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setParsedRows(null)}
                  className="text-slate-600 hover:text-slate-900 underline text-xs"
                >
                  Upload another file
                </button>
              </div>

              {/* Import destination mode */}
              <div className="flex items-center gap-6 text-xs text-slate-700 bg-white p-3 border border-slate-200 rounded-md">
                <span className="font-semibold">Import Strategy:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                  />
                  <span>Merge with existing records (update duplicates by Roll No)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <span>Replace all current records in Local Storage</span>
                </label>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Roll No</th>
                      <th className="py-2 px-3">Full Name</th>
                      <th className="py-2 px-3">Class/Sec</th>
                      <th className="py-2 px-3">Subjects Parsed</th>
                      <th className="py-2 px-3 text-right">Computed Total</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {parsedRows.map((r, idx) => {
                      const total = r.subjects.reduce((sum, s) => sum + s.marks, 0);
                      const max = r.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
                      const hasFails = r.subjects.some((s) => s.marks < s.minPassMarks);

                      return (
                        <tr key={idx} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.rollNumber}</td>
                          <td className="py-2 px-3 font-sans text-slate-800">{r.fullName}</td>
                          <td className="py-2 px-3 text-slate-600">{r.gradeClass} ({r.section})</td>
                          <td className="py-2 px-3 font-sans text-slate-600">
                            {r.subjects.map((s) => `${s.name}: ${s.marks}`).join(', ')}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold">
                            {total} / {max}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.isValid ? (
                              <span className={`text-[11px] font-semibold ${hasFails ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {hasFails ? 'COMPARTMENT' : 'PASS'}
                              </span>
                            ) : (
                              <span className="text-rose-600 text-[10px]" title={r.validationError}>
                                ERROR
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>

          {parsedRows && (
            <button
              type="button"
              onClick={handleCommitImport}
              className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <span>Commit & Save {parsedRows.filter((r) => r.isValid).length} Records to Local Storage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
