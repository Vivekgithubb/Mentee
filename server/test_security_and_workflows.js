import http from 'http';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { StudentProfile } from './models/StudentProfile.js';
import { DocumentRequest } from './models/DocumentRequest.js';
import { Document } from './models/Document.js';
import { AcademicRecord, MentoringMeeting } from './models/Entities.js';

const BASE_URL = 'http://127.0.0.1:5000';

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(Buffer.isBuffer(data) || typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
};

const registerUser = async (userData) => {
  const res = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5173'
      }
    },
    userData
  );
  const setCookie = res.headers['set-cookie'];
  const cookie = setCookie ? setCookie[0].split(';')[0] : '';
  return { res, cookie, user: res.data?.user };
};

const uploadMultipart = (options, fields, fileBuffer, fileName, fileField = 'file') => {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let postData = [];
  for (const [key, value] of Object.entries(fields)) {
    postData.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  }
  postData.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`));
  postData.push(fileBuffer);
  postData.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const fullBody = Buffer.concat(postData);

  const reqOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': fullBody.length
    }
  };
  return makeRequest(reqOptions, fullBody);
};

async function runTests() {
  console.log('--- 🧪 STARTING COMPLETE ACCEPTANCE TEST SUITE (UPDATE 2) ---');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentee_db');
  console.log('✓ Connected to MongoDB');

  const ts = Date.now();

  // 1. Setup Test Users
  console.log('\n[SETUP] Creating test users across roles...');
  const hodData = await registerUser({
    name: 'Dr. Margaret Hamilton (HOD)',
    email: `hod_${ts}@test.edu`,
    password: 'Password123!',
    role: 'HOD',
    department: 'Computer Science'
  });
  console.log('✓ HOD created:', hodData.user?.email);

  const adminData = await registerUser({
    name: 'System Admin',
    email: `admin_${ts}@test.edu`,
    password: 'Password123!',
    role: 'ADMIN',
    department: 'Administration'
  });
  console.log('✓ ADMIN created:', adminData.user?.email);

  const mentor1Data = await registerUser({
    name: 'Prof. Donald Knuth',
    email: `mentor1_${ts}@test.edu`,
    password: 'Password123!',
    role: 'MENTOR',
    department: 'Computer Science',
    designation: 'Associate Professor'
  });
  console.log('✓ Mentor 1 created:', mentor1Data.user?.email);

  const mentor2Data = await registerUser({
    name: 'Prof. Barbara Liskov',
    email: `mentor2_${ts}@test.edu`,
    password: 'Password123!',
    role: 'MENTOR',
    department: 'Computer Science',
    designation: 'Professor'
  });
  console.log('✓ Mentor 2 created:', mentor2Data.user?.email);

  const studentData = await registerUser({
    name: 'Grace Hopper',
    email: `student_${ts}@test.edu`,
    password: 'Password123!',
    role: 'MENTEE',
    department: 'Computer Science',
    studentId: `CS-${ts.toString().slice(-4)}`,
    semester: 3
  });
  console.log('✓ Student created:', studentData.user?.email);

  const otherStudentData = await registerUser({
    name: 'Alan Turing',
    email: `other_student_${ts}@test.edu`,
    password: 'Password123!',
    role: 'MENTEE',
    department: 'Computer Science',
    studentId: `CS-${(ts + 1).toString().slice(-4)}`,
    semester: 3
  });
  console.log('✓ Other Student created:', otherStudentData.user?.email);

  // -------------------------------------------------------------------------
  // TEST SECTION 1: HOD MENTOR ASSIGNMENT & REASSIGNMENT
  // -------------------------------------------------------------------------
  console.log('\n[TEST 1] HOD Mentor Assignment & Workload Management');

  // HOD checks unassigned students
  const unassignedRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/hod/unassigned-students',
    method: 'GET',
    headers: { Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('HOD unassigned students query status:', unassignedRes.statusCode);
  if (!unassignedRes.data?.success) throw new Error('Failed to query unassigned students');
  const foundInUnassigned = unassignedRes.data.unassignedStudents.some(
    (s) => s.user?._id?.toString() === studentData.user?.id || s.user === studentData.user?.id
  );
  console.log('Student correctly found in unassigned list:', foundInUnassigned);

  // Unauthorized assignment check: Student tries to assign mentor -> MUST FAIL (403)
  const studentAttemptRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/hod/mentor-assignments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
    },
    { studentId: studentData.user?.id, mentorId: mentor1Data.user?.id }
  );
  console.log('Student unauthorized assignment attempt status:', studentAttemptRes.statusCode);
  if (studentAttemptRes.statusCode !== 403) {
    throw new Error('FAILED: Unauthorized student was not rejected with 403!');
  }

  // HOD assigns Mentor 1 to Student
  const assignRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/hod/mentor-assignments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
    },
    { studentId: studentData.user?.id, mentorId: mentor1Data.user?.id }
  );
  console.log('HOD assign mentor status:', assignRes.statusCode);
  if (!assignRes.data?.success) throw new Error('HOD mentor assignment failed');

  // Verify in MongoDB
  const profileAfterAssign = await StudentProfile.findOne({ user: studentData.user?.id });
  if (profileAfterAssign?.mentor?.toString() !== mentor1Data.user?.id) {
    throw new Error('FAILED: Mentor not persisted in MongoDB!');
  }
  console.log('✓ Mentor 1 assigned and persisted in MongoDB');
  console.log('Assignment history length:', profileAfterAssign.assignmentHistory.length);

  // HOD Reassigns to Mentor 2
  const reassignRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/hod/mentor-assignments/${studentData.user?.id}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
    },
    { mentorId: mentor2Data.user?.id, changeReason: 'Load balancing across faculty' }
  );
  console.log('HOD reassign mentor status:', reassignRes.statusCode);
  if (!reassignRes.data?.success) throw new Error('HOD mentor reassignment failed');

  const profileAfterReassign = await StudentProfile.findOne({ user: studentData.user?.id });
  if (profileAfterReassign?.mentor?.toString() !== mentor2Data.user?.id) {
    throw new Error('FAILED: Reassigned mentor not updated in MongoDB!');
  }
  console.log('✓ Reassigned to Mentor 2; History recorded count:', profileAfterReassign.assignmentHistory.length);
  if (profileAfterReassign.assignmentHistory.length < 2) {
    throw new Error('FAILED: Assignment audit history not preserved!');
  }

  // Reassign back to Mentor 1 so Mentor 1 is the active mentor for remaining tests
  await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/hod/mentor-assignments/${studentData.user?.id}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
    },
    { mentorId: mentor1Data.user?.id, changeReason: 'Restoring primary mentor' }
  );

  // -------------------------------------------------------------------------
  // TEST SECTION 2: ACADEMIC RECORDS & SEMESTER MARKS MODULE
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Academic Records & Marks Module');

  // Student creates semester 1 records with subjects
  const studentAddMarksRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/academics/records',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
    },
    {
      semester: 1,
      academicYear: '2023-2024',
      subjects: [
        { code: 'CS101', name: 'Data Structures', internalMarks: 45, externalMarks: 48, totalMarks: 93, maxMarks: 100, credits: 4, grade: 'A+', gradePoints: 10 },
        { code: 'CS102', name: 'Digital Logic', internalMarks: 40, externalMarks: 42, totalMarks: 82, maxMarks: 100, credits: 4, grade: 'A', gradePoints: 9 }
      ]
    }
  );
  console.log('Student add marks status:', studentAddMarksRes.statusCode);
  if (!studentAddMarksRes.data?.success) throw new Error('Student failed to save semester marks');
  console.log('Calculated SGPA:', studentAddMarksRes.data?.record?.sgpa);
  if (studentAddMarksRes.data?.record?.sgpa !== 9.5) {
    throw new Error(`Expected SGPA 9.5, got ${studentAddMarksRes.data?.record?.sgpa}`);
  }
  console.log('✓ Student saved semester marks and SGPA auto-calculated correctly');

  // Student attempts to modify other student's records -> MUST BE REJECTED (403)
  const tamperMarksRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/academics/records',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: otherStudentData.user?.id,
      semester: 1,
      subjects: [{ code: 'CS101', name: 'Hacked', totalMarks: 100, maxMarks: 100, credits: 4, gradePoints: 10 }]
    }
  );
  console.log('Cross-student marks modification status:', tamperMarksRes.statusCode);
  if (tamperMarksRes.statusCode !== 403) {
    throw new Error('FAILED: Cross-student marks modification was not rejected with 403!');
  }

  // Assigned Mentor (Mentor 1) edits marks for Student
  const mentorEditMarksRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/academics/records',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: studentData.user?.id,
      semester: 1,
      reason: 'Re-evaluation score adjustment',
      subjects: [
        { code: 'CS101', name: 'Data Structures', internalMarks: 48, externalMarks: 50, totalMarks: 98, maxMarks: 100, credits: 4, grade: 'O', gradePoints: 10 },
        { code: 'CS102', name: 'Digital Logic', internalMarks: 45, externalMarks: 45, totalMarks: 90, maxMarks: 100, credits: 4, grade: 'O', gradePoints: 10 }
      ]
    }
  );
  console.log('Assigned Mentor edit marks status:', mentorEditMarksRes.statusCode);
  if (!mentorEditMarksRes.data?.success) throw new Error('Assigned mentor failed to update marks');
  console.log('Audit history length:', mentorEditMarksRes.data?.record?.auditHistory?.length);
  if (mentorEditMarksRes.data?.record?.auditHistory?.length < 2) {
    throw new Error('FAILED: Audit trail for academic marks modification not preserved!');
  }
  console.log('✓ Assigned mentor successfully edited marks with full audit history');

  // Unassigned Mentor (Mentor 2) attempts to edit Student's marks -> MUST FAIL (403)
  const unassignedMentorEditRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/academics/records',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor2Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: studentData.user?.id,
      semester: 1,
      subjects: []
    }
  );
  console.log('Unassigned Mentor edit marks status:', unassignedMentorEditRes.statusCode);
  if (unassignedMentorEditRes.statusCode !== 403) {
    throw new Error('FAILED: Unassigned mentor was not blocked with 403!');
  }
  console.log('✓ Unassigned mentor strictly blocked with 403 Forbidden');

  // -------------------------------------------------------------------------
  // TEST SECTION 3: STRICT DOCUMENT PRIVACY (STUDENT + CURRENT MENTOR ONLY)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Strict Document Privacy Enforcement');

  // Create a document record directly for student
  const testDoc = await Document.create({
    student: studentData.user?.id,
    uploadedBy: studentData.user?.id,
    displayName: 'Semester 1 Confidential Marks Transcript',
    originalFilename: 'transcript_sem1.pdf',
    documentType: 'Semester marks card',
    fileSize: 102400,
    mimeType: 'application/pdf',
    storageProvider: 'local',
    storageId: 'dummy_transcript.pdf',
    secureUrl: '/dummy/path',
    reviewStatus: 'PENDING_REVIEW'
  });
  console.log('✓ Test Document created with ID:', testDoc._id);

  // Student accesses their own document download -> MUST BE ALLOWED (file physically missing on disk -> 404, but auth passed!)
  const studentDownloadRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/documents/${testDoc._id}/download`,
    method: 'GET',
    headers: { Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Student document access status (404 expected as dummy physical file):', studentDownloadRes.statusCode);
  if (studentDownloadRes.statusCode === 403) {
    throw new Error('FAILED: Student was forbidden from accessing their own document!');
  }

  // Assigned Mentor (Mentor 1) accesses document -> MUST BE ALLOWED (auth check passes)
  const mentorDownloadRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/documents/${testDoc._id}/download`,
    method: 'GET',
    headers: { Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Assigned Mentor access status:', mentorDownloadRes.statusCode);
  if (mentorDownloadRes.statusCode === 403) {
    throw new Error('FAILED: Assigned mentor was forbidden from accessing mentee document!');
  }

  // HOD attempts to access student document -> MUST BE STRICTLY FORBIDDEN (403)!
  const hodDownloadRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/documents/${testDoc._id}/download`,
    method: 'GET',
    headers: { Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('HOD document download access status:', hodDownloadRes.statusCode);
  if (hodDownloadRes.statusCode !== 403) {
    throw new Error('FAILED: HOD was NOT blocked from student private document!');
  }
  console.log('✓ HOD strictly blocked with 403 Forbidden on document download');

  // ADMIN attempts to access student document -> MUST BE STRICTLY FORBIDDEN (403)!
  const adminDownloadRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/documents/${testDoc._id}/download`,
    method: 'GET',
    headers: { Cookie: adminData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('ADMIN document download access status:', adminDownloadRes.statusCode);
  if (adminDownloadRes.statusCode !== 403) {
    throw new Error('FAILED: Admin was NOT blocked from student private document!');
  }
  console.log('✓ Admin strictly blocked with 403 Forbidden on document download');

  // Other student attempts to access -> MUST BE FORBIDDEN (403)!
  const otherStudentDownloadRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/documents/${testDoc._id}/download`,
    method: 'GET',
    headers: { Cookie: otherStudentData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Other student download status:', otherStudentDownloadRes.statusCode);
  if (otherStudentDownloadRes.statusCode !== 403) {
    throw new Error('FAILED: Other student was not blocked!');
  }

  // Unassigned Mentor (Mentor 2) attempts to access -> MUST BE FORBIDDEN (403)!
  const mentor2DownloadRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/documents/${testDoc._id}/download`,
    method: 'GET',
    headers: { Cookie: mentor2Data.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Unassigned Mentor download status:', mentor2DownloadRes.statusCode);
  if (mentor2DownloadRes.statusCode !== 403) {
    throw new Error('FAILED: Unassigned mentor was not blocked!');
  }
  console.log('✓ Unassigned mentor strictly blocked with 403 Forbidden');

  // -------------------------------------------------------------------------
  // TEST SECTION 4: DOCUMENT APPROVAL & REJECTION WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Document Approval & Rejection Workflow');

  // Mentor queries review queue
  const queueRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/mentor/document-reviews',
    method: 'GET',
    headers: { Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Mentor review queue status:', queueRes.statusCode);
  const foundPending = queueRes.data?.pendingReviews?.some((d) => d._id === testDoc._id.toString());
  console.log('Document found in pending review queue:', foundPending);
  if (!foundPending) throw new Error('FAILED: Pending document not visible in mentor review queue!');

  // Mentor approves document
  const approveRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/documents/${testDoc._id}/approve`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    { comment: 'Attested and verified with registrar' }
  );
  console.log('Approve document status:', approveRes.statusCode);
  if (!approveRes.data?.success) throw new Error('Approve document failed');
  if (approveRes.data?.document?.reviewStatus !== 'APPROVED') {
    throw new Error('FAILED: Review status was not updated to APPROVED!');
  }
  console.log('✓ Document status updated to APPROVED');

  // Create another document to test Rejection
  const docToReject = await Document.create({
    student: studentData.user?.id,
    uploadedBy: studentData.user?.id,
    displayName: 'Semester 2 Unattested Draft',
    originalFilename: 'sem2_draft.pdf',
    documentType: 'Semester marks card',
    fileSize: 50000,
    mimeType: 'application/pdf',
    storageProvider: 'local',
    storageId: 'dummy_sem2.pdf',
    secureUrl: '/dummy/sem2',
    reviewStatus: 'PENDING_REVIEW'
  });

  // Rejection without reason MUST FAIL (400)
  const rejectNoReasonRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/documents/${docToReject._id}/reject`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    { reason: '' }
  );
  console.log('Reject without reason status (400 expected):', rejectNoReasonRes.statusCode);
  if (rejectNoReasonRes.statusCode !== 400) {
    throw new Error('FAILED: Rejection without reason was not rejected with 400!');
  }

  // Mentor rejects document with mandatory reason
  const rejectRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/documents/${docToReject._id}/reject`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    { reason: 'Illegible photocopy. Upload clear scanned original.' }
  );
  console.log('Reject document with reason status:', rejectRes.statusCode);
  if (!rejectRes.data?.success) throw new Error('Reject document failed');
  if (rejectRes.data?.document?.reviewStatus !== 'REJECTED') {
    throw new Error('FAILED: Review status was not updated to REJECTED!');
  }
  console.log('✓ Document status updated to REJECTED with rejectionReason saved');

  // -------------------------------------------------------------------------
  // TEST SECTION 5: APPOINTMENT SCHEDULING MODULE
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5] Appointment & Mentoring Meetings Scheduling');

  // Mentor 1 schedules appointment with assigned student
  const scheduleRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/meetings',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: studentData.user?.id,
      title: 'Mid-Semester Career & Guidance Session',
      purpose: 'Academic Performance Review',
      agenda: 'Review SGPA improvement and capstone project proposal',
      date: '2026-11-20',
      startTime: '10:00 AM',
      endTime: '10:45 AM',
      duration: 45,
      type: 'IN_PERSON',
      venue: 'Faculty Office 304'
    }
  );
  console.log('Schedule appointment status:', scheduleRes.statusCode);
  if (!scheduleRes.data?.success) throw new Error('Schedule appointment failed');
  const meetingId = scheduleRes.data?.meeting?._id;
  console.log('Scheduled meeting ID:', meetingId);

  // Student fetches their meetings -> MUST FIND scheduled appointment
  const studentMeetingsRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/meetings',
    method: 'GET',
    headers: { Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Student query meetings status:', studentMeetingsRes.statusCode);
  const foundStudentMeeting = studentMeetingsRes.data?.meetings?.some((m) => m._id === meetingId);
  console.log('Appointment visible to student:', foundStudentMeeting);
  if (!foundStudentMeeting) throw new Error('FAILED: Scheduled meeting not visible to student!');

  // Mentor reschedules appointment
  const rescheduleRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/meetings/${meetingId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      date: '2026-11-22',
      startTime: '02:00 PM',
      endTime: '02:45 PM'
    }
  );
  console.log('Reschedule meeting status:', rescheduleRes.statusCode);
  if (rescheduleRes.data?.meeting?.status !== 'RESCHEDULED') {
    throw new Error('FAILED: Meeting status was not updated to RESCHEDULED!');
  }
  console.log('✓ Meeting successfully rescheduled');

  // Mentor completes meeting and records discussion points & action items
  const completeRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/meetings/${meetingId}/complete`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      discussionPoints: 'Student performed exceptionally in DS lab; discussed AWS certification.',
      studentConcerns: 'Concerns about final semester internship credits.',
      mentorObservations: 'Strong analytical skills, recommended peer tutoring.',
      actionItems: 'Complete AWS Cloud Practitioner course by end of month.',
      followUpDate: '2026-12-15'
    }
  );
  console.log('Complete meeting status:', completeRes.statusCode);
  if (completeRes.data?.meeting?.status !== 'COMPLETED') {
    throw new Error('FAILED: Meeting status was not updated to COMPLETED!');
  }
  if (!completeRes.data?.meeting?.discussionPoints) {
    throw new Error('FAILED: Discussion notes not saved!');
  }
  console.log('✓ Meeting completed with discussion notes and action items preserved');

  // Unassigned Mentor (Mentor 2) attempts to schedule meeting with Student -> MUST FAIL (403)
  const unassignedScheduleRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/meetings',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor2Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: studentData.user?.id,
      title: 'Unauthorized Advising',
      date: '2026-11-25'
    }
  );
  console.log('Unassigned mentor schedule meeting status (403 expected):', unassignedScheduleRes.statusCode);
  if (unassignedScheduleRes.statusCode !== 403) {
    throw new Error('FAILED: Unassigned mentor was not blocked with 403!');
  }
  console.log('✓ Unassigned mentor strictly blocked from scheduling meetings');

  // -------------------------------------------------------------------------
  // TEST SECTION 6: 360° PROFILE ACCESS, MENTEE DROPDOWN & DOCUMENT REQUEST WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n[TEST 6] 360° Profile Access, Mentee Dropdown & Document Requests');

  // 6.1 MENTEE DROPDOWN DATA FLOW
  // Mentor 1 fetches assigned mentees
  const menteeListRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/mentor/mentees',
    method: 'GET',
    headers: { Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Mentor mentees query status:', menteeListRes.statusCode);
  if (!menteeListRes.data?.success) throw new Error('Failed to fetch assigned mentees for mentor');
  const foundAssignedMentee = menteeListRes.data?.mentees?.some(
    (m) => (m.user?._id || m.user) === studentData.user?.id
  );
  console.log('Assigned mentee present in mentor dropdown list:', foundAssignedMentee);
  if (!foundAssignedMentee) throw new Error('FAILED: Assigned mentee not found in mentor mentee list!');
  console.log('✓ Mentor mentee list correctly populates assigned mentees for dropdown');

  // 6.2 360° PROFILE ACCESS — HOD VIEWING MENTOR
  // HOD views Mentor 1 (same department: Computer Science) -> MUST SUCCEED (200)
  const hodViewMentorRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/mentors/${mentor1Data.user?.id}`,
    method: 'GET',
    headers: { Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('HOD views same-department mentor status:', hodViewMentorRes.statusCode);
  if (hodViewMentorRes.statusCode !== 200) {
    throw new Error('FAILED: HOD was forbidden from viewing mentor in their department!');
  }
  if (!hodViewMentorRes.data?.mentor?.name || !hodViewMentorRes.data?.assignedMentees) {
    throw new Error('FAILED: Incomplete mentor 360 profile payload!');
  }
  // Verify private student documents are NOT exposed in mentor profile
  if (hodViewMentorRes.data?.documents || hodViewMentorRes.data?.privateDocuments) {
    throw new Error('FAILED: Private documents leaked in mentor 360 profile!');
  }
  console.log('✓ HOD can access mentor 360° profile within authorized department');

  // Create mentor in a different department (Mechanical Engineering)
  const otherDeptMentor = await registerUser({
    name: 'Prof. James Watt',
    email: `mech_mentor_${ts}@test.edu`,
    password: 'Password123!',
    role: 'MENTOR',
    department: 'Mechanical Engineering',
    designation: 'Assistant Professor'
  });

  // HOD (Computer Science) attempts to view mentor in Mechanical Engineering -> MUST FAIL (403)
  const hodCrossDeptMentorRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/mentors/${otherDeptMentor.user?.id}`,
    method: 'GET',
    headers: { Cookie: hodData.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('HOD cross-department mentor status (403 expected):', hodCrossDeptMentorRes.statusCode);
  if (hodCrossDeptMentorRes.statusCode !== 403) {
    throw new Error('FAILED: HOD was not blocked with 403 when viewing cross-department mentor!');
  }
  console.log('✓ HOD strictly restricted from accessing cross-department mentor profile');

  // 6.3 360° PROFILE ACCESS — MENTOR VIEWING MENTEE
  // Mentor 1 views assigned student's 360° profile -> MUST SUCCEED (200)
  const mentorViewMenteeRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/students/${studentData.user?.id}`,
    method: 'GET',
    headers: { Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Mentor views assigned mentee 360 profile status:', mentorViewMenteeRes.statusCode);
  if (mentorViewMenteeRes.statusCode !== 200) {
    throw new Error('FAILED: Mentor could not view assigned mentee 360 profile!');
  }
  if (!mentorViewMenteeRes.data?.student) {
    throw new Error('FAILED: Student profile missing in response payload!');
  }
  console.log('✓ Mentor successfully accessed assigned mentee 360° profile');

  // Mentor 2 (unassigned) views Student's 360° profile -> MUST FAIL (403)
  const mentor2ViewMenteeRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/students/${studentData.user?.id}`,
    method: 'GET',
    headers: { Cookie: mentor2Data.cookie, Origin: 'http://localhost:5173' }
  });
  console.log('Unassigned mentor views student 360 profile (403 expected):', mentor2ViewMenteeRes.statusCode);
  if (mentor2ViewMenteeRes.statusCode !== 403) {
    throw new Error('FAILED: Unassigned mentor was not blocked with 403 from mentee profile!');
  }
  console.log('✓ Unassigned mentor strictly blocked with 403 Forbidden from viewing student profile');

  // 6.4 DOCUMENT REQUEST UPLOAD & REVIEW WORKFLOW
  // Mentor 1 creates a DocumentRequest for assigned student
  const createDocReqRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/document-requests',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: studentData.user?.id,
      title: 'Semester 3 Official Marks Statement',
      documentType: 'Semester marks card',
      description: 'Upload signed college transcript for Sem 3',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      isRequired: true
    }
  );
  console.log('Mentor create document request status (201 expected):', createDocReqRes.statusCode);
  if (createDocReqRes.statusCode !== 201) {
    throw new Error('FAILED: Mentor could not create document request');
  }
  const createdRequestId = createDocReqRes.data?.documentRequest?._id;
  console.log('Created DocumentRequest ID:', createdRequestId);

  // Student uploads a document against this request
  const dummyFileContent = Buffer.from('%PDF-1.4 Mock PDF Content For Document Request Test');
  const uploadAgainstReqRes = await uploadMultipart(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/documents/upload',
      method: 'POST',
      headers: { Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
    },
    {
      displayName: 'Semester 3 Official Marks Statement',
      documentType: 'Semester marks card',
      description: 'Submitted for request Sem 3',
      documentRequestId: createdRequestId
    },
    dummyFileContent,
    'sem3_official_transcript.pdf'
  );
  console.log('Upload against request status (201 expected):', uploadAgainstReqRes.statusCode);
  if (uploadAgainstReqRes.statusCode !== 201) {
    throw new Error('FAILED: Student document upload against request failed');
  }
  const uploadedDocId = uploadAgainstReqRes.data?.document?._id;
  console.log('Uploaded Document ID:', uploadedDocId);

  // Verify DocumentRequest updated to UNDER REVIEW with submittedDocument linked
  const verifyReq = await DocumentRequest.findById(createdRequestId);
  console.log('DocumentRequest status after upload:', verifyReq?.status);
  console.log('DocumentRequest submittedDocument linked:', String(verifyReq?.submittedDocument) === String(uploadedDocId));
  if (verifyReq?.status !== 'UNDER REVIEW') {
    throw new Error('FAILED: DocumentRequest status not set to UNDER REVIEW after student upload!');
  }
  if (String(verifyReq?.submittedDocument) !== String(uploadedDocId)) {
    throw new Error('FAILED: DocumentRequest submittedDocument not linked to uploaded document!');
  }
  console.log('✓ Student uploaded file against document request; status is UNDER REVIEW');

  // Mentor 2 (unassigned) attempts to review request -> MUST FAIL (403)
  const unassignedReviewRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/document-requests/${createdRequestId}/review`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor2Data.cookie, Origin: 'http://localhost:5173' }
    },
    { action: 'APPROVED', comment: 'Unauthorized review attempt' }
  );
  console.log('Unassigned mentor review status (403 expected):', unassignedReviewRes.statusCode);
  if (unassignedReviewRes.statusCode !== 403) {
    throw new Error('FAILED: Unassigned mentor was not blocked from reviewing document request!');
  }
  console.log('✓ Unassigned mentor strictly blocked from reviewing document request');

  // Mentor 1 (assigned) approves document request
  const mentorApproveReqRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/document-requests/${createdRequestId}/review`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    { action: 'APPROVED', comment: 'Marks verified against university portal' }
  );
  console.log('Mentor approve document request status (200 expected):', mentorApproveReqRes.statusCode);
  if (mentorApproveReqRes.statusCode !== 200) {
    throw new Error('FAILED: Mentor could not approve document request!');
  }

  // Verify DocumentRequest and Document both updated to APPROVED
  const approvedReq = await DocumentRequest.findById(createdRequestId);
  const approvedDoc = await Document.findById(uploadedDocId);
  console.log('DocumentRequest status after approval:', approvedReq?.status);
  console.log('Document reviewStatus after approval:', approvedDoc?.reviewStatus);
  if (approvedReq?.status !== 'APPROVED' || approvedDoc?.reviewStatus !== 'APPROVED') {
    throw new Error('FAILED: Status consistency mismatch after approval!');
  }
  console.log('✓ DocumentRequest and Document both consistently persisted as APPROVED');

  // Test Rejection workflow with mandatory reason
  const secondReqRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/document-requests',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    {
      studentId: studentData.user?.id,
      title: 'Internship Completion Certificate',
      documentType: 'Internship certificate',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString()
    }
  );
  const secondReqId = secondReqRes.data?.documentRequest?._id;

  // Student uploads file for second request
  const secondUploadRes = await uploadMultipart(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/documents/upload',
      method: 'POST',
      headers: { Cookie: studentData.cookie, Origin: 'http://localhost:5173' }
    },
    {
      displayName: 'Internship Certificate Draft',
      documentType: 'Internship certificate',
      documentRequestId: secondReqId
    },
    dummyFileContent,
    'internship_draft.pdf'
  );
  const secondDocId = secondUploadRes.data?.document?._id;

  // Rejection without reason MUST FAIL (400)
  const rejectReqNoReasonRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/document-requests/${secondReqId}/review`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    { action: 'REJECTED', reason: '' }
  );
  console.log('Document request reject without reason (400 expected):', rejectReqNoReasonRes.statusCode);
  if (rejectReqNoReasonRes.statusCode !== 400) {
    throw new Error('FAILED: Rejection without reason did not return 400!');
  }

  // Mentor rejects with reason
  const rejectReqWithReasonRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/document-requests/${secondReqId}/review`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: mentor1Data.cookie, Origin: 'http://localhost:5173' }
    },
    { action: 'REJECTED', reason: 'Official company seal and mentor signature missing.' }
  );
  console.log('Document request reject with reason status (200 expected):', rejectReqWithReasonRes.statusCode);
  if (rejectReqWithReasonRes.statusCode !== 200) {
    throw new Error('FAILED: Rejection with reason failed!');
  }

  const rejectedReq = await DocumentRequest.findById(secondReqId);
  const rejectedDoc = await Document.findById(secondDocId);
  console.log('DocumentRequest status after rejection:', rejectedReq?.status);
  console.log('Document reviewStatus after rejection:', rejectedDoc?.reviewStatus);
  if (rejectedReq?.status !== 'REJECTED' || rejectedDoc?.reviewStatus !== 'REJECTED') {
    throw new Error('FAILED: Status consistency mismatch after rejection!');
  }
  console.log('✓ DocumentRequest and Document both consistently persisted as REJECTED with reason');

  console.log('\n============================================================');
  console.log('🎉 ALL 6 MODULES, ROLE WORKFLOWS & PRIVACY CONTROLS PASSED 100% SUCCESFULLY!');
  console.log('============================================================\n');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUNNER ERROR:', err);
  process.exit(1);
});
