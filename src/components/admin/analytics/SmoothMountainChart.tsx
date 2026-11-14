import React, { useState, useMemo } from 'react';
import { DailyMetricRecord } from '../../../services/telemetryService';

export interface Point {
  x: number;
  y: number;
}

export type CohortFilterMode = 'all' | 'new' | 'returning' | 'active';

/**
 * Converts discrete data points into a smooth Catmull-Rom cubic Bezier SVG path
 * providing flowing, natural mountain ridges instead of sharp linear zig-zags.
 */
export function generateSmoothSplinePath(
  points: Point[],
  baselineY: number
): { linePath: string; areaPath: string } {
  if (points.length === 0) {
    return { linePath: '', areaPath: '' };
  }

  if (points.length === 1) {
    const pt = points[0];
    const linePath = `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    const areaPath = `${linePath} L ${pt.x.toFixed(1)},${baselineY.toFixed(1)} Z`;
    return { linePath, areaPath };
  }

  let linePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const pPrev = i > 0 ? points[i - 1] : points[0];
    const pCurr = points[i];
    const pNext = points[i + 1];
    const pAfter = i + 2 < points.length ? points[i + 2] : pNext;

    // Catmull-Rom tension calculation (k = 6)
    const cp1x = pCurr.x + (pNext.x - pPrev.x) / 6;
    const cp1y = Math.min(baselineY, Math.max(0, pCurr.y + (pNext.y - pPrev.y) / 6));

    const cp2x = pNext.x - (pAfter.x - pCurr.x) / 6;
    const cp2y = Math.min(baselineY, Math.max(0, pNext.y - (pAfter.y - pCurr.y) / 6));

    linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${pNext.x.toFixed(1)},${pNext.y.toFixed(1)}`;
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(1)},${baselineY.toFixed(1)} L ${firstPoint.x.toFixed(1)},${baselineY.toFixed(1)} Z`;

  return { linePath, areaPath };
}

export interface SmoothMountainChartProps {
  data: DailyMetricRecord[];
  height?: number;
  width?: number;
  onHoverRecord?: (record: DailyMetricRecord | null) => void;
}

export const SmoothMountainChart: React.FC<SmoothMountainChartProps> = ({
  data,
  height = 240,
  width = 1000,
  onHoverRecord,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeCohort, setActiveCohort] = useState<CohortFilterMode>('all');

  const baselineY = height - 32;
  const chartTopPadding = 24;
  const horizontalPadding = 56;

  // Cohort visibility
  const isAll = activeCohort === 'all';
  const showNew = isAll || activeCohort === 'new';
  const showReturning = isAll || activeCohort === 'returning';
  const showActive = isAll || activeCohort === 'active';

  // Dynamic Y-axis scale based on the visible cohort(s)
  const activeMax = useMemo(() => {
    let highest = 4;
    data.forEach((d) => {
      const newV = d.newVisitors ?? Math.round(d.visitors * 0.45);
      const retV = d.returningVisitors ?? Math.max(0, d.visitors - newV);
      const actV = d.activeWriters;

      if (activeCohort === 'new') highest = Math.max(highest, newV);
      else if (activeCohort === 'returning') highest = Math.max(highest, retV);
      else if (activeCohort === 'active') highest = Math.max(highest, actV);
      else highest = Math.max(highest, d.visitors, newV, retV, actV);
    });
    return Math.ceil(highest * 1.2);
  }, [data, activeCohort]);

  const getX = (idx: number) => {
    if (data.length <= 1) return width / 2;
    return horizontalPadding + (idx / (data.length - 1)) * (width - horizontalPadding * 2);
  };

  const getY = (val: number) => {
    const usableHeight = baselineY - chartTopPadding;
    const clampedVal = Math.max(0, val);
    return baselineY - (clampedVal / activeMax) * usableHeight;
  };

  // Build coordinate arrays for the 3 ridges
  const newVisitorPoints: Point[] = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.newVisitors ?? Math.round(d.visitors * 0.45)),
  }));

  const returningPoints: Point[] = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.returningVisitors ?? Math.max(0, d.visitors - (d.newVisitors ?? Math.round(d.visitors * 0.45)))),
  }));

  const activeWriterPoints: Point[] = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.activeWriters),
  }));

  const newVisitorPaths = generateSmoothSplinePath(newVisitorPoints, baselineY);
  const returningPaths = generateSmoothSplinePath(returningPoints, baselineY);
  const activeWriterPaths = generateSmoothSplinePath(activeWriterPoints, baselineY);

  const activeRecord = hoverIndex !== null ? data[hoverIndex] : null;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDistance = Infinity;

    data.forEach((_, i) => {
      const dist = Math.abs(getX(i) - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });

    setHoverIndex(closestIdx);
    if (onHoverRecord) onHoverRecord(data[closestIdx]);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
    if (onHoverRecord) onHoverRecord(null);
  };

  const formatShortDate = (dateStr: string) => {
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // 4 Y-Axis Horizontal Scale Grid Markers
  const yTicks = [
    { pct: 1.0, val: activeMax },
    { pct: 0.66, val: Math.round(activeMax * 0.66) },
    { pct: 0.33, val: Math.round(activeMax * 0.33) },
    { pct: 0.0, val: 0 },
  ];

  return (
    <div className="space-y-3 font-sans">
      {/* Zero-Icon Cohort Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
          Cohort Spline Isolation:
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveCohort('all')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeCohort === 'all'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            ALL COHORTS
          </button>
          <button
            type="button"
            onClick={() => setActiveCohort('new')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeCohort === 'new'
                ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            NEW VISITORS
          </button>
          <button
            type="button"
            onClick={() => setActiveCohort('returning')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeCohort === 'returning'
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            RETURNING
          </button>
          <button
            type="button"
            onClick={() => setActiveCohort('active')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeCohort === 'active'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            ACTIVE WRITERS
          </button>
        </div>
      </div>

      <div className="relative w-full select-none overflow-hidden rounded-xl bg-neutral-950/30 p-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-60 sm:h-72 overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Sky Gradient for New Visitors */}
            <linearGradient id="skyMountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={activeCohort === 'new' ? '0.55' : '0.28'} />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>

            {/* Indigo Gradient for Returning Users */}
            <linearGradient id="indigoMountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={activeCohort === 'returning' ? '0.52' : '0.26'} />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
            </linearGradient>

            {/* Emerald Gradient for Active Writers */}
            <linearGradient id="emeraldMountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={activeCohort === 'active' ? '0.62' : '0.38'} />
              <stop offset="65%" stopColor="#34d399" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Baseline & Y-Axis Scale Grid Lines */}
          {yTicks.map((tick, i) => {
            const y = baselineY - tick.pct * (baselineY - chartTopPadding);
            return (
              <g key={i}>
                <line
                  x1={horizontalPadding}
                  y1={y}
                  x2={width - horizontalPadding + 14}
                  y2={y}
                  className="stroke-neutral-200/60 dark:stroke-neutral-800/80"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
                <text
                  x={horizontalPadding - 12}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-neutral-400 dark:fill-neutral-600 text-[10px] font-mono tabular-nums select-none"
                >
                  {tick.val}
                </text>
              </g>
            );
          })}

          {/* 1. Mountain Layer: Returning Users (Back Ridge) */}
          {showReturning && returningPaths.areaPath && (
            <path d={returningPaths.areaPath} fill="url(#indigoMountainGrad)" />
          )}
          {showReturning && returningPaths.linePath && (
            <path
              d={returningPaths.linePath}
              fill="none"
              stroke="#818cf8"
              strokeWidth={activeCohort === 'returning' ? '2.8' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeCohort === 'returning' ? '1' : isAll ? '0.85' : '0.2'}
            />
          )}

          {/* 2. Mountain Layer: New Visitors (Mid Ridge) */}
          {showNew && newVisitorPaths.areaPath && (
            <path d={newVisitorPaths.areaPath} fill="url(#skyMountainGrad)" />
          )}
          {showNew && newVisitorPaths.linePath && (
            <path
              d={newVisitorPaths.linePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={activeCohort === 'new' ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeCohort === 'new' ? '1' : isAll ? '0.9' : '0.2'}
            />
          )}

          {/* 3. Mountain Layer: Active Writers DAU (Front Ridge) */}
          {showActive && activeWriterPaths.areaPath && (
            <path d={activeWriterPaths.areaPath} fill="url(#emeraldMountainGrad)" />
          )}
          {showActive && activeWriterPaths.linePath && (
            <path
              d={activeWriterPaths.linePath}
              fill="none"
              stroke="#34d399"
              strokeWidth={activeCohort === 'active' ? '3.2' : '2.5'}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeCohort === 'active' ? '1' : isAll ? '1' : '0.2'}
            />
          )}

          {/* X-Axis Date Labels */}
          {data.map((d, i) => {
            const shouldShowLabel =
              data.length <= 10 ||
              i === 0 ||
              i === data.length - 1 ||
              i % Math.ceil(data.length / 7) === 0;

            if (!shouldShowLabel) return null;
            const x = getX(i);

            return (
              <text
                key={d.date}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-neutral-500 text-[10px] font-mono tracking-tight"
              >
                {formatShortDate(d.date)}
              </text>
            );
          })}

          {/* Active Inspection Crosshair */}
          {hoverIndex !== null && activeRecord && (
            <g className="transition-all duration-100">
              <line
                x1={getX(hoverIndex)}
                y1={chartTopPadding - 6}
                x2={getX(hoverIndex)}
                y2={baselineY}
                className="stroke-neutral-400 dark:stroke-neutral-500"
                strokeDasharray="2 2"
                strokeWidth="1.2"
              />

              {showReturning && (
                <circle
                  cx={returningPoints[hoverIndex]?.x}
                  cy={returningPoints[hoverIndex]?.y}
                  r="4"
                  fill="#818cf8"
                />
              )}

              {showNew && (
                <circle
                  cx={newVisitorPoints[hoverIndex]?.x}
                  cy={newVisitorPoints[hoverIndex]?.y}
                  r="4.5"
                  fill="#38bdf8"
                />
              )}

              {showActive && (
                <circle
                  cx={activeWriterPoints[hoverIndex]?.x}
                  cy={activeWriterPoints[hoverIndex]?.y}
                  r="5"
                  fill="#34d399"
                />
              )}
            </g>
          )}
        </svg>

        {/* Zero-Icon Floating Crosshair Tooltip (Mimo Drawer HUD) */}
        {hoverIndex !== null && activeRecord && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${(getX(hoverIndex) / width) * 100}%`,
              top: '8px',
              transform: getX(hoverIndex) > width * 0.7 ? 'translateX(-105%)' : 'translateX(10px)',
            }}
          >
            <div className="p-3 rounded-xl bg-white/95 dark:bg-neutral-950/95 border border-neutral-200/90 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xl backdrop-blur-md min-w-[185px] space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-1.5 font-mono">
                <span className="text-xs font-semibold">
                  {formatShortDate(activeRecord.date)}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {activeRecord.visitors} Total Visits
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
                  <span>NEW VISITORS</span>
                  <span className="font-bold tabular-nums">
                    {activeRecord.newVisitors ?? Math.round(activeRecord.visitors * 0.45)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                  <span>RETURNING</span>
                  <span className="font-bold tabular-nums">
                    {activeRecord.returningVisitors ?? Math.max(0, activeRecord.visitors - (activeRecord.newVisitors ?? Math.round(activeRecord.visitors * 0.45)))}
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 pt-0.5 border-t border-neutral-200/70 dark:border-neutral-800/70">
                  <span className="font-semibold">ACTIVE WRITERS</span>
                  <span className="font-bold tabular-nums">
                    {activeRecord.activeWriters}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
