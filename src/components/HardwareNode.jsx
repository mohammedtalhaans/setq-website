import { useEffect, useMemo } from "react";
import { useGLTF, Html, Line } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
const MODEL_URL = `${import.meta.env.BASE_URL}models/setq-node.glb`;

export function HardwareNode({ onReady, ...props }) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => {
    const copy = scene.clone(true),
      materials = new Map(),
      textures = [];
    let labelIndex = 0;
    copy.traverse((object) => {
      if (!object.isMesh) return;
      const finish = (source) => {
        if (materials.has(source)) return materials.get(source);
        const material = source.clone();
        if (object.parent?.name === "lid" && source.map) {
          const label = document.createElement("canvas");
          label.width = 1024;
          label.height = labelIndex === 0 ? 334 : 128;
          const ctx = label.getContext("2d");
          ctx.fillStyle = labelIndex === 0 ? "#5e3b2c" : "#8f7964";
          ctx.font = labelIndex === 0 ? "600 255px Arial" : "400 70px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            labelIndex === 0 ? "SetQ" : "ULTRASONIC  /  US-01",
            label.width / 2,
            label.height / 2,
          );
          const texture = new CanvasTexture(label);
          texture.colorSpace = SRGBColorSpace;
          // Inspected GLB UVs: left-top=(0,1), left-bottom=(0,0).
          // Exported bitmap was pre-flipped; a freshly drawn CanvasTexture is not.
          // Restore native Canvas upload orientation, without mirroring the model.
          texture.flipY = true;
          texture.anisotropy = 8;
          material.map = texture;
          material.depthWrite = false;
          material.polygonOffset = true;
          material.polygonOffsetFactor = -1;
          textures.push(texture);
          labelIndex++;
        }
        if (/ivory polymer/i.test(material.name)) {
          material.color.set("#e8dfcc");
          material.roughness = 0.48;
          material.metalness = 0;
        } else if (/silicone seal/i.test(material.name))
          material.color.set("#5c4033");
        else if (/carrier green solder mask/i.test(material.name))
          material.color.set("#50604b");
        material.envMapIntensity = 0.7;
        materials.set(source, material);
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(finish)
        : finish(object.material);
    });
    return { scene: copy, materials: [...materials.values()], textures };
  }, [scene]);
  useEffect(() => {
    onReady?.();
    return () => {
      model.materials.forEach((m) => m.dispose());
      model.textures.forEach((t) => t.dispose());
    };
  }, [model, onReady]);
  return (
    <group {...props}>
      <primitive object={model.scene} dispose={null} />
    </group>
  );
}
function Dimension({ points, label, at, kind }) {
  return (
    <>
      <Line points={points} color="#927b61" lineWidth={0.8} />
      <Html center position={at} className="hardware-dimension">
        <span>{label}</span>
        <small>{kind}</small>
      </Html>
    </>
  );
}
export function HardwareDimensions() {
  // Exact nominal housing dimensions, in glTF metres. Lettering's surface bias
  // and minor CAD extents are excluded from the nominal enclosure callouts.
  return (
    <group>
      <Dimension
        points={[
          [-0.018, -0.003, 0.0145],
          [-0.018, -0.003, 0.02],
          [0.018, -0.003, 0.02],
          [0.018, -0.003, 0.0145],
        ]}
        label="36 mm"
        kind="WIDTH"
        at={[0, -0.003, 0.023]}
      />
      <Dimension
        points={[
          [-0.018, -0.003, -0.0145],
          [-0.024, -0.003, -0.0145],
          [-0.024, -0.003, 0.0145],
          [-0.018, -0.003, 0.0145],
        ]}
        label="29 mm"
        kind="DEPTH"
        at={[-0.039, -0.004, 0.004]}
      />
      <Line
        points={[
          [-0.024, -0.003, 0],
          [-0.034, -0.004, 0.003],
        ]}
        color="#927b61"
        lineWidth={0.7}
      />
      <Dimension
        points={[
          [0.018, -0.003, -0.0145],
          [0.024, -0.003, -0.0145],
          [0.024, 0.008, -0.0145],
          [0.018, 0.008, -0.0145],
        ]}
        label="11 mm"
        kind="HEIGHT"
        at={[0.029, 0.0025, -0.0145]}
      />
      {[-0.018, 0.018].flatMap((x) =>
        [-0.0145, 0.0145].map((z) => (
          <Line
            key={`${x}-${z}`}
            points={[
              [x - Math.sign(x) * 0.003, 0.00804, z],
              [x, 0.00804, z],
              [x, 0.00804, z - Math.sign(z) * 0.003],
            ]}
            color="#ae987c"
            transparent
            opacity={0.35}
            lineWidth={0.7}
          />
        )),
      )}
    </group>
  );
}
