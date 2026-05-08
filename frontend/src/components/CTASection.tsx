import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      style={{
        background: '#000',
        padding: '7rem 1.5rem 10rem',
        position: 'relative',
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60rem',
          height: '30rem',
          background: 'radial-gradient(ellipse, rgba(255,215,100,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 1,
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
          <span className="section-badge">Get Started · ابدأ الآن</span>
        </motion.div>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(2.75rem, 7vw, 4.75rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.92,
            color: '#fff',
            marginBottom: '1.75rem',
          }}
        >
          Your community
          <br />
          deserves better care.
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
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7,
            maxWidth: '36rem',
            margin: '0 auto 3rem',
          }}
        >
          Install Tabib at your clinic in minutes. Free, open-source, and built for the people who need it most.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="liquid-glass-strong"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 2rem',
              borderRadius: '9999px',
              color: '#fff',
              fontFamily: "'Barlow', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(255,215,100,0.22)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            Install for Your Clinic
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </button>

          <button
            className="liquid-glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.875rem 1.75rem',
              borderRadius: '9999px',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: "'Barlow', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'transform 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
            }}
          >
            View on GitHub
            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
