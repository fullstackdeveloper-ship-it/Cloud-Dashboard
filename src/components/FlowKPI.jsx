import React, { useMemo } from "react";
import useKpiData from '../hooks/useKpiData.js';
import { useDateRange } from '../contexts/DateRangeContext.js';

/** ---------- Layout ---------- */
const POS = {
  GENSET: { x: 60,  y: 60 },
  LOAD:   { x: 520, y: 60 },
  PV:     { x: 60,  y: 360 },
  GRID:   { x: 520, y: 360 },
};
const SIZE   = { w: 140, h: 100 };
const CENTER = { x: 340, y: 260 };

const LOAD_CENTER = { x: POS.LOAD.x + SIZE.w / 2, y: POS.LOAD.y + SIZE.h / 2 };
const JUNCTION    = { x: POS.LOAD.x - 30, y: LOAD_CENTER.y };

function centerOf(name) {
  return {
    x: POS[name].x + SIZE.w / 2,
    y: POS[name].y + SIZE.h / 2,
  };
}

function pathToJunction(from, offsetY = 0) {
  const s = centerOf(from);
  const cx = CENTER.x;
  const cy = CENTER.y + offsetY;
  const jx = JUNCTION.x;
  const jy = JUNCTION.y;
  return `M ${s.x} ${s.y} Q ${cx} ${cy} ${jx} ${jy}`;
}

function pathJunctionToLoad() {
  return `M ${JUNCTION.x} ${JUNCTION.y} L ${LOAD_CENTER.x} ${LOAD_CENTER.y}`;
}

function curvedPath(from, to) {
  const s = centerOf(from);
  const t = centerOf(to);
  return `M ${s.x} ${s.y} Q ${CENTER.x} ${CENTER.y} ${t.x} ${t.y}`;
}

function ArrowStream({ d, kW }) {
  const thickness = Math.max(3, Math.min(kW / 60, 8));
  const speed = 8;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="#60a5fa"
        strokeWidth={thickness}
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d={d}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={thickness + 2}
        strokeLinecap="round"
        opacity="0.3"
      />

      <polygon
        points="-14,-8 0,0 -14,8"
        fill="#3b82f6"
        stroke="#fff"
        strokeWidth="1"
      >
        <animateMotion
          dur={`${speed}s`}
          repeatCount="indefinite"
          rotate="auto"
          path={d}
        />
      </polygon>

      <polygon
        points="-14,-8 0,0 -14,8"
        fill="#60a5fa"
        opacity="0.6"
      >
        <animateMotion
          dur={`${speed}s`}
          begin="1s"
          repeatCount="indefinite"
          rotate="auto"
          path={d}
        />
      </polygon>
    </g>
  );
}


/** ---------- Label badge ---------- */
function NodeDetails({ name, node }) {
  const cx = POS[name].x + SIZE.w / 2;
  const topY = POS[name].y - 80; // lift above the image
  const mainKW = `${Math.round(node.kW)} kW`;

  // Demo values from dummy data
  const extras = [];
  if (name === "LOAD") {
    extras.push({ label: "Total Load", value: `${Math.round(node.kW)} kW` });
    extras.push({ label: "Status", value: node.status || "Active" });
  }
  if (name === "GRID") {
    extras.push({ label: "Status", value: node.status || "Balanced" });
    extras.push({ label: "Exchange", value: `${Math.round(node.kW)} kW` });
  }
  if (name === "GENSET") {
    extras.push({ label: "Status", value: node.status || "Stopped" });
    extras.push({ label: "Output", value: `${Math.round(node.kW)} kW` });
  }
  if (name === "PV") {
    extras.push({ label: "Status", value: node.status || "Inactive" });
    extras.push({ label: "Generation", value: `${Math.round(node.kW)} kW` });
  }

  return (
    <g>
      <line
        x1={cx}
        y1={topY + 10}
        x2={cx}
        y2={POS[name].y - 10}
        stroke="#d1d5db"
        strokeWidth="2"
        opacity="0.9"
      />

      <text
        x={cx}
        y={topY}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#111827"
        opacity="1"
      >
        {mainKW}
      </text>

      {extras.map((e, i) => (
        <g key={i}>
          <text
            x={cx - 5}
            y={topY + 20 + i * 16}
            textAnchor="end"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fontWeight="600"
            fill="#111827"
            opacity="0.9"
          >
            {e.value}
          </text>

          <text
            x={cx + 5}
            y={topY + 20 + i * 16}
            textAnchor="start"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fill="#6b7280"
            opacity="0.8"
          >
            {e.label}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Painted-on-floor label with fake perspective */
function FloorText({ x, y, text, size = 16, skewX = -22, scaleY = 0.68, rotate = 0, opacity = 0.8, letterSpacing = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) skewX(${skewX}) scale(1 ${scaleY})`} opacity={opacity}>
      {/* thin white highlight underneath gives "printed" feel */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fontFamily="ui-sans-serif"
        fontWeight="700"
        fontSize={size}
        fill="black"
        fillOpacity="0.3"
        letterSpacing={letterSpacing}
        style={{ paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 0.3, strokeOpacity: 0.3 }}
      >
        {text}
      </text>

      {/* main ink */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fontFamily="ui-sans-serif"
        fontWeight="700"
        fontSize={size}
        fill="black"
        letterSpacing={letterSpacing}
        opacity="0.9"
      >
        {text}
      </text>
    </g>
  );
}


/** ---------- Component ---------- */
export default function FlowKPI() {
  // Get controller ID and global refresh trigger from date range context
  const { getControllerId, refreshTrigger } = useDateRange();
  const controllerId = getControllerId();
  
  // Use unified KPI data hook for power flow data
  const { data: powerFlowData, isLoading, error, isConnected, consecutiveFailures, isOffline, staleDataCount } = useKpiData(
    controllerId, 
    'powerFlow', 
    { 
      autoRefresh: true, // Enable auto-refresh for Power Flow
      enableIntervalRefresh: true, // Enable interval-based refresh
      globalRefreshTrigger: refreshTrigger
    }
  );
  
  // Fallback data in case of error or loading
  const defaultData = {
    W_PV: 0,
    W_Grid: 0,
    W_Gen: 0,
    W_Load: 0,
    status: 'offline'
  };
  
  const currentData = powerFlowData || defaultData;

  const powerFlowNodes = useMemo(() => {
    const { W_PV, W_Gen, W_Load, W_Grid } = currentData;

    // If offline after 3 consecutive failures, show N/A
    if (isOffline) {
      return {
        PV: { 
          kW: 'N/A', 
          status: 'Offline'
        },
        GENSET: { 
          kW: 'N/A', 
          status: 'Offline'
        },
        LOAD: { 
          kW: 'N/A', 
          status: 'Offline'
        },
        GRID: { 
          kW: 'N/A', 
          status: 'Offline'
        }
      };
    }

    return {
      PV: { 
        kW: W_PV || 0, 
        status: W_PV > 0 ? 'Active' : 'Inactive'
      },
      GENSET: { 
        kW: W_Gen || 0, 
        status: W_Gen > 0 ? 'Running' : 'Stopped'
      },
      LOAD: { 
        kW: W_Load || 0, 
        status: W_Load > 0 ? 'Active' : 'No Load'
      },
      GRID: { 
        kW: W_Grid || 0, 
        status: W_Grid > 0 ? 'Import' : W_Grid < 0 ? 'Export' : 'Balanced'
      }
    };
  }, [currentData, isOffline]);

  const powerFlowEdges = useMemo(() => {
    const flows = [];
    
    // If offline, don't show any flows
    if (isOffline) {
      return flows;
    }
    
    if (powerFlowNodes.PV.kW > 0 && powerFlowNodes.LOAD.kW > 0) {
      const pvToLoad = Math.min(powerFlowNodes.PV.kW, powerFlowNodes.LOAD.kW);
      if (pvToLoad > 5) {
        flows.push({ from: "PV", to: "LOAD", kW: pvToLoad });
      }
    }

    if (powerFlowNodes.GENSET.kW > 0 && powerFlowNodes.LOAD.kW > 0) {
      const gensetToLoad = Math.min(powerFlowNodes.GENSET.kW, powerFlowNodes.LOAD.kW);
      if (gensetToLoad > 5) {
        flows.push({ from: "GENSET", to: "LOAD", kW: gensetToLoad });
      }
    }

    if (powerFlowNodes.GRID.kW > 0) {
      flows.push({ from: "GRID", to: "LOAD", kW: powerFlowNodes.GRID.kW });
    }

    if (powerFlowNodes.GRID.kW < 0) {
      flows.push({ from: "PV", to: "GRID", kW: Math.abs(powerFlowNodes.GRID.kW) });
    }

    return flows;
  }, [powerFlowNodes, isOffline]);

  const toLoadEdges = useMemo(() => powerFlowEdges.filter(e => e.to === "LOAD" && e.kW > 5), [powerFlowEdges]);
  const otherEdges  = useMemo(() => powerFlowEdges.filter(e => !(e.to === "LOAD") && e.kW > 5), [powerFlowEdges]);

  const fanOffsets = useMemo(() => {
    const n = toLoadEdges.length;
    const step = 16;
    const start = -((n - 1) * step) / 2;
    return Array.from({ length: n }, (_, i) => start + i * step);
  }, [toLoadEdges.length]);

  const totalIntoLoad = useMemo(
    () => toLoadEdges.reduce((sum, e) => sum + e.kW, 0),
    [toLoadEdges]
  );

  const intoJunctionPaths = useMemo(
    () => toLoadEdges.map((e, i) => ({ id: `${e.from}-to-j`, d: pathToJunction(e.from, fanOffsets[i]), kW: e.kW })),
    [toLoadEdges, fanOffsets]
  );

  const finalIntoLoadPath = useMemo(
    () => ({ id: "junction-to-load", d: pathJunctionToLoad(), kW: totalIntoLoad }),
    [totalIntoLoad]
  );

  const otherPaths = useMemo(() => {
    return otherEdges.map(e => ({
      id: `${e.from}-${e.to}`,
      d: curvedPath(e.from, e.to),
      kW: e.kW
    }));
  }, [otherEdges]);

  return (
    <div className="h-full flex flex-col rounded-2xl shadow-xl border border-green-200/40 p-0 overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 10px 25px -5px rgba(25, 140, 26, 0.15), 0 0 0 1px rgba(25, 140, 26, 0.05)" }}>
      <div className="flex-shrink-0 px-2 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#198c1a] via-[#10b981] to-[#0097b2] bg-clip-text text-transparent">
              Power Flow Visualization
            </h3>
            <div className="h-0.5 w-16 bg-gradient-to-r from-[#198c1a] to-[#0097b2] rounded-full mt-0.5" />
            {error && (
              <div className="text-xs text-red-500 mt-1">
                Error: {error}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-xs font-medium text-gray-600">
              {isOffline ? 
                (staleDataCount >= 3 ? 'Offline (stale data)' : `Offline (${consecutiveFailures} failures)`) : 
                isLoading ? 'Syncing...' : 
                isConnected ? 'Live Data' : 
                'Connecting...'
              }
            </span>
            {currentData.updatedAt && (
              <span className="text-xs text-gray-400 font-mono">
                {new Date(currentData.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

<div className="flex-grow flex items-center justify-center overflow-hidden min-h-0" style={{ backgroundColor: "#FFFFFF" }}>
  <svg
    viewBox="0 0 720 650"
    className="w-full h-full max-h-full"
    width="100%" height="100%"
    style={{ display: "block", backgroundColor: "#FFFFFF" }}
  >
    {/* Translate everything down by 30px */}
    <g transform="translate(0,80)">
      {/* Grid (optional) */}
        <defs>
  {/* simple shadow without blur */}
  <filter id="floorShadow" x="-10%" y="-10%" width="120%" height="120%">
    <feOffset in="SourceAlpha" dx="1" dy="1" result="off"/>
    <feFlood floodColor="#000000" floodOpacity="0.2"/>
    <feComposite in2="off" operator="in"/>
    <feMerge>
      <feMergeNode/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  {/* simple gradient without animation */}
  <linearGradient id="floorInk" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"  stopColor="#1f2937" stopOpacity="0.8"/>
    <stop offset="60%" stopColor="#0f172a" stopOpacity="0.9"/>
    <stop offset="100%" stopColor="#111827" stopOpacity="0.8"/>
          </linearGradient>
        </defs>

      {/* --- floor labels (static names) --- */}
<FloorText
  x={550}
  y={170}
  text="Load"
  size={22}
  rotate={-8}
/>

<FloorText
  x={73}
  y={450}
  text="Solar"
  size={22}
  rotate={0}
/>

<FloorText
  x={580}
  y={490}
  text="Grid"
  size={22}
  rotate={0}
/>

<FloorText
  x={80}
  y={160}
  text="Genset"
  size={22}
  rotate={0}
/>



      <rect x="0" y="0" width="720" height="560" fill="url(#grid)" />

      {/* --- rest of your flows, badges, and icons go here --- */}
      {otherPaths.map(p => (
        <ArrowStream key={p.id} d={p.d} kW={p.kW} />
      ))}
      {intoJunctionPaths.map(p => (
        <ArrowStream key={p.id} d={p.d} kW={p.kW} />
      ))}
      <ArrowStream d={finalIntoLoadPath.d} kW={finalIntoLoadPath.kW} />

      <NodeDetails name="PV" node={powerFlowNodes.PV} />
      <NodeDetails name="GRID" node={powerFlowNodes.GRID} />
      <NodeDetails name="GENSET" node={powerFlowNodes.GENSET} />
      <NodeDetails name="LOAD" node={powerFlowNodes.LOAD} />


        <image
        href="/kpi-images/updated/genset.png"
        x={POS.GENSET.x - 40}
        y={POS.GENSET.y - 40}
        width={SIZE.w + 80}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        opacity="1"
        />
        <image
        href="/kpi-images/updated/load.png"
          x={428}
          y={-20}
        width={SIZE.w + 35}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        opacity="1"
        />
        <image
        href="/kpi-images/updated/solar.png"
        x={POS.PV.x - 40}
        y={POS.PV.y - 40}
        width={SIZE.w + 80}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        opacity="1"
        />
        <image
        href="/kpi-images/updated/grid.png"
        x={POS.GRID.x - 40}
        y={POS.GRID.y - 40}
        width={SIZE.w + 80}
        height={SIZE.h + 80}
        preserveAspectRatio="xMidYMid meet"
        opacity="1"
      />
    </g>
      </svg>
</div>

    </div>
  );
}