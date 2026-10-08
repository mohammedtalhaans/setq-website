import React, {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import { HardwareNode, HardwareDimensions } from "./HardwareNode.jsx";
import { HardwareMechanism } from "./HardwareMechanism.jsx";
import { HardwareTelemetry, hardwareMotionAt } from "./HardwareTelemetry.jsx";
import "../styles/hardware-scene.css";
const POSTER_URL = `${import.meta.env.BASE_URL}images/setq-node-poster.png`;
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Fallback() {
  return (
    <div className="hardware-scene__fallback">
      <img src={POSTER_URL} alt="SetQ sensor" />
      <span>SetQ sensor</span>
    </div>
  );
}
function Camera({ view }) {
  const { camera, invalidate } = useThree();
  useLayoutEffect(() => {
    camera.position.set(
      ...(view === "machine" ? [0.95, 0.87, 1.5] : [6.4, 4.8, 6.5]),
    );
    camera.fov = view === "machine" ? 35 : 32;
    camera.near = 0.001;
    camera.lookAt(0, view === "machine" ? 0.48 : 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [view, camera, invalidate]);
  return null;
}
function Driver({ invalidateRef }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => {
      invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);
  return null;
}
function Sensor({ onReady }) {
  const size = useThree((s) => s.size);
  const fit = Math.min(1, size.width / size.height / 1.33);
  return (
    <group scale={(size.width < 400 ? 88 : 112) * fit} position={[0, 0.08, 0]}>
      <group position={[0, -0.00251, 0]}>
        <HardwareNode onReady={onReady} />
        <HardwareDimensions />
      </group>
    </group>
  );
}
function Studio({
  view,
  clock,
  onReady,
  active,
  invalidateRef,
  reducedMotion,
}) {
  return (
    <>
      <Camera view={view} />
      <Driver invalidateRef={invalidateRef} />
      <ambientLight intensity={0.5} color="#f5ead5" />
      <directionalLight position={[4, 7, 3]} intensity={2} color="#fff7e5" />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={1.1}
        color="#f1e6d4"
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#fff7e9"
          position={[-3, 4, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[7, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#d9b59e"
          position={[4, 0, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#fff"
          position={[0, 2, -4]}
          scale={[5, 2, 1]}
        />
      </Environment>
      <Suspense fallback={null}>
        {view === "machine" ? (
          <HardwareMechanism clock={clock} onReady={onReady} />
        ) : (
          <Sensor onReady={onReady} />
        )}
      </Suspense>
      <ContactShadows
        key={view}
        position={[0, view === "machine" ? -0.044 : -1.65, 0]}
        scale={view === "machine" ? 2 : 9}
        far={view === "machine" ? 1.5 : 5.5}
        resolution={256}
        blur={3.5}
        opacity={0.23}
        color="#745844"
        smooth={false}
        frames={active ? Infinity : 0}
      />
      <OrbitControls
        key={view}
        makeDefault
        enabled={active}
        enablePan={false}
        enableZoom={false}
        enableDamping={!reducedMotion}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI * 0.64}
        target={view === "machine" ? [0, 0.48, 0] : [0, 0, 0]}
      />
    </>
  );
}
export default function HardwareScene({
  reducedMotion = false,
  className = "",
}) {
  const wrapper = useRef(),
    telemetry = useRef(),
    invalidate = useRef(),
    clock = useRef({ ...hardwareMotionAt(0), peak: 0 }),
    history = useRef([{ ...hardwareMotionAt(0), peak: 0 }]);
  const [view, setView] = useState("sensor"),
    [manualPaused, setManualPaused] = useState(false),
    [inView, setInView] = useState(false),
    [hasEntered, setHasEntered] = useState(false),
    [pageVisible, setPageVisible] = useState(true),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const active = inView && pageVisible,
    paused = manualPaused || reducedMotion,
    playing = view === "machine" && active && ready && !paused && !failed;
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { threshold: 0.01 },
    );
    observer.observe(wrapper.current);
    const visibility = () =>
      setPageVisible(
        !document.hidden && document.visibilityState === "visible",
      );
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (view !== "machine") return;
    clock.current = { ...hardwareMotionAt(0), peak: 0 };
    history.current = [{ ...clock.current }];
    telemetry.current?.update(clock.current, history.current);
    setManualPaused(false);
    invalidate.current?.();
  }, [view]);
  useEffect(() => {
    if (!playing) return;
    const started = performance.now(),
      base = clock.current.time;
    let raf,
      last = started;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 1000 / 30) return;
      last = now - ((now - last) % (1000 / 30));
      const frame = hardwareMotionAt(base + (now - started) / 1000);
      frame.peak = Math.max(clock.current.peak, frame.lift);
      clock.current = frame;
      history.current.push({ ...frame });
      while (
        history.current.length &&
        history.current[0].time < frame.time - 12
      )
        history.current.shift();
      telemetry.current?.update(frame, history.current);
      wrapper.current?.setAttribute("data-lift-mm", frame.lift.toFixed(3));
      wrapper.current?.setAttribute(
        "data-distance-mm",
        frame.distance.toFixed(3),
      );
      wrapper.current?.setAttribute("data-cycles", frame.cycles);
      invalidate.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return (
    <div
      className={`hardware-scene ${className}`}
      ref={wrapper}
      data-view={view}
      data-state={view}
      data-ready={ready && !failed}
      data-playing={playing}
    >
      <div className="hardware-scene__ambient" aria-hidden="true" />
      <div className="hardware-scene__topline">
        <span>SETQ / US–01</span>
        <span>
          {view === "sensor" ? "Sensor dimensions" : "Stack movement"}
        </span>
      </div>
      <div
        className="hardware-scene__viewport"
        role="group"
        aria-label={
          view === "sensor"
            ? "SetQ sensor with width, depth and height dimensions"
            : "SetQ sensor fixed above a moving weight stack"
        }
      >
        {(!ready || failed) && <Fallback />}
        {hasEntered && !failed && (
          <SceneBoundary onFailure={onFailure}>
            <Canvas
              dpr={[1, 1.5]}
              frameloop={active ? "demand" : "never"}
              camera={{
                position: [6.4, 4.8, 6.5],
                fov: 32,
                near: 0.001,
                far: 100,
              }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "low-power",
                toneMapping: ACESFilmicToneMapping,
              }}
              fallback={<Fallback />}
              onCreated={({ gl }) => {
                gl.toneMappingExposure = 1.05;
                gl.domElement.addEventListener("webglcontextlost", onFailure, {
                  once: true,
                });
              }}
            >
              <Studio
                view={view}
                clock={clock}
                active={active}
                reducedMotion={reducedMotion}
                onReady={onReady}
                invalidateRef={invalidate}
              />
            </Canvas>
          </SceneBoundary>
        )}
      </div>
      <div className="hardware-scene__viewbar">
        <div
          className="hardware-scene__controls"
          role="group"
          aria-label="Hardware view"
        >
          <button
            type="button"
            aria-pressed={view === "sensor"}
            onClick={() => setView("sensor")}
          >
            Sensor
          </button>
          <button
            type="button"
            aria-pressed={view === "machine"}
            onClick={() => setView("machine")}
          >
            On a machine
          </button>
        </div>
        <span className="hardware-scene__hint">Drag to explore</span>
      </div>
      {view === "machine" && (
        <HardwareTelemetry
          ref={telemetry}
          paused={paused}
          disabled={reducedMotion || failed}
          onToggle={() => setManualPaused((value) => !value)}
        />
      )}
    </div>
  );
}
