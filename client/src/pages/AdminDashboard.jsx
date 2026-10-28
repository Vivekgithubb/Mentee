import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Layers, Activity, Plus, Trash2, UserPlus } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { MetricCard } from '../components/common/MetricCard';
import { FeatureCard } from '../components/common/FeatureCard';
import { DotMatrixChart } from '../components/common/DotMatrixChart';
import { BarChartWidget } from '../components/common/BarChartWidget';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ totalAccounts: 0, totalEnrollment: 0, activeMentors: 0, hodsCount: 0 });
  const [loading, setLoading] = useState(true);

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MENTEE',
    department: 'CSE',
    designation: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, metricsRes] = await Promise.all([
        api.users.getAll(),
        api.analytics.getAdmin()
      ]);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (metricsRes.success) setMetrics(metricsRes.metrics || {});
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.users.create(userForm);
      if (res.success) {
        addToast(`User ${userForm.name} created successfully in MongoDB!`);
        setShowCreateUserModal(false);
        setUserForm({ name: '', email: '', password: '', role: 'MENTEE', department: 'CSE', designation: '' });
        fetchData();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await api.users.delete(id);
      addToast(`User ${name} removed`);
      setUsers(users.filter(u => u._id !== id));
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <DashboardShell>
      <TopBar
        title="Institutional Administration"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mentor-assignments')}
              className="px-4 py-2.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Mentor-Mentee Allocations</span>
            </button>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-4 py-2.5 rounded-full bg-brand-dark hover:bg-brand-dark-surface text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          </div>
        }
      />

      {/* Top Admin KPI Row */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5">
          <MetricCard
            title="Registered Accounts"
            mainValue={`${users.length}`}
            subValue="/ Verified Users in MongoDB"
            className="h-full"
          >
            <BarChartWidget />
          </MetricCard>
        </div>

        <div className="md:col-span-4">
          <MetricCard
            title="System Compliance Index"
            className="h-full"
          >
            <div className="flex items-end justify-between gap-4 mt-2">
              <div>
                <div className="text-4xl font-bold tracking-tight text-brand-dark leading-none mb-1">
                  100%
                </div>
                <span className="text-xs font-semibold text-emerald-600">
                  Role Enforcement Active
                </span>
              </div>
              <DotMatrixChart totalDots={36} crimsonCount={4} tooltipPrefix="Governance Node" />
            </div>
          </MetricCard>
        </div>

        <div className="md:col-span-3 flex flex-col justify-between gap-4">
          <div
            onClick={() => navigate('/mentor-assignments')}
            className="bg-brand-dark text-white rounded-3xl p-5 px-6 flex items-center justify-between cursor-pointer hover:bg-brand-dark-surface shadow-dark-float hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-[#B4B9C2] block">Faculty Mentors</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-white">{metrics.activeMentors || 0}</span>
                <span className="text-[11px] text-[#979CA6]">Allocations →</span>
              </div>
            </div>
            <Users className="w-6 h-6 text-brand-peach" />
          </div>

          <div
            onClick={() => navigate('/mentees')}
            className="bg-white text-brand-dark rounded-3xl p-5 px-6 border border-brand-gray-light/70 flex items-center justify-between cursor-pointer shadow-editorial hover:shadow-editorial-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <span className="text-xs text-brand-gray block">Enrolled Students</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-brand-dark">{metrics.totalEnrollment || 0}</span>
                <span className="text-[11px] text-brand-gray">Roster →</span>
              </div>
            </div>
            <Layers className="w-6 h-6 text-brand-red" />
          </div>
        </div>
      </section>

      {/* Main Section: Feature Card + Users Management */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start mt-2">
        <div className="md:col-span-4">
          <FeatureCard
            title="Institution Governance Console."
            subtitle="Create and govern real institutional accounts with server-enforced roles and bcrypt security."
            actionText="Create Institutional User"
            onAction={() => setShowCreateUserModal(true)}
          />
        </div>

        {/* Real MongoDB User Table */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-brand-dark">Institutional Users Directory</h3>
              <p className="text-xs text-brand-gray mt-0.5">Real users stored in MongoDB database</p>
            </div>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-brand-dark text-white hover:bg-brand-dark-surface transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add User
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-brand-gray py-6 text-center">Loading accounts from MongoDB...</p>
          ) : users.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-gray-light/60 space-y-2">
              <p className="text-sm font-bold text-brand-dark">No accounts found in MongoDB.</p>
              <p className="text-xs text-brand-gray">Click '+ Add User' to create the first user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-gray-light/80 text-brand-gray font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Name & Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-light/40">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-brand-surface/60">
                      <td className="py-3 px-3">
                        <span className="font-bold text-brand-dark block">{u.name}</span>
                        <span className="text-[11px] text-brand-gray">{u.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={u.role === 'ADMIN' ? 'red' : u.role === 'HOD' ? 'peach' : 'dark'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-medium text-brand-dark">
                        {u.department}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="text-brand-gray hover:text-brand-red p-1"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Modal: Create User */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        title="Create New Institutional User in MongoDB"
      >
        <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Email</label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="e.g. j.smith@institution.edu"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-dark block mb-1">Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface font-bold"
              >
                <option value="MENTEE">MENTEE (Student)</option>
                <option value="MENTOR">MENTOR (Faculty)</option>
                <option value="HOD">HOD (Department Head)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-dark block mb-1">Department</label>
              <select
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface"
              >
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="MECH">Mechanical (MECH)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateUserModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white"
            >
              Create Account in MongoDB
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
};
