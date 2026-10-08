import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pause, Play, Activity } from "lucide-react";
export const HARDWARE_PERIOD = 4.8;
export function hardwareMotionAt(time) {
  const phase = (time % HARDWARE_PERIOD) / HARDWARE_PERIOD;
  const lift = 150 * (1 - Math.cos(phase * Math.PI * 2));
  return {
    time,
    lift,
    distance: 550 - lift,
    cycles: Math.floor(time / HARDWARE_PERIOD),
  };
}
export const HardwareTelemetry = forwardRef(function HardwareTelemetry(
  { paused, onToggle, disabled },
  ref,
) {
  const path = useRef(),
    point = useRef(),
    values = useRef({}),
    root = useRef();
  useImperativeHandle(
    ref,
    () => ({
      update(frame, history) {
        const start = frame.time - 12;
        const points = history
          .filter((s) => s.time >= start)
          .map((s) => [
            44 + ((s.time - start) / 12) * 500,
            112 - (s.lift / 300) * 86,
          ]);
        path.current?.setAttribute(
          "d",
          points
            .map(
              ([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`,
            )
            .join(" "),
        );
        const last = points.at(-1);
        if (last) {
          point.current?.setAttribute("cx", last[0]);
          point.current?.setAttribute("cy", last[1]);
        }
        for (const [name, value] of Object.entries({
          lift: Math.round(frame.lift),
          distance: Math.round(frame.distance),
          peak: Math.round(frame.peak),
          cycles: frame.cycles,
        }))
          if (values.current[name]) values.current[name].textContent = value;
        root.current?.setAttribute("data-lift-mm", frame.lift.toFixed(3));
        root.current?.setAttribute(
          "data-distance-mm",
          frame.distance.toFixed(3),
        );
        root.current?.setAttribute("data-time-seconds", frame.time.toFixed(3));
      },
    }),
    [],
  );
  return (
    <div className="hardware-telemetry" ref={root}>
      <div className="hardware-telemetry__heading">
        <span>
          <Activity size={14} /> Stack movement
        </span>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={paused ? "Resume stack movement" : "Pause stack movement"}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}{" "}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div className="hardware-telemetry__metrics">
        {[
          { id: "lift", label: "Stack travel", unit: "mm" },
          { id: "distance", label: "Sensor distance", unit: "mm" },
          { id: "peak", label: "Peak travel", unit: "mm" },
          { id: "cycles", label: "Cycles", unit: "" },
        ].map((item) => (
          <div key={item.id}>
            <span>{item.label}</span>
            <strong>
              <b ref={(el) => (values.current[item.id] = el)}>
                {item.id === "distance" ? 550 : 0}
              </b>
              <small>{item.unit}</small>
            </strong>
          </div>
        ))}
      </div>
      <svg
        viewBox="0 0 568 146"
        className="hardware-telemetry__graph"
        role="img"
        aria-label="Stack travel over the last twelve seconds, from zero to three hundred millimetres"
      >
        <defs>
          <linearGradient id="hardware-trace-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#83936b" stopOpacity=".17" />
            <stop offset="1" stopColor="#83936b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 150, 300].map((n) => (
          <g key={n}>
            <line
              x1="44"
              x2="544"
              y1={112 - (n / 300) * 86}
              y2={112 - (n / 300) * 86}
              stroke="#cbbfae"
              strokeDasharray={n === 0 ? undefined : "2 5"}
              strokeWidth=".7"
            />
            <text x="31" y={116 - (n / 300) * 86} textAnchor="end">
              {n}
            </text>
          </g>
        ))}
        <text x="17" y="13">
          mm
        </text>
        <path
          ref={path}
          fill="none"
          stroke="#75845b"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          ref={point}
          cx="544"
          cy="112"
          r="3.5"
          fill="#75845b"
          stroke="#fffaf0"
          strokeWidth="2"
        />
        {[0, 4, 8, 12].map((n) => (
          <text
            key={n}
            x={44 + (n / 12) * 500}
            y="136"
            textAnchor={n === 0 ? "start" : n === 12 ? "end" : "middle"}
          >
            {n === 12 ? "Now" : `−${12 - n} s`}
          </text>
        ))}
      </svg>
      <div className="hardware-telemetry__foot">
        <span>Rolling 12-second window</span>
        <span>Travel and distance move together.</span>
      </div>
    </div>
  );
});
