import mongoose from 'mongoose';

const assignmentHistorySchema = new mongoose.Schema({
  previousMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  newMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, default: 'CSE' },
  reason: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: true,
      trim: true
    },
    registerNo: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    dob: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      default: 'Not Specified'
    },
    bloodGroup: {
      type: String,
      default: 'O+'
    },
    address: {
      type: String,
      default: ''
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering'
    },
    batch: {
      type: String,
      default: '2023-2027'
    },
    semester: {
      type: Number,
      default: 1
    },
    section: {
      type: String,
      default: 'A'
    },
    cgpa: {
      type: Number,
      default: 0.0
    },
    backlogs: {
      type: Number,
      default: 0
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    mentorAssignedAt: {
      type: Date,
      default: null
    },
    mentorAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignmentHistory: [assignmentHistorySchema],
    attendancePercentage: {
      type: Number,
      default: 100
    },
    status: {
      type: String,
      enum: ['EXCELLENT', 'ON_TRACK', 'AT_RISK'],
      default: 'ON_TRACK'
    },
    riskReason: {
      type: String,
      default: ''
    },
    career: {
      goal: { type: String, default: 'Software Engineering & Cloud Architecture' },
      preferredDomain: { type: String, default: 'Full-Stack & Cloud' },
      preferredRole: { type: String, default: 'Software Engineer' },
      targetCompanies: [{ type: String }],
      higherStudyPlans: { type: String, default: '' },
      resumeUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' }
    },
    skills: {
      programming: [{ type: String }],
      frameworks: [{ type: String }],
      cloudAndDevOps: [{ type: String }],
      databases: [{ type: String }],
      softSkills: [{ type: String }]
    },
    profileCompletion: {
      type: Number,
      default: 25
    }
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
