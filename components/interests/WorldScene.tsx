"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, KeyboardControls, useKeyboardControls } from "@react-three/drei";
import {
  CapsuleCollider,
  CuboidCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Fog,
  Group,
  MathUtils,
  Vector3,
} from "three";
import { NEAR_RADIUS, STATIONS, type Station } from "@/components/interests/worldData";

/* ---------- constants ---------- */

const PAPER = "#0e0d0b";
/** arena half-extent — invisible walls keep the runner inside */
const ARENA = 11;
const WALK_SPEED = 5.5;
const RUN_SPEED = 9;
const JUMP_VEL = 7.5;

const CONTROL_MAP = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "back", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
];

/* ---------- shared per-frame state (refs, not React state) ---------- */

type WorldRefs = {
  charPos: React.MutableRefObject<Vector3>;
  charVel: React.MutableRefObject<Vector3>;
};

/* ---------- character: physics capsule + little cream robot ---------- */

function Character({ frozen, refs }: { frozen: boolean; refs: WorldRefs }) {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null!);
  const [, get] = useKeyboardControls();
  const facing = useRef(0);

  useFrame((state, dt) => {
    const b = body.current;
    if (!b) return;
    const { forward, back, left, right, jump, run } = get() as Record<string, boolean>;
    const speed = run ? RUN_SPEED : WALK_SPEED;

    let dx = (right ? 1 : 0) - (left ? 1 : 0);
    let dz = (back ? 1 : 0) - (forward ? 1 : 0);
    const len = Math.hypot(dx, dz);
    if (len > 0) {
      dx /= len;
      dz /= len;
    }
    const vel = b.linvel();
    const vx = frozen ? 0 : dx * speed;
    const vz = frozen ? 0 : dz * speed;
    // grounded ≈ no meaningful vertical motion; good enough for one arena
    const grounded = Math.abs(vel.y) < 0.08;
    const vy = !frozen && jump && grounded ? JUMP_VEL : vel.y;
    b.setLinvel({ x: vx, y: vy, z: vz }, true);

    const p = b.translation();
    refs.charPos.current.set(p.x, p.y, p.z);
    refs.charVel.current.set(vx, vel.y, vz);

    const v = visual.current;
    if (!v) return;
    // face travel direction (shortest arc), lean into lateral motion, and
    // bob while running — all purely cosmetic, physics stays a capsule
    if (vx !== 0 || vz !== 0) {
      const target = Math.atan2(vx, vz);
      let d = target - facing.current;
      d = ((d + Math.PI) % (Math.PI * 2)) - Math.PI;
      facing.current += d * Math.min(1, dt * 10);
    }
    v.rotation.y = facing.current;
    const moving = Math.hypot(vx, vz) / RUN_SPEED;
    v.rotation.x = MathUtils.lerp(v.rotation.x, moving * 0.18, Math.min(1, dt * 8));
    v.position.y = Math.sin(state.clock.elapsedTime * 11) * 0.05 * moving;
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      mass={1}
      lockRotations
      friction={0.1}
      position={[0, 1.4, 4]}
    >
      <CapsuleCollider args={[0.45, 0.38]} />
      <group ref={visual}>
        {/* body */}
        <mesh>
          <capsuleGeometry args={[0.38, 0.55, 6, 14]} />
          <meshStandardMaterial color="#f2ede2" roughness={0.55} />
        </mesh>
        {/* visor */}
        <mesh position={[0, 0.32, 0.28]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.42, 0.16, 0.18]} />
          <meshStandardMaterial
            color="#101418"
            emissive={new Color("#5b8cff")}
            emissiveIntensity={1.6}
            roughness={0.2}
          />
        </mesh>
        {/* antenna */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
          <meshStandardMaterial color="#3a352c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.96, 0]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial
            color="#ff5a24"
            emissive={new Color("#ff5a24")}
            emissiveIntensity={2.2}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

/* ---------- camera: soft follow + screen tilt into the turn ---------- */

function CameraRig({ refs }: { refs: WorldRefs }) {
  const desired = useMemo(() => new Vector3(), []);
  const roll = useRef(0);

  useFrame(({ camera }, dt) => {
    const t = refs.charPos.current;
    desired.set(t.x * 0.92, t.y + 6.2, t.z * 0.92 + 9.6);
    const k = 1 - Math.exp(-dt * 4.2);
    camera.position.lerp(desired, k);
    camera.lookAt(t.x, t.y + 0.9, t.z);
    // screen tilt: roll opposite the lateral velocity, like leaning into it
    const targetRoll = MathUtils.clamp(-refs.charVel.current.x * 0.011, -0.09, 0.09);
    roll.current = MathUtils.lerp(roll.current, targetRoll, Math.min(1, dt * 5));
    camera.rotation.z += roll.current;
  });
  return null;
}

/* ---------- ground, walls, dressing ---------- */

/** floor slab with a drawn grid — same canvas-texture trick as the showcase */
function useGridTexture() {
  const tex = useMemo(() => {
    const S = 1024;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#131109";
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = "rgba(242,237,226,0.08)";
    ctx.lineWidth = 2;
    const step = S / 24;
    for (let i = 0; i <= 24; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, S);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(S, i * step);
      ctx.stroke();
    }
    // faint accent cross through the centre
    ctx.strokeStyle = "rgba(255,90,36,0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(S / 2, 0);
    ctx.lineTo(S / 2, S);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, S / 2);
    ctx.lineTo(S, S / 2);
    ctx.stroke();
    return new CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Arena() {
  const grid = useGridTexture();
  return (
    <>
      {/* floor: one fixed body, visual slab + neon rim strips */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[ARENA + 1, 0.5, ARENA + 1]} position={[0, -0.5, 0]} />
        {/* invisible walls */}
        <CuboidCollider args={[ARENA + 1, 4, 0.5]} position={[0, 4, -ARENA - 0.5]} />
        <CuboidCollider args={[ARENA + 1, 4, 0.5]} position={[0, 4, ARENA + 0.5]} />
        <CuboidCollider args={[0.5, 4, ARENA + 1]} position={[-ARENA - 0.5, 4, 0]} />
        <CuboidCollider args={[0.5, 4, ARENA + 1]} position={[ARENA + 0.5, 4, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ARENA * 2 + 2, ARENA * 2 + 2]} />
          <meshStandardMaterial map={grid} roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* neon rim */}
      {[
        [0, -ARENA - 1, 0],
        [0, ARENA + 1, Math.PI],
        [-ARENA - 1, 0, Math.PI / 2],
        [ARENA + 1, 0, -Math.PI / 2],
      ].map(([x, z, ry], i) => (
        <mesh key={i} position={[x as number, 0.05, z as number]} rotation={[0, ry as number, 0]}>
          <boxGeometry args={[ARENA * 2 + 2, 0.08, 0.08]} />
          <meshStandardMaterial
            color={i % 2 ? "#5b8cff" : "#ff5a24"}
            emissive={new Color(i % 2 ? "#5b8cff" : "#ff5a24")}
            emissiveIntensity={1.4}
          />
        </mesh>
      ))}
    </>
  );
}

/** kickable glow cubes — pure toy physics */
function PropCubes() {
  const cubes = useMemo(
    () =>
      ["#ff5a24", "#5b8cff", "#ffa7c9", "#f0b25e", "#f2ede2"].map((c, i) => ({
        color: c,
        pos: [Math.sin(i * 2.4) * 4, 1 + i * 0.5, Math.cos(i * 2.4) * 4] as [number, number, number],
      })),
    []
  );
  return (
    <>
      {cubes.map((c, i) => (
        <RigidBody key={i} position={c.pos} restitution={0.5} friction={0.4} colliders="cuboid">
          <mesh>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <meshStandardMaterial
              color={c.color}
              emissive={new Color(c.color)}
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

/* ---------- stations ---------- */

function useSignTexture(station: Station) {
  const tex = useMemo(() => {
    const W = 512;
    const H = 192;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.textAlign = "center";
    ctx.fillStyle = station.color;
    ctx.font = "800 84px system-ui, sans-serif";
    ctx.fillText(station.sign, W / 2, 96);
    ctx.fillStyle = "rgba(242,237,226,0.72)";
    ctx.font = "500 30px monospace";
    ctx.fillText(station.tag.toUpperCase(), W / 2, 152);
    return new CanvasTexture(c);
  }, [station]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function StationNode({ station, refs }: { station: Station; refs: WorldRefs }) {
  const sign = useSignTexture(station);
  const ringRef = useRef<Group>(null!);
  const color = useMemo(() => new Color(station.color), [station.color]);

  useFrame(({ clock }) => {
    // floor ring breathes; breathes harder when the runner is close
    const d = Math.hypot(
      refs.charPos.current.x - station.pos[0],
      refs.charPos.current.z - station.pos[1]
    );
    const near = d < NEAR_RADIUS ? 1 : 0;
    const s = 1 + Math.sin(clock.elapsedTime * (near ? 6 : 2)) * (near ? 0.06 : 0.025);
    ringRef.current?.scale.setScalar(s);
  });

  return (
    <group position={[station.pos[0], 0, station.pos[1]]}>
      {/* pylon (solid — you can lean on it) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.34, 3, 0.34]} />
          <meshStandardMaterial
            color="#191713"
            emissive={color}
            emissiveIntensity={0.9}
            roughness={0.35}
          />
        </mesh>
      </RigidBody>
      {/* floor ring */}
      <group ref={ringRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.35, 1.6, 40]} />
          <meshStandardMaterial
            color={station.color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
      {/* floating sign, always facing the camera */}
      <Billboard position={[0, 3.6, 0]}>
        <mesh>
          <planeGeometry args={[2.6, 0.975]} />
          <meshBasicMaterial map={sign} transparent blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
}

/* ---------- ambient dust ---------- */

function Dust() {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * ARENA * 2.4;
      pos[i * 3 + 1] = Math.random() * 7 + 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * ARENA * 2.4;
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const ref = useRef<Group>(null!);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <group ref={ref}>
      <points geometry={geo}>
        <pointsMaterial
          color="#f0b25e"
          size={0.05}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ---------- proximity → React state (only fires on change) ---------- */

function ProximityReporter({
  refs,
  onNearChange,
}: {
  refs: WorldRefs;
  onNearChange: (id: string | null) => void;
}) {
  const last = useRef<string | null>(null);
  useFrame(() => {
    const p = refs.charPos.current;
    let hit: string | null = null;
    for (const s of STATIONS) {
      if (Math.hypot(p.x - s.pos[0], p.z - s.pos[1]) < NEAR_RADIUS) {
        hit = s.id;
        break;
      }
    }
    if (hit !== last.current) {
      last.current = hit;
      onNearChange(hit);
    }
  });
  return null;
}

/* ---------- scene root ---------- */

export default function WorldScene({
  frozen,
  onNearChange,
}: {
  /** true while a panel is open — movement input is ignored */
  frozen: boolean;
  onNearChange: (id: string | null) => void;
}) {
  const charPos = useRef(new Vector3(0, 1.4, 4));
  const charVel = useRef(new Vector3());
  const refs: WorldRefs = { charPos, charVel };

  return (
    <KeyboardControls map={CONTROL_MAP}>
      <Canvas
        camera={{ position: [0, 7, 14], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
        onCreated={({ gl, scene }) => {
          scene.background = new Color(PAPER);
          scene.fog = new Fog(PAPER, 20, 44);
          gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
        }}
      >
        <ambientLight intensity={0.55} color="#f2ede2" />
        {/* no shadow maps at all — the neon look is carried by emissives and
            they were enough to lose the GL context on weak/software GPUs */}
        <directionalLight position={[6, 12, 4]} intensity={1.1} color="#fff2df" />
        <Physics gravity={[0, -22, 0]}>
          <Arena />
          <Character frozen={frozen} refs={refs} />
          <PropCubes />
          {STATIONS.map((s) => (
            <StationNode key={s.id} station={s} refs={refs} />
          ))}
        </Physics>
        <Dust />
        <CameraRig refs={refs} />
        <ProximityReporter refs={refs} onNearChange={onNearChange} />
      </Canvas>
    </KeyboardControls>
  );
}
