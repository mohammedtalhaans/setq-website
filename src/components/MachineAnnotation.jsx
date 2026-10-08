import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { X, Radio, ClipboardCheck, CornerDownRight, Pin } from "lucide-react";
import { MACHINE_DATA } from "../data/machines.js";
import "../styles/machine-annotation.css";

const clamp = (value, min, max) =>
  Math.max(min, Math.min(Math.max(min, max), value));
const cleanCopy = (value) =>
  String(value || "")
    .replace(/\b(?:sample|illustrative|preview)\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
const minutesToHours = (value) => `${(value / 60).toFixed(1)}h`;

// Fixed authored profiles for this product experience. Strength profiles are
// apportioned to the existing authored daily totals. Other equipment has a
// planning profile, not sensor measurements, member identity or queue data.
const USAGE_PROFILES = {
  "lat-pulldown": [2, 4, 6, 5, 3, 2, 4, 3, 2, 3, 5, 9, 10, 6, 3, 1, 1],
  "cable-station": [2, 3, 5, 4, 3, 3, 5, 4, 3, 4, 6, 9, 10, 9, 4, 2, 1],
  "chest-press": [1, 3, 5, 4, 2, 2, 3, 3, 2, 3, 5, 8, 9, 5, 2, 1, 1],
  "bench-01": [3, 8, 14, 10, 6, 4, 7, 9, 7, 8, 13, 22, 26, 19, 10, 5, 2],
  "bench-02": [2, 5, 9, 7, 5, 4, 8, 9, 7, 5, 9, 16, 20, 15, 8, 3, 1],
  "dumbbell-rack": [
    5, 12, 20, 14, 9, 6, 12, 15, 12, 13, 22, 34, 38, 29, 17, 8, 3,
  ],
  "treadmill-01": [
    12, 24, 33, 25, 13, 8, 11, 15, 12, 14, 22, 32, 34, 26, 16, 8, 4,
  ],
  "treadmill-02": [
    9, 18, 26, 21, 11, 7, 9, 12, 10, 12, 18, 27, 29, 22, 12, 6, 3,
  ],
  "bike-01": [6, 13, 21, 16, 9, 6, 9, 12, 9, 10, 16, 23, 25, 19, 10, 5, 2],
  "mat-01": [3, 8, 13, 11, 6, 5, 9, 10, 8, 7, 12, 18, 21, 17, 9, 4, 2],
  "mat-02": [2, 6, 10, 9, 5, 4, 7, 8, 6, 6, 10, 15, 18, 13, 7, 3, 1],
  "kettlebell-rack": [2, 5, 10, 7, 4, 3, 6, 7, 5, 7, 12, 19, 22, 16, 8, 4, 1],
};

function UsageTimeGraph({ machine, measured }) {
  const gradientId = `usage-${useId().replace(/:/g, "")}`;
  const values = useMemo(() => {
    const profile = USAGE_PROFILES[machine.id] || USAGE_PROFILES["bench-01"];
    if (!measured) return profile;
    const total = profile.reduce((sum, value) => sum + value, 0);
    const result = profile.map((value) =>
      Math.round((value / total) * machine.activeMinutes),
    );
    const peak = profile.indexOf(Math.max(...profile));
    result[peak] +=
      machine.activeMinutes - result.reduce((sum, value) => sum + value, 0);
    return result;
  }, [machine, measured]);
  const peakIndex = values.indexOf(Math.max(...values));
  const [active, setActive] = useState(peakIndex);
  useEffect(() => setActive(peakIndex), [machine.id, peakIndex]);
  const maximum = Math.max(20, Math.ceil(Math.max(...values) / 20) * 20);
  const points = values.map((value, index) => ({
    x: 30 + index * 13.4,
    y: 64 - (value / maximum) * 54,
  }));
  let line = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1],
      next = points[index];
    line += ` C ${previous.x + 4.47} ${previous.y}, ${next.x - 4.47} ${next.y}, ${next.x} ${next.y}`;
  }
  const chosen = points[active];
  const time = `${String(active + 6).padStart(2, "0")}:00`;
  const tooltip = `${time} · ${values[active]} min ${measured ? "active" : "planned"}`;
  const move = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 256;
    setActive((previous) => {
      const next = clamp(Math.round((x - 30) / 13.4), 0, values.length - 1);
      return previous === next ? previous : next;
    });
  };
  const key = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setActive((index) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? values.length - 1
          : clamp(
              index + (event.key === "ArrowRight" ? 1 : -1),
              0,
              values.length - 1,
            ),
    );
  };
  return (
    <div
      className="usage-time-graph"
      data-usage-kind={measured ? "recorded" : "planning"}
      data-usage-total={values.reduce((sum, value) => sum + value, 0)}
    >
      <div className="usage-time-graph__heading">
        <strong>Equipment usage</strong>
        <span>{measured ? "Today" : "Planning view"}</span>
      </div>
      <svg
        viewBox="0 0 256 91"
        role="img"
        tabIndex="0"
        aria-label={`${machine.name}: equipment usage by time. Use left and right arrow keys to inspect each hour.`}
        onPointerMove={move}
        onPointerDown={move}
        onKeyDown={key}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#889775" stopOpacity=".32" />
            <stop offset="1" stopColor="#889775" stopOpacity=".025" />
          </linearGradient>
        </defs>
        <text x="1" y="8" className="usage-time-graph__unit">
          min
        </text>
        {[0, maximum / 2, maximum].map((value) => (
          <g key={value}>
            <path
              d={`M30 ${64 - (value / maximum) * 54}H247`}
              stroke="#d9d3c4"
              strokeWidth=".65"
              strokeDasharray={value ? "2 4" : "none"}
            />
            <text x="23" y={67 - (value / maximum) * 54} textAnchor="end">
              {value}
            </text>
          </g>
        ))}
        <path
          d={`${line} L ${points.at(-1).x} 64 L 30 64 Z`}
          fill={`url(#${gradientId})`}
        />
        <path
          className="usage-time-graph__line"
          d={line}
          fill="none"
          stroke="#6e8058"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={measured ? undefined : "4 3"}
        />
        <path
          d={`M${chosen.x} 9V64`}
          stroke="#9ba98b"
          strokeWidth=".7"
          strokeDasharray="2 3"
        />
        <circle
          cx={chosen.x}
          cy={chosen.y}
          r="3.1"
          fill="#6e8058"
          stroke="#fffdf8"
          strokeWidth="1.5"
        />
        {[0, 4, 8, 12, 16].map((index) => (
          <text key={index} x={points[index].x} y="77" textAnchor="middle">
            {String(index + 6).padStart(2, "0")}:00
          </text>
        ))}
        <text
          x="139"
          y="89"
          textAnchor="middle"
          className="usage-time-graph__time"
        >
          Time
        </text>
      </svg>
      <div
        className="usage-time-graph__tooltip"
        data-usage-tooltip
        data-hour={active + 6}
      >
        <i />
        {tooltip}
      </div>
    </div>
  );
}

const MachineAnnotation = forwardRef(function MachineAnnotation(
  { machineId, onClose, reducedMotion = false },
  ref,
) {
  const machine = MACHINE_DATA[machineId];
  const id = useId();
  const [pinned, setPinned] = useState(false);
  const [shown, setShown] = useState(false);
  const currentId = useRef(machineId);
  currentId.current = machineId;
  const onCloseRef = useRef(onClose),
    reducedRef = useRef(reducedMotion);
  onCloseRef.current = onClose;
  reducedRef.current = reducedMotion;
  const layer = useRef(),
    card = useRef(),
    face = useRef(),
    leader = useRef(),
    pin = useRef(),
    anchor = useRef();
  const float = useRef({ value: 0 });
  const visual = useRef({ progress: 0, opacity: 0, lift: 16, scale: 0.955 });
  const placement = useRef({
    initialized: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    targetX: 0,
    targetY: 0,
    width: 264,
    height: 290,
    frame: 0,
    lastTime: 0,
    entry: null,
  });
  const paint = useCallback(() => {
    const point = anchor.current,
      state = placement.current,
      entry = visual.current;
    if (
      !point ||
      point.id !== currentId.current ||
      !card.current ||
      !face.current ||
      !layer.current
    )
      return;
    const bob = float.current.value;
    card.current.style.left = `${state.x.toFixed(3)}px`;
    card.current.style.top = `${state.y.toFixed(3)}px`;
    card.current.style.transform = `translate3d(0,${bob.toFixed(3)}px,0)`;
    face.current.style.opacity = entry.opacity.toFixed(4);
    face.current.style.transform = `translate3d(0,${entry.lift.toFixed(3)}px,0) scale(${entry.scale.toFixed(4)})`;
    const visualLeft = state.x + (state.width * (1 - entry.scale)) / 2;
    const visualWidth = state.width * entry.scale;
    const footerY = state.y + state.height + bob + entry.lift + 4;
    let startX = clamp(point.x, visualLeft + 18, visualLeft + visualWidth - 18),
      startY = footerY;
    if (point.y < footerY + 9) {
      startX =
        point.x < visualLeft + visualWidth / 2
          ? visualLeft - 3
          : visualLeft + visualWidth + 4;
      startY = clamp(
        point.y - 18,
        state.y + 44 + bob + entry.lift,
        footerY - 20,
      );
    }
    const controlY = startY + (point.y - startY) * 0.55;
    leader.current?.setAttribute(
      "d",
      `M ${startX} ${startY} C ${startX} ${controlY}, ${point.x} ${controlY}, ${point.x} ${point.y}`,
    );
    if (leader.current) {
      leader.current.style.opacity = String(Math.min(1, entry.progress * 1.8));
      if (entry.progress < 0.999) {
        const length = leader.current.getTotalLength();
        leader.current.style.strokeDasharray = `${length}`;
        leader.current.style.strokeDashoffset = `${length * (1 - entry.progress)}`;
      } else {
        leader.current.style.strokeDasharray = "none";
        leader.current.style.strokeDashoffset = "0";
      }
    }
    pin.current?.setAttribute(
      "transform",
      `translate(${point.x} ${point.y}) scale(${Math.min(1, entry.progress * 2)})`,
    );
    if (pin.current)
      pin.current.style.opacity = String(Math.min(1, entry.progress * 2));
    const data = layer.current.dataset;
    Object.assign(data, {
      anchorX: point.x.toFixed(2),
      anchorY: point.y.toFixed(2),
      headY: point.y.toFixed(2),
      floorX: point.floorX.toFixed(2),
      floorY: point.floorY.toFixed(2),
      cardX: state.x.toFixed(2),
      cardY: state.y.toFixed(2),
      leaderStartX: startX.toFixed(2),
      leaderStartY: startY.toFixed(2),
      stageWidth: String(point.width),
      stageHeight: String(point.height),
      bobOffset: bob.toFixed(3),
      entryProgress: entry.progress.toFixed(3),
    });
  }, []);
  const settle = useCallback(
    (time) => {
      const state = placement.current;
      state.frame = 0;
      if (document.hidden || !layer.current) return;
      const dt = Math.min(
        0.04,
        Math.max(0.001, (time - (state.lastTime || time - 16)) / 1000),
      );
      state.lastTime = time;
      const omega = 17,
        decay = Math.exp(-omega * dt);
      for (const [position, velocity, target] of [
        ["x", "vx", "targetX"],
        ["y", "vy", "targetY"],
      ]) {
        const distance = state[position] - state[target],
          impulse = state[velocity] + omega * distance;
        state[position] = state[target] + (distance + impulse * dt) * decay;
        state[velocity] = (state[velocity] - omega * impulse * dt) * decay;
      }
      const moving =
        Math.abs(state.x - state.targetX) +
          Math.abs(state.y - state.targetY) +
          Math.abs(state.vx) +
          Math.abs(state.vy) >
        0.12;
      if (!moving) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.vx = state.vy = 0;
      }
      if (layer.current)
        layer.current.dataset.placementSettled = String(!moving);
      paint();
      if (moving) state.frame = requestAnimationFrame(settle);
    },
    [paint],
  );
  const place = useCallback(
    (value) => {
      if (value) anchor.current = value;
      const point = anchor.current,
        state = placement.current;
      if (
        !point ||
        point.id !== currentId.current ||
        !card.current ||
        !layer.current
      )
        return;
      state.width = card.current.offsetWidth || 264;
      state.height = card.current.offsetHeight || 290;
      const viewWidth = layer.current.clientWidth || point.width;
      const viewHeight = layer.current.clientHeight || point.height;
      const margin = viewWidth < 420 ? 12 : 18;
      state.targetX = clamp(
        point.x - state.width / 2,
        margin,
        viewWidth - state.width - margin - 6,
      );
      state.targetY = clamp(
        point.y - state.height - 24,
        margin,
        viewHeight - 50 - state.height,
      );
      if (state.initialized) {
        const x = clamp(state.x, margin, viewWidth - state.width - margin - 6);
        const y = clamp(state.y, margin, viewHeight - 50 - state.height);
        if (x !== state.x) {
          state.x = x;
          state.vx = 0;
        }
        if (y !== state.y) {
          state.y = y;
          state.vy = 0;
        }
      }
      if (!state.initialized) {
        state.initialized = true;
        state.x = state.targetX;
        state.y = state.targetY;
        layer.current.style.visibility = "visible";
        setShown(true);
        state.entry?.kill();
        if (reducedRef.current)
          Object.assign(visual.current, {
            progress: 1,
            opacity: 1,
            lift: 0,
            scale: 1,
          });
        else {
          // A local wall-clock entrance stays coordinated with camera focus,
          // even when a busy first WebGL frame triggers GSAP lag smoothing.
          const started = performance.now();
          const animation = {
            frame: 0,
            cancelled: false,
            kill() {
              this.cancelled = true;
              if (this.frame) cancelAnimationFrame(this.frame);
              this.frame = 0;
            },
            resume() {
              if (!this.cancelled && !this.frame)
                this.frame = requestAnimationFrame(tick);
            },
          };
          const tick = (time) => {
            animation.frame = 0;
            if (animation.cancelled || document.hidden) return;
            const progress = Math.min(1, (time - started) / 680);
            const eased = progress * progress * (3 - 2 * progress);
            Object.assign(visual.current, {
              progress: eased,
              opacity: eased,
              lift: 16 * (1 - eased),
              scale: 0.955 + 0.045 * eased,
            });
            paint();
            if (progress < 1) animation.resume();
          };
          state.entry = animation;
          animation.resume();
        }
      }
      if (reducedRef.current) {
        state.x = state.targetX;
        state.y = state.targetY;
        state.vx = state.vy = 0;
        if (state.frame) cancelAnimationFrame(state.frame);
        state.frame = 0;
        layer.current.dataset.placementSettled = "true";
      } else if (
        !state.frame &&
        Math.abs(state.x - state.targetX) + Math.abs(state.y - state.targetY) >
          0.025
      ) {
        layer.current.dataset.placementSettled = "false";
        state.lastTime = performance.now();
        state.frame = requestAnimationFrame(settle);
      }
      if (
        !state.frame &&
        Math.abs(state.x - state.targetX) + Math.abs(state.y - state.targetY) <=
          0.025
      ) {
        layer.current.dataset.placementSettled = "true";
      }
      paint();
    },
    [paint, settle],
  );
  useImperativeHandle(
    ref,
    () => ({
      updateAnchor: place,
      getCardSize: () => ({
        width: card.current?.offsetWidth || 264,
        height: card.current?.offsetHeight || 290,
      }),
    }),
    [place],
  );
  useLayoutEffect(() => {
    const state = placement.current;
    state.entry?.kill();
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
    state.initialized = false;
    state.vx = state.vy = 0;
    anchor.current = null;
    Object.assign(visual.current, {
      progress: 0,
      opacity: 0,
      lift: 16,
      scale: 0.955,
    });
    float.current.value = 0;
    if (layer.current) layer.current.style.visibility = "hidden";
    if (face.current) {
      face.current.style.opacity = "0";
      face.current.style.transform = "translate3d(0,16px,0) scale(.955)";
    }
    setPinned(false);
    setShown(false);
    return () => {
      state.entry?.kill();
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
    };
  }, [machineId]);
  useLayoutEffect(() => {
    if (!card.current) return;
    const observer = new ResizeObserver(() => place());
    observer.observe(card.current);
    const visibility = () => {
      if (!document.hidden) {
        placement.current.entry?.resume?.();
        place();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    place();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [place, machineId]);
  useEffect(() => {
    if (reducedMotion) {
      placement.current.entry?.kill();
      Object.assign(visual.current, {
        progress: 1,
        opacity: 1,
        lift: 0,
        scale: 1,
      });
      float.current.value = 0;
      place();
    }
  }, [reducedMotion, place]);
  useEffect(() => {
    if (!shown || !card.current) return;
    const element = card.current;
    float.current.value = 0;
    paint();
    if (reducedMotion) return;
    const idle = gsap.to(float.current, {
      value: -4,
      duration: 2.15,
      delay: 0.8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      paused: true,
      onUpdate: paint,
    });
    let intersects = false,
      hovering = element.matches(":hover"),
      disposed = false;
    const update = () => {
      if (disposed) return;
      const focused =
        element.contains(document.activeElement) &&
        document.activeElement?.matches?.(":focus-visible");
      if (
        intersects &&
        !document.hidden &&
        !hovering &&
        !element.matches(":hover") &&
        !focused
      )
        idle.resume();
      else idle.pause();
    };
    const enter = () => {
        hovering = true;
        update();
      },
      leave = () => {
        hovering = false;
        update();
      },
      focus = () => update(),
      blur = () => queueMicrotask(update);
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersects = entry.isIntersecting;
        update();
      },
      { threshold: 0.01 },
    );
    observer.observe(element);
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focusin", focus);
    element.addEventListener("focusout", blur);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true;
      idle.kill();
      observer.disconnect();
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusin", focus);
      element.removeEventListener("focusout", blur);
      document.removeEventListener("visibilitychange", update);
      float.current.value = 0;
      paint();
    };
  }, [shown, machineId, reducedMotion, paint]);
  useEffect(() => {
    if (!machine || !shown || pinned) return;
    const deadline = performance.now() + 10000;
    if (layer.current)
      layer.current.dataset.closeDeadline = deadline.toFixed(2);
    let cancelled = false,
      expired = false,
      didClose = false,
      exitAnimation,
      timer,
      exitTimer;
    const finish = () => {
      if (cancelled || expired) return;
      expired = true;
      const close = () => {
        if (cancelled || didClose) return;
        didClose = true;
        clearTimeout(exitTimer);
        onCloseRef.current?.({ reason: "timeout" });
      };
      if (reducedRef.current || document.hidden) close();
      else {
        exitAnimation = gsap.to(visual.current, {
          opacity: 0,
          lift: 7,
          duration: 0.22,
          ease: "power2.in",
          onUpdate: paint,
          onComplete: close,
          overwrite: true,
        });
        exitTimer = setTimeout(close, 250);
      }
    };
    timer = setTimeout(finish, 10000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(exitTimer);
      exitAnimation?.kill();
    };
  }, [machineId, machine, shown, pinned, paint]);
  if (!machine) return null;
  const measured = machine.measurement === "sample";
  return (
    <div
      ref={layer}
      className="machine-annotation"
      data-equipment-card
      data-equipment-id={machineId}
      data-pinned={pinned ? "true" : "false"}
      style={{ visibility: "hidden" }}
    >
      <svg className="machine-annotation__leader" aria-hidden="true">
        <path ref={leader} fill="none" stroke="#8f7c61" strokeWidth="1" />
        <g ref={pin}>
          <circle
            r="8"
            fill="#f5f2eb"
            fillOpacity=".8"
            stroke="#acb496"
            strokeWidth=".8"
          />
          <circle r="3" fill="#708159" stroke="#fffdf8" strokeWidth="1.2" />
        </g>
      </svg>
      <section
        ref={card}
        className="machine-annotation__card"
        aria-labelledby={`${id}-name`}
        data-testid="machine-annotation-card"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div ref={face} className="machine-annotation__surface">
          <div className="machine-annotation__top">
            <span className="machine-annotation__asset">
              SETQ / {machine.assetId}
            </span>
            <button
              className="machine-annotation__pin"
              aria-label={pinned ? "Allow auto-close" : "Keep open"}
              aria-pressed={pinned}
              title={
                pinned
                  ? "Allow this equipment card to close automatically"
                  : "Keep this equipment card open"
              }
              onClick={() => setPinned((value) => !value)}
            >
              <Pin size={11} />
            </button>
            <button
              className="machine-annotation__close"
              onClick={onClose}
              aria-label="Close equipment annotation"
            >
              <X size={14} />
            </button>
          </div>
          <div className="machine-annotation__identity">
            <span className="machine-annotation__icon">
              {measured ? <Radio size={17} /> : <ClipboardCheck size={17} />}
            </span>
            <div>
              <h3 id={`${id}-name`}>{machine.name}</h3>
              <p>
                {machine.category} <span>·</span>{" "}
                {machine.zone === "recovery"
                  ? "Open floor"
                  : machine.zone === "cardio"
                    ? "Cardio zone"
                    : "Strength floor"}
              </p>
            </div>
          </div>
          {measured ? (
            <div className="machine-annotation__metrics">
              <div>
                <strong>{minutesToHours(machine.activeMinutes)}</strong>
                <span title="Recorded active time in the observation window">
                  Active time
                </span>
              </div>
              <div>
                <strong>
                  {machine.activityShare}
                  <small>%</small>
                </strong>
                <span title="Time away from rest as a share of observed equipment time">
                  Activity share
                </span>
              </div>
              <div>
                <strong>
                  {machine.coverage}
                  <small>%</small>
                </strong>
                <span title="Share of the observation window with available data">
                  Data coverage
                </span>
              </div>
            </div>
          ) : (
            <div className="machine-annotation__inventory">
              {machine.spec.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          )}
          <UsageTimeGraph machine={machine} measured={measured} />
          {measured ? (
            <div className="machine-annotation__context">
              <span>Peak activity</span>
              <strong>{machine.peakWindow}</strong>
            </div>
          ) : (
            <div className="machine-annotation__record">
              <ClipboardCheck size={13} />
              <div>
                <span>{cleanCopy(machine.reviewStatus || machine.status)}</span>
                <small>
                  Review · {machine.lastReview} <span>→</span>{" "}
                  {machine.nextReview}
                </small>
              </div>
              <span className="machine-annotation__record-dot" />
            </div>
          )}
          <div className="machine-annotation__insight">
            <CornerDownRight size={12} />
            <p>{cleanCopy(machine.insight)}</p>
          </div>
          <div className="machine-annotation__footer">
            <span>
              <i />
              {measured ? "Equipment intelligence" : "Floor planning"}
            </span>
            <span className="machine-annotation__source">
              {measured ? "TODAY" : "NORTHSIDE"}
            </span>
          </div>
        </div>
      </section>
      <span className="sr-only" role="status">
        {machine.name} selected. Equipment details shown.
      </span>
    </div>
  );
});
export default MachineAnnotation;
