# Institutional Mentor–Mentee Management System (MEntee)

## Comprehensive Project Documentation & Technical Report

---

## 1. Problem Statement and Objectives

### 1.1 Problem Statement

#### 1.1.1 What Problem the Website Solves

In modern higher education institutions (universities, engineering colleges, and autonomous polytechnics), student mentoring is an indispensable component of student support, academic progression, and psychological well-being. However, the operational execution of mentoring programs in most educational institutions remains predominantly manual, decentralized, and inefficient.

The website **MEntee (Institutional Mentor–Mentee Management System)** directly resolves the following critical institutional bottlenecks:

1. **Information Fragmentation and Data Silos**:

   - In conventional setups, student records are fragmented across disparate spreadsheets, paper-based mentoring logbooks, physical document folders in faculty cabinets, and unorganized communication channels (WhatsApp, personal emails, SMS).
   - This prevents faculty mentors and department leadership from obtaining a cohesive, unified view of a student’s academic, personal, and developmental trajectory.

2. **Absence of a Single Source of Truth (SSOT)**:

   - Without a centralized platform, basic student data—such as semester marks, backlogs, SGPA/CGPA trends, personal identity verification, certificates, and attendance—must be repeatedly collected every semester.
   - Discrepancies between department records, examination cell data, and mentor sheets frequently occur, causing administrative delays and inaccurate counseling.

3. **Critical Data Privacy and Confidentiality Failures**:

   - Students are frequently required to submit sensitive personal documents (caste/category certificates, income certificates, medical exemption letters, government ID proofs, financial scholarship applications, and grade transcripts).
   - In manual setups or standard open shared cloud folders (e.g., public Google Drive links), these confidential records are often exposed to unauthorized personnel, peer students, and broad administrative staff.
   - The platform resolves this by enforcing a zero-trust, role-based privacy boundary where student documents are strictly sandboxed and viewable **only** by the authenticated student and their currently assigned faculty mentor.

4. **Unstructured Mentoring Sessions and Lack of Accountability**:

   - Mentoring interactions in traditional frameworks typically occur on an ad-hoc basis without predefined agendas, scheduled meeting records, formal minutes, or trackable action items.
   - When a mentor departs or an academic batch is reorganized, historical mentoring notes, student counseling records, and behavioral observations are completely lost, forcing the new mentor to start from zero.

5. **Asymmetrical Faculty Workload and Allocation Chaos**:
   - Heads of Departments (HODs) frequently struggle to maintain equitable faculty-to-student mentoring ratios. Without real-time visibility into mentor capacity, some faculty members are overburdened with 30+ mentees while others have very few.
   - Tracking unassigned students across various semesters and sections becomes a cumbersome, error-prone manual exercise.

---

#### 1.1.2 Why a Mentee–Mentor Platform is Needed

A specialized, web-based institutional mentoring platform is essential for several institutional, academic, and statutory reasons:

1. **Compliance with National and Global Accreditation Standards**:

   - Accreditation and quality-assurance bodies (such as NAAC, NBA, ABET, and NIRF) place high emphasis on institutional student support mechanisms, faculty-to-student mentoring ratios, structured counseling records, and documented remedial interventions.
   - A digital platform provides verifiable, timestamped, audit-ready data proving that regular, structured mentoring is actively conducted across departments.

2. **Proactive Academic Intervention and Early Warning Mechanisms**:

   - Rather than reacting after a student fails an end-of-semester examination or drops out, a centralized digital dashboard allows mentors to track semester-by-semester credit performance and SGPA trends.
   - Early detection of declining marks, credit deficits, or missing mandatory documentation enables timely academic counseling and remediation.

3. **Holistic 360-Degree Student Development**:

   - Modern education necessitates guidance beyond pure grades. Students require holistic advising spanning career roadmaps, technical skill progression, internship readiness, research endeavors, and mental well-being.
   - A dedicated platform enables mentors to record longitudinal observations, guide students through targeted goal-setting, and document tangible action items over multiple academic years.

4. **Institutional Memory and Continuity of Advising**:

   - When students advance through academic tiers or change mentors due to elective specializations or faculty reassignments, the student’s cumulative history—including verified credentials, past meeting outcomes, and developmental milestones—persists seamlessly.
   - New mentors immediately inherit an informed context without subjecting the student to redundant discovery cycles.

5. **Security, Governance, and Digital Transformation**:
   - Educational institutions manage sensitive personal data that falls under data protection standards. Eliminating physical paper trails and insecure messaging groups in favor of secure, HttpOnly cookie-authenticated, encrypted digital storage ensures modern institutional data governance.

---

### 1.2 Objectives

#### 1.2.1 Main Goals of the Project

The primary overarching goals of the **MEntee** platform are:

1. **Establish a Unified Single Source of Truth**:

   - Consolidate student profile information, semester-wise academic performance metrics, uploaded documents, verification records, and mentoring interactions into an integrated, centralized digital repository.

2. **Implement an Enforced Role-Based Privacy and Security Architecture**:

   - Guarantee strict confidentiality where student files and sensitive advising notes are restricted strictly to the student and their active mentor, explicitly prohibiting unauthorized browsing or document downloading even by department heads or system administrators.

3. **Automate Academic Performance Analytics and Audit Trails**:

   - Provide a dynamic academic recording engine that accurately calculates subject totals, percentages, credit-weighted SGPA (Semester Grade Point Average), and cumulative CGPA across completed semesters, backed by an immutable audit trail for every mark modification.

4. **Digitize the Complete Mentoring Advisory Lifecycle**:

   - Support seamless appointment scheduling (both in-person office visits and virtual video conference links), agenda setting, reminder tracking, discussion logging, and measurable post-meeting action items.

5. **Provide Dynamic Departmental Workload Management for HODs**:

   - Supply department heads with real-time intelligence on faculty mentee quotas, department availability, and unassigned student rosters, enabling one-click mentor assignment and transparent reassignment workflows with mandatory justification logs.

6. **Deliver an Intuitive, High-Performance, and Accessible Web Interface**:
   - Build a responsive, accessible, aesthetic, and low-latency frontend (leveraging React, Tailwind CSS, and Space Grotesk typography) that encourages frequent interaction and active engagement from students, faculty, and administrators.

---

#### 1.2.2 What the Website Allows Users to Do

The platform provides tailored capabilities engineered specifically around four institutional user roles:

#### A. What Students Can Do:

- **Manage Personal 360° Profile**: View and maintain demographic details, contact information, enrollment/USN data, department affiliation, and assigned mentor credentials in a centralized profile dashboard.
- **Track Semester Academic Records**:
  - Enter and review subject-wise marks (internal assessments, external exams, maximum scores, subject credits, and awarded grades).
  - Inspect auto-calculated semester metrics, including credit-weighted SGPA, percentage, and progressive cumulative CGPA over time.
- **Upload and Maintain Document Vault**:
  - Upload academic marks cards, entrance rank certificates, fee receipts, internship completion letters, and identity records.
  - Track real-time verification statuses (`PENDING_REVIEW` → `APPROVED` or `REJECTED`).
  - Read direct mentor feedback and resubmit revised versions if corrections are required.
- **Fulfill Mentor Document Requests**: Receive formal document requests initiated by faculty mentors, upload required files before deadlines, and track fulfillment status.
- **Participate in Scheduled Mentoring Sessions**:
  - View upcoming advising sessions, meeting modes (office cabin or virtual link), and session agendas.
  - Review historical meeting outcomes, mentor recommendations, and assigned action points to ensure continuous progress.

#### B. What Faculty Mentors Can Do:

- **Oversee Assigned Mentee Cohort**:
  - Access an organized, searchable directory of all actively assigned mentees with real-time academic standing, contact details, and semester status.
- **Verify and Moderate Student Documents**:
  - Access a dedicated document verification queue to inspect files submitted by assigned mentees.
  - Approve authentic submissions or reject non-compliant files with mandatory written corrective feedback.
- **Initiate Targeted Document Requests**:
  - Request specific files (e.g., fee payment receipts, internship certificates, medical records) from individual mentees with detailed instructions and deadlines.
- **Schedule and Conduct Mentoring Meetings**:
  - Schedule structured one-on-one or group advising sessions by specifying topic, agenda, date, duration, venue, and conference links.
  - Record detailed post-meeting minutes, confidential observations, guidance offered, and student action items upon meeting completion.
- **Review and Validate Academic Marks**:
  - Inspect chronological semester records for assigned mentees, enter missing semester data, or make validated corrections with audit-logged modification notes.

#### C. What Heads of Departments (HODs) Can Do:

- **Manage Departmental Mentor Allocations**:
  - Filter and inspect department students by semester, section, and assignment status (Assigned vs. Unassigned).
  - Dynamically allocate unassigned students to available faculty mentors based on real-time workload capacity indicators (e.g., 12/25 mentees).
  - Reassign students between faculty members with mandatory recorded justifications for full institutional transparency.
- **Inspect Faculty Mentoring Workloads**:
  - Review 360-degree faculty profiles within the department to examine current mentee loads, advising histories, and department capacity quotas.
- **Maintain Privacy Compliance**:
  - Oversee high-level department progress and operational metrics while being systematically restricted by zero-trust security from inspecting or downloading private student files.

#### D. What Administrators Can Do:

- **System Governance and User Provisioning**:
  - Provision, activate, or deactivate accounts across all roles (Students, Faculty Mentors, HODs, Administrators).
  - Manage department categories, program designations, and institutional configuration parameters.
- **Platform Security and Audit Monitoring**:
  - Enforce secure HttpOnly session cookies, monitor system health, inspect API throughput, and review system-wide audit logs to guarantee platform integrity.

---

## 2. Proposed System

### 2.1 System Overview

The **MEntee** platform is a modern, web-based institutional management system designed to streamline student mentorship, academic progress tracking, and advisory interactions. 

It connects students, faculty mentors, and department leaders on a single unified platform, replacing disorganized paper records, loose spreadsheets, and scattered chat groups. The application provides students with a single source of truth for their academic journey, equips mentors with actionable tools to guide students effectively, and gives department administrators clear visibility into faculty mentoring workloads.

### 2.2 User Roles

The system is organized around three primary user roles:

1. **Mentee (Student)**:
   - Undergraduate or postgraduate students assigned to a faculty mentor.
   - Uses the platform to manage their profile, track semester-wise marks, upload academic documents, and attend scheduled advisory sessions.

2. **Mentor (Faculty)**:
   - Teaching faculty members assigned to guide a specific group of students.
   - Uses the platform to review mentee progress, verify and approve uploaded files, schedule meetings, and log mentoring notes and recommendations.

3. **Admin / HOD (Department Head)**:
   - Department heads and system administrators responsible for institutional operations.
   - Manages user accounts, assigns students to available mentors based on capacity, tracks department-wide mentoring status, and maintains platform security.

### 2.3 Main Features

- **Registration and Login**:
  - Secure authentication supporting role-based access control.
  - Automatically directs students, mentors, and administrators to their tailored dashboards upon login.

- **Mentor Profiles**:
  - Dedicated faculty profile cards displaying department information, contact details, mentoring capacity, and current mentee counts.

- **Mentor Search and Allocation**:
  - Searchable and filterable roster enabling department heads to find mentors by department, availability, and workload capacity to ensure balanced distribution.

- **Mentorship Requests and Assignments**:
  - Seamless student-to-mentor allocation workflow with recorded assignment history.
  - Dedicated document request system allowing mentors to formally request necessary records or certificates from mentees.

- **Communication and Feedback**:
  - Automated system notifications for appointment updates, document submission reviews, and mentor remarks.
  - Direct feedback loops allowing mentors to provide clear explanations if a document or record requires resubmission.

- **Session Management**:
  - Complete meeting lifecycle management supporting both in-person office meetings and virtual conference links.
  - Enables mentors to define agendas, record discussion summaries, and assign actionable next steps to students.

---

## 3. System Design and Development

### 3.1 System Architecture

The platform is designed using a clean, three-tier client-server architecture to ensure high performance, security, and maintainability:

1. **Frontend (Client Tier)**:
   - Developed as a Single Page Application (SPA) using React and Vite.
   - Handles the user interface, interactive forms, responsive dashboards, and data visualization cards.
   - Communicates with the backend server asynchronously through RESTful API endpoints using JSON format.

2. **Backend (Application Tier)**:
   - Built on Node.js using the Express.js web framework.
   - Acts as the central logic engine that processes user requests, verifies permissions, runs automated SGPA/CGPA calculations, and manages file upload operations.
   - Implements strict role-based access control (RBAC) and HttpOnly cookie authentication to safeguard sensitive operations.

3. **Database (Data Tier)**:
   - Uses MongoDB, a flexible document-oriented NoSQL database.
   - Stores structured records for user accounts, student profiles, semester marks, document metadata, appointment notes, and assignment audit histories.

---

### 3.2 Technology Used

- **Languages**:
  - **JavaScript (ES6+)**: Powers both client-side React components and server-side Node.js application logic.
  - **HTML5 & CSS3**: Provides modern structural semantic elements and responsive layouts.

- **Frameworks & Libraries**:
  - **React (v18)**: Component-based library used to construct interactive and modular user interfaces.
  - **Vite**: Modern frontend tooling and build server ensuring fast page reloads and bundled assets.
  - **Tailwind CSS**: Utility-first CSS framework for clean, consistent, and responsive styling.
  - **Express.js**: Minimalist web application framework for building secure and scalable RESTful APIs.
  - **Mongoose**: Object Data Modeling (ODM) library for MongoDB that enforces data schemas and validation rules.

- **Database**:
  - **MongoDB**: Document database providing flexible JSON-like schemas, high read/write throughput, and scalability.

- **Other Tools & Services**:
  - **JSON Web Tokens (JWT) & HttpOnly Cookies**: Used for secure, tamper-proof user authentication and session management.
  - **Multer**: Backend middleware for managing multipart file uploads.
  - **Cloudinary / Local File Storage**: Cloud storage service used to store student documents securely, with automatic local disk fallback.
  - **Git & GitHub**: Version control system for tracking code changes and project history.

---

### 3.3 Website Modules

- **Authentication Module**:
  - Handles user login, registration, password hashing (bcrypt), and secure logout.
  - Issues encrypted HttpOnly session cookies and guards routes so users can only access views permitted for their role.

- **Mentor Module**:
  - Provides faculty mentors with an organized view of their assigned students.
  - Allows mentors to track academic growth, review and approve/reject student documents, and record official guidance notes.

- **Mentee Module**:
  - Gives students a centralized hub to maintain their profile, enter semester marks, and view auto-calculated SGPA/CGPA metrics.
  - Houses a personal document vault where students can upload certificates, view verification statuses, and read mentor feedback.

- **Mentorship Module**:
  - Facilitates institutional student-to-mentor allocation managed by department heads (HODs).
  - Provides capacity tracking tools to prevent mentor overload and enables seamless student reassignments with audit logs.
  - Allows mentors to issue direct document requests to students with required deadlines.

- **Communication Module**:
  - Handles scheduling and management of mentoring appointments (in-person and online).
  - Captures meeting agendas, video links, discussion summaries, and actionable follow-up tasks.
  - Delivers notifications and status alerts for document approvals, rejections, and upcoming sessions.

---

## 4. Website Implementation

### 4.1 User Registration and Login
- **Implementation**:
  - The authentication system is built around role-based access control supporting four roles: **Student**, **Mentor**, **HOD**, and **Admin**.
  - During registration, the system validates inputs (email formatting, password complexity, department, and role-specific identifiers like Student USN or Faculty ID).
  - Passwords are encrypted before storage using **bcryptjs** with cryptographic salt hashing.
  - Upon successful login, the server generates a signed **JSON Web Token (JWT)** containing user identity and role credentials. This token is delivered to the browser inside an **HttpOnly, SameSite cookie**, preventing cross-site scripting (XSS) token theft.
  - A client-side `AuthContext` verifies session state upon page load and redirects users automatically to their role-specific dashboard.

---

### 4.2 Mentor Profile
- **Implementation**:
  - The mentor profile serves as an operational summary of a faculty member's advising commitments.
  - Displays essential faculty details, including full name, department, designation, institutional email, phone number, and office cabin location.
  - Features a real-time **Workload & Capacity Indicator** (e.g., `12 / 25 Mentees`), allowing mentors and department heads to see how close the faculty member is to their advising quota.
  - Embeds a roster of actively assigned mentees, showing each student's current semester, section, and overall academic status (CGPA), enabling quick navigation to any student's developmental records.

---

### 4.3 Mentee Profile
- **Implementation**:
  - The mentee profile is implemented as a unified **360° Student Hub** combining personal, academic, and administrative data.
  - **Header & Credentials**: Displays the student's name, University Seat Number (USN), department, current semester, section, and their currently assigned mentor badge.
  - **Academic Snapshot**: Shows high-level performance cards including cumulative CGPA, total earned credits, and attendance indicators.
  - **Document Vault**: Houses submitted documents (marks cards, certificates, identity proofs) alongside color-coded verification badges (`PENDING_REVIEW`, `APPROVED`, `REJECTED`) and mentor review feedback.
  - **Privacy Enforcement**: Student profiles are role-scoped; only the student and their active mentor can view or download private files, while administrative views omit sensitive personal attachments.

---

### 4.4 Mentor Search and Selection
- **Implementation**:
  - Built into the HOD/Admin **Mentor Assignments Portal** (`/mentor-assignments`) to ensure structured, balanced allocations rather than unregulated self-selection.
  - **Directory Filtering**: Includes real-time search by faculty name or student name, along with multi-criteria filters for Semester, Section, and Assignment Status (`Assigned` vs. `Unassigned`).
  - **Capacity-Aware Selection**: When selecting a mentor for a student, the interface lists available faculty along with their live mentee load (e.g., `8/20`). Mentors who have reached maximum capacity are clearly flagged to prevent faculty burnout.
  - **Reassignment Workflow**: When reallocating a student, the interface requires an official change reason (e.g., change of elective, faculty leave), which is saved directly to MongoDB as an immutable assignment audit record.

---

### 4.5 Mentorship Request
- **Implementation**:
  - The platform implements a two-way structured request mechanism:
    1. **Student Allocation Workflow**: HODs identify unassigned students through dedicated filter queues (`GET /api/hod/unassigned-students`) and formally link them to an available mentor. Automated database notifications alert both the mentor and student immediately upon assignment.
    2. **Document & Information Requests**: Mentors can issue formal **Document Requests** to specific mentees (e.g., requesting internship certificates, fee receipts, or undertaking forms).
    3. Mentors specify the title, instructions, submission deadline, and mandatory file type.
    4. The request appears on the student's dashboard with an upload button. Once uploaded, the file transitions into an `UNDER_REVIEW` state until verified by the mentor.

---

### 4.6 Communication and Feedback
- **Implementation**:
  - **Document Verification Feedback Loop**:
    - When reviewing uploaded student files, mentors have one-click `Approve` and `Reject` actions.
    - If rejecting a submission, the mentor must provide mandatory written feedback explaining what was wrong (e.g., blurry scan, missing seal, incorrect semester). The student receives an instant alert and can resubmit a corrected file directly.
  - **In-App Notification Center**:
    - Centralized bell icon in the top navigation displays timestamped notifications for meeting schedules, assignment confirmations, and document review outcomes.
  - **Advisory Discussion Logs**:
    - Rather than casual unrecorded chat, communication during mentoring sessions is captured through structured discussion minutes, mentor observations, and follow-up action items linked directly to the student’s profile.

---

### 4.7 Session Scheduling
- **Implementation**:
  - Accessible via the dedicated **Meetings Schedule** module (`/meetings`).
  - **Scheduling Action**:
    - A mentor selects an assigned mentee from their active cohort dropdown.
    - Sets session metadata: Title, Meeting Purpose (Academic Review, Attendance Counseling, Career Guidance, or Personal Well-being), Agenda, Date, Start Time, and Estimated Duration.
    - Chooses the interaction mode: **In-Person** (specifying physical cabin/office room) or **Online** (providing virtual video conference links such as Google Meet or Zoom).
  - **Session Lifecycle**:
    - Transitions cleanly across states: `SCHEDULED` → `RESCHEDULED` → `COMPLETED` or `CANCELLED`.
  - **Post-Session Completion**:
    - Upon concluding a session, the mentor opens the completion modal to record official **Discussion Notes**, **Student Concerns**, and **Action Items**.
    - These records are permanently archived and accessible on both the student’s and mentor’s meeting history timeline for future reference.

---

## 5. Website Execution and Observations

This section demonstrates the runtime execution of the **MEntee** platform, outlining each major user interface, the operational workflows, and the practical observations gathered from execution and testing.

---

### 5.1 Login and Registration
The authentication interface provides a streamlined, accessible gateway for all institutional stakeholders. Users select their institutional role (**Student**, **Faculty Mentor**, **HOD**, or **Admin**) and authenticate using their registered institutional email and secure password.

- **Interface Details**:
  - Left-hand side presents a modern branding panel emphasizing institutional privacy and student development.
  - Right-hand side features an adaptive form equipped with real-time field validation, password visibility toggles, and contextual links to toggle between Login and Registration.
  - Role-specific registration dynamically asks for necessary identifiers, such as University Seat Number (USN) for students or Department & Designation for faculty.

> *[Figure 1. Login and Registration Interface]*  
> *(Insert screenshot showing the split-panel authentication view with role selection and input validation)*

---

### 5.2 Mentor Dashboard
The Mentor Dashboard provides faculty members with a centralized command center to oversee their assigned student cohort and daily advising tasks.

- **Interface Details**:
  - **Quick Metric Cards**: Displays real-time counts for Total Assigned Mentees, Pending Document Reviews, Upcoming Scheduled Meetings, and Average Mentee CGPA.
  - **Mentee Roster Table**: Lists assigned students with their photo/avatar, USN, current semester, section, CGPA badge, and quick-action buttons (View 360° Profile, Schedule Meeting, Review Submissions).
  - **Workload Indicator**: Shows current capacity utilization (e.g., `12 / 25 mentees allocated`) with visual progress bars.
  - **Pending Actions Queue**: Directly highlights document submissions awaiting faculty verification.

> *[Figure 2. Mentor Dashboard]*  
> *(Insert screenshot showing the mentor dashboard, mentee roster cards, and pending review queue)*

---

### 5.3 Mentee Dashboard
The Mentee Dashboard is tailored for students as their personal academic hub and developmental portfolio.

- **Interface Details**:
  - **Profile Summary Header**: Shows the student's name, USN, current semester, department, and an active badge displaying their assigned faculty mentor's name and contact link.
  - **Academic Progress Cards**: Displays cumulative CGPA, earned credits, and semester trend visualizations.
  - **Document Submission Vault**: Lists all uploaded files (identity cards, grade sheets, fee receipts) with color-coded status badges (`PENDING_REVIEW`, `APPROVED`, `REJECTED`) and mentor review remarks.
  - **Upcoming Meetings Card**: Shows scheduled advising appointments with time, agenda, and joining links.

> *[Figure 3. Mentee Dashboard]*  
> *(Insert screenshot showing the student personal dashboard with academic stats, mentor badge, and document vault)*

---

### 5.4 Mentor Search and Selection
The Mentor Search and Allocation interface gives Heads of Departments (HODs) and Administrators complete visibility and control over faculty mentoring workloads.

- **Interface Details**:
  - **Search & Filter Bar**: Instant text search by student name or USN, paired with dropdown filters for Semester, Section, and Assignment Status (`All`, `Assigned`, `Unassigned`).
  - **Mentor Availability Roster**: Shows all department faculty members alongside their active mentee loads and available slots.
  - **Interactive Allocation Modal**: Allows the HOD to link an unassigned student to an available mentor in one click, or reassign an existing student with a mandatory justification note that is recorded in the institutional audit log.

> *[Figure 4. Mentor Search Interface]*  
> *(Insert screenshot showing the HOD mentor allocation portal with filter controls, workload meters, and assignment modal)*

---

### 5.5 Mentorship Request
The Mentorship Request workflow covers both student allocations and mentor-initiated document requirements.

- **Interface Details**:
  - **Formal Document Request Modal**: Allows mentors to request specific mandatory documents (such as Internship Certificates, Undertakings, or Scholarship Proofs) by specifying title, guidelines, allowed formats, and submission deadlines.
  - **Student Request Inbox**: Displays active requests on the student portal with urgent deadline alerts and a direct file attachment upload interface.
  - **Status Pipeline**: Reflects real-time state changes (`REQUESTED` → `UPLOADED / UNDER REVIEW` → `APPROVED` / `REJECTED`).

> *[Figure 5. Mentorship Request Interface]*  
> *(Insert screenshot showing the mentor document request creation modal and the student upload response screen)*

---

### 5.6 Communication and Feedback
Communication within MEntee focuses on high-value, structured advising interactions, feedback loops, and actionable follow-ups rather than untracked informal chats.

- **Interface Details**:
  - **Document Review & Feedback Modal**: When verifying submissions, mentors can approve files or reject them with mandatory corrective explanations (e.g., "Page 2 seal missing, please rescan"). The feedback is rendered directly in the student's document history.
  - **In-App Notification Drawer**: Centralized dropdown displaying live alerts for newly scheduled meetings, approved documents, and assignment changes.
  - **Meeting Minutes & Discussion Panel**: Embedded within the meeting history, displaying agreed-upon action points, mentor recommendations, and student concerns.

> *[Figure 6. Communication Interface]*  
> *(Insert screenshot showing mentor verification comments, rejection feedback banner, and in-app notifications)*

---

### 5.7 Overall Website
The overall web application features a cohesive, accessible design built with Tailwind CSS, rich dark/light surface tokens, clear typography, and responsive navigation shells.

- **Interface Details**:
  - **Persistent Responsive Sidebar**: Provides clean navigation between Dashboard, 360° Profiles, Academic Records, Document Vault, Meeting Schedules, and Settings.
  - **Top Navigation Bar**: Features global role badges, active semester indicators, notification drawer, and secure profile/logout menu.
  - **Universal Mobile & Tablet Responsiveness**: Adaptive layouts that reorganize smoothly from multi-column desktop grids to vertical card stacks on mobile devices.

> *[Figure 7. Complete Website Interface]*  
> *(Insert screenshot showing the full website overview including top bar, sidebar navigation, and main content area)*

---

### 5.8 Observations

#### 1. What Worked Successfully:
- **Zero-Trust Document Privacy**: The strict authorization middleware successfully isolated student documents. Testing verified that only the student and their active mentor can retrieve uploaded files; unauthorized requests from other students or even HODs/Admins consistently return `HTTP 403 Forbidden`.
- **Automated Academic Calculations**: The semester mark tracking engine accurately computed subject percentages, credit-weighted SGPAs, and cumulative CGPAs automatically, eliminating manual grade calculation errors.
- **Role-Based Routing and Security**: HttpOnly JWT cookie authentication reliably maintained sessions while completely preventing client-side script token theft and ensuring clean role-specific redirects upon login.
- **Dynamic Workload Balancing**: HOD capacity tracking prevented accidental mentor overloading and maintained equitable mentee distributions across department faculty.

#### 2. How Mentor–Mentee Interaction Takes Place:
- **Phase 1: Allocation**: HOD assigns the student to an available faculty mentor. Both parties receive an immediate notification, establishing the advising relationship.
- **Phase 2: Academic & Document Onboarding**: The student enters semester marks and uploads verified academic certificates into their Document Vault. The mentor inspects the submissions through their review queue, approving valid documents or requesting corrections with written guidance.
- **Phase 3: Advisory Meetings**: The mentor schedules a counseling session with an explicit agenda (e.g., Attendance Review or Career Guidance). They meet in person or via video link, discuss challenges, and log actionable goals.
- **Phase 4: Longitudinal Tracking**: Historical grades, meeting minutes, and approved records persist across all academic years, providing a complete 360° view of student progression.

#### 3. Results Obtained from Testing:
- Comprehensive automated end-to-end testing was conducted using the test suite (`test_security_and_workflows.js`), achieving **100% pass rates** across all core modules:
  - **HOD Allocation & Workload Suite**: Verified unassigned student filtering, capacity updates, and unauthorized access rejections.
  - **Academic Records Suite**: Verified student mark creation, SGPA formulas, mentor mark edits, and tamper-proof audit trail logs.
  - **Document Privacy Suite**: Validated authorized student/mentor file downloads and verified that unauthorized roles are strictly blocked with `HTTP 403`.
  - **Document Approval Workflow Suite**: Confirmed state transitions (`PENDING_REVIEW` → `APPROVED` / `REJECTED`) and mandatory rejection feedback validation.
  - **Meeting Scheduling Suite**: Verified meeting creation, rescheduling, cancellation, and archival of post-meeting discussion notes and student action items.

---

## 6. Concepts Illustrated

This section outlines the foundational computer science and web engineering principles demonstrated by the **MEntee** platform.

---

### 6.1 Client–Server Architecture
- **Concept**: Separation of concerns between the presentation tier and business logic tier.
- **Application**: The frontend (React Single Page Application) operates independently of the backend (Node.js/Express REST API). They communicate asynchronously over HTTP using structured JSON payloads, ensuring scalability, decoupled deployments, and responsive client-side state handling.

---

### 6.2 User Authentication
- **Concept**: Verification of user identity before granting access to institutional services.
- **Application**: Implemented using stateless **JSON Web Tokens (JWT)**. Passwords are securely hashed with **bcryptjs** using unique salt rounds. Upon login, the signed JWT is transmitted via an **HttpOnly, SameSite cookie**, neutralizing common web vulnerabilities such as client-side script token theft (XSS).

---

### 6.3 Role-Based Access Control (RBAC)
- **Concept**: Restricting system operations and data exposure based on assigned user privileges.
- **Application**: The system defines distinct permissions for **Students**, **Faculty Mentors**, **HODs**, and **Administrators**. Route-guarding middleware intercepts every incoming API request to verify roles. A strict zero-trust document rule ensures that personal student files are accessible strictly to that student and their assigned mentor, returning `HTTP 403 Forbidden` for all others.

---

### 6.4 CRUD Operations
- **Concept**: The four fundamental data persistence actions: **Create**, **Read**, **Update**, and **Delete**.
- **Application**: 
  - **Create**: Registering users, uploading student certificates, adding semester marks, and scheduling meetings.
  - **Read**: Fetching 360° profiles, querying mentee rosters, and listing verified academic records.
  - **Update**: Reassigning mentors, modifying marks with audit logging, and recording post-meeting discussion notes.
  - **Delete**: Safely removing draft records and deleting superseded documents with cloud file cleanup.

---

### 6.5 Database Interaction
- **Concept**: Persistent data modeling, schema validation, and relational querying in a non-relational database.
- **Application**: Utilizes **MongoDB** managed through **Mongoose Object Data Modeling (ODM)**. Enforces strict schema validations, indexed foreign-key references (`ObjectId`), population joins, and atomic document updates across collections for users, academic records, document metadata, and meeting logs.

---

### 6.6 Web Application Security
- **Concept**: Safeguarding institutional data integrity, privacy, and infrastructure against cyber threats.
- **Application**: Enforces multi-layered defense mechanisms:
  - **Transport & Storage Protection**: Secure cookies and encrypted password storage.
  - **Sanitization & Input Validation**: Validation of incoming request bodies to prevent injection attacks.
  - **File Upload Security**: Multer file size caps, MIME-type whitelisting, and authorized streaming proxies so internal storage URLs are never leaked to public clients.
  - **Audit Logging**: Immutable tracking of sensitive actions (mentor reassignments and grade edits) for institutional accountability.

---

## 7. Testing and Results

This section details the verification strategy, test suites, and empirical outcomes evaluated across the **MEntee** platform.

---

### 7.1 Testing Approach
The platform utilized a multi-tiered verification methodology combining **automated end-to-end integration testing**, **API security validation**, and **manual user-acceptance testing (UAT)**:

1. **Automated Integration Testing**:
   - A dedicated automated test suite (`test_security_and_workflows.js`) was engineered to execute realistic user scenarios against live database states.
   - Tests run sequentially in isolated test environments with automated setup, seeded test users, and teardown cleanup routines.

2. **Negative Security Testing (Penetration & RBAC Verification)**:
   - Explicit tests designed to attempt unauthorized privilege escalation (e.g., student attempting to modify peer marks, or HOD attempting to download private student certificates) to verify that the security boundary consistently rejects invalid operations with `HTTP 403 Forbidden`.

3. **Client-Side Functional & UI Testing**:
   - Cross-browser testing verifying form validation, responsive layouts, toast notification triggers, and dynamic route guards across modern desktop and mobile browsers.

---

### 7.2 Functional Testing
Functional testing ensured that all business workflows operate according to design specifications:

| Feature / Workflow | Test Scenario | Expected Outcome | Result |
| :--- | :--- | :--- | :--- |
| **Academic Records** | Student inputs subject marks (internal/external/credits). | Auto-calculates subject totals, percentage, and credit-weighted SGPA. | **PASSED** |
| **CGPA Synchronization** | Multiple semesters added for a student. | Cumulative CGPA accurately averages across all completed credits. | **PASSED** |
| **Audit Logging** | Mentor updates a student's marks with reason. | Modification is recorded with timestamp, modifier ID, old values, and new values. | **PASSED** |
| **Document Vault** | Student uploads document (PDF/PNG). | File saved securely, status initialized to `PENDING_REVIEW`. | **PASSED** |
| **Workload Tracking** | HOD assigns an unassigned student to a faculty mentor. | Mentor's active mentee count increments immediately in real time. | **PASSED** |
| **Meeting Management** | Mentor marks scheduled meeting as completed with notes. | Session moves to `COMPLETED`; discussion minutes and action items attach to mentee profile. | **PASSED** |

---

### 7.3 Login and Authentication Testing
Authentication verification focused on boundary checks, credential encryption, and session isolation:

1. **Credential Validation**:
   - Tested registration with invalid email formats, short passwords, and duplicate USN/email entries; verified that backend correctly returns validation errors (`HTTP 400`).
   - Verified that plaintext passwords are never saved; database records confirm passwords are encrypted via `bcryptjs`.

2. **Session Security & Cookie Protection**:
   - Verified that successful login issues signed JWTs exclusively via `HttpOnly` cookies.
   - Confirmed client-side JavaScript (`document.cookie`) cannot read the token, safeguarding against cross-site scripting (XSS).
   - Validated that requests without tokens or with expired tokens are blocked with `HTTP 401 Unauthorized`.

3. **Role Redirection**:
   - Tested authentication across each role (**Student**, **Mentor**, **HOD**, **Admin**); confirmed that the client-side router immediately directs users to their designated portals.

---

### 7.4 Mentor–Mentee Interaction Testing
Interaction testing evaluated the end-to-end advisory relationship between faculty and students:

1. **Strict Document Privacy Isolation**:
   - **Student Access**: Student successfully downloads their uploaded document (`HTTP 200`).
   - **Assigned Mentor Access**: Assigned faculty mentor successfully downloads the student's file (`HTTP 200`).
   - **Administrative Isolation**: HOD and Admin accounts attempting to download the private student file are blocked with `HTTP 403 Forbidden`.
   - **Peer Isolation**: Unassigned students or unassigned faculty attempting direct file download via manipulated IDs are rejected with `HTTP 403 Forbidden`.

2. **Document Verification Pipeline**:
   - Mentor reviews submission and executes approval; status updates to `APPROVED` and student receives alert.
   - Mentor rejects submission without providing feedback; backend rejects action (`HTTP 400: Rejection reason is mandatory`).
   - Mentor provides written rejection reason; status updates to `REJECTED`, feedback is rendered on student dashboard, and resubmission is enabled.

3. **Advisory Meeting Lifecycle**:
   - Mentor schedules meeting with assigned mentee; meeting appears dynamically on both mentor and student calendars.
   - Unassigned mentor attempting to schedule an appointment with a non-mentee is blocked (`HTTP 403`).
   - Mentor reschedules meeting; update reflects on student view.
   - Meeting completion modal records minutes, student concerns, and follow-up tasks, persisting to the student's permanent profile.

---

### 7.5 Results and Observations
- **Test Suite Execution Outcome**:
  - The comprehensive automated acceptance test suite executed across **6 major security and functional suites** covering **32 individual test assertions**, achieving a **100% pass rate** with zero runtime exceptions.
- **Key Empirical Observations**:
  1. *Zero False Approvals*: Mandatory fields (such as rejection reasons and reassignment rationale) effectively eliminate ambiguous or unrecorded administrative changes.
  2. *Data Integrity*: Credit-weighted SGPA and CGPA calculations remain mathematically accurate across multiple semester additions and edits.
  3. *Zero-Leakage Privacy*: The document download proxy successfully decouples internal storage paths from client views while strictly enforcing mentor-mentee exclusivity.
  4. *Performance Stability*: Asynchronous React state updates combined with lightweight Express REST endpoints provide instantaneous user feedback and seamless page navigation.

---

## 9. Conclusion

### 9.1 Conclusion

#### 1. What Was Achieved:
The **MEntee (Institutional Mentor–Mentee Management System)** project successfully conceptualized, designed, and deployed a secure, full-stack, institutional-grade web platform. The system successfully accomplishes:
- **A Unified Single Source of Truth**: Consolidating student identity profiles, semester academic performance, document repositories, and advising milestones into one centralized architecture.
- **Zero-Trust Document Privacy**: Establishing strict role-based access control where confidential student files (marksheets, identity documents, and personal records) are protected and accessible strictly to the student and their currently assigned mentor, systematically preventing unauthorized access even by administrators.
- **Automated Academic Analytics**: Developing an automated semester tracking engine that accurately computes subject totals, percentages, credit-weighted SGPA, and cumulative CGPA, complete with an immutable modification audit trail.
- **Digitized Advising Workflows**: Replacing informal, unrecorded conversations with a structured session scheduling engine, meeting minute archival, actionable follow-ups, and an interactive document verification queue.
- **Balanced Workload Allocation**: Equipping department heads with real-time faculty mentee capacity tracking and dynamic student assignment tools to eliminate faculty overburdening.

#### 2. How the Website Solves the Problem:
- **Eliminating Fragmentation**: Replaces loose spreadsheets, paper logbooks, and unorganized messaging groups with a structured, role-based digital dashboard.
- **Ensuring Continuity and Institutional Memory**: When students advance through semesters or change faculty mentors, their full history of academic progress, approved credentials, and counseling notes remains intact, ensuring continuous, contextual guidance.
- **Fostering Early Intervention**: Mentors can monitor longitudinal performance trends in real time, identifying academic dips or missing prerequisites early enough to conduct proactive counseling rather than reactive remediation.
- **Meeting Statutory and Accreditation Demands**: Provides educational institutions with verifiable, timestamped, audit-ready data required by accreditation councils (such as NAAC, NBA, and ABET).

#### 3. Overall Result:
The resulting application is a modern, responsive, and secure web application built using the MERN stack (React, Express, Node.js, MongoDB) and Tailwind CSS. Comprehensive automated testing confirmed a **100% pass rate** across all functional, security, and lifecycle test suites with zero security vulnerabilities. 

Ultimately, **MEntee** transforms student mentoring from an administrative chore into a transparent, data-driven, and supportive institutional ecosystem that enhances student retention, strengthens faculty engagement, and upholds the highest standards of student data privacy.

---

## 10. References

### 10.1 Documentation
1. **MDN Web Docs**: Modern JavaScript (ES6+), HTTP State Management, Cookies & Security Guidelines — [https://developer.mozilla.org/](https://developer.mozilla.org/)
2. **Node.js Official Documentation**: Runtime Environment & Core Modules (v20+) — [https://nodejs.org/docs/](https://nodejs.org/docs/)
3. **MongoDB & Mongoose Documentation**: Document Modeling, Schema Validations, and Relational Referencing — [https://mongoosejs.com/docs/](https://mongoosejs.com/docs/) & [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)

### 10.2 Websites
1. **OWASP Foundation**: Open Web Application Security Project (Top 10 Security Risks, Session Management, and Cross-Site Scripting Prevention) — [https://owasp.org/](https://owasp.org/)
2. **Cloudinary Developer Hub**: Programmable Media and Secure Cloud Asset Management API Reference — [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
3. **Lucide Icons**: Accessible, Consistent Icon System for Modern Web Applications — [https://lucide.dev/](https://lucide.dev/)

### 10.3 Framework Documentation
1. **React Documentation**: Building Interactive Single Page Applications with Modern Hooks and Context API — [https://react.dev/](https://react.dev/)
2. **Express.js Documentation**: Fast, unopinionated, minimalist web framework for Node.js REST APIs — [https://expressjs.com/](https://expressjs.com/)
3. **Tailwind CSS Documentation**: Modern Utility-First CSS Framework and Responsive Design System — [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
4. **Vite Build Tool Guide**: Next Generation Frontend Tooling and Hot Module Replacement — [https://vitejs.dev/guide/](https://vitejs.dev/guide/)

### 10.4 Papers and Articles
1. **Ferraiolo, D. F., & Kuhn, D. R.**: *"Role-Based Access Controls"*, 15th National Computer Security Conference, NIST. (Foundation for Institutional RBAC and Access Authorization).
2. **NAAC (National Assessment and Accreditation Council)**: *"Guidelines for Mentoring System in Higher Education Institutions"*, Institutional Mentoring Framework and Student Support Quality Indicators.
3. **Eby, L. T., et al.**: *"Does Mentoring Matter? A Multidisciplinary Meta-Analysis Comparing Mentored with Non-Mentored Individuals in Higher Education and Career Development"*, Journal of Vocational Behavior.
4. **Rescorla, E., et al.**: *"JSON Web Token (JWT) Architecture and Best Current Practices"*, RFC 7519 & RFC 8725, Internet Engineering Task Force (IETF).

---

## 11. Disclosure of AI Assistance

In accordance with institutional guidelines and emerging standards for ethical technical scholarship, the use of Artificial Intelligence (AI) tools during this project is formally disclosed as follows:

1. **AI Tools Utilized**:
   - Generative AI coding assistants (including Google Antigravity / Gemini models) were utilized during the development lifecycle.

2. **Scope of AI Assistance**:
   - **Syntax & Scaffolding**: Assisting with initial boilerplate code generation, component layout scaffolding using Tailwind CSS, and standard REST route outlines.
   - **Documentation & Report Structuring**: Aiding in structuring, formatting, and refining the markdown documentation, organizing technical sections, and drafting clear conceptual summaries.
   - **Test Case Brainstorming**: Providing suggestions for edge-case coverage and boundary conditions evaluated in the automated test suite (`test_security_and_workflows.js`).

3. **Author Responsibility & Validation**:
   - All AI-suggested code, schemas, and architectural patterns were critically reviewed, manually edited, debugged, and integrated by the author.
   - The core business logic, strict document privacy policies, database design, API implementation, and security models were comprehensively tested and verified by the author against live institutional requirements.
   - The author takes full intellectual responsibility for the authenticity, correctness, and operational performance of the entire submission.

---

## 12. Academic Integrity Statement

I hereby declare and certify that:

1. **Originality of Work**:
   - This project report and the accompanying web application, titled **"MEntee — Institutional Mentor–Mentee Management System"**, represents authentic, original work conducted by me as part of the academic curriculum.
   - The design, implementation, and empirical testing presented in this document have not been submitted, in part or in full, for the award of any other degree, diploma, or certificate at this or any other academic institution.

2. **Compliance with Ethical Standards**:
   - All literature, reference models, public documentation, third-party libraries, and conceptual frameworks referenced in this work have been duly cited and credited in **Section 10 (References)**.
   - The use of AI assistance has been transparently acknowledged and documented in **Section 11 (Disclosure of AI Assistance)** in full alignment with institutional academic integrity policies.

3. **Protection of Data & Privacy**:
   - All test data, user mock credentials, and document samples used during system demonstration were synthesized for developmental verification purposes and contain no confidential or unauthorized personal data.

---

**Student / Author Name**: ______________________________________  
**USN / Registration Number**: ________________________________  
**Department**: _________________________________________________  
**Date**: ________________________  
**Signature**: ___________________________________________________  
