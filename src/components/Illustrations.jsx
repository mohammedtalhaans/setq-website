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
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      (context) => {
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
      },
      root,
    );
    return () => mm.revert();
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
  return (
    <Illustration
      title="Plan equipment with floor context"
      description="A squat rack and bench on a measured floor platform, with an adjacent usage strip."
      {...props}
    >
      <g className="isoq-guides">
        <Stroke
          points={[
            [-78, -65, 0],
            [-78, 80, 0],
            [78, 80, 0],
          ]}
        />
        <Stroke
          points={[
            [-83, -62, 0],
            [-73, -62, 0],
          ]}
        />
        <Stroke
          points={[
            [74, 76, 0],
            [74, 84, 0],
          ]}
        />
      </g>
      <g data-isoq-reveal>
        <Plate x={-65} y={-57} w={130} d={125} h={6} />
        <Rack x={-42} y={-31} z={6} />
        <Bench x={13} y={17} z={6} />
        <Stroke
          points={[
            [-54, 51, 7],
            [-15, 51, 7],
            [-15, 28, 7],
          ]}
          className="isoq-fine"
        />
      </g>
      <g data-isoq-lift data-isoq-reveal>
        <Plate x={42} y={-68} w={18} d={70} z={15} h={4} />
        {[6, 11, 7, 14, 10].map((w, i) => (
          <Stroke
            key={i}
            points={[
              [45, -59 + i * 11, 20],
              [45 + w, -59 + i * 11, 20],
            ]}
            className={i === 3 ? "isoq-accent" : "isoq-fine"}
          />
        ))}
      </g>
    </Illustration>
  );
}
export function OperationsIllustration(props) {
  return (
    <Illustration
      title="Keep the gym floor running"
      description="A cable machine with a sensor, plus an inspection sheet showing completed maintenance checks."
      {...props}
    >
      <g data-isoq-reveal>
        <Plate x={-63} y={-56} w={127} d={116} h={6} />
        <Stack x={-42} y={-33} z={6} />
        <Bench x={0} y={28} z={6} />
      </g>
      <g data-isoq-lift data-isoq-reveal>
        <Sheet x={15} y={-65} z={63} w={68} d={66} charts={false} />
        <Stroke
          points={[
            [25, -38, 67],
            [63, -38, 67],
          ]}
          className="isoq-fine"
        />
        <Stroke
          points={[
            [25, -29, 67],
            [52, -29, 67],
          ]}
          className="isoq-fine"
        />
        <path
          d="M156 226l-21 13q-6 3-9-1t3-8l21-13q-2-10 7-14l7 5-7 5 4 6 8-5q4 10-6 14z"
          className="isoq-solid"
        />
      </g>
    </Illustration>
  );
}
export function PortfolioIllustration(props) {
  return (
    <Illustration
      title="See every gym in one place"
      description="Three distinct gym floor platforms linked together, each with its own equipment and operating status."
      {...props}
    >
      <g className="isoq-guides">
        <Stroke
          points={[
            [-42, -49, 5],
            [43, -48, 5],
            [47, 48, 5],
            [-40, 47, 5],
            [-42, -49, 5],
          ]}
        />
      </g>
      <g data-isoq-reveal>
        <Plate x={-83} y={-65} w={68} d={51} z={13} h={5} />
        <Rack x={-72} y={-53} z={18} small />
        <Sensor x={-28} y={-25} z={20} />
      </g>
      <g data-isoq-reveal>
        <Plate x={12} y={-54} w={73} d={59} z={25} h={5} />
        <Bench x={25} y={-39} z={30} />
        <Stroke
          points={[
            [23, -2, 31],
            [71, -2, 31],
          ]}
          className="isoq-accent"
        />
      </g>
      <g data-isoq-lift data-isoq-reveal>
        <Plate x={-39} y={29} w={100} d={65} z={34} h={5} />
        <Rack x={-25} y={40} z={39} small />
        <Bench x={13} y={63} z={39} />
        <Stroke
          points={[
            [-29, 87, 40],
            [-1, 87, 40],
          ]}
          className="isoq-fine"
        />
      </g>
    </Illustration>
  );
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
  ...props
}) {
  const paths = {
    equipment: (
      <>
        <path d="M5 20V4h14v16M5 8h14M3 14h18M8 12v4m8-4v4M3 20h4m10 0h4" />
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
        <path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    brief: (
      <>
        <path d="M6 3h12v18H6zM9 7h6M9 10h4m-4 6 2 2 4-4" />
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
      {...props}
    >
      {paths[name] || paths.equipment}
    </svg>
  );
}

export const LayersDiagram = SensorFloorBrief;
