import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  History,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Users,
  UserCheck,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api, getCachedData, setCachedData } from '../services/api';

const DEFAULT_SUBJECTS = [
  { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, internalMarks: 26, externalMarks: 64, totalMarks: 90, maxMarks: 100, grade: 'A+', gradePoints: 9, backlog: false, remarks: '' },
  { code: 'CS302', name: 'Database Management Systems', credits: 4, internalMarks: 25, externalMarks: 60, totalMarks: 85, maxMarks: 100, grade: 'A', gradePoints: 8, backlog: false, remarks: '' },
  { code: 'CS303', name: 'Computer Architecture & Org', credits: 3, internalMarks: 24, externalMarks: 58, totalMarks: 82, maxMarks: 100, grade: 'A', gradePoints: 8, backlog: false, remarks: '' },
  { code: 'CS304', name: 'Discrete Computational Math', credits: 3, internalMarks: 27, externalMarks: 63, totalMarks: 90, maxMarks: 100, grade: 'A+', gradePoints: 9, backlog: false, remarks: '' },
  { code: 'CS305L', name: 'DSA & Database Systems Lab', credits: 2, internalMarks: 48, externalMarks: 47, totalMarks: 95, maxMarks: 100, grade: 'O', gradePoints: 10, backlog: false, remarks: '' }
];

export const AcademicRecords = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const cacheKey = 'academic_records_' + (initialStudentId || 'me');
  const cachedAcademics = getCachedData(cacheKey);

  const [loading, setLoading] = useState(() => !cachedAcademics);
  const [records, setRecords] = useState(() => cachedAcademics?.records || []);
  const [summary, setSummary] = useState(() => cachedAcademics?.summary || { cgpa: 0, totalSemesters: 0, currentSemester: 1 });
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // Mentor Student Selector State
  const [mentees, setMentees] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [modalStudentId, setModalStudentId] = useState(initialStudentId);
  const [loadingMentees, setLoadingMentees] = useState(false);

  // Edit / Add Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(1);
  const [editingAcademicYear, setEditingAcademicYear] = useState('2023-2024');
  const [editingStatus, setEditingStatus] = useState('SUBMITTED');
  const [editingReason, setEditingReason] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);
  const [saving, setSaving] = useState(false);

  // Audit History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [selectedRecordTitle, setSelectedRecordTitle] = useState('');

  // Fetch mentor's assigned mentees
  useEffect(() => {
    if (currentUser?.role === 'MENTOR') {
      const fetchMentees = async () => {
        try {
          setLoadingMentees(true);
          const res = await api.mentor.getMentees();
          if (res.success) {
            const list = res.mentees || res.students || [];
            setMentees(list);
            const queryId = searchParams.get('studentId');
            if (queryId && list.some((m) => (m.user?._id || m.user || m._id) === queryId)) {
              setSelectedStudentId(queryId);
              setModalStudentId(queryId);
            } else if (list.length > 0 && !selectedStudentId) {
              const firstId = list[0].user?._id || list[0].user || list[0]._id;
              setSelectedStudentId(firstId);
              setModalStudentId(firstId);
            }
          }
        } catch (err) {
          console.error('Failed to load mentor mentees:', err);
        } finally {
          setLoadingMentees(false);
        }
      };
      fetchMentees();
    }
  }, [currentUser?.role]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setModalStudentId(studentId);
    setSearchParams({ studentId });
  };

  const loadRecords = useCallback(async () => {
    if (currentUser?.role === 'MENTOR' && !selectedStudentId) {
      setLoading(false);
      return;
    }
    const queryTarget = currentUser?.role === 'MENTOR' ? selectedStudentId : '';
    const activeCacheKey = 'academic_records_' + (queryTarget || 'me');
    if (!getCachedData(activeCacheKey)) {
      setLoading(true);
    }
    try {
      const res = await api.academics.getRecords(queryTarget);
      if (res.success) {
        setRecords(res.records || []);
        setSummary(res.summary || { cgpa: 0, totalSemesters: 0, currentSemester: 1 });
        setCachedData(activeCacheKey, res);
        // Auto-expand all semesters
        const exp = {};
        (res.records || []).forEach((r) => {
          exp[r.semester] = true;
        });
        setExpandedSemesters(exp);
      }
    } catch (err) {
      console.error('Error loading academic records:', err);
      addToast(err.message || 'Failed to load academic records', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.role, selectedStudentId, addToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const toggleExpand = (sem) => {
    setExpandedSemesters((prev) => ({ ...prev, [sem]: !prev[sem] }));
  };

  const handleOpenAddModal = () => {
    const nextSem = records.length > 0 ? records[records.length - 1].semester + 1 : 1;
    setEditingSemester(nextSem);
    setEditingAcademicYear('2023-2024');
    setEditingStatus('SUBMITTED');
    setEditingReason('');
    setModalStudentId(selectedStudentId);
    setSubjectsList(DEFAULT_SUBJECTS);
    setShowEditModal(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingSemester(rec.semester);
    setEditingAcademicYear(rec.academicYear || '2023-2024');
    setEditingStatus(rec.status || 'SUBMITTED');
    setEditingReason('');
    setModalStudentId(selectedStudentId);
    setSubjectsList(
      rec.subjects?.length > 0
        ? JSON.parse(JSON.stringify(rec.subjects))
        : DEFAULT_SUBJECTS
    );
    setShowEditModal(true);
  };

  const handleSubjectChange = (idx, field, value) => {
    const updated = [...subjectsList];
    updated[idx][field] = value;
    // Auto recalculate totalMarks
    if (field === 'internalMarks' || field === 'externalMarks') {
      const internal = Number(field === 'internalMarks' ? value : updated[idx].internalMarks) || 0;
      const external = Number(field === 'externalMarks' ? value : updated[idx].externalMarks) || 0;
      updated[idx].totalMarks = internal + external;
      // Auto grade points estimate
      const total = updated[idx].totalMarks;
      if (total >= 90) { updated[idx].grade = 'O'; updated[idx].gradePoints = 10; }
      else if (total >= 80) { updated[idx].grade = 'A+'; updated[idx].gradePoints = 9; }
      else if (total >= 70) { updated[idx].grade = 'A'; updated[idx].gradePoints = 8; }
      else if (total >= 60) { updated[idx].grade = 'B+'; updated[idx].gradePoints = 7; }
      else if (total >= 50) { updated[idx].grade = 'B'; updated[idx].gradePoints = 6; }
      else { updated[idx].grade = 'F'; updated[idx].gradePoints = 0; updated[idx].backlog = true; }
    }
    setSubjectsList(updated);
  };

  const handleAddSubjectRow = () => {
    setSubjectsList([
      ...subjectsList,
      {
        code: `CS30${subjectsList.length + 1}`,
        name: 'New Course Elective',
        credits: 3,
        internalMarks: 25,
        externalMarks: 60,
        totalMarks: 85,
        maxMarks: 100,
        grade: 'A',
        gradePoints: 8,
        backlog: false,
        remarks: ''
      }
    ]);
  };

  const handleRemoveSubjectRow = (idx) => {
    setSubjectsList(subjectsList.filter((_, i) => i !== idx));
  };

  // Live SGPA preview calculation
  const calculateLiveSgpa = () => {
    let qp = 0;
    let creds = 0;
    subjectsList.forEach((s) => {
      const c = Number(s.credits) || 0;
      const gp = Number(s.gradePoints) || 0;
      qp += gp * c;
      creds += c;
    });
    return creds > 0 ? (qp / creds).toFixed(2) : '0.00';
  };

  const handleSaveSemesterRecord = async (e) => {
    e.preventDefault();
    if (subjectsList.length === 0) {
      addToast('Please enter at least one subject for this semester', 'error');
      return;
    }

    const effectiveStudentId =
      currentUser?.role === 'MENTOR'
        ? (modalStudentId || selectedStudentId)
        : currentUser._id;

    if (currentUser?.role === 'MENTOR' && !effectiveStudentId) {
      addToast('Please select a student to update marks for', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        studentId: effectiveStudentId,
        semester: editingSemester,
        academicYear: editingAcademicYear,
        subjects: subjectsList,
        status: editingStatus,
        reason: editingReason
      };

      const res = await api.academics.saveRecord(payload);
      if (res.success) {
        addToast(`Semester ${editingSemester} academic marks saved successfully!`);
        setShowEditModal(false);
        if (currentUser?.role === 'MENTOR' && modalStudentId && modalStudentId !== selectedStudentId) {
          handleSelectStudent(modalStudentId);
        } else {
          loadRecords();
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to save academic records', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id, sem) => {
    if (!window.confirm(`Are you sure you want to delete Semester ${sem} records?`)) return;
    try {
      const res = await api.academics.deleteRecord(id);
      if (res.success) {
        addToast(`Semester ${sem} record removed`);
        loadRecords();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete record', 'error');
    }
  };

  const handleViewHistory = async (rec) => {
    setSelectedRecordTitle(`Semester ${rec.semester} Academic History`);
    try {
      const res = await api.academics.getHistory(rec._id);
      if (res.success) {
        setHistoryList(res.history || []);
        setShowHistoryModal(true);
      }
    } catch (err) {
      addToast('Failed to load audit history', 'error');
    }
  };

  const totalCreditsEarned = records.reduce((sum, r) => sum + (r.credits || 0), 0);
  const totalBacklogs = records.reduce(
    (sum, r) => sum + (r.subjects?.filter((s) => s.backlog)?.length || 0),
    0
  );

  const currentSelectedMentee = mentees.find(
    (m) => (m.user?._id || m.user || m._id) === selectedStudentId
  );

  return (
    <DashboardShell>
      <TopBar title="Semester-Wise Academic Records & SGPA" />

      <div className="space-y-6">
        {/* Mentor Student Selector Toolbar */}
        {currentUser?.role === 'MENTOR' && (
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-brand-gray-light/60 shadow-editorial space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                    Mentor Academic Governance
                  </span>
                </div>
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-red" />
                  Select Student to Update Semester Marks & SGPA
                </h3>
                <p className="text-xs text-brand-gray">
                  Choose an assigned mentee to review their academic history, update semester marksheets, and recalculate SGPA.
                </p>
              </div>

              {/* Student Selector Dropdown */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <label htmlFor="student-selector" className="sr-only">Select Mentee</label>
                  <select
                    id="student-selector"
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full appearance-none py-3 px-4 pr-10 rounded-2xl border-2 border-brand-dark/15 hover:border-brand-dark/40 focus:border-brand-dark bg-brand-surface font-bold text-xs text-brand-dark transition-all outline-none cursor-pointer shadow-sm"
                  >
                    {mentees.length === 0 ? (
                      <option value="">No assigned mentees found</option>
                    ) : (
                      mentees.map((m) => {
                        const mUserId = m.user?._id || m.user || m._id;
                        return (
                          <option key={m._id} value={mUserId}>
                            {m.user?.name || 'Student'} ({m.studentId}) — Sem {m.semester || 1}
                          </option>
                        );
                      })
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-brand-gray absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Selected Mentee Details Chip Strip */}
            {currentSelectedMentee && (
              <div className="pt-4 border-t border-brand-gray-light/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      currentSelectedMentee.user?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        currentSelectedMentee.user?.name || 'S'
                      )}`
                    }
                    alt={currentSelectedMentee.user?.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-brand-gray-light shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand-dark">
                        {currentSelectedMentee.user?.name}
                      </span>
                      <Badge
                        variant={
                          currentSelectedMentee.status === 'AT_RISK' ? 'danger' : 'success'
                        }
                      >
                        {currentSelectedMentee.status || 'ON_TRACK'}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-brand-gray">
                      USN: <strong className="text-brand-dark font-semibold">{currentSelectedMentee.studentId}</strong> • {currentSelectedMentee.department} • Batch {currentSelectedMentee.batch || '2023-2027'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-brand-gray block">
                      Attendance
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        (currentSelectedMentee.attendancePercentage || 0) < 75
                          ? 'text-brand-red'
                          : 'text-brand-dark'
                      }`}
                    >
                      {currentSelectedMentee.attendancePercentage || 0}%
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/students/${currentSelectedMentee._id}`)}
                    className="px-3.5 py-2 rounded-xl bg-brand-surface hover:bg-brand-gray-light/60 border border-brand-gray-light text-brand-dark font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>360° Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {mentees.length === 0 && !loadingMentees && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <strong>Notice:</strong> You currently have no assigned mentees. Contact your HOD to allocate students before editing academic marks.
              </div>
            )}
          </section>
        )}

        {/* KPI Strip: CGPA, Total Credits, Overall SGPA Aggregate */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Cumulative CGPA</span>
              <div className="text-3xl font-bold text-brand-dark mt-0.5">{summary.cgpa || '0.00'}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Credit-Weighted Aggregate</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Credits Earned</span>
              <div className="text-3xl font-bold text-brand-dark mt-0.5">{totalCreditsEarned}</div>
              <span className="text-[11px] text-brand-gray">Across Completed Semesters</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Semesters Recorded</span>
              <div className="text-3xl font-bold text-brand-dark mt-0.5">{records.length}</div>
              <span className="text-[11px] text-brand-gray">Chronological Roster</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Backlogs Standing</span>
              <div className={`text-3xl font-bold mt-0.5 ${totalBacklogs > 0 ? 'text-brand-red' : 'text-brand-dark'}`}>
                {totalBacklogs}
              </div>
              <span className="text-[11px] text-brand-gray">{totalBacklogs === 0 ? 'All Cleared' : 'Active Backlogs'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <button
              onClick={handleOpenAddModal}
              disabled={currentUser?.role === 'MENTOR' && mentees.length === 0}
              className="px-5 py-3 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>
                {currentUser?.role === 'MENTOR' && currentSelectedMentee
                  ? `Add Semester Marks for ${currentSelectedMentee.user?.name?.split(' ')[0] || 'Student'}`
                  : 'Add Semester Marks'}
              </span>
            </button>
          </div>
        </section>

        {/* Chronological Semester Cards */}
        {loading && records.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 h-32 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-brand-surface rounded-lg" />
                  <div className="h-3.5 w-48 bg-brand-surface rounded-full" />
                </div>
                <div className="h-8 w-24 bg-brand-surface rounded-xl" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-brand-gray-light/60 space-y-3">
            <BookOpen className="w-10 h-10 text-brand-gray mx-auto" />
            <h4 className="text-base font-bold text-brand-dark">
              {currentUser?.role === 'MENTOR' && currentSelectedMentee
                ? `No semester records submitted yet for ${currentSelectedMentee.user?.name}.`
                : 'No semester records submitted yet.'}
            </h4>
            <p className="text-xs text-brand-gray max-w-md mx-auto">
              Click "Add Semester Marks" above to enter internal marks, external marks, and subject credits to calculate SGPA.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {records.map((rec) => (
              <div
                key={rec._id}
                className="bg-white rounded-3xl border border-brand-gray-light/60 shadow-editorial overflow-hidden transition-all"
              >
                {/* Semester Header Card */}
                <div
                  onClick={() => toggleExpand(rec.semester)}
                  className="p-5 sm:p-6 bg-brand-surface/60 hover:bg-brand-surface flex items-center justify-between cursor-pointer border-b border-brand-gray-light/50 select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-dark text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      S{rec.semester}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-brand-dark">
                          Semester {rec.semester} Academic Results
                        </h4>
                        <Badge variant={rec.status === 'VERIFIED' ? 'dark' : 'peach'}>
                          {rec.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-brand-gray mt-0.5">
                        Academic Year: {rec.academicYear} • Total Credits: {rec.credits} • Last modified by {rec.lastModifiedBy?.name || 'User'} ({rec.lastModifiedRole})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-brand-gray">Semester SGPA</span>
                      <div className="text-2xl font-bold text-brand-red">{rec.sgpa}</div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-brand-gray">Aggregate Marks</span>
                      <div className="text-base font-bold text-brand-dark">{rec.totalMarks} / {rec.maxMarks} ({rec.percentage}%)</div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(rec)}
                        className="p-2 rounded-xl bg-white border border-brand-gray-light hover:bg-brand-surface text-brand-dark"
                        title="Edit Semester Marks"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {rec.auditHistory?.length > 0 && (
                        <button
                          onClick={() => handleViewHistory(rec)}
                          className="p-2 rounded-xl bg-white border border-brand-gray-light hover:bg-brand-surface text-brand-dark"
                          title="View Change History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRecord(rec._id, rec.semester)}
                        className="p-2 rounded-xl bg-white border border-brand-gray-light hover:bg-rose-50 text-brand-red"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-2 text-brand-gray">
                        {expandedSemesters[rec.semester] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Subjects Table */}
                {expandedSemesters[rec.semester] && (
                  <div className="p-5 sm:p-6 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-brand-gray-light/80 text-brand-gray font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Subject Code</th>
                          <th className="py-2.5 px-3">Subject Name</th>
                          <th className="py-2.5 px-3 text-center">Credits</th>
                          <th className="py-2.5 px-3 text-center">Internal (40)</th>
                          <th className="py-2.5 px-3 text-center">External (60)</th>
                          <th className="py-2.5 px-3 text-center">Total (100)</th>
                          <th className="py-2.5 px-3 text-center">Grade</th>
                          <th className="py-2.5 px-3 text-center">Grade Points</th>
                          <th className="py-2.5 px-3">Standing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gray-light/40">
                        {rec.subjects?.map((sub, sIdx) => (
                          <tr key={sIdx} className="hover:bg-brand-surface/60">
                            <td className="py-3 px-3 font-bold text-brand-dark">{sub.code}</td>
                            <td className="py-3 px-3 font-semibold text-brand-dark">{sub.name}</td>
                            <td className="py-3 px-3 text-center font-medium text-brand-dark">{sub.credits}</td>
                            <td className="py-3 px-3 text-center text-brand-gray">{sub.internalMarks}</td>
                            <td className="py-3 px-3 text-center text-brand-gray">{sub.externalMarks}</td>
                            <td className="py-3 px-3 text-center font-bold text-brand-dark">{sub.totalMarks}</td>
                            <td className="py-3 px-3 text-center font-bold text-brand-dark">
                              <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-gray-light/80 font-bold">
                                {sub.grade}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-brand-red">{sub.gradePoints}</td>
                            <td className="py-3 px-3">
                              {sub.backlog ? (
                                <span className="text-[10px] font-bold text-brand-red uppercase px-2 py-0.5 rounded-full bg-rose-50 border border-brand-red/30">
                                  Backlog
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                                  Passed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT / ADD SEMESTER MARKS MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          if (!saving) setShowEditModal(false);
        }}
        title={`Semester ${editingSemester} Academic Marksheet Entry${currentUser?.role === 'MENTOR' && currentSelectedMentee ? ` — ${currentSelectedMentee.user?.name}` : ''}`}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveSemesterRecord} className="space-y-4 text-xs">
          {/* Target Student Selector in Modal for Mentors */}
          {currentUser?.role === 'MENTOR' && (
            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-brand-red/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-brand-dark block text-xs">
                  Target Student for Marks & SGPA Update *
                </label>
                <span className="text-[10px] text-brand-red font-bold uppercase tracking-wider">
                  Mentor Authorization
                </span>
              </div>
              <select
                value={modalStudentId}
                onChange={(e) => setModalStudentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-white font-bold text-xs text-brand-dark outline-none cursor-pointer"
                required
              >
                {mentees.length === 0 ? (
                  <option value="">No assigned mentees available</option>
                ) : (
                  mentees.map((m) => {
                    const mUserId = m.user?._id || m.user || m._id;
                    return (
                      <option key={m._id} value={mUserId}>
                        {m.user?.name || 'Student'} ({m.studentId}) — Sem {m.semester || 1} • {m.department}
                      </option>
                    );
                  })
                )}
              </select>
              <p className="text-[11px] text-brand-gray">
                Selecting a student links this semester's course marks, grades, and SGPA calculation directly to their permanent record.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-brand-surface rounded-2xl border border-brand-gray-light">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Semester Number</label>
              <select
                value={editingSemester}
                onChange={(e) => setEditingSemester(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-brand-gray-light bg-white font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-brand-dark block mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={editingAcademicYear}
                onChange={(e) => setEditingAcademicYear(e.target.value)}
                placeholder="2023-2024"
                className="w-full p-2 rounded-xl border border-brand-gray-light bg-white font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-brand-dark block mb-1">Calculated SGPA Preview</label>
              <div className="text-2xl font-bold text-brand-red py-0.5">{calculateLiveSgpa()}</div>
            </div>
          </div>

          {/* Subjects Rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-dark">Subject Results & Marks</span>
              <button
                type="button"
                onClick={handleAddSubjectRow}
                className="px-3 py-1 rounded-full bg-brand-dark hover:bg-brand-red text-white text-[11px] font-bold"
              >
                + Add Course
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {subjectsList.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-brand-surface rounded-2xl border border-brand-gray-light grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-2">
                    <label className="text-[10px] text-brand-gray block font-bold">Code</label>
                    <input
                      type="text"
                      required
                      value={sub.code}
                      onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-brand-gray-light bg-white font-bold text-xs"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="text-[10px] text-brand-gray block font-bold">Course Title</label>
                    <input
                      type="text"
                      required
                      value={sub.name}
                      onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-brand-gray-light bg-white font-medium text-xs"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] text-brand-gray block font-bold">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      required
                      value={sub.credits}
                      onChange={(e) => handleSubjectChange(idx, 'credits', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-brand-gray-light bg-white font-medium text-xs text-center"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] text-brand-gray block font-bold">Internal</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={sub.internalMarks}
                      onChange={(e) => handleSubjectChange(idx, 'internalMarks', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-brand-gray-light bg-white font-medium text-xs text-center"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] text-brand-gray block font-bold">External</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={sub.externalMarks}
                      onChange={(e) => handleSubjectChange(idx, 'externalMarks', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-brand-gray-light bg-white font-medium text-xs text-center"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <label className="text-[10px] text-brand-gray block font-bold">Total</label>
                    <span className="font-bold text-brand-dark block py-1">{sub.totalMarks}</span>
                  </div>

                  <div className="col-span-1 text-center">
                    <label className="text-[10px] text-brand-gray block font-bold">Grade</label>
                    <span className="font-bold text-brand-red block py-1">{sub.grade}</span>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSubjectRow(idx)}
                      className="p-1 rounded-lg text-brand-gray hover:text-brand-red"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Audit Revision Reason (Optional)</label>
            <input
              type="text"
              value={editingReason}
              onChange={(e) => setEditingReason(e.target.value)}
              placeholder="e.g. Added revaluation marks or initial semester grade card submission..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Calculate SGPA'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* AUDIT HISTORY MODAL */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={selectedRecordTitle}
      >
        <div className="space-y-4 text-xs">
          {historyList.length === 0 ? (
            <p className="text-brand-gray text-center py-4">No audit history records found.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {historyList.map((h, i) => (
                <div key={i} className="p-3.5 bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-dark">
                      Action: {h.action} by {h.modifiedBy?.name || 'User'} ({h.role})
                    </span>
                    <span className="text-[10px] text-brand-gray font-semibold">
                      {new Date(h.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {h.reason && <p className="text-brand-dark/80 italic text-[11px]">"{h.reason}"</p>}
                  {h.newValues && (
                    <p className="text-[10px] text-brand-gray">
                      Result: SGPA {h.newValues.sgpa} ({h.newValues.subjectsCount} courses)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </DashboardShell>
  );
};
