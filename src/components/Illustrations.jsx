import {
  EquipmentArt,
  OperationsArt,
  PortfolioArt,
} from "./DecisionIllustrations.jsx";
import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import "../styles/illustrations.css";

// Original SetQ geometry. Hairline is a visual reference; no library paths or code are copied.
const project = (x, y, z = 0) => [
  200 + (x - y) * 1.25,
  196 + (x + y) * 0.625 - z,
];
const diagramProject = (x, y, z = 0) => [
  330 + (x - y) * 0.88,
  375 + (x + y) * 0.44 - z,
];
const coords = (points, p = project) => points.map((v) => p(...v));
const line = (points, p = project) =>
  coords(points, p)
    .map((v, i) => `${i ? "L" : "M"}${v.join(",")}`)
    .join(" ");
function rounded(points, radius = 4) {
  const near = (a, b) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = Math.min(radius / d, 0.3);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  return (
    points
      .map((v, i) => {
        const a = near(v, points[(i + points.length - 1) % points.length]);
        const b = near(v, points[(i + 1) % points.length]);
        return `${i ? "L" : "M"}${a.join(",")} Q${v.join(",")} ${b.join(",")}`;
      })
      .join(" ") + " Z"
  );
}
function Stroke({ points, p, className = "", ...props }) {
  return (
    <path d={line(points, p)} className={`isoq-line ${className}`} {...props} />
  );
}
function Plate({
  x,
  y,
  w,
  d,
  z = 0,
  h = 5,
  p = project,
  accent = false,
  ...props
}) {
  const top = [
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ];
  const hull = [
    top[0],
    top[1],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
    top[3],
  ];
  return (
    <g {...props}>
      <path
        className={`isoq-solid ${accent ? "isoq-accent" : ""}`}
        d={rounded(coords(hull, p))}
      />
      <path className="isoq-crease" d={rounded(coords(top, p), 3)} />
    </g>
  );
}
function Sensor({ x = 0, y = 0, z = 0, p = project }) {
  const [cx, cy] = p(x, y, z);
  return (
    <g className="isoq-sensor">
      <path
        d={`M${cx - 18} ${cy - 7} v7 C${cx - 18} ${cy + 14} ${cx + 18} ${cy + 14} ${cx + 18} ${cy} v-7`}
        className="isoq-solid"
      />
      <ellipse cx={cx} cy={cy - 7} rx="18" ry="8" className="isoq-solid" />
      <ellipse cx={cx} cy={cy - 7} rx="12" ry="4.5" className="isoq-crease" />
      <circle cx={cx} cy={cy - 7} r="2" className="isoq-dot isoq-signal" />
      <path d={`M${cx - 5} ${cy + 5} l10 0`} className="isoq-crease" />
    </g>
  );
}
function Rack({ x = 0, y = 0, z = 0, p = project, small = false }) {
  const height = small ? 44 : 85,
    w = small ? 30 : 47,
    depth = small ? 24 : 40;
  return (
    <g>
      <Plate x={x - 6} y={y - 6} w={w + 12} d={depth + 12} z={z} h={3} p={p} />
      <Stroke
        points={[
          [x, y + depth, z + 3],
          [x, y + depth, z + height],
          [x + w, y + depth, z + height],
          [x + w, y + depth, z + 3],
        ]}
        p={p}
      />
      <Stroke
        points={[
          [x, y, z + 3],
          [x, y, z + height],
          [x + w, y, z + height],
          [x + w, y, z + 3],
        ]}
        p={p}
      />
      <Stroke
        points={[
          [x, y, z + height],
          [x, y + depth, z + height],
          [x + w, y + depth, z + height],
          [x + w, y, z + height],
        ]}
        p={p}
        className="isoq-fine"
      />
      {[0.32, 0.5, 0.68].map((v, i) => (
        <Stroke
          key={i}
          points={[
            [x, y + depth, z + height * v],
            [x + 3, y + depth, z + height * v],
          ]}
          p={p}
          className="isoq-fine"
        />
      ))}
      <Stroke
        points={[
          [x - 8, y + depth - 4, z + height * 0.62],
          [x + w + 8, y + depth - 4, z + height * 0.62],
        ]}
        p={p}
      />
      {[x - 4, x + w - 2].map((a, i) => (
        <Plate
          key={i}
          x={a}
          y={y + depth - 8}
          w={5}
          d={8}
          z={z + height * 0.62 - 8}
          h={17}
          p={p}
        />
      ))}
    </g>
  );
}
function Bench({ x = 0, y = 0, z = 0, p = project }) {
  return (
    <g>
      <Stroke
        points={[
          [x + 5, y + 8, z],
          [x + 5, y + 8, z + 19],
          [x + 32, y + 8, z + 19],
          [x + 32, y + 8, z],
        ]}
        p={p}
      />
      <Plate x={x} y={y} w={39} d={17} z={z + 19} h={6} p={p} />
      <Stroke
        points={[
          [x + 12, y + 2, z + 26],
          [x + 29, y + 2, z + 26],
        ]}
        p={p}
        className="isoq-fine"
      />
    </g>
  );
}
function Stack({ x = 0, y = 0, z = 0, p = project }) {
  return (
    <g>
      <Plate x={x - 4} y={y - 4} w={34} d={25} z={z} h={4} p={p} />
      <Stroke
        points={[
          [x, y, z + 4],
          [x, y, z + 80],
          [x + 25, y, z + 80],
          [x + 25, y, z + 4],
        ]}
        p={p}
      />
      {[12, 19, 26, 33, 40].map((h) => (
        <Plate
          key={h}
          x={x + 3}
          y={y + 2}
          w={20}
          d={14}
          z={z + h}
          h={5}
          p={p}
        />
      ))}
      <Stroke
        points={[
          [x + 13, y + 7, z + 45],
          [x + 13, y + 7, z + 74],
          [x + 13, y + 30, z + 74],
          [x + 13, y + 30, z + 49],
          [x + 4, y + 30, z + 49],
          [x + 22, y + 30, z + 49],
        ]}
        p={p}
      />
      <Sensor x={x + 29} y={y + 11} z={z + 11} p={p} />
    </g>
  );
}
function Sheet({
  x = -34,
  y = -32,
  z = 34,
  p = project,
  w = 85,
  d = 76,
  charts = true,
}) {
  return (
    <g>
      <Plate x={x} y={y} w={w} d={d} z={z - 5} h={3} p={p} />
      <Plate x={x - 4} y={y - 4} w={w} d={d} z={z} h={3} p={p} />
      <Stroke
        points={[
          [x + 8, y + 10, z + 4],
          [x + w - 20, y + 10, z + 4],
        ]}
        p={p}
      />
      <Stroke
        points={[
          [x + 8, y + 18, z + 4],
          [x + w - 34, y + 18, z + 4],
        ]}
        p={p}
        className="isoq-fine"
      />
      {charts && (
        <g>
          {[18, 30, 22, 42, 35].map((h, i) => (
            <Plate
              key={i}
              x={x + 12 + i * 10}
              y={y + 30}
              w={5}
              d={h * 0.55}
              z={z + 4}
              h={2}
              p={p}
              accent={i === 3}
            />
          ))}
          <Stroke
            points={[
              [x + 8, y + 56, z + 4],
              [x + w - 15, y + 56, z + 4],
            ]}
            p={p}
            className="isoq-fine"
          />
        </g>
      )}
      {[0, 1].map((i) => (
        <g key={i}>
          <Stroke
            points={[
              [x + 9, y + d - 16 + i * 8, z + 4],
              [x + 12, y + d - 13 + i * 8, z + 4],
              [x + 17, y + d - 19 + i * 8, z + 4],
            ]}
            p={p}
            className="isoq-accent"
          />
          <Stroke
            points={[
              [x + 23, y + d - 15 + i * 8, z + 4],
              [x + w - 18 - i * 12, y + d - 15 + i * 8, z + 4],
            ]}
            p={p}
            className="isoq-fine"
          />
        </g>
      ))}
    </g>
  );
}

function useIllustrationMotion(ref, enabled = true) {
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const root = ref.current;
    const scope = gsap.context((context) => {
      const groups = root.querySelectorAll("[data-isoq-reveal]");
      let played = false;
      context.add("reveal", () => {
        if (played) return;
        played = true;
        gsap.fromTo(
          groups,
          { y: 12, opacity: 0.2 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            overwrite: true,
          },
        );
      });
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            context.reveal();
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(root);
      const hover = matchMedia("(hover: hover) and (pointer: fine)");
      context.add("enter", () => {
        if (hover.matches)
          gsap.to(root.querySelectorAll("[data-isoq-lift]"), {
            y: -5,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
          });
      });
      context.add("leave", () =>
        gsap.to(root.querySelectorAll("[data-isoq-lift]"), {
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          overwrite: true,
        }),
      );
      root.addEventListener("pointerenter", context.enter);
      root.addEventListener("pointerleave", context.leave);
      return () => {
        observer.disconnect();
        root.removeEventListener("pointerenter", context.enter);
        root.removeEventListener("pointerleave", context.leave);
      };
    }, root);
    return () => scope.revert();
  }, [ref, enabled]);
}
function Illustration({
  title,
  description,
  children,
  className = "",
  viewBox = "0 0 400 300",
  animate = true,
  ...props
}) {
  const id = useId(),
    ref = useRef(null);
  useIllustrationMotion(ref, animate);
  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      className={`setq-illustration ${className}`}
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
      {...props}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-desc`}>{description}</desc>
      {children}
    </svg>
  );
}

export function SensorFloorBrief({ className = "", animate = true }) {
  const p = diagramProject;
  return (
    <Illustration
      viewBox="0 0 700 540"
      className={`setq-layer-diagram ${className}`}
      animate={animate}
      title="From equipment signals to a useful daily brief"
      description="An isometric view of three connected layers: gym equipment with a small sensor, a floor map with usage traces, and a daily operating brief. Dashed guides connect the layers."
    >
      <g className="isoq-guides">
        <Stroke
          points={[
            [-128, -115, 8],
            [-128, -115, 136],
            [-86, -76, 215],
          ]}
          p={p}
        />
        <Stroke
          points={[
            [128, 115, 8],
            [128, 115, 136],
            [86, 76, 215],
          ]}
          p={p}
        />
        <Stroke
          points={[
            [-128, 115, 8],
            [-128, 115, 136],
            [-86, 76, 215],
          ]}
          p={p}
        />
        <Stroke
          points={[
            [128, -115, 8],
            [128, -115, 136],
            [86, -76, 215],
          ]}
          p={p}
          data-site-motion-guide="signal"
        />
      </g>
      <g data-isoq-reveal="floor">
        <Plate x={-145} y={-130} w={290} d={260} h={8} p={p} />
        <g className="isoq-floor-grid">
          {[-85, -25, 35, 95].map((x) => (
            <Stroke
              key={`x${x}`}
              points={[
                [x, -125, 9],
                [x, 125, 9],
              ]}
              p={p}
            />
          ))}
          {[-70, -10, 50, 110].map((y) => (
            <Stroke
              key={`y${y}`}
              points={[
                [-140, y, 9],
                [140, y, 9],
              ]}
              p={p}
            />
          ))}
        </g>
        <Stroke
          points={[
            [-135, -120, 9],
            [-135, -120, 31],
            [125, -120, 31],
            [125, -120, 9],
          ]}
          p={p}
          className="isoq-fine"
        />
        <Rack x={-105} y={-77} z={9} p={p} />
        <Bench x={-74} y={-20} z={9} p={p} />
        <Stack x={40} y={-74} z={9} p={p} />
        <Plate x={-95} y={55} w={72} d={34} z={9} h={4} p={p} />
        <Stroke
          points={[
            [-92, 71, 14],
            [-33, 71, 14],
            [-33, 67, 36],
            [-40, 67, 36],
            [-40, 71, 14],
          ]}
          p={p}
        />
        <Plate x={30} y={57} w={43} d={34} z={9} h={4} p={p} />
        <Sensor x={100} y={105} z={17} p={p} />
      </g>
      <g data-isoq-reveal="context" data-isoq-lift="context">
        <Plate x={-126} y={-112} w={252} d={224} z={129} h={4} p={p} />
        <Stroke
          points={[
            [-112, -98, 134],
            [-12, -98, 134],
            [-12, -28, 134],
            [110, -28, 134],
            [110, 97, 134],
            [-112, 97, 134],
            [-112, -98, 134],
          ]}
          p={p}
          className="isoq-fine"
        />
        <Stroke
          points={[
            [-12, -28, 134],
            [-112, -28, 134],
          ]}
          p={p}
          className="isoq-fine"
        />
        <Stroke
          points={[
            [15, -15, 134],
            [15, 97, 134],
          ]}
          p={p}
          className="isoq-fine"
        />
        {[
          [-83, -70],
          [-56, -70],
          [-29, -70],
          [46, 12],
          [73, 12],
          [46, 40],
          [73, 40],
          [-77, 44],
          [-48, 44],
        ].map(([x, y], i) => (
          <Plate
            key={i}
            x={x}
            y={y}
            w={17}
            d={18}
            z={134}
            h={i === 2 ? 8 : 3}
            p={p}
            accent={i === 2}
          />
        ))}
        <Stroke
          points={[
            [-44, 6, 136],
            [-44, 18, 136],
            [-14, 18, 136],
            [-14, 55, 136],
            [-1, 55, 136],
          ]}
          p={p}
          className="isoq-accent"
        />
        {[
          [-44, 6],
          [-1, 55],
          [97, 76],
        ].map(([x, y], i) => {
          const [cx, cy] = p(x, y, 136);
          return <circle key={i} cx={cx} cy={cy} r="3" className="isoq-dot" />;
        })}
      </g>
      <g data-isoq-reveal="brief" data-isoq-lift="brief">
        <Sheet x={-80} y={-75} z={221} w={166} d={150} p={p} />
        <Stroke
          points={[
            [-66, -44, 225],
            [59, -44, 225],
          ]}
          p={p}
          className="isoq-fine"
        />
        <Stroke
          points={[
            [4, -10, 225],
            [4, 39, 225],
            [66, 39, 225],
          ]}
          p={p}
          className="isoq-fine"
        />
        <Stroke
          points={[
            [11, 27, 225],
            [20, 24, 225],
            [30, 30, 225],
            [41, 11, 225],
            [53, 5, 225],
            [62, -2, 225],
          ]}
          p={p}
          className="isoq-accent"
        />
        <Plate x={-65} y={35} w={53} d={20} z={225} h={2} p={p} />
        <Stroke
          points={[
            [-56, 45, 228],
            [-24, 45, 228],
          ]}
          p={p}
          className="isoq-accent"
        />
      </g>
      <g className="isoq-callouts">
        <path d="M478 149h44m-31 123h46m-45 151h56" />
        <circle cx="478" cy="149" r="2" />
        <circle cx="491" cy="272" r="2" />
        <circle cx="492" cy="423" r="2" />
        <text x="533" y="146">
          DAILY BRIEF
        </text>
        <text x="548" y="269">
          FLOOR CONTEXT
        </text>
        <text x="559" y="420">
          EQUIPMENT
        </text>
      </g>
    </Illustration>
  );
}

export function EquipmentIllustration(props) {
  return <EquipmentArt {...props} />;
}
export function OperationsIllustration(props) {
  return <OperationsArt {...props} />;
}
export function PortfolioIllustration(props) {
  return <PortfolioArt {...props} />;
}

export function BriefIllustration(props) {
  return (
    <Illustration
      title="An operating brief grounded in your floor"
      description="Layered daily brief sheets combine usage bars, an operating trend, and two completed action checks."
      {...props}
    >
      <g data-isoq-reveal>
        <Plate x={-70} y={-59} w={140} d={118} h={6} />
        <Stroke
          points={[
            [-61, 43, 7],
            [60, 43, 7],
          ]}
          className="isoq-fine"
        />
      </g>
      <g data-isoq-lift data-isoq-reveal>
        <Sheet x={-55} y={-43} z={32} w={116} d={99} />
        <Stroke
          points={[
            [18, -8, 36],
            [27, -12, 36],
            [34, -8, 36],
            [41, -19, 36],
            [48, -21, 36],
          ]}
          className="isoq-accent"
        />
        <Sensor x={-45} y={59} z={16} />
      </g>
    </Illustration>
  );
}

export function SetQIcon({
  name = "equipment",
  size = 24,
  className = "",
  animate = true,
  ...props
}) {
  const paths = {
    equipment: (
      <>
        <path d="M5 20V4h14v16M3 20h4m10 0h4" data-icon-draw />
        <g data-icon-weight>
          <path d="M3 13h18" />
          <rect x="5" y="10" width="2" height="6" rx=".6" fill="#f5f2eb" />
          <rect x="17" y="10" width="2" height="6" rx=".6" fill="#f5f2eb" />
        </g>
        <path d="M8 5v2m8-2v2" />
      </>
    ),
    operations: (
      <>
        <path d="M14 4a5 5 0 0 0-6 6l-5 5a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 3-3-3z" />
        <circle cx="6" cy="17" r=".6" />
      </>
    ),
    portfolio: (
      <>
        <path d="M3 3v17h18" data-icon-draw />
        <rect
          x="5"
          y="14"
          width="3"
          height="4"
          rx=".5"
          fill="#f5f2eb"
          data-icon-bar
        />
        <rect
          x="11"
          y="11"
          width="3"
          height="7"
          rx=".5"
          fill="#f5f2eb"
          data-icon-bar
        />
        <rect
          x="17"
          y="7"
          width="3"
          height="11"
          rx=".5"
          fill="#dde4d2"
          data-icon-bar
        />
        <path d="m5 9 7-4 5 1 4-3" stroke="#889775" data-icon-draw />
        <circle cx="12" cy="5" r="1" fill="#889775" stroke="none" />
      </>
    ),
    brief: (
      <>
        <path d="M6 3h12v18H6z" data-icon-draw />
        <path d="M9 7h6M9 10h4" />
        <path d="m9 16 2 2 4-4" stroke="#889775" data-icon-check />
      </>
    ),
    sensor: (
      <>
        <ellipse cx="12" cy="13" rx="7" ry="3" />
        <path d="M5 13v5c0 4 14 4 14 0v-5M8 7a6 6 0 0 1 8 0M5 4a10 10 0 0 1 14 0" />
        <circle cx="12" cy="13" r=".5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`setq-icon ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-icon-animate={String(animate)}
      data-icon-name={name}
      {...props}
    >
      {paths[name] || paths.equipment}
    </svg>
  );
}

export const LayersDiagram = SensorFloorBrief;
