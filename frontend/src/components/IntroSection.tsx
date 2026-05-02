import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ParticleCanvas from './ParticleCanvas';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const COUNTRIES = ['Saudi Arabia', 'UAE', 'Egypt', 'Jordan', 'Iraq', 'Morocco', 'Yemen'];

export default function IntroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      style={{
        background: '#000',
        padding: '10rem 1.5rem 14rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <img
        src="/intro-bg.jpg"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      {/* Top/bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, black 0%, transparent 18%, transparent 82%, black 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Dark wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.28)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <ParticleCanvas />
      </div>

      {/* Content */}
      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '48rem',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ marginBottom: '1.5rem' }}
        >
          <span className="section-badge">مبني للمجتمع · Built for the Community</span>
        </motion.div>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.92,
            color: '#fff',
            marginBottom: '1.75rem',
          }}
        >
          Care that speaks
          <br />
          your language.
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.7,
            marginBottom: '3rem',
          }}
        >
          Tabib brings AI-powered health guidance to Arabic speakers in underserved MENA communities — offline, private, and in your language.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: '0.875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)',
          }}
        >
          {COUNTRIES.join(' · ')}
        </motion.div>
      </div>
    </section>
  );
}
