import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MENTEE',
    department: 'CSE',
    designation: '',
    studentId: '',
    batch: '2023-2027',
    semester: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { ...formData };
    // Clear password immediately from React component state
    setFormData(prev => ({ ...prev, password: '' }));

    try {
      await register(payload);
      addToast(`Account created successfully for ${payload.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans flex items-center justify-center p-6 antialiased">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-brand-gray-light/80 shadow-2xl space-y-6">
        {/* Brand Mark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-red text-white flex items-center justify-center shadow-md font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Create Account</h1>
            <p className="text-xs text-brand-gray font-medium">Register an official account in MEntee</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-xs font-semibold text-brand-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Alan Turing or Alice Johnson"
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Institutional Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@institution.edu"
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-bold"
              >
                <option value="MENTEE">Mentee (Student)</option>
                <option value="MENTOR">Mentor (Faculty)</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium"
              >
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="MECH">Mechanical (MECH)</option>
              </select>
            </div>
          </div>

          {formData.role === 'MENTEE' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Student ID / Roll No</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. CS2024-001"
                  className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Current Semester</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>Creating Account in MongoDB...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-brand-gray-light/60">
          <p className="text-xs text-brand-gray">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-dark hover:text-brand-red underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
