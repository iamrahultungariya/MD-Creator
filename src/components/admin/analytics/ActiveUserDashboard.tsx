import React, { useState, useMemo, useEffect } from 'react';
import { telemetryService, DailyMetricRecord, ActivityEvent, TrackedFeature } from '../../../services/telemetryService';
import { SmoothMountainChart } from './SmoothMountainChart';

interface ActiveUserDashboardProps {
  onRefresh?: () => void;
}

type FeedFilterCategory = 'ALL' | 'EXPORTS' | 'AI ASSISTS' | 'SESSIONS';

export const ActiveUserDashboard: React.FC<ActiveUserDashboardProps> = ({ onRefresh }) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [feedFilter, setFeedFilter] = useState<FeedFilterCategory>('ALL');

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
      category: string;
    }[] = [
      { id: 'pdf_export', name: 'Clean PDF Export', category: 'Export' },
      { id: 'docx_export', name: 'Word (.docx) Export', category: 'Export' },
      { id: 'md_export', name: 'Markdown (.md) Export', category: 'Export' },
      { id: 'slash_commands', name: 'Slash Command Inserts', category: 'Editor' },
      { id: 'table_builder', name: 'Visual Table Builder', category: 'Editor' },
      { id: 'presentation_deck', name: 'Presentation Slide Deck', category: 'Preview' },
      { id: 'katex_math', name: 'KaTeX Formula Engine', category: 'Typography' },
      { id: 'focus_sprint', name: 'Focus Sprint Timer', category: 'Productivity' },
      { id: 'mermaid_diagram', name: 'Mermaid UML & Charts', category: 'Visualization' },
      { id: 'mimo_ai', name: 'Mimo AI Assistant', category: 'AI Intelligence' },
      { id: 'web_publish', name: 'Web Document Publishing', category: 'Publishing' },
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

  // ── Document Export Breakdown ───────────────────────────────────────────────
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

  // ── Mimo AI Velocity ───────────────────────────────────────────────────────
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

  // ── Diurnal Time Distribution ───────────────────────────────────────────────
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
      { label: 'MORNING (06-12)', count: morning, pct: Math.round((morning / total) * 100) },
      { label: 'AFTERNOON (12-18)', count: afternoon, pct: Math.round((afternoon / total) * 100) },
      { label: 'EVENING (18-24)', count: evening, pct: Math.round((evening / total) * 100) },
      { label: 'NIGHT (00-06)', count: night, pct: Math.round((night / total) * 100) },
    ];
  }, [recentFeed]);

  // ── Filtered Activity Feed ──────────────────────────────────────────────────
  const filteredFeed = useMemo(() => {
    if (feedFilter === 'ALL') return recentFeed;
    if (feedFilter === 'EXPORTS') {
      return recentFeed.filter((ev) =>
        ev.label.toLowerCase().includes('export') ||
        ev.label.toLowerCase().includes('pdf') ||
        ev.label.toLowerCase().includes('docx') ||
        ev.label.toLowerCase().includes('download')
      );
    }
    if (feedFilter === 'AI ASSISTS') {
      return recentFeed.filter((ev) =>
        ev.label.toLowerCase().includes('ai') ||
        ev.label.toLowerCase().includes('mimo') ||
        ev.label.toLowerCase().includes('slash')
      );
    }
    if (feedFilter === 'SESSIONS') {
      return recentFeed.filter((ev) =>
        ev.label.toLowerCase().includes('session') ||
        ev.label.toLowerCase().includes('write') ||
        ev.label.toLowerCase().includes('editor') ||
        ev.label.toLowerCase().includes('open')
      );
    }
    return recentFeed;
  }, [recentFeed, feedFilter]);

  const getEventTag = (label: string): string => {
    const l = label.toLowerCase();
    if (l.includes('export') || l.includes('pdf') || l.includes('docx')) return '[EXPORT]';
    if (l.includes('ai') || l.includes('mimo') || l.includes('slash')) return '[AI ASSIST]';
    if (l.includes('session') || l.includes('write')) return '[WRITING]';
    return '[SYSTEM]';
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-150">
      
      {/* ── Zero-Icon Top Command Dock ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Analytics &amp; Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/80">
              [LIVE SYNC]
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Anonymous aggregate telemetry: visitor cohorts, active writers, session dwell time, and workflow features.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Time Window Switcher (Zero-Icon Monospace Pills) */}
          <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/90 rounded-xl text-xs font-mono font-semibold">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setTimeRange(days as any)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                  timeRange === days
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metric Cards (Zero Icons) ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Visitors & Cohort Split */}
        <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2">
          <div className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Total Audience
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100">
              {todayRecord.visitors}
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {totalPeriodVisitors} in {timeRange}d
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-sky-700 dark:text-sky-300">
              NEW: <span className="font-bold tabular-nums">{todayRecord.newVisitors ?? Math.round(todayRecord.visitors * 0.45)}</span>
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-indigo-700 dark:text-indigo-300">
              RETURNING: <span className="font-bold tabular-nums">{todayRecord.returningVisitors ?? Math.max(0, todayRecord.visitors - (todayRecord.newVisitors ?? Math.round(todayRecord.visitors * 0.45)))}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Active Writers (DAU) */}
        <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2">
          <div className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Active Writers (DAU)
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
              {todayRecord.activeWriters}
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              {todayRecord.visitors > 0
                ? `${Math.round((todayRecord.activeWriters / todayRecord.visitors) * 100)}% CONVERSION`
                : 'ACTIVE TODAY'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            <span>{totalPeriodWriters} total active sessions</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Card 3: Avg Writing Time */}
        <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2">
          <div className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Avg Writing Dwell
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatSeconds(avgPeriodSessionSeconds)}
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              Per writer
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/60 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
            {formatSeconds(dailyMetrics.reduce((s, d) => s + d.totalSessionSeconds, 0))} aggregate time logged
          </div>
        </div>

        {/* Card 4: Top Feature Adoption */}
        <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2">
          <div className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            Lead Capability
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-base font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
              {topFeature ? topFeature.name : 'Waiting data'}
            </div>
            <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-300 font-semibold">
              {topFeature ? `${topFeature.percentage}%` : '0%'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/60 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>{aggregatedFeatures.totalFeatureUses} total actions</span>
            <span>{aggregatedFeatures.list.length} tracked</span>
          </div>
        </div>

      </div>

      {/* ── Smooth Mountain Spline Area Chart (Zero Icons) ─────────────────── */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Audience Velocity &amp; Retention Spline
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Catmull-Rom cubic Bezier curves comparing New Visitors, Returning Users, and Active Writers.
            </p>
          </div>

          {/* Monospace Legend Summary */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
              NEW: {totalPeriodNewVisitors}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
              RETURNING: {totalPeriodReturning}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 font-semibold">
              ACTIVE: {totalPeriodWriters}
            </span>
          </div>
        </div>

        {/* SVG Smooth Mountain Chart Component */}
        <SmoothMountainChart data={dailyMetrics} height={200} />
      </div>

      {/* ── Export Distribution & Mimo AI Velocity (Zero Icons) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Module 1: Export Format Ratio */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Document Export Ratio
            </h3>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {exportBreakdown.total} total downloads
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Ratio of documents downloaded across formats in the current period.
          </p>

          {/* Tri-Color Stacked Ratio Bar */}
          <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden flex border border-neutral-200 dark:border-neutral-800">
            {exportBreakdown.total === 0 ? (
              <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800/50" />
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

          {/* Format Typographic Columns */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/60">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">PDF FORMAT</span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5 tabular-nums">
                {exportBreakdown.pdf.count} <span className="text-[10px] text-neutral-400 font-normal">({exportBreakdown.pdf.pct}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/60">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">WORD .DOCX</span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5 tabular-nums">
                {exportBreakdown.docx.count} <span className="text-[10px] text-neutral-400 font-normal">({exportBreakdown.docx.pct}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/60">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">MARKDOWN .MD</span>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5 tabular-nums">
                {exportBreakdown.md.count} <span className="text-[10px] text-neutral-400 font-normal">({exportBreakdown.md.pct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Mimo AI Velocity & Diurnal Spread */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Mimo AI Assists &amp; Diurnal Spread
            </h3>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {mimoVelocity.totalAssists} total assists
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            AI queries, slash command injections, and writing activity peaks by time of day.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/60">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">AI CHAT QUERIES</span>
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {mimoVelocity.aiQueries}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/60">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">SLASH COMMAND INSERTS</span>
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {mimoVelocity.slashAssists}
              </span>
            </div>
          </div>

          {/* Diurnal Time Spread */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
              Activity Peak by Hour Window:
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
              {diurnalStats.map((d) => (
                <div key={d.label} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800/70 text-center">
                  <div className="text-neutral-500 dark:text-neutral-400 text-[9px] truncate mb-0.5">
                    {d.label.split(' ')[0]}
                  </div>
                  <span className="text-neutral-900 dark:text-neutral-100 font-bold tabular-nums text-xs">
                    {d.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Feature Usage Breakdown & Recent Real-Time Stream (Zero Icons) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Feature Usage Breakdown (Ranked Telemetry) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Feature Utilization Ranking
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Most utilized capabilities across writing sessions in the last {timeRange} days.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {aggregatedFeatures.totalFeatureUses} total events
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {aggregatedFeatures.totalFeatureUses === 0 ? (
              <div className="py-8 text-center space-y-1.5 font-mono text-xs text-neutral-400">
                <p className="font-semibold text-neutral-500">NO TELEMETRY RECORDED YET</p>
                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                  Features such as PDF export, table builders, and slash commands will appear here as users engage.
                </p>
              </div>
            ) : (
              aggregatedFeatures.list.map((feat, idx) => {
                const rankNumber = String(idx + 1).padStart(2, '0');
                return (
                  <div key={feat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 w-5 shrink-0">
                          {rankNumber}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-200 truncate">
                          {feat.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/80 hidden sm:inline">
                          {feat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-mono text-[11px] shrink-0">
                        <span>{feat.count} uses</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-200 tabular-nums">({feat.percentage}%)</span>
                      </div>
                    </div>

                    {/* Minimalist Progress Bar Meter */}
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-800 dark:bg-neutral-200 transition-all duration-300"
                        style={{ width: `${Math.max(2, feat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Filterable Real-Time Stream */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3 flex flex-col">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Live Telemetry Stream
              </h3>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                {filteredFeed.length} events
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Live anonymous actions taken in the app.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono pt-0.5">
            {(['ALL', 'EXPORTS', 'AI ASSISTS', 'SESSIONS'] as FeedFilterCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFeedFilter(cat)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  feedFilter === cat
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/80 dark:border-neutral-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-80 pr-1 mt-1">
            {filteredFeed.length === 0 ? (
              <div className="py-10 text-center space-y-1 font-mono text-xs text-neutral-400">
                <p className="font-semibold text-neutral-500">NO RECENT ACTIVITY</p>
                <p className="text-[10px] text-neutral-400 max-w-[180px] mx-auto">
                  Live user interactions will stream here in real time.
                </p>
              </div>
            ) : (
              filteredFeed.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/70 dark:border-neutral-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {getEventTag(ev.label)}
                    </span>
                    <span>
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-neutral-900 dark:text-neutral-200 font-medium leading-snug">
                    {ev.label}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
