import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  BarChart3 
} from 'lucide-react';
import { Student } from '../types';

interface AnalyticsOverviewProps {
  students: Student[];
  onViewMarksheet: (student: Student) => void;
  onNavigateToRegister: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  students,
  onViewMarksheet,
  onNavigateToRegister,
}) => {
  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto shadow-xs">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Student Records Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Enroll students or load sample cohort data to inspect class performance statistics and subject averages.
        </p>
        <button
          onClick={onNavigateToRegister}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
        >
          Enroll Student Now
        </button>
      </div>
    );
  }

  // Calculate cohort metrics
  const total = students.length;
  const passed = students.filter((s) => s.result.isPassed).length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  const totalPercentage = students.reduce((acc, s) => acc + s.result.percentage, 0);
  const classAverage = (totalPercentage / total).toFixed(2);

  // Highest scorer / Topper
  const topper = [...students].sort((a, b) => b.result.percentage - a.result.percentage)[0];

  // Grade distributions
  const gradeCounts: { [grade: string]: number } = {
    'A+': 0,
    'A': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'E': 0,
    'F': 0,
  };
  students.forEach((s) => {
    const g = s.result.overallGrade;
    if (gradeCounts[g] !== undefined) {
      gradeCounts[g]++;
    } else {
      gradeCounts[g] = 1;
    }
  });

  // Subject performance calculation
  const subjectMap: { [name: string]: { totalMarks: number; count: number; maxMarks: number } } = {};
  students.forEach((s) => {
    s.subjects.forEach((sub) => {
      if (!subjectMap[sub.name]) {
        subjectMap[sub.name] = { totalMarks: 0, count: 0, maxMarks: sub.maxMarks };
      }
      subjectMap[sub.name].totalMarks += sub.marksObtained;
      subjectMap[sub.name].count += 1;
    });
  });

  const subjectAverages = Object.entries(subjectMap).map(([name, data]) => ({
    name,
    avg: Number((data.totalMarks / data.count).toFixed(1)),
    maxMarks: data.maxMarks,
    pct: Number(((data.totalMarks / (data.count * data.maxMarks)) * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* 4 Core Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-numbers text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">active records</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="text-emerald-700 font-medium">{passed} passed</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700 font-medium">{failed} failed</span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cohort Pass Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-numbers text-slate-900">{passRate}%</span>
            <span className="text-xs text-slate-500">qualifying ratio</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {passed} out of {total} candidates passed all disciplines
          </div>
        </div>

        {/* Class Average Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Average
            </span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono-numbers text-slate-900">{classAverage}%</span>
            <span className="text-xs text-slate-500">mean aggregate</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Evaluated across standard examination subjects
          </div>
        </div>

        {/* Class Topper / Rank 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Academic Topper
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-slate-900 truncate" title={topper?.fullName}>
              {topper?.fullName || '—'}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="font-mono-numbers font-semibold text-slate-800">
                {topper?.result.percentage.toFixed(2)}%
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-numbers">{topper?.rollNumber}</span>
            </div>
          </div>
          {topper && (
            <button
              onClick={() => onViewMarksheet(topper)}
              className="mt-2 text-xs font-medium text-slate-700 hover:text-slate-950 underline transition-colors"
            >
              View Topper Marksheet →
            </button>
          )}
        </div>
      </div>

      {/* Grade Distribution & Subject Performance Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Grade Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-500">N = {total} students</span>
          </div>

          <div className="space-y-3">
            {[
              { grade: 'A+', label: 'Outstanding (90–100%)', count: gradeCounts['A+'] },
              { grade: 'A', label: 'Excellent (80–89%)', count: gradeCounts['A'] },
              { grade: 'B', label: 'Very Good (70–79%)', count: gradeCounts['B'] },
              { grade: 'C', label: 'Good (60–69%)', count: gradeCounts['C'] },
              { grade: 'D', label: 'Satisfactory (50–59%)', count: gradeCounts['D'] },
              { grade: 'E', label: 'Passing (33–49%)', count: gradeCounts['E'] },
              { grade: 'F', label: 'Failed (<33%)', count: gradeCounts['F'] },
            ].map((item) => {
              const pctOfCohort = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.grade} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      Grade {item.grade}{' '}
                      <span className="font-normal text-slate-500 ml-1">({item.label})</span>
                    </span>
                    <span className="font-mono-numbers text-slate-700 font-semibold">
                      {item.count}{' '}
                      <span className="text-slate-400 font-normal">({pctOfCohort.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.grade === 'F' ? 'bg-rose-500' : 'bg-slate-800'
                      }`}
                      style={{ width: `${pctOfCohort}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject-Wise Mean Scores */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Subject-Wise Mean Scores
              </h3>
            </div>
            <span className="text-xs text-slate-500">Class Average per Subject</span>
          </div>

          <div className="space-y-3.5">
            {subjectAverages.map((sub) => (
              <div key={sub.name} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800">{sub.name}</span>
                  <span className="font-mono-numbers text-slate-900 font-semibold">
                    {sub.avg} <span className="text-slate-400 font-normal">/ {sub.maxMarks} ({sub.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      sub.pct >= 75
                        ? 'bg-emerald-600'
                        : sub.pct >= 50
                        ? 'bg-slate-700'
                        : 'bg-amber-600'
                    }`}
                    style={{ width: `${Math.min(sub.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
