import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  speedY: number;
  phase: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0;
    let raf: number;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 60;
    const spawnParticle = (): Particle => ({
      x: Math.random() * (W || 800),
      y: (H || 600) * (0.55 + Math.random() * 0.13),
      r: 0.1 + Math.random() * 0.7,
      baseOpacity: 0.08 + Math.random() * 0.45,
      speedY: -(0.05 + Math.random() * 0.22),
      phase: Math.random() * Math.PI * 2,
    });

    const particles: Particle[] = Array.from({ length: COUNT }, spawnParticle);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const now = performance.now() / 1000;

      for (const p of particles) {
        p.y += p.speedY;

        // Reset when risen past 44% height
        if (p.y < H * 0.44) {
          p.x = Math.random() * W;
          p.y = H * (0.55 + Math.random() * 0.13);
        }

        // Fade between 50-60% height
        const heightFactor = p.y < H * 0.5
          ? Math.max(0, (p.y - H * 0.44) / (H * 0.06))
          : 1;

        const pulse = Math.sin(now * 2 + p.phase);
        const a = p.baseOpacity * heightFactor * (0.7 + 0.3 * pulse);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        grad.addColorStop(0, `rgba(255,220,150,${a})`);
        grad.addColorStop(1, 'rgba(255,220,150,0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}
