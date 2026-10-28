import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, AlertCircle, ExternalLink, Layers, UserCheck } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { MetricCard } from '../components/common/MetricCard';
import { FeatureCard } from '../components/common/FeatureCard';
import { DotMatrixChart } from '../components/common/DotMatrixChart';
import { BarChartWidget } from '../components/common/BarChartWidget';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const HODDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [facultyMentors, setFacultyMentors] = useState([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHOD = async () => {
      try {
        setLoading(true);
        const [analyticsRes, facultyRes, unassignedRes] = await Promise.all([
          api.analytics.getHOD(),
          api.users.getAll({ role: 'MENTOR' }),
          api.hod.getUnassignedStudents()
        ]);
        if (analyticsRes.success) setAnalytics(analyticsRes);
        if (facultyRes.success) setFacultyMentors(facultyRes.users || []);
        if (unassignedRes.success) setUnassignedCount(unassignedRes.unassignedStudents?.length || 0);
      } catch (err) {
        console.warn('Error fetching HOD analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHOD();
  }, []);

  return (
    <DashboardShell>
      <TopBar
        title="Department Analytics"
        action={
          <button
            onClick={() => navigate('/mentor-assignments')}
            className="px-4 py-2.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Assign Mentors to Mentees</span>
          </button>
        }
      />

      {/* Top Department Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5">
          <MetricCard
            title="Department Enrollment"
            mainValue={`${analytics?.totalStudents || 0}`}
            subValue={`/ Active Students (${analytics?.department || 'CSE'})`}
            className="h-full"
          >
            <BarChartWidget />
          </MetricCard>
        </div>

        <div className="md:col-span-4">
          <MetricCard
            title="Academic Health & Compliance"
            className="h-full"
          >
            <div className="flex items-end justify-between gap-4 mt-2">
              <div>
                <div className="text-4xl font-bold tracking-tight text-brand-dark leading-none mb-1">
                  {analytics?.overallAttendance || 100}%
                </div>
                <span className="text-xs font-semibold text-emerald-600">
                  Department Attendance
                </span>
              </div>
              <DotMatrixChart totalDots={36} crimsonCount={analytics?.atRiskStudents ? 8 : 4} tooltipPrefix="Cohort Distribution" />
            </div>
          </MetricCard>
        </div>

        <div className="md:col-span-3 flex flex-col justify-between gap-4">
          <div
            onClick={() => navigate('/mentor-assignments')}
            className={`rounded-3xl p-5 px-6 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-dark-float hover:-translate-y-0.5 ${
              unassignedCount > 0 ? 'bg-brand-red text-white' : 'bg-brand-dark text-white hover:bg-brand-dark-surface'
            }`}
          >
            <div>
              <span className="text-xs text-white/80 block">Unassigned Students</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-white">{unassignedCount}</span>
                <span className="text-[11px] text-white/80">{unassignedCount > 0 ? 'Action Needed' : 'All Assigned'}</span>
              </div>
            </div>
            <Users className="w-6 h-6 text-brand-peach" />
          </div>

          <div
            onClick={() => navigate('/mentor-assignments')}
            className="bg-white text-brand-dark rounded-3xl p-5 px-6 border border-brand-gray-light/70 flex items-center justify-between cursor-pointer shadow-editorial hover:shadow-editorial-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-brand-gray block">Faculty Mentors</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-brand-dark">{facultyMentors.length}</span>
                <span className="text-[11px] text-brand-gray">Mentorship Pool</span>
              </div>
            </div>
            <Award className="w-6 h-6 text-brand-red" />
          </div>
        </div>
      </section>

      {/* Unassigned Students Alert Banner if any */}
      {unassignedCount > 0 && (
        <section className="bg-rose-50 border border-brand-red/30 rounded-3xl p-5 px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-brand-red animate-ping" />
            <div>
              <h4 className="text-sm font-bold text-brand-dark">
                {unassignedCount} Department Student{unassignedCount > 1 ? 's' : ''} Currently Without an Assigned Mentor
              </h4>
              <p className="text-xs text-brand-gray">
                Allocate faculty mentors to initiate academic tracking and private document review.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/mentor-assignments')}
            className="px-4 py-2 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-sm transition-all"
          >
            Open Mentor Assignments
          </button>
        </section>
      )}

      {/* Main Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start mt-2">
        <div className="md:col-span-4">
          <FeatureCard
            title="Department Mentees Require Review."
            subtitle="Evaluate students flagged with attendance dips or backlogs across academic cohorts."
            actionText="Inspect Student Directory"
            onAction={() => navigate('/mentees')}
          />
        </div>

        {/* Faculty Mentor Allocation Table */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-brand-dark">Faculty Mentors ({facultyMentors.length})</h3>
              <p className="text-xs text-brand-gray mt-0.5">Faculty members allocated in MongoDB database</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/mentor-assignments')}
                className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-brand-red text-white hover:bg-brand-red-hover shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Allocate Mentors</span>
              </button>
              <button
                onClick={() => addToast('Department Audit Summary Exported')}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-dark text-white hover:bg-brand-dark-surface transition-colors"
              >
                Export Report
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-brand-gray py-6 text-center">Loading faculty list...</p>
          ) : facultyMentors.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-2">
              <p className="text-sm font-bold text-brand-dark">No faculty mentors found.</p>
              <p className="text-xs text-brand-gray">Register faculty users with role 'Mentor' to view them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {facultyMentors.map((f) => (
                <div
                  key={f._id}
                  className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={f.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(f.name)}`}
                      alt={f.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-brand-dark">{f.name}</h4>
                      <p className="text-xs text-brand-gray">{f.email} • {f.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Badge variant="dark">{f.designation || 'Faculty Mentor'}</Badge>
                    <button
                      onClick={() => navigate(`/mentors/${f._id}`)}
                      className="text-xs font-bold text-brand-red hover:underline inline-flex items-center gap-1"
                    >
                      360° Profile <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
};
