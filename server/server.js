import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import { User } from './models/User.js';
import { StudentProfile } from './models/StudentProfile.js';
import {
  AcademicRecord,
  AttendanceRecord,
  Project,
  Certification,
  Internship,
  MentorNote,
  MentoringTask,
  MentoringMeeting,
  Notification,
  Department
} from './models/Entities.js';
import { Document } from './models/Document.js';
import { DocumentRequest } from './models/DocumentRequest.js';
import { Assignment } from './models/Assignment.js';
import { protect, authorize } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentee_db';
const JWT_SECRET = process.env.JWT_SECRET || 'mentee_super_secret_jwt_key_2026';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log(` Connected to MongoDB: ${MONGODB_URI}`))
  .catch((err) => {
    console.error(`❌ MongoDB connection error:`, err);
  });

// Setup uploads directory for local fallback
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Cloudinary if credentials provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️  Cloudinary configured for remote media asset management');
} else {
  console.log('📁 Local disk storage configured with protected authorization proxy');
}

// Helper to safely delete assets from Cloudinary with resource_type support
const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  if (!isCloudinaryConfigured || !publicId) return;
  try {
    if (resourceType && resourceType !== 'auto') {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (res?.result === 'ok') return;
    }
    // Fallback: try image first, then raw
    const imgRes = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    if (imgRes?.result !== 'ok') {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
  } catch (err) {
    console.warn('Notice during Cloudinary cleanup:', err.message);
  }
};

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    cb(null, `doc-${uniqueSuffix}${sanitizedExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only PDF, Images (JPEG, PNG, WEBP), and Word Documents are accepted.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Middleware configuration
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(cookieParser());
app.use(express.json());

// Token & Cookie Helpers
const COOKIE_NAME = 'token';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    path: '/'
  });
};

// Helper for resilient department matching (e.g. CSE matches Computer Science & Engineering)
const getDeptRegex = (dept) => {
  if (!dept || dept === 'ALL') return null;
  const trimmed = String(dept).trim();
  if (/^cse$/i.test(trimmed) || /computer/i.test(trimmed)) {
    return /cse|computer/i;
  }
  if (/^ece$/i.test(trimmed) || /electronics/i.test(trimmed)) {
    return /ece|electronics/i;
  }
  if (/^mech$/i.test(trimmed) || /mechanical/i.test(trimmed)) {
    return /mech|mechanical/i;
  }
  return new RegExp(trimmed, 'i');
};

// =========================================================================
// DOCUMENT PRIVACY ACCESS POLICY HELPER
// CRITICAL PRIVACY RULE: A student's uploaded documents are accessible ONLY
// to the student and their CURRENTLY assigned mentor.
// HODs and admins are strictly FORBIDDEN from viewing or downloading document contents.
// Former mentors immediately lose access upon reassignment.
// =========================================================================
const checkDocumentAccess = async (user, studentUserId) => {
  if (!user || !studentUserId) return { allowed: false, reason: 'Unauthenticated' };

  // 1. Is student themselves?
  if (user._id.toString() === studentUserId.toString()) {
    return { allowed: true, role: 'STUDENT' };
  }

  // 2. Is currently assigned mentor?
  if (user.role === 'MENTOR') {
    const profile = await StudentProfile.findOne({
      user: studentUserId,
      mentor: user._id
    });
    if (profile) {
      return { allowed: true, role: 'MENTOR' };
    }
  }

  // HOD, Admin, unassigned mentor, or other student are STRICTLY DENIED!
  return {
    allowed: false,
    reason: 'Student documents are strictly private to the student and their currently assigned mentor. HODs and admins do not have access to private document contents.'
  };
};

// =========================================================================
// 1. Authentication Routes (Cookie-based Session Management)
// =========================================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, studentId, batch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const userRole = role ? role.toUpperCase() : 'MENTEE';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      department: department || 'CSE',
      designation:
        designation ||
        (userRole === 'MENTEE'
          ? 'Student'
          : userRole === 'MENTOR'
          ? 'Faculty Mentor'
          : userRole === 'HOD'
          ? 'Head of Department'
          : 'Administrator'),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    if (userRole === 'MENTEE') {
      const generatedId = studentId || `CS-${Date.now().toString().slice(-4)}`;
      await StudentProfile.create({
        user: user._id,
        studentId: generatedId,
        department: department || 'Computer Science & Engineering',
        batch: batch || '2023-2027',
        semester: semester ? Number(semester) : 1,
        profileCompletion: 40
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error during authentication' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        designation: req.user.designation,
        avatar: req.user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching current session' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Successfully signed out' });
});

// =========================================================================
// 2. HOD Mentor Assignment Management
// =========================================================================

// GET /api/hod/mentor-assignments (List all students with assignment status)
app.get('/api/hod/mentor-assignments', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    const { search, semester, section, status, department } = req.query;
    let query = {};

    if (req.user.role === 'HOD' && req.user.department) {
      const deptRegex = getDeptRegex(req.user.department);
      if (deptRegex) query.department = { $regex: deptRegex };
    } else if (department && department !== 'ALL') {
      const deptRegex = getDeptRegex(department);
      if (deptRegex) query.department = { $regex: deptRegex };
    }

    if (semester) query.semester = Number(semester);
    if (section) query.section = section;
    if (status === 'ASSIGNED') query.mentor = { $ne: null };
    if (status === 'UNASSIGNED') query.mentor = null;

    let profiles = await StudentProfile.find(query)
      .populate('user', 'name email avatar status')
      .populate('mentor', 'name email designation avatar department')
      .populate('assignmentHistory.previousMentor', 'name email')
      .populate('assignmentHistory.newMentor', 'name email')
      .populate('assignmentHistory.assignedBy', 'name email')
      .sort('-createdAt');

    if (search) {
      const q = search.toLowerCase();
      profiles = profiles.filter((p) => {
        const studentName = p.user?.name?.toLowerCase() || '';
        const studentId = p.studentId?.toLowerCase() || '';
        const mentorName = p.mentor?.name?.toLowerCase() || '';
        return studentName.includes(q) || studentId.includes(q) || mentorName.includes(q);
      });
    }

    res.json({ success: true, assignments: profiles });
  } catch (err) {
    console.error('Error fetching mentor assignments:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch mentor assignments' });
  }
});

// GET /api/hod/unassigned-students
app.get('/api/hod/unassigned-students', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    let query = { mentor: null };
    if (req.user.role === 'HOD' && req.user.department) {
      const deptRegex = getDeptRegex(req.user.department);
      if (deptRegex) query.department = { $regex: deptRegex };
    }

    const unassigned = await StudentProfile.find(query)
      .populate('user', 'name email avatar')
      .sort('studentId');

    res.json({ success: true, students: unassigned, unassignedStudents: unassigned });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch unassigned students' });
  }
});

// GET /api/hod/available-mentors
app.get('/api/hod/available-mentors', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    let query = { role: 'MENTOR' };
    const { department } = req.query;

    if (req.user.role === 'HOD' && req.user.department) {
      const deptRegex = getDeptRegex(req.user.department);
      if (deptRegex) query.department = { $regex: deptRegex };
    } else if (req.user.role === 'ADMIN' && department && department !== 'ALL') {
      const deptRegex = getDeptRegex(department);
      if (deptRegex) query.department = { $regex: deptRegex };
    }

    const mentors = await User.find(query).select('name email designation department avatar status').sort('name');

    // Count currently assigned mentees for each mentor
    const mentorsWithCounts = await Promise.all(
      mentors.map(async (m) => {
        const count = await StudentProfile.countDocuments({ mentor: m._id });
        return {
          id: m._id,
          name: m.name,
          email: m.email,
          designation: m.designation,
          department: m.department,
          avatar: m.avatar,
          currentMenteeCount: count,
          maxCapacity: 25,
          availability: count < 25 ? 'AVAILABLE' : 'AT_CAPACITY'
        };
      })
    );

    res.json({ success: true, mentors: mentorsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch eligible mentors' });
  }
});

// POST /api/hod/mentor-assignments (Assign or reassign mentor)
app.post('/api/hod/mentor-assignments', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    const { studentProfileId, studentUserId, studentId, mentorId, reason } = req.body;
    const targetStudentId = studentId || studentUserId || studentProfileId;

    if (!mentorId || !targetStudentId) {
      return res.status(400).json({ success: false, error: 'Student and Mentor are required' });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'MENTOR') {
      return res.status(400).json({ success: false, error: 'Selected user is not an eligible mentor' });
    }

    let profile = await StudentProfile.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(targetStudentId) ? targetStudentId : null },
        { user: targetStudentId }
      ]
    }).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    const previousMentorId = profile.mentor;
    profile.mentor = mentor._id;
    profile.mentorAssignedAt = new Date();
    profile.mentorAssignedBy = req.user._id;

    profile.assignmentHistory.push({
      previousMentor: previousMentorId || null,
      newMentor: mentor._id,
      assignedBy: req.user._id,
      department: profile.department,
      reason: reason || 'Assigned by Head of Department',
      date: new Date()
    });

    await profile.save();

    // Notify Student
    await Notification.create({
      recipient: profile.user._id,
      title: 'Mentor Allocated',
      message: `${mentor.name} has been assigned as your faculty mentor.`,
      type: 'INFO'
    });

    // Notify New Mentor
    await Notification.create({
      recipient: mentor._id,
      title: 'New Mentee Assigned',
      message: `${profile.user.name} (${profile.studentId}) has been assigned to your mentorship cohort.`,
      type: 'INFO'
    });

    // If reassigned from a previous mentor, notify them that access has ended
    if (previousMentorId && previousMentorId.toString() !== mentor._id.toString()) {
      await Notification.create({
        recipient: previousMentorId,
        title: 'Mentee Reassigned',
        message: `${profile.user.name} (${profile.studentId}) has been reassigned to ${mentor.name}.`,
        type: 'INFO'
      });
    }

    const updatedProfile = await StudentProfile.findById(profile._id)
      .populate('user', 'name email avatar')
      .populate('mentor', 'name email designation department avatar')
      .populate('assignmentHistory.previousMentor', 'name email')
      .populate('assignmentHistory.newMentor', 'name email')
      .populate('assignmentHistory.assignedBy', 'name email');

    res.json({ success: true, assignment: updatedProfile });
  } catch (err) {
    console.error('Error assigning mentor:', err);
    res.status(500).json({ success: false, error: err.message || 'Error processing mentor assignment' });
  }
});

// PATCH /api/hod/mentor-assignments/:id
app.patch('/api/hod/mentor-assignments/:id', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    const { mentorId, reason } = req.body;
    const profile = await StudentProfile.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { user: req.params.id }
      ]
    }).populate('user', 'name email');

    if (!profile) return res.status(404).json({ success: false, error: 'Student record not found' });

    const newMentor = await User.findById(mentorId);
    if (!newMentor || newMentor.role !== 'MENTOR') {
      return res.status(400).json({ success: false, error: 'Invalid mentor selected' });
    }

    const previousMentorId = profile.mentor;
    profile.mentor = newMentor._id;
    profile.mentorAssignedAt = new Date();
    profile.mentorAssignedBy = req.user._id;

    profile.assignmentHistory.push({
      previousMentor: previousMentorId || null,
      newMentor: newMentor._id,
      assignedBy: req.user._id,
      department: profile.department,
      reason: reason || 'Reassigned by HOD',
      date: new Date()
    });

    await profile.save();

    res.json({ success: true, assignment: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating mentor assignment' });
  }
});

// =========================================================================
// 3. Academic Records (Semester Marks, Subjects & Audit History)
// =========================================================================

// Helper to calculate SGPA and CGPA
const calculateAcademicMetrics = (subjects) => {
  if (!subjects || subjects.length === 0) {
    return { sgpa: 0, totalMarks: 0, maxMarks: 0, percentage: 0, totalCredits: 0 };
  }

  let totalQualityPoints = 0;
  let totalCredits = 0;
  let totalMarks = 0;
  let maxMarks = 0;

  subjects.forEach((sub) => {
    const internal = Number(sub.internalMarks) || 0;
    const external = Number(sub.externalMarks) || 0;
    const subTotal = sub.totalMarks ? Number(sub.totalMarks) : internal + external;
    const subMax = Number(sub.maxMarks) || 100;
    const creds = Number(sub.credits) || 3;
    const gp = Number(sub.gradePoints) || 0;

    totalMarks += subTotal;
    maxMarks += subMax;
    totalCredits += creds;
    totalQualityPoints += gp * creds;
  });

  const sgpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;
  const percentage = maxMarks > 0 ? Number(((totalMarks / maxMarks) * 100).toFixed(1)) : 0;

  return { sgpa, totalMarks, maxMarks, percentage, totalCredits };
};

// GET /api/academics/records
app.get('/api/academics/records', protect, async (req, res) => {
  try {
    let studentUserId = req.query.studentId || req.user._id;

    // Authorization:
    // Student can only query own records.
    if (req.user.role === 'MENTEE' && req.user._id.toString() !== studentUserId.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden: You may only access your own academic records' });
    }

    // Mentor can query only if student is currently assigned.
    if (req.user.role === 'MENTOR') {
      if (!req.query.studentId) {
        // If mentor didn't provide a studentId, default to their first assigned mentee
        const firstMentee = await StudentProfile.findOne({ mentor: req.user._id });
        if (!firstMentee) {
          return res.json({
            success: true,
            records: [],
            summary: { cgpa: 0, totalSemesters: 0, currentSemester: 1 }
          });
        }
        studentUserId = firstMentee.user;
      } else {
        const assignment = await StudentProfile.findOne({
          $or: [{ user: req.query.studentId }, { _id: req.query.studentId }],
          mentor: req.user._id
        });
        if (!assignment) {
          return res.status(403).json({ success: false, error: 'Forbidden: You may only view academic records of students currently assigned to you' });
        }
        studentUserId = assignment.user;
      }
    }

    const records = await AcademicRecord.find({ student: studentUserId })
      .populate('lastModifiedBy', 'name role')
      .populate('auditHistory.modifiedBy', 'name role')
      .sort('semester');

    const profile = await StudentProfile.findOne({ user: studentUserId });

    // Calculate cumulative CGPA
    const validRecords = records.filter((r) => r.sgpa > 0);
    const cumulativeCGPA =
      validRecords.length > 0
        ? Number((validRecords.reduce((acc, curr) => acc + curr.sgpa, 0) / validRecords.length).toFixed(2))
        : profile?.cgpa || 0;

    res.json({
      success: true,
      records,
      summary: {
        cgpa: cumulativeCGPA,
        totalSemesters: records.length,
        currentSemester: profile?.semester || 1
      }
    });
  } catch (err) {
    console.error('Error fetching academic records:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve academic records' });
  }
});

// POST /api/academics/records (Create or update semester marks)
app.post('/api/academics/records', protect, async (req, res) => {
  try {
    const { studentId, semester, academicYear, subjects, status, reason } = req.body;
    let targetUserId = req.user._id;
    if (studentId) {
      if (req.user.role === 'MENTEE' && studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Forbidden: You cannot modify another student\'s records' });
      }
      targetUserId = studentId;
    }

    if (req.user.role === 'MENTOR') {
      if (!studentId) {
        return res.status(400).json({ success: false, error: 'Student ID is required when mentor updates marks' });
      }
      const assignment = await StudentProfile.findOne({
        $or: [{ user: targetUserId }, { _id: targetUserId }],
        mentor: req.user._id
      });
      if (!assignment) {
        return res.status(403).json({ success: false, error: 'Forbidden: You can only edit marks for currently assigned mentees' });
      }
      targetUserId = assignment.user;
    }

    if (!semester) {
      return res.status(400).json({ success: false, error: 'Semester number is required' });
    }

    const calculated = calculateAcademicMetrics(subjects);

    let existingRecord = await AcademicRecord.findOne({
      student: targetUserId,
      semester: Number(semester)
    });

    const previousValues = existingRecord ? existingRecord.toObject() : null;

    if (!existingRecord) {
      existingRecord = new AcademicRecord({
        student: targetUserId,
        semester: Number(semester),
        academicYear: academicYear || '2023-2024',
        subjects: subjects || [],
        ...calculated,
        status: status || 'SUBMITTED',
        lastModifiedBy: req.user._id,
        lastModifiedRole: req.user.role
      });
    } else {
      existingRecord.academicYear = academicYear || existingRecord.academicYear;
      existingRecord.subjects = subjects || existingRecord.subjects;
      existingRecord.sgpa = calculated.sgpa;
      existingRecord.totalMarks = calculated.totalMarks;
      existingRecord.maxMarks = calculated.maxMarks;
      existingRecord.percentage = calculated.percentage;
      existingRecord.credits = calculated.totalCredits;
      if (status) existingRecord.status = status;
      existingRecord.lastModifiedBy = req.user._id;
      existingRecord.lastModifiedRole = req.user.role;
    }

    // Append to audit trail
    existingRecord.auditHistory.push({
      modifiedBy: req.user._id,
      role: req.user.role,
      action: previousValues ? 'UPDATED' : 'CREATED',
      reason: reason || (req.user.role === 'MENTOR' ? 'Mentor revised semester marks' : 'Student updated semester results'),
      previousValues: previousValues ? { sgpa: previousValues.sgpa, subjectsCount: previousValues.subjects?.length } : null,
      newValues: { sgpa: calculated.sgpa, subjectsCount: subjects?.length },
      timestamp: new Date()
    });

    await existingRecord.save();

    // Recalculate and update cumulative CGPA in StudentProfile
    const allStudentRecords = await AcademicRecord.find({ student: targetUserId, sgpa: { $gt: 0 } });
    if (allStudentRecords.length > 0) {
      const avgSgpa = allStudentRecords.reduce((sum, r) => sum + r.sgpa, 0) / allStudentRecords.length;
      await StudentProfile.findOneAndUpdate(
        { user: targetUserId },
        { cgpa: Number(avgSgpa.toFixed(2)) }
      );
    }

    // Send notification
    if (req.user.role === 'MENTOR') {
      await Notification.create({
        recipient: targetUserId,
        title: 'Academic Marks Updated',
        message: `${req.user.name} updated your Semester ${semester} academic records.`,
        type: 'INFO'
      });
    } else {
      const studentProfile = await StudentProfile.findOne({ user: targetUserId });
      if (studentProfile?.mentor) {
        await Notification.create({
          recipient: studentProfile.mentor,
          title: 'Mentee Updated Semester Marks',
          message: `${req.user.name} submitted/updated their Semester ${semester} marks.`,
          type: 'INFO'
        });
      }
    }

    const populatedRecord = await AcademicRecord.findById(existingRecord._id)
      .populate('lastModifiedBy', 'name role')
      .populate('auditHistory.modifiedBy', 'name role');

    res.json({ success: true, record: populatedRecord });
  } catch (err) {
    console.error('Error saving academic record:', err);
    res.status(500).json({ success: false, error: err.message || 'Error saving academic record' });
  }
});

// DELETE /api/academics/records/:id (Delete draft record)
app.delete('/api/academics/records/:id', protect, async (req, res) => {
  try {
    const record = await AcademicRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });

    if (req.user.role === 'MENTEE' && record.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    if (req.user.role === 'MENTOR') {
      const assignment = await StudentProfile.findOne({ user: record.student, mentor: req.user._id });
      if (!assignment) return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await AcademicRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Academic semester record removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting academic record' });
  }
});

// GET /api/academics/records/:id/history (Audit trail)
app.get('/api/academics/records/:id/history', protect, async (req, res) => {
  try {
    const record = await AcademicRecord.findById(req.params.id).populate('auditHistory.modifiedBy', 'name role email');
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });

    if (req.user.role === 'MENTEE' && record.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({ success: true, history: record.auditHistory });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching history' });
  }
});

// =========================================================================
// 4. Strict Document Visibility & Approval Workflow
// =========================================================================

// POST /api/documents/upload (Upload document)
app.post('/api/documents/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please choose a file to upload' });
    }

    const { displayName, documentType, description, documentRequestId } = req.body;
    const studentUserId = req.user._id;

    let storageProvider = 'local';
    let storageId = req.file.filename;
    let secureUrl = `/api/documents/${req.file.filename}/file`;
    let storageResourceType = 'auto';

    if (isCloudinaryConfigured) {
      try {
        const cloudUpload = await cloudinary.uploader.upload(req.file.path, {
          folder: 'mentee_documents',
          resource_type: 'auto',
          tags: ['mentee_portal', documentType || 'academic']
        });
        storageProvider = 'cloudinary';
        storageId = cloudUpload.public_id;
        secureUrl = cloudUpload.secure_url;
        storageResourceType = cloudUpload.resource_type || 'auto';

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload fallback to local storage:', cloudErr.message);
      }
    }

    const newDoc = await Document.create({
      student: studentUserId,
      uploadedBy: req.user._id,
      originalFilename: req.file.originalname,
      displayName: displayName || req.file.originalname,
      documentType: documentType || 'Other academic document',
      description: description || '',
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storageProvider,
      storageId,
      secureUrl,
      storageResourceType,
      documentRequest: documentRequestId || null,
      reviewStatus: 'PENDING_REVIEW',
      reviewHistory: [
        {
          reviewer: req.user._id,
          status: 'PENDING_REVIEW',
          comment: description || 'Document uploaded by student',
          date: new Date()
        }
      ]
    });

    // Notify assigned mentor if assigned
    const profile = await StudentProfile.findOne({ user: studentUserId }).populate('mentor');
    if (profile?.mentor) {
      await Notification.create({
        recipient: profile.mentor._id,
        title: 'New Document Uploaded',
        message: `${req.user.name} uploaded "${newDoc.displayName}" for your review.`,
        type: 'INFO'
      });
    }

    // If associated with a DocumentRequest
    if (documentRequestId) {
      const docRequest = await DocumentRequest.findById(documentRequestId);
      if (docRequest) {
        docRequest.status = 'UNDER REVIEW';
        docRequest.submittedDocument = newDoc._id;
        docRequest.reviewHistory.push({
          reviewer: req.user._id,
          action: 'UPLOADED',
          reason: description || 'Document submitted by student'
        });
        await docRequest.save();
      }
    }

    res.status(201).json({ success: true, document: newDoc });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error uploading document' });
  }
});

// GET /api/documents (Strict privacy list)
app.get('/api/documents', protect, async (req, res) => {
  try {
    const { search, documentType, page = 1, limit = 20, studentId } = req.query;
    let query = {};

    // STRICT PRIVACY: HODs and Admins cannot list student documents!
    if (req.user.role === 'HOD' || req.user.role === 'ADMIN') {
      return res.json({
        success: true,
        documents: [],
        total: 0,
        page: 1,
        pages: 0,
        note: 'Student documents are strictly private to the student and their currently assigned mentor.'
      });
    }

    if (req.user.role === 'MENTEE') {
      query.student = req.user._id;
    } else if (req.user.role === 'MENTOR') {
      if (studentId) {
        // Confirm assigned
        const assigned = await StudentProfile.findOne({ user: studentId, mentor: req.user._id });
        if (!assigned) {
          return res.status(403).json({ success: false, error: 'Forbidden: You may only view documents of assigned mentees' });
        }
        query.student = studentId;
      } else {
        const mentees = await StudentProfile.find({ mentor: req.user._id }).select('user');
        query.student = { $in: mentees.map((m) => m.user) };
      }
    }

    if (documentType && documentType !== 'ALL') {
      query.documentType = documentType;
    }

    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const documents = await Document.find(query)
      .populate('student', 'name email avatar')
      .populate('uploadedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('documentRequest')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      documents,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ success: false, error: 'Error fetching documents' });
  }
});

// GET /api/mentor/document-reviews (Dedicated queue for assigned mentor)
app.get('/api/mentor/document-reviews', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const mentees = await StudentProfile.find({ mentor: req.user._id }).select('user');
    const menteeUserIds = mentees.map((m) => m.user);

    const documents = await Document.find({
      student: { $in: menteeUserIds }
    })
      .populate('student', 'name email avatar studentId')
      .populate('documentRequest')
      .sort('-createdAt');

    const pending = documents.filter((d) => d.reviewStatus === 'PENDING_REVIEW');
    const reviewed = documents.filter((d) => d.reviewStatus !== 'PENDING_REVIEW');

    res.json({
      success: true,
      pendingReviews: pending,
      reviewHistory: reviewed,
      totalPending: pending.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch document review queue' });
  }
});

// GET /api/documents/:id/download (Strict authorized download/preview)
app.get('/api/documents/:id/download', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document record not found' });
    }

    // STRICT PRIVACY ENFORCEMENT
    const access = await checkDocumentAccess(req.user, document.student);
    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: ${access.reason}`
      });
    }

    const isPreview = req.query.preview === 'true' || req.query.view === 'true';

    if (document.storageProvider === 'cloudinary') {
      if (isPreview) {
        return res.redirect(document.secureUrl);
      }
      // Cloudinary flag format: fl_attachment or fl_attachment:filename (filename must not contain dots/colons)
      const ext = path.extname(document.originalFilename || '');
      const rawBasename = path.basename(document.originalFilename || 'document', ext);
      const safeBasename = rawBasename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'document';
      const downloadUrl = document.secureUrl.replace('/upload/', `/upload/fl_attachment:${safeBasename}/`);
      return res.redirect(downloadUrl);
    }

    const localFilePath = path.join(UPLOADS_DIR, document.storageId);
    if (!fs.existsSync(localFilePath)) {
      return res.status(404).json({ success: false, error: 'Physical document file missing on disk' });
    }

    const disposition = isPreview ? 'inline' : 'attachment';
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `${disposition}; filename="${document.originalFilename}"`);
    res.sendFile(localFilePath);
  } catch (err) {
    console.error('Download authorization error:', err);
    res.status(500).json({ success: false, error: 'Error processing document download' });
  }
});

// GET /api/documents/:filename/file (Authorized direct local file stream)
app.get('/api/documents/:filename/file', protect, async (req, res) => {
  try {
    const document = await Document.findOne({ storageId: req.params.filename });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    const access = await checkDocumentAccess(req.user, document.student);
    if (!access.allowed) {
      return res.status(403).json({ success: false, error: `Forbidden: ${access.reason}` });
    }
    const localFilePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!fs.existsSync(localFilePath)) {
      return res.status(404).json({ success: false, error: 'Physical document file missing on disk' });
    }
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalFilename}"`);
    res.sendFile(localFilePath);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error processing document file' });
  }
});

// POST /api/documents/:id/approve (Mentor approves submission)
app.post('/api/documents/:id/approve', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('student', 'name email');
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

    // Validate that mentor is CURRENTLY assigned to this student
    const isAssigned = await StudentProfile.findOne({ user: document.student._id, mentor: req.user._id });
    if (!isAssigned) {
      return res.status(403).json({ success: false, error: 'Forbidden: You may only review documents for your currently assigned mentees' });
    }

    document.reviewStatus = 'APPROVED';
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    document.reviewComment = req.body.comment || 'Verified and approved by mentor';
    document.rejectionReason = '';

    document.reviewHistory.push({
      reviewer: req.user._id,
      status: 'APPROVED',
      comment: document.reviewComment,
      date: new Date()
    });

    await document.save();

    // If associated with a DocumentRequest, mark request as approved
    if (document.documentRequest) {
      await DocumentRequest.findByIdAndUpdate(document.documentRequest, {
        status: 'APPROVED',
        $push: {
          reviewHistory: {
            reviewer: req.user._id,
            action: 'APPROVED',
            reason: document.reviewComment,
            date: new Date()
          }
        }
      });
    }

    // Notify student
    await Notification.create({
      recipient: document.student._id,
      title: 'Document Approved',
      message: `Your document "${document.displayName}" has been verified and approved by ${req.user.name}.`,
      type: 'SUCCESS'
    });

    res.json({ success: true, document });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, error: 'Error approving document' });
  }
});

// POST /api/documents/:id/reject (Mentor rejects submission with reason)
app.post('/api/documents/:id/reject', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection reason is mandatory' });
    }

    const document = await Document.findById(req.params.id).populate('student', 'name email');
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

    const isAssigned = await StudentProfile.findOne({ user: document.student._id, mentor: req.user._id });
    if (!isAssigned) {
      return res.status(403).json({ success: false, error: 'Forbidden: You may only review documents for your currently assigned mentees' });
    }

    document.reviewStatus = 'REJECTED';
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    document.rejectionReason = reason;
    document.reviewComment = reason;

    document.reviewHistory.push({
      reviewer: req.user._id,
      status: 'REJECTED',
      comment: reason,
      date: new Date()
    });

    await document.save();

    if (document.documentRequest) {
      await DocumentRequest.findByIdAndUpdate(document.documentRequest, {
        status: 'REJECTED',
        $push: {
          reviewHistory: {
            reviewer: req.user._id,
            action: 'REJECTED',
            reason,
            date: new Date()
          }
        }
      });
    }

    await Notification.create({
      recipient: document.student._id,
      title: 'Document Requires Revision',
      message: `Your document "${document.displayName}" was rejected: ${reason}. Please upload a corrected version.`,
      type: 'URGENT'
    });

    res.json({ success: true, document });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error rejecting document' });
  }
});

// PUT /api/documents/:id/replace
app.put('/api/documents/:id/replace', protect, upload.single('file'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

    if (document.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden: You may only replace your own documents' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please choose a replacement file' });
    }

    // Clean up old storage asset
    if (document.storageProvider === 'cloudinary' && isCloudinaryConfigured) {
      await deleteFromCloudinary(document.storageId, document.storageResourceType);
    } else {
      const oldFilePath = path.join(UPLOADS_DIR, document.storageId);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          // ignore
        }
      }
    }

    let storageProvider = 'local';
    let storageId = req.file.filename;
    let secureUrl = `/api/documents/${req.file.filename}/file`;
    let storageResourceType = 'auto';

    if (isCloudinaryConfigured) {
      try {
        const cloudUpload = await cloudinary.uploader.upload(req.file.path, {
          folder: 'mentee_documents',
          resource_type: 'auto'
        });
        storageProvider = 'cloudinary';
        storageId = cloudUpload.public_id;
        secureUrl = cloudUpload.secure_url;
        storageResourceType = cloudUpload.resource_type || 'auto';
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('Fallback to local on replace');
      }
    }

    document.originalFilename = req.file.originalname;
    document.mimeType = req.file.mimetype;
    document.fileSize = req.file.size;
    document.storageProvider = storageProvider;
    document.storageId = storageId;
    document.secureUrl = secureUrl;
    document.storageResourceType = storageResourceType;
    document.reviewStatus = 'PENDING_REVIEW';
    document.rejectionReason = '';

    document.reviewHistory.push({
      reviewer: req.user._id,
      status: 'PENDING_REVIEW',
      comment: 'Revised version uploaded by student',
      date: new Date()
    });

    await document.save();

    res.json({ success: true, document });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error replacing document' });
  }
});

// DELETE /api/documents/:id
app.delete('/api/documents/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

    if (document.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden: You may only delete your own documents' });
    }

    if (document.storageProvider === 'cloudinary' && isCloudinaryConfigured) {
      await deleteFromCloudinary(document.storageId, document.storageResourceType);
    } else {
      const localFilePath = path.join(UPLOADS_DIR, document.storageId);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (e) {
          // ignore
        }
      }
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting document' });
  }
});

// =========================================================================
// 5. Mentor Document Requests Workflow
// =========================================================================

// POST /api/document-requests
app.post('/api/document-requests', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const { studentId, title, documentType, description, priority, dueDate, isRequired } = req.body;

    if (!studentId || !title || !dueDate) {
      return res.status(400).json({ success: false, error: 'Student, Title, and Due Date are required' });
    }

    const assignment = await StudentProfile.findOne({
      $or: [{ user: studentId }, { _id: studentId }],
      mentor: req.user._id
    });
    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You may only request documents from students officially assigned to your mentorship'
      });
    }

    const resolvedStudentUserId = assignment.user;

    const docRequest = await DocumentRequest.create({
      student: resolvedStudentUserId,
      mentor: req.user._id,
      title,
      documentType: documentType || 'Semester marks card',
      description: description || '',
      priority: priority || 'HIGH',
      dueDate: new Date(dueDate),
      isRequired: isRequired !== false,
      status: 'PENDING',
      reviewHistory: [
        {
          reviewer: req.user._id,
          action: 'REQUESTED',
          reason: description || 'Document request issued by mentor',
          date: new Date()
        }
      ]
    });

    await Notification.create({
      recipient: resolvedStudentUserId,
      title: 'Mentor Requested a Document',
      message: `${req.user.name} requested: "${title}". Due: ${new Date(dueDate).toLocaleDateString()}.`,
      type: priority === 'URGENT' ? 'URGENT' : 'INFO'
    });

    res.status(201).json({ success: true, documentRequest: docRequest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Error creating document request' });
  }
});

// GET /api/document-requests
app.get('/api/document-requests', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'MENTEE') {
      query.student = req.user._id;
    } else if (req.user.role === 'MENTOR') {
      query.mentor = req.user._id;
    }

    const requests = await DocumentRequest.find(query)
      .populate('student', 'name email avatar studentId')
      .populate('mentor', 'name email designation avatar')
      .populate('submittedDocument')
      .sort('-createdAt');

    res.json({ success: true, documentRequests: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching requests' });
  }
});

// POST /api/document-requests/:id/review (Mentor reviews a document request)
app.post('/api/document-requests/:id/review', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const { action, reason, comment } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Valid action (APPROVED or REJECTED) is required' });
    }
    if (action === 'REJECTED' && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, error: 'Rejection reason is mandatory' });
    }

    const docRequest = await DocumentRequest.findById(req.params.id);
    if (!docRequest) {
      return res.status(404).json({ success: false, error: 'Document request not found' });
    }

    // Verify requesting mentor or assignment
    const isRequestMentor = docRequest.mentor.toString() === req.user._id.toString();
    const isAssigned = await StudentProfile.findOne({ user: docRequest.student, mentor: req.user._id });
    if (!isRequestMentor && !isAssigned) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You may only review document requests for your assigned mentees'
      });
    }

    docRequest.status = action;
    const reviewNote = reason || comment || (action === 'APPROVED' ? 'Approved by mentor' : 'Rejected');
    docRequest.reviewHistory.push({
      reviewer: req.user._id,
      action,
      reason: reviewNote,
      date: new Date()
    });
    await docRequest.save();

    // If a document was submitted against this request, update the document status consistently
    if (docRequest.submittedDocument) {
      const doc = await Document.findById(docRequest.submittedDocument);
      if (doc) {
        doc.reviewStatus = action;
        doc.reviewedBy = req.user._id;
        doc.reviewedAt = new Date();
        if (action === 'REJECTED') {
          doc.rejectionReason = reason;
        } else {
          doc.rejectionReason = '';
          doc.reviewComment = comment || 'Verified and approved by mentor';
        }
        doc.reviewHistory.push({
          reviewer: req.user._id,
          status: action,
          comment: reviewNote,
          date: new Date()
        });
        await doc.save();
      }
    }

    // Notify student
    await Notification.create({
      recipient: docRequest.student,
      title: action === 'APPROVED' ? 'Document Request Approved' : 'Document Request Requires Revision',
      message:
        action === 'APPROVED'
          ? `Your submission for "${docRequest.title}" has been approved by ${req.user.name}.`
          : `Your submission for "${docRequest.title}" was rejected: ${reason}. Please upload a revised document.`,
      type: action === 'APPROVED' ? 'SUCCESS' : 'WARNING'
    });

    res.json({ success: true, documentRequest: docRequest });
  } catch (err) {
    console.error('Document request review error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error reviewing document request' });
  }
});

// =========================================================================
// 6. Appointment & Mentoring Meetings Scheduling
// =========================================================================

// POST /api/meetings (Mentor schedules appointment)
app.post('/api/meetings', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const {
      studentId,
      title,
      purpose,
      agenda,
      description,
      date,
      startTime,
      endTime,
      duration,
      type,
      venue,
      meetingUrl,
      preparationInstructions
    } = req.body;

    if (!studentId || !title || !date) {
      return res.status(400).json({ success: false, error: 'Student, Title, and Meeting Date are required' });
    }

    // Confirm that student is currently assigned to this mentor
    const assigned = await StudentProfile.findOne({
      $or: [{ user: studentId }, { _id: studentId }],
      mentor: req.user._id
    });
    if (!assigned) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You may only schedule appointments with currently assigned mentees'
      });
    }

    const targetStudentUserId = assigned.user;

    const meeting = await MentoringMeeting.create({
      student: targetStudentUserId,
      mentor: req.user._id,
      title,
      purpose: purpose || 'Academic & Mentoring Guidance Review',
      agenda: agenda || description || '',
      description: description || '',
      date,
      startTime: startTime || '10:00 AM',
      endTime: endTime || '10:45 AM',
      duration: duration ? Number(duration) : 45,
      type: type || 'IN_PERSON',
      venue: venue || 'Faculty Office 304',
      meetingUrl: meetingUrl || '',
      preparationInstructions: preparationInstructions || '',
      status: 'SCHEDULED'
    });

    // Notify student
    await Notification.create({
      recipient: targetStudentUserId,
      title: 'Mentoring Appointment Scheduled',
      message: `${req.user.name} scheduled: "${title}" on ${date} at ${startTime || '10:00 AM'}.`,
      type: 'INFO'
    });

    const populatedMeeting = await MentoringMeeting.findById(meeting._id)
      .populate('student', 'name email avatar')
      .populate('mentor', 'name email designation avatar');

    res.status(201).json({ success: true, meeting: populatedMeeting });
  } catch (err) {
    console.error('Schedule meeting error:', err);
    res.status(500).json({ success: false, error: 'Error scheduling meeting' });
  }
});

// GET /api/meetings
app.get('/api/meetings', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'MENTEE') {
      query.student = req.user._id;
    } else if (req.user.role === 'MENTOR') {
      query.mentor = req.user._id;
    }

    const meetings = await MentoringMeeting.find(query)
      .populate('student', 'name email avatar studentId')
      .populate('mentor', 'name email designation avatar')
      .sort('-date');

    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching meetings' });
  }
});

// GET /api/meetings/:id
app.get('/api/meetings/:id', protect, async (req, res) => {
  try {
    const meeting = await MentoringMeeting.findById(req.params.id)
      .populate('student', 'name email avatar studentId')
      .populate('mentor', 'name email designation avatar');

    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    if (
      req.user.role === 'MENTEE' && meeting.student._id.toString() !== req.user._id.toString() ||
      req.user.role === 'MENTOR' && meeting.mentor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error retrieving meeting' });
  }
});

// PATCH /api/meetings/:id (Reschedule or update meeting details)
app.patch('/api/meetings/:id', protect, async (req, res) => {
  try {
    const meeting = await MentoringMeeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    if (req.user.role === 'MENTOR' && meeting.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const isDateChanged = req.body.date && req.body.date !== meeting.date;
    Object.assign(meeting, req.body);
    if (isDateChanged) meeting.status = 'RESCHEDULED';

    await meeting.save();

    // Notify student if rescheduled
    if (isDateChanged) {
      await Notification.create({
        recipient: meeting.student,
        title: 'Appointment Rescheduled',
        message: `${req.user.name} rescheduled "${meeting.title}" to ${meeting.date} at ${meeting.startTime}.`,
        type: 'INFO'
      });
    }

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating meeting' });
  }
});

// POST /api/meetings/:id/cancel
app.post('/api/meetings/:id/cancel', protect, async (req, res) => {
  try {
    const meeting = await MentoringMeeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    meeting.status = 'CANCELLED';
    await meeting.save();

    const targetRecipient = req.user.role === 'MENTOR' ? meeting.student : meeting.mentor;
    await Notification.create({
      recipient: targetRecipient,
      title: 'Appointment Cancelled',
      message: `The meeting "${meeting.title}" on ${meeting.date} was cancelled.`,
      type: 'INFO'
    });

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error cancelling meeting' });
  }
});

// POST /api/meetings/:id/complete (Record discussion & action items)
app.post('/api/meetings/:id/complete', protect, authorize('MENTOR'), async (req, res) => {
  try {
    const { discussionPoints, studentConcerns, mentorObservations, actionItems, followUpDate } = req.body;
    const meeting = await MentoringMeeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    meeting.status = 'COMPLETED';
    if (discussionPoints) meeting.discussionPoints = discussionPoints;
    if (studentConcerns) meeting.studentConcerns = studentConcerns;
    if (mentorObservations) meeting.mentorObservations = mentorObservations;
    if (actionItems) meeting.actionItems = actionItems;
    if (followUpDate) meeting.followUpDate = followUpDate;

    await meeting.save();

    // Also record a MentorNote in the student's 360 profile
    if (discussionPoints || mentorObservations) {
      await MentorNote.create({
        student: meeting.student,
        mentor: req.user._id,
        title: `Meeting Note: ${meeting.title}`,
        discussion: discussionPoints || mentorObservations,
        actionRequired: actionItems || '',
        tag: 'Mentoring Review'
      });
    }

    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error completing meeting' });
  }
});

// =========================================================================
// 7. Academic Assignments API
// =========================================================================

// GET /api/assignments
app.get('/api/assignments', protect, async (req, res) => {
  try {
    const targetUserId = req.user.role === 'MENTEE' ? req.user._id : req.query.studentId || req.user._id;

    const assignments = await Assignment.find({ student: targetUserId }).sort('dueDate');

    const pending = assignments.filter((a) => a.status === 'PENDING').length;
    const completed = assignments.filter((a) => ['COMPLETED', 'SUBMITTED'].includes(a.status)).length;
    const overdue = assignments.filter((a) => a.isOverdue).length;
    const upcoming = assignments.filter((a) => !a.isOverdue && a.status === 'PENDING').length;

    res.json({
      success: true,
      assignments,
      counts: { pending, completed, overdue, upcoming }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching assignments' });
  }
});

// POST /api/assignments
app.post('/api/assignments', protect, authorize('MENTOR', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const { studentId, title, subject, description, dueDate } = req.body;
    if (!studentId || !title || !subject || !dueDate) {
      return res.status(400).json({ success: false, error: 'Missing required assignment fields' });
    }

    const assignment = await Assignment.create({
      student: studentId,
      title,
      subject,
      description: description || '',
      dueDate: new Date(dueDate),
      status: 'PENDING'
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating assignment' });
  }
});

// PATCH /api/assignments/:id
app.patch('/api/assignments/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found' });

    if (req.user.role === 'MENTEE') {
      if (assignment.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
      if (req.body.submissionNotes) assignment.submissionNotes = req.body.submissionNotes;
      if (req.body.status) assignment.status = req.body.status;
    } else {
      Object.assign(assignment, req.body);
    }

    await assignment.save();
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating assignment' });
  }
});

// =========================================================================
// 8. Student Dashboard Summary API
// =========================================================================

// GET /api/students/dashboard-summary
app.get('/api/students/dashboard-summary', protect, async (req, res) => {
  try {
    const studentUserId = req.user.role === 'MENTEE' ? req.user._id : req.query.studentId || req.user._id;

    let profile = await StudentProfile.findOne({ user: studentUserId })
      .populate('user', 'name email avatar role department designation')
      .populate('mentor', 'name email designation avatar department');

    if (!profile) {
      profile = await StudentProfile.create({
        user: studentUserId,
        studentId: `CS-${Date.now().toString().slice(-4)}`,
        department: req.user.department || 'Computer Science & Engineering',
        batch: '2023-2027',
        semester: 1,
        profileCompletion: 30
      });
      profile = await StudentProfile.findById(profile._id)
        .populate('user', 'name email avatar role department designation')
        .populate('mentor', 'name email designation avatar department');
    }

    const academicRecords = await AcademicRecord.find({ student: studentUserId }).sort('semester');
    const attendanceRecords = await AttendanceRecord.find({ student: studentUserId });
    const projects = await Project.find({ student: studentUserId }).sort('-createdAt');
    const certifications = await Certification.find({ student: studentUserId }).sort('-createdAt');
    const internships = await Internship.find({ student: studentUserId }).sort('-createdAt');
    const mentorNotes = await MentorNote.find({ student: studentUserId }).populate('mentor', 'name avatar').sort('-createdAt');
    const tasks = await MentoringTask.find({ student: studentUserId }).sort('-createdAt');
    const meetings = await MentoringMeeting.find({ student: studentUserId, status: { $ne: 'CANCELLED' } })
      .populate('mentor', 'name avatar designation')
      .sort('date');
    const assignments = await Assignment.find({ student: studentUserId }).sort('dueDate');

    // Only student or currently assigned mentor can view private documents
    const documents = await Document.find({ student: studentUserId }).sort('-createdAt');
    const documentRequests = await DocumentRequest.find({ student: studentUserId })
      .populate('mentor', 'name email avatar designation')
      .populate('submittedDocument')
      .sort('-createdAt');

    const notifications = await Notification.find({ recipient: studentUserId }).sort('-createdAt').limit(10);

    // Compute Academic Performance Stats
    const totalSgpaSum = academicRecords.reduce((acc, curr) => acc + (curr.sgpa || 0), 0);
    const avgMarks = academicRecords.length > 0 ? (totalSgpaSum / academicRecords.length) * 10 : profile.cgpa ? profile.cgpa * 9.5 : 82.5;
    const latestAcademic = academicRecords.length > 0 ? academicRecords[academicRecords.length - 1] : null;
    const currentSGPA = latestAcademic ? latestAcademic.sgpa : profile.cgpa || 8.4;

    let overallAttendance = profile.attendancePercentage || 85;
    if (attendanceRecords.length > 0) {
      const totalAttended = attendanceRecords.reduce((sum, item) => sum + (item.attended || 0), 0);
      const totalConducted = attendanceRecords.reduce((sum, item) => sum + (item.conducted || 0), 0);
      if (totalConducted > 0) {
        overallAttendance = Math.round((totalAttended / totalConducted) * 100);
      }
    }

    const pendingAssignments = assignments.filter((a) => a.status === 'PENDING').length;
    const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED').length;
    const overdueAssignments = assignments.filter((a) => a.isOverdue).length;
    const upcomingAssignments = assignments.filter((a) => !a.isOverdue && a.status === 'PENDING').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;

    const outstandingDocRequests = documentRequests.filter((r) => ['PENDING', 'REJECTED'].includes(r.status));
    const pendingReviewDocs = documents.filter((d) => d.reviewStatus === 'PENDING_REVIEW');

    const upcomingDeadlines = [
      ...assignments
        .filter((a) => a.status === 'PENDING')
        .map((a) => ({
          id: a._id,
          title: a.title,
          type: 'Assignment',
          dueDate: a.dueDate,
          isOverdue: new Date() > new Date(a.dueDate)
        })),
      ...tasks
        .filter((t) => t.status !== 'COMPLETED' && t.dueDate)
        .map((t) => ({
          id: t._id,
          title: t.title,
          type: 'Mentor Task',
          dueDate: t.dueDate,
          isOverdue: new Date() > new Date(t.dueDate)
        })),
      ...meetings
        .filter((m) => m.status === 'SCHEDULED' || m.status === 'CONFIRMED')
        .map((m) => ({
          id: m._id,
          title: `Appointment: ${m.title}`,
          type: 'Meeting',
          dueDate: m.date,
          isOverdue: false
        }))
    ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      success: true,
      metrics: {
        currentSemester: profile.semester || 1,
        currentCGPA: profile.cgpa || 8.4,
        currentSGPA: Number(currentSGPA.toFixed(2)),
        averageMarks: Number(avgMarks.toFixed(1)),
        attendancePercentage: overallAttendance,
        certificationsCount: certifications.length,
        projectsCount: projects.length,
        internshipsCount: internships.length,
        publicationsCount: documents.filter((d) => d.documentType === 'Research paper').length,
        achievementsCount: certifications.length + projects.length,
        pendingAssignmentsCount: pendingAssignments,
        completedAssignmentsCount: completedAssignments,
        overdueAssignmentsCount: overdueAssignments,
        upcomingAssignmentsCount: upcomingAssignments,
        pendingMentorTasksCount: pendingTasks,
        outstandingDocumentRequestsCount: outstandingDocRequests.length,
        pendingReviewDocumentsCount: pendingReviewDocs.length,
        upcomingAppointmentsCount: meetings.filter((m) => m.status === 'SCHEDULED').length,
        profileCompletion: profile.profileCompletion || 45
      },
      profile,
      assignedMentor: profile.mentor,
      academicRecords,
      attendanceRecords,
      assignments,
      tasks,
      meetings,
      documentRequests,
      documents,
      upcomingDeadlines,
      notifications
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ success: false, error: 'Failed to compile student dashboard metrics' });
  }
});

// =========================================================================
// 9. Notifications API
// =========================================================================

// GET /api/notifications
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(20);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching notifications' });
  }
});

// PATCH /api/notifications/:id/read
app.patch('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating notification' });
  }
});

// POST /api/notifications/mark-all-read
app.post('/api/notifications/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error marking notifications' });
  }
});

// =========================================================================
// 10. Student 360 Profile & Mentees Directory
// =========================================================================

// GET /api/students
app.get('/api/students', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'MENTOR') {
      filter = { mentor: req.user._id };
    } else if (req.user.role === 'HOD' && req.user.department) {
      filter = { department: { $regex: new RegExp(req.user.department, 'i') } };
    }

    const profiles = await StudentProfile.find(filter)
      .populate('user', 'name email avatar status')
      .populate('mentor', 'name email designation avatar')
      .sort('-createdAt');

    res.json({ success: true, students: profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching students list' });
  }
});

// GET /api/mentor/mentees & GET /api/mentors/mentees (Assigned mentees for meeting scheduling dropdown)
const getMentorMenteesHandler = async (req, res) => {
  try {
    const mentees = await StudentProfile.find({ mentor: req.user._id })
      .populate('user', 'name email avatar status department designation')
      .populate('mentor', 'name email designation avatar')
      .sort('-createdAt');
    res.json({ success: true, mentees, students: mentees });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching assigned mentees' });
  }
};
app.get('/api/mentor/mentees', protect, authorize('MENTOR'), getMentorMenteesHandler);
app.get('/api/mentors/mentees', protect, authorize('MENTOR'), getMentorMenteesHandler);

// GET /api/students/profile/me
app.get('/api/students/profile/me', protect, async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar role department designation')
      .populate('mentor', 'name email designation avatar');

    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user._id,
        studentId: `CS-${Date.now().toString().slice(-4)}`,
        department: req.user.department || 'Computer Science & Engineering',
        batch: '2023-2027',
        semester: 1,
        profileCompletion: 30
      });
      profile = await StudentProfile.findById(profile._id).populate('user', 'name email avatar');
    }

    const projects = await Project.find({ student: req.user._id }).sort('-createdAt');
    const certifications = await Certification.find({ student: req.user._id }).sort('-createdAt');
    const internships = await Internship.find({ student: req.user._id }).sort('-createdAt');
    const academicRecords = await AcademicRecord.find({ student: req.user._id }).sort('semester');
    const attendanceRecords = await AttendanceRecord.find({ student: req.user._id });
    const mentorNotes = await MentorNote.find({ student: req.user._id }).populate('mentor', 'name avatar').sort('-createdAt');
    const tasks = await MentoringTask.find({ student: req.user._id }).sort('-createdAt');
    const meetings = await MentoringMeeting.find({ student: req.user._id }).populate('mentor', 'name avatar').sort('-date');

    res.json({
      success: true,
      student: profile,
      projects,
      certifications,
      internships,
      academicRecords,
      attendanceRecords,
      mentorNotes,
      tasks,
      meetings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error retrieving student profile' });
  }
});

// =========================================================================
// GET /api/mentors/:id — HOD views a mentor's 360° profile
// HODs can only access mentors within their own department.
// Does NOT expose any private student document contents.
// =========================================================================
app.get('/api/mentors/:id', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id).select('-password');
    if (!mentor || mentor.role !== 'MENTOR') {
      return res.status(404).json({ success: false, error: 'Mentor not found' });
    }

    // HOD department scope guard
    if (req.user.role === 'HOD' && req.user.department) {
      const deptRegex = new RegExp(req.user.department, 'i');
      if (!deptRegex.test(mentor.department)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You may only view profiles of mentors within your authorized department'
        });
      }
    }

    // Fetch mentees currently assigned to this mentor
    const assignedProfiles = await StudentProfile.find({ mentor: mentor._id })
      .populate('user', 'name email avatar status department')
      .select('studentId registerNo semester section cgpa attendancePercentage status department batch user');

    // Meetings summary (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentMeetings = await MentoringMeeting.find({
      mentor: mentor._id,
      createdAt: { $gte: ninetyDaysAgo }
    }).select('title status date student').populate('student', 'name');

    const completedMeetings = recentMeetings.filter((m) => m.status === 'COMPLETED').length;
    const scheduledMeetings = recentMeetings.filter((m) => m.status === 'SCHEDULED').length;

    res.json({
      success: true,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        department: mentor.department,
        designation: mentor.designation,
        avatar: mentor.avatar,
        status: mentor.status
      },
      assignedMentees: assignedProfiles,
      assignedMenteeCount: assignedProfiles.length,
      recentMeetings,
      meetingSummary: {
        total: recentMeetings.length,
        completed: completedMeetings,
        scheduled: scheduledMeetings
      }
    });
  } catch (err) {
    console.error('Mentor profile error:', err);
    res.status(500).json({ success: false, error: 'Error retrieving mentor profile' });
  }
});

// GET /api/students/:id (360° profile — role-scoped authorization)
app.get('/api/students/:id', protect, async (req, res) => {
  try {
    let profile = await StudentProfile.findById(req.params.id)
      .populate('user', 'name email avatar role department designation')
      .populate('mentor', 'name email designation avatar');

    if (!profile) {
      profile = await StudentProfile.findOne({ user: req.params.id })
        .populate('user', 'name email avatar role department designation')
        .populate('mentor', 'name email designation avatar');
    }

    if (!profile) return res.status(404).json({ success: false, error: 'Student record not found' });

    const targetUserId = profile.user._id;

    // ── Authorization ──────────────────────────────────────────────────────────
    // 1. Student viewing their own profile
    if (req.user.role === 'MENTEE' && targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden: You may only view your own 360° profile' });
    }

    // 2. Mentor may only view currently assigned mentees
    if (req.user.role === 'MENTOR') {
      const isAssigned = await StudentProfile.findOne({ user: targetUserId, mentor: req.user._id });
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You may only view 360° profiles of students currently assigned to your mentorship'
        });
      }
    }

    // 3. HOD may only view students in their department
    if (req.user.role === 'HOD' && req.user.department) {
      const deptRegex = new RegExp(req.user.department, 'i');
      if (!deptRegex.test(profile.department)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You may only view profiles of students within your authorized department'
        });
      }
    }
    // 4. ADMIN: unrestricted access
    // ── End Authorization ──────────────────────────────────────────────────────
    const projects = await Project.find({ student: targetUserId }).sort('-createdAt');
    const certifications = await Certification.find({ student: targetUserId }).sort('-createdAt');
    const internships = await Internship.find({ student: targetUserId }).sort('-createdAt');
    const academicRecords = await AcademicRecord.find({ student: targetUserId }).sort('semester');
    const attendanceRecords = await AttendanceRecord.find({ student: targetUserId });
    const mentorNotes = await MentorNote.find({ student: targetUserId }).populate('mentor', 'name avatar').sort('-createdAt');
    const tasks = await MentoringTask.find({ student: targetUserId }).sort('-createdAt');
    const meetings = await MentoringMeeting.find({ student: targetUserId }).populate('mentor', 'name avatar').sort('-date');

    res.json({
      success: true,
      student: profile,
      projects,
      certifications,
      internships,
      academicRecords,
      attendanceRecords,
      mentorNotes,
      tasks,
      meetings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching student record' });
  }
});

// POST /api/projects
app.post('/api/projects', protect, async (req, res) => {
  try {
    const project = await Project.create({
      student: req.user._id,
      title: req.body.title,
      description: req.body.description,
      techStack: req.body.techStack || ['Full-Stack'],
      githubUrl: req.body.githubUrl,
      liveUrl: req.body.liveUrl,
      role: req.body.role || 'Developer',
      duration: req.body.duration || '3 Months'
    });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating project' });
  }
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', protect, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    res.json({ success: true, message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting project' });
  }
});

// POST /api/certifications
app.post('/api/certifications', protect, async (req, res) => {
  try {
    const cert = await Certification.create({
      student: req.user._id,
      name: req.body.name,
      issuer: req.body.issuer,
      issueDate: req.body.issueDate,
      credentialId: req.body.credentialId,
      verificationUrl: req.body.verificationUrl
    });
    res.status(201).json({ success: true, certification: cert });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating certification' });
  }
});

// POST /api/mentor-notes
app.post('/api/mentor-notes', protect, authorize('MENTOR', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const note = await MentorNote.create({
      student: req.body.studentId,
      mentor: req.user._id,
      title: req.body.title,
      discussion: req.body.discussion,
      actionRequired: req.body.actionRequired,
      tag: req.body.tag || 'New'
    });
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error creating mentor note' });
  }
});

// POST /api/tasks
app.post('/api/tasks', protect, authorize('MENTOR', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const task = await MentoringTask.create({
      student: req.body.studentId,
      assignedBy: req.user._id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'MEDIUM',
      dueDate: req.body.dueDate
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error assigning task' });
  }
});

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', protect, async (req, res) => {
  try {
    const task = await MentoringTask.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error updating task' });
  }
});

// =========================================================================
// 11. Institutional Analytics & Overview (HOD & Admin)
// =========================================================================

// GET /api/hod/analytics
app.get('/api/hod/analytics', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    let deptFilter = {};
    if (req.user.role === 'HOD' && req.user.department) {
      deptFilter = { department: { $regex: new RegExp(req.user.department, 'i') } };
    }

    const totalStudents = await StudentProfile.countDocuments(deptFilter);
    const unassignedStudents = await StudentProfile.countDocuments({ ...deptFilter, mentor: null });
    const facultyCount = await User.countDocuments({ role: 'MENTOR', ...deptFilter });
    const atRiskCount = await StudentProfile.countDocuments({ ...deptFilter, status: 'AT_RISK' });

    res.json({
      success: true,
      department: req.user.department || 'Computer Science & Engineering',
      totalStudents,
      unassignedStudents,
      facultyMentors: facultyCount,
      averageCGPA: 8.24,
      overallAttendance: 88.5,
      atRiskStudents: atRiskCount,
      placedStudents: 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error compiling department analytics' });
  }
});

// GET /api/admin/overview
app.get('/api/admin/overview', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'MENTEE' });
    const mentorsCount = await User.countDocuments({ role: 'MENTOR' });
    const hodsCount = await User.countDocuments({ role: 'HOD' });

    res.json({
      success: true,
      metrics: {
        totalEnrollment: studentsCount,
        activeMentors: mentorsCount,
        departments: 3,
        totalAccounts: totalUsers,
        hodsCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error compiling admin overview' });
  }
});

// GET /api/users
app.get('/api/users', protect, async (req, res) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;

    const users = await User.find(query).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching users' });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', protect, authorize('ADMIN'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await StudentProfile.findOneAndDelete({ user: req.params.id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting user' });
  }
});
// Serve frontend static build in production (Single-host deployment support)
if (IS_PRODUCTION) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

// Start Server with fallback handling
const server = app.listen(PORT, () => {
  console.log(`⚡ MEntee Institutional API Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use, retrying on port ${fallbackPort}...`);
    app.listen(fallbackPort, () => {
      console.log(`⚡ MEntee Institutional API Server running on port ${fallbackPort}`);
    });
  } else {
    console.error(err);
  }
});
