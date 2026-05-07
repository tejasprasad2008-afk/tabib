import { useEffect, useRef } from 'react';

interface Mote {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speedX: number;
  speedY: number;
  phase: number;
  twinkleSpeed: number;
}

export default function AtmosphereCanvas() {
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

    const COUNT = 200;
    const motes: Mote[] = Array.from({ length: COUNT }, () => {
      const inUpper = Math.random() < 0.55;
      return {
        x: Math.random() * W,
        y: inUpper ? Math.random() * H * 0.6 : Math.random() * H,
        r: 0.4 + Math.random() * 1.4,
        opacity: 0.18 + Math.random() * 0.45,
        speedX: (Math.random() - 0.5) * 0.14,
        speedY: -(0.04 + Math.random() * 0.18),
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const now = performance.now() / 1000;

      for (const m of motes) {
        m.x += m.speedX;
        m.y += m.speedY;
        if (m.x < -5) m.x = W + 5;
        if (m.x > W + 5) m.x = -5;
        if (m.y < -5) m.y = H + 5;

        const twinkle = Math.sin(now * m.twinkleSpeed + m.phase);
        const a = m.opacity * (0.7 + 0.3 * twinkle);

        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2.4);
        grad.addColorStop(0, `rgba(255,215,100,${a})`);
        grad.addColorStop(1, `rgba(255,215,100,0)`);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 2.4, 0, Math.PI * 2);
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
