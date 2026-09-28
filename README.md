# AttendAI — AI-Powered Attendance Calculator & Tracker

**AttendAI** is a production-ready web application that transforms college timetable images into a personalized attendance dashboard with automatic 75% attendance calculations, batch-specific filtering, and smart insights.

---

## 🌟 Key Features

1. **AI Timetable Vision Extraction**
   - Upload any college timetable image (PNG, JPG, JPEG, WEBP, or PDF).
   - Powered server-side by Google Gemini Vision AI (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-2.5-flash`).
   - Automatically detects days, time slots, course names, subject codes, faculty, room numbers, lecture vs. lab types, and batch divisions (e.g. D1, D2, D1+D2).
   - Flags blurry or ambiguous cells with a warning indicator instead of inventing false information.

2. **Timetable Review & Personalization Screen**
   - Editable grid allowing students to verify detected days, subjects, rooms, and batches before finalizing their tracker.
   - Batch selection (D1, D2, D3, D4, All) filters only relevant practicals/labs to your schedule.
   - Option to start tracking from today or from semester beginning.

3. **Attendance Dashboard & 75% Calculator**
   - **True Overall Attendance Formula**:
     $$\text{Overall } \% = \frac{\sum \text{attended across all subjects}}{\sum \text{conducted across all subjects}} \times 100$$
     *(Never averages subject percentages).*
   - **Safe Miss Buffer ($M$)**: Computes the maximum number of classes you can miss while staying at or above 75%:
     $$M = \max\left(0, \left\lfloor \frac{A \times 100}{\text{target}} \right\rfloor - C\right)$$
   - **Recovery Classes Needed ($N$)**: If below 75%, computes minimum consecutive classes required to reach 75%:
     $$N = \max\left(0, \left\lceil \frac{\text{target} \times C - 100 \times A}{100 - \text{target}} \right\rceil\right)$$
   - Interactive **What-If Simulator** and future projections (after 1, 5, 10 classes).

4. **Daily Attendance ("Today" Page)**
   - Automatically determines today's scheduled classes from your timetable and batch.
   - Instant marking: `[Present]`, `[Absent]`, `[Cancelled]`.
   - Single-click "Mark All Present" / "Mark All Absent".
   - Scheduled breaks, lunch, and cancelled classes are automatically excluded from conducted counts.

5. **Calendar / History & Holidays**
   - Monthly calendar with color-coded day attendance tags.
   - Click any date to review or retroactively correct attendance.
   - Holiday marking: Days marked as holidays do not count scheduled classes as conducted.
   - Add extra / unscheduled remedial classes that count toward attendance.

6. **Analytics & Reports**
   - Subject-wise comparison bar chart with the mandatory 75% benchmark line.
   - Donut chart of classes attended vs. missed.
   - Weekly attendance pattern breakdown (Monday–Saturday).

7. **Data Persistence & Privacy**
   - Data persists across browser refreshes via `localStorage`.
   - Export and import JSON backup files.
   - Zero image harvesting: uploaded images are processed in-memory for extraction only and are never saved to disk.
   - `GEMINI_API_KEY` is kept on the server and is never exposed to browser client JavaScript.

8. **Instant Demo Mode**
   - Click **"Try Demo"** to evaluate the complete application instantly with a realistic 5th Semester Computer Science engineering timetable (6 courses, multiple lab batches, historical records, and holidays) without requiring an API key.

---

## 🛠️ Project Structure

```
c:\Attendance\
├── .env.example                     # Environment template with GEMINI_API_KEY
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Project dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── extract-timetable/   # Server-side Gemini Vision API route
│   │   │       └── route.ts
│   │   ├── globals.css              # Modern design system & CSS styling
│   │   ├── layout.tsx               # Root layout & SEO meta tags
│   │   └── page.tsx                 # Core page coordinator
│   ├── components/
│   │   ├── analytics/
│   │   │   └── AnalyticsView.tsx    # Charts, comparison bars, donut breakdown
│   │   ├── calendar/
│   │   │   └── CalendarView.tsx     # Monthly calendar & date inspector
│   │   ├── common/
│   │   │   └── ToastContainer.tsx   # Toast notifications
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx    # Main KPI cards, 75% overview & insights
│   │   ├── navigation/
│   │   │   ├── MobileNav.tsx        # Mobile bottom navigation bar
│   │   │   └── Sidebar.tsx          # Desktop sidebar navigation
│   │   ├── review/
│   │   │   └── TimetableReview.tsx  # Timetable verification & personalization
│   │   ├── settings/
│   │   │   └── SettingsView.tsx     # Profile, backups, batch & theme settings
│   │   ├── subjects/
│   │   │   └── SubjectsView.tsx     # Subject cards & What-If simulator modal
│   │   ├── timetable/
│   │   │   └── TimetableEditorView.tsx # Master weekly schedule manager
│   │   └── upload/
│   │       └── HeroUpload.tsx       # Landing page & drag-and-drop vision upload
│   ├── context/
│   │   └── AttendanceContext.tsx    # Global React state & action handlers
│   ├── lib/
│   │   ├── attendanceCalculations.ts     # Core mathematical formulas & edge cases
│   │   ├── attendanceCalculations.test.ts # Vitest suite covering all 11+ test cases
│   │   ├── demoData.ts              # Pre-populated realistic engineering demo
│   │   ├── gemini.ts                # Gemini Vision prompt & extraction helper
│   │   └── storage.ts               # Local persistence & backup exporter
│   └── types/
│       └── index.ts                 # Full TypeScript interface definitions
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Install Dependencies
```bash
npm install
```
*(On Windows PowerShell with disabled script execution policy, use `npm.cmd install`)*

### 3. Configure GEMINI_API_KEY
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> **How to get a key:** You can generate a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
> *Note: If you don't have an API key right now, you can still test every single feature of AttendAI using the built-in **"Try Demo"** mode!*

### 4. Run Unit Tests
To run the automated test suite for attendance calculation formulas and edge cases:
```bash
npx vitest run
```
*(Tests all 12 edge cases including 0/0, 0/10, 10/10, 7/10, exactly 75%, below 75%, cancelled classes, holidays, batch filtering, and aggregate overall attendance).*

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧮 How Attendance Calculations Work

1. **Subject Percentage**:
   $$\text{Attendance } \% = \frac{\text{Attended Classes}}{\text{Conducted Classes}} \times 100$$
   - If conducted is 0, defaults safely to 100% (or 0 conducted).
   - Cancelled classes and holidays never increment conducted classes.

2. **Overall Attendance**:
   $$\text{Overall } \% = \frac{\text{Total Attended Across All Courses}}{\text{Total Conducted Across All Courses}} \times 100$$
   *Crucial distinction*: We never average subject percentages (which creates mathematical bias when subjects have different class counts).

3. **75% Attendance Margin**:
   - **Buffer to miss**: $\lfloor \frac{A \times 100}{75} \rfloor - C$ (when $\ge 75\%$).
   - **Consecutive classes needed**: $\lceil 3C - 4A \rceil$ (when $< 75\%$).

---

## 🔒 Security & Privacy

- **Server-Side API Handling**: All calls to the Gemini Vision API happen through Next.js Route Handlers (`/api/extract-timetable`). The `GEMINI_API_KEY` is kept server-side and is never sent to the browser.
- **No File Storage**: Timetable images are read in-memory as Base64 strings, processed by the vision model, and discarded immediately. No student photos or college documents are saved to disk or third-party servers.

---

## ⚠️ Notes & Limitations

- Extremely blurry or torn physical timetable photos with illegible handwritten text may require minor adjustments in the **Timetable Review Screen** before generating the tracker.
- PDFs uploaded with multiple pages are handled by reading the first page image representation. For best results, take a screenshot of the specific timetable schedule page.
