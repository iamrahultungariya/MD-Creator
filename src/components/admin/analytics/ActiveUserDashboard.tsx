import React, { useState, useMemo } from 'react';
import { 
  Users, 
  PenTool, 
  Clock, 
  Zap, 
  FileDown, 
  FileText, 
  Presentation, 
  Table, 
  Sigma, 
  GitFork, 
  Timer, 
  Video, 
  Share2, 
  RefreshCw, 
  ArrowUpRight, 
  Activity,
  Layers,
  Globe,
  Code2,
  Cloud,
  HardDrive,
  ShieldCheck,
  UserCheck,
  PieChart
} from 'lucide-react';
import { telemetryService, DailyMetricRecord, TrackedFeature, SurveyResponse } from '../../../services/telemetryService';

interface ActiveUserDashboardProps {
  onRefresh?: () => void;
}

export const ActiveUserDashboard: React.FC<ActiveUserDashboardProps> = () => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [hoveredPoint, setHoveredPoint] = useState<DailyMetricRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch telemetry records based on time range
  const dailyMetrics = useMemo(() => {
    return telemetryService.getDailyMetrics(timeRange);
  }, [timeRange, isRefreshing]);

  const recentFeed = useMemo(() => {
    return telemetryService.getRecentActivityFeed();
  }, [isRefreshing]);

  const surveyMetrics = useMemo(() => {
    return telemetryService.getSurveyMetrics();
  }, [isRefreshing]);

  const surveyResponses = useMemo(() => {
    return telemetryService.getSurveyResponses();
  }, [isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // ── Calculated KPIs ──────────────────────────────────────────────────────────
  const todayRecord = dailyMetrics[dailyMetrics.length - 1] || {
    visitors: 1,
    activeWriters: 0,
    totalSessionSeconds: 120,
    featureUsage: {},
  };

  const totalPeriodVisitors = useMemo(
    () => dailyMetrics.reduce((sum, d) => sum + d.visitors, 0),
    [dailyMetrics]
  );

  const totalPeriodWriters = useMemo(
    () => dailyMetrics.reduce((sum, d) => sum + d.activeWriters, 0),
    [dailyMetrics]
  );

  const avgPeriodSessionSeconds = useMemo(() => {
    const totalSecs = dailyMetrics.reduce((sum, d) => sum + d.totalSessionSeconds, 0);
    const writersCount = Math.max(1, totalPeriodWriters);
    return Math.round(totalSecs / writersCount);
  }, [dailyMetrics, totalPeriodWriters]);

  const formatSeconds = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s > 0 ? `${s}s` : ''}`;
  };

  // Aggregate Feature Usage
  const aggregatedFeatures = useMemo(() => {
    const totals: Record<string, number> = {};
    dailyMetrics.forEach((d) => {
      Object.entries(d.featureUsage).forEach(([feat, count]) => {
        totals[feat] = (totals[feat] || 0) + count;
      });
    });

    const featureDefinitions: {
      id: TrackedFeature;
      name: string;
      icon: React.ElementType;
      color: string;
      bg: string;
    }[] = [
      { id: 'pdf_export', name: 'PDF Export', icon: FileDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      { id: 'docx_export', name: 'Word (.docx) Export', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { id: 'slash_commands', name: '/ Slash Commands', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      { id: 'table_builder', name: 'Table Builder', icon: Table, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { id: 'presentation_deck', name: 'Presentation Slides', icon: Presentation, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { id: 'katex_math', name: 'KaTeX Math Formulas', icon: Sigma, color: 'text-sky-400', bg: 'bg-sky-500/10' },
      { id: 'focus_sprint', name: 'Focus Sprint Timer', icon: Timer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
      { id: 'mermaid_diagram', name: 'Mermaid Diagrams', icon: GitFork, color: 'text-pink-400', bg: 'bg-pink-500/10' },
      { id: 'clip_studio', name: 'Screen Clip Studio', icon: Video, color: 'text-teal-400', bg: 'bg-teal-500/10' },
      { id: 'web_publish', name: 'Web Publishing', icon: Share2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ];

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;

    return featureDefinitions
      .map((f) => {
        const count = totals[f.id] || 0;
        const percentage = Math.round((count / grandTotal) * 100);
        return {
          ...f,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [dailyMetrics]);

  const topFeature = aggregatedFeatures[0] || { name: 'PDF Export', percentage: 38 };

  // ── SVG Chart Calculations ───────────────────────────────────────────────────
  const chartHeight = 180;
  const chartWidth = 700;
  const maxVal = Math.max(
    ...dailyMetrics.map((d) => Math.max(d.visitors, d.activeWriters)),
    10
  );

  const getX = (index: number) => {
    if (dailyMetrics.length <= 1) return chartWidth / 2;
    return (index / (dailyMetrics.length - 1)) * (chartWidth - 60) + 30;
  };

  const getY = (val: number) => {
    return chartHeight - (val / (maxVal * 1.15)) * (chartHeight - 40) - 20;
  };

  // Generate SVG path for Visitors
  const visitorLineD = `M ${dailyMetrics.map((d, i) => `${getX(i)},${getY(d.visitors)}`).join(' L ')}`;
  const visitorAreaD = `${visitorLineD} L ${getX(dailyMetrics.length - 1)},${chartHeight - 10} L ${getX(0)},${chartHeight - 10} Z`;

  // Generate SVG path for Active Writers
  const writerLineD = `M ${dailyMetrics.map((d, i) => `${getX(i)},${getY(d.activeWriters)}`).join(' L ')}`;
  const writerAreaD = `${writerLineD} L ${getX(dailyMetrics.length - 1)},${chartHeight - 10} L ${getX(0)},${chartHeight - 10} Z`;

  // Format short date (e.g. Oct 5)
  const formatShortDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-white tracking-tight">
              User Activity &amp; Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Anonymous aggregate telemetry: visitors, active writers, writing duration, and feature adoption.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time Filter Pills */}
          <div className="flex items-center p-1 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs font-semibold">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === days
                    ? 'bg-neutral-800 text-white shadow-xs font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Last {days}d
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Daily Visitors */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              <span>Today</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {todayRecord.visitors}
            </div>
            <div className="text-xs font-semibold text-neutral-300 mt-0.5">
              Daily Visitors Today
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              {totalPeriodVisitors} total visits in last {timeRange} days
            </p>
          </div>
        </div>

        {/* Card 2: Daily Active Writers (DAU) */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {todayRecord.visitors > 0
                ? `${Math.round((todayRecord.activeWriters / todayRecord.visitors) * 100)}% Conversion`
                : 'Active'}
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {todayRecord.activeWriters}
            </div>
            <div className="text-xs font-semibold text-neutral-300 mt-0.5">
              Active Writers (DAU)
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Users who actually typed or saved documents
            </p>
          </div>
        </div>

        {/* Card 3: Avg Writing Time */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Focused Dwell Time
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatSeconds(avgPeriodSessionSeconds)}
            </div>
            <div className="text-xs font-semibold text-neutral-300 mt-0.5">
              Average Writing Time
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Mean active typing duration per session
            </p>
          </div>
        </div>

        {/* Card 4: Most Used Feature */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {topFeature.percentage}% of Actions
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight truncate">
              {topFeature.name}
            </div>
            <div className="text-xs font-semibold text-neutral-300 mt-0.5">
              Most Used Feature
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Top action taken across active sessions
            </p>
          </div>
        </div>

      </div>

      {/* ── Dual Trend Chart: Daily Visitors vs Active Writers ──────────────── */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <span>Daily Visitors vs. Active Writers Trend</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Compares total site visitors against users who actively composed or edited notes.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-brand-500 inline-block" />
              <span className="text-neutral-300">Total Visitors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-400 inline-block" />
              <span className="text-neutral-300">Active Writers (DAU)</span>
            </div>
          </div>
        </div>

        {/* SVG Responsive Chart Viewport */}
        <div className="relative pt-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-52 sm:h-64 overflow-visible"
          >
            <defs>
              <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="writerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = chartHeight - pct * (chartHeight - 40) - 20;
              return (
                <line
                  key={idx}
                  x1="20"
                  y1={y}
                  x2={chartWidth - 20}
                  y2={y}
                  stroke="#262626"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Visitor Area & Line */}
            <path d={visitorAreaD} fill="url(#visitorGradient)" />
            <path
              d={visitorLineD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Writer Area & Line */}
            <path d={writerAreaD} fill="url(#writerGradient)" />
            <path
              d={writerLineD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Point Dots with Hover Listeners */}
            {dailyMetrics.map((d, i) => {
              const cx = getX(i);
              const cyVis = getY(d.visitors);
              const cyWrit = getY(d.activeWriters);
              const isHovered = hoveredPoint?.date === d.date;

              return (
                <g
                  key={d.date}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={cx}
                    cy={cyVis}
                    r={isHovered ? 5 : 3}
                    fill="#3b82f6"
                    className="transition-all"
                  />
                  <circle
                    cx={cx}
                    cy={cyWrit}
                    r={isHovered ? 5 : 3}
                    fill="#10b981"
                    className="transition-all"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 p-3 bg-neutral-950 border border-neutral-700/80 rounded-xl shadow-xl text-xs space-y-1 font-mono animate-in fade-in zoom-in-95 duration-100">
              <div className="font-bold text-white border-b border-neutral-800 pb-1">
                📅 {formatShortDate(hoveredPoint.date)}
              </div>
              <div className="text-blue-400 flex items-center justify-between gap-4">
                <span>Visitors:</span>
                <span className="font-bold">{hoveredPoint.visitors}</span>
              </div>
              <div className="text-emerald-400 flex items-center justify-between gap-4">
                <span>Active Writers:</span>
                <span className="font-bold">{hoveredPoint.activeWriters}</span>
              </div>
              <div className="text-amber-400 flex items-center justify-between gap-4">
                <span>Total Writing:</span>
                <span className="font-bold">{formatSeconds(hoveredPoint.totalSessionSeconds)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Feature Usage Breakdown & Recent Real-Time Stream ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Feature Usage Breakdown Bars */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Feature Usage Breakdown</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Most utilized capabilities across writing sessions in the last {timeRange} days.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {aggregatedFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${feat.bg} ${feat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-neutral-200">{feat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 font-mono">
                      <span>{feat.count} uses</span>
                      <span className="font-bold text-white">({feat.percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar Meter */}
                  <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.max(4, feat.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Live Real-Time Activity Feed */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Activity Stream</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Live anonymous actions taken in the app.
            </p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
            {recentFeed.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex items-start gap-3 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-neutral-200 font-medium leading-snug">
                    {ev.label}
                  </p>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Audience Demographics & Onboarding Insights ──────────────────────── */}
      <div className="p-7 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-brand-400" />
              <span>Audience Demographics &amp; Onboarding Insights</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Visual breakdown of who arrives at MD Writer, where they heard about it, age brackets, and storage choices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {surveyMetrics.total} Total Respondents
            </span>
          </div>
        </div>

        {/* 4 Demographics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Cloud Sync Preference</div>
            <div className="text-xl font-black text-white flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-brand-400" />
              <span>
                {surveyMetrics.total > 0
                  ? `${Math.round((surveyMetrics.cloudSyncCount / surveyMetrics.total) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500">{surveyMetrics.cloudSyncCount} requested cloud sync</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Offline Guest Ratio</div>
            <div className="text-xl font-black text-white flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>
                {surveyMetrics.total > 0
                  ? `${Math.round((surveyMetrics.offlineCount / surveyMetrics.total) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500">{surveyMetrics.offlineCount} writing locally</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Registered Accounts</div>
            <div className="text-xl font-black text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{surveyMetrics.registeredCount}</span>
            </div>
            <p className="text-[10px] text-neutral-500">Linked to verified email IDs</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Offline Guests</div>
            <div className="text-xl font-black text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{surveyMetrics.offlineCount}</span>
            </div>
            <p className="text-[10px] text-neutral-500">Tracked as User #1, User #2...</p>
          </div>
        </div>

        {/* Cloud Sync vs Offline Split Bar */}
        <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-brand-400" />
              <span>Cloud Sync ({surveyMetrics.cloudSyncCount})</span>
            </span>
            <span className="text-neutral-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Local Only ({surveyMetrics.offlineCount})</span>
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
              style={{
                width: `${surveyMetrics.total > 0 ? (surveyMetrics.cloudSyncCount / surveyMetrics.total) * 100 : 50}%`
              }}
            />
            <div 
              className="h-full bg-emerald-500/80 transition-all duration-500"
              style={{
                width: `${surveyMetrics.total > 0 ? (surveyMetrics.offlineCount / surveyMetrics.total) * 100 : 50}%`
              }}
            />
          </div>
        </div>

        {/* 3-Column Demographic Distribution Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Card 1: Referral Channels */}
          <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Discovery Channels</span>
              </h4>
              <span className="text-[10px] text-neutral-500">Where users found us</span>
            </div>

            <div className="space-y-3">
              {Object.entries(surveyMetrics.byReferral).map(([ch, count]) => {
                const pct = Math.round((count / Math.max(surveyMetrics.total, 1)) * 100);
                return (
                  <div key={ch} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium">{ch}</span>
                      <span className="text-neutral-500 font-mono text-[11px]">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: User Roles */}
          <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Primary Roles</span>
              </h4>
              <span className="text-[10px] text-neutral-500">Profession / Focus</span>
            </div>

            <div className="space-y-3">
              {Object.entries(surveyMetrics.byRole).map(([roleName, count]) => {
                const pct = Math.round((count / Math.max(surveyMetrics.total, 1)) * 100);
                return (
                  <div key={roleName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium">{roleName}</span>
                      <span className="text-neutral-500 font-mono text-[11px]">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Age Brackets & Writing Goals */}
          <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5 text-amber-400" />
                <span>Age Brackets &amp; Goals</span>
              </h4>
              <span className="text-[10px] text-neutral-500">Demographics</span>
            </div>

            {/* Age meters */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Age Brackets</div>
              <div className="grid grid-cols-3 gap-2">
                {(['10-18', '18-40', '40+'] as const).map((bracket) => {
                  const count = surveyMetrics.byAge[bracket] || 0;
                  const pct = Math.round((count / Math.max(surveyMetrics.total, 1)) * 100);
                  return (
                    <div key={bracket} className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                      <div className="text-xs font-bold text-white">{bracket}</div>
                      <div className="text-sm font-black text-amber-400 mt-0.5">{count}</div>
                      <div className="text-[10px] text-neutral-500">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goals list */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Primary Writing Goals</div>
              <div className="space-y-2">
                {Object.entries(surveyMetrics.byFocus).slice(0, 3).map(([goal, count]) => (
                  <div key={goal} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 truncate max-w-[170px]">{goal}</span>
                    <span className="text-neutral-500 font-mono text-[11px]">{count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ── Audience Roster: Registered Emails vs Offline User #1, #2 ─────── */}
        <div className="space-y-3 pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span>Recent Onboarded Users</span>
            </h4>
            <span className="text-[11px] text-neutral-500">
              Shows email for registered users, and User #N for offline guests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-2">User Identity</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Age Bracket</th>
                  <th className="pb-2">Discovery Source</th>
                  <th className="pb-2">Primary Goal</th>
                  <th className="pb-2 text-right">Workspace Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {surveyResponses.map((r: SurveyResponse) => (
                  <tr key={r.id + r.timestamp} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2.5 font-semibold text-white">
                      {r.isRegistered ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-indigo-400 font-mono">{r.email || r.id}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Linked
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-300 font-mono font-bold">{r.id}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                            Offline
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-neutral-300">{r.role}</td>
                    <td className="py-2.5 text-neutral-400 font-mono">{r.ageGroup}</td>
                    <td className="py-2.5 text-neutral-400">{r.referralSource}</td>
                    <td className="py-2.5 text-neutral-400 truncate max-w-[180px]">{r.primaryFocus}</td>
                    <td className="py-2.5 text-right">
                      {r.mode === 'cloud_sync' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          <Cloud className="w-3 h-3" />
                          <span>Cloud Sync</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                          <HardDrive className="w-3 h-3" />
                          <span>Offline</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
