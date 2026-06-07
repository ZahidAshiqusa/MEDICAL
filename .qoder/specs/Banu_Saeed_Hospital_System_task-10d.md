# BANU SAEED HOSPITAL - Complete Hospital Management System

## Context
Build a full-featured hospital management PWA with 5 pages, modern light-theme dashboard, serverless backend using Vercel + GitHub API for data persistence, QR-based attendance, and appointment token system.

## Tech Stack
- **React 18 + Vite + TypeScript** (CSS Modules for styling)
- **Google Fonts**: Poppins (headings) + Inter (body)
- **react-icons**: SVG icons instead of emoji
- **html5-qrcode**: QR scanner with camera switch
- **html2canvas**: Token card HD screenshot download
- **vite-plugin-pwa**: Service worker + manifest auto-generation
- **Vercel Serverless**: API functions in `api/` directory
- **GitHub Contents API**: Persist JSON data files (stateless serverless workaround)

## Environment Variables (Vercel Dashboard)
- `VITE_ADMIN_PASSWORD`, `VITE_DASHBOARD_PASSWORD`, `VITE_ATTENDANCE_PASSWORD`
- `GITHUB_TOKEN` (PAT with contents read/write), `GITHUB_REPO`, `GITHUB_OWNER`

## File Structure
```
├── api/                          # Vercel serverless functions
│   ├── staff.ts                  # CRUD staff (auto 12-digit ID)
│   ├── appointments.ts           # CRUD appointments + token counter
│   ├── attendance.ts             # CRUD attendance
│   └── complaints.ts             # CRUD complaints
├── data/                         # JSON seed files
│   ├── staff.json, appointments.json, attendance.json
│   ├── complaints.json, token-counter.json
├── public/                       # PWA icons, scan sound
├── src/
│   ├── main.tsx, App.tsx, index.css
│   ├── styles/                   # variables.css, animations.css
│   ├── utils/                    # types.ts, githubCommit.ts, formatters.ts, qrGenerator.ts
│   ├── hooks/                    # useApi.ts, useInstallPrompt.ts
│   ├── components/               # Header, Footer, PasswordGate, QRScanner, TokenCard, InstallPrompt, LoadingSpinner
│   └── pages/                    # Home, Admin(+sub-managers), Dashboard, Appointments, Attendance
├── index.html, vite.config.ts, vercel.json, tsconfig.json, package.json
```

## Implementation Tasks

### Task 1: Project Skeleton
- Create `package.json` with all dependencies
- Create `index.html` with Google Fonts links, meta tags, PWA manifest link
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vercel.json`
- Create `src/main.tsx`, `src/App.tsx` (router shell), `src/index.css`
- Create `src/styles/variables.css` (light theme colors), `src/styles/animations.css`
- Create `src/utils/types.ts` (all TypeScript interfaces)
- Run `npm.cmd install`

### Task 2: Data Layer + Serverless API
- Initialize `data/*.json` files (empty arrays + `{"nextToken": 1}`)
- Create `src/utils/githubCommit.ts` (read-mutate-commit via GitHub API with retry on 409)
- Create `src/utils/formatters.ts`
- Create all 4 API endpoints: `api/staff.ts`, `api/appointments.ts`, `api/attendance.ts`, `api/complaints.ts`
- Create `src/hooks/useApi.ts` (generic fetch hook)

### Task 3: Shared Components
- **Header**: Sticky nav with hospital name, links, mobile hamburger
- **Footer**: Developer credit (DANISH RASOOL JOIYA, +923291001302 phone + WhatsApp links)
- **PasswordGate**: Password prompt modal, stores auth in sessionStorage
- **LoadingSpinner**: SVG spinner
- **InstallPrompt**: PWA install banner using `beforeinstallprompt`

### Task 4: Main Page (/)
- Hero section: "BANU SAEED HOSPITAL" large typography + tagline
- Feature cards grid: Best Staff, Clean Rooms, Wheelchair, No Waiting, Online Appointments (SVG icons)
- CTA button to /appointments

### Task 5: Appointments Page (/appointments)
- Form: patient name, ID card (optional), age, phone, issue, doctor dropdown (default "Regular")
- On submit: POST to API, get token number (never resets)
- **TokenCard** component: styled card with hospital header, token number, patient details, datetime
- Download button: html2canvas at 2x scale -> PNG download

### Task 6: Admin Page (/admin) - Password Protected
- Tab layout: Staff / Appointments / Attendance / Complaints
- **StaffManager**: Add (name, role dropdown, field, phone) with auto 12-digit ID, table with search, delete button, QR code display
- **AppointmentManager**: Add/edit/delete appointments table with filters
- **ComplaintManager**: View complaints, toggle resolved/unresolved, delete, add new
- **AttendanceManager**: View/delete attendance records

### Task 7: Dashboard Page (/dashboard) - Password Protected
- Analytics only, no edit buttons
- Appointment stats: total day/week/month, filter by doctor
- Attendance stats: total day/week/year, filter by name/role
- Complaint overview: total vs resolved with percentage bar
- Summary cards with large numbers and SVG icons

### Task 8: Attendance Page (/attendance) - Password Protected
- Name search mode: filter staff list, click to mark attendance
- QR scanner mode: camera icon top-right opens scanner
  - `html5-qrcode` with camera switch (front/rear)
  - Smooth scan-line animation, success sound on scan
  - Continuous scanning (don't stop camera after scan)
- Attendance list: today's entries with edit/delete buttons, clickable for detail modal
- Each entry shows staff name, role, check-in time

### Task 9: QR Scanner Component
- Full-screen camera overlay
- Camera enumeration and switch button
- Scan success: play sound, show "Scanned Successfully" animation, call callback with staff ID
- Close button, doesn't stop camera between scans

### Task 10: PWA Setup
- Configure `vite-plugin-pwa` in vite.config.ts (name, icons, theme color, workbox caching)
- Generate PWA icons (logo-192.png, logo-512.png)
- Wire InstallPrompt component in App.tsx
- Service worker auto-registration

## Data Persistence Pattern
All write operations follow: Read file from GitHub API -> Mutate in memory -> Commit back with SHA -> Retry on 409 conflict. Token counter uses atomic increment with max 5 retries.

## npm Workaround
PowerShell scripts blocked - use `npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build`.

## Verification
1. `npm.cmd run dev` - confirm all 5 pages render
2. Navigate to /appointments, submit form, verify token card appears with download
3. Test admin page password gate, add staff, verify 12-digit ID
4. Test QR scanner on attendance page (requires HTTPS or localhost)
5. Check dashboard analytics filters
6. Run `npm.cmd run build` - verify no errors
7. Test PWA install prompt in browser