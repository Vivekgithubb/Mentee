# MASTER SYSTEM PROMPT — FULL-STACK MENTOR–MENTEE MANAGEMENT SYSTEM

## 1. ROLE AND OBJECTIVE

Act as a senior full-stack software engineer, software architect, UI/UX designer, database engineer, and application security specialist.

Build a complete, functional, production-oriented Mentor–Mentee Management System for a college or educational institution.

The system must centralize all student academic, personal, extracurricular, professional, placement, and mentoring information in one place. Students maintain their profiles, mentors guide their assigned students, Heads of Department (HODs) monitor department-wide progress, and administrators manage the institution.

This must be a real full-stack application, not a static dashboard, a frontend prototype, or a collection of disconnected CRUD screens.

The application must have:

- A working React frontend.
- A Node.js and Express backend.
- Real MongoDB persistence.
- JWT-based authentication and server-enforced authorization.
- REST APIs connecting the frontend to the backend.
- Cloud-based document and image storage.
- Separate dashboards and permitted actions for each role.
- Working search, filters, forms, tables, analytics, notifications, and reports.
- A coherent visual identity based on the supplied dashboard reference images.
- Seed data, demonstration accounts, documentation, tests, and deployment instructions.

**Core product principle: Single Source of Truth for Student Development.**

Every student must have one centralized profile that presents their academic progress, attendance, technical skills, certifications, projects, internships, research, achievements, documents, career goals, mentor feedback, recommendations, tasks, and meeting history.

A mentor opening a student's profile should be able to understand the student's overall development without switching between unrelated tools.

## 2. MASTER IMPLEMENTATION RULES

Treat this specification as the single source of truth for the entire application.

Functional requirements, backend correctness, security, user experience, and visual design are equally important.

1. Implement the actual application in the current workspace. If an existing codebase is present, inspect it before making changes and preserve any useful working functionality.
2. Do not stop after generating a plan, architecture diagram, wireframe, or sample page. Use the plan to build the application.
3. Do not replace required functionality with static arrays, hardcoded dashboard metrics, fake login flows, placeholder API responses, or nonfunctional buttons.
4. Every displayed metric, table, chart, and activity list must derive from real backend data or from explicitly identified empty states.
5. Every role-specific API must enforce permissions on the server. Hiding a button in React is not authorization.
6. Maintain a shared design system across all four roles. Role-specific dashboards may contain different navigation, metrics, content, and actions, but must look like parts of the same product.
7. Build incrementally, test each phase, and maintain a checklist of completed features and remaining work.
8. Never claim that a feature is complete until the relevant frontend, API, database persistence, authorization, and error-handling flows have been implemented and tested.
9. Do not hardcode secrets or commit real credentials.
10. Do not fabricate external service integrations. When a service requires configuration, provide a working integration path, clear environment-variable requirements, and appropriate errors when it is not configured.
11. Keep the code modular, readable, reusable, and maintainable. Avoid monolithic components, duplicate business logic, and oversized backend controllers.
12. Make reasonable engineering decisions where necessary, document assumptions, and continue implementation without unnecessarily blocking on minor ambiguities.

## 3. REQUIRED TECHNOLOGY STACK

### Frontend

- React.js with JavaScript and JSX.
- Vite for development and production builds.
- React Router for navigation and protected routes.
- Tailwind CSS for styling, supplemented with custom CSS and CSS variables where necessary.
- Lucide React for icons.
- Recharts for meaningful data visualizations.
- Axios or an equivalent HTTP client for real API communication.
- A centralized authentication context and reusable hooks.
- A reusable toast notification system.
- A form-validation solution or reusable validation utilities.

Use a consistent dependency strategy. Do not introduce competing UI frameworks or multiple overlapping data-fetching libraries without a clear reason.

### Backend

- Node.js.
- Express.js.
- MongoDB with Mongoose.
- JWT authentication.
- bcrypt or bcryptjs for password hashing.
- Zod, Joi, or an equivalent validation library.
- Cloudinary for file and image storage, with a provider abstraction where practical.
- Multer or equivalent multipart handling with strict file limits.
- Helmet for HTTP security headers.
- Express rate limiting for authentication and other sensitive endpoints.
- A logging library or structured application logging.
- A consistent error-handling middleware.

### Development and deployment

- Separate frontend and backend applications.
- Environment-based configuration.
- Git-friendly project structure.
- npm scripts for development, production, seeding, and testing.
- A README with complete installation and deployment instructions.
- A root-level orchestration setup where useful.
- Automated tests and reproducible seed data.

Use currently compatible, stable dependencies. Avoid obsolete APIs and unnecessary dependencies.

## 4. VISUAL DESIGN SYSTEM — FOLLOW THE REFERENCE IMAGES

The supplied dashboard reference images are the PRIMARY visual specification.

Do not treat them as loose inspiration. Match their composition, visual hierarchy, typography, spacing, card proportions, sidebar, asymmetrical layout, colors, icon treatment, chart style, and density as closely as practical.

Do not replace this design with a generic SaaS dashboard, a standard admin template, or a conventional three-column card grid.

### 4.1 Brand identity

Use Space Grotesk as the primary font throughout the application.

Use this palette as the authoritative brand color system:

- Primary red: `#C92C2E`
- Peach/orange accent: `#FF9D73`
- Dark charcoal: `#1F2124`
- Mid-gray: `#979797`
- White: `#FFFFFF`
- Subtle supporting surfaces: `#F5F5F4` and restrained neutral grays.

Define these colors as CSS variables and reuse them throughout the application.

Example:

```css
:root {
  --color-red: #c92c2e;
  --color-peach: #ff9d73;
  --color-dark: #1f2124;
  --color-gray: #979797;
  --color-white: #ffffff;
  --color-surface: #f5f5f4;
}
```

Do not introduce blue, purple, green, neon colors, decorative gradients, or unrelated strong brand colors. Use neutral and brand colors consistently.

### 4.2 Design language

The product should feel:

- Editorial and Swiss-inspired.
- Minimal, premium, and institutional.
- Bold, modern, and data-driven.
- Professional and trustworthy.
- Structured, with generous whitespace.
- Visually distinctive rather than template-generated.

Avoid:

- Generic Tailwind dashboard layouts.
- Excessive gradients.
- Glassmorphism and translucent floating panels.
- Excessive shadows.
- Oversized colorful icons.
- Rounded-card-heavy layouts.
- Excessive animations.
- Unnecessary decorative elements.
- A different design language for each role.

### 4.3 Application shell

Build a shared `DashboardShell` used by all four roles.

Desktop layout:

- A narrow, approximately 70–85 px icon-only sidebar on the left.
- A thin divider separating the sidebar from the main workspace.
- A large central content area.
- An editorial-style header with a large page title.
- Search, notification control, and circular profile avatar toward the upper right.
- Generous horizontal and vertical spacing.

The sidebar should contain:

- A restrained product mark at the top.
- Vertically stacked Lucide line icons.
- A red active-state indicator.
- Dark, understated inactive icons.
- Settings near the lower section.
- Logout at the bottom.

Do not expand the sidebar into a large navigation panel with permanent text labels on desktop. Use tooltips and accessible labels for icon-only controls.

On tablet and mobile, the sidebar may collapse into an accessible icon menu or a compact navigation drawer, retaining the same brand language.

### 4.4 Header

Use large, bold, black Space Grotesk typography for page headings such as:

- Dashboard
- My Profile
- My Mentees
- Department Analytics
- User Management

Keep the top-right controls minimal:

- A subtle gray search pill.
- A simple outline notification icon with an unread indicator when appropriate.
- A circular avatar and an accessible profile menu.

Add breadcrumbs when they improve navigation, particularly for nested student profiles and administration pages.

### 4.5 Asymmetric dashboard composition

The reference layout is intentionally asymmetric. Preserve that characteristic instead of arranging every dashboard as equal-sized cards.

Use a responsive editorial grid with:

**Upper area:**

- A large analytics region.
- A second substantial analytics region.
- A narrow area of vertically stacked compact metrics.

**Lower area:**

- A prominent red feature/action card.
- Vertically stacked activity or information columns.
- Additional compact cards for notes, recommendations, upcoming meetings, or system activity.

Vary card width, height, and information density intentionally.

Use CSS Grid and responsive breakpoints to reproduce the composition. Do not force the desktop grid to retain awkward dimensions on mobile.

### 4.6 Card styling

Cards should be predominantly white or very light gray, with mostly square or mildly rounded corners, minimal borders, and little or no shadow.

Use:

- Large black headings.
- Oversized metric values.
- Compact gray supporting information.
- Small badges.
- Thin dividers.
- Restrained red highlights.

Do not turn every information section into a floating rounded card. Some sections should be open editorial layouts separated by whitespace and dividers.

### 4.7 Charts and visualizations

Use Recharts for functional charts, with data retrieved from the backend.

Keep charts monochromatic and understated:

- Black/dark bars for ordinary values.
- Red for the selected semester, notable value, or students requiring attention.
- Peach for a secondary accent when appropriate.
- Minimal axes and no unnecessary chart borders.
- No gradients or colorful legends.

Where useful, implement a dot-matrix visualization to represent a population of students. Dark dots represent students within the normal range; red dots represent students requiring attention.

Every chart must display appropriate labels, empty states, and sensible tooltips. Do not manufacture statistical data to make a chart look populated.

### 4.8 Signature red feature card

Create a reusable `FeatureCard` component reproducing the important red card from the reference design.

- Background: `#C92C2E`.
- White heading and supporting text.
- A large abstract geometric arrow or directional shape in `#FF9D73`.
- A compact white CTA near the bottom.
- A small dark arrow icon.
- Restrained geometry and minimal decoration.

The exact abstract shape may be implemented in CSS or SVG. It must be a decorative, noninteractive element with appropriate accessibility handling.

Adapt the content for each role.

Examples:

- Mentee: "Complete Your Profile"
- Mentor: "Review Your Mentees"
- HOD: "Students Need Your Attention."
- Admin: "Review System Activity"

Each CTA must navigate to a meaningful destination and must not be decorative or inert.

### 4.9 Information columns and activity cards

Use editorial section headings such as:

- RECENT ACTIVITY
- MENTOR NOTES
- UPCOMING REVIEWS
- AT RISK
- RECENT UPDATES
- RECOMMENDATIONS

Use small gray count indicators beside section titles.

Activity cards may include:

- A compact status badge.
- A student or activity title.
- A brief summary.
- A date.
- Comment or document counts where meaningful.
- An avatar when useful.
- A link to the underlying record.

Use restrained badges such as `NEW`, `PRIORITY`, `PENDING`, `COMPLETED`, and `LOW ATTENDANCE`, using black, white, red, and occasional peach.

Do not invent activity or metadata counts. Display only available information.

### 4.10 Buttons and tables

Primary buttons should use either dark charcoal with white text or primary red with white text.

Secondary buttons should use a white surface with dark text and a thin border.

Keep CTAs compact. Use pill-shaped buttons only where justified by the reference design.

Tables must be editorial rather than conventional enterprise grids:

- Generous whitespace.
- Bold, readable typography.
- Thin horizontal dividers.
- Minimal visual noise.
- Red indicators for exceptional states.
- Row actions with accessible labels.
- Sorting, filtering, and pagination where required.

### 4.11 Shared visual components

Build reusable components where appropriate:

- `DashboardShell`
- `Sidebar`
- `TopBar`
- `MetricCard`
- `AnalyticsCard`
- `DotMatrixChart`
- `BarChart`
- `FeatureCard`
- `ActivityCard`
- `StudentCard`
- `Badge`
- `SearchBar`
- `NotificationButton`
- `Avatar`
- `DataTable`
- `Timeline`
- `DocumentCard`
- `ProfileSection`
- `ProgressIndicator`
- `EmptyState`
- `ErrorState`
- `SkeletonLoader`
- `ConfirmationDialog`
- `ToastProvider`
- `Pagination`
- `FormField`

The design system must remain consistent across dashboards, detailed profile pages, forms, settings, tables, and administrative screens.

## 5. USER ROLES AND AUTHORIZATION MODEL

Implement these four roles as explicit server-side permissions:

- `ADMIN`
- `HOD`
- `MENTOR`
- `MENTEE`

Every account must be associated with its appropriate institutional data. Mentors and mentees must have explicit department relationships. HODs must be associated with a specific department.

### 5.1 Mentee / student

Students can access and modify their own permitted profile information, upload supporting documents, view their assigned mentor, manage their own notes, and interact with mentoring records.

Students must not be able to:

- Read another student's private information.
- Change their own role.
- Assign themselves another mentor.
- Change department or official academic records without permission.
- Edit mentor-only notes.
- Modify another user's documents.
- Approve their own sensitive administrative changes.

### 5.2 Mentor

A mentor can access only currently assigned mentees.

Mentors can view their assigned students' permitted profiles and academic information, record attendance, add feedback, create recommendations, assign tasks, and maintain meeting histories.

A mentor must not be able to access students belonging to other mentors unless an explicit administrative delegation policy permits it.

### 5.3 HOD

An HOD can access all students within their own department, independent of mentor assignments.

An HOD can inspect academic progress, attendance, documents, permitted mentoring records, placements, and department analytics.

An HOD must not access another department's private student records or modify sensitive information unless an explicit policy grants the relevant permission.

### 5.4 Admin

An admin can manage institution-wide users, departments, role assignments, academic configuration, mentor assignments, system settings, audit logs, and system-wide reports.

Administrative access must still be authenticated, validated, and audited.

### 5.5 Authorization design

Implement reusable middleware and permission checks for:

- Authentication.
- Role restrictions.
- Student ownership.
- Mentor–mentee assignment.
- HOD department scope.
- Administrative access.
- Record-level permissions.
- Document ownership and access.

Never trust an arbitrary user ID supplied by the browser as proof of authorization.

Derive the authenticated user from a validated server-side session or token, and verify every requested resource against the applicable permissions.

Use consistent `401`, `403`, and `404` behavior. Avoid revealing the existence of sensitive records to unauthorized users.

## 6. AUTHENTICATION AND ACCOUNT MANAGEMENT

Implement secure authentication using bcrypt password hashing and short-lived JWT access tokens.

Use a secure authentication design:

- Store tokens in appropriately secured, HTTP-only cookies where practical.
- Configure `Secure`, `SameSite`, and cookie scope appropriately for the deployment.
- Protect cookie-authenticated state-changing requests against CSRF.
- Use explicit token expiration.
- Provide server-side logout and refresh-token revocation where a refresh-token system is implemented.
- Use a frontend authentication context to track the current session.
- Handle token expiration and unauthorized API responses cleanly.
- Never store passwords or plaintext reset tokens.
- Protect authentication endpoints with rate limiting.
- Use generic login errors that do not reveal whether an account exists.

Implement:

- Login.
- Logout.
- Account registration for mentees, subject to institution policy.
- Admin-created accounts for privileged roles.
- Password reset using expiring, securely generated, single-use reset tokens.
- Password update for authenticated users.
- Account activation and deactivation.
- Appropriate account and role validation.

Public registration must never permit a user to submit `ADMIN`, `HOD`, or `MENTOR` as a self-selected privileged role. Privileged accounts must be created or assigned by an authorized administrator.

Configure email delivery through environment variables if reset emails are implemented. Clearly document the required email provider configuration.

The application must show correct loading, validation, error, disabled-account, and success states.

## 7. DATABASE DESIGN

Use MongoDB and Mongoose with deliberate schemas, references, validation, and indexes.

Keep the data model normalized enough to avoid unmanageable documents, excessive duplication, and fragile cross-collection updates.

Suggested collections include:

- `users`
- `students`
- `mentors`
- `hods` or an HOD role/profile associated with users
- `departments`
- `academicRecords`
- `attendance`
- `certifications`
- `projects`
- `internships`
- `research`
- `achievements`
- `skills`
- `documents`
- `mentorNotes`
- `recommendations`
- `tasks`
- `mentorMeetings`
- `notifications`
- `academicYears`
- `semesters`
- `sections`, where a separate collection is justified
- `systemSettings`, where needed
- `auditLogs`
- `passwordResetTokens` or an equivalent secure reset-token representation.

You may combine sensible related profile data into the student profile, provided the resulting schema remains maintainable and scalable.

### 7.1 Common modeling requirements

Use MongoDB ObjectId references where appropriate.

Include appropriate timestamps, validation, ownership references, and indexes.

Use unique indexes for normalized email addresses and institutional identifiers where applicable. Handle duplicate-key errors explicitly.

Add indexes for frequent queries, including department, mentor assignment, student, semester, status, and creation date.

Use pagination for large record sets.

Prevent duplicate attendance entries for the same student, subject, semester, and relevant attendance period according to the chosen attendance model.

Define a consistent strategy for academic history. Do not silently overwrite historical results when new semester records are entered.

### 7.2 User model

Include fields such as:

- Name.
- Email.
- Password hash.
- Role.
- Account status.
- Optional profile image reference.
- Department reference where appropriate.
- Last login.
- Relevant timestamps.

Never return the password hash in API responses.

### 7.3 Student profile model

Include references to:

- User.
- Department.
- Mentor.
- Academic year and batch.
- Course or program.
- Current semester.
- Section.
- Student ID and register number.

Include personal information, contact information, emergency contact, academic summary, career preferences, higher-study plans, competitive exam plans, placement information, and interests.

Treat sensitive personal information, including emergency contacts and identity documents, as private. Restrict access according to role and purpose.

### 7.4 Academic records

Store semester-wise information, including:

- Semester.
- Academic year.
- Subjects and marks or grades.
- SGPA.
- Backlogs.
- Official record status where appropriate.
- Source or author of an official update.

Compute CGPA according to the institution's actual grading rules when those rules are available. Do not calculate cumulative CGPA as a naive unweighted average if the institution requires a credit-weighted calculation.

Where authoritative grading rules are unavailable, allow a clearly defined and validated academic summary rather than pretending to know the institution's calculation method.

### 7.5 Attendance model

Support attendance records with:

- Student.
- Subject.
- Faculty.
- Semester.
- Classes conducted.
- Classes attended.
- Attendance percentage derived from counts.
- Date or reporting period.
- Recorded-by user.
- Relevant timestamps.

Prevent impossible values, such as attended classes exceeding conducted classes.

Calculate attendance percentages consistently and avoid storing contradictory percentage values.

### 7.6 Certifications

Each certification must support:

- Name.
- Issuing organization.
- Issue date.
- Credential ID.
- Credential URL.
- Document reference.
- Verification status where relevant.
- Timestamps.

### 7.7 Projects

Each project must support:

- Title.
- Description.
- Technology stack.
- GitHub URL.
- Live URL.
- Student role.
- Start and end dates or project duration.
- Team members.
- Supporting document or image references.
- Relevant timestamps.

### 7.8 Internships

Store:

- Company.
- Role.
- Duration.
- Start and end dates.
- Description.
- Technologies.
- Internship certificate reference.
- Offer letter reference.
- Experience letter reference.
- Status where appropriate.

### 7.9 Research and publications

Store:

- Research title.
- Authors.
- Publication.
- Conference or journal.
- Publication date.
- DOI or URL.
- Research document reference.
- Verification status where relevant.

### 7.10 Achievements and skills

Achievements must support hackathons, competitions, workshops, awards, sports, cultural activities, leadership, and other accomplishments.

Skills should be categorized into:

- Programming languages.
- Frameworks and libraries.
- Databases.
- Tools.
- Cloud technologies.
- Other technical skills.
- Soft skills.

Support proficiency levels where useful, without implying that self-reported skills have been independently verified.

### 7.11 Documents

Each document must store metadata, including:

- Owner student.
- Uploaded-by user.
- Original file name.
- Display name.
- Document type.
- MIME type.
- File size.
- Storage provider.
- Storage identifier.
- Secure access reference.
- Description.
- Upload and modification dates.

Do not store large document binaries directly inside MongoDB.

### 7.12 Mentoring records

Mentor notes, recommendations, tasks, and meeting records must be separate, auditable records where appropriate.

Each record must reference the student and authoring mentor.

Record timestamps and status changes so mentoring history remains chronological and meaningful.

Do not overwrite historical notes or delete previous feedback merely because a new record is added.

## 8. STUDENT PROFILE AND DEVELOPMENT MODULES

Build a centralized student profile with clear sections and usable editing workflows.

### 8.1 Personal information

Support:

- Full name.
- Student ID.
- Register number.
- Date of birth.
- Gender, where institutionally required.
- Phone number.
- Email.
- Address.
- Blood group, only where institutionally appropriate.
- Profile photo.
- Emergency contact.

Use field-level validation and sensible edit permissions.

### 8.2 Academic information

Support:

- Department.
- Course/program.
- Batch.
- Admission year.
- Semester and section.
- CGPA and SGPA.
- Semester-wise marks and grades.
- Backlogs.
- Academic achievements.

Present a chronological academic record and useful semester-performance visuals.

### 8.3 Attendance

Show attendance by subject and semester, including classes conducted, classes attended, attendance percentage, and reporting period.

Use accessible progress indicators and useful charts.

The student should be able to see mentor/faculty-entered records, but should not be able to alter official attendance records unless the institution explicitly grants that permission.

### 8.4 Certifications

Provide full create, read, update, and delete workflows within the applicable permissions.

Support certificate metadata, credential details, and file uploads.

### 8.5 Projects

Support full project details, technology lists, repository links, live links, team information, project dates, and supporting documents.

### 8.6 Internships

Support internship details and relevant offer letters, certificates, and experience documents.

### 8.7 Research

Support publications, authors, DOI/URL, conferences, journals, publication dates, and supporting files.

### 8.8 Achievements and extracurricular activities

Support hackathons, workshops, sports, leadership, awards, competitions, cultural activities, volunteering, and other accomplishments.

### 8.9 Skills and interests

Separate technical skill categories, soft skills, personal interests, and career preferences.

### 8.10 Career and placement information

Support:

- Career goal.
- Preferred domain.
- Preferred job role.
- Target companies.
- Higher-study plans.
- Competitive examination plans.
- Placement status.
- Relevant career milestones.
- Resume and professional profile references.

Sensitive placement or recruiter information must follow the appropriate visibility permissions.

### 8.11 Student notes

Allow students to maintain their own private notes.

Keep private student notes distinct from official mentor notes. A student must not be able to change the contents of mentor-authored feedback.

### 8.12 Profile completion

Calculate a genuine profile completion percentage from required profile sections and meaningful field completion.

Centralize the calculation so the same completion metric is used across dashboards, lists, and reports.

Do not invent arbitrary completion values.

## 9. DOCUMENT MANAGEMENT AND CLOUD STORAGE

Implement a working upload and document management system using Cloudinary or an equivalent configurable cloud storage provider.

Support:

- Certificates.
- Resumes.
- Internship documents.
- Research papers.
- Mark sheets.
- ID documents.
- Project documents.
- Achievement proofs.
- Profile photos.
- Other permitted academic documents.

Every upload must save the file and its metadata successfully.

Implement:

- Upload.
- Preview where the file format supports it.
- Download.
- Replace or update.
- Delete.
- Search by document name.
- Filter by document type.
- Pagination.
- File metadata display.
- Confirmation before destructive actions.

### Security requirements

- Enforce file size and file type allowlists on the backend.
- Do not trust client-supplied MIME types or file names.
- Generate safe storage identifiers.
- Restrict accepted formats according to use case.
- Do not execute uploaded files.
- Protect private files with authenticated, authorized access.
- Do not expose private storage URLs when they would bypass access control.
- Use short-lived signed access URLs or an authorized download endpoint when appropriate.
- Protect deletion and replacement operations using ownership and role checks.
- Remove obsolete cloud objects when files are replaced or deleted, with appropriate failure handling.
- Do not claim a file was uploaded until storage and metadata persistence have succeeded.

Handle Cloudinary configuration failures gracefully, and document the required environment variables.

## 10. MENTORING, RECOMMENDATIONS, TASKS, AND MEETINGS

### 10.1 Mentor notes

Mentors must be able to create chronological notes containing:

- Student.
- Mentor.
- Date.
- Discussion.
- Observation.
- Action required.
- Relevant follow-up details.

Maintain an immutable audit trail of changes to important mentoring records. Where note corrections are allowed, preserve the previous content or a suitable version history.

### 10.2 Recommendations

Mentors must be able to create recommendations such as:

- Improve attendance.
- Complete a certification.
- Practice data structures and algorithms.
- Improve communication.
- Apply for internships.
- Work on a project.
- Prepare a resume.
- Prepare for placements.
- Improve academic performance.
- Explore higher studies.

Every recommendation must support:

- Recommendation title and description.
- Category.
- Priority.
- Deadline.
- Student reference.
- Mentor reference.
- Creation date.
- Current status.
- Student response.
- Status history.

Allow students to view recommendations, acknowledge or respond to them, and update only the student-controlled status fields.

Maintain chronological recommendation history.

### 10.3 Tasks and improvement goals

Mentors must be able to create tasks for a student with:

- Title.
- Description.
- Assigned student.
- Assigning mentor.
- Priority.
- Start date.
- Due date.
- Status.
- Completion notes.
- Relevant timestamps.

Students must be able to view assigned tasks, update permitted progress fields, and mark tasks complete or request review according to the workflow.

Mentors should be able to confirm completion or reopen tasks when necessary.

### 10.4 Academic and career guidance

Support specific academic recommendations, career guidance, placement advice, resume feedback, and comments on progress.

Distinguish general recommendations from individual student tasks.

### 10.5 Meetings

Mentors must be able to record:

- Meeting date.
- Meeting type.
- Discussion topics.
- Student concerns.
- Mentor observations.
- Action items.
- Follow-up date.
- Meeting status.
- Participants where appropriate.

Students should be able to view their authorized meeting history.

Provide meeting lists, chronological history, and upcoming-meeting indicators.

### 10.6 Mentoring history

Provide a combined timeline of authorized mentoring events, including notes, recommendations, task assignments, attendance updates, and meetings.

Make it easy for mentors and HODs to understand student progress over time without overwriting historical records.

## 11. NOTIFICATIONS

Implement persistent notifications backed by MongoDB.

Students should receive notifications when:

- A mentor adds a note.
- A mentor creates a recommendation.
- A mentor assigns a task.
- Attendance is updated.
- The mentor requests profile information.
- An approaching deadline requires attention.

Mentors should receive notifications when:

- A student updates important profile information.
- A student completes or responds to a recommendation.
- A student uploads a document.
- A student responds to a task.
- A student requests guidance.

HODs and admins should receive relevant department or system notifications when appropriate.

Implement:

- Notification list.
- Read/unread status.
- Mark as read.
- Mark all as read where appropriate.
- Notification count.
- Links to relevant records.
- Pagination.
- Clear handling of unavailable or deleted resources.

Use real backend events and state changes to create notifications. Do not generate fake activity to fill the interface.

Email or real-time notifications may be added through configurable integrations. The core in-app notification system must work without requiring third-party messaging services.

## 12. ROLE-SPECIFIC DASHBOARDS

All dashboards must use the same design system but display different metrics, actions, datasets, and navigation items.

Use a common layout with role-specific configuration and components rather than duplicating the entire interface.

### 12.1 Mentee dashboard

Display:

- Current CGPA.
- Attendance percentage.
- Number of certifications.
- Number of projects.
- Number of achievements.
- Number of internships.
- Research/publication count.
- Pending mentor tasks.
- Recent mentor recommendations.
- Recent mentor notes.
- Upcoming academic activities.
- Profile completion percentage.

Visual sections should include:

- Academic performance.
- Attendance overview.
- Profile completion.
- Recent documents.
- Mentor notes.
- Recommendations.
- Pending tasks.

Use the red feature card with the message "Complete Your Profile" when applicable.

Every card should link to the corresponding detailed page.

### 12.2 Mentor dashboard

Display:

- Total assigned mentees.
- Average mentee CGPA.
- Average attendance.
- Students requiring attention.
- Students with low attendance.
- Students with low academic performance.
- Incomplete student profiles.
- Pending mentor tasks or reviews.
- Recent mentoring activity.
- Upcoming meetings.
- Recent notes and recommendations.

Include:

- Mentee performance.
- At-risk student indicators.
- Academic summary.
- Recent notes.
- Upcoming meetings.
- Recommendations.
- A prominent "Review Your Mentees" feature card.

Define attention thresholds in configurable settings. Do not scatter arbitrary threshold values throughout the code.

### 12.3 HOD dashboard

Display:

- Total students in the department.
- Total mentors in the department.
- Average CGPA.
- Average attendance.
- Students below the attendance threshold.
- Students below the academic threshold.
- Top-performing students.
- Certification statistics.
- Internship statistics.
- Research/publication statistics.
- Placement statistics.
- Profile completion.
- Mentor workload.
- Department performance.

Provide functional visualizations for:

- CGPA distribution.
- Attendance distribution.
- Semester-wise academic performance.
- Placement statistics.
- Certifications.
- Internships.
- Research publications.
- Mentor workload.

Include a department student list, attention indicators, recent mentoring activity, and navigation to reports.

### 12.4 Admin dashboard

Display:

- Total users.
- Total students.
- Total mentors.
- Total HODs.
- Total departments.
- Active users.
- Pending profiles.
- Recent system activity.
- Mentor assignment status.
- Department statistics.

Include visualizations for department performance, user distribution, mentor workload, and system activity where useful.

Include clear navigation to administration, users, departments, documents, audit logs, system settings, and assignments.

### 12.5 Metric correctness

Compute all dashboard statistics from persisted records through authorized backend endpoints.

Define how averages handle missing data and how placement statistics classify unplaced, placed, and in-progress students.

Return structured analytics from the backend instead of reproducing complex institutional calculations inconsistently in multiple React components.

## 13. MENTEE LIST AND STUDENT DETAIL EXPERIENCE

Build a dedicated mentee list for mentors and a department-wide student list for HODs.

Support:

- Search by student name or institutional identifier.
- Department filtering where authorized.
- Semester filtering.
- Section filtering.
- CGPA range.
- Attendance range.
- Academic performance.
- Profile completion.
- Placement status.
- Internship status.
- Research status.
- Certification status.
- Sorting.
- Pagination.
- Loading, empty, and error states.

Mentors must see only assigned students. HODs must see only students belonging to their department. Admins may see institution-wide information.

### Detailed student profile

Opening a student should show a unified, well-organized profile with:

1. Student overview.
2. Academic performance.
3. Attendance.
4. Skills and interests.
5. Certifications.
6. Projects.
7. Internships.
8. Research/publications.
9. Achievements and extracurricular activities.
10. Documents.
11. Mentor information.
12. Mentor notes.
13. Recommendations.
14. Tasks and improvement goals.
15. Meeting history.
16. Career and placement information.

Use a large editorial-style student header showing name, student ID, department, semester, section, and useful headline metrics.

The exact sections and actions visible must depend on the viewer's role.

Use clear section navigation and avoid placing the student's entire profile into one excessively long, undifferentiated form.

## 14. HOD DEPARTMENT ANALYTICS

HODs must automatically access all students belonging to their assigned department, regardless of mentor allocation.

Include:

- Department student overview.
- Academic performance.
- Semester-wise trends.
- Attendance distribution.
- Students requiring attention.
- Top-performing students.
- Certification totals.
- Internship totals.
- Research totals.
- Placement statistics.
- Profile completion.
- Mentor allocation and workload.
- Mentoring activity.

All analytics must respect department boundaries.

Create report filters and allow the HOD to navigate from aggregate metrics to the corresponding authorized student records.

HODs should generally have read-only access to sensitive student data. If an explicit permission is implemented for a write operation, verify it on the backend and record the action in the audit log.

## 15. ADMINISTRATION

Provide complete administrative functionality for:

### User management

- Create users.
- Edit permitted user fields.
- Activate and deactivate accounts.
- Assign roles.
- Reset passwords through a secure workflow.
- Search and filter users.
- Delete accounts or perform a controlled deactivation where permanent deletion would compromise audit or academic history.
- Review user assignment status.

### Departments and academic configuration

- Create and manage departments.
- Create and manage sections.
- Manage academic years.
- Manage semesters.
- Configure applicable system thresholds.
- Manage allowed account and institutional settings.

### Mentor assignments

- Assign a mentor to one or more students.
- Change an assignment.
- Review unassigned students.
- View mentor workloads.
- Validate department consistency.
- Preserve assignment history when assignments change.

A mentor must not retain unintended access to a previously assigned student after the assignment ends.

### Document and activity management

- View authorized institution-wide document metadata.
- Review system activity.
- View audit logs.
- Monitor active accounts and incomplete profiles.
- Apply permitted administrative settings.

Protect destructive actions using confirmation dialogs. Audit sensitive administrative actions.

## 16. REST API DESIGN

Build a consistent REST API under `/api`.

Use separate route modules, controllers, services, models, validation, and permission middleware.

The following endpoint families are required. Expand them as necessary to support all functional requirements.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- Appropriate password-update and token-refresh routes if required by the chosen authentication design.

### Student profile and academic records

- `GET /api/students/me`
- `PUT /api/students/me`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- Appropriate endpoints for academic records, attendance views, certifications, projects, internships, research, achievements, skills, and career information.

For each resource, implement permitted read, create, update, and delete operations where appropriate.

### Mentors

- `GET /api/mentors/mentees`
- `GET /api/mentors/mentees/:id`
- Relevant mentee search, filter, and dashboard analytics endpoints.
- Attendance creation and update routes.
- Mentor note routes.
- Recommendation routes.
- Task routes.
- Meeting routes.
- Mentor profile routes.

### Attendance

- `POST /api/attendance`
- `PUT /api/attendance/:id`
- `GET /api/attendance`
- Appropriate student, subject, semester, and reporting-period query filters.

### Mentoring notes and recommendations

- `POST /api/mentor-notes`
- `GET /api/mentor-notes/:studentId`
- `POST /api/recommendations`
- `GET /api/recommendations/:studentId`

Add update or status-transition endpoints with precise permissions.

### Meetings and tasks

- `POST /api/meetings`
- Relevant meeting read/update routes.
- Appropriate task creation, listing, completion, review, and update routes.

### Documents

- `POST /api/documents`
- `GET /api/documents`
- `GET /api/documents/:id`
- `GET /api/documents/:id/download` or an equivalent authorized access route.
- `PUT /api/documents/:id`
- `DELETE /api/documents/:id`

### Notifications

- `GET /api/notifications`
- Appropriate read and unread-status update routes.

### HOD

- `GET /api/hod/students`
- `GET /api/hod/analytics`
- Appropriate attendance, academic overview, mentor monitoring, placement, and report endpoints.

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- Appropriate department, academic configuration, mentor assignment, audit log, document metadata, and system settings endpoints.

### Reports

Provide authorized report-generation and CSV/PDF export endpoints as appropriate.

### API conventions

- Use correct HTTP status codes.
- Validate and normalize inputs.
- Return consistent JSON response structures.
- Use centralized error handling.
- Provide useful validation messages without leaking secrets.
- Support pagination with predictable metadata.
- Validate sort fields and filter operators.
- Restrict query scope on the server.
- Avoid unbounded result sets.
- Avoid mass assignment by explicitly selecting permitted update fields.
- Document request schemas, response schemas, query parameters, and permission requirements.

Use transactions where appropriate for multi-document changes supported by the deployment. Otherwise, implement careful ordering and compensating cleanup.

## 17. FRONTEND ARCHITECTURE

Use a scalable structure similar to:

```text
client/
  src/
    assets/
    components/
      common/
      dashboard/
      charts/
      forms/
      tables/
      documents/
      mentoring/
    layouts/
      PublicLayout.jsx
      MenteeLayout.jsx
      MentorLayout.jsx
      HODLayout.jsx
      AdminLayout.jsx
    pages/
      auth/
      mentee/
      mentor/
      hod/
      admin/
    routes/
    services/
    context/
    hooks/
    utils/
    styles/
    App.jsx
    main.jsx
  package.json
```

Create these separate layouts:

- `MenteeLayout`
- `MentorLayout`
- `HODLayout`
- `AdminLayout`

Reuse shared shell and design components.

Centralize API configuration, authentication handling, error interpretation, and common data transformations.

Implement route protection that provides a good user experience, but rely on the backend for actual security.

Include reusable loading, error, empty, and success states.

Create accessible form controls, reusable validation, confirmation dialogs, toast notifications, and debounced search.

Use proper keyboard navigation and visible focus states.

## 18. BACKEND ARCHITECTURE

Use a maintainable MVC/service structure, for example:

```text
server/
  src/
    config/
    models/
    routes/
    controllers/
    services/
    middleware/
    validators/
    utils/
    jobs/
    tests/
    app.js
    server.js
  scripts/
    seed.js
  package.json
```

Separate concerns:

- Models define data shape and persistence.
- Routes map URLs and HTTP methods.
- Middleware handles authentication, authorization, validation, and request processing.
- Controllers translate requests into service calls and HTTP responses.
- Services implement business rules and coordinate persistence.
- Utilities handle shared concerns.
- Background jobs handle deadline reminders or other scheduled work where needed.

Avoid putting all backend logic in `server.js` or a single controller.

Use environment configuration, centralized error handling, appropriate logging, and health-check endpoints.

## 19. SECURITY REQUIREMENTS

Treat security as part of implementation, not a final optional step.

Implement:

- bcrypt or bcryptjs password hashing.
- JWT signature validation and expiration.
- Secure session or cookie configuration.
- CSRF protection where applicable.
- Role-based authorization.
- Ownership checks on every private resource.
- Department-scope and mentor-assignment checks.
- Server-side request validation.
- Strict update-field allowlists.
- Rate limiting for login, password reset, and other sensitive endpoints.
- Helmet and appropriate security headers.
- Explicit CORS origins.
- Secure cloud-file access.
- File type and size restrictions.
- Audit logging for sensitive changes.
- Generic production error responses.
- Duplicate-account and duplicate-record handling.
- Safe handling of account deactivation and mentor reassignment.

Never expose passwords, reset tokens, JWT secrets, cloud API secrets, or other credentials in logs or responses.

Never let a student access another student's records by manipulating a URL, request body, search parameter, or resource reference.

Never let a mentor access unassigned mentees by changing an ID.

Never let an HOD cross department boundaries by supplying a different department ID.

Every protected endpoint must enforce the authenticated user's permission and resource scope.

Use least privilege for document access and administrative actions.

Keep personal contact details and identity documents appropriately restricted.

Do not treat the frontend as a security boundary.

## 20. UX AND ACCESSIBILITY

The application must feel like a real institutional product.

Include:

- Responsive layouts.
- Accessible form labels.
- Keyboard navigation.
- Visible focus states.
- Semantic headings.
- Good contrast.
- Loading indicators and skeletons.
- Empty states.
- API error states.
- Success notifications.
- Form validation.
- Confirmation dialogs for destructive actions.
- Pagination for large tables.
- Debounced search.
- Sorting and filtering.
- Breadcrumbs where useful.
- Clear save, cancel, and delete actions.
- Inline validation messages.
- Disabled states during submission.
- Duplicate-submission protection.
- Meaningful 404 and unauthorized pages.

Use restrained animation only for subtle transitions, hover states, and chart rendering.

Avoid flashy motion, bouncing elements, unnecessary floating effects, and excessive decoration.

Mobile layouts must remain usable without compromising the desktop reference style.

## 21. REPORTS AND EXPORTS

Provide reports for HODs and admins, including:

- Department student report.
- Attendance report.
- Academic performance report.
- Certification report.
- Internship report.
- Placement report.
- Research report.
- Mentor activity report.

Support CSV and PDF exports where appropriate.

Reports must:

- Respect authorization boundaries.
- Use the same calculations as dashboards.
- Support meaningful filters.
- Include clear headers and reporting periods.
- Avoid including private fields without permission.
- Handle empty datasets.
- Generate actual files instead of fake download buttons.

CSV exports must safely handle user-supplied values to reduce spreadsheet formula injection risks.

## 22. SEED DATA AND DEMONSTRATION ACCOUNTS

Create a reproducible seed script that creates a realistic demonstration environment.

Include at least:

- Multiple departments, including Computer Science, Information Science, Electronics, Mechanical, and Civil where useful.
- Multiple HOD accounts.
- Multiple mentors.
- At least 20 student accounts.
- Academic records.
- Subject attendance.
- Certifications.
- Projects.
- Internships.
- Research records.
- Achievements.
- Documents or appropriately seeded document metadata.
- Mentor notes.
- Recommendations.
- Tasks.
- Meetings.
- Notifications.
- Representative audit events where appropriate.

Create relationships that actually work. Each seeded student must belong to a valid department and have an appropriate mentor assignment where assigned.

Ensure demonstration data is internally consistent: attendance counts must be valid, semester values must be sensible, and dashboard statistics must reflect the seeded records.

Create demonstration credentials for:

- Admin.
- HOD.
- Mentor.
- Mentee.

Document the exact seeded email addresses and passwords in the README.

Use clearly identified development-only credentials. Seed passwords must be hashed. Never seed demonstration accounts automatically in production.

The seed script should be idempotent or provide a clearly documented reset strategy so it can be rerun without creating duplicate accounts.

If seeded documents cannot contain real cloud files until Cloudinary is configured, demonstrate empty/upload states honestly and document how to add them. Never display broken file links as if the uploads were real.

## 23. TESTING AND ACCEPTANCE CRITERIA

Create automated tests using an appropriate testing stack.

### Authentication tests

Verify:

- Valid login.
- Invalid login.
- Password hashing.
- Token expiration.
- Logout behavior.
- Password reset validation.
- Deactivated-account behavior.
- Rejection of unauthorized role registration.

### Authorization tests

Verify that:

- A student cannot read another student's private profile.
- A student cannot modify another student's data.
- A mentor cannot read an unassigned student.
- A mentor cannot alter privileged account roles.
- An HOD cannot access another department.
- An HOD cannot perform prohibited sensitive modifications.
- An admin can perform permitted administrative actions.
- Unauthorized users cannot download private documents.
- Mentor reassignment removes inappropriate access to previously assigned students.

Test direct API calls, not just frontend navigation.

### Feature tests

Verify:

- CRUD operations persist to MongoDB.
- Forms correctly display saved data.
- Attendance percentages use the correct calculation.
- Dashboard statistics match stored records.
- Search, sorting, filters, and pagination work.
- Uploads persist metadata and use the configured cloud provider.
- Document authorization is enforced.
- Mentor notes and recommendations remain chronological.
- Students can respond to permitted tasks and recommendations.
- Notifications are created and read correctly.
- Meeting information persists.
- Reports contain correct filtered records.
- Demo seeding produces valid relationships.

### Build and UX checks

Verify:

- Frontend production build succeeds.
- Backend starts correctly.
- API health checks work.
- No obvious broken navigation.
- No inert required actions.
- No uncontrolled form or console errors.
- Loading, empty, error, and success states work.
- Dashboard layouts are responsive.
- The visual identity remains consistent across roles.

Where automated browser testing is available, use it for core user journeys. Report tests that were not executed instead of claiming they passed.

## 24. IMPLEMENTATION PLAN

Build the system in these phases while preserving one coherent application.

### Phase 1 — Inspect and architect

- Inspect the existing workspace.
- Identify available tooling and existing files.
- Establish the frontend/backend structure.
- Define database models and relationships.
- Design API contracts.
- Define the permission matrix.
- Establish environment configuration.
- Create the shared design tokens and initial implementation checklist.

### Phase 2 — Database and authentication

- Implement core schemas.
- Configure the MongoDB connection.
- Implement authentication.
- Add validation and role authorization.
- Add ownership, assignment, and department-scope middleware.
- Implement account administration basics.
- Add foundational tests.

### Phase 3 — Shared UI and dashboards

- Implement Space Grotesk and the specified colors.
- Build the narrow sidebar and top bar.
- Implement reusable editorial cards, tables, activity timelines, charts, and the signature red feature card.
- Create all four layouts.
- Connect dashboard metrics to real API responses.
- Verify visual consistency and responsive behavior.

### Phase 4 — Student profile and academics

- Implement the centralized student profile.
- Implement academic records.
- Implement attendance.
- Implement certifications, projects, internships, research, achievements, skills, and career information.
- Implement profile completion.
- Verify CRUD operations and permissions.

### Phase 5 — Documents

- Configure Cloudinary or the selected provider.
- Implement secure upload, preview, download, replacement, and deletion.
- Implement document search, filters, and pagination.
- Verify ownership and access-control behavior.

### Phase 6 — Mentor workflows

- Implement mentee lists and filtering.
- Implement mentor notes.
- Implement recommendations.
- Implement tasks and improvement goals.
- Implement meetings.
- Implement mentoring history and progress tracking.
- Verify assignment-based access.

### Phase 7 — HOD workflows

- Implement the department student list.
- Implement department analytics.
- Implement mentor workload and academic monitoring.
- Implement placement and attendance overviews.
- Enforce department scope.
- Implement HOD reports.

### Phase 8 — Admin workflows

- Implement user management.
- Implement departments, sections, and academic configuration.
- Implement mentor assignment management.
- Implement system activity and audit log views.
- Implement document metadata management.
- Implement system settings and administrative reports.

### Phase 9 — Notifications and reports

- Implement persistent in-app notifications.
- Connect notifications to actual events.
- Implement unread status and notification navigation.
- Implement authorized CSV/PDF reports.
- Add appropriate scheduled reminders where supported.

### Phase 10 — Integration, security, and release

- Complete the automated test suite.
- Fix authorization and data-integrity issues.
- Verify frontend/backend integration.
- Verify responsive design and error handling.
- Run the production build.
- Verify seed scripts.
- Finalize README and API documentation.
- Document deployment requirements and unresolved external configuration.

If time or execution limits require prioritization, finish a coherent working vertical slice first and continue with the remaining requirements. Never disguise incomplete modules as finished functionality.

## 25. PROJECT CONFIGURATION AND ENVIRONMENT VARIABLES

Create `.env.example` files without real secrets.

Support appropriate configuration such as:

```dotenv
# Backend
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/mentor_mentee
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=15m

# Configure the chosen refresh-token/session strategy
# according to the implemented authentication design.

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Configure password-reset email delivery if enabled.
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

Adapt variable names as needed, but document every required setting.

Do not commit `.env` files containing secrets. Add appropriate entries to `.gitignore`.

Generate strong secrets locally and document the correct configuration for development and production.

## 26. README AND DOCUMENTATION

Produce a complete README containing:

1. Product overview.
2. Feature summary.
3. Technology stack.
4. Architecture and directory structure.
5. Prerequisites.
6. Installation instructions.
7. Frontend setup.
8. Backend setup.
9. MongoDB local or hosted setup.
10. Cloudinary setup.
11. Environment-variable configuration.
12. Seed-data instructions.
13. Demo credentials.
14. Development commands.
15. Test commands.
16. Production build instructions.
17. Deployment instructions.
18. API documentation or a generated OpenAPI specification.
19. Security notes.
20. Troubleshooting.
21. Known limitations and integrations requiring configuration.

Document which features are complete and which require additional external credentials or institutional policy decisions.

## 27. DEPLOYMENT REQUIREMENTS

Provide a deployment-ready configuration suitable for a separate frontend and backend deployment.

Document:

- Frontend hosting.
- Backend hosting.
- MongoDB Atlas or equivalent managed MongoDB configuration.
- Cloudinary configuration.
- HTTPS.
- Production CORS.
- Secure cookie settings.
- Environment variables.
- Health checks.
- Database indexes.
- Seed-data precautions.
- Build and start commands.
- Logging and operational monitoring.
- Backup recommendations.
- Safe deployment of configuration changes.

Do not assume that development cookie settings, wildcard origins, local MongoDB URLs, or demonstration credentials are suitable for production.

Provide Dockerfiles and an orchestration setup if useful, but do not make Docker a mandatory dependency for local development unless the repository requires it.

## 28. FINAL DELIVERABLES

The project must contain:

- Complete React frontend.
- Complete Node.js/Express backend.
- MongoDB models and indexes.
- Working REST APIs.
- JWT-based authentication.
- Role-based authorization.
- Ownership, mentor-assignment, and department-scope enforcement.
- Complete student profile system.
- Academic and attendance management.
- Certifications, projects, internships, research, skills, achievements, and career information.
- Secure cloud file management.
- Mentor notes and recommendations.
- Tasks and improvement goals.
- Mentor-student meetings.
- Persistent notifications.
- Separate dashboards and navigation for all four roles.
- HOD analytics and reporting.
- Administrative user and department management.
- CSV/PDF export functionality.
- Search, filtering, sorting, and pagination.
- Responsive UI matching the supplied references.
- Seed script with at least 20 realistic students.
- Demo accounts for all four roles.
- Automated tests.
- Environment examples.
- README and API documentation.
- Deployment configuration and instructions.

## 29. FINAL QUALITY GATE

Before considering the project complete, verify these requirements:

**Functionality**

- The React application communicates with the Express API.
- The API uses real MongoDB persistence.
- Required forms, actions, filters, reports, and dashboards work.
- Data remains available after page reload and a new session.

**Security**

- All protected APIs enforce permissions.
- Student ownership is checked on the server.
- Mentor assignments are enforced on the server.
- HOD department boundaries are enforced on the server.
- Private document access is protected.
- No privileged role can be self-assigned through public registration.
- Secrets are not hardcoded.

**Visual fidelity**

- Space Grotesk is consistently used.
- The red, peach, charcoal, gray, and white palette remains consistent.
- The narrow icon sidebar matches the reference.
- Headers use bold editorial typography.
- Dashboards preserve the asymmetric layout.
- Charts use restrained dark and red styling.
- The signature red feature card is implemented.
- Tables and profiles preserve the clean editorial aesthetic.
- All four roles share the same design language.
- Mobile and tablet layouts remain usable.

**Maintainability**

- Frontend and backend responsibilities are separated.
- Business logic is reusable and testable.
- Errors are handled consistently.
- Schemas, API contracts, and permissions are documented.
- The project can be installed and run from the README instructions.

**Delivery**

- Demo data can be created using a documented command.
- Demo credentials are provided.
- The production build is verified where the environment permits.
- Tests and their actual outcomes are documented.
- Remaining limitations are clearly disclosed.

## 30. EXECUTION INSTRUCTIONS

Begin by inspecting the existing workspace and determining which files and tools are available.

Then:

1. Create a prioritized implementation checklist.
2. Establish the complete architecture and database model.
3. Implement the application in the specified phases.
4. Run relevant tests and builds throughout development.
5. Correct errors rather than leaving known failures unresolved.
6. Maintain a clear record of completed and incomplete requirements.
7. Finish by providing the file structure, run commands, seed instructions, demo credentials, testing results, and deployment guidance.

Use the supplied reference images as the primary visual specification throughout implementation. If those images are unavailable to the coding environment, follow the exact written design system in this prompt and clearly document that limitation.

Do not stop at a plan. Do not generate a fake static dashboard. Do not claim unimplemented functionality is complete.

**The objective is a coherent, secure, maintainable, visually distinctive, database-backed Mentor–Mentee Management System that is ready for realistic institutional testing and deployment after environment-specific configuration.**
