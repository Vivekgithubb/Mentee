import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowUpRight,
  User,
  Mail,
  Building,
  FileText,
  AlertCircle,
  Briefcase,
  FileCheck,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { MetricCard } from '../components/common/MetricCard';
import { FeatureCard } from '../components/common/FeatureCard';
import { BarChartWidget } from '../components/common/BarChartWidget';
import { DotMatrixChart } from '../components/common/DotMatrixChart';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api, getCachedData } from '../services/api';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(() => getCachedData('student_dashboard_summary_me') || null);
  const [loading, setLoading] = useState(() => !getCachedData('student_dashboard_summary_me'));

  // Upload modal for document requests
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Assignment submission modal
  const [showSubmitAssignmentModal, setShowSubmitAssignmentModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Task update modal
  const [showTaskProgressModal, setShowTaskProgressModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskStatus, setTaskStatus] = useState('IN_PROGRESS');

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!getCachedData('student_dashboard_summary_me')) {
        setLoading(true);
      }
      const res = await api.students.getDashboardSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn('Dashboard summary error:', err);
      addToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle uploading document against mentor request
  const handleDocUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !activeRequest) {
      addToast('Please select a file to submit', 'error');
      return;
    }

    if (uploadFile.size > 15 * 1024 * 1024) {
      addToast('File exceeds 15MB limit', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('displayName', activeRequest.title);
      formData.append('documentType', activeRequest.documentType);
      formData.append('description', uploadNotes || `Submission for ${activeRequest.title}`);

      const res = await api.documentRequests.uploadAgainstRequest(activeRequest._id, formData);
      if (res.success) {
        addToast(`Document for "${activeRequest.title}" submitted to mentor for review!`);
        setShowDocUploadModal(false);
        setActiveRequest(null);
        setUploadFile(null);
        setUploadNotes('');
        // Instant data refresh without manual page reload
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle assignment completion / submission
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;

    try {
      const res = await api.assignments.update(activeAssignment._id, {
        submissionNotes,
        status: 'SUBMITTED'
      });
      if (res.success) {
        addToast('Assignment submitted successfully!');
        setShowSubmitAssignmentModal(false);
        setActiveAssignment(null);
        setSubmissionNotes('');
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Error submitting assignment', 'error');
    }
  };

  // Handle task progress update
  const handleTaskProgressUpdate = async (e) => {
    e.preventDefault();
    if (!activeTask) return;

    try {
      const res = await api.tasks.update(activeTask._id, {
        progress: Number(taskProgress),
        status: Number(taskProgress) === 100 ? 'COMPLETED' : taskStatus
      });
      if (res.success) {
        addToast('Mentoring task progress updated!');
        setShowTaskProgressModal(false);
        setActiveTask(null);
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Error updating task', 'error');
    }
  };

  const metrics = data?.metrics || {
    currentSemester: 1,
    currentCGPA: 0.0,
    currentSGPA: 0.0,
    averageMarks: 0.0,
    attendancePercentage: 0,
    certificationsCount: 0,
    projectsCount: 0,
    internshipsCount: 0,
    publicationsCount: 0,
    achievementsCount: 0,
    pendingAssignmentsCount: 0,
    completedAssignmentsCount: 0,
    overdueAssignmentsCount: 0,
    upcomingAssignmentsCount: 0,
    pendingMentorTasksCount: 0,
    outstandingDocumentRequestsCount: 0,
    profileCompletion: 30
  };

  const mentor = data?.assignedMentor;
  const assignments = data?.assignments || [];
  const tasks = data?.tasks || [];
  const documentRequests = data?.documentRequests || [];
  const academicRecords = data?.academicRecords || [];
  const recentActivity = data?.recentActivity || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];

  // Prepare semester SGPA bar chart data
  const chartData = academicRecords.length > 0
    ? academicRecords.map((rec, i) => ({
        label: `Sem ${rec.semester}`,
        value: rec.sgpa,
        height: `${Math.min(100, (rec.sgpa / 10) * 100)}%`,
        highlight: i === academicRecords.length - 1
      }))
    : [
        { label: 'Sem 1', value: metrics.currentSGPA || 8.4, height: '84%', highlight: true }
      ];

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue && status !== 'APPROVED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-red text-white uppercase tracking-wider animate-pulse">
          OVERDUE
        </span>
      );
    }
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">APPROVED</span>;
      case 'UNDER REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">UNDER REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">REJECTED</span>;
      case 'UPLOADED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">UPLOADED</span>;
      case 'PENDING':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-800 uppercase tracking-wider">PENDING</span>;
    }
  };

  // If initial load and no cached data is available yet, render an elegant skeleton UI instead of dummy defaults
  if (loading && !data) {
    return (
      <DashboardShell>
        <TopBar title="Student Development Dashboard" />
        <div className="space-y-6 animate-pulse">
          {/* Top 4 Metrics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 h-44 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="h-3.5 w-28 bg-brand-surface rounded-full" />
                  <div className="h-8 w-24 bg-brand-surface rounded-xl" />
                </div>
                <div className="h-4 w-full bg-brand-surface rounded-full" />
              </div>
            ))}
          </div>

          {/* Assigned Faculty Mentor Card Skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 h-36 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-44 bg-brand-surface rounded-lg" />
              <div className="h-3.5 w-64 bg-brand-surface rounded-full" />
            </div>
          </div>

          {/* Grid sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 h-72 space-y-4">
              <div className="h-4 w-40 bg-brand-surface rounded-full" />
              <div className="h-48 w-full bg-brand-surface rounded-2xl" />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 h-72 space-y-4">
              <div className="h-4 w-40 bg-brand-surface rounded-full" />
              <div className="h-48 w-full bg-brand-surface rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <TopBar title="Student Development Dashboard" />

      {/* SECTION E: HIGH PRIORITY BANNER - DOCUMENTS REQUESTED BY YOUR MENTOR */}
      {documentRequests.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-red/30 shadow-editorial relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -mr-10 -mt-10 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-brand-red animate-ping" />
                <h2 className="text-xl font-bold tracking-tight text-brand-dark uppercase">
                  Documents Requested by Your Mentor
                </h2>
              </div>
              <p className="text-xs text-brand-gray">
                Official documents requiring your immediate upload for academic verification and compliance audits.
              </p>
            </div>

            <button
              onClick={() => navigate('/documents')}
              className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Documents Vault</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentRequests.map((req) => (
              <div
                key={req._id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  req.isOverdue
                    ? 'bg-rose-50/70 border-brand-red/40 shadow-sm'
                    : req.priority === 'URGENT'
                    ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                    : 'bg-brand-surface border-brand-gray-light/80 hover:border-brand-dark'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-brand-dark leading-snug">{req.title}</h3>
                    {getStatusBadge(req.status, req.isOverdue)}
                  </div>

                  <p className="text-xs font-semibold text-brand-gray">
                    Category: <span className="text-brand-dark">{req.documentType}</span>
                  </p>

                  {req.description && (
                    <p className="text-xs text-brand-dark/90 bg-white/90 p-2.5 rounded-xl border border-brand-gray-light/40">
                      "{req.description}"
                    </p>
                  )}

                  <div className="text-[11px] text-brand-gray space-y-1 pt-1">
                    <div>Requested by: <strong className="text-brand-dark">{req.mentor?.name || 'Faculty Mentor'}</strong></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-dark">Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                      <span className="uppercase font-bold text-[10px] text-brand-peach">Priority: {req.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-brand-gray-light/60 flex items-center justify-between">
                  {['PENDING', 'REJECTED'].includes(req.status) ? (
                    <button
                      onClick={() => {
                        setActiveRequest(req);
                        setShowDocUploadModal(true);
                      }}
                      className="w-full py-2 px-4 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{req.status === 'REJECTED' ? 'Resubmit Corrected Document' : 'Upload Requested Document'}</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-brand-gray">
                      <span className="font-medium">
                        {req.status === 'APPROVED' ? 'Document verified and approved' : 'Submitted & waiting for review'}
                      </span>
                      <button
                        onClick={() => navigate('/documents')}
                        className="text-xs font-bold text-brand-dark hover:underline"
                      >
                        Inspect →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION A: ACADEMIC OVERVIEW & DISTINCT PRIMARY KPIS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5" aria-label="Academic Overview">
        {/* Semester-wise Academic Performance Chart */}
        <div className="md:col-span-5">
          <MetricCard
            title="Semester-Wise Academic SGPA"
            mainValue={metrics.currentSGPA ? metrics.currentSGPA.toString() : '8.40'}
            subValue={`/ Current Semester ${metrics.currentSemester || 'Incomplete'}`}
            className="h-full"
          >
            <BarChartWidget data={chartData} />
            <div className="mt-3 pt-3 border-t border-brand-gray-light/60 flex items-center justify-between text-xs">
              <span className="text-brand-gray font-medium">
                Avg Marks: <strong className="text-brand-dark">{metrics.averageMarks}%</strong>
              </span>
              <span className="text-brand-gray font-medium">
                Cumulative CGPA: <strong className="text-brand-red font-bold">{metrics.currentCGPA}</strong>
              </span>
            </div>
            <div className="mt-2 text-right">
              <button
                onClick={() => navigate('/academic-records')}
                className="text-xs font-bold text-brand-red hover:underline inline-flex items-center gap-1"
              >
                <span>Maintain Semester Records</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </MetricCard>
        </div>

        {/* Overall Attendance Percentage */}
        <div className="md:col-span-4">
          <MetricCard
            title="Institutional Attendance Compliance"
            className="h-full"
          >
            <div className="flex items-end justify-between gap-4 mt-2">
              <div>
                <div className={`text-4xl font-bold tracking-tight leading-none mb-1 ${
                  metrics.attendancePercentage < 75 ? 'text-brand-red' : 'text-brand-dark'
                }`}>
                  {metrics.attendancePercentage}%
                </div>
                <span className={`text-xs font-semibold ${
                  metrics.attendancePercentage < 75 ? 'text-brand-red' : 'text-emerald-600'
                }`}>
                  {metrics.attendancePercentage < 75 ? '⚠️ Below 75% Requirement' : '✓ Good Attendance Standing'}
                </span>
              </div>
              <DotMatrixChart
                totalDots={36}
                crimsonCount={metrics.attendancePercentage < 75 ? 14 : 6}
                tooltipPrefix="Lecture Hours"
              />
            </div>
            <div className="mt-4 pt-3 border-t border-brand-gray-light/60 text-xs text-brand-gray flex justify-between">
              <span>Profile Completion</span>
              <strong className="text-brand-dark">{metrics.profileCompletion}% Complete</strong>
            </div>
          </MetricCard>
        </div>

        {/* Action Pills: Academic Quick Stats */}
        <div className="md:col-span-3 flex flex-col justify-between gap-4">
          {/* Pill 1: Pending Tasks & Assignments */}
          <div
            onClick={() => navigate('/academics')}
            className="bg-brand-dark text-white rounded-3xl p-5 px-6 flex items-center justify-between cursor-pointer hover:bg-brand-dark-surface shadow-dark-float hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-[#B4B9C2] block">
                Pending Assignments & Tasks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-white">
                  {metrics.pendingAssignmentsCount + metrics.pendingMentorTasksCount}
                </span>
                <span className="text-[11px] text-brand-peach">
                  ({metrics.pendingAssignmentsCount} Academic, {metrics.pendingMentorTasksCount} Mentor)
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white text-brand-dark flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-brand-dark" />
            </div>
          </div>

          {/* Pill 2: Portfolio Counts (Certifications, Projects, Internships) */}
          <div
            onClick={() => navigate('/profile')}
            className="bg-white text-brand-dark rounded-3xl p-5 px-6 border border-brand-gray-light/70 flex items-center justify-between cursor-pointer shadow-editorial hover:shadow-editorial-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-brand-gray block">
                Portfolio Achievements
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-brand-dark">
                  {metrics.certificationsCount + metrics.projectsCount + metrics.internshipsCount}
                </span>
                <span className="text-[11px] text-brand-gray">
                  ({metrics.projectsCount} Proj • {metrics.certificationsCount} Cert • {metrics.internshipsCount} Intern)
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: ASSIGNED MENTOR INFORMATION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand-red" />
            <h3 className="text-lg font-bold text-brand-dark">Assigned Faculty Mentor</h3>
          </div>
          <button
            onClick={() => navigate('/meetings')}
            className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1"
          >
            Schedule Mentoring Session →
          </button>
        </div>

        {mentor ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-brand-surface border border-brand-gray-light/70">
            {/* Mentor Profile */}
            <div className="md:col-span-5 flex items-center gap-4">
              <img
                src={mentor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mentor.name)}`}
                alt={mentor.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-gray-light shrink-0"
              />
              <div>
                <h4 className="text-base font-bold text-brand-dark">{mentor.name}</h4>
                <p className="text-xs font-medium text-brand-gray">{mentor.designation || 'Faculty Mentor'}</p>
                <p className="text-xs text-brand-dark mt-0.5">{mentor.department || 'Computer Science'}</p>
                {mentor.email && (
                  <p className="text-[11px] text-brand-gray flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" /> {mentor.email}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Metrics / Next Mentoring Milestone */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-brand-gray-light/50">
                <span className="text-brand-gray block text-[10px] font-bold uppercase">Assigned Tasks</span>
                <span className="text-lg font-bold text-brand-dark">{tasks.length} Total</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-brand-gray-light/50">
                <span className="text-brand-gray block text-[10px] font-bold uppercase">Requested Docs</span>
                <span className="text-lg font-bold text-brand-red">{documentRequests.length} Issued</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-brand-gray-light/50 col-span-2 sm:col-span-1">
                <span className="text-brand-gray block text-[10px] font-bold uppercase">Next Review</span>
                <span className="text-xs font-bold text-brand-dark">Quarterly Audit</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-2">
            <AlertCircle className="w-8 h-8 text-brand-peach mx-auto" />
            <h4 className="text-sm font-bold text-brand-dark">No Faculty Mentor Assigned Yet</h4>
            <p className="text-xs text-brand-gray max-w-md mx-auto">
              Your department HOD or Administrator has not yet allocated a mentor to your profile. Please check with your department coordinator.
            </p>
          </div>
        )}
      </section>

      {/* SECTION C & D: ACADEMIC ASSIGNMENTS & MENTOR TASKS (SEPARATE COLUMNS) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Column C: Academic Assignments */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-dark" />
                Academic Course Assignments
              </h3>
              <p className="text-xs text-brand-gray">Formal coursework submissions and lab tasks</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="px-2 py-0.5 rounded-full bg-brand-surface text-brand-gray">
                {metrics.pendingAssignmentsCount} Pending
              </span>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60">
              <p className="text-xs font-bold text-brand-dark">No course assignments assigned yet.</p>
              <p className="text-[11px] text-brand-gray mt-1">Course faculty will post assignments here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((asg) => (
                <div
                  key={asg._id}
                  className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/70 flex flex-col justify-between gap-3 hover:border-brand-dark transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-brand-dark">{asg.title}</h4>
                      <span className="text-xs text-brand-red font-medium">{asg.subject}</span>
                    </div>
                    <Badge variant={asg.status === 'COMPLETED' ? 'dark' : asg.isOverdue ? 'red' : 'peach'}>
                      {asg.isOverdue && asg.status !== 'COMPLETED' ? 'OVERDUE' : asg.status}
                    </Badge>
                  </div>

                  {asg.description && (
                    <p className="text-xs text-brand-dark/80">{asg.description}</p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-brand-gray pt-2 border-t border-brand-gray-light/50">
                    <span>Due Date: <strong className="text-brand-dark">{new Date(asg.dueDate).toLocaleDateString()}</strong></span>
                    {asg.status !== 'COMPLETED' && asg.status !== 'SUBMITTED' ? (
                      <button
                        onClick={() => {
                          setActiveAssignment(asg);
                          setShowSubmitAssignmentModal(true);
                        }}
                        className="text-xs font-bold text-brand-dark hover:text-brand-red underline"
                      >
                        Submit Work →
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column D: Mentor-Assigned Tasks */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-peach" />
                Mentor Development Tasks
              </h3>
              <p className="text-xs text-brand-gray">Personalized developmental targets set by your mentor</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-brand-peach/20 text-brand-dark text-xs font-bold">
              {metrics.pendingMentorTasksCount} Active
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60">
              <p className="text-xs font-bold text-brand-dark">No mentor tasks logged.</p>
              <p className="text-[11px] text-brand-gray mt-1">Your mentor can assign skill benchmarks and goals.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((tsk) => (
                <div
                  key={tsk._id}
                  className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/70 flex flex-col justify-between gap-3 hover:border-brand-dark transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-brand-dark">{tsk.title}</h4>
                      <span className="text-[11px] font-bold uppercase text-brand-peach">Priority: {tsk.priority}</span>
                    </div>
                    <Badge variant={tsk.status === 'COMPLETED' ? 'dark' : 'red'}>
                      {tsk.status}
                    </Badge>
                  </div>

                  {tsk.description && (
                    <p className="text-xs text-brand-dark/80">{tsk.description}</p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-brand-gray">
                      <span>Progress</span>
                      <span>{tsk.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-brand-gray-light overflow-hidden">
                      <div
                        className="h-full bg-brand-dark rounded-full transition-all"
                        style={{ width: `${tsk.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-brand-gray pt-2 border-t border-brand-gray-light/50">
                    <span>Deadline: <strong className="text-brand-dark">{tsk.dueDate ? new Date(tsk.dueDate).toLocaleDateString() : 'Ongoing'}</strong></span>
                    <button
                      onClick={() => {
                        setActiveTask(tsk);
                        setTaskProgress(tsk.progress || 0);
                        setTaskStatus(tsk.status || 'IN_PROGRESS');
                        setShowTaskProgressModal(true);
                      }}
                      className="text-xs font-bold text-brand-dark hover:text-brand-red underline"
                    >
                      Update Progress →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION F: RECENT ACTIVITY & UPCOMING DEADLINES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Activity Timeline */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-dark">Recent Academic & Mentoring Activity</h3>
            <span className="text-xs font-bold text-brand-gray">Live Feed</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-brand-gray py-6 text-center">No recent activities recorded yet.</p>
          ) : (
            <div className="divide-y divide-brand-gray-light/40">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-surface border border-brand-gray-light flex items-center justify-center text-brand-dark shrink-0">
                      {act.type === 'upload' ? <FileText className="w-4 h-4 text-brand-red" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-dark">{act.title}</p>
                      <span className="text-[10px] text-brand-gray">{act.category} • {new Date(act.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (act.type === 'upload') navigate('/documents');
                      else navigate('/profile');
                    }}
                    className="text-xs font-bold text-brand-red hover:underline shrink-0"
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="lg:col-span-5 bg-brand-dark text-white rounded-3xl p-6 sm:p-8 shadow-editorial space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-peach" />
              <h3 className="text-lg font-bold text-white">Upcoming Deadlines</h3>
            </div>
            <span className="text-xs font-bold text-[#979CA6]">
              {upcomingDeadlines.length} Targets
            </span>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-[#979CA6] py-6 text-center">No upcoming deadlines logged.</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 4).map((dl, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-brand-dark-surface/80 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{dl.title}</h4>
                    <span className="text-[10px] text-brand-peach">{dl.type}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold ${dl.isOverdue ? 'text-brand-red' : 'text-white'}`}>
                      {new Date(dl.dueDate).toLocaleDateString()}
                    </span>
                    <span className="block text-[10px] text-[#979CA6]">
                      {dl.isOverdue ? 'Overdue' : 'Due Soon'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL 1: Direct Document Upload for Mentor Request */}
      <Modal
        isOpen={showDocUploadModal}
        onClose={() => {
          if (!isUploading) setShowDocUploadModal(false);
        }}
        title={`Upload for Request: ${activeRequest?.title}`}
      >
        <form onSubmit={handleDocUploadSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-brand-surface rounded-xl border border-brand-gray-light">
            <p className="text-brand-dark font-semibold">Requested Document: {activeRequest?.documentType}</p>
            <p className="text-brand-gray text-[11px] mt-0.5">Due: {activeRequest && new Date(activeRequest.dueDate).toLocaleDateString()}</p>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Choose File (PDF, PNG, JPG, DOCX - max 15MB)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-dark file:text-white hover:file:bg-brand-red cursor-pointer"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Submission Notes (Optional)</label>
            <textarea
              rows="3"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              placeholder="Provide context or notes to your faculty mentor..."
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setShowDocUploadModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white flex items-center gap-2"
            >
              {isUploading ? 'Uploading to Vault...' : 'Submit to Mentor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Submit Academic Assignment */}
      <Modal
        isOpen={showSubmitAssignmentModal}
        onClose={() => setShowSubmitAssignmentModal(false)}
        title={`Submit: ${activeAssignment?.title}`}
      >
        <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Submission Notes / Link to Repository</label>
            <textarea
              rows="4"
              required
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Paste your submission notes, repository links, or completion details..."
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowSubmitAssignmentModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-dark text-white"
            >
              Mark Submitted
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Update Mentor Task Progress */}
      <Modal
        isOpen={showTaskProgressModal}
        onClose={() => setShowTaskProgressModal(false)}
        title={`Update Task: ${activeTask?.title}`}
      >
        <form onSubmit={handleTaskProgressUpdate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">
              Task Progress: {taskProgress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={taskProgress}
              onChange={(e) => setTaskProgress(e.target.value)}
              className="w-full accent-brand-dark cursor-pointer"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Current Status</label>
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-bold"
            >
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowTaskProgressModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-dark text-white"
            >
              Save Progress
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
};
