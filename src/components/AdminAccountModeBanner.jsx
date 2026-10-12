import React from 'react';
import { Eye, LogOut } from 'lucide-react';

const AdminAccountModeBanner = ({ session, onExit, exiting, error }) => (
  <div className="sticky top-0 z-[10000] flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-800 bg-amber-500 px-4 py-3 text-sm text-black shadow-md">
    <div className="flex min-w-0 items-start gap-2">
      <Eye size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-bold">
          ADMIN ACCOUNT SESSION — viewing as {session.targetName} ({session.targetId})
        </p>
        <p className="text-xs">
          Any actions are performed as this user and audited under your admin account.
          Session expires {new Date(session.expiresAt).toLocaleTimeString()}.
        </p>
        {error && <p className="mt-1 font-semibold text-red-950">{error}</p>}
      </div>
    </div>
    <button
      type="button"
      onClick={onExit}
      disabled={exiting}
      className="flex shrink-0 items-center gap-2 rounded-md border border-black bg-white px-3 py-2 font-bold text-black hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut size={16} />
      {exiting ? 'Ending session…' : 'Exit account view'}
    </button>
  </div>
);

export default AdminAccountModeBanner;
