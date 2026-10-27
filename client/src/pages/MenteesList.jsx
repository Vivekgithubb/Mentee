import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, UserCheck } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export const MenteesList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await api.students.getAll();
        if (res.success) {
          setStudents(res.students || []);
        }
      } catch (err) {
        console.warn('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const name = s.user?.name || '';
    const id = s.studentId || '';
    const matchesSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <TopBar title="Mentees Directory" onSearch={setSearch} />

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-6">
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-brand-gray">Filter:</span>
            {['ALL', 'ON_TRACK', 'AT_RISK'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-brand-dark text-white'
                    : 'bg-brand-surface text-brand-gray hover:text-brand-dark'
                }`}
              >
                {st === 'ALL' ? 'All Mentees' : st === 'ON_TRACK' ? 'On Track' : 'At Risk (<75%)'}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-brand-gray">
            Showing {filteredStudents.length} Students
          </span>
        </div>

        {/* Mentees Table */}
        {loading ? (
          <p className="text-xs text-brand-gray py-8 text-center">Loading student records from MongoDB...</p>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-2">
            <p className="text-sm font-bold text-brand-dark">No student records found in database.</p>
            <p className="text-xs text-brand-gray">Register new students or create them via the Admin Console.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-gray-light/80 text-brand-gray font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Department & Sem</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4 text-right">Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-light/40">
                {filteredStudents.map(std => (
                  <tr
                    key={std._id}
                    className="hover:bg-brand-surface/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={std.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(std.user?.name || 'Student')}`}
                        alt={std.user?.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-gray-light"
                      />
                      <div>
                        <span className="font-bold text-sm text-brand-dark block">{std.user?.name || 'Student'}</span>
                        <span className="text-[11px] text-brand-gray">{std.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-dark">
                      {std.studentId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-brand-dark">
                      {std.department} • Sem {std.semester}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-brand-dark">
                      {std.cgpa || '0.0'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold text-xs ${std.attendancePercentage < 75 ? 'text-brand-red' : 'text-brand-dark'}`}>
                        {std.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-brand-dark">
                      {std.mentor ? std.mentor.name : <span className="text-brand-gray italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                    <button
                        onClick={() => navigate(`/students/${std._id}`)}
                        className="text-xs font-bold text-brand-red hover:underline inline-flex items-center gap-1"
                      >
                        360° Profile <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
};
