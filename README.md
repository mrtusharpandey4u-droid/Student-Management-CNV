# Student Registration and Result Management System

An institutional-grade, responsive academic evaluation portal built with **React**, **TypeScript**, and **Tailwind CSS**. This system enables educational administrators and faculty to register students, record and validate subject examination scores in real-time, compute academic grades, generate official printable transcripts, and manage records with browser Local Storage and multi-format data interchange (Excel, PDF, CSV, and JSON).

**Author:** [Tushar Pandey](mailto:mr.tusharpandey4u@gmail.com)  
**Live Demo:** [Open Application](https://ais-pre-nu62bajqhls3dmzwicwoe4-703937557985.asia-southeast1.run.app)  
**License:** MIT  

---

## 🌟 Key Features

### 1. Student Enrollment & Dynamic Marks Entry
- **Biographical Particulars**: Captures Roll/Admission ID, Student Full Name, Grade/Class, Section, Gender, Date of Birth, Guardian Details, Contact Phone, and Email.
- **Dynamic Subject Evaluation Sheet**: Default curriculum subjects (*English Core, Mathematics, General Science, Social Studies, Computer Applications*) with the ability to add, edit, or remove custom disciplines.
- **Client-Side Data Validation**: Immediate inline validation enforcing required fields, roll number uniqueness, name constraints, and numeric marks limits ($0 \le \text{Marks} \le 100$).

### 2. Automated Academic Evaluation Engine
- **Live Calculation**: Instant computation of total marks scored, aggregate percentage, and CGPA as marks are typed.
- **Pass / Fail Determination**: Subject-level cutoff threshold enforcement (minimum 33% required per subject to pass).
- **Institutional Grading**:
  - $90\% - 100\%$: **Grade A+** (10.0 GP · Outstanding)
  - $80\% - 89.9\%$: **Grade A** (9.0 GP · Excellent)
  - $70\% - 79.9\%$: **Grade B** (8.0 GP · Very Good)
  - $60\% - 69.9\%$: **Grade C** (7.0 GP · Good)
  - $50\% - 59.9\%$: **Grade D** (6.0 GP · Satisfactory)
  - $33\% - 49.9\%$: **Grade E** (4.0 GP · Passing)
  - $< 33\%$: **Grade F** (0.0 GP · Essential Repeat / Compartment)
- **Division Classification**: Automatically assigns *First Division with Distinction* ($\ge 75\%$), *First Division* ($\ge 60\%$), *Second Division* ($\ge 50\%$), *Third Division*, or *Compartment / Re-examination*.

### 3. Dynamic Marksheet & Official Transcript Generator
- **Printable Academic Certificate**: High-fidelity transcript featuring an institutional crest, bio-data matrix, tabular marks statement, examiner remarks, and certification signature lines.
- **One-Click PDF Transcript**: Instant PDF generation (`.pdf`) via client-side PDF rendering.
- **Native Print Styles**: Built-in `@media print` rules for browser print-to-paper or save-as-PDF without interface clutter.

### 4. Multi-Format Import & Export
- **Import Formats**:
  - **Microsoft Excel** (`.xlsx`, `.xls`): Batch upload spreadsheets with student details and subject scores.
  - **Comma-Separated Values** (`.csv`): Universal delimiter import.
  - **PDF Documents** (`.pdf`): Extracts tabular records from PDF rosters using client-side PDF text parsing.
  - **JSON Backups** (`.json`): Direct restoration of full student schemas.
  - **Raw Tabular Paste**: Copy and paste TSV/CSV tables directly from spreadsheets.
  - **Template Downloads**: Built-in downloads for sample Excel and CSV templates.
- **Export Formats**:
  - **Excel Workbook** (`.xlsx`): Formatted multi-column grade ledger.
  - **Cohort PDF Roster** (`.pdf`): Official summary roster table with institutional headers and pass rates.
  - **Individual Transcript PDF** (`.pdf`): Single student statement of marks.
  - **CSV & JSON**: Standard exports for external data pipelines and local backups.

### 5. Local Storage Persistence & JSON Inspector
- All records are serialized into standard JSON and persisted to the browser's `localStorage` (`academic_records_students_v1`).
- **Interactive JSON Inspector**: Inspect raw JSON payloads, copy to clipboard, or verify payload sizes in real time.
- Pre-seeded with a sample cohort demonstrating distinctions, average scores, and compartment cases, with a one-click reset option.

### 6. Cohort Analytics & Diagnostics
- Summary cards tracking Total Enrolled Students, Pass Rate %, Class Average %, and Academic Topper.
- Grade distribution breakdown and subject-wise mean score indicators.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Spreadsheet Processing**: [SheetJS (xlsx)](https://docs.sheetjs.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **PDF Text Parsing**: [PDF.js (pdfjs-dist)](https://mozilla.github.io/pdf.js/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Plus Jakarta Sans, Newsreader, and JetBrains Mono

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/student-result-management-system.git
   cd student-result-management-system
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready assets will be generated in the `dist` folder.

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
├── index.html                      # HTML5 entry point & web fonts
├── package.json                    # Project metadata & npm dependencies
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build configuration
├── src/
│   ├── main.tsx                    # Application bootstrap
│   ├── App.tsx                     # Main layout & tab orchestration
│   ├── index.css                   # Tailwind v4 setup & @media print styles
│   ├── types.ts                    # TypeScript types (Student, SubjectMark, Result)
│   ├── components/
│   │   ├── Header.tsx              # Institutional top bar
│   │   ├── StudentForm.tsx         # Enrollment form with live evaluation
│   │   ├── StudentTable.tsx        # Searchable student ledger & export tools
│   │   ├── MarksheetModal.tsx      # Formal printable academic transcript
│   │   ├── ImportModal.tsx         # Multi-format import (Excel, PDF, CSV, JSON)
│   │   ├── AnalyticsOverview.tsx   # Cohort performance metrics & distributions
│   │   ├── JsonInspectorModal.tsx  # Local Storage JSON viewer & raw exporter
│   │   └── ConfirmationModal.tsx   # Deletion & reset confirmation dialogs
│   └── utils/
│       ├── gradeCalculator.ts      # Grading rules, CGPA, and pass/fail logic
│       ├── storage.ts              # LocalStorage JSON engine & seed cohort
│       └── fileImportExport.ts     # Excel, CSV, PDF read & write operations
```

---

## 📋 Data Import Specifications

When importing records via Excel (`.xlsx`), CSV, or PDF, the system recognizes the following columns:

| Column Header | Example | Description |
| :--- | :--- | :--- |
| `Roll Number` | `ADM-2026-101` | Unique student identifier |
| `Full Name` | `Ananya Sharma` | Candidate full name |
| `Class` | `Class 10` | Academic grade or class |
| `Section` | `A` | Class section |
| `Gender` | `Female` | Gender identity |
| `Guardian Name` | `Rajesh Sharma` | Father / guardian name |
| `Contact` | `+91 98765 43210` | Guardian telephone |
| `Email` | `ananya@school.edu`| Contact email |
| `Attendance %` | `94` | Attendance percentage |
| `English Core` | `88` | Score out of 100 |
| `Mathematics` | `95` | Score out of 100 |
| `General Science` | `91` | Score out of 100 |
| `Social Studies` | `85` | Score out of 100 |
| `Computer Applications` | `96` | Score out of 100 |

*Note: You can download pre-populated Excel (`.xlsx`) and CSV templates directly from the in-app Import dialog.*

---

## 👤 Author

**Tushar Pandey**
- Email: [mr.tusharpandey4u@gmail.com](mailto:mr.tusharpandey4u@gmail.com)
- Project: Student Registration and Result Management System

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for academic, personal, and commercial usage.
