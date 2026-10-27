import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Video,
  User,
  CheckCircle2,
  XCircle,
  Edit2,
  CalendarCheck,
  AlertCircle,
  FileText,
  Filter,
  CheckSquare
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const PURPOSE_OPTIONS = [
  'Academic Performance Review',
  'Attendance & Punctuality Counseling',
  'Career & Placement Roadmap',
  'Document & Marks Verification',
  'Project / Capstone Mentorship',
  'Personal Well-being & Guidance'
];

export const MeetingsSchedule = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [meetings, setMeetings] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Schedule Form State
  const [form, setForm] = useState({
    studentId: '',
    title: '',
    purpose: PURPOSE_OPTIONS[0],
    agenda: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    duration: 45,
    type: 'IN_PERSON',
    venue: 'Faculty Office 304',
    meetingUrl: '',
    preparationInstructions: ''
  });

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    venue: '',
    meetingUrl: ''
  });

  // Complete Form State (Discussion Notes & Action Items)
  const [completeData, setCompleteData] = useState({
    discussionPoints: '',
    studentConcerns: '',
    mentorObservations: '',
    actionItems: '',
    followUpDate: ''
  });

  const isMentor = currentUser?.role === 'MENTOR';

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.meetings.getAll();
      if (res.success) {
        setMeetings(res.meetings || []);
      }
    } catch (err) {
      console.warn('Error fetching meetings:', err);
      addToast(err.message || 'Error loading meetings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchMentees = useCallback(async () => {
    if (!isMentor) return;
    try {
      const res = await api.mentor.getMentees();
      if (res.success) {
        const list = res.mentees || res.students || [];
        setMentees(list);
        if (list.length > 0) {
          // StudentProfile objects: user is populated; use user._id as the studentId
          // because the backend resolves via StudentProfile.user field
          const firstStudentId = list[0].user?._id || list[0].user;
          setForm((prev) => ({ ...prev, studentId: firstStudentId }));
        }
      }
    } catch (err) {
      console.error('Error fetching mentees for scheduling:', err);
    }
  }, [isMentor]);

  useEffect(() => {
    fetchMeetings();
    fetchMentees();
  }, [fetchMeetings, fetchMentees]);

  // Handle Create Appointment
  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      addToast('Please enter meeting title and date', 'error');
      return;
    }

    if (isMentor && !form.studentId) {
      addToast('Please select an assigned mentee', 'error');
      return;
    }

    try {
      const res = await api.meetings.schedule({
        ...form,
        duration: Number(form.duration)
      });
      if (res.success) {
        addToast(`Appointment "${res.meeting.title}" scheduled successfully!`);
        setShowScheduleModal(false);
        const firstStudentId = mentees[0]?.user?._id || mentees[0]?.user || '';
        setForm({
          studentId: firstStudentId,
          title: '',
          purpose: PURPOSE_OPTIONS[0],
          agenda: '',
          date: '',
          startTime: '10:00 AM',
          endTime: '10:45 AM',
          duration: 45,
          type: 'IN_PERSON',
          venue: 'Faculty Office 304',
          meetingUrl: '',
          preparationInstructions: ''
        });
        fetchMeetings();
      }
    } catch (err) {
      addToast(err.message || 'Error scheduling appointment', 'error');
    }
  };

  // Handle Reschedule
  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedMeeting || !rescheduleData.date) return;

    try {
      const res = await api.meetings.update(selectedMeeting._id, rescheduleData);
      if (res.success) {
        addToast('Meeting rescheduled and mentee notified!');
        setShowRescheduleModal(false);
        setSelectedMeeting(null);
        fetchMeetings();
      }
    } catch (err) {
      addToast(err.message || 'Error rescheduling appointment', 'error');
    }
  };

  // Handle Cancel
  const handleCancelConfirm = async () => {
    if (!selectedMeeting) return;
    try {
      const res = await api.meetings.cancel(selectedMeeting._id);
      if (res.success) {
        addToast('Appointment cancelled.');
        setShowCancelModal(false);
        setSelectedMeeting(null);
        fetchMeetings();
      }
    } catch (err) {
      addToast(err.message || 'Error cancelling appointment', 'error');
    }
  };

  // Handle Complete Meeting (Save Notes)
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    try {
      const res = await api.meetings.complete(selectedMeeting._id, completeData);
      if (res.success) {
        addToast('Meeting marked completed. Discussion notes recorded in 360 profile!');
        setShowCompleteModal(false);
        setSelectedMeeting(null);
        setCompleteData({
          discussionPoints: '',
          studentConcerns: '',
          mentorObservations: '',
          actionItems: '',
          followUpDate: ''
        });
        fetchMeetings();
      }
    } catch (err) {
      addToast(err.message || 'Error saving meeting conclusions', 'error');
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (filterStatus === 'ALL') return true;
    return m.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-600 uppercase tracking-wider line-through">CANCELLED</span>;
      case 'RESCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">RESCHEDULED</span>;
      case 'SCHEDULED':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-red text-white uppercase tracking-wider animate-pulse">SCHEDULED</span>;
    }
  };

  return (
    <DashboardShell>
      <TopBar title="Mentoring Sessions & Appointments" />

      <div className="space-y-6">
        {/* Header & Scheduling Quick Action */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
              <h2 className="text-xl font-bold tracking-tight text-brand-dark">
                {isMentor ? 'Faculty Mentoring Appointments' : 'My Mentoring Sessions'}
              </h2>
            </div>
            <p className="text-xs text-brand-gray max-w-xl">
              {isMentor
                ? 'Book one-on-one advising sessions with assigned mentees, set agendas, review academic roadmaps, and preserve persistent post-meeting discussion records.'
                : 'View upcoming guidance appointments with your assigned faculty mentor, access conference links, and review discussion action items.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isMentor && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-5 py-3 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Appointment</span>
              </button>
            )}
          </div>
        </section>

        {/* Sessions Filter Toolbar */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-brand-gray shrink-0">Filter:</span>
              {['ALL', 'SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-brand-dark text-white'
                      : 'bg-brand-surface text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  {st === 'ALL' ? 'All Sessions' : st}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-brand-gray">
              {filteredMeetings.length} Sessions Found
            </span>
          </div>

          {/* Sessions List */}
          {loading ? (
            <p className="text-xs text-brand-gray py-8 text-center">Loading appointments from database...</p>
          ) : filteredMeetings.length === 0 ? (
            <div className="p-10 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-2">
              <Calendar className="w-10 h-10 text-brand-gray mx-auto" />
              <p className="text-sm font-bold text-brand-dark">No mentoring sessions found.</p>
              <p className="text-xs text-brand-gray">
                {isMentor ? 'Click "Schedule Appointment" to book your first session.' : 'No sessions scheduled by your mentor currently.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((m) => (
                <div
                  key={m._id}
                  className="p-5 sm:p-6 rounded-2xl bg-brand-surface border border-brand-gray-light/80 hover:border-brand-dark transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-brand-dark">{m.title}</h4>
                      {getStatusBadge(m.status)}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-brand-gray border border-brand-gray-light/60">
                        {m.purpose}
                      </span>
                    </div>

                    <p className="text-xs text-brand-dark font-medium">
                      {isMentor ? (
                        <span>Student: <strong className="text-brand-red">{m.student?.name || 'Assigned Mentee'}</strong> ({m.student?.studentId || 'N/A'})</span>
                      ) : (
                        <span>Faculty Mentor: <strong className="text-brand-dark">{m.mentor?.name || 'Assigned Mentor'}</strong></span>
                      )}
                    </p>

                    {m.agenda && (
                      <p className="text-xs text-brand-dark/80 bg-white p-2.5 rounded-xl border border-brand-gray-light/40">
                        <strong>Agenda:</strong> {m.agenda}
                      </p>
                    )}

                    {m.preparationInstructions && (
                      <p className="text-xs text-brand-gray italic">
                        Prep: {m.preparationInstructions}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pt-2 text-xs text-brand-gray flex-wrap font-medium">
                      <span className="flex items-center gap-1.5 text-brand-dark">
                        <Clock className="w-3.5 h-3.5 text-brand-red" /> {m.date} ({m.startTime || '10:00 AM'} - {m.endTime || '10:45 AM'})
                      </span>
                      <span className="flex items-center gap-1.5">
                        {m.type === 'ONLINE' ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-brand-peach" /> Online Conference
                            {m.meetingUrl && (
                              <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red underline font-bold ml-1">
                                Join Call
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-brand-gray" /> {m.venue || 'Faculty Office'}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Post-meeting Notes Display */}
                    {m.status === 'COMPLETED' && (m.discussionPoints || m.actionItems) && (
                      <div className="mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs space-y-1">
                        <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Meeting Outcomes & Follow-up:
                        </p>
                        {m.discussionPoints && (
                          <p className="text-emerald-800">
                            <strong>Summary:</strong> {m.discussionPoints}
                          </p>
                        )}
                        {m.actionItems && (
                          <p className="text-emerald-800">
                            <strong>Action Items:</strong> {m.actionItems}
                          </p>
                        )}
                        {m.followUpDate && (
                          <p className="text-emerald-700 font-semibold text-[11px]">
                            Next check-in scheduled around: {m.followUpDate}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mentor Controls */}
                  {isMentor && (
                    <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                      {['SCHEDULED', 'RESCHEDULED'].includes(m.status) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedMeeting(m);
                              setCompleteData({
                                discussionPoints: '',
                                studentConcerns: '',
                                mentorObservations: '',
                                actionItems: '',
                                followUpDate: ''
                              });
                              setShowCompleteModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Mark Complete</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMeeting(m);
                              setRescheduleData({
                                date: m.date,
                                startTime: m.startTime || '10:00 AM',
                                endTime: m.endTime || '10:45 AM',
                                venue: m.venue || '',
                                meetingUrl: m.meetingUrl || ''
                              });
                              setShowRescheduleModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-brand-gray-light hover:bg-brand-gray-light/60 text-xs font-bold text-brand-dark transition-all flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-brand-gray" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMeeting(m);
                              setShowCancelModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* SCHEDULE MODAL */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Mentoring Appointment"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Assigned Mentee</label>
            {mentees.length === 0 ? (
              <div className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-800 font-semibold">
                No mentees are currently assigned to you. The HOD must assign students before you can schedule appointments.
              </div>
            ) : (
              <select
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-bold outline-none"
              >
                {mentees.map((m) => {
                  const sId = m.user?._id || m.user;
                  const sName = m.user?.name || 'Student';
                  const sReg = m.studentId || m.registerNo || 'ID';
                  return (
                    <option key={sId} value={sId}>
                      {sName} ({sReg}) — Sem {m.semester || 1}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Appointment Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Mid-Term Academic Review & Placement Readiness"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Purpose Category</label>
              <select
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
              >
                {PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-dark block mb-1">Meeting Mode</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-medium outline-none"
              >
                <option value="IN_PERSON">In-Person (Faculty Cabin)</option>
                <option value="ONLINE">Online Virtual Call</option>
                <option value="PHONE">Phone Consultation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-brand-dark block mb-1">Start Time</label>
              <input
                type="text"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="10:00 AM"
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-brand-dark block mb-1">End Time</label>
              <input
                type="text"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                placeholder="10:45 AM"
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
          </div>

          {form.type === 'ONLINE' ? (
            <div>
              <label className="font-bold text-brand-dark block mb-1">Meeting Link (Google Meet / Zoom)</label>
              <input
                type="url"
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/xyz-abc"
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="font-bold text-brand-dark block mb-1">Location / Venue</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Faculty Room 304, CS Block"
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-brand-dark block mb-1">Discussion Agenda</label>
            <textarea
              rows="2"
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="Key topics to discuss during the appointment..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Preparation Instructions for Mentee (Optional)</label>
            <input
              type="text"
              value={form.preparationInstructions}
              onChange={(e) => setForm({ ...form, preparationInstructions: e.target.value })}
              placeholder="e.g. Bring updated resume and Semester 3 marks sheet"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white"
            >
              Schedule Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title={`Reschedule "${selectedMeeting?.title}"`}
      >
        <form onSubmit={handleReschedule} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">New Date</label>
            <input
              type="date"
              required
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Start Time</label>
              <input
                type="text"
                required
                value={rescheduleData.startTime}
                onChange={(e) => setRescheduleData({ ...rescheduleData, startTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-brand-dark block mb-1">End Time</label>
              <input
                type="text"
                required
                value={rescheduleData.endTime}
                onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Venue / Online Link</label>
            <input
              type="text"
              value={rescheduleData.venue || rescheduleData.meetingUrl}
              onChange={(e) => setRescheduleData({ ...rescheduleData, venue: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowRescheduleModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-dark text-white"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Mentoring Appointment"
      >
        <div className="space-y-4 text-xs">
          <p className="text-brand-dark font-medium">
            Are you sure you want to cancel <strong className="text-brand-red">{selectedMeeting?.title}</strong>?
          </p>
          <p className="text-brand-gray">
            The mentee will receive an immediate notification regarding the cancellation. The meeting record will remain in history as CANCELLED.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Keep Scheduled
            </button>
            <button
              onClick={handleCancelConfirm}
              className="px-5 py-2 rounded-full font-semibold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </Modal>

      {/* COMPLETE MODAL (DISCUSSION NOTES & OUTCOMES) */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Session & Record Guidance Notes"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
          <p className="text-brand-gray">
            Record meeting conclusions and recommendations for <strong className="text-brand-dark">{selectedMeeting?.student?.name}</strong>. These notes will be saved permanently in MongoDB and accessible in the student's 360 profile.
          </p>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Key Discussion Points</label>
            <textarea
              rows="2"
              required
              value={completeData.discussionPoints}
              onChange={(e) => setCompleteData({ ...completeData, discussionPoints: e.target.value })}
              placeholder="e.g. Reviewed Semester 3 SGPA improvement, discussed placement aptitude prep..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Student Concerns & Challenges</label>
            <textarea
              rows="2"
              value={completeData.studentConcerns}
              onChange={(e) => setCompleteData({ ...completeData, studentConcerns: e.target.value })}
              placeholder="e.g. Difficulty in Operating Systems lab, interview anxiety..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Mentor Observations & Recommendations</label>
            <textarea
              rows="2"
              value={completeData.mentorObservations}
              onChange={(e) => setCompleteData({ ...completeData, mentorObservations: e.target.value })}
              placeholder="e.g. Advised enrolling in peer tutoring program, recommended certification in AWS..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Agreed Action Items</label>
            <input
              type="text"
              value={completeData.actionItems}
              onChange={(e) => setCompleteData({ ...completeData, actionItems: e.target.value })}
              placeholder="e.g. Complete 2 LeetCode problems daily; submit mini-project draft by Friday"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-brand-dark block mb-1">Suggested Follow-Up Date</label>
            <input
              type="date"
              value={completeData.followUpDate}
              onChange={(e) => setCompleteData({ ...completeData, followUpDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-gray-light/60">
            <button
              type="button"
              onClick={() => setShowCompleteModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Outcomes & Complete
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
};
