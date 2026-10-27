import React from 'react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Settings = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  return (
    <DashboardShell>
      <TopBar title="Settings & Governance" />

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial max-w-3xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-brand-dark">Account & System Configuration</h3>
          <p className="text-xs text-brand-gray mt-0.5">Manage notifications, security credentials, and institutional preferences.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60">
            <span className="text-brand-gray block text-[11px] font-bold uppercase">Current Role Profile</span>
            <div className="flex items-center gap-3 mt-2">
              <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'User')}`} alt={currentUser?.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-brand-gray-light" />
              <div>
                <h4 className="text-sm font-bold text-brand-dark">{currentUser?.name}</h4>
                <p className="text-brand-gray">{currentUser?.email} • Role: <strong>{currentUser?.role}</strong></p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-sm text-brand-dark mb-3">Notification Preferences</h4>
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-red focus:ring-brand-red" />
                <span className="text-brand-dark font-medium">Urgent intake and meeting request alerts</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-red focus:ring-brand-red" />
                <span className="text-brand-dark font-medium">Semester SGPA and attendance threshold warnings</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-gray-light/60 flex justify-end">
            <button
              onClick={() => addToast('Settings preferences saved.')}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-brand-dark text-white hover:bg-brand-dark-surface transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
};
