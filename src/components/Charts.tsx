import React, { useState } from "react";

interface TrendPoint {
  date: string;
  label: string;
  rate: number;
  presentCount: number;
  total: number;
}

function buildSmoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx.toFixed(1)} ${p0.y.toFixed(1)}, ${cx.toFixed(1)} ${p1.y.toFixed(
      1
    )}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

export const AttendanceTrendChart: React.FC<{ data: TrendPoint[] }> = ({
  data,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No attendance sessions recorded yet.
      </div>
    );
  }

  const width = 640;
  const height = 256;
  const padL = 42;
  const padR = 18;
  const padT = 20;
  const padB = 34;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const minY = 50;
  const maxY = 100;

  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? padL + innerW / 2
        : padL + (i / (data.length - 1)) * innerW;
    const clamped = Math.max(minY, Math.min(maxY, d.rate));
    const y = padT + innerH - ((clamped - minY) / (maxY - minY)) * innerH;
    return { x, y, ...d };
  });

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
          padT + innerH
        ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + innerH).toFixed(1)} Z`
      : "";

  const yTicks = [50, 65, 80, 90, 100];
  const hovered = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-64 overflow-visible"
        role="img"
        aria-label="Attendance percentage trend chart"
      >
        <defs>
          <linearGradient id="attAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.36" />
            <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="attLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padT + innerH - ((tick - minY) / (maxY - minY)) * innerH;
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke={
                  tick === 80
                    ? "rgba(59, 130, 246, 0.22)"
                    : "rgba(148, 163, 184, 0.11)"
                }
                strokeDasharray="4 4"
              />
              <text
                x={padL - 9}
                y={y + 3.5}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono tabular-nums"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={padT}
            y2={padT + innerH}
            stroke="rgba(167, 139, 250, 0.35)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {areaPath && <path d={areaPath} fill="url(#attAreaGrad)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#attLineGrad)"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
        )}

        {points.map((p, idx) => {
          const active = hoveredIdx === idx;
          return (
            <g key={p.date}>
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                className={`text-[10px] font-mono tabular-nums transition-colors ${
                  active ? "fill-blue-300 font-semibold" : "fill-slate-400"
                }`}
              >
                {p.label}
              </text>
              {active && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={10}
                  fill="rgba(59, 130, 246, 0.22)"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 5 : 3.5}
                fill={active ? "#c084fc" : "#60a5fa"}
                stroke="#070b1a"
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <rect
                x={p.x - 18}
                y={padT}
                width={36}
                height={innerH + 16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute top-2 right-3 px-3.5 py-2.5 rounded-xl bg-[#0a1026]/95 border border-indigo-400/30 shadow-xl text-xs backdrop-blur-md">
          <div className="font-mono text-[11px] text-slate-400">
            Session {hovered.date}
          </div>
          <div className="font-mono tabular-nums font-semibold text-blue-300 mt-0.5">
            {hovered.rate}% present · {hovered.presentCount}/{hovered.total} students
          </div>
        </div>
      )}
    </div>
  );
};

interface CourseBar {
  courseCode: string;
  courseName: string;
  average: number;
  submissions: number;
}

export const CoursePerformanceChart: React.FC<{ data: CourseBar[] }> = ({
  data,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No graded assignments recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {data.map((item, idx) => {
        const isHovered = hoveredIdx === idx;
        return (
          <div
            key={item.courseCode}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="p-3 rounded-xl bg-[#0a1026]/60 border border-slate-800/80 hover:border-indigo-400/30 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex items-center gap-2">
                <span className="font-mono font-semibold text-blue-300 shrink-0">
                  {item.courseCode}
                </span>
                <span className="text-slate-200 font-medium truncate">
                  {item.courseName}
                </span>
              </div>
              <div className="font-mono tabular-nums text-white font-semibold shrink-0">
                {item.average}%
                <span className="text-slate-400 font-normal ml-1.5">
                  · {item.submissions} graded
                </span>
              </div>
            </div>

            <div className="relative h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isHovered
                    ? "bg-gradient-to-r from-sky-400 via-blue-500 to-violet-400"
                    : "bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(2, item.average))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DeptBreakdownItem {
  department: string;
  count: number;
  avgGpa: number;
}

const DEPT_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#a855f7"];

export const DepartmentDonutChart: React.FC<{
  data: DeptBreakdownItem[];
  totalStudents: number;
}> = ({ data, totalStudents }) => {
  const size = 136;
  const strokeW = 14;
  const radius = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label="Cohort distribution by department"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(30, 41, 59, 0.7)"
            strokeWidth={strokeW}
          />
          {data.map((item, idx) => {
            const fraction = totalStudents > 0 ? item.count / totalStudents : 0;
            const dash = fraction * circumference;
            const offset = -accumulated * circumference;
            accumulated += fraction;

            return (
              <circle
                key={item.department}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={DEPT_COLORS[idx % DEPT_COLORS.length]}
                strokeWidth={strokeW}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono tabular-nums text-xl font-semibold text-white">
            {totalStudents}
          </span>
          <span className="text-[11px] text-slate-400">Enrolled</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {data.map((item, idx) => (
          <div
            key={item.department}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: DEPT_COLORS[idx % DEPT_COLORS.length] }}
              />
              <span className="text-slate-200 truncate">{item.department}</span>
            </div>
            <div className="font-mono tabular-nums text-slate-400 shrink-0">
              <span className="text-white font-medium">{item.count}</span> · GPA{" "}
              {item.avgGpa.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
