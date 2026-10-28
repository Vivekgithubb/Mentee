import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  History,
  Building,
  GraduationCap
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const MentorAssignments = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, UNASSIGNED, ASSIGNED
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignmentsData = useCallback(async () => {
    try {
      setLoading(true);
      const [assignRes, mentorsRes] = await Promise.all([
        api.hod.getMentorAssignments({
          search,
          status: statusFilter,
          semester: semesterFilter,
          section: sectionFilter,
          department: currentUser?.role === 'ADMIN' && departmentFilter !== 'ALL' ? departmentFilter : undefined
        }),
        api.hod.getAvailableMentors(
          currentUser?.role === 'ADMIN' && departmentFilter !== 'ALL'
            ? { department: departmentFilter }
            : {}
        )
      ]);

      if (assignRes.success) {
        setAssignments(assignRes.assignments || []);
      }
      if (mentorsRes.success) {
        setAvailableMentors(mentorsRes.mentors || []);
        if (mentorsRes.mentors?.length > 0 && !selectedMentorId) {
          setSelectedMentorId(mentorsRes.mentors[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching mentor assignments:', err);
      addToast(err.message || 'Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, semesterFilter, sectionFilter, departmentFilter, currentUser, addToast, selectedMentorId]);

  useEffect(() => {
    fetchAssignmentsData();
  }, [fetchAssignmentsData]);

  const handleOpenAssignModal = (student) => {
    setSelectedStudent(student);
    setSelectedMentorId(student.mentor?._id || (availableMentors[0]?.id || ''));
    setAssignmentReason('');
    setShowAssignModal(true);
  };

  const handleOpenHistoryModal = (student) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
  };

  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedMentorId) return;

    setSubmitting(true);
    try {
      const res = await api.hod.assignMentor({
        studentProfileId: selectedStudent._id,
        studentUserId: selectedStudent.user?._id,
        mentorId: selectedMentorId,
        reason: assignmentReason
      });

      if (res.success) {
        addToast(`Mentor allocated successfully to ${selectedStudent.user?.name}!`);
        setShowAssignModal(false);
        setSelectedStudent(null);
        fetchAssignmentsData();
      }
    } catch (err) {
      addToast(err.message || 'Assignment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const unassignedCount = assignments.filter((a) => !a.mentor).length;
  const assignedCount = assignments.filter((a) => Boolean(a.mentor)).length;

  return (
    <DashboardShell>
      <TopBar title="HOD Mentor Allocation & Workload" onSearch={setSearch} />

      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-brand-gray uppercase">Total Enrolled Cohort</span>
              <div className="text-3xl font-bold text-brand-dark mt-1">{assignments.length}</div>
              <span className="text-[11px] text-brand-gray">Department Students</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-gray-light/60 flex items-center justify-center text-brand-dark">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-brand-gray uppercase">Unallocated Students</span>
              <div className="text-3xl font-bold text-brand-red mt-1">{unassignedCount}</div>
              <span className="text-[11px] text-brand-peach font-bold">Action Needed</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
              <UserX className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-brand-gray uppercase">Faculty Mentors</span>
              <div className="text-3xl font-bold text-brand-dark mt-1">{availableMentors.length}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{assignedCount} Mentees Active</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Mentor Workload Overview Strip */}
        <section className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-red" />
              Faculty Mentor Capacity & Current Workload
            </h3>
            <span className="text-xs text-brand-gray font-semibold">Max Cap: 25 Mentees/Mentor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableMentors.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/mentors/${m.id}`)}
                className="p-3.5 rounded-2xl bg-brand-surface border border-brand-gray-light/60 flex items-center justify-between gap-3 cursor-pointer hover:border-brand-dark transition-all"
                title="View Mentor 360° Profile"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`}
                    alt={m.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-gray-light shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-brand-dark leading-snug">{m.name}</h5>
                    <span className="text-[10px] text-brand-gray block">{m.designation || 'Faculty'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-brand-dark">{m.currentMenteeCount} / 25</span>
                  <span
                    className={`block text-[9px] font-bold uppercase ${
                      m.availability === 'AVAILABLE' ? 'text-emerald-600' : 'text-brand-red'
                    }`}
                  >
                    {m.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase text-brand-gray">Status:</span>
              {[
                { id: 'ALL', label: 'All Students' },
                { id: 'UNASSIGNED', label: `Unassigned (${unassignedCount})` },
                { id: 'ASSIGNED', label: `Assigned (${assignedCount})` }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    statusFilter === st.id
                      ? 'bg-brand-dark text-white'
                      : 'bg-brand-surface text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <div className="flex items-center gap-2 pl-2 border-l border-brand-gray-light/60">
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="p-1.5 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="p-1.5 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium"
                >
                  <option value="">All Sections</option>
                  {['A', 'B', 'C'].map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>

                {currentUser?.role === 'ADMIN' && (
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="p-1.5 rounded-xl border border-brand-red/30 bg-white text-xs font-bold text-brand-dark"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics)</option>
                    <option value="MECH">MECH (Mechanical)</option>
                  </select>
                )}

                {currentUser?.role === 'HOD' && (
                  <span className="text-[11px] font-bold text-brand-red bg-brand-red/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Dept: {currentUser?.department || 'CSE'}
                  </span>
                )}
              </div>
            </div>

            <span className="text-xs font-bold text-brand-gray">
              Showing {assignments.length} Records
            </span>
          </div>

          {/* Assignments Table */}
          {loading ? (
            <p className="text-xs text-brand-gray py-10 text-center">Loading student records and mentor relationships...</p>
          ) : assignments.length === 0 ? (
            <div className="p-10 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60">
              <p className="text-sm font-bold text-brand-dark">No students found matching current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-gray-light/80 text-brand-gray font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student ID / Roll</th>
                    <th className="py-3 px-4">Department & Class</th>
                    <th className="py-3 px-4">Current Mentor</th>
                    <th className="py-3 px-4">Allocation Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-light/40">
                  {assignments.map((std) => (
                    <tr key={std._id} className="hover:bg-brand-surface/70 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={std.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(std.user?.name || 'S')}`}
                          alt={std.user?.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-gray-light shrink-0"
                        />
                        <div>
                          <span className="font-bold text-sm text-brand-dark block">{std.user?.name}</span>
                          <span className="text-[11px] text-brand-gray">{std.user?.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-brand-dark">
                        {std.studentId}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-brand-dark">
                        {std.department} • Sem {std.semester} ({std.section})
                      </td>

                      <td className="py-3.5 px-4">
                        {std.mentor ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={std.mentor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(std.mentor.name)}`}
                              alt={std.mentor.name}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-gray-light"
                            />
                            <div>
                              <span className="font-bold text-brand-dark block">{std.mentor.name}</span>
                              <span className="text-[10px] text-brand-gray">{std.mentor.designation || 'Faculty'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-brand-red flex items-center gap-1">
                            <UserX className="w-3.5 h-3.5" /> Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {std.mentor ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            ALLOCATED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider animate-pulse">
                            UNASSIGNED
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-brand-gray">
                        {std.mentorAssignedAt ? new Date(std.mentorAssignedAt).toLocaleDateString() : 'Pending'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAssignModal(std)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                              std.mentor
                                ? 'bg-white border border-brand-gray-light hover:bg-brand-surface text-brand-dark'
                                : 'bg-brand-red text-white hover:bg-brand-red-hover'
                            }`}
                          >
                            {std.mentor ? 'Change Mentor' : 'Assign Mentor'}
                          </button>

                          {std.assignmentHistory?.length > 0 && (
                            <button
                              onClick={() => handleOpenHistoryModal(std)}
                              className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-gray-light text-brand-gray hover:text-brand-dark"
                              title="View Assignment History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ASSIGN / CHANGE MENTOR DIALOG */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          if (!submitting) setShowAssignModal(false);
        }}
        title={selectedStudent?.mentor ? `Reassign Mentor for ${selectedStudent?.user?.name}` : `Allocate Mentor for ${selectedStudent?.user?.name}`}
      >
        <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
          <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-gray-light flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-brand-dark">{selectedStudent?.user?.name}</p>
              <span className="text-brand-gray text-[11px]">
                {selectedStudent?.studentId} • {selectedStudent?.department} • Sem {selectedStudent?.semester}
              </span>
            </div>
            {selectedStudent?.mentor && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-brand-gray">Current Mentor</span>
                <p className="font-bold text-brand-dark">{selectedStudent.mentor.name}</p>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1.5">
              Select Faculty Mentor ({selectedStudent?.department || 'Department'})
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(() => {
                const sDept = (selectedStudent?.department || '').toLowerCase();
                const matchedMentors = availableMentors.filter((m) => {
                  if (!sDept) return true;
                  const mDept = (m.department || '').toLowerCase();
                  if (sDept.includes('cse') || sDept.includes('computer')) {
                    return mDept.includes('cse') || mDept.includes('computer');
                  }
                  if (sDept.includes('ece') || sDept.includes('electronics')) {
                    return mDept.includes('ece') || mDept.includes('electronics');
                  }
                  if (sDept.includes('mech') || sDept.includes('mechanical')) {
                    return mDept.includes('mech') || mDept.includes('mechanical');
                  }
                  return mDept.includes(sDept) || sDept.includes(mDept);
                });

                if (matchedMentors.length === 0) {
                  return (
                    <div className="p-4 text-center bg-brand-surface rounded-xl border border-brand-gray-light text-brand-gray">
                      <p className="font-semibold text-xs text-brand-dark">No mentors found for department "{selectedStudent?.department}".</p>
                      <p className="text-[11px] mt-1">Please register a faculty mentor with department "{selectedStudent?.department}".</p>
                    </div>
                  );
                }

                return matchedMentors.map((m) => (
                  <label
                    key={m.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedMentorId === m.id
                        ? 'border-brand-dark bg-brand-dark text-white'
                        : 'border-brand-gray-light/60 bg-brand-surface hover:border-brand-dark text-brand-dark'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="mentorSelection"
                        value={m.id}
                        checked={selectedMentorId === m.id}
                        onChange={() => setSelectedMentorId(m.id)}
                        className="hidden"
                      />
                      <img
                        src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`}
                        alt={m.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-xs">{m.name}</h5>
                        <span className={`text-[10px] ${selectedMentorId === m.id ? 'text-white/80' : 'text-brand-gray'}`}>
                          {m.designation} • {m.department}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold">{m.currentMenteeCount} / 25</span>
                      <span className={`block text-[9px] font-bold ${
                        selectedMentorId === m.id ? 'text-brand-peach' : m.availability === 'AVAILABLE' ? 'text-emerald-600' : 'text-brand-red'
                      }`}>
                        {m.availability}
                      </span>
                    </div>
                  </label>
                ));
              })()}
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Allocation Rationale / Remarks</label>
            <textarea
              rows="2"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="e.g. Regular semester workload allocation or research domain alignment..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white flex items-center gap-1.5"
            >
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGNMENT HISTORY DIALOG */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`Mentor Assignment History: ${selectedStudent?.user?.name}`}
      >
        <div className="space-y-4 text-xs">
          {selectedStudent?.assignmentHistory?.length === 0 ? (
            <p className="text-brand-gray text-center py-4">No prior reallocation records.</p>
          ) : (
            <div className="space-y-3">
              {selectedStudent?.assignmentHistory?.map((hist, idx) => (
                <div key={idx} className="p-3.5 bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-dark">
                      {hist.previousMentor ? `${hist.previousMentor.name} → ${hist.newMentor?.name}` : `Initial Allocation: ${hist.newMentor?.name}`}
                    </span>
                    <span className="text-[10px] text-brand-gray font-semibold">
                      {new Date(hist.date).toLocaleDateString()}
                    </span>
                  </div>
                  {hist.reason && <p className="text-brand-dark/80 italic text-[11px]">"{hist.reason}"</p>}
                  <p className="text-[10px] text-brand-gray">
                    Authorized by: <strong>{hist.assignedBy?.name || 'HOD'}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </DashboardShell>
  );
};
