import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Calendar,
  Plus,
  Mail,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  Send,
  FilePlus
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { MetricCard } from '../components/common/MetricCard';
import { FeatureCard } from '../components/common/FeatureCard';
import { DotMatrixChart } from '../components/common/DotMatrixChart';
import { BarChartWidget } from '../components/common/BarChartWidget';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DOCUMENT_TYPES = [
  'Semester marks card',
  'Consolidated marks card',
  'Certificate',
  'Internship certificate',
  'Resume',
  'Project report',
  'Research paper',
  'Identity or institutional document',
  'Other academic document'
];

export const MentorDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);

  // Modals
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDiscussion, setNoteDiscussion] = useState('');
  const [noteAction, setNoteAction] = useState('');

  // Request Document Modal
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);
  const [docRequestForm, setDocRequestForm] = useState({
    studentId: '',
    title: '',
    documentType: 'Semester marks card',
    description: '',
    priority: 'HIGH',
    dueDate: '',
    isRequired: true
  });

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVED');
  const [reviewReason, setReviewReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMentorData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, reqsRes] = await Promise.all([
        api.students.getAll(),
        api.documentRequests.getAll()
      ]);

      if (studentsRes.success) {
        setMentees(studentsRes.students || []);
        if (studentsRes.students?.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentsRes.students[0].user?._id || studentsRes.students[0]._id);
          setDocRequestForm((prev) => ({
            ...prev,
            studentId: studentsRes.students[0].user?._id || studentsRes.students[0]._id
          }));
        }
      }
      if (reqsRes.success) {
        setDocumentRequests(reqsRes.documentRequests || []);
      }
    } catch (err) {
      console.warn('Error fetching mentor data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchMentorData();
  }, [fetchMentorData]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !noteTitle) return;

    try {
      const res = await api.notes.create({
        studentId: selectedStudentId,
        title: noteTitle,
        discussion: noteDiscussion,
        actionRequired: noteAction
      });
      if (res.success) {
        addToast('Feedback note saved to MongoDB!');
        setShowAddNoteModal(false);
        setNoteTitle('');
        setNoteDiscussion('');
        setNoteAction('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateDocumentRequest = async (e) => {
    e.preventDefault();
    if (!docRequestForm.studentId || !docRequestForm.title || !docRequestForm.dueDate) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    try {
      const res = await api.documentRequests.create(docRequestForm);
      if (res.success) {
        addToast(`Document request issued to mentee!`);
        setShowRequestDocModal(false);
        setDocRequestForm({
          studentId: mentees[0]?.user?._id || '',
          title: '',
          documentType: 'Semester marks card',
          description: '',
          priority: 'HIGH',
          dueDate: '',
          isRequired: true
        });
        fetchMentorData();
      }
    } catch (err) {
      addToast(err.message || 'Error creating document request', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRequest) return;

    setSubmittingReview(true);
    try {
      const res = await api.documentRequests.review(reviewRequest._id, {
        action: reviewAction,
        reason: reviewReason
      });
      if (res.success) {
        addToast(`Document request marked as ${reviewAction}`);
        setShowReviewModal(false);
        setReviewRequest(null);
        setReviewReason('');
        fetchMentorData();
      }
    } catch (err) {
      addToast(err.message || 'Review action failed', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const atRiskCount = mentees.filter((s) => s.status === 'AT_RISK').length;
  const pendingReviewRequests = documentRequests.filter((r) => r.status === 'UNDER REVIEW' || r.status === 'UPLOADED');

  return (
    <DashboardShell>
      <TopBar title="Mentor Governance Dashboard" />

      {/* Top Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5">
          <MetricCard
            title="Assigned Mentees Activity"
            mainValue={`${mentees.length}`}
            subValue="/ Active Students Under Mentorship"
            className="h-full"
          >
            <BarChartWidget />
          </MetricCard>
        </div>

        <div className="md:col-span-4">
          <MetricCard
            title="Mentee Health Compliance"
            className="h-full"
          >
            <div className="flex items-end justify-between gap-4 mt-2">
              <div>
                <div className="text-4xl font-bold tracking-tight text-brand-dark leading-none mb-1">
                  {mentees.length > 0
                    ? `${Math.round(((mentees.length - atRiskCount) / mentees.length) * 100)}%`
                    : '100%'}
                </div>
                <span className="text-xs font-semibold text-emerald-600">
                  On-Track Compliance Standing
                </span>
              </div>
              <DotMatrixChart totalDots={36} crimsonCount={atRiskCount > 0 ? 8 : 4} tooltipPrefix="Mentee Record" />
            </div>
          </MetricCard>
        </div>

        <div className="md:col-span-3 flex flex-col justify-between gap-4">
          <div
            onClick={() => navigate('/mentees')}
            className="bg-brand-dark text-white rounded-3xl p-5 px-6 flex items-center justify-between cursor-pointer hover:bg-brand-dark-surface shadow-dark-float hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-[#B4B9C2] block">At-Risk Alerts</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-brand-peach">{atRiskCount}</span>
                <span className="text-[11px] text-[#979CA6]">Requiring Attention</span>
              </div>
            </div>
            <AlertTriangle className="w-6 h-6 text-brand-peach" />
          </div>

          <div
            onClick={() => navigate('/meetings')}
            className="bg-white text-brand-dark rounded-3xl p-5 px-6 border border-brand-gray-light/70 flex items-center justify-between cursor-pointer shadow-editorial hover:shadow-editorial-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-brand-gray block">Schedule</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-brand-dark">Mentoring</span>
                <span className="text-[11px] text-brand-gray">Sessions</span>
              </div>
            </div>
            <Calendar className="w-6 h-6 text-brand-red" />
          </div>
        </div>
      </section>

      {/* Action Banners & Document Request Controls */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start mt-2">
        <div className="md:col-span-4 space-y-4">
          <FeatureCard
            title="Request Official Student Document."
            subtitle="Request marks cards, certificates, or resumes directly from an assigned mentee with automated audit tracking."
            actionText="Request Document"
            onAction={() => setShowRequestDocModal(true)}
          />

          <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial space-y-3">
            <h4 className="font-bold text-sm text-brand-dark">Mentor Fast Actions</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowRequestDocModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-brand-red/30 bg-rose-50/70 hover:bg-brand-red hover:text-white text-xs font-bold text-brand-red transition-all text-left flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <FilePlus className="w-3.5 h-3.5" /> Request Document from Mentee
                </span>
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-brand-gray-light bg-brand-surface hover:bg-brand-dark hover:text-white text-xs font-bold transition-all text-left flex items-center justify-between"
              >
                <span>Record Mentee Feedback Note</span>
                <span>+</span>
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="w-full py-2.5 px-4 rounded-xl border border-brand-gray-light bg-brand-surface hover:bg-brand-dark hover:text-white text-xs font-bold transition-all text-left flex items-center justify-between"
              >
                <span>Browse Document Vault</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* MENTEE DOCUMENT REVIEW QUEUE */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-red" />
                Submitted Mentee Documents For Review
              </h3>
              <p className="text-xs text-brand-gray">
                Verify student submissions against your official document requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-brand-red">
                {pendingReviewRequests.length} Pending Review
              </span>
              <button
                onClick={() => setShowRequestDocModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Document</span>
              </button>
            </div>
          </div>

          {pendingReviewRequests.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60">
              <p className="text-xs font-bold text-brand-dark">No submitted documents awaiting your review.</p>
              <p className="text-[11px] text-brand-gray mt-1">When students submit requested files, they will appear here for verification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviewRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.student?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.student?.name || 'S')}`}
                      alt={req.student?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-brand-gray-light shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-brand-dark">{req.title}</h4>
                      <p className="text-xs text-brand-gray">
                        Student: <strong className="text-brand-dark">{req.student?.name}</strong> • {req.documentType}
                      </p>
                      {req.submittedDocument && (
                        <p className="text-[11px] text-brand-dark/80 mt-0.5">
                          Submitted File: {req.submittedDocument.displayName || req.submittedDocument.originalFilename}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {req.submittedDocument && (
                      <>
                        <a
                          href={api.documents.getDownloadUrl(req.submittedDocument._id, true)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full bg-white border border-brand-gray-light hover:bg-brand-surface text-brand-dark text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          title="Preview document in new tab"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </a>
                        <a
                          href={api.documents.getDownloadUrl(req.submittedDocument._id, false)}
                          className="px-3 py-1.5 rounded-full bg-brand-surface border border-brand-gray-light hover:bg-brand-gray-light/60 text-brand-red text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          title="Download document to computer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setReviewRequest(req);
                        setReviewAction('APPROVED');
                        setShowReviewModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setReviewRequest(req);
                        setReviewAction('REJECTED');
                        setShowReviewModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assigned Mentees Directory Section */}
          <div className="pt-6 border-t border-brand-gray-light/60">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-brand-dark">Assigned Mentees Roster</h4>
              <button
                onClick={() => navigate('/mentees')}
                className="text-xs font-bold text-brand-red hover:underline"
              >
                View Full Directory →
              </button>
            </div>

            {mentees.length === 0 ? (
              <p className="text-xs text-brand-gray text-center py-4">No students assigned to your mentorship.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mentees.map((m) => {
                  const studentUserId = m.user?._id || m.user;
                  return (
                    <div
                      key={m._id}
                      className="p-3.5 rounded-2xl bg-brand-surface border border-brand-gray-light/60 flex flex-col justify-between gap-3 hover:border-brand-dark transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.user?.name || 'S')}`}
                            alt={m.user?.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-gray-light"
                          />
                          <div>
                            <h5 className="font-bold text-xs text-brand-dark">{m.user?.name}</h5>
                            <p className="text-[10px] text-brand-gray">Sem {m.semester} • {m.studentId}</p>
                          </div>
                        </div>
                        <Badge variant={m.status === 'AT_RISK' ? 'red' : 'dark'}>
                          {m.cgpa || '0.0'} CGPA
                        </Badge>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-gray-light/50 flex-wrap">
                        <button
                          onClick={() => {
                            setDocRequestForm((prev) => ({ ...prev, studentId: studentUserId }));
                            setShowRequestDocModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 border border-brand-red/30 hover:bg-brand-red hover:text-white text-[11px] font-bold text-brand-red transition-all inline-flex items-center gap-1"
                          title="Request Document from this mentee"
                        >
                          <FilePlus className="w-3 h-3" />
                          <span>Request Doc</span>
                        </button>
                        <button
                          onClick={() => navigate(`/academic-records?studentId=${studentUserId}`)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-brand-gray-light hover:bg-brand-gray-light/60 text-[11px] font-bold text-brand-dark transition-all"
                          title="Edit Semester Marks & SGPA"
                        >
                          Edit Marks
                        </button>
                        <button
                          onClick={() => navigate('/meetings')}
                          className="px-2.5 py-1 rounded-lg bg-brand-dark hover:bg-brand-red text-[11px] font-bold text-white transition-all"
                          title="Schedule Mentoring Session"
                        >
                          Schedule Meeting
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL 1: REQUEST DOCUMENT FROM MENTEE */}
      <Modal
        isOpen={showRequestDocModal}
        onClose={() => setShowRequestDocModal(false)}
        title="Request Official Document from Mentee"
      >
        <form onSubmit={handleCreateDocumentRequest} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Select Mentee</label>
            <select
              required
              value={docRequestForm.studentId}
              onChange={(e) => setDocRequestForm({ ...docRequestForm, studentId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold"
            >
              {mentees.map((m) => (
                <option key={m._id} value={m.user?._id || m._id}>
                  {m.user?.name} ({m.studentId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Document Title</label>
            <input
              type="text"
              required
              value={docRequestForm.title}
              onChange={(e) => setDocRequestForm({ ...docRequestForm, title: e.target.value })}
              placeholder="e.g. Semester 3 Grade Sheet or Internship Completion Certificate"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Document Category</label>
              <select
                value={docRequestForm.documentType}
                onChange={(e) => setDocRequestForm({ ...docRequestForm, documentType: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-brand-dark block mb-1">Priority</label>
              <select
                value={docRequestForm.priority}
                onChange={(e) => setDocRequestForm({ ...docRequestForm, priority: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Due Date</label>
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
              placeholder="Specify requirements, e.g. signed copy with registrar seal in PDF format..."
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
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Document Request</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: REVIEW / APPROVE / REJECT DOCUMENT */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={`Review Request: ${reviewRequest?.title}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-brand-surface rounded-xl border border-brand-gray-light">
            <p className="font-bold text-brand-dark">Student: {reviewRequest?.student?.name}</p>
            <p className="text-brand-gray text-[11px]">Requested: {reviewRequest?.documentType}</p>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Decision</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-700">
                <input
                  type="radio"
                  name="reviewAction"
                  value="APPROVED"
                  checked={reviewAction === 'APPROVED'}
                  onChange={() => setReviewAction('APPROVED')}
                />
                Approve & Mark Verified
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-rose-700">
                <input
                  type="radio"
                  name="reviewAction"
                  value="REJECTED"
                  checked={reviewAction === 'REJECTED'}
                  onChange={() => setReviewAction('REJECTED')}
                />
                Reject & Require Resubmission
              </label>
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">
              {reviewAction === 'APPROVED' ? 'Approval Notes (Optional)' : 'Rejection Reason / Guidance (Required)'}
            </label>
            <textarea
              rows="3"
              required={reviewAction === 'REJECTED'}
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              placeholder={
                reviewAction === 'APPROVED'
                  ? 'e.g. Document verified against official academic records.'
                  : 'Specify why the document was rejected so the student can resubmit...'
              }
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              disabled={submittingReview}
              onClick={() => setShowReviewModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className={`px-5 py-2 rounded-full font-semibold text-white ${
                reviewAction === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submittingReview ? 'Recording Decision...' : `Confirm ${reviewAction}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ADD MENTEE NOTE */}
      <Modal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        title="Record Mentee Feedback Note"
      >
        <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Select Mentee</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold"
              required
            >
              {mentees.map((m) => (
                <option key={m._id} value={m.user?._id || m._id}>
                  {m.user?.name} ({m.studentId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Discussion Topic</label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Capstone Milestones & Code Review"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Observations</label>
            <textarea
              rows="3"
              required
              value={noteDiscussion}
              onChange={(e) => setNoteDiscussion(e.target.value)}
              placeholder="Record mentor observations and feedback..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Action Required</label>
            <input
              type="text"
              value={noteAction}
              onChange={(e) => setNoteAction(e.target.value)}
              placeholder="e.g. Complete certification by end of month"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowAddNoteModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white"
            >
              Save Mentee Note
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
};
