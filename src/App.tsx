import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "upload" | "workspace";
type WorkspaceState = "idle" | "analyzing" | "results";
type MapMode = "before" | "difference" | "after";
type SensorMode = "optical" | "sar" | "fused";

// ─── Images ───────────────────────────────────────────────────────────────────
const UPLOAD_BG =
  "https://images.unsplash.com/photo-1542382235-7a38b6ec0289?w=1920&h=1080&fit=crop&auto=format";
const MAP_AFTER =
  "https://images.unsplash.com/photo-1736885054912-7467dcf5f1e7?w=1600&h=900&fit=crop&auto=format";
const MAP_BEFORE =
  "https://images.unsplash.com/photo-1626865002484-3a8ebe77c5a4?w=1600&h=900&fit=crop&auto=format";

// ─── Static data ──────────────────────────────────────────────────────────────
type AuditStatus = "waiting" | "processing" | "completed" | "failed";

type AuditEvent = {
  id: number;
  step: string;
  category: string;
  title: string;
  description: string;
  tag: string | null;
  timestamp: string;
  duration: string;
};

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 1,
    step: "STEP 01",
    category: "QUERY_INTERPRETATION",
    title: "Interpret Query",
    description: "Temporal urban change analysis intent detected.",
    tag: "CHANGE DETECTION",
    timestamp: "09:14:02.4",
    duration: "0.2s",
  },
  {
    id: 2,
    step: "STEP 02",
    category: "INPUT_INSPECTION",
    title: "Inspect Data",
    description: "2 GeoTIFF files · 24-month temporal gap",
    tag: "DATA VALIDATED",
    timestamp: "09:14:02.6",
    duration: "0.4s",
  },
  {
    id: 3,
    step: "STEP 03",
    category: "TOOL_SELECTION",
    title: "Select Tool",
    description: "ChangeDetection_V2 — multi-temporal match",
    tag: "TOOL SELECTED",
    timestamp: "09:14:03.0",
    duration: "0.6s",
  },
  {
    id: 4,
    step: "STEP 04",
    category: "MODEL_EXECUTION",
    title: "Run Analysis",
    description: "142 km² processed · 38.2 s runtime",
    tag: "COMPLETED",
    timestamp: "09:14:03.6",
    duration: "2.1s",
  },
  {
    id: 5,
    step: "STEP 05",
    category: "EVIDENCE_GENERATION",
    title: "Spatial Evidence",
    description: "+14.2% built-up · 3 zones · 94% confidence",
    tag: "EVIDENCE GENERATED",
    timestamp: "09:14:05.7",
    duration: "1.8s",
  },
  {
    id: 6,
    step: "STEP 06",
    category: "ANSWER_GENERATION",
    title: "Answer Generated",
    description: "Grounded in spatial evidence — verified.",
    tag: "VERIFIED",
    timestamp: "09:14:07.5",
    duration: "0.3s",
  },
];

const ZONES = [
  { id: 1, px: 22, py: 32, area: "2.1 km²", change: "+12.8%", confidence: "91%", source: "ChangeDetection_V2" },
  { id: 2, px: 51, py: 57, area: "3.8 km²", change: "+21.4%", confidence: "96%", source: "ChangeDetection_V2" },
  { id: 3, px: 74, py: 30, area: "1.6 km²", change: "+9.7%", confidence: "89%", source: "ChangeDetection_V2" },
];

const ANALYSIS_STEPS = [
  { label: "Understanding query", note: "" },
  { label: "Inspecting imagery", note: "2 datasets recognized" },
  { label: "Selecting analysis method", note: "Change Detection" },
  { label: "Running ChangeDetection_V2", note: "" },
  { label: "Generating spatial evidence", note: "" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Eye = ({ off }: { off?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const Check = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevDown = ({ up }: { up?: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ transform: up ? "rotate(180deg)" : undefined, display: "block" }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UploadIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
  </svg>
);

const Plus = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Minus = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Send = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const Bell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Compass = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const Fullscreen = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
  </svg>
);

const SquareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const Attach = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const Target = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const Layers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const SpinSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-6 h-6 rounded-md bg-sat-cyan flex items-center justify-center flex-shrink-0"
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="3" fill="#071018" />
          <circle cx="10" cy="10" r="8" stroke="#071018" strokeWidth="1.5" />
          <line x1="10" y1="2" x2="10" y2="5" stroke="#071018" strokeWidth="1.5" />
          <line x1="10" y1="15" x2="10" y2="18" stroke="#071018" strokeWidth="1.5" />
          <line x1="2" y1="10" x2="5" y2="10" stroke="#071018" strokeWidth="1.5" />
          <line x1="15" y1="10" x2="18" y2="10" stroke="#071018" strokeWidth="1.5" />
        </svg>
      </div>
      <span className="text-sat-text text-sm font-semibold tracking-wide">SatQuery AI</span>
    </div>
  );
}

// ─── TopNav ───────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <nav className="flex items-center justify-between px-5 h-12 border-b border-sat-border bg-sat-surface flex-shrink-0">
      <div className="flex items-center gap-7">
        <Logo />
        <div className="flex items-center gap-5 text-[11px] text-sat-muted">
          {["Projects", "Analysis", "Data Catalog"].map((item) => (
            <button key={item} className="hover:text-sat-text transition-colors">
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <button className="text-sat-muted hover:text-sat-text transition-colors">
          <Bell />
        </button>
        <button className="text-sat-muted hover:text-sat-text transition-colors">
          <SearchIcon />
        </button>
        <div className="w-7 h-7 rounded-full bg-sat-surface2 border border-sat-border flex items-center justify-center text-[10px] text-sat-cyan font-semibold">
          JD
        </div>
      </div>
    </nav>
  );
}

// ─── UploadScreen ─────────────────────────────────────────────────────────────
function UploadScreen({ onStart }: { onStart: () => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="h-full flex flex-col relative bg-sat-bg">
      <div className="absolute inset-0 z-0">
        <img
          src={UPLOAD_BG}
          alt="Aerial night view of Earth from space"
          className="w-full h-full object-cover"
          style={{ opacity: 0.32, filter: "saturate(0.5) brightness(0.8)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #071018bb 0%, #07101855 40%, #071018cc 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <TopNav />

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[600px]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-sat-border bg-sat-surface/60 text-[10px] text-sat-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-sat-cyan blink-dot" />
                Geospatial Intelligence Platform
              </div>
              <h1 className="text-[28px] font-semibold text-sat-text tracking-tight mb-2">
                Upload Satellite Data
              </h1>
              <p className="text-sat-muted text-sm leading-relaxed">
                Upload one or more satellite images to begin geospatial analysis.
              </p>
            </div>

            <div
              className="bg-sat-surface border border-sat-border rounded-2xl p-6"
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
            >
              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                }}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all mb-5 ${
                  dragging
                    ? "border-sat-cyan bg-sat-cyan/5"
                    : "border-sat-border hover:border-sat-cyan/40 hover:bg-sat-surface2/40"
                }`}
              >
                <div className={dragging ? "text-sat-cyan" : "text-sat-muted"}>
                  <UploadIcon />
                </div>
                <div className="text-center">
                  <p className="text-sat-text text-sm font-medium mb-1">
                    Drag &amp; Drop Satellite Images
                  </p>
                  <p className="text-sat-muted text-xs">or click to upload</p>
                </div>
                <p className="text-sat-muted/40 text-[11px] mt-1">
                  Supported: GeoTIFF · TIFF · HDF5 &nbsp;·&nbsp; Max 10 GB per file
                </p>
              </div>

              {/* Datasets */}
              <p className="text-[9px] text-sat-muted/60 uppercase tracking-widest font-medium mb-3">
                Uploaded Datasets
              </p>
              <div className="space-y-2 mb-5">
                {[
                  {
                    name: "Optical_Cartosat.tif",
                    size: "1.8 GB",
                    type: "OPTICAL",
                    date: "12 Jan 2024",
                    res: "0.8m",
                    colorClass: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                  },
                  {
                    name: "SAR_RISAT.tif",
                    size: "940 MB",
                    type: "SAR",
                    date: "18 Jan 2026",
                    res: "3m",
                    colorClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                  },
                ].map((ds) => (
                  <div
                    key={ds.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-sat-dark border border-sat-border"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${ds.colorClass}`}
                    >
                      <span className="text-[9px] font-bold tracking-wide">{ds.type}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sat-text text-[12px] font-medium">{ds.name}</p>
                      <p className="text-sat-muted text-[10px] mt-0.5 font-mono">
                        {ds.size} · {ds.type} · {ds.date} · {ds.res} resolution
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 flex-shrink-0">
                      <Check size={11} />
                      <span className="text-[10px]">Validated</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-sat-muted/50 text-center mb-5 leading-relaxed">
                System automatically detects sensor type, timestamps, coordinates, projection, and
                image metadata.
              </p>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sat-border text-sat-muted hover:text-sat-text hover:border-sat-cyan/30 transition-all text-xs font-medium">
                  <Plus /> Add More Files
                </button>
                <button
                  onClick={onStart}
                  className="flex-1 py-2.5 rounded-xl bg-sat-cyan text-sat-bg font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Start Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LeftSidebar ──────────────────────────────────────────────────────────────
function LeftSidebar({
  layers,
  toggleLayer,
  opacities,
  setOpacity,
}: {
  layers: Record<string, boolean>;
  toggleLayer: (k: string) => void;
  opacities: Record<string, number>;
  setOpacity: (k: string, v: number) => void;
}) {
  const [metaOpen, setMetaOpen] = useState(false);

  return (
    <div className="w-[250px] flex-shrink-0 bg-sat-surface border-r border-sat-border flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-sat-border">
        <Layers />
        <span className="text-[10px] font-semibold text-sat-text uppercase tracking-widest">
          Layers
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Datasets */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-sat-muted/60 font-medium mb-2 px-1">
            Dataset
          </p>
          {[
            {
              key: "optical",
              name: "Optical_Cartosat.tif",
              type: "OPTICAL",
              date: "12 Jan 2024",
              dot: "bg-blue-400",
            },
            {
              key: "sar",
              name: "SAR_RISAT.tif",
              type: "SAR",
              date: "18 Jan 2026",
              dot: "bg-amber-400",
            },
          ].map((ds) => (
            <div
              key={ds.key}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-sat-surface2 group mb-1 transition-colors"
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ds.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sat-text text-[11px] font-medium truncate">{ds.name}</p>
                <p className="text-sat-muted/60 text-[9px] font-mono">
                  {ds.type} · {ds.date}
                </p>
              </div>
              <button
                onClick={() => toggleLayer(ds.key)}
                className={`flex-shrink-0 transition-colors ${
                  layers[ds.key]
                    ? "text-sat-muted hover:text-sat-text"
                    : "text-sat-muted/25 hover:text-sat-muted"
                }`}
              >
                <Eye off={!layers[ds.key]} />
              </button>
            </div>
          ))}
        </div>

        {/* Analysis layers */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-sat-muted/60 font-medium mb-2 px-1">
            Analysis Layers
          </p>
          {[
            { key: "original", label: "Original Imagery" },
            { key: "changeDetection", label: "Change Detection" },
            { key: "detectedObjects", label: "Detected Objects" },
            { key: "segmentation", label: "Segmentation" },
            { key: "aiBoundaries", label: "AI Evidence Boundaries" },
          ].map((layer) => (
            <div
              key={layer.key}
              className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-sat-surface2 group transition-colors"
            >
              <button
                onClick={() => toggleLayer(layer.key)}
                className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                  layers[layer.key]
                    ? "bg-sat-cyan border-sat-cyan text-sat-bg"
                    : "border-sat-border"
                }`}
              >
                {layers[layer.key] && <Check size={8} />}
              </button>
              <span className="text-[11px] text-sat-muted group-hover:text-sat-text transition-colors flex-1">
                {layer.label}
              </span>
              <button
                onClick={() => toggleLayer(layer.key)}
                className={`flex-shrink-0 transition-colors ${
                  layers[layer.key] ? "text-sat-muted/60" : "text-sat-muted/20"
                }`}
              >
                <Eye off={!layers[layer.key]} />
              </button>
            </div>
          ))}
        </div>

        {/* Opacity controls */}
        {(layers.changeDetection || layers.aiBoundaries) && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-sat-muted/60 font-medium mb-3 px-1">
              Overlay Opacity
            </p>
            {layers.changeDetection && (
              <div className="px-1 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-sat-muted">Change Detection</span>
                  <span className="text-[10px] text-sat-cyan font-mono">
                    {opacities.changeDetection}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacities.changeDetection}
                  onChange={(e) => setOpacity("changeDetection", parseInt(e.target.value))}
                  className="w-full h-1 rounded cursor-pointer accent-sat-cyan"
                />
              </div>
            )}
            {layers.aiBoundaries && (
              <div className="px-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-sat-muted">AI Boundaries</span>
                  <span className="text-[10px] text-sat-cyan font-mono">
                    {opacities.aiBoundaries}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacities.aiBoundaries}
                  onChange={(e) => setOpacity("aiBoundaries", parseInt(e.target.value))}
                  className="w-full h-1 rounded cursor-pointer accent-sat-cyan"
                />
              </div>
            )}
          </div>
        )}

        {/* Add dataset */}
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-sat-border text-sat-muted/60 hover:border-sat-cyan/40 hover:text-sat-muted transition-all text-[11px]">
          <Plus size={10} /> Add Dataset
        </button>

        {/* Metadata expandable */}
        <div>
          <button
            onClick={() => setMetaOpen(!metaOpen)}
            className="w-full flex items-center justify-between px-1 text-[10px] text-sat-muted hover:text-sat-text transition-colors"
          >
            <span className="uppercase tracking-widest font-medium">Imagery Metadata</span>
            <ChevDown up={metaOpen} />
          </button>
          {metaOpen && (
            <div className="mt-2 p-2.5 rounded-lg bg-sat-dark border border-sat-border fade-up">
              {[
                ["Sensor A", "Cartosat-3"],
                ["Date", "12 Jan 2024"],
                ["Resolution", "0.8m GSD"],
                ["Projection", "WGS 84 / UTM"],
                ["Bands", "Pan + Multispectral"],
                ["Sensor B", "RISAT-1B"],
                ["Date", "18 Jan 2026"],
                ["Resolution", "3m GSD"],
                ["Polarization", "HH / HV"],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between gap-2 py-0.5">
                  <span className="text-[9px] text-sat-muted/50 font-mono">{k}</span>
                  <span className="text-[9px] text-sat-muted font-mono text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MapView ──────────────────────────────────────────────────────────────────
function MapView({
  mapMode,
  setMapMode,
  sensorMode,
  setSensorMode,
  sliderPos,
  setSliderPos,
  showZones,
  selectedZone,
  setSelectedZone,
  opacities,
  layers,
}: {
  mapMode: MapMode;
  setMapMode: (m: MapMode) => void;
  sensorMode: SensorMode;
  setSensorMode: (s: SensorMode) => void;
  sliderPos: number;
  setSliderPos: (n: number) => void;
  showZones: boolean;
  selectedZone: number | null;
  setSelectedZone: (n: number | null) => void;
  opacities: Record<string, number>;
  layers: Record<string, boolean>;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [draggingSlider, setDraggingSlider] = useState(false);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (!draggingSlider) return;
    const onMove = (e: MouseEvent) => {
      if (!mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      setSliderPos(pct);
    };
    const onUp = () => setDraggingSlider(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [draggingSlider, setSliderPos]);

  const zone = selectedZone !== null ? ZONES.find((z) => z.id === selectedZone) : null;
  const imgFilter = "hue-rotate(-20deg) saturate(0.65) brightness(0.55)";
  const afterFilter = "hue-rotate(-5deg) saturate(0.6) brightness(0.5)";

  return (
    <div className="flex-1 relative overflow-hidden bg-sat-bg" ref={mapRef}>
      {/* Satellite imagery */}
      {mapMode === "before" ? (
        <img
          src={MAP_BEFORE}
          alt="Satellite imagery January 2024"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: imgFilter }}
        />
      ) : mapMode === "after" ? (
        <img
          src={MAP_AFTER}
          alt="Satellite imagery January 2026"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: afterFilter }}
        />
      ) : (
        <>
          {/* After base */}
          <img
            src={MAP_AFTER}
            alt="Satellite imagery January 2026"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: afterFilter }}
          />
          {/* Before clipped */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={MAP_BEFORE}
              alt="Satellite imagery January 2024"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: imgFilter }}
            />
          </div>

          {/* Slider line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/70 z-20 cursor-ew-resize"
            style={{ left: `${sliderPos}%`, userSelect: "none" }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDraggingSlider(true);
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xl cursor-ew-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                setDraggingSlider(true);
              }}
            >
              <span className="text-sat-bg text-[11px] font-bold select-none" style={{ letterSpacing: "-1px" }}>
                {"<>"}
              </span>
            </div>
          </div>
          {draggingSlider && <div className="absolute inset-0 z-30 cursor-ew-resize" />}

          <div className="absolute top-14 left-3 z-10 font-mono text-[10px] text-white/70 bg-black/40 px-2 py-1 rounded-md">
            JAN 2024
          </div>
          <div className="absolute top-14 right-3 z-10 font-mono text-[10px] text-white/70 bg-black/40 px-2 py-1 rounded-md">
            JAN 2026
          </div>
        </>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(7,16,24,0.55) 100%)",
        }}
      />

      {/* Subtle coordinate grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage:
            "linear-gradient(to right, #55D6D2 1px, transparent 1px), linear-gradient(to bottom, #55D6D2 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* SVG overlays */}
      {showZones && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* AOI boundary */}
          {layers.aiBoundaries && (
            <rect
              x="7"
              y="10"
              width="84"
              height="78"
              fill="none"
              stroke="#55D6D2"
              strokeWidth="0.3"
              strokeDasharray="2,1.5"
              opacity={0.45 * (opacities.aiBoundaries / 100)}
            />
          )}

          {/* Change detection zones */}
          {layers.changeDetection && mapMode !== "before" && (
            <>
              <polygon
                points="16,25 29,24 31,39 17,40"
                fill="#55D6D2"
                fillOpacity={0.12 * (opacities.changeDetection / 100)}
                stroke="#55D6D2"
                strokeWidth="0.35"
                strokeOpacity={0.75}
                filter="url(#glow)"
              />
              <polygon
                points="43,50 60,48 62,64 44,66"
                fill="#55D6D2"
                fillOpacity={0.12 * (opacities.changeDetection / 100)}
                stroke="#55D6D2"
                strokeWidth="0.35"
                strokeOpacity={0.75}
                filter="url(#glow)"
              />
              <polygon
                points="67,22 80,21 82,38 68,39"
                fill="#55D6D2"
                fillOpacity={0.12 * (opacities.changeDetection / 100)}
                stroke="#55D6D2"
                strokeWidth="0.35"
                strokeOpacity={0.75}
                filter="url(#glow)"
              />
            </>
          )}
        </svg>
      )}

      {/* Zone number markers */}
      {showZones && mapMode !== "before" && layers.changeDetection && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {ZONES.map((z) => (
            <div
              key={z.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${z.px}%`,
                top: `${z.py}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Pulse ring */}
              <div
                className="absolute rounded-full border border-sat-cyan/50 zone-ring"
                style={{ inset: "-8px" }}
              />
              <button
                onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                  selectedZone === z.id
                    ? "bg-sat-cyan border-sat-cyan text-sat-bg scale-115"
                    : "bg-sat-bg/75 border-sat-cyan text-sat-cyan hover:bg-sat-cyan/20"
                }`}
                style={{ backdropFilter: "blur(6px)" }}
              >
                {z.id}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone detail card */}
      {zone && (
        <div
          className="absolute z-30 fade-up"
          style={{
            left: `${Math.min(zone.px + 4, 62)}%`,
            top: `${zone.py}%`,
            transform: "translateY(-50%)",
          }}
        >
          <div
            className="bg-sat-surface border border-sat-cyan/25 rounded-xl p-4 w-52 shadow-2xl"
            style={{ backdropFilter: "blur(16px)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sat-cyan text-[11px] font-semibold">
                Expansion Zone 0{zone.id}
              </span>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-sat-muted hover:text-sat-text text-[12px] transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 mb-3">
              {[
                ["Area", zone.area],
                ["Change", zone.change + " built-up"],
                ["Confidence", zone.confidence],
                ["Source", zone.source],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-sat-muted text-[10px]">{k}</span>
                  <span className="text-sat-text text-[10px] font-mono font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setMapMode("before")}
                className="flex-1 py-1.5 rounded-lg border border-sat-border text-sat-muted text-[10px] hover:border-sat-cyan/30 hover:text-sat-text transition-all"
              >
                Compare
              </button>
              <button className="flex-1 py-1.5 rounded-lg bg-sat-cyan/10 border border-sat-cyan/25 text-sat-cyan text-[10px] hover:bg-sat-cyan/20 transition-all">
                Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coordinate card */}
      <div className="absolute bottom-16 left-4 z-10">
        <div
          className="bg-sat-surface/80 border border-sat-border rounded-xl px-3 py-2.5"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <p className="text-[9px] text-sat-muted/60 uppercase tracking-widest mb-1">Target Area</p>
          <p className="text-sat-text text-[11px] font-mono font-medium">{"25°28'N, 81°53'E"}</p>
          <p className="text-sat-muted text-[10px]">Ganges Basin · Prayagraj, India</p>
        </div>
      </div>

      {/* Scale bar */}
      <div className="absolute bottom-5 left-4 z-10 flex items-end gap-1.5">
        <div className="flex flex-col items-stretch">
          <div className="h-1.5 w-16 border-l border-b border-r border-white/40 rounded-b" />
        </div>
        <span className="text-white/40 text-[9px] font-mono leading-none">5 km</span>
      </div>

      {/* Coordinate display */}
      <div className="absolute bottom-5 right-4 z-10">
        <span className="text-white/35 text-[9px] font-mono">25.4718°N  81.8833°E</span>
      </div>

      {/* Map controls (right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <div
          className="flex flex-col bg-sat-surface/85 border border-sat-border rounded-xl overflow-hidden"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <button
            onClick={() => setZoom(Math.min(20, zoom + 1))}
            className="p-2.5 text-sat-muted hover:text-sat-cyan hover:bg-sat-surface2 transition-all border-b border-sat-border"
          >
            <Plus size={13} />
          </button>
          <div className="px-2 py-0.5 text-center text-[9px] font-mono text-sat-muted/50">
            {zoom}
          </div>
          <button
            onClick={() => setZoom(Math.max(1, zoom - 1))}
            className="p-2.5 text-sat-muted hover:text-sat-cyan hover:bg-sat-surface2 transition-all border-t border-sat-border"
          >
            <Minus />
          </button>
        </div>
        {[Compass, Fullscreen, SquareIcon].map((Icon, i) => (
          <button
            key={i}
            className="p-2.5 bg-sat-surface/85 border border-sat-border rounded-xl text-sat-muted hover:text-sat-cyan hover:bg-sat-surface2 transition-all"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <Icon />
          </button>
        ))}
      </div>

      {/* Comparison + sensor controls (top center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div
          className="flex bg-sat-surface/85 border border-sat-border rounded-xl overflow-hidden"
          style={{ backdropFilter: "blur(10px)" }}
        >
          {(["before", "difference", "after"] as MapMode[]).map((mode, i) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`px-4 py-1.5 text-[10px] font-medium capitalize transition-all ${
                i > 0 ? "border-l border-sat-border" : ""
              } ${mapMode === mode ? "bg-sat-cyan/15 text-sat-cyan" : "text-sat-muted hover:text-sat-text"}`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div
          className="flex bg-sat-surface/85 border border-sat-border rounded-xl overflow-hidden"
          style={{ backdropFilter: "blur(10px)" }}
        >
          {(["optical", "sar", "fused"] as SensorMode[]).map((mode, i) => (
            <button
              key={mode}
              onClick={() => setSensorMode(mode)}
              className={`px-3.5 py-1 text-[9px] font-medium uppercase tracking-wider transition-all ${
                i > 0 ? "border-l border-sat-border" : ""
              } ${sensorMode === mode ? "text-sat-cyan" : "text-sat-muted/50 hover:text-sat-muted"}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 2D / 3D toggle */}
      <div
        className="absolute top-4 left-4 z-10 flex bg-sat-surface/85 border border-sat-border rounded-xl overflow-hidden"
        style={{ backdropFilter: "blur(10px)" }}
      >
        {["2D", "3D"].map((m, i) => (
          <button
            key={m}
            className={`px-3 py-1.5 text-[10px] font-medium transition-all ${
              i > 0 ? "border-l border-sat-border" : ""
            } ${m === "2D" ? "text-sat-cyan" : "text-sat-muted/50 hover:text-sat-muted"}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── RightSidebar ─────────────────────────────────────────────────────────────
function RightSidebar({
  workspaceState,
  analysisProgress,
  onAsk,
  onHighlight,
}: {
  workspaceState: WorkspaceState;
  analysisProgress: number;
  onAsk: (q: string) => void;
  onHighlight: (id: number) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const CHIPS = ["What changed here?", "Detect buildings", "Compare both images", "Analyze vegetation"];
  const ANALYSIS_STEPS = [
    { label: "Understanding query", note: "Temporal urban change analysis detected" },
    { label: "Inspecting imagery", note: "2 datasets recognised · EPSG:32644" },
    { label: "Selecting analysis method", note: "ChangeDetection_V2 = best match" },
    { label: "Running ChangeDetection_V2", note: "Processing 142 km² ..." },
    { label: "Generating spatial evidence", note: "Extracting expansion polygons ..." },
    { label: "Formatting response", note: "Grounding answer to evidence ..." },
  ];

  const stepState = (i: number) => {
    if (analysisProgress > i) return "done";
    if (analysisProgress === i) return "running";
    return "waiting";
  };

  return (
    <div className="w-[340px] flex-shrink-0 bg-sat-surface border-l border-sat-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sat-border flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-[13px] font-semibold text-sat-text mb-1">SatQuery AI</h2>
          <div className="flex items-center gap-1.5 text-[10px] text-sat-muted">
            <div className={`w-1.5 h-1.5 rounded-full ${workspaceState === "analyzing" ? "bg-sat-cyan blink-dot" : "bg-emerald-400"}`} />
            2 datasets loaded
          </div>
        </div>
        <div className="text-[9px] text-sat-cyan bg-sat-cyan/5 border border-sat-cyan/30 px-2 py-1 rounded font-semibold tracking-wider">
          OPTICAL + SAR
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {workspaceState === "idle" && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-10 h-10 rounded-xl bg-sat-surface2 border border-sat-border flex items-center justify-center mb-3 text-sat-muted">
              <Target />
            </div>
            <p className="text-sat-muted text-[12px] leading-relaxed">
              Ask anything about the loaded satellite imagery to begin analysis.
            </p>
          </div>
        )}

        {workspaceState === "analyzing" && (
          <div className="space-y-2 fade-up">
            {/* Analyzing Top Card */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-sat-cyan/20 bg-sat-cyan/5 mb-4">
              <span className="spin-icon text-sat-cyan">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.8">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </span>
              <div>
                <p className="text-sat-cyan text-[12px] font-medium leading-tight">Analyzing satellite data...</p>
                <p className="text-sat-muted/70 text-[10px] mt-0.5">ChangeDetection_V2 · 142 km²</p>
              </div>
            </div>

            {ANALYSIS_STEPS.map((step, i) => {
              const state = stepState(i);
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    state === "done"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : state === "running"
                      ? "border-sat-cyan/40 bg-sat-cyan/5 shadow-[0_0_15px_rgba(85,214,210,0.05)]"
                      : "border-transparent opacity-40"
                  }`}
                >
                  <div className="flex-shrink-0 w-4 h-4 mt-0.5 flex items-center justify-center">
                    {state === "done" && (
                      <div className="w-4 h-4 rounded-full border border-emerald-400 flex items-center justify-center text-emerald-400">
                        <Check size={8} />
                      </div>
                    )}
                    {state === "running" && (
                      <div className="w-4 h-4 rounded-full border-[1.5px] border-sat-cyan flex items-center justify-center relative">
                        <div className="absolute inset-0 border-t-[1.5px] border-t-transparent rounded-full spin-icon" />
                      </div>
                    )}
                    {state === "waiting" && (
                      <div className="w-4 h-4 rounded-full border-2 border-sat-border/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-[12px] font-medium leading-tight ${
                          state === "done"
                            ? "text-sat-text"
                            : state === "running"
                            ? "text-sat-cyan"
                            : "text-sat-muted/50"
                        }`}
                      >
                        {step.label}
                      </p>
                      {state === "done" && (
                        <span className="text-sat-muted/30">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] mt-1 ${
                        state === "done"
                          ? "text-emerald-400/80"
                          : state === "running"
                          ? "text-sat-muted"
                          : "text-sat-muted/30"
                      }`}
                    >
                      {step.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {workspaceState === "results" && (
          <div className="space-y-4 fade-up">
            {/* User question */}
            <div className="flex justify-end">
              <div className="max-w-[88%] bg-sat-cyan/10 border border-sat-cyan/20 rounded-xl rounded-tr-sm px-3 py-2.5">
                <p className="text-sat-text text-[12px] leading-relaxed">
                  Has urban construction increased in this region between the two captures?
                </p>
              </div>
            </div>

            {/* AI answer */}
            <div className="space-y-2">
              <div className="bg-sat-dark border border-sat-border rounded-xl rounded-tl-sm px-3 py-3">
                <p className="text-sat-text text-[12px] leading-relaxed mb-3">
                  Yes. Significant urban expansion was detected between January 2024 and January
                  2026.
                </p>

                {/* Evidence metrics */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { label: "Built-up Area", val: "+14.2%", col: "text-sat-cyan" },
                    { label: "Dev Zones", val: "3", col: "text-sat-cyan" },
                    { label: "Confidence", val: "94%", col: "text-emerald-400" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-sat-surface2 rounded-lg p-2 text-center border border-sat-border"
                    >
                      <p className={`${m.col} text-[14px] font-semibold font-mono`}>{m.val}</p>
                      <p className="text-sat-muted/60 text-[9px] mt-0.5 leading-tight">{m.label}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onHighlight(2)}
                  className="w-full py-2 rounded-lg bg-sat-cyan/10 border border-sat-cyan/25 text-sat-cyan text-[11px] font-medium hover:bg-sat-cyan/20 transition-all"
                >
                  View evidence on map
                </button>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] text-sat-muted/40 font-mono">ChangeDetection_V2</span>
                <span className="text-sat-border">·</span>
                <span className="text-[9px] text-sat-muted/40">142 km² processed</span>
                <span className="text-sat-border">·</span>
                <span className="text-[9px] text-emerald-400/50">Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-3 flex-shrink-0 border-t border-sat-border">
        {workspaceState === "results" && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => onAsk(chip)}
                className="px-2.5 py-1 rounded-xl bg-sat-surface2 border border-sat-border text-sat-muted text-[10px] hover:border-sat-cyan/30 hover:text-sat-text transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 bg-sat-dark border border-sat-border rounded-xl px-3 py-2.5 focus-within:border-sat-cyan/40 transition-colors">
          <button className="text-sat-muted hover:text-sat-text transition-colors flex-shrink-0">
            <Attach />
          </button>
          <button className="text-sat-muted hover:text-sat-text transition-colors flex-shrink-0">
            <Target />
          </button>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && prompt.trim()) {
                onAsk(prompt);
                setPrompt("");
              }
            }}
            placeholder="Ask anything about this imagery…"
            className="flex-1 bg-transparent text-sat-text text-[12px] outline-none placeholder:text-sat-muted/35 min-w-0"
          />
          <button
            onClick={() => {
              if (prompt.trim()) {
                onAsk(prompt);
                setPrompt("");
              }
            }}
            className="text-sat-cyan hover:brightness-125 transition-all flex-shrink-0"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AuditTrail ────────────────────────────────────────────────────────────────

function AuditTrail({
  workspaceState,
  analysisProgress,
  onViewEvidence,
}: {
  workspaceState: WorkspaceState;
  analysisProgress: number;
  onViewEvidence: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    if (workspaceState === "analyzing") {
      setExpanded(true);
    }
  }, [workspaceState]);

  const handleViewEvidence = () => {
    setExpanded(false);
    onViewEvidence();
  };

  const isAnalyzing = workspaceState === "analyzing";
  const isResults = workspaceState === "results";
  
  const getEventStatus = (index: number): AuditStatus => {
    if (isResults) return "completed";
    if (!isAnalyzing) return "waiting";
    if (analysisProgress > index) return "completed";
    if (analysisProgress === index) return "processing";
    return "waiting";
  };

  const getStatusText = () => {
    if (isResults) return "Analysis completed · 6 steps";
    if (isAnalyzing) return "Processing...";
    return "Ready to analyze";
  };

  return (
    <div
      className="flex-shrink-0 border-t border-sat-border bg-sat-surface transition-all duration-300 overflow-hidden"
      style={{ height: expanded ? 400 : 52 }}
    >
      {/* Always-visible header bar */}
      <div className="flex items-center gap-4 px-5 h-[52px] border-b border-sat-border">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? "bg-sat-cyan blink-dot" : isResults ? "bg-emerald-400" : "bg-sat-border"}`} />
          <span className="text-[10px] font-semibold text-sat-text uppercase tracking-widest">
            AI Audit Trail
          </span>
        </div>

        {expanded ? (
          <p className="text-[10px] text-sat-muted/50 truncate">
            Observable record of the analysis performed by SatQuery AI
          </p>
        ) : (
          <div className="flex items-center gap-0 text-[9px] text-sat-muted/45 overflow-hidden">
            {["Input", "Intent", "Data", "Tool", "Analysis", "Evidence", "Answer"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5 flex-shrink-0">
                {i > 0 && <span className="text-sat-border mx-1">→</span>}
                <span className={isResults || (isAnalyzing && analysisProgress >= i) ? "text-sat-text font-medium" : ""}>{s}</span>
              </span>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          {expanded ? (
            <>
              {isResults && <span className="text-[9px] text-sat-muted/40 font-mono">09:14:07 UTC</span>}
              <span className={`text-[9px] ${isResults ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : isAnalyzing ? "text-sat-cyan bg-sat-cyan/10 border-sat-cyan/25" : "text-sat-muted bg-sat-surface2 border-sat-border"} border px-2 py-0.5 rounded font-semibold uppercase tracking-wider`}>
                {isResults ? "COMPLETED" : isAnalyzing ? "PROCESSING" : "WAITING"}
              </span>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sat-border text-sat-muted hover:text-sat-text text-[10px] transition-all">
                Export Audit ↓
              </button>
            </>
          ) : (
            <span className={`text-[10px] ${isResults ? "text-emerald-400" : isAnalyzing ? "text-sat-cyan" : "text-sat-muted"}`}>{getStatusText()}</span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-sat-border text-sat-muted hover:text-sat-text hover:border-sat-cyan/30 text-[10px] transition-all"
          >
            {expanded ? "Collapse" : "View Full Audit Trail"}
            <ChevDown up={expanded} />
          </button>
        </div>
      </div>

      {/* Expanded horizontal timeline */}
      {expanded && (
        <div className="overflow-x-auto px-6 py-5 pb-8 relative custom-scrollbar" style={{ height: 260 }}>
          {/* Connecting Line background */}
          <div className="absolute top-[31px] left-10 right-10 h-0.5 bg-sat-border" />
          {/* Active Line (animated) */}
          <div 
            className="absolute top-[31px] left-10 h-0.5 bg-sat-cyan transition-all duration-700 ease-in-out" 
            style={{ width: `calc(${Math.max(0, Math.min(5, analysisProgress)) / 5} * (100% - 5rem))` }}
          />

          <div className="flex gap-4 relative z-10 w-max min-w-full justify-between">
            {AUDIT_EVENTS.map((event, i) => {
              const status = getEventStatus(i);
              const isDone = status === "completed";
              const isProcessing = status === "processing";
              const isWaiting = status === "waiting";
              
              return (
                <div key={event.id} className="flex flex-col gap-3 w-[260px] flex-shrink-0">
                  {/* Node */}
                  <div className="h-6 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full border-[1.5px] transition-all z-10 ${
                      isDone ? "bg-sat-cyan border-sat-cyan shadow-[0_0_8px_rgba(85,214,210,0.5)]" 
                      : isProcessing ? "bg-sat-bg border-sat-cyan shadow-[0_0_8px_rgba(85,214,210,0.5)]" 
                      : "bg-sat-bg border-sat-border"
                    }`}>
                      {isProcessing && <div className="w-1.5 h-1.5 m-auto mt-[1.5px] rounded-full bg-sat-cyan blink-dot" />}
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`flex flex-col h-[150px] rounded-xl border px-4 py-3.5 transition-all ${
                    isWaiting ? "border-sat-border bg-sat-surface2/40 opacity-50"
                    : isProcessing ? "border-sat-cyan/40 bg-sat-cyan/5 shadow-[0_0_15px_rgba(85,214,210,0.05)]"
                    : "border-sat-border bg-sat-dark"
                  }`}>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-sat-muted/60 font-mono tracking-widest font-semibold">
                        {event.step}
                      </span>
                      {isDone && <span className="text-emerald-400"><Check size={11} /></span>}
                      {isProcessing && <span className="text-sat-cyan spin-icon"><SpinSvg /></span>}
                    </div>

                    {/* Content */}
                    <p className={`text-[13px] font-semibold mb-1.5 ${isWaiting ? "text-sat-muted/50" : "text-sat-text"}`}>
                      {event.title}
                    </p>
                    <p className={`text-[10px] leading-relaxed line-clamp-2 ${isWaiting ? "text-sat-muted/30" : "text-sat-muted/80"}`}>
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WorkspaceScreen ──────────────────────────────────────────────────────────
function WorkspaceScreen() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>("idle");
  const [analysisProgress, setAnalysisProgress] = useState(-1);
  const [mapMode, setMapMode] = useState<MapMode>("difference");
  const [sensorMode, setSensorMode] = useState<SensorMode>("optical");
  const [sliderPos, setSliderPos] = useState(50);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  const [layers, setLayers] = useState<Record<string, boolean>>({
    optical: true,
    sar: true,
    original: true,
    changeDetection: true,
    detectedObjects: false,
    segmentation: false,
    aiBoundaries: true,
  });
  const [opacities, setOpacities] = useState({ changeDetection: 75, aiBoundaries: 60 });

  const toggleLayer = (k: string) =>
    setLayers((prev) => ({ ...prev, [k]: !prev[k] }));
  const setOpacity = (k: string, v: number) =>
    setOpacities((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (workspaceState !== "analyzing") return;
    setAnalysisProgress(0);
    const timers = [
      setTimeout(() => setAnalysisProgress(1), 900),
      setTimeout(() => setAnalysisProgress(2), 1800),
      setTimeout(() => setAnalysisProgress(3), 2800),
      setTimeout(() => setAnalysisProgress(4), 3800),
      setTimeout(() => setAnalysisProgress(5), 4800),
      setTimeout(() => {
        setWorkspaceState("results");
        setAnalysisProgress(6);
      }, 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [workspaceState]);

  const handleAsk = (_q: string) => {
    if (workspaceState !== "analyzing") {
      setWorkspaceState("analyzing");
    }
  };

  const handleHighlight = (id: number) => {
    setSelectedZone(id);
  };

  return (
    <div className="h-full flex flex-col">
      <TopNav />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 flex overflow-hidden min-h-0">
          <LeftSidebar
            layers={layers}
            toggleLayer={toggleLayer}
            opacities={opacities}
            setOpacity={setOpacity}
          />
          <MapView
            mapMode={mapMode}
            setMapMode={setMapMode}
            sensorMode={sensorMode}
            setSensorMode={setSensorMode}
            sliderPos={sliderPos}
            setSliderPos={setSliderPos}
            showZones={workspaceState === "results"}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            opacities={opacities}
            layers={layers}
          />
          <RightSidebar
            workspaceState={workspaceState}
            analysisProgress={analysisProgress}
            onAsk={handleAsk}
            onHighlight={handleHighlight}
          />
        </div>
        <AuditTrail
          workspaceState={workspaceState}
          analysisProgress={analysisProgress}
          onViewEvidence={() => setSelectedZone(null)}
        />
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("upload");

  return (
    <div className="h-full bg-sat-bg text-sat-text" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {screen === "upload" ? (
        <UploadScreen onStart={() => setScreen("workspace")} />
      ) : (
        <WorkspaceScreen />
      )}
    </div>
  );
}
