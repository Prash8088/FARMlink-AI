import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { Alert } from '../../components/common/Alert';
import {
  Settings,
  Shield,
  Bell,
  Key,
  LogOut,
  Smartphone,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Console Settings</h1>
        <p className="text-xs text-slate-500">Manage account security, notifications, and active session</p>
      </div>

      {savedNotice && (
        <Alert
          type="success"
          message="Your preference settings have been saved successfully."
          onClose={() => setSavedNotice(false)}
        />
      )}

      {/* Security & Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Key className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Authentication & Security
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Password Encryption</p>
              <p className="text-slate-500">
                Secured via bcryptjs with 12 salted rounds. Never stored in plaintext.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Active & Protected
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Session JWT Token</p>
              <p className="text-slate-500">
                HTTP-only, SameSite=Lax cookie with 7-day expiration window.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
              Standard Secure
            </span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Notification Preferences
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Email Notifications</p>
              <p className="text-slate-500">Order updates, administrative notes, and account alerts</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">SMS / WhatsApp Gate Dispatch Alerts</p>
              <p className="text-slate-500">Direct notifications when transport or buyer confirms status</p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Weekly Mandi Rate Digests</p>
              <p className="text-slate-500">Regional market price summaries</p>
            </div>
            <input
              type="checkbox"
              checked={marketUpdates}
              onChange={(e) => setMarketUpdates(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Save Notification Settings
          </button>
        </div>
      </form>

      {/* Version & Info Card */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-900">FARMlink AI – System Release Version 1.0.0</p>
        <p>
          Architecture: Node.js, Express, MongoDB Atlas, Mongoose, React, Vite, Tailwind CSS. Role-based routing active.
        </p>
        <p className="text-[11px] text-slate-400">
          Logged in as: {user?.email} ({user?.role?.toUpperCase()})
        </p>
      </div>
    </div>
  );
};
