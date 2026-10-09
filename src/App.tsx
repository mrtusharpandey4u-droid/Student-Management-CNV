import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { StudentForm } from './components/StudentForm';
import { StudentTable } from './components/StudentTable';
import { MarksheetModal } from './components/MarksheetModal';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { JsonInspectorModal } from './components/JsonInspectorModal';
import { ImportModal } from './components/ImportModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Student } from './types';
import { 
  getStudentsFromLocalStorage, 
  deleteStudentFromLocalStorage, 
  resetLocalStorageToDefault, 
  clearLocalStorage 
} from './utils/storage';
import { 
  CheckCircle2, 
  X, 
  Plus 
} from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'directory' | 'register' | 'analytics'>('directory');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentMarksheet, setSelectedStudentMarksheet] = useState<Student | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Student | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<{
    student: Student;
    message: string;
  } | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const loaded = getStudentsFromLocalStorage();
    setStudents(loaded);
  }, []);

  const handleStudentSaved = (savedStudent: Student) => {
    // Reload full list from local storage
    const updated = getStudentsFromLocalStorage();
    setStudents(updated);
    setEditingStudent(null);

    // Show celebratory institutional toast with direct action to open Marksheet
    setSuccessToast({
      student: savedStudent,
      message: `Student record and examination marks for ${savedStudent.fullName} successfully calculated and committed to Local Storage.`,
    });

    // Auto-open marksheet for immediate dynamic result display
    setSelectedStudentMarksheet(savedStudent);
    setActiveTab('directory');
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setActiveTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    const updated = deleteStudentFromLocalStorage(deleteCandidate.id);
    setStudents(updated);
    setDeleteCandidate(null);
  };

  const handleResetDefaults = () => {
    const defaults = resetLocalStorageToDefault();
    setStudents(defaults);
  };

  const handleClearAllConfirm = () => {
    const cleared = clearLocalStorage();
    setStudents(cleared);
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Institutional Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'register' && editingStudent) {
            setEditingStudent(null);
          }
          setActiveTab(tab);
        }}
        onOpenJsonInspector={() => setIsJsonModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onNewRegistration={() => {
          setEditingStudent(null);
          setActiveTab('register');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Success Notification Banner */}
      {successToast && (
        <div className="no-print bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast.message}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStudentMarksheet(successToast.student)}
                className="font-medium text-emerald-400 hover:text-emerald-300 underline whitespace-nowrap"
              >
                View Marksheet
              </button>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs bar for Mobile / Tablet */}
        <div className="md:hidden mb-6 flex items-center p-1 bg-slate-200/80 rounded-lg no-print">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'directory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Records
          </button>
          <button
            onClick={() => {
              setEditingStudent(null);
              setActiveTab('register');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marks Entry
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Student Examination Records
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Institutional examination ledger with validated subject scores, automated division allocation, and official transcripts.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setActiveTab('register');
                }}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Student Enrollment</span>
              </button>
            </div>

            <StudentTable
              students={students}
              onViewMarksheet={(stu) => setSelectedStudentMarksheet(stu)}
              onEditStudent={handleEditStudent}
              onDeleteStudent={(id) => {
                const target = students.find((s) => s.id === id);
                if (target) setDeleteCandidate(target);
              }}
              onResetDefaults={handleResetDefaults}
              onClearAll={() => setIsClearConfirmOpen(true)}
              onExportJson={() => setIsJsonModalOpen(true)}
              onOpenImport={() => setIsImportModalOpen(true)}
              onAddNew={() => {
                setEditingStudent(null);
                setActiveTab('register');
              }}
            />
          </div>
        )}

        {activeTab === 'register' && (
          <StudentForm
            initialStudent={editingStudent}
            onSuccess={handleStudentSaved}
            onCancel={() => {
              setEditingStudent(null);
              setActiveTab('directory');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Cohort Academic Analytics & Diagnostics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Aggregate pass percentage, scholastic grade distribution, and discipline-level performance benchmarks.
              </p>
            </div>

            <AnalyticsOverview
              students={students}
              onViewMarksheet={(stu) => setSelectedStudentMarksheet(stu)}
              onNavigateToRegister={() => {
                setEditingStudent(null);
                setActiveTab('register');
              }}
            />
          </div>
        )}
      </main>

      {/* Official Marksheet Modal */}
      <MarksheetModal
        student={selectedStudentMarksheet}
        onClose={() => setSelectedStudentMarksheet(null)}
      />

      {/* LocalStorage JSON Inspector Modal */}
      <JsonInspectorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onDataImported={(imported) => {
          setStudents(imported);
          setIsJsonModalOpen(false);
        }}
      />

      {/* Multi-Format Import Modal (Excel, CSV, PDF, JSON) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(imported) => {
          setStudents(imported);
          setSuccessToast({
            student: imported[0],
            message: `Successfully processed and committed ${imported.length} student records into Local Storage.`,
          });
        }}
      />

      {/* Delete Record Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteCandidate}
        title="Delete Student Record"
        message={`Are you sure you want to delete the record for ${deleteCandidate?.fullName} (${deleteCandidate?.rollNumber})? This will permanently remove their examination marks from browser storage.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* Clear All Confirmation */}
      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        title="Clear All Student Records"
        message="Are you sure you want to erase all student records from local storage? This action cannot be reversed unless you have downloaded a JSON backup."
        confirmLabel="Erase All Records"
        isDestructive={true}
        onConfirm={handleClearAllConfirm}
        onCancel={() => setIsClearConfirmOpen(false)}
      />

    </div>
  );
}
