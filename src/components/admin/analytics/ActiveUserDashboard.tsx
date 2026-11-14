import React, { useState, useMemo, useEffect } from 'react';
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
  Share2, 
  RefreshCw, 
  ArrowUpRight, 
  Activity,
  Layers,
  Sparkles,
  DownloadCloud,
  Sun,
  Sunset,
  Moon,
  Compass
} from 'lucide-react';
import { telemetryService, DailyMetricRecord, ActivityEvent, TrackedFeature } from '../../../services/telemetryService';
import { SmoothMountainChart } from './SmoothMountainChart';

interface ActiveUserDashboardProps {
  onRefresh?: () => void;
}

export const ActiveUserDashboard: React.FC<ActiveUserDashboardProps> = ({ onRefresh }) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricRecord[]>(() =>
    telemetryService.getDailyMetrics(14)
  );
  const [recentFeed, setRecentFeed] = useState<ActivityEvent[]>(() =>
    telemetryService.getRecentActivityFeed()
  );

  useEffect(() => {
    let active = true;
    setDailyMetrics(telemetryService.getDailyMetrics(timeRange));
    setRecentFeed(telemetryService.getRecentActivityFeed());

    Promise.all([
      telemetryService.fetchCloudDailyMetrics(timeRange),
      telemetryService.fetchCloudActivityFeed(40),
    ]).then(([cloudMetrics, cloudFeed]) => {
      if (!active) return;
      setDailyMetrics(cloudMetrics);
      setRecentFeed(cloudFeed);
    });

    return () => {
      active = false;
    };
  }, [timeRange, refreshTick]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTick((t) => t + 1);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // ── Calculated KPIs ──────────────────────────────────────────────────────────
  const todayRecord = dailyMetrics[dailyMetrics.length - 1] || {
    visitors: 0,
    newVisitors: 0,
    returningVisitors: 0,
    activeWriters: 0,
    totalSessionSeconds: 0,
    featureUsage: {},
  };

  const totalPeriodVisitors = useMemo(
    () => dailyMetrics.reduce((sum, d) => sum + d.visitors, 0),
    [dailyMetrics]
  );

  const totalPeriodNewVisitors = useMemo(
    () => dailyMetrics.reduce((sum, d) => sum + (d.newVisitors ?? Math.round(d.visitors * 0.45)), 0),
    [dailyMetrics]
  );

  const totalPeriodReturning = useMemo(
    () => dailyMetrics.reduce((sum, d) => sum + (d.returningVisitors ?? Math.max(0, d.visitors - (d.newVisitors ?? Math.round(d.visitors * 0.45)))), 0),
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
      Object.entries(d.featureUsage || {}).forEach(([feat, count]) => {
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
      { id: 'md_export', name: 'Markdown (.md) Export', icon: DownloadCloud, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { id: 'slash_commands', name: '/ Slash Commands', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      { id: 'table_builder', name: 'Table Builder', icon: Table, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { id: 'presentation_deck', name: 'Presentation Slides', icon: Presentation, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { id: 'katex_math', name: 'KaTeX Math Formulas', icon: Sigma, color: 'text-sky-400', bg: 'bg-sky-500/10' },
      { id: 'focus_sprint', name: 'Focus Sprint Timer', icon: Timer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
      { id: 'mermaid_diagram', name: 'Mermaid Diagrams', icon: GitFork, color: 'text-pink-400', bg: 'bg-pink-500/10' },
      { id: 'mimo_ai', name: 'Mimo AI Companion', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { id: 'web_publish', name: 'Web Publishing', icon: Share2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ];

    const totalFeatureUses = Object.values(totals).reduce((a, b) => a + b, 0);
    const grandTotal = totalFeatureUses || 1;

    return {
      totals,
      totalFeatureUses,
      list: featureDefinitions
        .map((f) => {
          const count = totals[f.id] || 0;
          const percentage = totalFeatureUses > 0 ? Math.round((count / grandTotal) * 100) : 0;
          return {
            ...f,
            count,
            percentage,
          };
        })
        .sort((a, b) => b.count - a.count),
    };
  }, [dailyMetrics]);

  const topFeature = aggregatedFeatures.totalFeatureUses > 0 ? aggregatedFeatures.list[0] : null;

  // ── New Analytics Module 1: Export Format Ratio ─────────────────────────────
  const exportBreakdown = useMemo(() => {
    const pdf = aggregatedFeatures.totals['pdf_export'] || 0;
    const docx = aggregatedFeatures.totals['docx_export'] || 0;
    const md = aggregatedFeatures.totals['md_export'] || 0;
    const total = pdf + docx + md;
    const safeTotal = total || 1;

    return {
      total,
      pdf: { count: pdf, pct: Math.round((pdf / safeTotal) * 100) },
      docx: { count: docx, pct: Math.round((docx / safeTotal) * 100) },
      md: { count: md, pct: Math.round((md / safeTotal) * 100) },
    };
  }, [aggregatedFeatures.totals]);

  // ── New Analytics Module 2: Mimo AI Velocity ───────────────────────────────
  const mimoVelocity = useMemo(() => {
    const aiQueries = aggregatedFeatures.totals['mimo_ai'] || 0;
    const slashAssists = aggregatedFeatures.totals['slash_commands'] || 0;
    const totalAssists = aiQueries + slashAssists;
    return {
      aiQueries,
      slashAssists,
      totalAssists,
    };
  }, [aggregatedFeatures.totals]);

  // ── New Analytics Module 3: Diurnal Time Distribution ───────────────────────
  const diurnalStats = useMemo(() => {
    let morning = 0; // 06:00 - 12:00
    let afternoon = 0; // 12:00 - 18:00
    let evening = 0; // 18:00 - 24:00
    let night = 0; // 00:00 - 06:00

    recentFeed.forEach((ev) => {
      const h = new Date(ev.timestamp).getHours();
      if (h >= 6 && h < 12) morning++;
      else if (h >= 12 && h < 18) afternoon++;
      else if (h >= 18 && h < 24) evening++;
      else night++;
    });

    const total = recentFeed.length || 1;
    return [
      { label: 'Morning (06-12)', count: morning, pct: Math.round((morning / total) * 100), icon: Sun, color: 'text-amber-400' },
      { label: 'Afternoon (12-18)', count: afternoon, pct: Math.round((afternoon / total) * 100), icon: Compass, color: 'text-sky-400' },
      { label: 'Evening (18-24)', count: evening, pct: Math.round((evening / total) * 100), icon: Sunset, color: 'text-indigo-400' },
      { label: 'Night (00-06)', count: night, pct: Math.round((night / total) * 100), icon: Moon, color: 'text-purple-400' },
    ];
  }, [recentFeed]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Mimo Header & Filter Dock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              User Activity &amp; Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Engine</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Anonymous aggregate telemetry: visitor cohorts, active writers, session dwell time, and workflow features.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Time Filter Tabs (Mimo Drawer Pill Style) */}
          <div className="flex items-center p-0.5 bg-neutral-950 border border-neutral-800/90 rounded-xl text-xs font-semibold">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as any)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                  timeRange === days
                    ? 'bg-neutral-800 text-white font-bold shadow-2xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metric Cards (Mimo Minimalist Aesthetic) ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Visitors & Cohort Split */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Total Visitors</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white tracking-tight font-mono tabular-nums">
              {todayRecord.visitors}
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {totalPeriodVisitors} in {timeRange}d
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-sky-300">
              New: <span className="font-bold tabular-nums">{todayRecord.newVisitors ?? Math.round(todayRecord.visitors * 0.45)}</span>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-indigo-300">
              Returning: <span className="font-bold tabular-nums">{todayRecord.returningVisitors ?? Math.max(0, todayRecord.visitors - (todayRecord.newVisitors ?? Math.round(todayRecord.visitors * 0.45)))}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Active Writers (DAU) */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Active Writers (DAU)</span>
            <PenTool className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono tabular-nums">
              {todayRecord.activeWriters}
            </div>
            <span className="text-[11px] font-mono text-emerald-400/90 font-semibold">
              {todayRecord.visitors > 0
                ? `${Math.round((todayRecord.activeWriters / todayRecord.visitors) * 100)}% Conversion`
                : 'Active today'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>{totalPeriodWriters} total active sessions</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Card 3: Avg Writing Time */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Focused Writing Dwell</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white tracking-tight font-mono tabular-nums">
              {formatSeconds(avgPeriodSessionSeconds)}
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Per writer
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-800/60 text-[11px] font-mono text-neutral-400 truncate">
            {formatSeconds(dailyMetrics.reduce((s, d) => s + d.totalSessionSeconds, 0))} aggregate time logged
          </div>
        </div>

        {/* Card 4: Top Workflow Action */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium tracking-tight">Top Feature Adoption</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold text-white tracking-tight truncate">
              {topFeature ? topFeature.name : 'Waiting data'}
            </div>
            <span className="text-[11px] font-mono text-purple-400 font-semibold">
              {topFeature ? `${topFeature.percentage}%` : '0%'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-800/60 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>{aggregatedFeatures.totalFeatureUses} total actions</span>
            <span>{aggregatedFeatures.list.length} features</span>
          </div>
        </div>

      </div>

      {/* ── Smooth Mountain Spline Area Chart ───────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <span>Smooth Mountain User Activity Spline</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Flowing cubic Bezier curves comparing New Visitors, Returning Users, and Active Writers.
            </p>
          </div>

          {/* Mimo Legend Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-neutral-300">New Visitors ({totalPeriodNewVisitors})</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-neutral-300">Returning ({totalPeriodReturning})</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-neutral-300 font-semibold">Active Writers ({totalPeriodWriters})</span>
            </div>
          </div>
        </div>

        {/* SVG Smooth Mountain Chart Component */}
        <SmoothMountainChart data={dailyMetrics} height={200} />
      </div>

      {/* ── New Analytics Row: Export Distribution & Mimo AI Velocity ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Module 1: Export Format Ratio */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Document Export Breakdown</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {exportBreakdown.total} total downloads
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Ratio of documents downloaded across formats in the current period.
          </p>

          {/* Tri-Color Stacked Ratio Bar */}
          <div className="w-full h-3 rounded-full bg-neutral-950 overflow-hidden flex border border-neutral-800/70">
            {exportBreakdown.total === 0 ? (
              <div className="w-full h-full bg-neutral-800/50" />
            ) : (
              <>
                <div
                  style={{ width: `${exportBreakdown.pdf.pct}%` }}
                  className="h-full bg-rose-500 transition-all duration-300"
                  title={`PDF: ${exportBreakdown.pdf.count} (${exportBreakdown.pdf.pct}%)`}
                />
                <div
                  style={{ width: `${exportBreakdown.docx.pct}%` }}
                  className="h-full bg-blue-500 transition-all duration-300"
                  title={`Word: ${exportBreakdown.docx.count} (${exportBreakdown.docx.pct}%)`}
                />
                <div
                  style={{ width: `${exportBreakdown.md.pct}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`Markdown: ${exportBreakdown.md.count} (${exportBreakdown.md.pct}%)`}
                />
              </>
            )}
          </div>

          {/* Format Legend Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>PDF Format</span>
              </div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {exportBreakdown.pdf.count} <span className="text-[10px] text-neutral-500 font-normal">({exportBreakdown.pdf.pct}%)</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
              <div className="flex items-center gap-1.5 text-blue-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Word .docx</span>
              </div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {exportBreakdown.docx.count} <span className="text-[10px] text-neutral-500 font-normal">({exportBreakdown.docx.pct}%)</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Markdown .md</span>
              </div>
              <div className="text-sm font-bold text-white mt-1 tabular-nums">
                {exportBreakdown.md.count} <span className="text-[10px] text-neutral-500 font-normal">({exportBreakdown.md.pct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Mimo AI Collaboration Velocity & Diurnal Spread */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">Mimo AI &amp; Time Distribution</h3>
            </div>
            <span className="text-xs font-mono text-purple-300">
              {mimoVelocity.totalAssists} total assists
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            AI queries, slash command injections, and writing activity peaks by time of day.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
              <span className="text-[10px] text-neutral-400 block">AI Chat Queries</span>
              <span className="text-base font-bold text-purple-300 tabular-nums">
                {mimoVelocity.aiQueries}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
              <span className="text-[10px] text-neutral-400 block">Slash Command Inserts</span>
              <span className="text-base font-bold text-amber-300 tabular-nums">
                {mimoVelocity.slashAssists}
              </span>
            </div>
          </div>

          {/* Diurnal Mini Bar */}
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-medium text-neutral-400">Activity Peak by Hour:</div>
            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
              {diurnalStats.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800/70 text-center">
                    <div className="flex items-center justify-center gap-1 text-neutral-400 mb-0.5">
                      <Icon className={`w-3 h-3 ${d.color}`} />
                    </div>
                    <span className="text-neutral-200 font-bold tabular-nums">{d.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── Feature Usage Breakdown & Recent Real-Time Stream ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Feature Usage Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Feature Usage Breakdown</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Most utilized capabilities across writing sessions in the last {timeRange} days.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {aggregatedFeatures.totalFeatureUses === 0 ? (
              <div className="py-8 text-center space-y-1.5">
                <Layers className="w-6 h-6 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">No feature usage recorded yet</p>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  Features such as PDF export, table builders, and slash commands will appear here as users engage.
                </p>
              </div>
            ) : (
              aggregatedFeatures.list.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-md ${feat.bg} ${feat.color}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-neutral-200">{feat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                        <span>{feat.count} uses</span>
                        <span className="font-semibold text-neutral-200">({feat.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar Meter */}
                    <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-400/80 transition-all duration-300"
                        style={{ width: `${Math.max(3, feat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Real-Time Stream */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Activity Stream</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live anonymous actions taken in the app.
            </p>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-80 pr-1">
            {recentFeed.length === 0 ? (
              <div className="py-10 text-center space-y-1.5">
                <Activity className="w-6 h-6 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">No activity recorded yet</p>
                <p className="text-[11px] text-neutral-500 max-w-[180px] mx-auto">
                  Live user interactions will stream here in real time.
                </p>
              </div>
            ) : (
              recentFeed.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-start gap-2.5 text-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-neutral-200 font-medium leading-snug">
                      {ev.label}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
