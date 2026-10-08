import React, { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  LayoutGrid,
  ChartNoAxesColumn,
  Building2,
  CircleHelp,
  Download,
  Plus,
  Check,
  Radio,
} from "lucide-react";

export const demoEquipment = [
  {
    name: "Leg press",
    short: "LP",
    x: 132,
    y: 112,
    value: 72,
    state: "Active",
    hours: "4.8h",
    trend: "+12%",
  },
  {
    name: "Lat pulldown",
    short: "LD",
    x: 214,
    y: 112,
    value: 64,
    state: "Active",
    hours: "4.2h",
    trend: "+8%",
  },
  {
    name: "Seated row",
    short: "SR",
    x: 296,
    y: 112,
    value: 43,
    state: "Resting",
    hours: "2.9h",
    trend: "+3%",
  },
  {
    name: "Chest press",
    short: "CP",
    x: 132,
    y: 214,
    value: 58,
    state: "Active",
    hours: "3.9h",
    trend: "+6%",
  },
  {
    name: "Leg extension",
    short: "LE",
    x: 214,
    y: 214,
    value: 32,
    state: "Resting",
    hours: "2.1h",
    trend: "−4%",
  },
  {
    name: "Cable station",
    short: "CS",
    x: 296,
    y: 214,
    value: 68,
    state: "Active",
    hours: "4.5h",
    trend: "+10%",
  },
];

function Sparkline({
  values = [6, 12, 9, 18, 14, 22, 18, 28],
  color = "currentColor",
  title = "Illustrative activity trend",
}) {
  return (
    <svg
      className="sparkline"
      viewBox="0 0 100 36"
      role="img"
      aria-label={title}
    >
      <path
        d={values
          .map(
            (n, i) =>
              `${i ? "L" : "M"}${(i * 100) / (values.length - 1)},${34 - n}`,
          )
          .join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FloorMap({ selected, onSelect }) {
  return (
    <svg
      className="floor-map"
      viewBox="0 0 440 350"
      role="group"
      aria-label="Illustrative sensor-equipped strength floor; select a machine"
    >
      <defs>
        <pattern
          id="map-dots"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="8" cy="8" r=".6" fill="#cbc4b6" />
        </pattern>
        <filter id="map-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#66513a"
            floodOpacity=".08"
          />
        </filter>
      </defs>
      <rect width="440" height="350" fill="url(#map-dots)" />
      <path
        d="M66 51H352V288H247M206 288H66V51"
        fill="#f4f1e8"
        stroke="#b9b09f"
        strokeWidth="4"
      />
      <path
        d="M67 52h284M67 287h138m42 0h105"
        stroke="#fffdf8"
        strokeWidth="1"
      />
      <path
        d="M207 288v-33a33 33 0 0 1 33 33"
        fill="none"
        stroke="#b9b09f"
        strokeWidth="1"
      />
      <path d="M334 68v204M342 68v204" stroke="#d5ccbb" strokeWidth="2" />
      <text x="76" y="34" className="map-caption">
        STRENGTH FLOOR
      </text>
      {demoEquipment.map((item, i) => (
        <g
          key={item.name}
          role="button"
          tabIndex="0"
          aria-label={`Inspect ${item.name}`}
          aria-pressed={selected === i}
          onClick={() => onSelect(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(i);
            }
          }}
          className={`map-machine ${selected === i ? "selected" : ""}`}
          transform={`translate(${item.x},${item.y})`}
        >
          <rect
            x="-30"
            y="-33"
            width="60"
            height="71"
            rx="10"
            fill={selected === i ? "#e6eadc" : "#eae5da"}
            stroke={selected === i ? "#798966" : "#d6cdbd"}
            filter="url(#map-shadow)"
          />
          <rect
            x="-20"
            y="-26"
            width="40"
            height="14"
            rx="3"
            fill="#d0c7b8"
            stroke="#82786a"
            strokeWidth=".75"
          />
          <path
            d="M-16 -12v29M16 -12v29M-16 4H16"
            fill="none"
            stroke="#968879"
            strokeWidth="2"
          />
          <rect
            x="-12"
            y="0"
            width="24"
            height="21"
            rx="4"
            fill={item.state === "Active" ? "#889775" : "#b8afa0"}
          />
          <rect x="-9" y="23" width="18" height="6" rx="2" fill="#796553" />
          <circle
            cx="23"
            cy="-26"
            r="4"
            fill={item.state === "Active" ? "#798c68" : "#c5bba9"}
            stroke="#fffdf8"
            strokeWidth="2"
          />
          <text y="55" textAnchor="middle" className="map-machine-label">
            {item.short}
          </text>
        </g>
      ))}
      <g transform="translate(90 311)">
        <circle r="3.5" fill="#889775" />
        <text x="11" y="4" className="map-legend">
          Moving
        </text>
        <circle cx="85" r="3.5" fill="#b8afa0" />
        <text x="96" y="4" className="map-legend">
          At rest
        </text>
        <text x="193" y="4" className="map-legend">
          Illustrative layout
        </text>
      </g>
    </svg>
  );
}

const chartValues = [
  11, 14, 19, 28, 34, 39, 24, 18, 23, 32, 43, 54, 66, 81, 75, 67, 47, 31,
];
function ActivityChart({ compact = false }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className={`activity-chart ${compact ? "compact" : ""}`}>
      <div className="chart-head">
        <span>Activity across the day</span>
        <span className="mono">
          {hovered !== null
            ? `${String(hovered + 5).padStart(2, "0")}:00 · ${chartValues[hovered]}% active time`
            : "TODAY"}
        </span>
      </div>
      <div
        className="bar-chart"
        role="group"
        aria-label="Sample activity rises in the evening, peaking at 81 percent at 6pm"
      >
        {[25, 50, 75].map((n) => (
          <div className="chart-rule" key={n} style={{ bottom: `${n}%` }}>
            <span>{n}%</span>
          </div>
        ))}
        {chartValues.map((v, i) => (
          <button
            key={i}
            style={{ height: `${v}%` }}
            aria-label={`${i + 5}:00, ${v} percent active time, example data`}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={i === 13 ? "peak" : ""}
          />
        ))}
      </div>
      <div className="chart-axis mono">
        <span>05:00</span>
        <span>11:00</span>
        <span>17:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}

function FloorView() {
  const [selected, setSelected] = useState(0);
  const item = demoEquipment[selected];
  return (
    <div className="workspace-floor">
      <div className="floor-main">
        <div className="panel-title">
          <h4>Your floor, at a glance.</h4>
          <span className="small-pill">
            <Radio size={11} /> Sample feed
          </span>
        </div>
        <FloorMap selected={selected} onSelect={setSelected} />
      </div>
      <div className="floor-detail">
        <div className="equipment-detail" aria-live="polite">
          <span className="eyebrow">EQUIPMENT SPOTLIGHT</span>
          <div className="detail-title">
            <h4>{item.name}</h4>
            <ArrowUpRight size={19} />
          </div>
          <div className="activity-state">
            <i className={item.state === "Active" ? "active" : ""} />
            {item.state === "Active" ? "Movement detected" : "At rest"}
          </div>
          <div className="detail-metric">
            <strong>{item.hours}</strong>
            <span>active time / sample day</span>
            <small>
              {item.trend} <span>vs last week</span>
            </small>
          </div>
          <div className="mini-meter">
            <div style={{ width: `${item.value}%` }} />
          </div>
          <div className="detail-sub">
            <span>Observed hours covered</span>
            <strong>98.6%</strong>
          </div>
          <p className="fineprint">
            Active time = time away from rest / observed equipment time.
          </p>
        </div>
        <ActivityChart />
      </div>
    </div>
  );
}

function PlanningView() {
  const [selected, setSelected] = useState("Most activity");
  return (
    <div className="planning-view">
      <div className="planning-table">
        <div className="panel-title">
          <h4>Make room for what matters.</h4>
          <div className="segmented small" aria-label="Equipment ranking">
            <button
              aria-pressed={selected === "Most activity"}
              onClick={() => setSelected("Most activity")}
            >
              Most activity
            </button>
            <button
              aria-pressed={selected === "Least activity"}
              onClick={() => setSelected("Least activity")}
            >
              Least activity
            </button>
          </div>
        </div>
        <div className="table-labels">
          <span>Equipment</span>
          <span>Active time</span>
          <span>Trend</span>
        </div>
        {[...demoEquipment]
          .sort((a, b) =>
            selected === "Most activity"
              ? b.value - a.value
              : a.value - b.value,
          )
          .map((e, i) => (
            <div className="equipment-row" key={e.name}>
              <span>
                <em className="mono">{String(i + 1).padStart(2, "0")}</em>
                {e.name}
              </span>
              <div>
                <span className="row-meter">
                  <i style={{ width: `${e.value}%` }} />
                </span>
                <b>{e.hours}</b>
              </div>
              <span
                className={e.trend.startsWith("−") ? "negative" : "positive"}
              >
                {e.trend}
              </span>
            </div>
          ))}
        <p className="fineprint">
          Illustrative, comparable observed hours · Not a measure of waiting
          members.
        </p>
      </div>
      <div className="planning-insight">
        <span className="eyebrow">A BETTER NEXT PURCHASE</span>
        <svg viewBox="0 0 180 145" aria-hidden="true">
          <path
            d="M32 111 80 137 147 100 99 74Z"
            fill="#e1dacb"
            stroke="#978777"
          />
          <path
            d="m50 87 43 23 32-17V38L82 15 50 33Z"
            fill="#f3eee2"
            stroke="#978777"
          />
          <path
            d="m82 15 43 23-32 18-43-23Zm11 41v54M51 54l42 22 31-16"
            fill="none"
            stroke="#978777"
          />
          <path
            d="M73 61v17m7-13v17m7-13v17M65 61l25 13"
            stroke="#798967"
            strokeWidth="5"
          />
          <path d="m65 96-14 9m65-18 16 9" stroke="#5c4938" strokeWidth="3" />
        </svg>
        <h4>Evidence before equipment.</h4>
        <p>
          Compare sustained activity before you add, replace, or reposition a
          machine.
        </p>
        <span className="insight-source">
          <CircleHelp size={13} /> Decisions stay with you.
        </span>
      </div>
    </div>
  );
}

function LocationsView() {
  const [site, setSite] = useState(0);
  const locations = [
    {
      name: "Northside",
      sub: "Strength-led club",
      score: "56.2%",
      values: [8, 12, 10, 18, 15, 23, 20, 29],
    },
    {
      name: "Riverside",
      sub: "Mixed training club",
      score: "48%",
      values: [12, 9, 14, 11, 18, 15, 20, 21],
    },
    {
      name: "The Studio",
      sub: "Boutique club",
      score: "56%",
      values: [4, 10, 8, 12, 16, 14, 21, 25],
    },
  ];
  return (
    <div className="locations-view">
      <div className="locations-cards">
        {locations.map((l, i) => (
          <button
            key={l.name}
            className={`location-card ${site === i ? "selected" : ""}`}
            onClick={() => setSite(i)}
            aria-pressed={site === i}
          >
            <Building2 size={24} />
            <h4>{l.name}</h4>
            <p>{l.sub}</p>
            <strong>{l.score}</strong>
            <span>equipment active time</span>
            <Sparkline
              values={l.values}
              color={site === i ? "#657553" : "#8c7863"}
            />
            <small className="mono">SAMPLE LOCATION</small>
          </button>
        ))}
      </div>
      <div className="locations-bottom">
        <div>
          <span className="eyebrow">
            {locations[site].name.toUpperCase()} · OPERATING PICTURE
          </span>
          <h4>One location or your next ten.</h4>
          <p>
            Compare like-for-like equipment, see changes over time, and carry
            better decisions from one club to another.
          </p>
        </div>
        <ActivityChart compact />
      </div>
    </div>
  );
}

export default function DemoDashboard() {
  const [tab, setTab] = useState("floor");
  const period = "Sample week";
  const [downloaded, setDownloaded] = useState(false);
  const exportReport = () => {
    const csv =
      "SetQ — illustrative equipment report\nSample data; not a live gym feed\nEquipment,Active time,Change\n" +
      demoEquipment.map((e) => `${e.name},${e.hours},${e.trend}`).join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "setq-sample-equipment-report.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };
  return (
    <div className="workspace" data-testid="workspace">
      <aside className="workspace-rail" aria-label="Product preview views">
        <span className="rail-q" aria-hidden="true">
          Q
        </span>
        {[
          { id: "floor", label: "Floor activity", Icon: LayoutGrid },
          {
            id: "planning",
            label: "Equipment planning",
            Icon: ChartNoAxesColumn,
          },
          { id: "locations", label: "Locations", Icon: Building2 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-label={label}
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
          >
            <Icon size={19} />
          </button>
        ))}
        <span className="rail-bottom">
          <CircleHelp size={18} />
        </span>
      </aside>
      <div className="workspace-body">
        <div className="workspace-top">
          <span className="workspace-location">
            <span className="tiny-q">Q</span> Northside Club{" "}
            <ChevronDown size={13} />
          </span>
          <span className="demo-tag">
            <i /> Interactive preview · Sample data
          </span>
        </div>
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">THE SETQ WORKSPACE</span>
            <h3>
              {tab === "floor"
                ? "Good decisions start here."
                : tab === "planning"
                  ? "Invest with a clearer picture."
                  : "Every club. One perspective."}
            </h3>
          </div>
          <button
            className="report-button"
            aria-label={downloaded ? "Downloaded" : "Sample report"}
            onClick={exportReport}
          >
            {downloaded ? <Check size={15} /> : <Download size={15} />}
            <span>{downloaded ? "Downloaded" : "Sample report"}</span>
          </button>
        </div>
        <div className="workspace-toolbar">
          <div role="tablist" aria-label="SetQ platform capabilities">
            {[
              { id: "floor", label: "Floor activity" },
              { id: "planning", label: "Equipment planning" },
              { id: "locations", label: "Locations" },
            ].map((t) => (
              <button
                role="tab"
                key={t.id}
                id={`tab-${t.id}`}
                aria-controls="workspace-panel"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="period-control">
            <span className="sr-only">Reporting period</span>
            <span className="sample-period mono">Sample week</span>
          </label>
        </div>
        <div className="summary-strip">
          <div>
            <span>Equipment active time</span>
            <strong>
              {period === "Sample week" ? "56.2%" : "51.8%"}
              <small>
                <ArrowUpRight size={13} />
                {period === "Sample week" ? "4.4" : "2.1"} pts
              </small>
            </strong>
          </div>
          <div>
            <span>Evening activity peak</span>
            <strong>
              {period === "Sample week" ? "18:00" : "18:30"}
              <small>local time</small>
            </strong>
          </div>
          <div>
            <span>Observed hours covered</span>
            <strong>
              {period === "Sample week" ? "98.6%" : "97.2%"}
              <small className="coverage-dot">
                <i />
                Sample
              </small>
            </strong>
          </div>
        </div>
        <div
          id="workspace-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          className="workspace-panel"
        >
          {tab === "floor" ? (
            <FloorView />
          ) : tab === "planning" ? (
            <PlanningView />
          ) : (
            <LocationsView />
          )}
        </div>
      </div>
    </div>
  );
}
