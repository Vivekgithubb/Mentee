# MEntee — Institutional Mentor–Mentee Management System

A unified, secure, data-driven **Single Source of Truth for Student Development** built with React, JavaScript, Tailwind CSS, Space Grotesk typography, Express, MongoDB, and Cloudinary.

---

## 🔒 Strict Privacy & Access Control Architecture

### 1. Critical Document Privacy Policy
- **Student + Currently Assigned Mentor Exclusivity**:
  - A student's uploaded documents (marks cards, certificates, resumes, identity records) are **accessible strictly to that student and their currently assigned faculty mentor**.
  - **HODs and Administrators are explicitly prohibited** from browsing, inspecting, or downloading private student files.
  - Calling direct download endpoints (`GET /api/documents/:id/download`) or manipulating document IDs returns HTTP 403 Forbidden for unauthorized roles, including HODs and Admins.
  - Former mentors lose document access automatically as soon as an HOD reassigns the student to a new mentor.

### 2. HttpOnly Cookie Authentication
- Access tokens are issued by the Express backend and transmitted strictly via `HttpOnly`, `SameSite: Lax` (or `None` with secure flag in production) cookies.
- Authentication secrets and plaintext passwords are **never stored** in `localStorage`, `sessionStorage`, or returned in JSON bodies.
- Client React components maintain sensitive form fields in memory only and discard them upon completion.

---

## 👥 1. HOD Mentor Assignment & Workload Management

Dedicated **Mentor Assignments** portal (`/mentor-assignments`) within the HOD and Administrator dashboard:
- **Searchable & Filterable Directory**: Filter by semester, section, and assignment status (Assigned vs. Unassigned), or search by student and mentor names.
- **Workload & Capacity Tracking**: Inspect real-time faculty mentee loads (e.g., 8/25 active mentees) and department mentor availability.
- **Assignment & Reassignment Workflow**:
  - Assign unassigned students to available faculty mentors.
  - Reassign existing students with mandatory change rationale.
  - Assignment history is permanently tracked in MongoDB with previous mentor, new mentor, assigning HOD, reason, and timestamps.
  - Automated database-backed notifications are delivered to both student and mentors upon allocation.

---

## 📊 2. Semester-Wise Academic Records Module

Comprehensive academic marks tracking accessible at `/academic-records`:
- **Chronological Semester Cards**: Chronological display of semester performance cards from Semester 1 through the current semester.
- **Subject-Wise Entry**: Subject code, subject name, internal marks, external marks, total marks, maximum marks, credits, grade, and grade points.
- **Accurate Metric Calculations**:
  - Auto-calculated subject totals and percentage.
  - Accurate credit-weighted SGPA calculation for each semester.
  - Cumulative CGPA auto-averaged across all completed semesters and synchronized with the student's 360 profile.
- **Role-Based Mark Editing Permissions**:
  - **Students**: Can create and edit their own semester marks. Prevented from editing other students' records (HTTP 403).
  - **Assigned Mentors**: Can add missing semesters and edit marks for their currently assigned mentees. Blocked from editing unassigned students (HTTP 403).
- **Academic Audit Trail**: Every change logs the modifying user ID, role, previous SGPA/values, new values, modification reason, and timestamp.

---

## 📑 3. Document Approval & Verification Workflow

Robust multi-stage verification workflow for student document submissions:
- **Lifecycle States**:
  `PENDING_REVIEW` → `APPROVED` (with mentor comment)
  `PENDING_REVIEW` → `REJECTED` (with mandatory rejection feedback for student correction)
- **Mentor Review Queue (`GET /api/mentor/document-reviews`)**:
  - Mentors review pending submissions from their assigned mentees.
  - **Approve Action**: Verifies authenticity, marks status as `APPROVED`, logs reviewer details, and alerts student.
  - **Reject Action**: Requires mandatory correction explanation, marks status as `REJECTED`, alerts student to resubmit, and preserves previous review attempts.
- **Student Resubmission**: Students can view rejection comments and replace or resubmit updated files cleanly.

---

## 📅 4. Appointment & Mentoring Meetings Scheduling

Dedicated advisory appointment system (`/meetings`):
- **Mentor Scheduling Action**:
  - Select assigned mentee from active cohort.
  - Specify title, purpose (Academic Review, Attendance Counseling, Career Guidance, etc.), agenda, date, start/end time, duration, and preparation instructions.
  - Choose mode: In-Person (office cabin) or Online (virtual conference URL).
- **Appointment Lifecycle**:
  `SCHEDULED` → `RESCHEDULED` → `COMPLETED` or `CANCELLED`
- **Meeting Records & Discussion Notes**:
  - Mentors record discussion points, student concerns, observations, action items, and follow-up dates.
  - Completed discussion outcomes are preserved permanently and linked to the student's 360 profile as a persistent advising record.
- **Student Interface**: Students view upcoming sessions, video call links, agendas, and post-session action items on their dashboard.

---

## 🚀 API Endpoint Reference

### HOD Mentor Assignments
- `GET /api/hod/mentor-assignments` — Search and filter department student assignments.
- `GET /api/hod/unassigned-students` — List department students currently without an assigned mentor.
- `GET /api/hod/available-mentors` — List faculty mentors with current mentee count and workload capacity.
- `POST /api/hod/mentor-assignments` — Assign mentor to student.
- `PATCH /api/hod/mentor-assignments/:id` — Reassign student mentor and append to audit history.

### Academic Records
- `GET /api/academics/records?studentId=...` — Retrieve chronological semester records.
- `POST /api/academics/records` — Create or update semester marks (Student or Assigned Mentor).
- `DELETE /api/academics/records/:id` — Delete draft semester record.
- `GET /api/academics/records/:id/history` — Inspect semester modification audit trail.

### Documents & Privacy
- `GET /api/documents` — Strict privacy listing (Student sees self, Mentor sees assigned mentees, HOD/Admin receives 0).
- `POST /api/documents/upload` — Upload document (starts in `PENDING_REVIEW`).
- `GET /api/documents/:id/download` — Authorized download proxy (HOD/Admin strictly returns 403).
- `PUT /api/documents/:id/replace` — Replace document file with updated revision.
- `DELETE /api/documents/:id` — Delete document file and clean up cloud storage.
- `GET /api/mentor/document-reviews` — Dedicated review queue for assigned mentor.
- `POST /api/documents/:id/approve` — Mentor approves submission.
- `POST /api/documents/:id/reject` — Mentor rejects submission with mandatory reason.

### Mentoring Appointments
- `POST /api/meetings` — Mentor schedules appointment with assigned mentee.
- `GET /api/meetings` — List upcoming and past appointments for authenticated user.
- `GET /api/meetings/:id` — Retrieve detailed session record.
- `PATCH /api/meetings/:id` — Reschedule meeting date/time/venue.
- `POST /api/meetings/:id/cancel` — Cancel appointment.
- `POST /api/meetings/:id/complete` — Mark meeting completed and record discussion notes & action items.

### 360° Profiles & Document Requests
- `GET /api/mentor/mentees` — Retrieve assigned mentees list for meeting dropdown and roster.
- `GET /api/mentors/:id` — HOD 360° profile view of faculty mentor (department-scoped; no private documents exposed).
- `GET /api/students/:id` — Role-scoped 360° view of student profile (self, assigned mentor, or department HOD; private documents omitted).
- `POST /api/document-requests` — Mentor requests document from assigned mentee.
- `GET /api/document-requests` — List document requests for authenticated student or mentor.
- `POST /api/document-requests/:id/review` — Mentor reviews submitted document request (`APPROVED` or `REJECTED` with reason).

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mentee_db
JWT_SECRET=your_super_secure_jwt_secret_key_2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Cloud Storage (falls back to local disk if unpopulated)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🧪 Testing & Verification

Run the comprehensive end-to-end acceptance test suite covering all modules:
```bash
cd server
node test_security_and_workflows.js
```

### Verified Test Suites:
1. **HOD Mentor Allocation & Workload**: Assign, reassign, unassigned student filtering, unauthorized blocking.
2. **Academic Records**: Student mark entry, SGPA auto-calculation, mentor mark editing, audit trail, cross-student modification rejection.
3. **Strict Document Privacy**: Student and assigned mentor authorized access; HOD and Admin strictly blocked with HTTP 403 Forbidden.
4. **Document Approval Workflow**: Review queue, approval state transition, rejection with mandatory reason, notification dispatch.
5. **Mentoring Appointments**: Meeting creation, student visibility, rescheduling, completion with discussion notes and action items, unassigned mentor rejection.
6. **360° Profiles & Document Requests**: Mentee dropdown population, HOD mentor profile with department scope guard, assigned mentor mentee profile access, unassigned mentor rejection (403), document upload against request with status transitions (`UNDER REVIEW` → `APPROVED` / `REJECTED`), and mandatory rejection reason validation.
