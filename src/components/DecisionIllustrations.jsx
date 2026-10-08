import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { MACHINE_DATA } from "../data/machines.js";
import "../styles/illustrations.css";

function useDecisionMotion(ref, animate) {
  useEffect(() => {
    if (!animate || !ref.current) return;
    const root = ref.current;
    let played = false,
      timeline,
      observer;
    const context = gsap.context(() => {
      timeline = gsap.timeline({ paused: true });
      timeline.fromTo(
        root.querySelectorAll("[data-art-reveal]"),
        { y: 8, opacity: 0.55 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
          immediateRender: false,
        },
        0,
      );
      const bars = root.querySelectorAll("[data-art-bar]");
      bars.forEach((bar, i) => {
        const height = +bar.getAttribute("height"),
          y = +bar.getAttribute("y");
        timeline.set(
          bar,
          {
            attr: { height: 0.1, y: y + height - 0.1 },
            immediateRender: false,
          },
          0,
        );
        timeline.to(
          bar,
          { attr: { height, y }, duration: 0.75, ease: "power3.out" },
          0.12 + i * 0.03,
        );
      });
      root.querySelectorAll("[data-art-draw]").forEach((path, i) => {
        const length = path.getTotalLength();
        timeline.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 0.8,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.12 + i * 0.05,
        );
      });
      root.querySelectorAll("[data-art-check]").forEach((path, i) => {
        const length = path.getTotalLength();
        timeline.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 0.35,
            ease: "power2.out",
            immediateRender: false,
          },
          0.58 + i * 0.12,
        );
      });
      const status = root.querySelectorAll("[data-art-status]");
      status.forEach((node) => {
        const r = +node.getAttribute("r");
        timeline.fromTo(
          node,
          { attr: { r: r * 0.6 }, opacity: 0.4 },
          {
            attr: { r },
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.6)",
            immediateRender: false,
          },
          0.45,
        );
      });
    }, root);
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played && !document.hidden) {
          played = true;
          timeline.play();
          root.dataset.artMotion = "playing";
        } else if (!entry.isIntersecting && played) {
          timeline.progress(1).pause();
          root.dataset.artMotion = "complete";
        }
      },
      { threshold: 0.22 },
    );
    timeline.eventCallback("onComplete", () => {
      root.dataset.artMotion = "complete";
      observer.disconnect();
    });
    const visibility = () => {
      if (document.hidden && played) {
        timeline.progress(1).pause();
        root.dataset.artMotion = "complete";
      }
    };
    observer.observe(root);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      context.revert();
      delete root.dataset.artMotion;
    };
  }, [ref, animate]);
}
function Art({
  title,
  description,
  children,
  animate = true,
  className = "",
  ...props
}) {
  const id = useId(),
    ref = useRef(null);
  useDecisionMotion(ref, animate);
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 260"
      className={`setq-illustration setq-decision-art ${className}`}
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
      data-art-animate={String(animate)}
      {...props}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-description`}>{description}</desc>
      {children}
    </svg>
  );
}
function Card({ x, y, width, height, children }) {
  return (
    <g>
      <rect
        x={x + 3}
        y={y + 4}
        width={width}
        height={height}
        rx="9"
        className="art-card-side"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="9"
        className="art-card"
      />
      {children}
    </g>
  );
}
function Pulldown({ x = 40, y = 35, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="55" cy="182" rx="65" ry="8" className="art-ground" />
      <path d="M4 174h105l9 9H-4z" className="art-metal" />
      <rect
        x="10"
        y="16"
        width="83"
        height="153"
        rx="5"
        className="art-machine-back"
      />
      <path d="M8 173V15Q8 9 14 9H96Q102 9 102 15V173" className="art-frame" />
      <path d="M23 170V31M87 170V31" className="art-rail" />
      <rect
        x="29"
        y="54"
        width="42"
        height="105"
        rx="4"
        className="art-machine-shadow"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect
            x="31"
            y={98 + i * 7}
            width="39"
            height="5"
            rx="1.3"
            className="art-weight"
          />
          <circle cx="65" cy={100.5 + i * 7} r=".9" className="art-pin" />
        </g>
      ))}
      <path d="M51 96V25H109V62" className="art-cable" />
      <circle cx="109" cy="24" r="5.5" className="art-pulley" />
      <path d="M80 66l11-6h33l12 6" className="art-pullbar" />
      <path d="M105 149v24M87 171h34" className="art-frame" />
      <rect x="86" y="145" width="37" height="10" rx="4" className="art-pad" />
      <path d="M80 126h43" className="art-rail" />
      <rect x="77" y="122" width="17" height="9" rx="4" className="art-pad" />
      <rect x="111" y="122" width="17" height="9" rx="4" className="art-pad" />
      <rect
        x="77"
        y="42"
        width="17"
        height="13"
        rx="3"
        className="art-sensor"
      />
      <circle cx="89" cy="46" r="2" className="art-status" data-art-status />
    </g>
  );
}

export function EquipmentArt(props) {
  const machine = MACHINE_DATA["lat-pulldown"];
  const values = machine.sparkline.map((value) =>
    Math.max(7, (value - 180) * 0.52),
  );
  return (
    <Art
      title="Choose equipment with a clearer view of activity"
      description="A recognizable lat pulldown beside a legible equipment activity chart and its active-time reading."
      {...props}
    >
      <g data-art-reveal>
        <Pulldown x={28} y={25} scale={1.03} />
        <text x="88" y="236" textAnchor="middle" className="art-object-caption">
          Lat pulldown
        </text>
      </g>
      <g data-art-reveal>
        <Card x={191} y={48} width={178} height={167}>
          <text x="207" y="72" className="art-label">
            Equipment activity
          </text>
          <text x="207" y="111" className="art-number">
            {machine.activityShare}
            <tspan className="art-number-unit">%</tspan>
          </text>
          <text x="277" y="104" className="art-meta">
            active time
          </text>
          <path d="M207 181H353M207 155H353" className="art-chart-rule" />
          {values.map((height, i) => (
            <rect
              key={i}
              x={209 + i * 20}
              y={180 - height}
              width="13"
              height={height}
              rx="2"
              className={i === 6 ? "art-bar-highlight" : "art-bar"}
              data-art-bar
            />
          ))}
          <text x="207" y="195" className="art-meta">
            7-day equipment pattern
          </text>
        </Card>
      </g>
      <path d="M154 126H177l7-7" className="art-route" data-art-draw />
      <circle cx="178" cy="126" r="3" className="art-status" data-art-status />
    </Art>
  );
}

export function OperationsArt(props) {
  return (
    <Art
      title="Give your team a clear operating focus"
      description="A sensor-equipped weight-stack machine connects to a large checklist for equipment, coverage and shift reviews."
      {...props}
    >
      <g data-art-reveal>
        <Pulldown x={32} y={64} scale={0.77} />
        <text x="83" y="227" textAnchor="middle" className="art-object-caption">
          Connected equipment
        </text>
      </g>
      <path
        d="M146 133h18q10 0 10-10v-9h17"
        className="art-route"
        data-art-draw
      />
      <g data-art-reveal>
        <Card x={191} y={36} width={176} height={194}>
          <rect
            x="247"
            y="27"
            width="66"
            height="18"
            rx="5"
            className="art-clipboard-clip"
          />
          <rect
            x="269"
            y="32"
            width="22"
            height="4"
            rx="2"
            className="art-clip-light"
          />
          <text x="207" y="69" className="art-label">
            Today's focus
          </text>
          {["Equipment check", "Sensor coverage", "Shift review"].map(
            (label, i) => (
              <g key={label}>
                <circle
                  cx="216"
                  cy={95 + i * 46}
                  r="10"
                  className={i < 2 ? "art-check-circle" : "art-pending-circle"}
                />
                {i < 2 ? (
                  <path
                    d={`M211 ${95 + i * 46}l3 3 7-7`}
                    className="art-check"
                    data-art-check
                  />
                ) : (
                  <circle cx="216" cy="187" r="2" className="art-status" />
                )}
                <text x="236" y={99 + i * 46} className="art-task">
                  {label}
                </text>
                <path
                  d={`M236 ${111 + i * 46}H${i === 2 ? 312 : 339}`}
                  className="art-text-rule"
                />
              </g>
            ),
          )}
        </Card>
      </g>
    </Art>
  );
}

function ClubBuilding({ x, y, kind }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="38" cy="84" rx="45" ry="5" className="art-ground" />
      {kind === "gable" ? (
        <>
          <path d="M-4 29 38 6 81 29" className="art-building-roof" />
          <rect
            x="3"
            y="29"
            width="70"
            height="53"
            rx="2"
            className="art-building-face"
          />
        </>
      ) : (
        <>
          <rect
            x="2"
            y={kind === "loft" ? 0 : 20}
            width="74"
            height={kind === "loft" ? 82 : 62}
            rx="3"
            className="art-building-face"
          />
          <path
            d={kind === "loft" ? "M-3 0H81V9H-3Z" : "M-3 20H81V33H-3Z"}
            className="art-building-roof"
          />
        </>
      )}
      {kind === "loft" &&
        [12, 32, 52].map((y) => (
          <path key={y} d={`M4 ${y}H74`} className="art-brick-line" />
        ))}
      {[12, 32, 52].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={kind === "loft" ? 17 : 43}
          width="13"
          height="17"
          rx="1.5"
          className="art-window"
        />
      ))}
      {kind === "loft" &&
        [12, 52].map((x) => (
          <rect
            key={x}
            x={x}
            y="44"
            width="13"
            height="17"
            rx="1.5"
            className="art-window"
          />
        ))}
      <rect x="29" y="62" width="19" height="20" rx="1" className="art-door" />
      <path d="M38.5 63v18" className="art-text-rule" />
      <path d="M-6 83H82" className="art-building-ground" />
    </g>
  );
}
export function PortfolioArt(props) {
  const clubs = [
    { name: "Northside", value: 56.2, kind: "flat", bars: [20, 28, 33, 40] },
    { name: "Riverside", value: 48, kind: "gable", bars: [27, 18, 24, 31] },
    { name: "The Studio", value: 56, kind: "loft", bars: [19, 24, 35, 37] },
  ];
  return (
    <Art
      title="Compare the operating picture across your clubs"
      description="Three clearly distinct gym buildings, Northside, Riverside and The Studio, each paired with a floor-activity plot."
      {...props}
    >
      <text x="26" y="28" className="art-label">
        One club. Your next club.
      </text>
      {clubs.map((club, i) => {
        const x = 22 + i * 122;
        return (
          <g key={club.name} data-art-reveal>
            <Card x={x} y={45} width={110} height={194}>
              <ClubBuilding x={x + 16} y={54} kind={club.kind} />
              <text x={x + 13} y="156" className="art-club-name">
                {club.name}
              </text>
              {club.bars.map((height, j) => (
                <rect
                  key={j}
                  x={x + 14 + j * 19}
                  y={203 - height}
                  width="12"
                  height={height}
                  rx="1.5"
                  className={j === 3 ? "art-bar-highlight" : "art-bar"}
                  data-art-bar
                />
              ))}
              <path d={`M${x + 12} 204h83`} className="art-chart-rule" />
              <text x={x + 14} y="225" className="art-club-metric">
                {club.value}% <tspan className="art-club-unit">active</tspan>
              </text>
            </Card>
          </g>
        );
      })}
    </Art>
  );
}
