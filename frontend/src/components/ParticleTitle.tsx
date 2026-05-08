import { useEffect, useRef } from "react";

const REPEL_RADIUS = 110;
const SPRING = 0.055;
const FRICTION = 0.80;
const FONT_SIZE = 72;
const FONT = `italic ${FONT_SIZE}px 'Instrument Serif'`;
const STRIDE = 3;

interface Particle {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
}

export default function ParticleTitle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lines = ["Turn Your Computer", "Into a Medical Server"];

    const sample = () => {
      const offscreen = document.createElement("canvas");
      ctx.font = FONT;
      const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const lineH = FONT_SIZE * 1.3;
      const totalH = lines.length * lineH + 20;

      offscreen.width = Math.ceil(maxW) + 40;
      offscreen.height = Math.ceil(totalH) + 40;

      const oc = offscreen.getContext("2d")!;
      oc.font = FONT;
      oc.fillStyle = "#fff";
      oc.textBaseline = "top";

      lines.forEach((line, i) => {
        oc.fillText(line, 20, 20 + i * lineH);
      });

      canvas.width = offscreen.width;
      canvas.height = offscreen.height;

      const { data } = oc.getImageData(0, 0, offscreen.width, offscreen.height);
      const pts: Particle[] = [];

      for (let y = 0; y < offscreen.height; y += STRIDE) {
        for (let x = 0; x < offscreen.width; x += STRIDE) {
          const idx = (y * offscreen.width + x) * 4;
          if (data[idx + 3] > 128) {
            pts.push({
              ox: x, oy: y,
              x: x + (Math.random() - 0.5) * 60,
              y: y + (Math.random() - 0.5) * 60,
              vx: 0, vy: 0,
              alpha: data[idx + 3] / 255,
              phase: Math.random() * Math.PI * 2,
            });
          }
        }
      }
      particlesRef.current = pts;
    };

    sample();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const t0 = performance.now();
    const render = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && mouseRef.current.active) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          p.vx -= (dx / dist) * force * 3.5;
          p.vy -= (dy / dist) * force * 3.5;
        }

        const breathX = Math.sin(t * 0.8 + p.phase) * 0.3;
        const breathY = Math.cos(t * 0.6 + p.phase) * 0.3;

        p.vx += (p.ox + breathX - p.x) * SPRING;
        p.vy += (p.oy + breathY - p.y) * SPRING;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const glow = Math.min(speed * 0.4, 1.0);

        if (glow > 0.05) {
          ctx.shadowBlur = glow * 8;
          ctx.shadowColor = `rgba(255,215,100,${glow * 0.6})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }

      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}
    />
  );
}
