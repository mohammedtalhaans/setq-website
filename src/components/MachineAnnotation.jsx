import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import {
  X,
  ArrowUpRight,
  Radio,
  ClipboardCheck,
  CornerDownRight,
  Pin,
} from "lucide-react";
import { MACHINE_DATA } from "../data/machines.js";
import "../styles/machine-annotation.css";

const clamp = (n, min, max) => Math.max(min, Math.min(Math.max(min, max), n));
const minutesToHours = (n) => `${(n / 60).toFixed(1)}h`;

function WeeklySignal({ values, name, trend }) {
  const maximum = Math.max(...values, 1);
  return (
    <div className="machine-signal">
      <div className="machine-signal__heading">
        <span>Activity this week</span>
        <span>
          <ArrowUpRight size={11} />
          {trend} <small>vs sample baseline</small>
        </span>
      </div>
      <svg
        viewBox="0 0 238 37"
        role="img"
        aria-label={`${name}: illustrative equipment activity trend across seven days`}
      >
        <path
          d="M0 36.5H238M0 18.5H238"
          stroke="#d9d3c4"
          strokeWidth=".65"
          strokeDasharray="2 4"
        />
        {values.map((v, i) => (
          <rect
            key={i}
            x={i * 34 + 2}
            y={36 - (v / maximum) * 30}
            width="24"
            height={(v / maximum) * 30}
            rx="2"
            fill={i === 6 ? "#6e8058" : "#bec7aa"}
          />
        ))}
      </svg>
      <div className="machine-signal__axis">
        <span>MON</span>
        <span>SUN</span>
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
  const [seconds, setSeconds] = useState(10);
  const [shown, setShown] = useState(false);
  const shownMachine = useRef(null);
  const onCloseRef = useRef(onClose);
  const motionReducedRef = useRef(reducedMotion);
  onCloseRef.current = onClose;
  motionReducedRef.current = reducedMotion;
  const float = useRef({ value: 0 });
  const countdownRing = useRef(null);
  const layer = useRef(null),
    card = useRef(null),
    face = useRef(null),
    leader = useRef(null),
    pin = useRef(null),
    anchor = useRef(null);
  const place = useCallback(
    (value) => {
      if (value) anchor.current = value;
      const point = anchor.current;
      if (!point || !card.current || !layer.current || point.id !== machineId)
        return;
      const rect = card.current.getBoundingClientRect();
      const cardWidth = card.current.offsetWidth || rect.width;
      const cardHeight = card.current.offsetHeight || rect.height;
      const margin = point.width < 420 ? 12 : 18;
      const x = clamp(
        point.x - cardWidth * 0.5,
        margin,
        point.width - cardWidth - margin - 6,
      );
      const availableBottom = point.height - (point.width < 500 ? 74 : 86);
      const y = clamp(
        point.y - cardHeight - 24,
        margin,
        availableBottom - cardHeight,
      );
      card.current.style.left = `${x}px`;
      card.current.style.top = `${y}px`;
      const bob = float.current.value;
      card.current.style.transform = `translate3d(0, ${bob.toFixed(3)}px, 0)`;
      // The leader leaves the nearest lower corner when the panel overlaps the anchor.
      const sourceX = point.x,
        sourceY = point.y;
      const footerY = y + cardHeight + 4 + bob;
      let startX = clamp(sourceX, x + 20, x + cardWidth - 20),
        startY = footerY;
      if (sourceY < footerY + 9) {
        startX = sourceX < x + cardWidth * 0.5 ? x - 3 : x + cardWidth + 4;
        startY = clamp(sourceY - 18, y + 48 + bob, y + cardHeight - 20 + bob);
      }
      const controlY = startY + (sourceY - startY) * 0.55;
      const path = `M ${startX} ${startY} C ${startX} ${controlY}, ${sourceX} ${controlY}, ${sourceX} ${sourceY}`;
      leader.current?.setAttribute("d", path);
      pin.current?.setAttribute(
        "transform",
        `translate(${sourceX} ${sourceY})`,
      );
      layer.current.style.visibility = "visible";
      if (shownMachine.current !== machineId) {
        shownMachine.current = machineId;
        setShown(true);
      }
      layer.current.dataset.anchorX = sourceX.toFixed(2);
      layer.current.dataset.anchorY = sourceY.toFixed(2);
      layer.current.dataset.headY = sourceY.toFixed(2);
      layer.current.dataset.floorX = point.floorX.toFixed(2);
      layer.current.dataset.floorY = point.floorY.toFixed(2);
      layer.current.dataset.cardX = x.toFixed(2);
      layer.current.dataset.cardY = y.toFixed(2);
      layer.current.dataset.leaderStartX = startX.toFixed(2);
      layer.current.dataset.leaderStartY = startY.toFixed(2);
      layer.current.dataset.stageWidth = point.width;
      layer.current.dataset.stageHeight = point.height;
      layer.current.dataset.bobOffset = bob.toFixed(3);
    },
    [machineId],
  );
  useImperativeHandle(
    ref,
    () => ({
      updateAnchor: place,
      getCardSize: () => ({
        width: card.current?.offsetWidth || 264,
        height: card.current?.offsetHeight || 246,
      }),
    }),
    [place],
  );
  useLayoutEffect(() => {
    if (!machine || !card.current) return;
    const obs = new ResizeObserver(() => place());
    obs.observe(card.current);
    place();
    return () => obs.disconnect();
  }, [machine, place]);
  useEffect(() => {
    if (!machine || !face.current) return;
    if (reducedMotion) {
      gsap.set(face.current, { opacity: 1, y: 0, rotationX: 0 });
      return;
    }
    const animation = gsap.fromTo(
      face.current,
      { opacity: 0, y: 9, rotationX: 7 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.42,
        ease: "power3.out",
        overwrite: true,
      },
    );
    return () => animation.kill();
  }, [machineId, machine, reducedMotion]);
  useLayoutEffect(() => {
    setPinned(false);
    setShown(false);
    shownMachine.current = null;
  }, [machineId]);
  useEffect(() => {
    if (!machine || !card.current) return;
    const element = card.current;
    const updatePosition = () => place();
    float.current.value = 0;
    updatePosition();
    if (reducedMotion) return;
    const idle = gsap.to(float.current, {
      value: -4,
      duration: 2.15,
      delay: 0.55,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      paused: true,
      onUpdate: updatePosition,
    });
    let intersects = false;
    let hovering = false;
    let disposed = false;
    const update = () => {
      if (disposed) return;
      const focused =
        element.contains(document.activeElement) &&
        document.activeElement?.matches?.(":focus-visible");
      if (intersects && !document.hidden && !hovering && !focused)
        idle.resume();
      else idle.pause();
    };
    const enter = () => {
      hovering = true;
      update();
    };
    const leave = () => {
      hovering = false;
      update();
    };
    const focus = () => update();
    const blur = () => queueMicrotask(update);
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
      updatePosition();
    };
  }, [machineId, machine, place, reducedMotion]);
  useEffect(() => {
    if (!machine || !shown) return;
    const circumference = 2 * Math.PI * 13;
    countdownRing.current?.setAttribute("stroke-dasharray", `${circumference}`);
    if (pinned) {
      setSeconds(null);
      countdownRing.current?.setAttribute("stroke-dashoffset", "0");
      gsap.set(face.current, { opacity: 1, y: 0 });
      return;
    }
    setSeconds(10);
    const deadline = performance.now() + 10000;
    if (layer.current)
      layer.current.dataset.closeDeadline = deadline.toFixed(2);
    let cancelled = false,
      expired = false,
      exitAnimation;
    let timer, interval;
    const finish = () => {
      if (cancelled || expired) return;
      expired = true;
      clearTimeout(timer);
      clearInterval(interval);
      setSeconds(0);
      const close = () => {
        if (!cancelled) onCloseRef.current?.({ reason: "timeout" });
      };
      if (motionReducedRef.current || document.hidden) close();
      else
        exitAnimation = gsap.to(face.current, {
          opacity: 0,
          y: 7,
          duration: 0.22,
          ease: "power2.in",
          onComplete: close,
          overwrite: true,
        });
    };
    const tick = () => {
      if (cancelled || expired) return;
      const left = Math.max(0, deadline - performance.now());
      setSeconds(Math.ceil(left / 1000));
      countdownRing.current?.setAttribute(
        "stroke-dashoffset",
        `${circumference * (1 - left / 10000)}`,
      );
      if (!left) finish();
    };
    tick();
    interval = setInterval(tick, 100);
    timer = setTimeout(finish, 10000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
      exitAnimation?.kill();
    };
  }, [machineId, machine, pinned, shown]);
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
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
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
                  ? "Unpin: close after another 10 seconds"
                  : "Keep this equipment card open"
              }
              onClick={() => setPinned((value) => !value)}
            >
              <Pin size={11} />
              <span data-countdown-seconds={seconds ?? ""} aria-hidden="true">
                {pinned ? "Keep" : `${seconds}s`}
              </span>
            </button>
            <button
              className="machine-annotation__close"
              onClick={onClose}
              aria-label="Close equipment annotation"
            >
              <svg
                className="machine-annotation__countdown-ring"
                viewBox="0 0 30 30"
                aria-hidden="true"
              >
                <circle
                  ref={countdownRing}
                  cx="15"
                  cy="15"
                  r="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
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
            <>
              <div className="machine-annotation__metrics">
                <div>
                  <strong>{minutesToHours(machine.activeMinutes)}</strong>
                  <span title="Recorded active time in the sample day">
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
                  <span title="Share of the sample observation window with available data">
                    Data coverage
                  </span>
                </div>
              </div>
              <WeeklySignal
                values={machine.sparkline}
                name={machine.name}
                trend={machine.trend}
              />
              <div className="machine-annotation__context">
                <span>Peak activity</span>
                <strong>{machine.peakWindow}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="machine-annotation__inventory">
                {machine.spec.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="machine-annotation__record">
                <ClipboardCheck size={14} />
                <div>
                  <span>{machine.reviewStatus || machine.status}</span>
                  <small>Last review · {machine.lastReview}</small>
                  <small>Next review · {machine.nextReview}</small>
                </div>
                <span className="machine-annotation__record-dot" />
              </div>
            </>
          )}
          <div className="machine-annotation__insight">
            <CornerDownRight size={12} />
            <p>{machine.insight}</p>
          </div>
          <div className="machine-annotation__footer">
            <span>
              <i />
              {measured
                ? "Sample equipment activity"
                : "Illustrative equipment record"}
            </span>
            <span className="machine-annotation__source">
              {measured ? "1–7 OCT" : "NORTHSIDE"}
            </span>
          </div>
        </div>
      </section>
      <span className="sr-only" role="status">
        {machine.name} selected.{" "}
        {measured ? "Sample activity details" : "Illustrative equipment record"}{" "}
        shown.
      </span>
    </div>
  );
});
export default MachineAnnotation;
