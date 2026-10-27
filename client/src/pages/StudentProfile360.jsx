/**
 * StudentProfile360.jsx
 * 360° Student Profile — Role-scoped read-only view
 *
 * Accessible by:
 *   - The student themselves (own profile)
 *   - Their currently assigned mentor
 *   - An HOD within the same department
 *   - ADMIN
 *
 * All authorization is enforced on the backend (GET /api/students/:id).
 * A 403 here means the viewer genuinely does not have access; we surface a
 * helpful error instead of crashing.
 *
 * Document contents are NEVER fetched or displayed here for HODs/Admins
 * (they are blocked at the document-download endpoint anyway).
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  GitBranch,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  FilePlus
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const StudentProfile360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [mentorNotes, setMentorNotes] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Request Document State
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);
  const [submittingDocRequest, setSubmittingDocRequest] = useState(false);
  const [docRequestForm, setDocRequestForm] = useState({
    title: '',
    documentType: 'Semester marks card',
    description: '',
    priority: 'HIGH',
    dueDate: '',
    isRequired: true
  });

  const handleCreateDocumentRequest = async (e) => {
    e.preventDefault();
    const targetUserId = student?.user?._id || student?._id;
    if (!targetUserId || !docRequestForm.title || !docRequestForm.dueDate) {
      addToast('Please fill out all required fields (Title, Due Date)', 'error');
      return;
    }

    setSubmittingDocRequest(true);
    try {
      const res = await api.documentRequests.create({
        ...docRequestForm,
        studentId: targetUserId
      });
      if (res.success) {
        addToast(`Document request "${docRequestForm.title}" sent to ${student?.user?.name}!`);
        setShowRequestDocModal(false);
        setDocRequestForm({
          title: '',
          documentType: 'Semester marks card',
          description: '',
          priority: 'HIGH',
          dueDate: '',
          isRequired: true
        });
      }
    } catch (err) {
      addToast(err.message || 'Error creating document request', 'error');
    } finally {
      setSubmittingDocRequest(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.students.getById(id);
        if (res.success) {
          setStudent(res.student);
          setProjects(res.projects || []);
          setCertifications(res.certifications || []);
          setInternships(res.internships || []);
          setMentorNotes(res.mentorNotes || []);
          setMeetings(res.meetings || []);
          setTasks(res.tasks || []);
          setAcademicRecords(res.academicRecords || []);
        }
      } catch (err) {
        const is403 = err.message?.includes('403') || err.message?.toLowerCase().includes('forbidden') || err.message?.toLowerCase().includes('may only');
        setError({
          code: is403 ? 403 : 500,
          message: err.message || 'Failed to load student profile.'
        });
        addToast(err.message || 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, addToast]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: `Academic (${academicRecords.length})` },
    { id: 'projects', label: `Projects (${projects.length})` },
    { id: 'certifications', label: `Certifications (${certifications.length})` },
    { id: 'mentoring', label: `Mentoring (${mentorNotes.length})` }
  ];

  if (loading) {
    return (
      <DashboardShell>
        <TopBar title="360° Student Profile" />
        <div className="flex items-center justify-center py-20 text-brand-gray text-sm">
          Loading student portfolio from database...
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <TopBar title="360° Student Profile" />
        <div className="max-w-xl mx-auto mt-10 bg-white rounded-3xl p-8 border border-brand-red/30 shadow-editorial text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-brand-dark">
            {error.code === 403 ? 'Access Restricted' : 'Profile Unavailable'}
          </h2>
          <p className="text-xs text-brand-gray leading-relaxed">{error.message}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold mt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </DashboardShell>
    );
  }

  if (!student) return null;

  const cgpaAll = academicRecords.filter((r) => r.sgpa > 0);
  const cgpa =
    cgpaAll.length > 0
      ? (cgpaAll.reduce((acc, r) => acc + r.sgpa, 0) / cgpaAll.length).toFixed(2)
      : student.cgpa || 'N/A';

  return (
    <DashboardShell>
      <TopBar title="360° Student Profile" />

      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-gray hover:text-brand-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={student?.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student?.user?.name || 'S')}`}
              alt={student?.user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-gray-light"
            />
            <div>
              <h2 className="text-xl font-bold text-brand-dark">{student?.user?.name}</h2>
              <p className="text-xs text-brand-gray">{student?.studentId} · {student?.department}</p>
              <p className="text-xs text-brand-gray">{student?.user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={student?.status === 'AT_RISK' ? 'danger' : 'success'}>
                  {student?.status || 'ON_TRACK'}
                </Badge>
                <span className="text-[11px] font-semibold text-brand-gray">
                  Batch {student?.batch} · Semester {student?.semester}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs text-brand-gray shrink-0 text-right">
            <span>Assigned Mentor: <strong className="text-brand-dark">{student?.mentor?.name || 'Unassigned'}</strong></span>
            <span>CGPA: <strong className="text-brand-dark text-base">{cgpa}</strong></span>
            <span>Attendance: <strong className={student?.attendancePercentage < 75 ? 'text-brand-red' : 'text-brand-dark'}>{student?.attendancePercentage}%</strong></span>
            {currentUser?.role === 'MENTOR' && (
              <button
                type="button"
                onClick={() => {
                  setDocRequestForm(prev => ({
                    ...prev,
                    studentId: student?.user?._id || student?._id || ''
                  }));
                  setShowRequestDocModal(true);
                }}
                className="px-4 py-2 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 self-end mt-2 shadow-sm"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Request Document</span>
              </button>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-brand-dark text-white'
                  : 'bg-white border border-brand-gray-light text-brand-gray hover:text-brand-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial space-y-4">
              <h3 className="text-base font-bold text-brand-dark">Personal Info</h3>
              <div className="space-y-2 text-xs text-brand-gray">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{student?.user?.email}</div>
                {student?.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{student?.phone}</div>}
                {student?.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{student?.address}</div>}
                <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" />Section {student?.section} · {student?.gender}</div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial space-y-4">
              <h3 className="text-base font-bold text-brand-dark">Career Goals</h3>
              <div className="space-y-2 text-xs text-brand-gray">
                <div><span className="font-semibold text-brand-dark">Goal:</span> {student?.career?.goal || 'Not set'}</div>
                <div><span className="font-semibold text-brand-dark">Role:</span> {student?.career?.preferredRole || 'Not set'}</div>
                <div><span className="font-semibold text-brand-dark">Domain:</span> {student?.career?.preferredDomain || 'Not set'}</div>
                {student?.career?.githubUrl && (
                  <a href={student.career.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-red font-bold">
                    <GitBranch className="w-3.5 h-3.5" /> GitHub Profile
                  </a>
                )}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial space-y-3">
              <h3 className="text-base font-bold text-brand-dark">Internships ({internships.length})</h3>
              {internships.length === 0 ? (
                <p className="text-xs text-brand-gray">No internships recorded.</p>
              ) : internships.map((i) => (
                <div key={i._id} className="text-xs text-brand-gray">
                  <p className="font-bold text-brand-dark">{i.company} — {i.role}</p>
                  <p>{i.duration} · {i.location}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial space-y-3">
              <h3 className="text-base font-bold text-brand-dark">Mentor Tasks ({tasks.length})</h3>
              {tasks.length === 0 ? (
                <p className="text-xs text-brand-gray">No active tasks.</p>
              ) : tasks.slice(0, 5).map((t) => (
                <div key={t._id} className="flex items-center justify-between text-xs">
                  <span className="text-brand-dark font-semibold">{t.title}</span>
                  <Badge variant={t.status === 'COMPLETED' ? 'success' : t.priority === 'URGENT' ? 'danger' : 'default'}>
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'academic' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4">
            <h3 className="text-base font-bold text-brand-dark">Semester Academic Records</h3>
            {academicRecords.length === 0 ? (
              <p className="text-xs text-brand-gray">No academic records found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {academicRecords.map((rec) => (
                  <div key={rec._id} className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-brand-dark">Semester {rec.semester}</span>
                      <span className="text-xs font-bold text-brand-red">SGPA: {rec.sgpa}</span>
                    </div>
                    <div className="text-xs text-brand-gray">
                      <div>Marks: {rec.totalMarks}/{rec.maxMarks} ({rec.percentage}%)</div>
                      <div>Year: {rec.academicYear}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-brand-gray-light/60">
              <span className="text-sm font-bold text-brand-dark">Cumulative CGPA: <span className="text-brand-red">{cgpa}</span></span>
            </div>
          </section>
        )}

        {activeTab === 'projects' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4">
            <h3 className="text-base font-bold text-brand-dark">Projects ({projects.length})</h3>
            {projects.length === 0 ? (
              <p className="text-xs text-brand-gray">No projects recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p._id} className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60">
                    <h4 className="font-bold text-sm text-brand-dark mb-1">{p.title}</h4>
                    <p className="text-xs text-brand-gray mb-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.techStack?.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-brand-gray-light text-[11px] font-semibold">{t}</span>
                      ))}
                    </div>
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-red font-bold mt-2 flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> GitHub
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'certifications' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4">
            <h3 className="text-base font-bold text-brand-dark">Certifications ({certifications.length})</h3>
            {certifications.length === 0 ? (
              <p className="text-xs text-brand-gray">No certifications recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certifications.map((c) => (
                  <div key={c._id} className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60">
                    <h4 className="font-bold text-sm text-brand-dark">{c.name}</h4>
                    <p className="text-xs text-brand-gray">{c.issuer} · {c.issueDate}</p>
                    {c.credentialId && <p className="text-[11px] text-brand-gray">ID: {c.credentialId}</p>}
                    {c.verificationUrl && (
                      <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-red font-bold flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" /> Verify
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'mentoring' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4">
            <h3 className="text-base font-bold text-brand-dark">Mentoring Notes & Meetings</h3>
            <div className="space-y-3">
              {mentorNotes.length === 0 ? (
                <p className="text-xs text-brand-gray">No mentoring notes recorded.</p>
              ) : mentorNotes.map((n) => (
                <div key={n._id} className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-brand-dark">{n.title}</h4>
                    <span className="text-[11px] text-brand-gray">{n.date}</span>
                  </div>
                  <p className="text-xs text-brand-gray">{n.discussion}</p>
                  {n.actionRequired && (
                    <p className="text-xs text-brand-dark mt-1 font-semibold">Action: {n.actionRequired}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-brand-gray-light/60">
              <h4 className="font-bold text-sm text-brand-dark mb-3">Meeting History ({meetings.length})</h4>
              {meetings.length === 0 ? (
                <p className="text-xs text-brand-gray">No meetings recorded.</p>
              ) : (
                <div className="space-y-2">
                  {meetings.slice(0, 5).map((m) => (
                    <div key={m._id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-brand-surface border border-brand-gray-light/60">
                      <div>
                        <span className="font-bold text-brand-dark">{m.title}</span>
                        <span className="text-brand-gray ml-2">{m.date}</span>
                      </div>
                      <Badge variant={m.status === 'COMPLETED' ? 'success' : 'default'}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Privacy Notice for HODs/Admins */}
        {(currentUser?.role === 'HOD' || currentUser?.role === 'ADMIN') && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            <strong>Institutional Privacy Notice:</strong> Private student documents (marks cards, identity documents, personal files) are not displayed here. Document contents are accessible only to the student and their currently assigned mentor, in accordance with the institutional data privacy policy.
          </div>
        )}
      </div>

      {/* Request Document Modal for Mentor */}
      <Modal
        isOpen={showRequestDocModal}
        onClose={() => setShowRequestDocModal(false)}
        title={`Request Official Document from ${student?.user?.name || 'Mentee'}`}
      >
        <form onSubmit={handleCreateDocumentRequest} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Target Mentee</label>
            <input
              type="text"
              disabled
              value={`${student?.user?.name || 'Student'} (${student?.studentId || 'ID'}) — ${student?.department || ''}`}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium text-brand-dark"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Document Title / Request Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Semester 4 Marks Card, Medical Certificate, Offer Letter"
              value={docRequestForm.title}
              onChange={(e) => setDocRequestForm({ ...docRequestForm, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Document Category</label>
              <select
                value={docRequestForm.documentType}
                onChange={(e) => setDocRequestForm({ ...docRequestForm, documentType: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold outline-none"
              >
                <option value="Semester marks card">Semester marks card</option>
                <option value="Internship certificate">Internship certificate</option>
                <option value="Resume / CV">Resume / CV</option>
                <option value="Fee receipt">Fee receipt</option>
                <option value="Identity card">Identity card</option>
                <option value="Medical certificate">Medical certificate</option>
                <option value="Achievement certificate">Achievement certificate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-brand-dark block mb-1">Priority</label>
              <select
                value={docRequestForm.priority}
                onChange={(e) => setDocRequestForm({ ...docRequestForm, priority: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={docRequestForm.dueDate}
              onChange={(e) => setDocRequestForm({ ...docRequestForm, dueDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Upload Instructions / Notes</label>
            <textarea
              rows="3"
              value={docRequestForm.description}
              onChange={(e) => setDocRequestForm({ ...docRequestForm, description: e.target.value })}
              placeholder="Provide context or instructions for your mentee..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowRequestDocModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingDocRequest}
              className="px-5 py-2 rounded-full font-semibold bg-brand-red hover:bg-brand-red-hover text-white flex items-center gap-2"
            >
              {submittingDocRequest ? 'Issuing Request...' : 'Issue Document Request'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
};
