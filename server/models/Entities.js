import mongoose from 'mongoose';

// Academic Record (Semester SGPA, Subject-wise Marks, Audit History)
const subjectResultSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  credits: { type: Number, default: 3, min: 0 },
  internalMarks: { type: Number, default: 0, min: 0 },
  externalMarks: { type: Number, default: 0, min: 0 },
  totalMarks: { type: Number, default: 0, min: 0 },
  maxMarks: { type: Number, default: 100, min: 1 },
  grade: { type: String, default: 'A' },
  gradePoints: { type: Number, default: 8, min: 0, max: 10 },
  backlog: { type: Boolean, default: false },
  remarks: { type: String, default: '' }
});

const academicAuditSchema = new mongoose.Schema({
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  action: { type: String, default: 'UPDATED' },
  reason: { type: String, default: '' },
  previousValues: { type: mongoose.Schema.Types.Mixed },
  newValues: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const academicRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    academicYear: { type: String, default: '2023-2024' },
    subjects: [subjectResultSchema],
    sgpa: { type: Number, default: 0.0, min: 0, max: 10 },
    totalMarks: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'VERIFIED'],
      default: 'SUBMITTED'
    },
    highlight: { type: Boolean, default: false },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedRole: { type: String, default: 'MENTEE' },
    auditHistory: [academicAuditSchema]
  },
  { timestamps: true }
);

export const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);

// Subject-wise Attendance
const attendanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    faculty: { type: String, default: 'Faculty' },
    conducted: { type: Number, required: true },
    attended: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  { timestamps: true }
);
export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

// Project
const projectSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    techStack: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    role: { type: String, default: 'Developer' },
    duration: { type: String, default: '3 Months' },
    tag: { type: String, default: 'New' }
  },
  { timestamps: true }
);
export const Project = mongoose.model('Project', projectSchema);

// Certification
const certificationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    credentialId: { type: String, default: '' },
    verificationUrl: { type: String, default: '' },
    status: { type: String, default: 'VERIFIED' }
  },
  { timestamps: true }
);
export const Certification = mongoose.model('Certification', certificationSchema);

// Internship
const internshipSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);
export const Internship = mongoose.model('Internship', internshipSchema);

// Mentor Note
const mentorNoteSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    discussion: { type: String, required: true },
    actionRequired: { type: String, default: '' },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    tag: { type: String, default: 'New' },
    commentsCount: { type: Number, default: 0 },
    attachmentsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);
export const MentorNote = mongoose.model('MentorNote', mentorNoteSchema);

// Mentoring Task
const mentoringTaskSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    dueDate: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
    progress: { type: Number, default: 0 }
  },
  { timestamps: true }
);
export const MentoringTask = mongoose.model('MentoringTask', mentoringTaskSchema);

// Mentoring Meeting / Appointment
const mentoringMeetingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    purpose: { type: String, default: 'Academic & Career Progress Review' },
    agenda: { type: String, default: '' },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    startTime: { type: String, default: '10:00 AM' },
    endTime: { type: String, default: '10:45 AM' },
    duration: { type: Number, default: 45 }, // in minutes
    type: { type: String, enum: ['IN_PERSON', 'VIRTUAL', 'ONLINE'], default: 'IN_PERSON' },
    venue: { type: String, default: 'Faculty Office' },
    meetingUrl: { type: String, default: '' },
    preparationInstructions: { type: String, default: '' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'SCHEDULED'
    },
    // Post-Meeting Records
    discussionPoints: { type: String, default: '' },
    studentConcerns: { type: String, default: '' },
    mentorObservations: { type: String, default: '' },
    actionItems: { type: String, default: '' },
    followUpDate: { type: String, default: '' }
  },
  { timestamps: true }
);
export const MentoringMeeting = mongoose.model('MentoringMeeting', mentoringMeetingSchema);

// Notification
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'URGENT' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);
export const Notification = mongoose.model('Notification', notificationSchema);

// Department
const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);
export const Department = mongoose.model('Department', departmentSchema);
