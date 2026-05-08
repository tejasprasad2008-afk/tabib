import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Shield, Stethoscope, Wifi } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FEATURES = [
  {
    num: '01',
    Icon: Globe,
    title: 'Arabic-First',
    desc: 'Full RTL layout, Noto Sans Arabic typography, and responses in the patient\'s language. Healthcare that doesn\'t ask you to translate yourself.',
    iconBg: 'linear-gradient(135deg, rgba(255,215,100,0.18), rgba(255,160,50,0.10))',
    iconColor: '#FFD764',
  },
  {
    num: '02',
    Icon: Shield,
    title: 'Completely Private',
    desc: 'All AI inference runs on a local clinic server. No data leaves the room. No cloud. No surveillance.',
    iconBg: 'linear-gradient(135deg, rgba(100,200,255,0.15), rgba(50,120,200,0.08))',
    iconColor: 'rgba(100,200,255,0.85)',
  },
  {
    num: '03',
    Icon: Stethoscope,
    title: 'AI Triage by Gemma 4',
    desc: 'Color-coded urgency responses — emergency, see a doctor, or home care — with a direct line to notify clinic staff.',
    iconBg: 'linear-gradient(135deg, rgba(200,255,150,0.12), rgba(100,200,80,0.07))',
    iconColor: 'rgba(180,255,120,0.85)',
  },
  {
    num: '04',
    Icon: Wifi,
    title: 'Offline Capable',
    desc: 'Works without internet after initial setup. Designed for communities where connectivity is unreliable.',
    iconBg: 'linear-gradient(135deg, rgba(255,180,100,0.15), rgba(220,120,60,0.08))',
    iconColor: 'rgba(255,190,100,0.85)',
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      style={{
        background: '#000',
        padding: '7rem 1.5rem 9rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <img
        src="/features-bg.jpg"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Top/bottom gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, black 0%, transparent 18%, transparent 82%, black 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Dark wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.30)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle gold shimmer line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(255,215,100,0.15), transparent)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '56rem',
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
          <span className="section-badge">Capabilities</span>
        </motion.div>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.92,
            color: '#fff',
            marginBottom: '4rem',
          }}
        >
          Built with care
          <br />
          and intelligence in balance.
        </motion.h2>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            maxWidth: '48rem',
            margin: '0 auto',
            textAlign: 'left',
          }}
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.num}
              custom={2 + i}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              whileHover={{ y: -6 }}
              style={{
                borderRadius: '1.5rem',
                padding: '1.75rem',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,215,100,0.12)',
                boxShadow: '0 1px 0 rgba(255,215,100,0.08) inset, 0 20px 60px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(255,215,100,0.12) inset, 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,100,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(255,215,100,0.08) inset, 0 20px 60px rgba(0,0,0,0.5)';
              }}
            >
              {/* Top shimmer line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(255,215,100,0.20), transparent)',
                }}
              />

              {/* Number */}
              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.20)',
                  letterSpacing: '0.05em',
                }}
              >
                {feat.num}
              </div>

              {/* Icon box */}
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  background: feat.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <feat.Icon size={18} color={feat.iconColor} strokeWidth={1.6} />
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  color: '#fff',
                  marginBottom: '0.6rem',
                }}
              >
                {feat.title}
              </div>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.65,
                }}
              >
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
