import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const pwdToSubmit = password;
    setPassword(''); // Clear sensitive password immediately from component state

    try {
      const user = await login(email, pwdToSubmit);
      addToast(`Welcome back, ${user.name}!`);
      setEmail('');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans flex items-center justify-center p-6 antialiased">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-brand-gray-light/80 shadow-2xl space-y-7">
        {/* Brand Mark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-red text-white flex items-center justify-center shadow-md font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">MEntee Portal</h1>
            <p className="text-xs text-brand-gray font-medium">Single Source of Truth for Student Development</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-xs font-semibold text-brand-red">
            {error}
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@institution.edu"
              className="w-full p-3.5 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3.5 rounded-xl border border-brand-gray-light bg-brand-surface text-xs font-medium outline-none focus:ring-2 focus:ring-brand-dark"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-brand-dark hover:bg-brand-dark-surface text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Verifying JWT Credentials...</span>
            ) : (
              <>
                <span>Sign In to MEntee</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-brand-gray-light/60 space-y-3">
          <p className="text-xs text-brand-gray">
            Don't have an account yet?
          </p>
          <Link
            to="/register"
            className="w-full py-3 rounded-full border border-brand-dark text-brand-dark hover:bg-brand-surface text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Account (Student, Mentor, HOD, Admin)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
