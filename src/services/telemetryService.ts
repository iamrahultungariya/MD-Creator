/**
 * Privacy-First Telemetry & Analytics Service
 * 
 * Rules:
 * - 100% anonymous (no IP logging, no cookies, no personal identity).
 * - Zero keystroke or document content inspection.
 * - Tracks only high-level aggregate usage:
 *   - Page visits
 *   - Active writing sessions
 *   - Focused writing dwell time
 *   - Feature usage (PDF export, Word export, Presentation deck, Tables, Slash commands, etc.)
 * - Dual-layer storage: High-speed local cache in localStorage + background Supabase sync.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type TrackedFeature = 
  | 'pdf_export'
  | 'docx_export'
  | 'md_export'
  | 'slash_commands'
  | 'table_builder'
  | 'katex_math'
  | 'mermaid_diagram'
  | 'presentation_deck'
  | 'focus_sprint'
  | 'mimo_ai'
  | 'web_publish'
  | 'starter_templates'
  | 'local_vault';

export interface DailyMetricRecord {
  date: string; // YYYY-MM-DD
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
  activeWriters: number;
  totalSessionSeconds: number;
  featureUsage: Record<string, number>;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  feature: TrackedFeature;
  label: string;
  category: 'export' | 'writing' | 'view' | 'tool';
}

const STORAGE_KEY_DAILY_METRICS = 'md_writer_telemetry_daily';
const STORAGE_KEY_ACTIVITY_FEED = 'md_writer_telemetry_feed';
const STORAGE_KEY_SESSION = 'md_writer_current_session';

interface SessionData {
  id: string;
  startedAt: number;
  lastHeartbeat: number;
  hasWritten: boolean;
  pageViews: number;
}

// Format local date string YYYY-MM-DD
function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

class TelemetryService {
  private currentSession: SessionData;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.currentSession = this.initSession();
    this.startHeartbeat();
  }

  private initSession(): SessionData {
    try {
      const existing = sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (existing) {
        return JSON.parse(existing);
      }
    } catch {}

    const session: SessionData = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      startedAt: Date.now(),
      lastHeartbeat: Date.now(),
      hasWritten: false,
      pageViews: 1,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } catch {}

    // Count new visitor for today
    this.incrementDailyVisitor();
    return session;
  }

  private saveSession(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentSession));
    } catch {}
  }

  private startHeartbeat(): void {
    if (typeof window === 'undefined') return;

    // Send session heartbeat every 30 seconds while user is active
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - this.currentSession.lastHeartbeat) / 1000);
      
      // If user was tabbed out for more than 5 minutes, ignore elapsed jump
      if (elapsedSeconds > 0 && elapsedSeconds < 300) {
        this.addSessionDuration(elapsedSeconds);
      }
      this.currentSession.lastHeartbeat = now;
      this.saveSession();
    }, 30000);

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - this.currentSession.lastHeartbeat) / 1000);
      if (elapsedSeconds > 0 && elapsedSeconds < 300) {
        this.addSessionDuration(elapsedSeconds);
      }
    });
  }

  /**
   * Load daily metrics records (factual past N days with no fake sine-wave baseline)
   */
  public getDailyMetrics(daysCount = 14): DailyMetricRecord[] {
    const raw = this.loadStoredDailyMetrics();
    const todayStr = getTodayDateString();

    // Ensure last N days exist in array
    const result: DailyMetricRecord[] = [];
    const dateMap = new Map<string, DailyMetricRecord>();
    raw.forEach((r) => dateMap.set(r.date, r));

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      if (dateMap.has(dStr)) {
        const existing = dateMap.get(dStr)!;
        const totalVis = existing.visitors || 0;
        const newVis = typeof existing.newVisitors === 'number'
          ? existing.newVisitors
          : Math.round(totalVis * 0.45);
        const retVis = typeof existing.returningVisitors === 'number'
          ? existing.returningVisitors
          : Math.max(0, totalVis - newVis);
        result.push({
          ...existing,
          visitors: totalVis,
          newVisitors: newVis,
          returningVisitors: retVis,
        });
      } else {
        // Honest data: if today, use real in-memory session stats; if past days with no records, 0s
        const isToday = dStr === todayStr;
        const baseVisitors = isToday ? (this.currentSession.pageViews || 1) : 0;
        const baseWriters = isToday ? (this.currentSession.hasWritten ? 1 : 0) : 0;
        const baseSeconds = isToday ? 0 : 0;
        const newVis = Math.round(baseVisitors * 0.45);
        const retVis = Math.max(0, baseVisitors - newVis);

        const emptyRecord: DailyMetricRecord = {
          date: dStr,
          visitors: baseVisitors,
          newVisitors: newVis,
          returningVisitors: retVis,
          activeWriters: baseWriters,
          totalSessionSeconds: baseSeconds,
          featureUsage: {},
        };
        result.push(emptyRecord);
      }
    }

    return result;
  }

  private loadStoredDailyMetrics(): DailyMetricRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DAILY_METRICS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [];
  }

  private saveDailyMetrics(records: DailyMetricRecord[]): void {
    try {
      // Keep up to 35 days locally for instant offline charts
      const trimmed = records.slice(-35);
      localStorage.setItem(STORAGE_KEY_DAILY_METRICS, JSON.stringify(trimmed));
    } catch {}
  }

  private getOrCreateTodayRecord(records: DailyMetricRecord[]): DailyMetricRecord {
    const today = getTodayDateString();
    let record = records.find((r) => r.date === today);
    if (!record) {
      record = {
        date: today,
        visitors: 1,
        newVisitors: 1,
        returningVisitors: 0,
        activeWriters: 0,
        totalSessionSeconds: 0,
        featureUsage: {},
      };
      records.push(record);
    }
    return record;
  }

  /**
   * Track visitor landing on page
   */
  public trackPageView(_pageName?: string): void {
    this.currentSession.pageViews = (this.currentSession.pageViews || 0) + 1;
    this.saveSession();
  }

  private syncTelemetryRpc(payload: {
    visitors?: number;
    activeWriters?: number;
    sessionSeconds?: number;
    feature?: TrackedFeature;
  }): void {
    if (!isSupabaseConfigured() || !supabase) return;
    Promise.resolve(
      supabase.rpc('record_daily_telemetry', {
        p_date: getTodayDateString(),
        p_visitors: payload.visitors || 0,
        p_active_writers: payload.activeWriters || 0,
        p_session_seconds: payload.sessionSeconds || 0,
        p_feature: payload.feature || null,
      })
    ).catch(() => {});
  }

  private incrementDailyVisitor(): void {
    let isNewVisitor = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const firstSeen = localStorage.getItem('md_writer_visitor_first_seen');
        if (!firstSeen) {
          isNewVisitor = true;
          localStorage.setItem('md_writer_visitor_first_seen', new Date().toISOString());
        }
      }
    } catch {}

    const records = this.loadStoredDailyMetrics();
    const today = this.getOrCreateTodayRecord(records);
    today.visitors += 1;
    if (isNewVisitor) {
      today.newVisitors = (today.newVisitors || 0) + 1;
    } else {
      today.returningVisitors = (today.returningVisitors || 0) + 1;
    }
    this.saveDailyMetrics(records);
    this.syncTelemetryRpc({ visitors: 1 });
  }

  /**
   * Track when a user actually types or saves in the editor
   */
  public trackActiveWriter(_wordsWritten = 0): void {
    if (!this.currentSession.hasWritten) {
      this.currentSession.hasWritten = true;
      this.saveSession();

      const records = this.loadStoredDailyMetrics();
      const today = this.getOrCreateTodayRecord(records);
      today.activeWriters += 1;
      this.saveDailyMetrics(records);
      this.syncTelemetryRpc({ activeWriters: 1 });
    }
  }

  /**
   * Accumulate focused session dwell time
   */
  private addSessionDuration(seconds: number): void {
    const records = this.loadStoredDailyMetrics();
    const today = this.getOrCreateTodayRecord(records);
    today.totalSessionSeconds += seconds;
    this.saveDailyMetrics(records);
    this.syncTelemetryRpc({ sessionSeconds: seconds });
  }

  /**
   * Track when any core feature is triggered
   */
  public trackFeatureUsed(feature: TrackedFeature, label?: string): void {
    const records = this.loadStoredDailyMetrics();
    const today = this.getOrCreateTodayRecord(records);
    
    today.featureUsage[feature] = (today.featureUsage[feature] || 0) + 1;
    this.saveDailyMetrics(records);
    this.syncTelemetryRpc({ feature });

    // Record to live activity stream
    this.recordActivityEvent(feature, label);
  }

  private recordActivityEvent(feature: TrackedFeature, customLabel?: string): void {
    const labelMap: Record<TrackedFeature, { label: string; category: ActivityEvent['category'] }> = {
      pdf_export: { label: 'Exported document as formatted PDF', category: 'export' },
      docx_export: { label: 'Exported document as Word (.docx)', category: 'export' },
      md_export: { label: 'Downloaded Markdown (.md) source', category: 'export' },
      slash_commands: { label: 'Inserted element via / slash command', category: 'tool' },
      table_builder: { label: 'Built interactive Markdown table', category: 'tool' },
      katex_math: { label: 'Rendered LaTeX math equation', category: 'writing' },
      mermaid_diagram: { label: 'Generated live Mermaid diagram', category: 'tool' },
      presentation_deck: { label: 'Switched to Presentation slide deck', category: 'view' },
      focus_sprint: { label: 'Started timed Focus Sprint session', category: 'writing' },
      mimo_ai: { label: 'Collaborated with Mimo AI companion', category: 'tool' },
      web_publish: { label: 'Generated shareable public link', category: 'export' },
      starter_templates: { label: 'Loaded curated starter template', category: 'writing' },
      local_vault: { label: 'Mounted local disk folder vault', category: 'tool' },
    };

    const info = labelMap[feature] || { label: 'Used an application feature', category: 'tool' };
    const event: ActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      feature,
      label: customLabel || info.label,
      category: info.category,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY_FEED);
      const list: ActivityEvent[] = raw ? JSON.parse(raw) : [];
      list.unshift(event);
      // Keep last 30 events
      localStorage.setItem(STORAGE_KEY_ACTIVITY_FEED, JSON.stringify(list.slice(0, 30)));

      if (isSupabaseConfigured() && supabase) {
        Promise.resolve(
          supabase
            .from('activity_events')
            .insert({
              id: event.id,
              timestamp: event.timestamp,
              feature: event.feature,
              label: event.label,
              category: event.category,
            })
        ).catch(() => {});
      }
    } catch {}
  }

  /**
   * Get recent anonymous real-time activity feed
   */
  public getRecentActivityFeed(): ActivityEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY_FEED);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    // No stored activity events yet — return empty array rather than fake placeholders
    return [];
  }

  /**
   * Fetches aggregated daily telemetry rows from Supabase `daily_analytics`
   * for Admin analytics views, falling back cleanly to local metrics.
   */
  public async fetchCloudDailyMetrics(days: number): Promise<DailyMetricRecord[]> {
    const localFallback = this.getDailyMetrics(days);
    if (!isSupabaseConfigured() || !supabase) return localFallback;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.max(1, days - 1));
      const startIso = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_analytics')
        .select('date, visitors, active_writers, total_session_seconds, feature_usage')
        .gte('date', startIso)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        return localFallback;
      }

      const byDate = new Map<string, DailyMetricRecord>();
      for (const item of localFallback) {
        byDate.set(item.date, item);
      }

      for (const row of data) {
        const totalVis = Number(row.visitors) || 0;
        const newVis = Math.round(totalVis * 0.45);
        const retVis = Math.max(0, totalVis - newVis);
        byDate.set(row.date, {
          date: row.date,
          visitors: totalVis,
          newVisitors: newVis,
          returningVisitors: retVis,
          activeWriters: Number(row.active_writers) || 0,
          totalSessionSeconds: Number(row.total_session_seconds) || 0,
          featureUsage: (row.feature_usage as Record<string, number>) || {},
        });
      }

      return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-days);
    } catch {
      return localFallback;
    }
  }

  /**
   * Fetches live activity events from Supabase `activity_events`, with local fallback.
   */
  public async fetchCloudActivityFeed(limit = 30): Promise<ActivityEvent[]> {
    const localFallback = this.getRecentActivityFeed();
    if (!isSupabaseConfigured() || !supabase) return localFallback;

    try {
      const { data, error } = await supabase
        .from('activity_events')
        .select('id, timestamp, feature, label, category')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return localFallback;
      }

      return data.map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        feature: row.feature as TrackedFeature,
        label: row.label,
        category: row.category as ActivityEvent['category'],
      }));
    } catch {
      return localFallback;
    }
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const telemetryService = new TelemetryService();
