import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Award,
  ArrowLeft,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const MentorProfile360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [activeTab, setActiveTab] = useState('mentees');

  useEffect(() => {
    if (!id) return;
    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.mentors.getById(id);
        if (res.success) {
          setMentorData(res);
        }
      } catch (err) {
        const is403 =
          err.message?.includes('403') ||
          err.message?.toLowerCase().includes('forbidden') ||
          err.message?.toLowerCase().includes('authorized department');
        setError({
          code: is403 ? 403 : 500,
          message:
            err.message ||
            'Unable to load mentor profile. You may only view mentors within your authorized department.'
        });
        addToast(err.message || 'Error fetching mentor profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [id, addToast]);

  if (loading) {
    return (
      <DashboardShell>
        <TopBar title="Mentor 360° Profile" />
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-brand-dark">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gray">
            Loading Mentor Profile...
          </span>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <TopBar title="Mentor 360° Profile" />
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-3xl p-8 border border-brand-gray-light/60 shadow-editorial text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-brand-red/30 flex items-center justify-center text-brand-red">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark">
            {error.code === 403 ? 'Access Restricted (403 Forbidden)' : 'Error Loading Profile'}
          </h2>
          <p className="text-sm text-brand-gray max-w-md mx-auto">{error.message}</p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => navigate('/analytics')}
              className="px-5 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark-surface transition-all inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Department Analytics
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const { mentor, assignedMentees = [], assignedMenteeCount = 0, recentMeetings = [], meetingSummary = {} } =
    mentorData || {};

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/analytics')}
          className="text-xs font-bold text-brand-gray hover:text-brand-dark inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Analytics
        </button>
        <Badge variant="dark">Department Scope Verified</Badge>
      </div>

      <TopBar title="Mentor 360° Profile" />

      {/* Header Profile Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={
                mentor?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mentor?.name || 'M')}`
              }
              alt={mentor?.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-gray-light/50"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-brand-dark leading-tight">{mentor?.name}</h2>
                <Badge variant="red">{mentor?.designation || 'Faculty Mentor'}</Badge>
              </div>
              <p className="text-xs text-brand-gray font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {mentor?.email}
              </p>
              <p className="text-xs text-brand-dark font-semibold">
                Department of {mentor?.department || 'General Academics'}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 text-right">
            <span className="text-[11px] font-bold text-brand-gray uppercase tracking-wider">
              Mentorship Status
            </span>
            <Badge variant="green">Active Mentor</Badge>
          </div>
        </div>
      </section>

      {/* Overview Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <MetricCard
          title="Assigned Mentees"
          mainValue={`${assignedMenteeCount}`}
          subValue="Active students under mentorship"
        >
          <div className="flex items-center gap-2 text-xs text-brand-gray mt-2">
            <Users className="w-4 h-4 text-brand-red" />
            <span>Target Capacity: 20 Students</span>
          </div>
        </MetricCard>

        <MetricCard
          title="Mentoring Sessions"
          mainValue={`${meetingSummary.total || 0}`}
          subValue="Meetings conducted in last 90 days"
        >
          <div className="flex items-center gap-3 text-xs text-brand-gray mt-2">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {meetingSummary.completed || 0} Completed
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <Clock className="w-3.5 h-3.5" /> {meetingSummary.scheduled || 0} Scheduled
            </span>
          </div>
        </MetricCard>

        <MetricCard
          title="Mentorship Workload"
          mainValue={`${Math.min(100, Math.round((assignedMenteeCount / 20) * 100))}%`}
          subValue="Current allocation vs department cap"
        >
          <div className="w-full bg-brand-surface h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-brand-red h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((assignedMenteeCount / 20) * 100))}%` }}
            />
          </div>
        </MetricCard>
      </section>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-gray-light/60 mb-6">
        <button
          onClick={() => setActiveTab('mentees')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'mentees'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-gray hover:text-brand-dark'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Assigned Mentees ({assignedMenteeCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'meetings'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-gray hover:text-brand-dark'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Recent Mentoring Meetings ({recentMeetings.length})</span>
        </button>
      </div>

      {/* Tab 1: Assigned Mentees Table */}
      {activeTab === 'mentees' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-brand-dark">Assigned Mentees Roster</h3>
              <p className="text-xs text-brand-gray">
                Official students allocated to {mentor?.name} within Department of {mentor?.department}
              </p>
            </div>
            <button
              onClick={() => navigate('/mentor-assignments')}
              className="px-3.5 py-1.5 rounded-full bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark-surface transition-all"
            >
              Manage Allocations
            </button>
          </div>

          {assignedMentees.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60">
              <Users className="w-8 h-8 text-brand-gray mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-brand-dark">No mentees currently assigned.</p>
              <p className="text-xs text-brand-gray mt-1">
                Use the Mentor Assignments tool to allocate students to this faculty mentor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-gray-light/60 text-brand-gray font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Student ID</th>
                    <th className="py-3 px-3">Semester</th>
                    <th className="py-3 px-3">CGPA</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-light/40">
                  {assignedMentees.map((sp) => {
                    const studentUser = sp.user || {};
                    return (
                      <tr key={sp._id} className="hover:bg-brand-surface/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                studentUser.avatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  studentUser.name || 'S'
                                )}`
                              }
                              alt={studentUser.name}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-gray-light"
                            />
                            <div>
                              <p className="font-bold text-brand-dark text-xs">{studentUser.name}</p>
                              <p className="text-[10px] text-brand-gray">{studentUser.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-brand-dark">
                          {sp.studentId || sp.registerNo || 'N/A'}
                        </td>
                        <td className="py-3 px-3 font-medium text-brand-dark">
                          Sem {sp.semester} {sp.section ? `• Sec ${sp.section}` : ''}
                        </td>
                        <td className="py-3 px-3 font-bold text-brand-dark">
                          {sp.cgpa || '0.0'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold ${
                              sp.attendancePercentage < 75 ? 'text-brand-red' : 'text-brand-dark'
                            }`}
                          >
                            {sp.attendancePercentage || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={sp.status === 'AT_RISK' ? 'red' : 'dark'}>
                            {sp.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/students/${sp._id}`)}
                            className="text-xs font-bold text-brand-red hover:underline inline-flex items-center gap-1"
                          >
                            360° Profile <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Recent Mentoring Meetings */}
      {activeTab === 'meetings' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-brand-dark">Mentoring Activity & Appointments</h3>
              <p className="text-xs text-brand-gray">
                Logged appointments conducted with assigned students (last 90 days)
              </p>
            </div>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60">
              <Calendar className="w-8 h-8 text-brand-gray mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-brand-dark">No appointments recorded recently.</p>
              <p className="text-xs text-brand-gray mt-1">
                Meetings scheduled by this mentor will be logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-brand-gray-light/70 flex items-center justify-center text-brand-dark font-bold text-xs">
                      <BookOpen className="w-4 h-4 text-brand-red" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-brand-dark">{m.title}</h4>
                      <p className="text-[11px] text-brand-gray">
                        Student: <strong className="text-brand-dark">{m.student?.name || 'Assigned Mentee'}</strong> •{' '}
                        {new Date(m.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Badge variant={m.status === 'COMPLETED' ? 'green' : 'red'}>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </DashboardShell>
  );
};
