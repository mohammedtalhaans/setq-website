import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { HardwareNode } from "./HardwareNode.jsx";
const CREAM = "#e3d9c5",
  STEEL = "#675443",
  DARK = "#37392f",
  BRASS = "#b49a71";
function Box({
  size,
  position,
  color = STEEL,
  radius = 0.012,
  metalness = 0.35,
}) {
  const geometry = useMemo(
    () =>
      new RoundedBoxGeometry(
        ...size,
        2,
        Math.min(radius, ...size.map((n) => n / 2)),
      ),
    [size[0], size[1], size[2], radius],
  );
  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial
        color={color}
        roughness={0.58}
        metalness={metalness}
      />
    </mesh>
  );
}
function Rod({ position, radius = 0.005, height = 0.94, color = BRASS }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, height, 20]} />
      <meshStandardMaterial color={color} roughness={0.28} metalness={0.8} />
    </mesh>
  );
}
export function HardwareMechanism({ clock, onReady }) {
  const size = useThree((state) => state.size);
  const labelX = size.width < 420 ? 0.33 : 0.42;
  const stack = useRef(),
    beam = useRef(),
    handle = useRef(),
    cable = useRef(),
    handleCable = useRef();
  // Port centre is .90925m above base; rest top surface=.35925m. The .55m
  // rest gap and .30m travel share the exact mechanism clock with the graph.
  useFrame(() => {
    const frame = clock.current,
      lift = frame.lift / 1000,
      gap = frame.distance / 1000;
    if (stack.current) stack.current.position.y = lift;
    if (handle.current) handle.current.position.y = -lift;
    if (beam.current) {
      beam.current.scale.y = gap / 0.55;
      beam.current.position.y = 0.90925 - gap / 2;
    }
    if (cable.current) {
      const length = 0.966 - (0.35925 + lift);
      cable.current.scale.y = length / 0.60675;
      cable.current.position.y = 0.966 - length / 2;
    }
    if (handleCable.current) {
      const length = 0.136 + lift;
      handleCable.current.scale.y = length / 0.136;
      handleCable.current.position.y = 0.986 - length / 2;
    }
  });
  return (
    <group position={[0, 0, 0]}>
      <Box
        size={[0.31, 0.038, 0.24]}
        position={[0, -0.02, 0.03]}
        color={CREAM}
      />
      {[-0.137, 0.137].map((x) => (
        <Box
          key={x}
          size={[0.024, 0.98, 0.04]}
          position={[x, 0.47, -0.078]}
          color={STEEL}
        />
      ))}
      <Box
        size={[0.295, 0.03, 0.044]}
        position={[0, 0.966, -0.078]}
        color={STEEL}
      />
      <Box
        size={[0.248, 0.36, 0.018]}
        position={[0, 0.17, -0.068]}
        color={CREAM}
      />
      {[-0.068, 0.068].map((x) => (
        <Rod key={x} position={[x, 0.474, 0]} radius={0.0058} height={0.95} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <Box
          key={i}
          size={[0.2, 0.0165, 0.11]}
          position={[0, 0.009 + i * 0.018, 0]}
          color={DARK}
          radius={0.003}
        />
      ))}
      <group
        ref={stack}
        name="SetQ-moving-stack"
        userData={{ maximumTravelMetres: 0.3 }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i}>
            <Box
              size={[0.2, 0.0165, 0.11]}
              position={[0, 0.009 + (i + 14) * 0.018, 0]}
              color={DARK}
              radius={0.003}
            />
            <Box
              size={[0.045, 0.0018, 0.001]}
              position={[0, 0.009 + (i + 14) * 0.018, 0.0555]}
              color="#9a9d88"
              radius={0}
            />
          </group>
        ))}
        <mesh position={[0, 0.263, 0.067]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.03, 16]} />
          <meshStandardMaterial
            color={BRASS}
            metalness={0.8}
            roughness={0.32}
          />
        </mesh>
      </group>
      <mesh ref={cable} position={[0, 0.662625, -0.047]}>
        <cylinderGeometry args={[0.0017, 0.0017, 0.60675, 12]} />
        <meshStandardMaterial color="#34332b" roughness={0.8} />
      </mesh>
      <Line
        points={[
          [0, 0.966, -0.047],
          [0, 0.986, 0.02],
          [0, 0.986, 0.22],
        ]}
        color="#34332b"
        lineWidth={1.3}
      />
      <mesh ref={handleCable} position={[0, 0.918, 0.22]}>
        <cylinderGeometry args={[0.0017, 0.0017, 0.136, 12]} />
        <meshStandardMaterial color="#34332b" roughness={0.8} />
      </mesh>
      <group ref={handle}>
        <Rod
          position={[0, 0.845, 0.22]}
          radius={0.007}
          height={0.006}
          color={BRASS}
        />
        <mesh position={[0, 0.85, 0.22]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.32, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <Box
            key={x}
            size={[0.065, 0.018, 0.026]}
            position={[x, 0.85, 0.22]}
            color="#4b4033"
            radius={0.008}
          />
        ))}
      </group>
      <Box
        size={[0.033, 0.26, 0.04]}
        position={[0, 0.12, 0.18]}
        color={STEEL}
      />
      <Box
        size={[0.16, 0.032, 0.16]}
        position={[0, 0.258, 0.19]}
        color="#947554"
        radius={0.012}
        metalness={0}
      />
      <Box
        size={[0.12, 0.13, 0.028]}
        position={[0, 0.332, 0.115]}
        color="#947554"
        radius={0.012}
        metalness={0}
      />
      <Box
        size={[0.048, 0.004, 0.088]}
        position={[0.01, 0.905545, -0.053]}
        color={BRASS}
        radius={0.002}
      />
      <Box
        size={[0.048, 0.06, 0.004]}
        position={[0.01, 0.936, -0.095]}
        color={BRASS}
        radius={0.002}
      />
      <HardwareNode position={[0.01, 0.910545, 0]} onReady={onReady} />
      <mesh ref={beam} position={[0, 0.63425, 0]}>
        <cylinderGeometry args={[0.0011, 0.0011, 0.55, 12]} />
        <meshBasicMaterial color="#879871" transparent opacity={0.75} />
      </mesh>
      <Line
        points={[
          [0.01, 0.922, 0],
          [labelX - 0.12, 0.89, 0],
          [labelX - 0.08, 0.89, 0],
        ]}
        color="#a18a70"
        lineWidth={0.7}
      />
      <Html
        center
        position={[labelX, 0.89, 0]}
        className="hardware-machine-label"
      >
        <span>SetQ sensor</span>
        <small>Fixed above the stack</small>
      </Html>
    </group>
  );
}
