import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Eye,
  ArrowUpRight,
  Send,
  ShieldAlert,
  Check,
  X,
  UserCheck,
  FilePlus,
  Plus
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DOCUMENT_CATEGORIES = [
  'ALL',
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

export const Documents = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(currentUser?.role === 'MENTOR' ? 'reviews' : 'vault');
  const [documents, setDocuments] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);
  const [mentees, setMentees] = useState([]);
  const [submittingDocRequest, setSubmittingDocRequest] = useState(false);
  const [docRequestForm, setDocRequestForm] = useState({
    studentId: '',
    title: '',
    documentType: 'Semester marks card',
    description: '',
    priority: 'HIGH',
    dueDate: '',
    isRequired: true
  });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Approval / Rejection form
  const [reviewComment, setReviewComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Upload Form State (in component state only)
  const [uploadForm, setUploadForm] = useState({
    displayName: '',
    documentType: 'Semester marks card',
    description: '',
    file: null,
    documentRequestId: ''
  });

  const [replaceFile, setReplaceFile] = useState(null);

  // Fetch documents and requests
  const loadDocuments = useCallback(async () => {
    if (currentUser?.role === 'HOD' || currentUser?.role === 'ADMIN') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [docsRes, reqsRes] = await Promise.all([
        api.documents.getAll({
          search,
          documentType: categoryFilter === 'ALL' ? '' : categoryFilter,
          page
        }),
        api.documentRequests.getAll()
      ]);

      if (docsRes.success) {
        setDocuments(docsRes.documents || []);
        setTotalPages(docsRes.pages || 1);
      }
      if (reqsRes.success) {
        setDocumentRequests(reqsRes.documentRequests || []);
      }

      // If mentor, also load review queue
      if (currentUser?.role === 'MENTOR') {
        const queueRes = await api.documents.getMentorReviewQueue();
        if (queueRes.success) {
          setPendingReviews(queueRes.pendingReviews || []);
          setReviewHistory(queueRes.reviewHistory || []);
        }
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      addToast(err.message || 'Could not load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page, currentUser?.role, addToast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Fetch mentor's assigned mentees for document request form
  const fetchMentees = useCallback(async () => {
    if (currentUser?.role !== 'MENTOR') return;
    try {
      const res = await api.mentor.getMentees();
      if (res.success) {
        const list = res.mentees || res.students || [];
        setMentees(list);
        if (list.length > 0) {
          const firstId = list[0].user?._id || list[0]._id;
          setDocRequestForm((prev) => ({
            ...prev,
            studentId: prev.studentId || firstId
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching mentees for document request:', err);
    }
  }, [currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role === 'MENTOR') {
      fetchMentees();
    }
  }, [currentUser?.role, fetchMentees]);

  // Handle Mentor Request Document from Mentee
  const handleCreateDocumentRequest = async (e) => {
    e.preventDefault();
    if (!docRequestForm.studentId || !docRequestForm.title || !docRequestForm.dueDate) {
      addToast('Please fill out all required fields (Mentee, Title, Due Date)', 'error');
      return;
    }

    setSubmittingDocRequest(true);
    try {
      const res = await api.documentRequests.create(docRequestForm);
      if (res.success) {
        addToast(`Document request "${docRequestForm.title}" issued to mentee!`);
        setShowRequestDocModal(false);
        setDocRequestForm({
          studentId: mentees[0]?.user?._id || mentees[0]?._id || '',
          title: '',
          documentType: 'Semester marks card',
          description: '',
          priority: 'HIGH',
          dueDate: '',
          isRequired: true
        });
        loadDocuments();
      }
    } catch (err) {
      addToast(err.message || 'Error creating document request', 'error');
    } finally {
      setSubmittingDocRequest(false);
    }
  };

  // Handle standard document upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      addToast('Please select a file to upload', 'error');
      return;
    }

    // Client-side validation: Max 15MB
    if (uploadForm.file.size > 15 * 1024 * 1024) {
      addToast('File exceeds 15MB limit. Please upload a smaller document.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('displayName', uploadForm.displayName || uploadForm.file.name);
      formData.append('documentType', uploadForm.documentType);
      formData.append('description', uploadForm.description);
      if (uploadForm.documentRequestId) {
        formData.append('documentRequestId', uploadForm.documentRequestId);
      }

      const res = await api.documents.upload(formData);
      if (res.success) {
        addToast(`Document "${res.document.displayName}" uploaded successfully!`);
        setShowUploadModal(false);
        setUploadForm({
          displayName: '',
          documentType: 'Semester marks card',
          description: '',
          file: null,
          documentRequestId: ''
        });
        loadDocuments();
      }
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle document replace
  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!replaceFile || !selectedDoc) return;

    if (replaceFile.size > 15 * 1024 * 1024) {
      addToast('File exceeds 15MB limit', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', replaceFile);
      const res = await api.documents.replace(selectedDoc._id, formData);
      if (res.success) {
        addToast('Document replaced with new version!');
        setShowReplaceModal(false);
        setReplaceFile(null);
        setSelectedDoc(null);
        loadDocuments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to replace file', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle document delete
  const handleDeleteConfirm = async () => {
    if (!selectedDoc) return;
    try {
      const res = await api.documents.delete(selectedDoc._id);
      if (res.success) {
        addToast('Document removed successfully');
        setShowDeleteModal(false);
        setSelectedDoc(null);
        loadDocuments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete document', 'error');
    }
  };

  // Handle Mentor Approve
  const handleApproveConfirm = async () => {
    if (!selectedDoc) return;
    try {
      const res = await api.documents.approve(selectedDoc._id, reviewComment);
      if (res.success) {
        addToast(`Document "${selectedDoc.displayName}" approved successfully!`);
        setShowApproveModal(false);
        setSelectedDoc(null);
        setReviewComment('');
        loadDocuments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to approve document', 'error');
    }
  };

  // Handle Mentor Reject
  const handleRejectConfirm = async () => {
    if (!selectedDoc) return;
    if (!rejectionReason.trim()) {
      addToast('A reason for rejection is required', 'error');
      return;
    }
    try {
      const res = await api.documents.reject(selectedDoc._id, rejectionReason);
      if (res.success) {
        addToast(`Document "${selectedDoc.displayName}" marked as rejected. Student notified.`);
        setShowRejectModal(false);
        setSelectedDoc(null);
        setRejectionReason('');
        loadDocuments();
      }
    } catch (err) {
      addToast(err.message || 'Failed to reject document', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue && status !== 'APPROVED') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-red text-white uppercase tracking-wider animate-pulse">OVERDUE</span>;
    }
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">APPROVED</span>;
      case 'UNDER REVIEW':
      case 'PENDING_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">PENDING REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">REJECTED</span>;
      case 'UPLOADED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">UPLOADED</span>;
      case 'PENDING':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-800 uppercase tracking-wider">PENDING</span>;
    }
  };

  // If HOD or Admin, enforce strict privacy screen
  if (currentUser?.role === 'HOD' || currentUser?.role === 'ADMIN') {
    return (
      <DashboardShell>
        <TopBar title="Institutional Privacy Guard" />
        <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-brand-gray-light/60 shadow-editorial text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-brand-dark">Confidential Student Document Vault</h2>
          <p className="text-xs text-brand-gray leading-relaxed">
            Under strict institutional privacy policy, all uploaded student marks cards, identity documents, and personal submissions are accessible <strong>solely to the student and their currently assigned faculty mentor</strong>.
          </p>
          <div className="p-4 bg-brand-surface rounded-2xl border border-brand-gray-light/60 text-left text-xs space-y-2">
            <p className="font-bold text-brand-dark flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> Administrative Privacy Controls Active:
            </p>
            <ul className="list-disc list-inside text-brand-gray space-y-1">
              <li>Direct document URLs and downloads are cryptographically protected.</li>
              <li>HOD and Admin accounts cannot browse or inspect private student files.</li>
              <li>Document approvals and verification are exclusively handled by the student's assigned mentor.</li>
            </ul>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <TopBar title="Document Management" onSearch={setSearch} />

      <div className="space-y-6">
        {/* Header Actions & Quick Metrics */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
              <h2 className="text-xl font-bold tracking-tight text-brand-dark">
                {currentUser?.role === 'MENTOR' ? 'Mentee Document Verification & Vault' : 'Official Academic Documents & Vault'}
              </h2>
            </div>
            <p className="text-xs text-brand-gray max-w-xl">
              {currentUser?.role === 'MENTOR'
                ? 'Review, verify, approve, or request revisions for semester marks cards, project reports, and certifications submitted by your assigned mentees.'
                : 'Upload, preview, securely download, and verify semester marks cards, certifications, resumes, and project documentation with automated Cloudinary and local storage backup.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === 'MENTOR' && (
              <button
                onClick={() => {
                  fetchMentees();
                  setShowRequestDocModal(true);
                }}
                className="px-5 py-3 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                <span>Request Document from Mentee</span>
              </button>
            )}

            {currentUser?.role === 'MENTEE' && (
              <button
                onClick={() => {
                  setUploadForm({
                    displayName: '',
                    documentType: 'Semester marks card',
                    description: '',
                    file: null,
                    documentRequestId: ''
                  });
                  setShowUploadModal(true);
                }}
                className="px-5 py-3 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </section>

        {/* MENTOR NAVIGATION TABS */}
        {currentUser?.role === 'MENTOR' && (
          <div className="flex items-center gap-3 border-b border-brand-gray-light/60 pb-2 flex-wrap">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-brand-gray hover:text-brand-dark border border-brand-gray-light/60'
              }`}
            >
              <FileCheck className="w-4 h-4 text-brand-peach" />
              <span>Pending Reviews ({pendingReviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-brand-gray hover:text-brand-dark border border-brand-gray-light/60'
              }`}
            >
              <Send className="w-4 h-4 text-brand-peach" />
              <span>Issued Requests ({documentRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'vault'
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-brand-gray hover:text-brand-dark border border-brand-gray-light/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All Mentee Documents</span>
            </button>
          </div>
        )}

        {/* MENTOR REVIEW QUEUE TAB */}
        {currentUser?.role === 'MENTOR' && activeTab === 'reviews' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  Submissions Awaiting Your Review ({pendingReviews.length})
                </h3>
                <p className="text-xs text-brand-gray">
                  Inspect student uploads, check authenticity, and record official approval or revision decisions.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-brand-gray py-6 text-center">Loading review queue...</p>
            ) : pendingReviews.length === 0 ? (
              <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-brand-dark">All clear! No documents pending review.</p>
                <p className="text-xs text-brand-gray">Whenever your mentees upload documents, they will appear here for verification.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-5 rounded-2xl bg-brand-surface border border-brand-gray-light/80 hover:border-brand-dark transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-md">
                          {doc.student?.name || 'Assigned Mentee'} ({doc.student?.studentId || 'N/A'})
                        </span>
                        <h4 className="font-bold text-sm text-brand-dark">{doc.displayName}</h4>
                        {getStatusBadge(doc.reviewStatus, false)}
                      </div>
                      <p className="text-xs text-brand-gray">
                        Type: <strong className="text-brand-dark">{doc.documentType}</strong> • Uploaded on {new Date(doc.createdAt).toLocaleDateString()} • {formatFileSize(doc.fileSize)}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-brand-dark/80 bg-white p-2 rounded-xl border border-brand-gray-light/40 italic">
                          "{doc.description}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Preview / Inspect in new tab */}
                      <a
                        href={api.documents.getDownloadUrl(doc._id, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-white border border-brand-gray-light hover:bg-brand-gray-light/50 text-xs font-bold text-brand-dark flex items-center gap-1.5 shadow-sm transition-colors"
                        title="Open file preview in new tab"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-red" />
                        <span>Inspect</span>
                      </a>

                      {/* Direct file download */}
                      <a
                        href={api.documents.getDownloadUrl(doc._id, false)}
                        className="px-3 py-2 rounded-xl bg-brand-surface border border-brand-gray-light/80 hover:bg-brand-gray-light/60 text-xs font-bold text-brand-red flex items-center gap-1.5 shadow-sm transition-colors"
                        title="Download file directly to computer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setReviewComment('');
                          setShowApproveModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setRejectionReason('');
                          setShowRejectModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MENTOR ISSUED REQUESTS TAB */}
        {currentUser?.role === 'MENTOR' && activeTab === 'requests' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <Send className="w-5 h-5 text-brand-red" />
                  Official Document Requests Issued to Mentees ({documentRequests.length})
                </h3>
                <p className="text-xs text-brand-gray">
                  Track submissions, due dates, and verification progress for document requests you have issued
                </p>
              </div>
              <button
                onClick={() => {
                  fetchMentees();
                  setShowRequestDocModal(true);
                }}
                className="px-4 py-2 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request Document</span>
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-brand-gray py-6 text-center">Loading document requests...</p>
            ) : documentRequests.length === 0 ? (
              <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-3">
                <FilePlus className="w-8 h-8 text-brand-gray mx-auto opacity-50" />
                <p className="text-sm font-bold text-brand-dark">No document requests issued yet.</p>
                <p className="text-xs text-brand-gray max-w-md mx-auto">
                  Click "Request Document" to ask an assigned mentee to upload their semester marks card, certification, resume, or internship record.
                </p>
                <button
                  onClick={() => {
                    fetchMentees();
                    setShowRequestDocModal(true);
                  }}
                  className="px-4 py-2 rounded-full bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark-surface transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Request Document Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-5 rounded-2xl bg-brand-surface border border-brand-gray-light/80 hover:border-brand-dark transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-brand-dark leading-snug">{req.title}</h4>
                        {getStatusBadge(req.status, req.isOverdue)}
                      </div>
                      <p className="text-xs text-brand-gray font-medium">Type: {req.documentType}</p>
                      <div className="text-[11px] text-brand-dark bg-white/80 p-2.5 rounded-xl border border-brand-gray-light/40 space-y-1">
                        <p>Student: <strong>{req.student?.name}</strong> ({req.student?.studentId || 'ID'})</p>
                        <p>Due: <strong>{new Date(req.dueDate).toLocaleDateString()}</strong></p>
                        {req.description && <p className="text-brand-gray italic">"{req.description}"</p>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-gray-light/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-gray uppercase">
                        Priority: {req.priority}
                      </span>
                      {req.submittedDocument && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={api.documents.getDownloadUrl(req.submittedDocument._id || req.submittedDocument, true)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-full bg-white border border-brand-gray-light hover:bg-brand-gray-light/60 text-brand-dark text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                            title="Inspect in new tab"
                          >
                            <Eye className="w-3 h-3 text-brand-red" />
                            <span>Inspect</span>
                          </a>
                          <a
                            href={api.documents.getDownloadUrl(req.submittedDocument._id || req.submittedDocument, false)}
                            className="px-2.5 py-1.5 rounded-full bg-brand-surface border border-brand-gray-light hover:bg-brand-gray-light/60 text-brand-red text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                            title="Download file to computer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MENTOR REQUESTS SECTION (FOR STUDENTS) */}
        {currentUser?.role === 'MENTEE' && documentRequests.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-peach animate-ping" />
                  Requests From Your Faculty Mentor
                </h3>
                <p className="text-xs text-brand-gray">
                  Outstanding documents officially requested for academic audits and review
                </p>
              </div>
              <span className="text-xs font-bold text-brand-red">
                {documentRequests.filter(r => r.status === 'PENDING' || r.status === 'REJECTED').length} Actions Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentRequests.map((req) => (
                <div
                  key={req._id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    req.isOverdue
                      ? 'bg-rose-50/50 border-brand-red/30'
                      : req.status === 'APPROVED'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-brand-surface border-brand-gray-light/80 hover:border-brand-dark'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-brand-dark leading-snug">{req.title}</h4>
                      {getStatusBadge(req.status, req.isOverdue)}
                    </div>
                    <p className="text-xs text-brand-gray font-medium">Type: {req.documentType}</p>
                    {req.description && (
                      <p className="text-xs text-brand-dark/80 bg-white/80 p-2.5 rounded-xl border border-brand-gray-light/40">
                        "{req.description}"
                      </p>
                    )}
                    <div className="text-[11px] text-brand-gray flex items-center justify-between pt-1">
                      <span>Requested by: <strong className="text-brand-dark">{req.mentor?.name}</strong></span>
                      <span className="font-bold text-brand-dark">Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-brand-gray-light/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-gray uppercase">
                      Priority: {req.priority}
                    </span>

                    {['PENDING', 'REJECTED'].includes(req.status) && (
                      <button
                        onClick={() => {
                          setUploadForm({
                            displayName: req.title,
                            documentType: req.documentType,
                            description: `Submitted for request: ${req.title}`,
                            file: null,
                            documentRequestId: req._id
                          });
                          setShowUploadModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-brand-dark hover:bg-brand-red text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    )}

                    {req.status === 'UNDER REVIEW' && (
                      <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Awaiting Review
                      </span>
                    )}

                    {req.status === 'APPROVED' && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DOCUMENT REPOSITORY TABLE */}
        {(currentUser?.role === 'MENTEE' || (currentUser?.role === 'MENTOR' && activeTab === 'vault')) && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-6">
            {/* Filters & Search Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
                <span className="text-xs font-bold uppercase text-brand-gray shrink-0">Filter:</span>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-brand-dark text-white'
                        : 'bg-brand-surface text-brand-gray hover:text-brand-dark'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Documents' : cat}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-brand-gray shrink-0">
                {documents.length} Records Shown
              </span>
            </div>

            {/* Table */}
            {loading ? (
              <p className="text-xs text-brand-gray py-10 text-center">Loading document records...</p>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-3">
                <FileText className="w-10 h-10 text-brand-gray mx-auto" />
                <p className="text-sm font-bold text-brand-dark">No documents found in this category.</p>
                <p className="text-xs text-brand-gray">
                  {currentUser?.role === 'MENTEE' ? 'Click "Upload Document" above to store your marks cards or certificates.' : 'No uploads from assigned mentees.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-gray-light/80 text-brand-gray font-bold uppercase text-[11px]">
                      <th className="py-3 px-4">Document</th>
                      {currentUser?.role === 'MENTOR' && <th className="py-3 px-4">Student</th>}
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Size & Format</th>
                      <th className="py-3 px-4">Upload Date</th>
                      <th className="py-3 px-4">Review Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray-light/40">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-brand-surface/70 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-brand-dark block">{doc.displayName}</span>
                            <span className="text-[11px] text-brand-gray">{doc.originalFilename}</span>
                            {doc.rejectionReason && (
                              <span className="text-[10px] text-rose-600 block mt-0.5">
                                Rejection feedback: {doc.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>
                        {currentUser?.role === 'MENTOR' && (
                          <td className="py-3.5 px-4 font-semibold text-brand-dark">
                            {doc.student?.name || 'Assigned Mentee'}
                          </td>
                        )}
                        <td className="py-3.5 px-4 font-semibold text-brand-dark">
                          {doc.documentType}
                        </td>
                        <td className="py-3.5 px-4 text-brand-gray font-medium">
                          {formatFileSize(doc.fileSize)} • {doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </td>
                        <td className="py-3.5 px-4 text-brand-dark">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(doc.reviewStatus, false)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview in browser */}
                            <a
                              href={api.documents.getDownloadUrl(doc._id, true)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-gray-light/70 text-brand-dark transition-colors flex items-center gap-1"
                              title="Preview in new tab"
                            >
                              <Eye className="w-3.5 h-3.5 text-brand-dark" />
                              <span className="font-semibold text-[11px]">Preview</span>
                            </a>

                            {/* Direct Download */}
                            <a
                              href={api.documents.getDownloadUrl(doc._id, false)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-red/10 hover:bg-brand-red/20 text-brand-red transition-colors flex items-center gap-1"
                              title="Download to computer"
                            >
                              <Download className="w-3.5 h-3.5 text-brand-red" />
                              <span className="font-semibold text-[11px]">Download</span>
                            </a>

                            {/* Student Actions */}
                            {currentUser?.role === 'MENTEE' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setShowReplaceModal(true);
                                  }}
                                  className="p-2 rounded-lg bg-brand-surface hover:bg-brand-gray-light/70 text-brand-dark transition-colors"
                                  title="Replace with updated file"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 rounded-lg bg-brand-surface hover:bg-rose-50 text-brand-red transition-colors"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-brand-gray-light/50">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-brand-gray-light bg-brand-surface text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-brand-gray px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-brand-gray-light bg-brand-surface text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* UPLOAD MODAL */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!uploading) setShowUploadModal(false);
        }}
        title="Upload Academic Document"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Document Display Title</label>
            <input
              type="text"
              required
              value={uploadForm.displayName}
              onChange={(e) => setUploadForm({ ...uploadForm, displayName: e.target.value })}
              placeholder="e.g. Semester 4 Official Marks Card"
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Category / Type</label>
            <select
              value={uploadForm.documentType}
              onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface font-bold"
            >
              {DOCUMENT_CATEGORIES.filter(c => c !== 'ALL').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Description / Notes</label>
            <textarea
              rows="2"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Optional notes regarding this submission..."
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Select File (PDF, PNG, JPG, DOCX - max 15MB)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-dark file:text-white hover:file:bg-brand-red cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              disabled={uploading}
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Vault...</span>
                </>
              ) : (
                <span>Upload Document</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* REPLACE MODAL */}
      <Modal
        isOpen={showReplaceModal}
        onClose={() => {
          if (!uploading) setShowReplaceModal(false);
        }}
        title={`Replace ${selectedDoc?.displayName}`}
      >
        <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs">
          <p className="text-brand-gray">
            Upload a revised file. The existing cloud asset will be replaced with this version and marked for review.
          </p>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Select Replacement File (max 15MB)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={(e) => setReplaceFile(e.target.files[0])}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-dark file:text-white hover:file:bg-brand-red cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              disabled={uploading}
              onClick={() => setShowReplaceModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-full font-semibold bg-brand-dark text-white flex items-center gap-2"
            >
              {uploading ? 'Replacing...' : 'Confirm Replacement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Document Deletion"
      >
        <div className="space-y-4 text-xs">
          <p className="text-brand-dark font-medium">
            Are you sure you want to delete <strong className="text-brand-red">{selectedDoc?.displayName}</strong>?
          </p>
          <p className="text-brand-gray">
            This action permanently destroys the file record in MongoDB and wipes the asset from cloud storage. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* APPROVE MODAL */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Verify & Approve Document"
      >
        <div className="space-y-4 text-xs">
          <p className="text-brand-dark font-medium">
            Approve document <strong className="text-brand-dark">{selectedDoc?.displayName}</strong> submitted by {selectedDoc?.student?.name}?
          </p>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Approval Comment / Note (Optional)</label>
            <input
              type="text"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="e.g. Verified against university marks portal"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              onClick={() => setShowApproveModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveConfirm}
              className="px-5 py-2 rounded-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Document Submission"
      >
        <div className="space-y-4 text-xs">
          <p className="text-brand-dark font-medium">
            Specify the correction required for <strong className="text-brand-dark">{selectedDoc?.displayName}</strong>:
          </p>
          <div>
            <label className="font-bold text-brand-dark block mb-1">
              Rejection Reason <span className="text-brand-red">*</span>
            </label>
            <textarea
              rows="3"
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Scanned page is illegible. Please re-upload with clear official university stamp visible."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              className="px-5 py-2 rounded-full font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Reject Document
            </button>
          </div>
        </div>
      </Modal>

      {/* REQUEST DOCUMENT MODAL FOR MENTOR */}
      <Modal
        isOpen={showRequestDocModal}
        onClose={() => setShowRequestDocModal(false)}
        title="Request Official Document from Mentee"
      >
        <form onSubmit={handleCreateDocumentRequest} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Select Mentee</label>
            {mentees.length === 0 ? (
              <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs">
                No mentees currently assigned to your mentorship.
              </div>
            ) : (
              <select
                required
                value={docRequestForm.studentId}
                onChange={(e) => setDocRequestForm({ ...docRequestForm, studentId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold outline-none"
              >
                {mentees.map((m) => {
                  const sId = m.user?._id || m.user || m._id;
                  const sName = m.user?.name || 'Student';
                  const sReg = m.studentId || m.registerNo || 'ID';
                  return (
                    <option key={m._id} value={sId}>
                      {sName} ({sReg}) — Sem {m.semester || 1}
                    </option>
                  );
                })}
              </select>
            )}
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
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-semibold outline-none"
              >
                {DOCUMENT_CATEGORIES.filter((c) => c !== 'ALL').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
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
              disabled={submittingDocRequest || mentees.length === 0}
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
