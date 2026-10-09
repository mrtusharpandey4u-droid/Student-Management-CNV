import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  FileCheck2,
  Calculator,
  User,
  GraduationCap
} from 'lucide-react';
import { Student, SubjectMark } from '../types';
import { 
  DEFAULT_SUBJECTS_TEMPLATE, 
  evaluateStudentResults,
  calculateSubjectGrade 
} from '../utils/gradeCalculator';
import { getStudentsFromLocalStorage, saveStudentToLocalStorage } from '../utils/storage';

interface StudentFormProps {
  initialStudent?: Student | null;
  onSuccess: (savedStudent: Student) => void;
  onCancel?: () => void;
}

interface FormErrors {
  rollNumber?: string;
  fullName?: string;
  gradeClass?: string;
  section?: string;
  dob?: string;
  guardianName?: string;
  contactNumber?: string;
  email?: string;
  subjects?: { [id: string]: string };
}

export const StudentForm: React.FC<StudentFormProps> = ({
  initialStudent,
  onSuccess,
  onCancel,
}) => {
  // Form State
  const [rollNumber, setRollNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [gradeClass, setGradeClass] = useState('Class 10');
  const [section, setSection] = useState('A');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2010-05-18');
  const [guardianName, setGuardianName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [academicSession, setAcademicSession] = useState('2025-2026');
  const [examTerm, setExamTerm] = useState('Annual Examination');
  const [attendance, setAttendance] = useState<number>(90);

  // Subjects State
  const [subjects, setSubjects] = useState<Array<{
    id: string;
    code: string;
    name: string;
    maxMarks: number;
    minPassMarks: number;
    marksObtained: number | string;
  }>>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or populate form
  useEffect(() => {
    if (initialStudent) {
      setRollNumber(initialStudent.rollNumber);
      setFullName(initialStudent.fullName);
      setGradeClass(initialStudent.gradeClass);
      setSection(initialStudent.section);
      setGender(initialStudent.gender);
      setDob(initialStudent.dob);
      setGuardianName(initialStudent.guardianName);
      setContactNumber(initialStudent.contactNumber);
      setEmail(initialStudent.email);
      setAcademicSession(initialStudent.academicSession);
      setExamTerm(initialStudent.examTerm);
      setAttendance(initialStudent.attendance);
      setSubjects(
        initialStudent.subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          maxMarks: s.maxMarks,
          minPassMarks: s.minPassMarks,
          marksObtained: s.marksObtained,
        }))
      );
    } else {
      // Default blank student with template subjects
      resetFormToDefaults();
    }
  }, [initialStudent]);

  const resetFormToDefaults = () => {
    const existing = getStudentsFromLocalStorage();
    const nextNumber = existing.length + 101;
    setRollNumber(`ADM-2026-${nextNumber}`);
    setFullName('');
    setGradeClass('Class 10');
    setSection('A');
    setGender('Male');
    setDob('2010-05-18');
    setGuardianName('');
    setContactNumber('');
    setEmail('');
    setAcademicSession('2025-2026');
    setExamTerm('Annual Examination');
    setAttendance(92);
    setSubjects(
      DEFAULT_SUBJECTS_TEMPLATE.map((tpl, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        code: tpl.code,
        name: tpl.name,
        maxMarks: tpl.maxMarks,
        minPassMarks: tpl.minPassMarks,
        marksObtained: '',
      }))
    );
    setErrors({});
  };

  // Handle Marks Input Change with real-time numeric constraint
  const handleMarkChange = (id: string, val: string) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          if (val === '') {
            return { ...sub, marksObtained: '' };
          }
          const parsed = Number(val);
          return {
            ...sub,
            marksObtained: isNaN(parsed) ? sub.marksObtained : parsed,
          };
        }
        return sub;
      })
    );

    // Clear error for this subject if resolved
    if (errors.subjects && errors.subjects[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (next.subjects) {
          delete next.subjects[id];
        }
        return next;
      });
    }
  };

  // Add custom subject
  const handleAddSubject = () => {
    const newId = `sub-${Date.now()}`;
    setSubjects((prev) => [
      ...prev,
      {
        id: newId,
        code: `ELE-${100 + prev.length + 1}`,
        name: 'Additional Elective',
        maxMarks: 100,
        minPassMarks: 33,
        marksObtained: '',
      },
    ]);
  };

  // Remove subject
  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert('At least one subject must be evaluated.');
      return;
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Real-time calculation preview
  const liveEvaluation = React.useMemo(() => {
    const validSubs = subjects.map((s) => ({
      ...s,
      marksObtained: typeof s.marksObtained === 'number' ? s.marksObtained : 0,
    }));
    return evaluateStudentResults(validSubs);
  }, [subjects]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const subjectErrors: { [id: string]: string } = {};

    // 1. Roll number validation
    if (!rollNumber.trim()) {
      newErrors.rollNumber = 'Roll/Admission number is required.';
    } else {
      const existing = getStudentsFromLocalStorage();
      const duplicate = existing.find(
        (s) =>
          s.rollNumber.trim().toLowerCase() === rollNumber.trim().toLowerCase() &&
          s.id !== initialStudent?.id
      );
      if (duplicate) {
        newErrors.rollNumber = `Roll number '${rollNumber}' is already allocated to ${duplicate.fullName}.`;
      }
    }

    // 2. Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Student full name is required.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must contain at least 3 characters.';
    }

    // 3. Guardian name
    if (!guardianName.trim()) {
      newErrors.guardianName = "Guardian / Parent name is required for institutional records.";
    }

    // 4. Contact validation
    if (contactNumber.trim() && !/^[+0-9\s-]{7,16}$/.test(contactNumber.trim())) {
      newErrors.contactNumber = 'Enter a valid telephone or mobile number.';
    }

    // 5. Email validation
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid institutional or personal email address.';
    }

    // 6. Subject marks validation
    subjects.forEach((sub) => {
      if (sub.marksObtained === '' || sub.marksObtained === undefined || sub.marksObtained === null) {
        subjectErrors[sub.id] = 'Marks obtained is required (0 to 100).';
      } else {
        const num = Number(sub.marksObtained);
        if (isNaN(num)) {
          subjectErrors[sub.id] = 'Must be a valid numeric figure.';
        } else if (num < 0 || num > sub.maxMarks) {
          subjectErrors[sub.id] = `Marks must be between 0 and ${sub.maxMarks}.`;
        }
      }
    });

    if (Object.keys(subjectErrors).length > 0) {
      newErrors.subjects = subjectErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to top of form if errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Evaluate results using Javascript calculation engine
      const cleanedSubjects = subjects.map((sub) => ({
        ...sub,
        marksObtained: Number(sub.marksObtained) || 0,
      }));
      const { subjects: evaluatedSubjects, result } = evaluateStudentResults(cleanedSubjects);

      // 2. Assemble complete Student record
      const studentId = initialStudent?.id || `stu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const studentRecord: Student = {
        id: studentId,
        rollNumber: rollNumber.trim().toUpperCase(),
        fullName: fullName.trim(),
        gradeClass,
        section,
        gender,
        dob,
        guardianName: guardianName.trim(),
        contactNumber: contactNumber.trim() || 'Not Provided',
        email: email.trim() || `${rollNumber.trim().toLowerCase()}@school.edu`,
        academicSession,
        examTerm,
        attendance: Number(attendance) || 90,
        subjects: evaluatedSubjects,
        result,
        createdAt: initialStudent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 3. Convert student object to JSON and store in Local Storage
      saveStudentToLocalStorage(studentRecord);

      // 4. Trigger success callback
      onSuccess(studentRecord);
    } catch (err) {
      console.error('Failed to process student result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Editorial Section Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {initialStudent ? 'Edit Student & Academic Evaluation' : 'New Student Enrollment & Marks Entry'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Record student particulars and evaluation scores. Results are automatically computed and persisted to browser local storage.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
          <span>Session: {academicSession}</span>
          <span aria-hidden="true">·</span>
          <span>Term: {examTerm}</span>
        </div>
      </div>

      {/* Global Validation Warning */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-900">Please review validation errors below:</div>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-rose-700">
              {errors.rollNumber && <li>{errors.rollNumber}</li>}
              {errors.fullName && <li>{errors.fullName}</li>}
              {errors.guardianName && <li>{errors.guardianName}</li>}
              {errors.email && <li>{errors.email}</li>}
              {errors.contactNumber && <li>{errors.contactNumber}</li>}
              {errors.subjects && <li>One or more subject marks require valid numerical values (0–100).</li>}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Biographical Particulars */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              1. Student Biographical Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Roll Number */}
            <div>
              <label htmlFor="rollNumber" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Roll / Admission ID <span className="text-rose-600">*</span>
              </label>
              <input
                id="rollNumber"
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. ADM-2026-101"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md font-mono-numbers focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                  errors.rollNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.rollNumber && (
                <p className="text-xs text-rose-600 mt-1">{errors.rollNumber}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                  errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label htmlFor="gradeClass" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Class / Grade <span className="text-rose-600">*</span>
              </label>
              <select
                id="gradeClass"
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Class 9">Class 9 (Secondary)</option>
                <option value="Class 10">Class 10 (Secondary High)</option>
                <option value="Class 11">Class 11 (Senior Secondary)</option>
                <option value="Class 12">Class 12 (Graduating Senior)</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label htmlFor="section" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Section
              </label>
              <select
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
              </input>
            </div>

            {/* Guardian Name */}
            <div>
              <label htmlFor="guardianName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Father / Guardian Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="guardianName"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                  errors.guardianName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.guardianName && (
                <p className="text-xs text-rose-600 mt-1">{errors.guardianName}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactNumber" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Guardian Contact Phone
              </label>
              <input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                  errors.contactNumber ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.contactNumber && (
                <p className="text-xs text-rose-600 mt-1">{errors.contactNumber}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@institution.edu"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                  errors.email ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Subject Marks Evaluation Sheet */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                2. Subject Marks & Examination Scores
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddSubject}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Passing threshold is set to 33 marks out of 100 per subject. A student must achieve at least 33 in every evaluated discipline to pass.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50/75">
                  <th className="py-2.5 px-3">Subject Code</th>
                  <th className="py-2.5 px-3">Discipline / Subject</th>
                  <th className="py-2.5 px-3 text-right">Max Marks</th>
                  <th className="py-2.5 px-3 text-right">Min Pass</th>
                  <th className="py-2.5 px-3 w-40 text-right">Marks Scored <span className="text-rose-600">*</span></th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub, index) => {
                  const numMarks = typeof sub.marksObtained === 'number' ? sub.marksObtained : 0;
                  const { grade } = calculateSubjectGrade(numMarks, sub.maxMarks);
                  const isPass = numMarks >= sub.minPassMarks;
                  const subjectError = errors.subjects && errors.subjects[sub.id];

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={sub.code}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjects((prev) =>
                              prev.map((s) => (s.id === sub.id ? { ...s, code: val } : s))
                            );
                          }}
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded font-mono-numbers focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjects((prev) =>
                              prev.map((s) => (s.id === sub.id ? { ...s, name: val } : s))
                            );
                          }}
                          className="w-full min-w-[140px] px-2 py-1 text-xs font-medium text-slate-800 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-mono-numbers text-slate-600 text-xs">
                        {sub.maxMarks}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-numbers text-slate-600 text-xs">
                        {sub.minPassMarks}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-block text-right">
                          <input
                            type="number"
                            min="0"
                            max={sub.maxMarks}
                            value={sub.marksObtained}
                            onChange={(e) => handleMarkChange(sub.id, e.target.value)}
                            placeholder="0–100"
                            className={`w-24 px-2.5 py-1 text-sm text-right font-mono-numbers border rounded focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                              subjectError
                                ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                                : 'border-slate-300 text-slate-900'
                            }`}
                          />
                          {subjectError && (
                            <p className="text-[10px] text-rose-600 text-right mt-0.5">{subjectError}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono-numbers font-semibold text-xs text-slate-700">
                          {sub.marksObtained !== '' ? grade : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sub.marksObtained !== '' ? (
                          <span className={`text-xs font-medium ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isPass ? 'Pass' : 'Failed'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sub.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                          title="Remove this subject row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Live Calculation Summary Deck */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Live Result Computation Engine
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Auto-evaluated as marks are entered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-5">
            <div>
              <div className="text-xs text-slate-400">Total Marks Scored</div>
              <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
                {liveEvaluation.result.totalObtained}
                <span className="text-sm font-normal text-slate-400"> / {liveEvaluation.result.totalMax}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Percentage</div>
              <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
                {liveEvaluation.result.percentage}%
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Result Status</div>
              <div className="flex items-center gap-1.5 mt-1">
                {liveEvaluation.result.isPassed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-lg font-bold tracking-tight text-emerald-300">
                      PASSED
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="text-lg font-bold tracking-tight text-rose-300">
                      FAILED
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Letter Grade & CGPA</div>
              <div className="text-lg font-bold font-mono-numbers text-white mt-1">
                Grade {liveEvaluation.result.overallGrade}
                <span className="text-xs font-normal text-slate-400 ml-1.5">
                  ({liveEvaluation.result.cgpa} GPA)
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <div className="text-xs text-slate-400">Division Classification</div>
              <div className="text-sm font-medium text-slate-200 mt-1 truncate" title={liveEvaluation.result.division}>
                {liveEvaluation.result.division}
              </div>
            </div>
          </div>

          {!liveEvaluation.result.isPassed && liveEvaluation.result.failedSubjects.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-rose-300 flex items-center gap-2">
              <span className="font-semibold">Deficiency Notice:</span>
              <span>
                Scores below 33 in: {liveEvaluation.result.failedSubjects.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Section 4: Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFormToDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>
              {initialStudent ? 'Update & Save Evaluation' : 'Calculate, Save & Generate Result'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
