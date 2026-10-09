import React from 'react';
import { Database, UserPlus, GraduationCap, TableProperties, Upload } from 'lucide-react';

interface HeaderProps {
  activeTab: 'directory' | 'register' | 'analytics';
  setActiveTab: (tab: 'directory' | 'register' | 'analytics') => void;
  onOpenJsonInspector: () => void;
  onOpenImport: () => void;
  onNewRegistration: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenJsonInspector,
  onOpenImport,
  onNewRegistration,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Academia Records
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('directory')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'directory'
                ? 'text-slate-950 font-semibold border-b-2 border-slate-950 pb-0.5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Records
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'register'
                ? 'text-slate-950 font-semibold border-b-2 border-slate-950 pb-0.5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marks Entry
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'text-slate-950 font-semibold border-b-2 border-slate-950 pb-0.5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cohort Analytics
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap border border-slate-200"
            title="Import student records from Excel, CSV, PDF, or JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            type="button"
            onClick={onOpenJsonInspector}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap border border-slate-200"
            title="Inspect stored student JSON data"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Storage</span> JSON
          </button>
          <button
            type="button"
            onClick={onNewRegistration}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>
    </header>
  );
};
