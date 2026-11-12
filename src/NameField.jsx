import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Signal from noise, applied to the name. The DOM name is rasterized where
// CSS laid it out and drawn through a shader: on load it's warped by a noise
// field (amber, with a slight color split) and resolves into crisp type; the
// cursor leaves a liquid wake that bends and warms the letters; scrolling away
// warps it back into noise. The DOM name stays as the layout source and
// accessible text.

// sRGB values passed straight to the shader so they match the CSS exactly.
const rgb = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
const BG = rgb(0x12100e);
const INK = rgb(0xefe7da);
const HEAT = rgb(0xe3a35b);
const TRAIL_W = 256;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT).
const noise = /* glsl */ `
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uText;
  uniform sampler2D uTrail;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uTime;
  uniform float uAmp;
  uniform vec3 uBg;
  uniform vec3 uInk;
  uniform vec3 uHeat;
  varying vec2 vUv;
  ${noise}
  void main() {
    vec2 uv = vUv;
    // Cursor wake: its strength warms the letters, its gradient pushes them aside.
    float tr = max(texture2D(uTrail, uv).r - 0.03, 0.0);
    float gx = texture2D(uTrail, uv + vec2(uTexel.x, 0.0)).r - texture2D(uTrail, uv - vec2(uTexel.x, 0.0)).r;
    float gy = texture2D(uTrail, uv + vec2(0.0, uTexel.y)).r - texture2D(uTrail, uv - vec2(0.0, uTexel.y)).r;

    vec2 q = vec2(uv.x * uAspect, uv.y) * 2.4;
    vec2 n = vec2(snoise(vec3(q, uTime * 0.16)), snoise(vec3(q + 7.31, uTime * 0.16)));
    vec2 disp = n * (uAmp * 0.045 + tr * 0.012) - vec2(gx, gy) * 0.08;

    // Two-tone split: an amber ghost on either side of the cream letterform.
    float k = uAmp * 0.007 + tr * 0.005;
    float core = texture2D(uText, uv + disp).a;
    float ghost = max(texture2D(uText, uv + disp + vec2(k, 0.0)).a, texture2D(uText, uv + disp - vec2(k, 0.0)).a);

    float heat = clamp(uAmp * 1.5 + tr * 1.8, 0.0, 1.0);
    vec3 ink = mix(uInk, uHeat, heat);
    vec3 col = mix(uBg, uHeat, ghost * 0.55);
    col = mix(col, ink, core);
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Rasterize the DOM name exactly where CSS laid it out.
async function rasterizeName(cover) {
  await Promise.all([
    document.fonts.load('300 100px "Cormorant Garamond"'),
    document.fonts.load('italic 300 100px "Cormorant Garamond"'),
  ]);
  const box = cover.getBoundingClientRect();
  const W = Math.round(box.width);
  const H = Math.round(box.height);
  if (!W || !H) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#fff";
  cover.querySelectorAll(".mast-line").forEach((line) => {
    const text = line.querySelector("[data-text]");
    const probe = line.querySelector(".baseline-probe");
    if (!text || !probe) return;
    const cs = getComputedStyle(text);
    const range = document.createRange();
    range.selectNodeContents(text);
    const r = range.getBoundingClientRect();
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = cs.letterSpacing;
    ctx.fillText(text.textContent, r.left - box.left, probe.getBoundingClientRect().top - box.top);
  });
  return { W, H, canvas };
}

function Name({ art, reduced, pointer, scroll, onReady }) {
  const { W, H } = art;
  const material = useRef(null);
  const trail = useRef(null);
  const cursor = useRef({ x: 0, y: 0, tracking: false });
  const start = useRef(null);
  const readied = useRef(false);
  const clock = useThree((s) => s.clock);
  const TH = Math.max(1, Math.round((TRAIL_W * H) / W));

  const shader = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uText: { value: null },
          uTrail: { value: null },
          uTexel: { value: new THREE.Vector2(1 / TRAIL_W, 1 / TH) },
          uAspect: { value: W / H },
          uTime: { value: 0 },
          uAmp: { value: reduced ? 0 : 1 },
          uBg: { value: BG },
          uInk: { value: INK },
          uHeat: { value: HEAT },
        },
      }),
    [W, H, TH, reduced],
  );
  useEffect(() => () => shader.dispose(), [shader]);

  // Textures: the rasterized name, and a small canvas the cursor paints its wake into.
  useEffect(() => {
    const text = new THREE.CanvasTexture(art.canvas);
    text.minFilter = THREE.LinearFilter;
    text.generateMipmaps = false;
    const tc = document.createElement("canvas");
    tc.width = TRAIL_W;
    tc.height = TH;
    const ctx = tc.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, TRAIL_W, TH);
    const wake = new THREE.CanvasTexture(tc);
    trail.current = { ctx, texture: wake };
    if (material.current) {
      material.current.uniforms.uText.value = text;
      material.current.uniforms.uTrail.value = wake;
    }
    start.current = clock.elapsedTime;
    return () => {
      text.dispose();
      wake.dispose();
    };
  }, [art, TH, clock]);

  useFrame((state) => {
    const m = material.current;
    const T = trail.current;
    if (!m || !T || start.current === null) return;
    if (!readied.current) {
      readied.current = true;
      onReady();
    }
    const t = state.clock.elapsedTime - start.current;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    if (reduced) {
      m.uniforms.uAmp.value = 0;
      return;
    }
    const settle = Math.min(1, Math.max(0, (t - 0.25) / 2.6));
    const intro = (1 - settle) ** 3;
    m.uniforms.uAmp.value = Math.max(intro, scroll.current * 0.85);

    // Fade the wake, then paint the cursor into it scaled by its speed.
    const { ctx, texture } = T;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0, 0, TRAIL_W, TH);
    const p = pointer.current;
    const c = cursor.current;
    if (p.active) {
      const x = (p.x / W) * TRAIL_W;
      const y = (p.y / H) * TH;
      if (c.tracking) {
        const speed = Math.hypot(x - c.x, y - c.y);
        const steps = Math.max(1, Math.ceil(speed / 4));
        for (let i = 1; i <= steps; i++) {
          const px = c.x + ((x - c.x) * i) / steps;
          const py = c.y + ((y - c.y) * i) / steps;
          const g = ctx.createRadialGradient(px, py, 0, px, py, 22);
          const a = Math.min(0.5, 0.06 + speed * 0.02);
          g.addColorStop(0, `rgba(255,255,255,${a})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(px - 22, py - 22, 44, 44);
        }
      }
      c.x = x;
      c.y = y;
      c.tracking = true;
    } else {
      c.tracking = false;
    }
    texture.needsUpdate = true;
  });

  return (
    <mesh>
      <planeGeometry args={[W, H]} />
      <primitive object={shader} ref={material} attach="material" />
    </mesh>
  );
}

export default function NameField({ coverRef, onReady }) {
  const wrap = useRef(null);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const scroll = useRef(0);
  const [art, setArt] = useState(null);
  const [visible, setVisible] = useState(true);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Rasterize once fonts are in, and again if the width changes.
  useEffect(() => {
    let cancelled = false;
    let lastW = 0;
    let timer = 0;
    const run = async () => {
      if (!coverRef.current) return;
      const next = await rasterizeName(coverRef.current);
      if (!cancelled && next) {
        lastW = next.W;
        setArt(next);
      }
    };
    run();
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = coverRef.current?.getBoundingClientRect().width ?? 0;
        if (Math.abs(w - lastW) > 1) run();
      }, 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [coverRef]);

  useEffect(() => {
    const onMove = (e) => {
      const r = wrap.current?.getBoundingClientRect();
      if (!r) return;
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
    };
    const onLeave = () => {
      pointer.current = { ...pointer.current, active: false };
    };
    const onScroll = () => {
      const h = wrap.current?.offsetHeight || window.innerHeight;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / h));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="field-cover" aria-hidden="true">
      {art && (
        <Canvas
          key={art.W}
          orthographic
          flat
          camera={{ zoom: 1, position: [0, 0, 100] }}
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
        >
          <Name art={art} reduced={reduced} pointer={pointer} scroll={scroll} onReady={onReady} />
        </Canvas>
      )}
    </div>
  );
}
