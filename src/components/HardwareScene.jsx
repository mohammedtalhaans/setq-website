import React, {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Layers } from "lucide-react";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  MathUtils,
  SRGBColorSpace,
} from "three";
import "../styles/hardware-scene.css";

const MODEL_URL = `${import.meta.env.BASE_URL}models/setq-node.glb`;
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
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ModelFallback({ loading = false }) {
  const [posterMissing, setPosterMissing] = useState(false);
  return (
    <div
      className="hardware-scene__fallback"
      role="img"
      aria-label="SetQ proposed ultrasonic sensor enclosure"
    >
      {!posterMissing ? (
        <img
          src={POSTER_URL}
          onError={() => setPosterMissing(true)}
          alt="SetQ sensor design"
        />
      ) : (
        <div className="hardware-scene__silhouette">
          <span>SetQ</span>
          <i />
        </div>
      )}
      <span className="hardware-scene__fallback-label">
        {loading ? "Preparing the model" : "Sensor design preview"}
      </span>
    </div>
  );
}

function Node({ inside, reducedMotion, active, onReady }) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);
  const viewportWidth = useThree((state) => state.viewport.width);
  const fit = Math.min(1, viewportWidth / 5.4);
  const rig = useRef();
  const progress = useRef(inside ? 1 : 0);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const ownedMaterials = new Map();
    const ownedTextures = [];
    const parts = [];
    let lidLabel = 0;
    copy.traverse((object) => {
      if (object.userData.part && Array.isArray(object.userData.explode)) {
        parts.push({
          object,
          rest: object.position.clone(),
          offset: object.userData.explode,
        });
      }
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const finish = (source) => {
        if (ownedMaterials.has(source)) return ownedMaterials.get(source);
        const material = source.clone();
        if (object.parent?.name === "lid" && source.map) {
          const label = document.createElement("canvas");
          label.width = 1024;
          label.height = lidLabel === 0 ? 334 : 128;
          const context = label.getContext("2d");
          context.fillStyle = lidLabel === 0 ? "#694333" : "#9a8570";
          context.font = lidLabel === 0 ? "600 255px Arial" : "400 70px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            lidLabel === 0 ? "SetQ" : "ULTRASONIC  /  US-01",
            label.width / 2,
            label.height / 2,
          );
          const texture = new CanvasTexture(label);
          texture.colorSpace = SRGBColorSpace;
          texture.flipY = false;
          material.map = texture;
          material.depthWrite = false;
          material.polygonOffset = true;
          material.polygonOffsetFactor = -1;
          ownedTextures.push(texture);
          lidLabel += 1;
        }
        if (/ivory polymer/i.test(material.name)) {
          material.color.set("#e8dfcc");
          material.roughness = 0.45;
          material.metalness = 0;
        } else if (/silicone seal/i.test(material.name)) {
          material.color.set("#5c4033");
        } else if (/carrier green solder mask/i.test(material.name)) {
          material.color.set("#50604b");
        }
        material.envMapIntensity = 0.75;
        ownedMaterials.set(source, material);
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(finish)
        : finish(object.material);
    });
    // The GLB root already converts the source's millimetres into glTF metres.
    // This display scale is uniform, so dimensional proportions remain intact.
    copy.position.y = -0.00251;
    return {
      scene: copy,
      parts,
      materials: [...ownedMaterials.values()],
      textures: ownedTextures,
    };
  }, [scene]);

  useEffect(() => {
    onReady();
    return () => {
      model.materials.forEach((material) => material.dispose());
      model.textures.forEach((texture) => texture.dispose());
    };
  }, [model, onReady]);
  useEffect(() => {
    if (active) invalidate();
  }, [inside, active, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    if (!active) return;
    const target = inside ? 1 : 0;
    progress.current = reducedMotion
      ? target
      : MathUtils.damp(progress.current, target, 8, Math.min(delta, 0.05));
    if (Math.abs(progress.current - target) < 0.001) progress.current = target;
    const amount = progress.current;
    model.parts.forEach(({ object, rest, offset }) => {
      object.position.set(
        rest.x + offset[0] * amount * 0.66,
        rest.y + offset[1] * amount * 0.66,
        rest.z + offset[2] * amount * 0.66,
      );
    });
    if (rig.current) {
      rig.current.scale.setScalar(MathUtils.lerp(100, 75, amount) * fit);
      rig.current.position.y = MathUtils.lerp(0.1, -0.4, amount) * fit;
    }
    if (progress.current !== target) invalidate();
  });

  return (
    <group
      ref={rig}
      scale={(inside ? 75 : 100) * fit}
      position={[0, (inside ? -0.4 : 0.1) * fit, 0]}
    >
      <primitive object={model.scene} dispose={null} />
    </group>
  );
}

function Studio({ inside, reducedMotion, active, onReady }) {
  return (
    <>
      <ambientLight intensity={0.45} color="#f5ead5" />
      <directionalLight position={[4, 7, 3]} intensity={2.1} color="#fff7e5" />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={1.25}
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
          color="#ffffff"
          position={[0, 2, -4]}
          scale={[5, 2, 1]}
        />
      </Environment>
      <Suspense fallback={null}>
        <Node
          inside={inside}
          reducedMotion={reducedMotion}
          active={active}
          onReady={onReady}
        />
      </Suspense>
      <ContactShadows
        position={[0, -1.6, 0]}
        scale={9}
        far={5.5}
        resolution={256}
        blur={3.5}
        opacity={0.25}
        color="#745844"
        smooth={false}
        frames={active ? Infinity : 0}
      />
      <OrbitControls
        makeDefault
        enabled={active}
        enablePan={false}
        enableZoom={false}
        enableDamping={!reducedMotion}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI * 0.65}
        target={[0, 0.05, 0]}
      />
    </>
  );
}

export default function HardwareScene({
  reducedMotion = false,
  className = "",
}) {
  const wrapper = useRef();
  const [inside, setInside] = useState(false);
  const [inView, setInView] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const active = inView && pageVisible;
  const onReady = React.useCallback(() => setReady(true), []);
  const onFailure = React.useCallback(() => setFailed(true), []);
  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { rootMargin: "100px", threshold: 0.01 },
    );
    observer.observe(element);
    const updateVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <div
      className={`hardware-scene ${className}`}
      ref={wrapper}
      data-state={inside ? "inside" : "assembled"}
      data-ready={ready && !failed}
    >
      <div className="hardware-scene__ambient" aria-hidden="true" />
      <div className="hardware-scene__topline">
        <span>SETQ / US–01</span>
        <span>Design study</span>
      </div>
      <div
        className="hardware-scene__viewport"
        role="group"
        aria-label="Interactive SetQ hardware model. Drag to rotate; use the controls below to see inside."
      >
        {(!ready || failed) && (
          <ModelFallback loading={!failed && hasEntered} />
        )}
        {hasEntered && !failed && (
          <SceneBoundary onFailure={onFailure} fallback={null}>
            <Canvas
              dpr={[1, 1.5]}
              frameloop={active ? "demand" : "never"}
              camera={{
                position: [6.4, 4.8, 6.5],
                fov: 32,
                near: 0.1,
                far: 100,
              }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "low-power",
                toneMapping: ACESFilmicToneMapping,
              }}
              fallback={<ModelFallback />}
              onCreated={({ gl }) => {
                gl.toneMappingExposure = 1.1;
                gl.domElement.addEventListener("webglcontextlost", onFailure, {
                  once: true,
                });
              }}
            >
              <Studio
                inside={inside}
                reducedMotion={reducedMotion}
                active={active}
                onReady={onReady}
              />
            </Canvas>
          </SceneBoundary>
        )}
      </div>
      <div className="hardware-scene__bottomline">
        <div
          className="hardware-scene__controls"
          role="group"
          aria-label="Hardware model view"
        >
          <button
            type="button"
            aria-pressed={!inside}
            onClick={() => setInside(false)}
            disabled={!ready || failed}
          >
            Assembled
          </button>
          <button
            type="button"
            aria-pressed={inside}
            onClick={() => setInside(true)}
            disabled={!ready || failed}
          >
            Inside <Layers size={12} aria-hidden="true" />
          </button>
        </div>
        <span className="hardware-scene__hint">
          {failed
            ? "Sensor concept"
            : inside
              ? "Seven original assembly layers"
              : "Drag to explore"}
        </span>
      </div>
      <span className="hardware-scene__sr" aria-live="polite">
        {inside
          ? "Exploded view of the proposed sensor assembly."
          : "Assembled view of the proposed sensor. Acoustic face points downward."}
      </span>
    </div>
  );
}
