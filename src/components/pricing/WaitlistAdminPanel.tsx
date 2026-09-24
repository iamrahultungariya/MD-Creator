import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Download, 
  Search, 
  RefreshCw, 
  Check, 
  Calendar,
  Sparkles,
  Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface WaitlistEntry {
  id?: string;
  email: string;
  plan?: string;
  created_at?: string;
}

export const WaitlistAdminPanel: React.FC = () => {
  const [subscribers, setSubscribers] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      let list: WaitlistEntry[] = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('waitlist')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Could not fetch waitlist from Supabase:', error);
        } else if (data) {
          list = data as WaitlistEntry[];
        }
      }

      // Check localStorage for any local fallbacks
      const localEmail = localStorage.getItem('mdwriter_waitlist_email');
      if (localEmail && !list.some((item) => item.email.toLowerCase() === localEmail.toLowerCase())) {
        list = [{ email: localEmail, plan: 'pro', created_at: new Date().toISOString() }, ...list];
      }

      setSubscribers(list);
    } catch {
      // Offline / error fallback to local email if exists
      const localEmail = localStorage.getItem('mdwriter_waitlist_email');
      if (localEmail) {
        setSubscribers([{ email: localEmail, plan: 'pro', created_at: new Date().toISOString() }]);
      } else {
        setSubscribers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleCopyAll = () => {
    if (subscribers.length === 0) return;
    const emailList = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCsv = () => {
    if (subscribers.length === 0) return;
    const header = 'Email,Plan,Created At\n';
    const rows = subscribers
      .map((s) => `"${s.email}","${s.plan || 'pro'}","${s.created_at || new Date().toISOString()}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `md_writer_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-2xl overflow-hidden relative select-none">
      {/* Ambient background aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Pro Tier Waitlist Subscribers</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time subscriber list to send confirmation and launch invitations.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchWaitlist}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleCopyAll}
            disabled={subscribers.length === 0}
            className="px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied All!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All (BCC)</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCsv}
            disabled={subscribers.length === 0}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total Subscribers</div>
          <div className="text-2xl font-black text-white mt-1">{subscribers.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Plan Interest</div>
          <div className="text-2xl font-black text-blue-400 mt-1">Pro ($5-$10/mo)</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Security State</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">RLS Protected</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by email address..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Subscribers Table / List */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Loading subscriber roster...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            {search ? 'No matching emails found.' : 'No waitlist submissions yet.'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80 max-h-80 overflow-y-auto">
            {filtered.map((sub, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-white truncate">{sub.email}</div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    {sub.plan || 'Pro'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sub.email);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Copy this email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
