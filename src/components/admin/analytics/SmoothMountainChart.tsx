import React, { useState } from 'react';
import { DailyMetricRecord } from '../../../services/telemetryService';

export interface Point {
  x: number;
  y: number;
}

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
  height = 200,
  width = 720,
  onHoverRecord,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const baselineY = height - 28;
  const chartTopPadding = 24;
  const horizontalPadding = 36;

  // Maximum metric value across new, returning, and active
  const maxMetricValue = Math.max(
    ...data.map((d) => Math.max(d.visitors, d.newVisitors || 0, d.returningVisitors || 0, d.activeWriters)),
    8
  );

  const getX = (idx: number) => {
    if (data.length <= 1) return width / 2;
    return horizontalPadding + (idx / (data.length - 1)) * (width - horizontalPadding * 2);
  };

  const getY = (val: number) => {
    const usableHeight = baselineY - chartTopPadding;
    const clampedVal = Math.max(0, val);
    return baselineY - (clampedVal / (maxMetricValue * 1.18)) * usableHeight;
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

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-56 sm:h-64 overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          {/* Sky Gradient for New Visitors */}
          <linearGradient id="skyMountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>

          {/* Indigo Gradient for Returning Users */}
          <linearGradient id="indigoMountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
          </linearGradient>

          {/* Emerald Gradient for Active Writers */}
          <linearGradient id="emeraldMountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#34d399" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Baseline & Subdued Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = baselineY - pct * (baselineY - chartTopPadding);
          return (
            <line
              key={i}
              x1={horizontalPadding - 10}
              y1={y}
              x2={width - horizontalPadding + 10}
              y2={y}
              stroke="#262626"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          );
        })}

        {/* 1. Mountain Layer: Returning Users (Back Ridge) */}
        {returningPaths.areaPath && (
          <path d={returningPaths.areaPath} fill="url(#indigoMountainGrad)" />
        )}
        {returningPaths.linePath && (
          <path
            d={returningPaths.linePath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        )}

        {/* 2. Mountain Layer: New Visitors (Mid Ridge) */}
        {newVisitorPaths.areaPath && (
          <path d={newVisitorPaths.areaPath} fill="url(#skyMountainGrad)" />
        )}
        {newVisitorPaths.linePath && (
          <path
            d={newVisitorPaths.linePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}

        {/* 3. Mountain Layer: Active Writers DAU (Front Ridge) */}
        {activeWriterPaths.areaPath && (
          <path d={activeWriterPaths.areaPath} fill="url(#emeraldMountainGrad)" />
        )}
        {activeWriterPaths.linePath && (
          <path
            d={activeWriterPaths.linePath}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* X-Axis Date Labels (Every other date or start/middle/end to maintain clarity) */}
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
              stroke="#525252"
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            {/* Returning Users Dot */}
            <circle
              cx={returningPoints[hoverIndex]?.x}
              cy={returningPoints[hoverIndex]?.y}
              r="4"
              fill="#818cf8"
              className="ring-2 ring-neutral-950"
            />

            {/* New Visitors Dot */}
            <circle
              cx={newVisitorPoints[hoverIndex]?.x}
              cy={newVisitorPoints[hoverIndex]?.y}
              r="4.5"
              fill="#38bdf8"
              className="ring-2 ring-neutral-950"
            />

            {/* Active Writers Dot */}
            <circle
              cx={activeWriterPoints[hoverIndex]?.x}
              cy={activeWriterPoints[hoverIndex]?.y}
              r="5"
              fill="#34d399"
              className="ring-2 ring-neutral-950"
            />
          </g>
        )}
      </svg>

      {/* Sleek Floating Crosshair Tooltip (Mimo Drawer Aesthetic) */}
      {hoverIndex !== null && activeRecord && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-75"
          style={{
            left: `${(getX(hoverIndex) / width) * 100}%`,
            top: '0px',
            transform: getX(hoverIndex) > width * 0.7 ? 'translateX(-105%)' : 'translateX(10px)',
          }}
        >
          <div className="p-3 rounded-xl bg-neutral-950/95 border border-neutral-800 text-neutral-100 shadow-xl backdrop-blur-md min-w-[170px] space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5">
              <span className="text-xs font-semibold text-white">
                {formatShortDate(activeRecord.date)}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {activeRecord.visitors} Total
              </span>
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex items-center justify-between text-sky-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>New Visitors</span>
                </span>
                <span className="font-bold tabular-nums">
                  {activeRecord.newVisitors ?? Math.round(activeRecord.visitors * 0.45)}
                </span>
              </div>

              <div className="flex items-center justify-between text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Returning Users</span>
                </span>
                <span className="font-bold tabular-nums">
                  {activeRecord.returningVisitors ?? Math.max(0, activeRecord.visitors - (activeRecord.newVisitors ?? Math.round(activeRecord.visitors * 0.45)))}
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-300 pt-0.5 border-t border-neutral-800/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Active Writers</span>
                </span>
                <span className="font-bold tabular-nums">
                  {activeRecord.activeWriters}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
